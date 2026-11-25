# QA Gate: FINAL_VIDEO.mp4

- Date: 2026-11-13
- Mode: final (1080×1920 @ 60)
- Duration: 89.58 s · VO offset 0 s
- Verdict: **RED — do not deliver**

| Result | Area | Check |
|---|---|---|
| ok | spec | resolution 1080×1920 (want 1080×1920) |
| ok | spec | frame rate 60.00 (want 60) |
| ok | spec | video codec h264 (want h264) |
| ok | spec | pixel format yuv420p (want yuv420p) |
| ok | audio | audio codec aac (want aac) |
| ok | audio | sample rate 48000 Hz (want 48000) |
| ok | audio | integrated -14.4 LUFS (want -14 ±0.5; fix: node scripts/deliver.mjs) |
| ok | audio | true peak -1.8 dBFS (want < −1) |
| RED | picture | black 5.83–6.12 s (planned dip? pass --shotlist so the gate knows the cuts) |
| RED | picture | black 19.97–20.23 s (planned dip? pass --shotlist so the gate knows the cuts) |
| RED | picture | black 27.32–27.60 s (planned dip? pass --shotlist so the gate knows the cuts) |
| RED | picture | black 38.90–39.13 s (planned dip? pass --shotlist so the gate knows the cuts) |
| RED | picture | black 45.78–46.03 s (planned dip? pass --shotlist so the gate knows the cuts) |
| RED | picture | black 49.18–49.40 s (planned dip? pass --shotlist so the gate knows the cuts) |
| RED | picture | black 57.65–57.87 s (planned dip? pass --shotlist so the gate knows the cuts) |
| ok | picture | no frozen stretch ≥ 2 s |
| ok | brand | artist "AUDIRA (Agus Dwi R.)" (want AUDIRA (Agus Dwi R.)) |
| ok | brand | copyright "© 2026 AUDIRA - Agus Dwi R. All rights reserved." |
| ok | brand | comment "AUDIRA-sejarah-sepak-bola-EP08 \| audira.my.id" (want AUDIRA-<slug>-<EP> \| audira.my.id) |
| ok | brand | title "Sejarah Sepak Bola #08: Maracanazo 1950" |
| ok | brand | signature VALID (key 498c3302271aadce, metadata) |
| ok | brand | C2PA Content Credentials present (Valid) |
| ok | brand | channel: src/Root.tsx: <AudiraSignature> handle @AudiraSportFacts from src/brand/channel.json |
| ok | brand | channel: src/Root.tsx: <AudiraOutro> handle @AudiraSportFacts from src/brand/channel.json |
| ok | brand | channel: src/Root.tsx: <AudiraOutro> channel AUDIRA Sport Facts from src/brand/channel.json |

