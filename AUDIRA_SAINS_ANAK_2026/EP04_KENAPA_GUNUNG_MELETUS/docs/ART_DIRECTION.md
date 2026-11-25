# ART DIRECTION — Kenapa Gunung Meletus (AUDIRA Sains EP04)

Style: DISASTERSIM

## Arah
Simulasi bencana gaya laboratorium yang tenang dan edukatif. Bumi dan gunung api diperlakukan seperti model sains: bisa dibelah, diberi label, dan diukur. Bukan film bencana: tanpa korban, kilat merah, atau nada sensasional.

## Engine & finishing
- Remotion + R3F (3D), 1080×1920 @ 60.
- `<FilmScene>` dengan profil `DOCUMENTARY_WARM`, exposure 1, envIntensity 0,55, AO aktif, background lab `#0B141C` (motion memory DISASTERSIM).
- Dip warna lab 0,14 dtk di setiap potongan adegan.

## Palet
- Lab/void: `#0B141C`, alas plinth metalik, grid halus.
- Magma/lava: oranye `#FF6A1E`–`#FF7A2E`, emissive, tanpa bloom berlebih.
- Indonesia/sorotan: emas `#FFC14E`.
- Air/info: biru `#5EC8FF` dan `lvlInfo` kit.
- Warna status (hijau–kuning–oranye–merah) HANYA dipakai di tangga Normal/Waspada/Siaga/Awas.

## Lingkungan per adegan (kit = shader/mood, bukan jebakan lingkungan)
1. Laut senja Selat Sunda + pulau gunung, pohon kelapa, perahu nelayan (GLB).
2. Meja lab: globe kelas (GLB) + busur Cincin Api.
3. Balok penampang bumi (kit `GunungEarthBlock`).
4. Meja lab: kaleng minuman (GLB); lalu dataran batuan vulkanik dua gunung.
5. Laut kelabu + kaldera Tambora; desa bersalju; lembah hijau dengan pos pantau.
6. Sawah pagi di kaki gunung, matahari terbit.

## Tipografi & HUD
- Inter/Segoe UI. Kartu callout angka 92 px, keterangan 40 px, tidak ada teks info di bawah 36 px.
- Chapter tag `● AUDIRA SAINS // <BAB>` di y=196.
- Kartu di y=270 dan y=500/540 (di dalam safe zone atas 180 px).
- Subtitle karaoke 54 px di y=1300, kata aktif `#FFC14E`, 5 kata per baris.
- Maksimal 2 label 3D sekaligus.

## Brand
- Label 3D "AUDIRA · POS PANTAU" dan "AUDIRA SAINS · TANAH VULKANIS" di dalam dunia.
- `AudiraSignature` seed `sains-anak-EP04-gunung`, outro card 3 dtk terakhir.
