# NOTES — EP73 Kosta Rika Tanpa Tentara (CHRONICLE, Remotion 2D)

## Tahap 8 draf (s3, 2026-11-24)
- Juri buta putaran 1: **3.83 LOLOS** (L4 M3 D4 C3 Mo5 R4). Self 4.0. Ceilings draf semua 5, camera 5/5.
- THEME_CHECK G22 semua ya. SFX stem -27 LUFS.
- Durasi film 77,2 dtk (VO 73,24 dtk + offset 0,3 dtk), di bawah target 80 dtk karena tempo VO Cartesia cepat (206 kata terucap).

## Tahap 9 final (s4, 2026-11-25)
- Gerbang final pre-approved pengguna 2026-11-25 (batch 10 short otonom).
- Render via `_render.lock` bersama (menunggu EP76 ±10 menit). `npm run render:final -- --comp=Ep73Final --out=../FINAL_EP73_KOSTA_RIKA.mp4 --sfx=public/audio/sfx.wav --vo=public/audio/vo.wav --offset=0.3 --concurrency=1` dengan `RENDER_TMPDIR=F:/render-tmp` (C: 98% penuh). Offset 0,3 wajib karena komposisi memakai `OFF = 0.3`.
- Render 1 (255 dtk): `qa_video` FAIL BLACK 55,15–56,73 dtk = adegan peta titik dunia terlalu gelap sebelum counter ±21 muncul (bukan frame hitam). Fix: `src/Film.tsx` latar radial `#22405A → #0A1622`, titik `#5A86A8`.
- Render 2 (266 dtk): `qa_video` hardOnly allow=67.4 **PASS** (cut 24,93 dan 67,4 = flash payoff sengaja).
- Audio: G18c VO -16,5 LUFS, SFX ter-duck -32,0 LUFS, selisih 15,5 LU. Master **-13,6 LUFS, TP -1,8 dBFS** (diukur ulang dengan ffmpeg ebur128).
- `FINAL_EP73_KOSTA_RIKA.mp4` 1080×1920 @ 60, 77,2 dtk, 4632 frame; metadata ffprobe ok (artist "AUDIRA (Agus Dwi R.)", comment `AUDIRA-kosta-rika-tanpa-tentara-EP73 | audira.my.id`); tanda tangan Ed25519 VALID + C2PA.
- Skor final juri buta **3.83 LOLOS** (L4 M3 D4 C4 Mo4 R4). Kelemahan: fill vektor datar tanpa tekstur, label HUD anggaran F5 dan subline F6 kecil, adegan sekolah payoff dipakai 3 frame.
- Dibersihkan: `project/out`, `draft/_stills`, klip `draft/CHECK_*`.

## Tahap 10 delivery (s4)
- `SOCIAL_CAPTIONS.md` 6 platform + Jadwal Upload (WIB) + Label Konten AI, validator ok.
- `SUBTITLES.srt` 37 cue dari vo-words.json (+0,3 dtk), ejaan fonetik TTS dikembalikan (1948, José Figueres, Bellavista, Óscar, Liechtenstein, Pasal 12).
- Jadwal default Selasa 19 Januari 2027 19.00 WIB (lanjut urutan harian seri setelah EP72 18 Jan 2027).
- Lessons CHRONICLE: worked (dusk gradient + rim glow + callout besar), fix (peta gelap → BLACK qa_video), failed (material datar, HUD kecil, payoff diulang).
- Kandidat promosi: dicatat di motion memory, tidak ditawarkan (batch otonom).

## Review terjadwal
- `review-kosta-rika-tanpa-tentara-24h` (20 Jan 2027 19.00 WIB)
- `review-kosta-rika-tanpa-tentara-72h` (22 Jan 2027 19.00 WIB)
- `review-kosta-rika-tanpa-tentara-7d` (26 Jan 2027 19.00 WIB)
Jika upload diundur, ubah jadwal dengan update_scheduled_task.
