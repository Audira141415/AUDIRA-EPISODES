# Naskah — Database Transaction: Kenapa ACID Penting dan Kapan Bisa Diabaikan

> DRAF pra-produksi (backlog, 2026-11-25). Difinalkan di tahap 4 setelah style dipilih.
> Short: 190–210 kata @135–150 WPM.

## c00_hook — Hook

- Kata: **20** · estimasi **8 dtk**
- Visual: layar HP generik menampilkan notifikasi "Saldo terpotong" warna merah, panah uang berhenti di tengah jalan antara dua kotak rekening, retak glitch di panah.

> Saldo kamu sudah terpotong, tapi uangnya nggak pernah sampai. Itu bukan sulap. Itu transaksi database yang gagal di tengah jalan.

## c01_intro — Intro

- Kata: **20** · estimasi **8 dtk**
- Visual: empat balok huruf A-C-I-D jatuh dan mengunci di atas silinder database generik; callout HUD "1983" + name plate teks "Härder & Reuter" (tanpa foto).

> Di AUDIRA, kita bongkar empat janji yang disingkat ACID. Istilah ini dicetuskan tahun 1983 oleh Theo Härder dan Andreas Reuter.

## c02 — Atomicity

- Kata: **26** · estimasi **11 dtk**
- Visual: dua langkah transfer sebagai dua blok ("kurangi pengirim", "tambah penerima") diikat satu kotak transparan; saat satu gagal, kedua blok mundur bersamaan (rollback). HUD "A = semua atau tidak sama sekali".

> Huruf A, atomicity. Transfer itu sebenarnya dua langkah: kurangi saldo pengirim, lalu tambah saldo penerima. Atomicity memastikan dua-duanya berhasil, atau nggak ada satu pun yang tercatat.

## c03 — Consistency

- Kata: **21** · estimasi **9 dtk**
- Visual: gerbang pemeriksa di depan tabel; baris data "saldo: −50" ditolak gerbang dengan lampu merah, baris valid lolos lampu hijau. HUD "C = aturan tidak boleh dilanggar".

> Huruf C, consistency. Setiap transaksi wajib patuh pada aturan database, misalnya saldo nggak boleh minus. Data yang melanggar aturan langsung ditolak.

## c04 — Isolation

- Kata: **27** · estimasi **11 dtk**
- Visual: beberapa jalur transaksi berjalan paralel di dalam tabung kaca terpisah; transaksi lain mencoba mengintip isi tabung yang belum selesai, kaca buram. HUD "I = tidak bisa diintip".

> Huruf I, isolation. Banyak transaksi bisa jalan bersamaan. Isolation bikin transaksi yang belum selesai nggak bisa diintip transaksi lain, jadi nggak ada yang membaca data setengah matang.

## c05 — Durability

- Kata: **27** · estimasi **11 dtk**
- Visual: server rack, lampu padam (mati listrik); sebelum padam, baris log mengalir ke buku log di disk. Lampu menyala lagi, data dibangun ulang dari log. HUD "D = WAL: log dulu, data menyusul".

> Huruf D, durability. Begitu transaksi dinyatakan sukses, datanya tetap aman walau server mati listrik. Caranya, setiap perubahan dicatat dulu ke log di disk, baru file datanya diubah.

## c06 — Kapan boleh dilonggarkan

- Kata: **34** · estimasi **14 dtk**
- Visual: peta jaringan banyak server tersebar; kartu split ACID vs BASE; penghitung "like" di satu server telat lalu menyusul sinkron, sementara ikon saldo dan stok terkunci gembok.

> Terus, kapan ACID boleh dilonggarkan? Sistem raksasa yang tersebar di banyak server sering memilih BASE: selalu bisa diakses, datanya menyusul sinkron belakangan. Jumlah like boleh telat beberapa detik. Saldo, stok, dan tagihan nggak boleh.

## c07_payoff — Payoff + outro

- Kata: **29** · estimasi **12 dtk**
- Visual: timbangan; sisi kiri "rugi uang = transaksi ACID", sisi kanan "angka telat = eventual consistency"; zoom out ke empat balok ACID menyala, lalu outro card AUDIRA.

> Jadi aturannya gampang. Kalau salah hitung bikin orang rugi, pakai transaksi. Kalau cuma bikin angka telat, eventual consistency sudah cukup. Simpan video AUDIRA ini sebelum kamu mendesain database berikutnya.

## Opsi hook lain

1. Dua orang membeli stok terakhir di detik yang sama. Siapa yang dapat? Database yang memutuskan.
2. Server mati tepat setelah kamu menekan "bayar". Uangnya ke mana?

## Total

- **204 kata** ≈ **82–91 dtk**
