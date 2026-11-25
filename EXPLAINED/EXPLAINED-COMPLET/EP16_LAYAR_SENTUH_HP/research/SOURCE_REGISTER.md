# Source Register — EP16 Layar Sentuh HP

Tanggal akses semua sumber: 2026-11-13. Keyakinan: **HIGH** = ≥2 sumber independen cocok (atau dokumen primer/standar + 1 sumber), **MED** = 1 sumber atau ada selisih antarsumber.

## Daftar sumber

| Kode | Sumber | URL |
|---|---|---|
| S1 | Wikipedia EN — Touchscreen (sejarah, resistif, kapasitif, mutual/self capacitance, sarung tangan) | https://en.wikipedia.org/wiki/Touchscreen |
| S2 | Wikipedia EN — Capacitive sensing (projected capacitance, grid X-Y, contoh 12×16) | https://en.wikipedia.org/wiki/Capacitive_sensing |
| S3 | Wikipedia EN — Indium tin oxide (komposisi, sifat bening-konduktif, pemakaian di panel sentuh) | https://en.wikipedia.org/wiki/Indium_tin_oxide |
| S4 | CERN Courier — "The first capacitative touch screens at CERN" (Stumpe & Sutton, 2010) | https://cerncourier.com/a/the-first-capacitative-touch-screens-at-cern/ |
| S5 | Fieldscale — "Self and mutual capacitive touch sensors" (bahan ajar produsen software sensor kapasitif) | https://fieldscale.com/learn-capacitive-sensing/self-mutual-capacitive-touch-sensors/ |
| S6 | Wikipedia ID — Layar sentuh (resistive overlay, kapasitif) | https://id.wikipedia.org/wiki/Layar_sentuh |
| S7 | Wikipedia EN — Multi-touch (iPhone 2007, asal-usul multi-touch) | https://en.wikipedia.org/wiki/Multi-touch |

## Fakta

| # | Fakta | Angka | Sumber | Akses | Keyakinan |
|---|---|---|---|---|---|
| 1 | Panel kapasitif = isolator (kaca) berlapis konduktor bening; tubuh manusia konduktor, sentuhan mengganggu medan elektrostatis dan terukur sebagai perubahan kapasitansi | — | S1, S2, S6 | 2026-11-13 | HIGH |
| 2 | Layar resistif: dua lapisan tipis berjarak celah kecil; tekanan membuat keduanya bersentuhan; bisa dipakai dengan sarung tangan atau benda keras apa pun | 2 lapisan | S1, S6 | 2026-11-13 | HIGH |
| 3 | Konduktor bening yang lazim di panel sentuh adalah indium tin oxide (ITO) | — | S1, S2, S3 | 2026-11-13 | HIGH |
| 4 | Komposisi ITO jenuh oksigen menurut berat | 74% In, 8% Sn, 18% O | S3 | 2026-11-13 | MED |
| 5 | ITO memungkinkan sensor kapasitif sampai ±90% tembus cahaya (satu lapis) | ±90% | S2 | 2026-11-13 | MED |
| 6 | Projected capacitive: lapisan konduktif diukir (etsa) menjadi grid X-Y, baris dan kolom, di satu lapis atau dua lapis yang saling tegak lurus | — | S1, S2 | 2026-11-13 | HIGH |
| 7 | Mutual capacitance: tiap persilangan baris dan kolom membentuk satu kapasitor | 1 per persilangan | S1, S2, S5 | 2026-11-13 | HIGH |
| 8 | Denyut tegangan frekuensi tinggi dikirim ke satu konduktor (mis. baris) bergantian; sinyal dibaca di konduktor yang menyilang; baris = pemancar, kolom = penerima (atau sebaliknya); dipindai berurutan | — | S1, S2 | 2026-11-13 | HIGH |
| 9 | Jari mendekat → kapasitansi mutual di persilangan **turun** (tubuh "mencuri" sebagian medan); pada self capacitance justru **naik** | — | S1, S2, S5 | 2026-11-13 | HIGH |
| 10 | Karena tiap persilangan diukur, mutual capacitance bisa melacak banyak jari sekaligus (multi-touch); makin banyak persilangan makin tinggi resolusi | — | S1, S2 | 2026-11-13 | HIGH |
| 11 | Self capacitance sinyalnya lebih kuat tapi sulit membedakan lebih dari satu jari; banyak produsen memakai keduanya sekaligus | — | S1, S2 | 2026-11-13 | HIGH |
| 12 | Layar kapasitif jarang berfungsi dengan sarung tangan (bahan isolator); sarung tangan tipis (medis) bisa; "glove mode" menaikkan sensitivitas tapi berisiko sentuhan hantu | — | S1, S2 | 2026-11-13 | HIGH |
| 13 | Sedikit air di layar bisa membuat deteksi kacau | — | S2 | 2026-11-13 | MED |
| 14 | Contoh grid: 12×16 = 192 kapasitor (S2); 16×14 = 224 persilangan (S1) | 192 / 224 | S1, S2 | 2026-11-13 | HIGH (aritmetika contoh) |
| 15 | CERN: catatan tangan Bent Stumpe 11 Maret 1972 mengusulkan layar sentuh kapasitif; kapasitor uji pertama 1973; laporan Beck & Stumpe Mei 1973; ruang kendali SPS penuh layar sentuh saat SPS mulai jalan 1976 | 1972 / 1973 / 1976 | S4, S1 | 2026-11-13 | HIGH (tahun "dipakai": lihat #17) |
| 16 | Tombol sentuh CERN awal ±200 pF, naik ±10% saat jari mendekat; osilator referensi 120 kHz | 200 pF, 10%, 120 kHz | S4 | 2026-11-13 | MED |
| 17 | Selisih: S1 menyebut layar CERN "mulai dipakai 1973" dan layar mutual capacitance X-Y 1977; S4 menyebut SPS dilengkapi layar sentuh 1976 dan pengembangan X-Y dimulai setelah 1978. **Jangan sebut tahun pasti; pakai "tahun tujuh puluhan".** | 1973 vs 1976; 1977 vs 1978 | S1, S4 | 2026-11-13 | MED |
| 18 | Eric A. Johnson (Royal Radar Establishment, Malvern) membuat layar sentuh jari pertama (kapasitif), artikel 1965, uraian lengkap 1967 | 1965 / 1967 | S1 (mengutip Electronics Letters 1965) | 2026-11-13 | MED |
| 19 | Layar resistif Elographics (G. Samuel Hurst) dipamerkan di World's Fair Knoxville | 1982 | S1 | 2026-11-13 | MED |
| 20 | iPhone (Januari 2007) membuat multi-touch arus utama; ponsel kapasitif pertama menurut S1 adalah LG Prada (Mei 2007) | 2007 | S1, S7 | 2026-11-13 | HIGH (2007); MED (LG Prada "pertama") |
| 21 | Projected capacitive bisa membaca jari melalui lapisan isolator tipis: kaca pelindung, screen protector, sarung tangan tipis | — | S1, S2 | 2026-11-13 | HIGH |
| 22 | Sebagian layar sentuh CERN dipakai sampai 2006 (CERN Control Centre baru) | ±30 tahun | S4 | 2026-11-13 | MED |
| 23 | Layar kapasitif umumnya = sensor + chip pengendali (ASIC) + pemroses sinyal (DSP) | — | S2, S5 (controller + ADC) | 2026-11-13 | HIGH |
