# QA Gate: FINAL_VIDEO.mp4

- Date: 2026-11-13
- Mode: final (1080×1920 @ 60)
- Duration: 88.17 s · VO offset 0 s
- Verdict: **YELLOW — deliver only with a written reason for each yellow**

| Result | Area | Check |
|---|---|---|
| ok | spec | resolution 1080×1920 (want 1080×1920) |
| ok | spec | frame rate 60.00 (want 60) |
| ok | spec | video codec h264 (want h264) |
| ok | spec | pixel format yuv420p (want yuv420p) |
| ok | audio | audio codec aac (want aac) |
| ok | audio | sample rate 48000 Hz (want 48000) |
| ok | audio | integrated -13.6 LUFS (want -14 ±0.5; fix: node scripts/deliver.mjs) |
| ok | audio | true peak -1.8 dBFS (want < −1) |
| ok | picture | no black frames |
| YELLOW | picture | frozen 85.67–end s (no motion ≥ 2 s: Anti-PPT) |
| ok | brand | artist "AUDIRA (Agus Dwi R.)" (want AUDIRA (Agus Dwi R.)) |
| ok | brand | copyright "© 2026 AUDIRA - Agus Dwi R. All rights reserved." |
| ok | brand | comment "AUDIRA-korek-api-EP04 \| audira.my.id" (want AUDIRA-<slug>-<EP> \| audira.my.id) |
| ok | brand | title "Cara Pembuatan Korek Api" |
| ok | brand | signature VALID (key 498c3302271aadce, metadata) |
| ok | brand | C2PA Content Credentials present (Valid) |
| YELLOW | brand | channel: no src/ folder: channel marks not checked |

## Reasons for each yellow

- (write one line per yellow before delivering)
