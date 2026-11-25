# NOTES — EP71 Baarle (pintu depan menentukan negara)

Style: SATELLITEBRIEFING · engine Remotion + R3F · VO Cartesia 90 dtk, film 93 dtk.

## Tahap 8 — draf (Sesi B s4, 2026-11-24)

- THEME_CHECK (G22): 8/8 frame `ya` → `draft/THEME_CHECK.md`.
- Putaran 1: self 3.67, juri buta 3.5 (L3 M3 D4 C3 Mo5 R3). Masalah: counter "EKSKLAVE BELGIA" tertangkap di 6 saat VO "dua puluh dua"; plang DITUTUP terpotong "ITUTU" (teks 120px tak muat kanvas 512px); plat NL·19 kecil/redup.
- Poles putaran 2: kartu count 15.0 s + ramp 0.45 s; `Plate` auto-fit lebar teks; DITUTUP w 0.8 rotY −0.55; plat S4 w 0.34, NL·19 fade-in 60.55–60.95 s; kamera S4 54–62 s mundur (z 4.9); grid slate `#86A9BE` ×2.4; hemisphere 0.75. Backup r1: `draft/_r1_*.bak`, sheet r1 `draft/DRAFT_SHEET_r1.jpg`.
- Putaran 2: self 3.83, juri buta 3.5 (L3 M3 D3 C3 Mo5 R4). Ceilings semua 5, camera 5/5, diversity 44.6.
- **Diterima 3.50 setelah 2 putaran** (keputusan pengguna 2026-11-23: terbaik ≥ 3.5 → langsung final, tanpa poles ke-3). Draf r2 dipakai.
- Lemah (append_lesson failed): look toy-plastic jenuh dan cahaya rata vs cover matte grey-blue; F4/F5 framing fasad frontal berulang; kartu HUD 1843 menutupi kertas traktat.
- Catatan teknis: `npm run draft` klip pertama timeout 33 s karena VRAM dipakai bersama sesi EP68–72; percobaan kedua (`--clip=50-68`) lolos.

## Tahap 9 — final (Sesi C s5, 2026-11-25)

- Acc render final pengguna 2026-11-25 ("Ya, lanjutkan"). Gate memori `render:final` menolak (juri 3.50 < 3.8); override `--skip-memory-gate` diizinkan pengguna langsung di sesi ("Ya, override gate").
- G18c: VO −16.4 LUFS, SFX ter-duck −30.8 LUFS, selisih 14.4 LU (min 12).
- Channel gate memblokir: `src/scenes/news/PenggantiGibranWapres.tsx` (template sisa, tidak dipakai BaarleFinal) memakai `handle="@audira"`; prop `handle` dihapus.
- Percobaan 1 dengan `--jobs=6` timeout di frame 4951 (GPU 100% dipakai bersama sesi EP68/EP70); lanjut `--jobs=3`, 9 segmen sisa, 810 frame dalam 522 dtk.
- Log render berisi 404 `public/models/polyfork/<tipe>/<id>.glb`: urutan fallback `AssetModel` (subfolder dulu, lalu folder flat). Model termuat, frame dicek.
- Master: **−13.7 LUFS, TP −1.8 dBFS**. `FINAL_EP71_BAARLE.mp4` 1080×1920 @ 60, 93.01 dtk, 166 MB (salinan di root episode dan `project/out/`). Metadata kepemilikan dicek ffprobe; Ed25519 VALID + C2PA tertanam. `npm run deliver`: GREEN (yellow tersisa: handle ekspresi di `src/templates/MultiSceneDirector.tsx`, template tidak dipakai BaarleFinal).
- audit:camera final 5/5 (parked 0%, longest hold 0 s, median 0.127). Skor final self 3.83 (L3 M3 D4 C4 Mo5 R4); diterima 3.50 juri setelah 2 putaran.

## Tahap 10 — delivery

- `SOCIAL_CAPTIONS.md` 6 platform + Jadwal Upload (Minggu 17 Januari 2027, 19.00–20.40 WIB) + Label Konten AI, lolos `audira_validate_social_captions`.
- Scheduled task review: `review-baarle-pintu-depan-24h` (18 Jan 2027 19.00 WIB), `review-baarle-pintu-depan-72h` (20 Jan 2027 19.00 WIB), `review-baarle-pintu-depan-7d` (24 Jan 2027 19.00 WIB).
