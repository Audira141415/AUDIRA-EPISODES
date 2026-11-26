# Research Report — Redis Bukan Cuma Cache: Fitur yang Jarang Developer Tahu

## Sumber utama

- Dokumentasi resmi Redis (redis.io/docs): halaman perintah LMOVE, PUBLISH, XADD, INCR, ZADD, GEOADD, serta halaman tipe data Pub/Sub, Streams, Sorted sets, HyperLogLog (#2–#10). Sumber primer, versi "latest" per 2026-11-25.
- Siaran pers Linux Foundation soal Valkey (#11) dan blog resmi Redis soal AGPLv3 (#12).
- Wikipedia "Redis" (#1) hanya untuk tahun rilis dan definisi umum (MEDIUM).

## Fakta terverifikasi

1. Redis adalah database key-value yang menyimpan data di memori; rilis pertama 2009 (#1).
2. List Redis bisa jadi antrean tugas; pola resmi "reliable queue" memindahkan item ke list cadangan dengan LMOVE (sejak 6.2.0) supaya tugas tidak hilang saat worker gagal (#2).
3. Pub/Sub tersedia sejak 2.0.0; semantiknya at-most-once, subscriber yang terputus kehilangan pesan (#3, #4).
4. Streams (sejak 5.0.0) adalah log append-only dengan consumer group; pesan tersimpan dan mendukung at-least-once (#3, #5, #6).
5. Rate limiter resmi: INCR counter per IP per detik + EXPIRE; contoh dokumentasi maksimal 10 request/detik (#7).
6. Sorted set untuk leaderboard; ZADD sejak 1.2.0 (#8).
7. GEOADD untuk data lokasi sejak 3.2.0 (#9).
8. HyperLogLog: maksimal 12 KB memori, standard error 0,81% (#10).
9. Lisensi: Valkey di-fork dari Redis 7.2.4 (28 Maret 2024); Redis 8 menambah opsi AGPLv3 (Mei 2025) (#11, #12).

## Perselisihan / Kontroversi

- **Koreksi hook TOPIC.md** ("Queue, pub/sub, rate limiting — semua bisa pakai Redis"): benar secara teknis, tapi Pub/Sub Redis at-most-once (#3), jadi bukan pengganti message queue yang tahan gagal. Untuk antrean andal pakai list + LMOVE atau Streams + consumer group. Naskah sudah menyebut batasan ini.
- **Koreksi judul** ("fitur yang jarang developer tahu"): klaim "jarang tahu" tidak punya data survei; semua fitur ini terdokumentasi resmi sejak lama (ZADD 1.2.0, PUBLISH 2.0.0). Naskah tidak menarasikan statistik "jarang tahu".
- Klaim lama "seperempat" / persentase pemakaian fitur tidak dipakai sebagai fakta; di hook hanya retorika tanpa angka.
- Status lisensi Redis berubah 2024–2025 (#11, #12). Tidak dinarasikan di VO; bila dipakai, sebut "per Mei 2025".
- Angka versi bisa berubah di dokumentasi; tulis "per dokumentasi redis.io, 2026-11-25".

## Angka kunci untuk HUD

| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| 2009 | Rilis pertama Redis | 1 |
| LMOVE | Reliable queue, list cadangan | 2 |
| at-most-once | Semantik Pub/Sub | 3 |
| 5.0 | Versi Streams hadir (XADD) | 6 |
| consumer group | Bagi kerja Streams | 5 |
| 10 req/dtk | Contoh rate limiter resmi per IP | 7 |
| INCR + EXPIRE | Counter + kedaluwarsa | 7 |
| ZADD | Leaderboard sorted set | 8 |
| GEOADD | Lokasi/geospasial | 9 |
| 12 KB · 0,81% | HyperLogLog | 10 |

## Poin kunci

- Satu Redis bisa jadi cache, antrean, pub/sub, log event, rate limiter, leaderboard, geo, dan penghitung unik.
- Pilih alat sesuai jaminan: Pub/Sub cepat tapi bisa hilang; Streams tersimpan.
- Visual explainer: tiap fitur = satu adegan dengan perintah Redis sebagai HUD (tanpa logo Redis, rule 15).
