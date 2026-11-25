# Research Report — HTTP Status Code yang Sering Disalahgunakan Developer

> Riset pra-produksi (backlog, 2026-11-25). Nomor [#n] merujuk `SOURCE_REGISTER.md`.

## Sumber utama

- RFC 9110 HTTP Semantics (IETF, Juni 2022): sumber kebenaran utama semua kode status [#1–#7, #12, #13].
- RFC 6585 (2012) untuk 429 [#9], RFC 7538 (2015) untuk 308 [#8], RFC 9457 (2023) untuk Problem Details [#10], RFC 2324 (1998) untuk 418 [#11].
- Pendukung: MDN Web Docs [#14], GraphQL over HTTP Working Draft [#15], Microsoft Azure REST API Guidelines [#16].

## Fakta terverifikasi

1. Kode status HTTP 3 digit (100–599); digit pertama = kelas (1xx informasi, 2xx sukses, 3xx redirect, 4xx error klien, 5xx error server). Standar terbaru RFC 9110, Juni 2022 [#1].
2. 401 = belum terautentikasi (kredensial tidak ada/tidak valid) dan wajib membawa header WWW-Authenticate [#2]. Namanya "Unauthorized", maknanya "unauthenticated".
3. 403 = server paham request-nya tapi menolak; mengulang dengan kredensial yang sama tidak berguna [#3, #14].
4. 404 sah dipakai untuk menyembunyikan keberadaan resource; 410 Gone lebih tepat bila hilang permanen [#4].
5. 422 = sintaks benar, isi tidak bisa diproses [#5]; 500 = kondisi tak terduga di server [#6]. Mengirim 500 untuk input klien yang salah = menyalahkan server sendiri.
6. 302 boleh mengubah POST jadi GET (alasan historis); 307/308 mempertahankan metode [#7, #8].
7. 429 untuk rate limiting, boleh dengan Retry-After [#9].
8. RFC 9457: kode status di body error wajib sama dengan kode status response sebenarnya, karena software HTTP generik (cache, proxy, library klien) membaca kode status [#10].
9. 201 Created + header Location untuk resource baru [#13].
10. 418 I'm a teapot lahir dari RFC lelucon 1 April 1998 dan kini dicadangkan permanen [#11, #12].

## Perselisihan / Kontroversi

- **Koreksi hook TOPIC.md** ("200 untuk semua response? Ada yang lebih salah dari itu"): tidak ada standar yang memeringkat kesalahan "paling parah"; "lebih salah" adalah opini editorial. Selain itu "200 untuk semua" tidak selalu salah: GraphQL over HTTP (draft) menyarankan 200 OK untuk execution error parsial [#15]. Naskah membingkainya sebagai kebiasaan buruk di REST API, bukan aturan mutlak. Judul tidak diubah.
- **Judul**: "Disalahgunakan" lebih tepat "sering salah dipakai"; umumnya salah pilih kode, bukan penyalahgunaan sengaja. Tidak ada data survei seberapa sering tiap kesalahan terjadi: jangan sebut persentase.
- 404 untuk resource terlarang adalah praktik sah (menyembunyikan keberadaan) [#4], bukan kesalahan; jangan dinarasikan sebagai "salah".
- 422 dulu bernama "Unprocessable Entity" (WebDAV); RFC 9110 menamainya "Unprocessable Content" [#5]. Pilihan 400 vs 422 untuk validasi masih beda antar framework.
- GraphQL "294 Partial Success" masih usulan draft; jangan disebut di VO.

## Angka kunci untuk HUD

| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| 100–599, 5 kelas | rentang kode status, digit pertama = kelas | #1 |
| RFC 9110 · 2022 | standar HTTP Semantics terbaru | #1 |
| 401 vs 403 | belum dikenali vs dikenali tapi ditolak | #2, #3 |
| WWW-Authenticate | header wajib di 401 | #2 |
| 400 / 422 / 500 | input rusak / isi tak masuk akal / server gagal | #5, #6 |
| 302 vs 307 / 308 | POST bisa jadi GET vs metode dipertahankan | #7, #8 |
| 429 + Retry-After | rate limit, RFC 6585 (2012) | #9 |
| RFC 9457 · 2023 | kode di body = kode di response | #10 |
| 418 · 1998 | I'm a teapot, RFC 2324 April Mop | #11, #12 |

## Poin kunci

- Kode status adalah kontrak untuk mesin (cache, proxy, klien), bukan hiasan.
- Pasangan yang paling sering tertukar: 401/403, 400/422/500, 302/307/308.
- Error yang dibungkus 200 membuat software HTTP generik menganggap sukses (dasar: RFC 9457 [#10]).
- Payoff ringan: 418 teapot, lelucon 1998 yang kini dicadangkan permanen.
- Rule 15 aman: topik teknis tanpa wajah/logo; visual = terminal, kartu kode, pintu, rambu.
