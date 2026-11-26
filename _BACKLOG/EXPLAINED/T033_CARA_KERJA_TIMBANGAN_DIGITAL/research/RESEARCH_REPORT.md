# Research Report — Cara Kerja Timbangan Digital

> Riset backlog 2026-11-26. Channel @AudiraExplained (rule 15: tanpa wajah orang nyata, tanpa logo/merek nyata, netral).

## Sumber utama

- **OIML** (organisasi metrologi legal internasional): R 60-1:2017 tentang load cell (#1) dan R 76-1:2006 tentang timbangan bukan otomatis, kelas akurasi, batas kesalahan, dan tare (#4).
- **Regulasi Indonesia** (JDIH BPK): UU 2/1981 Metrologi Legal (#5), Permendag 24/2024 kegiatan tera dan tera ulang (#6), Permendag 67/2018 daftar UTTP wajib tera (#7).
- **NIST Handbook 44** edisi 2026 sebagai pembanding standar AS (#8).
- **Dokumen teknis pabrikan**: datasheet HBK SP4M (lendutan nominal, #2), application note Texas Instruments tentang jembatan dan load cell (#3).
- Pendukung MEDIUM: Wikipedia "Load cell" (#9), tutorial NI (#10), datasheet HX711 (#11), TAL220 (#12), Flintec PC42 (#13), tutorial SparkFun (#14).

## Fakta terverifikasi

1. Load cell adalah transduser yang mengubah beban jadi sinyal; jenis paling umum memakai strain gauge (#1, #9).
2. Badan load cell (aluminium atau baja) sedikit elastis dan disebut "spring element": melentur saat dibebani dan kembali ke bentuk semula selama tidak kelebihan beban (#9).
3. Lendutan load cell single point saat beban maksimum < 0,25–0,5 mm, tergantung kapasitas (#2).
4. Strain gauge = foil logam; ditarik → hambatan naik, ditekan → hambatan turun. Load cell single point memakai 4 gauge (2 tarik, 2 tekan) dalam satu jembatan (#3, #14).
5. Perubahan hambatan sangat kecil: 500 µε → 0,1% dengan faktor gauge ≈ 2; karena itu dipakai jembatan Wheatstone (#10).
6. Sensitivitas load cell umumnya 1–3 mV/V; contoh 2 mV/V × 5 V = 10 mV pada beban penuh (#3, #9). Load cell dapur TAL220 = 1,0 mV/V (#12).
7. Chip penimbang HX711: ADC 24-bit, penguat gain hingga 128 (rentang ±20 mV pada 5 V), 10 atau 80 sampel/detik (#11).
8. Tare device membuat penunjukan nol saat ada beban di piringan (#4).
9. Kelas akurasi OIML: I, II, III (sedang), IIII; timbangan dagang umumnya kelas III. MPE awal kelas III ±0,5 e hingga 500 e; MPE saat dipakai 2× lipat (#4).
10. UU 2/1981 Metrologi Legal berlaku sejak 1 April 1981 (#5). Timbangan elektronik kelas II, III, IIII wajib tera dan tera ulang dengan jangka waktu tera ulang 1 tahun (Permendag 24/2024 Lampiran I) (#6, #7).

## Perselisihan / Kontroversi

- **Koreksi hook TOPIC.md**: "Tidak ada pegas — timbanganmu mengukur seberapa jauh logam kecil melengkung" menyesatkan di dua titik.
  1. **"Tidak ada pegas" keliru secara fisika.** Yang tidak ada hanya *per spiral*. Badan load cell sendiri bekerja sebagai pegas (spring element, #9): elastis, melentur sebanding beban, lalu kembali.
  2. **"Mengukur seberapa jauh melengkung" kurang tepat.** Timbangan tidak mengukur jarak lendutan secara langsung. Ia mengukur perubahan hambatan strain gauge akibat regangan permukaan logam (#3, #10). Lendutannya pun bukan "mikrometer" di beban penuh: datasheet SP4M menyebut < 0,25–0,5 mm (#2). Skala mikrometer hanya untuk beban kecil (hitungan sendiri, ≈ 0,1 µm per gram, batas atas, asumsi linier).
  - Hook dikoreksi menjadi: "Timbangan digital tidak punya per spiral. Pegasnya justru sebatang logam yang melengkung kurang dari setengah milimeter."
- **Angka lendutan** berasal dari satu model pabrikan (SP4M); load cell timbangan dapur murah tidak mencantumkan lendutan (TAL220, PC42). Gunakan "kurang dari setengah milimeter" sebagai batas atas, bukan angka pasti.
- **"Dikuatkan 128 kali" dan "24-bit"** spesifik untuk chip HX711 (umum di timbangan murah/DIY); timbangan lain bisa memakai chip berbeda. VO memakai frasa "chip penguat yang umum dipakai". Jangan tampilkan nama/logo chip di layar (rule 15).
- **Tera ulang 1 tahun** berlaku untuk timbangan elektronik kelas II/III/IIII yang dipakai untuk kepentingan umum, usaha, serah-terima barang, dll. Timbangan dapur pribadi tidak wajib tera. VO menyebut "timbangan dagang".
- **Kelas III dan "timbangan dagang"**: hubungan umum, bukan aturan mutlak (pedagang emas/apotek bisa kelas II). Tidak dinarasikan di VO.

## Angka kunci untuk HUD

| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| < 0,5 mm | Lendutan load cell di beban penuh (batas atas) | 2 |
| ±0,1% | Perubahan hambatan strain gauge pada 500 µε | 10 |
| 4 strain gauge | 2 tarik + 2 tekan dalam satu jembatan | 3 |
| 1–3 mV/V | Sensitivitas umum load cell | 3, 9 |
| 5–10 mV | Keluaran beban penuh pada 5 V (hitungan sendiri: 1–2 mV/V × 5 V) | 3, 12 |
| ×128 | Penguatan chip HX711 | 11 |
| 24-bit | Resolusi ADC HX711 | 11 |
| 10–80× per detik | Laju sampel HX711 | 11 |
| UU 2/1981 | Undang-Undang Metrologi Legal | 5 |
| 1 tahun | Jangka tera ulang timbangan elektronik (Permendag 24/2024) | 6 |

## Poin kunci

- Pembalik intuisi: bukan "tanpa pegas", tetapi pegasnya disembunyikan di dalam logam padat.
- Rantai sebab-akibat yang jelas untuk animasi: beban → logam melentur → foil meregang → hambatan berubah → jembatan → milivolt → penguat → ADC → angka.
- Visual payoff: lendutan dibesar-besarkan (beri label "skala dibesarkan") agar terbaca, lalu dikembalikan ke skala nyata.
- Penutup sosial-praktis: tera ulang tahunan timbangan dagang, sebagai fakta hukum yang netral.
- Rule 15: timbangan, chip, dan pasar generik tanpa merek/logo; tidak ada wajah orang nyata.
