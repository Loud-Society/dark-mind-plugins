// Dark Mind brand pack – endcard (Phase 6 WP3, 16:9): the AI-generated black-and-white sticker wall (brand-assets/images,
// "cover" to the frame) with three black sticker labels on the left – the wordmark, "subscribe." and "thank you!"
// (Neuborn) – slapped on one after another with a short glitch. The YouTube end-screen zone on the right stays free.
// Parameters: image (asset id of an endcard background; default from brand.json).

import { blockAssets } from './blocks.mjs';
import { drawCover } from './motion.mjs';
import { PACK, boot, drawBlockGlitch, fontForCap, fontString, loadImage, rasterize } from './scene.mjs';

function sticker(brand, settings, label, H, wordmark) {
  const h = Math.round(label.height * H);
  const pad = Math.round(settings.labelPadding * h);
  const ink = brand.colors[settings.inkColor] ?? settings.inkColor;
  let content;
  if (label.kind === 'wordmark') {
    const wm = brand.logo.wordmark;
    const mh = h * settings.labelWordmarkHeight;
    content = rasterize(wordmark, (mh * wm.width) / wm.height, wm.width / wm.height);
  } else {
    const size = fontForCap(brand, settings.face, (label.cap ?? settings.labelCap) * h);
    const m = document.createElement('canvas').getContext('2d');
    m.font = fontString(brand, settings.face, size);
    const metrics = m.measureText(label.text);
    content = document.createElement('canvas');
    content.width = Math.ceil(metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight) + 2;
    content.height = Math.ceil(metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) + 2;
    const c = content.getContext('2d');
    c.font = m.font;
    c.fillStyle = ink;
    c.fillText(label.text, metrics.actualBoundingBoxLeft + 1, metrics.actualBoundingBoxAscent + 1);
  }
  const box = document.createElement('canvas');
  box.width = content.width + 2 * pad;
  box.height = h;
  const b = box.getContext('2d');
  b.fillStyle = brand.colors[settings.labelColor] ?? settings.labelColor;
  b.fillRect(0, 0, box.width, box.height);
  b.drawImage(content, pad, Math.round((h - content.height) / 2));
  // rotated copy in its bounding box
  const a = (label.angle * Math.PI) / 180;
  const rw = Math.ceil(Math.abs(box.width * Math.cos(a)) + Math.abs(box.height * Math.sin(a))) + 2;
  const rh = Math.ceil(Math.abs(box.width * Math.sin(a)) + Math.abs(box.height * Math.cos(a))) + 2;
  const rot = document.createElement('canvas');
  rot.width = rw;
  rot.height = rh;
  const r = rot.getContext('2d');
  r.translate(rw / 2, rh / 2);
  r.rotate(a);
  r.drawImage(box, -box.width / 2, -box.height / 2);
  return rot;
}

boot({
  block: 'endcard',
  text: (scene) => scene.settings.labels.filter((l) => l.kind === 'text').map((l) => l.text).join(''),
  async init(scene) {
    const { brand, settings, params, width: W, height: H, fps } = scene;
    const [image] = blockAssets(brand, 'endcard', params).images;
    scene.background = await loadImage(new URL(`assets/images/${image.id}.jpg`, PACK));
    const wordmark = await loadImage(new URL(`assets/${brand.logo.wordmark.file}`, PACK));
    scene.labels = settings.labels.map((label) => {
      const canvas = sticker(brand, settings, label, H, wordmark);
      return { canvas, x: Math.round(label.x * W), y: Math.round(label.y * H), from: Math.round(label.appearSeconds * fps) };
    });
    scene.colours = { red: brand.colors.glitchRed, cyan: brand.colors.glitchCyan };
    scene.info = { image: image.id, labels: scene.labels.map((l) => ({ x: l.x, y: l.y, w: l.canvas.width, h: l.canvas.height, from: l.from })) };
  },
  renderAt(scene, frame) {
    const { ctx, settings, width: W, height: H } = scene;
    drawCover(ctx, scene.background, W, H);
    const state = [];
    for (const [i, label] of scene.labels.entries()) {
      const k = frame - label.from;
      if (k < 0) {
        state.push('-');
        continue;
      }
      if (k < settings.glitchFrames) {
        drawBlockGlitch(ctx, label.canvas, label.x, label.y, { seed: i * 271 + k * 31 + 1, intensity: 0.12 * (1 - k / settings.glitchFrames), colours: scene.colours });
        state.push(`g${k}`);
      } else {
        ctx.drawImage(label.canvas, label.x, label.y);
        state.push('+');
      }
    }
    return state.join('');
  },
});
