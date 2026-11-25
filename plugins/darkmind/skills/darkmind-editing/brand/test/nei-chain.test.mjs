// Brand pack – WP5 tests of the NEI chain reconstruction (pure): synthetic transcripts (fictional bands, no real
// material) modelling the findings of doc/mvp/NEI_REFERENCE_MATERIAL.md – a unique chain, a gapped chain (unanswered
// question, answer without filmed question, Loud Society question, a band appearing twice, separate sub-chains) and a
// contradictory chain (branch, announcement vs. question content, ambiguous near-identical questions, mixed speakers).
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { buildChain, chainReport, checkObservations, contentWords, extractObservations, extractVideo, questionSimilarity, sameName } from '../lib/nei-chain.mjs';
import { neiChainCommand } from '../tools/nei-chain.mjs';

const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'nei-fixtures');
const fixture = async (name) => JSON.parse(await fs.readFile(path.join(DIR, `${name}.json`), 'utf8')).transcripts;
const byOf = (doc, id) => [...doc.answers, ...doc.asks].find((i) => i.id === id)?.by;
const chosenBands = (doc, chain) => [chain.chosen.starter, ...chain.chosen.links.map((id) => byOf(doc, id))];

describe('question and name matching', () => {
  it('compares questions by their content words, not by wording', () => {
    assert.deepEqual(contentWords('What is the worst haircut you ever had on tour?'), ['worst', 'haircut', 'tour']);
    assert.equal(questionSimilarity('If your tour bus could talk, what would it complain about?', 'if your tour bus could talk – what would it complain about'), 1);
    assert.ok(questionSimilarity('What was the worst show you have ever played?', 'What was your least favorite show you have ever played?') >= 0.5);
    assert.ok(questionSimilarity('Tour talisman for good luck?', 'What car part would you be?') === 0);
  });

  it('recognises the same band by aliases, initials and shorter forms', () => {
    assert.ok(sameName('Bullet For My Valentine', 'BFMV'));
    assert.ok(sameName('Myles', 'Myles Kennedy'));
    assert.ok(sameName('The Warning', 'warning'));
    assert.ok(sameName('Specki', 'Specki (In Extremo)'));
    assert.ok(sameName('KMU Strike Master', 'Strikemaster', { 'KMU Strike Master': ['Strikemaster'] }));
    assert.ok(!sameName('Static X', 'Static Orchard'));
  });
});

describe('unique chain', () => {
  it('reads the usual announcements, also after the question was read out', () => {
    const doc = { videoId: 'v', fileName: 'x.mp4', lines: ['0.00-2.00 S2: Hi, we are Rubber Saints.', '2.00-4.00 S1: This one came from Glass Harbor.', '4.00-8.00 S1: OK, so is there any song you wish was popular?', '8.00-12.00 S2: All of them.'] };
    const result = extractVideo(doc);
    assert.deepEqual(result.answers.map((a) => [a.by, a.askedBy, a.question]), [['Rubber Saints', 'Glass Harbor', 'OK, so is there any song you wish was popular?']]);
  });
  it('reconstructs the linear chain with evidence and the open question as reserve', async () => {
    const doc = extractObservations(await fixture('unique'));
    assert.deepEqual(checkObservations(doc), []);
    const chain = buildChain(doc);
    assert.deepEqual(chosenBands(doc, chain), ['Glass Harbor', 'Velvet Coyote', 'Iron Lullaby', 'Neon Burial', 'Paper Wolves']);
    assert.equal(chain.subChains.length, 1);
    assert.deepEqual([chain.branches, chain.conflicts, chain.rejected], [[], [], []]);
    assert.deepEqual(chain.gaps.unanswered.map((q) => q.question), ['who in your band snores the loudest?']);
    assert.equal(byOf(doc, chain.chosen.openQuestion), 'Paper Wolves');
    // every link carries source and timecode of question and answer
    const first = chain.links.find((l) => l.answer === chain.chosen.links[0]);
    assert.deepEqual([first.evidence.ask.fileName, first.evidence.ask.start, first.evidence.answer.fileName, first.evidence.answer.start], ['NEI_GlassHarbor_Question.mp4', 6.1, 'NEI_VelvetCoyote.mp4', 5]);
    assert.deepEqual(first.evidence.answer.answerRange, { start: 12, end: 26 });
    // the window with the strongest answers
    doc.answers.find((a) => a.by === 'Neon Burial').strength = 3;
    const window = buildChain(doc, { links: 2 });
    // windows of two links: 2+2, 2+3, 3+2 – the first strongest wins (Iron Lullaby and Neon Burial answer)
    assert.deepEqual(chosenBands(doc, window), ['Velvet Coyote', 'Iron Lullaby', 'Neon Burial']);
    assert.match(window.chosen.reason, /window of 2 links/);
  });
});

describe('gapped chain', () => {
  it('finds gaps, the off-camera questions, the repeated band and the longest sub-chain', async () => {
    const doc = extractObservations(await fixture('gapped'));
    const chain = buildChain(doc);
    // Mirror Static answered an unfilmed question and starts the longest sub-chain; Hollow Kings is identified per file
    assert.deepEqual(chosenBands(doc, chain), ['Mirror Static', 'Copper Saints', 'Hollow Kings']);
    assert.equal(chain.subChains.find((s) => s.starter === 'Mirror Static').startKind, 'unfilmed-question');
    assert.deepEqual(chain.rejected.map((r) => r.starter), ['Rust Parade']);
    assert.deepEqual(chain.gaps.unanswered.map((q) => q.question), ['did you ever sleep in a festival toilet?', 'what is your favourite festival food?', 'would you rather be a wrestler or an acrobat?']);
    assert.deepEqual(chain.gaps.unfilmedQuestion.map((a) => [a.by, a.question]), [['Mirror Static', 'when did you decide to make music?']]);
    assert.deepEqual(chain.gaps.loudSociety.map((a) => a.by), ['Brass Tooth']);
    assert.deepEqual(chain.appearances.map((a) => [a.who, a.videos.length]), [['Hollow Kings', 2]]);
    // Hollow Kings' first answer continues with the question of the same file, not the one of the second festival
    const wacken = chain.links.find((l) => l.answeredBy === 'Hollow Kings' && l.evidence.answer.fileName === 'NEI_HollowKings_Wacken.mov');
    assert.deepEqual(wacken.next.map((id) => doc.asks.find((q) => q.id === id).question), ['did you ever sleep in a festival toilet?']);
    assert.match(chainReport(doc, chain), /Reserve: unanswered questions[\s\S]*festival toilet/);
  });
});

describe('contradictory chain', () => {
  it('chooses a branch, flags contradiction and ambiguity for the editor and never uses them', async () => {
    const doc = extractObservations(await fixture('contradictory'));
    const chain = buildChain(doc);
    assert.deepEqual(chosenBands(doc, chain), ['Salt Cathedral', 'Night Ferry', 'Velour Engine']);
    assert.deepEqual(chain.branches.map((b) => [b.answers.map((a) => a.by), byOf(doc, b.chosen)]), [[['Night Ferry', 'Static Orchard'], 'Night Ferry']]);
    assert.deepEqual(chain.conflicts.map((c) => [c.kind, byOf(doc, c.answer)]), [['contradiction', 'Ember Choir'], ['ambiguous', 'Granite Bloom']]);
    assert.ok(!chain.links.some((l) => ['Ember Choir', 'Granite Bloom'].includes(l.answeredBy)), 'flagged answers are no links');
    assert.deepEqual(chain.videoFlags.map((v) => [v.video, v.flags[0].code]), [['NEI_NightFerry.mp4', 'mixed-speakers']]);
    // the open question of Velour Engine is the one asked in the same file
    assert.equal(doc.asks.find((q) => q.id === chain.chosen.openQuestion).question, 'what was the worst show you have ever played?');
    const report = chainReport(doc, chain);
    assert.match(report, /For the editor \(not used\)[\s\S]*contradiction[\s\S]*ambiguous/);
    assert.match(report, /Files to check[\s\S]*Pale Rider/);
  });

  it('uses the editor\'s decision once the agent corrected chain.json', async () => {
    const doc = extractObservations(await fixture('contradictory'));
    // the editor confirms at the material: Granite Bloom answers Velour Engine's question of the first file
    const granite = doc.answers.find((a) => a.by === 'Granite Bloom');
    granite.question = 'what was the worst show you have ever played?';
    const chain = buildChain(doc);
    assert.deepEqual(chosenBands(doc, chain), ['Salt Cathedral', 'Night Ferry', 'Velour Engine', 'Granite Bloom']);
    assert.deepEqual(chain.conflicts.map((c) => c.kind), ['contradiction']);
  });
});

describe('nei-chain.mjs', () => {
  it('extracts to chain.json without overwriting checked observations and builds the report', async () => {
    const dir = await fs.mkdtemp(path.join(process.env.DARKMIND_BRAND_TEST_DIR || os.tmpdir(), 'nei-chain-'));
    try {
      const files = [];
      for (const [i, t] of (await fixture('unique')).entries()) {
        const file = path.join(dir, `t${i}.json`);
        await fs.writeFile(file, JSON.stringify(i === 0 ? { data: t } : t));
        files.push(file);
      }
      const out = path.join(dir, 'chain.json');
      const result = await neiChainCommand(['extract', ...files, '--out', out]);
      assert.deepEqual([result.answers, result.asks], [4, 5]);
      await assert.rejects(neiChainCommand(['extract', ...files, '--out', out]), /exists/);
      const md = await neiChainCommand(['build', out, '--format', 'md']);
      assert.match(md, /^## NEI chain/);
      assert.match(md, /\| 4 \| what do you eat right before a show\? \(Neon Burial\) \| Paper Wolves/);
      await fs.writeFile(out, JSON.stringify({ schemaVersion: 1, kind: 'darkmind-nei-chain', answers: [{ id: 'a', by: 'X' }], asks: [] }));
      await assert.rejects(neiChainCommand(['build', out]), /needs the source[\s\S]*needs evidence/);
    } finally {
      await fs.rm(dir, { recursive: true, force: true });
    }
  });
});
