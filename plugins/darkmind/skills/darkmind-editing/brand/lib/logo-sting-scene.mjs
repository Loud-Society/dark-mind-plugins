// Dark Mind brand pack – logo_sting (Phase 6 WP3): white flash with black bars → block glitch settling into the wordmark
// loud>society on black (glow, steady RGB split) → optional country suffix revealed in steps (grey, inline in 16:9,
// second line in 9:16) → a short micro glitch. Sound (noise hit + shouted voice tag) is mixed by render.mjs.
// Parameters: suffix (e.g. "brazil"), voiceTag, noiseHit (asset ids; sound only). The transition into the next shot is
// a separate chevron_wipe with this block's output as A.

import { blockLogos } from './blocks.mjs';
import { secondsToFrames } from './layout.mjs';
import { easeInOutCubic, padded } from './motion.mjs';
import { PACK, boot, clamp, drawBlockGlitch, drawGlow, drawRgbSplit, loadImage, prng } from './scene.mjs';

function raster(img, width, height) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(width));
  c.height = Math.max(1, Math.round(height));
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  return c;
}

boot({
  block: 'logo_sting',
  async init(scene) {
    const { brand, settings, params, width: W, height: H, fps, frames } = scene;
    const profile = W > H ? 'landscape' : 'vertical';
    const p = settings.profiles[profile];
    const [logo] = blockLogos(brand, 'logo_sting', params, profile);
    const file = logo.file ?? brand.logo.wordmark.file;
    const img = await loadImage(new URL(`assets/${file}`, PACK));
    const wm = brand.logo.wordmark;
    // the loud>society part is wordmarkWidth × W wide in every variant; the SVG's own width scales with it
    const scale = (p.wordmarkWidth * W) / wm.width;
    const svgW = img.naturalWidth || wm.width;
    const svgH = img.naturalHeight || wm.height;
    const mark = raster(img, svgW * scale, svgH * scale);
    const pad = Math.ceil(settings.glowRadius * H * 3 + settings.rgbSplit * H * 2 + 0.05 * H);
    // main part and suffix part as separate copies: the suffix is revealed in steps
    const sfx = brand.logo.suffixes;
    const stacked = Boolean(params.suffix) && profile === 'vertical';
    const split = params.suffix ? (stacked ? Math.round(sfx.stackedSplitY * scale) : Math.round(sfx.inlineSuffixLeft * scale)) : null;
    const part = (x0, y0, x1, y1) => {
      const c = document.createElement('canvas');
      c.width = mark.width;
      c.height = mark.height;
      c.getContext('2d').drawImage(mark, x0, y0, x1 - x0, y1 - y0, x0, y0, x1 - x0, y1 - y0);
      return padded(c, pad);
    };
    scene.main = split === null ? padded(mark, pad) : stacked ? part(0, 0, mark.width, split) : part(0, 0, split, mark.height);
    scene.suffix = split === null ? null : stacked ? part(0, split, mark.width, mark.height) : part(split, 0, mark.width, mark.height);
    scene.suffixFrom = split === null ? 0 : (stacked ? 0 : split) + pad;
    scene.suffixWidth = split === null ? 0 : (stacked ? mark.width : mark.width - split);
    scene.x = Math.round(W / 2 - scene.main.width / 2);
    scene.y = Math.round(p.centerY * H - scene.main.height / 2);
    scene.colours = { red: brand.colors.glitchRed, cyan: brand.colors.glitchCyan };
    scene.split = Math.max(1, Math.round(settings.rgbSplit * H));
    scene.flash = Math.min(settings.flashFrames, frames);
    scene.glitchEnd = secondsToFrames(settings.glitchSeconds, fps);
    const r = settings.suffixRevealSeconds;
    scene.reveal = { from: r.from * fps, to: r.to * fps, steps: r.steps };
    scene.micro = Math.round(frames * settings.microGlitchAt);
    scene.info = { profile, logo: file, suffix: params.suffix || null, widthPx: mark.width, heightPx: mark.height, box: { x: scene.x + pad, y: scene.y + pad, w: mark.width, h: mark.height } };
  },
  renderAt(scene, frame) {
    const { ctx, brand, settings, width: W, height: H, main, suffix, x, y, colours, split } = scene;
    ctx.fillStyle = brand.colors.black;
    ctx.fillRect(0, 0, W, H);
    if (frame < scene.flash) {
      ctx.fillStyle = brand.colors.pureWhite;
      ctx.fillRect(0, 0, W, H);
      const rnd = prng(frame * 7919 + 11);
      ctx.fillStyle = brand.colors.black;
      for (let i = 0; i < 5; i++) ctx.fillRect(0, rnd() * H, W * (0.3 + rnd() * 0.7), H * (0.01 + rnd() * 0.05));
      return `flash:${frame}`;
    }
    const revealed = suffix ? clamp(Math.floor(((frame - scene.reveal.from) / (scene.reveal.to - scene.reveal.from)) * scene.reveal.steps) / scene.reveal.steps) : 0;
    const drawSuffix = (draw) => {
      if (!suffix || revealed <= 0) return;
      ctx.save();
      ctx.beginPath();
      ctx.rect(x + scene.suffixFrom, 0, scene.suffixWidth * revealed + split * 2, H);
      ctx.clip();
      draw(suffix);
      ctx.restore();
    };
    const glow = settings.glowRadius * H;
    if (frame < scene.glitchEnd) {
      const p = (frame - scene.flash) / Math.max(1, scene.glitchEnd - scene.flash);
      const intensity = 1 - easeInOutCubic(clamp(p));
      for (const img of [main]) {
        drawGlow(ctx, img, x, y, glow, settings.glowAlpha);
        drawBlockGlitch(ctx, img, x, y, { seed: frame * 131 + 3, intensity: intensity * 0.35, colours });
      }
      ctx.save();
      ctx.globalAlpha = 0.6;
      drawRgbSplit(ctx, main, x, y, split + H * 0.008 * intensity, colours);
      ctx.restore();
      drawSuffix((img) => drawRgbSplit(ctx, img, x, y, split, colours));
      return `glitch:${frame}`;
    }
    const micro = Math.abs(frame - scene.micro) <= 1;
    drawGlow(ctx, main, x, y, glow, settings.glowAlpha);
    if (micro) drawBlockGlitch(ctx, main, x, y, { seed: frame * 977 + 5, intensity: 0.12, colours });
    else drawRgbSplit(ctx, main, x, y, split, colours);
    drawSuffix((img) => {
      drawGlow(ctx, img, x, y, glow, settings.glowAlpha);
      drawRgbSplit(ctx, img, x, y, split, colours);
    });
    return micro ? `micro:${frame}` : `steady:${revealed}`;
  },
});
