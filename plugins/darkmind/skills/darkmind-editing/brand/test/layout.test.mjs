// Brand pack – pure tests (no browser): brand tokens and safe zones, line breaks, character limits, umlauts, word
// groups and frame-exact timing, duration and parameter limits, vendoring (add-block). Run: npm test (node --test).
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { fontCodePoints, missingCharacters } from '../lib/cmap.mjs';
import { breakLines, checkBlockParameters, checkCaptions, durationLimits, lineLimits, popScale, profileOf, wordGroups, wordStateAt } from '../lib/layout.mjs';
import { audioBlockFrames, audioCues, bandCardLines, blockDurationLimits, blockOutput, checkParameters, cliffhangerText, formatCardText, gradeValue, headlineLines, rangeFrames } from '../lib/blocks.mjs';
import { preflight } from '../lib/render.mjs';
import { addBlock, timelineFrames } from '../tools/add-block.mjs';
import { evenWords, fixtureCaptions, fixtureProject } from './fixtures.mjs';

const PACK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const brand = JSON.parse(await fs.readFile(path.join(PACK, 'brand.json'), 'utf8'));
const inside = (value, low, high) => value >= low - 1e-9 && value <= high + 1e-9;

describe('brand.json', () => {
  it('is versioned like the package and lists both profiles with the house norm (T5)', async () => {
    const pkg = JSON.parse(await fs.readFile(path.join(PACK, 'package.json'), 'utf8'));
    assert.equal(brand.version, pkg.version);
    assert.deepEqual([brand.profiles.vertical.width, brand.profiles.vertical.height, brand.profiles.vertical.fps], [1080, 1920, '30/1']);
    assert.deepEqual([brand.profiles.landscape.width, brand.profiles.landscape.height, brand.profiles.landscape.fps], [1920, 1080, '25/1']);
    assert.deepEqual([brand.loudness.integratedLufs, brand.loudness.truePeakDbtp], [-14, -1]);
    assert.equal(profileOf(brand, 1080, 1920), 'vertical');
    assert.equal(profileOf(brand, 1280, 720), null);
  });

  it('keeps every text block inside the safe area of its profile', () => {
    const v = brand.profiles.vertical.textSafe;
    const l = brand.profiles.landscape.textSafe;
    const zone = (id) => brand.profiles.vertical.zones.find((z) => z.id === id);
    const b = brand.blocks;
    // centred blocks: half the maximum width around the centre
    for (const [settings, safe] of [[b.caption_word, v], [b.caption_phrase, v], [b.subtitles_16x9, l], [b.title_card, l]]) {
      assert.ok(inside(0.5 - settings.maxWidth / 2, safe.left, safe.right) && inside(0.5 + settings.maxWidth / 2, safe.left, safe.right));
    }
    // vertical layout: word captions and lower third in the 56–70 % band, phrase captions in 70–80 %, top 15 % free
    const word = zone('lower-third-word-captions');
    // text is centred on centerY; capitals and descenders reach about ¾ cap height to each side (pixels: render tests)
    assert.ok(inside(b.caption_word.centerY - 0.75 * b.caption_word.capHeight * b.caption_word.popScale, word.top, word.bottom));
    assert.ok(inside(b.caption_word.centerY + 0.75 * b.caption_word.capHeight, word.top, word.bottom));
    assert.ok(inside(b.caption_phrase.bottom, zone('phrase-captions').top, zone('phrase-captions').bottom));
    const lt = b.lower_third.profiles.vertical;
    assert.ok(inside(lt.nameTop, word.top, word.bottom) && lt.left >= v.left);
    // the lower third ends above the word caption line
    assert.ok(lt.nameTop + lt.nameCap * (1 + b.lower_third.roleGap) + lt.roleCap * 1.5 < b.caption_word.centerY - 0.75 * b.caption_word.capHeight * b.caption_word.popScale);
    // the wordmark flash sits above the caption line, inside the safe area
    const flash = b.caption_word.centerY - b.wordmark_flash.gapAboveCaption;
    assert.ok(inside(flash, v.top, v.bottom) && flash < b.caption_word.centerY);
    const landscape = b.lower_third.profiles.landscape;
    assert.ok(landscape.left >= l.left && landscape.right <= l.right && landscape.nameTop + landscape.nameCap + landscape.roleCap * 2 < l.bottom);
  });
});

describe('glyph coverage of Neuborn (cmap)', () => {
  it('covers Latin text with umlauts and ß in every used face and reports what it lacks', async () => {
    const assets = path.resolve(PACK, '..', '..', '..', 'brand-assets');
    for (const face of Object.values(brand.fonts.faces)) {
      const points = fontCodePoints(await fs.readFile(path.join(assets, ...face.source.split('/'))));
      assert.deepEqual(missingCharacters(points, `${brand.fonts.requiredGlyphs} Grüße aus Köln: Übermäßig laut! "It's 100%" – @gustahill`), [], face.file);
      assert.deepEqual(missingCharacters(points, 'ok ✓ 漢'), ['✓', '漢']);
    }
  });
});

describe('line breaks and character limits', () => {
  const phrase = lineLimits(brand.blocks.caption_phrase);

  it('keeps a line of exactly the limit and wraps one character more into two balanced lines', () => {
    const exact = 'a'.repeat(10) + ' ' + 'b'.repeat(21);
    assert.equal(exact.length, 32);
    assert.deepEqual(breakLines(exact, phrase).lines, [exact]);
    const wrapped = breakLines('Everybody was jumping, the floor was shaking.', phrase);
    assert.deepEqual(wrapped, { lines: ['Everybody was jumping,', 'the floor was shaking.'], overflow: null });
  });

  it('keeps explicit line breaks and refuses captions that need more lines or contain an overlong word', () => {
    assert.deepEqual(breakLines('Short.\nAlso short.', phrase).lines, ['Short.', 'Also short.']);
    assert.match(breakLines('Mine was a stadium show with my dad.\nHonestly, I was bored.', phrase).overflow, /needs 3 lines/);
    assert.match(breakLines('Donaudampfschifffahrtsgesellschaftskapitän', phrase).overflow, /longer than 32/);
  });

  it('counts umlauts and ß as one character each', () => {
    const umlauts = 'Grüße aus Köln: Übermäßig laut!';
    assert.equal([...umlauts].length, 31);
    assert.deepEqual(breakLines(umlauts, phrase).lines, [umlauts]);
    assert.deepEqual(breakLines('ÄÖÜäöüß '.repeat(4).trim(), { maxChars: 15, maxLines: 2 }).lines, ['ÄÖÜäöüß ÄÖÜäöüß', 'ÄÖÜäöüß ÄÖÜäöüß']);
  });

  it('checks captions.json against the block: style, word timings, limits', () => {
    const words = fixtureCaptions('brand-word');
    assert.deepEqual(checkCaptions(words, 'caption_word', brand.blocks.caption_word), []);
    const missing = structuredClone(words);
    delete missing.captions[1].words;
    assert.deepEqual(checkCaptions(missing, 'caption_word', brand.blocks.caption_word).map((i) => i.id), ['c2']);
    assert.match(checkCaptions(words, 'caption_phrase', brand.blocks.caption_phrase)[0].message, /style "brand-word"/);
    const long = fixtureCaptions('brand-phrase');
    long.captions[0].text = 'This caption is far too long for two lines of thirty-two characters each.';
    assert.deepEqual(checkCaptions(long, 'caption_phrase', brand.blocks.caption_phrase).map((i) => i.id), ['c1']);
    assert.deepEqual(checkCaptions(fixtureCaptions('brand-16x9'), 'subtitles_16x9', brand.blocks.subtitles_16x9), []);
  });
});

describe('word captions: groups and frame-exact timing', () => {
  const settings = brand.blocks.caption_word;

  it('groups 1–3 words, breaks after punctuation, pauses and length, emphasised words stand alone', () => {
    const caption = { id: 'c', start: 0, end: 200, text: '', words: [] };
    caption.words = [
      ['One', 0, 5], ['two', 5, 10], ['three', 10, 15], ['four', 15, 20], // max 3
      ['five,', 20, 25], ['six', 25, 30], // punctuation
      ['seven', 40, 45], // pause of 10 frames > 0.25 s at 30 fps
      ['eight', 45, 50], ['LOUD', 50, 60, true], ['nine', 60, 70], // emphasis alone
      ['extraordinarily', 70, 80], ['long', 80, 90], // > 16 characters
    ].map(([text, start, end, emphasis]) => ({ text, start, end, ...(emphasis ? { emphasis } : {}) }));
    caption.text = caption.words.map((w) => w.text).join(' ');
    const groups = wordGroups([caption], settings, 30);
    assert.deepEqual(groups.map((g) => g.words.map((w) => w.text).join(' ')), ['One two three', 'four five,', 'six', 'seven eight', 'LOUD', 'nine', 'extraordinarily', 'long']);
    // a group shows until the next group starts, the last one until the caption ends
    assert.deepEqual(groups.map((g) => [g.start, g.end]), [[0, 15], [15, 25], [25, 40], [40, 50], [50, 60], [60, 70], [70, 80], [80, 200]]);
  });

  it('shows each word from its own start frame and changes the state key only when the picture changes (R4)', () => {
    const caption = { id: 'c1', start: 10, end: 70, text: 'Grüße aus Köln: Übermäßig laut!', words: evenWords('Grüße aus Köln: Übermäßig laut!', 10, 70, [3]) };
    const groups = wordGroups([caption], settings, 30);
    assert.equal(wordStateAt(groups, 9, settings), null);
    assert.equal(wordStateAt(groups, 10, settings).visible, 1);
    assert.equal(wordStateAt(groups, 21, settings).visible, 1);
    assert.equal(wordStateAt(groups, 22, settings).visible, 2);
    assert.equal(wordStateAt(groups, 69, settings).group.captionId, 'c1');
    assert.equal(wordStateAt(groups, 70, settings), null);
    // emphasised word (start 46): a new key on every pop frame, then constant
    const keys = [46, 47, 53, 54, 55, 57].map((f) => wordStateAt(groups, f, settings).key);
    assert.equal(new Set(keys.slice(0, 3)).size, 3);
    assert.equal(keys[3], keys[4]);
    assert.equal(popScale(settings, 0), settings.popScale);
    assert.equal(popScale(settings, settings.popFrames), settings.emphasisScale);
    assert.equal(popScale(settings, 100), settings.emphasisScale);
  });
});

describe('durations and parameters (brand-layer limits, T6)', () => {
  it('limits the lower third to glitch-in + 3–6 s hold + glitch-out and the flash to 0.3–3 s', () => {
    assert.deepEqual(durationLimits(brand, 'lower_third', 30), { min: 105, max: 195, default: 135 });
    assert.deepEqual(durationLimits(brand, 'lower_third', 25), { min: 88, max: 163, default: 113 });
    assert.deepEqual(durationLimits(brand, 'wordmark_flash', 30), { min: 9, max: 90, default: 45 });
    assert.equal(durationLimits(brand, 'caption_word', 30), null);
  });

  it('checks people, titles and positions', () => {
    assert.deepEqual(checkBlockParameters(brand, 'lower_third', { people: [{ name: 'Gustavo Hill', role: '@gustahill' }] }, 'vertical'), []);
    assert.match(checkBlockParameters(brand, 'lower_third', { people: [{ name: 'A' }, { name: 'B' }] }, 'vertical')[0], /1–1 entries/);
    assert.deepEqual(checkBlockParameters(brand, 'lower_third', { people: [{ name: 'A' }, { name: 'B' }] }, 'landscape'), []);
    assert.match(checkBlockParameters(brand, 'lower_third', { people: [{ name: 'X'.repeat(29) }] }, 'landscape')[0], /longer than 28/);
    assert.match(checkBlockParameters(brand, 'title_card', { title: '' }, 'landscape')[0], /title is required/);
    assert.match(checkBlockParameters(brand, 'wordmark_flash', { centerY: 0.9 }, 'vertical')[0], /safe area/);
  });

  it('checks the output contract against profile, frame rate, alpha and container', () => {
    const ok = { path: 'renders/extensions/x.mov', durationFrames: 135, width: 1080, height: 1920, fps: '30/1', audio: false, alpha: true };
    const people = { people: [{ name: 'A' }] };
    assert.deepEqual(preflight(brand, 'lower_third', ok, people), []);
    assert.match(preflight(brand, 'lower_third', { ...ok, fps: '25/1' }, people).join(), /30\/1 fps/);
    assert.match(preflight(brand, 'lower_third', { ...ok, durationFrames: 300 }, people).join(), /outside the brand limits/);
    assert.match(preflight(brand, 'caption_word', { ...ok, width: 1920, height: 1080, fps: '25/1' }, {}).join(), /vertical profile/);
    assert.match(preflight(brand, 'lower_third', { ...ok, path: 'renders/extensions/x.mp4' }, people).join(), /\.mov/);
    assert.match(preflight(brand, 'title_card', { ...ok, width: 1920, height: 1080, fps: '25/1', durationFrames: 75 }, { title: 'x' }).join(), /alpha must be false/);
  });
});

describe('add-block (vendoring into a project)', () => {
  it('copies the runtime, declares every input, writes the contract and lists the extension', async () => {
    const { root, added } = await fixtureProject('vertical', { style: 'brand-word', blocks: [['caption_word'], ['lower_third', { params: { people: [{ name: 'Gustavo Hill', role: '@gustahill' }] } }]] });
    try {
      assert.equal(added['caption-word'].frames, 240);
      const extension = JSON.parse(await fs.readFile(path.join(root, 'extensions', 'caption-word', 'extension.json'), 'utf8'));
      assert.deepEqual(extension.command, { program: 'node', args: ['extensions/brand-pack/lib/render.mjs', 'extensions/brand-pack/blocks/caption_word/scene.html'] });
      assert.deepEqual(extension.output, { path: 'renders/extensions/caption-word.mov', durationFrames: 240, width: 1080, height: 1920, fps: '30/1', audio: false, alpha: true });
      assert.deepEqual(extension.tools.map((t) => t.name), ['node', 'ffmpeg', 'npm:playwright-core']);
      const declared = extension.inputs.map((i) => i.path);
      for (const file of declared) await fs.access(path.join(root, ...file.split('/')));
      assert.ok(declared.includes('captions.json') && declared.includes('extensions/brand-pack/assets/Neuborn-Bold.ttf') && declared.includes('extensions/brand-pack/brand.json'));
      // every vendored runtime file the command can load is declared (no undeclared input)
      const lower = JSON.parse(await fs.readFile(path.join(root, 'extensions', 'lower-third', 'extension.json'), 'utf8'));
      assert.equal(lower.output.durationFrames, 135);
      assert.ok(lower.inputs.some((i) => i.path === 'extensions/brand-pack/lib/lower-third-scene.mjs'));
      assert.ok(!lower.inputs.some((i) => i.path === 'captions.json'));
      const project = JSON.parse(await fs.readFile(path.join(root, 'project.json'), 'utf8'));
      assert.deepEqual(project.extensions, ['extensions/caption-word/extension.json', 'extensions/lower-third/extension.json']);
      await assert.rejects(addBlock(['caption_word', '--project', root]), /exists/);
      await assert.rejects(addBlock(['subtitles_16x9', '--project', root]), /landscape profile/);
      await assert.rejects(addBlock(['lower_third', '--project', root, '--id', 'lt2', '--frames', '400', '--params', '{"people":[{"name":"A"}]}']), /outside the brand limits/);
    } finally {
      await fs.rm(root, { recursive: true, force: true });
    }
  });

  it('computes the timeline length like the format contract (T1)', () => {
    const timeline = { video: [{ clips: [{ in: '12.48', out: '22', start: 60 }] }], audio: [], gaps: [{ start: 0, end: 60 }] };
    assert.equal(timelineFrames(timeline, 30), 346);
    assert.equal(timelineFrames({ video: [{ clips: [{ in: '0', out: '1/3', start: 0 }] }] }, 25), 8);
  });
});

describe('motion and audio blocks (WP3): rules and vendoring', () => {
  const durations = { 'loud-jackhammer-1': 1.999, 'loud-helicopter-1': 3, 'animal-peacock-1': 0.8, 'animal-stag-2': 2.5 };

  it('derives the output kind, durations and sound cues from brand.json', () => {
    assert.deepEqual(blockOutput(brand, 'logo_sting', {}), { video: true, alpha: false, audio: true });
    assert.deepEqual(blockOutput(brand, 'chevron_wipe', {}), { video: true, alpha: true, audio: false });
    assert.deepEqual(blockOutput(brand, 'chevron_wipe', { a: {}, b: {} }), { video: true, alpha: false, audio: false });
    assert.deepEqual(blockOutput(brand, 'animal_scream', {}), { video: false, alpha: false, audio: true });
    assert.deepEqual(blockDurationLimits(brand, 'logo_sting', 25), { min: 50, max: 125, default: 63 });
    assert.deepEqual(blockDurationLimits(brand, 'chevron_wipe', 30), { min: 12, max: 18, default: 15 });
    assert.deepEqual(blockDurationLimits(brand, 'glitch_flash', 30), { min: 1, max: 3, default: 2 });
    assert.deepEqual(blockDurationLimits(brand, 'endcard', 25), { min: 250, max: 275, default: 250 });
    assert.equal(blockDurationLimits(brand, 'animal_scream', 30), null);
    // sting: noise hit at 0, the shouted voice tag (trimmed to its onset in WP1) on the sync point; null switches a sound off
    assert.deepEqual(audioCues(brand, 'logo_sting', {}, {}).map((c) => [c.id, c.at, c.gainDb]), [['noise-hit-c', 0, -4], ['voice-shout-guy', 0.1, 0]]);
    assert.deepEqual(audioCues(brand, 'logo_sting', { noiseHit: null }, {}).map((c) => c.id), ['voice-shout-guy']);
    assert.deepEqual(audioCues(brand, 'logo_end', {}, {}).map((c) => [c.id, c.at]), [['voice-spoken-guy', 0.2]]);
    // loud sounds: back to back, each cut to secondsEach with a fade only where it is cut
    const cues = audioCues(brand, 'loud_sounds', {}, durations);
    assert.deepEqual(cues.map((c) => [c.id, c.at, c.seconds, c.fadeOut]), [['loud-jackhammer-1', 0, 1.2, 0.04], ['loud-helicopter-1', 1.2, 1.2, 0.04], ['animal-peacock-1', 2.4, 0.8, 0]]);
    assert.equal(audioBlockFrames(brand, 'loud_sounds', {}, durations, 25), 80);
    assert.equal(audioBlockFrames(brand, 'animal_scream', { animal: 'stag', asset: 'animal-stag-2' }, durations, 30), 75);
  });

  it('checks the parameters of the brand layer (T6)', () => {
    assert.deepEqual(checkParameters(brand, 'logo_sting', { suffix: 'brazil', voiceTag: null }, 'landscape'), []);
    assert.match(checkParameters(brand, 'logo_sting', { suffix: 'Brazil!' }, 'landscape').join(), /lowercase word/);
    assert.match(checkParameters(brand, 'logo_sting', { colour: 'red' }, 'landscape').join(), /unknown parameters colour/);
    assert.match(checkParameters(brand, 'chevron_wipe', { a: { sourceId: 'int', in: '3' } }, 'vertical').join(), /go together/);
    assert.match(checkParameters(brand, 'chevron_wipe', { a: { sourceId: 'int', in: 3 }, b: { sourceId: 'int', extensionId: 'x', in: '1' } }, 'vertical').join(), /exact string[\s\S]*exactly one of/);
    assert.match(checkParameters(brand, 'chevron_wipe', { a: { sourceId: 'a', in: '1', crop: { x: '0.8', y: '0', w: '0.3', h: '1' } }, b: { sourceId: 'b', in: '1' } }, 'vertical').join(), /crop/);
    assert.match(checkParameters(brand, 'glitch_flash', { intensity: 2 }, 'vertical').join(), /0\.2–1/);
    assert.match(checkParameters(brand, 'animal_scream', { animal: 'cat' }, 'vertical').join(), /peacock, rooster, stag/);
    assert.match(checkParameters(brand, 'loud_sounds', { sounds: [], secondsEach: 9 }, 'landscape').join(), /1–5 asset ids[\s\S]*0\.5–3 s/);
    const output = (extra) => ({ path: 'renders/extensions/x.wav', durationFrames: 24, width: 1080, height: 1920, fps: '30/1', audio: true, alpha: false, video: false, ...extra });
    assert.deepEqual(preflight(brand, 'animal_scream', output({}), {}), []);
    assert.match(preflight(brand, 'animal_scream', output({ video: undefined, path: 'renders/extensions/x.mp4' }), {}).join(), /sound only: output.video must be false/);
    assert.match(preflight(brand, 'logo_sting', output({ video: undefined, path: 'renders/extensions/x.mov', alpha: true, durationFrames: 75 }), {}).join(), /alpha must be false[\s\S]*\.mp4/);
    assert.match(preflight(brand, 'loud_sounds', output({}), {}).join(), /landscape profile/);
    assert.match(preflight(brand, 'endcard', { ...output({ video: undefined, audio: false, path: 'renders/extensions/e.mp4' }), width: 1920, height: 1080, fps: '25/1', durationFrames: 300 }, {}).join(), /outside the brand limits/);
  });

  it('vendors assets by id with their kind checked, sets the contract and writes audio_master into project.json', async () => {
    const { root, added } = await fixtureProject('landscape', {
      blocks: [['logo_sting', { id: 'sting', params: { suffix: 'colombia' } }], ['endcard'], ['loud_sounds', { id: 'loud' }], ['animal_scream', { id: 'scream', params: { animal: 'rooster' } }]],
    });
    try {
      const read = async (id) => JSON.parse(await fs.readFile(path.join(root, 'extensions', id, 'extension.json'), 'utf8'));
      const sting = await read('sting');
      assert.deepEqual(sting.output, { path: 'renders/extensions/sting.mp4', durationFrames: 63, width: 1920, height: 1080, fps: '25/1', audio: true, alpha: false });
      const files = sting.inputs.map((i) => i.path);
      assert.ok(['extensions/brand-pack/assets/wordmark-colombia.svg', 'extensions/brand-pack/assets/audio/voice-shout-guy.wav', 'extensions/brand-pack/assets/audio/noise-hit-c.wav', 'extensions/brand-pack/lib/motion.mjs'].every((f) => files.includes(f)));
      assert.deepEqual(added.sting.timelineClips.audio, { id: 'xa-sting', extensionId: 'sting', in: '0', out: '63/25', start: '<timeline frame>', gainDb: 0, linkedTo: 'x-sting', track: 'role "effects"' });
      const endcard = await read('endcard');
      assert.ok(endcard.inputs.some((i) => i.path === 'extensions/brand-pack/assets/images/endcard-angled-gpt-image-2-1.jpg'));
      const loud = await read('loud');
      assert.deepEqual(loud.output, { path: 'renders/extensions/loud.wav', durationFrames: 80, width: 1920, height: 1080, fps: '25/1', audio: true, alpha: false, video: false });
      assert.deepEqual(loud.command.args, ['extensions/brand-pack/lib/render.mjs', 'extensions/brand-pack/blocks/loud_sounds/block.json']);
      assert.deepEqual(loud.tools.map((t) => t.name), ['node', 'ffmpeg']);
      assert.ok((await read('scream')).inputs.some((i) => i.path === 'extensions/brand-pack/assets/audio/animal-rooster-1.wav'));
      for (const id of ['sting', 'endcard', 'loud', 'scream']) for (const input of (await read(id)).inputs) await fs.access(path.join(root, ...input.path.split('/')));
      await assert.rejects(addBlock(['animal_scream', '--project', root, '--id', 's2', '--params', '{"animal":"stag","asset":"animal-peacock-1"}']), /is no stag/);
      await assert.rejects(addBlock(['logo_end', '--project', root, '--params', '{"voiceTag":"noise-hit-a"}']), /is a noise-hit, voiceTag needs voice-tag/);
      await assert.rejects(addBlock(['logo_sting', '--project', root, '--id', 's3', '--params', '{"suffix":"japan"}']), /build-logo\.mjs --suffix japan/);
      const wipe = await addBlock(['chevron_wipe', '--project', root, '--id', 'wipe', '--params', JSON.stringify({ a: { extensionId: 'sting', in: '2' }, b: { sourceId: 'int', in: '12.48' } })]);
      assert.match(wipe.next.join('\n'), /in = b\.in \+ 13\/25 s/);
      assert.deepEqual((await read('wipe')).inputs.slice(-2), [{ kind: 'extension', extensionId: 'sting' }, { kind: 'source', sourceId: 'int' }]);
      await addBlock(['audio_master', '--project', root]);
      const project = JSON.parse(await fs.readFile(path.join(root, 'project.json'), 'utf8'));
      assert.deepEqual(project.audioMaster, { integratedLufs: -14, toleranceLu: 1, truePeakDbtp: -1, ducking: { underDialogDb: 12, rampSeconds: 0.25 } });
      await addBlock(['audio_master', '--project', root, '--params', '{"ducking":null}']);
      assert.equal(JSON.parse(await fs.readFile(path.join(root, 'project.json'), 'utf8')).audioMaster.ducking, null);
    } finally {
      await fs.rm(root, { recursive: true, force: true });
    }
  });
});

describe('thumbnail (WP4): headline, grade, rules and vendoring', () => {
  const settings = brand.blocks.thumbnail;
  const lines = (text) => headlineLines(text, settings).lines;

  it('sets the headline in capitals over balanced lines like the reference thumbnails', () => {
    // the nine reference headlines (doc/mvp/brand/frames/yt-long/11) – one word per line up to three words, then balanced
    assert.deepEqual(lines('Jensen x Tremonti'), ['JENSEN', 'X', 'TREMONTI']);
    assert.deepEqual(lines('who is next?'), ['WHO', 'IS', 'NEXT?']);
    assert.deepEqual(lines('City of Thrash Metal'), ['CITY OF', 'THRASH', 'METAL']);
    assert.deepEqual(lines('Land of the rising noise'), ['LAND OF', 'THE RISING', 'NOISE']);
    assert.deepEqual(lines('Iron Maiden treasures in Brazil'), ['IRON MAIDEN', 'TREASURES', 'IN BRAZIL']);
    assert.deepEqual(lines('guns or'), ['GUNS', 'OR']);
    // explicit breaks win (the reference sets "GIVE 'EM / HELL / UP THERE!")
    assert.deepEqual(lines("Give 'em\nhell\nup there!"), ["GIVE 'EM", 'HELL', 'UP THERE!']);
    assert.deepEqual(lines('Grüße aus Köln'), ['GRÜSSE', 'AUS', 'KÖLN']);
  });

  it('refuses headlines outside the brand limits instead of shrinking or cutting them', () => {
    assert.match(headlineLines('Loud', settings).issues.join(), /1 words; a thumbnail headline has 2–5/);
    assert.match(headlineLines('one two three four five six', settings).issues.join(), /6 words/);
    assert.match(headlineLines('a\nb\nc\nd\ne', settings).issues.join(), /5 lines \(at most 4\)/);
    assert.match(headlineLines('Supercalifragilistic word', settings).issues.join(), /longer than 14 characters/);
  });

  it('grades to grey with Rec. 709 luma and contrast around mid grey', () => {
    assert.equal(gradeValue(255, 0, 0, 1, 0), 54);
    assert.equal(gradeValue(0, 255, 0, 1, 0), 182);
    assert.equal(gradeValue(128, 128, 128, 1.2, 0), 128);
    assert.equal(gradeValue(201, 201, 201, 1.2, 0), 216);
    assert.equal(gradeValue(10, 10, 10, 1.6, -0.03), 0);
  });

  it('checks frame, candidates, headline and contrast and is a still image next to the video', () => {
    const frame = { sourceId: 'int', in: '12.48' };
    assert.deepEqual(blockOutput(brand, 'thumbnail', {}), { video: true, alpha: false, audio: false, image: true });
    assert.deepEqual(blockDurationLimits(brand, 'thumbnail', 25), { min: 1, max: 1, default: 1 });
    assert.deepEqual(checkParameters(brand, 'thumbnail', { headline: 'Who is next?', frame }, 'landscape'), []);
    assert.deepEqual(checkParameters(brand, 'thumbnail', { headline: 'Who is next?', candidates: [frame, { ...frame, in: '30' }] }, 'landscape'), []);
    assert.match(checkParameters(brand, 'thumbnail', { headline: 'Who is next?' }, 'landscape').join(), /either parameters\.frame/);
    assert.match(checkParameters(brand, 'thumbnail', { headline: 'Who is next?', frame, candidates: [frame, frame] }, 'landscape').join(), /not both/);
    assert.match(checkParameters(brand, 'thumbnail', { headline: 'Who is next?', candidates: [frame] }, 'landscape').join(), /2–4 frames/);
    assert.match(checkParameters(brand, 'thumbnail', { frame: { sourceId: 'int', in: 12 }, contrast: 3, colour: 'red' }, 'landscape').join(), /unknown parameters colour[\s\S]*headline is required[\s\S]*exact string[\s\S]*contrast must lie in 1–1\.6/);
    const output = (extra) => ({ path: 'renders/extensions/thumbnail.png', durationFrames: 1, width: 1280, height: 720, fps: '25/1', audio: false, alpha: false, image: true, ...extra });
    assert.deepEqual(preflight(brand, 'thumbnail', output({}), { headline: 'Who is next?', frame }), []);
    assert.match(preflight(brand, 'thumbnail', output({ width: 1920, height: 1080, durationFrames: 25, image: undefined, path: 'renders/extensions/t.mp4' }), { headline: 'Who is next?', frame }).join(), /1280 × 720 image[\s\S]*output\.image must be true[\s\S]*durationFrames must be 1[\s\S]*\.png/);
    assert.match(preflight(brand, 'endcard', { ...output({}), width: 1920, height: 1080, durationFrames: 250, path: 'renders/extensions/e.mp4' }, {}).join(), /output\.image must not be set/);
  });

  it('vendors the thumbnail with its frame sources as inputs and no timeline clip', async () => {
    const candidates = [{ sourceId: 'int-a', in: '12.48' }, { sourceId: 'int-b', in: '3', crop: { x: '0', y: '0', w: '1', h: '1' } }];
    const { root, added } = await fixtureProject('landscape', { blocks: [['thumbnail', { params: { headline: 'Who is next?', candidates } }]] });
    try {
      const read = async () => JSON.parse(await fs.readFile(path.join(root, 'extensions', 'thumbnail', 'extension.json'), 'utf8'));
      const extension = await read();
      assert.deepEqual(extension.output, { path: 'renders/extensions/thumbnail.png', durationFrames: 1, width: 1280, height: 720, fps: '25/1', audio: false, alpha: false, image: true });
      assert.deepEqual(extension.inputs.filter((i) => i.kind === 'source'), [{ kind: 'source', sourceId: 'int-a' }, { kind: 'source', sourceId: 'int-b' }]);
      const files = extension.inputs.filter((i) => i.kind === 'file').map((i) => i.path);
      assert.ok(['extensions/brand-pack/lib/thumbnail-scene.mjs', 'extensions/brand-pack/lib/motion.mjs', 'extensions/brand-pack/blocks/thumbnail/scene.html', 'extensions/brand-pack/assets/Neuborn-Medium.ttf'].every((f) => files.includes(f)));
      assert.deepEqual(added.thumbnail.timelineClips, {});
      assert.match(added.thumbnail.next.join('\n'), /never place it on the timeline[\s\S]*contact sheet A–B[\s\S]*--force/);
      // the editor chose B: frame replaces the candidates, the other source is no input any more
      const chosen = await addBlock(['thumbnail', '--project', root, '--force', '--params', JSON.stringify({ headline: 'Who is next?', frame: candidates[1] })]);
      assert.deepEqual((await read()).inputs.filter((i) => i.kind === 'source'), [{ kind: 'source', sourceId: 'int-b' }]);
      assert.match(chosen.next.join('\n'), /review show thumbnail[\s\S]*--original/);
      await assert.rejects(addBlock(['thumbnail', '--project', root, '--id', 't2', '--frames', '25', '--params', JSON.stringify({ headline: 'Who is next?', frame: candidates[0] })]), /one still image/);
      const vertical = await fixtureProject('vertical', {});
      try {
        await assert.rejects(addBlock(['thumbnail', '--project', vertical.root, '--params', JSON.stringify({ headline: 'Who is next?', frame: candidates[0] })]), /landscape profile/);
      } finally {
        await fs.rm(vertical.root, { recursive: true, force: true });
      }
    } finally {
      await fs.rm(root, { recursive: true, force: true });
    }
  });
});

describe('Never Ending Interview blocks (WP5)', () => {
  const frame = { sourceId: 'int', in: '12.48' };

  it('checks the card texts against the brand limits and refuses what does not fit', () => {
    assert.deepEqual(checkParameters(brand, 'format_card', { title: 'Never ending interview', text: ['We ask musicians at festivals one question.', 'And it keeps going.'] }, 'landscape'), []);
    assert.deepEqual(formatCardText({ text: 'Our starting question comes from none other than…' }, brand.blocks.format_card), { title: null, lines: ['Our starting question comes from none other than…'], issues: [] });
    assert.match(checkParameters(brand, 'format_card', {}, 'landscape').join(), /needs a title, text or both/);
    assert.match(checkParameters(brand, 'format_card', { text: ['One.', 'Two.', 'Three.', 'Four.'] }, 'landscape').join(), /at most 3/);
    assert.match(checkParameters(brand, 'format_card', { title: 'x'.repeat(33) }, 'landscape').join(), /longer than 32/);
    assert.deepEqual(bandCardLines({ lines: ['MYLES KENNEDY', 'alter bridge'] }, brand.blocks.band_card), { lines: ['MYLES KENNEDY', 'alter bridge'], issues: [] });
    assert.deepEqual(checkParameters(brand, 'band_card', { lines: ['EVIL JARED', 'x KROGI'], image: frame }, 'vertical'), []);
    assert.match(checkParameters(brand, 'band_card', { lines: ['A', 'B', 'C'] }, 'landscape').join(), /1–2 lines/);
    assert.match(checkParameters(brand, 'band_card', { lines: ['THE INTERNATIONAL NOISE CONSPIRACY'] }, 'landscape').join(), /longer than 24/);
    assert.match(checkParameters(brand, 'band_card', { lines: ['A'], image: { sourceId: 'int', in: 3 } }, 'landscape').join(), /image\.in must be seconds/);
    const cta = cliffhangerText({ next: 'Ugly Kid Joe' }, brand.blocks.cliffhanger_card);
    assert.deepEqual(cta.lines, ['to find out if the question', 'goes to UGLY KID JOE', 'and if they will answer…']);
    assert.deepEqual(cliffhangerText({}, brand.blocks.cliffhanger_card).lines, ['to find out who answers', 'the next question…']);
    assert.match(checkParameters(brand, 'cliffhanger_card', { question: 'x '.repeat(60) }, 'landscape').join(), /longer than 100/);
  });

  it('gives opaque H.264 cards with brand durations and vertical footage as long as its clip', () => {
    for (const block of ['format_card', 'band_card', 'cliffhanger_card', 'vertical_in_16x9']) assert.deepEqual(blockOutput(brand, block, {}), { video: true, alpha: false, audio: false });
    assert.deepEqual(blockDurationLimits(brand, 'format_card', 25), { min: 75, max: 150, default: 125 });
    assert.deepEqual(blockDurationLimits(brand, 'band_card', 30), { min: 30, max: 75, default: 45 });
    assert.deepEqual(blockDurationLimits(brand, 'vertical_in_16x9', 25), { min: 13, max: 4500, default: null });
    assert.equal(rangeFrames('12.48', '22', '30/1'), 286);
    assert.match(checkParameters(brand, 'vertical_in_16x9', {}, 'landscape').join(), /clip is required/);
    assert.match(checkParameters(brand, 'vertical_in_16x9', { clip: { sourceId: 'q', in: '3' } }, 'landscape').join(), /clip\.out must be seconds/);
    const output = { path: 'renders/extensions/v.mp4', durationFrames: 100, width: 1920, height: 1080, fps: '25/1', audio: false, alpha: false };
    assert.deepEqual(preflight(brand, 'vertical_in_16x9', output, { clip: { sourceId: 'q', in: '2', out: '6' } }), []);
    assert.match(preflight(brand, 'vertical_in_16x9', output, { clip: { sourceId: 'q', in: '2', out: '6.04' } }).join(), /differs from the clip \(2–6\.04 s = 101 frames\)/);
    assert.match(preflight(brand, 'format_card', { ...output, width: 1080, height: 1920, fps: '30/1' }, { title: 'NEI' }).join(), /landscape profile/);
  });

  it('vendors the cards with their stills and the vertical clip as source inputs', async () => {
    const { root, added } = await fixtureProject('landscape', {
      blocks: [
        ['band_card', { params: { lines: ['MYLES KENNEDY', 'alter bridge'], image: frame } }],
        ['vertical_in_16x9', { params: { clip: { sourceId: 'q-sel', in: '2', out: '6.04' } } }],
        ['format_card', { params: { title: 'Never ending interview' } }],
      ],
    });
    try {
      const read = async (id) => JSON.parse(await fs.readFile(path.join(root, 'extensions', id, 'extension.json'), 'utf8'));
      const band = await read('band-card');
      assert.deepEqual(band.inputs.filter((i) => i.kind === 'source'), [{ kind: 'source', sourceId: 'int' }]);
      const files = band.inputs.filter((i) => i.kind === 'file').map((i) => i.path);
      assert.ok(['extensions/brand-pack/lib/band-card-scene.mjs', 'extensions/brand-pack/lib/cards.mjs', 'extensions/brand-pack/blocks/band_card/scene.html', 'extensions/brand-pack/assets/Neuborn-Medium.ttf'].every((f) => files.includes(f)), files.join());
      assert.equal(band.output.durationFrames, 38);
      assert.match(added['band-card'].next.join('\n'), /chevron wipes/);
      const vertical = await read('vertical-in-16x9');
      assert.deepEqual([vertical.output.durationFrames, vertical.output.path], [101, 'renders/extensions/vertical-in-16x9.mp4']);
      assert.deepEqual(vertical.inputs.filter((i) => i.kind === 'source'), [{ kind: 'source', sourceId: 'q-sel' }]);
      assert.match(added['vertical-in-16x9'].next.join('\n'), /graphics" track exactly over the statement/);
      assert.equal((await read('format-card')).output.durationFrames, 125);
      await assert.rejects(addBlock(['format_card', '--project', root, '--id', 'f2', '--frames', '200', '--params', '{"title":"NEI"}']), /outside the brand limits/);
    } finally {
      await fs.rm(root, { recursive: true, force: true });
    }
  });
});
