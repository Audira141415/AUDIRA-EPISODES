# STYLE_DECISION — Maraton Paling Kacau, Olimpiade St. Louis 1904 (`EP02`)

> ✅ Gerbang tahap 3. Cover = quality-bar penilaian skor.

- **Tanggal:** `2026-11-22`
- **Engine:** Remotion + R3F (3D)
- **Style terpilih:** `VINTAGEFORGE` (pilihan pengguna, 2026-11-22)
- **Alasan (awam, terkait topik):** Lomba tahun 1904 paling pas dibuat seperti diorama museum bernuansa sepia: jalan desa berdebu, pagar kayu, tiang telegraf, dan mobil awal abad 20 terasa sezaman. Skor juri style ini 3,94 dan sudah punya 1 episode gold.
- **Alternatif ditolak:** `FILM16`: cocok untuk sisi komedi film bisu, tapi baru dites sekali (skor sendiri 3,67, belum pernah dinilai juri). `TIMEFORGE`: style unggulan, tapi catatan juri berulang soal set yang sama muncul di banyak frame dan material perunggu terlihat plastik.
- **Cover referensi:** `cover-reference.jpg`
- **Cover topik:** kandidat `candidates/cover-topic-A.png` (pelari kelelahan di jalan berdebu, mobil di belakang) dan `candidates/cover-topic-B.png` (mobil 1904, pelari menumpang dan melambai). Yang di-acc disalin ke `cover-topic.png`. Komposisi: `Ep02CoverA` / `Ep02CoverB` (`studio/src/scenes/ep02/Cover.tsx`).
- **approved:** `yes` (pengguna: "B, acc", 2026-11-22; cover-topic.png = kandidat B)

## Parameter dari motion memory (`audira_style_memory get VINTAGEFORGE`)
- Wajib diterapkan: `<Finish profile=VINTAGE_SEPIA_FILM exposure=0.82 envIntensity=0.25>`; kuningan/tembaga pakai metalness tinggi dengan envMapIntensity ~2,5–3 dan hdri `warmStudio`; satu prop hero per adegan sebagai jangkar.
- Hindari: figur non-subjek terpotong di tepi frame pada shot close (keluarkan dari frustum); terlalu banyak kartu HUD bersamaan (composition mentok 3); hook "legs-only" dan diagram top-down berisi figur kecil.
- Catatan teknis EP02: `_shared/Glb.tsx` melepas render sebelum model tergambar, jadi EP02 memakai `ep02/Model.tsx` (advance + continueRender setelah commit). Debu 3D (sprite/plane transparan) rusak di pass AO; debu cover memakai lapisan 2D.
- Fakta di cover: 40 km, 32 °C, 1 titik air resmi (SOURCE_REGISTER #2, #3, #5, semua HIGH).
