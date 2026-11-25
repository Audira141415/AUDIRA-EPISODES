# Research Report — REST vs GraphQL: Kapan Harus Pakai yang Mana

Tanggal riset: 2026-11-25. Semua sumber primer/resmi (lihat SOURCE_REGISTER.md).

## Sumber utama
Meta Engineering (Lee Byron, 2015), disertasi Fielding (2000), graphql.org (foundation, HTTP, caching, queries), GitHub Docs (batas GraphQL dan REST), MDN.

## Fakta terverifikasi
1. REST dirumuskan Roy Fielding dalam disertasi tahun 2000 (#3, #10).
2. GraphQL lahir dari pembangunan ulang aplikasi mobile native Facebook pada 2012, untuk API data News Feed (#1, #4).
3. GraphQL mulai dibuka (open source) pada 2015 (#2, #4); GraphQL Foundation 2019 di bawah Linux Foundation (#4).
4. Facebook menyebut layanan RESTful dapat butuh beberapa round-trip untuk mengikuti relasi objek, boros di jaringan seluler (#2).
5. GraphQL umumnya satu endpoint /graphql lewat POST; hasil berbentuk sama dengan query (#5, #7).
6. Di REST, URL jadi kunci cache; GraphQL tidak punya itu, perlu ID unik (#6).
7. GitHub GraphQL: 5.000 poin/jam, maks 500.000 node per panggilan (#8); REST GitHub: 5.000 permintaan/jam (#9). Angka per 2026-11-25.

## Perselisihan / Kontroversi
- Judul/hook "refactor ulang 6 bulan" adalah klaim retoris, tidak ada sumber. Di naskah hanya dipakai sebagai hook, bukan fakta; jangan tampilkan sebagai statistik.
- Soal over-fetching/under-fetching: sumber primer hanya menyebut round-trip ganda (#2). Istilah itu tidak diklaim di naskah.
- "GraphQL lebih cepat dari REST" tidak didukung sumber; tidak dinarasikan. Pilihan bergantung konteks.
- Batas GitHub bisa berubah; tulis "per 2026-11-25" di HUD.

## Angka kunci untuk HUD
| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| 2000 | Disertasi Fielding, lahirnya REST | 3 |
| 2012 | Facebook membangun ulang aplikasi mobile | 1, 4 |
| 2015 | GraphQL dibuka untuk umum | 2, 4 |
| 5.000 poin/jam | Batas GraphQL GitHub (per 2026-11-25) | 8 |
| 500.000 node | Maks satu panggilan GraphQL GitHub | 8 |
| /graphql | Endpoint tunggal | 5 |

## Poin kunci
- REST: banyak URL, cache alami. GraphQL: satu pintu, klien menentukan bentuk data, cache butuh ID.
- Pilih dari kebutuhan: banyak klien dan data berelasi cenderung GraphQL; API sederhana dan publik cukup REST.
- Visual tanpa wajah orang dan tanpa logo organisasi (rule 15); sebut "GitHub"/"Facebook" sebagai teks saja.
