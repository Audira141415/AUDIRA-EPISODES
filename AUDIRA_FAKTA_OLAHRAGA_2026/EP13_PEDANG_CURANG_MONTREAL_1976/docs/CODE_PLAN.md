# CODE PLAN EP13 (untuk sesi lanjutan)

Kondisi 2026-11-24 s2. Kode: `studio/src/scenes/ep13/`.

- `tex/make_tex.py`, `tex/make_props.py`: sudah dijalankan, hasil bagus (sudah dilihat). Impor sebagai modul webpack (`import x from "./tex/x.png"`), tidak lewat staticFile. Bila tsc mengeluh modul gambar, tambah `ep13/assets.d.ts` (`declare module "*.png"` dan `"*.jpg"`).
- Sprite (px, sumbu x ke kanan): guard 232x420 (kubah menghadap kanan, bilah keluar kanan), collar 56x150, grip_leather dan grip_bare 640x170 (lubang bor di x=395, y tengah+4, radius 46), pommel 130x140 (leher di kanan), blade 1400x60 (pangkal kiri), tip_barrel 260x130 dan tip_button 70x130 (tombol di kanan), button 150x150 (tombol jamur, batang kiri; putar -90 supaya menghadap atas), finger 120x330 (jari sarung tangan, ujung di bawah), lamp_off dan lamp_on 300x400, mask 260x330 (menghadap kanan).
- Rakitan gagang kiri ke kanan: pommel, grip, collar, guard, blade. Skala supaya lebar gagang utuh >= 60% layar (pommel+grip+collar+guard = 1058 px; potong bilah di tepi kanan).
- `lib.tsx`: waktu `W(id, prefix, nth)`, `Shot` + `Layer d` (parallax linear), `Plane`, `Beam`, `Glow`, `Smoke`, `Dust`, `Finish`, `Limb`, `Fencer` + pose (EN_GARDE, LUNGE, STAND, PROTEST, `mix`), HUD `Title`/`Stamp`/`Tag`, `Karaoke`. BELUM pernah dikompilasi. `Limb` memakai uid global: ganti ke `React.useId()` bila id gradien bertabrakan.
- BELUM: `Film.tsx` (21 shot sesuai SHOTLIST), `Cover.tsx`, `index.ts` (ekspor `Film`, `Cover`, `TOTAL_SECONDS = tl.total`), baris EP13 di `Root.tsx` (pola EP07: Ep13Cover, Ep13Preview, Ep13Final + SLUG `Ep13: "olahraga-EP13"`).
- Film wajib: `delayRender` font lewat `chronicleFontsReady()` (impor dari `../ep05/chronicle/fonts.ts`, hanya baca), Audio VO `staticFile("audio/ep13/vo.wav")` seperti film lain, skala `useVideoConfig().width / 1080`, kelompok gambar lalu `Finish` lalu HUD lalu `Karaoke` (sembunyikan karaoke setelah OUTRO_AT = 80,285).
- Supaya tidak terganggu ep11/ep12: uji dengan entry sendiri `src/scenes/ep13/dev.ts` (registerRoot berisi komposisi EP13 saja) dan `npx remotion still src/scenes/ep13/dev.ts Ep13Preview ... --frame=N`.

## Arah per shot
- Aksen merah hanya saat lampu menyala (Glow merah + cahaya merah di figur dan lantai).
- Hook: frame 0 sudah berisi bilah bergerak ke dada lawan; celah ditandai garis putus; 2,08 s lampu besar mulai menyala, penuh 2,3 s.
- 12.5 s sirkuit: `>= 750 GRAM` boleh jadi chip (sumber 4). 35 s: siluet membungkuk membelakangi kamera, tanpa wajah.
- 42,5 sampai 55,9 (hero): permukaan terang (wood/plaster diterangi lampu meja), kupas kulit = potongan grip_leather di atas lubang yang diputar dan diangkat dengan bayangan; potongan melintang memakai button + pegas + kontak SVG; 4 sprite finger di atas gagang, dua kanan-kiri paling dekat pommel (manis dan kelingking) menekan; arus bergerak lewat kabel di bilah ke lampu.
- Bantahan: `"BUKAN PEDANG SAYA"` kicker `BANTAHAN ONISHCHENKO`, ukuran setara bukti, tanpa vonis di frame itu.
- Brand di adegan: map `ARSIP AUDIRA`, papan waktu dan spanduk piste `AUDIRA`.
- SFX: cek dulu `studio/sfx/cues/auto.py` TARGET_LUFS; graph render-final memakai `volume=-10dB` jadi stem harus -20. Perintah: `npm run sfx -- --shotlist=../EP13_PEDANG_CURANG_MONTREAL_1976/docs/SHOTLIST.md --out=public/audio/ep13/sfx.wav` (cek opsi timing dan duration).
- TEMP/TMP ke `F:/temp`. Jangan `cd` relatif di Bash (cwd terbawa); satu Bash per pesan bila memakai cd.
