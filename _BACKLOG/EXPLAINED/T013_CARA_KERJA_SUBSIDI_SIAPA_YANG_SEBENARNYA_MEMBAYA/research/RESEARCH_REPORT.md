# Research Report — Cara Kerja Subsidi: Siapa yang Sebenarnya Membayar Selisih Harga

> Riset backlog 2026-11-26. Channel @AudiraExplained (rule 15: netral politik, tanpa wajah/logo nyata).

## Sumber utama

- **Kementerian Keuangan**: berita resmi 30 Sep 2025 berisi selisih harga keekonomian per liter (#1), siaran pers KSSK 3 Nov 2026 berisi realisasi subsidi dan kompensasi s.d. triwulan III 2026 (#2), siaran pers APBN KiTa 13 Nov 2026 berisi struktur pendapatan negara (#3). Situs kemenkeu.go.id berbasis JS; teks dibaca lewat API resmi `media.kemenkeu.go.id` dan PDF resminya.
- **JDIH BPK RI (peraturan.bpk.go.id)**: UU 17/2025 APBN 2026 (#4), Perpres 191/2014 (#5), Perpres 117/2021 (#6), PMK 73/2025 (#7). PDF UU dan kedua Perpres diunduh dan pasal terkait dibaca.
- Pendukung MEDIUM (ANTARA): realisasi s.d. Oktober 2026 (#8), rincian harga keekonomian LPG/listrik 2025 (#9), skema bayar kompensasi 70% bulanan (#10), angka keekonomian di struk Pertalite (#11).
- Tidak berhasil: halaman ESDM (filter berita tidak bekerja lewat curl) dan BPS tidak dipakai; tidak ada angka on-screen yang bergantung pada keduanya.

## Fakta terverifikasi

1. Harga keekonomian = nilai BBM bila dihitung dari harga pasar dan biaya penyediaan (#11); pemerintah menanggung selisihnya dengan harga jual lewat subsidi dan kompensasi (#1).
2. Per Agustus 2025: Solar Rp6.800 vs keekonomian Rp11.950 (APBN menanggung Rp5.150/liter, ≈43%) (#1).
3. Per Agustus 2025: Pertalite Rp10.000 vs keekonomian Rp11.700 (Rp1.700/liter, 15%), ditanggung **lewat kompensasi** (#1).
4. Per Agustus 2025: LPG 3 kg disubsidi 70% dari harga keekonomian (#1); rinciannya Rp42.750 vs Rp12.750 per tabung (#9).
5. Secara hukum, Solar dan minyak tanah = Jenis BBM Tertentu yang diberi subsidi; Solar diberi subsidi tetap per liter (#5).
6. Pertalite (sebagian volumenya) = Jenis BBM Khusus Penugasan, "tidak diberikan subsidi"; selisihnya dibayar sebagai kompensasi setelah volume diverifikasi dan diperiksa auditor, sesuai kemampuan keuangan negara (#5, #6).
7. Kompensasi juga berlaku untuk tarif tenaga listrik; tata caranya kini diatur PMK 73/2025 termasuk pembayaran bulanan dan koreksinya (#7, #10).
8. APBN 2026 merencanakan Program Pengelolaan Subsidi ≈Rp318,9 T, dapat disesuaikan dengan realisasi (#4).
9. Realisasi s.d. akhir triwulan III 2026: subsidi Rp222,5 T, kompensasi Rp154,5 T (#2); s.d. Oktober 2026 total Rp415,8 T (#8).
10. Harga Pertalite Rp10.000 dan Solar Rp6.800 dipertahankan di 2026 meski harga keekonomian naik sejak Maret 2026 (#8).
11. Pendapatan negara s.d. Oktober 2026 Rp2.618,0 T, pajak Rp1.796,8 T (lebih dari dua pertiga); APBN defisit 1,47% PDB, ditutup pembiayaan (#3, #4, #2).

## Perselisihan / Kontroversi

- **Koreksi hook TOPIC.md**: "Harga di SPBU bukan harga asli" terlalu umum. Yang dijual di bawah harga keekonomian hanya BBM subsidi/penugasan (Solar, Pertalite); BBM umum seperti Pertamax tidak disubsidi (#5, #11). Selain itu, untuk Pertalite yang dibayar negara secara hukum adalah **kompensasi**, bukan subsidi, dan dibayar belakangan ke badan usaha setelah dihitung dan diaudit, bukan "saat kamu mengisi" (#6, #7). Naskah memakai Solar sebagai contoh hook.
- **Angka per liter basi**: angka resmi Kemenkeu yang ditemukan adalah per Agustus 2025. Harga keekonomian 2026 naik (struk Pertalite Juni 2026 mencantumkan Rp18.040, #11, MEDIUM), tetapi angka resmi Kemenkeu 2026 per liter belum ditemukan. HUD wajib menulis "per Agustus 2025"; cek ulang sebelum produksi.
- **Subsidi vs kompensasi dalam angka total**: Rp222,5 T subsidi (#2) mencakup subsidi nonenergi (pupuk, bunga KUR). VO menyebut "semua subsidi"; HUD wajib label "energi + nonenergi".
- **"Dibayar dari pajak"**: uang APBN bersifat gabungan (pajak, cukai, PNBP, pembiayaan). Naskah hanya mengatakan kas negara "sebagian besar diisi pajak" dan kekurangan ditutup pembiayaan, termasuk utang; tidak menyatakan subsidi dibiayai utang secara khusus.
- **Netralitas (rule 15)**: debat tepat sasaran, kenaikan harga, dan pergantian Menkeu sengaja tidak dinarasikan. Nama pejabat dan partai tidak disebut di VO maupun HUD.
- **Hak cipta ANTARA**: situs mencantumkan larangan crawling untuk AI; artikel hanya dibaca untuk verifikasi dan diparafrasekan, tidak dikutip panjang.

## Angka kunci untuk HUD

| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| Rp11.950 vs Rp6.800 | Solar: keekonomian vs harga jual, per Agustus 2025 | 1 |
| ±43% | Porsi Solar yang ditanggung APBN, per Agustus 2025 | 1 |
| Rp1.700/liter | Kompensasi Pertalite, per Agustus 2025 (Rp11.700 vs Rp10.000) | 1 |
| 70% | Porsi subsidi LPG 3 kg, per Agustus 2025 | 1, 9 |
| JBT vs JBKP | Solar = subsidi; Pertalite = kompensasi | 5, 6 |
| Rp222,5 T | Realisasi subsidi (energi + nonenergi) s.d. akhir triwulan III 2026 | 2 |
| Rp154,5 T | Realisasi kompensasi s.d. akhir triwulan III 2026 | 2 |
| Rp1.796,8 T / Rp2.618,0 T | Pajak / pendapatan negara s.d. Oktober 2026 | 3 |
| ≈Rp318,9 T | Rencana Program Pengelolaan Subsidi APBN 2026 (opsional) | 4 |

## Poin kunci

- Selisih harga ditanggung APBN lewat dua jalur: **subsidi** (Solar, minyak tanah, LPG 3 kg, listrik golongan tertentu) dan **kompensasi** (Pertalite, tarif listrik tertentu).
- Subsidi dibayar rutin ke badan usaha penyalur; kompensasi ditalangi badan usaha dulu, lalu dihitung, diaudit, dan dibayar negara.
- Besarnya bergantung pada harga minyak dunia, kurs, dan volume konsumsi, sehingga realisasi bisa melampaui rencana.
- Uang APBN sebagian besar dari pajak; bila pendapatan kurang dari belanja, defisit ditutup pembiayaan.
- Visual cocok 2D infografis (alur uang, grafik batang selisih harga); rule 15: pompa, tabung, dan meteran listrik generik tanpa logo.
