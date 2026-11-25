// Dark Mind brand pack – lower_third (Phase 6 WP2): NAME in capitals over a small role line, no box, hard shadow,
// glitch-in (0.3 s) and glitch-out (0.2 s), hold 3–6 s. 9:16: one person on the left above the caption line;
// 16:9: one person on the left or two (guest left-aligned on the left, host right-aligned on the right, as in the
// host interviews). Parameters: people [{ name, role }]. Texts are data, never evaluated.

import { color, profileOf, secondsToFrames } from './layout.mjs';
import { boot, drawBlockGlitch, drawRgbSplit, fontForCap, fontString, prng, shadowText } from './scene.mjs';

boot({
  block: 'lower_third',
  async init(scene) {
    const { brand, settings, params, width: W, height: H, fps } = scene;
    const profile = profileOf(brand, W, H);
    const geometry = settings.profiles[profile];
    const colours = { red: brand.colors.glitchRed, cyan: brand.colors.glitchCyan };
    const people = params.people.map((p) => ({ name: p.name.trim().toUpperCase(), role: (p.role ?? '').trim() }));
    scene.people = people;
    scene.colours = colours;
    scene.inFrames = secondsToFrames(settings.glitchInSeconds, fps);
    scene.outFrames = secondsToFrames(settings.glitchOutSeconds, fps);
    scene.split = Math.max(1, Math.round(settings.rgbSplit * H));
    // one canvas per person: name (capitals) and role, left- or right-aligned, with the hard shadow
    const measure = scene.ctx;
    scene.cards = people.map((person, index) => {
      const right = people.length === 2 && index === 1;
      let nameSize = fontForCap(brand, settings.nameFace, geometry.nameCap * H);
      let roleSize = fontForCap(brand, settings.roleFace, geometry.roleCap * H);
      const width = () => {
        measure.font = fontString(brand, settings.nameFace, nameSize);
        const n = measure.measureText(person.name).width;
        measure.font = fontString(brand, settings.roleFace, roleSize);
        return Math.max(n, person.role ? measure.measureText(person.role).width : 0);
      };
      const fit = Math.min(1, (geometry.maxWidth * W) / width());
      nameSize *= fit;
      roleSize *= fit;
      measure.font = fontString(brand, settings.nameFace, nameSize);
      const nameMetrics = measure.measureText(person.name);
      const capHeight = measure.measureText('H').actualBoundingBoxAscent;
      const shadow = Math.max(1, Math.round(settings.shadowOffset * H));
      const pad = scene.split * 4 + shadow + Math.ceil(nameSize * 0.2);
      const textWidth = Math.ceil(width()) + 1;
      const roleTop = capHeight + nameSize * settings.roleGap;
      measure.font = fontString(brand, settings.roleFace, roleSize);
      const roleAscent = person.role ? measure.measureText('h').actualBoundingBoxAscent : 0;
      const roleDescent = person.role ? measure.measureText('gjpqy').actualBoundingBoxDescent : 0;
      const height = Math.ceil(roleTop + roleAscent + roleDescent + Math.max(nameMetrics.actualBoundingBoxDescent, 0));
      const card = document.createElement('canvas');
      card.width = textWidth + 2 * pad;
      card.height = height + 2 * pad;
      const c = card.getContext('2d');
      c.textBaseline = 'alphabetic';
      c.textAlign = right ? 'right' : 'left';
      const x = right ? pad + textWidth : pad;
      c.font = fontString(brand, settings.nameFace, nameSize);
      shadowText(c, person.name, x, pad + capHeight, { fill: color(brand, settings.nameColor), shadow: brand.colors.shadow, shadowAlpha: settings.shadowAlpha, offset: shadow });
      if (person.role) {
        c.font = fontString(brand, settings.roleFace, roleSize);
        shadowText(c, person.role, x, pad + roleTop + roleAscent, { fill: color(brand, settings.roleColor), shadow: brand.colors.shadow, shadowAlpha: settings.shadowAlpha, offset: shadow });
      }
      const left = right ? geometry.right * W - textWidth - pad : geometry.left * W - pad;
      return { canvas: card, x: Math.round(left), y: Math.round(geometry.nameTop * H - pad) };
    });
    scene.info = { people: people.length, profile };
  },
  text: (scene) => scene.people.map((p) => `${p.name}${p.role}`).join(''),
  renderAt(scene, frame) {
    const { ctx, cards, colours, inFrames, outFrames, split, frames } = scene;
    const fromEnd = frames - 1 - frame;
    // glitch-in: blocks shift and flicker, settling towards the hold; glitch-out mirrors it faster
    const phase = frame < inFrames ? { k: frame, n: inFrames, dir: 'in' } : fromEnd < outFrames ? { k: fromEnd, n: outFrames, dir: 'out' } : null;
    if (!phase) {
      // clean in the hold (as in the references); the RGB split belongs to the glitch
      for (const card of cards) ctx.drawImage(card.canvas, card.x, card.y);
      return 'hold';
    }
    const progress = (phase.k + 1) / (phase.n + 1);
    const rnd = prng(frame * 7919 + 17);
    if (rnd() > 0.35 + 0.65 * progress) return `${phase.dir}:${frame}:off`;
    for (const [i, card] of cards.entries()) {
      drawBlockGlitch(ctx, card.canvas, card.x, card.y, { seed: frame * 131 + i * 7 + 1, intensity: 0.15 * (1 - progress), colours });
      drawRgbSplit(ctx, card.canvas, card.x, card.y, Math.round(split * (1 + 2 * (1 - progress))), colours);
    }
    return `${phase.dir}:${frame}`;
  },
});
