# Research Report — Monorepo vs Polyrepo: Mana yang Lebih Baik untuk Tim Kamu

## Sumber utama
- Potvin & Levenberg, "Why Google Stores Billions of Lines of Code in a Single Repository", CACM 2016 (#1–#3) — sumber primer dari pihak yang menjalankan monorepo terbesar.
- Jaspan dkk., "Advantages and Disadvantages of a Monolithic Repository: A Case Study at Google", ICSE-SEIP 2018 (#4) — studi peer-reviewed, survei engineer yang pernah memakai kedua model.
- Brian Harry, "The largest Git repo on the planet", Microsoft DevBlogs 2017 (#5) — laporan resmi migrasi Windows ke Git.
- Wikipedia "Monorepo" (#6, #7) — ringkasan sekunder plus daftar build tool.
- Matt Klein, "Monorepos: Please don't!", 2019 (#8) — kontra-argumen paling sering dikutip.

## Fakta terverifikasi
1. Monorepo = banyak proyek dalam satu repositori; polyrepo = tiap proyek punya repo sendiri (#6).
2. Januari 2015, repo Google ±86 TB, ±2 miliar baris kode, ±35 juta commit (#1).
3. Repo Google dipakai >25.000 developer; per hari kerja 16.000 perubahan manusia + 24.000 otomatis (#2).
4. Google membangun version control sendiri bernama Piper karena tidak ada sistem komersial/open source yang sanggup (#2).
5. Penulis Google sendiri menyebut monorepo "not for everyone", cocok untuk budaya terbuka; biayanya investasi tooling, kompleksitas, dan code health (#3).
6. Survei engineer (2018): monorepo unggul di visibilitas kode dan dependensi terpusat; multi-repo unggul di kebebasan toolchain, kontrol akses, stabilitas (#4).
7. 2017: Windows (±3,5 juta file, ±300 GB, ±4.000 engineer) dipindah ke satu repo Git dengan GVFS (#5).
8. Monorepo butuh build tool berbasis grafik dependensi (Bazel, Buck, Pants) agar tidak membangun ulang semuanya (#7).
9. Kritik Klein (2019): di skala besar monorepo tetap harus menyelesaikan masalah polyrepo, plus tight coupling dan skalabilitas VCS (#8).

## Perselisihan / Kontroversi
- **Hook TOPIC.md tidak sepenuhnya akurat.** Hook "Jawaban berbeda tergantung ukuran tim dan kecepatan deploy" tidak didukung sumber. Sumber primer (#3, #4) menyebut faktor penentu sebagai budaya keterbukaan kode, kesiapan investasi tooling/build system, kebutuhan kontrol akses, dan kebebasan toolchain, bukan ukuran tim atau kecepatan deploy. Ukuran tim bukan penentu: Google (>25.000 developer) memakai monorepo, sementara Klein menyarankan polyrepo justru untuk skala besar. Judul tidak diubah; naskah memakai faktor yang terverifikasi.
- Monorepo ≠ monolith: kode dalam satu repo tidak berarti aplikasinya satu aplikasi besar (#3, #6).
- Klein (#8) adalah opini individu; disajikan sebagai pendapat dengan nama dan tahun.
- Angka Google adalah snapshot 2015 dan angka Microsoft snapshot 2017; tidak ada angka resmi terbaru yang terverifikasi.

## Angka kunci untuk HUD
| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| 2 miliar baris | Kode di repo Google, Jan 2015 | 1 |
| 86 TB | Ukuran repo Google, Jan 2015 | 1 |
| 25.000+ developer | Pengguna repo Google | 2 |
| 16.000 + 24.000 / hari | Perubahan manusia + otomatis per hari kerja | 2 |
| Piper | Version control internal Google | 2 |
| 3,5 juta file · 300 GB | Kode Windows di Git, 2017 | 5 |
| 4.000 engineer | Tim Windows, 2017 | 5 |
| 2018 | Survei engineer Google (Jaspan dkk.) | 4 |
| 2019 | "Monorepos: Please don't!" (Klein) | 8 |

## Poin kunci
- Tidak ada pemenang mutlak; dua perusahaan raksasa memakai monorepo, tapi penulisnya sendiri bilang bukan untuk semua orang.
- Pilih monorepo bila tim siap investasi tooling dan nyaman kode terbuka lintas tim.
- Pilih polyrepo bila butuh batas akses tegas, kebebasan tool per tim, dan stabilitas per proyek.
- Visual: tanpa logo Google/Microsoft/Lyft (rule 15); nama perusahaan cukup sebagai teks name plate.
