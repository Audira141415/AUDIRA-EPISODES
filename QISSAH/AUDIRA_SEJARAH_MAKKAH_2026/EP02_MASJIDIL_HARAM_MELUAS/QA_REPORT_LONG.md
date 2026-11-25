# QA Gate: FINAL_LONG.mp4

- Date: 2026-11-11
- Mode: wide final (1920×1080)
- Duration: 718.40 s · VO offset 0 s
- Verdict: **YELLOW — deliver only with a written reason for each yellow**

| Result | Area | Check |
|---|---|---|
| ok | spec | resolution 1920×1080 (want 1920×1080) |
| ok | spec | frame rate 30.00 (want 30 or 60) |
| ok | spec | video codec h264 (want h264) |
| ok | spec | pixel format yuv420p (want yuv420p) |
| ok | audio | audio codec aac (want aac) |
| ok | audio | sample rate 48000 Hz (want 48000) |
| ok | audio | integrated -13.6 LUFS (want -14 ±0.5; fix: node scripts/deliver.mjs) |
| ok | audio | true peak -1.7 dBFS (want < −1) |
| ok | picture | no black frames |
| YELLOW | picture | frozen 715.80–end s (no motion ≥ 2 s: Anti-PPT) |
| ok | brand | artist "AUDIRA (Agus Dwi R.)" (want AUDIRA (Agus Dwi R.)) |
| ok | brand | copyright "© 2026 AUDIRA - Agus Dwi R. All rights reserved." |
| ok | brand | comment "AUDIRA-sejarah-makkah-EP02-LONG \| audira.my.id" (want AUDIRA-<slug>-<EP> \| audira.my.id) |
| ok | brand | title "Masjidil Haram Terus Meluas \| Sejarah Makkah EP02" |

## Reasons for each yellow

- (write one line per yellow before delivering)

## Reason for yellow (2026-11-11)
- The frozen stretch is the static AUDIRA outro card (logo on #0B3D2E + "Created by Agus Dwi R.") in the last ~3 s, after the voice ends. It is a deliberate brand hold, not a static scene.
