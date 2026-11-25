// Brand pack – render tests with Microsoft Edge (Playwright) and ffmpeg: output contract, safe zones on every frame,
// frame-exact timing, umlauts/glyph coverage, undeclared files and determinism (T10: two renders, more workers,
// without dedupe → identical SHA-256). Skipped when Edge, playwright-core or ffmpeg are missing, unless
// DARKMIND_REQUIRE_BRAND_RENDER=1 (CI).
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { after, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { launchBrowser, openScene } from '../lib/compositor.mjs';
import { outsideSafe } from '../lib/layout.mjs';
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
// top level: closes the browser even if the suite fails to build (otherwise the process would not exit)
after(() => browser?.close());

const CASES = [
  { block: 'caption_word', profile: 'vertical', style: 'brand-word' },
  { block: 'caption_phrase', profile: 'vertical', style: 'brand-phrase' },
  { block: 'subtitles_16x9', profile: 'landscape', style: 'brand-16x9' },
  { block: 'lower_third', profile: 'vertical', params: { people: [{ name: 'Gustavo Hill', role: '@gustahill' }] } },
  { block: 'lower_third', profile: 'landscape', id: 'lower-third-double', params: { people: [{ name: 'Mark Tremonti', role: 'tremonti' }, { name: 'Thomas Jensen', role: 'founder wacken open air' }] } },
  { block: 'wordmark_flash', profile: 'vertical' },
  { block: 'title_card', profile: 'landscape', params: { title: 'jensen x mark tremonti', presents: true, background: 'transparent' } },
  { block: 'title_card', profile: 'landscape', id: 'title-card-black', params: { title: 'Grüße aus Köln', presents: false } },
];

const projects = [];
async function project(c) {
  const id = c.id ?? c.block.replace(/_/g, '-');
  const created = await fixtureProject(c.profile, { style: c.style ?? 'plain', blocks: [[c.block, { id, params: c.params }]] });
  projects.push(created.root);
  return runInputs(created.root, id);
}

function probe(file) {
  const result = spawnSync(ffprobe, ['-v', 'error', '-count_frames', '-show_entries', 'stream=codec_name,pix_fmt,width,height,r_frame_rate,nb_read_frames', '-of', 'json', file], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout).streams;
}

/** Opens the scene like the compositor does (virtual origin, declared files only). */
function sceneJob(run, overrides = {}) {
  const [n, d = '1'] = run.output.fps.split('/');
  return { scene: run.scene, files: run.files, width: run.output.width, height: run.output.height, fpsNumber: Number(n) / Number(d), frames: run.output.durationFrames, params: run.parameters, alpha: true, ...overrides };
}

describe('brand blocks rendered with Edge and ffmpeg', { skip }, () => {
  after(async () => {
    await Promise.all(projects.map((root) => fs.rm(root, { recursive: true, force: true })));
  });

  it('renders every text block to its output contract (size, rate, exact frames, alpha as QuickTime Animation)', async () => {
    for (const c of CASES) {
      const run = await project(c);
      const result = await renderBlock({ ...run, browser });
      const [stream] = probe(run.output.file);
      const profile = brand.profiles[c.profile];
      assert.deepEqual(
        { codec: stream.codec_name, pix: stream.pix_fmt, w: stream.width, h: stream.height, rate: stream.r_frame_rate, frames: Number(stream.nb_read_frames) },
        { codec: run.output.alpha ? 'qtrle' : 'h264', pix: run.output.alpha ? 'argb' : 'yuv420p', w: profile.width, h: profile.height, rate: profile.fps, frames: run.output.durationFrames },
        `${c.block} (${c.profile})`
      );
      assert.equal(result.frames, run.output.durationFrames);
    }
  });

  it('keeps all ink inside the safe area of the profile on every frame', async () => {
    for (const c of CASES.filter((x) => x.id !== 'title-card-black')) {
      const run = await project(c);
      const { page, context } = await openScene(browser, sceneJob(run));
      const safe = brand.profiles[c.profile].textSafe;
      let drawn = 0;
      try {
        for (let frame = 0; frame < run.output.durationFrames; frame++) {
          const box = await page.evaluate((f) => (window.scene.renderAt(f), window.scene.inkBox()), frame);
          if (!box) continue;
          drawn++;
          assert.equal(outsideSafe(box, safe, run.output.width, run.output.height), null, `${c.block} (${c.profile}) frame ${frame}: ${JSON.stringify(box)}`);
        }
      } finally {
        await context.close();
      }
      assert.ok(drawn > 0, `${c.block} drew nothing`);
    }
  });

  it('shows words and captions exactly from their start frame until their end frame', async () => {
    const words = await project(CASES[0]);
    const phrase = await project(CASES[1]);
    for (const [run, checks] of [
      // c1 words start at 10, 22, 34 …; c1 ends at 70, c2 at 130, c3 starts at 140
      [words, [[9, 'none'], [10, 'ink'], [69, 'ink'], [135, 'none'], [140, 'ink'], [199, 'ink'], [200, 'none']]],
      [phrase, [[9, 'none'], [10, 'ink'], [129, 'ink'], [130, 'none'], [139, 'none'], [140, 'ink'], [200, 'none']]],
    ]) {
      const { page, context } = await openScene(browser, sceneJob(run));
      try {
        for (const [frame, expected] of checks) {
          const box = await page.evaluate((f) => (window.scene.renderAt(f), window.scene.inkBox()), frame);
          assert.equal(box ? 'ink' : 'none', expected, `${run.scene} frame ${frame}`);
        }
        if (run === words) {
          // the second word of "Grüße aus …" appears exactly at its start frame 22
          const width = async (f) => page.evaluate((x) => (window.scene.renderAt(x), window.scene.inkBox().w), f);
          assert.equal(await width(21), await width(10));
          assert.ok((await width(22)) > (await width(21)));
        }
      } finally {
        await context.close();
      }
    }
  });

  it('draws umlauts with Neuborn and refuses characters the font does not have', async () => {
    const run = await project(CASES[1]);
    const result = await renderBlock({ ...run, browser });
    assert.deepEqual(result.info.fonts, [{ name: 'medium', weight: 500 }]);
    const captionsFile = path.join(run.root, 'captions.json');
    const captions = JSON.parse(await fs.readFile(captionsFile, 'utf8'));
    captions.captions[0].text = 'Grüße ✓ 漢字';
    await fs.writeFile(captionsFile, JSON.stringify(captions));
    await assert.rejects(openScene(browser, sceneJob(run)), /characters missing in Neuborn: ✓ 漢 字/);
  });

  it('stops with ffmpeg\'s error when the encoder exits early instead of waiting forever', { timeout: 60_000 }, async () => {
    const run = await project(CASES[1]);
    // the output path is a folder: ffmpeg cannot open it and exits after the first frame
    const folder = path.join(run.root, 'renders', 'not-a-file.mov');
    await fs.mkdir(folder, { recursive: true });
    await assert.rejects(renderBlock({ ...run, output: { ...run.output, file: folder }, browser, workers: 2 }), /ffmpeg exited/);
  });

  it('refuses files that are not declared as inputs', async () => {
    const run = await project(CASES[3]);
    const files = Object.fromEntries(Object.entries(run.files).filter(([rel]) => !rel.endsWith('Neuborn-Bold.ttf')));
    await assert.rejects(openScene(browser, sceneJob({ ...run, files })), /undeclared|404|cannot read|load/i);
  });

  it('renders identical files: again in a fresh browser, with more workers and without dedupe (T10, R4)', async () => {
    for (const c of [CASES[0], CASES[4], CASES[7]]) {
      const run = await project(c);
      const first = await renderBlock({ ...run, browser, workers: 1, dedupe: true });
      const fresh = await launchBrowser();
      try {
        const second = await renderBlock({ ...run, browser: fresh, workers: 3, dedupe: false });
        assert.equal(second.sha256, first.sha256, `${c.block}: renders differ`);
        assert.ok(first.captures < second.captures, 'dedupe saved captures');
      } finally {
        await fresh.close();
      }
    }
  });
});
