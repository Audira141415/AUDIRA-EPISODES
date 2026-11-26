# Research Report — Kamera Smartphone 2025: Megapixel vs Computational Photography

## Sumber utama

1. **Wikipedia: Camera phone** (#1) — sejarah lengkap megapixel race dari Kyocera VP-210 (1999) hingga sensor 200MP, termasuk penjelasan pixel binning dan milestone kamera ponsel.
2. **Wikipedia: ISOCELL** (#2) — spesifikasi teknis lengkap semua sensor Samsung: HP1/HP2/HP3 (200MP), HMX/HM1/HM3 (108MP), GN1/GNK (50MP). Termasuk teknologi Tetra2pixel, Smart-ISO Pro, dan daftar ponsel yang memakai tiap sensor.
3. **Wikipedia: Google Pixel 6** (#3) — spesifikasi kamera 50MP, chip Tensor, dan fitur computational photography (HDR+, Night Sight, Magic Eraser).
4. **Wikipedia: iPhone 15 Pro** (#4) — spesifikasi kamera 48MP, A17 Pro (3 nm, Neural Engine 35 TOPS), Deep Fusion, Photonic Engine, Smart HDR 5.
5. **Wikipedia: Samsung Galaxy S25** (#5) — konfirmasi S25 Ultra pakai sensor 200MP f/1.7, Snapdragon 8 Elite 3 nm.
6. **Wikipedia: Computational photography** (#6) — definisi akademik, sejarah konsep dari Steve Mann dan Shree Nayar.

## Fakta terverifikasi

1. Nokia 808 PureView (2012): sensor 41MP di ponsel, pixel oversampling untuk lossless zoom (#1)
2. Samsung ISOCELL HMX (12 Agustus 2019): sensor 108MP pertama, dikembangkan bersama Xiaomi, pixel 0.8 um (#2)
3. Samsung ISOCELL HP1 (2 September 2021): sensor 200MP pertama, 16384x12288 piksel, pixel 0.64 um, format optik 1/1.22" (#2)
4. Samsung ISOCELL HP2 (17 Januari 2023): 200MP, pixel 0.6 um, 1/1.3", dipakai Galaxy S23 Ultra, S24 Ultra, S25 Ultra (#2)
5. Tetra2pixel: teknologi pixel binning 4x4 (16-to-1), mengubah 200MP jadi 12.5MP di low-light (#2)
6. Samsung ISOCELL GN1 (19 Mei 2020): 50MP, pixel 1.2 um, format 1/1.31", dipakai Google Pixel 6 dan Pixel 7 (#2)
7. Google Pixel 6 (28 Oktober 2021): kamera 50MP f/1.85, chip Tensor custom, fitur HDR+, Night Sight, Magic Eraser, Real Tone (#3)
8. iPhone 15 Pro (22 September 2023): 48MP f/1.78, sensor 1/1.28", A17 Pro fabrikasi 3 nm, Neural Engine 16-core 35 TOPS (#4)
9. Deep Fusion (Apple): menganalisis tiap pixel dari banyak eksposur sebelum menyimpan gambar final (#4)
10. Photonic Engine (Apple): pipeline pemrosesan gambar yang bekerja bersama Deep Fusion (#4)
11. Galaxy S25 Ultra (2025): 200MP f/1.7, 0.6 um, Snapdragon 8 Elite 3 nm, pixel binning aktif (#5)
12. Tahun 2003: penjualan kamera ponsel melampaui kamera standalone di seluruh dunia (#1)
13. Tahun 2006: separuh ponsel dunia sudah punya kamera built-in (#1)

## Perselisihan / Kontroversi

- **Megapixel vs kualitas**: industri terbagi dua. Samsung/Xiaomi mengejar resolusi tinggi (200MP) dengan pixel binning sebagai solusi low-light. Google/Apple memilih sensor lebih rendah (48-50MP) dengan pixel lebih besar dan komputasi lebih canggih. Keduanya menghasilkan foto berkualitas tinggi di 2025 — bukti bahwa pendekatan hybrid (hardware + software) yang menang.
- **Hook "200MP tidak berarti foto terbaik"**: akurat untuk mayoritas kondisi. Sensor 200MP dengan binning output 12.5MP; kualitas akhir sangat tergantung ISP dan algoritma, bukan resolusi mentah. Namun di cahaya terang dan crop/zoom, 200MP tetap unggul. Hook dipertahankan.

## Angka kunci untuk HUD

| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| 200MP | Resolusi sensor Samsung ISOCELL HP1/HP2 | #2 |
| 12.5MP | Hasil pixel binning 16-to-1 dari 200MP | #2 |
| 50MP | Sensor Google Pixel 6 (GN1, 1.2 um) | #2, #3 |
| 48MP | Sensor iPhone 15 Pro (1/1.28") | #4 |
| 0.64 um | Ukuran pixel HP1 (terkecil di 200MP) | #2 |
| 1.2 um | Ukuran pixel GN1 (hampir 2x HP1) | #2 |
| 35 TOPS | Kecepatan Neural Engine A17 Pro | #4 |
| 41MP | Nokia 808 PureView (2012), pionir | #1 |
| 108MP | Samsung HMX (2019), bersama Xiaomi | #2 |
| 2012 | Nokia 808 PureView, awal megapixel race ponsel | #1 |
| 2021 | ISOCELL HP1 (200MP) dan Google Pixel 6 (Tensor) | #2, #3 |

## Poin kunci

1. Megapixel race dimulai serius di 2012 (Nokia 41MP), lalu meledak ke 108MP (2019) dan 200MP (2021).
2. Pixel makin kecil (0.64 um di HP1) = tangkap cahaya lebih sedikit per pixel = noise lebih banyak di low-light.
3. Pixel binning (Tetra2pixel 16-to-1) adalah solusi hardware: gabungkan sub-pixel untuk "superpixel" lebih terang.
4. Computational photography (HDR+, Night Sight, Deep Fusion, Photonic Engine) adalah solusi software: olah banyak frame dan data neural untuk rekonstruksi gambar optimal.
5. Google Pixel 6 (50MP) dan iPhone 15 Pro (48MP) membuktikan resolusi rendah + komputasi canggih bisa mengalahkan resolusi tinggi di banyak skenario.
6. Tren 2025: hybrid. Galaxy S25 Ultra pakai 200MP + AI processing. Semua vendor menggabungkan hardware dan software.
7. Angka megapixel di spesifikasi menyesatkan konsumen karena output foto aktual sering di-binning ke 12.5MP atau 50MP.
