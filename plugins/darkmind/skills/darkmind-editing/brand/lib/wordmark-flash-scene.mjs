// Dark Mind brand pack – wordmark_flash (Phase 6 WP2): the wordmark loud>society (SVG from brand-assets, not the font)
// with glow and a slight RGB split, briefly above the first caption line at the start of a short (0.3–3 s).
// Glitch-in over the first frames, hard cut at the end. Parameters: centerY (fraction of H, default: above the word
// caption line from brand.json).

import { secondsToFrames } from './layout.mjs';
import { PACK, boot, drawBlockGlitch, drawGlow, drawRgbSplit, loadImage, prng, rasterize } from './scene.mjs';

boot({
  block: 'wordmark_flash',
  async init(scene) {
    const { brand, settings, params, width: W, height: H } = scene;
    const logo = brand.logo.wordmark;
    const img = await loadImage(new URL(`assets/${logo.file}`, PACK));
    const mark = rasterize(img, settings.width * W, logo.width / logo.height);
    const centerY = params.centerY ?? brand.blocks.caption_word.centerY - settings.gapAboveCaption;
    // pad the mark so glow and split stay inside the copy
    const pad = Math.ceil(settings.glowRadius * H * 3 + settings.rgbSplit * H * 2);
    const padded = document.createElement('canvas');
    padded.width = mark.width + 2 * pad;
    padded.height = mark.height + 2 * pad;
    padded.getContext('2d').drawImage(mark, pad, pad);
    scene.mark = padded;
    scene.x = Math.round(W / 2 - padded.width / 2);
    scene.y = Math.round(centerY * H - padded.height / 2);
    scene.colours = { red: brand.colors.glitchRed, cyan: brand.colors.glitchCyan };
    scene.split = Math.max(1, Math.round(settings.rgbSplit * H));
    scene.glow = settings.glowRadius * H;
    scene.glitchFrames = Math.min(settings.glitchFrames, Math.max(0, scene.frames - 1));
    scene.info = { centerY, widthPx: mark.width, heightPx: mark.height, minFrames: secondsToFrames(settings.seconds.min, scene.fps) };
  },
  renderAt(scene, frame) {
    const { ctx, mark, x, y, colours, split, glow, glitchFrames, settings } = scene;
    if (frame < glitchFrames) {
      const rnd = prng(frame * 4099 + 3);
      if (frame > 0 && rnd() < 0.3) return `in:${frame}:off`;
      drawGlow(ctx, mark, x, y, glow, settings.glowAlpha * 0.6);
      drawBlockGlitch(ctx, mark, x, y, { seed: frame * 97 + 5, intensity: 0.12 * (1 - frame / glitchFrames), colours });
      return `in:${frame}`;
    }
    drawGlow(ctx, mark, x, y, glow, settings.glowAlpha);
    drawRgbSplit(ctx, mark, x, y, split, colours);
    return 'hold';
  },
});
