// Dark Mind brand pack – lean HTML compositor (Phase 6 WP2, decision T10; rules R1–R5 from WP0).
// Playwright drives headless Microsoft Edge (channel "msedge", or DARKMIND_TOOL_MSEDGE = path to msedge); every frame
// is captured over CDP (transparent background for alpha) and piped as PNG into ONE ffmpeg encoder per output file,
// fed in frame order (R1). Workers capture strided (worker i renders i, i+W, …), so the file does not depend on the
// worker count. Files come from a virtual origin: only declared files are reachable, anything else (other files,
// network) fails the render (R3). Dedupe reuses a capture only when the scene's complete state key is unchanged (R4).

import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createReadStream, promises as fs } from 'node:fs';
import path from 'node:path';

export const ORIGIN = 'http://scene.invalid';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

/** Chromium flags for reproducible pixels (software raster, no LCD text, fixed colour profile) – R2. */
export const BROWSER_ARGS = [
  '--disable-gpu',
  '--force-color-profile=srgb',
  '--font-render-hinting=none',
  '--disable-lcd-text',
  '--hide-scrollbars',
  '--disable-renderer-backgrounding',
  '--disable-background-timer-throttling',
];

export async function launchBrowser(env = process.env) {
  let chromium;
  try {
    ({ chromium } = await import('playwright-core'));
  } catch {
    throw new Error('playwright-core is not installed: run "npm ci" in the folder with the brand pack package.json (extensions/), nothing is installed automatically');
  }
  const executablePath = env.DARKMIND_TOOL_MSEDGE || undefined;
  try {
    return await chromium.launch({ channel: executablePath ? undefined : 'msedge', executablePath, headless: true, args: BROWSER_ARGS });
  } catch (error) {
    throw new Error(`Microsoft Edge could not be started (${String(error.message ?? error).split('\n')[0]}); install Edge or set DARKMIND_TOOL_MSEDGE to msedge(.exe)`);
  }
}

/** ffmpeg output arguments. bitexact keeps encoder strings/metadata stable between runs (R2). */
export function codecArgs(codec) {
  const common = ['-fflags', '+bitexact', '-flags:v', '+bitexact', '-map_metadata', '-1'];
  switch (codec) {
    case 'qtrle':
      // QuickTime Animation: lossless ARGB with straight alpha – the standard for alpha blocks (WP0, R5)
      return [...common, '-c:v', 'qtrle', '-pix_fmt', 'argb'];
    case 'h264':
      return [
        ...common,
        '-vf', 'scale=out_color_matrix=bt709:out_range=tv:flags=accurate_rnd+full_chroma_int,format=yuv420p,setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709:range=tv',
        '-c:v', 'libx264', '-preset', 'medium', '-crf', '12', '-threads', '4', '-x264-params', 'deterministic=1',
        '-movflags', '+faststart',
      ];
    case 'png-gray':
      // one still image (thumbnail): 8-bit grey PNG – the content is black and white, a third of the RGB size
      return [...common, '-c:v', 'png', '-pix_fmt', 'gray', '-f', 'image2', '-update', '1'];
    default:
      throw new Error(`unknown codec ${codec}`);
  }
}

function startEncoder(ffmpeg, job) {
  // optional sound (logo_sting, logo_end): a prepared PCM file muxed as AAC in the same encoder run (R1)
  const audio = job.audio ? ['-i', job.audio] : [];
  const maps = job.audio ? ['-map', '0:v:0', '-map', '1:a:0', '-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-ac', '2', '-flags:a', '+bitexact'] : [];
  const args = ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'image2pipe', '-c:v', 'png', '-framerate', job.fps, '-i', '-', ...audio, ...maps, ...codecArgs(job.codec), '-r', job.fps, '-frames:v', String(job.frames), job.output];
  const child = spawn(ffmpeg, args, { stdio: ['pipe', 'ignore', 'pipe'], windowsHide: true });
  let err = '';
  child.stderr.setEncoding('utf8').on('data', (chunk) => (err += chunk));
  child.stdin.on('error', () => {});
  const done = new Promise((resolve, reject) => {
    child.on('error', (error) => reject(new Error(`ffmpeg could not be started (${error.message}); install ffmpeg or set DARKMIND_FFMPEG`)));
    child.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited with ${code}: ${err.trim()}`))));
  });
  return { child, done };
}

/** Writes one frame; rejects if ffmpeg closed its input (exited early) instead of waiting for 'drain' forever. */
async function write(stream, buffer) {
  if (stream.destroyed || stream.writableEnded) throw new Error('ffmpeg closed its input');
  if (stream.write(buffer)) return;
  await new Promise((resolve, reject) => {
    const done = (error) => {
      stream.off('drain', onDrain);
      stream.off('close', onClose);
      stream.off('error', onClose);
      if (error) reject(error);
      else resolve();
    };
    const onDrain = () => done();
    const onClose = () => done(new Error('ffmpeg closed its input'));
    stream.on('drain', onDrain);
    stream.on('close', onClose);
    stream.on('error', onClose);
  });
}

/**
 * Opens one page with the scene on the virtual origin. job.files maps project-relative paths (URL paths) to absolute
 * files; job.scene is the project-relative path of the scene HTML.
 */
export async function openScene(browser, job) {
  const context = await browser.newContext({ viewport: { width: job.width, height: job.height }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const served = new Map(Object.entries(job.files).map(([rel, file]) => [rel.replace(/\\/g, '/').toLowerCase(), file]));
  const refused = [];
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await context.route(`${ORIGIN}/**`, async (route) => {
    const rel = decodeURIComponent(new URL(route.request().url()).pathname.slice(1)).toLowerCase();
    const file = served.get(rel);
    if (!file) {
      refused.push(rel);
      return route.fulfill({ status: 404, body: 'undeclared' });
    }
    return route.fulfill({ status: 200, contentType: MIME[path.extname(file).toLowerCase()] ?? 'application/octet-stream', body: await fs.readFile(file) });
  });
  await context.route((url) => !url.href.startsWith(ORIGIN), (route) => {
    refused.push(route.request().url());
    return route.abort('blockedbyclient');
  });
  const cdp = await context.newCDPSession(page);
  if (job.alpha) await cdp.send('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } });
  await page.goto(`${ORIGIN}/${job.scene.split('/').map(encodeURIComponent).join('/')}`);
  await page.waitForFunction(() => window.scene !== undefined || document.readyState === 'complete');
  let info;
  try {
    info = await page.evaluate(async (ctx) => {
      if (!window.scene) throw new Error('the scene did not define window.scene');
      await window.scene.init(ctx);
      return window.scene.info ? window.scene.info() : null;
    }, { width: job.width, height: job.height, fps: job.fpsNumber, frames: job.frames, params: job.params ?? {}, alpha: Boolean(job.alpha) });
  } catch (error) {
    await context.close();
    const message = String(error.message ?? error).replace(/^page\.evaluate: (Error: )?/, '').split('\n    at ')[0];
    throw new Error(`${message}${refused.length ? `\nundeclared files requested: ${refused.join(', ')}` : ''}${errors.length ? `\npage errors: ${errors.join('; ')}` : ''}`);
  }
  if (refused.length) {
    await context.close();
    throw new Error(`the scene requested undeclared files or network resources: ${refused.join(', ')} (declare them as inputs)`);
  }
  return { context, page, cdp, info, refused, errors };
}

async function capture(cdp) {
  const { data } = await cdp.send('Page.captureScreenshot', { format: 'png', optimizeForSpeed: true, fromSurface: true, captureBeyondViewport: false });
  return Buffer.from(data, 'base64');
}

export async function sha256File(file) {
  const hash = createHash('sha256');
  let bytes = 0;
  for await (const chunk of createReadStream(file)) {
    hash.update(chunk);
    bytes += chunk.length;
  }
  return { sha256: hash.digest('hex'), bytes };
}

/**
 * Renders a scene into one output file. job: { scene, files, width, height, fps ("30/1"), frames, params, alpha,
 * codec ("qtrle" | "h264" | "png-gray" – one still image), output, workers (default 1), dedupe (default true), ffmpeg, audio (PCM file to mux, optional) }.
 */
export async function renderScene(browser, job) {
  const started = Date.now();
  const [num, den = '1'] = String(job.fps).split('/');
  const fpsNumber = Number(num) / Number(den);
  const W = Math.max(1, Math.min(job.workers ?? 1, job.frames));
  await fs.mkdir(path.dirname(job.output), { recursive: true });
  const sessions = [];
  try {
    for (let i = 0; i < W; i++) sessions.push(await openScene(browser, { ...job, fpsNumber }));
  } catch (error) {
    await Promise.all(sessions.map((s) => s.context.close()));
    throw error;
  }
  const encoder = startEncoder(job.ffmpeg ?? 'ffmpeg', { ...job, fps: `${num}/${den}` });
  const ready = new Map();
  let next = 0;
  let failed = null;
  let waiters = [];
  const notify = () => waiters.splice(0).forEach((resolve) => resolve());
  const changed = () => new Promise((resolve) => waiters.push(resolve));
  const fail = (error) => {
    failed ??= error;
    notify();
  };
  // ffmpeg exiting early (bad arguments, unwritable output, full disk) stops writer and workers at once
  encoder.done.catch(fail);
  const ahead = W * 4;
  let captures = 0;
  const worker = async (i) => {
    const { page, cdp } = sessions[i];
    let prevKey;
    let prevPng;
    for (let frame = i; frame < job.frames && !failed; frame += W) {
      while (frame - next >= ahead && !failed) await changed();
      const key = await page.evaluate((f) => window.scene.renderAt(f), frame);
      let png;
      if (job.dedupe !== false && key != null && key === prevKey && prevPng) png = prevPng;
      else {
        png = await capture(cdp);
        captures++;
      }
      prevKey = key;
      prevPng = png;
      ready.set(frame, png);
      notify();
    }
  };
  const writer = async () => {
    while (next < job.frames && !failed) {
      if (!ready.has(next)) {
        await changed();
        continue;
      }
      const png = ready.get(next);
      ready.delete(next);
      await write(encoder.child.stdin, png);
      next++;
      notify();
    }
  };
  try {
    await Promise.all([writer().catch(fail), ...sessions.map((_, i) => worker(i).catch(fail))]);
  } finally {
    encoder.child.stdin.end();
    await Promise.all(sessions.map((s) => s.context.close()));
  }
  if (failed) {
    // an encoder that stopped early explains itself (ffmpeg's message); otherwise the scene error is the cause
    throw (await encoder.done.then(() => null, (error) => error)) ?? failed;
  }
  await encoder.done;
  return { frames: job.frames, workers: W, captures, ms: Date.now() - started, info: sessions[0].info, output: job.output, ...(await sha256File(job.output)) };
}
