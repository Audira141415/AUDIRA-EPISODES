# NOTES — EP74 Darvaza, Gerbang Neraka (WORLDFORGE, Remotion + R3F)

## Tahap 8 draf
- Juri buta putaran 1: 3.17 (L3 M2 D2 C3 Mo5 R4). Kelemahan: api billboard dengan garis hitam horizontal, dinding kawah oranye polos, haze coklat datar, kartu F7 menutup rig.
- Poles r2: dinding kawah bergerigi + bercak batu + jelaga, kamera H diturunkan, shader api diperbaiki (NaN dari `pow(1.0-y)` saat uv.y>1 dan `smoothstep` edge terbalik → `clamp(vUv.y)`, `1.0-smoothstep(a,b,d)`, `max(col,0)`).
- Juri buta putaran 2: **3.50** (L3 M3 D3 C3 Mo5 R4). **Diterima 3.50 setelah 2 putaran** (keputusan pengguna 2026-11-23), tanpa poles lagi, tanpa ganti style.
- THEME_CHECK G22: 8 baris semua ya. Camera audit klip 22–37 dtk: 5/5.

## Tahap 9 final (s6, 2026-11-25)
- Gerbang final pre-approved pengguna 2026-11-25 (batch 10 short otonom).
- Render via `_render.lock` (menunggu EP07 ±27 menit). `RENDER_TMPDIR=F:/render-tmp npm run render:final -- --comp=DarvazaFinal --out=../FINAL_EP74_DARVAZA.mp4 --vo=public/audio/vo.wav --offset=0 --sfx=public/audio/sfx.wav --concurrency=1 --title=... --slug=darvaza-kawah-api --ep=EP74 --skip-memory-gate=... --skip-channel=...` — 214 dtk.
  - Percobaan 1 gagal G18c: gap VO–SFX 11,5 LU (< 12). Fix: stem `public/audio/sfx.wav` diturunkan −2 dB → gap 13,5 LU.
  - `--skip-memory-gate`: draf diterima 3.50 setelah 2 putaran (gate hanya mengenal LOLOS ≥ 3.8).
  - `--skip-channel`: `src/scenes/news/PenggantiGibranWapres.tsx` sisa template (handle `@audira`), tidak diimpor; DarvazaFilm memakai `AudiraSignature` tanpa prop handle (channel @AudiraFaktaDunia).
- Audio: VO −16,4 LUFS, SFX ter-duck −29,9 LUFS. Master **−13,7 LUFS, TP −1,9 dBFS** (diukur ulang ffmpeg ebur128 pada file tagged).
- `FINAL_EP74_DARVAZA.mp4` 1080×1920 @ 60, 81,0 dtk, 4860 frame; tanda tangan Ed25519 VALID + C2PA. `FINAL_EP74_DARVAZA_tagged.mp4` metadata ffprobe ok (artist "AUDIRA (Agus Dwi R.)", comment `AUDIRA-darvaza-kawah-api-EP74 | audira.my.id`).
- `qa_video` hardOnly: PASS (16 cut, tanpa glitch).

## Tahap 10 delivery
- `SOCIAL_CAPTIONS.md` 6 platform + Jadwal Upload (WIB) + Label Konten AI, validator ok.
- `SUBTITLES.srt` 33 cue dari `vo-words.json`, ejaan fonetik dikembalikan (1971, 260, Ashgabat, Kourounis, 2013/2022/2025, AUDIRA).
- Jadwal default Rabu 20 Januari 2027 19.00 WIB (lanjut urutan harian seri setelah EP73 19 Jan 2027).
- Lessons WORLDFORGE: fix (shader api NaN), failed (lighting siang datar, pasir tanpa tekstur, rig blok, objek melayang).
- Kandidat promosi: dicatat di motion memory, tidak ditawarkan (batch otonom).

## Review terjadwal
- `review-darvaza-kawah-api-24h` (21 Jan 2027 19.00 WIB)
- `review-darvaza-kawah-api-72h` (23 Jan 2027 19.00 WIB)
- `review-darvaza-kawah-api-7d` (27 Jan 2027 19.00 WIB)
Jika upload diundur, ubah jadwal dengan update_scheduled_task.

## Pasca-tayang (24j / 72j / 7h)
| Waktu | Views | Avg durasi/retensi | Hook bertahan? | Komentar |
|-------|-------|--------------------|----------------|----------|
| 24j | | | | |
| 72j | | | | |
| 7h | | | | |
