# STYLE DECISION — EP32 BONGKAR RAHASIA RUMAH

approved: yes
date: 2026-11-21

## Style Terpilih
**BUILDFORGE** — konstruksi fisik nyata, kamera naik mengikuti proses pembangunan, material PBR warm documentary.

## Alasan
Topik "bongkar rahasia rumah" cocok dengan BUILDFORGE karena:
1. Kit ini memvisualisasikan konstruksi lapisan per lapisan (lahan → fondasi → rangka → dinding → selesai) — identik dengan konsep "bongkar" di AUDIRA.
2. GLB `two-story-house-40f6dc.glb` tersedia lokal, memastikan visual rumah nyata bukan abstrak.
3. finishProfile `DOCUMENTARY_WARM` memberi nuansa faktual/edukasi yang sesuai dengan format bongkar-topik.

## Alternatif yang Ditolak
- **INNERWORKS** (cross-section mekanikal) — lebih cocok untuk topik mesin/mekanik, bukan bangunan.
- **BRICKCRAFT** (stop-motion bata) — visual terlalu playful untuk konten faktual serius.

## Cover Files
- `cover-reference.png` → cover kit BUILDFORGE (paviliun, dari kit example)
- `cover-topic.png` → cover topik EP32 (two-story house GLB, f0075.png)

## Parameters
- finishProfile: DOCUMENTARY_WARM
- exposure: 1
- envIntensity: 0.55
- ao: true
- hdri: sky
- engine: remotion-r3f
- GLB hero: `two-story-house-40f6dc.glb`
