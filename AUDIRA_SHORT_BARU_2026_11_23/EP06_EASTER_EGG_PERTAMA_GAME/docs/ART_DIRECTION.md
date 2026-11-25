# ART DIRECTION — EP06 Easter Egg Pertama yang Terkenal di Game

Style: ARCADECRT
(Restyle 2026-11-23 dari PIXELSTORY yang gagal juri 3 putaran. Arsip PIXELSTORY: `style/_pixelstory/`, `draft/_pixelstory/`.)

## Look
- Ruang arkade 3D gelap (Remotion + React Three Fiber, kit `project/src/kits/arcadecrt`), `<Finish>` profil CYBER_NEON_VOID: bloom neon, AO, envIntensity 0.55, latar #07060F.
- Kabinet CRT voxel dengan marquee neon dan layar melengkung ber-scanline. Isi layar = raster 96×128 buatan sendiri per adegan (game karangan "KASTIL PIKSEL"), bukan Adventure asli.
- Di dalam game (babak D, D2) kamera menembus kaca: level menjadi dunia voxel 3D (lorong katakombe, ruang rahasia berdinding pelangi), latar #06041A, kabut, scanline tipis.
- Tokoh nyata = figur voxel generik tanpa wajah + NameCard (font display Anton, bukan font piksel).
- Palet: magenta #FF2E88, cyan #2EF2FF, kuning koin, ungu ruangan. HUD chip plat gelap berbingkai, caption karaoke band bawah.
- Brand di dunia: marquee "AUDIRA ARCADE" di ruang arkade dan kabinet outro.

## Set per babak (tiap babak set dan sudut kamera berbeda)
| Babak | Set | Lampu dominan | Kamera |
|---|---|---|---|
| A Hook | Kabinet "KASTIL PIKSEL" di ruang arkade, layar labirin dengan titik | spot atas + glow layar | kiri rendah, push ke layar |
| B Konteks | Tiga kabinet kotak game, label pembuat dihapus; sub-shot figur programmer + koin | neon magenta/cyan | truck kiri→kanan, lalu tinggi |
| C Pengembangan | Figur programmer di depan kabinet, layar kode → "W.R." → 1980, tumpukan kotak | glow layar hijau | over-shoulder 3/4, push ke layar, tarik mundur |
| D Penjelasan | Dalam game: lorong voxel katakombe → kastil emas, pahlawan membawa titik, dinding pecah | ambient ungu + directional | samping 3/4 ikut pemain, makro ke titik |
| D2 | Ruang rahasia voxel, dinding pelangi "CREATED BY WARREN ROBINETT" | glow pelangi | push pelan ke tulisan |
| E1 Payoff | Figur remaja di depan kabinet (layar ruang rahasia), amplop terbang, chip ROM | glow layar + neon | belakang bahu |
| E2 Payoff | Figur direktur, tiga telur voxel jatuh, kabinet "BONUS" | neon + spot | rendah, orbit pelan |
| F | Dua kabinet: "1973" pendarat, "1980" | spot per kabinet | pan kiri→kanan |
| OUT | Ruang arkade lebar, kabinet "EASTER EGG", marquee AUDIRA | neon penuh | tinggi dari kanan, tarik mundur |

## Aturan komposisi
- Maksimal judul + 1 chip per frame. Chip ≥ 250 px dari atas; label "ILUSTRASI, BUKAN CUPLIKAN ASLI" ≥ 30 px plat gelap.
- Hook dan outro berframing berbeda; AUDIRA tidak dobel dalam satu frame selain tanda tangan kecil.
- Bawah frame diisi badan kabinet/lantai neon, bukan hitam kosong.
- Frame contact sheet ≥ 0,3 dtk dari potongan.
