# NOTES — Cara Kerja Vaksin (EP33)

> Tahap 10–11. Pelajaran agar episode berikut mulai dari kualitas lebih tinggi.
> Style: NANOFORGE (alternatif ditolak: TUBUH) · memoryEpisode `cara-kerja-viral-EP33` · kanal AUDIRA Explained (@AudiraExplained)

## Yang berhasil (worked)

- **NANOFORGE untuk topik biologi mikro**: antigen, antibodi, dan virus sebagai objek 3D glossy di latar gelap terbaca jelas. Draf lolos juri buta putaran 2 dengan rata-rata 4.0.
- **ToyPerson untuk kekebalan kelompok (F7)**: kisi sel abstrak diganti kerumunan ToyPerson. Penonton langsung paham "orang yang divaksin melindungi yang lain", dan readability naik dari 3 ke 4.
- **Untai mRNA dipusatkan** di frame: subjek utama tidak lagi terpotong tepi.
- **Penghitung angka selesai sebelum kata angka diucapkan**: angka 154 sudah final saat VO menyebut "154 juta".

## Yang gagal (failed)

- **Style TUBUH gagal juri**: lighting datar dan kamera diam 33% durasi. Diganti NANOFORGE (G21: tahap 4 diulang).
- **Juri r1 3.83**: penghitung baru di 139 saat VO sudah menyebut 154, sehingga data callout tidak sinkron.
- **Drive C: penuh**: Chrome OOM, sehingga render final gagal 3 kali.
- **Channel gate tersandung** file episode lain `src/scenes/news/PenggantiGibranWapres.tsx`, sehingga render memakai `--skip-channel`.
- **qa-video BLACK false positive**: 3 temuan BLACK (30.8–32.2 s, 35.8–40.0 s, 66.3–67.1 s). Dicek di strip: latar gelap NANOFORGE masih berisi molekul, HUD, dan caption, sedangkan 66 s adalah fade antar adegan. Tidak ada frame hitam nyata. Ambang luma qa-video belum mengenal style berlatar gelap.

## Perbaikan (fix)

- **Render final**: `TEMP=F:/tmp/remotion` + `--jobs=3`, berhasil di percobaan ke-4. Untuk episode berikut, set TEMP ke F: sejak awal bila C: < 20 GB.
- **Penghitung**: animasi count-up selesai ≥ 0,3 dtk sebelum kata angka di VO (juri r1 3.83 → r2 4.0).
- **Tool VO** butuh parameter `text` (bukan hanya path naskah).
- **Deps starter** ter-hoist ke root `node_modules`: jalankan perintah dari root proyek.
- **Output draf** ke `draft/`, bukan `out/`.
- **Bug starter**: `await sizeOf` pada `hfStills` di `F:/AUDIRA-SKILL-MOTION/starter/scripts/draft.mjs` perlu diperbaiki di kit.

## Parameter terbaik

- Kamera audit: skor motion 5 (camera.json)
- Ceilings audit:visual: lighting 5, material 5, depth 5, composition 5, readability 4; diversity 45.4
- Render: `--jobs=3`, TEMP di F:, 1080×1920 @ 60

## Data teknis

- **Durasi VO/premix**: 84.2 dtk · **Durasi final**: 87.5 dtk (5250 frame @ 60 fps)
- **File**: `FINAL_EP33_CARA_KERJA_VAKSIN.mp4`, 188.6 MB, H.264 + AAC 320k
- **Master**: loudnorm linear dari premix (measured I −16.89, TP −4.48) → **−14.0 LUFS**, **true peak −1.5 dBFS**, LRA 3.1
- **Metadata**: title, artist "AUDIRA (Agus Dwi R.)", copyright © 2026, comment `AUDIRA-cara-kerja-vaksin-EP33 | audira.my.id`, date 2026-11-23 (dicek ffprobe)
- **qa-video hardOnly**: 3 BLACK = false positive (lihat di atas), 4 potongan terdeteksi (14.4, 26.4, 42.6, 57.05 s), tidak ada KEDIP/LONCAT
- **Skor final juri buta**: 3.83 LOLOS (lighting 4, material 4, depth 4, composition 3, motion 5, readability 3). Kelemahan: frame mRNA (38 s) banyak ruang kosong; label "AKU KENAL KAMU" (62 s) terpotong dan tertutup virus; kisi orang (75 s) padat dengan teks kecil.

## Scheduled review tasks

Upload dikonfirmasi pengguna: Selasa 24 Nov 2026 19:00 WIB (TikTok pertama).

- [ ] `review-cara-kerja-vaksin-24h` — 2026-11-25 19:00 WIB (+24 jam)
- [ ] `review-cara-kerja-vaksin-72h` — 2026-11-27 19:00 WIB (+72 jam)
- [ ] `review-cara-kerja-vaksin-7d` — 2026-12-01 19:00 WIB (+7 hari)

Task hanya berjalan saat aplikasi Claude terbuka. Bila tertutup, task jalan saat aplikasi dibuka lagi.

## Pasca-tayang (24j / 72j / 7h)

| Waktu | Views | Avg durasi/retensi | Hook bertahan? | Komentar |
|-------|-------|--------------------|----------------|----------|
| 24j | | | | |
| 72j | | | | |
| 7h | | | | |
