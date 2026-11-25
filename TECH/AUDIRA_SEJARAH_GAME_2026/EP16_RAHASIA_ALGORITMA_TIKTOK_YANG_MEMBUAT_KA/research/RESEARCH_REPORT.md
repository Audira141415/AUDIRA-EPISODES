# Riset — Rahasia Algoritma TikTok yang Membuat Kamu Terus Scroll

Tanggal data: 2026-11-25. Channel TECH: tanpa logo perusahaan nyata, tanpa wajah orang nyata di visual.

## Sumber utama
- Newsroom TikTok "How TikTok recommends videos #ForYou" (2020) [#1-3]
- TikTok Transparency Center, "Introduction to the TikTok recommendation system" [#4]
- TikTok Newsroom "Thanks a billion!" 2021 [#5]
- Makalah Monolith (ByteDance, arXiv 2022) [#6]
- DataReportal 2026 (konteks skala) [#7]

## Fakta terverifikasi
1. Feed For You dibentuk dari sinyal interaksi, info video, dan pengaturan perangkat/akun; perangkat/akun berbobot lebih rendah [#1].
2. Indikator kuat (menonton video panjang sampai habis) berbobot lebih besar daripada indikator lemah (negara sama) [#1].
3. Jumlah pengikut dan hit sebelumnya bukan faktor langsung [#2].
4. Pengguna baru memilih kategori minat; tanpa itu mendapat feed populer umum [#3].
5. Feed umumnya tidak menampilkan dua video berturut-turut dengan suara/kreator sama; video "di luar minat" sengaja diselipkan untuk keragaman [#3].
6. Tahapan: seleksi video, prediksi (like, share, komentar, skip, durasi tonton), ranking, cek kemiripan, aturan [#4].
7. Kontrol pengguna: Not Interested, filter kata kunci, refresh For You [#4].
8. TikTok menyebut lebih dari 1 miliar orang datang tiap bulan (2021, masih dipakai di Transparency Center) [#5].
9. Makalah ByteDance menjelaskan sinkronisasi parameter tiap menit pada sistem rekomendasi real-time (produk BytePlus Recommend) [#6].

## Perselisihan / Kontroversi
- KOREKSI HOOK: "1,5 miliar pengguna" tidak ditemukan di sumber primer. TikTok sendiri menyebut "lebih dari 1 miliar" per bulan (2021). DataReportal 2026 mencatat jangkauan iklan 2,33 miliar (usia 18+), definisi berbeda. Naskah memakai "lebih dari satu miliar, versi TikTok" agar aman.
- "Satu algoritma" menyederhanakan: sistem terdiri dari beberapa model ML dan aturan berlapis [#4].
- Makalah Monolith tidak menyatakan TikTok memakainya; hanya BytePlus Recommend. Jangan klaim sebagai mesin TikTok.
- Bobot persis tiap sinyal tidak dipublikasikan. Jangan klaim "bocoran" atau rumus.
- Tuduhan "algoritma adiktif" adalah debat publik (tercantum di Wikipedia), tidak diangkat sebagai fakta di naskah.

## Angka kunci untuk HUD
| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| >1 miliar | Pengguna bulanan versi TikTok (2021) | 5 |
| 2020 | Tahun penjelasan resmi For You | 1 |
| 5 tahap | Seleksi, prediksi, ranking, cek kemiripan, aturan | 4 |
| <16 tahun | Konten akun di bawah 16 tidak direkomendasikan | 4 |
| Per menit | Sinkron parameter (Monolith) | 6 |
| 2,33 miliar | Jangkauan iklan, Okt 2026 (18+) | 7 |

## Poin kunci
- Rahasianya bukan satu rumus: skor prediksi per video per orang.
- Menonton sampai habis adalah suara terkuat; pengikut bukan faktor langsung.
- Ada rem keragaman (cek kemiripan) dan kontrol pengguna.
