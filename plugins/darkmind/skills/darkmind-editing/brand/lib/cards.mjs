// Dark Mind brand pack – browser helpers of the Never Ending Interview cards (Phase 6 WP5): text rendered once into
// padded canvases (drawn with RGB split and block glitch like the title card), fitting several lines to a width, and
// the glitch-in/hold/glitch-out phase of a card. Texts are data: they are measured and drawn, never evaluated.

import { color } from './layout.mjs';
import { drawBlockGlitch, drawRgbSplit, fontForCap, fontString, prng } from './scene.mjs';

/** Natural ink width of a text in a face at a cap height (px). */
export function measure(brand, face, cap, text) {
  const m = document.createElement('canvas').getContext('2d');
  m.font = fontString(brand, face, fontForCap(brand, face, cap));
  const r = m.measureText(text);
  return { width: r.actualBoundingBoxLeft + r.actualBoundingBoxRight, left: r.actualBoundingBoxLeft, ascent: r.actualBoundingBoxAscent, descent: r.actualBoundingBoxDescent };
}

/**
 * Cap height (px) at which the widest of `lines` fits `maxWidth` px: `cap` unless too wide, never below `minCap`
 * (then the text is refused: shorten it).
 */
export function fitCap(brand, face, cap, minCap, lines, maxWidth, what) {
  const widest = Math.max(...lines.map((l) => measure(brand, face, cap, l).width));
  const fitted = widest > maxWidth ? (cap * maxWidth) / widest : cap;
  if (fitted < minCap - 1e-6) throw new Error(`${what} is too wide even at the minimum size; shorten it`);
  return fitted;
}

/**
 * One line of text in its own padded canvas; `x`/`baseline` place it: align "left" puts the ink's left edge at x,
 * "right" the ink's right edge, "center" the ink's centre. Returns { canvas, x, y, ink: { x, y, w, h } } (y = canvas top).
 */
export function textItem(brand, { face, cap, text, fill = 'pureWhite', align = 'left', x, baseline, pad }) {
  const size = fontForCap(brand, face, cap);
  const m = measure(brand, face, cap, text);
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(m.width) + 2 * pad;
  canvas.height = Math.ceil(m.ascent + m.descent) + 2 * pad;
  const c = canvas.getContext('2d');
  c.font = fontString(brand, face, size);
  c.textBaseline = 'alphabetic';
  c.fillStyle = color(brand, fill);
  c.fillText(text, pad + m.left, pad + m.ascent);
  const inkLeft = align === 'right' ? x - m.width : align === 'center' ? x - m.width / 2 : x;
  const left = Math.round(inkLeft - pad);
  const top = Math.round(baseline - m.ascent - pad);
  return { canvas, x: left, y: top, ink: { x: left + pad, y: top + pad, w: m.width, h: m.ascent + m.descent } };
}

/** Glitch phase of a card at a frame: null while holding, else { k, n, dir }. */
export function cardPhase(frame, frames, inFrames, outFrames) {
  const fromEnd = frames - 1 - frame;
  if (frame < inFrames) return { k: frame, n: inFrames, dir: 'in' };
  if (fromEnd < outFrames) return { k: fromEnd, n: outFrames, dir: 'out' };
  return null;
}

/**
 * Draws text items: steady (split items with their RGB split) while holding; during glitch-in/out seeded flicker,
 * block glitch and a wider split (like the title card). Returns the state key part.
 */
export function drawItems(ctx, items, { frame, phase, split, colours }) {
  if (!phase) {
    for (const item of items) item.split ? drawRgbSplit(ctx, item.canvas, item.x, item.y, split, colours) : ctx.drawImage(item.canvas, item.x, item.y);
    return 'hold';
  }
  const progress = (phase.k + 1) / (phase.n + 1);
  if (prng(frame * 6151 + 11)() > 0.3 + 0.7 * progress) return `${phase.dir}:${frame}:off`;
  for (const [i, item] of items.entries()) {
    drawBlockGlitch(ctx, item.canvas, item.x, item.y, { seed: frame * 211 + i * 13 + 3, intensity: 0.25 * (1 - progress), colours });
    drawRgbSplit(ctx, item.canvas, item.x, item.y, Math.round(split * (1 + 4 * (1 - progress))), colours);
  }
  return `${phase.dir}:${frame}`;
}

/** Union of the ink boxes of text items (for the safe-area checks of the tests). */
export function inkUnion(items) {
  const boxes = items.map((i) => i.ink);
  const x = Math.min(...boxes.map((b) => b.x));
  const y = Math.min(...boxes.map((b) => b.y));
  return { x, y, w: Math.max(...boxes.map((b) => b.x + b.w)) - x, h: Math.max(...boxes.map((b) => b.y + b.h)) - y };
}
