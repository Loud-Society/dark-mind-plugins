// Dark Mind brand pack – characters covered by a TrueType/OpenType font, read from its cmap table (Phase 6 WP2, R6).
// Exact replacement for width comparisons with fallback fonts (those miss characters for which every fallback resolves
// to the same system font, e.g. CJK). Pure: runs in the browser scenes and in Node.

/** Code points mapped to a glyph (glyph index ≠ 0) by the font's Unicode cmap subtable (format 12 or 4). */
export function fontCodePoints(buffer) {
  const view = new DataView(buffer instanceof ArrayBuffer ? buffer : buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));
  const numTables = view.getUint16(4);
  let cmap = -1;
  for (let i = 0; i < numTables; i++) {
    const record = 12 + i * 16;
    const tag = String.fromCharCode(view.getUint8(record), view.getUint8(record + 1), view.getUint8(record + 2), view.getUint8(record + 3));
    if (tag === 'cmap') cmap = view.getUint32(record + 8);
  }
  if (cmap < 0) throw new Error('the font has no cmap table');
  const subtables = [];
  for (let i = 0, n = view.getUint16(cmap + 2); i < n; i++) {
    const record = cmap + 4 + i * 8;
    const platform = view.getUint16(record);
    const encoding = view.getUint16(record + 2);
    const offset = cmap + view.getUint32(record + 4);
    subtables.push({ platform, encoding, offset, format: view.getUint16(offset) });
  }
  const unicode = (s) => s.platform === 0 || (s.platform === 3 && (s.encoding === 1 || s.encoding === 10));
  const table = subtables.find((s) => unicode(s) && s.format === 12) ?? subtables.find((s) => unicode(s) && s.format === 4);
  if (!table) throw new Error('the font has no Unicode cmap subtable (format 4 or 12)');
  const points = new Set();
  const o = table.offset;
  if (table.format === 12) {
    for (let g = 0, n = view.getUint32(o + 12); g < n; g++) {
      const group = o + 16 + g * 12;
      const start = view.getUint32(group);
      const end = view.getUint32(group + 4);
      const glyph = view.getUint32(group + 8);
      for (let c = start; c <= end; c++) if (glyph + (c - start) !== 0) points.add(c);
    }
    return points;
  }
  const segments = view.getUint16(o + 6) / 2;
  const ends = o + 14;
  const starts = ends + segments * 2 + 2;
  const deltas = starts + segments * 2;
  const rangeOffsets = deltas + segments * 2;
  for (let s = 0; s < segments; s++) {
    const end = view.getUint16(ends + s * 2);
    const start = view.getUint16(starts + s * 2);
    const delta = view.getInt16(deltas + s * 2);
    const rangeOffset = view.getUint16(rangeOffsets + s * 2);
    for (let c = start; c <= end && c !== 0xffff; c++) {
      let glyph;
      if (rangeOffset === 0) glyph = (c + delta) & 0xffff;
      else {
        const raw = view.getUint16(rangeOffsets + s * 2 + rangeOffset + (c - start) * 2);
        glyph = raw === 0 ? 0 : (raw + delta) & 0xffff;
      }
      if (glyph !== 0) points.add(c);
    }
  }
  return points;
}

/** Characters of `text` (whitespace ignored) that the font does not cover. */
export function missingCharacters(points, text) {
  return [...new Set([...text.replace(/\s/g, '')])].filter((ch) => !points.has(ch.codePointAt(0)));
}
