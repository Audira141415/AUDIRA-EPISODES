# Naskah — SSH Key Setup Sekali untuk Seumur Hidup

> DRAF pra-produksi (backlog, 2026-11-25). Difinalkan di tahap 4 setelah style dipilih.
> Short: 190–210 kata @135–150 WPM.

## c00_hook — Hook

- Kata: **14** · estimasi **6 dtk**
- Visual: Terminal gelap, kursor berkedip, teks "Password:" muncul lalu "Authentication failed" merah berulang. Glitch effect.

> Setiap kali push ke GitHub, ketik password. Ditolak. Ketik lagi. Ditolak lagi. Capek, kan?

## c01_intro — Intro

- Kata: **20** · estimasi **9 dtk**
- Visual: Layar terbagi — kiri terminal password merah, kanan terminal kunci hijau bersinar. Transisi wipe ke kanan.

> Ada satu setup yang cuma perlu dilakukan sekali, dan kamu tidak akan pernah ketik password lagi. Namanya SSH key. Di AUDIRA, kita bedah cara kerjanya.

## c02 — Asal Usul SSH

- Kata: **27** · estimasi **12 dtk**
- Visual: Tahun 1995 besar muncul. Siluet tanpa wajah (rule 15) di depan komputer retro. Paket data melayang, disadap siluet penyerang. HUD: "Helsinki, 1995".

> Tahun 1995, jaringan kampus di Finlandia diretas lewat teknik sniffing. Seorang peneliti langsung bikin solusi: protokol SSH, komunikasi terenkripsi ujung ke ujung yang menggantikan password telanjang.

## c03 — Cara Kerja Key Pair

- Kata: **38** · estimasi **16 dtk**
- Visual: Animasi gembok dan anak kunci muncul berpasangan. Kunci privat masuk ikon laptop, kunci publik terbang ke ikon server. Diagram panah: "Tantangan" dari server, "Jawaban" dari laptop. HUD: "Public + Private = Pair".

> SSH key bekerja dengan pasangan. Kunci privat tinggal di komputermu, tidak pernah dikirim ke mana pun. Kunci publik disimpan di server. Waktu kamu push, server kasih tantangan matematika yang cuma bisa dijawab kunci privatmu. Cocok? Masuk. Tanpa password.

## c04 — Kenapa Ed25519

- Kata: **33** · estimasi **14 dtk**
- Visual: Dua kunci di timbangan — kiri RSA besar bertuliskan "3072 bit", kanan Ed25519 kecil bertuliskan "256 bit". Timbangan miring ke kanan. HUD callout: "94x lebih kecil".

> Ada banyak tipe kunci. Yang paling direkomendasikan sekarang: Ed25519. Ukurannya cuma 256 bit, tapi keamanannya setara RSA 3072 bit. Lebih kecil 94 kali, lebih cepat, dan tahan serangan side-channel. GitHub sendiri merekomendasikan tipe ini.

## c05 — Tiga Langkah Setup

- Kata: **36** · estimasi **15 dtk**
- Visual: Terminal overlay gelap. Teks diketik typewriter effect: langkah 1 muncul, centang hijau. Langkah 2, centang. Langkah 3, centang. Checklist HUD. HUD: "3 Langkah. Sekali. Selesai."

> Setupnya cuma tiga langkah. Pertama, buka terminal, ketik ssh-keygen minus t ed25519. Kunci langsung dibuat di folder .ssh. Kedua, tambahkan ke ssh-agent supaya sistem ingat. Ketiga, copy kunci publik ke GitHub. Selesai.

## c06 — Keamanan Ekstra

- Kata: **24** · estimasi **10 dtk**
- Visual: Perisai muncul mengelilingi ikon kunci. Teks "passphrase" sebagai lapisan perisai kedua. Skenario laptop hilang: ikon laptop memudar, kunci tetap terlindungi. HUD: "Passphrase = Lapisan Kedua".

> Mau lebih aman? Tambahkan passphrase saat generate. Meskipun laptop hilang, kunci privatmu tetap terkunci. Ganti komputer? Copy folder .ssh ke mesin baru.

## c07_payoff — Payoff dan Penutup

- Kata: **12** · estimasi **5 dtk**
- Visual: Terminal — `git push` diketik, "Everything up-to-date" hijau instan. Zoom out, badge "SSH Connected". Transisi ke outro card AUDIRA.

> Satu setup, nol password, seumur hidup. Setup SSH key-mu hari ini. Bersama AUDIRA.

## Opsi hook lain

1. "GitHub sudah hapus password sejak 2021. Kamu masih pakai password buat push?"
2. "Tiga langkah. Sekali setup. Tidak pernah ketik password lagi."

## Total

- **204 kata** ≈ **82–91 dtk** @135–150 WPM.
- 8 blok: hook, intro, 5 chapter, payoff + outro.
