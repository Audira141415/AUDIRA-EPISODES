# QA Gate: FINAL_EP69_KIRUNA_KOTA_PINDAH.mp4

- Date: 2026-11-24
- Mode: final (1080×1920 @ 60)
- Duration: 83.60 s · VO offset 0 s
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
| ok | audio | true peak -1.9 dBFS (want < −1) |
| ok | picture | no black frames |
| ok | picture | no frozen stretch ≥ 2 s |
| ok | brand | artist "AUDIRA (Agus Dwi R.)" (want AUDIRA (Agus Dwi R.)) |
| ok | brand | copyright "© 2026 AUDIRA - Agus Dwi R. All rights reserved." |
| ok | brand | comment "AUDIRA-kiruna-kota-pindah-EP69 \| audira.my.id" (want AUDIRA-<slug>-<EP> \| audira.my.id) |
| ok | brand | title "Kiruna: Kota yang Dipindah karena Tambang" |
| ok | brand | signature VALID (key 498c3302271aadce, metadata) |
| YELLOW | brand | no C2PA Content Credentials (npm run sign -- <final.mp4> --c2pa) |
| ok | brand | channel: src/episode/KirunaFilm.tsx: <AudiraSignature> handle @AudiraFaktaDunia from src/brand/channel.json |
| ok | brand | channel: src/scenes/news/PenggantiGibranWapres.tsx: <AudiraSignature> handle @AudiraFaktaDunia from src/brand/channel.json |
| YELLOW | brand | channel: src/templates/MultiSceneDirector.tsx: <AudiraSignature> handle={channelHandle} is an expression, not checked (want @AudiraFaktaDunia; leave handle out to use the channel) |
| ok | brand | channel: src/episode/KirunaFilm.tsx: <AudiraOutro> handle @AudiraFaktaDunia from src/brand/channel.json |
| ok | brand | channel: src/episode/KirunaFilm.tsx: <AudiraOutro> channel AUDIRA Fakta Dunia from src/brand/channel.json |
| ok | brand | channel: src/templates/MultiSceneDirector.tsx: <AudiraOutro> handle @AudiraFaktaDunia from src/brand/channel.json |
| ok | brand | channel: src/templates/MultiSceneDirector.tsx: <AudiraOutro> channel AUDIRA Fakta Dunia from src/brand/channel.json |

## Reasons for each yellow

- (write one line per yellow before delivering)
