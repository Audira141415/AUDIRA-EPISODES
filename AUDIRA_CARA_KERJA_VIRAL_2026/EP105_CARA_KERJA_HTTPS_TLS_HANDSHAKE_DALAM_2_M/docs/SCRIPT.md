# Naskah — Cara Kerja HTTPS: TLS Handshake dalam 2 Menit

> DRAF pra-produksi (backlog, 2026-11-25). Difinalkan di tahap 4 setelah style dipilih.
> Short: 190–210 kata @135–150 WPM.

## c00_hook — Hook

- Kata: **17** · estimasi **7 dtk**
- Visual: laptop (siluet tanpa wajah) di kiri, rak server di kanan; di antaranya kabel data transparan dengan paket bergerak dan sosok pengintai bayangan yang hanya melihat teks acak. Callout HUD: "HTTPS".

> Sebelum halaman ini terbuka, browsermu dan server sudah berunding rahasia. Di jalur yang bisa diintip siapa saja.

## c01_intro — Intro

- Kata: **17** · estimasi **7 dtk**
- Visual: kamera zoom ke satu paket data; paket terbelah jadi lima bagian bernomor 1–5 (peta jalan handshake). Judul "TLS HANDSHAKE" di HUD.

> Namanya TLS handshake. Inilah yang membuat HTTPS benar-benar aman. Di AUDIRA, kita bongkar langkahnya satu per satu.

## c02 — Langkah 1: ClientHello

- Kata: **21** · estimasi **9 dtk**
- Visual: laptop melempar kartu berisi daftar sandi dan separuh kunci berwarna biru ke kabel. Callout HUD: "ClientHello", "key_share".

> Langkah satu, browser menyapa. Pesan ClientHello berisi versi TLS yang dia mengerti, daftar sandi yang dia dukung, dan separuh kunci sementara.

## c03 — Langkah 2: ServerHello

- Kata: **33** · estimasi **14 dtk**
- Visual: rak server memilih satu kartu sandi, membalas dengan separuh kunci berwarna oranye; dua separuh kunci bertemu di tengah dan menghasilkan kunci rahasia keemasan di dua ujung. Pengintai hanya melihat dua separuh kunci.

> Langkah dua, server memilih satu sandi dan membalas dengan separuh kuncinya sendiri. Dari dua separuh itu, kedua pihak menghitung rahasia yang sama. Rahasianya tidak pernah dikirim. Pengintai hanya melihat potongan yang tidak berguna.

## c04 — Langkah 3: Sertifikat

- Kata: **24** · estimasi **10 dtk**
- Visual: server mengeluarkan kartu sertifikat berstempel; stempel dicek terhadap daftar otoritas tepercaya (ikon generik, bukan logo organisasi). Gembok tertutup di layar laptop. Callout HUD: "Sertifikat", "90 hari".

> Langkah tiga, server menunjukkan sertifikat, semacam KTP situs yang ditandatangani otoritas tepercaya. Sertifikatnya sendiri sudah terkirim terenkripsi. Cocok, lanjut. Tidak cocok, browser langsung memperingatkanmu.

## c05 — Langkah 4: Finished

- Kata: **26** · estimasi **11 dtk**
- Visual: dua segel Finished dari kedua sisi ditempel di ujung rangkaian pesan; satu bit pesan diubah, segel retak, kabel putus dengan percikan.

> Langkah empat, keduanya mengirim Finished, tanda tangan atas seluruh percakapan tadi. Kalau ada yang mengubah satu bit di tengah jalan, tandanya tidak cocok dan koneksi diputus.

## c06 — Penjelasan: TLS 1.3

- Kata: **39** · estimasi **17 dtk**
- Visual: dua jam pasir berdampingan: "TLS 1.2" dengan dua bolak-balik, "TLS 1.3" dengan satu; kunci server pecah di layar tetapi rekaman lama tetap terkunci. Callout HUD: "2013 -> 2018", "1-RTT".

> Di TLS 1.2, perundingan ini butuh dua kali bolak-balik. TLS 1.3, yang terbit Agustus 2018, memangkasnya jadi satu. Kunci tetap RSA juga dibuang, jadi setiap koneksi memakai kunci sekali pakai. Kalau kunci server bocor nanti, rekaman lama tetap terkunci.

## c07_payoff — Payoff + outro

- Kata: **20** · estimasi **9 dtk**
- Visual: kabel data kembali dengan paket-paket terkunci mengalir lancar; pengintai hanya melihat teks acak; gembok menyala hijau; outro card AUDIRA.

> Setelah itu, semua isi dienkripsi dengan kunci rahasia tadi. Satu kali salaman, lalu aman. Ikuti AUDIRA untuk membongkar teknologi lainnya.

## Opsi hook lain

1. Gembok di browsermu itu hasil perundingan rahasia yang selesai sebelum kamu sempat berkedip.
2. Ada yang mengintip kabelmu sekarang. Kenapa dia tetap tidak bisa membaca apa-apa?

## Total

- **197 kata** ≈ **84 dtk** (140 WPM; 79–88 dtk pada 150–135 WPM)
