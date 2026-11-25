# QA Gate: FINAL_VIDEO.mp4

- Date: 2026-11-12
- Mode: final (1080×1920 @ 60)
- Duration: 94.21 s · VO offset 0 s
- Verdict: **GREEN**

| Result | Area | Check |
|---|---|---|
| ok | spec | resolution 1080×1920 (want 1080×1920) |
| ok | spec | frame rate 60.00 (want 60) |
| ok | spec | video codec h264 (want h264) |
| ok | spec | pixel format yuv420p (want yuv420p) |
| ok | audio | audio codec aac (want aac) |
| ok | audio | sample rate 48000 Hz (want 48000) |
| ok | audio | integrated -13.7 LUFS (want -14 ±0.5; fix: node scripts/deliver.mjs) |
| ok | audio | true peak -1.9 dBFS (want < −1) |
| ok | picture | no black frames |
| ok | picture | no frozen stretch ≥ 2 s |
| ok | brand | artist "AUDIRA (Agus Dwi R.)" (want AUDIRA (Agus Dwi R.)) |
| ok | brand | copyright "© 2026 AUDIRA - Agus Dwi R. All rights reserved." |
| ok | brand | comment "AUDIRA-sejarah-islam-EP08 \| audira.my.id" (want AUDIRA-<slug>-<EP> \| audira.my.id) |
| ok | brand | title "Pisau Bedah Al-Zahrawi \| Sejarah Islam EP08" |
| ok | brand | signature VALID (key 498c3302271aadce, metadata) |
| ok | brand | C2PA Content Credentials present (Valid) |
| ok | brand | channel: src/scenes/zahrawi/ZahrawiFilm.tsx: <AudiraSignature> handle @AUDIRAQISSAH from src/brand/channel.json |
| ok | brand | channel: src/scenes/zahrawi/ZahrawiFilm.tsx: <AudiraOutro> handle @AUDIRAQISSAH from src/brand/channel.json |
| ok | brand | channel: src/scenes/zahrawi/ZahrawiFilm.tsx: <AudiraOutro> channel AUDIRA QISSAH from src/brand/channel.json |

