// Brand pack – WP5 render tests of the Never Ending Interview blocks with Microsoft Edge (Playwright) and ffmpeg:
// format_card, band_card (16:9 and 9:16), cliffhanger_card and vertical_in_16x9 against their output contract (ffprobe),
// the frame choice of the render core for card stills and vertical clips (luma-coded frames), text inside the safe area
// and determinism (T10). Skipped when Edge, playwright-core or ffmpeg are missing, unless DARKMIND_REQUIRE_BRAND_RENDER=1.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { launchBrowser, openScene } from '../lib/compositor.mjs';
import { renderBlock } from '../lib/render.mjs';
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
  const result = spawnSync(ffprobe, ['-v', 'error', '-count_frames', '-show_entries', 'stream=codec_type,codec_name,pix_fmt,width,height,r_frame_rate,nb_read_frames', '-of', 'json', file], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout).streams.map((s) => ({ type: s.codec_type, codec: s.codec_name, pix: s.pix_fmt, w: s.width, h: s.height, fps: s.r_frame_rate, frames: Number(s.nb_read_frames) }));
}

/** Luma (Y, limited range) at a pixel of every frame of a video. */
function lumaAt(file, x, y) {
  const result = spawnSync(ffmpeg, ['-v', 'error', '-i', file, '-vf', `crop=2:2:${x}:${y},extractplanes=y`, '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], { maxBuffer: 1 << 24 });
  assert.equal(result.status, 0, String(result.stderr));
  const values = [];
  for (let i = 0; i < result.stdout.length; i += 4) values.push(result.stdout[i]);
  return values;
}

/** Source frame index of a ramp luma (16 + 6·n). */
const frameIndex = (y) => Math.round((y - 16) / 6);

function insideSafe(box, profile) {
  const p = brand.profiles[profile];
  const s = p.textSafe;
  return box.x >= s.left * p.width - 0.5 && box.x + box.w <= s.right * p.width + 0.5 && box.y >= s.top * p.height - 0.5 && box.y + box.h <= s.bottom * p.height + 0.5;
}

describe('Never Ending Interview blocks rendered with Edge and ffmpeg (WP5)', { skip }, () => {
  const roots = [];
  let ramp;
  let tall;
  before(async () => {
    const dir = await fs.mkdtemp(path.join(process.env.DARKMIND_BRAND_TEST_DIR || os.tmpdir(), 'brand-nei-'));
    roots.push(dir);
    // 25 fps ramps: the luma of frame n is 16 + 6·n – landscape 320 × 180 and vertical 180 × 320 (a selfie question)
    ramp = path.join(dir, 'ramp.mp4');
    tall = path.join(dir, 'tall.mp4');
    for (const [file, size] of [[ramp, '320x180'], [tall, '180x320']]) {
      const result = spawnSync(ffmpeg, ['-v', 'error', '-y', '-f', 'lavfi', '-i', `nullsrc=s=${size}:r=25:d=1.48`, '-vf', "geq=lum='16+6*N':cb=128:cr=128,format=yuv420p", '-c:v', 'libx264', '-qp', '0', '-g', '1', file]);
      assert.equal(result.status, 0, String(result.stderr));
    }
  });
  after(async () => {
    await Promise.all(roots.map((root) => fs.rm(root, { recursive: true, force: true })));
  });
  const project = async (profile, block, params, id = block.replace(/_/g, '-')) => {
    const created = await fixtureProject(profile, { blocks: [[block, { id, params }]] });
    roots.push(created.root);
    return runInputs(created.root, id);
  };
  const info = async (run, profile, extra = {}) => {
    const p = brand.profiles[profile];
    const { context, info: data } = await openScene(browser, { scene: run.scene, files: { ...run.files, ...extra.files }, width: p.width, height: p.height, fpsNumber: Number(p.fps.split('/')[0]), frames: run.output.durationFrames, params: { ...run.parameters, ...extra.params }, alpha: false });
    await context.close();
    return data;
  };

  it('renders the format explainer and the transition card on black, text centred in the safe area', async () => {
    const explainer = await project('landscape', 'format_card', { title: 'Never ending interview', text: ['We ask musicians at festivals one question.', 'The answer comes from someone else – who then comes up with a new question.', 'And it keeps going.'] });
    const result = await renderBlock({ ...explainer, browser });
    assert.equal(result.frames, 125);
    assert.deepEqual(probe(explainer.output.file), [{ type: 'video', codec: 'h264', pix: 'yuv420p', w: 1920, h: 1080, fps: '25/1', frames: 125 }]);
    const data = await info(explainer, 'landscape');
    assert.equal(data.title, 'NEVER ENDING INTERVIEW');
    assert.equal(data.lines.length, 4);
    assert.ok(insideSafe(data.text, 'landscape'), JSON.stringify(data.text));
    assert.ok(Math.abs(data.text.x + data.text.w / 2 - 960) < 2, 'centred');
    // black around the text
    assert.equal(lumaAt(explainer.output.file, 40, 40)[60], 16);
    const transition = await project('landscape', 'format_card', { text: 'Our starting question comes from none other than…' }, 'transition');
    const t = await info(transition, 'landscape');
    assert.equal(t.title, null);
    assert.deepEqual(t.lines, ['Our starting question comes from none other than…']);
  });

  it('draws the band card with the interview still in the image box (16:9 and 9:16), text in the safe area', async () => {
    for (const profile of ['landscape', 'vertical']) {
      const run = await project(profile, 'band_card', { lines: ['MYLES KENNEDY', 'alter bridge'], image: { sourceId: 'ramp', in: '0.4' } }, `band-${profile}`);
      const result = await renderBlock({ ...run, sources: { ramp: { file: ramp, offset: '0' } }, browser });
      const p = brand.profiles[profile];
      assert.deepEqual(probe(run.output.file), [{ type: 'video', codec: 'h264', pix: 'yuv420p', w: p.width, h: p.height, fps: p.fps, frames: result.frames }]);
      // inside the image box (away from the fade) every frame shows source frame 10 (0.4 s at 25 fps)
      const box = brand.blocks.band_card.profiles[profile].image;
      const values = lumaAt(run.output.file, Math.round(((box.left + box.right) / 2) * p.width), Math.round((box.top + (box.bottom - box.top) * 0.3) * p.height));
      assert.ok(values.every((v) => frameIndex(v) === 10), `${profile}: ${values.join(',')}`);
      const data = await info(run, profile, { files: { '_frames/image/00000.png': path.join(PACK, '..', '..', '..', 'doc', 'mvp', 'brand', 'assets', 'chevron-on-black.png') }, params: { images: ['_frames/image/00000.png'] } });
      assert.ok(insideSafe(data.text, profile), `${profile}: ${JSON.stringify(data.text)}`);
      assert.ok(data.text.x + data.text.w <= (profile === 'landscape' ? box.left + brand.blocks.band_card.profiles.landscape.image.fade : 1) * p.width, 'text left of the picture');
    }
    // proxy excerpt with offset: the same frame
    const run = await project('landscape', 'band_card', { lines: ['EVIL JARED', 'x KROGI'], image: { sourceId: 'ramp', in: '0.6' } }, 'band-proxy');
    await renderBlock({ ...run, sources: { ramp: { file: ramp, offset: '0.2' } }, browser });
    assert.equal(frameIndex(lumaAt(run.output.file, 1400, 300)[0]), 10);
    await assert.rejects(renderBlock({ ...run, sources: {}, browser }), /parameters\.image: source "ramp" is not an input/);
  });

  it('puts the cliffhanger top right over the darkened still, right-aligned in the safe area', async () => {
    const run = await project('landscape', 'cliffhanger_card', { next: 'Ugly Kid Joe', question: 'How long is a piece of string?', image: { sourceId: 'ramp', in: '1' } });
    const result = await renderBlock({ ...run, sources: { ramp: { file: ramp, offset: '0' } }, browser });
    assert.equal(result.frames, 125);
    const data = await info(run, 'landscape', { files: { '_frames/image/00000.png': path.join(PACK, '..', '..', '..', 'doc', 'mvp', 'brand', 'assets', 'chevron-on-black.png') }, params: { images: ['_frames/image/00000.png'] } });
    assert.deepEqual(data.lines, ['to find out if the question', 'goes to UGLY KID JOE', 'and if they will answer…']);
    assert.ok(insideSafe(data.text, 'landscape'), JSON.stringify(data.text));
    assert.ok(Math.abs(data.text.x + data.text.w - 0.92 * 1920) < 2, 'right-aligned at 92 % W');
    // bottom left: the still (frame 25, luma 166) darkened to about half
    const y = lumaAt(run.output.file, 100, 1000)[60];
    assert.ok(y > 40 && y < 120, `darkened luma ${y}`);
  });

  it('fits vertical footage into 16:9 over its blurred background, frame by frame with the render core frame choice', async () => {
    const run = await project('landscape', 'vertical_in_16x9', { clip: { sourceId: 'tall', in: '0.4', out: '0.92' } });
    assert.equal(run.output.durationFrames, 13);
    await renderBlock({ ...run, sources: { tall: { file: tall, offset: '0' } }, browser });
    assert.deepEqual(probe(run.output.file), [{ type: 'video', codec: 'h264', pix: 'yuv420p', w: 1920, h: 1080, fps: '25/1', frames: 13 }]);
    // centre: frames 10…22 of the clip; the background beside it is darker (blurred copy, brightness 0.45)
    const centre = lumaAt(run.output.file, 960, 540);
    assert.deepEqual(centre.map(frameIndex), [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]);
    const side = lumaAt(run.output.file, 200, 540);
    side.forEach((v, i) => assert.ok(v < centre[i] && v > 16, `frame ${i}: side ${v}, centre ${centre[i]}`));
    // a duration that differs from the clip is refused
    await assert.rejects(renderBlock({ ...run, output: { ...run.output, durationFrames: 14 }, sources: { tall: { file: tall, offset: '0' } }, browser }), /differs from the clip/);
  });

  it('renders identical files: again in a fresh browser, with more workers and without dedupe (T10)', async () => {
    const band = await project('landscape', 'band_card', { lines: ['MYLES KENNEDY', 'alter bridge'], image: { sourceId: 'ramp', in: '0.4', crop: { x: '0.25', y: '0.25', w: '0.5', h: '0.5' } } }, 'band-t10');
    const vertical = await project('landscape', 'vertical_in_16x9', { clip: { sourceId: 'tall', in: '0', out: '0.52' } }, 'vertical-t10');
    const format = await project('landscape', 'format_card', { title: 'Never ending interview', text: 'We ask musicians at festivals one question.' }, 'format-t10');
    const sources = { ramp: { file: ramp, offset: '0' }, tall: { file: tall, offset: '0' } };
    const fresh = await launchBrowser();
    try {
      for (const run of [band, vertical, format]) {
        const first = await renderBlock({ ...run, sources, browser, workers: 1, dedupe: true });
        const second = await renderBlock({ ...run, sources, browser: fresh, workers: 3, dedupe: false });
        assert.equal(second.sha256, first.sha256, run.extension.id);
      }
    } finally {
      await fresh.close();
    }
  });
});
