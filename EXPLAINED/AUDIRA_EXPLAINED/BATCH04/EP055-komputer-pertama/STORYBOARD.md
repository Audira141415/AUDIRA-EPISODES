# STORYBOARD — AE-055 "Bagaimana Komputer Pertama Bisa Melakukan Perhitungan?" (FILMNOIR)

Komposisi `Ep055Preview` / `Ep055Final`, durasi 64,527 dtk (`timeline.total`). Semua cut diambil dari `studio/src/scenes/ep055/timeline.json` lewat `timing.ts` (tidak ada angka tebakan). Kode: `studio/src/scenes/ep055/` (Film.tsx, Stages.tsx, EniacRoom.tsx, SilhouettePerson.tsx, timing.ts).

Lapisan tetap: BG = dinding/jendela ber-blinds + kabut cahaya; MG = 40 panel (18 kiri + 18 kanan + 4 belakang, bentuk U) atau panggung makro; FG = kabel patch, lengan siluet, operator siluet; HUD = label "case file" (kicker Courier amber + judul Georgia) di zona atas ≥180 px; caption karaoke Georgia italic (kata aktif amber, micro-bounce) di atas batas bawah 380 px. Finish: APPLE_STUDIO_CLEAN, exposure 0,72, envIntensity 0,1, AO on, vignette 0,34, grain 0,03.

| # | Detik VO | Bagian | Visual | Kamera | Teks layar | SFX saran |
|---|---|---|---|---|---|---|
| 1 | 0,00–3,41 | HOOK | Lorong ENIAC gelap; tabung menyala bergelombang dari ujung jendela ke kamera (count instanced). Siluet operator di ujung. | Dolly rendah maju, Dutch tilt -2° | "1940-AN / TANPA LAYAR. / TANPA KEYBOARD" (dari kata "tidak") | riser 0,35 |
| 2 | 3,41–7,63 | HOOK | Semua tabung menyala; 3 operator siluet; penghitung naik 0 → 18.000 sinkron "delapan belas ribu". | Crane naik 0,8 → 2,35 m | "SEKITAR / ± 18.000 / TABUNG VAKUM MENYALA" | whoosh 3,41 |
| 3 | 7,63–11,94 | KONTEKS | Ujung lorong: panel MASTER PROGRAMMER + pelat AUDIRA, operator perempuan meraih kabel, jendela blinds di belakang. | Orbit rendah setengah lingkaran | "NAMANYA / ENIAC / DIUMUMKAN 1946" | impact 7,63 |
| 4 | 11,94–18,03 | KONTEKS | Plafon dibuka: tampak atas ruangan, 40 panel bentuk U, kabel, garis cahaya jendela. | Overhead turun pelan | "BERAT / ± 27 TON / 1 RUANGAN · 40 PANEL BENTUK U" | whoosh 11,94 |
| 5 | 18,03–22,53 | MEKANISME | Panggung makro: tabung vakum tunggal (kaca, anoda, grid heliks, katoda berpijar, elektron mengalir). Mati-nyala pada "saklar" dan "listrik". | Orbit makro, akhir shot mendekat ke kaca + kilat amber | "TABUNG VAKUM = SAKLAR / ON ↔ OFF / TANPA BAGIAN BERGERAK" | whoosh 18,03, click 20,51 |
| 6 | 22,53–26,88 | MEKANISME | Ring counter: piringan 10 lampu neon berangka 0–9, satu menyala; maju per langkah, lalu menyapu 0→9 pada "nol sampai sembilan". | Close-up, dolly pelan | "PENGHITUNG 10 POSISI / 0 – 9 / SATU LAMPU MENYALA" | impact 22,53, click 25,41 |
| 7 | 26,88–29,81 | MEKANISME | Ring yang sama berputar pelan 0..9. Tidak ada angka biner. | Mundur pelan | "ENIAC MENGHITUNG / DESIMAL / ~~BINER~~" | pop 28,20 |
| 8 | 29,81–39,84 | MEKANISME | Tiga ring (ratusan, puluhan, satuan) di panel baja. Pulsa listrik masuk ke satuan: 5→9; lewat 9 jadi 0, pulsa carry melompat ke puluhan → 0 1 0. Lalu odometer drum 0 0 9 → 0 1 0. | Wide statis + dolly pelan | Readout "0 0 5 … 0 1 0" (RATUSAN/PULUHAN/SATUAN); "SEPERTI ODOMETER" | click 33,88, pop 35,68 |
| 9 | 39,84–42,03 | REVEAL | Kembali ke lorong, panel kanan penuh kabel patch. | Push in ke deret soket | "BAGAIMANA MEMPROGRAMNYA?" | (kilat transisi) |
| 10 | 42,03–45,51 | REVEAL | Close-up: lengan siluet mencabut colokan dari soket 2 lalu memasang ke soket 4. | Close-up, dolly kecil | "CARA MEMPROGRAM / DENGAN TANGAN / CABUT · PASANG KABEL" | click 43,69, click 44,80 |
| 11 | 45,51–47,59 | REVEAL | Function table beroda: 60 saklar putar 10 posisi berputar bertahap, tangan siluet di satu kenop. | Close-up menurun | "LALU MEMUTAR / RIBUAN SAKLAR" | (tick kecil opsional) |
| 12 | 47,59–50,36 | REVEAL | Timelapse: cahaya jendela terbit-tenggelam 3 kali, operator berpindah posisi. | Dolly rendah lorong | "1 SOAL / HARI 1 → 2 → 3 / PERSIAPAN BERHARI-HARI" | |
| 13 | 50,36–56,07 | PAYOFF | Enam siluet perempuan 1940-an (rok A-line, rambut victory roll, tanpa wajah, tanpa nama) bekerja di panel. | Push rendah menyusuri lorong | "PROGRAMMER PERTAMA / 6 PEREMPUAN / NAMA MEREKA TIDAK DISEBUT SAAT ENIAC DIUMUMKAN" | |
| 14 | 56,07–58,43 | OUTRO | Colokan didorong masuk soket, lalu kamera mundur memperlihatkan dinding kabel. | Close-up → pull back | "KABEL, BUKAN KETIKAN." | impact 56,95 |
| 15 | 58,43–60,73 | OUTRO | Close-up pelat kuningan "AUDIRA" pada panel (2,3 dtk, tengah frame). | Lateral dolly | caption "Ini AUDIRA Explained." | |
| 16 | 60,73–64,53 | OUTRO | Kartu `<Outro>` AUDIRA (`_shared/Outro.tsx`). | — | logo + Created by Agus Dwi R. | |

Catatan akurasi: angka desimal 0–9 saja (tidak ada 0/1 biner), "sekitar 18.000" dan "± 27 ton" (bukan angka pasti), tidak ada layar/keyboard pada mesin, tidak ada nama atau wajah programmer.
