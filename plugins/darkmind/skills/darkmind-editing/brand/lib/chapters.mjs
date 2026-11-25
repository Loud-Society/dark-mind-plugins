// Dark Mind brand pack – YouTube chapter list (Phase 6 WP5) for the 16:9 recipes: the NEI episode (one chapter per
// link, derived from the band cards) and the host interview (topic blocks from chapters.json). Pure: works on the
// placed clips of recipes.mjs. YouTube's rules: the first chapter starts at 0:00, at least three chapters, each at least
// 10 seconds long, ascending. Times are whole seconds of the timeline (floor of frame / fps).

import { parseFps } from './layout.mjs';

export const CHAPTERS_KIND = 'darkmind-chapters';
export const YOUTUBE = { minChapters: 3, minSeconds: 10, maxTitleChars: 100 };

/** 0:00, 4:07, 1:02:03 */
export function timestamp(seconds) {
  const s = Math.floor(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
}

/** Title of a band card chapter: its lines, "x NAME" joined with a space, a band below with " – ". */
export function bandCardTitle(lines) {
  return lines.reduce((title, line, i) => (i === 0 ? line : /^x\s/i.test(line) ? `${title} ${line}` : `${title} – ${line}`), '');
}

/**
 * Chapter list: from chapters.json ({ chapters: [{ title, clipId } | { title, frame }] }) if present, otherwise derived
 * as the recipe says (nei-episode: an intro at 0 plus every band card, starting at the chevron wipe that reveals it).
 * Returns { list: [{ title, frame, seconds, timestamp }], text, issues: [{ severity, code, message }] }.
 */
export function chapterList({ recipe, placed, extensions, chapters, fps, end }) {
  const rate = parseFps(fps);
  const issues = [];
  const add = (severity, code, message) => issues.push({ severity, code, message });
  let entries = [];
  if (chapters) {
    if (chapters.kind !== CHAPTERS_KIND || chapters.schemaVersion !== 1 || !Array.isArray(chapters.chapters)) {
      add('error', 'chapters-invalid', `chapters.json must be { "schemaVersion": 1, "kind": "${CHAPTERS_KIND}", "chapters": [{ "title", "clipId" | "frame" }] }`);
      return { list: [], text: '', issues };
    }
    for (const [i, c] of chapters.chapters.entries()) {
      if (typeof c.title !== 'string' || !c.title.trim()) {
        add('error', 'chapters-invalid', `chapters[${i}].title is required`);
        continue;
      }
      let frame = null;
      if (c.clipId !== undefined) {
        const clip = placed.find((p) => p.clip.id === c.clipId && p.kind === 'video') ?? placed.find((p) => p.clip.id === c.clipId);
        if (!clip) add('error', 'chapters-clip', `chapters[${i}] ("${c.title}") points at clip ${c.clipId}, which is not on the timeline`);
        else frame = clip.start;
      } else if (Number.isInteger(c.frame) && c.frame >= 0) frame = c.frame;
      else add('error', 'chapters-invalid', `chapters[${i}] needs "clipId" (a timeline clip, follows edits) or "frame"`);
      if (frame !== null) entries.push({ title: c.title.trim(), frame });
    }
  } else if (recipe.chapters?.derive === 'band_card') {
    const cards = placed.filter((p) => p.kind === 'video' && p.block === 'band_card');
    entries = [{ title: recipe.chapters.introTitle ?? 'Intro', frame: 0 }];
    for (const card of cards) {
      // a chapter starts with the wipe that reveals the card (wipe end = card start on the same track)
      const wipe = placed.find((p) => p.kind === 'video' && p.block === 'chevron_wipe' && p.track === card.track && p.end === card.start);
      const lines = extensions[card.clip.extensionId]?.extension.parameters?.lines ?? [];
      entries.push({ title: bandCardTitle(lines) || card.clip.extensionId, frame: wipe ? wipe.start : card.start });
    }
  } else {
    add('pending', 'chapters-missing', `${recipe.id} has YouTube chapters (topic blocks): write chapters.json { "schemaVersion": 1, "kind": "${CHAPTERS_KIND}", "chapters": [{ "title", "clipId" }] } with the first clip of every block`);
    return { list: [], text: '', issues };
  }
  entries.sort((a, b) => a.frame - b.frame);
  const list = entries.map((e) => ({ ...e, seconds: Math.floor(e.frame / rate), timestamp: timestamp(e.frame / rate) }));
  if (list.length && list[0].seconds !== 0) add('error', 'chapters-start', `the first chapter must start at 0:00 (YouTube); "${list[0].title}" starts at ${list[0].timestamp}`);
  if (list.length < YOUTUBE.minChapters) add(chapters ? 'error' : 'pending', 'chapters-count', `YouTube shows chapters from ${YOUTUBE.minChapters} on; the list has ${list.length}`);
  for (let i = 0; i < list.length; i++) {
    const next = i + 1 < list.length ? list[i + 1].frame : end;
    if ((next - list[i].frame) / rate < YOUTUBE.minSeconds) add('error', 'chapters-short', `chapter "${list[i].title}" (${list[i].timestamp}) is shorter than ${YOUTUBE.minSeconds} s (YouTube)`);
    if (i > 0 && list[i].seconds === list[i - 1].seconds) add('error', 'chapters-duplicate', `chapters "${list[i - 1].title}" and "${list[i].title}" start in the same second`);
    if ([...list[i].title].length > YOUTUBE.maxTitleChars) add('error', 'chapters-title', `chapter title "${list[i].title.slice(0, 30)}…" is longer than ${YOUTUBE.maxTitleChars} characters`);
  }
  return { list, text: list.map((c) => `${c.timestamp} ${c.title}`).join('\n'), issues };
}
