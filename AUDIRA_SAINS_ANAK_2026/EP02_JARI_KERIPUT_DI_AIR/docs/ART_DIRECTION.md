# Art Direction — Kenapa Jari Keriput Saat Lama di Air (`NANOFORGE`)

Style: NANOFORGE  <!-- G21: ID style aktif (sama dengan STATUS.json data.style). Ganti style = tulis ulang file ini. -->

Engine: Remotion + R3F (3D) · 9:16 1080×1920 @60

## Idea
Perjalanan mikroskopis ke dalam ujung jari yang basah. Film dibuka dengan siluet tangan kaca yang tercelup air, lalu kamera menyelam ke dalam ujung jari dan tinggal di dunia mikro: lapisan sel kulit dan molekul air (mitos spons), dua serabut saraf 1935 (utuh vs putus), penampang jaringan dengan pembuluh ruby yang menyempit, molekul air + ion garam, alur ban di jalan basah dan kelereng kaca, sidik keriput yang cocok di bawah mikroskop chrome, lalu kamera keluar lagi ke tangan kaca di air hangat keemasan.

## Look
- **Stage:** void mikroskopi `#02050f`, kabut `#0a192f` untuk kedalaman, partikel solut cyan melayang (Brownian) di semua adegan, 3–5 vesikel transparan jauh di belakang (BG) yang bergerak pelan.
- **Tanpa lantai lab.** Semua benda melayang di cairan; tidak ada panggung teal ANATOMIX.
- **Lighting:** Finish `CINEMA_TEAL_ORANGE`, exposure 1, envIntensity 0.55, ao=true, HDRI studio. Ambient 1.0 `#0a192f`; key electron-beam [4,10,6] 2.4 `#c7d2fe`; rim cyan [-5,3,-3] 3.0 `#00f5d4`; rim ruby [5,-2,2] 2.4 `#f43f5e`; fill emas [0,0,-2] 1.5 `#f59e0b`.
- **Light by chapter:** hook = rim cyan kuat; mitos = cyan dingin; 1935 = emas saraf menyala; mekanisme = ruby pembuluh + emas sinyal; waktu & tempat = cyan + violet (ion); fungsi = biru basah dingin; pola sama = cyan + chrome; outro = emas hangat.

## Materials
- **Kulit (membran hidrasi):** MeshPhysical `#f2b8a6`, transmission 0.45, IOR 1.33, roughness 0.28, clearcoat 0.9, sheen; tepi diterangi rim cyan sehingga terbaca basah, bukan plastik.
- **Tangan GLB (siluet):** MeshPhysical kaca `#9be7ff`, transmission 0.75, IOR 1.33, clearcoat 1, emissive cyan lemah.
- **Saraf:** tube emissive emas `#f59e0b` + pulsa putih-emas; saraf putus = ujung ruby berkedip.
- **Pembuluh:** tube membran ruby transparan, sel darah merah = cakram ruby glossy.
- **Molekul air:** bola-tongkat glossy (O `#f43f5e`, H putih), ion garam Na+ violet `#a855f7`, Cl− hijau-cyan.
- **Ban GLB:** karet hitam clearcoat 1, roughness 0.3 + rim cyan. **Mikroskop GLB:** chrome `#e2e8f0` metalness 0.92 roughness 0.18. **Kelereng GLB:** kaca transmission.

## Palette
| Token | Hex | Kegunaan |
|---|---|---|
| void | #02050f | latar |
| fluid | #0a192f | kabut, ambient |
| cyan | #00f5d4 | rim, HUD, air |
| membrane | #38bdf8 | vesikel, garis sel |
| gold | #f59e0b | saraf |
| ruby | #f43f5e | HANYA darah & oksigen |
| violet | #a855f7 | ion garam |
| chrome | #e2e8f0 | mikroskop |

## Text
HUD kartu gelap `rgba(2,5,15,0.82)` bergaris aksen, font min 36 px, satu kartu besar per beat, di pita atas (y 250–700) agar tidak tertutup objek. Caption karaoke y=1300. 380 px bawah kosong.

## Brand di dunia
Label slide mikroskop "AUDIRA LAB · SAINS EP02" melayang di adegan 1935 (F5) dan di dasar mikroskop (S7). VO menyebut "Audira Sains" di outro.
