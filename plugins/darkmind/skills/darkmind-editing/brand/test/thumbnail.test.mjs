// Brand pack – WP4 render tests of the thumbnail with Microsoft Edge (Playwright) and ffmpeg: the still-image contract
// (ffprobe: one grey PNG 1280 × 720), the frame choice of the render core (T2/T3) for the confirmed frame and the
// candidate sheet, the template geometry (chevron, headline inside the safe area) and determinism (T10).
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
import { fixtureProject, runInputs } from './fixtures.mjs';

const PACK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const brand = JSON.parse(await fs.readFile(path.join(PACK, 'brand.json'), 'utf8'));
const settings = brand.blocks.thumbnail;
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
  const result = spawnSync(ffprobe, ['-v', 'error', '-count_frames', '-show_entries', 'stream=codec_type,codec_name,pix_fmt,width,height,nb_read_frames', '-of', 'json', file], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout).streams;
}

/** Grey value of one pixel of the PNG. */
function grey(file, x, y) {
  const result = spawnSync(ffmpeg, ['-v', 'error', '-i', file, '-vf', `format=gray,crop=1:1:${x}:${y}`, '-frames:v', '1', '-f', 'rawvideo', '-'], { maxBuffer: 1 << 20 });
  assert.equal(result.status, 0, String(result.stderr));
  return result.stdout[0];
}

/** Source frame index of a grey value: the ramp has luma 16 + 6·n (limited range); the grade subtracts the brightness. */
const frameIndex = (value) => Math.round(((value - settings.grade.brightness * 255) * (219 / 255)) / 6);

describe('thumbnail rendered with Edge and ffmpeg (WP4)', { skip }, () => {
  const roots = [];
  let media;
  let camera;
  let tenBit;
  before(async () => {
    // 2 s, 25 fps, 320 × 180: the luma of frame n is 16 + 6·n (n < 37), so the thumbnail names the frame it shows
    const dir = await fs.mkdtemp(path.join(process.env.DARKMIND_BRAND_TEST_DIR || os.tmpdir(), 'brand-media-'));
    roots.push(dir);
    media = path.join(dir, 'ramp.mp4');
    const result = spawnSync(ffmpeg, ['-v', 'error', '-y', '-f', 'lavfi', '-i', 'nullsrc=s=320x180:r=25:d=1.48', '-vf', "geq=lum='16+6*N':cb=128:cr=128,format=yuv420p", '-c:v', 'libx264', '-qp', '0', '-g', '1', media]);
    assert.equal(result.status, 0, String(result.stderr));
    // the same as a camera-like .mov with a timecode track (ffprobe ≥ 9 reports its time base twice – a real NEI original)
    camera = path.join(dir, 'ramp-timecode.mov');
    const mov = spawnSync(ffmpeg, ['-v', 'error', '-y', '-i', media, '-c', 'copy', '-timecode', '00:00:00:00', camera]);
    assert.equal(mov.status, 0, String(mov.stderr));
    // and as 10-bit 4:2:2 (like the 4K camera originals), where an unaligned crop used to garble the chroma
    tenBit = path.join(dir, 'ramp-422-10bit.mov');
    const prores = spawnSync(ffmpeg, ['-v', 'error', '-y', '-i', media, '-vf', 'scale=640:360', '-c:v', 'prores_ks', '-profile:v', '2', '-pix_fmt', 'yuv422p10le', tenBit]);
    assert.equal(prores.status, 0, String(prores.stderr));
  });
  after(async () => {
    await Promise.all(roots.map((root) => fs.rm(root, { recursive: true, force: true })));
  });
  const project = async (params, id = 'thumbnail') => {
    const created = await fixtureProject('landscape', { blocks: [['thumbnail', { id, params }]] });
    roots.push(created.root);
    return runInputs(created.root, id);
  };

  it('renders one grey PNG of 1280 × 720 that shows the chosen frame with the render core frame choice', async () => {
    const run = await project({ headline: 'Who is next?', frame: { sourceId: 'ramp', in: '0.4' }, contrast: 1 });
    const result = await renderBlock({ ...run, sources: { ramp: { file: media, offset: '0' } }, browser });
    assert.equal(result.frames, 1);
    assert.deepEqual(
      probe(run.output.file).map((s) => ({ type: s.codec_type, codec: s.codec_name, pix: s.pix_fmt, w: s.width, h: s.height, frames: Number(s.nb_read_frames) })),
      [{ type: 'video', codec: 'png', pix: 'gray', w: 1280, h: 720, frames: 1 }]
    );
    // bottom left is free of chevron and headline: frame 10 (0.4 s at 25 fps); from a proxy excerpt starting at 0.2 s the same
    assert.equal(frameIndex(grey(run.output.file, 12, 708)), 10);
    const proxy = await renderBlock({ ...run, sources: { ramp: { file: media, offset: '0.2' } }, parameters: { ...run.parameters, frame: { sourceId: 'ramp', in: '0.6' } }, browser });
    assert.equal(frameIndex(grey(proxy.output, 12, 708)), 10);
    const mov = await renderBlock({ ...run, sources: { ramp: { file: camera, offset: '0' } }, browser });
    assert.equal(frameIndex(grey(mov.output, 12, 708)), 10);
    const crop = { x: '0.2229', y: '0.0213', w: '0.56', h: '0.56' };
    const cropped = await renderBlock({ ...run, sources: { ramp: { file: tenBit, offset: '0' } }, parameters: { ...run.parameters, frame: { sourceId: 'ramp', in: '0.4', crop } }, browser });
    assert.equal(frameIndex(grey(cropped.output, 12, 708)), 10);
    // the chevron is white at its centre, the headline white on its strokes
    const chevron = settings.chevron;
    assert.equal(grey(run.output.file, Math.round(chevron.height * 720 * 0.871 * 0.85), 360), 255);
    // an undeclared source is refused, not guessed
    await assert.rejects(renderBlock({ ...run, sources: {}, browser }), /source "ramp" is not an input/);
  });

  it('places chevron and headline like the reference template, inside the safe area', async () => {
    const W = 1280;
    const H = 720;
    const safe = settings.textSafe;
    for (const [headline, cap] of [['Jensen x Tremonti', settings.headline.capHeight], ['Iron Maiden treasures in Brazil', null], ['Internationale\nSupergruppen\nZusammenkunft\nDeutschland', null]]) {
      const run = await project({ headline, frame: { sourceId: 'ramp', in: '0' } }, `t-${headline.length}`);
      const { context, info } = await openScene(browser, { scene: run.extension.command.args[1], files: { ...run.files, '_frames/frame/00000.png': path.join(PACK, '..', '..', '..', 'doc', 'mvp', 'brand', 'assets', 'chevron-on-black.png') }, width: W, height: H, fpsNumber: 25, frames: 1, params: { ...run.parameters, images: ['_frames/frame/00000.png'] }, alpha: false });
      await context.close();
      // chevron: left edge, centred, apex at 20–25 % W (BRAND_LOUD_SOCIETY.md)
      assert.equal(info.chevron.x, 0);
      assert.ok(Math.abs(info.chevron.y + info.chevron.h / 2 - H / 2) < 0.5);
      assert.ok(info.chevron.apex >= 0.2 * W && info.chevron.apex <= 0.25 * W, `apex at ${info.chevron.apex} px`);
      // headline: right-aligned at 94 % W, cap height 20.4 % H unless the lines are too wide, never below the minimum
      if (cap) assert.ok(Math.abs(info.cap - cap * H) < 0.01, `${headline}: cap ${info.cap}`);
      else assert.ok(info.cap < settings.headline.capHeight * H && info.cap >= settings.headline.minCapHeight * H, `${headline}: cap ${info.cap}`);
      for (const box of info.lineBoxes) {
        assert.ok(Math.abs(box.x + box.w - settings.headline.right * W) < 1, `${headline}: line ends at ${box.x + box.w}`);
        assert.ok(box.w <= settings.headline.maxWidth * W + 1, `${headline}: line ${box.w} px wide`);
        assert.ok(box.x > info.chevron.apex, `${headline}: text overlaps the chevron`);
        assert.ok(box.y >= safe.top * H - 0.5 && box.y + box.h <= safe.bottom * H + 0.5, `${headline}: ${JSON.stringify(box)}`);
      }
    }
  });

  it('draws the candidates as a labelled 2 × 2 contact sheet, each quadrant with its own frame', async () => {
    const candidates = [{ sourceId: 'ramp', in: '0.4' }, { sourceId: 'ramp', in: '1' }, { sourceId: 'ramp', in: '0.2' }];
    const run = await project({ headline: 'Who is next?', candidates, contrast: 1 });
    await renderBlock({ ...run, sources: { ramp: { file: media, offset: '0' } }, browser });
    assert.deepEqual([grey(run.output.file, 12, 345), grey(run.output.file, 652, 345), grey(run.output.file, 12, 705)].map(frameIndex), [10, 25, 5]);
    assert.equal(grey(run.output.file, 652, 705), 0, 'the fourth quadrant stays black');
  });

  it('renders identical files: again in a fresh browser, with more workers and without dedupe (T10)', async () => {
    const run = await project({ headline: "Give 'em\nhell\nup there!", frame: { sourceId: 'ramp', in: '0.8', crop: { x: '0.25', y: '0.25', w: '0.5', h: '0.5' } } });
    const sources = { ramp: { file: media, offset: '0' } };
    const first = await renderBlock({ ...run, sources, browser, workers: 1, dedupe: true });
    const fresh = await launchBrowser();
    try {
      const second = await renderBlock({ ...run, sources, browser: fresh, workers: 3, dedupe: false });
      assert.equal(second.sha256, first.sha256);
    } finally {
      await fresh.close();
    }
  });
});
