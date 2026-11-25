# STYLE_DECISION — EP58 Mongolia, Kuda Lebih Banyak dari Manusia

Style: POLYVERSE
Engine: Remotion + R3F (3D)
Tanggal: 2026-11-24
approved: yes (dipilih AI sesuai keputusan pengguna 2026-11-23: style tanpa acc; acc hanya di render final)

## Riwayat
- WORLDFORGE (2026-11-23) gagal 2 ronde juri buta: 3.33 dan 3.33 (material 2, lighting 3). Penyebab: aset kuda/ger polyfork memang low-poly faset, jadi dinilai sebagai "plastik/diorama mainan" terhadap reference WORLDFORGE yang realistis. Arsip: style/_worldforge/.

## Alasan
Semua aset hero (kuda ber-rig, ger, herder) adalah low-poly faset. POLYVERSE menjadikan faset itu bahasa visual yang disengaja: poligon flat-shaded, langit pastel fajar, matahari samping rendah yang membuat sisi faset gelap-terang tegas, kabut berlapis dan puncak faset jauh. Dunia stepa dan 10 set multi-scene tetap; yang berganti resep material dan cahaya (hukum 5: kit = shader/mood).

## Alternatif yang ditolak
- TOYDIORAMA: diorama meja mengecilkan skala stepa, padahal topik soal luasnya.
- MEMPHISDIORAMA (rekomendasi fallback kategori): pop-art ceria tidak cocok untuk Genghis Khan, musim −40 °C, dan nada dokumenter.

## Kelemahan tercatat yang diantisipasi
- Pastel terlalu pucat pada exposure 1.0 → exposure 0.82, langit atas lebih dalam (#3F4F98 → lila → peach).
- Hemisphere fill terlalu terang membuat faset datar → env 0.25, sisi bayangan faset gelap.
- Debu bola halus terbaca gumpalan clay → debu dodecahedron faset.

## File
- cover-reference.png (quality bar POLYVERSE)
- cover-topic.png (dirender dari MongoliaFinal dengan look POLYVERSE)
