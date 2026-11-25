# Art Direction — EP01 Susi Susanti, Emas Pertama 1992 (PIXELSTORY)

## Gagasan visual
Final Olimpiade yang dibalik dari kalah telak menjadi emas, diceritakan seperti game olahraga 16-bit tahun 1992. Setiap babak = satu "level" pixel-art 2.5D. Gim pertama yang kalah = "nyawa hampir habis", comeback = "naik level". Dunia dilukis sekali sebagai albedo dan di-relight tiap frame oleh kit `studio/src/kits/pixelstory` (8 px layar per 1 px art, 135 × 240 art px).

## Look (terkunci dari cover topik yang disetujui 2026-11-22)
- Palet kit Lamplight Diorama: bayangan wine-black, highlight emas. Kostum Indonesia putih `#F3E6CC` + pita merah `#D02A30`; lawan merah tua `#B8222E`; emas medali `#E9B347`; lantai lapangan hijau `#2BD46A` (dari `arena.ts`). Hijau seri juga untuk kicker/HUD.
- Cahaya: per adegan satu sumber dominan (spot atap arena, lampu meja kamar, sorot podium, matahari sore Jakarta), plus satu rim dingin `#CFE0FF` dari kanan atas. Ambient 0,11–0,12, exposure 1,1, dither 0,45 (parameter terbaik PIXELSTORY dari memori).
- Kedalaman: 3 layer kamera (BG z 1500 blur ringan, MG z 1000 tajam, FG z 620 blur): tribun/dinding/gedung, lapangan + subjek, tiang net/kepala penonton/kelopak bunga dekat kamera.
- Satu subjek utama per beat, di tengah. Tidak ada deretan 4+ objek setara.
- Tipografi: judul Anton (`FONT.display`), label dan HUD Silkscreen (`FONT.pixel`) ≥ 34 px @1080, angka skor dengan `Counter`/`PixelType`.

## Pelajaran EP45 yang wajib diterapkan
- Stamp/chip/caption tidak boleh menutupi subjek (hero, kok, papan skor). Taruh di atas subjek atau di sisi kosong.
- Lebar stamp ≤ 860 px, tanpa rotasi di adegan aksi.
- Label ≥ 34 px.
- Sprite pemain di wide shot scale ≥ 1,4.
- Prop bertulisan (papan skor, spanduk, papan iklan) tidak terpotong frame; 2 dtk pertama tidak ada objek terpotong di zona bawah.

## Aturan konten
- Susi Susanti, Bang Soo-hyun, Alan Budikusuma, Ardy Wiranata = sprite generik tanpa wajah + kartu nama. Tidak ada wajah asli, foto, logo IOC/cincin Olimpiade, logo BWF/PBSI, atau maskot Barcelona '92. Medali = cakram emas generik berpita.
- Bendera di arena dan podium = Merah Putih (bendera negara). Bendera Korea Selatan tidak ditampilkan; lawan cukup dibedakan warna kostum + kartu nama "KOREA SELATAN".
- Ejaan tunggal: "Susi Susanti", "Bang Soo-hyun".
- Teks di layar: "EMAS PERTAMA", bukan "medali pertama". Massa pawai: "HINGGA ±1 JUTA ORANG". Tidak ada teks "lagu kebangsaan diputar penuh".
- Angka di layar hanya dari `research/SOURCE_REGISTER.md` (nomor fakta dicatat di naskah).
- Pita karaoke y 1290–1540 bebas chip/angka penting. Safe zone atas 180 px (judul mulai ≥ 236 px), bawah 380 px bersih.
- Brand: AUDIRA di papan iklan arena (adegan A, C, D, OUT) dan di spanduk pawai (F); VO menyebut AUDIRA di hook dan outro; `AudiraSignature seed="olahraga-EP01"` lapisan terakhir; kartu outro AUDIRA 2–3 dtk terakhir.

## Gerak
- Kamera kit `CinematicCamera` + `cameraAt` (dolly z, pan, DOF) kontinu, tidak pernah diam > 1,5 dtk; `drift` halus di setiap shot.
- Kok sebagai "carrier": arah terbang kok di akhir adegan = arah masuk adegan berikutnya.
- Transisi antar level: pixel wipe (blok 8 px searah gerak kok) atau iris kotak ala game.
- Animasi sprite dipegang per 4 frame (gaya pixel), kamera tetap halus 60 fps.
- Momen sebelum payoff (match point gim ketiga) diberi jeda kamera pelan 0,8 dtk, lalu impact.

## Multi-scene (6 set)
A Arena final malam (= cover, `ArenaShot.tsx`) → B Kamar atlet malam + papan waktu 1952→1992 → C Arena final sisi samping, gim 1 kalah 5-11 → D Net-level close-up, comeback 11-5, 11-3 + stempel "EMAS BULU TANGKIS PERTAMA DI DUNIA" → E Podium + Merah Putih naik, lalu lapangan kedua untuk Alan → F Jalan Jakarta sore, mobil terbuka + Monas siluet → OUT arena lebar + kartu teaser EP02 + kartu outro AUDIRA.
