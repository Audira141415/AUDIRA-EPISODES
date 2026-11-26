# Research Report — Cara Kerja Regulator Tabung Gas LPG

> Riset benih backlog, 2026-11-26. Channel @AudiraExplained, short 9:16. Rule 15 berlaku: tabung dan regulator generik, tanpa logo atau merek nyata.

## Sumber utama

- **Regulasi:** Permenperin No. 10/M-IND/PER/1/2012 (SNI 7369:2008 regulator tekanan rendah wajib) (#1).
- **Jurnal Standardisasi BSN (peneliti LIPI):** syarat mutu dan metode uji SNI 7369:2008 (#2); tekanan uji kompor SNI 7368:2011 = 280 mmH2O (#3); rentang kerja kompor LPG SNI 8660:2018 = 2,0–3,3 kPa (#4).
- **LEMIGAS (Kementerian ESDM):** komposisi LPG Indonesia ±30% propana / ±70% butana (#5).
- **NIST Chemistry WebBook:** tekanan uap propana dan butana per suhu (#6), dasar estimasi tekanan tabung.
- **Pendukung (MEDIUM):** Wikipedia en "Pressure regulator" untuk mekanisme pegas-diafragma-katup (#7), Wikipedia en/id LPG (#8, #9), jurnal pengabdian UMS untuk keselamatan rumah tangga (#10).

## Fakta terverifikasi

1. Regulator tekanan rendah untuk tabung baja LPG wajib SNI 7369:2008 dan wajib bertanda SNI; aturannya diundangkan 2 Februari 2012 (#1).
2. SNI 7369:2008 punya 9 syarat mutu, termasuk tekanan keluar, tekanan pengaman (lock up), ketahanan jatuh, kebocoran, dan ketahanan karet (#2).
3. Bagian karet yang diuji dalam regulator: karet membran (diafragma), bantalan katup, dan cincin perapat (#2).
4. Kompor LPG satu tungku diuji pada tekanan gas masuk 280 ± 5 mmH2O (SNI 7368:2011) (#3); SNI 8660:2018 mensyaratkan kompor bekerja di 2,0–3,3 kPa, uji di 2,8 kPa (#4). 280 mmH2O ≈ 2,75 kPa ≈ 0,028 bar ≈ 28 mbar, sama dengan setelan umum regulator butana rumah tangga internasional (#7).
5. LPG Indonesia ±30% propana, ±70% butana (#5).
6. Tekanan uap: propana 10,79 bar abs, butana 2,83 bar abs pada 30 °C (#6). Estimasi campuran 30:70 ≈ 4 bar gauge pada 30 °C, sekitar 3–6 bar di rentang 20–40 °C (#6, perhitungan).
7. Rasio tekanan tabung terhadap tekanan kompor: ±105× (20 °C) sampai ±205× (40 °C), jadi klaim "lebih dari seratus kali lipat" aman di suhu dapur Indonesia (#3, #6).
8. Mekanisme: pegas menekan diafragma, katup terbuka; tekanan keluaran naik dan mendorong diafragma melawan pegas, katup menyempit; saat gas dipakai, tekanan turun dan katup membuka lagi. Ini umpan balik negatif tanpa listrik (#7).
9. LPG di dalam tabung tersimpan sebagai cairan bertekanan (#9); fase gasnya lebih berat dari udara dan mengumpul di tempat rendah (#8).
10. Zat pembau (mercaptan/ethanethiol) sengaja ditambahkan supaya kebocoran tercium (#8, #9, #10).
11. Saat tercium bau gas, jangan menyalakan alat listrik karena percikan saklar bisa memicu kebakaran; periksa karet seal saat memasang regulator (#10).

## Perselisihan / Kontroversi

- **Hook TOPIC.md perlu dipertajam.** "Gas di dalam tabung bertekanan tinggi" kurang tepat: di dalam tabung LPG sebagian besar **cair**, dan tekanannya cuma beberapa bar (±4 bar di 30 °C), jauh di bawah tabung gas industri. Yang dramatis justru **selisihnya**: lebih dari 100× tekanan yang dibutuhkan kompor. Hook di naskah memakai angka rasio ini.
- **Angka tekanan tabung adalah estimasi turunan**, bukan angka resmi. Dihitung dari tekanan uap NIST + komposisi 30:70 LEMIGAS (hukum Raoult ideal). Komposisi aktual per kiriman bisa berbeda. VO memakai "kira-kira empat bar" dan HUD wajib bertanda "estimasi, 30 °C".
- **Angka tekanan keluar resmi SNI 7369 belum dibaca langsung.** Dokumen SNI berbayar/login (akses-sni.bsn.go.id), dan kajian PPIS BSN tentang SNI 7369:2012 tidak bisa diunduh (host tidak resolve). Naskah memakai 280 mmH2O sebagai **tekanan uji kompor SNI 7368:2011**, bukan sebagai spesifikasi tekanan keluar regulator. Angka "±30 mbar / 300 mmH2O" yang beredar konsisten dengan sumber (28 mbar, 2,8 kPa), tetapi tidak dicantumkan di layar sampai SNI 7369 dibaca.
- **SNI 7369 punya edisi 2008 dan 2012.** Permenperin 10/2012 merujuk edisi 2008; jurnal 2020 merujuk SNI 7369:2012. VO hanya menyebut "wajib ber-SNI sejak 2012" tanpa nomor edisi.
- **"Buka pintu dan jendela"** adalah saran umum yang logis karena gas mengumpul di bawah (#8), tetapi belum ada sumber resmi ESDM/Damkar yang dibuka. Cek sebelum produksi.
- **Jangan beri instruksi membongkar regulator.** Visual cutaway hanya ilustrasi; tidak ada langkah membuka atau menyetel pegas.
- Wikipedia id menyebut "tekanan uap sekitar 120 psig"; tidak dipakai karena tanpa suhu/komposisi dan bertentangan dengan estimasi campuran Indonesia.

## Angka kunci untuk HUD

| Angka / tahun / nama | Konteks | # sumber |
|---|---|---|
| > 100× | Tekanan tabung vs tekanan kompor (20–40 °C) | #3, #6 |
| 30% : 70% | Propana : butana, LPG Indonesia | #5 |
| ±4 bar (estimasi, 30 °C) | Tekanan uap di dalam tabung | #5, #6 |
| 280 mmH2O ≈ 0,03 bar | Tekanan uji kompor LPG (SNI 7368:2011) | #3, #4 |
| 2,0–3,3 kPa | Rentang kerja kompor LPG (SNI 8660:2018) | #4 |
| SNI 7369 · wajib 2012 | Regulator tekanan rendah wajib SNI | #1 |
| 9 syarat mutu | Isi uji SNI 7369:2008 | #2 |
| Pegas · diafragma · katup | Tiga komponen kerja regulator | #2, #7 |

## Poin kunci

- Cerita inti: selisih tekanan raksasa (tabung ±4 bar vs kompor ±0,03 bar) ditaklukkan oleh tarik-ulur pegas dan diafragma, tanpa listrik.
- Visual payoff: animasi keseimbangan pegas vs tekanan gas, katup membuka-menutup mengikuti nyala kompor.
- Pesan keselamatan wajib di akhir: regulator bertanda SNI, cek karet seal, bau gas = jangan nyalakan saklar/api, buka ventilasi.
- Rule 15: tabung warna generik tanpa logo dan tulisan merek, regulator generik, tanpa wajah orang nyata (tangan tanpa wajah boleh).
