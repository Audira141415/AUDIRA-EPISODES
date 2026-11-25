# Naskah — REST vs GraphQL: Kapan Harus Pakai yang Mana

> DRAF pra-produksi (backlog, 2026-11-25). Difinalkan di tahap 4 setelah style dipilih.
> Short: 190–210 kata @135–150 WPM.

## c00_hook — Hook

- Kata: **18** · estimasi **8 dtk**
- Visual: dua pintu API berdampingan berlabel REST dan GraphQL, satu retak; HUD "6 bulan" (hook retoris)

> Pilih API yang salah, lalu enam bulan kemudian kamu menulis ulang semuanya. REST atau GraphQL, mana yang cocok?

## c01_intro — Intro

- Kata: **24** · estimasi **10 dtk**
- Visual: diagram klien-server, tiap kotak data punya alamat URL sendiri; callout HUD "2000" dan "HTTP"

> Kita mulai dari REST. Konsepnya dirumuskan Roy Fielding dalam disertasinya tahun 2000. Setiap data punya alamat URL sendiri, dan kamu mengambilnya lewat HTTP biasa.

## c02 — Asal GraphQL

- Kata: **26** · estimasi **11 dtk**
- Visual: layar ponsel dengan blok feed disusun dari satu permintaan; callout "2012" lalu "2015"

> GraphQL lahir di Facebook. Tahun 2012 mereka membangun ulang aplikasi mobile, dan butuh data News Feed yang pas dengan layar. Tahun 2015, GraphQL dibuka untuk umum.

## c03 — Beda bentuknya

- Kata: **30** · estimasi **13 dtk**
- Visual: kiri banyak jalur URL bercabang, kanan satu pintu tunggal bertuliskan /graphql; kartu query dan hasil dengan bentuk sama

> Bedanya di bentuk. REST punya banyak alamat. GraphQL cuma satu pintu, biasanya di alamat slash graphql, dikirim lewat POST. Kamu sendiri menulis field yang diminta, hasilnya berbentuk persis seperti itu.

## c04 — Untung GraphQL

- Kata: **23** · estimasi **10 dtk**
- Visual: animasi tiga panah bolak-balik ke server menyusut jadi satu panah; ikon sinyal seluler

> Untungnya apa? Facebook menulis bahwa REST bisa butuh beberapa kali bolak-balik untuk mengikuti relasi data, boros di jaringan seluler. GraphQL cukup satu permintaan.

## c05 — Harga yang dibayar

- Kata: **46** · estimasi **19 dtk**
- Visual: kunci cache menempel di URL REST, lalu di sisi GraphQL kunci hilang dan muncul label id unik; meter poin; callout "5.000 poin/jam" dan "500.000 node"

> Tapi ada harganya. Di REST, URL otomatis jadi kunci cache. Di GraphQL tidak ada URL seperti itu, jadi server harus menyediakan ID unik agar klien bisa membuat cache. Batas pemakaian juga berbeda. GitHub memberi 5.000 poin per jam untuk GraphQL, dan satu panggilan maksimal 500.000 node.

## c06 — Cara memilih

- Kata: **21** · estimasi **9 dtk**
- Visual: papan keputusan dua kolom: banyak klien dan data berelasi menunjuk GraphQL; API sederhana dan publik menunjuk REST; ikon skema tanpa nomor versi

> Jadi pilih sesuai kebutuhan. Banyak klien dan data saling berkaitan? GraphQL masuk akal. API sederhana, publik, mudah di-cache? REST sudah cukup.

## c07_payoff — Payoff + outro

- Kata: **19** · estimasi **8 dtk**
- Visual: timbangan REST dan GraphQL seimbang, lalu kartu outro AUDIRA

> Intinya, REST untuk kesederhanaan, GraphQL untuk fleksibilitas. Pilih dari kebutuhan, bukan dari tren. Ikuti AUDIRA untuk penjelasan teknologi berikutnya.

## Opsi hook lain

1. REST atau GraphQL? Salah pilih, kamu bayar mahal belakangan.
2. Facebook bikin GraphQL karena REST tidak cukup untuk News Feed. Apakah proyekmu butuh itu juga?

## Total

- **207 kata** ≈ **86 dtk**
