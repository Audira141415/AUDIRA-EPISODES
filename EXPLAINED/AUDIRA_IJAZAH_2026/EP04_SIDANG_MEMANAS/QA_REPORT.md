# QA Report: EP04_SIDANG_MEMANAS

Metrik mentah ada di `PROJECT/qc/metrics.json`.

| Cek | Target | Hasil |
|---|---|---|
| Resolusi | 1080 x 1920 | 1080 x 1920 |
| Frame rate | 30 atau 60 fps | 30/1 |
| Durasi | Sekitar 90 detik | 92.9 detik |
| Error decode | 0 | 0 |
| Freeze lebih dari 2,5 detik | 0 | 0 |
| Frame hitam | 0 | 0 |
| Loudness | -14 LUFS | -14.0 LUFS |
| Puncak sejati | Di bawah -1 dBTP | -1.9 dBTP |
| Suara | Sekitar -16 LUFS | -16.1 LUFS |
| Musik | Sekitar 15 dB di bawah suara | -31.2 LUFS |
| Kata caption berisi suara | Tinggi | 100.0 persen |
| Selisih awal kata terbesar | Di bawah 0,2 detik | 0.088 detik |

Diperiksa dari frame MP4: font, area aman, dan warna. Caption: `audira_validate_social_captions` menghasilkan `ok: true`.

Belum diperiksa: pelafalan dan mix belum didengar manusia, video belum ditonton utuh, dan perkembangan setelah 5 November 2026 sekitar 19.00 WIB, termasuk isi sesi Dokter Tifa.
