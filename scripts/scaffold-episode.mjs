#!/usr/bin/env node
/**
 * AUDIRA Episode Scaffolder (Rule 07, Rule 08, Rule 20 Compliant)
 * 
 * Usage:
 *   node scripts/scaffold-episode.mjs <series-name> <episode-name> [r3f|2d] [style-kit]
 * Example:
 *   node scripts/scaffold-episode.mjs AUDIRA_SEJARAH_ISLAM_2026 EP12_IBNU_SINA r3f mosaicforge
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const [seriesName, episodeName, rawEngine, styleKit] = process.argv.slice(2);

if (!seriesName || !episodeName) {
  console.log(`
Usage: node scripts/scaffold-episode.mjs <series-name> <episode-name> [r3f|2d] [style-kit]

Examples:
  node scripts/scaffold-episode.mjs AUDIRA_SEJARAH_ISLAM_2026 EP12_IBNU_SINA r3f mosaicforge
  node scripts/scaffold-episode.mjs EXPLAINED EP05_AI_CHIP_WAR 2d
`);
  process.exit(1);
}

const engine = (rawEngine || 'r3f').toLowerCase();
const kit = (styleKit || 'cyberforge').toLowerCase();

const seriesDir = path.join(ROOT, seriesName);
const epDir = path.join(seriesDir, episodeName);

if (fs.existsSync(epDir)) {
  console.error(`[ERROR] Episode directory already exists: ${epDir}`);
  process.exit(1);
}

console.log(`=======================================================`);
console.log(`🎬 AUDIRA Episode Scaffolder`);
console.log(`- Series:  ${seriesName}`);
console.log(`- Episode: ${episodeName}`);
console.log(`- Engine:  ${engine === '2d' ? 'Remotion 2D (Explainer)' : 'Remotion + R3F 3D'}`);
console.log(`- Style:   ${kit}`);
console.log(`=======================================================`);

// 1. Create Rule 08 standard layout
const subdirs = [
  'archive',
  'audio',
  'docs',
  'draft',
  'research',
  'style',
  'thumbnails',
  'project',
  'project/src',
  'project/public',
  'project/public/audio',
  'project/public/brand',
  'project/public/fonts',
  'project/public/models/polyfork'
];

for (const sd of subdirs) {
  fs.mkdirSync(path.join(epDir, sd), { recursive: true });
}

// 2. STATUS.json
const nowIso = new Date().toISOString();
const statusData = {
  series: seriesName,
  episode: episodeName,
  title: episodeName.replace(/^EP\d+[-_]?/i, '').replace(/_/g, ' '),
  engine: engine === '2d' ? 'remotion-2d' : 'remotion-r3f',
  styleKit: kit,
  stage: 'draft',
  progress: 10,
  createdAt: nowIso,
  updatedAt: nowIso,
  checklist: {
    research: false,
    scriptApproved: false,
    voGenerated: false,
    sceneBuilt: false,
    audioMixed: false,
    rendered: false,
    qaPassed: false
  }
};
fs.writeFileSync(path.join(epDir, 'STATUS.json'), JSON.stringify(statusData, null, 2), 'utf-8');

// 3. Rule 20 Documentation: PRD.md, PROGRESS.md, HANDOFF.md
const prdContent = `# PRD — ${seriesName} / ${episodeName}

## 1. Executive Summary
- **Title**: ${statusData.title}
- **Target Duration**: 45 - 60 seconds (9:16 Vertical)
- **Engine**: ${statusData.engine}
- **Visual Style**: ${kit}
- **Primary Hero Visual**: Physical 3D GLB Asset from local store (\`E:/ASET/ASSET-AUDIRA\`) or 2D Motion Graphics

## 2. Narrative Arc & Hook
- **Hook (0-3s)**: Problem or shocking fact.
- **Context (3-15s)**: Background and historical / scientific framing.
- **Deep Dive (15-40s)**: Main thesis with hero assets on stage.
- **Climax / Twist (40-50s)**: Culmination of events.
- **Outro (50-60s)**: Resolution & call-to-action with AUDIRA outro card.

## 3. Audio & Voiceover Plan
- **Language**: Indonesian (id-ID)
- **BGM**: Ambient cinematic beat matched to pacing.
- **SFX**: Riser, whoosh, impacts on chapter transitions.
`;
fs.writeFileSync(path.join(epDir, 'docs/PRD.md'), prdContent, 'utf-8');

const progressContent = `# PROGRESS — ${seriesName} / ${episodeName}

- [x] Episode directory initialized via \`scaffold-episode.mjs\` (${nowIso.slice(0, 10)})
- [ ] Research & verified facts documented
- [ ] Voiceover script written & synced
- [ ] 3D / 2D Hero visual scene constructed
- [ ] Audio, SFX & Subtitles integrated
- [ ] Draft preview rendered & reviewed
- [ ] Final 1080x1920 60fps render
`;
fs.writeFileSync(path.join(epDir, 'docs/PROGRESS.md'), progressContent, 'utf-8');

const handoffContent = `# HANDOFF — ${seriesName} / ${episodeName}

## Current Status
- Project scaffolded. Next step is researching verified historical / tech facts and generating voiceover lines in \`audio/\`.

## Next Commands
\`\`\`bash
cd ${epDir.replace(/\\/g, '/')}
# 1. Edit docs/PRD.md with exact facts
# 2. Add voiceover to audio/vo.wav
# 3. Build scene in project/src/
\`\`\`
`;
fs.writeFileSync(path.join(epDir, 'docs/HANDOFF.md'), handoffContent, 'utf-8');

// 4. Link 3D Local Asset Store (3,288 models) via NTFS Junctions if engine is r3f
const assetSource = process.env.POLYFORK_LOCAL || 'E:/ASET/ASSET-AUDIRA/downloads/glb';
if (fs.existsSync(assetSource)) {
  const categories = ['animal', 'attachment', 'building', 'character', 'hand', 'prop', 'terrain', 'ultra', 'vehicle'];
  const targetPolyfork = path.join(epDir, 'project/public/models/polyfork');
  let linked = 0;
  for (const cat of categories) {
    const cSrc = path.join(assetSource, cat);
    const cDst = path.join(targetPolyfork, cat);
    if (fs.existsSync(cSrc) && !fs.existsSync(cDst)) {
      try {
        execSync(`cmd /c "mklink /J \"${cDst}\" \"${cSrc}\""`, { stdio: 'pipe' });
        linked++;
      } catch {}
    }
  }
  console.log(`  ✓ Linked ${linked} 3D asset categories from ${assetSource}`);
}

console.log(`\n🎉 Successfully scaffolded episode: ${epDir}`);
console.log(`👉 Open: cd "${epDir}"\n`);
