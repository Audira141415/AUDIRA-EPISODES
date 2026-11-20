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
  'project/src/scenes',
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
    multiSceneBuilt: false,
    audioMixed: false,
    rendered: false,
    qaPassed: false
  }
};
fs.writeFileSync(path.join(epDir, 'STATUS.json'), JSON.stringify(statusData, null, 2), 'utf-8');

// 3. Multi-Scene Template Code Generation (Enforces Anti-Monolithic Law)
const sceneBeats = [
  { name: 'Scene1_Hook', title: 'Hook: Pembuka Dramatis', start: 0, end: 15, metric: 'FAKTA UTAMA', label: 'PENETRASI AWAL' },
  { name: 'Scene2_Context', title: 'Context: Latar & Lanskap', start: 15, end: 35, metric: 'TAHUN AWAL', label: 'SEJARAH / LOKASI' },
  { name: 'Scene3_Development', title: 'Development: Arsitektur & Detail', start: 35, end: 60, metric: 'DATA KUNCI', label: 'STRUKTUR UTAMA' },
  { name: 'Scene4_Conflict', title: 'Conflict: Bencana / Tantangan', start: 60, end: 75, metric: 'PERISTIWA', label: 'TITIK KRUSIAL' },
  { name: 'Scene5_Payoff', title: 'Payoff: Penemuan / Restorasi', start: 75, end: 85, metric: 'RESTORASI', label: 'RESOLUSI' },
  { name: 'Scene6_Outro', title: 'Outro: Epilog Megah', start: 85, end: 92, metric: 'WARISAN', label: 'PENUTUP' },
];

for (const s of sceneBeats) {
  const sceneCode = `import React from "react";
import * as THREE from "three";

/**
 * ${s.title} (${s.start}s – ${s.end}s)
 * WAJIB: Tampilkan visual hero yang mencerminkan apa yang diucapkan narator pada detik ini.
 * DILARANG: Membiarkan objek statis tanpa relevansi narasi.
 */
export const ${s.name}: React.FC<{ t: number }> = ({ t }) => {
  return (
    <group>
      {/* TODO: Letakkan hero asset (.glb), pencahayaan spesifik, dan environment babak ini */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 5]} intensity={1.5} castShadow />
    </group>
  );
};
`;
  fs.writeFileSync(path.join(epDir, `project/src/scenes/${s.name}.tsx`), sceneCode, 'utf-8');
}

// Generate MultiSceneComposition.tsx
const compCode = `import React from "react";
import { MultiSceneDirector, type SceneBeat } from "F:/AUDIRA-SKILL-MOTION/starter/src/templates/MultiSceneDirector.tsx";
import { Scene1_Hook } from "./scenes/Scene1_Hook.tsx";
import { Scene2_Context } from "./scenes/Scene2_Context.tsx";
import { Scene3_Development } from "./scenes/Scene3_Development.tsx";
import { Scene4_Conflict } from "./scenes/Scene4_Conflict.tsx";
import { Scene5_Payoff } from "./scenes/Scene5_Payoff.tsx";
import { Scene6_Outro } from "./scenes/Scene6_Outro.tsx";

const SCENES: SceneBeat[] = [
  { id: "s1", start: 0,  end: 15, title: "Hook",        metricValue: "FAKTA KUNCI", metricLabel: "PENETRASI AWAL", content: <Scene1_Hook t={0} /> },
  { id: "s2", start: 15, end: 35, title: "Context",     metricValue: "LOKASI",      metricLabel: "LATAR HISTORIS", content: <Scene2_Context t={0} /> },
  { id: "s3", start: 35, end: 60, title: "Development", metricValue: "STRUKTUR",   metricLabel: "ARSITEKTUR UTAMA", content: <Scene3_Development t={0} /> },
  { id: "s4", start: 60, end: 75, title: "Conflict",    metricValue: "BENCANA",     metricLabel: "TITIK BALIK", content: <Scene4_Conflict t={0} /> },
  { id: "s5", start: 75, end: 85, title: "Payoff",      metricValue: "RESTORASI",   metricLabel: "PENEMUAN", content: <Scene5_Payoff t={0} /> },
  { id: "s6", start: 85, end: 92, title: "Outro",       metricValue: "WARISAN",     metricLabel: "PENUTUP", content: <Scene6_Outro t={0} /> },
];

export const EpisodeComposition: React.FC = () => {
  return (
    <MultiSceneDirector
      totalSeconds={92}
      scenes={SCENES}
      channelHandle="@AUDIRA"
      signatureSeed="${episodeName.toLowerCase()}"
    />
  );
};
`;
fs.writeFileSync(path.join(epDir, 'project/src/EpisodeComposition.tsx'), compCode, 'utf-8');

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
