# QA Gate: FINAL_VIDEO.mp4

- Date: 2026-11-12
- Mode: final (1080×1920 @ 60)
- Duration: 92.50 s · VO offset 0 s
- Verdict: **GREEN**

| Result | Area | Check |
|---|---|---|
| ok | spec | resolution 1080×1920 (want 1080×1920) |
| ok | spec | frame rate 60.00 (want 60) |
| ok | spec | video codec h264 (want h264) |
| ok | spec | pixel format yuv420p (want yuv420p) |
| ok | audio | audio codec aac (want aac) |
| ok | audio | sample rate 48000 Hz (want 48000) |
| ok | audio | integrated -13.6 LUFS (want -14 ±0.5; fix: node scripts/deliver.mjs) |
| ok | audio | true peak -1.7 dBFS (want < −1) |
| ok | picture | no black frames |
| ok | picture | no frozen stretch ≥ 2 s |
| ok | brand | artist "AUDIRA (Agus Dwi R.)" (want AUDIRA (Agus Dwi R.)) |
| ok | brand | copyright "© 2026 AUDIRA - Agus Dwi R. All rights reserved." |
| ok | brand | comment "AUDIRA-sejarah-islam-EP06 \| audira.my.id" (want AUDIRA-<slug>-<EP> \| audira.my.id) |
| ok | brand | title "Jam Gajah Al-Jazari \| Sejarah Islam EP06" |
| ok | brand | signature VALID (key 498c3302271aadce, metadata) |
| ok | brand | C2PA Content Credentials present (Valid) |
| ok | brand | channel: src/scenes/jazari/JazariFilm.tsx: <AudiraSignature> handle @AUDIRAQISSAH from src/brand/channel.json |
| ok | brand | channel: src/scenes/jazari/JazariFilm.tsx: <AudiraOutro> handle @AUDIRAQISSAH from src/brand/channel.json |
| ok | brand | channel: src/scenes/jazari/JazariFilm.tsx: <AudiraOutro> channel AUDIRA QISSAH from src/brand/channel.json |

