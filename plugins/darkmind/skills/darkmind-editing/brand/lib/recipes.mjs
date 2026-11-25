// Dark Mind brand pack – format recipes (Phase 6 WP5): pure checks of a cut project against its recipe
// (recipes/<id>.json). No I/O: tools/recipe.mjs loads the documents. The format contract itself (references, frame
// arithmetic, gaps …) stays with `darkmind-agent validate`; this check covers what the recipe adds: profile and duration
// frame, the loudness step, mandatory and allowed blocks, their order, the hook, brand-layer parameters (T6), the
// unchanged brand pack, captions style, the thumbnail and the chapter list. Severity like validate: error (breaks the
// recipe), pending (valid but not finished), warning (allowed, with attention).

import { BLOCKS, STILL_BLOCKS, blockOutput, rangeFrames } from './blocks.mjs';
import { chapterList } from './chapters.mjs';
import { parseFps, profileOf } from './layout.mjs';
import { preflight } from './render.mjs';

export const RECIPE_KIND = 'darkmind-brand-recipe';
const BRAND_COMMAND = /^extensions\/brand-pack\/blocks\/([a-z0-9_]+)\/(scene\.html|block\.json)$/;

/** Brand block of an extension (from its command), or null for episode-layer extensions. */
export function brandBlockOf(extension) {
  const args = extension?.command?.args ?? [];
  if (extension?.command?.program !== 'node' || args[0] !== 'extensions/brand-pack/lib/render.mjs') return null;
  const match = BRAND_COMMAND.exec(String(args[1] ?? ''));
  return match && BLOCKS.includes(match[1]) ? match[1] : null;
}

/** Structural check of a recipe document (the shipped recipes are tested with it). */
export function checkRecipe(brand, recipe) {
  const issues = [];
  if (recipe?.kind !== RECIPE_KIND || recipe.schemaVersion !== 1) issues.push(`kind must be "${RECIPE_KIND}" with schemaVersion 1`);
  if (!brand.profiles[recipe?.profile]) issues.push(`unknown profile "${recipe?.profile}"`);
  const d = recipe?.duration;
  if (!(d && d.minSeconds > 0 && d.maxSeconds > d.minSeconds)) issues.push('duration needs minSeconds < maxSeconds');
  for (const [block, spec] of Object.entries(recipe?.blocks ?? {})) {
    if (!BLOCKS.includes(block)) issues.push(`unknown block "${block}"`);
    if (!['required', 'optional'].includes(spec.use)) issues.push(`${block}: use must be "required" or "optional"`);
    if (STILL_BLOCKS.includes(block) !== Boolean(spec.still)) issues.push(`${block}: still must be ${STILL_BLOCKS.includes(block)}`);
    if (spec.min !== undefined && spec.max !== undefined && spec.min > spec.max) issues.push(`${block}: min > max`);
  }
  for (const block of [...(recipe?.order ?? []), recipe?.endsWith, recipe?.hook?.until].filter(Boolean)) if (!recipe.blocks?.[block]) issues.push(`"${block}" is used in order/endsWith/hook but not part of the blocks`);
  for (const group of recipe?.groups ?? []) for (const block of group.oneOf) if (!recipe.blocks?.[block]) issues.push(`group ${group.id}: "${block}" is not part of the blocks`);
  for (const style of recipe?.captions?.styles ?? []) if (!['brand-word', 'brand-phrase', 'brand-16x9'].includes(style)) issues.push(`unknown caption style "${style}"`);
  return issues;
}

/** What `apply` writes into project.json: output profile, duration frame, recipe reference and the loudness step. */
export function recipeProjectFields(brand, recipe) {
  const p = brand.profiles[recipe.profile];
  const { integratedLufs, toleranceLu, truePeakDbtp } = brand.loudness;
  return {
    output: { width: p.width, height: p.height, fps: p.fps, sampleRate: 48000 },
    duration: { minSeconds: recipe.duration.minSeconds, maxSeconds: recipe.duration.maxSeconds },
    recipe: { id: recipe.id, version: brand.version },
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

/**
 * Checks a project against its recipe. `docs` = { project, timeline, captions, extensions: { id → extension.json },
 * chapters (chapters.json or null), vendored: [{ path, same, packVersion }] (files of extensions/brand-pack compared with
 * the pack), reviews (review status or null) }. Returns { recipe, issues, valid, ready, done, blocks, chapters }.
 */
export function checkProject(brand, recipe, docs) {
  const issues = [];
  const add = (severity, code, message, extra = {}) => issues.push({ severity, code, message, ...extra });
  const { project, timeline, captions } = docs;

  // --- recipe reference, profile, duration frame, loudness step ------------------------------------------------
  const expected = recipeProjectFields(brand, recipe);
  if (project.recipe?.id !== recipe.id) add('error', 'recipe-mismatch', `project.json recipe is ${project.recipe ? `"${project.recipe.id}"` : 'null'}, checked against "${recipe.id}" (run: recipe.mjs apply ${recipe.id})`);
  else if (String(project.recipe.version) !== brand.version) add('warning', 'recipe-version', `project.json recipe version ${project.recipe.version} differs from brand pack ${brand.version}; apply the recipe again and re-vendor the blocks (add-block --force)`);
  const out = project.output ?? {};
  if (out.width !== expected.output.width || out.height !== expected.output.height || parseFps(out.fps) !== parseFps(expected.output.fps)) {
    add('error', 'recipe-profile', `${recipe.id} renders ${expected.output.width} × ${expected.output.height} at ${expected.output.fps} fps (profile ${recipe.profile}); the project renders ${out.width} × ${out.height} at ${out.fps}`);
  }
  if (!sameJson(project.duration ?? null, expected.duration)) add('error', 'recipe-duration', `the duration frame of ${recipe.id} is ${recipe.duration.minSeconds}–${recipe.duration.maxSeconds} s; project.json has ${project.duration ? `${project.duration.minSeconds}–${project.duration.maxSeconds} s` : 'none'} (outside the frame the editor grants a duration exception – never change the frame)`);
  const am = project.audioMaster;
  if (!am) add('error', 'audio-master-missing', 'audio_master is part of every recipe: run add-block audio_master (or recipe.mjs apply)');
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
  const extensions = {};
  for (const [id, extension] of Object.entries(docs.extensions ?? {})) extensions[id] = { extension, block: brandBlockOf(extension) };
  const placed = placedClips(timeline, extensions, fps);
  const counts = {};
  for (const [id, { extension, block }] of Object.entries(extensions)) {
    if (!block) {
      add('warning', 'episode-layer', `extension ${id} is no brand block (episode layer, T6): allowed as a free extension; it must not imitate the brand layer`, { extension: id });
      continue;
    }
    const spec = recipe.blocks[block];
    if (!spec) {
      add('error', 'block-not-in-recipe', `${block} (extension ${id}) is not part of ${recipe.id} (allowed: ${Object.keys(recipe.blocks).join(', ')})`, { extension: id });
      continue;
    }
    const problems = preflight(brand, block, extension.output ?? {}, extension.parameters ?? {});
    for (const problem of problems) add('error', 'brand-parameters', `${id} (${block}): ${problem}`, { extension: id });
    for (const key of spec.parameters?.required ?? []) if (extension.parameters?.[key] === undefined) add('error', 'recipe-parameters', `${id} (${block}): ${recipe.id} needs parameters.${key}`, { extension: id });
    if (extension.version !== undefined && extension.version !== brand.version) add('warning', 'brand-pack-outdated', `${id} was vendored with brand pack ${extension.version}, current is ${brand.version}: add-block --force`, { extension: id });
    const uses = placed.filter((p) => p.clip.extensionId === id && (blockOutput(brand, block, extension.parameters ?? {}).video ? p.kind === 'video' : p.kind === 'audio'));
    if (spec.still) {
      counts[block] = (counts[block] ?? 0) + 1;
      if (extension.parameters?.candidates) add('pending', 'thumbnail-not-chosen', `${id}: the editor has not chosen the thumbnail frame yet (candidates); add-block ${block} --force with "frame"`, { extension: id });
      if (uses.length) add('error', 'still-on-timeline', `${id} is a still image and never lies on a track`, { extension: id });
      continue;
    }
    if (!uses.length) add('error', 'block-unplaced', `${id} (${block}) is not on the timeline: place the clip(s) add-block printed, or remove the extension`, { extension: id });
    counts[block] = (counts[block] ?? 0) + uses.length;
  }
  for (const [block, spec] of Object.entries(recipe.blocks)) {
    const n = counts[block] ?? 0;
    if (spec.use === 'required' && n < (spec.min ?? 1)) add('error', 'block-missing', `${recipe.id} needs ${spec.min ?? 1}${spec.max === spec.min ? '' : '+'} × ${block}${spec.role ? ` (${spec.role})` : ''}; the project has ${n}`);
    if (spec.max !== undefined && n > spec.max) add('error', 'block-count', `${recipe.id} allows at most ${spec.max} × ${block}; the project has ${n}`);
  }
  for (const group of recipe.groups ?? []) {
    const n = group.oneOf.reduce((sum, block) => sum + (counts[block] ?? 0), 0);
    if (n !== 1) add('error', 'block-group', `${recipe.id} needs exactly one of ${group.oneOf.join(', ')}${group.note ? ` (${group.note})` : ''}; the project has ${n}`);
  }

  // --- order, hook, end ----------------------------------------------------------------------------------------
  const first = (block) => placed.find((p) => p.block === block && (p.kind === 'video' || !placed.some((q) => q.block === block && q.kind === 'video')));
  const present = (recipe.order ?? []).map((block) => ({ block, at: first(block) })).filter((x) => x.at);
  for (let i = 1; i < present.length; i++) {
    const before = present[i - 1];
    const now = present[i];
    if (now.at.start < before.at.start) add('error', 'recipe-order', `${now.block} (frame ${now.at.start}) comes before ${before.block} (frame ${before.at.start}); ${recipe.id} orders ${recipe.order.join(' → ')}`, { clip: now.at.clip.id });
  }
  if (recipe.hook) {
    const until = recipe.hook.until ? first(recipe.hook.until)?.start : Math.round((recipe.hook.seconds ?? 0) * parseFps(fps));
    if (until !== undefined) {
      for (const p of placed.filter((x) => x.start < until && (recipe.hook.forbidden ?? []).includes(x.block))) add('error', 'hook-block', `${p.block} at frame ${p.start} lies in the hook (before frame ${until}${recipe.hook.until ? `, the ${recipe.hook.until}` : ''}); ${recipe.id} keeps ${recipe.hook.forbidden.join(', ')} out of the hook`, { clip: p.clip.id });
    }
  }
  const end = pictureEnd(placed, timeline);
  if (recipe.endsWith && counts[recipe.endsWith]) {
    const last = placed.filter((p) => p.block === recipe.endsWith && p.kind === 'video').reduce((a, b) => (b.end > (a?.end ?? -1) ? b : a), null);
    if (last && last.end !== end) add('error', 'recipe-end', `${recipe.id} ends with ${recipe.endsWith}; it ends at frame ${last.end}, the picture at ${end}`, { clip: last.clip.id });
  }

  // --- named checks ------------------------------------------------------------------------------------------------
  if ((recipe.checks ?? []).includes('double-lower-third')) {
    const lt = placed.find((p) => p.block === 'lower_third' && p.kind === 'video');
    const people = lt ? extensions[lt.clip.extensionId]?.extension.parameters?.people : null;
    if (lt && (!Array.isArray(people) || people.length !== 2)) add('error', 'double-lower-third', `${recipe.id}: the first lower third introduces guest and host together (people: [guest, host]); ${lt.clip.extensionId} has ${Array.isArray(people) ? people.length : 0}`, { clip: lt.clip.id });
  }

  // --- captions ------------------------------------------------------------------------------------------------
  const captionList = captions?.captions ?? [];
  if (captionList.length && !recipe.captions.styles.includes(captions.style)) add('error', 'captions-style', `captions.json style "${captions.style}" is not a style of ${recipe.id} (${recipe.captions.styles.join(', ')}); brand captions are drawn by their block, never burnt in`);
  if (recipe.captions.required && !captionList.length) add('pending', 'captions-missing', `${recipe.id} has captions (${recipe.captions.styles.join(' or ')}); captions.json is empty`);
  if (recipe.music?.slot !== 'optional' && placed.some((p) => p.role === 'music')) add('error', 'music-not-allowed', `${recipe.id} has no music slot`);
  if (placed.some((p) => p.role === 'music')) add('warning', 'music-rights', 'a music bed is on the timeline: its source and rights must be documented (T14); the template ships no music');

  // --- chapters ------------------------------------------------------------------------------------------------
  let chapters = null;
  if (recipe.chapters?.required) {
    chapters = chapterList({ recipe, placed, extensions, chapters: docs.chapters, fps, end });
    for (const issue of chapters.issues) add(issue.severity, issue.code, issue.message);
  }

  // --- done: the reviews the recipe needs for "finished" -------------------------------------------------------
  let done = null;
  if (docs.reviews) {
    const subjects = docs.reviews.subjects ?? {};
    const open = recipe.done.reviews.filter((s) => !['approved', 'not-required'].includes(subjects[s]?.status));
    if (subjects['duration-exception'] && !['approved', 'not-required'].includes(subjects['duration-exception'].status)) open.push('duration-exception');
    done = open.length === 0;
    if (!done) add('pending', 'not-done', `${recipe.id} is finished when these reviews are approved: ${open.map((s) => `${s} (${subjects[s]?.status ?? 'unknown'})`).join(', ')}`);
  }

  const valid = !issues.some((i) => i.severity === 'error');
  const ready = valid && !issues.some((i) => i.severity === 'pending');
  return {
    recipe: { id: recipe.id, version: brand.version, profile: recipe.profile },
    valid,
    ready,
    done,
    blocks: Object.fromEntries(Object.keys(recipe.blocks).map((b) => [b, counts[b] ?? 0])),
    durationSeconds: end / parseFps(fps),
    chapters: chapters ? { text: chapters.text, list: chapters.list } : null,
    issues,
  };
}
