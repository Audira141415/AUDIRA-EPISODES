# QA Report: EP02 IHSG

Diuji pada `FINAL_VIDEO.mp4`, 4 November 2026. Angka mentah: `PROJECT/qc/metrics.json`.

## File

| Item | Target | Hasil | Status |
|---|---|---|---|
| Resolusi | 1080x1920 | 1080x1920 | Lulus |
| Frame rate | 30 fps | 30/1, 2.658 frame | Lulus |
| Durasi | 60-90 detik | 88,6 detik | Lulus |
| Codec | H.264 + AAC | h264 yuv420p + AAC 48 kHz | Lulus |
| Error decode | 0 | 0 | Lulus |
| Freeze lebih dari 2,5 detik | 0 | 0 | Lulus |
| Segmen hitam | 0 | 0 | Lulus |

## Audio

| Item | Target | Hasil | Status |
|---|---|---|---|
| Loudness | -14 LUFS | -14,0 LUFS | Lulus |
| True peak | di bawah -1 dBTP | -1,8 dBTP | Lulus |
| Clipping | tidak ada | puncak di bawah 0 dBFS | Lulus |
| Musik terhadap narasi | jauh di bawah | stem -31,6 LUFS, narasi -16,4 LUFS | Lulus |
| Kecepatan narasi | 135-150 kata/menit | 137 | Lulus |

**Belum diuji:** pendengaran manusia di speaker ponsel, dan pengucapan fonetik (IHSG, MSCI, OJK, emerging, standalone, review). Whisper lokal tidak bisa dipakai karena model yang tersimpan rusak dan C: penuh. **Dengarkan sebelum tayang.**

## Subtitle

| Item | Hasil | Status |
|---|---|---|
| Sumber waktu | Timestamp Cartesia, disesuaikan dengan tempo | - |
| Kata caption yang bertepatan dengan suara | 99,5% | Lulus |
| Selisih awal kata terbesar | 0,071 detik | Lulus |
| SRT | 66 cue | Lulus |
| Karaoke | Kata aktif diberi blok merah | Lulus |

Angka ini mengukur keberadaan suara, bukan apakah kata yang tepat sedang diucapkan.

## Visual (frame dari MP4)

| Item | Hasil | Status |
|---|---|---|
| Safe zone | Konten y=178-1290, caption y=1296-1540 | Lulus |
| Frame 0 berisi hook | Foto BEI, TERJUN BEBAS, -3,78% | Lulus |
| Font | Playfair Display, Oswald, IBM Plex Mono, Montserrat tampil di MP4 | Lulus |
| Watermark statis | Tidak ada, hanya label kecil seri | Lulus |
| Outro | Logo Monolit + Created by Agus Dwi R., 2,75 detik | Lulus |
| `hyperframes check` | 0 error | Lulus |

## Akurasi dan aturan brief

| Item | Status |
|---|---|
| 3,78%, 4.904,29, 192,54, 2,62%, 4.963,06, 624/57/37, 11 sektor | Cocok dengan sumber |
| Angka saling konsisten | Lulus, hitung ulang di RESEARCH_REPORT |
| MSCI bukan satu-satunya penyebab | Lulus, disebut eksplisit |
| Data, sentimen, analisis terpisah | Lulus |
| Tidak ada rekomendasi beli atau jual | Lulus, stempel di layar |
| Dinding titik tepat 718 | Lulus |
| Tinjauan editor manusia atau penasihat investasi | **Belum dilakukan** |

## Cacat yang ditemukan dan diperbaiki

1. Grafik terlalu lebar sehingga sulit dibaca. Dibangun ulang dalam satu bingkai.
2. Dinding titik menimpa bilah judul. Dibuat lebih rapat.
3. Label 5.126 menabrak JEBOL. Digeser.
4. -46,5% menimpa label 4.904. Dipindah.
5. Hook menimpa logo BEI. Teks dikecilkan.
6. Pecahan garis 5.000 menggumpal. Diperkecil dan disebar.

## Keterbatasan diterima

1. **Tidak sepenuhnya "Cinematic Photorealistic".** Ini laporan grafis di atas dua foto asli. Tidak ada video atau gambar AI, karena endpoint gambar 9Router meminta API key.
2. Foto BEI hanya 794x396 piksel, diperbesar 3,1 kali, jadi agak lembut.
3. "Investor memantau portofolio" dari brief diganti kartu jual bersih asing. Tidak ada adegan orang.
4. Bilangan indeks yang berjalan antara titik sumber adalah interpolasi tampilan. Label "garis disederhanakan" ada di layar.
5. Peringatan `line_unread` pada daftar sumber di outro, dan `composition_file_too_large`, `timeline_track_too_dense`. Diterima.
6. Tanggal review MSCI bersumber dari broker, belum dari msci.com.
7. Data pasar cepat basi. Cek ulang sebelum tayang.
