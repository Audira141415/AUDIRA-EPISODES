# Research Report — Cara Kerja Water Heater Listrik dan Gas

> Riset backlog 2026-11-26. Channel @AudiraExplained (rule 15: netral, tanpa wajah orang nyata, tanpa logo/merek nyata). Topik keselamatan: pesan keselamatan wajib, tanpa instruksi pemasangan/perbaikan.

## Sumber utama

- **ENERGY STAR (U.S. EPA/DOE)**: cara kerja water heater gas instan/tankless (#1), kebutuhan aliran per alat (#2), water heater gas bertangki (#3).
- **HSE Inggris**: karbon monoksida dari alat gas (#4) dan RCD ≤ 30 mA (#6). **NHS**: gejala dan pencegahan keracunan CO (#5).
- Pendukung MEDIUM: Wikipedia (tankless, storage water heater, water heating, RCD) (#7–#10); ANTARA tentang kasus Solok 2025, pencegahan kebocoran gas, dan jenis water heater di Indonesia (#11–#13).
- Catatan akses: halaman energy.gov Energy Saver (tankless/storage) mengembalikan 404 per 2026-11-26, sehingga diganti halaman ENERGY STAR. WebSearch/WebFetch error; semua sumber dibuka via curl.

## Fakta terverifikasi

1. Ada dua keluarga water heater rumah: **bertangki** (air dipanaskan lebih dulu lalu disimpan) dan **instan/tankless** (air dipanaskan saat mengalir) (#1, #7, #13).
2. Tipe tangki listrik: elemen pemanas resistansi di dalam tangki, dikendalikan termostat; model dua elemen punya elemen atas dan bawah (#8, #13).
3. Tipe tangki gas: burner di dasar tangki baja berlapis kaca; gas buang perlu saluran pembuangan (#3, #8).
4. Tangki kehilangan panas lewat dinding dan memanaskan ulang (standby loss); tipe instan tidak punya kerugian ini (#1, #9).
5. Tipe instan: sensor aliran menyalakan burner/elemen saat keran dibuka; air dingin melewati penukar panas dan keluar pada suhu setelan (#1, #7).
6. Kebutuhan aliran pancuran ≈ 2,5 GPM (≈ 9,5 L/menit); unit instan rumah tangga 24–54 kW memberi ±9–23 L/menit (#2, #7).
7. Katup T&P/TPR di atas tangki membuang air bila suhu atau tekanan terlalu tinggi; tanpa pengaman, tangki bisa meledak (#9, #11).
8. CO tidak berwarna, tidak berbau, terbentuk dari pembakaran tidak sempurna; bisa membunuh cepat tanpa peringatan; pencegahan = pemasangan benar, ventilasi, flue/cerobong bersih, alarm CO (#4, #5, #12).
9. Kasus Indonesia: Solok, 8 Oktober 2025, satu korban meninggal di kamar mandi penginapan, diduga CO dari water heater elpiji di kamar mandi (#11).
10. RCD/ELCB ≤ 30 mA dianjurkan terutama di lokasi basah; memutus sirkuit saat arus bocor (#6, #10).
11. Setelan termostat ±55 °C = kompromi risiko melepuh (60 °C melepuhkan kulit < 5 dtk) vs bakteri Legionella (#9).

## Perselisihan / Kontroversi

- **Koreksi hook TOPIC.md**: "Air dingin masuk, air hangat keluar — tanpa kamu menunggu panci mendidih" hanya akurat untuk **tipe instan** (dan untuk tangki yang sudah panas). Tipe **tangki** perlu waktu pemanasan awal setelah dinyalakan dan setelah air panasnya habis (#8, #9). Selain itu water heater tidak "mendidihkan" air; ia menahan suhu setelan sekitar 55 °C. Hook naskah dikoreksi menjadi "Air dingin masuk, air hangat keluar, tanpa panci di kompor. Tapi water heater punya dua cara kerja yang beda", dan c02 menyebut eksplisit bahwa tangki baru tetap perlu waktu pemanasan.
- **Tipe instan juga tidak 100% seketika**: air dingin yang sudah ada di pipa harus keluar dulu, dan kapasitasnya dibatasi daya/laju gas (#7). Naskah tidak mengklaim "langsung panas detik itu juga".
- **Angka luar negeri**: GPM (ENERGY STAR), 30 mA (HSE), dan statistik CO (HSE ±7 kematian/tahun) berasal dari AS/Inggris. 30 mA juga lazim pada ELCB di Indonesia, tetapi belum diverifikasi dari PUIL/SNI. Statistik kematian Inggris tidak dipakai di VO.
- **Regulasi Indonesia** (SNI wajib water heater, PUIL untuk kamar mandi, standar instalasi elpiji) belum berhasil diverifikasi dari situs BSN/ESDM. Naskah memakai frasa umum ("wajib ada grounding dan ELCB", "harus dipasang di luar kamar mandi atau di ruang berventilasi") tanpa menyebut nomor standar.
- **Kasus Solok**: masih "diduga" menurut ANTARA (#11). Bila dipakai di visual/caption, tulis "diduga", tanpa inisial/wajah korban, tanpa nama penginapan. VO saat ini tidak menyebut kasusnya.
- **Rule 15**: tidak menyebut atau menampilkan merek water heater (beberapa merek muncul di artikel ANTARA, tidak dipakai).

## Angka kunci untuk HUD

| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| 2 cara | tangki vs instan | #1, #7, #13 |
| ±55 °C | setelan termostat kompromi | #9 |
| ≈ 9,5 L/menit (2,5 GPM) | kebutuhan pancuran mandi | #2 |
| 24–54 kW → 9–23 L/menit | daya dan aliran unit instan (cadangan, tidak di VO) | #7 |
| CO: tak berwarna, tak berbau | bahaya water heater gas | #4, #5, #12 |
| ≤ 30 mA | ambang ELCB/RCD | #6, #10 |

## Poin kunci

- Pesan inti: dua cara memanaskan (simpan vs saat mengalir), lalu keselamatan.
- Keselamatan wajib tampil: unit gas di luar kamar mandi / ruang berventilasi dengan cerobong; katup T&P; grounding + ELCB. Arahkan ke teknisi, tanpa langkah teknis pemasangan.
- Visual cutaway (tangki, burner, pipa spiral penukar panas) adalah kekuatan topik ini.
