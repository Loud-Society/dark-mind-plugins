// Dark Mind brand pack – project files the recipe check reads (doc/mvp/FORMAT_RECIPES.md). Moved from the former
// tools/recipe.mjs; used by darkmind-agent recipe (check, chapters, derive) and the tests.

import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { PACK_DIR } from './catalog.mjs';

const sha = (buffer) => createHash('sha256').update(buffer).digest('hex');

async function readJson(file, what, { optional = false } = {}) {
  try {
    return JSON.parse((await fs.readFile(file, 'utf8')).replace(/^\uFEFF/, ''));
  } catch (error) {
    if (optional && error.code === 'ENOENT') return null;
    throw new Error(`${what} (${file}) cannot be read: ${error.code === 'ENOENT' ? 'missing' : error.message}`);
  }
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

/** Vendored brand pack code and tokens compared with a pack folder (assets are not compared: they come from brand-assets). */
export async function vendoredFiles(root, pack = PACK_DIR) {
  const vendor = path.join(root, 'extensions', 'brand-pack');
  const vendoredBrand = await readJson(path.join(vendor, 'brand.json'), 'vendored brand.json', { optional: true });
  const files = (await walk(vendor)).filter((rel) => rel === 'brand.json' || rel.startsWith('lib/') || rel.startsWith('blocks/'));
  const result = [];
  for (const rel of files) {
    const mine = await fs.readFile(path.join(vendor, ...rel.split('/')));
    const theirs = await fs.readFile(path.join(pack, ...rel.split('/'))).catch(() => null);
    result.push({ path: `extensions/brand-pack/${rel}`, same: Boolean(theirs) && sha(mine) === sha(theirs), packVersion: vendoredBrand?.version ?? null });
  }
  return result;
}

/** Everything the recipe check reads: project, timeline, captions, extensions, chapters.json, material.json, vendored pack files. */
export async function loadProjectDocs(root, pack = PACK_DIR) {
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
  const material = await readJson(path.join(root, 'material.json'), 'material.json', { optional: true });
  return { project, timeline: timeline ?? { video: [], audio: [], gaps: [] }, captions, extensions, chapters, material, vendored: await vendoredFiles(root, pack) };
}
