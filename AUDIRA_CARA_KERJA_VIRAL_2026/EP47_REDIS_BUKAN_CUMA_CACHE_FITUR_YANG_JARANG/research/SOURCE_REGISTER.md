# Source Register — Redis Bukan Cuma Cache: Fitur yang Jarang Developer Tahu

> Standar EP01 Makkah: minimum 5 sumber, ≥ 3 HIGH. Pipeline guard blokir jika < 5 sumber.

| # | Fakta | Sumber (judul, penulis, tahun) | URL | Tanggal baca | Level |
|---|---|---|---|---|---|
| 1 | Redis adalah database key-value in-memory, dipakai sebagai cache terdistribusi dan message broker; rilis pertama 26 Februari 2009; pembuat Salvatore Sanfilippo | Redis, Wikipedia (rev. 2026-11-07) | https://en.wikipedia.org/wiki/Redis | 2026-11-25 | MEDIUM |
| 2 | Pola "reliable queue": producer mendorong tugas ke list, consumer memindahkan item ke list cadangan dengan LMOVE agar tugas tidak hilang bila consumer gagal; LMOVE tersedia sejak Redis 6.2.0 | LMOVE — Redis command docs, Redis Ltd., 2026 | https://redis.io/docs/latest/commands/lmove/ | 2026-11-25 | HIGH |
| 3 | Pub/Sub Redis memakai semantik pengiriman at-most-once: pesan dikirim sekali bila sampai, subscriber yang terputus kehilangan pesan; untuk jaminan lebih kuat pakai Streams | Redis Pub/sub, Redis Ltd. docs, 2026 | https://redis.io/docs/latest/develop/pubsub/ | 2026-11-25 | HIGH |
| 4 | Perintah PUBLISH tersedia sejak Redis 2.0.0 | PUBLISH — Redis command docs, Redis Ltd., 2026 | https://redis.io/docs/latest/commands/publish/ | 2026-11-25 | HIGH |
| 5 | Redis Stream = struktur data seperti append-only log dengan akses acak O(1) dan consumer group | Redis Streams, Redis Ltd. docs, 2026 | https://redis.io/docs/latest/develop/data-types/streams/ | 2026-11-25 | HIGH |
| 6 | Perintah XADD (Streams) tersedia sejak Redis 5.0.0 | XADD — Redis command docs, Redis Ltd., 2026 | https://redis.io/docs/latest/commands/xadd/ | 2026-11-25 | HIGH |
| 7 | Pola rate limiter dengan INCR + EXPIRE; contoh resmi membatasi maksimal 10 request per detik per alamat IP | INCR — Redis command docs (Pattern: rate limiter), Redis Ltd., 2026 | https://redis.io/docs/latest/commands/incr/ | 2026-11-25 | HIGH |
| 8 | Sorted set dipakai untuk leaderboard (update skor); ZADD tersedia sejak Redis 1.2.0 | Redis sorted sets, Redis Ltd. docs, 2026; ZADD command docs | https://redis.io/docs/latest/develop/data-types/sorted-sets/ | 2026-11-25 | HIGH |
| 9 | GEOADD (data geospasial) tersedia sejak Redis 3.2.0 | GEOADD — Redis command docs, Redis Ltd., 2026 | https://redis.io/docs/latest/commands/geoadd/ | 2026-11-25 | HIGH |
| 10 | HyperLogLog memakai paling banyak 12 KB memori dengan standard error 0,81% untuk menghitung elemen unik | HyperLogLog, Redis Ltd. docs, 2026 | https://redis.io/docs/latest/develop/data-types/probabilistic/hyperloglogs/ | 2026-11-25 | HIGH |
| 11 | 28 Maret 2024 Linux Foundation mengumumkan Valkey, fork Redis 7.2.4 berlisensi BSD 3-clause, setelah Redis mengganti lisensi | Linux Foundation Launches Open Source Valkey Community, Linux Foundation, 2024 | https://www.linuxfoundation.org/press/linux-foundation-launches-open-source-valkey-community | 2026-11-25 | HIGH |
| 12 | Redis kembali menambahkan lisensi AGPLv3 mulai Redis 8 (Mei 2025) | Redis is now available under the AGPLv3 open source license, Redis Ltd., 2025 | https://redis.io/blog/agplv3/ | 2026-11-25 | HIGH |
