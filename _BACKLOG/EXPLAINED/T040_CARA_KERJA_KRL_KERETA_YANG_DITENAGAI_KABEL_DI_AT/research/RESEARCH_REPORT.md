# Research Report — Cara Kerja KRL: Kereta yang Ditenagai Kabel di Atasnya

> Riset backlog 2026-11-26. Channel @AudiraExplained (rule 15: tanpa wajah orang nyata, tanpa logo/livery operator; operator hanya disebut sebagai teks).

## Sumber utama

- **Regulasi Kemenhub** (dibuka lewat JDIH BPK): PM 50/2018 Persyaratan Teknis Instalasi Listrik Perkeretaapian (#1) untuk komponen catu daya DC, penyearah, dan katenari; PM 175/2015 Standar Spesifikasi Teknis Kereta Berpenggerak Sendiri (#2) untuk pantograf sebagai penangkap arus.
- **Jurnal Perkeretaapian Indonesia** (Politeknik Perkeretaapian Indonesia, Kemenhub): dua studi gardu traksi lintas Manggarai–Bogor (#3, #4) yang menyebut tegangan operasi KRL 1500 V DC, rantai 20 kV AC → penyearah → 1500 V DC, serta struktur LAA dan pantograf.
- Pendukung MEDIUM: Wikipedia (IEC 60850, sejarah, rel sebagai penghantar balik) (#5–#7); ANTARA untuk sejarah 1925, elektrifikasi, data pelanggan, pemangkasan pohon, layang-layang, dan insiden sengatan (#8–#13).
- IEC 60850 tidak dibuka langsung (dokumen berbayar); angkanya dikutip lewat Wikipedia (#5), jadi MEDIUM.

## Fakta terverifikasi

1. KRL Jabodetabek memakai listrik aliran atas (LAA) arus searah 1.500 V (#3, #4, #6).
2. Gardu traksi menerima 20 kV AC dari PLN, menurunkannya dengan transformator, lalu penyearah (silicon rectifier) mengubahnya menjadi 1.500 V DC yang dipasok ke LAA lewat pemutus cepat (HSCB) (#4, #1).
3. LAA (katenari) terdiri atas kawat penyulang, kawat pemikul (messenger), penggantung (hanger), dan kawat kontak (trolley wire). Kawat pemikul menahan kawat kontak supaya tingginya stabil; penggantung menjaga kawat kontak tetap lurus (#1, #4).
4. Pantograf di atap kereta (tipe lengan tunggal) didorong pegas ke atas dan bergesekan dengan kawat kontak; regulasi mewajibkan kontak kontinu dengan tekanan serendah mungkin (#2, #4, #7).
5. Di kereta, modul konverter mengubah DC menjadi AC tiga fase untuk menggerakkan motor traksi (#4).
6. Arus kembali ke gardu lewat roda baja dan rel (#5, #7); di sisi gardu, arus balik diterima lewat kabel penyulang negatif (#1).
7. Tegangan nominal 1.500 V DC boleh berfluktuasi: minimum 1.000 V, maksimum permanen 1.800 V, maksimum sementara 1.950 V (IEC 60850, via #5).
8. Kereta listrik pertama di Indonesia: 6 April 1925, Tanjung Priok–Meester Cornelis (Jatinegara), memakai 1.500 V DC (#6, #8).
9. Gardu juga memasok 6 kV AC untuk persinyalan, telekomunikasi, dan pintu perlintasan (#3).
10. Benda asing di LAA (dahan, layang-layang) mengganggu dan membahayakan; operator rutin memangkas pohon dan mengimbau warga (#11, #12). Memanjat tiang LAA bisa berakibat fatal (#13).

## Perselisihan / Kontroversi

- **Koreksi hook TOPIC.md**: "kabel bertegangan *ribuan* volt" secara harfiah benar (1.500 ≥ 1.000), tapi kesannya berlebihan (penonton membayangkan beberapa ribu volt) dan kalah tajam dibanding angka pasti. Naskah memakai angka eksak **seribu lima ratus volt arus searah**. Klaim "menyentuh sepanjang perjalanan" juga diperhalus jadi "terus menggesek" saat kereta berjalan (pantograf bisa diturunkan saat kereta tidak beroperasi; rincian prosedur operasional tidak diverifikasi).
- **Salah satuan di media**: ANTARA 7 Juni 2026 (#9) menulis daya LAA Rangkasbitung "3.000 volt" dan Bogor/Bekasi "4.000 volt". Ini bertentangan dengan tegangan operasi 1.500 V DC (#3, #4) dan kemungkinan yang dimaksud adalah kapasitas penyearah gardu (3.000–4.000 kW, #4). Angka "3.000/4.000 volt" TIDAK dipakai.
- **"Listrik PLN 20 kV"**: angka 20 kV berasal dari studi lintas Bojonggede–Bogor (#4). Pasokan gardu di lintas lain bisa berbeda; naskah menyebutnya sebagai contoh umum. Cek ulang sebelum produksi bila ingin disebut berlaku seluruh jaringan.
- **Rel sebagai jalur balik**: sumbernya Wikipedia (#5, #7) + regulasi yang menyebut kabel penyulang negatif menerima arus balik (#1). Tidak ada dokumen resmi KAI yang dibuka yang secara eksplisit menulis "rel Jabodetabek = jalur balik"; ini praktik standar LAA DC.
- **Keselamatan**: VO hanya memberi larangan (jangan naik atap, jangan dekati kabel, jangan main layang-layang dekat rel). Tidak menyebut jarak aman tertentu (radius 3 km di #12 khusus jalur kereta cepat 25 kV AC, bukan KRL) dan tidak memberi instruksi apa pun soal menyentuh/menurunkan benda dari kabel.
- **Rule 15**: tanpa logo/livery KAI, KAI Commuter, PLN; kereta digambar generik (bukan livery merah-kuning yang mudah dikenali). PLN hanya disebut di VO sebagai pemasok listrik.

## Angka kunci untuk HUD

| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| 1.500 V DC | Tegangan operasi LAA KRL Jabodetabek | 3, 4, 6 |
| 20 kV AC | Masukan dari PLN ke gardu traksi (contoh lintas Bojonggede–Bogor) | 4 |
| 1.000–1.800 V | Rentang tegangan normal sistem 1.500 V DC (IEC 60850) | 5 |
| 6 kV AC | Pasokan gardu untuk sinyal & perlintasan | 3 |
| 1925 | Kereta listrik pertama, Tanjung Priok–Jatinegara | 6, 8 |
| AC 3 fase | Keluaran konverter ke motor traksi | 4 |
| 78,08 juta | Pelanggan Bogor Line Jan–Jun 2026 (opsional, per Juli 2026) | 10 |

## Poin kunci

- Rantai energi satu sirkuit: PLN → gardu traksi (trafo + penyearah) → LAA → pantograf → konverter → motor traksi → roda → rel → kembali ke gardu.
- LAA bukan satu kabel: ada kawat pemikul, penggantung, dan kawat kontak yang dijaga lurus dan setinggi tetap supaya pantograf tidak lepas.
- Visual payoff: sirkuit menyala utuh dari gardu sampai rel, lalu pesan keselamatan.
- Pesan keselamatan wajib, singkat, tanpa instruksi berbahaya.
