// Dark Mind brand pack – chevron_wipe (Phase 6 WP3): a giant white chevron sweeps left to right (motion blur, orange/blue
// fringe). With parameters a and b it is a transition: shot A, and behind the chevron's leading edge – also in its
// notch – already shot B (frames extracted by render.mjs with the render core's frame choice); the output is the
// finished, opaque transition piece. Without a/b it is an alpha overlay of the chevron alone (over a hard cut).

import { chevronPolygon, drawChevronWipe, easeInOutCubic, wipeMattePath } from './motion.mjs';
import { boot, clamp, loadImage, projectUrl } from './scene.mjs';

boot({
  block: 'chevron_wipe',
  async init(scene) {
    const { brand, settings, params, frames, fps } = scene;
    scene.chevron = chevronPolygon(brand);
    scene.transition = Boolean(params.frames);
    scene.options = {
      shutter: settings.shutterFrames / fps,
      samples: settings.motionSamples,
      fringe: settings.fringe,
      fringeAlpha: settings.fringeAlpha,
      heightOfFrame: settings.heightOfFrame,
      colors: { white: brand.colors[settings.color] ?? settings.color, orange: brand.colors.fringeOrange, blue: brand.colors.fringeBlue },
    };
    const d = frames / fps;
    scene.progressAt = (ts) => easeInOutCubic(clamp(ts / d));
    scene.info = { transition: scene.transition, direction: settings.direction };
  },
  async renderAt(scene, frame) {
    const { ctx, width: W, height: H, fps, chevron, options, params } = scene;
    const t = (frame + 0.5) / fps;
    if (scene.transition) {
      const name = `${String(frame).padStart(5, '0')}.png`;
      const [a, b] = await Promise.all([loadImage(projectUrl(`${params.frames.a}${name}`)), loadImage(projectUrl(`${params.frames.b}${name}`))]);
      ctx.drawImage(a, 0, 0, W, H);
      ctx.save();
      wipeMattePath(ctx, chevron, W, H, scene.progressAt(t), options.heightOfFrame);
      ctx.clip();
      ctx.drawImage(b, 0, 0, W, H);
      ctx.restore();
    }
    drawChevronWipe(ctx, chevron, W, H, scene.progressAt, t, options);
    return null;
  },
});
