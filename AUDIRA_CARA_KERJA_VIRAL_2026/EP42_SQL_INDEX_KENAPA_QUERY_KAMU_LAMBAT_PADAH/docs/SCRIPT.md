# Naskah — SQL Index: Kenapa Query Kamu Lambat Padahal Sudah Benar

> DRAF pra-produksi (backlog, 2026-11-25). Difinalkan di tahap 4 setelah style dipilih.
> Short: 190–210 kata @135–150 WPM.

## c00_hook — Hook

- Kata: **17** · estimasi **7 dtk**
- Visual: kursor menekan Enter pada query SELECT sederhana; progress bar merayap, jam pasir berputar; stempel hijau "QUERY BENAR" lalu stempel merah "LAMBAT".

> Query kamu benar, hasilnya juga benar, tapi lambatnya minta ampun. Masalahnya bukan di server. Masalahnya di index.

## c01_intro — Intro

- Kata: **25** · estimasi **11 dtk**
- Visual: tabel raksasa memanjang ke kejauhan (baris-baris data sebagai lempengan), satu baris "ID 48213" menyala; sinar pemindai bergerak dari baris pertama ke bawah satu per satu. HUD: "JUTAAN BARIS".

> Bayangin tabel berisi jutaan baris. Kamu cari satu pelanggan pakai ID. Tanpa index, database terpaksa membaca tabel itu baris demi baris, dari atas sampai bawah.

## c02 — Seq Scan

- Kata: **20** · estimasi **8 dtk**
- Visual: layar terminal generik menampilkan output EXPLAIN; label "Seq Scan" membesar jadi callout merah; counter baris yang dicek naik cepat sementara hasil tetap "1 baris".

> Di PostgreSQL, ini muncul sebagai Seq Scan saat kamu jalankan EXPLAIN. Semua baris dicek, padahal yang kamu butuhkan cuma satu.

## c03 — Lahirnya B-tree

- Kata: **29** · estimasi **12 dtk**
- Visual: meja arsip 1970-an, kertas makalah dengan judul teks; name plate "R. Bayer · E. M. McCreight" (tanpa wajah), pill tahun "1972"; kartu data menyusun diri jadi pohon bertingkat seperti daftar isi buku.

> Index mengubah itu. Kebanyakan database memakai B-tree, struktur pohon dari Rudolf Bayer dan Edward McCreight di Boeing, terbit tahun 1972. Datanya diurutkan dan disusun bertingkat, mirip daftar isi buku.

## c04 — Lompat, bukan baca

- Kata: **21** · estimasi **9 dtk**
- Visual: kamera turun dari akar pohon ke daun dalam 4–5 lompatan bernomor; di sebelahnya tabel jutaan baris redup. HUD callout besar: "JUTAAN DATA = 4–5 TINGKAT".

> Hasilnya gila. Index berisi jutaan data biasanya cuma punya empat sampai lima tingkat. Database tinggal lompat beberapa langkah, bukan membaca semuanya.

## c05 — Index yang dicuekin

- Kata: **31** · estimasi **13 dtk**
- Visual: pohon index menyala, lalu query `WHERE LOWER(email)` membungkus kolom dengan kotak hitam; jalur ke pohon putus, sinar pemindai tabel menyala lagi. Lalu chip `LIKE '%budi'` dengan tanda persen di depan memotong akar pohon.

> Masalahnya, index sering sudah ada tapi tidak terpakai. Tulis WHERE LOWER kolom, database melihat ekspresi baru, bukan kolom yang di-index. LIKE yang diawali tanda persen juga tidak bisa menelusuri pohon itu.

## c06 — Aturan dan harga index

- Kata: **33** · estimasi **14 dtk**
- Visual: rak kartu index gabungan (kolom A | B | C); query tanpa kolom A ditolak, panah "KOLOM PALING KIRI". Lalu timbangan: tumpukan index menumpuk di satu sisi, ikon INSERT/UPDATE melambat.

> Index gabungan punya aturan sendiri. MySQL cuma memakainya kalau query menyentuh kolom paling kiri. Tapi jangan pasang index di semua kolom. Tiap insert dan update, index ikut diperbarui, jadi menulis data makin berat.

## c07_payoff — Payoff + outro

- Kata: **23** · estimasi **10 dtk**
- Visual: EXPLAIN kedua: "Seq Scan" berubah jadi "Index Scan", progress bar langsung penuh; kamera mundur memperlihatkan pohon utuh bercahaya, lalu outro card AUDIRA.

> Jadi cek dulu pakai EXPLAIN, lalu buat index yang cocok dengan cara kamu mencari. Ikuti AUDIRA buat cara kerja lain yang jarang dibahas.

## Opsi hook lain

1. Database kamu bisa membaca jutaan baris cuma untuk mencari satu nama.
2. Satu fungsi kecil di WHERE bisa bikin index kamu dianggap tidak ada.

## Total

- **199 kata** ≈ **80–88 dtk** @135–150 WPM
