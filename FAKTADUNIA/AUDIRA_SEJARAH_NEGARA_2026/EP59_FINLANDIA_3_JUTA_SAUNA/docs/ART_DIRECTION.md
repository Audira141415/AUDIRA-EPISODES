# ART DIRECTION — EP59 Finlandia, 3 Juta Sauna
Style: WORLDFORGE

## WORLDFORGE (s5, 2026-11-24) — menggantikan FELTCRAFT (gagal juri 3,00 / 3,33)
- Engine: Remotion + React Three Fiber (3D). Finish DOCUMENTARY_WARM, HDRI `sky`, exposure 0.95, envIntensity 0.55, AO aktif (best memori WORLDFORGE).
- Material miniatur realistis (`src/episode/materials.ts`): kayu = peta serat papan prosedural + bump (roughness 0.78), batu/granit = bintik + bump, salju = putih kebiruan dengan kristal halus + sheen, es danau = physical clearcoat 1 roughness 0.08 (memantulkan langit). GLB kayu (kabin, dermaga, ember, bangku, perahu) memakai prop `grain="wood"` (box-UV). Tidak ada fibre/felt/jahitan.
- Uap/asap = bola transparan (opacity ≤ 0.26, depthWrite off), bukan bola wol.
- Kartu HUD = kartu gelap rgba(20,14,12,0.82) + garis aksen atas (oranye/biru/karat), sans-serif tebal 86–118 px; angka 3,2 JUTA muncul langsung (counter 0.35 dtk).
- Subtitle karaoke: y 1290, ukuran 56, maks 4 kata, pelat krem 0.97, maks 3 baris, di luar 380 px bawah.
- Hindari (memori): rumput datar plastik (rumput Berlin pakai peta bintik hijau tua), figur ToyPerson besar di FG (figur kecil, skala ≤ 0.6 di hook).

## Arsip arah FELTCRAFT (tidak dipakai lagi)

- Engine: Remotion + React Three Fiber (3D), kit `src/kits/feltcraft`, finish DOCUMENTARY_WARM, exposure 0.82, envIntensity 0.25, AO aktif.
- Mood: hangat, nyaman, tenang. Diorama wol-flanel di atas meja kerja; boneka bergerak 12 pose/dtk (stepT), kamera halus 60 fps.
- Palet: salju felt krem-putih `#F3EEE6`, pinus hijau tua `#3F6B4A`, kayu sauna madu `#B9814E` / tua `#6E4426`, danau biru felt `#6C9DB8`, lampu jendela jingga `#FFB25A`, uap wol putih susu `#FBF6EE`, aksen bendera biru Finlandia `#1F4FA0`. Senja payoff: oranye `#F2A45C` → ungu muda `#9C8BC4`.
- Latar tidak gelap pekat (pelajaran memori: navy/hitam = void datar). Malam/terowongan pakai felt cokelat-ungu menengah `#5A4A6A` dengan cahaya jendela hangat sebagai subjek.
- Figur: ToyPerson pose "sit"/"stand", berhanduk felt (silinder melingkar torso) — sopan untuk semua platform. Satu subjek terang per frame; figur di luar pita subtitle (y 1280–1470).
- Bahan: Fuzzy shell untuk bukit, salju, uap, batu kiuas; feltMaterial untuk tanah/dinding; GLB polyfork (kabin kayu, pinus, apartemen, tambang, ember kayu, bangku, jam pasir, tiang bendera, perahu, dermaga) di-tint ke palet kayu.
- HUD: kartu krem `rgba(255,247,232,0.92)` tinta `#4A2E1E`, serif tebal, angka via KineticCounter, tiap angka/tahun VO punya kartu di area atas-tengah (y 240–700).
- Brand di dunia 3D: papan kayu bertulisan "AUDIRA" di dinding kabin hero (adegan payoff) + di plang sauna desa atlet.
- Larangan: cincin Olimpiade, logo UNESCO, wajah orang nyata, partikel titik/garis/kubus polos sebagai visual utama.
- Lingkungan mengikuti fakta (G5): danau + hutan pinus bersalju, deret rumah, jalan kota (apartemen/kantor/Parlemen felt), poros tambang, interior sauna, sauna asap, desa atlet 1936, danau senja.
