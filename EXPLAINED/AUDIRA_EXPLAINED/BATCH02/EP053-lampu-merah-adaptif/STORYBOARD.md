# STORYBOARD — AE-053 Lampu Merah Adaptif (VOXELVERSE)

Komposisi `Ep053Preview` / final 1080×1920 @ 60. Durasi = `timeline.total` = 57,09 dtk. Semua detik di bawah adalah detik VO (Audio Master Clock) yang dihitung dari `studio/src/scenes/ep053/timeline.json` lewat `times.ts`. Kode: `studio/src/scenes/ep053/{Film.tsx, filmWorld.tsx, times.ts}`.

Dunia: perempatan voxel saat senja di atas alas diorama, lalu lintas lajur kiri. Ada ruang henti khusus motor di antara dua garis henti, loop induktif di bawah mobil pertama tiap lajur, tiang APILL dengan lampu vertikal + timer, kamera di lengan tiang, radar di tiang selatan, dan lemari kontroler di sudut. Di jalan panjang ke utara ada 4 lampu penyeberangan untuk gelombang hijau. Lokasi tambahan: papan peta 321 simpang dan ruang pusat kendali.

Layer: BG (langit senja, gedung, kabut), MG (jalan, kendaraan, tiang), FG (lampu, halo, cahaya FX di aspal), HUD (panel kartu gelap, chip antrean 3D, kotak deteksi), caption karaoke (y 1405 px, di atas safe zone bawah 380 px), lalu kartu outro.

| # | Detik | Bagian | Visual | Kamera | Teks layar | SFX disarankan |
|---|---|---|---|---|---|---|
| 1 | 0,00–7,26 | HOOK | Lampu merah menyala besar dengan timer 45 di samping. Kamera mundur sampai perempatan penuh terlihat, antrean selatan menunggu. | Dolly mundur dari kepala lampu lalu naik (crane) ke wide 3/4 | Panel "LAMPU MERAH · SIMPANG YANG SAMA": bar Pagi panjang, bar Sore pendek | impact 0,6 (lampu), pop 3,2 (bar pagi), pop 5,3 (bar sore) |
| 2 | 7,26–10,73 | KONTEKS | Setinggi mata di belakang antrean motor dan mobil, lampu merah dan timer di depan | Push-in pelan setinggi jalan | Panel "JADWAL TETAP", jarum siklus berputar konstan | whoosh 7,26 |
| 3 | 10,73–15,01 | KONTEKS | Lengan timur kosong tapi lampunya hijau (timer menghitung mundur), antrean selatan merah di latar | Dolly maju pelan di jalan timur | "jalan timur kosong, tetap hijau" | click 10,9 |
| 4 | 15,01–18,13 | MEKANISME | Kamera di lengan tiang selatan. Kerucut pandangnya (cyan) jatuh ke lajur antrean, chip antrean muncul di atas tiap lajur | Crane miring dari belakang tiang | Label "KAMERA" | riser 15,1 |
| 5 | 18,13–20,75 | MEKANISME | Loop induktif di bawah mobil pertama menyala cyan, cincin medan magnet naik dari aspal | Low angle dekat lajur, dolly pelan | Panel "LOOP INDUKTIF DI ASPAL" | glitch 18,3 |
| 6 | 20,75–23,26 | MEKANISME | POV kamera tiang: kotak analitik muncul per kendaraan (MOTOR/MOBIL/TRUK), hitungan naik sampai 12, busur radar | POV statis + drift genggam halus, FOV menyempit | "KAMERA SIMPANG · ANALITIK VIDEO", "ANTREAN n", "+ RADAR" | click per kotak 21,0–22,9 (cukup 1 cue), pop 22,6 |
| 7 | 23,26–28,85 | MEKANISME | Wide: komputer membagi ulang. Timur amber 25,17 lalu merah, selatan hijau 26,00 (timer 40), antrean jalan 26,45. Pulsa data dari lemari kontroler naik ke 4 lampu berikutnya | Wide turun lalu tilt ke jalan panjang | Panel "KOMPUTER MENGATUR ULANG": bar Selatan hijau +, Timur hijau − | impact 26,0 (hijau), whoosh 27,1 (pulsa selaras) |
| 8 | 28,85–34,68 | REVEAL | Kamera mengejar rombongan ke utara. Lampu 1–4 berganti hijau satu per satu ±1,2 dtk sebelum mobil pertama tiba (offset), tidak serentak | Tracking di belakang rombongan | Panel "GELOMBANG HIJAU", nomor 1–4 menyala saat hijau | pop 31,22 / 32,38 / 33,54 (lampu 1–3 hijau; lampu 4 hijau 34,7 saat kamera naik) |
| 9 | 34,68–37,28 | PAYOFF | Kamera naik tinggi di atas jalan panjang: hanya satu koridor yang hijau | Crane naik | – | riser 34,8 |
| 10 | 37,28–44,83 | PAYOFF | Papan peta 321 kotak simpang, 115 menyala hijau bertahap mengikuti kata "seratus lima belas" | Dolly melayang di atas papan | "JAKARTA · FEBRUARI 2026 / 115 dari 321 simpang / bersinyal sudah memakai sistem adaptif / Sumber: Dishub DKI via Kompas.com" | impact 37,28, riser 41,9 |
| 11 | 44,83–47,51 | PAYOFF | Ruang pusat kendali: video wall CCTV simpang + peta, tiga petugas dilihat dari belakang | Push-in pelan | Panel "PUSAT KENDALI · Petugas tetap memantau dan bisa mengambil alih" | whoosh 44,83 |
| 12 | 47,51–53,29 | OUTRO | Kembali ke perempatan wide: chip antrean, gelombang hijau di kejauhan | Crane turun pelan ke komposisi cover | Caption | whoosh 47,5 |
| 13 | 53,29–57,09 | Kartu | `<Outro>` AUDIRA + "Created by Agus Dwi R." | – | – | impact 53,3 |

Transisi: potongan langsung yang dicocokkan dengan objek (lampu → antrean → jalan kosong → tiang → loop → POV kamera tiang → wide), lalu dip gelap 0,14 dtk di tiga perpindahan tempat (37,28 papan, 44,83 ruang kendali, 47,51 kembali ke jalan).

Akurasi: sensor = loop induktif + kamera (analitik video) + radar. Gelombang hijau = offset berurutan mengikuti laju rombongan. Angka 115/321 (Feb 2026) bersumber dari Dishub DKI via Kompas.com. Petugas tetap mengawasi. Tidak ada logo instansi atau wajah orang nyata.
