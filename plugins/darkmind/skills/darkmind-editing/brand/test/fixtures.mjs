// Synthetic cut projects for the brand block tests (no real media; captions with word timings in timeline frames).
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { addBlock } from '../tools/add-block.mjs';

export const PROFILES = {
  vertical: { width: 1080, height: 1920, fps: '30/1' },
  landscape: { width: 1920, height: 1080, fps: '25/1' },
};

/** Evenly timed words of a caption text (test data only; real projects take them from get_word_timings, rule W1). */
export function evenWords(text, start, end, emphasis = []) {
  const tokens = text.split(/\s+/).filter(Boolean);
  const span = end - start;
  return tokens.map((t, i) => ({
    text: t,
    start: start + Math.floor((span * i) / tokens.length),
    end: start + Math.floor((span * (i + 1)) / tokens.length),
    ...(emphasis.includes(i) ? { emphasis: true } : {}),
  }));
}

/** Captions of the fixtures: umlauts, punctuation, an emphasised word, explicit and automatic line breaks. */
export function fixtureCaptions(style) {
  const captions = [
    { id: 'c1', start: 10, end: 70, text: 'Grüße aus Köln: Übermäßig laut!', statementId: 's1' },
    { id: 'c2', start: 70, end: 130, text: 'We played a show in the rain,\nthe stage was flooding.', statementId: 's1' },
    { id: 'c3', start: 140, end: 200, text: 'Honestly, that was the best night.', statementId: 's1' },
  ];
  if (style === 'brand-word') {
    captions[0].words = evenWords(captions[0].text, 10, 70, [3]);
    captions[1].words = evenWords(captions[1].text, 70, 130);
    captions[2].words = evenWords(captions[2].text, 140, 200, [4]);
  }
  return { schemaVersion: 1, language: 'en', style, captions };
}

/**
 * Writes a minimal project (project.json, timeline.json with a 240-frame gap, captions.json) into a fresh temp folder
 * and vendors the given blocks. Returns { root, added }.
 */
export async function fixtureProject(profile, { style = 'plain', blocks = [], base = process.env.DARKMIND_BRAND_TEST_DIR || os.tmpdir(), assets } = {}) {
  const root = await fs.mkdtemp(path.join(base, `brand-${profile}-`));
  const output = { ...PROFILES[profile], sampleRate: 48000 };
  const project = {
    schemaVersion: 1,
    kind: 'darkmind-edit-project',
    title: `Brand block fixture (${profile})`,
    output,
    recipe: null,
    artifacts: { sources: 'sources.json', edit: 'edit.json', timeline: 'timeline.json', captions: 'captions.json' },
    extensions: [],
  };
  const write = (file, value) => fs.writeFile(path.join(root, file), `${JSON.stringify(value, null, 2)}\n`);
  await write('project.json', project);
  await write('timeline.json', { schemaVersion: 1, video: [], audio: [], gaps: [{ start: 0, end: 240, fill: 'black-and-silence', reason: 'fixture' }] });
  await write('captions.json', fixtureCaptions(style));
  const added = {};
  for (const [block, options = {}] of blocks) {
    const args = [block, '--project', root];
    if (options.id) args.push('--id', options.id);
    if (options.params) args.push('--params', JSON.stringify(options.params));
    if (options.frames) args.push('--frames', String(options.frames));
    if (assets) args.push('--assets', assets);
    added[options.id ?? block.replace(/_/g, '-')] = await addBlock(args);
  }
  return { root, added };
}

/** Run inputs of a vendored extension (as the runner passes them). */
export async function runInputs(root, id) {
  const extension = JSON.parse(await fs.readFile(path.join(root, 'extensions', id, 'extension.json'), 'utf8'));
  const files = Object.fromEntries(extension.inputs.filter((i) => i.kind === 'file').map((i) => [i.path, path.join(root, ...i.path.split('/'))]));
  return { extension, root, files, parameters: extension.parameters ?? {}, output: { ...extension.output, file: path.join(root, ...extension.output.path.split('/')) }, scene: extension.command.args[1] };
}
