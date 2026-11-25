// Dark Mind brand pack – browser helpers of the HTML scenes (Phase 6 WP2, decision T10, rules R2/R3/R6).
// A scene is an HTML page that calls boot({ block, text, init, renderAt }): every frame is a pure function of the frame
// index, the parameters and the declared files. Deterministic: no Date/Math.random/performance; randomness only from a
// PRNG seeded per frame. Files come from the compositor's virtual origin (only declared files are reachable).
// Parameters and texts are data: they are drawn, never evaluated.

import { fontCodePoints, missingCharacters } from './cmap.mjs';
import { blockFaces } from './blocks.mjs';

const LIB = new URL('./', import.meta.url);
export const PACK = new URL('../', LIB);

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const easeOutCubic = (t) => 1 - Math.pow(1 - clamp(t), 3);

/** mulberry32: small seeded PRNG. */
export function prng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** URL of a project file on the virtual origin (project-relative path). */
export function projectUrl(relativePath) {
  return new URL(`/${String(relativePath).split('/').map(encodeURIComponent).join('/')}`, location.href);
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`cannot read ${url.pathname ?? url}: HTTP ${response.status}`);
  return response.json();
}

/** Loads the brand font faces (R6: from the declared files, awaited before the first frame) with their cmap. */
export async function loadFaces(brand, names) {
  const loaded = [];
  for (const name of names) {
    const face = brand.fonts.faces[name];
    if (!face) throw new Error(`unknown font face "${name}" in brand.json`);
    const url = new URL(`assets/${face.file}`, PACK);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`cannot read ${url.pathname}: HTTP ${response.status} (declare the font as an input)`);
    const bytes = await response.arrayBuffer();
    const font = new FontFace(brand.fonts.family, bytes, { weight: String(face.weight), style: 'normal' });
    await font.load();
    document.fonts.add(font);
    loaded.push({ name, weight: face.weight, points: fontCodePoints(bytes) });
  }
  await document.fonts.ready;
  return loaded;
}

export async function loadImage(url) {
  const img = new Image();
  img.src = String(url);
  await img.decode();
  return img;
}

/** Rasterises an SVG logo at a given width into a canvas (vector quality, white ink on transparent). */
export function rasterize(img, width, aspect) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(width));
  c.height = Math.max(1, Math.round(width / aspect));
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  return c;
}

export function mainCanvas(width, height) {
  const canvas = document.getElementById('stage') ?? document.body.appendChild(Object.assign(document.createElement('canvas'), { id: 'stage' }));
  canvas.width = width;
  canvas.height = height;
  canvas.style.cssText = `position:absolute;left:0;top:0;width:${width}px;height:${height}px`;
  return canvas.getContext('2d');
}

export function fontString(brand, faceName, sizePx) {
  return `${brand.fonts.faces[faceName].weight} ${sizePx.toFixed(3)}px "${brand.fonts.family}"`;
}

const capRatios = new Map();
/** Font size (px) whose capital letters are `capPx` high in the given brand face (brand.json sizes are cap heights). */
export function fontForCap(brand, faceName, capPx) {
  if (!capRatios.has(faceName)) {
    const c = document.createElement('canvas').getContext('2d');
    c.font = fontString(brand, faceName, 1000);
    capRatios.set(faceName, c.measureText('H').actualBoundingBoxAscent / 1000);
  }
  return capPx / capRatios.get(faceName);
}

/** Text with a hard drop shadow (offset down-right), as in the reference captions. */
export function shadowText(ctx, text, x, y, { fill, shadow = '#000000', shadowAlpha = 0.85, offset }) {
  if (offset > 0) {
    ctx.save();
    ctx.globalAlpha = shadowAlpha;
    ctx.fillStyle = shadow;
    ctx.fillText(text, x + offset, y + offset);
    ctx.restore();
  }
  ctx.fillStyle = fill;
  ctx.fillText(text, x, y);
}

const tintCache = new WeakMap();
/** The canvas `src` filled with one colour (alpha kept); cached per source. */
export function tint(src, colour) {
  let byColour = tintCache.get(src);
  if (!byColour) tintCache.set(src, (byColour = new Map()));
  if (byColour.has(colour)) return byColour.get(colour);
  const c = document.createElement('canvas');
  c.width = src.width;
  c.height = src.height;
  const t = c.getContext('2d');
  t.drawImage(src, 0, 0);
  t.globalCompositeOperation = 'source-in';
  t.fillStyle = colour;
  t.fillRect(0, 0, c.width, c.height);
  byColour.set(colour, c);
  return c;
}

/** Draws `src` with an RGB split (red left, cyan right, the original on top). */
export function drawRgbSplit(ctx, src, x, y, split, colours) {
  if (split > 0.01) {
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.drawImage(tint(src, colours.red), x - split, y);
    ctx.drawImage(tint(src, colours.cyan), x + split, y);
    ctx.restore();
  }
  ctx.drawImage(src, x, y);
}

/** Horizontal block glitch: `src` in bands with seeded x offsets, some bands in red/cyan. */
export function drawBlockGlitch(ctx, src, x, y, { seed, intensity, colours }) {
  const rnd = prng(seed);
  let yy = 0;
  while (yy < src.height) {
    const h = Math.max(2, Math.round((0.08 + rnd() * 0.3) * src.height));
    const band = Math.min(h, src.height - yy);
    const shift = Math.round((rnd() - 0.5) * 2 * intensity * src.height);
    const r = rnd();
    const img = r < 0.18 ? tint(src, colours.red) : r < 0.36 ? tint(src, colours.cyan) : src;
    ctx.drawImage(img, 0, yy, src.width, band, x + shift, y + yy, src.width, band);
    yy += band;
  }
}

/** Soft glow behind bright content. */
export function drawGlow(ctx, src, x, y, radius, alpha) {
  ctx.save();
  ctx.filter = `blur(${radius.toFixed(2)}px)`;
  ctx.globalAlpha = alpha;
  ctx.drawImage(src, x, y);
  ctx.restore();
}

/** Bounding box of all pixels with alpha > threshold ({ x, y, w, h } or null) – for safe-zone checks. */
export function inkBox(ctx, threshold = 8) {
  const { width: W, height: H } = ctx.canvas;
  const data = ctx.getImageData(0, 0, W, H).data;
  let x0 = W;
  let y0 = H;
  let x1 = -1;
  let y1 = -1;
  for (let y = 0; y < H; y++) {
    const row = y * W * 4;
    for (let x = 0; x < W; x++) {
      if (data[row + x * 4 + 3] > threshold) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  return x1 < 0 ? null : { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}

/**
 * Wires window.scene for the compositor: init(ctx) loads brand.json and the font faces, checks the glyph coverage of
 * `text(ctx)` and calls the scene's init; renderAt(frame) clears the stage and returns the scene's state key (R4).
 */
export function boot({ block, text, init, renderAt }) {
  const state = { info: {} };
  window.scene = {
    async init(c) {
      const brand = await fetchJson(new URL('brand.json', PACK));
      const settings = brand.blocks[block];
      if (!settings) throw new Error(`brand.json has no block "${block}"`);
      const loaded = await loadFaces(brand, blockFaces(brand, block));
      const ctx = mainCanvas(c.width, c.height);
      const scene = { ...c, brand, settings, ctx, fps: c.fps, params: c.params ?? {}, fetchJson, projectUrl };
      await init(scene);
      const drawn = text ? text(scene) : '';
      // glyph coverage (R6): a missing glyph would silently be drawn by a system font
      const missing = [...new Set(loaded.flatMap((face) => missingCharacters(face.points, `${drawn}${brand.fonts.requiredGlyphs}`)))];
      if (missing.length) throw new Error(`characters missing in ${brand.fonts.family}: ${missing.join(' ')} – use other characters (the brand font has no glyph for them)`);
      state.scene = scene;
      state.info = { block, brandPack: brand.version, fonts: loaded.map(({ name, weight }) => ({ name, weight })), ...(scene.info ?? {}) };
    },
    info() {
      return state.info;
    },
    renderAt(frame) {
      const { ctx } = state.scene;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      ctx.filter = 'none';
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      return renderAt(state.scene, frame);
    },
    inkBox() {
      return inkBox(state.scene.ctx);
    },
  };
}
