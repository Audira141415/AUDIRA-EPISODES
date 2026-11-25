# EP 02: KARAKTER AI BERGERAK MENGIKUTI VIDEO KITA

Seri AUDIRA, AI MOTION TANPA RIBET. Created by Agus Dwi R. Riset 5 November 2026. Alat: Character AI + Motion Transfer.

Judul di brief: Cara Membuat Karakter AI Bergerak Mengikuti Video Kita!

**Status QC: LULUS UJI TERUKUR, tinjauan telinga manusia belum dilakukan**

| Pemeriksaan | Hasil | Bukti |
| --- | --- | --- |
| Fakta alat | Lulus dengan catatan | Panduan Motion Control bertanggal Juli 2026 untuk Video 2.6, sedangkan halaman fitur sudah menyebut Video 3.0. Klaim Kling soal kualitas tidak diulang. Butuh GPU kuat adalah ringkasan AUDIRA, karena README Wan mencontohkan kartu kelas 4090 untuk model 5B yang lebih ringan. Batas izin soal tubuh dan wajah orang lain adalah saran editorial AUDIRA, bukan kutipan hukum. |
| Sumber dan tanggal riset | Lulus | 4 sumber di SOURCE_REGISTER.md |
| Label visual | Lulus | Label ilustrasi tampil sepanjang film, tanpa UI tiruan produk lain |
| Naskah sesuai durasi | Lulus | 194 kata terucap, 83.891 detik |
| Voice-over | Lulus | -16.5 LUFS |
| Loudness -14 LUFS, TP < -1 dBFS | Lulus | -14.0 LUFS, -1.9 dBTP |
| Subtitle sinkron | Lulus | 99.5% kata bersuara |
| Safe zone | Lulus | Panel mulai 186 px, takarir berakhir 1540 px. Diperiksa dari lembar frame |
| Dekode dan frame hitam | Lulus | 0 error dekode, 0 segmen hitam, hold: [] |
| Outro resmi | Lulus dengan catatan | `audira-outro-card.svg` bersama masih logo lama dan bertulis Created by AUDIRA, jadi kartu dibangun dari kit logo Monolit dengan Created by Agus Dwi R. |
| Format | Lulus | 1080x1920, 30/1, 2607 frame, 87.00 detik |
| FINAL_VIDEO.mp4 | Lulus | Ada |

Pemeriksaan pelafalan otomatis: transkrip faster-whisper base ada di `PROJECT/qc/stt.txt`. Semua kalimat terdeteksi, tetapi transkrip model kecil ini sendiri banyak salah eja, jadi ini bukan pengganti telinga manusia.
