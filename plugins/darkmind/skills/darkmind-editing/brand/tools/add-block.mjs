#!/usr/bin/env node
// Dark Mind brand pack – vendors a brand block into a cut project (Phase 6 WP2–WP4).
//
//   node <skill>/brand/tools/add-block.mjs <block> [--project <dir>] [--id <extensionId>] [--params <json>]
//        [--frames <n>] [--scene <sceneId>] [--assets <brand-assets folder>] [--force]
//
// Copies the brand pack runtime (lib/, brand.json, the block's scene, the fonts, logos and audio/image assets it uses)
// into <project>/extensions/brand-pack/ and the npm manifest (playwright-core) into <project>/extensions/, writes
// extensions/<id>/extension.json with every input declared, the command, the tools and the output contract, and lists it
// in project.json. It never runs code, never installs anything and never touches the timeline: place the clip yourself,
// then `darkmind-agent extensions run` – an unchanged brand block needs no local approval, and extensions run installs
// playwright-core in extensions/ from the pack's lock file (npm ci --ignore-scripts).
// The thumbnail is a still image next to the video (no timeline clip; frame and headline go to the thumbnail review).
// `audio_master` is no extension: it writes project.json audioMaster (final loudness step of the renderer).
// Assets (Neuborn, logo SVGs, audio, images) come from brand-assets/: --assets, DARKMIND_BRAND_ASSETS,
// ~/.darkmind/brand-assets (installed by `darkmind-agent brand-assets <ticket>` from the MCP tool get_brand_assets –
// internal editors only, T12), <pack>/assets (older skill installations) or the repository.

import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { AUDIO_BLOCKS, BLOCKS, CAPTION_BLOCKS, PROJECT_STEPS, STILL_BLOCKS, assetPath, audioBlockFrames, blockAssets, blockClipRefs, blockDurationLimits, blockFaces, blockLogos, blockOutput, checkAssets, checkParameters, rangeFrames } from '../lib/blocks.mjs';
import { parseFps, profileOf } from '../lib/layout.mjs';
import { preflight } from '../lib/render.mjs';

const PACK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VENDOR = 'extensions/brand-pack';
const COMMON_LIB = ['lib/compositor.mjs', 'lib/render.mjs', 'lib/layout.mjs', 'lib/blocks.mjs', 'lib/media.mjs', 'lib/scene.mjs', 'lib/cmap.mjs'];
const MOTION_LIB = ['lib/motion.mjs'];
const CARDS_LIB = ['lib/cards.mjs'];

function option(args, name) {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
}

const sha = (buffer) => createHash('sha256').update(buffer).digest('hex');
const json = (value) => `${JSON.stringify(value, null, 2)}\n`;

/** Exact rational of a format-contract time string ("12.48", "1/3"). */
function rational(text) {
  const s = String(text);
  if (s.includes('/')) {
    const [n, d] = s.split('/');
    return { n: BigInt(n), d: BigInt(d) };
  }
  const [int, frac = ''] = s.split('.');
  return { n: BigInt(int + frac), d: 10n ** BigInt(frac.length) };
}

/** round_half_up((out − in) × fps) for whole frame rates (rule T1). */
function clipFrames(clip, fps) {
  const a = rational(clip.in);
  const b = rational(clip.out);
  const n = (b.n * a.d - a.n * b.d) * BigInt(fps);
  const d = a.d * b.d;
  return Number((2n * n + d) / (2n * d));
}

/** Timeline length in frames: end of the last clip or gap. */
export function timelineFrames(timeline, fps) {
  let end = 0;
  for (const track of [...(timeline.video ?? []), ...(timeline.audio ?? [])]) for (const clip of track.clips) end = Math.max(end, clip.start + clipFrames(clip, fps));
  for (const gap of timeline.gaps ?? []) end = Math.max(end, gap.end);
  return end;
}

async function readJson(file, what) {
  try {
    return JSON.parse((await fs.readFile(file, 'utf8')).replace(/^\uFEFF/, ''));
  } catch (error) {
    throw new Error(`${what} (${file}) cannot be read: ${error.code === 'ENOENT' ? 'missing' : error.message}`);
  }
}

async function findAssets(explicit) {
  const home = path.join(os.homedir(), '.darkmind', 'brand-assets');
  const candidates = [explicit, process.env.DARKMIND_BRAND_ASSETS, home, path.join(PACK, 'assets'), path.resolve(PACK, '..', '..', '..', 'brand-assets')].filter(Boolean);
  for (const dir of candidates) if (await fs.stat(path.join(dir, 'logo', 'logo.json')).catch(() => null)) return path.resolve(dir);
  throw new Error(`brand assets (fonts, logo) not found; in the editing skill: call the MCP tool get_brand_assets and run "darkmind-agent brand-assets <ticket>" (installs them into ${home}); otherwise pass --assets <brand-assets folder> or set DARKMIND_BRAND_ASSETS (tried: ${candidates.join(', ')})`);
}

/** Manifests of brand-assets/audio and images: id → entry. */
async function loadManifests(brand, assets) {
  const read = async (rel) => {
    const manifest = await readJson(path.join(assets, ...rel.split('/')), rel).catch(() => ({ assets: [] }));
    return new Map((manifest.assets ?? []).map((entry) => [entry.id, { ...entry, dir: path.dirname(rel) }]));
  };
  return { audio: await read(brand.assets.audioManifest), images: await read(brand.assets.imageManifest) };
}

/** Copies a file if its content differs; returns "added" | "updated" | "unchanged". */
async function vendor(source, target) {
  const content = await fs.readFile(source).catch((error) => {
    throw new Error(`${source} cannot be read: ${error.code === 'ENOENT' ? 'missing' : error.message}`);
  });
  const existing = await fs.readFile(target).catch(() => null);
  if (existing && sha(existing) === sha(content)) return 'unchanged';
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, content);
  return existing ? 'updated' : 'added';
}

function parseParams(args) {
  const raw = option(args, '--params');
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`--params is not valid JSON: ${error.message}`);
  }
}

/** audio_master: writes project.json audioMaster from the brand loudness (and the ducking of brand.json or --params). */
async function addAudioMaster(root, brand, project, parameters) {
  const unknown = Object.keys(parameters).filter((k) => k !== 'ducking');
  if (unknown.length) throw new Error(`audio_master takes only "ducking" (got ${unknown.join(', ')})`);
  const ducking = parameters.ducking === undefined ? brand.blocks.audio_master.ducking : parameters.ducking;
  if (ducking !== null && !(ducking && typeof ducking.underDialogDb === 'number' && ducking.underDialogDb >= 0 && ducking.underDialogDb <= 40 && typeof ducking.rampSeconds === 'number' && ducking.rampSeconds >= 0 && ducking.rampSeconds <= 2)) {
    throw new Error('ducking must be { "underDialogDb": 0–40, "rampSeconds": 0–2 } or null');
  }
  const { integratedLufs, toleranceLu, truePeakDbtp } = brand.loudness;
  project.audioMaster = { integratedLufs, toleranceLu, truePeakDbtp, ducking: ducking ? { underDialogDb: ducking.underDialogDb, rampSeconds: ducking.rampSeconds } : null };
  await fs.writeFile(path.join(root, 'project.json'), json(project));
  return {
    block: 'audio_master',
    projectJson: { audioMaster: project.audioMaster },
    next: [
      'darkmind-agent levels --apply (dialogue levels), then render: the renderer masters the whole mix (gain, peak limiter) and reports checks.loudness (target ±tolerance, true peak); a failed check makes render exit with 1',
      'music beds go on audio tracks with role "music" (ducked under dialog); the editorial and preview reviews cover the changed project.json',
    ],
  };
}

export async function addBlock(args) {
  const block = args[0];
  const all = [...BLOCKS, ...PROJECT_STEPS];
  if (!block || block.startsWith('--')) throw new Error(`usage: add-block.mjs <block> [--project <dir>] [--id <id>] [--params <json>] [--frames <n>] [--scene <sceneId>] [--assets <dir>] [--force]\nblocks: ${all.join(', ')}`);
  if (!all.includes(block)) throw new Error(`unknown block "${block}" (blocks: ${all.join(', ')})`);
  const root = path.resolve(option(args, '--project') ?? process.cwd());
  const brand = await readJson(path.join(PACK, 'brand.json'), 'brand.json');
  const project = await readJson(path.join(root, 'project.json'), 'project.json');
  let parameters = parseParams(args);
  if (block === 'audio_master') return addAudioMaster(root, brand, project, parameters);

  const id = option(args, '--id') ?? block.replace(/_/g, '-');
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(id) || id.toLowerCase() === 'brand-pack') throw new Error(`invalid extension ID "${id}"`);
  const packageJson = await readJson(path.join(PACK, 'package.json'), 'package.json of the brand pack');
  const info = await readJson(path.join(PACK, 'blocks', block, 'block.json'), `block.json of ${block}`);
  const { width, height, fps } = project.output;
  const profile = profileOf(brand, width, height);
  if (!profile || !info.profiles.includes(profile)) throw new Error(`${block} is made for the ${info.profiles.join('/')} profile; the project renders ${width} × ${height}`);

  const captionsPath = parameters.captions ?? project.artifacts?.captions ?? 'captions.json';
  if (CAPTION_BLOCKS[block]) parameters = { captions: captionsPath, ...parameters };

  const extensionFile = `extensions/${id}/extension.json`;
  const extensionAbs = path.join(root, ...extensionFile.split('/'));
  if (!args.includes('--force') && (await fs.stat(extensionAbs).catch(() => null))) throw new Error(`${extensionFile} exists; edit it, or pass --force to write it again`);

  const assets = await findAssets(option(args, '--assets'));
  const manifests = await loadManifests(brand, assets);
  const assetProblems = checkAssets(brand, block, parameters, manifests);
  if (assetProblems.length) throw new Error(`${block}: ${assetProblems.join('; ')}`);
  const used = blockAssets(brand, block, parameters);

  // durations: caption overlays cover the timeline, audio blocks last as long as their sound, timed blocks follow the brand limits
  const fpsNumber = parseFps(fps);
  const still = STILL_BLOCKS.includes(block);
  let frames = option(args, '--frames') ? Number(option(args, '--frames')) : undefined;
  if (still && frames !== undefined && frames !== 1) throw new Error(`${block} is one still image; --frames does not apply`);
  if (frames === undefined) {
    if (still) frames = 1;
    else if (CAPTION_BLOCKS[block]) {
      const timeline = await readJson(path.join(root, ...(project.artifacts?.timeline ?? 'timeline.json').split('/')), 'timeline.json');
      frames = timelineFrames(timeline, fpsNumber) - (parameters.startFrame ?? 0);
    } else if (AUDIO_BLOCKS.includes(block)) {
      const durations = Object.fromEntries(used.audio.map((a) => [a.id, manifests.audio.get(a.id).durationS]));
      frames = audioBlockFrames(brand, block, parameters, durations, fpsNumber);
    } else if (block === 'vertical_in_16x9') {
      // as long as the clip (rule T1), so the block covers the statement's video frame by frame
      const issues = checkParameters(brand, block, parameters, profile);
      if (issues.length) throw new Error(`: ${issues.join('; ')}`);
      frames = rangeFrames(parameters.clip.in, parameters.clip.out, fps);
    } else frames = blockDurationLimits(brand, block, fpsNumber).default;
  }
  if (!Number.isInteger(frames) || frames < 1) throw new Error(`--frames must be a whole number of frames ≥ 1 (got ${frames})`);
  const kind = blockOutput(brand, block, parameters);
  const ext = kind.image ? 'png' : !kind.video ? 'wav' : kind.alpha ? 'mov' : 'mp4';
  const output = kind.image
    ? { path: `renders/extensions/${id}.${ext}`, durationFrames: 1, width: brand.blocks[block].still.width, height: brand.blocks[block].still.height, fps, audio: false, alpha: false, image: true }
    : { path: `renders/extensions/${id}.${ext}`, durationFrames: frames, width, height, fps, audio: kind.audio, alpha: kind.alpha, ...(kind.video ? {} : { video: false }) };
  const problems = preflight(brand, block, output, parameters);
  if (problems.length) throw new Error(`${block}: ${problems.join('; ')}`);

  // vendor the runtime
  const entry = info.scene ? `blocks/${block}/scene.html` : `blocks/${block}/block.json`;
  const lib = [...COMMON_LIB, ...(info.scene ? [info.scene] : []), ...(['chevron_wipe', 'logo_sting', 'logo_end', 'endcard', 'thumbnail', 'cliffhanger_card'].includes(block) ? MOTION_LIB : []), ...(['format_card', 'band_card', 'cliffhanger_card'].includes(block) ? CARDS_LIB : [])];
  const copies = [...lib, 'brand.json', entry].map((rel) => ({ source: path.join(PACK, ...rel.split('/')), target: `${VENDOR}/${rel}` }));
  for (const face of blockFaces(brand, block)) copies.push({ source: path.join(assets, ...brand.fonts.faces[face].source.split('/')), target: `${VENDOR}/assets/${brand.fonts.faces[face].file}` });
  for (const logo of blockLogos(brand, block, parameters, profile)) {
    if (logo.key === 'suffix') {
      if (!(await fs.stat(path.join(assets, ...logo.source.split('/'))).catch(() => null))) throw new Error(`${logo.source} does not exist in brand-assets; build it with: node brand-assets/tools/build-logo.mjs --suffix ${parameters.suffix}`);
      copies.push({ source: path.join(assets, ...logo.source.split('/')), target: `${VENDOR}/assets/${logo.file}` });
    } else copies.push({ source: path.join(assets, ...brand.logo[logo.key].source.split('/')), target: `${VENDOR}/assets/${brand.logo[logo.key].file}` });
  }
  for (const [type, list] of [['audio', used.audio], ['images', used.images]]) {
    for (const a of list) {
      const entryOf = manifests[type].get(a.id);
      copies.push({ source: path.join(assets, ...entryOf.dir.split('/'), ...entryOf.file.split('/')), target: `${VENDOR}/${assetPath(type, a.id, path.extname(entryOf.file).toLowerCase())}` });
    }
  }
  const manifest = await readJson(path.join(root, 'extensions', 'package.json'), 'extensions/package.json').catch(() => null);
  if (manifest && manifest.name !== 'darkmind-brand-pack') throw new Error('extensions/package.json belongs to something else; add "playwright-core" there yourself and remove the brand pack copy step');
  const npmFiles = info.scene
    ? [
        { source: path.join(PACK, 'package.json'), target: 'extensions/package.json' },
        { source: path.join(PACK, 'package-lock.json'), target: 'extensions/package-lock.json' },
      ]
    : [];
  const written = {};
  for (const copy of [...copies, ...npmFiles]) written[copy.target] = await vendor(copy.source, path.join(root, ...copy.target.split('/')));

  const inputs = [...new Set(copies.map((c) => c.target))].sort().map((p) => ({ kind: 'file', path: p }));
  if (CAPTION_BLOCKS[block]) inputs.push({ kind: 'file', path: captionsPath });
  const clipRefs = blockClipRefs(block, parameters).map((r) => r.ref);
  for (const ref of clipRefs) {
    const input = ref.sourceId ? { kind: 'source', sourceId: ref.sourceId } : { kind: 'extension', extensionId: ref.extensionId };
    if (!inputs.some((i) => JSON.stringify(i) === JSON.stringify(input))) inputs.push(input);
  }
  const sceneId = option(args, '--scene');
  const extension = {
    schemaVersion: 1,
    id,
    version: brand.version,
    description: `Loud Society brand block ${block} (brand pack ${brand.version}): ${info.description}`,
    ...(sceneId ? { sceneId } : {}),
    inputs,
    parameters,
    command: { program: 'node', args: [`${VENDOR}/lib/render.mjs`, `${VENDOR}/${entry}`] },
    tools: [
      { name: 'node', version: '>=20' },
      { name: 'ffmpeg' },
      ...(info.scene ? [{ name: 'npm:playwright-core', version: packageJson.dependencies['playwright-core'] }] : []),
    ],
    output,
  };
  await fs.mkdir(path.dirname(extensionAbs), { recursive: true });
  await fs.writeFile(extensionAbs, json(extension));
  const extensions = project.extensions ?? [];
  if (!extensions.includes(extensionFile)) {
    project.extensions = [...extensions, extensionFile];
    await fs.writeFile(path.join(root, 'project.json'), json(project));
  }
  const seconds = frames / fpsNumber;
  const out = Number.isInteger(seconds) ? String(seconds) : `${frames}/${fpsNumber}`;
  const clip = { id: `x-${id}`, extensionId: id, ...(sceneId ? { sceneId } : {}), in: '0', out, start: CAPTION_BLOCKS[block] ? (parameters.startFrame ?? 0) : '<timeline frame>' };
  const timelineClips = still
    ? {}
    : !kind.video
      ? { audio: { ...clip, id: `xa-${id}`, gainDb: 0, track: 'role "effects"' } }
      : kind.audio
        ? { video: { ...clip, track: 'role "main" or "graphics"' }, audio: { ...clip, id: `xa-${id}`, gainDb: 0, linkedTo: clip.id, track: 'role "effects"' } }
        : { video: { ...clip, track: kind.alpha ? 'role "overlay"' : 'role "main" or "graphics"' } };
  const stillSteps = parameters.candidates
    ? [
        `darkmind-agent extensions run ${id} → show ${output.path} (contact sheet A–${String.fromCharCode(64 + parameters.candidates.length)}) to the editor and let them choose`,
        `after the editor's choice: add-block ${block} --force --params with "frame" = the chosen candidate (and the headline), then run it again`,
      ]
    : [
        `darkmind-agent extensions run ${id} → show ${output.path} to the editor`,
        `darkmind-agent review show thumbnail → only after the editor's explicit confirmation: darkmind-agent review approve thumbnail --hash <hash> --by "<editor>" --confirmation "<the editor's words>"`,
        `darkmind-agent extensions run ${id} --original (the deliverable from the original; needs the thumbnail approval)`,
      ];
  return {
    block,
    id,
    extension: extensionFile,
    output: output.path,
    frames,
    assets: Object.fromEntries([...used.audio, ...used.images].map((a) => [a.role, a.id])),
    vendored: written,
    timelineClips,
    next: [
      CAPTION_BLOCKS[block] ? `set "style": "${CAPTION_BLOCKS[block]}" in ${captionsPath}` : null,
      block === 'band_card'
        ? 'reveal and leave the card with chevron wipes: before it a wipe with b = { "extensionId": this card, "in": "0" } (the card continues with in = wipe length), after it a wipe with a = { "extensionId": this card, "in": card length − wipe length }'
        : null,
      block === 'vertical_in_16x9' ? `place the video clip on a "graphics" track exactly over the statement's video clip (same start, ${frames} frames); the statement's dialog clip keeps the sound` : null,
      block === 'chevron_wipe' && parameters.a
        ? `the wipe replaces the cut: end clip A at the wipe start, place the wipe (${frames} frames) there, continue clip B right after it with in = b.in + ${out} s`
        : null,
      still ? `${output.path} is a still image next to the video: never place it on the timeline` : `place ${Object.keys(timelineClips).join(' + ')} clip(s) of timelineClips in timeline.json (drop the "track" hint)`,
      info.scene ? 'darkmind-agent extensions run installs playwright-core in extensions/ by itself (npm ci --ignore-scripts from the brand pack lock file); Microsoft Edge must be installed or DARKMIND_TOOL_MSEDGE set' : null,
      'an unchanged brand block needs no approval (darkmind-agent extensions show <id> says so); never edit extensions/brand-pack/',
      ...(still ? stillSteps : ['darkmind-agent extensions run (or render --proxy)']),
    ].filter(Boolean),
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  addBlock(process.argv.slice(2)).then(
    (result) => process.stdout.write(json(result)),
    (error) => {
      process.stderr.write(`add-block: ${error.message ?? error}\n`);
      process.exit(1);
    }
  );
}
