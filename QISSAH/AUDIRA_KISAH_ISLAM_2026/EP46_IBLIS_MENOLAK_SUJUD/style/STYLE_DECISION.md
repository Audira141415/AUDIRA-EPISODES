# STYLE DECISION — EP46 Iblis Menolak Sujud (QS 2:30-37, 7:11-18, 18:50, 38:71-85)

- Style: PAPERWORLD
- engine: remotion (2D murni: SVG/DOM kertas berlapis, tanpa R3F) — pola gold PAPERWORLD EP18 Svalbard (juri final 4.17)
- Tanggal: 2026-11-24
- approved: no (AI memilih sendiri sesuai keputusan pengguna 2026-11-23; acc pengguna hanya di gerbang render final)

## Alasan (awam, terkait topik)
Inti kisah ini adalah perbandingan **bahan**: "aku dari api, dia dari tanah". Kertas potong berlapis membuat dua bahan itu nyata di layar:
kertas jingga-merah menyala berlapis untuk api, kertas kraft cokelat bertekstur untuk tanah. Kertas juga aman untuk adab: malaikat
digambarkan sebagai pilar cahaya kertas tanpa wajah, Adam sebagai gundukan tanah liat yang bercahaya (tanpa sosok/wajah), Iblis sebagai
nyala api kertas dan bayangannya yang memanjang, bukan monster.

## Alternatif ditolak
- CHRONICLE (juri final 3.87, 5×) — siluet tinta gelap cocok untuk drama, tapi memori mencatat figur piktogram datar (material 3) dan palet pucat; kontras api vs tanah kurang terasa sebagai bahan.
- MOSAICFORGE (juri 4.0, 1×) — nuansa ubin Islami, tapi ceiling material terukur 3.6 dan teks di atas ubin sulit terbaca; bukti juri masih tipis.

## Parameter dari motion memory (`audira_style_memory get PAPERWORLD`)
- Wajib diterapkan: key light terarah kiri-atas + bayangan jatuh panjang searah (offset 28–40 px, blur 6–10), rim highlight tepi, pool cahaya per adegan; kartu P() dengan dinding tepi gelap (offset 5.5,7.5) + tepi potong pucat + serat multiply 0.55; haze krem hanya antara BG dan MG; FG blur 9 di sudut bawah (DOF); kamera orbit elips (dx=sin(1.1t)*24, dy=cos(1.1t)*28) + zoom 1.05+0.012t; glyph besar digambar sebagai path, bukan <text> bertumpuk.
- Parameter terbaik: engine remotion-2d-svg, paperFiberOpacity 0.55, dofBlurStdDev 9, hazeOpacityMax 0.45, dropShadowStdDev 7, contactShadowStdDev 2.5, sceneCount ≥ 7.
- Hindari: figur kerucut halus (terbaca plastik); plakat kosong saat VO menyebut surah (G22); semua frame template sama (variasikan close-up/skala); label peta di atas caption; self-score cenderung +0.5 di atas juri.

## File
- `cover-reference.jpg` — cover kit PAPERWORLD (quality-bar).
- `cover-topic.png` — BELUM dirender: dirender di awal Sesi B dari komposisi film (frame hook S1) setelah scaffold tahap 5.
