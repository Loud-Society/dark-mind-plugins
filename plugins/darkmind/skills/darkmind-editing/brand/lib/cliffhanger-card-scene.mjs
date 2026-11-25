// Dark Mind brand pack – cliffhanger_card (Phase 6 WP5, 16:9): the Never Ending Interview call to action at the end of
// the chain (b7IxT-OI2fQ 21:35, ~5 s): "SUBSCRIBE to find out if the question goes to NEXT and if they will answer…"
// right-aligned top right over a darkened still (or black), optionally the open question quoted below.
// Parameters: next, question, image (frame { sourceId | extensionId, in, crop? }; render.mjs extracts it).

import { cliffhangerText } from './blocks.mjs';
import { cardPhase, drawItems, inkUnion, measure, textItem } from './cards.mjs';
import { secondsToFrames } from './layout.mjs';
import { drawCover } from './motion.mjs';
import { boot, loadImage, projectUrl } from './scene.mjs';

boot({
  block: 'cliffhanger_card',
  text: (scene) => scene.texts,
  async init(scene) {
    const { brand, settings, params, width: W, height: H, fps } = scene;
    const { headline, lines, question, issues } = cliffhangerText(params, settings);
    if (issues.length) throw new Error(`cliffhanger_card: ${issues.join('; ')}`);
    // one scale for the whole block: the widest line fits maxWidth
    const rows = [
      { face: settings.headlineFace, cap: settings.headlineCap * H, text: headline, split: true },
      ...lines.map((text) => ({ face: settings.textFace, cap: settings.textCap * H, text, split: false })),
      ...(question ?? []).map((text, i) => ({ face: settings.questionFace, cap: settings.questionCap * H, text, split: false, question: i === 0 })),
    ];
    const widest = Math.max(...rows.map((r) => measure(brand, r.face, r.cap, r.text).width / (settings.maxWidth * W)));
    const scale = Math.min(1, 1 / widest);
    if (scale < 0.6) throw new Error('cliffhanger_card: the text is too wide even at the minimum size; shorten the band name or the question');
    const split = Math.max(1, Math.round(settings.rgbSplit * H));
    const pad = split * 4 + 4;
    const right = settings.right * W;
    let baseline = settings.top * H;
    scene.items = rows.map((row, i) => {
      const cap = row.cap * scale;
      const previous = rows[i - 1];
      baseline += i === 0 ? cap : (row.question ? 2 : 1) * (settings.lineHeight - 1) * previous.cap * scale + cap;
      return { ...textItem(brand, { face: row.face, cap, text: row.text, align: 'right', x: right, baseline, pad }), split: row.split };
    });
    scene.image = params.images?.length ? await loadImage(projectUrl(params.images[0])) : null;
    scene.split = split;
    scene.colours = { red: brand.colors.glitchRed, cyan: brand.colors.glitchCyan };
    scene.inFrames = secondsToFrames(settings.glitchInSeconds, fps);
    scene.outFrames = secondsToFrames(settings.glitchOutSeconds, fps);
    scene.texts = rows.map((r) => r.text).join('');
    scene.info = { headline, lines, question, scale, image: Boolean(scene.image), text: inkUnion(scene.items) };
  },
  renderAt(scene, frame) {
    const { ctx, brand, settings, width: W, height: H, frames } = scene;
    ctx.fillStyle = brand.colors.pureBlack;
    ctx.fillRect(0, 0, W, H);
    if (scene.image) {
      ctx.save();
      ctx.filter = `brightness(${settings.imageBrightness})`;
      drawCover(ctx, scene.image, W, H);
      ctx.restore();
    }
    return drawItems(ctx, scene.items, { frame, phase: cardPhase(frame, frames, scene.inFrames, scene.outFrames), split: scene.split, colours: scene.colours });
  },
});
