# Source Register — Git Rebase vs Merge: Mana yang Harus Kamu Pakai

> Standar EP01 Makkah: minimum 5 sumber, ≥ 3 HIGH. Pipeline guard blokir jika < 5 sumber.

| # | Fakta | Sumber (judul, penulis, tahun) | URL | Tanggal baca | Level |
|---|---|---|---|---|---|
| 1 | Rebase membuat history terlihat linear; hasil akhir (snapshot) sama dengan merge, hanya history yang beda | Pro Git, bab "Git Branching - Rebasing", Scott Chacon & Ben Straub | https://git-scm.com/book/en/v2/Git-Branching-Rebasing | 2026-11-25 | HIGH |
| 2 | Peringatan resmi: jangan rebase commit yang sudah ada di luar repositorymu dan jadi dasar kerja orang lain; kolaborator harus re-merge dan jadi berantakan | Pro Git, "The Perils of Rebasing", Chacon & Straub | https://git-scm.com/book/en/v2/Git-Branching-Rebasing | 2026-11-25 | HIGH |
| 3 | Branch hasil rebase tersusun dari commit baru (bukan commit lama dipindah) | git-rebase documentation, Git project | https://git-scm.com/docs/git-rebase | 2026-11-25 | HIGH |
| 4 | git merge --no-ff selalu membuat merge commit, bahkan saat bisa fast-forward; fast-forward tidak membuat merge commit | git-merge documentation, Git project | https://git-scm.com/docs/git-merge | 2026-11-25 | HIGH |
| 5 | Tombol Merge pull request di GitHub memakai --no-ff; merge commit menyimpan semua commit; squash menggabungkan semua commit PR jadi satu commit | About pull request merges, GitHub Docs, 2026 | https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/about-pull-request-merges | 2026-11-25 | HIGH |
| 6 | Interactive rebase bisa squash/fixup commit jadi satu | About Git rebase, GitHub Docs | https://docs.github.com/en/get-started/using-git/about-git-rebase | 2026-11-25 | MEDIUM |
| 7 | Opsi --force-with-lease tersedia di git push untuk push paksa yang lebih aman | git-push documentation, Git project | https://git-scm.com/docs/git-push | 2026-11-25 | HIGH |
