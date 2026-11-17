---
name: football-r3f
description: "⛔ RULE 13 (aturan mati): topik sepak bola / football / soccer WAJIB Remotion 4 + React Three Fiber. world3d DILARANG. Pola studio: AUDIRA_SEJARAH_SEPAK_BOLA_2026 (11 EP, avg 4.11/5, QA 10/11 GREEN). Deteksi: nama seri mengandung 'sepak bola', 'football', 'soccer', atau frasa serupa — bukan kata tunggal 'bola'. Permintaan eksplisit pengguna menang."
---

# Football R3F — Rule 13 Engine Directive

> **ATURAN MATI** — ditetapkan oleh Agus Dwi R.

## Kapan berlaku

Episode yang topiknya sepak bola, football, atau soccer — terdeteksi dari:
- Nama seri mengandung frasa "sepak bola", "football", "soccer"
- Topik episode eksplisit tentang sejarah/fakta sepak bola
- **Bukan** kata tunggal "bola" (yang bisa merujuk bola golf, bola basket, dll.)

## Engine wajib

**Remotion 4 + React Three Fiber** (3D). `world3d.js` **DILARANG**.

## Pola studio

Referensi: `F:\AUDIRA-VIDEO-MOTION\AUDIRA_SEJARAH_SEPAK_BOLA_2026`
- 11 episode, skor rata-rata juri 4.11/5
- QA: 10/11 GREEN
- Channel: `@AudiraSportFacts`

## Alur

1. Ikuti pipeline 11 tahap dari `audira-motion`
2. Engine = Remotion + R3F (bukan world3d)
3. Baca `kits/<STYLE>/KIT.md` — terjemahkan ke R3F, bukan Three.js mentah
4. Starter + `npm run check-env` + `npm run smoke`
5. Camera: skill `audira-camera` berlaku (engine: remotion)
6. Render: `audira_render_batch` atau `npm run render:final`
7. Branding: `<AudiraOutro code="SPORTFACTS" />` + `<AudiraSignature />`

## Hubungan dengan skill lain

- `audira-motion`: berlaku penuh, tapi engine = remotion
- `audira-camera`: berlaku (guard "rule 13/14 berlaku")
- `remotion-best-practices`: berlaku
- `history-map-motion`: look/technique berlaku, engine diganti
