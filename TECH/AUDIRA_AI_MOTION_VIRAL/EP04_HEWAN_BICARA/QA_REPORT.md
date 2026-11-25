# EP 04: HEWAN AI BERBICARA DAN BERAKTING SEPERTI MANUSIA

Seri AUDIRA, AI MOTION TANPA RIBET. Created by Agus Dwi R. Riset 5 November 2026. Alat: Character AI + TTS + Lip-Sync.

Judul di brief: Cara Membuat Hewan AI Berbicara dan Berakting Seperti Manusia!

**Status QC: LULUS UJI TERUKUR, tinjauan telinga manusia belum dilakukan**

| Pemeriksaan | Hasil | Bukti |
| --- | --- | --- |
| Fakta alat | Lulus dengan catatan | Halaman Hedra tidak menyebut hewan secara khusus, jadi naskah tidak mengklaim hasil pada hewan untuk Hedra. Yang menyebut karakter bukan manusia hanya panduan Act-Two. Saran wajah menghadap depan dan cahaya rata adalah praktik umum AUDIRA. Mulut kucing di video digerakkan kode dari waktu kata, dan video mengatakannya. |
| Sumber dan tanggal riset | Lulus | 3 sumber di SOURCE_REGISTER.md |
| Label visual | Lulus | Label ilustrasi tampil sepanjang film, tanpa UI tiruan produk lain |
| Naskah sesuai durasi | Lulus | 197 kata terucap, 79.123 detik |
| Voice-over | Lulus | -16.7 LUFS |
| Loudness -14 LUFS, TP < -1 dBFS | Lulus | -14.0 LUFS, -1.8 dBTP |
| Subtitle sinkron | Lulus | 99.5% kata bersuara |
| Safe zone | Lulus | Panel mulai 186 px, takarir berakhir 1540 px. Diperiksa dari lembar frame |
| Dekode dan frame hitam | Lulus | 0 error dekode, 0 segmen hitam, hold: ['86.633333'] |
| Outro resmi | Lulus dengan catatan | `audira-outro-card.svg` bersama masih logo lama dan bertulis Created by AUDIRA, jadi kartu dibangun dari kit logo Monolit dengan Created by Agus Dwi R. |
| Format | Lulus | 1080x1920, 30/1, 2464 frame, 82.20 detik |
| FINAL_VIDEO.mp4 | Lulus | Ada |

Pemeriksaan pelafalan otomatis: transkrip faster-whisper base ada di `PROJECT/qc/stt.txt`. Semua kalimat terdeteksi, tetapi transkrip model kecil ini sendiri banyak salah eja, jadi ini bukan pengganti telinga manusia.
