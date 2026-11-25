# Source Register — EP32 Water Hammer Arrestor Pipa

Tanggal akses semua sumber: 2026-11-13. Keyakinan: **HIGH** = ≥2 sumber independen cocok (atau dokumen primer/standar + 1 sumber), **MED** = 1 sumber atau ada selisih antarsumber.

Catatan akses: WebSearch/WebFetch error di sesi ini; halaman dibuka lewat `curl` (Wikipedia API, URL langsung, PDF pabrikan via `pdftotext`).

## Daftar sumber

| Kode | Sumber | URL |
|---|---|---|
| S1 | Wikipedia EN — Water hammer (Hydraulic shock) | https://en.wikipedia.org/wiki/Water_hammer |
| S2 | Wikipedia EN — Hydropneumatic device (bagian water hammer preventers) | https://en.wikipedia.org/wiki/Hydropneumatic_device |
| S3 | Sioux Chief Mfg. — "Water Hammer Control" white paper (M. Meagher), memuat kutipan National Plumbing Code of Canada 2010 | https://cdn.siouxchief.com/prodscmwebsite/TechBulletins/WATER%20HAMMER%20CONTROL%20-%20WHITE%20PAPER.PDF |
| S4 | Sioux Chief Mfg. — 660 Series MiniRester spec sheet | https://cdn.siouxchief.com/prodscmwebsite/SpecSheets/660%20SERIES%20-%20MINIRESTER%20WATER%20HAMMER%20ARRESTER%20-%20SPEC%20SHEET.PDF |
| S5 | Sioux Chief Mfg. — Water Hammer Arrester Sizing Guidelines | https://cdn.siouxchief.com/prodscmwebsite/InstructionSheets/WATER%20HAMMER%20ARRESTER%20-%20SIZING%20GUIDELINES.PDF |
| S6 | Jay R. Smith Mfg. Co. — Piston Type Water Hammer Arrestors 5201–5250 | https://www.jrsmith.com/products/water-hammer-arresters/piston-type-water-hammer-arrestors-5201-5250 |
| S7 | Jay R. Smith Mfg. Co. — Water Hammer Arrestors 5005–5050 (bellows, ASSE 1010) | https://www.jrsmith.com/products/water-hammer-arresters/water-hammer-arrestors-5005-5050 |
| S8 | Plast-O-Matic Valves — Tech Brief "Water Hammer & Pulsation" (arsip Wayback 2008) | https://web.archive.org/web/20080701193833/http://www.plastomatic.com/water-hammer.html |
| S9 | Wikipedia EN — Speed of sound (bagian air) | https://en.wikipedia.org/wiki/Speed_of_sound |

## Fakta

| # | Fakta | Angka | Sumber | Akses | Keyakinan |
|---|---|---|---|---|---|
| 1 | Water hammer = lonjakan tekanan/gelombang saat fluida yang bergerak dipaksa berhenti atau berbelok mendadak, umumnya karena katup menutup cepat | — | S1, S3, S8 | 2026-11-13 | HIGH |
| 2 | Di rumah, terjadi saat mesin cuci, mesin cuci piring, atau kloset menutup aliran mendadak; terdengar sebagai dentuman atau dentuman berulang karena gelombang bolak-balik di pipa | — | S1, S5 | 2026-11-13 | HIGH |
| 3 | Air mengalir punya momentum; makin panjang pipa dan makin cepat aliran, makin besar momentum/tekanan (analogi kereta) | — | S3, S1 | 2026-11-13 | HIGH |
| 4 | Cairan praktis tidak bisa dimampatkan, sehingga energinya diteruskan seketika | — | S8, S1 | 2026-11-13 | HIGH |
| 5 | Gelombang tekanan merambat pada kecepatan suara dalam cairan: air tawar 1481 m/s pada 20 °C (S9); di jalur cairan "bisa melebihi 4000 ft/s" ≈ 1220 m/s (S8). Naskah memakai "lebih cepat dari seribu meter per detik" | >1000 m/s | S8, S9, S1 | 2026-11-13 | HIGH (batas bawah) |
| 6 | Persamaan Joukowsky: ΔP = ρ · a · Δv. Hitungan sendiri: 1000 kg/m³ × ±1400 m/s × 1 m/s ≈ 1,4 MPa ≈ 14 bar per 1 m/s kecepatan yang dihentikan seketika (a di pipa nyata 1200–1480 m/s → 12–15 bar) | ≈14 bar | S1 (rumus), S9 (a) | 2026-11-13 | MED (hasil hitung, sebut "sekitar") |
| 7 | Lonjakan bisa "berkali-kali lipat tekanan statis normal" (NPC Kanada via S3); Plast-O-Matic: hingga lima kali tekanan kerja | berkali-kali; ≤5× | S3, S8 | 2026-11-13 | HIGH (berkali-kali) / MED (5×, jangan disebut pasti) |
| 8 | Akibat: kerusakan dini pemanas air, katup pengaman, PRV, keran, katup solenoid, sambungan; pipa bisa pecah bila tekanan cukup tinggi | — | S3, S1 | 2026-11-13 | HIGH |
| 9 | Arrestor rekayasa memakai bantalan udara/gas yang bisa dimampatkan dan terpisah permanen dari air; saat katup menutup, kolom air terdorong masuk dan memampatkan udara sampai momentumnya habis | — | S3, S1, S2 | 2026-11-13 | HIGH |
| 10 | Pemisah udara-air: diafragma karet, bellows logam, atau piston dengan O-ring; piston disebut paling banyak dipakai (klaim pabrikan) | 3 tipe | S3, S6, S7 | 2026-11-13 | HIGH (tipe) / MED (paling banyak) |
| 11 | Contoh rumah tangga (ukuran AA): tinggi ±4 inci (±10 cm), lebar 7/8 inci, volume 1,4 inci³ (±23 cm³); piston polipropilena dengan O-ring EPDM; bantalan udara bertekanan; muat di ruang 2×4 inci (S6) | ±10 cm; 1,4 in³ | S4, S6 | 2026-11-13 | HIGH (ukuran ±10 cm) / MED (volume) |
| 12 | Model piston J.R. Smith diisi nitrogen dari pabrik, tidak bisa diisi ulang di lapangan, bebas perawatan, bisa dipasang di sudut apa pun | — | S6 | 2026-11-13 | MED |
| 13 | Dipasang sedekat mungkin dengan katup yang menutup cepat, satu di jalur air panas dan satu di air dingin | — | S5, S6 | 2026-11-13 | HIGH |
| 14 | Ruang udara dari pipa tegak dinilai tidak memberi perlindungan memadai (NPC Kanada 2010); gas di permukaan cairan perlahan terserap ke cairan (alasan desain pemisah) | — | S3, S2 | 2026-11-13 | MED (mekanisme "udara larut" disimpulkan dari S2) |
| 15 | Standar produk ASSE 1010; diwajibkan kode UPC, IPC, IRC (AS) dan NPC Kanada | — | S3, S4, S7 | 2026-11-13 | HIGH |
| 16 | Panduan ukuran pipa menyarankan kecepatan aliran ≤ 1,5 m/s untuk menekan water hammer | 1,5 m/s | S1 | 2026-11-13 | MED |
| 17 | Teori water hammer: von Kries 1883; Zhukovsky dan Frizell 1898; Allievi 1902 | 1883/1898/1902 | S1 | 2026-11-13 | MED |
| 18 | Istilah Prancis "coup de bélier" dan Italia "colpo d'ariete" = "pukulan domba jantan", dari pompa hidram | — | S1 | 2026-11-13 | MED |
| 19 | Katup solenoid menutup ±40–50 ms; contoh pipa 50 ft, aliran 5 ft/s → tambahan ±437 psi | 40–50 ms; ±437 psi | S8 | 2026-11-13 | MED |
| 20 | Arrestor industri berukuran 200–400 inci³ | 200–400 in³ | S3, S5 | 2026-11-13 | HIGH |
| 21 | Alternatif pencegahan: katup menutup lambat, regulator tekanan, kecepatan aliran rendah, tangki surge/menara air | — | S1 | 2026-11-13 | MED |
