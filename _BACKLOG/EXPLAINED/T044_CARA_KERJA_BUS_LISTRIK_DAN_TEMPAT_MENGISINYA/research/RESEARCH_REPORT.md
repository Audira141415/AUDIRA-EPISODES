# Research Report — Cara Kerja Bus Listrik dan Tempat Mengisinya

> Riset backlog 2026-11-27. Channel @AudiraExplained (rule 15: netral, tanpa wajah/logo nyata, tanpa merek bus/baterai).

## Sumber utama

- **Regulasi (JDIH BPK)**: Perpres 55/2019 (teks PDF dibaca: definisi SPKLU, Pasal 22–23 infrastruktur pengisian) dan Perpres 79/2023 yang mengubahnya (#1, #2).
- **Jurnal (teks lengkap dibaca via Europe PMC)**: Sensors 2024, letak baterai di atap, rantai DC→AC→motor, pantograf 80% dalam 15 menit (#3); Scientific Reports 2026, spesifikasi BEB 12 m: 324 kWh, 250 km, 130 kWh/100 km, 13,9 t kosong, 18 t kotor (#4); Scientific Reports 2025, BEB 12 m: 351 kWh, 12,5 t kosong, 18 t total (#5); Scientific Reports 2025, konsumsi 1,02–2,21 kWh/km, depot charging (#6); Heliyon 2024, depot charging dan batas jarak harian (#7).
- **Operator di Indonesia (via ANTARA, MEDIUM)**: spesifikasi bus listrik di koridor Transjakarta, depo dan charger (#8, #9, #10, #16), jumlah armada dan target per Oktober 2026 (#11, #12).
- **Pendukung MEDIUM**: Wikipedia "Battery electric bus", "SAE J3105", "Bus listrik" (#13, #14, #15); klaim produsen 2020 (#17, hanya pembanding).
- **Tidak berhasil dibuka**: IEA Global EV Outlook (HTTP 403 dari iea.org), laporan NREL (domain tidak bisa di-resolve), halaman katalog IEC 61851/62196 (tidak dibuka; isi standar hanya diketahui lewat Wikipedia #14). WebSearch error, mesin pencari via curl tidak memberi hasil relevan.

## Fakta terverifikasi

1. Bus listrik kota 12 m beratnya ±12,5–13,9 ton kosong dan ±18 ton saat penuh (#4, #5; klaim produsen 13 ton kosong, #17). Hook "belasan ton" benar.
2. Kapasitas baterai bus 12 m dalam sumber: 324 kWh (#4), 351 kWh (#5), 350 kWh (#8); bus Transjakarta umumnya LFP 300–350 kWh (#15).
3. Letak baterai bergantung model. Sumber HIGH (#3) mencatat empat modul baterai di atap bus 12 m. Letak di bawah lantai atau di belakang **tidak terverifikasi** dari sumber yang dibuka.
4. Rantai tenaga: baterai DC (650 V) → motor drive/inverter → AC 600 V → motor AC di bagian belakang bus (#3). Rem regeneratif memulihkan energi pengereman (#13).
5. Konsumsi energi ±1,25–1,3 kWh/km (rentang 1,02–2,21 bergantung medan, cuaca, muatan, gaya mengemudi) (#4, #6, #13). Jarak tempuh sekali isi ±250 km (#4, #8).
6. Jarak harian rata-rata angkutan kota ±200 km, sehingga kebanyakan bus cukup diisi plug-in di depo malam hari (#15, MEDIUM). Operator Jakarta menyebut pengisian semalam plus tambahan saat sepi, di depo dan terminal (#10).
7. Depot charging = mengisi saat bus tidak beroperasi (#6, #7). Contoh Jakarta: depo dengan 10 charger 120 kW (#9); depo DAMRI dengan 35 charging station (#8).
8. Opportunity charging = mengisi singkat di terminal/halte lewat pantograf atau sambungan atap otomatis (#13, #14). Pada armada yang diteliti #3: 80% dalam 15 menit, penuh 30 menit.
9. Regulasi Indonesia: charging bisa di instalasi listrik privat dan/atau SPKLU; infrastruktur meliputi catu daya, sistem kontrol, proteksi, dan/atau penukaran baterai; penugasan awal ke PLN (#1). Perpres 55/2019 diubah Perpres 79/2023 (#2).
10. Per 7 Okt 2026, Transjakarta mengoperasikan 500 bus listrik dari >4.620 armada; target 100% (10.047 armada) pada 2030 (#11, #12).

## Perselisihan / Kontroversi

- **Koreksi hook TOPIC.md**: hook asli "bisa jalan seharian dengan baterai di atap **dan lantainya**".
  - "Belasan ton": benar (12,5–13,9 t kosong, 18 t penuh; #4, #5).
  - "Seharian": benar **dengan syarat**, yaitu untuk rute kota dengan jarak harian ±200 km dan pengisian penuh semalam di depo (#8, #15). Rute panjang (contoh BRT padat) butuh baterai lebih besar atau pengisian tambahan di siang hari (#7, #10). Klaim operator "2 jam isi → 17 jam operasi" (#9) adalah pernyataan operator, bukan data terukur, dan tidak dipakai sebagai angka VO.
  - "Di atap **dan lantainya**": hanya letak di atap yang terverifikasi HIGH (#3). Di bawah lantai tidak terverifikasi, jadi tidak boleh dinyatakan sebagai fakta umum.
  - **Hook dikoreksi** menjadi: "Bus seberat belasan ton ini bisa melayani rute kota seharian tanpa setetes solar. Rahasianya ada di baterai." Letak baterai dinarasikan "beda tiap model; di sebagian bus berjajar di atap".
- **Waktu isi di depo tidak konsisten**: DAMRI menyebut 350 kWh penuh "maksimal 2 jam" (#8), padahal 350 kWh ÷ 120 kW ≈ 2,9 jam bila satu charger 120 kW. Mungkin dual-gun atau daya charger berbeda, tidak dijelaskan sumber. VO hanya menyebut "beberapa jam" dan HUD "120 kW per pengisi" (#9).
- **Pantograf 80%/15 menit** (#3) berlaku untuk armada yang diteliti di Turki dan tidak berlaku umum. Angka Wikipedia (450 kW, 6–8 menit per jam operasi, #13) hanya MEDIUM. Di Jakarta, rencana pengisian di terminal ada (#10, #16), tetapi tidak ditemukan sumber bahwa pantograf sudah beroperasi di sana. Visual c06 harus generik (bukan "halte Jakarta").
- **Target armada** (10.047 / 10 ribu pada 2030) adalah target politik daerah yang bisa berubah. Tidak dipakai di VO; bila ditampilkan, tulis "target per Okt 2026" tanpa penilaian.
- **Netral politik**: program elektrifikasi disajikan faktual (jumlah armada per tanggal). Tidak membahas klaim emisi, subsidi, atau perdebatan biaya.
- **Merek**: sumber #8, #9, #17 terkait operator/merek tertentu. VO hanya menyebut "Transjakarta" (operator pemerintah daerah, teks tanpa logo/livery). Tidak ada merek bus/baterai.

## Angka kunci untuk HUD

| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| 12 m | Panjang bus kota standar | 3, 4, 5 |
| ±13 ton / 18 ton | Berat kosong / berat penuh bus 12 m | 4, 5 |
| 300–350 kWh | Kapasitas baterai bus 12 m | 4, 5, 8, 15 |
| DC → AC | Inverter mengubah listrik baterai untuk motor | 3 |
| ±1,3 kWh/km | Konsumsi energi rata-rata | 4, 6 |
| ±250 km | Jarak tempuh sekali isi penuh | 4, 8 |
| 120 kW | Daya tiap charger di salah satu depo Jakarta | 9 |
| 80% / 15 menit | Pantograf pada armada yang diteliti | 3 |
| 500 bus listrik | Transjakarta, per Oktober 2026 | 11, 12 |
| Perpres 55/2019 | Dasar hukum SPKLU dan infrastruktur pengisian (diubah Perpres 79/2023) | 1, 2 |

## Poin kunci

- Bus listrik = baterai besar (300–350 kWh) + inverter + motor listrik + rem regeneratif. Bobot baterai membuatnya belasan ton.
- "Seharian" masuk akal untuk rute kota (±200 km/hari vs jarak ±250 km), dengan isi penuh semalam di depo.
- Dua cara mengisi: **depo** (plug-in, malam, beberapa jam) dan **opportunity** (pantograf di terminal, menit). Di Jakarta, yang dominan adalah depo.
- Angka cepat basi: jumlah armada (500 per Okt 2026), target 2030.
- Saran visual: potongan (cutaway) bus 12 m dengan modul baterai menyala di atap, jalur energi baterai → inverter → motor belakang, depo malam berjajar charger, pantograf turun di terminal.
