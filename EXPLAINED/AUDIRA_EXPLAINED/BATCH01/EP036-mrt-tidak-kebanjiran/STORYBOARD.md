# STORYBOARD: AE-036 Terowongan MRT Tidak Kebanjiran (INNERWORKS), revisi 2

Audio Master Clock: `studio/src/scenes/ep036/timeline.json` (total 65 dtk). Setiap cut di bawah adalah detik mulai kata VO; di kode, cut dicari lewat `W("kata")`, tidak di-hardcode.
Komposisi: `Ep036Preview` / `Ep036Final`. Kode: `studio/src/scenes/ep036/film/` (Film.tsx = sutradara; Diorama / Tunnel / TBM / Entrance / River = set).
Layer di semua shot: BG langit gradasi / tanah, midground set 3D cutaway, foreground hujan / panah / partikel, HUD (chip lapisan, label yang menempel ke titik 3D, kartu), caption karaoke (bawah, di atas batas 380 px).

## Transisi
- A ke B: kamera kontinu (crane dari jalan turun ke penampang).
- B ke C: zoom-through. Kamera masuk ke lubang cincin terowongan kanan, lalu match cut ke kamera di sumbu terowongan (interior).
- C ke D: zoom-out. Diorama dimulai rapat di cincin kanan, lalu mundur ke tampilan lebar.
- D ke E, E ke F: kamera kontinu (push-in ke cincin kiri, lalu pull-back).
- F ke G: flash pendek (ganti set ke TBM).
- G ke H: kamera kontinu dari kepala bor ke ekor perisai.
- H ke I: match cut cincin ke cincin (cincin baru dipasang, lalu muka potong cincin).
- I ke J: wipe "menembus tanah" naik (lapisan tanah menyapu layar, dari terowongan ke jalan).
- J ke K ke L: kamera kontinu di set pintu masuk.
- L ke M: wipe tanah turun (dari pintu masuk ke dalam terowongan).
- M ke N: wipe tanah turun (dari terowongan ke bak penampung).
- N ke O, O ke P: flash pendek.

## Shot

| # | Detik VO | Bagian | Visual | Kamera | Teks layar | SFX saran |
|---|---|---|---|---|---|---|
| A | 0.00–2.96 | HOOK | Diorama cutaway: jalan banjir cokelat, hujan deras, mobil terendam, riak hujan | Dolly rendah di atas jalan, sedikit naik | caption | impact 0.00 |
| B | 2.96–5.03 | HOOK | Kamera turun menembus potongan tanah ke dua terowongan bulat berdampingan, lalu masuk ke lubang terowongan kanan | Crane down, lalu zoom-through cincin | "Puluhan meter di bawah" | whoosh 2.96 |
| C | 5.03–7.23 | HOOK | Di dalam terowongan: cincin bersegmen kering, lampu hangat, kereta melaju mendekat | Mulai di sumbu terowongan, geser ke sisi rel | caption | whoosh 5.03 |
| D | 7.23–9.15 | HOOK | Keluar dari cincin ke diorama penuh: hujan di atas, kering di bawah | Zoom-out cepat, lalu push-in ke cincin kiri | "Kok bisa?" besar | pop 7.23 |
| E | 9.15–11.59 | KONTEKS | Close penampang terowongan kiri (ekor kereta dengan kaca dan lampu belakang); panah biru air tanah menekan cincin | Push-in pelan, lanjutan dari D | "Air tanah menekan" | — |
| F | 11.59–15.11 | KONTEKS | Pull-back ke diorama penuh; pin 1-2-3 muncul di cincin, pintu masuk, pompa | Pull-back + orbit | "1 Cincin beton", "2 Pintu masuk", "3 Pompa" | — |
| G | 15.11–18.76 | MEKANISME (L1) | Hero: kepala bor (cutterhead) TBM EPB berputar di tengah frame; perisai dan screw conveyor sekunder | Orbit pelan di depan kepala bor, lalu meluncur ke ekor | chip LAPISAN 1, "Kepala bor berputar", "Mesin bor (TBM) Antareja" | riser 15.11 |
| H | 18.76–20.75 | MEKANISME (L1) | Ekor perisai: erector berputar, segmen cincin baru masuk satu per satu | Dolly mendekat ke ekor | "Cincin beton dipasang" | click 18.76 |
| I | 20.75–22.59 | MEKANISME (L1) | Macro muka potong cincin: sambungan (gasket) menyala oranye, panah air tanah tertahan | Push-in macro | "Sambungan disegel" | pop 21.60 |
| J | 22.59–26.92 | MEKANISME (L2) | Set pintu masuk setengah potong: bangunan entrance, anak tangga naik, tangga turun, kotak stasiun; air banjir cokelat dengan panah arus menuju pintu | Orbit 3/4 lebar, kontinu ke K | chip LAPISAN 2, "Pintu stasiun" | whoosh 22.59 |
| K | 26.92–31.42 | MEKANISME (L2) | Profil: anak tangga NAIK ke landasan, lalu tangga TURUN ke kotak stasiun (gerbang terlihat); air naik tapi di bawah ambang | Orbit ke profil samping | garis ukur besar "lebih tinggi dari jalan" + "muka jalan" (tanpa angka), "Stasiun bawah tanah" | — |
| L | 31.42–36.13 | MEKANISME (L2) | Petugas (figur bergaya, tanpa wajah) memasang 4 panel penahan bertumpuk di alur vertikal secara manual | Orbit mendekat, kontinu dari K | "Petugas", "Panel penahan banjir", kartu "± 4 menit" | click 32.74 |
| M | 36.13–40.48 | REVEAL (L3) | Dalam terowongan: butir rembesan besar turun di jalur biru di dinding ke saluran samping; panah alir di saluran | Dari sisi kiri menatap dinding kanan, dolly pelan | chip LAPISAN 3, "Rembesan kecil", "Saluran samping" | whoosh 36.13 |
| N | 40.48–45.46 | REVEAL (L3) | Diorama: rembesan masuk bak penampung; pompa menyala; panah alir naik di pipa ke saluran kota | Close bak, lalu crane up mengikuti pipa | "Bak penampung (titik terendah)", "Pompa", "ke saluran kota" | whoosh 40.48, click 43.57 |
| O | 45.46–49.07 | REVEAL (L3) | Kali: air naik, tiang sensor berkedip (±1,4 dtk di layar), gelombang sinyal ke ruang kendali; layar memunculkan PERINGATAN DINI | Tahan di sensor, pan ke ruang kendali mulai kata "peringatan" | "Sensor Kali Krukut", "Ruang kendali" | glitch 47.59 |
| P | 49.07–55.40 | PAYOFF | Diorama penuh: jalan tergenang, kereta tetap melaju di kedua terowongan | Orbit pelan | kartu "1 Jan 2020 · Jalan banjir, MRT beroperasi normal", "Jalan tergenang", "MRT tetap beroperasi" | impact 50.71 |
| Q | 55.40–61.20 | OUTRO | Pull-back lebar, hujan mereda | Pull-back + naik | checklist 3 lapisan | — |
| R | 61.20–65.00 | OUTRO | Kartu AUDIRA (`_shared/Outro.tsx`) | — | logo + Created by Agus Dwi R. | — |

Caption: maksimal 3 kata / 22 karakter per frasa, selalu satu baris.

Catatan riset dipatuhi: dua terowongan bulat berdampingan; panel dipasang manual (bukan pintu otomatis); tanpa angka kedalaman, jumlah segmen, atau tinggi ambang; tanpa logo MRT Jakarta (kereta generik putih dengan strip mint).
