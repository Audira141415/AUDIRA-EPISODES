# Naskah — Kenapa API Kamu Butuh Rate Limiting (dengan Contoh Nyata)

> DRAF pra-produksi (backlog, 2026-11-25). Difinalkan di tahap 4 setelah style dipilih.
> Short: 190–210 kata @135–150 WPM.

## c00_hook — Hook

- Kata: **10** · estimasi **4 dtk**
- Visual: Terminal gelap, angka request naik eksponensial, server rack berkedip merah lalu mati total

> Satu user, tanpa batas, bisa matikan server kamu sendiri.

## c01_intro — Intro

- Kata: **12** · estimasi **5 dtk**
- Visual: Gerbang digital terbuka, siluet request berbaris menuju pintu API, logo AUDIRA muncul di sudut

> Rate limiting adalah penjaga gerbang API. AUDIRA bahas kenapa ini wajib.

## c02 — Kasus Parler

- Kata: **24** · estimasi **11 dtk**
- Visual: Globe data mengecil, angka {8 TB|delapan terabyte} muncul besar di HUD, ikon video bertumpuk dengan pin GPS menyebar di peta

> Dua ribu dua puluh satu, Parler kehilangan delapan terabyte data. Satu juta video dengan GPS pengguna, diunduh habis. Penyebabnya: tidak ada pembatas akses API.

## c03 — Cara Kerja Rate Limiting

- Kata: **30** · estimasi **13 dtk**
- Visual: Diagram split-screen: kiri GitHub dengan callout {5.000/jam|lima ribu per jam}, kanan Stripe dengan callout {100/dtk|seratus per detik}. Meter request naik, lalu muncul badge besar "429"

> Rate limiting membatasi berapa kali user memanggil API per waktu. GitHub: lima ribu request per jam. Stripe: seratus per detik. Lewat batas? Kode empat ratus dua puluh sembilan: terlalu banyak permintaan.

## c04 — Empat Algoritma

- Kata: **36** · estimasi **15 dtk**
- Visual: Empat panel animasi bergiliran: ember berisi token, pipa menetes konstan, blok waktu dengan counter, lalu hybrid sliding window. Panel fixed window berkedip merah saat angka {2x|dua kali lipat} muncul

> Empat algoritma utama. Token bucket: jatah token terisi berkala. Leaky bucket: antrian konstan seperti tetesan air. Fixed window menghitung per blok waktu, tapi celah di batas bisa meloloskan dua kali lipat traffic. Sliding window memperbaiki itu.

## c05 — Tiga Risiko Tanpa Rate Limiting

- Kata: **29** · estimasi **12 dtk**
- Visual: Tiga kolom infografis vertikal: ikon server terbakar (resource habis), ikon tagihan meledak (biaya cloud), ikon gembok terbuka (serangan). Tiap kolom muncul bergiliran dengan angka animasi

> Tanpa rate limiting, tiga risiko. Resource habis oleh satu user, yang lain tidak bisa akses. Biaya cloud meledak karena bayar per request. Dan serangan brute force jadi lebih mudah.

## c06 — Langkah Implementasi

- Kata: **27** · estimasi **12 dtk**
- Visual: Checklist animasi tiga langkah, ikon sliding window di-highlight, endpoint dengan angka limit, lalu respons 429 dengan header yang jelas

> Mulai dari sliding window, algoritma paling seimbang. Atur batas per endpoint. Kembalikan kode empat ratus dua puluh sembilan dengan header yang jelas agar developer tahu kapan coba lagi.

## c07_payoff — Payoff dan Penutup

- Kata: **24** · estimasi **10 dtk**
- Visual: Server kokoh dengan pagar digital berlapis, callout {10.000 RPS|sepuluh ribu request per detik} dari AWS, transisi ke outro card AUDIRA

> AWS sediakan sepuluh ribu request per detik sebagai default. Tiap API besar punya batas. Rate limiting bukan fitur tambahan. Ini fondasi keamanan API kamu. Bersama AUDIRA.

## Opsi hook lain

1. "Delapan terabyte data bocor karena satu kesalahan: tidak ada rate limiting."
2. "API tanpa batas itu seperti pintu terbuka tanpa penjaga."

## Total

- **~200 kata** ≈ **80–89 dtk** @135–150 WPM
