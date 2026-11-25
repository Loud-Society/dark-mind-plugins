// Dark Mind brand pack – Never Ending Interview chain reconstruction (Phase 6 WP5, guide recipes/NEI_CHAIN.md).
// Pure (no I/O). Two steps:
//   1. extractObservations(transcripts): proposals from saved MCP get_transcript results – who speaks, which question
//      they answer (announcement "this question comes from …", the question read out) and which question they ask the
//      next band – each with timecodes and the quoted line. Heuristic: the agent checks every proposal at the material.
//   2. buildChain(observations): the graph of questions and answers (matched by question content, the announced asker
//      and the appearance – never by the band name alone), sub-chains, branches, gaps, Loud Society questions, repeated
//      appearances, contradictions and ambiguities (flagged for the editor, never used for the chain), and a chosen path
//      (longest sub-chain without uncertain links, then the strongest answers) with the reasons.
// Real chains are graphs (doc/mvp/NEI_REFERENCE_MATERIAL.md). Texts are data: matched, never evaluated.

export const CHAIN_KIND = 'darkmind-nei-chain';
export const MATCH = { threshold: 0.5, ambiguity: 0.1 };
export const LOUD_SOCIETY = 'Loud Society';

const STOP = new Set(
  ('a an the and or but if then than of to in on at by for from with about into over under as is are was were be been being am do does did done have has had having i me my mine we us our ours you your yours he him his she her it its they them their what which who whom whose when where why how this that these those there here would could should will shall can may might must not no yes so very just ever ' +
    'one some any all each every other else also too only own same such both few more most much many get got go going gone make made thing things really like kind sort lot ' +
    'der die das ein eine einen und oder ich du er sie es wir ihr dich dir mich mir wer was wie wo warum hast hat habe bist ist sind war'
  ).split(' ')
);

/** Content words of a question (lower case, no punctuation, no stop words, plural/ing stripped). */
export function contentWords(text) {
  return [...new Set(
    String(text ?? '')
      .toLowerCase()
      .replace(/[’']/g, '')
      .split(/[^a-z0-9äöüß]+/)
      .filter((w) => w && !STOP.has(w))
      .map((w) => (w.length > 4 && w.endsWith('ing') ? w.slice(0, -3) : w.length > 3 && w.endsWith('s') && !w.endsWith('ss') ? w.slice(0, -1) : w))
  )];
}

/** Similarity of two questions: Dice coefficient of their content words (0..1). */
export function questionSimilarity(a, b) {
  const x = contentWords(a);
  const y = new Set(contentWords(b));
  if (!x.length || !y.size) return 0;
  const shared = x.filter((w) => y.has(w)).length;
  return (2 * shared) / (x.length + y.size);
}

const key = (name) => String(name ?? '').toLowerCase().replace(/^the\s+/, '').replace(/[^a-z0-9äöüß]+/g, '');
const initials = (name) => String(name ?? '').toLowerCase().replace(/^the\s+/, '').split(/[^a-z0-9äöüß]+/).filter(Boolean).map((w) => w[0]).join('');

/** Same person/band? Normalised names, aliases of chain.json, or initials (BFMV = Bullet For My Valentine). */
export function sameName(a, b, aliases = {}) {
  if (!a || !b) return false;
  const ka = key(a);
  const kb = key(b);
  if (!ka || !kb) return false;
  if (ka === kb) return true;
  // a shorter form of the same name ("Myles" – "Myles Kennedy", "So Velour Engine" – "Velour Engine")
  const words = (n) => String(n).toLowerCase().replace(/^the\s+/, '').split(/[^a-z0-9äöüß]+/).filter(Boolean);
  const [short, long] = words(a).length <= words(b).length ? [words(a), words(b)] : [words(b), words(a)];
  if (short.length && short.some((w) => w.length >= 4) && short.every((w) => long.includes(w))) return true;
  const expand = (n) => [n, ...Object.entries(aliases).flatMap(([main, list]) => (key(main) === key(n) || list.some((l) => key(l) === key(n)) ? [main, ...list] : []))].map(key);
  if (expand(a).some((x) => expand(b).includes(x))) return true;
  return (ka.length >= 3 && initials(b) === ka && initials(b).length >= 3) || (kb.length >= 3 && initials(a) === kb && initials(a).length >= 3);
}

export const isLoudSociety = (name) => /^(?:the\s+)?(?:loud\s*society|us|the team|our team|loud society team)$/i.test(String(name ?? '').trim()) || /loud\s*society/i.test(String(name ?? ''));

// --- 1. extraction (heuristic proposals) --------------------------------------------------------------------------

const LINE = /^(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)(?:\s+S(\d+))?:\s?(.*)$/;
const NAME = "((?:[Tt]he\\s+)?[A-Z][\\w'&-]*(?:\\s+(?:[A-Z][\\w'&-]*|[0-9]+|of|the|and|x))*)";
const INTRO = new RegExp(`\\b(?:[Ww]e are|[Ww]e're|[Tt]his is|I am|I'm|[Mm]y name is)\\s+${NAME}`);
const ANNOUNCE = [
  /[Qq]uestion\s+(?:is\s+|comes\s+|came\s+)?(?:from|by)\s+((?:the\s+)?(?:[Ll]oud\s*[Ss]ociety(?:\s+team)?|us\b|our team))/,
  new RegExp(`[Qq]uestion\\s+(?:is\\s+|comes\\s+|came\\s+|was\\s+)?(?:from|by)\\s+(?:none other than\\s+)?(?:the\\s+guys?\\s+(?:of|from)\\s+)?${NAME}`),
  new RegExp(`${NAME}\\s+(?:wants to know|would like to know|asks you|asked you|has a question)`),
  // "this came from Grey Wind" (the interviewer, after reading or before the question)
  new RegExp(`\\b(?:[Tt]his|[Ii]t|[Tt]hat)\\s+(?:one\\s+)?(?:came|comes)\\s+from\\s+${NAME}`),
];
const QUESTION_FOR_YOU = /\b(?:the|your|our)\s+question\s+(?:for you\s+)?is\b|\bhere(?:'s| is) (?:the|your) question\b/i;
const ASK_CUE = /(?:question|ask)\s+(?:for|to)\s+the\s+next\s+(?:band|artist|one|person|guest)|\bmy question (?:is|would be|for)\b|\bi(?:'d| would) like to ask\b|\bi want to know\b|\bour question (?:is|for)\b/i;
const NEXT_INVITE = /\b(?:now|and now)\b[^.?!]*\b(?:your turn|you (?:get to|can|have to)) ask\b|\bask a question for the next\b/i;
const WINDOW = 30;
// sentences about the game itself, not a question of it ("do you have a question for the next band?")
const META = /\bquestion for (?:the )?next\b|\bask (?:a|the|your) question\b|\bany questions?\b/i;

export function parseTranscript(doc) {
  const lines = [];
  for (const raw of doc.lines ?? []) {
    const m = LINE.exec(String(raw));
    if (m) lines.push({ start: Number(m[1]), end: Number(m[2]), speaker: m[3] !== undefined ? `S${m[3]}` : null, text: m[4] });
  }
  return lines.sort((a, b) => a.start - b.start);
}

const round2 = (n) => Math.round(n * 100) / 100;

/** The first question (a sentence ending with "?") from line i on, within the window; returns { text, start, end, line }. */
function questionFrom(lines, i, after = '') {
  const limit = lines[i].start + WINDOW;
  for (let j = i; j < lines.length && lines[j].start <= limit; j++) {
    const text = j === i && after ? after : lines[j].text;
    const parts = text.split(/(?<=[?])/);
    for (const q of parts.filter((p) => p.includes('?'))) {
      const sentence = q.split(/(?<=[.!:])\s+/).pop().trim();
      if (contentWords(sentence).length && !META.test(sentence)) return { text: sentence, start: lines[j].start, end: lines[j].end, line: j };
    }
  }
  return null;
}

function cleanName(name) {
  return String(name).replace(/\s+(?:and|of|the|x|from)$/i, '').trim();
}

/**
 * Proposals from one saved get_transcript result (several pages of one video may be concatenated):
 * { videoId, fileName, by, answers: [...], asks: [...], flags: [...] }. `who` (optional) names the person/band when the
 * transcript has no self-introduction (from upload metadata or the file name – the agent decides).
 */
export function extractVideo(doc, { who = null } = {}) {
  const lines = parseTranscript(doc);
  const flags = [];
  const intros = [];
  for (const line of lines) {
    const m = INTRO.exec(line.text);
    if (m) intros.push({ name: cleanName(m[1]), at: line.start, quote: line.text });
  }
  const names = [...new Map(intros.map((i) => [key(i.name), i])).values()];
  if (names.length > 1) flags.push({ code: 'mixed-speakers', message: `several self-introductions (${names.map((n) => `${n.name} at ${n.at}s`).join(', ')}): check which parts belong to this appearance`, at: names[1].at });
  const by = who ?? names[0]?.name ?? null;
  if (!by) flags.push({ code: 'speaker-unknown', message: 'no self-introduction in the transcript: name the person/band from the upload metadata' });
  const answers = [];
  const asks = [];
  const used = new Set();
  // answers: an announced asker or "the question for you is …", then the question read out
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let askedBy = null;
    let announced = null;
    for (const re of ANNOUNCE) {
      const m = re.exec(line.text);
      if (m) {
        askedBy = cleanName(m[1]);
        announced = line.text.slice(m.index + m[0].length);
        break;
      }
    }
    const forYou = !askedBy && QUESTION_FOR_YOU.test(line.text) && !ASK_CUE.test(line.text);
    if (!askedBy && !forYou) continue;
    const q = questionFrom(lines, i, askedBy ? announced.replace(/^[\s:,.-]+/, '') : line.text.slice(line.text.search(QUESTION_FOR_YOU)));
    for (let j = i; j <= (q?.line ?? i); j++) used.add(j);
    const loud = askedBy && isLoudSociety(askedBy);
    answers.push({
      by,
      question: q?.text ?? null,
      askedBy: loud ? LOUD_SOCIETY : askedBy,
      ...(loud ? { askedByLoudSociety: true } : {}),
      evidence: [{ start: line.start, end: (q ? lines[q.line] : line).end, quote: q && q.line !== i ? `${line.text} … ${lines[q.line].text}` : line.text }],
      answerStart: q ? lines[q.line].end : line.end,
    });
  }
  // asks: "my question for the next band is …"
  for (let i = 0; i < lines.length; i++) {
    if (used.has(i) || !ASK_CUE.test(lines[i].text) || NEXT_INVITE.test(lines[i].text) && !lines[i].text.includes('?')) continue;
    const cue = lines[i].text.search(ASK_CUE);
    const q = questionFrom(lines, i, lines[i].text.slice(cue));
    if (!q) continue;
    for (let j = i; j <= q.line; j++) used.add(j);
    asks.push({ by, question: q.text, evidence: [{ start: lines[i].start, end: lines[q.line].end, quote: q.line !== i ? `${lines[i].text} … ${lines[q.line].text}` : lines[i].text }] });
  }
  // the answer runs from the question until the ask (or the end of the video)
  const end = lines.length ? lines[lines.length - 1].end : 0;
  for (const answer of answers) {
    const next = asks.find((a) => a.evidence[0].start >= answer.answerStart);
    const stop = next ? next.evidence[0].start : end;
    const invite = lines.find((l) => l.start >= answer.answerStart && l.start < stop && NEXT_INVITE.test(l.text));
    answer.answer = { start: round2(answer.answerStart), end: round2(invite ? invite.start : stop) };
    delete answer.answerStart;
  }
  if (!answers.length && !asks.length) flags.push({ code: 'no-nei-content', message: 'no announcement, question or hand-over found: not an NEI segment, or the cues are worded differently – read the transcript' });
  return { videoId: doc.videoId ?? null, fileName: doc.fileName ?? null, by, answers, asks, flags };
}

/** chain.json proposal from several transcripts: ids per item, every item marked unverified for the agent's check. */
export function extractObservations(transcripts, { who = {} } = {}) {
  const byVideo = new Map();
  for (const doc of transcripts) {
    const id = doc.videoId ?? doc.fileName;
    const entry = byVideo.get(id) ?? { ...doc, lines: [] };
    entry.lines.push(...(doc.lines ?? []));
    byVideo.set(id, entry);
  }
  const answers = [];
  const asks = [];
  const videos = [];
  let n = 0;
  for (const doc of byVideo.values()) {
    const v = extractVideo(doc, { who: who[doc.videoId] ?? who[doc.fileName] ?? null });
    videos.push({ videoId: v.videoId, fileName: v.fileName, by: v.by, flags: v.flags });
    for (const a of v.answers) answers.push({ id: `a${++n}`, videoId: v.videoId, fileName: v.fileName, ...a, unverified: true });
    for (const q of v.asks) asks.push({ id: `q${++n}`, videoId: v.videoId, fileName: v.fileName, ...q, unverified: true });
  }
  return { schemaVersion: 1, kind: CHAIN_KIND, draft: true, names: {}, videos, answers, asks };
}

// --- 2. graph, sub-chains, path -----------------------------------------------------------------------------------

/** Checks the structure of chain.json; returns problems as strings. */
export function checkObservations(doc) {
  const issues = [];
  if (doc?.kind !== CHAIN_KIND || doc.schemaVersion !== 1) issues.push(`chain.json must be { "schemaVersion": 1, "kind": "${CHAIN_KIND}", "answers": [...], "asks": [...] }`);
  const ids = new Set();
  for (const [list, name] of [[doc?.answers ?? [], 'answers'], [doc?.asks ?? [], 'asks']]) {
    for (const [i, item] of list.entries()) {
      if (!item.id || ids.has(item.id)) issues.push(`${name}[${i}] needs a unique id`);
      ids.add(item.id);
      if (!item.by) issues.push(`${name}[${i}] (${item.id}) needs "by" (who answers/asks)`);
      if (!item.videoId && !item.fileName) issues.push(`${name}[${i}] (${item.id}) needs the source (videoId or fileName)`);
      if (!Array.isArray(item.evidence) || !item.evidence.length || item.evidence.some((e) => !(e.end > e.start) || typeof e.quote !== 'string')) issues.push(`${name}[${i}] (${item.id}) needs evidence [{ start, end, quote }] from the transcript`);
      if (name === 'asks' && !item.question) issues.push(`asks[${i}] (${item.id}) needs the question`);
      if (item.strength !== undefined && ![1, 2, 3].includes(item.strength)) issues.push(`${name}[${i}] (${item.id}) strength must be 1 (weak), 2 (medium) or 3 (strong)`);
    }
  }
  return issues;
}

/**
 * The chain graph of chain.json. Returns { links, subChains, chosen, rejected, branches, gaps, conflicts, appearances,
 * flags }. A link = an ask answered by an answer, continued by the answerer's own next ask (same appearance).
 */
export function buildChain(doc, { links: wanted = null } = {}) {
  const aliases = doc.names ?? {};
  const answers = doc.answers ?? [];
  const asks = doc.asks ?? [];
  const conflicts = [];
  const matches = []; // { answer, ask, score, certain }
  const unfilmed = [];
  const loud = [];
  // 1. which question does every answer answer?
  for (const answer of answers) {
    if (answer.askedByLoudSociety || isLoudSociety(answer.askedBy)) {
      loud.push(answer);
      continue;
    }
    const scored = asks
      .filter((q) => !sameName(q.by, answer.by, aliases))
      .map((q) => ({ ask: q, score: answer.question ? questionSimilarity(answer.question, q.question) : 0 }))
      .sort((a, b) => b.score - a.score);
    const best = scored[0];
    const candidates = scored.filter((s) => s.score >= MATCH.threshold);
    const byAsker = answer.askedBy ? asks.filter((q) => sameName(q.by, answer.askedBy, aliases)) : [];
    if (!candidates.length) {
      if (answer.askedBy && byAsker.length) {
        conflicts.push({ kind: 'question-not-found', answer: answer.id, message: `${answer.by} answers a question announced from ${answer.askedBy}, but none of the ${byAsker.length} filmed question(s) of ${answer.askedBy} matches "${answer.question ?? '(question not read out)'}"`, candidates: byAsker.map((q) => ({ ask: q.id, question: q.question, score: round2(questionSimilarity(answer.question, q.question)) })) });
      } else unfilmed.push(answer);
      continue;
    }
    const second = candidates[1];
    if (second && best.score - second.score < MATCH.ambiguity && !(answer.askedBy && sameName(best.ask.by, answer.askedBy, aliases) !== sameName(second.ask.by, answer.askedBy, aliases))) {
      conflicts.push({ kind: 'ambiguous', answer: answer.id, message: `${answer.by}: the question "${answer.question}" fits ${candidates.length} filmed questions about equally – the editor decides`, candidates: candidates.map((c) => ({ ask: c.ask.id, by: c.ask.by, question: c.ask.question, score: round2(c.score) })) });
      continue;
    }
    // with an announced asker, the asker's matching question wins over a slightly better match of someone else
    const pick = answer.askedBy ? candidates.find((c) => sameName(c.ask.by, answer.askedBy, aliases)) ?? best : best;
    if (answer.askedBy && !sameName(pick.ask.by, answer.askedBy, aliases)) {
      conflicts.push({ kind: 'contradiction', answer: answer.id, message: `${answer.by}: announced as a question from ${answer.askedBy}, but the question read out ("${answer.question}") is the question of ${pick.ask.by} (${pick.ask.id}, similarity ${round2(pick.score)}) – the editor decides`, candidates: [{ ask: pick.ask.id, by: pick.ask.by, question: pick.ask.question, score: round2(pick.score) }] });
      continue;
    }
    matches.push({ answer, ask: pick.ask, score: pick.score });
  }
  // 2. appearances: an answer continues with the answerer's next question of the same appearance (same video;
  //    otherwise a question in another video that has no answer of that person – separate Question/Answer files)
  const continuation = (answer) => {
    const own = asks.filter((q) => sameName(q.by, answer.by, aliases));
    const same = own.filter((q) => q.videoId === answer.videoId && (q.evidence[0].start >= (answer.evidence?.[0]?.start ?? 0)));
    if (same.length) return { asks: same, crossVideo: false };
    const free = own.filter((q) => !answers.some((a) => a.videoId === q.videoId && sameName(a.by, answer.by, aliases)));
    return { asks: free, crossVideo: free.length > 0 };
  };
  const answerToAsk = new Map(); // ask id → matches
  for (const m of matches) answerToAsk.set(m.ask.id, [...(answerToAsk.get(m.ask.id) ?? []), m]);
  const links = matches.map((m) => {
    const cont = continuation(m.answer);
    return {
      ask: m.ask.id,
      question: m.ask.question,
      askedBy: m.ask.by,
      answer: m.answer.id,
      answeredBy: m.answer.by,
      similarity: round2(m.score),
      next: cont.asks.map((q) => q.id),
      crossVideo: cont.crossVideo,
      strength: m.answer.strength ?? null,
      evidence: { ask: { videoId: m.ask.videoId, fileName: m.ask.fileName, ...m.ask.evidence[0] }, answer: { videoId: m.answer.videoId, fileName: m.answer.fileName, ...m.answer.evidence[0], ...(m.answer.answer ? { answerRange: m.answer.answer } : {}) } },
      unverified: Boolean(m.ask.unverified || m.answer.unverified),
      flags: [...(m.answer.flags ?? []), ...(m.ask.flags ?? [])],
    };
  });
  // starts: questions nobody answered before in the chain (starter, answers to unfilmed or Loud Society questions)
  const starts = new Map();
  for (const a of [...unfilmed, ...loud]) for (const q of continuation(a).asks) starts.set(q.id, { via: a.id, kind: loud.includes(a) ? 'loud-society' : 'unfilmed-question' });
  const answeredAsks = new Set(links.map((l) => l.ask));
  const reached = new Set(links.flatMap((l) => l.next));
  for (const q of asks) if (answeredAsks.has(q.id) && !reached.has(q.id) && !starts.has(q.id)) starts.set(q.id, { via: null, kind: 'starter' });
  // 3. paths over asks: ask → (link) → next ask
  const out = new Map();
  for (const l of links) out.set(l.ask, [...(out.get(l.ask) ?? []), l]);
  const best = new Map();
  const walk = (askId, seen) => {
    if (best.has(askId) && !seen.size) return best.get(askId);
    let top = { links: [], score: 0 };
    for (const l of out.get(askId) ?? []) {
      const nexts = l.next.filter((n) => !seen.has(n));
      const tails = nexts.length ? nexts.map((n) => walk(n, new Set([...seen, askId]))) : [{ links: [], score: 0 }];
      for (const tail of tails) {
        const candidate = { links: [l, ...tail.links], score: (l.strength ?? 2) + tail.score };
        if (candidate.links.length > top.links.length || (candidate.links.length === top.links.length && candidate.score > top.score)) top = candidate;
      }
    }
    if (!seen.size) best.set(askId, top);
    return top;
  };
  // sub-chains: one best path per start (connected parts of the graph)
  const subChains = [];
  const covered = new Set();
  const startList = [...starts.keys()].sort((a, b) => asks.findIndex((q) => q.id === a) - asks.findIndex((q) => q.id === b));
  for (const askId of startList) {
    const path = walk(askId, new Set());
    if (!path.links.length) continue;
    path.links.forEach((l) => covered.add(l.answer));
    const ask = asks.find((q) => q.id === askId);
    subChains.push({ start: askId, starter: ask.by, startKind: starts.get(askId).kind, via: starts.get(askId).via, links: path.links.map((l) => l.answer), length: path.links.length, score: path.score });
  }
  subChains.sort((a, b) => b.length - a.length || b.score - a.score);
  const chosenChain = subChains[0] ?? null;
  let chosen = null;
  const rejected = [];
  if (chosenChain) {
    let chain = chosenChain.links.map((id) => links.find((l) => l.answer === id));
    let window = null;
    if (wanted && chain.length > wanted) {
      let top = { from: 0, score: -1 };
      for (let from = 0; from + wanted <= chain.length; from++) {
        const score = chain.slice(from, from + wanted).reduce((s, l) => s + (l.strength ?? 2), 0);
        if (score > top.score) top = { from, score };
      }
      window = { from: top.from, to: top.from + wanted };
      chain = chain.slice(window.from, window.to);
    }
    chosen = {
      start: chain[0].ask,
      starter: chain[0].askedBy,
      links: chain.map((l) => l.answer),
      openQuestion: chain[chain.length - 1].next[0] ?? null,
      reason: `longest sub-chain without uncertain links: ${chosenChain.length} link(s)${chosenChain.length && subChains.length > 1 ? ` (others: ${subChains.slice(1).map((s) => s.length).join(', ')})` : ''}${window ? `; window of ${wanted} links with the strongest answers (links ${window.from + 1}–${window.to})` : ''}`,
    };
    for (const s of subChains.slice(1)) rejected.push({ start: s.start, starter: s.starter, links: s.links, reason: `shorter sub-chain (${s.length} vs ${chosenChain.length} link(s))${s.startKind === 'loud-society' ? '; starts with a Loud Society question' : ''}` });
  }
  // branches: one question, several answers
  const branches = [...answerToAsk.entries()].filter(([, ms]) => ms.length > 1).map(([askId, ms]) => {
    const inChosen = ms.find((m) => chosen?.links.includes(m.answer.id));
    return { ask: askId, question: asks.find((q) => q.id === askId).question, answers: ms.map((m) => ({ answer: m.answer.id, by: m.answer.by })), chosen: inChosen?.answer.id ?? null, reason: inChosen ? `${inChosen.answer.by} continues the longest chain` : 'branch outside the chosen path' };
  });
  // repeated appearances: the same person in several videos or with several questions
  const people = new Map();
  for (const item of [...answers.map((a) => ({ ...a, role: 'answer' })), ...asks.map((q) => ({ ...q, role: 'ask' }))]) {
    const k = [...people.keys()].find((p) => sameName(p, item.by, aliases)) ?? item.by;
    people.set(k, [...(people.get(k) ?? []), item]);
  }
  const appearances = [...people.entries()]
    .filter(([, items]) => new Set(items.map((i) => i.videoId ?? i.fileName)).size > 1 || items.filter((i) => i.role === 'ask').length > 1)
    .map(([who, items]) => ({ who, videos: [...new Set(items.map((i) => i.fileName ?? i.videoId))], asks: items.filter((i) => i.role === 'ask').map((i) => i.id), answers: items.filter((i) => i.role === 'answer').map((i) => i.id) }));
  return {
    links,
    subChains,
    chosen,
    rejected,
    branches,
    gaps: {
      unanswered: asks.filter((q) => !answeredAsks.has(q.id)).map((q) => ({ ask: q.id, by: q.by, question: q.question, reserve: true })),
      unfilmedQuestion: unfilmed.map((a) => ({ answer: a.id, by: a.by, question: a.question, askedBy: a.askedBy ?? null, note: 'answer without a filmed question: starter candidate, the question only from the answer – never invented' })),
      loudSociety: loud.map((a) => ({ answer: a.id, by: a.by, question: a.question, note: 'question by Loud Society, not on camera (role "asker Loud Society")' })),
    },
    conflicts,
    appearances,
    flags: [...answers, ...asks].filter((i) => i.flags?.length).map((i) => ({ item: i.id, by: i.by, flags: i.flags })),
    videoFlags: (doc.videos ?? []).filter((v) => v.flags?.length).map((v) => ({ video: v.fileName ?? v.videoId, by: v.by, flags: v.flags })),
    unverified: [...answers, ...asks].filter((i) => i.unverified).map((i) => i.id),
  };
}

const tc = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

/** Markdown for the review report: chosen chain with evidence, branches, rejections, gaps, conflicts. */
export function chainReport(doc, chain) {
  const byId = new Map([...(doc.answers ?? []), ...(doc.asks ?? [])].map((i) => [i.id, i]));
  const src = (e) => `${e.fileName ?? e.videoId} ${tc(e.start)}–${tc(e.end)}`;
  const out = ['## NEI chain', ''];
  if (!chain.chosen) out.push('No chain: no question is answered by a filmed answer.', '');
  else {
    out.push(`Chosen: ${chain.chosen.reason}.`, '', '| # | Question (asked by) | Answered by | Evidence |', '|---|---|---|---|');
    chain.chosen.links.forEach((id, i) => {
      const l = chain.links.find((x) => x.answer === id);
      out.push(`| ${i + 1} | ${l.question} (${l.askedBy}) | ${l.answeredBy}${l.crossVideo ? ' ⚠ question/answer in different files' : ''}${l.unverified ? ' ⚠ unverified' : ''} | ask: ${src(l.evidence.ask)} · answer: ${src(l.evidence.answer)} |`);
    });
    const open = chain.chosen.openQuestion ? byId.get(chain.chosen.openQuestion) : null;
    out.push('', `Open question (cliffhanger): ${open ? `"${open.question}" (${open.by})` : 'none'}`, '');
  }
  if (chain.branches.length) out.push('### Branches', ...chain.branches.map((b) => `- "${b.question}": ${b.answers.map((a) => a.by).join(', ')} – ${b.chosen ? `chosen ${byId.get(b.chosen).by}: ${b.reason}` : b.reason}`), '');
  if (chain.rejected.length) out.push('### Rejected sub-chains', ...chain.rejected.map((r) => `- from ${r.starter}: ${r.reason}`), '');
  if (chain.conflicts.length) out.push('### For the editor (not used)', ...chain.conflicts.map((c) => `- **${c.kind}**: ${c.message}`), '');
  const g = chain.gaps;
  if (g.unfilmedQuestion.length || g.loudSociety.length) out.push('### Questions not on camera', ...g.unfilmedQuestion.map((a) => `- ${a.by} answers "${a.question ?? '?'}" – ${a.note}`), ...g.loudSociety.map((a) => `- ${a.by} answers "${a.question ?? '?'}" – ${a.note}`), '');
  if (g.unanswered.length) out.push('### Reserve: unanswered questions', ...g.unanswered.map((q) => `- "${q.question}" (${q.by})`), '');
  if (chain.appearances.length) out.push('### Repeated appearances', ...chain.appearances.map((a) => `- ${a.who}: ${a.videos.length} file(s), ${a.asks.length} question(s), ${a.answers.length} answer(s) – identified by question content and timecode`), '');
  if (chain.flags.length) out.push('### Flags', ...chain.flags.map((f) => `- ${f.by} (${f.item}): ${f.flags.join(', ')}`), '');
  if (chain.videoFlags.length) out.push('### Files to check', ...chain.videoFlags.flatMap((v) => v.flags.map((f) => `- ${v.video}: ${f.message}`)), '');
  if (chain.unverified.length) out.push(`Unverified proposals (check at the material, then remove "unverified"): ${chain.unverified.join(', ')}`, '');
  return out.join('\n');
}
