# Research Report — Cara Kerja Indeks Kualitas Udara (ISPU & AQI)

> Riset backlog 2026-11-27. Channel @AudiraExplained (rule 15: netral, tanpa wajah/logo nyata).

## Sumber utama

- **JDIH BPK**: PP 22/2021 Berlaku, mencabut PP 41/1999 (#2).
- **US EPA**: AirNow AQI Basics (#3), Technical Assistance Document EPA-454/B-18-007 (#4) — rumus interpolasi linier dan tabel breakpoint.
- **WHO**: fact sheet polusi udara 2024 (#5), WHO Global AQG 2021 (#6).
- **Wikipedia (MEDIUM)**: ISPU Indonesia (#1), IQAir (#7), AQI overview (#8).
- **Regulasi (MEDIUM)**: PermenLHK P.14/2020 (#9) — halaman JDIH KLHK gagal diakses, informasi dari referensi sekunder.

## Fakta terverifikasi

1. Indonesia memakai **ISPU** (Indeks Standar Pencemar Udara), bukan AQI (US EPA). Skala dan kategori berbeda (#1, #2, #8).
2. ISPU awal (KEP-107/1997): 5 pencemar (CO, SO₂, NO₂, O₃, PM10), 5 kategori (#1). PermenLHK P.14/2020 menambahkan PM2.5 sebagai parameter ke-6 (#9 — MEDIUM).
3. PP 41/1999 tentang Pengendalian Pencemaran Udara **sudah dicabut** oleh PP 22/2021. PP 22/2021 Berlaku sejak 2 Feb 2021 (#2).
4. US AQI: 6 kategori, skala 0–500+, berdasarkan 5 pencemar kriteria (ozone, PM, CO, SO₂, NO₂). AQI 100 = batas NAAQS (#3).
5. Rumus AQI & ISPU: interpolasi linier antara breakpoint. Konsentrasi pencemar → lihat tabel breakpoint → hitung indeks. Yang tertinggi = indeks hari itu (#4).
6. Polusi udara ambien: 4,2 juta kematian dini/tahun (2019, WHO) (#5).
7. WHO AQG 2021: PM2.5 ≤ 5 µg/m³ tahunan, ≤ 15 µg/m³ per 24 jam (#6).
8. IQAir bukan lembaga pemerintah. Campuran data stasiun resmi dan sensor berbiaya rendah. Peringkat "kota terpolusi" = metodologi IQAir, bukan data resmi KLHK (#7).

## Perselisihan / Kontroversi

- **Koreksi judul TOPIC.md**: Judul menyebut "AQI" (Air Quality Index), tapi Indonesia memakai **ISPU**, bukan AQI. Judul diusulkan: "Cara Kerja Indeks Kualitas Udara (ISPU)" atau tetap "Indeks Kualitas Udara" tanpa singkatan asing. Naskah menjelaskan bahwa Indonesia punya sistem sendiri (ISPU), berbeda dari AQI AS.
- **Koreksi hook**: "Angka berwarna di aplikasi cuaca itu dihitung dari partikel yang tak terlihat" — **berlebihan**. PM2.5 memang terlalu kecil untuk dilihat satu per satu (diameter 2,5 mikrometer), tapi dalam konsentrasi tinggi tampak jelas sebagai kabut asap (haze/smog). Hook dikoreksi: angka itu dihitung bukan hanya dari partikel, tapi dari beberapa pencemar sekaligus (gas juga), dan bukan semuanya "tak terlihat." Hook baru fokus pada mekanisme: satu angka merangkum banyak pencemar.
- **ISPU 5 kategori vs AQI 6 kategori**: ISPU punya 5 warna (hijau, kuning, oranye, merah, maroon); AQI AS punya 6 (hijau, kuning, oranye, merah, ungu, maroon). Jangan campur keduanya. Naskah membedakan keduanya.
- **IQAir "Jakarta kota terpolusi"**: klaim ini dari peringkat IQAir (World Air Quality Report), bukan data resmi KLHK. IQAir memakai campuran sensor resmi dan sensor berbiaya rendah, lalu menghitung dengan skala AQI AS, bukan ISPU. Naskah menyajikan dengan label: "menurut platform pemantau kualitas udara swasta."
- **PermenLHK P.14/2020**: tidak berhasil diverifikasi langsung (halaman JDIH KLHK gagal diakses). Informasi bahwa PM2.5 ditambahkan sebagai parameter ISPU ke-6 ada di berbagai sumber sekunder, tapi tidak dari sumber primer yang berhasil dibuka. Diberi level MEDIUM, perlu dicek ulang sebelum produksi.
- **PP 22/2021 masih berlaku**: terkonfirmasi (JDIH BPK: legislationLegalForce "InForce"). PP 41/1999 dicabut oleh PP 22/2021. Baku mutu udara ambien yang dulu di PP 41/1999 kini diatur dalam PP 22/2021 Bagian Kedua tentang Perlindungan dan Pengelolaan Mutu Udara, namun pasal spesifik tentang ISPU (Pasal 29–30 yang disebut di dugaan) tidak berhasil diverifikasi karena teks PP tidak terbuka (hanya metadata).

## Angka kunci untuk HUD

| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| 5 kategori ISPU | Baik, Sedang, Tidak Sehat, Sangat Tidak Sehat, Berbahaya | 1 |
| 6 kategori AQI AS | Good, Moderate, USG, Unhealthy, Very Unhealthy, Hazardous | 3 |
| 6 pencemar ISPU | CO, SO₂, NO₂, O₃, PM10, PM2.5 (sejak 2020) | 1, 9 |
| 2,5 µm | Diameter PM2.5 — ±30× lebih kecil dari rambut | 5 |
| 4,2 juta kematian/tahun | Polusi udara ambien, 2019, WHO | 5 |
| 5 µg/m³ | WHO AQG 2021: batas tahunan PM2.5 | 6 |
| AQI 100 = batas NAAQS | Ambang standar nasional AS | 3 |
| PP 22/2021 | Dasar hukum pengelolaan mutu udara Indonesia (Berlaku) | 2 |

## Poin kunci

- Cerita = koreksi miskonsepsi: indeks kualitas udara bukan cuma soal "partikel tak terlihat," tapi angka tunggal yang merangkum beberapa pencemar berbeda (gas dan partikel).
- Indonesia punya sistem sendiri (ISPU) — bedakan dari AQI AS, jangan campur skala atau warna.
- Mekanisme cocok divisualkan: stasiun pemantau → konsentrasi pencemar → tabel breakpoint → interpolasi → satu angka + warna.
- IQAir bukan data resmi: sajikan dengan label, bukan sebagai kebenaran.
- Topik awet (mekanisme tidak berubah), tapi peringkat kota dan data tahunan cepat basi.
