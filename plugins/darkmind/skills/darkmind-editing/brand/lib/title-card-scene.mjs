// Dark Mind brand pack – title_card (Phase 6 WP2): title in Neuborn (as written, e.g. "jensen x mark tremonti") with a
// steady RGB split, optionally "LOUD SOCIETY PRESENTS" above, on black (opaque) or transparent (over footage).
// Glitch-in, hold, glitch-out. Parameters: title, presents (bool), background ("black" | "transparent").
// Texts are data, never evaluated.

import { color, secondsToFrames } from './layout.mjs';
import { boot, drawBlockGlitch, drawRgbSplit, fontForCap, fontString, prng } from './scene.mjs';

boot({
  block: 'title_card',
  async init(scene) {
    const { brand, settings, params, width: W, height: H, fps, ctx } = scene;
    const title = params.title.trim();
    const presents = params.presents ? settings.presentsText : null;
    let size = fontForCap(brand, settings.face, settings.capHeight * H);
    ctx.font = fontString(brand, settings.face, size);
    const natural = ctx.measureText(title).width;
    if (natural > settings.maxWidth * W) size = Math.max(fontForCap(brand, settings.face, settings.minCapHeight * H), (size * settings.maxWidth * W) / natural);
    ctx.font = fontString(brand, settings.face, size);
    const metrics = ctx.measureText(title);
    if (metrics.width > settings.maxWidth * W + 0.5) throw new Error('the title is too wide even at the minimum font size; shorten it');
    const split = Math.max(1, Math.round(settings.rgbSplit * H));
    const pad = split * 4 + Math.ceil(size * 0.25);
    const ascent = metrics.actualBoundingBoxAscent;
    const descent = metrics.actualBoundingBoxDescent;
    const card = document.createElement('canvas');
    card.width = Math.ceil(metrics.width) + 2 * pad;
    card.height = Math.ceil(ascent + descent) + 2 * pad;
    const c = card.getContext('2d');
    c.font = fontString(brand, settings.face, size);
    c.textBaseline = 'alphabetic';
    c.fillStyle = color(brand, 'pureWhite');
    c.fillText(title, pad, pad + ascent);
    scene.card = { canvas: card, x: Math.round(W / 2 - card.width / 2), y: Math.round(settings.centerY * H - (ascent - descent) / 2 - pad - descent) };
    if (presents) {
      const pSize = fontForCap(brand, settings.presentsFace, settings.presentsCap * H);
      ctx.font = fontString(brand, settings.presentsFace, pSize);
      const pm = ctx.measureText(presents);
      const pc = document.createElement('canvas');
      pc.width = Math.ceil(pm.width) + 2 * pad;
      pc.height = Math.ceil(pm.actualBoundingBoxAscent + pm.actualBoundingBoxDescent) + 2 * pad;
      const p = pc.getContext('2d');
      p.font = fontString(brand, settings.presentsFace, pSize);
      p.textBaseline = 'alphabetic';
      p.fillStyle = color(brand, 'white');
      p.fillText(presents, pad, pad + pm.actualBoundingBoxAscent);
      const titleTop = scene.card.y + pad;
      scene.presents = { canvas: pc, x: Math.round(W / 2 - pc.width / 2), y: Math.round(titleTop - size * settings.presentsGap - pc.height + pad) };
    }
    scene.background = (params.background ?? settings.background) === 'black' ? brand.colors.pureBlack : null;
    scene.colours = { red: brand.colors.glitchRed, cyan: brand.colors.glitchCyan };
    scene.split = split;
    scene.inFrames = secondsToFrames(settings.glitchInSeconds, fps);
    scene.outFrames = secondsToFrames(settings.glitchOutSeconds, fps);
    scene.texts = `${title}${presents ?? ''}`;
    scene.info = { fontSizePx: Number(size.toFixed(2)), background: scene.background ? 'black' : 'transparent' };
  },
  text: (scene) => scene.texts,
  renderAt(scene, frame) {
    const { ctx, card, presents, background, colours, split, inFrames, outFrames, frames, width: W, height: H } = scene;
    if (background) {
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, W, H);
    }
    const fromEnd = frames - 1 - frame;
    const phase = frame < inFrames ? { k: frame, n: inFrames, dir: 'in' } : fromEnd < outFrames ? { k: fromEnd, n: outFrames, dir: 'out' } : null;
    const items = [card, ...(presents ? [presents] : [])];
    if (!phase) {
      for (const item of items) drawRgbSplit(ctx, item.canvas, item.x, item.y, split, colours);
      return 'hold';
    }
    const progress = (phase.k + 1) / (phase.n + 1);
    if (prng(frame * 6151 + 11)() > 0.3 + 0.7 * progress) return `${phase.dir}:${frame}:off`;
    for (const [i, item] of items.entries()) {
      drawBlockGlitch(ctx, item.canvas, item.x, item.y, { seed: frame * 211 + i * 13 + 3, intensity: 0.25 * (1 - progress), colours });
      drawRgbSplit(ctx, item.canvas, item.x, item.y, Math.round(split * (1 + 4 * (1 - progress))), colours);
    }
    return `${phase.dir}:${frame}`;
  },
});
