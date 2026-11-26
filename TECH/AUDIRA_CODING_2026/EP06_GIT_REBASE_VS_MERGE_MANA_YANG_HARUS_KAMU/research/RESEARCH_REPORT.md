# Research Report — Git Rebase vs Merge: Mana yang Harus Kamu Pakai

## Sumber utama
Pro Git (git-scm.com), dokumentasi git-rebase, git-merge, git-push, GitHub Docs (#1-#7 di SOURCE_REGISTER). Semua dibaca 2026-11-25 via curl.

## Fakta terverifikasi
1. Rebase membuat history tampak linear, seolah semua kerja berurutan walau aslinya paralel (#1).
2. Snapshot akhir rebase dan merge sama; yang beda hanya history (#1).
3. Rebase menghasilkan commit baru, bukan memindahkan commit lama (#3).
4. Jangan rebase commit yang sudah dipush dan dipakai orang lain; kolaborator harus re-merge (#2).
5. Merge membuat merge commit; --no-ff memaksanya, fast-forward tidak membuatnya (#4).
6. GitHub "Merge pull request" memakai --no-ff; "Squash and merge" jadi satu commit (#5).
7. Interactive rebase bisa squash/fixup (#6).
8. git push --force-with-lease adalah opsi push paksa yang lebih aman (#7).

## Perselisihan / Kontroversi
- Judul "jawaban salah bikin history jadi spaghetti" itu opini, bukan fakta; merge dan rebase sama-sama valid. Koreksi: hasil kode akhir identik, beda di bentuk history dan risiko. Naskah dibingkai sebagai "pilih sesuai situasi", bukan satu jawaban benar.
- Tim berbeda: sebagian suka history linear (rebase/squash), sebagian suka merge commit karena menyimpan konteks. Tidak ada konsensus resmi; dokumentasi GitHub sendiri menyebut "choose when" per strategi.

## Angka kunci untuk HUD
| Angka/nama | Konteks | # sumber |
|---|---|---|
| --no-ff | flag yang memaksa merge commit | 4, 5 |
| --force-with-lease | push paksa lebih aman | 7 |
| 1 commit | hasil squash and merge | 5 |
| Snapshot sama | hasil akhir rebase = merge | 1 |

## Poin kunci
- Hasil akhir kode sama, beda di history.
- Rebase = commit baru; aman untuk branch lokal/pribadi.
- Aturan emas: jangan rebase yang sudah dibagikan.
- Merge = aman untuk branch bersama, history bercabang.
- Visual 2D (diagram graf commit) cocok.
