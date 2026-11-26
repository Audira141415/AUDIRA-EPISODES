# Naskah — Git Rebase vs Merge: Mana yang Harus Kamu Pakai

> DRAF pra-produksi (backlog, 2026-11-25). Difinalkan di tahap 4 setelah style dipilih.
> Short: 190–210 kata @135–150 WPM.

## c00_hook — Hook

- Kata: **12** · estimasi **5 dtk**
- Visual: dua jalur commit berbentuk graf, satu lurus rapi, satu bercabang kusut; teks "REBASE vs MERGE"

> Rebase atau merge? Pilih yang salah, dan history repo timmu jadi kusut.

## c01_intro — Intro

- Visual: graf commit branch main dan fitur berpisah; callout "dua cara menyatukan"

> Branch fiturmu mau disatukan ke main. Git punya dua cara: merge dan rebase. Kode akhirnya sama persis. Yang beda cuma bentuk history-nya. AUDIRA bedah keduanya.

## c02 — Merge

- Visual: dua cabang bertemu di satu titik, muncul node merge commit; HUD "--no-ff"

> Merge menyatukan dua cabang lewat satu merge commit. Semua commit lama tetap utuh. Dengan opsi no-ff, Git selalu membuat merge commit. Tombol merge pull request di GitHub juga begitu.

## c03 — Rebase

- Visual: commit fitur terangkat lalu dipasang ulang di ujung main; commit lama pudar, commit baru bercahaya

> Rebase beda. Commit-mu diangkat, lalu dipasang ulang di ujung main. History jadi lurus. Tapi hasilnya commit baru dengan hash baru. Kodenya sama, identitas commit-nya berubah.

## c04 — Bahaya

- Visual: dua developer, graf commit berbenturan; tanda larangan merah di commit yang sudah dipush

> Bahayanya di sini. Dokumentasi Pro Git bilang: jangan rebase commit yang sudah dipakai orang lain. Rekan setimmu harus re-merge, dan semuanya berantakan. Terpaksa push ulang? Pakai force-with-lease.

## c05 — Squash

- Visual: lima commit kecil menyusut jadi satu; HUD "1 commit"

> Opsi ketiga di GitHub: squash and merge. Semua commit di pull request jadi satu commit. History ringkas, tapi commit perantara tidak tersimpan terpisah.

## c06 — Penjelasan

- Visual: tabel keputusan dua kolom, ikon centang untuk lokal dan pribadi, ikon tim untuk bersama

> Aturan praktisnya: branch pribadi yang belum dipush, rebase boleh. Branch yang dipakai bareng, merge. Mau sebersih mungkin, squash.

## c07_payoff — Payoff + outro

- Visual: dua graf berakhir di titik yang sama, lalu kartu outro AUDIRA

> Intinya, tidak ada jawaban tunggal. Kodenya sama, yang kamu pilih adalah bentuk history dan risikonya. Rebase untuk milikmu sendiri, merge untuk yang sudah dibagi. Simpan video ini sebelum tabrakan history berikutnya. Ikuti AUDIRA untuk bedah teknologi lainnya.

## Opsi hook lain

1. Kodenya sama persis. Tapi satu perintah Git ini bisa bikin timmu bertengkar.
2. Jangan pernah rebase ini. Dokumentasi resmi Git sendiri yang bilang.

## Total

- **196 kata** ≈ **82 dtk** (@143 WPM)
