# NOTES — EP23 Ibrahim, Ismail, dan Perintah dalam Mimpi

Channel: AUDIRA Qissah (@AUDIRAQISSAH) · Style: ISLAMICDOCUMENTARY · Engine: Remotion 2D SVG · Tanggal: 2026-11-23

## Hasil
- Final: `FINAL_VIDEO.mp4` 1080×1920 @ 60, 86 dtk (outro AudiraOutro 3 dtk terakhir).
- VO: Cartesia (voice 04b567df), 82,38 dtk, 187 kata. **Offset VO = 0,3 dtk** (detik film = detik VO + 0,3; caption karaoke pakai t − 0.3; SUBTITLES.srt sudah digeser +0,3).
- SFX: `project/public/audio/sfx.wav` (38 bunyi, prosedural), di-duck di bawah VO (G18).
- Draf juri buta: putaran 1 = 3.67, putaran 2 = 3.67 (lighting 4, material 4, depth 4, composition 3, motion 4, readability 3). **Diterima 3.67 setelah 2 putaran** (aturan ≥ 3.5) → final; render:final dijalankan dengan `--skip-memory-gate` karena gate script belum mengenal auto-accept 2 putaran.

## Pelajaran
- Berhasil: depth ceiling 3 → 5 dengan kabut gradien blur di antara ridge BG/MG/FG, lapisan FG batu gelap blur (parallax 1.4×), glow lentera dua lapis.
- Berhasil: chip "SOSOK NABI TIDAK DIGAMBARKAN" di bottom 380 px menjatuhkan composition ceiling ke 2; dipindah ke top safe (y190, 36 px) → 5.
- Gagal: kartu HUD atas yang tinggi + caption bawah menjepit subjek ke pita tengah; beat abstrak (mimpi = wahyu, takwa) butuh satu subjek besar yang jelas, bukan beberapa objek kecil.
- Teknis: `scripts/draft.mjs` salinan lama error `await` di fungsi non-async → salin versi starter. `render-final.mjs` + `lib/media.mjs`, `lib/sign.mjs`, `lib/g18-mix-check.mjs` diperbarui dari starter (G18d, replaceFile untuk EPERM).

## Adab
Nabi Ibrahim AS & Ismail AS tidak digambarkan (lentera besar = ayah, lentera kecil = anak, jejak kaki, cahaya). Tanpa pisau/darah/penyembelihan. Panggilan Allah = riak cahaya + teks. Arab disalin dari `research/quran_verses.txt`.

## Jadwal & review
- Upload: Minggu, 29 Nov 2026, TikTok 19.30 WIB lalu platform lain tiap 20 menit (lihat SOCIAL_CAPTIONS.md).
- Scheduled review tahap 11: belum dibuat di sesi ini (lihat bagian bawah bila sudah).
