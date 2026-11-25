# NOTES — EP28 Derek Redmond, Barcelona 1992

Channel: AUDIRA Sport Facts (@AudiraSportFacts) · Style: CHRONICLE · Engine: Remotion 2D (SVG/DOM) · Memory episode: `short-baru-11-23-EP28`
Tanggal produksi: 2026-11-23 (3 sesi) · Durasi film 76,0 dtk (4560 frame) · Final 1080×1920 @ 60

## Audio
- VO Cartesia (voice `04b567df-…`), 193 kata, mentah 79 dtk dipadatkan ke 72,8 dtk (`audio/work/tighten.py`): `project/public/audio/vo.wav` + `vo-words.json` + `vo.timing.json`.
- **Offset VO: 0,3 dtk.**
- SFX prosedural `npm run sfx` dari `docs/SHOTLIST.md` (17 shot, 36 sound), stem −20 LUFS; graph G18 (VO −16,5 LUFS, SFX ter-duck −37,7 LUFS, gap 21,2 LU).
- Musik: tidak ada. `SUBTITLES.srt` digeser +0,3 dtk mengikuti offset.

## Skor
- Draf: self 4.00; juri buta putaran 1 = 3.83 (lighting 4, material 3, depth 4, composition 3, motion 5, readability 4) → LOLOS (G16). Camera audit klip 28–46 dtk: 5/5.
- Final: self 3.83 (record_score stage final).

## Yang berhasil
- Kode warna kontur: Derek emas, Jim biru, petugas merah; stempel DITOLAK/DNF dan papan hasil dot-matrix membawa cerita tanpa wajah.
- Kontras mood: malam biru (pembuka, DNF) vs senja hangat (lomba, ayah-anak).

## Yang gagal / pelajaran
- Juri: 6 dari 8 frame memakai latar stadion hangat + kerumunan coretan yang sama (material 3, terasa satu set daur ulang). Lain kali variasikan set per babak (lorong, tribun close-up, garis finis dari atas).
- Composition 3: karaoke grup panjang pecah 2 baris masuk zona bawah → fix: putus grup > 24 karakter. Kartu DNF menabrak karaoke → top 1110. Kutipan serif tak terbaca di atas god-ray → panel gelap. NameTag Jim menempel tanda tangan → y 380. Jim kini mundur saat melepas pegangan.
- `render-final.mjs` channel gate butuh alasan: `--skip-channel="<alasan>"` (bentuk tanpa nilai gagal).

## Final
- `FINAL_VIDEO.mp4` 1080×1920 @ 60, 76,02 dtk, **−13,6 LUFS, true peak −2,0 dBFS**, render 173,9 dtk (jobs 4, nvenc). Metadata title/artist/copyright/comment/date dicek ffprobe. Signature Ed25519 VALID + C2PA. `audira_qa_video` hardOnly PASS (0 glitch; 3 flash disengaja di 25,4 / 31,3 / 60,9 dtk: pistol, letupan paha, finis). Outro AUDIRA Sport Facts + AudiraSignature terlihat.
- Contact sheet: `draft/contact-sheet.jpg` (draf), `draft/final-contact-sheet.jpg` (final).

## Review pasca-tayang (scheduled task)
Upload: Sabtu 28 Nov 2026 19.00 WIB (TikTok → IG 19.20 → YT 19.40 → FB 20.00 → X 20.20 → Threads 20.40).
- `review-derek-redmond-barcelona-1992-24h` — 29 Nov 2026 19.00 WIB
- `review-derek-redmond-barcelona-1992-72h` — 1 Des 2026 19.00 WIB
- `review-derek-redmond-barcelona-1992-7d` — 5 Des 2026 19.00 WIB
Task hanya jalan saat aplikasi Claude terbuka (bila tertutup, jalan saat dibuka lagi). Mode izin sesi tidak tersimpan di task: run bisa berhenti meminta izin.
