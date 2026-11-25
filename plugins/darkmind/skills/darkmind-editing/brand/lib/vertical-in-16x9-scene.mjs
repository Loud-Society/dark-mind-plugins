// Dark Mind brand pack – vertical_in_16x9 (Phase 6 WP5): vertical footage (selfie questions of the Never Ending
// Interview) in a 16:9 episode – the clip fitted to the frame height in the middle, the same picture blurred and
// darkened as background (cover). render.mjs extracts the clip's frames at the foreground size with the render core's
// frame choice (T2/T3); the background is drawn from the same frame at a small size, blurred and scaled up
// (deterministic, cheap). Picture only – the statement's dialog clip carries the sound.
// Parameters: clip { sourceId | extensionId, in, out, crop? } (crop with the 9:16 aspect, like timeline crops).

import { boot, loadImage, projectUrl } from './scene.mjs';

boot({
  block: 'vertical_in_16x9',
  async init(scene) {
    const { settings, params, width: W, height: H } = scene;
    if (!params.frames?.clip) throw new Error('no frames of the clip (render.mjs extracts parameters.clip)');
    const bg = settings.background;
    scene.small = document.createElement('canvas');
    scene.small.width = Math.max(2, Math.round(W * bg.scale));
    scene.small.height = Math.max(2, Math.round(H * bg.scale));
    scene.blur = bg.blur * H * bg.scale;
    scene.info = { background: { ...bg, smallWidth: scene.small.width } };
  },
  async renderAt(scene, frame) {
    const { ctx, settings, params, width: W, height: H, small } = scene;
    const img = await loadImage(projectUrl(`${params.frames.clip}${String(frame).padStart(5, '0')}.png`));
    // background: cover into the small canvas, blur and darken there, then scale up to the frame
    const s = small.getContext('2d');
    s.setTransform(1, 0, 0, 1, 0, 0);
    s.filter = 'none';
    s.clearRect(0, 0, small.width, small.height);
    const k = Math.max(small.width / img.naturalWidth, small.height / img.naturalHeight);
    s.filter = `blur(${scene.blur.toFixed(3)}px) brightness(${settings.background.brightness})`;
    s.drawImage(img, (small.width - img.naturalWidth * k) / 2, (small.height - img.naturalHeight * k) / 2, img.naturalWidth * k, img.naturalHeight * k);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    // a little overscan hides the blur's soft edge
    const over = 0.04;
    ctx.drawImage(small, -W * over, -H * over, W * (1 + 2 * over), H * (1 + 2 * over));
    // foreground: the clip fitted to the frame height, centred
    const fh = H;
    const fw = (img.naturalWidth / img.naturalHeight) * fh;
    ctx.drawImage(img, Math.round((W - fw) / 2), 0, Math.round(fw), fh);
    return null;
  },
});
