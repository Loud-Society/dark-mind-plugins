// Dark Mind brand pack – format_card (Phase 6 WP5, 16:9): text card on black for the Never Ending Interview – the format
// explainer (title in capitals with RGB split + up to three short sentences, b7IxT-OI2fQ 00:11–00:17) or the transition
// ("Our starting question comes from none other than…", 00:17–00:20). Glitch-in, hold, glitch-out.
// Parameters: title, text (sentence or list of sentences). Texts are data, never evaluated.

import { formatCardText } from './blocks.mjs';
import { cardPhase, drawItems, fitCap, inkUnion, textItem } from './cards.mjs';
import { secondsToFrames } from './layout.mjs';
import { boot } from './scene.mjs';

boot({
  block: 'format_card',
  text: (scene) => scene.texts,
  async init(scene) {
    const { brand, settings, params, width: W, height: H, fps } = scene;
    const { title, lines, issues } = formatCardText(params, settings);
    if (issues.length) throw new Error(`format_card: ${issues.join('; ')}`);
    const maxWidth = settings.maxWidth * W;
    const titleCap = title ? fitCap(brand, settings.titleFace, settings.titleCap * H, settings.textCap * H, [title], maxWidth, 'the title') : 0;
    const textCap = lines.length ? fitCap(brand, settings.textFace, settings.textCap * H, settings.minTextCap * H, lines, maxWidth, 'a line of the text') : 0;
    const pitch = textCap * settings.lineHeight;
    const gap = title && lines.length ? titleCap * settings.titleGap : 0;
    const height = titleCap + gap + (lines.length ? textCap + (lines.length - 1) * pitch : 0);
    let baseline = settings.centerY * H - height / 2;
    const split = Math.max(1, Math.round(settings.rgbSplit * H));
    const pad = split * 4 + 4;
    const items = [];
    if (title) {
      baseline += titleCap;
      items.push({ ...textItem(brand, { face: settings.titleFace, cap: titleCap, text: title, align: 'center', x: W / 2, baseline, pad }), split: true });
      baseline += gap;
    }
    for (const [i, line] of lines.entries()) {
      const at = baseline + textCap + i * pitch;
      items.push({ ...textItem(brand, { face: settings.textFace, cap: textCap, text: line, fill: 'white', align: 'center', x: W / 2, baseline: at, pad }), split: false });
    }
    scene.items = items;
    scene.split = split;
    scene.colours = { red: brand.colors.glitchRed, cyan: brand.colors.glitchCyan };
    scene.inFrames = secondsToFrames(settings.glitchInSeconds, fps);
    scene.outFrames = secondsToFrames(settings.glitchOutSeconds, fps);
    scene.texts = `${title ?? ''}${lines.join('')}`;
    scene.info = { title, lines, titleCap, textCap, text: inkUnion(items) };
  },
  renderAt(scene, frame) {
    const { ctx, brand, width: W, height: H, frames } = scene;
    ctx.fillStyle = brand.colors.pureBlack;
    ctx.fillRect(0, 0, W, H);
    return drawItems(ctx, scene.items, { frame, phase: cardPhase(frame, frames, scene.inFrames, scene.outFrames), split: scene.split, colours: scene.colours });
  },
});
