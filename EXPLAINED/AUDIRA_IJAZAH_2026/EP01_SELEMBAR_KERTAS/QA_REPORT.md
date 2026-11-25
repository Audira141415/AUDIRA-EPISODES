# QA Report: Selembar Kertas

Metrik mentah ada di `PROJECT/qc/metrics.json`.

## Terukur dari FINAL_VIDEO.mp4

| Cek | Target | Hasil |
|---|---|---|
| Resolusi | 1080 x 1920 | 1080 x 1920 |
| Frame rate | 30 atau 60 fps | 30 fps |
| Durasi | Sekitar 90 detik | 91,4 detik |
| Error decode | 0 | 0 |
| Freeze lebih dari 2,5 detik | 0 | 0 |
| Frame hitam | 0 | 0 |
| Loudness | -14 LUFS | -14,0 LUFS |
| Puncak sejati | Di bawah -1 dBTP | -1,9 dBTP |
| Suara | Sekitar -16 LUFS | -16,1 LUFS |
| Musik | Sekitar 15 dB di bawah suara | -33,0 LUFS |
| Caption berisi suara | Tinggi | 100 persen |
| Selisih awal kata terbesar | Di bawah 0,2 detik | 0,101 detik |
| Kecepatan bicara | 135 sampai 150 kata per menit | Sekitar 151 |

## Diperiksa dari frame MP4

- Font tampil benar.
- Panel dan caption di dalam area aman, caption berakhir di 1540 px.
- Cacat yang sudah diperbaiki: koma terpisah pada caption tahun 2025, dan dokumen pembanding yang muncul terlalu awal.

## Cacat kecil yang dibiarkan

- Di adegan Roy Suryo, sebagian lembar ilustrasi terlihat di belakang panel.
- Kecepatan bicara lewat 1 kata per menit dari batas atas. Diperlambat lagi berarti durasi makin jauh dari 90 detik.

## Belum diperiksa

- Pelafalan dan mix belum didengar manusia. Saya tidak bisa mendengar audio. Yang perlu didengar: "Taims Nyu Romen", "Monotaip", "Fesbuk", dan "labfor".
- Video belum diputar utuh. Pengecekan visual memakai sampel frame.
- Perkembangan setelah sekitar 13.50 WIB, 5 November 2026, termasuk sesi Dokter Tifa.
- Dua judul berita soal tim hukum Roy Suryo dan teguran hakim baru terbaca judulnya.

## Caption

`audira_validate_social_captions` menghasilkan `ok: true`.
