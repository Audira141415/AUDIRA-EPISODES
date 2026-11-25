# SOURCE_REGISTER — AE-073 "Bagaimana Teknologi 3D Printing Bisa Membangun Rumah?"

Tanggal akses semua sumber: 2026-11-10. Jalur: curl + parser teks (WebFetch/WebSearch error di mesin ini), Bing lewat browser pane untuk mencari URL, Wikipedia API, OpenAlex/Crossref untuk metadata jurnal.

## Daftar sumber

| Kode | Sumber | Penerbit | URL |
|---|---|---|---|
| S1 | Construction 3D printing (artikel) | Wikipedia EN | https://en.wikipedia.org/wiki/Construction_3D_printing |
| S2 | COBOD BOD2 – product page + technical data | PERI 3D Construction (distributor resmi BOD2, pemegang saham COBOD) | https://www.peri3dconstruction.com/en/cobod-bod2 |
| S3 | Single-family house in Beckum, 2020 | PERI 3D Construction | https://www.peri3dconstruction.com/en/einfamilienhaus-in-beckum |
| S4 | History (2015–2024) | PERI 3D Construction | https://www.peri3dconstruction.com/en/geschichte |
| S5 | FAQs | PERI 3D Construction | https://www.peri3dconstruction.com/en/faqs |
| S6 | Wall System | ICON Technology, Inc. | https://www.iconbuild.com/design-build/wall-system |
| S7 | Titan Specs | ICON Technology, Inc. | https://www.iconbuild.com/technology/specs |
| S8 | Technology (Titan) | ICON Technology, Inc. | https://www.iconbuild.com/technology |
| S9 | Build / Process (timeline) | ICON Technology, Inc. | https://www.iconbuild.com/design-build/build |
| S10 | Wolf Ranch project page | ICON Technology, Inc. | https://www.iconbuild.com/projects/wolf-ranch |
| S11 | "World's largest 3D-printed neighborhood nears completion in Texas" (Reuters, 9 Agu 2024, dimuat ulang Rappler) | Reuters / Rappler | https://www.rappler.com/technology/features/texas-3d-printed-neighborhood-nears-completion/ |
| S12 | "World's largest 3D-printed neighborhood nears completion in USA" (Adam Williams, 14 Agu 2024) | New Atlas | https://newatlas.com/architecture/wolf-ranch-icon-texas-nears-completion/ |
| S13 | Buswell et al., "3D printing using concrete extrusion: A roadmap for research", Cement and Concrete Research (2018) | Elsevier | https://doi.org/10.1016/j.cemconres.2018.05.006 |
| S14 | Perrot, Rangeard, Pierre, "Structural built-up of cement-based materials used for 3D-printing extrusion techniques", Materials and Structures (2015/2016) | Springer | https://doi.org/10.1617/s11527-015-0571-0 |
| S15 | "Rheometry for Concrete 3D Printing: A Review and an Experimental Comparison", Buildings 12(8):1190 (2022), open access | MDPI | https://doi.org/10.3390/buildings12081190 |
| S16 | Roussel, "Rheological requirements for printable concretes", Cement and Concrete Research (2018) — hanya metadata terverifikasi, abstrak tidak terbaca | Elsevier | https://doi.org/10.1016/j.cemconres.2018.04.005 |
| S17 | "Masuki Era Industri 4.0, Kementerian PUPR Manfaatkan Teknologi 3D Printing untuk Bangun Rumah Khusus" (24 Jan 2022) | Kementerian PU (pu.go.id) | https://pu.go.id/berita/masuki-era-industri-40-kementerian-pupr-manfaatkan-teknologi-3d-printing-untuk-bangun-rumah-khusus |
| S18 | "Usai Uji Coba, Tahun Ini PUPR Bangun Rumah Khusus dengan Teknologi 3D Printing" (Jan 2022) — hanya cuplikan hasil pencarian, halaman diblokir Cloudflare | Tempo | https://www.tempo.co/ekonomi/usai-uji-coba-tahun-ini-pupr-bangun-rumah-khusus-dengan-teknologi-3d-printing-432676 |
| S19 | "Teknologi Makin Canggih, Kini Bangun Rumah Cuma 6 Hari Pakai Printer 3D" (19 Agu 2025) | detikProperti | https://www.detik.com/properti/berita/d-8069146/teknologi-makin-canggih-kini-bangun-rumah-cuma-6-hari-pakai-printer-3d |
| S20 | Beranda PT Modula Tiga Dimensi (Modula3D) | Modula3D | https://modula3d.com |
| S21 | "Space Coast home to 3-D printed, affordable homes" (9 Des 2024) | Central Florida Public Media (WMFE) | https://www.cfpublic.org/housing-homelessness/2024-12-09/space-coast-home-to-3-d-printed-affordable-homes |
| S22 | Beranda Apis Cor | Apis Cor Inc. | https://apis-cor.com/ |

## Klaim

| # | Klaim | Sumber | Tanggal akses | Tingkat | Catatan |
|---|---|---|---|---|---|
| 1 | Printer beton konstruksi terbagi dua kelompok utama: sistem gantry (portal, kepala cetak bergerak XYZ kartesian) dan lengan robot (derajat kebebasan tambahan). | S1, S2, S7 | 2026-11-10 | HIGH | S2: BOD2 = "modular gantry printer", kepala cetak bergerak di 3 sumbu. S7: ICON Titan = "4 Boom Serial Arm", 5 DOF lengan + 6 DOF kepala cetak, berjalan di atas track baja (jenis ketiga: lengan/boom bergerak di atas rantai). |
| 2 | Alur kerja: model digital/CAD → dipotong jadi lapisan (slicing) menjadi jalur alat → material dicampur, dipompa lewat pipa ke nozzle → ekstrusi lapis demi lapis. | S1, S2, S6, S9, S11 | 2026-11-10 | HIGH | S1: tahap data preparation, concrete preparation, component printing; lapisan berisi kontur + pola pengisi. S2: slicer menerima format CAD .STP/.IGS/.BREP. S9: software BuildOS menerjemahkan desain jadi tool path. S11: campuran dipompa ke printer, "nozzle squeezes out the concrete like toothpaste" mengikuti jalur yang diprogram. Istilah "G-code" tidak diverifikasi untuk semua printer; aman pakai "jalur cetak digital". |
| 3 | Tiap lapisan berisi garis kontur + pola pengisi (honeycomb atau kurva pengisi ruang). | S1 | 2026-11-10 | MED | Pola zigzag/diagonal di dalam dinding rongga terlihat di foto proyek, tapi deskripsi tertulisnya hanya S1. |
| 4 | Material harus mudah dipompa dan dicetak, lalu langsung menahan bentuk; lapisan bawah harus cepat cukup kuat menahan lapisan berikutnya (structural build-up). Ini syarat reologi yang saling bertentangan. | S1, S14, S15, S13 | 2026-11-10 | HIGH | S1: pumpability, printability, buildability, open time. S14: kekuatan naik seiring waktu, harus cukup menahan berat lapisan di atasnya, laju bangun dioptimasi. S15: material harus cair saat dipompa, menahan bentuk setelah diletakkan, lapisan bawah butuh kekuatan awal. Sifat ini dikaitkan dengan tiksotropi (S15, judul S16 dan studi lain). |
| 5 | Waktu set/menunggu antar lapisan dalam angka menit tertentu. | — | 2026-11-10 | tidak terverifikasi | Tidak ditemukan angka umum yang bersumber. Tergantung campuran, cuaca, dan panjang jalur. Jangan sebut angka. |
| 6 | Tinggi lapisan BOD2: 1–4 cm; lebar lapisan 3–10 cm; agregat maks 10 mm; kecepatan cetak sampai 1 m/s; 1 m² dinding rongga ±5 menit. | S2 | 2026-11-10 | MED | Data sheet produsen/distributor. "Beberapa cm per lapis" aman. |
| 7 | ICON Titan: tinggi cetak maks 8,2 m, jangkauan 21,3 m, ekstrusi maks 2,3 m³/jam, berat kering 21.800 kg, 2 operator, agregat maks 4,75 mm. | S7 | 2026-11-10 | MED | Spesifikasi produsen untuk printer baru (pengiriman mulai 2027 menurut S8). Bukan printer yang dipakai di Wolf Ranch. |
| 8 | Dinding cetak ICON = cangkang dalam + luar ("dual-bead shell") dengan rongga; rongga diisi spray foam open-cell; inti struktural bertulang tiap 4 ft (±1,2 m); ikat silang baja antar cangkang; jalur listrik dan air di dalam dinding. | S6 | 2026-11-10 | MED | Reveal "dinding berongga lalu diisi" TERBUKTI untuk ICON. Untuk BOD2, S2 menyebut "cavity wall" (dinding rongga) → mendukung bahwa dinding rongga umum. Gabungan → HIGH untuk "dinding dicetak berongga". |
| 9 | Dinding Beckum dicetak 2 dan 3 lapis (double/triple-layer walls) dan TANPA tulangan karena kekuatannya cukup. | S3 | 2026-11-10 | MED | Fakta penting: tulangan tidak selalu dipakai. Jangan klaim "selalu diisi besi". |
| 10 | Beckum (Nordrhein-Westfalen, Jerman): rumah tinggal cetak 3D pertama di Jerman, dicetak musim gugur 2020 dengan COBOD BOD2, 2 lantai, ±80 m² per lantai, waktu cetak murni 100 jam, izin lewat persetujuan kasus per kasus; area cetak diberi tenda/atap. | S3, S4, S5 | 2026-11-10 | HIGH | Sumber semuanya dari PERI (satu penerbit, tiga halaman). Status "pertama di Jerman" adalah klaim PERI; cukup dikenal luas. |
| 11 | Wolf Ranch (Georgetown, dekat Austin, Texas): 100 rumah, ICON + Lennar, desain BIG, printer Vulcan, cetak dinding mulai Nov 2022, selesai 2025; 1.500–2.100 sq ft (±140–195 m²), satu lantai. | S10, S11, S12 | 2026-11-10 | HIGH | "Komunitas cetak 3D terbesar di dunia" = klaim ICON/Lennar, dikutip Reuters dan New Atlas. |
| 12 | Wolf Ranch: pencetakan per rumah ±3 minggu; fondasi dan atap logam dipasang secara konvensional; jendela, pintu, atap dikerjakan pekerja manusia. | S11, S12 | 2026-11-10 | HIGH | Bukti utama "waktu cetak ≠ waktu bangun". |
| 13 | Rata-rata waktu proyek ICON dari awal sampai selesai 6,1 bulan (termasuk desain, izin, fondasi, finishing). | S9 | 2026-11-10 | MED | Klaim perusahaan. |
| 14 | Habitat for Humanity Tempe, Arizona (2021): rumah 160 m², waktu cetak 45 jam; Hausleiten, Austria: kantor 125 m² dicetak dalam 45 jam; Wavehouse Heidelberg: 170 jam cetak. | S4, S5 | 2026-11-10 | MED | Satu penerbit (PERI). |
| 15 | Harga Wolf Ranch ±US$450.000 sampai hampir US$600.000 (2024). | S11 | 2026-11-10 | MED | New Atlas (S12) menyebut "mulai US$400.000" dari jubir. Angka beda → jangan sebut harga spesifik, atau sebut "ratusan ribu dolar". |
| 16 | Klaim biaya ICON Titan: dinding US$20/sq ft, >40% di bawah rata-rata nasional; rumah 2.500 sq ft dicetak < 7 hari. | S8 | 2026-11-10 | LOW | Klaim pemasaran produk yang belum dikirim. Jangan dipakai sebagai fakta. |
| 17 | Klaim "rumah dalam sehari/24 jam": Khoshnevis (sejak 2006) dan WinSun (10 rumah dalam 24 jam, tidak termasuk fondasi, utilitas, pintu/jendela; dituduh palsu oleh Khoshnevis). | S1 | 2026-11-10 | MED | Mitos/klaim bermasalah. Masuk daftar JANGAN DIKLAIM. |
| 18 | Apis Cor (Melbourne, Florida): mencetak struktur beton langsung di lokasi dengan sistem robot; rumah Habitat Melbourne ±32 jam kerja cetak dengan 2 operator; mesin bernama "Frank" membentuk sudut membulat. | S21, S22 | 2026-11-10 | MED | "32 jam" = ucapan direktur Apis Cor (S21), satu sumber. Bentuk mesin Apis Cor (lengan putar) tidak terverifikasi di riset ini. |
| 19 | Indonesia: Kementerian PUPR bersama mitra menguji coba 3D printing rumah tapak di Yogyakarta 12–31 Januari 2021; rencana menerapkan untuk rumah khusus (Rusus) 2022. | S17, S18 | 2026-11-10 | HIGH | Realisasi Rusus 3D printing setelah 2022 tidak terverifikasi. |
| 20 | Indonesia: Indocement + Modula3D (JV Bakrie & Brothers dan COBOD, diresmikan Nov 2022) membangun "Indocement Collaborative Hub" ±120 m² dengan printer COBOD BOD3 (Agu 2025); Modula mengklaim rumah sederhana bisa dibangun 6 hari dan waktu konstruksi dinding berkurang >70%. | S19, S20 | 2026-11-10 | MED | Bangunan & kolaborasi: HIGH (2 sumber). Klaim "6 hari" dan ">70%" = ucapan direktur Modula (LOW), bukan hasil terukur proyek. |
| 21 | Bagian yang tidak dicetak (umum): atap, jendela, pintu, instalasi listrik/air (dipasang di rongga/saluran), finishing; fondasi biasanya dicor konvensional. | S11, S12, S9, S6, S1 | 2026-11-10 | HIGH | Pengecualian: SQ4D mengklaim mencetak footing/fondasi (S1, media); Beckum: PERI mencetak fondasi kecil untuk tiang printer (S3). Jadi "fondasi biasanya tidak dicetak". |
| 22 | Printer gantry harus dirakit mengelilingi area cetak; BOD2 dipasang 1–2 hari, 2–3 pekerja mengawasi. | S2, S5 | 2026-11-10 | MED | Satu penerbit. |
| 23 | Ukuran Vulcan (printer Wolf Ranch): 14,2 m × 4,75 m (New Atlas) vs "lebih dari 45 kaki lebar, berat 4,75 ton" (Reuters). | S11, S12 | 2026-11-10 | LOW | Konflik antar sumber (4,75 m vs 4,75 ton). Pakai "selebar ±14 meter, sebesar truk" saja. Lebar >13 m konsisten di keduanya. |
