// Dark Mind brand pack – glitch_flash (Phase 6 WP3): 1–3 frames of white flash with horizontal glitch bars (black, red,
// cyan), as alpha overlay over a hard cut – besides the chevron wipe the only "soft" transition of the brand.
// Parameters: intensity (0.2–1, flash opacity and bar count), seed (variation, default 0).

import { boot, prng } from './scene.mjs';

boot({
  block: 'glitch_flash',
  async init(scene) {
    const { settings, params } = scene;
    scene.intensity = params.intensity ?? settings.intensity.default;
    scene.seed = params.seed ?? 0;
    scene.info = { intensity: scene.intensity };
  },
  renderAt(scene, frame) {
    const { ctx, brand, settings, width: W, height: H, frames } = scene;
    // strongest on the first frame, fading over the following ones
    const strength = scene.intensity * (1 - frame / (frames + 1));
    const rnd = prng((scene.seed + 1) * 104729 + frame * 7919);
    ctx.globalAlpha = 0.9 * strength;
    ctx.fillStyle = brand.colors.pureWhite;
    ctx.fillRect(0, 0, W, H);
    const colours = [brand.colors.black, brand.colors.glitchRed, brand.colors.glitchCyan];
    const bars = Math.max(1, Math.round(settings.bands * strength));
    for (let i = 0; i < bars; i++) {
      ctx.globalAlpha = 0.55 + 0.45 * rnd();
      ctx.fillStyle = colours[Math.floor(rnd() * colours.length)];
      const h = H * (0.006 + rnd() * 0.04);
      const w = W * (0.25 + rnd() * 0.75);
      ctx.fillRect(rnd() < 0.5 ? 0 : W - w, rnd() * (H - h), w, h);
    }
    ctx.globalAlpha = 1;
    return null;
  },
});
