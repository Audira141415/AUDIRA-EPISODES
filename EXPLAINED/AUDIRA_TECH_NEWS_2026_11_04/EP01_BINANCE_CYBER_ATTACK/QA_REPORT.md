# QA Report: EP01 Binance

Diuji pada `FINAL_VIDEO.mp4`, 4 November 2026. Angka mentah: `PROJECT/qc/metrics.json`.

## File

| Item | Target | Hasil | Status |
|---|---|---|---|
| Resolusi | 1080x1920 | 1080x1920 | Lulus |
| Frame rate | 30 fps | 30/1, 2.612 frame | Lulus |
| Durasi | 60-90 detik | 87,1 detik | Lulus |
| Codec | H.264 + AAC | h264 yuv420p + AAC 48 kHz | Lulus |
| Error decode | 0 | 0 | Lulus |
| Freeze lebih dari 2,5 detik | 0 | 0 | Lulus |
| Segmen hitam | 0 | 0 | Lulus |

## Audio

| Item | Target | Hasil | Status |
|---|---|---|---|
| Loudness | -14 LUFS | -14,0 LUFS | Lulus |
| True peak | di bawah -1 dBTP | -1,7 dBTP | Lulus |
| Clipping | tidak ada | puncak di bawah 0 dBFS | Lulus |
| Musik terhadap narasi | jauh di bawah | stem -29,4 LUFS, narasi -16,5 LUFS | Lulus |
| Kecepatan narasi | 135-150 kata/menit | 143 | Lulus |

**Belum diuji:** pendengaran manusia di speaker ponsel, dan pengucapan fonetik (Binance, TraderTraitor, Ethereum, ETH, stablecoin, DeFi, instant swap, Elliptic, TRM Labs). Whisper lokal tidak bisa dipakai karena model yang tersimpan rusak dan C: penuh. **Dengarkan sebelum tayang, terutama "ETH" dan "instant swap".**

## Subtitle

| Item | Hasil | Status |
|---|---|---|
| Sumber waktu | Timestamp Cartesia, disesuaikan dengan tempo | - |
| Kata caption yang bertepatan dengan suara | 100% | Lulus |
| Selisih awal kata terbesar | 0,113 detik | Lulus |
| SRT | 67 cue | Lulus |
| Karaoke | Kata aktif cyan dengan micro-bounce | Lulus |

Angka ini mengukur keberadaan suara, bukan apakah kata yang tepat sedang diucapkan.

## Visual (frame dari MP4)

| Item | Hasil | Status |
|---|---|---|
| Safe zone | Konten y=190-1290, caption y=1296-1540 | Lulus |
| Frame 0 berisi hook | US$6,3 MILIAR tampil | Lulus |
| Font | Archivo Black, JetBrains Mono, Inter tampil di MP4 | Lulus |
| Watermark statis | Tidak ada, hanya label kecil seri | Lulus |
| Outro | Logo Monolit + Created by Agus Dwi R. | Lulus |
| `hyperframes check` | 0 error | Lulus |

## Akurasi dan aturan brief

| Item | Status |
|---|---|
| Metode serangan tidak dinyatakan sebagai fakta | Lulus, stempel BELUM FINAL |
| FBI, Binance, Korea Utara dipisah dan diberi atribusi | Lulus |
| Bantahan Korea Utara ditayangkan | Lulus |
| Klaim 95% diberi label pernyataan Binance | Lulus |
| Grafik 3D diberi label ilustrasi | Lulus |
| Logo FBI dan Binance tidak dipakai | Lulus, hanya teks |
| Teks asli rilis FBI dibaca | **Belum**, HTTP 403, dibaca lewat kutipan media |
| Tinjauan editor manusia atau penasihat hukum | **Belum dilakukan** |

## Cacat yang ditemukan dan diperbaiki

1. Lampu plafon menutup hook. Dibuat lebih tipis dan redup.
2. Rak server terlalu gelap. Emisi dan lampu dinaikkan.
3. Tugu 95% terpotong bingkai. Kamera dimundurkan.
4. Angka US$2,85 M dan US$3,18 M patah baris dan ambigu. Ditulis "MILIAR".
5. Angka 95% biru di atas tugu biru. Diganti putih, lampu tugu diturunkan.
6. Teks merah di atas jejaring merah. Diberi blok merah dengan teks putih.
7. Balok es menumpuk catatan sumber. Keluar lebih awal, catatan diberi latar.
8. Teks keterangan 26 px. Dinaikkan ke 28 px.

## Keterbatasan diterima

1. **Tidak sepenuhnya "Cinematic Photorealistic".** Ini 3D prosedural Three.js, bukan foto. Tidak ada gambar AI, karena endpoint gambar 9Router meminta API key.
2. "FBI melakukan investigasi blockchain" ditampilkan sebagai berkas pernyataan dan jejaring, bukan adegan orang.
3. Posisi 12.000 titik adalah ilustrasi. Jumlahnya sesuai laporan Elliptic. Label ada di layar.
4. Peringatan kontras untuk MILIAR merah (teks besar dengan glow). Terbaca di frame MP4, diterima.
5. Peringatan `line_unread` untuk catatan yang tayang singkat, dan `composition_file_too_large`, `timeline_track_too_dense`. Diterima, isi catatan juga ada di narasi atau deskripsi.
6. Kasus masih bergerak. Cek ulang angka Elliptic dan Binance sebelum tayang.
