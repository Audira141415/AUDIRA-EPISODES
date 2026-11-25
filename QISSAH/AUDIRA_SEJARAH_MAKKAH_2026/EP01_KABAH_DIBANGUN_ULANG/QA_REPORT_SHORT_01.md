# QA Gate: FINAL_SHORT_01.mp4

- Date: 2026-11-11
- Mode: final (1080×1920 @ 60)
- Duration: 80.85 s · VO offset 0 s
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
| ok | audio | true peak -2.3 dBFS (want < −1) |
| ok | picture | no black frames |
| YELLOW | picture | frozen 78.43–end s (no motion ≥ 2 s: Anti-PPT) |
| ok | brand | artist "AUDIRA (Agus Dwi R.)" (want AUDIRA (Agus Dwi R.)) |
| ok | brand | copyright "© 2026 AUDIRA - Agus Dwi R. All rights reserved." |
| ok | brand | comment "AUDIRA-sejarah-makkah-EP01-SHORT_01 \| audira.my.id" (want AUDIRA-<slug>-<EP> \| audira.my.id) |
| ok | brand | title "Ka'bah Dibangun Ulang Berkali-kali \| Sejarah Makkah EP01 (Short 01)" |

## Reasons for each yellow

- (write one line per yellow before delivering)

## Reason for yellow (2026-11-11)
- The frozen stretch is the static AUDIRA outro card (logo on #0B3D2E + "Created by Agus Dwi R.") in the last ~3 s, after the voice ends. It is a deliberate brand hold, not a static scene.
