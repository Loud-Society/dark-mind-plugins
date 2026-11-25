// Dark Mind brand pack – format recipes (doc/mvp/FORMAT_RECIPES.md): pure check of a cut project against its recipe
// (the document frozen in recipe.lock.json, kind darkmind-format-recipe), the project.json fields a recipe sets and a
// recipe skeleton derived from a project. No I/O: darkmind-agent recipe loads the documents. The format contract itself
// (references, frame arithmetic, gaps …) stays with `darkmind-agent validate`.
//
// Severities: error – brand pack or format contract broken (blocking: brand parameters, changed brand layer, loudness
// step, profile, still image on a track …); deviation – the project differs from the recipe (structure, counts, order,
// hook, end, hard rules): the recipe is a base pattern and the editor may ask for it, so it is reported, never blocked;
// pending – valid but not finished; warning – allowed, with attention; hint – a recommended rule is not followed.

import { BLOCKS, STILL_BLOCKS, blockOutput, rangeFrames } from './blocks.mjs';
import { RECIPE_CHECKS } from './catalog.mjs';
import { chapterList } from './chapters.mjs';
import { parseFps } from './layout.mjs';
import { preflight } from './render.mjs';

export const RECIPE_KIND = 'darkmind-format-recipe';
const BRAND_COMMAND = /^extensions\/brand-pack\/blocks\/([a-z0-9_]+)\/(scene\.html|block\.json)$/;
const TRANSITIONS = ['chevron_wipe', 'glitch_flash'];

/** Brand block of an extension (from its command), or null for episode-layer extensions. */
export function brandBlockOf(extension) {
  const args = extension?.command?.args ?? [];
  if (extension?.command?.program !== 'node' || args[0] !== 'extensions/brand-pack/lib/render.mjs') return null;
  const match = BRAND_COMMAND.exec(String(args[1] ?? ''));
  return match && BLOCKS.includes(match[1]) ? match[1] : null;
}

/**
 * The check model of a recipe document: { id, profile, duration, captions, music, blocks, groups, order, endsWith,
 * hook: { until, seconds, forbidden } | null, checks: [{ id, params, level, rule }], chapters, done: { reviews } }.
 */
export function recipeModel(recipe) {
  const { structure, technical } = recipe;
  const hook = structure.hook ? { until: structure.hook.untilBlock ?? null, seconds: structure.hook.untilSeconds ?? null, forbidden: structure.hook.forbidden ?? [] } : null;
  return {
    id: recipe.meta.id,
    profile: technical.profile,
    duration: { minSeconds: technical.duration.minSeconds, maxSeconds: technical.duration.maxSeconds },
    captions: { styles: technical.captions.styles, required: technical.captions.required },
    music: { slot: technical.music.slot },
    blocks: structure.blocks,
    groups: structure.groups ?? [],
    order: structure.order ?? [],
    endsWith: structure.endsWith ?? null,
    hook,
    checks: (recipe.rules ?? []).filter((r) => r.check.kind === 'machine').map((r) => ({ id: r.check.id, params: r.check.params ?? {}, level: r.level, rule: r.id })),
    chapters: technical.deliverables.chapters ? { ...technical.deliverables.chapters } : { required: false, derive: null },
    done: { reviews: recipe.review.done },
  };
}

/** What a recipe writes into project.json: output profile, duration frame, the recipe reference and the loudness step. */
export function recipeProjectFields(brand, recipe, reference) {
  const p = brand.profiles[recipe.technical.profile];
  if (!p) throw new Error(`brand pack ${brand.version} has no profile "${recipe.technical.profile}"`);
  const { integratedLufs, toleranceLu, truePeakDbtp } = brand.loudness;
  return {
    output: { width: p.width, height: p.height, fps: p.fps, sampleRate: 48000 },
    duration: { minSeconds: recipe.technical.duration.minSeconds, maxSeconds: recipe.technical.duration.maxSeconds },
    recipe: reference,
    audioMaster: { integratedLufs, toleranceLu, truePeakDbtp, ducking: { ...brand.blocks.audio_master.ducking } },
  };
}

const sameJson = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/**
 * Clips of the timeline with their brand block: [{ track, role, kind: 'video'|'audio', clip, block, start, end }].
 * `extensions` maps extension id → { extension, block }.
 */
export function placedClips(timeline, extensions, fps) {
  const placed = [];
  for (const kind of ['video', 'audio']) {
    for (const track of timeline?.[kind] ?? []) {
      for (const clip of track.clips ?? []) {
        const block = clip.extensionId ? extensions[clip.extensionId]?.block ?? null : null;
        placed.push({ track: track.id, role: track.role, kind, clip, block, start: clip.start, end: clip.start + rangeFrames(clip.in, clip.out, fps) });
      }
    }
  }
  return placed.sort((a, b) => a.start - b.start || (a.kind === b.kind ? 0 : a.kind === 'video' ? -1 : 1));
}

/** End of the picture: the last video clip or gap (frames). */
export function pictureEnd(placed, timeline) {
  return Math.max(0, ...placed.filter((p) => p.kind === 'video').map((p) => p.end), ...(timeline?.gaps ?? []).map((g) => g.end));
}

/** Extensions of a project with their brand block: { id → { extension, block } }. */
export function blocksOf(docs) {
  return Object.fromEntries(Object.entries(docs.extensions ?? {}).map(([id, extension]) => [id, { extension, block: brandBlockOf(extension) }]));
}

/** Uses of a brand block's extension on the timeline (video clips, audio clips for sound-only blocks). */
function usesOf(brand, placed, extId, block, parameters) {
  return placed.filter((p) => p.clip.extensionId === extId && (blockOutput(brand, block, parameters ?? {}).video ? p.kind === 'video' : p.kind === 'audio'));
}

/** The YouTube chapter list of a project (recipe document). */
export function projectChapters(recipe, docs) {
  const model = recipeModel(recipe);
  const extensions = blocksOf(docs);
  const fps = docs.project.output.fps;
  const placed = placedClips(docs.timeline, extensions, fps);
  return chapterList({ recipe: model, placed, extensions, chapters: docs.chapters, fps, end: pictureEnd(placed, docs.timeline) });
}

/**
 * Checks a project against its recipe document. `docs` = { project, timeline, captions, extensions: { id →
 * extension.json }, chapters (chapters.json or null), vendored: [{ path, same, packVersion }], reviews (review status
 * or null) }. Returns { recipe, valid, ready, done, deviations, blocks, durationSeconds, chapters, editorial, issues }.
 */
export function checkProject(brand, recipe, docs) {
  const issues = [];
  const add = (severity, code, message, extra = {}) => issues.push({ severity, code, message, ...extra });
  const model = recipeModel(recipe);
  const { project, timeline, captions } = docs;
  const id = model.id;

  // --- recipe reference, profile, duration frame, loudness step ------------------------------------------------
  const expected = recipeProjectFields(brand, recipe, project.recipe ?? null);
  if (project.recipe?.id !== id) add('error', 'recipe-mismatch', `project.json recipe is ${project.recipe ? `"${project.recipe.id}"` : 'null'}, checked against "${id}" (apply the recipe with darkmind-agent recipe)`);
  const out = project.output ?? {};
  if (out.width !== expected.output.width || out.height !== expected.output.height || parseFps(out.fps) !== parseFps(expected.output.fps)) {
    add('error', 'recipe-profile', `${id} renders ${expected.output.width} × ${expected.output.height} at ${expected.output.fps} fps (profile ${model.profile}); the project renders ${out.width} × ${out.height} at ${out.fps}`);
  }
  if (!sameJson(project.duration ?? null, expected.duration)) add('error', 'recipe-duration', `the duration frame of ${id} is ${model.duration.minSeconds}–${model.duration.maxSeconds} s; project.json has ${project.duration ? `${project.duration.minSeconds}–${project.duration.maxSeconds} s` : 'none'} (outside the frame the editor grants a duration exception – never change the frame)`);
  const am = project.audioMaster;
  if (!am) add('error', 'audio-master-missing', 'audio_master is part of every brand project: run add-block audio_master (or apply the recipe again)');
  else if (am.integratedLufs !== brand.loudness.integratedLufs || am.truePeakDbtp !== brand.loudness.truePeakDbtp || am.toleranceLu !== brand.loudness.toleranceLu) {
    add('error', 'audio-master-limits', `audioMaster must target ${brand.loudness.integratedLufs} LUFS ±${brand.loudness.toleranceLu} LU, ${brand.loudness.truePeakDbtp} dBTP (house norm T5)`);
  }

  // --- brand pack unchanged (T6: the brand layer is fixed) -------------------------------------------------------
  for (const file of docs.vendored ?? []) {
    if (file.same) continue;
    if (file.packVersion === brand.version) add('error', 'brand-pack-modified', `${file.path} differs from brand pack ${brand.version}: the brand layer is not edited in projects – vendor it again with add-block --force`);
    else add('warning', 'brand-pack-outdated', `${file.path} comes from brand pack ${file.packVersion ?? 'unknown'}, current is ${brand.version}: vendor the blocks again with add-block --force`);
  }

  // --- blocks: extensions, placement, counts, parameters -----------------------------------------------------------
  const fps = out.fps ?? expected.output.fps;
  const extensions = blocksOf(docs);
  const placed = placedClips(timeline, extensions, fps);
  const counts = {};
  for (const [extId, { extension, block }] of Object.entries(extensions)) {
    if (!block) {
      add('warning', 'episode-layer', `extension ${extId} is no brand block (episode layer, T6): allowed as a free extension; it must not imitate the brand layer`, { extension: extId });
      continue;
    }
    const spec = model.blocks[block];
    if (!spec) add('deviation', 'block-not-in-recipe', `${block} (extension ${extId}) is not part of ${id} (recipe blocks: ${Object.keys(model.blocks).join(', ')})`, { extension: extId });
    for (const problem of preflight(brand, block, extension.output ?? {}, extension.parameters ?? {})) add('error', 'brand-parameters', `${extId} (${block}): ${problem}`, { extension: extId });
    for (const key of spec?.parameters?.required ?? []) if (extension.parameters?.[key] === undefined) add('deviation', 'recipe-parameters', `${extId} (${block}): ${id} sets parameters.${key}`, { extension: extId });
    if (extension.version !== undefined && extension.version !== brand.version) add('warning', 'brand-pack-outdated', `${extId} was vendored with brand pack ${extension.version}, current is ${brand.version}: add-block --force`, { extension: extId });
    const uses = usesOf(brand, placed, extId, block, extension.parameters);
    if (STILL_BLOCKS.includes(block)) {
      counts[block] = (counts[block] ?? 0) + 1;
      if (extension.parameters?.candidates) add('pending', 'thumbnail-not-chosen', `${extId}: the editor has not chosen the thumbnail frame yet (candidates); add-block ${block} --force with "frame"`, { extension: extId });
      if (uses.length) add('error', 'still-on-timeline', `${extId} is a still image and never lies on a track`, { extension: extId });
      continue;
    }
    if (!uses.length) add('error', 'block-unplaced', `${extId} (${block}) is not on the timeline: place the clip(s) add-block printed, or remove the extension`, { extension: extId });
    counts[block] = (counts[block] ?? 0) + uses.length;
  }
  for (const [block, spec] of Object.entries(model.blocks)) {
    const n = counts[block] ?? 0;
    const min = spec.use === 'required' ? (spec.min ?? 1) : 0;
    if (n < min) add('deviation', 'block-missing', `${id} has ${min}${spec.max === min ? '' : '+'} × ${block}${spec.role ? ` (${spec.role})` : ''}; the project has ${n}`);
    if (spec.max !== undefined && n > spec.max) add('deviation', 'block-count', `${id} has at most ${spec.max} × ${block}; the project has ${n}`);
  }
  for (const group of model.groups) {
    const n = group.oneOf.reduce((sum, block) => sum + (counts[block] ?? 0), 0);
    if (n !== 1) add('deviation', 'block-group', `${id} has exactly one of ${group.oneOf.join(', ')}${group.note ? ` (${group.note})` : ''}; the project has ${n}`);
  }

  // --- order, hook, end ----------------------------------------------------------------------------------------
  const first = (block) => placed.find((p) => p.block === block && (p.kind === 'video' || !placed.some((q) => q.block === block && q.kind === 'video')));
  const present = model.order.map((block) => ({ block, at: first(block) })).filter((x) => x.at);
  for (let i = 1; i < present.length; i++) {
    const before = present[i - 1];
    const now = present[i];
    if (now.at.start < before.at.start) add('deviation', 'recipe-order', `${now.block} (frame ${now.at.start}) comes before ${before.block} (frame ${before.at.start}); ${id} orders ${model.order.join(' → ')}`, { clip: now.at.clip.id });
  }
  if (model.hook) {
    const until = model.hook.until ? first(model.hook.until)?.start : Math.round((model.hook.seconds ?? 0) * parseFps(fps));
    if (until !== undefined) {
      for (const p of placed.filter((x) => x.start < until && model.hook.forbidden.includes(x.block))) add('deviation', 'hook-block', `${p.block} at frame ${p.start} lies in the hook (before frame ${until}${model.hook.until ? `, the ${model.hook.until}` : ''}); ${id} keeps ${model.hook.forbidden.join(', ')} out of the hook`, { clip: p.clip.id });
    }
  }
  const end = pictureEnd(placed, timeline);
  if (model.endsWith && counts[model.endsWith]) {
    const last = placed.filter((p) => p.block === model.endsWith && p.kind === 'video').reduce((a, b) => (b.end > (a?.end ?? -1) ? b : a), null);
    if (last && last.end !== end) add('deviation', 'recipe-end', `${id} ends with ${model.endsWith}; it ends at frame ${last.end}, the picture at ${end}`, { clip: last.clip.id });
  }

  // --- named checks (rules with a machine check) --------------------------------------------------------------------
  for (const check of model.checks) {
    const severity = check.level === 'hard' ? 'deviation' : 'hint';
    if (!RECIPE_CHECKS[check.id]) {
      add('error', 'recipe-unknown-check', `rule ${check.rule}: brand pack ${brand.version} has no check "${check.id}"`);
      continue;
    }
    if (check.id === 'lower-third-people') {
      const people = Number(check.params.people ?? 2);
      const lt = placed.find((p) => p.block === 'lower_third' && p.kind === 'video');
      const listed = lt ? extensions[lt.clip.extensionId]?.extension.parameters?.people : null;
      if (lt && (!Array.isArray(listed) || listed.length !== people)) add(severity, 'lower-third-people', `${id} (rule ${check.rule}): the first lower third introduces ${people} people together; ${lt.clip.extensionId} has ${Array.isArray(listed) ? listed.length : 0}`, { clip: lt.clip.id, rule: check.rule });
    }
  }

  // --- material needs (material.json, written by the agent after research) ------------------------------------------
  const needs = recipe.material ?? [];
  const material = [];
  if (needs.length) {
    if (!docs.material) {
      if (needs.some((n) => n.level === 'hard')) add('pending', 'material-unchecked', `${id} names material needs (${needs.map((n) => n.id).join(', ')}): compare them with the research and record the coverage in material.json – report missing hard needs to the editor before the draft`);
    } else {
      const byId = new Map((docs.material.needs ?? []).map((n) => [n.needId, n]));
      for (const need of needs) {
        const entry = byId.get(need.id);
        const severity = need.level === 'hard' ? 'deviation' : 'hint';
        const count = entry ? (entry.sources?.length ?? 0) + (entry.statements?.length ?? 0) : 0;
        material.push({ id: need.id, level: need.level, status: entry?.status ?? 'unrecorded', count });
        if (!entry) add(severity, 'material-missing', `material need "${need.id}" (${need.label}) is not recorded in material.json`, { need: need.id });
        else if (entry.status === 'missing') add(severity, 'material-missing', `material need "${need.id}" (${need.label}) is missing${entry.note ? `: ${entry.note}` : ''}`, { need: need.id });
        else if (entry.status === 'partial') add(severity, 'material-partial', `material need "${need.id}" (${need.label}) is only partly covered${entry.note ? `: ${entry.note}` : ''}`, { need: need.id });
        else if (entry.status === 'waived') add('hint', 'material-waived', `material need "${need.id}" (${need.label}) waived by the editor${entry.note ? `: ${entry.note}` : ''}`, { need: need.id });
        else if (need.min !== undefined && count < need.min) add(severity, 'material-count', `material need "${need.id}" needs ${need.min}${need.max === need.min ? '' : '+'}; material.json names ${count}`, { need: need.id });
      }
      const known = new Set(needs.map((n) => n.id));
      for (const entry of docs.material.needs ?? []) if (!known.has(entry.needId)) add('warning', 'material-unknown-need', `material.json names "${entry.needId}", which is no material need of ${id}`);
    }
  }

  // --- captions and music ----------------------------------------------------------------------------------------
  const captionList = captions?.captions ?? [];
  if (captionList.length && !model.captions.styles.includes(captions.style)) add('deviation', 'captions-style', `captions.json style "${captions.style}" is not a style of ${id} (${model.captions.styles.join(', ') || 'no captions'}); brand captions are drawn by their block, never burnt in`);
  if (model.captions.required && !captionList.length) add('deviation', 'captions-missing', `${id} has captions (${model.captions.styles.join(' or ')}); captions.json is empty`);
  if (model.music.slot !== 'optional' && placed.some((p) => p.role === 'music')) add('deviation', 'music-not-allowed', `${id} has no music slot`);
  if (placed.some((p) => p.role === 'music')) add('warning', 'music-rights', 'a music bed is on the timeline: its source and rights must be documented (T14); the brand pack ships no music');

  // --- chapters ------------------------------------------------------------------------------------------------
  let chapters = null;
  if (model.chapters?.required) {
    chapters = chapterList({ recipe: model, placed, extensions, chapters: docs.chapters, fps, end });
    for (const issue of chapters.issues) add(issue.severity, issue.code, issue.message);
  }

  // --- done: the reviews the recipe needs for "finished" -------------------------------------------------------
  let done = null;
  if (docs.reviews) {
    const subjects = docs.reviews.subjects ?? {};
    const open = model.done.reviews.filter((s) => !['approved', 'not-required'].includes(subjects[s]?.status));
    if (subjects['duration-exception'] && !['approved', 'not-required'].includes(subjects['duration-exception'].status) && !open.includes('duration-exception')) open.push('duration-exception');
    done = open.length === 0;
    if (!done) add('pending', 'not-done', `${id} is finished when these reviews are approved: ${open.map((s) => `${s} (${subjects[s]?.status ?? 'unknown'})`).join(', ')}`);
  }

  const valid = !issues.some((i) => i.severity === 'error');
  const ready = valid && !issues.some((i) => i.severity === 'pending');
  return {
    recipe: { id, version: project.recipe?.version ?? null, source: project.recipe?.source ?? null, profile: model.profile },
    valid,
    ready,
    done,
    deviations: issues.filter((i) => i.severity === 'deviation').length,
    blocks: Object.fromEntries(Object.keys(model.blocks).map((b) => [b, counts[b] ?? 0])),
    durationSeconds: end / parseFps(fps),
    chapters: chapters ? { text: chapters.text, list: chapters.list } : null,
    material,
    editorial: {
      rules: (recipe.rules ?? []).filter((r) => r.check.kind === 'editorial').map((r) => ({ id: r.id, level: r.level, text: r.text })),
      report: recipe.review.report ?? [],
    },
    issues,
  };
}

const SECTION_TITLES = {
  logo_sting: 'Sting',
  title_card: 'Title',
  format_card: 'Format card',
  band_card: 'Band card',
  lower_third: 'Who speaks',
  wordmark_flash: 'Wordmark flash',
  cliffhanger_card: 'Cliffhanger',
  animal_scream: 'Animal scream',
  loud_sounds: 'Outro sounds',
  logo_end: 'Logo end',
  endcard: 'Endcard',
};

/**
 * A recipe skeleton from a project (entry "recipe from a cut project"): profile, a duration frame around the actual
 * length, the brand blocks with their counts, sections in the order of their first appearance, hook, end, captions,
 * thumbnail and chapters. What a project cannot tell (concept, material, briefing, purposes, further rules) is marked
 * "TODO: …" for the agent and the editor – nothing of this one episode (names, quotes) belongs into a recipe.
 * Returns { recipe, todo: [paths], lengthSeconds }.
 */
export function deriveRecipe(brand, docs, { id = 'new-format', sourceProject = null } = {}) {
  const todo = [];
  const T = (where, what) => {
    todo.push(where);
    return `TODO: ${what}`;
  };
  const { project, timeline, captions } = docs;
  const fps = project.output?.fps ?? '25/1';
  const rate = parseFps(fps);
  const profile = Object.entries(brand.profiles).find(([, p]) => p.width === project.output?.width && p.height === project.output?.height && parseFps(p.fps) === rate)?.[0];
  if (!profile) throw new Error(`the project renders ${project.output?.width} × ${project.output?.height} at ${fps}: no profile of brand pack ${brand.version}`);
  const extensions = blocksOf(docs);
  const placed = placedClips(timeline, extensions, fps);
  const end = pictureEnd(placed, timeline);
  const length = end / rate;
  const counts = {};
  for (const [extId, { extension, block }] of Object.entries(extensions)) {
    if (!block) continue;
    counts[block] = (counts[block] ?? 0) + (STILL_BLOCKS.includes(block) ? 1 : usesOf(brand, placed, extId, block, extension.parameters).length);
  }
  const blocks = {};
  for (const [block, n] of Object.entries(counts).sort(([a], [b]) => a.localeCompare(b))) {
    if (!n) continue;
    blocks[block] = TRANSITIONS.includes(block) ? { use: 'optional' } : { use: 'required', min: n, ...(n === 1 ? { max: 1 } : {}) };
    if (STILL_BLOCKS.includes(block)) blocks[block].still = true;
  }

  // sections: a cold open before the first brand block, then one per first appearance of a block (transitions join
  // the section they first appear in)
  const sections = [];
  const seen = new Set();
  const timed = placed.filter((p) => p.block && blocks[p.block] && !STILL_BLOCKS.includes(p.block));
  if (timed.length && timed[0].start > 0) sections.push({ id: 'cold-open', title: 'Cold open', purpose: T('structure.sections[0].purpose', `what the first ${Math.round(timed[0].start / rate)} s show and why`), blocks: [], material: [], notes: [] });
  for (const p of timed) {
    if (seen.has(p.block)) continue;
    seen.add(p.block);
    if (TRANSITIONS.includes(p.block) && sections.length) {
      sections[sections.length - 1].blocks.push(p.block);
      continue;
    }
    sections.push({ id: p.block.replace(/_/g, '-'), title: SECTION_TITLES[p.block] ?? p.block, purpose: T(`structure.sections[${sections.length}].purpose`, `the part around the first ${p.block} (at ${Math.floor(p.start / rate)} s)`), blocks: [p.block], material: [], notes: [] });
  }
  if (!sections.length) sections.push({ id: 'main', title: 'Main part', purpose: T('structure.sections[0].purpose', 'the structure of the format'), blocks: [], material: [], notes: [] });

  const order = [];
  for (const p of timed) if (!TRANSITIONS.includes(p.block) && !order.includes(p.block) && blocks[p.block]?.use === 'required') order.push(p.block);
  const lastVideo = placed.filter((p) => p.kind === 'video' && p.end === end).pop();
  const endsWith = lastVideo?.block && blocks[lastVideo.block] ? lastVideo.block : null;
  const sting = placed.find((p) => p.block === 'logo_sting' && p.kind === 'video');
  const candidates = ['lower_third', 'title_card', 'band_card', 'format_card'].filter((b) => blocks[b] && !placed.some((p) => p.block === b && sting && p.start < sting.start));
  const hook = sting && sting.start > 0 && candidates.length ? { untilBlock: 'logo_sting', forbidden: candidates, note: T('structure.hook.note', `what the ${Math.round(sting.start / rate)} s before the sting show`) } : null;

  const style = captions?.captions?.length ? captions.style : null;
  const brandStyle = style && style !== 'plain' ? style : null;
  const lower = placed.find((p) => p.block === 'lower_third' && p.kind === 'video');
  const people = lower ? extensions[lower.clip.extensionId]?.extension.parameters?.people : null;
  const rules =
    Array.isArray(people) && people.length > 1
      ? [{ id: 'first-lower-third', text: `The first lower third introduces ${people.length} people together.`, level: 'hard', check: { kind: 'machine', id: 'lower-third-people', params: { people: people.length } } }]
      : [];
  const recipe = {
    schemaVersion: 1,
    kind: RECIPE_KIND,
    meta: { id, title: T('meta.title', 'name of the format'), summary: T('meta.summary', 'one or two sentences for the catalog'), tags: [] },
    brand: { pack: brand.id, versions: `^${brand.version}` },
    concept: { idea: T('concept.idea', 'the idea of the format (from brief.md and the editor – never the content of this one episode)'), platforms: [], references: [] },
    briefing: [],
    material: [],
    structure: { sections, blocks, groups: [], order, hook, endsWith },
    technical: {
      profile,
      duration: { minSeconds: Math.max(1, Math.floor((length * 0.75) / 5) * 5), maxSeconds: Math.max(5, Math.ceil((length * 1.25) / 5) * 5) },
      captions: { styles: brandStyle ? [brandStyle] : [], required: Boolean(brandStyle), default: brandStyle ?? 'none' },
      music: { slot: 'optional' },
      deliverables: { thumbnail: Boolean(counts.thumbnail), chapters: docs.chapters ? { required: true, derive: null } : null },
    },
    rules,
    review: { done: ['editorial', 'captions-text', 'preview', 'final', ...(counts.thumbnail ? ['thumbnail'] : [])], report: [] },
    capabilities: [],
    provenance: { origin: 'project', ...(sourceProject ? { sourceProject } : {}), testProjects: [] },
  };
  todo.push('technical.duration (±25 % around the length of this project)', 'briefing', 'material', 'rules');
  return { recipe, todo, lengthSeconds: length };
}
