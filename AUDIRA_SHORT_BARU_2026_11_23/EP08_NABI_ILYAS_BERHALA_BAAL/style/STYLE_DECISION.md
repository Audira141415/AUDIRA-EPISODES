# STYLE DECISION — EP08 Nabi Ilyas AS dan Berhala Ba'l

Style: MANUSCRIPT
Engine: Remotion 2D (React + SVG/CSS, tanpa R3F)
Tanggal: 2026-11-23
approved: yes (dipilih pengguna di gerbang style ulang, 2026-11-23: "1 MANUSCRIPT")

## Alasan
Kisah ini bersumber dari ayat Al-Qur'an, jadi suasana mushaf/naskah kuno, tinta emas, dan cahaya lilin paling pas. MANUSCRIPT punya skor final juri tertinggi di memori (4.67, sejarah-islam-EP02, gold). Lingkungan tetap mengikuti fakta topik (kota kuno, berhala, padang) yang dilukis sebagai iluminasi/naskah di atas meja kayu walnut berlilin, bukan satu latar statis.

## Riwayat
- PAPERWORLD (pilihan pertama) gagal juri buta 2 putaran: 3.17 lalu 3.67 (lemah lighting, depth, composition). Arsip: `STYLE_DECISION.paperworld.md`, `cover-topic.paperworld.png`, `cover-reference.paperworld.jpg`.

## Alternatif yang ditolak
- STORYBOOK — ilustrasi buku cerita hangat, belum punya riwayat skor. Tidak dipilih pengguna.
- CHRONICLE — dokumenter sejarah. Tidak dipilih pengguna.
- ISLAMICDOCUMENTARY — gagal juri 3.33 di EP07 kisah nabi 2D; tidak ditawarkan.

## Adab visual (wajib, tetap)
- Nabi Ilyas tidak tampil dalam bentuk apa pun: tanpa tubuh, siluet, wajah, tangan, bayangan. Kehadiran = cahaya lilin/lentera, tongkat, teks seruan.
- Tidak menggambarkan Allah atau malaikat.
- Kaum: siluet kecil tanpa wajah, tidak mengejek.
- Kereta api ke langit = hanya ikon kosong berlabel israiliyat.
- Teks Arab persis dari `research/quran_verses.txt`.

## Parameter dari motion memory (MANUSCRIPT)
- Semua cahaya hangat amber (#FFD07A, #E8A040) atau netral (#6A5A48); DILARANG warna dingin biru/ungu/cyan di cahaya dan material.
- Tekstur kertas/kulit dengan serat, huruf emas bertepi tinta gelap, lilin sebagai key light, bloom rendah.
- Satu hero per beat (>= 50% lebar frame), label >= 40 px, label/ikon tidak menumpuk dan tidak terpotong tepi.
- Brand AUDIRA: segel lilin / papan di meja walnut.

Cover referensi: `cover-reference.png` (manuscript). Cover topik: `cover-topic.png` (dirender ulang setelah restyle).
