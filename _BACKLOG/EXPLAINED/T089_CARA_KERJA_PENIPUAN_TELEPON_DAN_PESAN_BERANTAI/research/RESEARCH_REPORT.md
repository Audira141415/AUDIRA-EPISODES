# Research Report — Cara Kerja Penipuan Telepon dan Pesan Berantai

> Riset backlog 2026-11-27. Channel @AudiraExplained (rule 15: netral, tanpa wajah/logo nyata).

## Sumber utama

- **FBI IC3 2024 Annual Report** (#1): statistik pengaduan dan kerugian penipuan siber global (data AS), termasuk call center fraud dan phishing/spoofing. Sumber primer resmi.
- **BPK JDIH** (#2, #3): teks dan status UU 1/2023 (KUHP baru, Pasal 492 penipuan) dan UU 11/2008 (UU ITE, Pasal 28 ayat 1). Keduanya berlaku.
- **Wikipedia (en/id)** (#4–#9): definisi dan mekanisme social engineering, voice phishing, smishing, pretexting, phishing, advance-fee scam, dan data CFCA. Pendukung MEDIUM.

## Fakta terverifikasi

1. Social engineering = tekanan psikologis untuk mempengaruhi orang membocorkan informasi atau melakukan tindakan tertentu (#4).
2. Pretexting = membuat skenario palsu (pretext), sering didahului riset data korban, untuk membangun kesan sah di benak target (#4).
3. Vishing (voice phishing) = penipuan via telepon; memakai VoIP dan caller ID spoofing agar nomor terlihat resmi; pelaku menyamar sebagai bank, polisi, atau lembaga pemerintah (#5).
4. Smishing (SMS phishing) = phishing lewat pesan teks/SMS, termasuk link palsu ke halaman login (#7).
5. Penipu menggunakan dua pendekatan: (a) sistem otomatis (text-to-speech, pesan massal) dan (b) penelepon langsung yang menjalankan skenario (#5).
6. Teknik utama penipu: menciptakan rasa urgensi, meniru otoritas (polisi, bank, pajak), dan memanfaatkan ketakutan korban (#5).
7. Audio deepfake sudah digunakan untuk meniru suara orang tepercaya dan menipu korban (#5).
8. FBI IC3 2024: 859.532 pengaduan, kerugian $16,6 miliar (naik 33% dari 2023); phishing/spoofing = 193.407 pengaduan ($1,45 miliar); call center scams = 53.369 pengaduan ($1,9 miliar) (#1).
9. CFCA 2023: kerugian penipuan telekomunikasi global = $38,95 miliar, 2,5% dari pendapatan telko (#6).
10. KUHP baru (UU 1/2023) berlaku 2 Januari 2026; Pasal 492 mengatur penipuan umum (menggantikan Pasal 378 KUHP lama), ancaman penjara maks 4 tahun (#2).
11. UU ITE Pasal 28(1): larangan menyebarkan berita bohong menyesatkan yang merugikan konsumen dalam transaksi elektronik; pidana maks 6 tahun penjara dan/atau denda maks Rp1 miliar (Pasal 45A(1)) (#3). Diubah terakhir oleh UU 1/2024.
12. Di Indonesia, modus yang masih aktif per 2026: (a) "mama minta pulsa" / menyamar keluarga minta transfer darurat, (b) pesan berisi file APK berbahaya (berkedok undangan pernikahan, resi paket, dll) yang mencuri kredensial perbankan, (c) link phishing ke halaman login palsu bank/e-commerce. Modus (b) mulai marak ~2023 seiring popularitas mobile banking. (Catatan: tidak ada sumber tunggal HIGH yang terverifikasi untuk data kasus Indonesia; fakta ini dari pengetahuan umum dan perlu dikonfirmasi ulang saat produksi.)

## Perselisihan / Kontroversi

- **Koreksi hook TOPIC.md**: "Penipu tidak menebak — mereka memakai naskah yang sama berulang kali" **sebagian benar, perlu nuansa**. Pretexting memang menggunakan skenario yang sudah disiapkan (#4), dan operasi call center ilegal menjalankan skrip standar (#1, #5). Tapi penipu juga: (1) mengadaptasi skrip sesuai respons korban, (2) mengembangkan modus baru terus-menerus (dari mama-minta-pulsa ke APK ke deepfake), (3) melakukan riset data korban sebelumnya untuk personalisasi. Jadi bukan "naskah yang sama berulang" tanpa variasi. Hook dikoreksi menjadi: "**Penipu punya naskah — dan mereka tahu cara membuatmu mengikutinya.**"
- **Data kerugian Indonesia**: tidak berhasil memverifikasi angka spesifik Bareskrim/Polri/Kominfo karena situs berita (ANTARA, Kompas, CNN Indonesia) tidak bisa diakses via curl (JS-rendered/redirect). Data Kominfo ~572 ribu aduan penipuan online 2017–2023 dan Bareskrim ~8.831 kasus 2022 diketahui dari pengetahuan umum tetapi TIDAK dipakai di naskah karena tidak terverifikasi. Naskah menggunakan data FBI IC3 (#1) sebagai konteks global. **Cek ulang data Indonesia saat produksi.**
- **KUHP baru vs UU ITE**: kedua UU berlaku bersamaan. KUHP baru Pasal 492 = penipuan umum (offline/online). UU ITE Pasal 28(1) = khusus transaksi elektronik. Dalam praktik, kasus penipuan telepon/online bisa dijerat keduanya. UU ITE sudah direvisi UU 1/2024, perlu cek apakah ada perubahan di Pasal 28(1) saat produksi.
- **Modus APK**: sangat spesifik Indonesia (berkaitan dengan ekosistem Android dan mobile banking lokal); masih relevan per 2026, walau detailnya bisa berubah (varian baru: tagihan pajak, kurir paket, undangan).
- **Deepfake voice**: masih relatif baru dan belum banyak kasus terdokumentasi di Indonesia, tapi layak disebut sebagai ancaman yang berkembang.

## Angka kunci untuk HUD

| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| $16,6 miliar | Kerugian penipuan siber AS 2024 (IC3) | 1 |
| 859.532 | Pengaduan ke IC3 tahun 2024 | 1 |
| 193.407 | Pengaduan phishing/spoofing 2024 | 1 |
| $1,9 miliar | Kerugian call center scams 2024 | 1 |
| 53.369 | Pengaduan call center scams 2024 | 1 |
| $38,95 miliar | Kerugian penipuan telko global 2023 (CFCA) | 6 |
| Pasal 492 KUHP baru | Pidana penipuan, maks 4 tahun penjara | 2 |
| Pasal 28(1) UU ITE | Berita bohong merugikan konsumen, maks 6 tahun | 3 |

## Poin kunci

- Cerita = mekanisme di balik penipuan telepon dan pesan: bagaimana penipu menyiapkan skrip, meniru otoritas, menciptakan urgensi, dan memanfaatkan teknologi (spoofing, APK, deepfake).
- Payoff visual: diagram alur serangan (penipu → skrip → spoofing → korban → uang), dan HUD angka kerugian global.
- Modus Indonesia (mama minta pulsa, APK berkedok undangan, link phishing) perlu dikonfirmasi ulang saat produksi — cepat berubah.
- Data kerugian Indonesia tidak terverifikasi HIGH; naskah memakai data global IC3 sebagai gantinya.
- Pesan edukatif, bukan menakut-nakuti: fokus pada cara kerja dan cara mengenali pola, bukan pada statistik yang mengerikan.
- Netral: tanpa logo lembaga, tanpa wajah orang nyata (rule 15).
