# Source Register — EP29 Bola Pemadam Api Otomatis

Tanggal akses semua sumber: 2026-11-13. Keyakinan: **HIGH** = ≥2 sumber independen cocok (atau dokumen primer/standar + 1 sumber), **MED** = 1 sumber atau ada selisih antarsumber. Klaim yang hanya berasal dari pabrikan ditandai **PABRIK** dan di naskah selalu diawali "menurut pabriknya".

Catatan metode: WebSearch/WebFetch sesi ini error, dan mesin pencari web (DuckDuckGo, Mojeek, Bing) memblokir dengan captcha, jadi halaman dibuka langsung dengan `curl` dan pencarian makalah memakai API Crossref. **Tidak ditemukan uji independen** (lembaga konsumen, laboratorium uji, atau makalah ilmiah) yang mengukur efektivitas bola pemadam api. Lihat bagian "Uji independen" di bawah.

## Daftar sumber

| Kode | Sumber | URL |
|---|---|---|
| S1 | Wikipedia EN — Fire extinguisher (bagian "Fire extinguishing ball", sejarah, dan agen kimia kering) | https://en.wikipedia.org/wiki/Fire_extinguisher |
| S2 | ELIDE FIRE (pabrikan, Thailand) — halaman produk ELIDE FIRE Ball | https://www.elidefire.com/pages/elide-fire-ball |
| S3 | ELIDE FIRE — Precautions and Warnings | https://www.elidefire.com/pages/precautions-and-warnings |
| S4 | ELIDE FIRE — FAQ | https://www.elidefire.com/pages/faq |
| S5 | ELIDE FIRE — History | https://www.elidefire.com/pages/history |
| S6 | ELIDE FIRE — Compliance (daftar sertifikasi yang diklaim) | https://www.elidefire.com/pages/compliance |
| S7 | U.S. Fire Administration (FEMA) — Fire extinguishers (panduan publik) | https://www.usfa.fema.gov/prevention/home-fires/prepare-for-fire/fire-extinguishers/ |
| S8 | API Crossref — pencarian makalah "fire extinguishing ball" / "extinguisher ball" / "bola pemadam api" (hasil: tidak ada uji efektivitas) | https://api.crossref.org/works?query.title=extinguishing+ball |

## Fakta

| # | Fakta | Angka | Sumber | Akses | Keyakinan |
|---|---|---|---|---|---|
| 1 | Pabrikan: bola adalah alat tambahan, **tidak** menggantikan alat pemadam api biasa, sprinkler, atau sistem busa | — | S3, S4 | 2026-11-13 | HIGH (pernyataan pabrik sendiri) |
| 2 | Bola dapat dipasang/digantung di area rawan (dapur, panel listrik, kendaraan) dan aktif sendiri tanpa listrik, pipa, atau tekanan | — | S1, S2 | 2026-11-13 | HIGH |
| 3 | Bola juga dapat dioperasikan manual dengan digelindingkan atau dilempar | — | S1, S2 | 2026-11-13 | HIGH |
| 4 | Sejak sekitar 1880 populer "granat api" kaca berisi larutan garam dapur + amonium klorida, dilempar ke dasar api; isinya hanya ±0,57 L sehingga manfaatnya terbatas | ±1880; 0,57 L | S1 | 2026-11-13 | MED (1 sumber; naskah memakai "sekitar") |
| 5 | Sebagian granat kaca lama berisi karbon tetraklorida yang beracun (dapat membentuk fosgen saat terkena panas); ditarik 1950an | 1950an | S1 | 2026-11-13 | MED |
| 6 | Versi modern: cangkang busa keras, dililit sumbu yang menuju muatan bubuk hitam kecil; pecah setelah kontak api dan menyebarkan bubuk kimia kering ABC | — | S1, S2 ("bursts open", "mild explosion") | 2026-11-13 | HIGH |
| 7 | Aktif hanya bila **tersentuh api langsung**; panas saja (dalam batas aman) tidak memicunya; tahan suhu sampai 85 °C | 85 °C | S4, S1 ("triggered by heat") | 2026-11-13 | MED (S1 menulis "triggered by heat", S4 "direct flame contact"; naskah mengikuti S4) |
| 8 | Aktif dalam hitungan detik (pabrik mengutip "3 sampai 10 detik") | 3–10 dtk | S2, S4 | 2026-11-13 | MED (PABRIK) |
| 9 | Bunyi saat aktif ±120 dB (pabrik: tidak berbahaya bagi pendengaran); S1: dirancang berbunyi keras | ±120 dB | S4, S1 | 2026-11-13 | HIGH bunyi keras; MED angka 120 dB (PABRIK) |
| 10 | Bubuk ABC = monoamonium fosfat; untuk kelas A, B, C; meleleh dan mengalir pada ±190 °C sehingga menyelimuti bahan bakar | 190 °C | S1 | 2026-11-13 | MED (1 sumber; konsisten dengan klaim pabrik "dry chemical powder") |
| 11 | Bubuk kimia kering memutus reaksi berantai pembakaran (radikal bebas) | — | S1 | 2026-11-13 | MED |
| 12 | Model 1,4 kg melindungi hingga 2,5 m³; model 0,4 kg hingga 0,7 m³; volume lebih besar butuh beberapa bola | 1,4 kg → 2,5 m³ | S2, S4, S5 | 2026-11-13 | HIGH bahwa ini klaim pabrik (PABRIK; tidak diuji independen) |
| 13 | Kamar 3 × 3 m dengan plafon ≥2,3 m bervolume >20 m³ (3 × 3 × 2,3 = 20,7) | >20 m³ | perhitungan | 2026-11-13 | HIGH (aritmetika; asumsi plafon ≥2,3 m) |
| 14 | Dirancang untuk api tahap awal: "dalam 4 menit pertama" (S3, S5) vs "1–5 menit pertama" (S3) | ±4 menit | S3, S5 | 2026-11-13 | MED (pabrik sendiri tidak konsisten; naskah: "kira-kira empat menit pertama") |
| 15 | Pabrik melarang melempar bola langsung ke api cairan mudah terbakar karena bisa menyebarkan api; jangan jatuhkan dari >2,5 m | 2,5 m | S3, S2 | 2026-11-13 | HIGH (PABRIK) |
| 16 | Wiki EN menyebut cakupan "sekitar 5 m²" (luas), pabrik menyebut 0,7–2,5 m³ (volume) | 5 m² vs 2,5 m³ | S1, S2 | 2026-11-13 | MED (selisih satuan; jangan sebut angka luas) |
| 17 | USFA: pilih alat pemadam berlabel "UL Listed"/"ULC Listed", disertifikasi laboratorium uji yang diakui; rating seperti 1A:10B:C menunjukkan kemampuan terukur | 1A:10B:C | S7 | 2026-11-13 | HIGH (lembaga resmi) |
| 18 | Pabrik mengklaim sertifikasi TISI Thailand TIS 3413-2565 (Type 2A, 5B, 1C, 2F), CE (ISO/IEC 17065), BSI VC 71933, GOST-R 53291-2009, dll. Dokumen sertifikat tidak dibuka/diverifikasi | — | S6 | 2026-11-13 | MED (PABRIK, belum diverifikasi) |
| 19 | Pabrik: masa pakai 5 tahun tanpa perawatan; sekali pakai | 5 tahun | S2, S4, S5 | 2026-11-13 | MED (PABRIK) |
| 20 | Penemu ELIDE FIRE Ball: Woradech (kini Phanawatnan) Kaimart, Thailand, 1998, setelah kebakaran Royal Jomtien Hotel Pattaya 1997 | 1998 | S5 | 2026-11-13 | MED (PABRIK) |
| 21 | Alat pemadam pertama tercatat: paten Ambrose Godfrey, Inggris, 1723, tong cairan dengan bilik mesiu yang diledakkan sumbu | 1723 | S1 | 2026-11-13 | MED |
| 22 | Tidak ada makalah uji efektivitas bola pemadam yang ditemukan di Crossref; hasil hanya desain drone/robot pelempar bola | — | S8 | 2026-11-13 | MED (pencarian terbatas) |

## Uji independen (status)

- Dicari: lembaga konsumen (CHOICE, Consumer NZ, Popular Mechanics), regulator recall (ACCC, CPSC), laboratorium (UL), dan makalah ilmiah (Crossref). Halaman yang ditebak tidak ada (404) atau hasil pencarian kosong; mesin pencari umum diblokir captcha.
- Kesimpulan sementara: **belum ada uji independen yang bisa dikutip**. Semua angka kinerja (2,5 m³, 3–10 detik, 120 dB, 4 menit) adalah klaim pabrik dan harus diucapkan sebagai "menurut pabriknya".
- Standar khusus bola ada di Thailand (TIS 3413-2565, menurut pabrik). Di AS, panduan resmi (USFA) merujuk alat pemadam portabel berlabel UL/ULC dengan rating terukur (#17).
