# Research Report — Monorepo dengan Turborepo: Setup untuk Tim JavaScript

## Sumber utama
Dokumentasi resmi Turborepo (turborepo.dev/docs, diperbarui 2026-11-20), blog Vercel (akuisisi 2021, migrasi Go ke Rust 2023), API GitHub repo vercel/turborepo. Detail di `SOURCE_REGISTER.md` (9 sumber: 6 HIGH, 3 MEDIUM).

## Fakta terverifikasi
1. Turborepo menjadwalkan tugas dan memparalelkan di semua core; memakai scripts package.json dan satu turbo.json; kompatibel npm/yarn/pnpm (#1).
2. Input tugas di-hash; run pertama cache miss; output file dan log disimpan; cache hit memulihkan keduanya (#2).
3. Tugas tanpa `outputs` tidak menyimpan file hasilnya (#2).
4. Cache bawaan lokal; Remote Cache berbagi ke tim dan CI; log juga artefak, jangan cetak rahasia (#3).
5. Remote Cache Vercel gratis di semua paket; bisa self-host (#3, #4).
6. Struktur umum: `apps/`, `packages/`, `pnpm-workspace.yaml`; Turborepo di atas workspace package manager (#5).
7. Vercel mengumumkan akuisisi Turborepo 9 Desember 2021 (#6).
8. Migrasi Go ke Rust dijelaskan Maret 2023; repo kini berbahasa utama Rust (#7, #8).

## Perselisihan / Kontroversi
- Judul/hook "Shared code tanpa shared chaos" adalah slogan, bukan klaim fakta: aman. Koreksi konsep: Turborepo BUKAN pembuat monorepo atau package manager; ia build system di atas workspaces. Naskah menyatakan ini.
- Klaim kecepatan ("85% atau lebih" di blog 2021, "80 ms" di ilustrasi docs) adalah materi pemasaran/ilustrasi, tidak dipakai sebagai angka di naskah.
- Tagline resmi sekarang "build system for coding agents"; tagline lama berbeda. Cepat berubah, tidak dipakai.

## Angka kunci untuk HUD
| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| turbo.json | satu file konfigurasi tugas | 1 |
| apps/ dan packages/ | struktur folder | 5 |
| cache miss / cache hit | alur hash | 2 |
| Remote Cache gratis | semua paket Vercel | 3, 4 |
| Desember 2021 | akuisisi oleh Vercel | 6 |

## Poin kunci
- Monorepo lambat karena tiap paket punya tes, lint, build sendiri; Turborepo memangkas dengan cache hash dan paralelisme.
- Remote Cache = pembeda untuk tim dan CI.
- Jebakan: lupa `outputs`, dan log tercetak ikut tersimpan.
- Awet: fitur inti stabil; hindari nomor versi dan tagline.
