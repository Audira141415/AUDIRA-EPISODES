# NOTES — Sistem Imun: Tentara Tubuh yang Tak Pernah Istirahat (`EP07`)

Seri AUDIRA Sains Anak 2026 · channel @AudiraSains · style NANOFORGE · Remotion + R3F (3D) · batch 10 short otonom 2026-11-25 (gerbang final pre-approved pengguna).

## Yang berhasil (worked)
- 7 adegan (hook kamar → patroli pembuluh → luka → makrofag/sel T → serangan → barak memori → outro), semua cocok VO (G22 8/8 `ya`).
- Sel prosedural (`cells.tsx`) cukup kuat untuk juri tanpa GLB; GLB hanya untuk kamar (bed) + ToyPerson.
- Kamera kontinu: audit:camera 5/5 (deadPct 0, medianSpeed 0.107).
- Juri draf r2 LOLOS 3.83 (L3 M4 D4 C3 Mo5 R4).

## Yang gagal (failed) + perbaikan (fix)
- r1 audit: donat "52% NEUTROFIL" kontras 1.1:1 (backdrop SVG semi-transparan tidak dihitung) → wrapper div `backgroundColor` opak + `borderRadius 50%` → readability cap 4.
- Juri r1 3.67: neutrofil terlihat seperti clay matte → meshPhysical roughness 0.16, clearcoatRoughness 0.06, transmission 0.42, iridescence 0.55 → material 4.
- LabelPlate "BARAK AUDIRA" melewati tepi kanvas → auto-fit lebar teks (≤880 px dari 1024).
- Sisa lemah (juri r2): hook frame 1 manekin di kamar terang/hijau (lighting 3); frame 4 padat (composition 3); handle `@AudiraSains` 33 px di outro (< 36).

## Teknis
- Offset VO: 0 (vo.wav 79,18 dtk; film 82,6 dtk termasuk outro 3,2 dtk).
- Render: `node scripts/render-final.mjs --comp=ImunFinal --out=../FINAL_EP07_SISTEM_IMUN_tagged.mp4 --vo=public/audio/vo.wav --sfx=public/audio/sfx.wav --jobs=6 --concurrency=2 --gl=vulkan --encoder=nvenc --title=... --slug=sains-ep07-sistem-imun --ep=EP07`.
- Final QA (s5, 2026-11-25 06:4x WIB): `FINAL_EP07_SISTEM_IMUN_tagged.mp4` 1080×1920 @ 60, 82,6 dtk, −13,7 LUFS, TP −1,9 dBTP; ffprobe: artist "AUDIRA (Agus Dwi R.)", comment "AUDIRA-sains-ep07-sistem-imun-EP07 | audira.my.id". Skor final (self) 3.83.
- Kandidat promosi kit (dicatat, tidak ditawarkan): parameter "grade" diperbaiki di 2 episode.

## Jadwal upload & review
- Upload: Kamis, 26 Nov 2026 19.00 WIB (TikTok) dst. per `SOCIAL_CAPTIONS.md`.
- Scheduled task: `review-sains-ep07-sistem-imun-24h` (27 Nov 19.00), `review-sains-ep07-sistem-imun-72h` (29 Nov 19.00), `review-sains-ep07-sistem-imun-7d` (3 Des 19.00) — jalan hanya saat aplikasi Claude terbuka.

## Pasca-tayang (24j / 72j / 7h)
| Waktu | Views | Avg durasi/retensi | Hook bertahan? | Komentar |
|-------|-------|--------------------|----------------|----------|
| 24j | | | | |
| 72j | | | | |
| 7h | | | | |
