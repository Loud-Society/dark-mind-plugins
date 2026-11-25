// Dark Mind brand pack – caption overlays read from captions.json (Phase 6 WP2): caption_word (9:16, word by word,
// keyword pop), caption_phrase (9:16, up to 2 × 32 characters) and subtitles_16x9 (16:9, up to 2 lines).
// Output frame k shows timeline frame startFrame + k. Captions are data, never evaluated.

import { breakLines, captionAt, checkCaptions, color, lineLimits, popScale, textOfCaptions, wordGroups, wordStateAt } from './layout.mjs';
import { boot, fontForCap, fontString, shadowText } from './scene.mjs';

export function mountCaptions(block) {
  let captions;
  let groups;
  let startFrame;
  const lineCache = new Map();

  boot({
    block,
    async init(scene) {
      const { params, settings, fps } = scene;
      const doc = await scene.fetchJson(scene.projectUrl(params.captions ?? 'captions.json'));
      const issues = checkCaptions(doc, block, settings);
      if (issues.length) throw new Error(`captions.json cannot be rendered by ${block}:\n${issues.map((i) => `  ${i.id ?? 'captions.json'}: ${i.message}`).join('\n')}`);
      captions = [...doc.captions].sort((a, b) => a.start - b.start);
      startFrame = params.startFrame ?? 0;
      if (block === 'caption_word') groups = wordGroups(captions, settings, fps);
      scene.captionsText = textOfCaptions(doc);
      scene.info = { captions: captions.length, ...(groups ? { groups: groups.length } : {}) };
    },
    text: (scene) => scene.captionsText,
    renderAt(scene, frame) {
      const t = startFrame + frame;
      return block === 'caption_word' ? drawWords(scene, t) : drawLines(scene, t);
    },
  });

  function drawWords(scene, t) {
    const { ctx, settings, brand, height: H, width: W } = scene;
    const state = wordStateAt(groups, t, settings);
    if (!state) return 'empty';
    const base = fontForCap(brand, settings.face, settings.capHeight * H);
    const space = base * settings.wordSpacing;
    // the group is fitted once with every emphasised word at its peak pop size, so it never leaves the safe area
    const peak = state.group.words.map((w) => (w.emphasis ? settings.popScale : 1));
    const measure = (scales) =>
      state.group.words.map((w, i) => {
        ctx.font = fontString(brand, settings.face, base * scales[i]);
        return ctx.measureText(w.text).width;
      });
    const peakWidths = measure(peak);
    const fit = Math.min(1, (settings.maxWidth * W) / (peakWidths.reduce((a, b) => a + b, 0) + space * (peakWidths.length - 1)));
    const scales = state.group.words.map((w, i) => (w.emphasis ? (state.pops[i] !== null ? popScale(settings, state.pops[i]) : settings.emphasisScale) : 1) * fit);
    const widths = measure(scales);
    const total = widths.reduce((a, b) => a + b, 0) + space * fit * (widths.length - 1);
    let x = W / 2 - total / 2;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    state.group.words.forEach((word, i) => {
      if (t >= word.start) {
        ctx.font = fontString(brand, settings.face, base * scales[i]);
        shadowText(ctx, word.text, x, settings.centerY * H, { fill: color(brand, settings.color), shadow: brand.colors.shadow, shadowAlpha: settings.shadowAlpha, offset: Math.max(1, Math.round(settings.shadowOffset * H)) });
      }
      x += widths[i] + space * fit;
    });
    return state.key;
  }

  function drawLines(scene, t) {
    const { ctx, settings, brand, height: H, width: W } = scene;
    const caption = captionAt(captions, t);
    if (!caption) return 'empty';
    let layout = lineCache.get(caption.id);
    if (!layout) {
      const { lines } = breakLines(caption.text, lineLimits(settings));
      // shrink only if the measured lines are wider than the area (character limits keep this rare)
      let size = fontForCap(brand, settings.face, settings.capHeight * H);
      ctx.font = fontString(brand, settings.face, size);
      const widest = Math.max(...lines.map((l) => ctx.measureText(l).width));
      if (widest > settings.maxWidth * W) size = Math.max(fontForCap(brand, settings.face, settings.minCapHeight * H), (size * settings.maxWidth * W) / widest);
      ctx.font = fontString(brand, settings.face, size);
      if (Math.max(...lines.map((l) => ctx.measureText(l).width)) > settings.maxWidth * W + 0.5) {
        throw new Error(`caption ${caption.id} is too wide for ${block} even at the minimum font size; shorten or split it`);
      }
      layout = { lines, size };
      lineCache.set(caption.id, layout);
    }
    ctx.font = fontString(brand, settings.face, layout.size);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    const lineHeight = layout.size * settings.lineHeight;
    const offset = Math.max(1, Math.round(settings.shadowOffset * H));
    layout.lines.forEach((line, i) => {
      const y = settings.bottom * H - (layout.lines.length - 1 - i) * lineHeight;
      shadowText(ctx, line, W / 2, y, { fill: color(brand, settings.color), shadow: brand.colors.shadow, shadowAlpha: settings.shadowAlpha, offset });
    });
    return `c:${caption.id}`;
  }
}
