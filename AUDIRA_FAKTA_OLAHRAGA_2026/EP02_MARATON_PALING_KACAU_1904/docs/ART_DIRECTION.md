# Art Direction — EP02 Maraton Paling Kacau, St. Louis 1904 (VINTAGEFORGE)

## Gagasan visual
Maraton Olimpiade 1904 diceritakan sebagai diorama museum bernuansa sepia yang hidup: mainan kayu dan kuningan di jalan desa Missouri yang berdebu. Setiap babak = satu vitrin diorama berbeda (jalan desa, stadion Francis Field, sumur, meja pelatih, kebun apel, kantor koran). Komedi gelapnya dibaca dari aksi figur, bukan dari teks: pelari melambai dari mobil, juara yang dipapah, pelari makan apel. Engine Remotion + R3F, set di `studio/src/scenes/ep02/`.

## Look (terkunci dari cover topik B yang disetujui 2026-11-22)
- Finish: `<Finish profile=VINTAGE_SEPIA_FILM exposure=0.82 envIntensity=0.25>` (parameter terbaik VINTAGEFORGE dari memori). Grain film halus, vignette hangat, gate weave sangat kecil.
- Palet `SEPIA` / `VP` dari `RoadSet.tsx`: debu krem `#d9c29a`, kayu tua coklat, kuningan/emas tua `VP.agedGold` untuk aksen dan HUD, kertas krem untuk kartu, tinta coklat gelap untuk teks. Satu aksen warna non-sepia per adegan yang menandai subjek: merah apel (Carvajal), hijau botol (strychnine), putih kemeja pelari.
- Cahaya: matahari sore 15.00 keras dari kiri atas (bayangan panjang, panas), plus fill hangat lemah; meja pelatih & kantor koran pakai lampu minyak tunggal. Kuningan/tembaga: metalness tinggi, envMapIntensity 2,5–3, hdri `warmStudio`.
- Kedalaman: BG langit kabur + bukit/tribun jauh dalam haze debu; MG set + subjek tajam; FG semak, pagar, tali pembatas, atau kelopak debu 2D blur dekat kamera.
- Satu subjek utama per frame, di tengah sepertiga atas–tengah. Figur non-subjek tidak terpotong di tepi frame pada shot close (keluarkan dari frustum).
- Satu prop hero per adegan sebagai jangkar: mobil (A, C1), pistol start + tribun (B1), pompa air (B2), botol + telur (D1), pita finis (D2), pohon apel (E1), koran (OUT).
- Tipografi: judul Rye, label/kartu Special Elite (mesin tik) ≥ 34 px @1080, kutipan/italic Playfair Display. Kartu HUD berbentuk tiket/label museum kertas krem berbingkai kuningan.

## Pelajaran juri yang wajib diterapkan
- Stamp/chip/caption tidak boleh menutupi subjek. Taruh di atas subjek atau di sisi kosong.
- Label ≥ 34 px; lebar stamp ≤ 860 px; tanpa rotasi stamp di adegan aksi.
- Maksimal 2 kartu HUD bersamaan (composition VINTAGEFORGE mentok di 3 bila kartu terlalu banyak).
- Set yang sama tidak muncul di lebih dari 2 frame contact sheet. Jalan desa cover hanya di A dan C1; stadion hanya di B1 dan C2.
- Tidak ada hook "legs-only" dan tidak ada diagram top-down berisi figur kecil.
- Debu 3D (sprite/plane transparan) rusak di pass AO: semua debu = overlay 2D di atas kanvas.

## Aturan konten
- Fred Lorz, Thomas Hicks, Charles Lucas, Félix Carvajal, Len Taunyane, William Garcia = figur `ToyPerson` stilasi tanpa wajah realistis + kartu nama. Tidak ada foto asli, logo IOC/cincin Olimpiade, logo AAU, atau logo koran nyata.
- Kata dan teks di layar mengikuti sikap naskah di `research/SOURCE_REGISTER.md`: tidak ada angka berat badan Hicks; "dipapah", bukan "digotong"; "tidur siang" tidak ditulis di layar; tidak ada jumlah negara; air resmi "1 TITIK · ±MIL 12"; waktu Hicks "3:28:53"; tumpangan Lorz tanpa angka mil.
- Strychnine ditampilkan sebagai botol obat bertuliskan "STRYCHNINE" (label kertas tua), bukan petunjuk dosis. Tidak ada adegan menyuntik.
- Teks di layar ejaan tunggal: "Fred Lorz", "Thomas Hicks", "Félix Carvajal".
- Pita karaoke y 1290–1540 bebas kartu/angka penting. Safe zone atas: judul mulai ≥ 236 px; 380 px bawah bersih.
- Brand: AUDIRA di papan iklan kayu di pagar stadion (B1, C2), di kepala koran fiktif "THE AUDIRA GAZETTE" (OUT); VO menyebut AUDIRA di hook dan outro; `AudiraSignature seed="olahraga-EP02"` lapisan terakhir lewat `signed()`; kartu outro AUDIRA 2–3 dtk terakhir.

## Gerak
- Kamera `core/camera/moves.ts` kontinu; tidak pernah diam > 1,5 dtk; shot pertama mulai tepat di `FRAMING_B` lalu truck mengikuti mobil.
- Debu sebagai "carrier": awan debu 2D dari ban mobil/kaki pelari menyapu layar searah gerak dan menjadi wipe ke adegan berikutnya.
- Figur berlari memakai `runPose(f, seed, tired)`; `tired` naik dari 0 ke 0,9 sepanjang film (kelelahan terlihat makin parah).
- Sebelum payoff (Hicks menyentuh pita finis) kamera melambat 0,8 dtk, lalu impact + flash kamera tua (magnesium).

## Multi-scene (7 set)
A Jalan desa berdebu, mobil + pelari melambai (= cover B) → B1 Stadion Francis Field, start 15.00, kerumunan pelari → B2 Sumur/pompa air tunggal di tengah rute → C1 Jalan desa sisi lain: Lorz naik mobil, tiang mil "9" → C2 Stadion: Lorz di pita finis, kilat kamera, stempel "DISKUALIFIKASI" → D1 Meja pelatih (close-up): telur, botol STRYCHNINE, brandy → D2 Jalan bukit + gerbang finis: Hicks dipapah pelatih, kartu "3:28:53" → E Kebun apel pinggir jalan: Carvajal makan apel; anjing mengejar pelari di ladang; papan "32 START · 14 FINIS" → OUT Kantor koran: koran "THE AUDIRA GAZETTE · LORZ JUARA BOSTON 1905" + teaser EP03 + kartu outro.
