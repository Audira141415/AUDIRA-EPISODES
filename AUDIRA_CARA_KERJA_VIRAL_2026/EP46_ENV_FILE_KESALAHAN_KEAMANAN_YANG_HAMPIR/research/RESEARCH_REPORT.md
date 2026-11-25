# Research Report — .env File: Kesalahan Keamanan yang Hampir Semua Junior Developer Lakukan

## Sumber utama
- Pengumuman resmi Toyota soal T-Connect, 2022 (#3), FTC soal Uber, 2018 (#5): bukti kasus nyata access key bocor lewat kode publik.
- Dokumentasi resmi GitHub (#6, #8) dan Git (#7): mekanisme .gitignore, langkah revoke/rotate, push protection.
- GitGuardian State of Secrets Sprawl 2025 (#1, #2): data skala kebocoran. Laporan vendor keamanan, jadi level MEDIUM.
- Twelve-Factor App (#9): asal-usul praktik menyimpan konfigurasi di environment variable (latar belakang file .env).
- Catatan metode: WebFetch/WebSearch error saat riset; halaman diambil lewat curl. Halaman FTC dan Toyota diblokir untuk curl, jadi dibaca dari arsip Wayback Machine (snapshot 2026).

## Fakta terverifikasi
1. GitGuardian mendeteksi 23.770.171 rahasia baru di commit GitHub publik sepanjang 2024, naik 25% (#1).
2. 15% penulis commit yang dipindai pernah membocorkan rahasia (#1).
3. 70% rahasia yang bocor pada 2022 masih valid saat laporan 2025 terbit (#2).
4. Toyota: sebagian kode situs T-Connect ada di GitHub dan memuat access key ke data server; terbuka Desember 2017 sampai 15 September 2022; 296.019 data (email + nomor pelanggan) berpotensi bocor; kunci diganti 17 September 2022 (#3). Kesalahan subkontraktor pengembang (#4).
5. Uber, November 2016: access key yang diposting insinyur Uber di situs berbagi kode dipakai penyusup mengunduh file berisi lebih dari 25 juta nama dan email (#5).
6. GitHub Docs: bila secret ter-commit, langkah pertama revoke dan/atau rotate (#6). Menghapus dari riwayat perlu rewrite history (#6).
7. .gitignore tidak berpengaruh pada file yang sudah dilacak Git (#7).
8. Push protection GitHub mencegah kredensial ter-push sebelum masuk repositori (#8).
9. Praktik env var: kode harus bisa dibuka publik kapan saja tanpa membocorkan kredensial (#9).

## Perselisihan / Kontroversi
- **Judul tidak akurat ("hampir semua junior developer")**: tidak ada data yang mengukur persentase junior developer. Data terdekat: 15% penulis commit di GitHub publik pernah membocorkan rahasia (#1), tanpa pembagian senioritas. Koreksi untuk naskah: sebut "kesalahan klasik", jangan "hampir semua". Judul tidak diubah (keputusan backlog), tapi VO tidak boleh mengklaim "hampir semua".
- **Hook ("satu commit bisa expose API key ke seluruh internet")**: akurat hanya bila repositori publik. Repo privat tidak terbaca publik. Naskah menyebut "repositori publik".
- **Kasus Toyota dan Uber bukan file .env**: Toyota = access key di dalam source code (#3); Uber = access key diposting di situs berbagi kode (#5; FTC tidak menyebut nama situsnya). Naskah menyebut keduanya sebagai "kunci di dalam kode", bukan ".env bocor". Jangan sebut "GitHub" untuk Uber.
- **Angka GitGuardian** adalah data vendor keamanan yang menjual produk secret scanning; dibacakan sebagai "menurut GitGuardian".
- **70% masih valid**: diukur saat laporan 2025, bukan "hari ini" (2026). Naskah menyebut "saat laporannya terbit".

## Angka kunci untuk HUD
| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| 23,8 juta | rahasia baru bocor di GitHub publik, 2024 | 1 |
| 70% | rahasia bocor 2022 masih valid saat laporan 2025 | 2 |
| Des 2017 – 15 Sep 2022 | kunci Toyota T-Connect terbuka di GitHub | 3 |
| 296.019 | data pelanggan T-Connect berpotensi bocor | 3 |
| 2016 | kebocoran Uber lewat access key | 5 |
| 25 juta | nama + email terunduh dari cloud Uber | 5 |
| .gitignore | tidak berlaku untuk file yang sudah dilacak | 7 |
| Push protection | blokir kunci sebelum ter-push | 8 |

## Poin kunci
- File .env berguna (memisah rahasia dari kode), bahayanya muncul saat ikut ter-commit ke repo publik.
- Skala masalah besar dan kunci bocor jarang diganti (70% masih valid).
- Kasus nyata: Toyota (hampir 5 tahun terbuka) dan Uber (25 juta data).
- Jebakan teknis: hapus di commit berikutnya tidak menghapus riwayat; .gitignore telat tidak berpengaruh pada file yang sudah dilacak.
- Solusi urut: cabut/ganti kunci dulu, baru bersihkan riwayat; .gitignore sejak commit pertama; aktifkan push protection.
