// Render key stills of HidanganEP07-Draft with one bundle. Usage: node stills.mjs <outDir> <t1,t2,...>
import {createRequire} from 'node:module';
import path from 'node:path';
import fs from 'node:fs';
import { withRenderPort } from "./lib/render-port.mjs";
const require = createRequire('F:/AUDIRA-2D-SKILL-MOTION/package.json');
const {bundle} = require('@remotion/bundler');
const {renderStill, selectComposition} = require('@remotion/renderer');

const [outDir, times] = process.argv.slice(2);
const root = 'F:/AUDIRA-2D-SKILL-MOTION/engines/remotion-starter';
fs.mkdirSync(outDir, {recursive: true});
const serveUrl = await bundle({entryPoint: path.join(root, 'src/episodes/hidangan07/index.tsx'), publicDir: path.join(root, 'public')});
const comp = await withRenderPort((port) => selectComposition({ port, serveUrl, id: 'HidanganEP07-Draft'}));
for (const t of times.split(',').map(Number)) {
  const frame = Math.min(comp.durationInFrames - 1, Math.round(t * comp.fps));
  const out = path.join(outDir, `s${String(t).replace('.', '_').padStart(2, '0')}.png`);
  await withRenderPort((port) => renderStill({ port, serveUrl, composition: comp, frame, output: out, logLevel: 'error'}));
  console.log(out);
}
