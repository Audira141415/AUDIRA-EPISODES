# Research Report — Cara Kerja Deepfake dan Kenapa Semakin Sulit Dideteksi

Tanggal riset: 2026-11-25. Metode: curl + API arXiv/Wikipedia; teks penuh paper DFDC dibaca via pdftotext.

## Sumber utama
Paper primer arXiv (#1–6), peringatan resmi FBI IC3 (#7), Wikipedia sebagai penunjuk sejarah istilah (#8), Europol (#9, konteks saja).

## Fakta terverifikasi
1. GAN (2014): generator dan diskriminator dilatih sebagai permainan minimax; generator dilatih memaksimalkan peluang diskriminator salah (#1).
2. StyleGAN (2018) memisahkan atribut tingkat tinggi seperti pose dan identitas wajah dari variasi stokastik, sehingga kontrol sintesis lebih halus (#2).
3. Model difusi (DDPM, 2020) menghasilkan gambar berkualitas tinggi; 256x256 LSUN setara ProgressiveGAN (#3). Frasa "noise dibersihkan bertahap" adalah ringkasan konsep difusi.
4. FaceForensics++ (2019): detektor data-driven dengan pengetahuan domain mengungguli pengamat manusia, bahkan pada kompresi kuat (#4).
5. DFDC: 100.000+ klip dari 3.426 aktor bayaran, 2.114 tim; model terbaik pada video asli ROC-AUC 0,734; penulis menyebut deteksi "extremely difficult and still an unsolved problem" (#5).
6. Deepfake-Eval-2024: AUC detektor sumber terbuka turun 50% (video), 48% (audio), 45% (gambar) dibanding benchmark lama; detektor komersial lebih baik tapi belum setara analis forensik manusia (#6).
7. FBI (Juni 2023): foto/video dimanipulasi untuk konten eksplisit, pelecehan, sextortion; korban termasuk anak di bawah umur (#7).
8. Istilah deepfake berasal dari akun Reddit "deepfakes", akhir 2017 (#8).

## Perselisihan / Kontroversi
- Judul "semakin sulit dideteksi": didukung #5 dan #6, tapi bukan berarti deteksi mustahil. #4 menunjukkan detektor unggul atas manusia pada dataset terkontrol; masalahnya generalisasi ke data baru. Naskah menyajikan nuansa ini.
- Hook "hampir sempurna" bersifat subjektif; naskah tidak mengklaim video apa pun tak terbedakan.
- Angka DFDC 0,73 adalah ROC-AUC pada subset video asli (in-the-wild) dari private test set, bukan akurasi umum. Jangan disebut "akurasi 73%".
- Klaim "96% deepfake adalah pornografi" (Deeptrace 2019) hanya dari sumber sekunder dan usang; tidak dipakai.
- Sensitif: jangan tampilkan korban atau wajah nyata (rule channel TECH). Pakai siluet/maskot abstrak dan UI tanpa logo. Nama Reddit hanya disebut di VO, tanpa logo di layar.

## Angka kunci untuk HUD
| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| 2017 | Istilah deepfake lahir | 8 |
| 2014 | GAN diusulkan | 1 |
| 2018 | StyleGAN | 2 |
| 2020 | Model difusi (DDPM); tantangan DFDC | 3, 5 |
| 100.000 klip / 3.426 aktor / 2.114 tim | Dataset dan peserta DFDC | 5 |
| 0,73 (ROC-AUC) | Model terbaik pada video asli in-the-wild | 5 |
| 50% | Penurunan AUC detektor video di Deepfake-Eval-2024 (data 2024) | 6 |
| Juni 2023 | Peringatan FBI | 7 |

## Poin kunci
- Dua sisi balapan: generator makin halus (GAN, StyleGAN, difusi), detektor sulit generalisasi ke teknik baru.
- Detektor bagus di data yang dikenal, jatuh di data liar (2024).
- Pesan akhir: verifikasi sumber, jangan andalkan satu video. Angka per tanggal publikasi studi masing-masing; belum dicek terhadap benchmark yang lebih baru per 2026-11-25.
