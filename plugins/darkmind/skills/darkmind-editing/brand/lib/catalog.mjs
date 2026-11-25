// Dark Mind brand pack – what the pack offers format recipes (doc/mvp/FORMAT_RECIPES.md): profiles, blocks, caption
// styles, the named checks recipes may use, capabilities (guides and tools) and chapter derivations. Recipes are data in
// the Dark Mind catalog; they only name these entries. A new check or capability is a brand pack release (code review,
// tests), never part of a recipe. darkmind-agent and the Dark Mind server validate recipes against this catalog.

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BLOCKS, STILL_BLOCKS, blockOutput, blockProfiles } from './blocks.mjs';

export const PACK_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Named checks a recipe rule may use ({ kind: "machine", id, params }); implemented in lib/recipes.mjs. */
export const RECIPE_CHECKS = {
  'lower-third-people': {
    description: 'The first lower third introduces this many people together (host interview: guest and host).',
    params: { people: 'number of people of the first lower third (default 2)' },
  },
};

/** Capabilities of the pack a recipe may name: a guide for the agent and its tool. */
export const RECIPE_CAPABILITIES = {
  'nei-chain': {
    description: 'Never Ending Interview chain reconstruction from transcripts only (never from upload notes or metadata).',
    guide: 'recipes/NEI_CHAIN.md',
    tool: 'tools/nei-chain.mjs',
  },
};

/** Blocks a YouTube chapter list can be derived from (lib/chapters.mjs). */
export const CHAPTER_DERIVATIONS = ['band_card'];

/** Caption styles drawn by brand blocks. */
export const BRAND_CAPTION_STYLES = ['brand-word', 'brand-phrase', 'brand-16x9'];

/** The catalog of this brand pack (pure; descriptions: block → text, e.g. from blocks/<block>/block.json). */
export function recipeCatalog(brand, descriptions = {}) {
  const profiles = Object.fromEntries(Object.entries(brand.profiles).map(([name, p]) => [name, { width: p.width, height: p.height, fps: p.fps }]));
  const blocks = {};
  for (const block of BLOCKS) {
    const output = blockOutput(brand, block, {});
    const made = blockProfiles(brand, block);
    blocks[block] = {
      still: STILL_BLOCKS.includes(block),
      video: Boolean(output.video),
      audio: Boolean(output.audio),
      profiles: made.length && made.length < Object.keys(profiles).length ? made : null,
      ...(descriptions[block] ? { description: descriptions[block] } : {}),
    };
  }
  return {
    brand: { id: brand.id, version: brand.version },
    profiles,
    blocks,
    captionStyles: [...BRAND_CAPTION_STYLES],
    checks: structuredClone(RECIPE_CHECKS),
    capabilities: structuredClone(RECIPE_CAPABILITIES),
    chapterDerivations: [...CHAPTER_DERIVATIONS],
  };
}

/** brand.json of a pack folder. */
export async function loadBrand(dir = PACK_DIR) {
  return JSON.parse((await fs.readFile(path.join(dir, 'brand.json'), 'utf8')).replace(/^\uFEFF/, ''));
}

/** The catalog of a pack folder with the block descriptions of blocks/<block>/block.json. */
export async function loadRecipeCatalog(dir = PACK_DIR) {
  const brand = await loadBrand(dir);
  const descriptions = {};
  for (const block of BLOCKS) {
    const definition = await fs.readFile(path.join(dir, 'blocks', block, 'block.json'), 'utf8').then((text) => JSON.parse(text), () => null);
    if (typeof definition?.description === 'string') descriptions[block] = definition.description;
  }
  return recipeCatalog(brand, descriptions);
}
