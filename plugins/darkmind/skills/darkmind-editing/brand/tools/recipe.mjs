#!/usr/bin/env node
// Dark Mind brand pack – format recipes (Phase 6 WP5).
//
//   node <skill>/brand/tools/recipe.mjs list
//   node <skill>/brand/tools/recipe.mjs show <recipe>
//   node <skill>/brand/tools/recipe.mjs apply <recipe> [--project <dir>] [--force]
//   node <skill>/brand/tools/recipe.mjs check [--project <dir>] [--reviews <review-status.json>]
//   node <skill>/brand/tools/recipe.mjs chapters [--project <dir>] [--out <file>]
//
// apply writes project.json: output profile, duration frame, recipe { id, version } and audioMaster (the recipe sets
// them; never edit them by hand). check validates the project against its recipe (mandatory and allowed blocks, order,
// hook, brand-layer parameters, unchanged brand pack, captions style, thumbnail, chapters; with --reviews – the output
// of `darkmind-agent review status --json` – also the "done" state) and exits 1 on errors. chapters prints the YouTube
// chapter list of the 16:9 recipes. Nothing here renders or changes the timeline.

import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkProject, checkRecipe, placedClips, pictureEnd, recipeProjectFields, brandBlockOf } from '../lib/recipes.mjs';
import { chapterList } from '../lib/chapters.mjs';

const PACK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const json = (value) => `${JSON.stringify(value, null, 2)}\n`;
const sha = (buffer) => createHash('sha256').update(buffer).digest('hex');

function option(args, name) {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
}

async function readJson(file, what, { optional = false } = {}) {
  try {
    return JSON.parse((await fs.readFile(file, 'utf8')).replace(/^\uFEFF/, ''));
  } catch (error) {
    if (optional && error.code === 'ENOENT') return null;
    throw new Error(`${what} (${file}) cannot be read: ${error.code === 'ENOENT' ? 'missing' : error.message}`);
  }
}

export async function listRecipes() {
  const names = (await fs.readdir(path.join(PACK, 'recipes'))).filter((n) => n.endsWith('.json')).sort();
  return Promise.all(names.map((n) => readJson(path.join(PACK, 'recipes', n), n)));
}

export async function loadRecipe(id) {
  if (!/^[a-z0-9-]{1,40}$/.test(String(id))) throw new Error(`invalid recipe id "${id}"`);
  const recipe = await readJson(path.join(PACK, 'recipes', `${id}.json`), `recipe ${id}`).catch(async () => {
    throw new Error(`unknown recipe "${id}" (recipes: ${(await listRecipes()).map((r) => r.id).join(', ')})`);
  });
  return recipe;
}

async function walk(dir, base = dir) {
  const out = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true }).catch(() => [])) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full, base)));
    else out.push(path.relative(base, full).split(path.sep).join('/'));
  }
  return out;
}

/** Vendored brand pack code and tokens compared with this pack (assets are not compared: they come from brand-assets). */
async function vendoredFiles(root) {
  const vendor = path.join(root, 'extensions', 'brand-pack');
  const vendoredBrand = await readJson(path.join(vendor, 'brand.json'), 'vendored brand.json', { optional: true });
  const files = (await walk(vendor)).filter((rel) => rel === 'brand.json' || rel.startsWith('lib/') || rel.startsWith('blocks/'));
  const result = [];
  for (const rel of files) {
    const mine = await fs.readFile(path.join(vendor, ...rel.split('/')));
    const theirs = await fs.readFile(path.join(PACK, ...rel.split('/'))).catch(() => null);
    result.push({ path: `extensions/brand-pack/${rel}`, same: Boolean(theirs) && sha(mine) === sha(theirs), packVersion: vendoredBrand?.version ?? null });
  }
  return result;
}

/** Loads everything the recipe check reads. */
export async function loadProject(root) {
  const project = await readJson(path.join(root, 'project.json'), 'project.json');
  const artifact = (name, fallback) => path.join(root, ...(project.artifacts?.[name] ?? fallback).split('/'));
  const timeline = await readJson(artifact('timeline', 'timeline.json'), 'timeline.json', { optional: true });
  const captions = await readJson(artifact('captions', 'captions.json'), 'captions.json', { optional: true });
  const extensions = {};
  for (const rel of project.extensions ?? []) {
    const extension = await readJson(path.join(root, ...rel.split('/')), rel);
    extensions[extension.id] = extension;
  }
  const chapters = await readJson(path.join(root, 'chapters.json'), 'chapters.json', { optional: true });
  return { project, timeline: timeline ?? { video: [], audio: [], gaps: [] }, captions, extensions, chapters, vendored: await vendoredFiles(root) };
}

async function apply(args) {
  const id = args[1];
  if (!id || id.startsWith('--')) throw new Error('usage: recipe.mjs apply <recipe> [--project <dir>] [--force]');
  const root = path.resolve(option(args, '--project') ?? process.cwd());
  const brand = await readJson(path.join(PACK, 'brand.json'), 'brand.json');
  const recipe = await loadRecipe(id);
  const project = await readJson(path.join(root, 'project.json'), 'project.json');
  const fields = recipeProjectFields(brand, recipe);
  const changesProfile = JSON.stringify(project.output) !== JSON.stringify(fields.output);
  const timeline = await readJson(path.join(root, ...(project.artifacts?.timeline ?? 'timeline.json').split('/')), 'timeline.json', { optional: true });
  const clips = [...(timeline?.video ?? []), ...(timeline?.audio ?? [])].reduce((n, t) => n + (t.clips?.length ?? 0), 0);
  if (changesProfile && clips && !args.includes('--force')) {
    throw new Error(`${recipe.id} renders ${fields.output.width} × ${fields.output.height} at ${fields.output.fps}; the timeline already has ${clips} clips for ${project.output.width} × ${project.output.height} (crops and frames would change) – start a new project, or pass --force and rebuild the timeline`);
  }
  const next = { ...project, ...fields };
  await fs.writeFile(path.join(root, 'project.json'), json(next));
  return {
    recipe: recipe.id,
    projectJson: fields,
    document: `brand/recipes/${recipe.document}`,
    next: [
      `read brand/recipes/${recipe.document} (structure, blocks, agent rules)${recipe.chain ? ` and brand/recipes/${recipe.chain.guide} (chain reconstruction)` : ''}`,
      `vendor the blocks with add-block (${Object.entries(recipe.blocks).filter(([, s]) => s.use === 'required').map(([b]) => b).join(', ')})`,
      'node <skill>/brand/tools/recipe.mjs check after every change of the timeline; darkmind-agent validate as usual',
      'the first pass renders to the proxy without the editorial review (F5); the editor approves the content when reviewing the preview',
    ],
  };
}

async function check(args) {
  const root = path.resolve(option(args, '--project') ?? process.cwd());
  const brand = await readJson(path.join(PACK, 'brand.json'), 'brand.json');
  const docs = await loadProject(root);
  if (!docs.project.recipe?.id) throw new Error('project.json has no recipe; run: recipe.mjs apply <recipe>');
  const recipe = await loadRecipe(docs.project.recipe.id);
  const reviewsFile = option(args, '--reviews');
  if (reviewsFile) {
    const status = await readJson(path.resolve(reviewsFile), '--reviews');
    docs.reviews = status.data ?? status;
  }
  return checkProject(brand, recipe, docs);
}

async function chapters(args) {
  const root = path.resolve(option(args, '--project') ?? process.cwd());
  const docs = await loadProject(root);
  if (!docs.project.recipe?.id) throw new Error('project.json has no recipe; run: recipe.mjs apply <recipe>');
  const recipe = await loadRecipe(docs.project.recipe.id);
  if (!recipe.chapters?.required) throw new Error(`${recipe.id} has no YouTube chapter list`);
  const extensions = Object.fromEntries(Object.entries(docs.extensions).map(([id, extension]) => [id, { extension, block: brandBlockOf(extension) }]));
  const fps = docs.project.output.fps;
  const placed = placedClips(docs.timeline, extensions, fps);
  const result = chapterList({ recipe, placed, extensions, chapters: docs.chapters, fps, end: pictureEnd(placed, docs.timeline) });
  const out = option(args, '--out');
  if (out && !result.issues.some((i) => i.severity === 'error')) await fs.writeFile(path.resolve(root, out), `${result.text}\n`);
  return { recipe: recipe.id, source: docs.chapters ? 'chapters.json' : recipe.chapters.derive ? `derived from ${recipe.chapters.derive}` : null, ...result, ...(out ? { written: out } : {}) };
}

export async function recipeCommand(args) {
  const brand = await readJson(path.join(PACK, 'brand.json'), 'brand.json');
  switch (args[0]) {
    case 'list':
      return (await listRecipes()).map((r) => ({ id: r.id, title: r.title, profile: r.profile, duration: r.duration, document: `brand/recipes/${r.document}` }));
    case 'show': {
      const recipe = await loadRecipe(args[1]);
      const issues = checkRecipe(brand, recipe);
      if (issues.length) throw new Error(`recipe ${recipe.id} is broken: ${issues.join('; ')}`);
      return recipe;
    }
    case 'apply':
      return apply(args);
    case 'check':
      return check(args);
    case 'chapters':
      return chapters(args);
    default:
      throw new Error('usage: recipe.mjs list | show <recipe> | apply <recipe> [--project <dir>] [--force] | check [--project <dir>] [--reviews <file>] | chapters [--project <dir>] [--out <file>]');
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  recipeCommand(args).then(
    (result) => {
      process.stdout.write(json(result));
      if (args[0] === 'check' && !result.valid) process.exit(1);
      if (args[0] === 'chapters' && result.issues.some((i) => i.severity === 'error')) process.exit(1);
    },
    (error) => {
      process.stderr.write(`recipe: ${error.message ?? error}\n`);
      process.exit(1);
    }
  );
}
