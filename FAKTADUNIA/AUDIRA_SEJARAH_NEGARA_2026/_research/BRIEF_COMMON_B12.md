# Batch 12 (EP56–EP60) — brief bersama untuk sesi produksi

Dibuat 2026-11-23. Satu sesi = satu episode. Seri: `F:\AUDIRA-EPISODES\FAKTADUNIA\AUDIRA_SEJARAH_NEGARA_2026` (channel FAKTADUNIA, @AudiraFaktaDunia).

## Wajib
- Ikuti pipeline 11 tahap + pre-flight di `C:\Users\ASUS\.claude\CLAUDE.md` dan `F:\AUDIRA-EPISODES\CLAUDE.md` apa adanya. Satu-satunya gerbang acc pengguna: tepat sebelum render final (tahap 9). Style + engine 2D/3D dipilih sendiri dan dilaporkan satu baris.
- Riset sudah selesai: salin `_research/b12/<EP>_SOURCE_REGISTER.md` ke `<EP>/research/SOURCE_REGISTER.md`. Tiap angka di layar dan di VO harus cocok dengan register. Boleh menambah sumber, tapi jangan mengubah angka tanpa sumber.
- Scaffold dari `F:\AUDIRA-EPISODES`: `node scripts/scaffold-episode.mjs FAKTADUNIA/AUDIRA_SEJARAH_NEGARA_2026 <EP> r3f <kit>` (Remotion + R3F default; `2d` bila style terpilih 2D). Lalu `audira_episode_status` `init`, dan isi `data.shortTitle`.
- Referensi kualitas: 2–3 episode terakhir seri ini (EP51–EP55) dan motion memory (`audira_style_memory` GLOBAL + channel).
- Tulis hanya di folder episode sendiri. Jangan edit `_research/*`, `_tools/*`, atau folder episode lain. Sesi lain bekerja paralel di seri ini.
- Render panjang jalan di background, `--concurrency=2`. VO Cartesia default; tulis "Audira" (bukan AUDIRA) di teks TTS.
- Batas konteks: handover lewat `audira_episode_status` `action: "handover"`; sesi lanjutan judulnya dari `newSessionTitle`.
- Konten sensitif (catatan per episode di register): tanpa tubuh, luka, darah, atau wajah orang nyata. Orang nyata = name card + figur generik.

## Selesai bila
`FINAL_VIDEO.mp4` 1080×1920 @60 lolos QA (−14 LUFS, TP < −1 dBFS, metadata, signature), `SOCIAL_CAPTIONS.md` lolos validator dan tampil di chat, `NOTES.md`, motion memory diperbarui, scheduled review 24h/72h/7d dibuat.
