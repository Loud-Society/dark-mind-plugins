// Dark Mind brand pack – ffmpeg helpers of the motion and audio blocks (Phase 6 WP3; Node only).
// - renderCues: the sound of a block (assets placed at their cue times, relative gains) as PCM of an exact length.
// - extractFrames: the frames of a clip (source or extension output) for the chevron wipe as PNGs, with the frame choice
//   of the render core (rules T2/T3: executed in-point on the output grid, output frame k shows the last source frame
//   with pts ≤ in_exec + k/fps), so the wipe continues seamlessly into the clips the core renders around it.
// Deterministic: bitexact flags, no metadata, fixed filters. Media and parameters are data.

import { spawn } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';

function run(program, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(program, args, { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
    let out = '';
    let err = '';
    child.stdout.setEncoding('utf8').on('data', (c) => (out += c));
    child.stderr.setEncoding('utf8').on('data', (c) => (err += c));
    child.on('error', (error) => reject(new Error(`${path.basename(program)} could not be started (${error.message}); install ffmpeg or set DARKMIND_FFMPEG/DARKMIND_FFPROBE`)));
    child.on('close', (code) => (code === 0 ? resolve(out) : reject(new Error(`${path.basename(program)} exited with ${code}: ${err.trim().split(/\r?\n/).slice(-3).join(' | ')}`))));
  });
}

// --- exact rationals (BigInt) -------------------------------------------------------------------------------------

const gcd = (a, b) => {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  while (b) [a, b] = [b, a % b];
  return a;
};
export function q(n, d = 1n) {
  if (d < 0n) [n, d] = [-n, -d];
  const g = gcd(n, d) || 1n;
  return { n: n / g, d: d / g };
}
/** "12.48", "1/3", "25/1", "25" → rational. */
export function parseQ(text) {
  const s = String(text);
  if (s.includes('/')) {
    const [n, d] = s.split('/');
    return q(BigInt(n), BigInt(d));
  }
  const [int, frac = ''] = s.split('.');
  return q(BigInt(int + frac), 10n ** BigInt(frac.length));
}
const add = (a, b) => q(a.n * b.d + b.n * a.d, a.d * b.d);
const sub = (a, b) => q(a.n * b.d - b.n * a.d, a.d * b.d);
const mul = (a, b) => q(a.n * b.n, a.d * b.d);
const div = (a, b) => q(a.n * b.d, a.d * b.n);
const floorQ = (a) => (a.n >= 0n ? a.n / a.d : -((-a.n + a.d - 1n) / a.d));
const roundHalfUp = (a) => floorQ(add(a, q(1n, 2n)));
const lcm = (a, b) => (a / gcd(a, b)) * b;

/** Rule T2: executed in-point on the output frame grid. */
export function executedIn(inSeconds, fps) {
  return div(q(roundHalfUp(mul(inSeconds, fps))), fps);
}

// --- sound --------------------------------------------------------------------------------------------------------

export async function probeDuration(ffprobe, file) {
  const out = await run(ffprobe, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', file]);
  const value = Number(out.trim());
  if (!(value > 0)) throw new Error(`${file} has no duration`);
  return value;
}

/**
 * Writes the cues as stereo PCM of exactly `samples` samples. cues: [{ file, at, gainDb, seconds, fadeOut }] (brand
 * audio assets are mono WAV, 48 kHz). codec: "pcm_s16le" (audio-only blocks) or "pcm_s24le".
 */
export async function renderCues({ ffmpeg = 'ffmpeg', cues, samples, sampleRate = 48000, output, codec = 'pcm_s16le' }) {
  const inputs = [];
  const graph = [];
  cues.forEach((cue, i) => {
    inputs.push('-i', cue.file);
    const trim = cue.seconds ? `atrim=end=${cue.seconds.toFixed(6)},` : '';
    const fade = cue.fadeOut > 0 && cue.seconds ? `afade=t=out:st=${Math.max(0, cue.seconds - cue.fadeOut).toFixed(6)}:d=${cue.fadeOut.toFixed(6)},` : '';
    const delay = Math.round(cue.at * sampleRate);
    graph.push(`[${i}:a]aresample=${sampleRate},aformat=sample_fmts=fltp:channel_layouts=mono,${trim}${fade}volume=${cue.gainDb}dB,pan=stereo|c0=c0|c1=c0,adelay=delays=${delay}S:all=1[c${i}]`);
  });
  if (cues.length) graph.push(`${cues.map((_, i) => `[c${i}]`).join('')}amix=inputs=${cues.length}:normalize=0:duration=longest,apad=whole_len=${samples},atrim=end_sample=${samples}[aout]`);
  else graph.push(`anullsrc=r=${sampleRate}:cl=stereo,atrim=end_sample=${samples}[aout]`);
  await fs.mkdir(path.dirname(output), { recursive: true });
  await run(ffmpeg, [
    '-hide_banner', '-nostdin', '-loglevel', 'error', '-y', ...inputs,
    '-filter_complex', graph.join(';'), '-map', '[aout]',
    '-c:a', codec, '-ar', String(sampleRate), '-ac', '2', '-fflags', '+bitexact', '-flags:a', '+bitexact', '-map_metadata', '-1', output,
  ]);
  return output;
}

// --- frames -------------------------------------------------------------------------------------------------------

async function videoTimeBase(ffprobe, file) {
  const out = await run(ffprobe, ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=time_base', '-of', 'default=nw=1:nk=1', file]);
  // ffprobe ≥ 9 may print the time base once more for a stream group (e.g. camera .mov with a timecode track)
  const text = out.split(/\r?\n/).map((line) => line.trim()).find(Boolean) ?? '';
  if (!/^\d+\/\d+$/.test(text)) throw new Error(`${file} has no video stream`);
  return parseQ(text);
}

/**
 * Extracts `frames` frames of a clip at the output rate into `dir` (00000.png …), RGBA, scaled to width × height:
 * with `crop` (fractions of the oriented source, like timeline crops) the rectangle is cut and scaled, otherwise the
 * picture fills the frame (cover, centred). `offset` = source seconds at time 0 of the file (proxy excerpts, rule E1).
 * Returns the file names.
 */
export async function extractFrames({ ffmpeg = 'ffmpeg', ffprobe = 'ffprobe', file, offset = '0', in: inSeconds, fps, frames, width, height, crop, dir }) {
  const fpsQ = parseQ(fps);
  const inLocal = sub(executedIn(parseQ(inSeconds), fpsQ), parseQ(offset));
  if (inLocal.n < 0n) throw new Error(`in-point ${inSeconds} s lies before the start of ${path.basename(file)}`);
  const seek = (() => {
    const s = floorQ(inLocal) - 1n;
    return s > 0n ? s : 0n;
  })();
  const delta = sub(inLocal, q(seek));
  const tb = await videoTimeBase(ffprobe, file);
  const L = lcm(tb.d, delta.d);
  const shift = mul(delta, q(L)).n;
  const fpsText = fpsQ.d === 1n ? `${fpsQ.n}` : `${fpsQ.n}/${fpsQ.d}`;
  // crop on full-resolution planar RGB: cropping subsampled high-bit-depth video (10-bit 4:2:2 camera originals) at
  // an arbitrary position garbles the chroma in ffmpeg 9 – the render core likewise crops only after conversion to 4:4:4
  const geometry = crop
    ? `format=gbrap16le,crop=w=iw*${crop.w}:h=ih*${crop.h}:x=iw*${crop.x}:y=ih*${crop.y}:exact=1,scale=${width}:${height}:flags=bicubic`
    : `scale=${width}:${height}:force_original_aspect_ratio=increase:flags=bicubic,crop=${width}:${height}`;
  await fs.mkdir(dir, { recursive: true });
  await run(ffmpeg, [
    '-hide_banner', '-nostdin', '-loglevel', 'error', '-y', '-ss', String(seek), '-i', file,
    '-vf', `settb=1/${L},setpts=PTS-${shift},fps=${fpsText}:round=up,trim=start_pts=0:end_pts=${frames},setpts=PTS-STARTPTS,${geometry},setsar=1,format=rgba`,
    '-an', '-fps_mode', 'passthrough', '-frames:v', String(frames), '-start_number', '0', path.join(dir, '%05d.png'),
  ]);
  const names = (await fs.readdir(dir)).filter((n) => n.endsWith('.png')).sort();
  if (names.length !== frames) throw new Error(`${path.basename(file)} gives ${names.length} of ${frames} frames from ${inSeconds} s (the clip ends too early)`);
  return names;
}
