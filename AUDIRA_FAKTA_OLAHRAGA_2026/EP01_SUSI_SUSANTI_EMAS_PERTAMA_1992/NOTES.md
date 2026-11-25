# NOTES — Susi Susanti, Emas Pertama Indonesia 1992 (`EP01`)

Seri Fakta Olahraga (AUDIRA Sport Facts, @AudiraSportFacts) · Style PIXELSTORY · Remotion (studio bersama `AUDIRA_FAKTA_OLAHRAGA_2026/studio`) · 1080×1920 @ 60 · ±89,7 dtk.

## Yang berhasil (worked)
- Game 16-bit bulu tangkis yang diceritakan dalam "set": tiap potongan jatuh di kata VO (timing.ts `W(...)` dari timeline.json), jadi papan skor, stamp, dan chip selalu sinkron.
- Tokoh nyata ditulis lewat name card dan sprite generik, tanpa wajah atau kemiripan.
- Papan waktu 1952 → 1992 dengan "40 TAHUN · 0 EMAS" berkedip: jelas tanpa narasi tambahan.

## Yang gagal (failed) + perbaikan (fix)
- Label tahun ganda: penghitung tengah TimelinePanel dan label kanan sama-sama tampil "1992" di akhir sapuan. Fix: penghitung disembunyikan (`visibility: hidden`) begitu mencapai 1992.
- Chip payoff "2 EMAS · 1 HARI · 4 AGUSTUS 1992" terlalu panjang untuk satu baris. Fix: prop `sub` di `Chip` (hud.tsx), dua baris "2 EMAS · 1 HARI" / "4 AGUSTUS 1992".
- `audira_render_batch` tidak bisa merender final dari studio bersama (detail: side-session-notes `ep01-render-batch-blockers.md`):
  1. `project=<SERI>/studio` → `The "path" argument must be of type string. Received null` (render-batch.js:171, `checkLookJson` tanpa guard null karena studio tak punya STATUS.json di atasnya).
  2. Gate G14 meminta `draft/rig-audit.json`, padahal `scripts/rig-audit.mjs` tidak menulis JSON dan kamera PIXELSTORY 2D (x, y, zoom), bukan fungsi pose 3D.
  3. Job batch tidak punya field `sfx`, jadi final lewat batch tanpa SFX/duck (G18).
  Jalur yang dipakai: `npm run render:final` langsung (G15, izin sesi induk) dengan `GPU_LOCK.md` di side-session-notes sebagai kunci GPU antar sesi. Perbaikan tool perlu tugas sendiri di repo AUDIRA-ALL-SKILL.
- **Noise keras di final (keluhan pengguna 2026-11-23).** VO bersih: Cartesia, −16,3 LUFS, noise floor −inf, tidak ada hiss. Sumbernya stem SFX (−20 LUFS) yang dicampur dengan graph lama (`ratio=2.5 threshold=0.1`, tanpa trim SFX, tanpa loudnorm VO):
  - Bed `pad` di `sfx/cues/auto.py` mendengung terus ±−22 dB RMS di bawah 150 Hz, hanya ±6 dB di bawah VO.
  - Hero hit + riser di ±56 dtk 2 dB lebih keras dari VO (>6 kHz −24 dB).
  - Fix: remix audio saja dengan graph G18 (sudah ada di `studio/scripts/render-final.mjs`, diubah sesi lain): VO `loudnorm=I=-16`, SFX `volume=-10dB`, duck `threshold=0.015 ratio=8 attack=5 release=350`. Hasil stem: VO −16,0 vs SFX ter-duck −36,2 LUFS (selisih 20,2 LU). Hit 56 dtk >6 kHz turun ke −35 dB.
  - Video di-copy dari final lama tanpa render ulang. Lalu `deliver.mjs`, metadata ulang, `npm run sign`.

## Teknis
- Offset VO: 0 (VO mulai 0,1 dtk, `lead` di timeline.json); voEnd 85,718 dtk; film 89,718 dtk (outro AudiraOutro 3,8 dtk terakhir).
- Render: `npm run render:final -- --comp=Ep01Final --out=out/ep01/FINAL_EP01.mp4 --vo=public/audio/ep01/vo.wav --sfx=public/audio/ep01/sfx.wav --jobs=6 --concurrency=2 --gl=vulkan --encoder=nvenc --log=error --title=… --slug=susi-susanti-emas-pertama-1992 --ep=EP01`. 5384 frame dalam 106 dtk (~51 fps).
- QA final: −13,6 LUFS, true peak −1,8 dBFS (deliver.mjs); metadata kepemilikan dicek ffprobe; tanda tangan Ed25519 VALID + C2PA. `qa_video --hardOnly` awalnya FAIL 8 LONCAT, semuanya efek yang disengaja (37,73 banner level "lalu", 45,0 banner GIM 2, 48,50/48,6 flash match point 11–3, 57,3/58,1/58,8/59,5/60,4/60,9 flash fotografer podium dari `podiumFlash`). Dengan `--allow` waktu itu: PASS.
- Skor final: self 4,17 · juri buta 4,0 LOLOS (lighting 4, material 4, depth 4, composition 3, motion 5, readability 4); diarsipkan gold ke `AUDIRA-SKILL-MOTION/kits/pixelstory/gold/fakta-olahraga-EP01`. Composition 3: bawah set close-up net kosong, chip seri hook mepet 236 px, frame sheet 68,0 dtk jatuh di jendela Wipe (bukan bug; 68,4 dan 80,0 bersih).
- Remix audio 2026-11-23 (G18): −13,6 LUFS, true peak −2,2 dBFS, metadata `date=2026-11-23`, tanda tangan Ed25519 VALID (ditandatangani 2026-11-23T08:26Z, tanpa C2PA). Final lama dibackup di scratchpad sesi (sementara).
- Master: `FINAL_VIDEO.mp4` (salinan `studio/out/ep01/FINAL_EP01.mp4` + `.sig.json`), VO `audio/vo.wav`, contact sheet `draft/final-contact-sheet.jpg`.
- Subtitle: `SUBTITLES.srt` dibuat dari kata-kata timeline.json (44 cue); `audira_generate_srt` tidak membaca format vo.timing.json.

## Pasca-tayang (24j / 72j / 7h)
Upload: Senin 23 Nov 2026, 19.00 WIB (TikTok) lalu tiap 20 menit sampai Threads 20.40.
Scheduled task (sekali jalan, mode Auto): `review-susi-susanti-emas-pertama-1992-24h` (24 Nov 19.00), `-72h` (26 Nov 19.00), `-7d` (30 Nov 19.00).

| Waktu | Views | Avg durasi/retensi | Hook bertahan? | Komentar |
|-------|-------|--------------------|----------------|----------|
| 24j | | | | |
| 72j | | | | |
| 7h | | | | |
