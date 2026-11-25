# Art Direction — EP10 Rumah Sakit Gratis Kairo

**Style:** FELTCRAFT (diorama flanel dan wol yang dijahit tangan). Tidak ada karakter hewan (rubah kit tidak dipakai). Hanya bangunan, bangsal, benda, dan figur flanel kecil tanpa wajah (tanpa mata, mulut, atau fitur apa pun).

**Rasa:** hangat, merawat, "rumah sakit yang memberi". Cahaya lentera madu dari dalam gerbang adalah motif utama: pintu yang terbuka untuk semua.

## Palet (`project/src/scenes/mansuri/palette.ts`)
- Langit flanel biru senja `#5A758C` (malam `#1C2740`), matahari kancing `#F2B53B`.
- Batu pasir flanel `#EAC993`, sayap `#A88450`, krem `#F6E9CF`, ablaq karat `#B4512E`.
- Pita kaligrafi hijau tua `#2F5A4A` dengan jahitan emas `#E8B64A` (goresan abstrak, bukan teks Arab).
- Cahaya lentera `#FFC46B` / `#FFB35C`; benang jahit krem `#FFF4DE`.
- Pelat label gelap `#2E1D13` dengan teks krem; papan AUDIRA hijau `#0B3D2E`.

## Material
- Semua permukaan `feltMaterial` kit (roughness 1, cloth sheen, peta serat sebagai warna + bump). Fuzz shell pada figur, awan, kubah.
- Jahitan jelujur (`RunningStitch`) di tepi portal, dinding (garis ablaq), panel pintu, kubah, lantai kain perca, bangsal, quilt.
- Mengkilap hanya: kuningan (paku pintu, finial), labu kaca, koin, air kolam.
- Label dan papan: pelat flanel gelap bercetak (canvas texture), tidak emisif.

## Cahaya
- `<Finish>` DOCUMENTARY_WARM, exposure 0,82, envIntensity 0,25 (memori style).
- Key hangat `#FFE4BC`, spot hangat ke portal, rim dari belakang, hemisphere fill; point light hangat di tiap zona (ruang sakit, denah, kota) agar setiap beat punya subjek yang terang.
- Malam (Konon): key dan fill turun, lentera dan oud menyala; siang kembali di "lima abad".
- Vinyet gelap hangat di overlay (memisahkan subjek dari tepi).

## Komposisi
- 9:16, judul ≥ 240 px dari atas, caption di atas 380 px bawah, chip di pelat gelap x 70–1010.
- Satu hero per beat: gerbang, kasur + labu obat, denah empat bangsal, gulungan wakaf, kota kecil, tumpukan baju, oud, papan 1915, gerbang + papan AUDIRA.

## Larangan
- Tanpa wajah tokoh sejarah; tanpa nabi/malaikat; tanpa teks Qur'an; tanpa angka yang dibuang riset (8.000 kasur, 1 juta dirham, 1.000 dinar).
