// Dark Mind brand pack – thumbnail (Phase 6 WP4, YouTube 1280 × 720): a frame of the footage in black and white, the
// white chevron at the left edge and a short headline in Neuborn capitals, right-aligned (template of all reference
// thumbnails, doc/mvp/brand/frames/yt-long/10 and 11). The frame is chosen by the editor: render.mjs extracts it with the
// render core's frame choice (T2/T3) and serves it as a derived file. With `candidates` the scene draws 2–4 complete
// thumbnails (A–D) as a 2 × 2 contact sheet, so the editor can choose; the chosen one becomes `frame`.
// Parameters: headline, frame | candidates, contrast. Text is data: it is measured and drawn, never evaluated.

import { gradeValue, headlineLines } from './blocks.mjs';
import { chevronPolygon } from './motion.mjs';
import { boot, fontForCap, fontString, loadImage, projectUrl } from './scene.mjs';

/** Source time of a candidate as m:ss.s ("110" → "1:50.0", "312/25" → "0:12.5"). */
function timecode(value) {
  const [n, d = '1'] = String(value).split('/');
  const seconds = Number(n) / Number(d);
  const tenths = Math.round(seconds * 10);
  return `${Math.floor(tenths / 600)}:${String(Math.floor((tenths % 600) / 10)).padStart(2, '0')}.${tenths % 10}`;
}

/** Black and white: Rec. 709 luma with the thumbnail grade, in place (pure arithmetic on the pixels – deterministic). */
function grade(ctx, W, H, contrast, brightness) {
  const image = ctx.getImageData(0, 0, W, H);
  const d = image.data;
  for (let i = 0; i < d.length; i += 4) {
    const v = gradeValue(d[i], d[i + 1], d[i + 2], contrast, brightness);
    d[i] = v;
    d[i + 1] = v;
    d[i + 2] = v;
    d[i + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);
}

/** Layout of the headline at frame size W × H: cap height (fitted), lines with their ink boxes. */
function headlineLayout(brand, settings, lines, W, H) {
  const h = settings.headline;
  const safe = settings.textSafe;
  const measure = (cap) => {
    const m = document.createElement('canvas').getContext('2d');
    m.font = fontString(brand, settings.face, fontForCap(brand, settings.face, cap));
    return lines.map((text) => {
      const r = m.measureText(text);
      return { text, left: r.actualBoundingBoxLeft, right: r.actualBoundingBoxRight, width: r.actualBoundingBoxLeft + r.actualBoundingBoxRight };
    });
  };
  // the widest line limits the size (width grows linearly with the font size), so does the height of the block
  const max = h.capHeight * H;
  const widest = Math.max(...measure(max).map((l) => l.width));
  const byWidth = (max * h.maxWidth * W) / widest;
  const byHeight = ((safe.bottom - safe.top) * H) / (lines.length + (lines.length - 1) * h.lineGap);
  const cap = Math.min(max, byWidth, byHeight);
  if (cap < h.minCapHeight * H) {
    throw new Error(`the headline is too long for the thumbnail: its cap height would be ${((cap / H) * 100).toFixed(1)} % H (at least ${(h.minCapHeight * 100).toFixed(1)} %); use fewer or shorter words`);
  }
  const pitch = cap * (1 + h.lineGap);
  const top = h.centerY * H - (cap + (lines.length - 1) * pitch) / 2;
  const right = h.right * W;
  const placed = measure(cap).map((line, i) => ({ ...line, baseline: top + cap + i * pitch, x: right - line.right }));
  return { cap, size: fontForCap(brand, settings.face, cap), lines: placed, box: { x: Math.min(...placed.map((l) => l.x - l.left)), y: top, w: right - Math.min(...placed.map((l) => l.x - l.left)), h: cap + (lines.length - 1) * pitch } };
}

/** One complete thumbnail at W × H into a fresh canvas. */
function compose(scene, image) {
  const { brand, settings, width: W, height: H } = scene;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(image, 0, 0, W, H);
  grade(ctx, W, H, scene.contrast, settings.grade.brightness);
  // chevron at the left edge
  const { x: cx, y: cy, w: cw, h: ch } = scene.chevronBox;
  const c = settings.chevron;
  ctx.beginPath();
  scene.chevron.points.forEach(([px, py], i) => (i ? ctx.lineTo(cx + px * cw, cy + py * ch) : ctx.moveTo(cx + px * cw, cy + py * ch)));
  ctx.closePath();
  ctx.fillStyle = brand.colors[c.color] ?? c.color;
  ctx.fill();
  // headline: right-aligned on its ink, soft dark halo for bright frames
  const { layout } = scene;
  const h = settings.headline;
  ctx.font = fontString(brand, settings.face, layout.size);
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = brand.colors[settings.color] ?? settings.color;
  ctx.save();
  ctx.shadowColor = `rgba(0, 0, 0, ${h.shadowAlpha})`;
  ctx.shadowBlur = h.shadowBlur * H;
  for (const line of layout.lines) ctx.fillText(line.text, line.x, line.baseline);
  ctx.restore();
  for (const line of layout.lines) ctx.fillText(line.text, line.x, line.baseline);
  return canvas;
}

boot({
  block: 'thumbnail',
  text: (scene) => `${scene.lines.join('')}${scene.labels.join('')}`,
  async init(scene) {
    const { brand, settings, params, width: W, height: H } = scene;
    const { lines, issues } = headlineLines(params.headline ?? '', settings);
    if (issues.length) throw new Error(`thumbnail headline: ${issues.join('; ')}`);
    scene.lines = lines;
    scene.contrast = params.contrast ?? settings.grade.contrast.default;
    scene.chevron = chevronPolygon(brand);
    const c = settings.chevron;
    const ch = c.height * H;
    scene.chevronBox = { x: c.left * W, y: c.centerY * H - ch / 2, w: ch * scene.chevron.aspect, h: ch };
    scene.images = await Promise.all((params.images ?? []).map((file) => loadImage(projectUrl(file))));
    if (!scene.images.length) throw new Error('no frame to draw (render.mjs extracts parameters.frame or parameters.candidates)');
    scene.sheet = Array.isArray(params.candidates);
    scene.labels = scene.sheet ? params.candidates.map((ref, i) => `${String.fromCharCode(65 + i)}  ${timecode(ref.in)}`) : [];
    scene.layout = headlineLayout(brand, settings, lines, W, H);
    const { layout } = scene;
    scene.info = {
      sheet: scene.sheet,
      lines,
      cap: layout.cap,
      contrast: scene.contrast,
      chevron: { ...scene.chevronBox, apex: scene.chevronBox.x + scene.chevronBox.w },
      text: layout.box,
      lineBoxes: layout.lines.map((l) => ({ x: l.x - l.left, y: l.baseline - layout.cap, w: l.width, h: layout.cap })),
    };
  },
  renderAt(scene) {
    const { ctx, brand, settings, width: W, height: H } = scene;
    if (!scene.sheet) {
      ctx.drawImage(compose(scene, scene.images[0]), 0, 0);
      return 'still';
    }
    // contact sheet: 2 × 2 complete thumbnails at half size, labelled A–D with the source time
    ctx.fillStyle = brand.colors.pureBlack;
    ctx.fillRect(0, 0, W, H);
    const qw = W / 2;
    const qh = H / 2;
    const cap = settings.candidates.labelCap * H;
    scene.images.forEach((image, i) => {
      const x = (i % 2) * qw;
      const y = Math.floor(i / 2) * qh;
      ctx.drawImage(compose(scene, image), x, y, qw, qh);
      ctx.font = fontString(brand, settings.face, fontForCap(brand, settings.face, cap));
      const label = scene.labels[i];
      const width = ctx.measureText(label).width;
      ctx.fillStyle = brand.colors.pureBlack;
      ctx.fillRect(x, y, width + cap, cap * 1.8);
      ctx.fillStyle = brand.colors.pureWhite;
      ctx.fillText(label, x + cap / 2, y + cap * 1.4);
    });
    // thin black separators between the quadrants
    ctx.fillStyle = brand.colors.pureBlack;
    ctx.fillRect(qw - 2, 0, 4, H);
    ctx.fillRect(0, qh - 2, W, 4);
    return 'sheet';
  },
});
