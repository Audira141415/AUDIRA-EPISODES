# Naskah — Cara Kerja DNS: Dari Domain ke IP dalam 60 Detik

> DRAF pra-produksi (backlog, 2026-11-25). Difinalkan di tahap 4 setelah style dipilih.
> Short: 190–210 kata @135–150 WPM.

## c00_hook — Hook

- Kata: **23** · estimasi **10 dtk**
- Visual: Close-up tangan menekan Enter di laptop; bilah alamat kosong, lalu tanda tanya DNS menyala besar di tengah layar. HUD: "DNS?"

> Kamu ketik satu alamat web, tekan Enter. Sebelum halaman muncul, perangkatmu wajib bertanya dulu ke sistem yang jarang kamu pikirkan: DNS. Ini AUDIRA.

## c01_intro — Intro

- Kata: **24** · estimasi **10 dtk**
- Visual: Nama domain audira.my.id terurai jadi deretan angka IP; buku telepon raksasa terbuka, halaman berisi nama di kiri dan angka di kanan. HUD: "nama → IP"

> Komputer nggak paham nama seperti audira.my.id. Yang mereka kenal cuma angka, yaitu alamat IP. DNS adalah buku telepon internet yang menerjemahkan nama jadi angka.

## c02 — Cache lokal dan resolver

- Kata: **18** · estimasi **8 dtk**
- Visual: Paket pertanyaan keluar dari ponsel, cek laci memori perangkat (kosong), lalu meluncur ke gedung resolver generik tanpa logo penyedia. HUD: "Cache lokal: kosong" → "Resolver"

> Langkah pertama, perangkatmu cek ingatannya sendiri. Kalau jawabannya belum ada, pertanyaan dilempar ke resolver, biasanya milik penyedia internetmu.

## c03 — Root server

- Kata: **34** · estimasi **15 dtk**
- Visual: Peta dunia gelap; 13 pilar huruf A–M berdiri, lalu tiap pilar memecah jadi ribuan titik anycast menyala di peta. HUD: "13 root · 12 operator · ±2.000 titik"

> Resolver lalu bertanya ke root server. Secara resmi cuma ada tiga belas nama root, dari A sampai M, dikelola dua belas organisasi. Tapi berkat anycast, salinannya tersebar di sekitar dua ribu titik di dunia.

## c04 — Server TLD

- Kata: **28** · estimasi **12 dtk**
- Visual: Pilar root menunjuk tiga pintu bertuliskan .id, .com, .org; dinding di belakang dipenuhi label akhiran. HUD: "1.435 TLD"

> Root nggak tahu jawabannya, tapi tahu siapa yang tahu: server untuk akhiran seperti titik id atau titik com. Sekarang ada lebih dari seribu empat ratus akhiran semacam itu.

## c05 — Server otoritatif

- Kata: **21** · estimasi **9 dtk**
- Visual: Paket masuk ke rak server otoritatif domain tujuan; kartu IP keluar dan meluncur balik lewat jalur yang sama ke ponsel. HUD: kartu alamat IP

> Server akhiran itu menunjuk ke server otoritatif milik domain tujuan. Dari sinilah alamat IP aslinya keluar, lalu dikirim balik ke perangkatmu.

## c06 — Cache dan TTL

- Kata: **24** · estimasi **10 dtk**
- Visual: Kartu IP masuk laci cache dengan jam pasir TTL berjalan; permintaan kedua langsung dijawab dari laci, stopwatch berhenti di 14 ms. HUD: "TTL" + "±14 ms"

> Jawaban itu disimpan sementara sesuai TTL, jadi permintaan berikutnya nggak perlu keliling lagi. Resolver publik yang cepat bisa menjawab rata-rata sekitar empat belas milidetik.

## c07_payoff — Payoff + outro

- Kata: **37** · estimasi **16 dtk**
- Visual: Tahun 1983: gulungan kertas HOSTS.TXT tunggal berubah jadi jaringan global menyala di bola dunia; name plate teks "Paul Mockapetris" tanpa wajah; lalu outro card AUDIRA. HUD: "1983" + "40+ tahun"

> Sistem ini diusulkan Paul Mockapetris tahun seribu sembilan ratus delapan puluh tiga, menggantikan satu file daftar nama bersama. Lebih dari empat puluh tahun kemudian, ia tetap bekerja tiap kali kamu klik. Ikuti AUDIRA untuk cara kerja lainnya.

## Opsi hook lain

1. Sebelum satu situs terbuka, perangkatmu sudah bertanya ke server di belahan dunia lain.
2. Tiga belas nama server menopang hampir semua alamat web yang kamu buka.

## Total

- **209 kata** ≈ **90 dtk**
