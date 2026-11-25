# STYLE_DECISION — EP58 Mongolia, Kuda Lebih Banyak dari Manusia

Style: WORLDFORGE
Engine: Remotion + R3F (3D)
Tanggal: 2026-11-23
approved: yes (dipilih AI sesuai keputusan pengguna 2026-11-23: style tanpa acc; acc hanya di render final)

## Alasan
Ceritanya tentang skala: stepa tanpa batas, kawanan kuda yang jumlahnya melebihi manusia, musim dari +30 °C sampai −40 °C, dan balapan 30 km. WORLDFORGE dibuat untuk lanskap luas dengan kamera terbang (flythrough), kabut atmosfer, dan matahari rendah, jadi rasa kagum datang dari dunia itu sendiri. Kuda GLB (Walk/Idle/Run ber-rig) jadi subjek nyata di tiap adegan.

## Alternatif yang ditolak
- TOYDIORAMA: lucu dan ringan, tapi diorama meja membuat stepa terasa kecil; topik ini justru soal luasnya.
- STORYBOOK: hangat untuk anak, tapi angka sensus dan suhu ekstrem butuh dunia 3D realistis dengan HUD data.

## Kelemahan tercatat (motion memory WORLDFORGE) yang diantisipasi
- Statistik di langit terang = kontras rendah → kartu HUD gelap rgba(20,14,12,0.82), label ≥ 34 px.
- Subjek terlalu kecil di shot lebar → kuda hero ≥ 35–50 % lebar frame di tiap beat; satu subjek jelas per frame.
- Figur ToyPerson + rumput datar terbaca plastik → rumput berlapis (instanced blades) + terrain bertekstur, figur kecil/jauh.

## File
- cover-reference.jpg (quality bar WORLDFORGE)
- cover-topic.png (dirender setelah dunia stepa dibangun)
