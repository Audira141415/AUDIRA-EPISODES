# Art Direction — Cara Kerja Internet (CIRCUITFORGE)

## Idea
Internet sebagai papan sirkuit raksasa. Setiap komponen jaringan (router, server, DNS) direpresentasikan sebagai komponen elektronik di PCB. Data packet = pulsa elektron berpendar yang meluncur di jejak tembaga. Benua = section board yang dihubungkan kabel bawah laut (trace tebal emas). Satu perjalanan kontinu dari "klik" di smartphone hingga data kembali.

## Look
- Extreme macro PCB, kamera rendah di antara kapasitor SMD dan chip BGA
- Dark matte solder mask (hijau tua/hitam) sebagai latar dominan
- Jejak tembaga berlapis emas berpendar amber/cyan saat data lewat
- Kedalaman: BG papan sirkuit gelap + kabut tipis, MG komponen utama (router chip, server array), FG kapasitor/resistor blur, HUD label data overlay
- Nada: teknis-presisi, bukan menakutkan

## Material (per objek hero)
| Objek | Material | Catatan |
|---|---|---|
| PCB board | Matte solder mask hijau tua, roughness 0.85 | Latar utama |
| Traces (kabel) | Gold immersion, metalness 0.95, roughness 0.1 | Berpendar saat data lewat |
| Router chip | Dark epoxy + gold pins, heat spreader metalik | Komponen BGA besar |
| Server array | Silicon die, gold wire bonding | Array chip berjajar |
| Data packet | Emissive sphere/cube, cyan glow | Bergerak di traces |
| Kabel bawah laut | Thick gold trace, sheath translucent | Menghubungkan "benua" |
| Smartphone (hook) | Matte black body, glass screen emissive | Titik awal perjalanan |

## Palet
- **BG:** #0A1A0F (solder mask gelap), #1A2A1F (variasi)
- **Traces:** #D4A843 (emas), #FFD700 (highlight aktif)
- **Data glow:** #00E5FF (cyan), #FF6B00 (amber pulse)
- **Chip body:** #2D2D2D (epoxy gelap)
- **HUD text:** #FFFFFF pada #000000CC chip background
- **Accent:** #00FF88 (LED hijau status)

## Tipografi
- HUD label: monospace (Inconsolata/JetBrains Mono style), ukuran ≥128px di 1080 lebar
- Data overlay: uppercase, tracking lebar, opacity 0.85
- Caption karaoke: putih, shadow hitam, bounce kata aktif ≤1.04x

## Cahaya per chapter
| Chapter | Key | Fill | Accent | Mood |
|---|---|---|---|---|
| Hook (s1) | Underglow amber dari traces | Ambient rendah 0.3 | Cyan pulse dari paket data | Misterius, mengundang |
| Context (s2) | Side light amber | Ambient 0.4 | LED hijau di chip | Informatif |
| Main (s3-s4) | Warm amber dari jalur aktif | Fill cyan lembut | Glow data mengalir | Dinamis |
| Explanation (s5-s6) | Balanced amber/cyan | Ambient 0.5 | Rim light pada kabel | Teknis-jernih |
| Payoff (s7) | Full underglow + trace glow | Ambient 0.4 | Semua jalur menyala | Klimaks |
| Outro (s8) | Fade ke ambient | Minimal | AUDIRA glow | Penutup |

## Aturan penggambaran
- Tidak ada logo perusahaan nyata (Google, Meta, dll) — semua server generik
- Tidak ada wajah manusia
- Angka on-screen harus cocok SOURCE_REGISTER (99%, 550 kabel, 200.000 km/dtk)
- Label gunakan istilah teknis (DNS, TCP, IP, ROUTER) dalam teks monospace
- Brand AUDIRA muncul sebagai label chip/komponen di dunia 3D (minimal 1x)

## Finish (dari memory CIRCUITFORGE)
- Profile: CINEMA_TEAL_ORANGE
- Exposure: 1
- envIntensity: 0.55
- AO: true
- HDRI: studio (pantulan logam)
- RoomEnvironment wajib (PMREMGenerator)
