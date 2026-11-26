# Source Register — Kenapa API Kamu Butuh Rate Limiting (dengan Contoh Nyata)

> Standar EP01 Makkah: minimum 5 sumber, ≥ 3 HIGH. Pipeline guard blokir jika < 5 sumber.

| # | Fakta | Sumber (judul, penulis/penerbit, tahun) | URL | Tanggal baca | Level |
|---|---|---|---|---|---|
| 1 | GitHub API: 5.000 req/jam (autentikasi), 60 req/jam (anonim), 15.000 req/jam (Enterprise Cloud); secondary limit 100 concurrent, 429/403 jika lewat | Rate limits for the REST API, GitHub Docs, 2024 | https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api | 2026-11-25 | HIGH |
| 2 | Stripe API: 100 req/detik (live), 25 req/detik (sandbox); concurrency cap 50; HTTP 429 dengan header Stripe-Rate-Limited-Reason | Rate limits, Stripe Docs, 2024 | https://docs.stripe.com/rate-limits | 2026-11-25 | HIGH |
| 3 | AWS API Gateway: default 10.000 RPS per akun per Region, burst 5.000 request (token bucket); Region terbatas 2.500 RPS | API Gateway quotas and important notes, AWS Docs, 2024 | https://docs.aws.amazon.com/apigateway/latest/developerguide/limits.html | 2026-11-25 | HIGH |
| 4 | Parler 2021: ~8 TB data di-scrape, 99% postingan publik, >1 juta video, koordinat GPS 70.000 lokasi terekspos; disebabkan "poor coding and poor security" tanpa rate limiting | Parler (article, Content scraping section), Wikipedia (citing Wired, Ars Technica, Gizmodo), 2024 | https://en.wikipedia.org/wiki/Parler | 2026-11-25 | MEDIUM |
| 5 | Rate limiting: definisi, HTTP 429 Too Many Requests, satu zombie machine >20 HTTP GET/detik vs legitimate traffic jauh lebih rendah | Rate limiting, Wikipedia, 2024 | https://en.wikipedia.org/wiki/Rate_limiting | 2026-11-25 | MEDIUM |
| 6 | Empat algoritma (leaky bucket, fixed window, sliding log, sliding window) + tradeoff: fixed window boundary burst bisa 2x rate; sliding window rekomendasi terbaik; distributed: race condition, atomic ops, eventual consistency | How to Design a Scalable Rate Limiting Algorithm, Kong Inc., 2023 | https://konghq.com/blog/engineering/how-to-design-a-scalable-rate-limiting-algorithm | 2026-11-25 | MEDIUM |

## Level
- **HIGH**: sumber primer (dokumentasi resmi API provider)
- **MED**: sumber sekunder terpercaya (Wikipedia dengan kutipan, blog teknis perusahaan besar)
- **LOW**: sumber tersier atau tanpa kutipan — hindari di naskah

## Perselisihan / Kontroversi
| Klaim | Posisi A (sumber) | Posisi B (sumber) | Sikap naskah |
|---|---|---|---|
| Algoritma terbaik untuk rate limiting | Sliding window direkomendasikan Kong (#6) karena hemat memori dan tanpa boundary burst | Token bucket dipakai AWS API Gateway (#3) karena mendukung burst alami | Naskah menyebut keempat algoritma dan menyebut sliding window sebagai "gabungan terbaik" tanpa mendiskreditkan yang lain |

## Musik/SFX (sumber + lisensi)
| Aset | Sumber | Lisensi/atribusi |
|---|---|---|
| | | |
