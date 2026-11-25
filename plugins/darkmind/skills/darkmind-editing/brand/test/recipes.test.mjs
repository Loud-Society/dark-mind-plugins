// Brand pack – WP5 recipe tests (pure, no browser): the shipped recipes, apply, the recipe check of a synthetic NEI
// episode (mandatory and allowed blocks, profile, duration frame, loudness step, order, hook, end, brand-layer
// parameters, unchanged brand pack, captions style, thumbnail, done state) and the YouTube chapter list.
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { after, before, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { bandCardTitle, chapterList, timestamp } from '../lib/chapters.mjs';
import { checkProject, checkRecipe } from '../lib/recipes.mjs';
import { addBlock } from '../tools/add-block.mjs';
import { listRecipes, loadProject, loadRecipe, recipeCommand } from '../tools/recipe.mjs';
import { fixtureProject } from './fixtures.mjs';

const PACK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const brand = JSON.parse(await fs.readFile(path.join(PACK, 'brand.json'), 'utf8'));
const codes = (result, severity) => result.issues.filter((i) => !severity || i.severity === severity).map((i) => i.code);

describe('shipped recipes', () => {
  it('are the five MVP formats, structurally sound, each with its agent document', async () => {
    const recipes = await listRecipes();
    assert.deepEqual(recipes.map((r) => r.id).sort(), ['host-interview', 'nei-episode', 'nei-short', 'short-anecdote', 'short-statement']);
    for (const recipe of recipes) {
      assert.deepEqual(checkRecipe(brand, recipe), [], recipe.id);
      await fs.access(path.join(PACK, 'recipes', recipe.document));
      if (recipe.chain) await fs.access(path.join(PACK, 'recipes', recipe.chain.guide));
      assert.equal(recipe.audioMaster, 'required', `${recipe.id}: audio_master belongs into every recipe`);
      assert.equal(recipe.music.slot, 'optional', `${recipe.id}: optional music slot (T14)`);
    }
    const byId = Object.fromEntries(recipes.map((r) => [r.id, r]));
    assert.deepEqual([byId['nei-episode'].profile, byId['nei-short'].profile, byId['host-interview'].profile], ['landscape', 'vertical', 'landscape']);
    assert.equal(byId['nei-episode'].blocks.thumbnail.use, 'required');
    assert.equal(byId['host-interview'].blocks.thumbnail.use, 'required');
    assert.deepEqual(checkRecipe(brand, { ...byId['nei-short'], blocks: { ...byId['nei-short'].blocks, sparkle: { use: 'optional' } } }), ['unknown block "sparkle"']);
  });
});

/** A synthetic NEI episode: every mandatory block vendored and placed in the recipe's order (no media needed). */
async function neiEpisode() {
  const { root } = await fixtureProject('landscape');
  await recipeCommand(['apply', 'nei-episode', '--project', root]);
  const frame = { sourceId: 'a-1', in: '12' };
  const blocks = [
    ['logo_sting', 'sting', {}],
    ['format_card', 'fc-explainer', { title: 'Never ending interview', text: ['We ask musicians at festivals one question.', 'And it keeps going.'] }],
    ['format_card', 'fc-transition', { text: 'Our starting question comes from none other than…' }],
    ['band_card', 'bc-starter', { lines: ['EVIL JARED', 'x KROGI'], image: frame }],
    ['band_card', 'bc-1', { lines: ['MYLES KENNEDY', 'alter bridge'], image: frame }],
    ['band_card', 'bc-2', { lines: ['BULLET FOR MY VALENTINE'], image: frame }],
    ['chevron_wipe', 'wipe-1', { a: { sourceId: 'q-0', in: '20' }, b: { extensionId: 'bc-1', in: '0' } }],
    ['cliffhanger_card', 'cliff', { next: 'Rise Against' }],
    ['loud_sounds', 'loud', {}],
    ['logo_end', 'end', {}],
    ['endcard', 'endcard', {}],
    ['thumbnail', 'thumb', { headline: 'Who is next?', frame }],
  ];
  for (const [block, id, params] of blocks) await addBlock([block, '--project', root, '--id', id, '--params', JSON.stringify(params)]);
  const ext = async (id) => JSON.parse(await fs.readFile(path.join(root, 'extensions', id, 'extension.json'), 'utf8'));
  const main = [];
  const effects = [];
  let at = 0;
  const put = async (id, { source = false, frames } = {}) => {
    const length = source ? frames : (await ext(id)).output.durationFrames;
    const clip = source ? { id: `c-${id}`, sourceId: id, in: '0', out: `${length}/25`, start: at, crop: { x: '0', y: '0', w: '1', h: '1' } } : { id: `x-${id}`, extensionId: id, in: '0', out: `${length}/25`, start: at };
    main.push(clip);
    at += length;
    return clip;
  };
  await put('cold-open', { source: true, frames: 225 });
  const sting = await put('sting');
  effects.push({ id: 'xa-sting', extensionId: 'sting', in: '0', out: sting.out, start: sting.start, gainDb: 0, linkedTo: sting.id });
  await put('fc-explainer');
  await put('fc-transition');
  await put('bc-starter');
  await put('q-0', { source: true, frames: 500 });
  await put('wipe-1');
  await put('bc-1');
  await put('a-1', { source: true, frames: 1500 });
  await put('bc-2');
  await put('a-2', { source: true, frames: 1500 });
  await put('cliff');
  const loud = await ext('loud');
  effects.push({ id: 'xa-loud', extensionId: 'loud', in: '0', out: `${loud.output.durationFrames}/25`, start: at, gainDb: 0 });
  at += loud.output.durationFrames;
  const end = await put('end');
  effects.push({ id: 'xa-end', extensionId: 'end', in: '0', out: end.out, start: end.start, gainDb: 0, linkedTo: end.id });
  await put('endcard');
  const timeline = { schemaVersion: 1, video: [{ id: 'v1', role: 'main', clips: main }], audio: [{ id: 'fx', role: 'effects', clips: effects }], gaps: [] };
  await fs.writeFile(path.join(root, 'timeline.json'), `${JSON.stringify(timeline, null, 2)}\n`);
  await fs.writeFile(path.join(root, 'captions.json'), `${JSON.stringify({ schemaVersion: 1, language: 'en', style: 'plain', captions: [] }, null, 2)}\n`);
  return root;
}

describe('recipe check of a NEI episode (synthetic project)', () => {
  let root;
  let recipe;
  before(async () => {
    root = await neiEpisode();
    recipe = await loadRecipe('nei-episode');
  });
  after(() => fs.rm(root, { recursive: true, force: true }));
  const check = async (mutate = (docs) => docs) => checkProject(brand, recipe, mutate(await loadProject(root)));

  it('apply sets profile, duration frame, recipe and the loudness step', async () => {
    const project = JSON.parse(await fs.readFile(path.join(root, 'project.json'), 'utf8'));
    assert.deepEqual(project.output, { width: 1920, height: 1080, fps: '25/1', sampleRate: 48000 });
    assert.deepEqual(project.duration, { minSeconds: 300, maxSeconds: 1500 });
    assert.deepEqual(project.recipe, { id: 'nei-episode', version: brand.version });
    assert.deepEqual(project.audioMaster, { integratedLufs: -14, toleranceLu: 1, truePeakDbtp: -1, ducking: { underDialogDb: 12, rampSeconds: 0.25 } });
    // a vertical recipe on a timeline built for 16:9 is refused
    await assert.rejects(recipeCommand(['apply', 'nei-short', '--project', root]), /would change/);
  });

  it('passes with every mandatory block in order and lists the chapters per link', async () => {
    const result = await check();
    assert.deepEqual(codes(result, 'error'), []);
    assert.equal(result.valid, true);
    assert.equal(result.ready, true);
    assert.equal(result.blocks.band_card, 3);
    // the chapter of MYLES KENNEDY starts with the wipe that reveals its card (frame 1076 = 0:43.04)
    assert.equal(result.chapters.text, '0:00 Intro\n0:21 EVIL JARED x KROGI\n0:43 MYLES KENNEDY – alter bridge\n1:45 BULLET FOR MY VALENTINE');
  });

  it('names missing blocks, wrong profile, duration frame and loudness step', async () => {
    const result = await check((docs) => {
      delete docs.extensions.cliff;
      docs.timeline.video[0].clips = docs.timeline.video[0].clips.filter((c) => c.extensionId !== 'cliff');
      docs.project.output = { width: 1080, height: 1920, fps: '30/1', sampleRate: 48000 };
      docs.project.duration = { minSeconds: 30, maxSeconds: 60 };
      delete docs.project.audioMaster;
      return docs;
    });
    assert.deepEqual(codes(result, 'error').sort(), ['audio-master-missing', 'block-missing', 'recipe-duration', 'recipe-profile']);
    assert.match(result.issues.find((i) => i.code === 'block-missing').message, /1 × cliffhanger_card/);
  });

  it('refuses blocks outside the recipe, brand parameters out of bounds and a changed brand layer', async () => {
    const result = await check((docs) => {
      docs.extensions.lt = { ...docs.extensions.cliff, id: 'lt', command: { program: 'node', args: ['extensions/brand-pack/lib/render.mjs', 'extensions/brand-pack/blocks/lower_third/scene.html'] } };
      docs.extensions['bc-2'].parameters = { lines: ['A', 'B', 'C'] };
      docs.extensions['wipe-1'].parameters = {};
      docs.vendored = [{ path: 'extensions/brand-pack/brand.json', same: false, packVersion: brand.version }];
      return docs;
    });
    const errors = codes(result, 'error');
    for (const code of ['block-not-in-recipe', 'brand-parameters', 'recipe-parameters', 'brand-pack-modified']) assert.ok(errors.includes(code), `${code} in ${errors}`);
    assert.match(result.issues.find((i) => i.code === 'brand-parameters').message, /bc-2 \(band_card\): parameters\.lines must list 1–2 lines/);
    assert.match(result.issues.find((i) => i.code === 'recipe-parameters').message, /needs parameters\.a/);
    // an older vendored pack is a warning (vendor again), not a violation
    const old = await check((docs) => ({ ...docs, vendored: [{ path: 'extensions/brand-pack/lib/blocks.mjs', same: false, packVersion: '0.4.0' }] }));
    assert.deepEqual(codes(old, 'error'), []);
    assert.ok(codes(old, 'warning').includes('brand-pack-outdated'));
  });

  it('checks order, hook and end of the format', async () => {
    const result = await check((docs) => {
      const clips = docs.timeline.video[0].clips;
      const sting = clips.find((c) => c.extensionId === 'sting');
      const starter = clips.find((c) => c.extensionId === 'bc-starter');
      // a band card in the cold open, the endcard not last
      [sting.start, starter.start] = [starter.start, sting.start - 1];
      clips.find((c) => c.extensionId === 'endcard').start -= 400;
      return docs;
    });
    const errors = codes(result, 'error');
    for (const code of ['recipe-order', 'hook-block', 'recipe-end']) assert.ok(errors.includes(code), `${code} in ${errors}`);
  });

  it('keeps the thumbnail off the timeline and pending until the editor chose the frame; done needs the reviews', async () => {
    const result = await check((docs) => {
      docs.extensions.thumb.parameters = { headline: 'Who is next?', candidates: [{ sourceId: 'a-1', in: '1' }, { sourceId: 'a-1', in: '2' }] };
      return docs;
    });
    assert.equal(result.valid, true);
    assert.equal(result.ready, false);
    assert.deepEqual(codes(result, 'pending'), ['thumbnail-not-chosen']);
    const missing = await check((docs) => {
      delete docs.extensions.thumb;
      return docs;
    });
    assert.match(missing.issues.find((i) => i.code === 'block-missing').message, /thumbnail/);
    const subjects = (thumbnail) => ({ subjects: { editorial: { status: 'approved' }, 'captions-text': { status: 'not-required' }, preview: { status: 'approved' }, final: { status: 'approved' }, thumbnail: { status: thumbnail }, 'duration-exception': { status: 'not-required' } } });
    const open = await check((docs) => ({ ...docs, reviews: subjects('missing') }));
    assert.equal(open.done, false);
    assert.match(open.issues.find((i) => i.code === 'not-done').message, /thumbnail \(missing\)/);
    assert.equal((await check((docs) => ({ ...docs, reviews: subjects('approved') }))).done, true);
  });

  it('wants the captions in the brand style of the recipe', async () => {
    const result = await check((docs) => ({ ...docs, captions: { style: 'plain', captions: [{ id: 'c1', start: 0, end: 10, text: 'Hi' }] } }));
    assert.deepEqual(codes(result, 'error'), ['captions-style']);
  });
});

describe('YouTube chapter list', () => {
  const placed = (items) => items.map(([id, block, start, end, track = 'v1']) => ({ kind: 'video', track, block, start, end, clip: { id, extensionId: block ? id : undefined } }));
  const recipe = { id: 'host-interview', chapters: { required: true, derive: null } };

  it('formats timestamps and band card titles', () => {
    assert.deepEqual([timestamp(0), timestamp(247.9), timestamp(3723)], ['0:00', '4:07', '1:02:03']);
    assert.equal(bandCardTitle(['EVIL JARED', 'x KROGI']), 'EVIL JARED x KROGI');
    assert.equal(bandCardTitle(['MYLES KENNEDY', 'alter bridge']), 'MYLES KENNEDY – alter bridge');
  });

  it('takes topic blocks from chapters.json by clip, so the list follows edits', () => {
    const clips = placed([['open', null, 0, 500], ['topic-1', null, 500, 4000], ['topic-2', null, 4000, 9000]]);
    const chapters = { schemaVersion: 1, kind: 'darkmind-chapters', chapters: [{ title: 'Intro', frame: 0 }, { title: 'Growing up in Detroit', clipId: 'topic-1' }, { title: 'The new record', clipId: 'topic-2' }] };
    const result = chapterList({ recipe, placed: clips, extensions: {}, chapters, fps: '25/1', end: 9000 });
    assert.deepEqual(result.issues, []);
    assert.equal(result.text, '0:00 Intro\n0:20 Growing up in Detroit\n2:40 The new record');
  });

  it('applies the YouTube rules and waits for chapters.json where the recipe has no derivation', () => {
    assert.deepEqual(chapterList({ recipe, placed: [], extensions: {}, chapters: null, fps: '25/1', end: 0 }).issues.map((i) => i.code), ['chapters-missing']);
    const clips = placed([['a', null, 0, 100], ['b', null, 100, 200]]);
    const bad = { schemaVersion: 1, kind: 'darkmind-chapters', chapters: [{ title: 'Late start', clipId: 'b' }, { title: 'Gone', clipId: 'zzz' }] };
    const codesOf = chapterList({ recipe, placed: clips, extensions: {}, chapters: bad, fps: '25/1', end: 200 }).issues.map((i) => i.code);
    assert.deepEqual(codesOf, ['chapters-clip', 'chapters-start', 'chapters-count', 'chapters-short']);
  });
});
