# Source Register — Monorepo dengan Turborepo: Setup untuk Tim JavaScript

> Standar EP01 Makkah: minimum 5 sumber, ≥ 3 HIGH. Pipeline guard blokir jika < 5 sumber.

| # | Fakta | Sumber (judul, penulis, tahun) | URL | Tanggal baca | Level |
|---|---|---|---|---|---|
| 1 | Turborepo menjadwalkan tugas dan memparalelkan kerja di semua core yang tersedia; memakai scripts package.json yang sudah ada plus satu file turbo.json; jalan dengan npm, yarn, atau pnpm | Introduction, dokumentasi resmi Turborepo (Vercel), diperbarui 2026-11-20 | https://turborepo.dev/docs | 2026-11-25 | HIGH |
| 2 | Input tugas di-hash jadi "fingerprint"; run pertama = cache miss; yang disimpan: file output (kunci `outputs` di turbo.json) dan log; cache hit memulihkan file; tanpa `outputs` file hasil tidak di-cache | Caching, dokumentasi resmi Turborepo, 2026 | https://turborepo.dev/docs/crafting-your-repository/caching | 2026-11-25 | HIGH |
| 3 | Cache bawaan hanya lokal di satu mesin; Remote Cache berbagi cache ke tim dan CI; gratis; bisa Vercel atau self-hosted; log diperlakukan sebagai artefak | Remote Caching, dokumentasi resmi Turborepo, 2026 | https://turborepo.dev/docs/core-concepts/remote-caching | 2026-11-25 | HIGH |
| 4 | Vercel Remote Cache gratis di semua paket, bahkan bila aplikasi tidak di-host di Vercel | Remote Caching, dokumentasi resmi Turborepo (merujuk Vercel docs), 2026 | https://turborepo.dev/docs/core-concepts/remote-caching | 2026-11-25 | HIGH |
| 5 | Struktur repo dibangun di atas workspaces package manager; contoh folder `apps/` dan `packages/` plus `pnpm-workspace.yaml` | Structuring a repository, dokumentasi resmi Turborepo, 2026 | https://turborepo.dev/docs/crafting-your-repository/structuring-a-repository | 2026-11-25 | HIGH |
| 6 | Vercel mengumumkan akuisisi Turborepo pada 9 Desember 2021 | Vercel acquires Turborepo to accelerate build speed and improve developer experience, Guillermo Rauch dan Jared Palmer, Vercel, 2021 | https://vercel.com/blog/vercel-acquires-turborepo | 2026-11-25 | HIGH |
| 7 | Turborepo bermigrasi dari Go ke Rust (artikel 7 Maret 2023) | Why Turborepo is migrating from Go to Rust, Anthony Shew dkk., Vercel, 2023 | https://vercel.com/blog/turborepo-migration-go-rust | 2026-11-25 | MEDIUM |
| 8 | Repo GitHub vercel/turborepo: bahasa utama Rust, lisensi MIT, dibuat 2021-10-05 (per API GitHub 2026-11-25) | GitHub REST API, repositori vercel/turborepo | https://api.github.com/repos/vercel/turborepo | 2026-11-25 | MEDIUM |
| 9 | Paket internal punya tiga strategi kompilasi, dua di antaranya Just-in-Time dan Compiled | Internal Packages, dokumentasi resmi Turborepo, 2026 | https://turborepo.dev/docs/core-concepts/internal-packages | 2026-11-25 | MEDIUM |
