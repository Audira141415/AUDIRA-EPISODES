# Research Report — Cara Kerja Jalan Layang: Ribuan Ton di Atas Tiang Ramping

> Riset backlog 2026-11-27. Channel @AudiraExplained (rule 15: netral, tanpa wajah orang nyata, tanpa logo/nama BUMN atau kontraktor).

## Sumber utama

- **SNI 2833:2016** (Bina Marga/BSN): filosofi desain jembatan tahan gempa (#1).
- **SNI 1725:2016** (BSN, salinan Bina Marga): berat isi beton, beban truk "T" 500 kN, temperatur rencana, koefisien muai, gempa 1000 tahun (#2, #3).
- **SNI 3967:2013** (BSN): bantalan karet elastomer tipe polos/berlapis untuk perletakan jembatan (#7).
- **FHWA/MCEER "Seismic Isolation of Highway Bridges" (2006)**: cara kerja isolasi seismik dan isolator lead-rubber (#4, #5).
- **FHWA GEC 010 "Drilled Shafts" (2018)**: fondasi tiang bor (#6).
- Pendukung MEDIUM: prosiding PNJ 2025 (berat segmen box girder satu span, data proyek) (#8); Wikipedia: bridge bearing, expansion joint, box girder, seismic base isolation, jalan layang (#9–#13); hitungan sendiri (#14, #15).

## Fakta terverifikasi

1. Jalan layang tersusun dari bentang-bentang gelagar (sering box girder beton) yang ditumpu pilar; box girder umum dipakai untuk flyover (#11, #13).
2. Pada satu proyek tol layang (dokumen proyek dalam prosiding PNJ 2025), satu span terdiri dari 15 segmen box girder pracetak (30,13–51,34 t per segmen) dengan total 520,73 t; tendon 40 m; diangkat launcher gantry berkapasitas 860 t (#8).
3. Beton bertulang/prategang biasa: berat isi 22–25 kN/m³ (#2).
4. Truk rencana "T" SNI 1725 = 500 kN (≈ 51 t massa, hitungan #14); satu span ±520 t ≈ 10× truk "T" (hitungan #14).
5. Bantalan jembatan menyalurkan beban vertikal dan lateral, sekaligus mengizinkan gerak pemuaian/rotasi; elastomer paling umum, bisa diperkuat pelat baja (#5, #7, #9).
6. Temperatur rencana lantai beton di atas boks beton 15–40 °C; α beton > 30 MPa = 11 × 10⁻⁶ /°C (#3) → bentang 40 m berubah ±11 mm (hitungan #15).
7. Sambungan ekspansi menampung gerak 30–1.000 mm tergantung tipe (#10).
8. Isolasi seismik memperpanjang periode getar; contoh FHWA: 0,5 → 1,5 dtk memotong gaya gempa ±60%, hingga ±77% dengan redaman 30% (#4). Isolator lead-rubber: karet + pelat baja + inti timbal; kaku vertikal, lentur horizontal (#5).
9. Filosofi SNI 2833: elastis pada gempa kecil–sedang; tidak runtuh total pada gempa besar; kerusakan mudah diinspeksi/diperbaiki (#1). Beban gempa memakai peta probabilitas 7% dalam 75 tahun (gempa 1000 tahun) (#3).
10. Tiang bor: diameter umum 0,9–3,7 m, kedalaman umum hingga ±61 m (di AS), memikul beban lewat gesekan sisi dan tahanan ujung; tiang lain dipakai berkelompok dengan pile cap (#6).

## Perselisihan / Kontroversi

- **Koreksi judul TOPIC.md** ("Ribuan Ton di Atas Tiang"): data yang terbuka menunjukkan **satu bentang box girder ±40 m ≈ 520 t** (#8), bukan ribuan ton per tiang. Satu pilar menampung setengah dari dua bentang yang bertemu, jadi beban mati bangunan atas per pilar kira-kira setara satu bentang (±500 t, hitungan kasar, belum termasuk kepala pilar, aspal, dan beban lalu lintas). "Ribuan ton" hanya benar untuk beberapa bentang atau seluruh jalan layang. Judul dikoreksi menjadi "**Ratusan Ton per Bentang di Atas Tiang Ramping**" (atau tetap "ribuan ton" bila konteksnya seluruh ruas). VO memakai "lima ratus ton".
- **Hook TOPIC.md** ("Tiang dirancang menahan beban sekaligus goyangan gempa"): pada dasarnya benar, tetapi perlu dua nuansa: (1) sebagian besar "kerja" gempa ditangani bantalan/isolator (deformasi di isolator, bukan di pilar, #4); (2) standar tidak menjanjikan "tanpa kerusakan" pada gempa besar, hanya "tidak runtuh" (#1, #12). Naskah menyebut keduanya; hook tidak memakai kata "tahan gempa" secara mutlak.
- **Isolator seismik tidak dipakai di semua jalan layang**. Banyak jembatan memakai bantalan elastomer biasa; isolasi khusus (lead-rubber, friction pendulum) dipakai sesuai desain. Narasi c05 menyebut "bantalan isolasi" sebagai cara kerja, bukan klaim semua jalan layang di Indonesia memakainya. Visual jangan memberi kesan itu standar universal.
- **Angka −60%** adalah contoh spektrum AASHTO untuk tanah kaku dari manual FHWA (#4), bukan angka tetap. VO memakai "bisa turun sekitar enam puluh persen".
- **Bentang 40 m** di #8 disimpulkan dari panjang strand tendon (40 m), bukan dinyatakan eksplisit sebagai panjang span. Cek ulang sebelum produksi atau ganti dengan "satu bentang" tanpa angka panjang.
- **Kedalaman "puluhan meter"**: angka FHWA (#6) adalah praktik di AS. Kedalaman tiang di Indonesia sangat tergantung tanah; VO memakai "puluhan meter" tanpa angka pasti. Sumber Indonesia (spesifikasi Bina Marga/laporan proyek) belum dibuka.
- **Prosiding PNJ (#8)** ditulis mahasiswa dengan data dokumen proyek; dinilai MEDIUM. Nama proyek/kontraktor tidak disebut di VO maupun visual (rule 15).
- Pencarian web otomatis sempat diblokir (captcha). Dokumen SNI 2833 lengkap (PDF) tidak dibuka; hanya halaman ringkasan Bina Marga (#1). Fakta "gempa 1000 tahun" diambil dari lampiran SNI 1725 (#3).

## Angka kunci untuk HUD

| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| ±500 t / 520,73 t | Berat segmen box girder satu span (satu proyek tol layang) | 8 |
| 15 segmen · 30–51 t | Jumlah dan berat segmen per span | 8 |
| 40 m | Panjang tendon/span (inferensi, cek ulang) | 8 |
| 860 t | Kapasitas launcher gantry | 8 |
| 500 kN ≈ 51 t | Truk rencana "T" SNI 1725 (konversi = hitungan) | 2, 14 |
| ≈ 10× | Span vs truk "T" (hitungan) | 14 |
| 15–40 °C | Temperatur rencana lantai beton | 3 |
| ±11 mm | Muai bentang beton 40 m (hitungan) | 3, 15 |
| 30–1.000 mm | Rentang gerak sambungan ekspansi | 10 |
| 0,5 → 1,5 dtk · −60% | Efek isolasi pada gaya gempa (contoh FHWA) | 4 |
| Gempa 1.000 tahun (7%/75 th) | Gempa rencana jembatan | 3 |
| SNI 2833:2016 · SNI 1725:2016 | Standar gempa & pembebanan jembatan | 1, 2 |
| Ø 0,9–3,7 m | Diameter umum tiang bor | 6 |

## Poin kunci

- Cerita = perjalanan beban: bentang → bantalan → tiang → fondasi → tanah. Tiap mata rantai jadi satu adegan.
- "Twist" yang menarik: jalan layang kuat karena **boleh bergerak** (bantalan, sambungan ekspansi, isolator), bukan karena kaku.
- Payoff visual: split-screen tiang tanpa/dengan isolasi dan timbangan bentang vs 10 truk.
- Rule 15: tanpa logo/nama proyek, BUMN, atau kontraktor; jangan menampilkan atau menyebut kegagalan jembatan tertentu.
- Awet: fisika dan standar tidak cepat basi; cek versi terbaru SNI (2833/1725) sebelum produksi.
