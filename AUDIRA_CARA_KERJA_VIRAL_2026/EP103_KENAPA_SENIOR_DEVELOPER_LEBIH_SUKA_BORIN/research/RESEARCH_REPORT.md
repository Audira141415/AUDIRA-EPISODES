# Research Report — Kenapa Senior Developer Lebih Suka Boring Technology

Tanggal riset: 2026-11-25. WebSearch gagal (error model), jadi semua sumber diambil langsung lewat curl dan dibaca.

## Sumber utama
Lihat `SOURCE_REGISTER.md`: 7 sumber (6 HIGH, 1 MEDIUM). Inti: esai McKinley (#1, #2), kasus Segment (#3), Fowler (#4), data Stack Overflow (#5), PostgreSQL (#6, #7).

## Fakta terverifikasi
1. McKinley menulis esai pada 30 Maret 2015 dan menyebut tiap perusahaan punya sekitar tiga innovation token (#1).
2. Contoh di esai: menulis situs dengan NodeJS atau memakai MongoDB menghabiskan satu token (#1, konteks 2015).
3. MySQL, Postgres, PHP, Python, cron disebut boring karena kemampuan dan cara gagalnya dipahami baik (#1).
4. "Boring" = dipahami baik; teknologi baru punya lebih banyak unknown unknowns (#2).
5. Segment (2018) menggabungkan lebih dari 140 layanan menjadi satu; on-call sering dibangunkan karena lonjakan beban (#3).
6. Fowler (2015): hampir semua kisah sukses layanan mikro dimulai dari monolit yang membesar (#4).
7. Stack Overflow 2025: PostgreSQL 55,6% semua responden, 58,2% developer profesional (#5).
8. Asal PostgreSQL 1986 di Berkeley (#6).

## Perselisihan / Kontroversi
- Judul "Senior Developer Lebih Suka..." adalah generalisasi. Tidak ada survei yang mengukur senioritas vs preferensi. Koreksi: narasi memakai "senior sering memilih" dan bersandar pada esai McKinley, bukan klaim statistik.
- Hook awal "hype-driven vs production-proven" cocok sebagai tema, tapi bukan istilah dari sumber. Dipakai sebagai framing, bukan kutipan.
- Boring bukan anti-inovasi: McKinley sendiri bilang tiga token boleh dipakai. Kasus Segment memperlihatkan layanan mikro bisa berhasil di skala tertentu; ini bukan bukti layanan mikro selalu buruk.
- Node.js dan MongoDB adalah contoh 2015; sekarang keduanya matang (MongoDB 24% di survei 2025, #5). Naskah menulis "saat itu".

## Angka kunci untuk HUD
| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| 3 | Jumlah innovation token | 1 |
| 2015 | Esai McKinley, esai Fowler | 1, 4 |
| 140+ | Layanan Segment sebelum digabung | 3 |
| 2018 | Tulisan Segment | 3 |
| 1986 | Asal proyek POSTGRES | 6 |
| 55,6% | Pemakaian PostgreSQL, survei 2025 | 5 |

## Poin kunci
- Kerangka token inovasi mudah divisualkan (koin).
- Biaya tersembunyi teknologi baru: kegagalan tak dikenal, beban on-call, belajar alat baru.
- Posisi netral: pakai token untuk hal yang membedakan produk, sisanya boring.
- Rule 15: tidak ada logo (Etsy, Segment, Stack Overflow, Postgres gajah) dan tidak ada wajah nyata; pakai teks nama saja.
