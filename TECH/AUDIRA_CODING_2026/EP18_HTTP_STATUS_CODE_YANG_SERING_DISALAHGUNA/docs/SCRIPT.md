# Naskah — HTTP Status Code yang Sering Disalahgunakan Developer

> DRAF pra-produksi (backlog, 2026-11-25). Difinalkan di tahap 4 setelah style dipilih.
> Short: 190–210 kata @135–150 WPM.

## c00_hook — Hook

- Kata: **18** · estimasi **8 dtk**
- Visual: terminal gelap, response `200 OK` hijau berkedip, lalu body JSON di bawahnya terbuka: `"error": "gagal"`. Stempel merah "BOHONG" menghantam layar. Tag kecil AUDIRA di pojok terminal.

> Server bilang 200 OK, padahal isinya error. Kebiasaan ini salah, dan masih ada yang lebih kacau. Ini AUDIRA.

## c01_intro — Intro

- Kata: **22** · estimasi **9 dtk**
- Visual: lima laci arsip bernomor 1xx sampai 5xx keluar bergantian; HUD callout "RFC 9110 · 2022" dan "100–599".

> Setiap response HTTP membawa tiga digit angka. Aturannya ada di RFC 9110 tahun 2022. Digit pertama menentukan kelasnya, dari satu sampai lima.

## c02 — 401 vs 403

- Kata: **28** · estimasi **12 dtk**
- Visual: pintu kantor. Kiri: tamu tanpa kartu, papan "401 · siapa kamu?" + chip header `WWW-Authenticate`. Kanan: tamu berkartu ditolak satpam bertangan silang (tanpa wajah), papan "403 · bukan hakmu".

> Yang paling sering tertukar: 401 dan 403. 401 artinya server belum tahu kamu siapa, kredensialnya kosong atau tidak valid. 403 artinya server sudah kenal kamu, tapi tetap menolak.

## c03 — 400, 422, 500

- Kata: **28** · estimasi **12 dtk**
- Visual: konveyor paket JSON. Paket sobek ditolak dengan cap "400"; paket rapi berisi umur minus ditolak cap "422"; konveyor yang meledak sendiri diberi cap "500".

> Lalu input pengguna yang salah dibalas 500. Padahal 500 artinya servernya yang rusak. JSON yang formatnya hancur, kirim 400. Formatnya rapi tapi isinya tidak masuk akal, ada 422.

## c04 — Redirect 302 vs 307/308

- Kata: **26** · estimasi **11 dtk**
- Visual: amplop formulir berlabel POST masuk rambu belok "302", keluar berlabel GET dan isinya tercecer. Jalur kedua dengan rambu "307 / 308" mengantar amplop POST utuh.

> Redirect juga punya jebakan. Dengan 302, browser boleh mengubah POST menjadi GET, jadi data formulirmu bisa hilang di jalan. Mau metodenya tetap, pakai 307 atau 308.

## c05 — 429 rate limit

- Kata: **19** · estimasi **8 dtk**
- Visual: antrean request menumpuk di gerbang tol; palang turun, papan "429 Too Many Requests" dan jam pasir "Retry-After: 30".

> Klien mengirim request bertubi-tubi? Balas 429 Too Many Requests, plus header Retry-After supaya klien tahu kapan boleh mencoba lagi.

## c06 — Penjelasan: kenapa 200 untuk error berbahaya

- Kata: **34** · estimasi **15 dtk**
- Visual: diagram jalur response melewati cache, proxy, dan library klien; masing-masing hanya membaca lampu kode status (hijau 200) dan meloloskan error. Callout "RFC 9457 · 2023: kode di body = kode di response".

> Kenapa 200 untuk error itu berbahaya? Cache, proxy, dan library klien membaca kode status, bukan isi pesannya. Error yang dibungkus 200 dianggap sukses. RFC 9457 mewajibkan kode di body sama dengan kode di response.

## c07_payoff — Payoff + outro

- Kata: **31** · estimasi **13 dtk**
- Visual: teko teh muncul dari asap dengan papan "418 I'm a teapot · 1 April 1998"; cap "DICADANGKAN" turun. Lalu dinding kartu kode status tersusun rapi, outro card AUDIRA.

> Ada juga 418 I'm a teapot, lelucon April Mop tahun 1998 yang sekarang dicadangkan permanen. Lucu, tapi jangan dipakai di produksi. Kode status itu kontrak. Bedah teknologi lain ada di AUDIRA.

## Opsi hook lain

1. 401 dan 403 itu beda. Kalau kamu masih menukarnya, API-mu sedang berbohong.
2. Satu angka tiga digit bisa bikin cache, proxy, dan aplikasimu salah paham bersamaan.

## Total

- **206 kata** ≈ **82–92 dtk** (±88 dtk @140 WPM)
