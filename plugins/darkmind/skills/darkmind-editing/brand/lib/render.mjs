// Dark Mind brand pack – render entry point of the brand blocks (Phase 6 WP2–WP4), used as the extension command:
//   node extensions/brand-pack/lib/render.mjs extensions/brand-pack/blocks/<block>/scene.html   (picture blocks, thumbnail)
//   node extensions/brand-pack/lib/render.mjs extensions/brand-pack/blocks/<block>/block.json   (audio-only blocks)
// Under `darkmind-agent extensions run`/`render` the runner passes everything in DARKMIND_EXTENSION_INPUTS (output
// contract, parameters, declared files, source/extension inputs). Outside the runner (tests, manual checks):
//   node render.mjs <scene.html|block.json> --extension extensions/<id>/extension.json [--project <dir>] [--output <file>]
// Options: --workers <n> (default: DARKMIND_BRAND_WORKERS or 4; the output does not depend on it), --no-dedupe.
// The command writes only the output file (temporary frames/sound go to DARKMIND_EXTENSION_TMP). Parameters are data –
// they are checked and drawn, never evaluated.

import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { AUDIO_BLOCKS, BLOCKS, STILL_BLOCKS, assetPath, audioCues, blockAssets, blockClipRefs, blockDurationLimits, blockOutput, blockProfiles, checkParameters, rangeFrames } from './blocks.mjs';
import { launchBrowser, renderScene, sha256File } from './compositor.mjs';
import { parseFps, profileOf } from './layout.mjs';
import { extractFrames, probeDuration, renderCues } from './media.mjs';

function argValue(args, name) {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
}

const toPosix = (p) => p.replace(/\\/g, '/');

/** Inputs of the run: from the runner (DARKMIND_EXTENSION_INPUTS) or from an extension.json (standalone). */
async function loadRun(args, env) {
  if (env.DARKMIND_EXTENSION_INPUTS) {
    const inputs = JSON.parse(await fs.readFile(env.DARKMIND_EXTENSION_INPUTS, 'utf8'));
    return { root: inputs.projectRoot, output: inputs.output, parameters: inputs.parameters ?? {}, files: inputs.files ?? {}, sources: inputs.sources ?? {}, extensions: inputs.extensions ?? {} };
  }
  const extensionFile = argValue(args, '--extension');
  if (!extensionFile) throw new Error('usage: node render.mjs <scene.html|block.json> --extension <extension.json> [--project <dir>] [--output <file>]');
  const root = path.resolve(argValue(args, '--project') ?? process.cwd());
  const extension = JSON.parse(await fs.readFile(path.resolve(root, extensionFile), 'utf8'));
  const files = {};
  const extensions = {};
  for (const input of extension.inputs ?? []) {
    if (input.kind === 'file') files[input.path] = path.join(root, ...input.path.split('/'));
    if (input.kind === 'extension') {
      const other = JSON.parse(await fs.readFile(path.join(root, 'extensions', input.extensionId, 'extension.json'), 'utf8'));
      extensions[input.extensionId] = { path: other.output.path, file: path.join(root, ...other.output.path.split('/')) };
    }
  }
  const output = { ...extension.output, file: path.resolve(argValue(args, '--output') ?? path.join(root, ...extension.output.path.split('/'))) };
  return { root, output, parameters: extension.parameters ?? {}, files, sources: {}, extensions };
}

/** Preflight of the block against the output contract and its parameters (brand-layer limits, T6). */
export function preflight(brand, block, output, parameters) {
  const problems = [];
  if (!brand.blocks[block] || !BLOCKS.includes(block)) return [`unknown block "${block}"`];
  if (STILL_BLOCKS.includes(block)) {
    // a still image (thumbnail): its own size, one PNG frame, independent of the project's profile and rate
    const still = brand.blocks[block].still;
    if (output.width !== still.width || output.height !== still.height) problems.push(`${block} is a ${still.width} × ${still.height} image, not ${output.width} × ${output.height}`);
    if (output.image !== true) problems.push(`${block} renders a still image: output.image must be true`);
    if (output.durationFrames !== 1) problems.push(`${block} is one still image: durationFrames must be 1`);
    if (output.alpha || output.audio || output.video === false) problems.push(`${block} has no alpha and no sound (output.alpha and output.audio false)`);
    if (path.extname(output.path ?? output.file ?? '').toLowerCase() !== '.png') problems.push(`${block} writes a PNG: output.path must end with .png`);
    problems.push(...checkParameters(brand, block, parameters, brand.blocks[block].profile));
    return problems;
  }
  if (output.image) problems.push(`${block} renders a clip, not a still image: output.image must not be set`);
  const profile = profileOf(brand, output.width, output.height);
  if (!profile) problems.push(`output ${output.width} × ${output.height} is no brand profile (${Object.values(brand.profiles).map((p) => `${p.width} × ${p.height}`).join(', ')})`);
  else {
    const expected = brand.profiles[profile];
    if (parseFps(output.fps) !== parseFps(expected.fps)) problems.push(`the ${profile} profile renders at ${expected.fps} fps, not ${output.fps}`);
    const allowed = blockProfiles(brand, block);
    if (!allowed.includes(profile)) problems.push(`block ${block} is made for the ${allowed.join('/')} profile, not ${profile}`);
    problems.push(...checkParameters(brand, block, parameters, profile));
  }
  const limits = blockDurationLimits(brand, block, parseFps(output.fps));
  if (limits && (output.durationFrames < limits.min || output.durationFrames > limits.max)) {
    problems.push(`durationFrames ${output.durationFrames} is outside the brand limits of ${block} (${limits.min}–${limits.max} frames)`);
  }
  // vertical footage is exactly as long as its clip (rule T1), so the block covers the statement frame by frame
  const clip = parameters.clip;
  if (block === 'vertical_in_16x9' && clip && typeof clip.in === 'string' && typeof clip.out === 'string' && !problems.some((p) => p.includes('parameters.clip'))) {
    const expected = rangeFrames(clip.in, clip.out, output.fps);
    if (output.durationFrames !== expected) problems.push(`durationFrames ${output.durationFrames} differs from the clip (${clip.in}–${clip.out} s = ${expected} frames)`);
  }
  const kind = blockOutput(brand, block, parameters);
  const video = output.video !== false;
  if (video !== kind.video) problems.push(kind.video ? `${block} renders a picture (output.video must not be false)` : `${block} renders sound only: output.video must be false`);
  if (output.alpha !== kind.alpha) problems.push(`output.alpha must be ${kind.alpha} for ${block}${['title_card', 'chevron_wipe'].includes(block) ? ' with these parameters' : ''}`);
  if (Boolean(output.audio) !== kind.audio) problems.push(kind.audio ? `${block} has sound (output.audio must be true)` : `${block} has no audio (output.audio must be false)`);
  const ext = path.extname(output.path ?? output.file ?? '').toLowerCase();
  if (!kind.video && ext !== '.wav') problems.push('audio-only output is PCM: output.path must end with .wav');
  else if (kind.video && kind.alpha && ext !== '.mov') problems.push('alpha output is QuickTime Animation: output.path must end with .mov');
  else if (kind.video && !kind.alpha && ext !== '.mp4') problems.push('opaque output is H.264: output.path must end with .mp4');
  return problems;
}

/** Vendored audio assets of the cues: id → absolute file (declared inputs only). */
function audioFiles(cues, declared, vendor) {
  const map = new Map();
  for (const cue of cues) {
    const rel = `${vendor}/${assetPath('audio', cue.id, '.wav')}`.toLowerCase();
    const file = declared.get(rel);
    if (!file) throw new Error(`${vendor}/${assetPath('audio', cue.id, '.wav')} is not a declared input (vendor the block again with add-block)`);
    map.set(cue.id, file);
  }
  return map;
}

async function tmpDir(env, name) {
  const base = env.DARKMIND_EXTENSION_TMP || os.tmpdir();
  return fs.mkdtemp(path.join(base, `brand-${name}-`));
}

/** Foreground size of vertical footage: the aspect ("9/16") at the frame height, even width. */
export function verticalSize(aspect, height) {
  const [n, d] = String(aspect).split('/').map(Number);
  return { width: 2 * Math.round((height * n) / d / 2), height };
}

/** Renders one block; returns { output, frames, sha256, bytes, … }. */
export async function renderBlock({ scene, root, output, parameters, files, sources = {}, extensions = {}, env = process.env, workers, dedupe = true, browser }) {
  const scenePath = toPosix(scene).replace(/^\.\//, '');
  const match = /(^|\/)blocks\/([^/]+)\/(scene\.html|block\.json)$/.exec(scenePath);
  if (!match || !BLOCKS.includes(match[2])) throw new Error(`${scene} is not the scene or block.json of a brand block (blocks/<block>/scene.html)`);
  const block = match[2];
  const audioOnly = AUDIO_BLOCKS.includes(block);
  if (audioOnly !== (match[3] === 'block.json')) throw new Error(`${block} is rendered from blocks/${block}/${audioOnly ? 'block.json' : 'scene.html'}`);
  const declared = new Map(Object.entries(files).map(([rel, abs]) => [toPosix(rel).toLowerCase(), abs]));
  if (!declared.has(scenePath.toLowerCase())) throw new Error(`${scenePath} is not a declared input`);
  const vendor = path.posix.join(path.posix.dirname(scenePath), '..', '..');
  const brandPath = path.posix.join(vendor, 'brand.json');
  const brandFile = declared.get(brandPath.toLowerCase());
  if (!brandFile) throw new Error(`${brandPath} is not a declared input`);
  const brand = JSON.parse(await fs.readFile(brandFile, 'utf8'));
  const problems = preflight(brand, block, output, parameters);
  if (problems.length) throw new Error(`${block}: ${problems.join('; ')}`);
  const ffmpeg = env.DARKMIND_FFMPEG || 'ffmpeg';
  const ffprobe = env.DARKMIND_FFPROBE || 'ffprobe';
  const fps = parseFps(output.fps);
  const samples = Math.round((output.durationFrames / fps) * 48000);
  const started = Date.now();
  const temps = [];
  try {
    // --- sound (audio-only blocks, sting, logo end) -------------------------------------------------------------
    let audio = null;
    if (blockOutput(brand, block, parameters).audio) {
      const ids = blockAssets(brand, block, parameters).audio.map((a) => a.id);
      const located = audioFiles(ids.map((id) => ({ id })), declared, vendor);
      const durations = {};
      for (const [id, file] of located) durations[id] = await probeDuration(ffprobe, file);
      const cues = audioCues(brand, block, parameters, durations).map((c) => ({ ...c, file: located.get(c.id) }));
      if (audioOnly) {
        await renderCues({ ffmpeg, cues, samples, output: output.file, codec: 'pcm_s16le' });
        return { frames: output.durationFrames, workers: 0, captures: 0, ms: Date.now() - started, info: { block, brandPack: brand.version, cues: cues.map(({ file, ...c }) => c) }, output: output.file, ...(await sha256File(output.file)) };
      }
      const dir = await tmpDir(env, 'audio');
      temps.push(dir);
      audio = await renderCues({ ffmpeg, cues, samples, output: path.join(dir, 'sound.wav'), codec: 'pcm_s24le' });
    }
    // footage of the block (wipe A/B, thumbnail frame or candidates, card stills, vertical clip): frames extracted with
    // the render core's frame choice, served as derived files on the virtual origin (R3)
    const served = { ...files };
    const params = { ...parameters };
    const refs = blockClipRefs(block, parameters);
    if (refs.length) {
      const dir = await tmpDir(env, 'frames');
      temps.push(dir);
      // vertical footage is extracted at its foreground size (9:16 at the frame height), everything else at frame size
      const size = block === 'vertical_in_16x9' ? verticalSize(brand.blocks[block].aspect, output.height) : { width: output.width, height: output.height };
      for (const { key, param, ref, frames } of refs) {
        const input = ref.sourceId ? sources[ref.sourceId] : extensions[ref.extensionId];
        if (!input?.file) throw new Error(`parameters.${param}: ${ref.sourceId ? `source "${ref.sourceId}"` : `extension "${ref.extensionId}"`} is not an input of this extension`);
        const names = await extractFrames({ ffmpeg, ffprobe, file: input.file, offset: input.offset ?? '0', in: ref.in, fps: output.fps, frames: frames === 'one' ? 1 : output.durationFrames, width: size.width, height: size.height, crop: ref.crop, dir: path.join(dir, key) });
        for (const name of names) served[`_frames/${key}/${name}`] = path.join(dir, key, name);
      }
      if (block === 'chevron_wipe') params.frames = { a: '_frames/a/', b: '_frames/b/' };
      else if (block === 'vertical_in_16x9') params.frames = { clip: '_frames/clip/' };
      else params.images = refs.map((r) => `_frames/${r.key}/00000.png`);
    }
    const own = !browser;
    const b = browser ?? (await launchBrowser(env));
    try {
      const still = STILL_BLOCKS.includes(block);
      const result = await renderScene(b, {
        scene: scenePath,
        files: served,
        width: output.width,
        height: output.height,
        fps: output.fps,
        frames: output.durationFrames,
        params,
        alpha: output.alpha,
        codec: still ? 'png-gray' : output.alpha ? 'qtrle' : 'h264',
        output: output.file,
        audio,
        workers: workers ?? (Number(env.DARKMIND_BRAND_WORKERS) || Math.max(1, Math.min(4, Math.floor(os.cpus().length / 2)))),
        dedupe,
        ffmpeg,
      });
      const maxBytes = still ? brand.blocks[block].still.maxBytes : null;
      if (maxBytes && result.bytes > maxBytes) {
        await fs.rm(output.file, { force: true });
        throw new Error(`${block}: the image has ${result.bytes} bytes, more than ${maxBytes} (YouTube's limit for thumbnails); choose a calmer frame or more contrast`);
      }
      return result;
    } finally {
      if (own) await b.close();
    }
  } finally {
    await Promise.all(temps.map((dir) => fs.rm(dir, { recursive: true, force: true })));
  }
}

async function main(args) {
  const scene = args[0] && !args[0].startsWith('--') ? args[0] : undefined;
  if (!scene) throw new Error('usage: node render.mjs <scene.html|block.json> [--extension <extension.json>] [--project <dir>] [--output <file>] [--workers <n>] [--no-dedupe]');
  const run = await loadRun(args, process.env);
  const workers = argValue(args, '--workers') ? Number(argValue(args, '--workers')) : undefined;
  const result = await renderBlock({ scene, ...run, workers, dedupe: !args.includes('--no-dedupe') });
  process.stdout.write(`${JSON.stringify({ output: toPosix(path.relative(run.root, result.output)), frames: result.frames, sha256: result.sha256, bytes: result.bytes, workers: result.workers, captures: result.captures, ms: result.ms, info: result.info })}\n`);
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  main(process.argv.slice(2)).catch((error) => {
    process.stderr.write(`brand block render failed: ${error.message ?? error}\n`);
    process.exit(1);
  });
}
