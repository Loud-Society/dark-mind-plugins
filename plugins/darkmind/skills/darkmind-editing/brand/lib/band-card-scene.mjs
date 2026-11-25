// Dark Mind brand pack – band_card (Phase 6 WP5, 16:9 and 9:16): the Never Ending Interview band card – one or two lines
// as written (names in capitals, the band or "x NAME" below) with a steady RGB split on black, and a still of the
// interview in the image box ("cover", soft fade into black on the text side), yt-long/07 "EVIL JARED x KROGI". Chevron
// wipes reveal and leave it (the card is an extension input of the wipes). Glitch-in over a few frames, then still.
// Parameters: lines, image (frame { sourceId | extensionId, in, crop? }; render.mjs extracts it). Texts are data.

import { bandCardLines } from './blocks.mjs';
import { drawItems, fitCap, inkUnion, textItem } from './cards.mjs';
import { profileOf } from './layout.mjs';
import { boot, loadImage, projectUrl } from './scene.mjs';

/** Draws `img` covering the box { x, y, w, h } (centred, aspect kept). */
function coverBox(ctx, img, box) {
  const s = Math.max(box.w / img.naturalWidth, box.h / img.naturalHeight);
  const w = img.naturalWidth * s;
  const h = img.naturalHeight * s;
  ctx.save();
  ctx.beginPath();
  ctx.rect(box.x, box.y, box.w, box.h);
  ctx.clip();
  ctx.drawImage(img, box.x + (box.w - w) / 2, box.y + (box.h - h) / 2, w, h);
  ctx.restore();
}

boot({
  block: 'band_card',
  text: (scene) => scene.lines.join(''),
  async init(scene) {
    const { brand, settings, params, width: W, height: H } = scene;
    const profile = profileOf(brand, W, H);
    const p = settings.profiles[profile];
    if (!p) throw new Error(`band_card has no layout for ${W} × ${H}`);
    const { lines, issues } = bandCardLines(params, settings);
    if (issues.length) throw new Error(`band_card: ${issues.join('; ')}`);
    const cap = fitCap(brand, settings.face, p.capHeight * H, p.minCapHeight * H, lines, p.maxWidth * W, 'a line of the band card');
    const pitch = cap * (1 + settings.lineGap);
    const top = p.centerY * H - (cap + (lines.length - 1) * pitch) / 2;
    const split = Math.max(1, Math.round(settings.rgbSplit * H));
    const pad = split * 4 + 4;
    scene.items = lines.map((text, i) => ({ ...textItem(brand, { face: settings.face, cap, text, align: 'left', x: p.textLeft * W, baseline: top + cap + i * pitch, pad }), split: true }));
    scene.lines = lines;
    scene.box = { x: p.image.left * W, y: p.image.top * H, w: (p.image.right - p.image.left) * W, h: (p.image.bottom - p.image.top) * H };
    scene.fade = { landscape: profile === 'landscape', size: p.image.fade * (profile === 'landscape' ? W : H) };
    scene.image = params.images?.length ? await loadImage(projectUrl(params.images[0])) : null;
    scene.split = split;
    scene.colours = { red: brand.colors.glitchRed, cyan: brand.colors.glitchCyan };
    scene.info = { profile, lines, cap, image: Boolean(scene.image), box: scene.box, text: inkUnion(scene.items) };
  },
  renderAt(scene, frame) {
    const { ctx, brand, settings, width: W, height: H, box, fade } = scene;
    ctx.fillStyle = brand.colors.pureBlack;
    ctx.fillRect(0, 0, W, H);
    if (scene.image) {
      coverBox(ctx, scene.image, box);
      // soft fade of the picture into black on the text side
      const black = brand.colors.pureBlack;
      const g = fade.landscape ? ctx.createLinearGradient(box.x, 0, box.x + fade.size, 0) : ctx.createLinearGradient(0, box.y + box.h, 0, box.y + box.h - fade.size);
      g.addColorStop(0, black);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      if (fade.landscape) ctx.fillRect(box.x, box.y, fade.size, box.h);
      else ctx.fillRect(box.x, box.y + box.h - fade.size, box.w, fade.size);
    }
    const phase = frame < settings.glitchFrames ? { k: frame, n: settings.glitchFrames, dir: 'in' } : null;
    return drawItems(ctx, scene.items, { frame, phase, split: scene.split, colours: scene.colours });
  },
});
