# Research Report — Quantum Computing Explained: Kapan Komputer Kuantum Siap?

Tanggal data: 2026-11-25 (angka perangkat keras dan peta jalan bisa basi).

## Sumber utama
- Paper arXiv/Nature: Shor 1995 (#1), Google Willow (#2), Gidney 2025 (#4).
- Rilis resmi: blog Google Willow (#3), NIST CSRC (#5), blog IBM Quantum (#6).

## Fakta terverifikasi
1. Shor (1995, terbit SIAM 1997) menunjukkan faktorisasi dan logaritma diskrit bisa polinomial di komputer kuantum (#1).
2. Willow, 105 qubit; kisi 3x3 -> 5x5 -> 7x7 memotong error separuh tiap langkah; Λ = 2,14 ± 0,02; 101 qubit distance-7 error 0,143% per siklus; melewati break-even 2,4x (#2, #3).
3. Willow menyelesaikan benchmark RCS kurang dari 5 menit; Google memperkirakan superkomputer butuh 10 septiliun (10^25) tahun (#3). Ini benchmark buatan tanpa kegunaan praktis.
4. Gidney (Mei 2025): RSA-2048 dengan kurang dari 1 juta qubit noisy dalam kurang dari seminggu; estimasi 2019 20 juta qubit dan 8 jam (#4, #7).
5. NIST 13 Agu 2024 menyetujui FIPS 203, 204, 205 (#5).
6. IBM Starling: 2029 target 200 qubit logis, 100 juta gate (#6).

## Perselisihan / Kontroversi
- KOREKSI HOOK: "memecahkan password dalam detik" tidak akurat. Shor menyerang kriptografi kunci publik (RSA, kurva elips), bukan password; estimasi terbaik (Gidney) kira-kira seminggu, bukan detik; dan belum ada mesin yang mampu. Naskah memakai koreksi ini ("bukan password akunmu, tapi enkripsi RSA").
- Klaim "10 septiliun tahun" dari Google adalah klaim vendor pada benchmark RCS; peningkatan algoritma klasik bisa memangkas klaim semacam ini. Jangan disajikan sebagai kemampuan berguna.
- 200 qubit logis (IBM) dan <1 juta qubit fisik (Gidney) beda satuan (logis vs fisik); jangan dibandingkan langsung.
- Peta jalan perusahaan adalah target, bukan jaminan.

## Angka kunci untuk HUD
| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| 1995 / Peter Shor | Algoritma faktorisasi kuantum | 1 |
| 105 qubit | Chip Willow Google | 3 |
| 3x3 -> 5x5 -> 7x7 | Kisi surface code, error turun | 3 |
| Λ 2,14 | Faktor penekanan error per +2 jarak kode | 2 |
| < 5 menit vs 10 septiliun tahun | Benchmark RCS | 3 |
| 20 juta -> < 1 juta qubit | Estimasi RSA-2048 2019 vs 2025 | 4 |
| < 1 minggu | Waktu faktorisasi RSA-2048 (estimasi) | 4 |
| 13 Agu 2024 | NIST FIPS 203/204/205 | 5 |
| 2029 / 200 qubit logis | Target IBM Starling | 6 |

## Poin kunci
- Ancaman nyata ke enkripsi kunci publik, bukan password.
- Error correction sudah "di bawah threshold", tapi jarak ke 1 juta qubit masih ribuan kali lipat.
- Pertahanan sudah ada (standar NIST); "siap" = sistem dan data lama dimigrasi.
