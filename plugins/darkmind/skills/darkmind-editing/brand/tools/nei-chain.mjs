#!/usr/bin/env node
// Dark Mind brand pack – Never Ending Interview chain reconstruction (Phase 6 WP5), guide: recipes/NEI_CHAIN.md.
//
//   node <skill>/brand/tools/nei-chain.mjs extract <transcript.json>... [--who <json>] [--out chain.json] [--force]
//   node <skill>/brand/tools/nei-chain.mjs build [chain.json] [--links <n>] [--format json|md] [--out <file>]
//
// extract: proposals from saved MCP get_transcript results (one JSON file per video or page) – who speaks, which
// question they answer (announced asker, the question read out), which question they ask the next band, with timecodes
// and quotes – written as chain.json with every item "unverified". `--who` maps videoId or fileName to a name for
// videos without a self-introduction. The agent checks every proposal at the material and corrects chain.json.
// build: graph, sub-chains, branches, gaps, Loud Society questions, repeated appearances, contradictions and the chosen
// path (--links n: the window of n links with the strongest answers) – JSON, or Markdown for the review report.

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildChain, chainReport, checkObservations, extractObservations } from '../lib/nei-chain.mjs';

const json = (value) => `${JSON.stringify(value, null, 2)}\n`;

function option(args, name) {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
}

async function readJson(file) {
  try {
    return JSON.parse((await fs.readFile(file, 'utf8')).replace(/^\uFEFF/, ''));
  } catch (error) {
    throw new Error(`${file} cannot be read: ${error.code === 'ENOENT' ? 'missing' : error.message}`);
  }
}

const VALUE_OPTIONS = ['--who', '--out', '--links', '--format'];
const positional = (args) => args.slice(1).filter((a, i, all) => !a.startsWith('--') && !VALUE_OPTIONS.includes(all[i - 1]));

export async function neiChainCommand(args) {
  if (args[0] === 'extract') {
    const files = positional(args);
    if (!files.length) throw new Error('usage: nei-chain.mjs extract <transcript.json>... [--who <json>] [--out chain.json] [--force]');
    const transcripts = [];
    for (const file of files) {
      const doc = await readJson(path.resolve(file));
      // a saved MCP result may be wrapped ({ content: [...] } or { data }) – take the transcript object
      const t = doc.lines ? doc : doc.data?.lines ? doc.data : doc.structuredContent?.lines ? doc.structuredContent : null;
      if (!t) throw new Error(`${file} is no get_transcript result (no "lines")`);
      transcripts.push(t);
    }
    let who = {};
    if (option(args, '--who')) {
      try {
        who = JSON.parse(option(args, '--who'));
      } catch (error) {
        throw new Error(`--who is not valid JSON: ${error.message}`);
      }
    }
    const result = extractObservations(transcripts, { who });
    const out = option(args, '--out');
    if (out) {
      if (!args.includes('--force') && (await fs.stat(path.resolve(out)).catch(() => null))) throw new Error(`${out} exists (it may hold checked observations); pass --force to overwrite`);
      await fs.writeFile(path.resolve(out), json(result));
    }
    return out ? { written: out, videos: result.videos, answers: result.answers.length, asks: result.asks.length, next: 'check every proposal at the material (transcript window, proxy), correct chain.json, remove "unverified" and "draft", then: nei-chain.mjs build' } : result;
  }
  if (args[0] === 'build') {
    const file = positional(args)[0] ?? 'chain.json';
    const doc = await readJson(path.resolve(file));
    const problems = checkObservations(doc);
    if (problems.length) throw new Error(`${file}: ${problems.join('; ')}`);
    const links = option(args, '--links') ? Number(option(args, '--links')) : null;
    if (links !== null && !(Number.isInteger(links) && links >= 1)) throw new Error('--links must be a whole number ≥ 1');
    const chain = buildChain(doc, { links });
    const format = option(args, '--format') ?? 'json';
    const text = format === 'md' ? chainReport(doc, chain) : json(chain);
    const out = option(args, '--out');
    if (out) await fs.writeFile(path.resolve(out), text.endsWith('\n') ? text : `${text}\n`);
    return format === 'md' ? text : chain;
  }
  throw new Error('usage: nei-chain.mjs extract <transcript.json>... [--who <json>] [--out chain.json] | build [chain.json] [--links <n>] [--format json|md] [--out <file>]');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  neiChainCommand(process.argv.slice(2)).then(
    (result) => process.stdout.write(typeof result === 'string' ? `${result}\n` : json(result)),
    (error) => {
      process.stderr.write(`nei-chain: ${error.message ?? error}\n`);
      process.exit(1);
    }
  );
}
