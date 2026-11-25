# STYLE_DECISION — EP05 PlayStation lahir dari pembatalan Nintendo

Style: ARCADECRT
- Tanggal: 2026-11-23
- approved: yes (pengguna memilih "ARCADECRT" setelah PIXELSTORY gagal juri 2 putaran)
- Engine: HyperFrames 2D (canvas world2d.js + HTML/GSAP), 1080×1920 @ 60 fps

## Alasan
Kisah lahirnya konsol game diceritakan di dalam mesin arcade malam hari: kamera menyelam menembus layar CRT melengkung (scanline, glow fosfor, aberasi RGB) ke dunia game piksel. Paling cocok untuk sejarah dan nostalgia game. Skor juri memori 3,61; episode EP04 Roblox lolos juri 4,0 dengan pola "satu CRT hero per beat + chip neon besar untuk angka".

## Alternatif ditolak
- PIXELSTORY: dipakai lebih dulu, gagal juri draf 2 putaran (2,67 lalu 3,0). Alasan juri: dither terbaca noise, hook tidak menunjukkan Sony dipermalukan, 3–4 panel teks menumpuk di kiri atas, adegan kontrak hanya dokumen, teks kecil. Arsip: STYLE_DECISION.pixelstory.md, cover-topic.pixelstory.png.
- FILM16 (dokumenter 16 mm): tidak dipilih pengguna.
- VOXELVERSE (diorama voxel): tidak dipilih pengguna.

## Perbaikan wajib dari kegagalan PIXELSTORY
- Cahaya dicampur halus (alpha blend), bukan dither Bayer.
- Hook: Sony di panggung disorot merah, penonton menunjuk/tertawa; makna terlihat tanpa teks.
- Maksimal 2 elemen teks per frame: judul bab di marquee neon + 1 chip neon angka.
- Adegan kontrak: dua tokoh di meja perundingan, klausul muncul sebagai callout.
- Teks HUD ≥ 44 px.

## Pelajaran memori yang diterapkan
- Satu CRT hero per beat; chip neon besar untuk angka; tokoh utuh, di bawah 180 px atas.
- Gerak kamera pelan dan kontinu (dive ke layar, pull-out saat bab ganti).

## Aturan merek
Konsol, kontroler, dan tokoh digambar ulang sebagai ilustrasi piksel generik. Tanpa logo Sony/Nintendo/Philips/PlayStation; nama produk hanya teks polos. Tokoh nyata = figur piksel generik + papan nama. Kabinet arcade generik bermerek AUDIRA.
