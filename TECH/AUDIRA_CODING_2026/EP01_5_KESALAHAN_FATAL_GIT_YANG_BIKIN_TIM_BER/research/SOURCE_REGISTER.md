# Source Register — 5 Kesalahan Fatal Git yang Bikin Tim Berantem

> Standar EP01 Makkah: minimum 5 sumber, ≥ 3 HIGH. Pipeline guard blokir jika < 5 sumber.

| # | Fakta | Sumber (judul, penulis, tahun) | URL | Tanggal baca | Level |
|---|---|---|---|---|---|
| 1 | `git push --force` "can cause the remote repository to lose commits"; `--force-with-lease` hanya menimpa bila nilai remote sama dengan remote-tracking branch lokal | git-push Documentation, Git project (git-scm.com), versi terkini | https://git-scm.com/docs/git-push | 2026-11-25 | HIGH |
| 2 | Aturan rebase: "Do not rebase commits that exist outside your repository and that people may have based work on" | Pro Git 2nd ed., §3.6 Git Branching – Rebasing, Scott Chacon & Ben Straub, 2014 | https://git-scm.com/book/en/v2/Git-Branching-Rebasing | 2026-11-25 | HIGH |
| 3 | `git reset --hard` menimpa semua file dan direktori di working tree dengan versi `<commit>`; file terlacak yang tidak ada di commit dihapus | git-reset Documentation, Git project (git-scm.com), versi terkini | https://git-scm.com/docs/git-reset | 2026-11-25 | HIGH |
| 4 | Reflog: entri default kedaluwarsa 90 hari (`gc.reflogExpire`); entri yang tidak terjangkau dari ujung branch default 30 hari (`gc.reflogExpireUnreachable`) | git-reflog Documentation, Git project (git-scm.com), versi terkini | https://git-scm.com/docs/git-reflog | 2026-11-25 | HIGH |
| 5 | Bila data sensitif berupa secret, langkah pertama adalah revoke/rotate; data tidak bisa dihapus dari clone milik orang lain | Removing sensitive data from a repository, GitHub Docs, versi terkini | https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository | 2026-11-25 | HIGH |
| 6 | 23,8 juta secret bocor di repo publik GitHub sepanjang 2024 (naik 25% YoY); 35% repo privat berisi secret; 70% secret yang bocor masih aktif 2 tahun kemudian | The State of Secrets Sprawl 2025, GitGuardian, 2025 | https://blog.gitguardian.com/the-state-of-secrets-sprawl-2025/ | 2026-11-25 | MEDIUM |
| 7 | Branch protection: secara default menonaktifkan force push dan penghapusan branch; bisa mewajibkan review pull request sebelum merge | About protected branches, GitHub Docs, versi terkini | https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches | 2026-11-25 | HIGH |
| 8 | "Golden rule" rebase: jangan pakai di branch publik | Merging vs. Rebasing, Atlassian Git Tutorials, t.t. | https://www.atlassian.com/git/tutorials/merging-vs-rebasing | 2026-11-25 | MEDIUM |
| 9 | Feature branch workflow: kerja di branch khusus sehingga main tidak berisi kode rusak; perubahan masuk lewat pull request | Git Feature Branch Workflow, Atlassian Git Tutorials, t.t. | https://www.atlassian.com/git/tutorials/comparing-workflows/feature-branch-workflow | 2026-11-25 | MEDIUM |
