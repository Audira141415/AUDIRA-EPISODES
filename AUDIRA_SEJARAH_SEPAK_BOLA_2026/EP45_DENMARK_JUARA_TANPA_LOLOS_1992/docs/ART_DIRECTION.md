# Art Direction — EP45 Denmark, Juara Tanpa Lolos (PIXELSTORY)

## Gagasan visual
Kisah tim cadangan yang dipanggil mendadak lalu juara, diceritakan seperti game sepak bola 16-bit tahun 1992. Setiap babak = satu "level" pixel-art 2.5D. Dunia dilukis sekali sebagai albedo dan di-relight tiap frame oleh kit `studio/src/kits/pixelstory` (8 px layar per 1 px art, 135 × 240 art px).

## Look (terkunci dari cover topik yang disetujui 2026-11-22)
- Palet kit Lamplight Diorama: bayangan wine-black, highlight emas. Merah Denmark `#C8202E`, putih `#F3E6CC`, emas piala `#E9B347`. Hijau seri `#2BD46A` hanya untuk kicker/HUD.
- Cahaya: per adegan satu sumber dominan (lampu stadion, TV tabung, matahari sore), plus satu rim dingin `#CFE0FF` yang memisahkan subjek merah dari latar merah. Ambient rendah (0,11–0,16).
- Kedalaman: 3 layer kamera (BG z≈1500 blur ringan, MG z=1000 tajam, FG z≈620 blur): tribun/dinding, lapangan + subjek, kepala fotografer/daun/benda dekat kamera.
- Satu subjek utama per beat, di tengah. Tidak ada deretan 4+ objek setara.
- Tipografi: judul Anton (kit `FONT.display`), label dan HUD Silkscreen (`FONT.pixel`) ≥ 30 px @1080, angka skor dengan `Counter`/`PixelType`.

## Aturan konten
- Pemain asli (Schmeichel, Van Basten, Jensen, Vilfort, Møller Nielsen) = sprite generik tanpa wajah + kartu nama. Tidak ada logo UEFA, DBU, DFB, KNVB, atau replika trofi Henri Delaunay; piala = cawan emas generik bertelinga dua.
- Bendera di tribun = kain merah dengan salib putih (bendera negara, bukan lambang federasi).
- Angka di layar hanya dari `research/SOURCE_REGISTER.md`.
- Pita karaoke y 1290–1540 bebas chip/angka penting. Safe zone atas 180 px, bawah 380 px.
- Brand: AUDIRA di papan iklan stadion (adegan A, E, OUT), VO menyebut AUDIRA di hook dan outro, `AudiraSignature` lapisan terakhir, kartu outro AUDIRA 2–3 dtk terakhir.

## Gerak
- Kamera kit `CinematicCamera` + `cameraAt` (dolly z, pan, DOF) kontinu, tidak pernah diam > 1,5 dtk; `drift` halus di setiap shot.
- Transisi antar level: "pixel wipe" (blok 8 px menyapu searah gerak) atau iris kotak ala game; arah keluar = arah masuk adegan berikutnya.
- Animasi sprite dipegang per 4 frame (gaya pixel), kamera tetap halus 60 fps.

## Multi-scene (6 adegan)
A Stadion final (cover) → B Ruang tamu 1992 + TV berita → C Lapangan siang, tiga level grup → D Gawang malam, adu penalti → E Final Göteborg, dua gol + angkat piala → OUT Stadion lebar + papan skor AUDIRA.
