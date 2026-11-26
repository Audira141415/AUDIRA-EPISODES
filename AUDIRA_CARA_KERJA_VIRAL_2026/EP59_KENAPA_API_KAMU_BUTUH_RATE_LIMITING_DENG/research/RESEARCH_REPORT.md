# Research Report — Kenapa API Kamu Butuh Rate Limiting (dengan Contoh Nyata)

## Sumber utama

1. **GitHub REST API Rate Limits** (#1): Dokumentasi resmi. Tiered model: anonim 60 req/jam, autentikasi 5.000, Enterprise 15.000. Secondary limit pakai sistem poin (mutating call 5x lebih mahal dari read). Melebihi batas = 403 atau 429.
2. **Stripe API Rate Limits** (#2): Dokumentasi resmi. 100 req/detik (live), concurrency cap 50 request bersamaan. Per-resource limit (Payment Intents: 1.000 update/jam). Rekomendasi: exponential backoff with jitter untuk menghindari thundering herd.
3. **AWS API Gateway Throttling** (#3): Default 10.000 RPS per akun per Region, burst 5.000 (token bucket). Bisa dinaikkan via AWS Support.
4. **Parler Content Scraping** (#4): Wikipedia (citing Wired, Ars Technica, Gizmodo). Januari 2021, sebelum AWS cabut hosting, ~8 TB data publik (99% postingan, >1 juta video) di-scrape. GPS metadata 70.000 lokasi terekspos. Penyebab: "poor coding and poor security."
5. **Rate Limiting — Wikipedia** (#5): Definisi, HTTP 429, riset: satu zombie machine >20 GET/detik.
6. **Kong — Scalable Rate Limiting Algorithm** (#6): Empat algoritma utama dengan tradeoff. Sliding window = rekomendasi (hemat memori, tanpa boundary burst, tanpa starvation).

## Fakta terverifikasi

1. GitHub memberi 5.000 request/jam untuk user terotentikasi, 60 untuk anonim — rasio 83x (#1)
2. Stripe membatasi 100 request/detik di mode live, 25 di sandbox (#2)
3. AWS API Gateway default 10.000 RPS per akun, burst 5.000 (#3)
4. Parler kehilangan ~8 TB data (99% postingan publik, >1 juta video) karena tanpa rate limiting (#4)
5. 70.000 koordinat GPS dari video Parler berhasil dipetakan oleh Gizmodo (#4)
6. HTTP 429 "Too Many Requests" adalah respons standar saat rate limit terlampaui (#5)
7. Satu zombie machine bisa menghasilkan >20 HTTP GET/detik (#5)
8. Fixed window boundary burst bisa meloloskan 2x traffic yang diizinkan (#6)
9. Sliding window menggabungkan kelebihan fixed window dan sliding log tanpa kelemahan keduanya (#6)
10. Stripe merekomendasikan exponential backoff with jitter untuk menghindari thundering herd (#2)

## Perselisihan / Kontroversi

- **Hook "DDoS server sendiri"**: Secara teknis, satu user yang membanjiri API sendiri bukan DDoS (Distributed Denial of Service) melainkan DoS biasa atau resource starvation. Namun efeknya sama: user lain tidak bisa akses. Hook dipertahankan karena "DDoS" lebih dikenal audiens awam, tapi naskah menggunakan istilah "melumpuhkan" bukan "DDoS."
- **Parler dan "rate limiting"**: Sumber menyebut "poor coding and poor security" secara umum, tidak spesifik menyebut "no rate limiting." Namun Wired menyebutnya "absurdly basic bug" dan scraping massal tanpa hambatan mengindikasikan ketiadaan rate limiting. Naskah mengatakan "tidak ada pembatas akses API" yang akurat tanpa overclaim.

## Angka kunci untuk HUD

| Angka | Konteks | # sumber |
|---|---|---|
| 5.000 req/jam | GitHub API, user terotentikasi | #1 |
| 60 req/jam | GitHub API, anonim | #1 |
| 100 req/detik | Stripe API, mode live | #2 |
| 10.000 RPS | AWS API Gateway default | #3 |
| 8 TB | Data Parler yang di-scrape | #4 |
| 1.000.000+ video | Video Parler yang diunduh | #4 |
| 429 | HTTP status code "Too Many Requests" | #5 |
| 2x | Potensi traffic lolos di boundary burst fixed window | #6 |

## Poin kunci

1. Rate limiting bukan fitur tambahan — ini keamanan dasar yang mencegah resource starvation, biaya meledak, dan serangan.
2. Setiap API besar (GitHub, Stripe, AWS) punya rate limit berbeda tergantung use case.
3. Kasus Parler 2021 adalah contoh nyata dampak terburuk tanpa rate limiting.
4. Empat algoritma utama dengan tradeoff berbeda; sliding window paling seimbang untuk mayoritas kasus.
5. HTTP 429 adalah bahasa universal antara server dan client untuk komunikasi rate limit.
