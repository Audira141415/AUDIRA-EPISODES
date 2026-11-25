# STORYBOARD — AE-040 Kamera ETLE Bisa Membaca Plat Nomor di Malam Hari? (THERMALFORGE)

All timings are in VO seconds from `studio/src/scenes/ep040/timeline.json`. Each cut lands 0.12 s before its word.
Two ways of seeing the same 3D street:
- **Mata**: dark night, lit only by visible light (street lamps, headlights, flash).
- **Sensor**: Ironbow false colour of what the pole camera records with its own lamp. Brightness here means reflected light, not heat.

Layers: BG (buildings, far road) · MG (car, gantry) · FG (zebra crossing, poles, beams) · HUD (REC, lock box, labels) · karaoke caption (y 1392–1540) · Outro.

| # | Detik VO | Bagian | Visual | Kamera | Teks layar | SFX |
|---|---|---|---|---|---|---|
| 1 | 0.00–2.15 | HOOK | Persimpangan malam, mata manusia: gelap, lampu jalan, mobil mendekat dengan lampu depan menyala | Crane turun dari tinggi | PERSIMPANGAN · 23:47 | (ambience) |
| 2 | 2.15–4.77 | HOOK | Dari belakang gantry: kamera kotak di tiang menghadap mobil yang datang | Dolly maju pelan | KAMERA TILANG (callout) | whoosh 2.15 |
| 3 | 4.77–7.08 | HOOK | Sudut pandang kamera; garis scan menyapu dari atas ke bawah, layar berubah ke sensor; plat jadi yang paling terang | Push-in pelan ke plat | REC KAMERA TIANG · kotak "PALING TERANG" | glitch 4.85, impact 6.06 |
| 4 | 7.08–11.86 | KONTEKS | Sensor: plat dikunci, OCR mengetik B 1234 XYZ | Push-in | ANPR · PENGENAL PLAT OTOMATIS | — |
| 5 | 11.86–13.96 | KONTEKS | Zoom menembus ke plat | Dolly-in cepat (zoom-through) | KUNCINYA: PLAT ITU SENDIRI | whoosh 11.86 |
| 6 | 13.96–17.41 | MEKANISME | Close-up kamera kotak: LED iluminator di sebelah lensa menyala, gelombang tembus pandang memancar | Orbit pelan | CAHAYANYA SENDIRI · LENSA · LAMPU KAMERA | pop 14.58 |
| 7 | 17.41–20.68 | MEKANISME | Layar dibelah: kiri mata (gelap), kanan kamera (terang) | Dolly pelan | MATA MANUSIA / KAMERA · INFRAMERAH: TAK TERLIHAT MATA | glitch 17.41 |
| 8 | 20.68–22.85 | MEKANISME | Varian lain: kilatan putih singkat dari kamera menerangi jalan | Crane samping | VARIAN LAIN: KILATAN LAMPU | impact 22.04 |
| 9 | 22.85–27.47 | MEKANISME | Penampang plat: manik kaca di atas pelat logam; sinar masuk dari lampu kamera lalu balik lurus ke sumber | Dolly menyamping | PENAMPANG PLAT (ILUSTRASI) · MANIK KACA · PELAT LOGAM · DARI LAMPU KAMERA · BALIK KE SUMBER | whoosh 22.85, riser 25.11 |
| 10 | 27.47–30.48 | MEKANISME | Close-up plat di sensor: latar menyala, huruf gelap | Slide menyamping | LATAR: MENYALA · HURUF: TETAP GELAP | — |
| 11 | 30.48–36.04 | MEKANISME | Plat lama dasar hitam vs plat baru dasar putih (yang baru muncul berputar); bar kontras | Dolly pelan | SEBELUM: DASAR HITAM · SEJAK 2022: DASAR PUTIH · KONTRAS DI KAMERA (ILUSTRASI) | — |
| 12 | 36.04–40.73 | REVEAL | Mobil melaju cepat dengan garis kecepatan; iris shutter menutup dan mobil membeku | Track sampai momen beku | SHUTTER ±1/1000 dtk · MOBIL MEMBEKU | click 39.11 |
| 13 | 40.73–45.76 | REVEAL | Gambar beku: kotak deteksi → crop diluruskan → kotak per karakter → teks terbaca → cek pola | Diam (gambar beku) | 1 CARI · 2 LURUSKAN · 3 POTONG · 4 BACA · CEK POLA ✓ | pop 41.54, click 43.28 |
| 14 | 45.76–47.74 | PAYOFF | Crane ke tiang; pulsa data jalan dari kamera, lewat lengan, turun ke tiang | Crane naik | BUKAN HAKIM TERAKHIR · FOTO → PETUGAS | — |
| 15 | 47.74–51.50 | PAYOFF | Back office: petugas terlihat dari belakang memverifikasi foto, data kendaraan dicentang (data fiktif) | Dolly mundur + pan (2.5D) | BACK OFFICE · DICEK PETUGAS ✓ · NOMOR / JENIS / DATA KENDARAAN ✓ | whoosh 47.74 |
| 16 | 51.50–54.61 | PAYOFF | Surat konfirmasi (contoh fiktif, QR dekoratif) diberi cap, masuk amplop, terbang ke rumah pemilik | Parallax 2.5D | SURAT KONFIRMASI → PEMILIK · KONFIRMASI DULU, BUKAN LANGSUNG TILANG | whoosh 52.75 |
| 17 | 54.61–57.69 | OUTRO | Sensor: crane naik dari plat ke atas persimpangan | Crane naik | Gelap bukan tempat bersembunyi | — |
| 18 | 57.69–61.20 | OUTRO | Crane berlanjut | Crane | Pernah dapat surat konfirmasi ETLE? · CERITAKAN DI KOMENTAR | — |
| — | 61.20–65.00 | OUTRO | Kartu AUDIRA (`_shared/Outro.tsx`) | — | Created by Agus Dwi R. | — |

Notes:
- Claims follow SCRIPT.md and RESEARCH_REPORT.md:
  - There are two variants: invisible infrared and a short white flash.
  - The camera does not send a ticket straight away; an officer checks and a confirmation letter goes out first.
  - The film names no camera brand, gives no wavelength, and has no institution logo.
  - The plate, the vehicle data and the letter are labelled as fictional.
- Every cut also has a short sensor-tear bar of about 0.1 s.
