# Research Report — Cara Kerja Trafo Tiang Listrik di Depan Rumah

> Riset backlog 2026-11-27. Channel @AudiraExplained (rule 15: netral, tanpa wajah/logo/merek nyata). Topik keselamatan: hanya pesan keselamatan, tanpa instruksi teknis kerja di jaringan.

## Sumber utama

- **SPLN D3.002-1:2007** (spesifikasi trafo distribusi PLN): tegangan 20 kV – 400 V / 231 V, daya pengenal, kelompok vektor, inti, minyak, bentuk tangki, definisi trafo CSP (#1).
- **Regulasi**: Permen ESDM 04/2009 Aturan Distribusi (400/230 V, 20 kV, +5%/−10%, 50 Hz) (#9); status Permen ESDM 20/2020 Grid Code dari JDIH BPK (#10).
- **Standar tegangan**: status SNI 04-0227-2003 di BSN (#2), isi SNI (#3), IEC 60038:2009 (#4); IEC 60076-1:2011 (#5).
- **Fisika**: OpenStax University Physics Vol. 2 §15.6 (#6).
- Pendukung MEDIUM: ANTARA (imbauan keselamatan PLN, kanal lapor) (#7), Wikipedia (#8, #11), hitungan sendiri (#12).

## Fakta terverifikasi

1. Jaringan tegangan menengah (JTM) PLN = 20 kV; trafo distribusi fase tiga menurunkannya ke 400 V (antarfasa), fase tunggal ke 231 V (#1, #9).
2. Tegangan rendah sambungan konsumen = 400/230 V; tegangan sistem dijaga +5% / −10% dari nominal (#9). SNI tegangan standar memakai 230/400 V untuk sistem fase tiga empat kawat (#3, #11).
3. Prinsip: induksi elektromagnetik pada arus bolak-balik; rasio tegangan = rasio lilitan; trafo ideal: daya tetap, arus naik saat tegangan turun (#6).
4. Alasan tegangan tinggi di jaringan: arus kecil, rugi panas saluran kecil (#6).
5. Frekuensi 50 Hz (#1, #9).
6. Inti dari laminasi baja silikon (grain oriented) atau baja amorf (#1, #8).
7. Minyak mineral (IEC 60296) berfungsi sebagai isolasi dan pendingin; pendinginan ONAN; tangki kedap udara terisi penuh minyak (#1, #8).
8. Daya pengenal fase tiga 25–2.500 kVA, fase tunggal 10–50 kVA; desain pasangan luar ≤ 400 kVA (#1).
9. Kelompok vektor: Yzn5 (≤ 160 kVA) dan Dyn5 (> 160 kVA) untuk JTM 3 kawat; YNyn0 untuk JTM 4 kawat (#1).
10. Tangki trafo fase tunggal bisa silindris atau persegi empat (#1).
11. Pengaman: fuse (sisi primer) dan lightning arrester; pada trafo CSP terpasang menyatu, pada trafo lain umumnya fused cutout dan arrester terpisah di luar tangki (#1, #8).
12. Kanal lapor gangguan: kantor PLN, aplikasi PLN Mobile, Contact Center 123 (24 jam) (#7).

## Perselisihan / Kontroversi

- **Koreksi hook TOPIC.md** ("Tabung abu-abu di tiang listrik menurunkan tegangan ribuan volt jadi 220 volt"):
  - "ribuan volt" terlalu kecil: JTM = **20.000 volt (puluhan ribu)** (#1, #9).
  - "220 volt" adalah sebutan populer/lama; nominal yang berlaku **230 V** fasa–netral (400 V antarfasa) menurut Permen ESDM 04/2009 dan SPLN D3.002-1 (231 V tanpa beban) (#1, #9, #3). Naskah memakai 230 V; bila perlu, satu catatan HUD "dulu dikenal 220 V" tanpa angka tambahan.
  - "tabung abu-abu": bentuk tidak selalu tabung (fase tunggal silindris **atau** persegi; fase tiga persegi dengan sirip) (#1). Warna tidak terverifikasi di sumber, jadi tidak disebut.
  - Hook baru: "Tangki di tiang depan rumahmu ini menurunkan dua puluh ribu volt jadi dua ratus tiga puluh volt."
- **Rasio 50:1 = rasio tegangan antarfasa (hitungan sendiri, #12)**, bukan rasio lilitan fisik. Pada Dyn5 belitan primer delta menerima 20 kV dan belitan sekunder bintang 231 V, jadi rasio lilitan per belitan ≈ 87:1. VO memakai "tegangan turun sekitar lima puluh kali" (benar untuk tegangan); HUD wajib label "rasio tegangan, hitungan sendiri".
- **"Inti besi" di VO** = baja silikon berlapis (laminasi); bisa juga baja amorf (#1). VO menyebut "lembaran baja tipis".
- **Rentang 10–400 kVA** untuk pasangan luar dibaca dari tata letak teks salinan SPLN pasal 7.1.3 (pasangan luar ≤ 400 kVA, pasangan dalam ≥ 315 kVA); cek ulang di dokumen asli.
- **Penangkap petir & sekring**: tidak semua trafo tiang punya keduanya menempel di tangki; VO menyebut "trafo juga punya pengaman" secara umum.
- **Statistik 40% gangguan karena pohon** (#7) hanya untuk wilayah UID Jateng, MEDIUM; tidak dipakai di VO.
- **Keselamatan**: naskah hanya mengimbau jangan mendekati/memanjat tiang dan gardu serta melapor ke PLN; tanpa jarak aman numerik atau prosedur teknis.
- **Status regulasi/standar**:
  - SNI 04-0227-2003: **Berlaku** di BSN (#2), tetapi mengacu IEC 60038 edisi lama; IEC sudah terbit 60038:2009 (#4). Apakah sudah ada SNI adopsi IEC 60038:2009 belum terverifikasi (pencarian web gagal/rate-limit).
  - Permen ESDM 04/2009 Aturan Distribusi: dokumen terbuka di JDIH ESDM (#9), tetapi tidak ditemukan di JDIH BPK sehingga status berlaku/dicabut **belum pasti**. Permen ESDM 20/2020 (Grid Code) tidak mencabutnya dan masih merujuk "Aturan Distribusi" (#10). Cek JDIH ESDM sebelum produksi.
  - SPLN D3.002-1:2007 menggantikan SPLN 50:1997 (#1); apakah ada revisi SPLN yang lebih baru belum terverifikasi. Teks dibaca dari salinan publik, bukan situs PLN.

## Angka kunci untuk HUD

| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| 20 kV (20.000 V) | Tegangan jaringan menengah PLN, sisi primer trafo | 1, 9 |
| 400 V | Tegangan antarfasa sisi sekunder trafo fase tiga | 1, 9 |
| 230 V (231 V tanpa beban) | Tegangan fasa–netral ke rumah | 1, 9, 3 |
| ≈ 50 : 1 | Rasio tegangan 20.000/400 V (hitungan sendiri) | 12 |
| 50 Hz | Frekuensi listrik PLN | 1, 9 |
| +5% / −10% | Batas tegangan sistem distribusi | 9 |
| 10–400 kVA | Rentang daya trafo pasangan luar (fase tunggal 10 kVA sampai fase tiga ≤ 400 kVA) | 1 |
| Yzn5 / Dyn5 | Kelompok vektor (≤ 160 kVA / > 160 kVA), opsional sebagai label teknis kecil | 1 |
| IEC 60296 | Standar minyak isolasi trafo | 1 |
| 123 | Contact Center PLN (24 jam) | 7 |

## Poin kunci

- Cerita = perjalanan tegangan: 20 kV di kabel atas → induksi di dua gulungan → 400/230 V ke stopkontak.
- Payoff visual: cutaway tangki (inti laminasi, dua gulungan, minyak) dan voltmeter yang turun ±50 kali.
- Rule 15: tanpa logo PLN, tanpa merek/pelat nama pabrikan trafo, tanpa wajah petugas; "PLN" hanya disebut di VO sebagai kanal lapor.
- Pesan keselamatan di outro, tanpa instruksi teknis.
- Fakta awet (prinsip fisika dan standar); risiko utama hanya status regulasi lama.
