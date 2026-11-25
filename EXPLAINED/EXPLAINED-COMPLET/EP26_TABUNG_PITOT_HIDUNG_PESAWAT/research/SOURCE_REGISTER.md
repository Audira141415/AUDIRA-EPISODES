# Source Register — EP26 Tabung Pitot di Hidung Pesawat

Tanggal akses semua sumber: 2026-11-13. Keyakinan: **HIGH** = ≥2 sumber independen cocok (atau dokumen primer/standar + 1 sumber), **MED** = 1 sumber atau ada selisih antarsumber.

Catatan metode: WebSearch/WebFetch sesi ini error (model alat tidak tersedia), jadi semua halaman dibuka langsung dengan `curl` dan dibaca teksnya.

## Daftar sumber

| Kode | Sumber | URL |
|---|---|---|
| S1 | Wikipedia EN — Pitot tube | https://en.wikipedia.org/wiki/Pitot_tube |
| S2 | Wikipedia EN — Pitot–static system | https://en.wikipedia.org/wiki/Pitot%E2%80%93static_system |
| S3 | NASA Glenn Research Center — Beginner's Guide to Aeronautics: Pitot-Static Tube (Speedometer) | https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/pitot-static-tube-speedometer/ |
| S4 | Wikipedia EN — Henri Pitot | https://en.wikipedia.org/wiki/Henri_Pitot |
| S5 | House, Ring, Shaw (2020), "Inventive nesting behaviour in the keyhole wasp Pachodynerus nasidens … and the risk to aviation safety", PLOS ONE 15(11): e0242063 | https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0242063 |
| S6 | Wikipedia EN — Birgenair Flight 301 (merujuk laporan akhir JIAA Republik Dominika) | https://en.wikipedia.org/wiki/Birgenair_Flight_301 |
| S7 | Wikipedia EN — Air France Flight 447 (merujuk laporan akhir BEA 2012) | https://en.wikipedia.org/wiki/Air_France_Flight_447 |

## Fakta

| # | Fakta | Angka | Sumber | Akses | Keyakinan |
|---|---|---|---|---|---|
| 1 | Tabung pitot mengukur tekanan stagnasi/total; bersama tekanan statis dipakai menghitung kecepatan aliran | — | S1, S2, S3 | 2026-11-13 | HIGH |
| 2 | Ditemukan insinyur hidraulik Prancis Henri Pitot (1695–1771), dipublikasikan 1732 saat meneliti aliran Sungai Seine | 1732 | S1, S4 | 2026-11-13 | HIGH |
| 3 | Bentuk modernnya dimodifikasi Henry Darcy pada 1858 | 1858 | S1 | 2026-11-13 | MED (1 sumber, tapi rujukan paper primer Darcy 1858 tercantum) |
| 4 | Udara masuk lubang depan lalu terhenti (stagnasi) karena tidak bisa keluar; tekanan ini disebut total pressure / pitot pressure / ram air pressure | — | S1, S2, S3 | 2026-11-13 | HIGH |
| 5 | Static port: lubang rata di badan pesawat di area aliran tenang, biasanya satu di tiap sisi badan; mengukur tekanan statis | — | S2, S3 | 2026-11-13 | HIGH |
| 6 | Tekanan dinamis = tekanan total − tekanan statis; indikator kecepatan memakai diafragma yang ditekan selisih ini | q = pt − ps | S2, S3 | 2026-11-13 | HIGH |
| 7 | Persamaan Bernoulli: V = √(2(pt − ps)/ρ) ⇒ selisih tekanan sebanding kuadrat kecepatan (2× lebih cepat = 4× selisih tekanan) | V² ∝ Δp | S3 (rumus), S4 (sebanding kuadrat) | 2026-11-13 | HIGH (turunan rumus) |
| 8 | Pitot-static tube / tabung Prandtl menggabungkan lubang statis di sisi tabung | — | S1, S3 | 2026-11-13 | HIGH |
| 9 | Ukuran tipikal tabung di pesawat sekitar 25 cm panjang, diameter ±1 cm (1/2 inci) | ±25 cm | S3 | 2026-11-13 | MED (1 sumber; ukuran beda per pesawat) |
| 10 | Pesawat penumpang memakai tiga tabung pitot (B757 Birgenair: "one of the three"; A330: ADs menuntut "two of the three tubes") | 3 | S6, S7 | 2026-11-13 | HIGH |
| 11 | Probe pitot biasanya di badan pesawat di belakang kerucut hidung, di bawah kokpit | — | S5, S1 (foto lokasi B777) | 2026-11-13 | HIGH |
| 12 | Tabung pitot rawan tersumbat es, air, serangga; banyak dipasangi elemen pemanas; FAA mewajibkan pitot berpemanas pada pesawat bersertifikat terbang instrumen | — | S2, S3 | 2026-11-13 | HIGH |
| 13 | Pitot tersumbat (lubang drain juga tersumbat): indikator kecepatan naik saat pesawat menanjak padahal kecepatan tetap | — | S2 | 2026-11-13 | MED (1 sumber; konsisten dgn fisika) |
| 14 | Static port tersumbat lebih berbahaya: altimeter membeku, VSI nol, semua instrumen pitot-statis terganggu | — | S2 | 2026-11-13 | MED |
| 15 | Birgenair 301: Boeing 757 jatuh ke Atlantik setelah lepas landas dari Puerto Plata, 6 Feb 1996; 189 tewas; satu dari tiga pitot tersumbat, diduga sarang tawon mud dauber (Sceliphron); tabung tidak pernah ditemukan sehingga tidak pasti | 6 Feb 1996; 189 | S6, S5 | 2026-11-13 | HIGH (penyebab tawon: "diduga", bukan pasti) |
| 16 | Penutup pitot tidak terpasang 2 hari sebelum kecelakaan, padahal pabrikan menyarankan ditutup | 2 hari | S5, S6 | 2026-11-13 | HIGH |
| 17 | Studi Bandara Brisbane: probe tiruan cetak 3D, Feb 2016–Apr 2019 (39 bulan), 93 kejadian probe tersumbat penuh; semua sarang dari tawon keyhole Pachodynerus nasidens | 39 bulan; 93 | S5 | 2026-11-13 | HIGH (paper primer peer-review) |
| 18 | Brisbane: 26 insiden terkait tawon dilaporkan Nov 2013–Apr 2019; 5 insiden pitot A330 Jan–Mar 2006 | 26; 5 | S5 | 2026-11-13 | HIGH (primer) |
| 19 | Sarang parsial bisa terbentuk sangat cepat: probe TAT A320 tersumbat setelah hanya 30 menit di darat (Agustus 2015) | 30 menit | S5 | 2026-11-13 | MED (1 kasus; probe suhu, bukan pitot) |
| 20 | Tawon lebih suka bukaan probe berdiameter >3 mm; puncak bersarang Nov–Mei (96%) | >3 mm; 96% | S5 | 2026-11-13 | HIGH (primer) |
| 21 | Air France 447 (A330), 1 Jun 2009, 228 tewas; BEA: kristal es kemungkinan menyumbat pitot → kecepatan tidak konsisten → autopilot lepas → salah respons pilot → stall | 228 | S1, S7 | 2026-11-13 | HIGH |
| 22 | Setelah AF447, probe Thales C16195AA dilarang di A330/A340 (AD EASA 31 Agu 2009) | 2009 | S7 | 2026-11-13 | MED |
| 23 | Aeroperú 603 (2 Okt 1996): static port tertutup selotip sisa pencucian, 70 tewas | 70 | S1, S2, S6 | 2026-11-13 | HIGH |
| 24 | Northwest 6231 (1 Des 1974, B727): pitot tersumbat es atmosferik | 1974 | S2 | 2026-11-13 | MED |
