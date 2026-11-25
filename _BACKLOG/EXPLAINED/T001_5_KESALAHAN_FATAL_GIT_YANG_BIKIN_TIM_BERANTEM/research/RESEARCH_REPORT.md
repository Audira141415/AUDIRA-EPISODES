# Research Report — 5 Kesalahan Fatal Git yang Bikin Tim Berantem

## Sumber utama
- Dokumentasi resmi Git: git-push, git-reset, git-reflog (#1, #3, #4).
- Pro Git (Chacon & Straub), bab Rebasing (#2).
- GitHub Docs: removing sensitive data, protected branches (#5, #7).
- GitGuardian, State of Secrets Sprawl 2025 (#6), laporan vendor keamanan (data sendiri, metodologi pemindaian commit publik).
- Atlassian Git Tutorials (#8, #9) sebagai pendukung.

## Fakta terverifikasi
1. `git push --force` bisa membuat remote kehilangan commit; dokumentasi menyuruh memakainya dengan hati-hati (#1).
2. `--force-with-lease` hanya menimpa ref remote bila nilainya masih sama dengan remote-tracking branch lokal, jadi kerja orang lain yang belum di-fetch tidak tertimpa diam-diam (#1).
3. Pro Git: jangan rebase commit yang sudah ada di luar repo kamu dan mungkin jadi dasar kerja orang lain (#2). Atlassian menyebutnya "golden rule" rebase (#8).
4. `git reset --hard` menimpa working tree dengan isi commit tujuan; perubahan yang belum di-commit hilang (#3).
5. Reflog menyimpan jejak posisi HEAD/branch; default 90 hari, dan 30 hari untuk entri yang sudah tidak terjangkau dari ujung branch (#4). Ini jalan penyelamatan setelah reset atau rebase yang salah.
6. Secret yang ter-commit harus di-revoke/rotate dulu; menulis ulang riwayat tidak menghapus salinan di clone orang lain (#5).
7. Pada 2024, 23,8 juta secret bocor di repo publik GitHub, naik 25% dari tahun sebelumnya; 70% secret yang bocor masih aktif dua tahun kemudian (#6).
8. Branch protection GitHub secara default memblokir force push dan penghapusan branch, dan bisa mewajibkan review PR (#7).
9. Feature branch workflow menjaga main bebas kode rusak; perubahan masuk lewat PR (#9).

## Perselisihan / Kontroversi
- **Hook "sampai production down" berlebihan.** Kesalahan Git sendiri tidak menjatuhkan production. Production baru terdampak bila branch (biasanya main) di-deploy otomatis lewat CI/CD, atau bila secret yang bocor disalahgunakan. Naskah memakai versi yang lebih jujur: "kalau main dipakai buat deploy otomatis".
- **Hook campur bahasa** ("mereka doing ini"): diganti bahasa lisan Indonesia penuh.
- **"5 kesalahan fatal" adalah daftar editorial**, bukan peringkat dari studi. Naskah tidak menyebut "paling sering" sebagai klaim statistik.
- **"Developer junior"**: tidak ada data bahwa kesalahan ini khas junior; naskah tidak menyalahkan junior.
- Angka GitGuardian berasal dari vendor yang menjual produk deteksi secret (level MEDIUM). Sebut sumbernya di layar.
- Batas 30 hari reflog adalah default konfigurasi; bisa diubah dan bisa lebih cepat hilang bila `git gc` dijalankan dengan setelan lain. Narasi memakai kata "biasanya" dan "default".
- Rule 15 (EXPLAINED): jangan tampilkan logo GitHub, GitGuardian, Atlassian, atau logo Git. Pakai teks name plate saja.

## Angka kunci untuk HUD
| Angka / tahun / nama | Konteks | # sumber |
|---|---|---|
| 23,8 juta | secret bocor di repo publik GitHub, 2024 | 6 |
| 2024 | tahun data GitGuardian | 6 |
| 70% | secret bocor masih aktif 2 tahun kemudian | 6 |
| `--force` / `--force-with-lease` | perintah push | 1 |
| Pro Git | buku resmi Git, aturan rebase | 2 |
| `reset --hard` | perintah yang menimpa working tree | 3 |
| 30 hari | default simpan reflog untuk commit lepas | 4 |
| branch protection | blokir force push default | 7 |

## Poin kunci
- Lima kesalahan: commit secret, force push ke branch bersama, rebase branch publik, push langsung ke main, reset --hard tanpa cadangan.
- Tiap kesalahan punya penangkal konkret: rotate key + .gitignore, `--force-with-lease`, rebase hanya branch lokal, branch protection + PR, reflog.
- Payoff: masalahnya kebiasaan, bukan Git.
