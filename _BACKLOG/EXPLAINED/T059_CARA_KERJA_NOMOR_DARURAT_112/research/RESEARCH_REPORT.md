# Research Report — Cara Kerja Nomor Darurat 112

> Riset backlog 2026-11-27. Channel @AudiraExplained (rule 15: netral, tanpa wajah/logo nyata). WebSearch/WebFetch error saat riset; semua sumber dibuka langsung lewat curl (JDIH BPK, ANTARA, Wikipedia API).

## Sumber utama

- **Permenkominfo 10/2016** (salinan PDF resmi lewat JDIH BPK) (#1) dan metadata statusnya di JDIH BPK (#2): dasar hukum, alur panggilan, gratis, 24 jam, larangan informasi palsu.
- **Perbup Jepara 7/2025** (#3): contoh nyata cara pemda mengintegrasikan damkar, dinkes, BPBD, polres, PMI, Basarnas ke satu call center 112.
- ANTARA (MEDIUM): jumlah kab/kota 141 per Maret 2025 (#4), klaim 182 per Des 2025 (#5), pilot Bali Sep 2026 (#6), daftar nomor lama (#7), data iseng Kendari (#8), target respons Surabaya (#9), peluncuran Parigi Moutong Agu 2026 (#10), LoI Kemendagri–Korsel (#11), hotline 110 Polri (#12).
- Wikipedia (MEDIUM): jumlah 514 kab/kota (#13), konteks GSM global (#14). Hitungan sendiri di #15.

## Fakta terverifikasi

1. 112 adalah Nomor Tunggal Panggilan Darurat sesuai Permenkominfo 10/2016, berlaku sejak 15 Juli 2016 dan berstatus **Berlaku** di JDIH BPK (#1, #2).
2. Layanan di daerah dijalankan Pemda kabupaten/kota (DKI oleh Pemprov); pemda harus mengajukan aktivasi ke Kementerian. Jadi 112 aktif per daerah, bukan otomatis nasional (#1).
3. Operator jaringan (telepon tetap, seluler, satelit) wajib menyambungkan panggilan 112 ke pusat panggilan darurat sesuai lokasi pemanggil, dan menginformasikan lokasi + nomor pemanggil ke pusat data nasional (#1).
4. Panggilan ke pusat panggilan darurat tidak dikenakan biaya (#1). Pejabat Komdigi/pemda menyebut "tanpa pulsa" dan "dari semua operator" (#4, #5, #10).
5. Pusat panggilan menerima panggilan, meneruskan ke instansi terkait sesuai SOP daerah, merekap nomor/lokasi/waktu, dan beroperasi 24 jam (#1). Contoh Jepara: satu call center mengintegrasikan damkar, dinkes, RSUD, BPBD, polres, PMI, Basarnas, PLN (#3).
6. SOP daerah wajib memuat waktu penanganan (#1). Surabaya menargetkan respons maksimal 7 menit (±6,5 menit untuk kebakaran) (#9).
7. Per 25 Maret 2025, call center 112 aktif di 141 kab/kota (#4) dari total 514 kab/kota (#13); ≈27% (hitungan sendiri, #15).
8. Nomor lama masih tercantum sebagai nomor darurat: 110 polisi, 113 pemadam, 118/119 ambulans (#7); 110 Polri diluncurkan nasional 2021 (#12).
9. 25 Sep 2026: Bali ditunjuk sebagai percontohan "Indonesia Siaga 112" untuk integrasi nasional dalam dua tahun (Kemendagri + Komdigi) (#6); Kemendagri menjadikan NTPD 112 prioritas (#11).
10. Kendari: sepekan pertama (Juni 2025) 2.360 panggilan, 1.382 terjawab, hanya 22 valid (#8); ≈0,9% valid (hitungan sendiri, #15).
11. Memberi informasi tidak benar ke pusat panggilan darurat dilarang dan dapat dikenai sanksi sesuai peraturan (#1).

## Perselisihan / Kontroversi

- **Koreksi hook TOPIC.md**: "Satu panggilan darurat diteruskan ke polisi, ambulans, atau pemadam **dalam hitungan detik**" tidak didukung data resmi. Permen hanya mewajibkan panggilan disambungkan sesuai lokasi dan diteruskan sesuai SOP daerah; tidak ada angka detik nasional. Satu-satunya target yang ditemukan adalah Surabaya ≤ 7 menit (respons, bukan penerusan). Selain itu 112 baru aktif di sebagian kab/kota. Hook dikoreksi: "Ada satu nomor untuk semuanya: 112. Tapi belum semua daerah bisa menjawabnya." c04 secara eksplisit meluruskan mitos "hitungan detik".
- **"112 baru pilot Bali per Sep 2026" (catatan batch 5)**: yang dimaksud adalah **integrasi nasional terpadu** ("Indonesia Siaga 112", dipimpin Kemendagri bersama Komdigi), bukan awal layanan 112. Call center 112 pemda sudah ada sejak 2016 (Surabaya diresmikan 26 Juli 2016, #9) dan aktif di 141 kab/kota per Maret 2025 (#4).
- **Jumlah kab/kota tidak konsisten**: 141 (Dirjen Komdigi, Maret 2025, #4) vs "182 kota" (Kadiskominfo Depok, Des 2025, #5; mungkin termasuk yang baru aktif, atau definisi berbeda). Naskah memakai 141 dengan label "per Maret 2025". Cek angka terbaru Komdigi sebelum produksi.
- **Kominfo kini Komdigi**: kementerian berganti nama (Kementerian Komunikasi dan Digital), tetapi Permenkominfo 10/2016 belum dicabut atau diganti menurut JDIH BPK (#2). Tidak ditemukan Permenkomdigi pengganti. Status belum dikonfirmasi di JDIH Komdigi (tidak bisa diakses).
- **Bisa tanpa SIM / saat layar terkunci**: hanya berlaku umum di standar GSM dan di sebagian negara (#14). Tidak ada sumber resmi Indonesia yang ditemukan, jadi klaim ini **tidak dipakai** di VO.
- **"Tanpa paket data"** hanya dari pernyataan Diskominfo Depok (#5); VO cukup "gratis" (dasar hukum Pasal 13, #1).
- **Persentase panggilan iseng nasional** tidak ditemukan. Data Kendari hanya sepekan pertama setelah peluncuran (banyak panggilan coba-coba), jadi tidak mewakili kondisi normal. VO menyebut konteks "sepekan setelah diluncurkan".
- **118 vs 119**: keduanya tercantum sebagai ambulans (#7). VO memakai 119.

## Angka kunci untuk HUD

| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| 112 | Nomor Tunggal Panggilan Darurat | 1 |
| Permenkominfo 10/2016 | Dasar hukum, berlaku 15 Juli 2016, status Berlaku | 1, 2 |
| Gratis | Panggilan tidak dikenakan biaya (Pasal 13) | 1 |
| 24 jam | Pusat panggilan beroperasi setiap hari | 1, 3 |
| ≤ 7 menit | Target respons Surabaya | 9 |
| 141 kab/kota | Layanan 112 aktif, per Maret 2025 | 4 |
| 514 kab/kota | Total kabupaten + kota di Indonesia | 13 |
| ≈27% | 141 ÷ 514 (hitungan sendiri) | 15 |
| 110 · 113 · 119 | Polisi · pemadam · ambulans (nomor lama) | 7 |
| Sep 2026 | Bali percontohan 112 terpadu nasional | 6 |
| 2.360 → 22 | Panggilan sepekan pertama Kendari → yang valid (Jun 2025) | 8 |
| ≈1% | 22 ÷ 2.360 (hitungan sendiri) | 15 |

## Poin kunci

- Cerita = perjalanan satu panggilan: ponsel → jaringan seluler → pusat panggilan kab/kota → instansi → bantuan datang.
- Pelurusan inti: 112 tidak otomatis ada di mana-mana dan tidak "dalam hitungan detik"; tergantung pemda.
- Pesan keselamatan: simpan 112, cek daerahmu, sebut lokasi jelas, jangan iseng (informasi palsu dilarang).
- Netral: proyek pemerintah (pilot Bali, kerja sama Korsel) disajikan faktual, tanpa memuji/mengkritik; tanpa logo Komdigi/Kemendagri/Polri/pemda, tanpa wajah pejabat atau petugas.
- Angka cepat basi: 141 kab/kota, status pilot Bali. Perbarui saat produksi dan tulis "per <bulan tahun>".
