// Example extension (format contract v1): renders the title card described in extension.json with ffmpeg.
// Usage (from the project folder): node extensions/title-card/render.mjs extensions/title-card/extension.json <output>
// darkmind-agent extensions run (or render) runs it only after the user's local approval
// (darkmind-agent extensions approve) and checks the output with ffprobe against the contract.

import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const [descriptionFile, outputFile] = process.argv.slice(2);
if (!descriptionFile || !outputFile) {
  console.error('usage: node render.mjs <extension.json> <output.mp4>');
  process.exit(2);
}
const { parameters, output } = JSON.parse(readFileSync(descriptionFile, 'utf8'));
const [num, den = '1'] = output.fps.split('/');
const fps = Number(num) / Number(den);
const escape = (text) => text.replace(/\\/g, '\\\\').replace(/:/g, '\\:').replace(/'/g, "\\'").replace(/%/g, '\\%');
const fontFile = process.env.DARKMIND_FONT || (process.platform === 'win32' ? 'C:/Windows/Fonts/arial.ttf' : '');
const font = fontFile ? `fontfile='${escape(fontFile)}':` : '';
const filter = `drawtext=${font}text='${escape(parameters.text)}':fontsize=${parameters.fontSize}:fontcolor=white:x=(w-tw)/2:y=(h-th)/2`;

mkdirSync(path.dirname(outputFile), { recursive: true });
const result = spawnSync(
  process.env.DARKMIND_FFMPEG || 'ffmpeg',
  [
    '-hide_banner', '-loglevel', 'error', '-y',
    '-f', 'lavfi', '-i', `color=c=black:s=${output.width}x${output.height}:r=${fps}`,
    '-vf', filter,
    '-frames:v', String(output.durationFrames),
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-r', String(fps),
    '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709',
    outputFile,
  ],
  { stdio: 'inherit' }
);
process.exit(result.status ?? 1);
