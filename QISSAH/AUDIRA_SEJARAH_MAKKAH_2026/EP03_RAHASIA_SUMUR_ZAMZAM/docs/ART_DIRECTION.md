# Art Direction — EP03 RAHASIA SUMUR ZAMZAM

**Style:** INNERWORKS (cutaway / mekanisme terbelah), disetujui pengguna 2026-11-10; cover topik disetujui 2026-11-10 (`style/cover-topic-16x9.png`, `style/cover-topic-9x16.png`). Quality bar: `style/cover-reference.jpg`.

## Ide visual
"Sumur di bawah kakimu": tanah di bawah lantai tawaf dibelah pada satu bidang potong (z = 0) sehingga lapisan, poros sumur, pompa, dan pipa terlihat sebagai mesin hidrologi yang bekerja. Bab sejarah memakai diorama miniatur di atas alas berbevel (lembah, sumur tertimbun, kepala sumur lintas zaman); bab teknis memakai potongan pahlawan, pabrik Kudai, laboratorium, dan globe.

## Palet (layout.ts)
| Token | Hex | Dipakai untuk |
|---|---|---|
| bg | #efe9df | latar studio terang (malam c03: digeser ke #2c3544) |
| marble | #f4f1ec / cut #e3ddd3 | lantai tawaf |
| concrete | #b9b4ab / cut #a29c92 | basement, segel 2003 #8d877d |
| sand | #d9b98a / #c79f6a | aluvium Wadi Ibrahim |
| weathered | #f2a93b | lapisan lapuk 0,5 m (aksen jalan masuk air) |
| diorite | tekstur bintik felspar/hornblende di atas #7c8580 | batuan dasar |
| water | #3fb2d9 / cut #6fd0ee, aliran #39c6f2 | air, tetes, chevron aliran |
| coral | #ef7a43 | pompa, penanda, aksen kartu |
| gold | #d6a842 | pita kiswah, kijang emas, pintu |
| ink | #1d2326 | teks |
| AUDIRA green | #0b3d2e | plakat diorama, outro |

## Material
Marmer clearcoat bertekstur ubin; pasir dengan kerikil tertanam di bidang potong; lapisan batu pasangan di poros (tekstur blok); diorit bintik garam-merica dengan urat tipis dan faset tersudut; air semi-transparan di layer FX (tidak merusak AO); baja tahan karat logam penuh dengan HDRI studio; kiswah kain gelap dengan pita emas logam. Plinth diorama: batu matte berbevel, sisi lebih gelap dari permukaan (bahasa bidang potong).

## Cahaya & finishing
`<Finish hdri="studio" profile=CINEMA_TEAL_ORANGE exposure=1 envIntensity=0.55 ao>` (parameter terbaik motion memory INNERWORKS). Key directional hangat (3,1) yang mengikuti set yang sedang difilmkan (bayangan selalu ada), hemisphere 0,55, fill dingin; lampu inspeksi cyan di poros; UV biru di pabrik; cahaya lembut di gelas air (c07). Kabut studio 240–560 m.

## Kamera
Fov 16:9 nyata 30–44° (ditulis sebagai fov potret lalu dikonversi `FormatFov`). Tiga perempat sedikit dari atas, close-up di basement, tangga tertutup, pompa, dan bukaan air. Satu jalur kontinu per bab; cut hanya di batas set yang jauh. `audit:rig` (salinan dari starter): tanpa lompatan dan tanpa berhenti di tengah film, puncak 1,3.

## Tipografi & layout
Manrope (OFL, bundel lokal). Judul kartu bab 66 px (16:9), label teknis 32/22 px dengan titik aksen dan leader ke titik 3D yang diproyeksikan. Safe area: 16:9 sisi 96, atas 60, bawah 120 (caption di atasnya); 9:16 atas 180, bawah 380 (caption karaoke di atasnya).

## Aturan penggambaran
Tidak ada nabi, malaikat, atau Allah dalam bentuk apa pun (tanpa sosok, siluet, tangan, bayangan). Kisah Hajar: jejak kaki, air, cincin pasir. Kisah Abdul Muthalib: sekop bekerja sendiri, benda, malam. Ka'bah tampil utuh dan bermartabat (kubus hitam, pita emas, pintu, sudut Hajar Aswad); tidak pernah rusak atau jadi properti main-main. Kehancuran kubah 930 hanya abstrak (berubah jadi garis denah lalu pudar). Jemaah: figur kecil tanpa wajah atau titik kerumunan. Nama AUDIRA di dunia 3D satu kali: plakat pembuat di alas diorama c04.
