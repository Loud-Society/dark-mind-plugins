// Brand pack – recipe tests (pure, no browser; doc/mvp/FORMAT_RECIPES.md): the catalog, the five starting recipes
// against it, the recipe check of a synthetic NEI episode (brand errors block, recipe deviations are reported, pending,
// done), the derived recipe skeleton and the YouTube chapter list. Schema validation of the recipes: shared
// (src/editing-pipeline/recipe.test.ts).
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { after, before, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { BLOCKS, STILL_BLOCKS } from '../lib/blocks.mjs';
import { RECIPE_CAPABILITIES, RECIPE_CHECKS, loadRecipeCatalog } from '../lib/catalog.mjs';
import { bandCardTitle, chapterList, timestamp } from '../lib/chapters.mjs';
import { loadProjectDocs } from '../lib/project-docs.mjs';
import { checkProject, deriveRecipe, projectChapters, recipeModel, recipeProjectFields } from '../lib/recipes.mjs';
import { addBlock } from '../tools/add-block.mjs';
import { fixtureProject } from './fixtures.mjs';

const PACK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const brand = JSON.parse(await fs.readFile(path.join(PACK, 'brand.json'), 'utf8'));
const codes = (result, severity) => result.issues.filter((i) => !severity || i.severity === severity).map((i) => i.code);
const IDS = ['host-interview', 'nei-episode', 'nei-short', 'short-anecdote', 'short-statement'];
const loadRecipe = async (id) => JSON.parse(await fs.readFile(path.join(PACK, 'test', 'recipes', `${id}.json`), 'utf8'));
const reference = (recipe) => ({ id: recipe.meta.id, version: null, sha256: '0'.repeat(64), source: 'draft' });

/** What darkmind-agent recipe try/use writes into project.json (the lock itself is not read by the pack). */
async function applyRecipe(root, recipe) {
  const file = path.join(root, 'project.json');
  const project = JSON.parse(await fs.readFile(file, 'utf8'));
  await fs.writeFile(file, `${JSON.stringify({ ...project, ...recipeProjectFields(brand, recipe, reference(recipe)) }, null, 2)}\n`);
}

describe('recipe catalog of the pack', () => {
  it('lists every block with still/video/audio, the profiles, checks and capabilities with existing files', async () => {
    const catalog = await loadRecipeCatalog();
    assert.deepEqual(catalog.brand, { id: brand.id, version: brand.version });
    assert.deepEqual(Object.keys(catalog.blocks).sort(), [...BLOCKS].sort());
    assert.equal(catalog.blocks.thumbnail.still, true);
    assert.equal(catalog.blocks.animal_scream.video, false);
    assert.equal(catalog.blocks.logo_sting.audio, true);
    assert.deepEqual(catalog.blocks.cliffhanger_card.profiles, ['landscape']);
    assert.equal(catalog.blocks.band_card.profiles, null);
    assert.ok(catalog.blocks.band_card.description.includes('band card'));
    assert.deepEqual(Object.keys(catalog.profiles).sort(), ['landscape', 'vertical']);
    assert.deepEqual(Object.keys(catalog.checks), Object.keys(RECIPE_CHECKS));
    for (const capability of Object.values(RECIPE_CAPABILITIES)) {
      await fs.access(path.join(PACK, capability.guide));
      await fs.access(path.join(PACK, capability.tool));
    }
  });
});

describe('starting recipes', () => {
  it('are the five formats, data only, every name known to the pack', async () => {
    const names = (await fs.readdir(path.join(PACK, 'test', 'recipes'))).filter((n) => n.endsWith('.json')).sort();
    assert.deepEqual(names, IDS.map((id) => `${id}.json`));
    for (const id of IDS) {
      const recipe = await loadRecipe(id);
      assert.equal(recipe.kind, 'darkmind-format-recipe', id);
      assert.equal(recipe.meta.id, id);
      const model = recipeModel(recipe);
      assert.ok(brand.profiles[model.profile], `${id}: profile`);
      for (const [block, spec] of Object.entries(model.blocks)) {
        assert.ok(BLOCKS.includes(block), `${id}: ${block}`);
        assert.equal(Boolean(spec.still), STILL_BLOCKS.includes(block), `${id}: ${block} still`);
      }
      for (const check of model.checks) assert.ok(RECIPE_CHECKS[check.id], `${id}: check ${check.id}`);
      for (const capability of recipe.capabilities) assert.ok(RECIPE_CAPABILITIES[capability], `${id}: ${capability}`);
      assert.equal(recipe.technical.music.slot, 'optional', `${id}: optional music slot (T14)`);
    }
    const episode = recipeModel(await loadRecipe('nei-episode'));
    assert.deepEqual(episode.order, ['logo_sting', 'format_card', 'band_card', 'cliffhanger_card', 'loud_sounds', 'logo_end', 'endcard']);
    assert.deepEqual(episode.chapters, { required: true, derive: 'band_card', introTitle: 'Intro', note: episode.chapters.note });
    assert.deepEqual(recipeModel(await loadRecipe('host-interview')).checks, [{ id: 'lower-third-people', params: { people: 2 }, level: 'hard', rule: 'first-lower-third' }]);
  });
});

/** A synthetic NEI episode: every mandatory block vendored and placed in the recipe's order (no media needed). */
async function neiEpisode(recipe) {
  const { root } = await fixtureProject('landscape');
  await applyRecipe(root, recipe);
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
  const material = { schemaVersion: 1, kind: 'darkmind-material', needs: [{ needId: 'starter-question', status: 'covered', sources: ['q-0'] }, { needId: 'links', status: 'covered', sources: ['a-1', 'a-2'] }] };
  await fs.writeFile(path.join(root, 'material.json'), `${JSON.stringify(material, null, 2)}\n`);
  return root;
}

describe('recipe check of a NEI episode (synthetic project)', () => {
  let root;
  let recipe;
  before(async () => {
    recipe = await loadRecipe('nei-episode');
    root = await neiEpisode(recipe);
  });
  after(() => fs.rm(root, { recursive: true, force: true }));
  const check = async (mutate = (docs) => docs) => checkProject(brand, recipe, mutate(await loadProjectDocs(root, PACK)));

  it('applying sets profile, duration frame, the recipe reference and the loudness step', async () => {
    const project = JSON.parse(await fs.readFile(path.join(root, 'project.json'), 'utf8'));
    assert.deepEqual(project.output, { width: 1920, height: 1080, fps: '25/1', sampleRate: 48000 });
    assert.deepEqual(project.duration, { minSeconds: 300, maxSeconds: 1500 });
    assert.deepEqual(project.recipe, reference(recipe));
    assert.deepEqual(project.audioMaster, { integratedLufs: -14, toleranceLu: 1, truePeakDbtp: -1, ducking: { underDialogDb: 12, rampSeconds: 0.25 } });
  });

  it('passes with every mandatory block in order, lists the chapters per link and the editorial rules', async () => {
    const result = await check();
    assert.deepEqual(codes(result, 'error'), []);
    assert.deepEqual(codes(result, 'deviation'), []);
    assert.equal(result.valid, true);
    assert.equal(result.ready, true);
    assert.equal(result.deviations, 0);
    assert.equal(result.blocks.band_card, 3);
    // the chapter of MYLES KENNEDY starts with the wipe that reveals its card (frame 1076 = 0:43.04)
    assert.equal(result.chapters.text, '0:00 Intro\n0:21 EVIL JARED x KROGI\n0:43 MYLES KENNEDY – alter bridge\n1:45 BULLET FOR MY VALENTINE');
    assert.equal(projectChapters(recipe, await loadProjectDocs(root, PACK)).text, result.chapters.text);
    assert.ok(result.editorial.rules.some((r) => r.id === 'chain-from-transcripts' && r.level === 'hard'));
    assert.equal(result.editorial.report.length, 3);
  });

  it('blocks on brand and contract errors: profile, duration frame, loudness step', async () => {
    const result = await check((docs) => {
      docs.project.output = { width: 1080, height: 1920, fps: '30/1', sampleRate: 48000 };
      docs.project.duration = { minSeconds: 30, maxSeconds: 60 };
      delete docs.project.audioMaster;
      return docs;
    });
    assert.deepEqual(codes(result, 'error').sort(), ['audio-master-missing', 'recipe-duration', 'recipe-profile']);
    assert.equal(result.valid, false);
  });

  it('reports a missing block and a block outside the recipe as deviations, never as errors', async () => {
    const result = await check((docs) => {
      delete docs.extensions.cliff;
      docs.timeline.video[0].clips = docs.timeline.video[0].clips.filter((c) => c.extensionId !== 'cliff');
      docs.extensions.lt = { ...docs.extensions['fc-transition'], id: 'lt', command: { program: 'node', args: ['extensions/brand-pack/lib/render.mjs', 'extensions/brand-pack/blocks/lower_third/scene.html'] }, parameters: { people: [{ name: 'A' }] } };
      return docs;
    });
    assert.ok(codes(result, 'deviation').includes('block-missing'));
    assert.ok(codes(result, 'deviation').includes('block-not-in-recipe'));
    assert.match(result.issues.find((i) => i.code === 'block-missing').message, /1 × cliffhanger_card/);
    assert.equal(result.deviations, codes(result, 'deviation').length);
    assert.ok(!codes(result, 'error').includes('block-missing'));
  });

  it('refuses brand parameters out of bounds and a changed brand layer; the recipe parameter is a deviation', async () => {
    const result = await check((docs) => {
      docs.extensions['bc-2'].parameters = { lines: ['A', 'B', 'C'] };
      docs.extensions['wipe-1'].parameters = {};
      docs.vendored = [{ path: 'extensions/brand-pack/brand.json', same: false, packVersion: brand.version }];
      return docs;
    });
    const errors = codes(result, 'error');
    for (const code of ['brand-parameters', 'brand-pack-modified']) assert.ok(errors.includes(code), `${code} in ${errors}`);
    assert.match(result.issues.find((i) => i.code === 'brand-parameters').message, /bc-2 \(band_card\): parameters\.lines must list 1–2 lines/);
    assert.match(result.issues.find((i) => i.code === 'recipe-parameters' && i.severity === 'deviation').message, /sets parameters\.a/);
    // an older vendored pack is a warning (vendor again), not a violation
    const old = await check((docs) => ({ ...docs, vendored: [{ path: 'extensions/brand-pack/lib/blocks.mjs', same: false, packVersion: '0.4.0' }] }));
    assert.deepEqual(codes(old, 'error'), []);
    assert.ok(codes(old, 'warning').includes('brand-pack-outdated'));
  });

  it('reports order, hook and end of the format as deviations', async () => {
    const result = await check((docs) => {
      const clips = docs.timeline.video[0].clips;
      const sting = clips.find((c) => c.extensionId === 'sting');
      const starter = clips.find((c) => c.extensionId === 'bc-starter');
      // a band card in the cold open, the endcard not last
      [sting.start, starter.start] = [starter.start, sting.start - 1];
      clips.find((c) => c.extensionId === 'endcard').start -= 400;
      return docs;
    });
    const deviations = codes(result, 'deviation');
    for (const code of ['recipe-order', 'hook-block', 'recipe-end']) assert.ok(deviations.includes(code), `${code} in ${deviations}`);
    // only the chapter list breaks (a chapter got shorter than 10 s), the recipe deviations do not block
    assert.deepEqual(codes(result, 'error'), ['chapters-short']);
  });

  it('keeps the thumbnail off the timeline and pending until the editor chose the frame; done needs the reviews', async () => {
    const result = await check((docs) => {
      docs.extensions.thumb.parameters = { headline: 'Who is next?', candidates: [{ sourceId: 'a-1', in: '1' }, { sourceId: 'a-1', in: '2' }] };
      return docs;
    });
    assert.equal(result.valid, true);
    assert.equal(result.ready, false);
    assert.deepEqual(codes(result, 'pending'), ['thumbnail-not-chosen']);
    const subjects = (thumbnail) => ({ subjects: { editorial: { status: 'approved' }, 'captions-text': { status: 'not-required' }, preview: { status: 'approved' }, final: { status: 'approved' }, thumbnail: { status: thumbnail }, 'duration-exception': { status: 'not-required' } } });
    const open = await check((docs) => ({ ...docs, reviews: subjects('missing') }));
    assert.equal(open.done, false);
    assert.match(open.issues.find((i) => i.code === 'not-done').message, /thumbnail \(missing\)/);
    assert.equal((await check((docs) => ({ ...docs, reviews: subjects('approved') }))).done, true);
  });

  it('reports missing material before the draft: unchecked is pending, hard needs are deviations, recommended ones hints', async () => {
    const unchecked = await check((docs) => ({ ...docs, material: null }));
    assert.deepEqual(codes(unchecked, 'pending'), ['material-unchecked']);
    const result = await check((docs) => ({
      ...docs,
      material: { schemaVersion: 1, kind: 'darkmind-material', needs: [{ needId: 'starter-question', status: 'missing', note: 'no selfie' }, { needId: 'reserve', status: 'covered', sources: ['x'] }] },
    }));
    assert.deepEqual(codes(result, 'deviation').sort(), ['material-missing', 'material-missing']);
    assert.ok(codes(result, 'warning').includes('material-unknown-need'));
    assert.match(result.issues.find((i) => i.need === 'starter-question').message, /missing: no selfie/);
    assert.deepEqual(result.material.map((m) => [m.id, m.status]), [['starter-question', 'missing'], ['links', 'unrecorded']]);
    const waived = await check((docs) => ({ ...docs, material: { ...docs.material, needs: [{ needId: 'starter-question', status: 'waived', note: 'editor: start with a Loud Society question' }, { needId: 'links', status: 'partial' }] } }));
    assert.deepEqual(codes(waived, 'hint'), ['material-waived']);
    assert.deepEqual(codes(waived, 'deviation'), ['material-partial']);
    assert.equal(waived.valid, true);
  });

  it('reports captions in another style than the recipe as a deviation', async () => {
    const result = await check((docs) => ({ ...docs, captions: { style: 'plain', captions: [{ id: 'c1', start: 0, end: 10, text: 'Hi' }] } }));
    assert.deepEqual(codes(result, 'error'), []);
    assert.deepEqual(codes(result, 'deviation'), ['captions-style']);
  });

  it('runs named checks by the level of their rule: hard → deviation, recommended → hint', async () => {
    const withRule = (level) => ({ ...recipe, structure: { ...recipe.structure, blocks: { ...recipe.structure.blocks, lower_third: { use: 'optional' } } }, rules: [{ id: 'double', text: 'two people', level, check: { kind: 'machine', id: 'lower-third-people', params: { people: 2 } } }] });
    const mutate = (docs) => {
      docs.extensions.lt = { ...docs.extensions['fc-transition'], id: 'lt', command: { program: 'node', args: ['extensions/brand-pack/lib/render.mjs', 'extensions/brand-pack/blocks/lower_third/scene.html'] }, parameters: { people: [{ name: 'A' }] } };
      const clip = docs.timeline.video[0].clips.find((c) => c.extensionId === 'fc-transition');
      docs.timeline.video.push({ id: 'g1', role: 'graphics', clips: [{ ...clip, id: 'x-lt', extensionId: 'lt' }] });
      return docs;
    };
    const hard = checkProject(brand, withRule('hard'), mutate(await loadProjectDocs(root, PACK)));
    assert.ok(hard.issues.some((i) => i.code === 'lower-third-people' && i.severity === 'deviation' && i.rule === 'double'));
    const soft = checkProject(brand, withRule('recommended'), mutate(await loadProjectDocs(root, PACK)));
    assert.ok(soft.issues.some((i) => i.code === 'lower-third-people' && i.severity === 'hint'));
  });

  it('derives a recipe skeleton from the project: structure from the blocks, everything else marked TODO', async () => {
    const docs = await loadProjectDocs(root, PACK);
    const { recipe: derived, todo, lengthSeconds } = deriveRecipe(brand, docs, { id: 'nei-copy' });
    assert.equal(derived.meta.id, 'nei-copy');
    assert.equal(derived.technical.profile, 'landscape');
    assert.ok(lengthSeconds > 100);
    assert.ok(derived.technical.duration.minSeconds < lengthSeconds && derived.technical.duration.maxSeconds > lengthSeconds);
    assert.deepEqual(derived.structure.order, ['logo_sting', 'format_card', 'band_card', 'cliffhanger_card', 'loud_sounds', 'logo_end', 'endcard']);
    assert.equal(derived.structure.endsWith, 'endcard');
    assert.deepEqual(derived.structure.hook, { untilBlock: 'logo_sting', forbidden: ['band_card', 'format_card'], note: derived.structure.hook.note });
    assert.deepEqual(derived.structure.blocks.band_card, { use: 'required', min: 3 });
    assert.deepEqual(derived.structure.blocks.thumbnail, { use: 'required', min: 1, max: 1, still: true });
    assert.deepEqual(derived.structure.blocks.chevron_wipe, { use: 'optional' });
    assert.equal(derived.technical.deliverables.thumbnail, true);
    assert.equal(derived.structure.sections[0].id, 'cold-open');
    assert.ok(todo.includes('concept.idea') && todo.includes('meta.title'));
    assert.match(derived.concept.idea, /^TODO: /);
    // the project checks against its own skeleton without deviations
    const self = checkProject(brand, derived, { ...docs, project: { ...docs.project, duration: derived.technical.duration, recipe: { ...docs.project.recipe, id: 'nei-copy' } } });
    assert.deepEqual(codes(self, 'error'), []);
    assert.deepEqual(codes(self, 'deviation'), []);
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
