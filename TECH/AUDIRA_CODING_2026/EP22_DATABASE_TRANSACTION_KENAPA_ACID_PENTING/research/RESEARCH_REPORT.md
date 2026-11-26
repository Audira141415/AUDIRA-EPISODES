# Research Report — Database Transaction: Kenapa ACID Penting dan Kapan Bisa Diabaikan

## Sumber utama

- Haerder & Reuter 1983, ACM Computing Surveys (asal akronim ACID) — register #1.
- Dokumentasi resmi PostgreSQL: transaksi (#2) dan Write-Ahead Logging (#3).
- Pritchett 2008, ACM Queue (BASE) — #4; Gilbert & Lynch 2002 (bukti CAP) — #5.
- Pendukung: Wikipedia ACID (#6), Eventual consistency (#7), MongoDB Manual (#8).

## Fakta terverifikasi

1. ACID diperkenalkan Theo Härder dan Andreas Reuter tahun 1983 (#1, #6).
2. Jim Gray lebih dulu menamai atomicity, consistency, durability; isolation ditambahkan kemudian (#6).
3. Transaksi = beberapa langkah dibungkus jadi satu operasi all-or-nothing; contoh klasik transfer bank (#2).
4. Keadaan antara transaksi tidak terlihat oleh transaksi lain yang berjalan bersamaan (#2).
5. Consistency: hanya data yang memenuhi aturan (constraint, foreign key, trigger) yang boleh masuk (#6).
6. Isolation: transaksi bersamaan menghasilkan keadaan sama seperti dijalankan berurutan (#6).
7. Durability lewat WAL: log ditulis permanen dulu, file data menyusul; setelah crash dipulihkan dari log (#3).
8. BASE: basically available, soft state, eventually consistent, alternatif untuk sistem tersebar besar (#4, #7).
9. CAP: sistem tersebar tidak bisa sekaligus konsisten, selalu tersedia, dan tahan partisi (#5).
10. Di MongoDB operasi satu dokumen atomik; transaksi multi-dokumen ada tapi lebih mahal (#8).

## Perselisihan / Kontroversi

- **Koreksi hook TOPIC.md** ("Tanpa paham ini, data corruption tinggal menunggu waktu"): berlebihan. Tanpa transaksi, risikonya data *tidak konsisten* (update setengah jalan, race condition, lost update), bukan "corruption" file database secara fisik. Banyak operasi satu baris/satu dokumen sudah atomik dengan sendirinya (#8). Naskah memakai contoh konkret "saldo terpotong tapi uang tidak sampai" tanpa klaim "pasti korup". Judul tidak diubah.
- **"Kapan bisa diabaikan"**: ACID tidak benar-benar "diabaikan"; yang terjadi adalah memilih konsistensi yang lebih longgar (BASE/eventual) demi ketersediaan di sistem tersebar (#4, #5). Naskah memakai kata "dilonggarkan".
- **Ringkasan populer CAP** ("pilih 2 dari 3", "database ACID atau BASE, tak bisa keduanya" di Wikipedia #6) disederhanakan berlebihan: CAP hanya berlaku saat partisi jaringan, dan banyak database NoSQL modern punya transaksi ACID (#8). Naskah tidak menyebut CAP sebagai hukum "pilih dua".
- **Isolation**: definisi "seolah berurutan" (serializable) adalah level tertinggi; level default banyak database lebih longgar. Naskah hanya memakai klaim "transaksi yang belum selesai tidak bisa diintip transaksi lain" (#2).

## Angka kunci untuk HUD

| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| 1983 | Akronim ACID diperkenalkan | #1 |
| Härder & Reuter | Pencetus akronim (name plate teks, tanpa foto) | #1 |
| 4 | Empat sifat: A, C, I, D | #1, #6 |
| ACID vs BASE | Kartu perbandingan | #4 |
| WAL | Log ditulis dulu, data menyusul | #3 |

## Poin kunci

- Hook paling kuat: transfer setengah jalan (saldo terpotong, uang tak sampai) — relatable dan akurat.
- Tiap huruf ACID = satu adegan berbeda (mudah multi-scene).
- Pesan akhir praktis: data uang/stok/tagihan = transaksi; angka like/penonton = eventual consistency cukup.
- Rule 15: tanpa logo PostgreSQL/MongoDB/bank nyata; pakai ikon database generik dan bank fiktif.
