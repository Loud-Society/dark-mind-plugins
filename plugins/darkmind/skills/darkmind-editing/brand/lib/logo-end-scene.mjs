// Dark Mind brand pack – logo_end (Phase 6 WP3): the wordmark loud>society white on black with a soft glow, glitching in
// over the first frames, then still – the last shot of every format; the spoken voice tag is mixed by render.mjs.
// Usually preceded by a chevron_wipe whose B is this block's output (the wipe reveals the logo).
// Parameters: voiceTag (asset id or null; sound only).

import { padded } from './motion.mjs';
import { PACK, boot, drawBlockGlitch, drawGlow, loadImage, prng, rasterize } from './scene.mjs';

boot({
  block: 'logo_end',
  async init(scene) {
    const { brand, settings, width: W, height: H, frames } = scene;
    const profile = W > H ? 'landscape' : 'vertical';
    const p = settings.profiles[profile];
    const wm = brand.logo.wordmark;
    const img = await loadImage(new URL(`assets/${wm.file}`, PACK));
    const mark = padded(rasterize(img, p.wordmarkWidth * W, wm.width / wm.height), Math.ceil(settings.glowRadius * H * 3 + 0.03 * H));
    scene.mark = mark;
    scene.x = Math.round(W / 2 - mark.width / 2);
    scene.y = Math.round(p.centerY * H - mark.height / 2);
    scene.glitchFrames = Math.min(settings.glitchFrames, Math.max(0, frames - 1));
    scene.colours = { red: brand.colors.glitchRed, cyan: brand.colors.glitchCyan };
    scene.info = { profile, widthPx: Math.round(p.wordmarkWidth * W) };
  },
  renderAt(scene, frame) {
    const { ctx, brand, settings, width: W, height: H, mark, x, y, colours } = scene;
    ctx.fillStyle = brand.colors.black;
    ctx.fillRect(0, 0, W, H);
    if (frame < scene.glitchFrames) {
      const rnd = prng(frame * 6151 + 17);
      if (frame > 0 && rnd() < 0.3) return `in:${frame}:off`;
      drawBlockGlitch(ctx, mark, x, y, { seed: frame * 89 + 7, intensity: 0.1 * (1 - frame / scene.glitchFrames), colours });
      return `in:${frame}`;
    }
    drawGlow(ctx, mark, x, y, settings.glowRadius * H, settings.glowAlpha);
    ctx.drawImage(mark, x, y);
    return 'hold';
  },
});
