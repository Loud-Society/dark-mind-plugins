// Dark Mind brand pack – pure layout and timing rules of the text blocks (Phase 6 WP2).
// Runs in the browser scenes and in Node (tests, render preflight): no DOM, no I/O, no randomness.
// Text is data: it is measured and drawn, never evaluated.

export const TEXT_BLOCKS = ['caption_word', 'caption_phrase', 'subtitles_16x9', 'lower_third', 'wordmark_flash', 'title_card'];
export const CAPTION_BLOCKS = { caption_word: 'brand-word', caption_phrase: 'brand-phrase', subtitles_16x9: 'brand-16x9' };

/** "30/1", "25" → frames per second (whole rates only, like the format contract). */
export function parseFps(fps) {
  const [n, d = '1'] = String(fps).split('/');
  const value = Number(n) / Number(d);
  if (!Number.isFinite(value) || value <= 0) throw new Error(`invalid frame rate "${fps}"`);
  return value;
}

/** Profile of an output size: "vertical" (1080 × 1920) or "landscape" (1920 × 1080), else null. */
export function profileOf(brand, width, height) {
  for (const [name, profile] of Object.entries(brand.profiles)) if (profile.width === width && profile.height === height) return name;
  return null;
}

export function color(brand, name) {
  return brand.colors[name] ?? name;
}

/** Seconds → whole frames (round half up). */
export function secondsToFrames(seconds, fps) {
  return Math.floor(seconds * fps + 0.5);
}

const PUNCTUATION_END = /[.,!?;:…–—-]$/;
const normalizeSpaces = (text) => text.replace(/[\t ]+/g, ' ').trim();
const charCount = (text) => [...text].length;
const length = (words) => words.reduce((a, w) => a + charCount(w), 0) + Math.max(0, words.length - 1);

/**
 * Line breaks of a caption by character count (deterministic, independent of the font): explicit "\n" in the caption
 * are kept; a line longer than `maxChars` is wrapped at word boundaries into as few lines as possible, balanced
 * (shortest longest line; ties: break after punctuation, then the longer line at the bottom).
 * Returns { lines, overflow } – overflow names why the text does not fit (more than maxLines, a word longer than
 * maxChars); the block refuses such captions instead of dropping text.
 */
export function breakLines(text, { maxChars, maxLines }) {
  const lines = [];
  for (const explicit of String(text).split(/\r?\n/).map(normalizeSpaces).filter(Boolean)) {
    const words = explicit.split(' ');
    const long = words.find((w) => charCount(w) > maxChars);
    if (long) return { lines: [], overflow: `the word "${long}" is longer than ${maxChars} characters` };
    lines.push(...wrapBalanced(words, maxChars));
  }
  if (lines.length > maxLines) return { lines, overflow: `needs ${lines.length} lines of at most ${maxChars} characters (allowed: ${maxLines}); split the caption` };
  return { lines, overflow: null };
}

function wrapBalanced(words, maxChars) {
  if (length(words) <= maxChars) return [words.join(' ')];
  // fewest lines first (greedy count), then the balanced split for exactly that many lines
  let count = 0;
  for (let i = 0; i < words.length; count++) {
    let j = i + 1;
    while (j < words.length && length(words.slice(i, j + 1)) <= maxChars) j++;
    i = j;
  }
  return bestSplit(words, count, maxChars).map((part) => part.join(' '));
}

/** Split into exactly `count` lines minimising the longest line (dynamic programming over break positions). */
function bestSplit(words, count, maxChars) {
  const n = words.length;
  const memo = new Map();
  const solve = (start, lines) => {
    const key = `${start}:${lines}`;
    if (memo.has(key)) return memo.get(key);
    let best = null;
    if (lines === 1) {
      const len = length(words.slice(start));
      best = len <= maxChars ? { worst: len, breaks: [], score: 0 } : null;
    } else {
      for (let end = start + 1; end <= n - (lines - 1); end++) {
        const len = length(words.slice(start, end));
        if (len > maxChars) break;
        const rest = solve(end, lines - 1);
        if (!rest) continue;
        const worst = Math.max(len, rest.worst);
        // tie breaks: punctuation at the break, then a shorter upper line (bottom-heavy)
        const score = rest.score + (PUNCTUATION_END.test(words[end - 1]) ? 0 : 2) + (len > length(words.slice(end)) ? 1 : 0);
        if (!best || worst < best.worst || (worst === best.worst && score < best.score)) best = { worst, breaks: [end, ...rest.breaks], score };
      }
    }
    memo.set(key, best);
    return best;
  };
  const result = solve(0, count);
  const parts = [];
  let from = 0;
  for (const end of [...result.breaks, n]) {
    parts.push(words.slice(from, end));
    from = end;
  }
  return parts;
}

/**
 * Word groups of brand word captions (1–3 words): a new group starts after maxWords, before and after an emphasised
 * word (it stands alone), after punctuation, after a pause longer than pauseSeconds and when the group would exceed
 * maxChars. A group shows from its first word's start frame until the next group of the same caption starts (or the
 * caption ends); inside a group the words appear one by one at their own start frames. A caption without words (scene
 * text) shows as one static group.
 */
export function wordGroups(captions, settings, fps) {
  const groups = [];
  const pause = secondsToFrames(settings.pauseSeconds, fps);
  const sorted = [...captions].sort((a, b) => a.start - b.start);
  for (const caption of sorted) {
    const words = caption.words ?? [];
    if (!words.length) {
      groups.push({ captionId: caption.id, start: caption.start, end: caption.end, emphasis: false, words: [{ text: normalizeSpaces(caption.text.replace(/\r?\n/g, ' ')), start: caption.start, end: caption.end, emphasis: false }] });
      continue;
    }
    let group = null;
    words.forEach((word, i) => {
      const prev = words[i - 1];
      const emphasis = Boolean(word.emphasis);
      const chars = group ? length([...group.words.map((w) => w.text), word.text]) : 0;
      if (!group || group.words.length >= settings.maxWords || emphasis || group.emphasis || (prev && PUNCTUATION_END.test(prev.text)) || (prev && word.start - prev.end > pause) || chars > settings.maxChars) {
        group = { captionId: caption.id, start: word.start, end: undefined, words: [], emphasis };
        groups.push(group);
      }
      group.words.push({ text: word.text, start: word.start, end: word.end, emphasis });
    });
  }
  const captionEnd = new Map(sorted.map((c) => [c.id, c.end]));
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    if (group.end !== undefined) continue;
    const next = groups[i + 1];
    group.end = next && next.captionId === group.captionId ? next.start : captionEnd.get(group.captionId);
  }
  return groups;
}

/** Pop scale of an emphasised word k frames after its start: popScale → emphasisScale, exactly constant after popFrames. */
export function popScale(settings, k) {
  if (k >= settings.popFrames) return settings.emphasisScale;
  const t = Math.max(0, k) / settings.popFrames;
  return settings.emphasisScale + (settings.popScale - settings.emphasisScale) * (1 - t) * (1 - t);
}

/** State of the word captions at a frame: the group, the visible words and the running pops (complete state key, R4). */
export function wordStateAt(groups, frame, settings) {
  const group = groups.find((g) => frame >= g.start && frame < g.end);
  if (!group) return null;
  const visible = group.words.filter((w) => frame >= w.start).length;
  const pops = group.words.map((w) => (w.emphasis && frame >= w.start && frame - w.start < settings.popFrames ? frame - w.start : null));
  return { group, visible, pops, key: `${group.captionId}@${group.start}:${visible}:${pops.map((p) => p ?? '').join(',')}` };
}

export function captionAt(captions, frame) {
  return captions.find((c) => frame >= c.start && frame < c.end) ?? null;
}

/**
 * Preflight of a caption block against captions.json: style, word timings, line limits. Returns issues
 * [{ id, message }] – the block refuses to render while there are any (nothing is dropped or guessed).
 */
export function checkCaptions(doc, block, settings) {
  const issues = [];
  const expected = CAPTION_BLOCKS[block];
  if (doc.style !== expected) issues.push({ id: null, message: `captions.json has style "${doc.style}"; block ${block} renders style "${expected}" (set "style": "${expected}")` });
  for (const caption of doc.captions) {
    if (block === 'caption_word') {
      if (caption.words?.length) continue;
      if (caption.statementId !== undefined) issues.push({ id: caption.id, message: 'needs word timings (MCP get_word_timings → darkmind-agent captions-words)' });
      else {
        const { overflow } = breakLines(caption.text, { maxChars: settings.maxChars, maxLines: 1 });
        if (overflow) issues.push({ id: caption.id, message: `a scene caption without words is shown as one group: ${overflow}` });
      }
    } else {
      const { overflow } = breakLines(caption.text, lineLimits(settings));
      if (overflow) issues.push({ id: caption.id, message: overflow });
    }
  }
  return issues;
}

/** Font faces a block draws with (from brand.json; add-block declares exactly these files). */
export function blockFaces(brand, block) {
  const s = brand.blocks[block];
  if (block === 'lower_third') return [...new Set([s.nameFace, s.roleFace])];
  if (block === 'title_card') return [...new Set([s.face, s.presentsFace])];
  if (block === 'wordmark_flash') return [];
  return [s.face];
}

/** Line limits of the phrase/subtitle blocks for breakLines. */
export function lineLimits(settings) {
  return { maxChars: settings.maxCharsPerLine, maxLines: settings.maxLines };
}

/** Characters a caption block will draw (for the glyph coverage check). */
export function textOfCaptions(doc) {
  return doc.captions.map((c) => `${c.text}${(c.words ?? []).map((w) => w.text).join('')}`).join('');
}

/** Rectangle {x, y, w, h} in pixels against the safe area of a profile (fractions); returns the overshoot or null. */
export function outsideSafe(rect, safe, width, height) {
  const out = [];
  if (rect.x < safe.left * width - 0.5) out.push(`left by ${(safe.left * width - rect.x).toFixed(1)} px`);
  if (rect.x + rect.w > safe.right * width + 0.5) out.push(`right by ${(rect.x + rect.w - safe.right * width).toFixed(1)} px`);
  if (rect.y < safe.top * height - 0.5) out.push(`top by ${(safe.top * height - rect.y).toFixed(1)} px`);
  if (rect.y + rect.h > safe.bottom * height + 0.5) out.push(`bottom by ${(rect.y + rect.h - safe.bottom * height).toFixed(1)} px`);
  return out.length ? out.join(', ') : null;
}

/** Allowed duration of a timed block in frames ({ min, max, default }) or null (caption overlays follow the timeline). */
export function durationLimits(brand, block, fps) {
  const settings = brand.blocks[block];
  if (block === 'lower_third') {
    const fixed = settings.glitchInSeconds + settings.glitchOutSeconds;
    const f = (s) => secondsToFrames(s + fixed, fps);
    return { min: f(settings.holdSeconds.min), max: f(settings.holdSeconds.max), default: f(settings.holdSeconds.default) };
  }
  if (settings.seconds) return { min: secondsToFrames(settings.seconds.min, fps), max: secondsToFrames(settings.seconds.max, fps), default: secondsToFrames(settings.seconds.default, fps) };
  return null;
}

/** Lower third people: 1 (9:16) or 1–2 (16:9: guest left, host right); limits from brand.json. */
export function checkPeople(people, settings, profile) {
  const issues = [];
  const max = settings.maxPeople[profile];
  if (!Array.isArray(people) || people.length < 1 || people.length > max) issues.push(`parameters.people needs 1–${max} entries ({ name, role }) for the ${profile} profile`);
  for (const [i, person] of (Array.isArray(people) ? people : []).entries()) {
    if (typeof person?.name !== 'string' || !person.name.trim()) issues.push(`people[${i}].name is required`);
    else if (charCount(person.name.trim()) > settings.nameMaxChars) issues.push(`people[${i}].name is longer than ${settings.nameMaxChars} characters`);
    if (person?.role !== undefined && person.role !== null && typeof person.role !== 'string') issues.push(`people[${i}].role must be text`);
    else if (person?.role && charCount(person.role.trim()) > settings.roleMaxChars) issues.push(`people[${i}].role is longer than ${settings.roleMaxChars} characters`);
  }
  return issues;
}

/** Parameter check of the timed blocks (text limits); returns problems as strings. */
export function checkBlockParameters(brand, block, parameters, profile) {
  const settings = brand.blocks[block];
  const issues = [];
  if (block === 'lower_third') issues.push(...checkPeople(parameters.people, settings, profile));
  if (block === 'title_card') {
    if (typeof parameters.title !== 'string' || !parameters.title.trim()) issues.push('parameters.title is required');
    else if (charCount(parameters.title.trim()) > settings.titleMaxChars) issues.push(`parameters.title is longer than ${settings.titleMaxChars} characters`);
    if (parameters.presents !== undefined && typeof parameters.presents !== 'boolean') issues.push('parameters.presents must be true or false');
    if (parameters.background !== undefined && !['black', 'transparent'].includes(parameters.background)) issues.push('parameters.background must be "black" or "transparent"');
  }
  if (block === 'wordmark_flash' && parameters.centerY !== undefined) {
    const safe = brand.profiles[profile].textSafe;
    if (typeof parameters.centerY !== 'number' || parameters.centerY < safe.top || parameters.centerY > safe.bottom) issues.push(`parameters.centerY must lie in the safe area (${safe.top}–${safe.bottom})`);
  }
  if (CAPTION_BLOCKS[block] && parameters.startFrame !== undefined && (!Number.isInteger(parameters.startFrame) || parameters.startFrame < 0)) issues.push('parameters.startFrame must be a whole frame ≥ 0');
  return issues;
}
