# FILM_LAYOUT_S4 — tata letak adegan (ditulis s4, lanjutan FILM_PLAN.md)

## Sudah ditulis s4
- `src/film/glb.tsx`: prop baru `sil={{id,color,gain}}` → kontur INK pada GLB.
- `src/episode/` Lisbon DIHAPUS. Ditulis: `timeline.ts` (SHOTS 12 sub-shot + cameraAt + shake 20.9–23.5 & 39.5–41 + CARDS 35 kartu, tone hero/grief/foe/neutral, quote S7A), `parts.tsx` (clamp01/lin/ease/hsh, limestone(), cobble(), soilMat/darkMat/boneMat/clothMat/windowMat, `Block{a,b,mat,sil}`, `Tunnel{w=2.6,h=2.3,z0,z1,endWall}` sepanjang −z, `BoneWall{x0,x1,z,h,progress,rotY,pos}` instanced femur-knob + skull+socket, `Plaque{lines,pos,w,h,rotY,glow}`, `CutEarth{chamber:[x0,x1,y0,y1],zBack}` potongan tanah muka z=0).
- BELUM: `scenes.tsx`, `KatakombeFilm.tsx`, `Root.tsx`.

## Dimensi GLB (mesh mentah; Glb menormalkan ke tinggi h)
gate 4×3.74×0.61 · brownstone 8×17×8 · stele 0.75×1.1×0.3 · wall-run 4×0.6×0.5 (panjang x) · rubble 3×1.2×2.8 · lamp-post 0.55×3.6 · tenement 8.6×20×13.2 · well-head 2×1.4×2 · horse 0.93×2.57×2.8 (panjang z) · wagon 1.66×2.34×5.82 (panjang z → rotY π/2 untuk jalan sepanjang x) · cross 0.8×1.63 · mound 2×0.62×1 · hand-lantern sangat kecil (pakai h≈0.35) · mine-cart 1.25×1.3×1.8 · church 10×20.5×18 · spiral-stair 2×3×2 · townhouse 4×7.5×8.

## Rancangan per adegan (koordinat meter, kamera di sisi +z; keys kamera sudah di timeline.ts)
- S1 0–5.7: Tunnel z0 6 → z1 −14, BoneWall kiri (rotY π/2, pos x −1.28) & kanan (rotY −π/2, x 1.28) z 5…−13, h 1.6; Plaque ["AUDIRA"] di dinding ujung (0,1.6,−13.55) w1.4 h0.45; Candle/pointLight hangat tiap 4 m; look TUNNEL (fog #1a110b 0.06, exposure 1.1).
- S2 5.7–17.2: CutEarth chamber [−6,6,−7.5,−1.8] zBack −4.5; rumah GLB di z −8 (townhouse x −9/−4.5, brownstone x 1 h12, tenement x 8 h14), lamp-post z −2.5; di ruang: 3 pekerja Figure amber (armR fwd 1.5+1.0·sin(t·4)), mine-cart (3.5,−7.5,−1.6), tumpukan balok kapur, hand-lantern + pointLight, Embers debu; look DUSK.
- S3A 17.2–24.4: jalan sepanjang −z, rumah kiri x −6 rotY π/2 & kanan x 6 rotY −π/2 tiap 6 m; lamp-post x ±3.6 + pointLight; jalan berlubang x[−3,3] z[−12,−6]: slab tag crimson turun 21.0–23.0 ke y −5 + miring; lubang = kotak gelap; rubble GLB di dasar; Embers abu 21+; look NIGHT.
- S3B 24.4–28.8: Tunnel tanpa tulang, pilar batu baru z −4/−9; inspektur amber jalan dari z −12 ke −6 (gait), lentera ikut; pekerja kneel di pilar.
- S4A 28.8–36.6: NIGHT fog 0.03; gate z −2 h 4.2, wall-run kiri/kanan; grid salib/stele/mound z −5…−18 kontur violet; church z −30 h 18; Lantern di sisi gerbang.
- S4B 36.6–43.6: CutEarth chamber [−0.5,5,−3.4,−0.6]; tenement x 2.5 z −9 h 12; sisi kiri permukaan = makam (mound/cross violet) + wall-run rotY π/2 di x −1; dinding kiri ruang = grid bata tag crimson, retak 38.5, terlempar ke +x 39.6–41, gundukan tanah tumbuh.
- S5A 43.6–52: well-head (0,0,−3) h 1.6; 8 Candle radius 1.6; pendeta ivory robe (1.6,0,−2.2) raiseFist→point; 6 jemaah kneel/pray z 0…1.5 rotY π; church z −16; look NIGHT + hangat.
- S5B 52–58.4: 3 wagon rotY π/2 x lead −14 + 1.6·(t−52), jarak 6; kain hitam Block di atas; horse di depan (+x); pembawa obor Figure itemR torch gait z 1.4; rumah z −8; lamp-post z −3.
- S6 58.4–70.4: galeri sepanjang x, BoneWall x[−8,8] z −1.6 h 1.9 progress lin(58.4,66); Héricart amber jalan x −3→−0.5 lalu point; hand-lantern + pointLight; Candle di lantai.
- S7A 70.4–75.2: portal pilar x ±1.3 + lintel y 2.6–3.2 di z −4, Plaque ["ARRÊTE ! C'EST ICI","L'EMPIRE DE LA MORT"] di lintel; Lantern ±1.9; tembok samping; BoneWall pendek di balik portal.
- S7B 75.2–84: spiral-stair GLB h 9 base y −9 di (0,−9,0); pengunjung ivory pada heliks turun; dinding silinder batu di sekitar.
- S8 84–92.2: CutEarth seperti S2 versi malam (look DUSK→NIGHT), di ruang: Tunnel/BoneWall + Plaque ["AUDIRA"] di dinding belakang + Lantern; di atas rumah + lamp-post bercahaya + jendela windowMat.

## HUD / film (KatakombeFilm.tsx)
- delayRender sampai `chronicleFontsReady()`; ShotCanvas(shot=cameraAt(t), look=LOOKS[scene]) + Scene; overlay div: kartu rgba(11,12,16,.78), border-top INK per tone, Anton (F_STAMP) angka 116–150 px, label Barlow (F_LABEL) ≥ 40 px, top 250; quote = panel border-left crimson F_CITE italic.
- Subtitle core/hud/Subtitle position 1290 size 56 maxWords 4, plate gelap, active amber; DISPLAY: San+Inosan → satu kata "Saints-Innocents" (start San, end Inosan), Ru→Rue, Danfer→d'Enfer, Lui→Louis, Erikar→Héricart, Turi→Thury, Audira→AUDIRA.
- Voiceover src audio/vo.wav; AudiraOutro 3 dtk dari 89.2; AudiraSignature seed "katakombe-paris-ep77" outroSeconds 3.
- Root.tsx: hanya Showcase bawaan boleh tetap? → TIDAK: daftar hanya KatakombePreview (540×960@30) + KatakombeFinal (1080×1920@60), hapus Lisbon & PenggantiGibran (impor kit contoh lain juga boleh dibuang).
