// Brand pack – WP3 render tests with Microsoft Edge (Playwright) and ffmpeg: output contract of every motion and audio
// block (ffprobe: duration, fps per profile, alpha, audio), the sync point of the voice tag, the chevron wipe's frame
// choice (render core rules T2/T3) and shots A/B, the endcard's free end-screen zone, and determinism (T10).
// Skipped when Edge, playwright-core or ffmpeg are missing, unless DARKMIND_REQUIRE_BRAND_RENDER=1 (CI).
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { launchBrowser, openScene } from '../lib/compositor.mjs';
import { renderBlock } from '../lib/render.mjs';
import { addBlock } from '../tools/add-block.mjs';
import { fixtureProject, runInputs } from './fixtures.mjs';

const PACK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const brand = JSON.parse(await fs.readFile(path.join(PACK, 'brand.json'), 'utf8'));
const required = process.env.DARKMIND_REQUIRE_BRAND_RENDER === '1';
const ffmpeg = process.env.DARKMIND_FFMPEG || 'ffmpeg';
const ffprobe = process.env.DARKMIND_FFPROBE || 'ffprobe';

let browser = null;
let unavailable = null;
try {
  if (spawnSync(ffmpeg, ['-hide_banner', '-version']).status !== 0) throw new Error('ffmpeg not found');
  browser = await launchBrowser();
} catch (error) {
  unavailable = error.message;
  if (required) throw error;
}
const skip = unavailable ? `render tests skipped: ${unavailable}` : false;
after(() => browser?.close());

function probe(file) {
  const result = spawnSync(ffprobe, ['-v', 'error', '-count_frames', '-show_entries', 'stream=codec_type,codec_name,pix_fmt,width,height,r_frame_rate,nb_read_frames,sample_rate,channels,duration:format=duration', '-of', 'json', file], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const data = JSON.parse(result.stdout);
  return { video: data.streams.find((s) => s.codec_type === 'video') ?? null, audio: data.streams.find((s) => s.codec_type === 'audio') ?? null };
}

/** Mean volume (dB) of the decoded sound between two times. */
function meanVolume(file, from, to) {
  const result = spawnSync(ffmpeg, ['-hide_banner', '-nostats', '-i', file, '-vn', '-af', `atrim=${from}:${to},volumedetect`, '-f', 'null', '-'], { encoding: 'utf8' });
  const match = /mean_volume: (-?[\d.]+|-inf) dB/.exec(result.stderr);
  return match ? (match[1] === '-inf' ? -Infinity : Number(match[1])) : -Infinity;
}

/** RGB of one pixel of decoded frame k. */
function pixel(file, k, x, y) {
  const result = spawnSync(ffmpeg, ['-v', 'error', '-i', file, '-vf', `select=eq(n\\,${k}),format=rgb24,crop=1:1:${x}:${y}`, '-frames:v', '1', '-f', 'rawvideo', '-'], { maxBuffer: 1 << 20 });
  assert.equal(result.status, 0, String(result.stderr));
  return [...result.stdout.subarray(0, 3)];
}

const roots = [];
async function project(profile, blocks) {
  const created = await fixtureProject(profile, { blocks });
  roots.push(created.root);
  return created;
}

describe('motion and audio blocks rendered with Edge and ffmpeg (WP3)', { skip }, () => {
  let media;
  before(async () => {
    // 12 s, 25 fps, 320 × 180: the luma of frame n is 16 + 6·n (n < 37), so every output frame names its source frame
    const dir = await fs.mkdtemp(path.join(process.env.DARKMIND_BRAND_TEST_DIR || os.tmpdir(), 'brand-media-'));
    roots.push(dir);
    media = path.join(dir, 'ramp.mp4');
    const result = spawnSync(ffmpeg, ['-v', 'error', '-y', '-f', 'lavfi', '-i', 'nullsrc=s=320x180:r=25:d=1.48', '-vf', "geq=lum='16+6*N':cb=128:cr=128,format=yuv420p", '-c:v', 'libx264', '-qp', '0', '-g', '1', media]);
    assert.equal(result.status, 0, String(result.stderr));
  });
  after(async () => {
    await Promise.all(roots.map((root) => fs.rm(root, { recursive: true, force: true })));
  });

  it('renders every block to its contract: size, rate per profile, exact frames, alpha, sound length', async () => {
    const cases = [
      ['landscape', [['logo_sting', { id: 'sting', params: { suffix: 'colombia' } }], ['logo_end', { id: 'end' }], ['glitch_flash', { id: 'flash' }], ['endcard', { id: 'endcard' }], ['chevron_wipe', { id: 'wipe' }], ['loud_sounds', { id: 'loud' }]]],
      ['vertical', [['logo_sting', { id: 'sting', params: { suffix: 'brazil' } }], ['logo_end', { id: 'end' }], ['glitch_flash', { id: 'flash', frames: 3 }], ['animal_scream', { id: 'scream' }]]],
    ];
    for (const [profile, blocks] of cases) {
      const { root } = await project(profile, blocks);
      const p = brand.profiles[profile];
      for (const [, { id }] of blocks) {
        const run = await runInputs(root, id);
        await renderBlock({ ...run, browser });
        const { video, audio } = probe(run.output.file);
        const seconds = run.output.durationFrames / (Number(p.fps.split('/')[0]));
        const where = `${id} (${profile})`;
        if (run.output.video === false) assert.equal(video, null, where);
        else {
          assert.deepEqual(
            { codec: video.codec_name, pix: video.pix_fmt, w: video.width, h: video.height, rate: video.r_frame_rate, frames: Number(video.nb_read_frames) },
            { codec: run.output.alpha ? 'qtrle' : 'h264', pix: run.output.alpha ? 'argb' : 'yuv420p', w: p.width, h: p.height, rate: p.fps, frames: run.output.durationFrames },
            where
          );
        }
        if (!run.output.audio) assert.equal(audio, null, where);
        else {
          assert.equal(audio.codec_name, run.output.video === false ? 'pcm_s16le' : 'aac', where);
          assert.deepEqual([Number(audio.sample_rate), audio.channels], [48000, 2], where);
          assert.ok(Math.abs(Number(audio.duration) - seconds) <= 1 / 25 + 0.001, `${where}: sound ${audio.duration} s, picture ${seconds} s`);
          assert.ok(meanVolume(run.output.file, 0, seconds) > -40, `${where} is silent`);
        }
      }
    }
  });

  it('places the voice tag on its sync point and switches sounds off with null', async () => {
    const { root } = await project('vertical', [['logo_sting', { id: 'voice-only', params: { noiseHit: null } }], ['logo_end', { id: 'silent', params: { voiceTag: null } }]]);
    const run = await runInputs(root, 'voice-only');
    await renderBlock({ ...run, browser });
    const at = brand.blocks.logo_sting.audio.voiceAtSeconds;
    assert.ok(meanVolume(run.output.file, 0, at - 0.03) < -70, 'no sound before the voice tag');
    assert.ok(meanVolume(run.output.file, at + 0.05, at + 0.5) > -35, 'the voice tag starts at its sync point');
    const silent = await runInputs(root, 'silent');
    await renderBlock({ ...silent, browser });
    assert.ok(meanVolume(silent.output.file, 0, 1.5) < -80, 'no voice tag: silence');
  });

  it('wipes from shot A to shot B with the frame choice of the render core (T2/T3)', async () => {
    const { root } = await project('vertical', []);
    // A: in 0.4 s of a file starting at 0; B: in 1.2 s of a proxy excerpt that starts at 1 s (offset, rule E1)
    await addBlock(['chevron_wipe', '--project', root, '--id', 'wipe', '--params', JSON.stringify({ a: { sourceId: 'ramp', in: '0.4' }, b: { sourceId: 'ramp-proxy', in: '1.2' } })]);
    const run = await runInputs(root, 'wipe');
    const sources = { ramp: { file: media, offset: '0' }, 'ramp-proxy': { file: media, offset: '1' } };
    const result = await renderBlock({ ...run, sources, browser });
    assert.equal(result.frames, 15);
    const index = (rgb) => Math.round(rgb[1] / (6 * (255 / 219)));
    // A at the right edge while the chevron enters: output frame k shows source frame floor(25 · (0.4 + k/30))
    for (const k of [0, 1, 2, 3]) assert.equal(index(pixel(run.output.file, k, 1075, 960)), Math.floor(10 + (5 * k) / 6), `A at frame ${k}`);
    // B at the left edge at the end: local 0.2 s + k/30
    for (const k of [13, 14]) assert.equal(index(pixel(run.output.file, k, 4, 960)), Math.floor(25 * (0.2 + k / 30)), `B at frame ${k}`);
    // mid-wipe: the notch already shows B, the chevron arm right of the inner apex is (near) white
    assert.equal(index(pixel(run.output.file, 7, 300, 960)), Math.floor(25 * (0.2 + 7 / 30)));
    assert.ok(pixel(run.output.file, 7, 1000, 960).every((c) => c > 230));
    // a clip that ends before the wipe does is refused, not padded
    const short = { ...sources, ramp: { file: media, offset: '0' } };
    await assert.rejects(renderBlock({ ...run, parameters: { ...run.parameters, a: { sourceId: 'ramp', in: '1.3' } }, sources: short, browser }), /gives \d+ of 15 frames/);
  });

  it('keeps the endcard labels inside the safe area and out of the YouTube end-screen zone', async () => {
    const { root } = await project('landscape', [['endcard']]);
    const run = await runInputs(root, 'endcard');
    const [n, d = '1'] = run.output.fps.split('/');
    const { context, info } = await openScene(browser, { scene: run.extension.command.args[1], files: run.files, width: 1920, height: 1080, fpsNumber: Number(n) / Number(d), frames: run.output.durationFrames, params: run.parameters, alpha: false });
    await context.close();
    const zone = brand.blocks.endcard.endScreenZone;
    const safe = brand.profiles.landscape.textSafe;
    assert.equal(info.labels.length, 3);
    for (const label of info.labels) {
      assert.ok(label.x + label.w <= zone.left * 1920, `label ends at ${label.x + label.w} px, the end-screen zone starts at ${zone.left * 1920} px`);
      assert.ok(label.x >= safe.left * 1920 && label.y >= safe.top * 1080 && label.y + label.h <= safe.bottom * 1080, JSON.stringify(label));
    }
  });

  it('renders identical files: again in a fresh browser, with more workers and without dedupe (T10)', async () => {
    const { root } = await project('landscape', [['logo_sting', { id: 'sting', params: { suffix: 'brazil' } }], ['endcard'], ['loud_sounds', { id: 'loud' }]]);
    await addBlock(['chevron_wipe', '--project', root, '--id', 'wipe', '--params', JSON.stringify({ a: { sourceId: 'ramp', in: '0.2' }, b: { sourceId: 'ramp', in: '0.4' } })]);
    const sources = { ramp: { file: media, offset: '0' } };
    for (const id of ['sting', 'endcard', 'wipe', 'loud']) {
      const run = await runInputs(root, id);
      const first = await renderBlock({ ...run, sources, browser, workers: 1, dedupe: true });
      const fresh = await launchBrowser();
      try {
        const second = await renderBlock({ ...run, sources, browser: fresh, workers: 3, dedupe: false });
        assert.equal(second.sha256, first.sha256, `${id}: renders differ`);
      } finally {
        await fresh.close();
      }
    }
  });
});
