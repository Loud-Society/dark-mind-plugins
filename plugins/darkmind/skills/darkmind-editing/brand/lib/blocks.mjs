// Dark Mind brand pack – pure rules of all brand blocks (Phase 6 WP2 text blocks, WP3 motion and audio blocks).
// Runs in Node (render preflight, add-block, tests) and in the browser scenes: no DOM, no I/O, no randomness.
// Parameters are data: they are checked and drawn, never evaluated.

import { CAPTION_BLOCKS, TEXT_BLOCKS, blockFaces as textBlockFaces, breakLines, checkBlockParameters, durationLimits as textDurationLimits, secondsToFrames } from './layout.mjs';

/** Picture blocks rendered by the HTML compositor (WP3); logo_sting and logo_end carry sound. */
export const MOTION_BLOCKS = ['logo_sting', 'chevron_wipe', 'glitch_flash', 'logo_end', 'endcard'];
/** Audio-only blocks (extension contract output.video false, WAV), rendered with ffmpeg only. */
export const AUDIO_BLOCKS = ['animal_scream', 'loud_sounds'];
/** Still-image blocks (extension contract output.image, one PNG next to the video, WP4): never on the timeline. */
export const STILL_BLOCKS = ['thumbnail'];
/** Never Ending Interview blocks (WP5): opaque H.264 cards and the vertical-footage step of the 16:9 episode. */
export const NEI_BLOCKS = ['format_card', 'band_card', 'cliffhanger_card', 'vertical_in_16x9'];
/** Every block that becomes an extension. */
export const BLOCKS = [...TEXT_BLOCKS, ...MOTION_BLOCKS, ...AUDIO_BLOCKS, ...STILL_BLOCKS, ...NEI_BLOCKS];
/** Project steps of the brand pack that are not extensions (add-block writes project.json). */
export const PROJECT_STEPS = ['audio_master'];

const ASSET_ID = /^[a-z0-9][a-z0-9._-]{0,79}$/;
const RATIONAL = /^(0|[1-9][0-9]*)(\.[0-9]{1,9})?$|^(0|[1-9][0-9]*)\/[1-9][0-9]*$/;
const SUFFIX = /^[a-z]{2,20}$/;

/** Output kind of a block with these parameters: { video, alpha, audio, image }. */
export function blockOutput(brand, block, parameters = {}) {
  if (STILL_BLOCKS.includes(block)) return { video: true, alpha: false, audio: false, image: true };
  if (AUDIO_BLOCKS.includes(block)) return { video: false, alpha: false, audio: true };
  if (block === 'logo_sting' || block === 'logo_end') return { video: true, alpha: false, audio: true };
  if (block === 'endcard' || NEI_BLOCKS.includes(block)) return { video: true, alpha: false, audio: false };
  if (block === 'chevron_wipe') return { video: true, alpha: !(parameters.a && parameters.b), audio: false };
  if (block === 'title_card') return { video: true, alpha: (parameters.background ?? brand.blocks.title_card.background) === 'transparent', audio: false };
  return { video: true, alpha: true, audio: false };
}

/** Profiles a block is made for. */
export function blockProfiles(brand, block) {
  const settings = brand.blocks[block];
  if (!settings) return [];
  if (settings.profile) return [settings.profile];
  if (settings.profiles) return Object.keys(settings.profiles);
  return Object.keys(brand.profiles);
}

/** Font faces a block draws with (add-block declares exactly these files). */
export function blockFaces(brand, block) {
  if (TEXT_BLOCKS.includes(block)) return textBlockFaces(brand, block);
  if (block === 'endcard' || block === 'thumbnail' || block === 'band_card') return [brand.blocks[block].face];
  if (block === 'format_card') return [...new Set([brand.blocks[block].titleFace, brand.blocks[block].textFace])];
  if (block === 'cliffhanger_card') return [...new Set([brand.blocks[block].headlineFace, brand.blocks[block].textFace, brand.blocks[block].questionFace])];
  return [];
}

/** Logo files (keys of brand.logo or suffix SVG names) a block draws. */
export function blockLogos(brand, block, parameters = {}, profile) {
  if (block === 'wordmark_flash' || block === 'endcard' || block === 'logo_end') return [{ key: 'wordmark' }];
  if (block === 'logo_sting') {
    const suffix = parameters.suffix || null;
    if (!suffix) return [{ key: 'wordmark' }];
    const file = `wordmark-${suffix}${profile === 'vertical' ? '-stacked' : ''}.svg`;
    return [{ key: 'suffix', file, source: `logo/${file}` }];
  }
  return [];
}

/** Asset ids of a block with defaults applied: { audio: [{ role, id }], images: [{ role, id }] }. */
export function blockAssets(brand, block, parameters = {}) {
  const d = brand.assets.defaults;
  const pick = (value, fallback) => (value === undefined ? fallback : value);
  const audio = [];
  const images = [];
  if (block === 'logo_sting') {
    const noise = pick(parameters.noiseHit, d.noiseHit);
    const voice = pick(parameters.voiceTag, d.voiceShout);
    if (noise) audio.push({ role: 'noiseHit', id: noise, kind: 'noise-hit' });
    if (voice) audio.push({ role: 'voiceTag', id: voice, kind: 'voice-tag' });
  }
  if (block === 'logo_end') {
    const voice = pick(parameters.voiceTag, d.voiceSpoken);
    if (voice) audio.push({ role: 'voiceTag', id: voice, kind: 'voice-tag' });
  }
  if (block === 'animal_scream') {
    const animal = parameters.animal ?? 'peacock';
    audio.push({ role: 'animal', id: parameters.asset ?? d.animal[animal], kind: 'animal-scream', animal });
  }
  if (block === 'loud_sounds') for (const id of parameters.sounds ?? d.loudSounds) audio.push({ role: 'sound', id, kind: brand.blocks.loud_sounds.kinds });
  if (block === 'endcard') images.push({ role: 'background', id: parameters.image ?? d.endcard, kind: 'endcard-background' });
  return { audio, images };
}

/** Project-relative path of a vendored asset (add-block copies it there; the block reads it from there). */
export function assetPath(type, id, ext) {
  return `assets/${type}/${id}${ext}`;
}

/**
 * Sound of a block: cues [{ id, at (s), gainDb, seconds (s, null = whole file), fadeOut (s) }] and the length of the
 * output in seconds (audio-only blocks: the cues; picture blocks: their frames). `durations` maps asset id → seconds.
 */
export function audioCues(brand, block, parameters, durations) {
  const s = brand.blocks[block];
  const { audio } = blockAssets(brand, block, parameters);
  const len = (id) => {
    const value = durations[id];
    if (!(value > 0)) throw new Error(`the duration of audio asset "${id}" is unknown`);
    return value;
  };
  if (block === 'logo_sting') {
    return audio.map((a) => (a.role === 'noiseHit'
      ? { id: a.id, at: s.audio.noiseHitAtSeconds, gainDb: s.audio.noiseHitGainDb, seconds: null, fadeOut: 0 }
      : { id: a.id, at: s.audio.voiceAtSeconds, gainDb: s.audio.voiceGainDb, seconds: null, fadeOut: 0 }));
  }
  if (block === 'logo_end') return audio.map((a) => ({ id: a.id, at: s.audio.voiceAtSeconds, gainDb: s.audio.voiceGainDb, seconds: null, fadeOut: 0 }));
  if (block === 'animal_scream') {
    const a = audio[0];
    return [{ id: a.id, at: 0, gainDb: parameters.gainDb ?? s.gainDb, seconds: null, fadeOut: 0 }];
  }
  if (block === 'loud_sounds') {
    const each = parameters.secondsEach ?? s.secondsEach.default;
    let at = 0;
    return audio.map((a) => {
      const seconds = Math.min(len(a.id), each);
      const cue = { id: a.id, at, gainDb: s.gainDb, seconds, fadeOut: seconds < len(a.id) ? s.fadeOutSeconds : 0 };
      at += seconds;
      return cue;
    });
  }
  return [];
}

/** Length of an audio-only block in whole frames (round half up of its sound). */
export function audioBlockFrames(brand, block, parameters, durations, fps) {
  const cues = audioCues(brand, block, parameters, durations);
  const end = Math.max(...cues.map((c) => c.at + (c.seconds ?? durations[c.id])));
  return secondsToFrames(end, fps);
}

/** Allowed duration in frames ({ min, max, default }) or null (caption overlays follow the timeline, audio blocks their sound). */
export function blockDurationLimits(brand, block, fps) {
  if (TEXT_BLOCKS.includes(block)) return textDurationLimits(brand, block, fps);
  const s = brand.blocks[block];
  if (STILL_BLOCKS.includes(block)) return { min: 1, max: 1, default: 1 };
  if (block === 'glitch_flash') return { ...s.frames };
  // vertical footage lasts as long as its clip (in/out of the parameters), within the brand limits
  if (block === 'vertical_in_16x9') return { min: secondsToFrames(s.seconds.min, fps), max: secondsToFrames(s.seconds.max, fps), default: null };
  if (s?.seconds?.default !== undefined) return { min: secondsToFrames(s.seconds.min, fps), max: secondsToFrames(s.seconds.max, fps), default: secondsToFrames(s.seconds.default, fps) };
  return null;
}

function checkClipRef(value, name, { range = false } = {}) {
  const issues = [];
  const shape = `{ "sourceId" | "extensionId", "in"${range ? ', "out"' : ''}, "crop"? }`;
  if (!value || typeof value !== 'object' || Array.isArray(value)) return [`parameters.${name} must be ${shape}`];
  const refs = ['sourceId', 'extensionId'].filter((k) => value[k] !== undefined);
  if (refs.length !== 1 || typeof value[refs[0]] !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(value[refs[0]])) issues.push(`parameters.${name} needs exactly one of sourceId or extensionId`);
  if (typeof value.in !== 'string' || !RATIONAL.test(value.in)) issues.push(`parameters.${name}.in must be seconds as an exact string such as "12.48"`);
  if (range) {
    if (typeof value.out !== 'string' || !RATIONAL.test(value.out)) issues.push(`parameters.${name}.out must be seconds as an exact string such as "31.2"`);
    else if (typeof value.in === 'string' && RATIONAL.test(value.in) && compareRational(value.out, value.in) <= 0) issues.push(`parameters.${name}.out must lie after in`);
  }
  if (value.crop !== undefined) {
    const c = value.crop;
    const ok = c && ['x', 'y', 'w', 'h'].every((k) => typeof c[k] === 'string' && RATIONAL.test(c[k])) && Number(c.w) > 0 && Number(c.h) > 0 && Number(c.x) + Number(c.w) <= 1 + 1e-9 && Number(c.y) + Number(c.h) <= 1 + 1e-9;
    if (!ok) issues.push(`parameters.${name}.crop must be { x, y, w, h } as exact strings (fractions 0..1 of the oriented source, like timeline crops)`);
  }
  const allowed = ['sourceId', 'extensionId', 'in', 'crop', ...(range ? ['out'] : [])];
  const extra = Object.keys(value).filter((k) => !allowed.includes(k));
  if (extra.length) issues.push(`parameters.${name} has unknown fields ${extra.join(', ')}`);
  return issues;
}

/** Exact rational of a time string ("12.48", "1/3") as { n, d } BigInts. */
function rationalOf(text) {
  const s = String(text);
  if (s.includes('/')) {
    const [n, d] = s.split('/');
    return { n: BigInt(n), d: BigInt(d) };
  }
  const [int, frac = ''] = s.split('.');
  return { n: BigInt(int + frac), d: 10n ** BigInt(frac.length) };
}

function compareRational(a, b) {
  const x = rationalOf(a);
  const y = rationalOf(b);
  const l = x.n * y.d;
  const r = y.n * x.d;
  return l < r ? -1 : l > r ? 1 : 0;
}

/** Frames of a source range: round_half_up((out − in) × fps) – the clip-length rule T1 of the format contract. */
export function rangeFrames(inText, outText, fps) {
  const a = rationalOf(inText);
  const b = rationalOf(outText);
  const [fn, fd = '1'] = String(fps).split('/');
  const n = (b.n * a.d - a.n * b.d) * BigInt(fn);
  const d = a.d * b.d * BigInt(fd);
  return Number((2n * n + d) / (2n * d));
}

/**
 * Footage a block reads: [{ key, param, ref, frames: 'one' | 'output' }] (output = durationFrames frames from in) – the wipe's A/B, the thumbnail frame or
 * candidates, the still of a band or cliffhanger card, the clip of vertical_in_16x9. add-block declares them as
 * source/extension inputs; render.mjs extracts them with the render core's frame choice.
 */
export function blockClipRefs(block, parameters = {}) {
  if (block === 'chevron_wipe') return ['a', 'b'].filter((k) => parameters[k]).map((k) => ({ key: k, param: k, ref: parameters[k], frames: 'output' }));
  if (STILL_BLOCKS.includes(block)) return thumbnailFrames(parameters).map((f) => ({ key: f.key, param: f.key === 'frame' ? 'frame' : `candidates[${f.key.slice(1)}]`, ref: f.ref, frames: 'one' }));
  if ((block === 'band_card' || block === 'cliffhanger_card') && parameters.image) return [{ key: 'image', param: 'image', ref: parameters.image, frames: 'one' }];
  if (block === 'vertical_in_16x9' && parameters.clip) return [{ key: 'clip', param: 'clip', ref: parameters.clip, frames: 'output' }];
  return [];
}

const idOrNull = (value, name) => (value === undefined || value === null || (typeof value === 'string' && ASSET_ID.test(value)) ? [] : [`parameters.${name} must be an asset id of brand-assets or null`]);

/** Parameter check of every block (brand-layer limits, T6); returns problems as strings. */
export function checkParameters(brand, block, parameters, profile) {
  if (TEXT_BLOCKS.includes(block)) return checkBlockParameters(brand, block, parameters, profile);
  const s = brand.blocks[block];
  const issues = [];
  const known = {
    logo_sting: ['suffix', 'voiceTag', 'noiseHit'],
    chevron_wipe: ['a', 'b'],
    glitch_flash: ['intensity', 'seed'],
    logo_end: ['voiceTag'],
    endcard: ['image'],
    animal_scream: ['animal', 'asset', 'gainDb'],
    loud_sounds: ['sounds', 'secondsEach'],
    thumbnail: ['headline', 'frame', 'candidates', 'contrast'],
    format_card: ['title', 'text'],
    band_card: ['lines', 'image'],
    cliffhanger_card: ['next', 'question', 'image'],
    vertical_in_16x9: ['clip'],
  }[block] ?? [];
  const extra = Object.keys(parameters).filter((k) => !known.includes(k));
  if (extra.length) issues.push(`unknown parameters ${extra.join(', ')} (${block} takes ${known.join(', ') || 'none'})`);
  if (block === 'logo_sting') {
    const suffix = parameters.suffix;
    if (suffix !== undefined && suffix !== null && suffix !== '' && (typeof suffix !== 'string' || !SUFFIX.test(suffix))) issues.push('parameters.suffix must be a lowercase word (e.g. "brazil") or empty');
    issues.push(...idOrNull(parameters.voiceTag, 'voiceTag'), ...idOrNull(parameters.noiseHit, 'noiseHit'));
  }
  if (block === 'logo_end') issues.push(...idOrNull(parameters.voiceTag, 'voiceTag'));
  if (block === 'chevron_wipe') {
    const has = ['a', 'b'].filter((k) => parameters[k] !== undefined);
    if (has.length === 1) issues.push('parameters.a and parameters.b go together (A/B transition) – or leave both out for the alpha overlay');
    for (const k of has) issues.push(...checkClipRef(parameters[k], k));
  }
  if (block === 'glitch_flash') {
    const v = parameters.intensity;
    if (v !== undefined && (typeof v !== 'number' || v < s.intensity.min || v > s.intensity.max)) issues.push(`parameters.intensity must lie in ${s.intensity.min}–${s.intensity.max}`);
    if (parameters.seed !== undefined && (!Number.isInteger(parameters.seed) || parameters.seed < 0 || parameters.seed > 1e6)) issues.push('parameters.seed must be a whole number 0–1000000');
  }
  if (block === 'endcard') issues.push(...idOrNull(parameters.image, 'image'));
  if (block === 'animal_scream') {
    if (parameters.animal !== undefined && !s.animals.includes(parameters.animal)) issues.push(`parameters.animal must be one of ${s.animals.join(', ')}`);
    issues.push(...idOrNull(parameters.asset, 'asset'));
    if (parameters.gainDb !== undefined && (typeof parameters.gainDb !== 'number' || parameters.gainDb < -24 || parameters.gainDb > 6)) issues.push('parameters.gainDb must lie in -24–6 dB');
  }
  if (block === 'loud_sounds') {
    const sounds = parameters.sounds;
    if (sounds !== undefined && (!Array.isArray(sounds) || sounds.length < s.sounds.min || sounds.length > s.sounds.max || sounds.some((id) => typeof id !== 'string' || !ASSET_ID.test(id)))) {
      issues.push(`parameters.sounds must list ${s.sounds.min}–${s.sounds.max} asset ids`);
    }
    const each = parameters.secondsEach;
    if (each !== undefined && (typeof each !== 'number' || each < s.secondsEach.min || each > s.secondsEach.max)) issues.push(`parameters.secondsEach must lie in ${s.secondsEach.min}–${s.secondsEach.max} s`);
  }
  if (block === 'thumbnail') {
    if (typeof parameters.headline !== 'string' || !parameters.headline.trim()) issues.push('parameters.headline is required (2–5 words, drawn in capitals)');
    else issues.push(...headlineLines(parameters.headline, s).issues.map((issue) => `parameters.headline: ${issue}`));
    const hasFrame = parameters.frame !== undefined;
    const hasCandidates = parameters.candidates !== undefined;
    if (hasFrame === hasCandidates) issues.push('give either parameters.frame (the confirmed frame) or parameters.candidates (proposals for the editor), not both or none');
    if (hasFrame) issues.push(...checkClipRef(parameters.frame, 'frame'));
    if (hasCandidates) {
      const list = parameters.candidates;
      if (!Array.isArray(list) || list.length < s.candidates.min || list.length > s.candidates.max) issues.push(`parameters.candidates must list ${s.candidates.min}–${s.candidates.max} frames { sourceId | extensionId, in, crop? }`);
      else list.forEach((ref, i) => issues.push(...checkClipRef(ref, `candidates[${i}]`)));
    }
    const c = parameters.contrast;
    if (c !== undefined && (typeof c !== 'number' || c < s.grade.contrast.min || c > s.grade.contrast.max)) issues.push(`parameters.contrast must lie in ${s.grade.contrast.min}–${s.grade.contrast.max}`);
  }
  if (block === 'format_card') issues.push(...formatCardText(parameters, s).issues);
  if (block === 'band_card') {
    issues.push(...bandCardLines(parameters, s).issues);
    if (parameters.image !== undefined) issues.push(...checkClipRef(parameters.image, 'image'));
  }
  if (block === 'cliffhanger_card') {
    issues.push(...cliffhangerText(parameters, s).issues);
    if (parameters.image !== undefined) issues.push(...checkClipRef(parameters.image, 'image'));
  }
  if (block === 'vertical_in_16x9') {
    if (parameters.clip === undefined) issues.push('parameters.clip is required ({ sourceId | extensionId, in, out, crop? } – the vertical clip)');
    else issues.push(...checkClipRef(parameters.clip, 'clip', { range: true }));
  }
  return issues;
}

// --- Never Ending Interview cards (WP5): pure text rules, shared by the scenes and the checks ----------------------

const textOf = (value) => (typeof value === 'string' ? spaces(value) : '');

/** format_card: { title (capitals) | null, lines (sentences broken to lines), issues }. */
export function formatCardText(parameters, settings) {
  const issues = [];
  const title = parameters.title === undefined || parameters.title === null ? null : textOf(parameters.title).toUpperCase();
  if (parameters.title !== undefined && parameters.title !== null && (typeof parameters.title !== 'string' || !title)) issues.push('parameters.title must be text (drawn in capitals) or left out');
  else if (title && chars(title) > settings.titleMaxChars) issues.push(`parameters.title is longer than ${settings.titleMaxChars} characters`);
  const text = parameters.text ?? [];
  const sentences = Array.isArray(text) ? text : [text];
  if (sentences.some((t) => typeof t !== 'string' || !textOf(t))) issues.push('parameters.text must be one sentence or a list of sentences (text)');
  if (sentences.length > settings.sentences.max) issues.push(`parameters.text has ${sentences.length} sentences; a format card has at most ${settings.sentences.max}`);
  if (!title && !sentences.length) issues.push('a format card needs a title, text or both');
  const lines = [];
  for (const sentence of sentences.filter((t) => typeof t === 'string')) {
    const broken = breakLines(textOf(sentence), { maxChars: settings.maxCharsPerLine, maxLines: settings.maxLines });
    if (broken.overflow) issues.push(`parameters.text: ${broken.overflow}`);
    lines.push(...broken.lines);
  }
  if (lines.length > settings.maxLines) issues.push(`parameters.text needs ${lines.length} lines of at most ${settings.maxCharsPerLine} characters (at most ${settings.maxLines}); shorten it`);
  return { title, lines, issues };
}

/** band_card: the 1–2 lines as written (names in capitals by the agent, e.g. ["MYLES KENNEDY", "alter bridge"]). */
export function bandCardLines(parameters, settings) {
  const issues = [];
  const raw = parameters.lines;
  const lines = Array.isArray(raw) ? raw.map(textOf) : [];
  if (!Array.isArray(raw) || lines.length < 1 || lines.length > settings.maxLines || lines.some((l) => !l)) issues.push(`parameters.lines must list 1–${settings.maxLines} lines of text (e.g. ["MYLES KENNEDY", "alter bridge"] or ["EVIL JARED", "x KROGI"])`);
  const long = lines.find((l) => chars(l) > settings.maxCharsPerLine);
  if (long) issues.push(`the line "${long}" is longer than ${settings.maxCharsPerLine} characters`);
  return { lines, issues };
}

/** cliffhanger_card: { headline, lines (CTA text with the next band), question (lines) | null, issues }. */
export function cliffhangerText(parameters, settings) {
  const issues = [];
  const next = parameters.next === undefined || parameters.next === null ? null : textOf(parameters.next).toUpperCase();
  if (parameters.next !== undefined && parameters.next !== null && (typeof parameters.next !== 'string' || !next)) issues.push('parameters.next must be the name of the next band or left out');
  else if (next && chars(next) > settings.nextMaxChars) issues.push(`parameters.next is longer than ${settings.nextMaxChars} characters`);
  const lines = (next ? settings.textWithNext : settings.textWithoutNext).map((line) => line.replace('{next}', next ?? ''));
  let question = null;
  if (parameters.question !== undefined && parameters.question !== null) {
    const q = textOf(parameters.question);
    if (typeof parameters.question !== 'string' || !q) issues.push('parameters.question must be the open question as text or left out');
    else if (chars(q) > settings.questionMaxChars) issues.push(`parameters.question is longer than ${settings.questionMaxChars} characters`);
    else {
      const broken = breakLines(`“${q}”`, { maxChars: settings.questionMaxCharsPerLine, maxLines: settings.questionMaxLines });
      if (broken.overflow) issues.push(`parameters.question: ${broken.overflow}`);
      question = broken.lines;
    }
  }
  return { headline: settings.headline, lines, question, issues };
}

// --- thumbnail (WP4): headline lines and black-and-white grade (pure, shared by the scene and the checks) ---------

const spaces = (text) => text.replace(/[\t ]+/g, ' ').trim();
const chars = (text) => [...text].length;

/**
 * Lines of a thumbnail headline: capitals (JavaScript's default case mapping, no locale – the same in Node and the
 * browser); explicit "\n" are kept, otherwise the words are spread over min(words, autoLines) lines so that the longest
 * line is as short as possible (character count; ties: the earlier line longer – "GIVE 'EM / HELL / UP THERE!").
 * Returns { lines, words, issues } – issues name what breaks the brand limits (word count, lines, characters per line).
 */
export function headlineLines(text, settings) {
  const h = settings.headline;
  const explicit = String(text).toUpperCase().split(/\r?\n/).map(spaces).filter(Boolean);
  const words = explicit.flatMap((line) => line.split(' '));
  const issues = [];
  if (words.length < h.words.min || words.length > h.words.max) issues.push(`has ${words.length} words; a thumbnail headline has ${h.words.min}–${h.words.max}`);
  let lines;
  if (explicit.length > 1) lines = explicit;
  else {
    const n = Math.min(words.length, h.autoLines);
    let best = null;
    const split = (start, left, acc) => {
      if (left === 1) {
        const candidate = [...acc, words.slice(start).join(' ')];
        const lengths = candidate.map(chars);
        const worst = Math.max(...lengths);
        const first = best ? lengths.findIndex((len, i) => len !== best.lengths[i]) : -1;
        const better = !best || worst < best.worst || (worst === best.worst && first >= 0 && lengths[first] > best.lengths[first]);
        if (better) best = { lines: candidate, lengths, worst };
        return;
      }
      for (let end = start + 1; end <= words.length - (left - 1); end++) split(end, left - 1, [...acc, words.slice(start, end).join(' ')]);
    };
    if (n > 0) split(0, n, []);
    lines = best?.lines ?? [];
  }
  if (lines.length > h.maxLines) issues.push(`needs ${lines.length} lines (at most ${h.maxLines})`);
  const long = lines.find((line) => chars(line) > h.maxCharsPerLine);
  if (long) issues.push(`the line "${long}" is longer than ${h.maxCharsPerLine} characters`);
  return { lines, words: words.length, issues };
}

/** Grey value of an sRGB pixel after the thumbnail grade: Rec. 709 luma, contrast around mid grey, brightness offset. */
export function gradeValue(r, g, b, contrast, brightness) {
  const luma = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  const v = (luma - 0.5) * contrast + 0.5 + brightness;
  return Math.round(Math.min(1, Math.max(0, v)) * 255);
}

/** The frames a thumbnail draws: [{ key, ref }] – the confirmed frame, or the candidates proposed to the editor. */
export function thumbnailFrames(parameters) {
  if (Array.isArray(parameters.candidates)) return parameters.candidates.map((ref, i) => ({ key: `c${i}`, ref }));
  return parameters.frame ? [{ key: 'frame', ref: parameters.frame }] : [];
}

/** Checks the asset ids of a block against the manifests (kind, animal); returns problems. */
export function checkAssets(brand, block, parameters, manifests) {
  const issues = [];
  const { audio, images } = blockAssets(brand, block, parameters);
  for (const [type, list] of [['audio', audio], ['images', images]]) {
    for (const a of list) {
      const entry = manifests[type].get(a.id);
      if (!entry) {
        issues.push(`asset "${a.id}" (${a.role}) is not in brand-assets/${type}/assets.json`);
        continue;
      }
      const kinds = Array.isArray(a.kind) ? a.kind : [a.kind];
      if (!kinds.includes(entry.kind)) issues.push(`asset "${a.id}" is a ${entry.kind}, ${a.role} needs ${kinds.join(' or ')}`);
      if (a.animal && entry.variant?.animal !== a.animal) issues.push(`asset "${a.id}" is no ${a.animal}`);
    }
  }
  return issues;
}

export { CAPTION_BLOCKS, TEXT_BLOCKS };
