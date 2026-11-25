// Dark Mind brand pack – browser helpers of the motion blocks (Phase 6 WP3): chevron geometry and the chevron wipe with
// motion blur and colour fringe (WP0 spike, measured on doc/mvp/brand/frames/yt-long/02 and yt-shorts/08), logo images,
// cover-fit images. Deterministic: pure functions of frame time and parameters.

import { clamp } from './scene.mjs';

export const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * The chevron `>` as a normalised polygon (x by width, y by height) from the logo geometry in brand.json: outer apex at
 * (1, 0.5), inner apex at innerApex/width; the inner edges run parallel to the outer ones (same polygon as the glyph).
 */
export function chevronPolygon(brand) {
  const c = brand.logo.chevron;
  const ia = c.innerApex / c.width;
  const e = 0.5 - 0.5 * ia;
  return { aspect: c.width / c.height, points: [[0, 0], [1, 0.5], [0, 1], [0, 1 - e], [ia, 0.5], [0, e]] };
}

function chevronPath(ctx, chevron, x, y, h) {
  const w = h * chevron.aspect;
  ctx.beginPath();
  chevron.points.forEach(([px, py], i) => (i ? ctx.lineTo(x + px * w, y + py * h) : ctx.moveTo(x + px * w, y + py * h)));
  ctx.closePath();
}

/** Position of the wipe chevron at progress p (0 = apex enters on the left, 1 = the chevron has left on the right). */
export function wipeGeometry(chevron, W, H, p, heightOfFrame) {
  const h = H * heightOfFrame;
  const w = h * chevron.aspect;
  return { x: -w + (W + w) * p, y: H / 2 - h / 2, w, h };
}

const scratch = new Map();
function scratchCanvas(key, W, H) {
  let c = scratch.get(key);
  if (!c || c.width !== W || c.height !== H) {
    c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    scratch.set(key, c);
  }
  const ctx = c.getContext('2d');
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  ctx.filter = 'none';
  ctx.clearRect(0, 0, W, H);
  return [c, ctx];
}

/**
 * Chevron wipe at frame time t: box-shutter motion blur (n sub-frame samples averaged additively, also for alpha) and a
 * coloured fringe (orange leading/upper, blue trailing/lower) as in the reference frames. progressAt(ts) → 0..1.
 */
export function drawChevronWipe(ctx, chevron, W, H, progressAt, t, o) {
  const [acc, a] = scratchCanvas('wipe', W, H);
  a.globalCompositeOperation = 'lighter';
  const sample = (s) => t + o.shutter * ((s + 0.5) / o.samples - 0.5);
  const layers = [
    { color: o.colors.orange, dx: -o.fringe * H * 1.5, dy: -o.fringe * H },
    { color: o.colors.blue, dx: -o.fringe * H * 1.5, dy: o.fringe * H },
  ];
  for (const [i, layer] of layers.entries()) {
    const [fc, f] = scratchCanvas(`fringe${i}`, W, H);
    f.globalCompositeOperation = 'lighter';
    for (let s = 0; s < o.samples; s++) {
      const g = wipeGeometry(chevron, W, H, progressAt(sample(s)), o.heightOfFrame);
      f.globalAlpha = o.fringeAlpha / o.samples;
      f.fillStyle = layer.color;
      chevronPath(f, chevron, g.x + layer.dx, g.y + layer.dy, g.h);
      f.fill();
    }
    ctx.drawImage(fc, 0, 0);
  }
  // 8-bit accumulation of n samples at 1/n each stays a few percent below full coverage (the fringe would shine through
  // the white): a slightly higher weight saturates the covered interior ("lighter" clamps), the blurred edges keep their ramp
  const weight = 1.08 / o.samples;
  for (let s = 0; s < o.samples; s++) {
    const g = wipeGeometry(chevron, W, H, progressAt(sample(s)), o.heightOfFrame);
    a.globalAlpha = weight;
    a.fillStyle = o.colors.white;
    chevronPath(a, chevron, g.x, g.y, g.h);
    a.fill();
  }
  ctx.drawImage(acc, 0, 0);
}

/** Clip path of the incoming shot B: everything behind (left of) the chevron's leading edge, incl. the notch. */
export function wipeMattePath(ctx, chevron, W, H, p, heightOfFrame) {
  const g = wipeGeometry(chevron, W, H, p, heightOfFrame);
  ctx.beginPath();
  ctx.moveTo(-10 * W, -10 * H);
  ctx.lineTo(g.x, g.y);
  ctx.lineTo(g.x + g.w, g.y + g.h / 2);
  ctx.lineTo(g.x, g.y + g.h);
  ctx.lineTo(-10 * W, 10 * H);
  ctx.closePath();
}

/** Draws an image so that it covers the W × H frame (centred, aspect kept, overflow cut). */
export function drawCover(ctx, img, W, H) {
  const s = Math.max(W / img.naturalWidth, H / img.naturalHeight);
  const w = img.naturalWidth * s;
  const h = img.naturalHeight * s;
  ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
}

/** Pads a canvas so that glow and RGB split stay inside the copy. */
export function padded(src, pad) {
  const c = document.createElement('canvas');
  c.width = src.width + 2 * pad;
  c.height = src.height + 2 * pad;
  c.getContext('2d').drawImage(src, pad, pad);
  return c;
}

export { clamp };
