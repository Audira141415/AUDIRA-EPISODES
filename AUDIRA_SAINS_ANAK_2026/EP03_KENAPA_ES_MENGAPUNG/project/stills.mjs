// Render key stills of EsEP03-Draft with one bundle. Usage: node stills.mjs <outDir> <t1,t2,...> [cover.png]
import {createRequire} from 'node:module';
import path from 'node:path';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import { withRenderPort } from "./lib/render-port.mjs";
const require = createRequire('F:/AUDIRA-2D-SKILL-MOTION/package.json');
const {bundle} = require('@remotion/bundler');
const {renderStill, selectComposition} = require('@remotion/renderer');

const [outDir, times, coverOut] = process.argv.slice(2);
const root = path.dirname(fileURLToPath(import.meta.url));
fs.mkdirSync(outDir, {recursive: true});
const serveUrl = await bundle({entryPoint: path.join(root, 'src/episodes/es/index.tsx'), publicDir: path.join(root, 'public')});
const comp = await withRenderPort((port) => selectComposition({ port, serveUrl, id: 'EsEP03-Draft'}));
for (const t of times.split(',').filter(Boolean).map(Number)) {
  const frame = Math.min(comp.durationInFrames - 1, Math.round(t * comp.fps));
  const out = path.join(outDir, `s${String(t).replace('.', '_').padStart(4, '0')}.png`);
  await withRenderPort((port) => renderStill({ port, serveUrl, composition: comp, frame, output: out, logLevel: 'error'}));
  console.log(out);
}
if (coverOut) {
  const cover = await withRenderPort((port) => selectComposition({ port, serveUrl, id: 'EsEP03-Cover'}));
  await withRenderPort((port) => renderStill({ port, serveUrl, composition: cover, frame: 0, output: coverOut, logLevel: 'error'}));
  console.log(coverOut);
}
