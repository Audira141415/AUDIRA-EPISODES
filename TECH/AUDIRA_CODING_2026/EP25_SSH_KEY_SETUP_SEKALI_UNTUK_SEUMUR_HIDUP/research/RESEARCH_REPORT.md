# Research Report — SSH Key Setup Sekali untuk Seumur Hidup

## Sumber utama

1. **Wikipedia: Secure Shell** (#1) — sejarah SSH, Tatu Ylonen, motivasi (serangan sniffing 1995).
2. **Wikipedia: EdDSA** (#2, #7) — spesifikasi Ed25519, keunggulan atas RSA, standarisasi.
3. **GitHub Docs** (#3) — panduan resmi SSH key setup, rekomendasi Ed25519.
4. **GitHub Blog** (#4) — penghapusan password auth 13 Agustus 2021.
5. **Wikipedia: ssh-keygen** (#5) — detail tool, tipe kunci, ukuran default.
6. **OpenSSH.org** (#6) — deskripsi proyek OpenSSH.

## Fakta terverifikasi

1. SSH (Secure Shell) diciptakan tahun 1995 oleh Tatu Ylonen, peneliti di Helsinki University of Technology, Finlandia, setelah jaringan universitasnya diserang password-sniffing (#1).
2. SSH menggunakan port default 22 (#1).
3. OpenSSH dirilis 1999 sebagai software open-source oleh pengembang OpenBSD (#1, #6).
4. ssh-keygen menghasilkan pasangan kunci publik dan privat untuk autentikasi SSH (#5).
5. Tipe kunci yang didukung: RSA (1977), DSA (1991, deprecated 2013), ECDSA (1999), Ed25519 (2011) (#5).
6. Default RSA = 3072-bit, Ed25519 = 256-bit (#5).
7. Ed25519 dirancang oleh Daniel J. Bernstein, Niels Duif, Tanja Lange, Peter Schwabe, dan Bo-Yin Yang, dipublikasikan 26 September 2011 (#2).
8. Ed25519 menggunakan twisted Edwards curve (edwards25519), field 2^255 - 19 (#2).
9. Keamanan Ed25519 256-bit setara RSA ~3000-bit — kunci ~94x lebih kecil (#2).
10. Ed25519 menggunakan nonce deterministik, menghilangkan risiko kebocoran kunci akibat RNG rusak (kasus PlayStation 3) (#7).
11. Ed25519 distandarkan di RFC 8032 (Januari 2017) dan FIPS 186-5 (Februari 2023) (#7).
12. GitHub merekomendasikan Ed25519 untuk SSH key baru; perintah: `ssh-keygen -t ed25519 -C "email"` (#3).
13. Kunci tersimpan di `~/.ssh/id_ed25519` (privat) dan `~/.ssh/id_ed25519.pub` (publik) (#3).
14. GitHub menghapus autentikasi password untuk operasi Git pada 13 Agustus 2021 (#4).
15. Pengganti password: personal access token, OAuth token, GitHub App installation token, atau SSH key (#4).
16. GitHub tidak lagi mendukung kunci DSA (ssh-dss) sejak 15 Maret 2022 (#3).

## Perselisihan / Kontroversi

- **Judul/hook akurat?** Ya. SSH key memang di-setup sekali dan bertahan selama kunci privat masih ada di mesin. Klaim "seumur hidup" sedikit hiperbolik — kunci bisa hilang jika mesin diganti tanpa backup, atau standar kriptografi berubah. Naskah perlu menyebut tips backup di bagian keamanan.
- **RSA vs Ed25519**: RSA masih aman di ukuran ≥3072-bit, tapi Ed25519 lebih cepat dan lebih kecil. Bukan "RSA sudah mati", tapi Ed25519 lebih direkomendasikan untuk setup baru.

## Angka kunci untuk HUD

| Angka/Tahun/Nama | Konteks | # sumber |
|---|---|---|
| 1995 | Tahun SSH diciptakan | #1 |
| 256-bit | Ukuran kunci Ed25519 | #2, #5 |
| 3072-bit | Ukuran default kunci RSA | #5 |
| 94x | Ed25519 lebih kecil dari RSA untuk keamanan setara | #2 |
| 13 Agustus 2021 | GitHub hapus password auth | #4 |
| 3 langkah | Setup SSH key (generate, add agent, add GitHub) | #3 |

## Poin kunci

1. SSH key menggantikan password dengan pasangan kunci kriptografi — kunci privat di komputer, kunci publik di server.
2. Ed25519 adalah standar terbaru: 256-bit, lebih cepat, lebih aman, lebih kecil dari RSA.
3. Setup hanya 3 langkah: generate key, tambah ke ssh-agent, copy publik ke GitHub.
4. Sekali setup, tidak perlu ketik password lagi untuk git push/pull.
5. Passphrase opsional menambah lapisan keamanan jika mesin dicuri.
6. GitHub sendiri sudah menghapus password auth sejak 2021 — SSH key atau token wajib.
