# STORYBOARD — Detik-Detik Nabi Yusuf Memaafkan Saudara-Saudaranya (`EP20`)

Style: HD2D  <!-- G21 -->

> Waktu estimasi dari 208 kata @ ~145 WPM; dikunci ulang dari vo.wav di tahap 6 (Audio Master Clock). Kamera gerak kontinu, multi-plane BG / MG / FG / HUD / caption. 8 set berbeda, tidak ada set yang muncul di > 2 frame contact sheet.

**World layout:**
- **Main stage:** aula istana Mesir (origin): lantai batu kapur bertekstur, deret tiang papirus, singgasana di ujung, jendela atap. Set hook (c00) dan pengungkapan (c04, c05) memakai aula ini dari sudut berbeda (c00 dari belakang singgasana malam, c04 dari samping dengan berkas cahaya siang, c05 low-angle lantai).
- **Chapter stations:** gerbang kota tepi Nil (x −14), atap rumah Kanaan bawah langit bintang (x −28, terpisah oleh kabut), gudang gandum (z −10), kafilah gurun di jalan pembawa baju (x +12, c05 ekor), meja kitab lampu minyak (x +20), bukit fajar di atas kota (x +30).
- **Between stations:** dolly/crane kontinu; pindah stasiun lewat carrier (rombongan sprite berjalan, pembawa baju berlari) atau whip pendek tepat di potongan VO.
- **Station visibility:** stasiun jauh disembunyikan kabut + vignette; hanya stasiun aktif yang menyala.

**Planes in every shot:**
- **BG:** langit (malam biru #141B33 / siang pucat / fajar emas), siluet piramida dan pohon kurma jauh, kabut.
- **MG:** stasiun aktif (aula, gerbang, atap, gudang, meja kitab, bukit).
- **FG:** guci tanah liat, karung gandum, daun papirus, butir gandum melayang (bokeh tilt-shift); FG hangat diberi practical kecil (pelajaran HD2D: sepertiga bawah tidak boleh keruh).
- **HUD:** kartu ayat, angka, kartu sumber, teks kinetik "AKU YUSUF". Kartu atas ≤ 20% tinggi frame, min 64 px dari tepi, di bawah y 236.
- **Subtitles:** karaoke per kata pusat y 1300, kata aktif #FFB347.

| # | Time (est.) | Set | Aksi visual (mute-readable) | Gerak kamera | Audio |
|---|---|---|---|---|---|
| c00 Hook | 0:00–0:07 | aula istana malam (dari belakang singgasana) | Sosok berjubah duduk membelakangi kamera; sebelas sprite berdiri di ujung aula, bayangan panjang mereka mengarah ke singgasana; judul "IA MENGENAL MEREKA" lalu "TAPI IA DIAM". | dolly-in dari balik singgasana melewati bahu sosok ke barisan sebelas | drone rendah, impact di "membuangnya", sunyi 0,4 dtk sebelum "Tapi ia diam" |
| c01 Konteks | 0:07–0:16 | gerbang kota tepi Nil | Rombongan sebelas sprite + unta melewati gerbang bata lumpur, papan gerbang "AUDIRA"; kartu ayat "QS YUSUF 12:58 · MEREKA TIDAK MENGENALNYA". | crane turun dari menara gerbang, follow rombongan masuk | langkah unta, angin, pop kartu |
| c02 Mimpi | 0:16–0:24 | atap rumah Kanaan, malam | Sebelas bintang menyala satu per satu (penghitung "11 BINTANG"), matahari + bulan miring menunduk; dua sprite dari belakang, tangan ayah di bahu anak (kartu "YAQUB: JANGAN CERITAKAN"). | tilt dari langit turun ke atap, push-in ke dua punggung | denting per bintang (11 tick), angin malam |
| c03 Gudang | 0:24–0:35 | gudang gandum, obor | Karung ditimbang di timbangan kuningan; petugas membuka karung terkecil, piala raja berkilau keluar; sosok di balkon gudang mengepalkan tangan lalu melepasnya; HUD "QS 12:77 · DISEMBUNYIKAN DALAM HATI". | track samping sepanjang barisan karung, rack focus ke piala, tilt naik ke balkon | gesek karung, denting piala (impact kecil), riuh tertahan |
| c04 Pengungkapan | 0:35–0:49 | aula istana siang (sudut samping) | Berkas cahaya dari jendela atap jatuh ke sosok berjubah; sebelas sprite mundur selangkah; kartu pertanyaan 12:89; teks kinetik "AKU · YUSUF" per kata, HUD "QS 12:89–90". | slow orbit 40° dari sebelas ke sosok, hold 0,6 dtk sebelum "aku Yusuf" | riser panjang, impact utama di "aku Yusuf" |
| c05 Maaf | 0:49–1:01 | aula (low-angle lantai), lalu jalan kafilah | Sprite saudara bersimpuh, tangan terulur membantu berdiri; kartu ayat 12:92 "TIDAK ADA CERCAAN"; gamis terlipat berpindah tangan; pembawa berlari keluar ke jalan gurun menuju kafilah (carrier ke stasiun berikut). | low-angle lantai push-in, lalu follow pembawa berlari | kain bergeser, pop kartu, whoosh lari |
| c06 Menunggu | 1:01–1:15 | meja kitab, lampu minyak | Kitab tafsir terbuka, jam pasir berputar; dua kartu bercabang "QURAN: TIDAK MENYEBUT ALASAN" vs "IBNU KATSIR: ATAS PERINTAH ALLAH"; HUD "±40 TAHUN" + label "RIWAYAT TAFSIR, BUKAN HADIS SHAHIH". | top-down turun ke kitab lalu pan ke jam pasir | desir pasir, pop kartu, tick |
| c07 Payoff | 1:15–1:27 | bukit fajar di atas kota | Rombongan sprite berjalan bersama menuju matahari terbit; kartu sumber "SHAHIH BUKHARI 3374"; tiga kata "SABAR · TAKWA · MAAF" muncul berurutan. | crane naik mundur dari rombongan ke panorama fajar | impact payoff halus, angin fajar |
| Outro | 1:27–1:30 | — | `<AudiraOutro code="QISSAH" />` + "Created by Agus Dwi R." | — | soft impact |
