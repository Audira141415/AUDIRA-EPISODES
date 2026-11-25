# Generates rich factual STORYBOARD.md, SOCIAL_CAPTIONS.md, and syncs STATUS.json for EP31-EP40
import pathlib, json
from datetime import datetime

ROOT = pathlib.Path(__file__).resolve().parent.parent

storyboards = {
"EP31_TOTAL_FOOTBALL_BELANDA_1974": """# Storyboard — EP31 Revolusi Total Football Belanda 1974 (TACTICBOARD)

Format 9:16 1080×1920 @ 60. Safe zone: atas 180 px, bawah 380 px. Kamera bergerak fluida di atas diagram taktik digital dinamis (no slideshow), multi-plane (BG lapangan rumput Clockwork Orange / midground formasi cair Cruyff 14 / foreground garis vektor ruang & kapur / HUD / subtitle karaoke).

| Beat | Dtk | VO (ringkas) | Visual | Kamera | HUD / Teks |
|---|---|---|---|---|---|
| Hook | 0–3 | "11 pemain tanpa posisi tetap mengalir seperti air... Ini AUDIRA." | Papan taktik digital menyala oranye; 11 titik formasi saling bertukar posisi secara cair melingkari bola emas di tengah. | Dolly-in cepat ke pusat pusaran formasi oranye. | Kartu kecil "SEJARAH SEPAK BOLA #31". Teks "TOTAL FOOTBALL 1974". |
| Context | 4–17 | Juni 1974 Piala Dunia Jerman Barat; Belanda bawa gaya baru ke dunia. | Peta Jerman Barat 1974; bendera Belanda oranye berkibar; kemunculan kembali Singa Oranye setelah puluhan tahun tenggelam. | Kran meluncur dari peta Jerman ke lapangan Frankfurt. | Linimasa tipis "Juni 1974" (HUD hijau); label "Oranje: The Clockwork Orange". |
| Main | 18–45 | Rinus Michels & Johan Cruyff; revolusi ruang & waktu; bantai Argentina & Brasil. | Bidak maestro "CRUYFF 14" menarik garis vertikal; bek sayap menusuk ke depan sementara penyerang otomatis turun menutup ruang; skor Argentina 4–0 dan Brasil 2–0 menyala. | Kamera miring mengitari pergerakan dinamis pertukaran peran. | "Rinus Michels · Johan Cruyff" · "Belanda 4–0 Argentina · 2–0 Brasil". |
| Explanation | 46–70 | Stamina monster & teknik sempurna; takluk 1–2 dari Jerman Barat di final. | Lapangan final Munich: Johan Neeskens penalti menit ke-2; perlawanan sengit Jerman Barat membalikkan 1–2; diagram fluida tetap berputar indah. | Tracking melayang di atas garis pertukaran posisi pemain. | "Final Munich 1974: Jerman 2–1 Belanda" · "Juara Tanpa Mahkota". |
| Visual Payoff | 65–81 | Warisan taktik paling berpengaruh yang mengubah cetak biru dunia. | Pohon silsilah taktik sepak bola dunia bercabang dari akar Total Football 1974 menuju Barcelona, Spanyol 2010, dan sepak bola modern hari ini. | Orbit kamera 360 derajat mengitari pohon taktik bercahaya emas. | "Cetak Biru Sepak Bola Modern" + "Warisan Abadi Cruyff". Brand AUDIRA. |
| Outro | 82–91 | "Ini AUDIRA... Berikutnya: perdebatan gol hantu Wembley yang tak pernah usai." | Garis vektor oranye meredup tenang; kartu outro AUDIRA; teaser garis gawang Wembley. | Pull-back presisi ke kartu outro. | `<AudiraOutro code="SPORTFACTS">` + teaser EP32 Gol Hantu Wembley. |

## Catatan produksi
- Estetika TACTICBOARD oranye menyala (#FF4F00) dengan latar belakang grid hijau zamrud (#0D3B2E) dan garis lintasan vektor putih.
""",

"EP32_GOL_HANTU_WEMBLEY_1966": """# Storyboard — EP32 Kontroversi Gol Hantu Wembley 1966 (VISUALINVESTIGATION)

Format 9:16 1080×1920 @ 60. Safe zone: atas 180 px, bawah 380 px. Kamera investigasi forensik garis gawang 3D (no slideshow), multi-plane (BG mistar gawang Wembley 1966 hitam-putih / midground pantulan bola & Bahramov / foreground garis laser optik / HUD / subtitle karaoke).

| Beat | Dtk | VO (ringkas) | Visual | Kamera | HUD / Teks |
|---|---|---|---|---|---|
| Hook | 0–3 | "Bola membentur mistar, memantul ke garis putih... gol hantu terbesar. Ini AUDIRA." | Lensa kamera ultra-slow motion menyorot bola kulit cokelat membentur bagian bawah mistar gawang Wembley dan memantul ke rumput berdebu putih. | Dolly-in makro ke titik benturan bola di garis gawang. | Kartu kecil "SEJARAH SEPAK BOLA #32". Teks "GOL HANTU WEMBLEY". |
| Context | 4–17 | 30 Juli 1966 final Piala Dunia Wembley; Inggris vs Jerman Barat 2–2. | Stadion Wembley dipadati 98.000 penonton; papan skor analog terhenti di 2–2 pada menit ke-90; babak perpanjangan waktu yang menegangkan. | Kran turun dari menara kembar Wembley ke area kotak penalti. | Linimasa tipis "30 Juli 1966" (HUD hijau); label "Wembley Stadium, London". |
| Main | 18–45 | Menit 101: Geoff Hurst tembakan keras; pantulan garis; wasit Dienst & hakim garis Bahramov. | Menit 101: Geoff Hurst berputar menembak keras; bola membentur mistar dan memantul tegak lurus; wasit Swiss Dienst berlari ke hakim garis Soviet Tofiq Bahramov; anggukan kepala kontroversial. | Kamera freeze-frame tepat di saat bola menyentuh tanah, lalu swing ke Bahramov. | "Geoff Hurst 101'" · "Gottfried Dienst & Tofiq Bahramov". |
| Explanation | 46–70 | Hurst lengkapi hat-trick 4–2 Inggris juara; perdebatan sains membuktikan belum lewat garis. | Hurst menambah gol di menit 120 (hat-trick pertama di final); Ratu Elizabeth menyerahkan trofi; simulasi komputer Oxford dan Sky Sports membuktikan bola belum 100% melewati garis. | Tracking digital 3D menelusuri sudut trajektori bola dan garis gawang. | "Inggris 4–2 Jerman Barat" · "Analisis Sains: Belum Lewat Garis (97%)". |
| Visual Payoff | 65–81 | Misteri abadi yang melahirkan teknologi Goal-Line dan VAR di era modern. | Garis gawang Wembley kuno berevolusi menjadi sensor optik Goal-Line Technology berkedip hijau dan monitor VAR modern. | Orbit kamera 360 derajat mengitari transformasi tiang gawang klasik ke sensor modern. | "Pemicu Lahirnya VAR" + "Misteri Terbesar Piala Dunia". Brand AUDIRA. |
| Outro | 82–91 | "Ini AUDIRA... Berikutnya: mukjizat Deportivo La Coruña 2004." | Sinar sensor garis gawang meredup; kartu outro AUDIRA; teaser stadion Riazor. | Pull-back tajam ke kartu outro. | `<AudiraOutro code="SPORTFACTS">` + teaser EP33 Mukjizat Deportivo. |

## Catatan produksi
- Estetika VISUALINVESTIGATION forensik berpalet monokrom arsip dengan aksen laser hijau optik (#00FF66) dan garis putih kapur.
""",

"EP33_MUKJIZAT_DEPORTIVO_CORUNA_2004": """# Storyboard — EP33 Mukjizat Deportivo La Coruña 2004 (COMICFORGE)

Format 9:16 1080×1920 @ 60. Safe zone: atas 180 px, bawah 380 px. Kamera dinamis panel komik pop-out berkecepatan tinggi, multi-plane (BG stadion Riazor bergelombang biru-putih / midground Pandiani, Valerón, Luque / foreground sambaran petir keajaiban / HUD / subtitle karaoke).

| Beat | Dtk | VO (ringkas) | Visual | Kamera | HUD / Teks |
|---|---|---|---|---|---|
| Hook | 0–3 | "Dihajar 4–1 di San Siro, lalu membalas 4–0 di kandang... Ini AUDIRA." | Papan skor San Siro "MILAN 4–1 DEPOR" hancur retak; palu godam berlogo Super Depor menghantam dan membalikkan skor jadi 4–0 di Riazor. | Dolly-in cepat mengikuti hantaman palu godam. | Kartu kecil "SEJARAH SEPAK BOLA #33". Teks "MUKJIZAT RIAZOR". |
| Context | 4–17 | April 2004 perempat final Liga Champions; AC Milan juara bertahan terkuat. | AC Milan asuhan Carlo Ancelotti dengan bintang-bintang Galactico Italia (Maldini, Nesta, Kaka, Shevchenko) tampak mustahil untuk dikalahkan. | Kran turun dari deretan trofi Milan menuju stadion pantai Riazor. | Linimasa tipis "April 2004" (HUD hijau); label "AC Milan: Juara Bertahan Eropa". |
| Main | 18–45 | Javier Irureta & Super Depor; babak pertama magis: Pandiani, Valeron, Luque 3–0! | Tiga gol kilat di babak pertama: menit 5 sontekan Walter Pandiani, menit 35 sundulan Juan Carlos Valeron, menit 44 lesatan Albert Luque memanfaatkan blunder Nesta; Riazor meledak histeria! | Rangkaian 3 panel aksi komik pop-out cepat pada setiap gol. | "Pandiani 5'" → "Valeron 35'" → "Luque 44'" (Agregat 4–4!). |
| Explanation | 46–70 | Menit 76 sang kapten Fran kunci 4–0; singkirkan raksasa terkuat Eropa. | Menit 76: sang kapten veteran Fran melepaskan tembakan defleksi membobol gawang Dida; papan skor Riazor mengunci 4–0 (agregat 5–4); Milan tertunduk lesu. | Tracking menyusuri selebrasi gila suporter Galicia. | "Fran 76' (Skor 4–0)" · "Agregat Total 5–4!". |
| Visual Payoff | 65–81 | Bukti nyata bahwa nama besar dan kekayaan bintang tak mampu jamin kelolosan. | Gelombang laut Atlantik di tepi pantai Riazor membumbung tinggi membawa perahu Super Depor menenggelamkan armada mewah Milan. | Orbit kamera 360 derajat mengitari monumen perahu nelayan Super Depor. | "Super Dépor Menolak Menyerah" + "Kembalikan Kemustahilan". Brand AUDIRA. |
| Outro | 82–91 | "Ini AUDIRA... Berikutnya: drama gol Sergio Aguero 93:20 Man City." | Ombak Riazor meredup tenang; kartu outro AUDIRA; teaser jam digital 93:20. | Pull-back dinamis ke kartu outro. | `<AudiraOutro code="SPORTFACTS">` + teaser EP34 Drama Aguero 93:20. |

## Catatan produksi
- Estetika COMICFORGE bertenaga dengan palet biru laut (#0055A5) dan putih gading, disertai aksen ledakan pop-art.
""",

"EP34_DRAMA_AGUERO_9320_MAN_CITY": """# Storyboard — EP34 Drama Gol Sergio Agüero 93:20 (TIMEFORGE)

Format 9:16 1080×1920 @ 60. Safe zone: atas 180 px, bawah 380 px. Kamera bergerak dramatis menghitung detik linimasa Etihad Stadium, multi-plane (BG tribun Etihad Stadium biru langit / midground jam stopwatch 93:20 & Aguero lepas jersey / foreground serpihan air mata & konfeti / HUD / subtitle karaoke).

| Beat | Dtk | VO (ringkas) | Visual | Kamera | HUD / Teks |
|---|---|---|---|---|---|
| Hook | 0–3 | "Tertinggal hingga menit 91, lalu dua gol membalikkan 44 tahun penantian... Ini AUDIRA." | Jam stopwatch digital raksasa berdetik dari 91:00 menuju 93:20; papan skor tertera Man City 1–2 QPR dengan suporter tertunduk menangis. | Dolly-in dramatis menatap jarum stopwatch digital. | Kartu kecil "SEJARAH SEPAK BOLA #34". Teks "93:20 MAN CITY". |
| Context | 4–17 | 13 Mei 2012 laga penutup Premier League; rival sekota Man United sudah menang. | 13 Mei 2012 di Etihad: Manchester United sudah menuntaskan laga di Sunderland dan siap berpesta merayakan gelar ke-20; City butuh kemenangan mutlak. | Kran meluncur dari Sunderland ke Stadion Etihad yang dicekam kepanikan. | Linimasa tipis "13 Mei 2012" (HUD hijau); label "44 Tahun Kemarau Gelar". |
| Main | 18–45 | Menit 91:14 sundulan Dzeko nyalakan asa; detik-detik paling menegangkan. | Menit 91:14: sundulan tandukan Edin Dzeko dari sepak pojok Silva menyamakan 2–2; Roberto Mancini berteriak memajukan seluruh pemain ke depan. | Tracking cepat dari kepala Dzeko menuju jam yang menunjuk 92:30. | "Edin Dzeko 91:14 (2–2)" · "Butuh 1 Gol Lagi!". |
| Explanation | 46–70 | 93:20 Balotelli sodorkan bola, Sergio Aguero jebol gawang; Martin Tyler histeris. | Menit 93:20: Mario Balotelli terjatuh sambil menyodorkan bola; Sergio Aguero melepaskan tembakan gledek kaki kanan; jaring robek; jersey nomor 16 diputar di udara! | Push-in hiper-dinamis mengikuti ayunan tembakan Aguero lalu zoom ke selebrasi histeris. | "93:20 · SERGIO AGÜERO!" · "AGUEROOOOOOO!". |
| Visual Payoff | 65–81 | Mengunci gelar Premier League pertama dalam 44 tahun; gol terhebat sejarah liga. | Trofi Premier League dengan pita biru langit berkibar di bawah hujan konfeti; patung selebrasi Aguero mengayunkan jersey terpahat di luar stadion. | Orbit kamera 360 derajat mengitari patung emas Aguero dan trofi liga. | "Premier League Champions 2012" + "Momen Paling Dramatis Liga". Brand AUDIRA. |
| Outro | 82–91 | "Ini AUDIRA... Berikutnya: Inter Milan dinasti Grande Inter dan Treble 2010." | Konfeti biru langit melayang turun; kartu outro AUDIRA; teaser piala Treble Inter. | Pull-back tenang ke kartu outro. | `<AudiraOutro code="SPORTFACTS">` + teaser EP35 Inter Milan Treble 2010. |

## Catatan produksi
- Estetika TIMEFORGE dengan pencahayaan biru langit (#6CABDD) dan emas kejuaraan, didukung penghitung waktu mundur digital tegang.
""",

"EP35_INTER_MILAN_GRANDE_INTER_TREBLE_2010": """# Storyboard — EP35 Inter Milan Grande Inter & Treble 2010 (MARBLEMUSEUM)

Format 9:16 1080×1920 @ 60. Safe zone: atas 180 px, bawah 380 px. Kamera marmer agung museum trofi bersejarah (no slideshow), multi-plane (BG pilar marmer San Siro bernuansa hitam-biru / midground 3 trofi Treble & Milito brace / foreground partikel debu emas & pita Nerazzurri / HUD / subtitle karaoke).

| Beat | Dtk | VO (ringkas) | Visual | Kamera | HUD / Teks |
|---|---|---|---|---|---|
| Hook | 0–3 | "Satu-satunya klub Italia peraih Treble Winners bersejarah... Ini AUDIRA." | Aula marmer gelap San Siro; tiga trofi raksasa (Scudetto, Coppa Italia, Liga Champions) berdiri berdampingan bermandikan cahaya biru-hitam. | Dolly-in lambat menyusuri deretan 3 trofi ke pedestal tengah. | Kartu kecil "SEJARAH SEPAK BOLA #35". Teks "TREBLE WINNERS 2010". |
| Context | 4–17 | Warisan Grande Inter Helenio Herrera 1960-an; Catenaccio dan dua gelar Eropa. | Plakat marmer 1964 & 1965 mengenang era Helenio Herrera, Angelo Moratti, dan benteng pertahanan grendel Catenaccio yang merajai benua. | Kran naik dari plakat 1960-an ke langit-langit kubah museum. | Linimasa tipis "Era 1960-an" (HUD hijau); label "La Grande Inter". |
| Main | 18–45 | Jose Mourinho 2008–2010; benteng kokoh di Camp Nou singkirkan Barcelona. | Figur siluet mantel hitam José Mourinho; benteng pertahanan heroik 10 pemain di Camp Nou menahan badai serangan Barca; mental baja kapten Javier Zanetti. | Kamera miring menatap tembok pertahanan Nerazzurri yang tak tergoyahkan. | "José Mourinho (The Special One)" · "Semifinal Heroik Camp Nou". |
| Explanation | 46–70 | 22 Mei 2010 Bernabeu: Diego Milito dua gol bantai Bayern 2–0; Treble abadi! | Final Madrid 22 Mei 2010: dua kecohan maut 'Il Principe' Diego Milito membobol gawang Bayern Munich; Javier Zanetti mengangkat trofi di laga ke-700-nya. | Push-in tajam ke sontekan kedua Milito lalu kran naik ke trofi di tangan Zanetti. | "Bernabéu 2010: Inter 2–0 Bayern" · "Diego Milito (Brace)". |
| Visual Payoff | 65–81 | Satu-satunya tim Italia pemborong 3 gelar agung dalam satu musim sempurna. | Tiga trofi marmer emas berputar megah diiringi himne 'Pazza Inter Amala'; lencana Nerazzurri terukir emas di altar pahlawan. | Orbit kamera 360 derajat mengitari ketiga trofi Treble. | "Il Treble Unico d'Italia" + "Scudetto · Coppa · UCL". Brand AUDIRA. |
| Outro | 82–91 | "Ini AUDIRA... Berikutnya: Borussia Dortmund tembok kuning dan gegenpressing." | Cahaya biru-hitam meredup syahdu; kartu outro AUDIRA; teaser tembok kuning Dortmund. | Pull-back agung ke kartu outro. | `<AudiraOutro code="SPORTFACTS">` + teaser EP36 Borussia Dortmund. |

## Catatan produksi
- Estetika MARBLEMUSEUM aristokratik dengan marmer hitam-biru Nerazzurri (#001E62 / #000000) dan pantulan emas pada trofi Liga Champions.
""",

"EP36_BORUSSIA_DORTMUND_TEMBOK_KUNING_GEGENPRESSING": """# Storyboard — EP36 Borussia Dortmund Tembok Kuning & Gegenpressing (PRECISION)

Format 9:16 1080×1920 @ 60. Safe zone: atas 180 px, bawah 380 px. Kamera aksi kinetik grid presisi berenergi tinggi (no slideshow), multi-plane (BG Südtribüne 25.000 fans berdiri / midground Jürgen Klopp & badai Gegenpressing / foreground partikel asap kuning & garis pressing / HUD / subtitle karaoke).

| Beat | Dtk | VO (ringkas) | Visual | Kamera | HUD / Teks |
|---|---|---|---|---|---|
| Hook | 0–3 | "Tembok manusia terbesar di dunia sepak bola dan badai Gegenpressing... Ini AUDIRA." | Tribun berdiri raksasa Südtribüne 3D berwarna kuning hitam berguncang oleh 25.000 suporter; bendera raksasa berkibar diiringi nyanyian gemuruh. | Dolly-in cepat menembus kabut asap kuning ke arah tribun berdiri. | Kartu kecil "SEJARAH SEPAK BOLA #36". Teks "DIE GELBE WAND". |
| Context | 4–17 | Westfalenstadion Signal Iduna Park; Südtribüne kubah suporter paling fanatik. | Arsitektur stadion Signal Iduna Park dengan pilar baja kuning raksasa; tribun terjal tanpa kursi tempat lahirnya energi tanpa henti sepak bola Jerman. | Kran menyapu dari atap stadion turun ke rumput hijau. | Linimasa tipis "Dortmund, Jerman" (HUD hijau); label "25.000 Fans Berdiri". |
| Main | 18–45 | Jürgen Klopp tiba 2008; revolusi Gegenpressing: rebut bola dalam 5 detik! | Siluet Jürgen Klopp mengepalkan tangan di pinggir lapangan; diagram taktik: formasi kuning mengepung lawan serempak saat bola hilang (rebut dalam 5 detik!). | Kamera berputar cepat di atas diagram perburuan bola Gegenpressing. | "Jürgen Klopp: Heavy Metal Football" · "Gegenpressing (Aturan 5 Detik)". |
| Explanation | 46–70 | Gulingkan hegemoni Bayern Munich; juara Bundesliga beruntun 2011 & 2012. | Skuad muda penuh gairah (Lewandowski, Götze, Reus, Hummels) membantai lawan-lawan elit; pesta juara Bundesliga 2011 dan dobel gelar 2012. | Tracking menyusuri parade perayaan trofi piringan Meisterschale. | "Juara Bundesliga 2011 & 2012" · "Dobel Gelar Domestik 2012". |
| Visual Payoff | 65–81 | Heavy metal football yang menjadi inspirasi taktik sepak bola modern dunia. | Gelombang manusia kuning hitam menyatu dengan nada musik 'Heavy Metal'; piringan gelar juara berkilau di tengah lautan syal suporter. | Orbit 360 derajat mengitari tribun kuning yang menyala abadi. | "Echte Liebe (Cinta Sejati)" + "Revolusi Taktik Dunia". Brand AUDIRA. |
| Outro | 82–91 | "Ini AUDIRA... Berikutnya: Chelsea dan revolusi modal Roman Abramovich." | Asap kuning perlahan pudar; kartu outro AUDIRA; teaser Stamford Bridge & Abramovich. | Pull-back bertenaga ke kartu outro. | `<AudiraOutro code="SPORTFACTS">` + teaser EP37 Chelsea 2003. |

## Catatan produksi
- Estetika PRECISION dinamis dengan kontras kuning cerah (#FDE100) dan hitam arang (#000000) dengan visualisasi panah pressing kilat.
""",

"EP37_CHELSEA_REVOLUSI_ABRAMOVICH_2003": """# Storyboard — EP37 Chelsea & Revolusi Modal Roman Abramovich 2003 (FILMNOIR)

Format 9:16 1080×1920 @ 60. Safe zone: atas 180 px, bawah 380 px. Kamera noir korporasi glamor london malam (no slideshow), multi-plane (BG cakrawala kota London malam hari / midground helikopter Abramovich & trofi / foreground koin modal emas & hujan London / HUD / subtitle karaoke).

| Beat | Dtk | VO (ringkas) | Visual | Kamera | HUD / Teks |
|---|---|---|---|---|---|
| Hook | 0–3 | "Kedatangan miliarder Rusia yang mengubah peta kekuatan sepak bola selamanya... Ini AUDIRA." | Helikopter mewah melayang di atas langit malam kota London; stadion Stamford Bridge menyala biru di bawah guyuran hujan gerimis. | Dolly-in dramatis dari kabut malam London menuju stadion. | Kartu kecil "SEJARAH SEPAK BOLA #37". Teks "REVOLUSI CHELSEA 2003". |
| Context | 4–17 | Juni 2003 Roman Abramovich beli Chelsea; 50 tahun kemarau gelar liga. | Berkas kontrak akuisisi Juni 2003; suntikan modal tak terbatas merombak klub London barat yang telah 50 tahun puasa gelar liga kasta tertinggi. | Kran meluncur dari berkas kontrak menuju ruang ganti Stamford Bridge. | Linimasa tipis "Musim Panas 2003" (HUD hijau); label "Era Baru Kepemilikan Klub". |
| Main | 18–45 | Jose Mourinho 2004 'The Special One'; tulang punggung Terry, Lampard, Drogba. | José Mourinho melangkah di Stamford Bridge dalam konferensi pers ikonik "The Special One"; trio legendaris John Terry, Frank Lampard, dan Didier Drogba berbaris kokoh. | Kamera miring menatap deretan pilar tulang punggung tim. | "José Mourinho: The Special One" · "Terry · Lampard · Drogba · Cech". |
| Explanation | 46–70 | Juara Liga Inggris rekor 95 poin (kebobolan cuma 15 gol); puncaknya Munich 2012. | Musim 2004/05: rekor pertahanan terkuat dunia (hanya kebobolan 15 gol sepanjang musim); puncaknya final Munich 2012: sundulan & penalti Drogba mengunci gelar Eropa pertama! | Tracking menyusuri gawang Petr Cech lalu push-in ke penalti Drogba di Allianz Arena. | "Rekor 15 Kebobolan (95 Poin)" → "Munich 2012: Juara Liga Champions". |
| Visual Payoff | 65–81 | Transformasi klub papan tengah menjadi penguasa global 2 dekade. | Trofi Premier League dan Liga Champions bersanding di etalase modern Stamford Bridge; cetak biru bagaimana modal cerdas melahirkan dinasti juara. | Orbit 360 derajat mengitari etalase trofi biru London. | "5 Gelar Premier League & 2 UCL" + "Blueprint Sepak Bola Modern". Brand AUDIRA. |
| Outro | 82–91 | "Ini AUDIRA... Berikutnya: Napoli penebusan kaum selatan dan era Maradona." | Lampu sorot Stamford Bridge meredup; kartu outro AUDIRA; teaser San Paolo & Maradona. | Pull-back elegan ke kartu outro. | `<AudiraOutro code="SPORTFACTS">` + teaser EP38 Napoli & Maradona. |

## Catatan produksi
- Estetika FILMNOIR modern bernuansa biru safir gelap (#034694), abu-abu aspal, dan pendar lampu kota metropolitan London.
""",

"EP38_NAPOLI_PENEBUSAN_SELATAN_MARADONA": """# Storyboard — EP38 SSC Napoli & Penebusan Kaum Selatan Maradona (SKETCHFORGE)

Format 9:16 1080×1920 @ 60. Safe zone: atas 180 px, bawah 380 px. Kamera sketsa arang & cat air emosional jalanan Napoli (no slideshow), multi-plane (BG gang sempit Spaccanapoli & Gunung Vesuvius / midground Maradona nomor 10 biru langit / foreground mural jalanan & suar biru / HUD / subtitle karaoke).

| Beat | Dtk | VO (ringkas) | Visual | Kamera | HUD / Teks |
|---|---|---|---|---|---|
| Hook | 0–3 | "Bukan sekadar sepak bola, ini adalah martabat dan penebusan air mata kaum Selatan... Ini AUDIRA." | Mural raksasa Diego Maradona di dinding gang sempit kota Naples; asap flare biru langit membubung tinggi di depan Gunung Vesuvius yang kokoh. | Dolly-in perlahan menembus asap biru menuju mata mural Maradona. | Kartu kecil "SEJARAH SEPAK BOLA #38". Teks "PENEBUSAN NAPOLI". |
| Context | 4–17 | 5 Juli 1984: 75.000 warga penuhi San Paolo sambut kedatangan sang dewa sepak bola. | 5 Juli 1984: stadion San Paolo bergemuruh menyambut pemuda berambut ikal keluar dari terowongan; kota termiskin Italia menaruh seluruh harapan padanya. | Kran turun dari puncak stadion ke titik lingkar tengah lapangan. | Linimasa tipis "5 Juli 1984" (HUD hijau); label "Stadio San Paolo, Naples". |
| Main | 18–45 | Melawan diskriminasi klub kaya Utara (Juventus, Milan); Maradona pimpin perlawanan. | Spanduk ejekan rasis klub Utara dirobek; Maradona dengan nomor punggung 10 biru langit menari melewati tekel-tekel brutal; rakyat tertindas bangkit bersorak. | Kamera bergerak lincah mengikuti gocekan magis nomor 10. | "Perlawanan Terhadap Hegemoni Utara" · "Simbol Martabat Kaum Selatan". |
| Explanation | 46–70 | 10 Mei 1987 Scudetto pertama dalam 61 tahun; pesta berhari-hari & Scudetto 1990. | 10 Mei 1987: peluit akhir berbunyi; seluruh kota Naples menangis haru merayakan Scudetto pertama dalam sejarah klub; disusul Piala UEFA 1989 dan Scudetto kedua 1990. | Tracking melayang di atas lautan bendera biru langit di jalanan Naples. | "Scudetto Pertama: 10 Mei 1987" · "Piala UEFA 1989 & Scudetto 1990". |
| Visual Payoff | 65–81 | Maradona diabadikan selamanya sebagai dewa pelindung kota Naples. | Nama stadion resmi diubah menjadi Stadio Diego Armando Maradona; lilin dan altar doa di sudut gang Naples menyala abadi dalam cinta abadi. | Orbit 360 derajat mengitari patung perunggu Maradona bermandikan cahaya biru langit. | "Dewa Abadi Naples" + "Cinta yang Tak Pernah Mati". Brand AUDIRA. |
| Outro | 82–91 | "Ini AUDIRA... Berikutnya: Benfica era Eusebio dan kutukan Bela Guttmann." | Suar biru meredup damai; kartu outro AUDIRA; teaser elang merah Benfica. | Pull-back emosional ke kartu outro. | `<AudiraOutro code="SPORTFACTS">` + teaser EP39 Benfica & Guttmann. |

## Catatan produksi
- Estetika SKETCHFORGE cat air ekspresif dengan dominasi warna biru langit cerah Napoli (#12A0DE), putih kapur, dan abu-abu vulkanik Vesuvius.
""",

"EP39_BENFICA_EUSEBIO_KUTUKAN_BELA_GUTTMANN": """# Storyboard — EP39 SL Benfica Era Eusébio & Kutukan Béla Guttmann (PAPERWORLD)

Format 9:16 1080×1920 @ 60. Safe zone: atas 180 px, bawah 380 px. Kamera lipatan kertas kuno bergaya manuskrip dongeng kelam (no slideshow), multi-plane (BG stadion Estádio da Luz bertabur kertas merah / midground Eusébio sang Pantera Hitam & Béla Guttmann / foreground kutukan 100 tahun / HUD / subtitle karaoke).

| Beat | Dtk | VO (ringkas) | Visual | Kamera | HUD / Teks |
|---|---|---|---|---|---|
| Hook | 0–3 | "'Dalam 100 tahun ke depan, Benfica tidak akan pernah juara Eropa!'... kutukan Béla Guttmann. Ini AUDIRA." | Gulungan perkamen kertas kuno terbakar di tepi; kutukan bertinta hitam muncul diiringi petir menyambar dua trofi Piala Champions Eropa. | Dolly-in dramatis menembus gulungan perkamen yang terbakar. | Kartu kecil "SEJARAH SEPAK BOLA #39". Teks "KUTUKAN BÉLA GUTTMANN". |
| Context | 4–17 | Awal 1960-an; pelatih jenius Béla Guttmann pimpin Benfica patahkan dominasi Madrid. | Peta benua Eropa 1961; bendera merah elang Benfica berkibar di atas Lisbon; menumbangkan Barcelona (3–2) dan Real Madrid (5–3) untuk menjuarai Eropa beruntun. | Kran meluncur dari peta Eropa ke lapangan final Amsterdam 1962. | Linimasa tipis "1961 & 1962" (HUD hijau); label "Juara Eropa Dua Kali Beruntun". |
| Main | 18–45 | Sang Pantera Hitam Eusébio; minta kenaikan gaji ditolak; sumpah kutukan 1962 terucap. | Bidak kertas pahlawan Eusébio mencetak gol-gol spektakuler; Béla Guttmann meminta bonus kenaikan gaji yang ditolak direksi klub; Guttmann melangkah pergi sambil mengucap kutukan 100 tahun. | Kamera miring menatap sosok Guttmann yang melangkah keluar stadion dalam bayang-bayang. | "Eusébio (Sang Pantera Hitam)" · "Kutukan Terucap: Mei 1962". |
| Explanation | 46–70 | 8 final kompetisi Eropa berturut-turut selalu kalah; ziarah makam Eusébio tak berdaya. | Rangkaian 8 bendera final Eropa (1963, 1965, 1968, 1983, 1988, 1990, 2013, 2014) semuanya jatuh terkoyak kalah; ziarah Eusébio ke makam Guttmann di Wina tetap gagal memecah kutukan. | Tracking muram menyusuri 8 plakat kekalahan final Eropa yang beruntun. | "8 Final Eropa Berturut-turut: Kalah Semua!" (Kutukan Masih Berjalan). |
| Visual Payoff | 65–81 | Misteri mistis terbesar yang menyelimuti sejarah klub raksasa Portugal. | Patung perunggu elang Benfica di luar Estádio da Luz menatap nanar dua trofi Eropa kuno yang tersimpan di balik kaca pelindung museum. | Orbit 360 derajat mengitari patung elang Benfica bertengger di atas bola. | "Kutukan 100 Tahun (1962–2062)" + "Misteri Terbesar Eropa". Brand AUDIRA. |
| Outro | 82–91 | "Ini AUDIRA... Berikutnya: River Plate mesin serang La Máquina dan Millonarios." | Perkamen kertas kutukan menutup; kartu outro AUDIRA; teaser diagonal merah River Plate. | Pull-back tenang ke kartu outro. | `<AudiraOutro code="SPORTFACTS">` + teaser EP40 River Plate. |

## Catatan produksi
- Estetika PAPERWORLD teatrikal bernuansa merah kirmizi Benfica (#E30613), putih perkamen tua, dan aksen hitam mistis arang.
""",

"EP40_RIVER_PLATE_LA_MAQUINA_MILLONARIOS": """# Storyboard — EP40 River Plate Mesin Serang La Máquina & Era Millonarios (HISTORYMAP)

Format 9:16 1080×1920 @ 60. Safe zone: atas 180 px, bawah 380 px. Kamera topografi peta sejarah sepak bola Amerika Selatan 3D (no slideshow), multi-plane (BG stadion megah El Monumental Buenos Aires / midground 5 roda gigi penyerang La Máquina & Di Stéfano / foreground garis pita diagonal merah / HUD / subtitle karaoke).

| Beat | Dtk | VO (ringkas) | Visual | Kamera | HUD / Teks |
|---|---|---|---|---|---|
| Hook | 0–3 | "Mesin serang paling sempurna di Amerika Selatan yang melahirkan sang legenda Alfredo Di Stéfano... Ini AUDIRA." | Lima roda gigi mesin logam berkilau berputar harmonis dengan pita selempang merah ikonik River Plate membentang melintang. | Dolly-in bertenaga ke pusat perputaran roda gigi mesin. | Kartu kecil "SEJARAH SEPAK BOLA #40". Teks "LA MÁQUINA RIVER PLATE". |
| Context | 4–17 | 1901 di dermaga La Boca lalu pindah ke Nuñez; julukan Los Millonarios & El Monumental. | Garis lintang kota Buenos Aires dari dermaga pelabuhan menuju distrik elit Nuñez; pembangunan stadion raksasa Estadio Monumental Antonio Vespucio Liberti. | Kran naik menyapu dari peta kota Nuñez menuju tribun El Monumental. | Linimasa tipis "Era 1940-an" (HUD hijau); label "Estadio Monumental, Buenos Aires". |
| Main | 18–45 | Lima serangkai legendaris: Muñoz, Moreno, Pedernera, Labruna, Loustau; presisi mekanik. | Lima siluet penyerang berbaris sempurna: Muñoz, Moreno, Pedernera, Labruna, Loustau; bola dialirkan dengan kecepatan dan presisi mekanik yang melumpuhkan lawan. | Kamera berputar mengitari aliran bola antarlima penyerang legendaris. | "Muñoz · Moreno · Pedernera · Labruna · Loustau" · "Presisi Mesin Jam". |
| Explanation | 46–70 | Lahirnya 'Saeta Rubia' Alfredo Di Stéfano; 38 gelar liga penguasa domestik Argentina. | Dari kawah akademi La Máquina, muncul pemuda berambut pirang lincah Alfredo Di Stéfano sebelum memikat Real Madrid; deretan 38 piala liga domestik berjejer rapi. | Tracking melayang di atas deretan 38 trofi kejuaraan nasional Argentina. | "Alfredo Di Stéfano (Saeta Rubia)" · "38 Gelar Liga Argentina (Rekor Terbanyak)". |
| Visual Payoff | 65–81 | Standar tertinggi seni menyerang yang menginspirasi Total Football dan generasi emas. | Selempang merah (*La Banda*) River Plate melilit bola emas dunia; El Monumental bermandikan cahaya kembang api menyanyikan keagungan Millonarios. | Orbit 360 derajat mengitari stadion El Monumental dan lambang selempang merah. | "El Más Grande" + "Monumen Sepak Bola Amerika Selatan". Brand AUDIRA. |
| Outro | 82–91 | "Ini AUDIRA, Sejarah Sepak Bola. Simak terus fakta legendaris di AUDIRA." | Pita merah selempang melipat rapi; kartu outro penutup episode #40 AUDIRA. | Pull-back megah ke kartu outro serial. | `<AudiraOutro code="SPORTFACTS">` + Penutup Resmi Episode 40. |

## Catatan produksi
- Estetika HISTORYMAP dinamis dengan palet putih bersih, selempang merah menyala (#EB192E), dan arsip kartografi emas Buenos Aires.
"""
}

# --- SOCIAL CAPTIONS ---
social_captions = {
"EP31_TOTAL_FOOTBALL_BELANDA_1974": """# SOCIAL CAPTIONS: Revolusi Total Football Belanda 1974

Seri AUDIRA · SEJARAH SEPAK BOLA EP31, channel AUDIRA Sport Facts (@AudiraSportFacts). Created by Agus Dwi R. Thumbnail: `style/cover-topic.png`. Video: `FINAL_VIDEO.mp4`.

## TikTok

**Hook:** Sebelas pemain tanpa posisi tetap yang mengalir seperti air... inilah revolusi taktik terbesar di dunia!

**Cover Text:** TOTAL FOOTBALL 1974

**Caption:** Di Piala Dunia 1974 Jerman Barat, timnas Belanda asuhan Rinus Michels dan sang maestro Johan Cruyff mengejutkan planet bumi dengan sistem 'Total Football'! Semua pemain bergerak cair bertukar posisi tanpa merusak formasi: bek bisa jadi penyerang, penyerang turun jadi bek! Belanda membantai Argentina 4–0 dan juara bertahan Brasil 2–0. Meski takluk 1–2 dari Jerman Barat di final, warisan taktik Singa Oranye menjadi cetak biru sepak bola modern masa kini!

**Pinned Comment:** Sejarah Sepak Bola #31 · AUDIRA Sport Facts (@AudiraSportFacts). Sumber: FIFA World Cup 1974 Archives & KNVB. Dinobatkan sebagai tim tanpa gelar juara paling berpengaruh dalam sejarah. Episode sebelumnya: EP30 Tragedi Chapecoense. Berikutnya: EP32 Gol Hantu Wembley.

**Hashtags:** #TotalFootball #Belanda1974 #JohanCruyff #RinusMichels #SejarahSepakBola #AUDIRA

## Instagram Reels

**Cover Headline:** KETIKA SEPAK BOLA BERUBAH JADI CAIRAN

**5-Point Value Breakdown:**
1. Kebangkitan Singa Oranje: Hadir kembali di Piala Dunia setelah 36 tahun absen membawa inovasi revolusioner.
2. Filosofi Ruang & Waktu: Pertukaran posisi otomatis yang menuntut stamina monster dan kecerdasan taktik tinggi.
3. Kemenangan Spektakuler: Melibas raksasa Amerika Latin Argentina 4–0 dan Brasil 2–0 tanpa ampun.
4. Johan Cruyff Sang Konduktor: Memimpin orkestra lapangan dengan kebebasan bergerak di segala sudut.
5. Warisan Abadi: Menjadi fondasi taktik tiki-taka Barcelona hingga sepak bola modern hari ini.

## YouTube Shorts

**Judul Utama:** Total Football Belanda 1974: Mengapa Tim yang Kalah Final Justru Mengubah Dunia?
**Deskripsi:** Bagaimana Johan Cruyff dan Rinus Michels merombak sepak bola kaku menjadi seni pertukaran posisi yang cair di Piala Dunia 1974? Simak ulasannya di episode #31 serial Sejarah Sepak Bola AUDIRA!
**Tags:** Total Football, Belanda 1974, Johan Cruyff, Rinus Michels, Piala Dunia 1974, Sejarah Sepak Bola, AUDIRA

## X (Twitter)

Bek jadi penyerang, penyerang jadi bek. 1974, Total Football Belanda membuktikan bahwa kecerdasan ruang melampaui kekakuan posisi. Cetak biru sepak bola modern yang abadi! #TotalFootball #Cruyff #AUDIRA

## Facebook & LinkedIn

Dalam teori taktik olahraga modern, Piala Dunia 1974 adalah titik tolak pemisah antara sepak bola era purba dan era modern. Bagaimana revolusi ruang fluida yang dirumuskan Belanda mengilhami pembinaan pemain generasi baru di seluruh dunia? Simak pembahasannya di serial AUDIRA Sejarah Sepak Bola.
""",

"EP32_GOL_HANTU_WEMBLEY_1966": """# SOCIAL CAPTIONS: Kontroversi Gol Hantu Wembley 1966 — Asal-usul VAR

Seri AUDIRA · SEJARAH SEPAK BOLA EP32, channel AUDIRA Sport Facts (@AudiraSportFacts). Created by Agus Dwi R. Thumbnail: `style/cover-topic.png`. Video: `FINAL_VIDEO.mp4`.

## TikTok

**Hook:** Bola membentur mistar lalu memantul ke garis putih... masuk atau tidak? Inilah gol hantu terbesar di dunia!

**Cover Text:** GOL HANTU WEMBLEY 1966

**Caption:** 30 Juli 1966 di Stadion Wembley. Final Piala Dunia antara Inggris dan Jerman Barat tertahan 2–2 di babak perpanjangan waktu. Pada menit 101, tendangan gledek Geoff Hurst membentur bawah mistar dan memantul ke garis gawang! Wasit Swiss Gottfried Dienst ragu dan berkonsultasi dengan hakim garis Soviet, Tofiq Bahramov, yang dengan yakin mengangguk: GOL! Inggris menang 4–2 dan juara dunia. Namun hingga era digital, simulasi komputer menunjukkan bola baru 97% melewati garis — memicu lahirnya Goal-Line Technology dan VAR!

**Pinned Comment:** Sejarah Sepak Bola #32 · AUDIRA Sport Facts (@AudiraSportFacts). Sumber: FIFA Archives, Rekaman Film 1966 & Studi Komputer Universitas Oxford. Kontroversi terbesar yang mendorong digitalisasi perwasitan modern. Episode sebelumnya: EP31 Total Football. Berikutnya: EP33 Mukjizat Deportivo.

**Hashtags:** #GolHantu #Wembley1966 #GeoffHurst #VAR #PialaDunia1966 #AUDIRA

## Instagram Reels

**Cover Headline:** PERDEBATAN 60 TAHUN: MASUK ATAU TIDAK?

**5-Point Value Breakdown:**
1. Final Terpanas 1966: Laga klasik Inggris vs Jerman Barat di hadapan 98.000 penonton Wembley.
2. Dentuman Mistar Menit 101: Tembakan Geoff Hurst memantul tegak lurus ke rumput berdebu putih.
3. Anggukan Tofiq Bahramov: Keputusan hakim garis asal Azerbaijan yang mengubah sejarah sepak bola.
4. Analisis Sains Digital: Pemodelan 3D modern membuktikan bola belum 100% melintasi garis gawang secara penuh.
5. Kelahiran Teknologi Modern: Menjadi alasan utama FIFA akhirnya menyetujui Goal-Line Technology dan VAR.

## YouTube Shorts

**Judul Utama:** Gol Hantu Wembley 1966: Masuk atau Tidak? Fakta di Balik Kelahiran VAR
**Deskripsi:** Benarkah gol Geoff Hurst di final Piala Dunia 1966 sah melintasi garis gawang? Saksikan misteri 60 tahun kontroversi Wembley dan bagaimana perdebatan ini melahirkan VAR di episode #32 serial Sejarah Sepak Bola AUDIRA!
**Tags:** Gol Hantu Wembley, Piala Dunia 1966, Geoff Hurst, Tofiq Bahramov, Goal Line Technology, VAR, Sejarah Sepak Bola, AUDIRA

## X (Twitter)

Menit 101 final Piala Dunia 1966: Geoff Hurst menembak, mistar bergetar, bola memantul di garis. Gol hantu Wembley yang menjadi alasan mengapa sepak bola modern hari ini membutuhkan teknologi VAR! #Wembley1966 #VAR #AUDIRA

## Facebook & LinkedIn

Dibutuhkan lebih dari setengah abad perdebatan, puluhan makalah ilmiah, dan simulasi grafis komputer sebelum FIFA akhirnya memutuskan untuk mengadopsi teknologi garis gawang. Mengapa sebuah keputusan wasit di Wembley tahun 1966 menjadi katalis revolusi digitalisasi olahraga global? Simak ulasannya di serial AUDIRA Sejarah Sepak Bola.
""",

"EP33_MUKJIZAT_DEPORTIVO_CORUNA_2004": """# SOCIAL CAPTIONS: Mukjizat Deportivo La Coruña 2004 — Menumbangkan Raksasa AC Milan

Seri AUDIRA · SEJARAH SEPAK BOLA EP33, channel AUDIRA Sport Facts (@AudiraSportFacts). Created by Agus Dwi R. Thumbnail: `style/cover-topic.png`. Video: `FINAL_VIDEO.mp4`.

## TikTok

**Hook:** Dihajar 4–1 di San Siro, lalu membalas 4–0 di kandang sendiri... kembalikan kemustahilan Liga Champions!

**Cover Text:** MUKJIZAT RIAZOR 4-0

**Caption:** April 2004, perempat final Liga Champions. AC Milan asuhan Carlo Ancelotti — juara bertahan bertabur bintang dunia (Maldini, Nesta, Kaka, Shevchenko) — tampak mustahil dihentikan setelah menang 4–1 di leg pertama. Namun di Stadion Riazor, Super Dépor asuhan Javier Irureta mengukir mukjizat! Tiga gol kilat di babak pertama oleh Pandiani, Valerón, dan Luque, disusul gol kapten Fran di babak kedua memastikan kemenangan 4–0 (agregat 5–4)! Raksasa terkuat Eropa pun tersungkur di Galicia!

**Pinned Comment:** Sejarah Sepak Bola #33 · AUDIRA Sport Facts (@AudiraSportFacts). Sumber: UEFA Champions League 2003/04 Official Records. Comeback defisit 3 gol pertama dalam sejarah babak gugur modern UCL. Episode sebelumnya: EP32 Gol Hantu Wembley. Berikutnya: EP34 Drama Aguero 93:20.

**Hashtags:** #Deportivo #SuperDepor #ACMilan #UCL2004 #Riazor #SejarahSepakBola #AUDIRA

## Instagram Reels

**Cover Headline:** KETIKA TIM NELAYAN MENENGGELAMKAN ARMADA MILAN

**5-Point Value Breakdown:**
1. Defisit Mustahil 1–4: Menghadapi tim AC Milan yang hanya butuh hasil imbang untuk lolos santai.
2. Kejutan Kilat Pandiani: Menit ke-5 membobol gawang Dida menyalakan keyakinan seisi stadion.
3. Sundulan Emas Valeron & Luque: Membalikkan keadaan menjadi 3–0 sebelum babak pertama usai.
4. Pukulan Telak Kapten Fran: Menit 76 mengunci kemenangan ajaib 4–0 (agregat 5–4).
5. Pelajaran Sejarah: Nama besar dan deretan trofi mahal tak mampu menggantikan semangat pantang menyerah.

## YouTube Shorts

**Judul Utama:** Mukjizat Deportivo La Coruña 2004: Bagaimana Super Dépor Hancurkan AC Milan 4–0?
**Deskripsi:** Bagaimana klub asal Galicia mampu membalikkan kekalahan 1–4 dari sang juara bertahan AC Milan dengan kemenangan 4–0 di Riazor? Simak salah satu comeback paling heroik di Liga Champions di episode #33 serial Sejarah Sepak Bola AUDIRA!
**Tags:** Deportivo La Coruna, AC Milan 2004, Super Depor, Walter Pandiani, Juan Carlos Valeron, Liga Champions, AUDIRA

## X (Twitter)

Leg 1: Milan 4–1 Depor. Leg 2 di Riazor: Pandiani, Valerón, Luque, Fran... Deportivo 4–0 Milan (agregat 5–4)! Bukti abadi bahwa di panggung Liga Champions, kemustahilan bisa dirobohkan! #SuperDepor #UCL #AUDIRA

## Facebook & LinkedIn

Dalam kurun waktu 90 menit di Stadion Riazor, Deportivo La Coruña mengingatkan seluruh komunitas sepak bola global: bahwa organisasi permainan yang disiplin, atmosfer kandang yang menekan, dan keyakinan spiritual mampu meruntuhkan kekuatan skuad termahal di dunia. Simak catatan taktiknya di serial AUDIRA Sejarah Sepak Bola.
""",

"EP34_DRAMA_AGUERO_9320_MAN_CITY": """# SOCIAL CAPTIONS: Drama Gol Sergio Agüero 93:20 — Keajaiban Penutup Liga Inggris

Seri AUDIRA · SEJARAH SEPAK BOLA EP34, channel AUDIRA Sport Facts (@AudiraSportFacts). Created by Agus Dwi R. Thumbnail: `style/cover-topic.png`. Video: `FINAL_VIDEO.mp4`.

## TikTok

**Hook:** Tertinggal hingga menit 91, lalu dua gol membalikkan 44 tahun penantian... detik 93:20 yang gila!

**Cover Text:** AGUERO 93:20

**Caption:** 13 Mei 2012 di Stadion Etihad. Manchester City harus menang melawan QPR untuk mengunci gelar Liga Inggris pertama dalam 44 tahun. Hingga menit ke-91, City tertinggal 1–2 sementara rival sekota Man United sudah selesai berpesta di tempat lain! Namun keajaiban meletus: sundulan Edin Džeko di menit 91:14 menyamakan skor, dan pada detik 93:20, Sergio Agüero menerima umpan Balotelli lalu melepaskan tembakan gledek yang merobek gawang! Komentator Martin Tyler berteriak histeris: 'AGUEROOOOO!' Gelar juara diraih di detik terakhir!

**Pinned Comment:** Sejarah Sepak Bola #34 · AUDIRA Sport Facts (@AudiraSportFacts). Sumber: Premier League Official Archives & Sky Sports Broadcast 2012. Momen penentuan gelar juara paling dramatis dalam sejarah sepak bola modern. Episode sebelumnya: EP33 Deportivo. Berikutnya: EP35 Inter Milan Treble 2010.

**Hashtags:** #Aguero9320 #ManCity #PremierLeague #SergioAguero #Dzeko #AUDIRA

## Instagram Reels

**Cover Headline:** 2 GOL DALAM 126 DETIK MENGUBAH SEJARAH KOTA MANCHESTER

**5-Point Value Breakdown:**
1. Tekanan 44 Tahun: Penantian panjang trofi liga terancam buyar di depan suporter sendiri.
2. Derita Menit 91: Tertinggal 1–2 dari 10 pemain QPR dengan air mata suporter yang mulai tumpah.
3. Nafas Pertama Edin Dzeko: Sundulan menit 91:14 menyalakan kembali harapan yang sekarat.
4. Detik Keramat 93:20: Tembakan keras kaki kanan Sergio Aguero menyegel gelar juara Premier League.
5. Reaksi Abadi Martin Tyler: Pekikan komentator olahraga paling ikonik sepanjang masa.

## YouTube Shorts

**Judul Utama:** Drama Gol Sergio Aguero 93:20: Detik Paling Gila dalam Sejarah Premier League!
**Deskripsi:** Bagaimana Manchester City merebut trofi Liga Inggris dari tangan Manchester United hanya dalam kurun waktu dua menit babak tambahan? Saksikan kembali momen legendaris 93:20 di episode #34 serial Sejarah Sepak Bola AUDIRA!
**Tags:** Sergio Aguero 9320, Manchester City, Premier League 2012, Edin Dzeko, Roberto Mancini, Martin Tyler, AUDIRA

## X (Twitter)

"I swear you'll never see anything like this ever again!" Menit 91: City 1–2 QPR. Menit 94: City 3–2 QPR! Detik 93:20 Sergio Agüero adalah drama terhebat yang pernah ditulis lapangan hijau! #Aguero9320 #ManCity #AUDIRA

## Facebook & LinkedIn

Olahraga adalah satu-satunya panggung drama tanpa naskah yang sanggup memadatkan emosi keputusasaan ekstrem dan ekstasi kebahagiaan mutlak hanya dalam rentang waktu dua menit. Bagaimana gol Sergio Agüero di menit 93:20 mendefinisikan era baru sepak bola modern? Simak ulasan mendalamnya di serial AUDIRA Sejarah Sepak Bola.
""",

"EP35_INTER_MILAN_GRANDE_INTER_TREBLE_2010": """# SOCIAL CAPTIONS: Inter Milan Dinasti Grande Inter & Treble 2010

Seri AUDIRA · SEJARAH SEPAK BOLA EP35, channel AUDIRA Sport Facts (@AudiraSportFacts). Created by Agus Dwi R. Thumbnail: `style/cover-topic.png`. Video: `FINAL_VIDEO.mp4`.

## TikTok

**Hook:** Satu-satunya klub dalam sejarah Italia yang pernah memborong Treble Winners... inilah Inter Milan 2010!

**Cover Text:** INTER TREBLE 2010

**Caption:** Di bawah asuhan sang juru taktik karismatik José Mourinho, Inter Milan mengukir mahakarya sempurna di musim 2009/2010! Melanjutkan warisan 'La Grande Inter' era 1960-an Helenio Herrera, Mourinho meracik skuad bermental baja dengan kapten abadi Javier Zanetti. Setelah menyingkirkan Chelsea dan menahan badai Barcelona di Camp Nou, puncaknya di Santiago Bernabéu pada 22 Mei 2010: dua gol magis 'Il Principe' Diego Milito menumbangkan Bayern Munich 2–0! Scudetto, Coppa Italia, dan Liga Champions disapu bersih!

**Pinned Comment:** Sejarah Sepak Bola #35 · AUDIRA Sport Facts (@AudiraSportFacts). Sumber: Arsip Resmi FC Internazionale Milano & UEFA. Rekor Treble Winners satu-satunya di sepak bola Italia yang belum tertandingi. Episode sebelumnya: EP34 Aguero 93:20. Berikutnya: EP36 Borussia Dortmund.

**Hashtags:** #InterMilan #Treble2010 #JoseMourinho #DiegoMilito #JavierZanetti #AUDIRA

## Instagram Reels

**Cover Headline:** TIGA TROFI MAHA AGUNG DALAM SATU MUSIM

**5-Point Value Breakdown:**
1. Warisan Grande Inter: Fondasi mental baja yang diwariskan dari era legendaris 1960-an.
2. Masterclass Taktik Mourinho: Mengorganisasi pertahanan legendaris 10 pemain di Camp Nou.
3. Ketenangan Sang Pangeran: Diego Milito mencetak gol di semua laga penentu juara (Coppa, Serie A, UCL).
4. Kapten Sejati Javier Zanetti: Mengangkat trofi Si Kuping Besar di penampilan resminya yang ke-700.
5. Rekor Abadi Italia: Satu-satunya klub Serie A peraih Treble Winners di panggung dunia.

## YouTube Shorts

**Judul Utama:** Inter Milan Treble 2010: Bagaimana José Mourinho Merajai Italia dan Eropa?
**Deskripsi:** Simak sejarah mahakarya taktik José Mourinho, dua gol magis Diego Milito, dan dedikasi Javier Zanetti saat membawa Inter Milan meraih Treble Winners di episode #35 serial Sejarah Sepak Bola AUDIRA!
**Tags:** Inter Milan Treble 2010, Jose Mourinho, Diego Milito, Javier Zanetti, Liga Champions 2010, Grande Inter, AUDIRA

## X (Twitter)

Scudetto, Coppa Italia, Liga Champions. Musim 2009/10, José Mourinho dan Diego Milito membawa Inter Milan mengukir sejarah Treble Winners abadi yang belum pernah disamai klub Italia mana pun! #InterTreble #Mourinho #AUDIRA

## Facebook & LinkedIn

Keberhasilan meraih treble kontinental menuntut ketahanan fisik, kedalaman taktik, dan ketahanan mental tanpa cela sepanjang sembilan bulan kompetisi bertekanan tinggi. Bagaimana kepemimpinan José Mourinho di Inter Milan tahun 2010 menetapkan standar baru manajemen ruang ganti elite? Simak pembahasannya di serial AUDIRA Sejarah Sepak Bola.
""",

"EP36_BORUSSIA_DORTMUND_TEMBOK_KUNING_GEGENPRESSING": """# SOCIAL CAPTIONS: Borussia Dortmund Tembok Kuning & Badai Gegenpressing

Seri AUDIRA · SEJARAH SEPAK BOLA EP36, channel AUDIRA Sport Facts (@AudiraSportFacts). Created by Agus Dwi R. Thumbnail: `style/cover-topic.png`. Video: `FINAL_VIDEO.mp4`.

## TikTok

**Hook:** Tembok manusia terbesar di dunia sepak bola dan badai Gegenpressing... inilah energi murni Borussia Dortmund!

**Cover Text:** DIE GELBE WAND

**Caption:** Di Signal Iduna Park, berdiri Südtribüne — tribun terjal tanpa kursi terbesar di Eropa yang menampung 25.000 suporter berdiri, dijuluki 'Die Gelbe Wand' (Tembok Kuning)! Di sinilah pelatih jenius Jürgen Klopp melahirkan revolusi taktik 'Gegenpressing': merebut kembali bola dalam 5 detik dengan intensitas badai! Bersama skuad muda Lewandowski, Reus, dan Götze, Dortmund meruntuhkan hegemoni Bayern Munich dan menjuarai Bundesliga dua musim beruntun pada 2011 dan 2012!

**Pinned Comment:** Sejarah Sepak Bola #36 · AUDIRA Sport Facts (@AudiraSportFacts). Sumber: Bundesliga Archives & Borussia Dortmund Official. Filosofi Heavy Metal Football yang mengubah taktik modern dunia. Episode sebelumnya: EP35 Inter Treble. Berikutnya: EP37 Chelsea Abramovich.

**Hashtags:** #BorussiaDortmund #TembokKuning #Gegenpressing #JurgenKlopp #Bundesliga #AUDIRA

## Instagram Reels

**Cover Headline:** 25.000 SUPORTER BERDIRI & REVOLUSI TAKTIK KLOPP

**5-Point Value Breakdown:**
1. Gelbe Wand Raksasa: Tribun berdiri 25.000 suporter yang menciptakan intimidasi akustik menggelegar.
2. Filosofi Gegenpressing: Rebut bola secepatnya di wilayah pertahanan lawan sebelum mereka sempat menata formasi.
3. Heavy Metal Football: Sepak bola bertenaga tinggi, penuh gairah, dan mengalir cepat tanpa kompromi.
4. Menumbangkan Raksasa: Menjuarai Bundesliga 2011 dan mengawinkan gelar dobel domestik 2012 atas Bayern.
5. Warisan Pelatih Dunia: Gaya Gegenpressing diadopsi oleh mayoritas pelatih papan atas dunia hari ini.

## YouTube Shorts

**Judul Utama:** Mengapa Tembok Kuning Borussia Dortmund Ditakuti Seluruh Tim Elit Eropa?
**Deskripsi:** Apa rahasia di balik gemuruh 25.000 suporter Südtribüne dan revolusi taktik Gegenpressing Jürgen Klopp di Borussia Dortmund? Simak kisahnya di episode #36 serial Sejarah Sepak Bola AUDIRA!
**Tags:** Borussia Dortmund, Tembok Kuning, Die Gelbe Wand, Jurgen Klopp, Gegenpressing, Signal Iduna Park, Bundesliga, AUDIRA

## X (Twitter)

25.000 suporter berdiri di Südtribüne. Badai Gegenpressing merebut bola dalam 5 detik. Jürgen Klopp membuktikan bahwa gairah murni dan taktik kolektif sanggup menumbangkan hegemoni raksasa! #BVB #TembokKuning #Klopp #AUDIRA

## Facebook & LinkedIn

Dalam lanskap sepak bola komersial modern, Borussia Dortmund mempertahankan keseimbangan unik antara budaya suporter akar rumput yang otentik dan inovasi taktik level elite. Bagaimana integrasi tribun legendaris Die Gelbe Wand dan sistem Gegenpressing Jürgen Klopp mengubah wajah sepak bola Jerman? Simak ulasannya di serial AUDIRA Sejarah Sepak Bola.
""",

"EP37_CHELSEA_REVOLUSI_ABRAMOVICH_2003": """# SOCIAL CAPTIONS: Chelsea & Revolusi Modal Roman Abramovich 2003

Seri AUDIRA · SEJARAH SEPAK BOLA EP37, channel AUDIRA Sport Facts (@AudiraSportFacts). Created by Agus Dwi R. Thumbnail: `style/cover-topic.png`. Video: `FINAL_VIDEO.mp4`.

## TikTok

**Hook:** Kedatangan miliarder yang mengubah peta kekuatan sepak bola dunia selamanya... inilah revolusi Chelsea 2003!

**Cover Text:** REVOLUSI CHELSEA 2003

**Caption:** Musim panas 2003, miliarder asal Rusia Roman Abramovich mengakuisisi Chelsea FC dan memecahkan rekor transfer untuk membangun kekuatan baru. Mengakhiri kemarau 50 tahun gelar liga, kedatangan José Mourinho pada 2004 melahirkan 'The Special One'! Ditenagai pilar baja John Terry, Frank Lampard, Petr Čech, dan Didier Drogba, Chelsea mencatat rekor pertahanan terkuat dunia dengan hanya kebobolan 15 gol sepanjang musim! Puncaknya pada 2012, The Blues menaklukkan Eropa di Allianz Arena Munich!

**Pinned Comment:** Sejarah Sepak Bola #37 · AUDIRA Sport Facts (@AudiraSportFacts). Sumber: Premier League Records & UEFA. Rekor 15 kebobolan dalam satu musim liga belum pernah terpecahkan hingga hari ini. Episode sebelumnya: EP36 Dortmund. Berikutnya: EP38 Napoli & Maradona.

**Hashtags:** #Chelsea #RomanAbramovich #Mourinho #Lampard #Drogba #PremierLeague #AUDIRA

## Instagram Reels

**Cover Headline:** 50 TAHUN PUASA GELAR BERAKHIR DALAM SEMALAM

**5-Point Value Breakdown:**
1. Akuisisi Mengguncang: Musim panas 2003 membuka era baru pendanaan korporasi sepak bola global.
2. Era The Special One: Kehadiran José Mourinho membawa arogansi positif dan mental juara mutlak.
3. Tembok Baja London: Rekor dunia hanya kebobolan 15 gol dalam 38 pertandingan liga 2004/05.
4. Kuartet Abadi: Fondasi emas Cech di gawang, Terry di belakang, Lampard di tengah, dan Drogba di depan.
5. Mahkota Munich 2012: Menjuarai Liga Champions Eropa pertama bagi klub kota London.

## YouTube Shorts

**Judul Utama:** Revolusi Chelsea 2003: Bagaimana Uang Roman Abramovich Mengubah Sepak Bola?
**Deskripsi:** Bagaimana akuisisi Roman Abramovich dan kedatangan Jose Mourinho mengubah Chelsea dari tim papan tengah menjadi penguasa Eropa? Simak sejarahnya di episode #37 serial Sejarah Sepak Bola AUDIRA!
**Tags:** Chelsea 2003, Roman Abramovich, Jose Mourinho, Frank Lampard, Didier Drogba, John Terry, Premier League, AUDIRA

## X (Twitter)

2003: Roman Abramovich datang. 2004: Mourinho 'The Special One' tiba. 2005: Juara liga hanya kebobolan 15 gol. Revolusi modal dan disiplin taktik yang mengubah tatanan sepak bola modern! #Chelsea #Abramovich #AUDIRA

## Facebook & LinkedIn

Akuisisi Chelsea oleh Roman Abramovich pada tahun 2003 sering disebut sebagai titik awal pergeseran tektonik kepemilikan modal asing dalam sepak bola Eropa. Bagaimana strategi investasi terarah dan pembangunan tulang punggung pemain lokal mampu melahirkan dinasti juara yang bertahan selama dua dekade? Simak analisisnya di serial AUDIRA Sejarah Sepak Bola.
""",

"EP38_NAPOLI_PENEBUSAN_SELATAN_MARADONA": """# SOCIAL CAPTIONS: SSC Napoli & Penebusan Kaum Selatan Era Maradona

Seri AUDIRA · SEJARAH SEPAK BOLA EP38, channel AUDIRA Sport Facts (@AudiraSportFacts). Created by Agus Dwi R. Thumbnail: `style/cover-topic.png`. Video: `FINAL_VIDEO.mp4`.

## TikTok

**Hook:** Bukan sekadar sepak bola, ini adalah martabat dan penebusan air mata kaum Selatan... Napoli era Maradona!

**Cover Text:** PENEBUSAN MARADONA

**Caption:** 5 Juli 1984, sebanyak 75.000 warga kota Naples memadati Stadion San Paolo hanya untuk menyambut kedatangan seorang pemuda bertubuh mungil: Diego Armando Maradona! Di era saat Italia Selatan kerap dihina dan didiskriminasi oleh klub-klub kaya Utara (Juventus, Milan, Inter), Maradona memimpin perlawanan suci rakyat kecil! Hasilnya: Scudetto pertama dalam sejarah klub pada 1987, Piala UEFA 1989, dan Scudetto kedua 1990! Bagi warga Naples, Diego bukan sekadar pemain, melainkan dewa penyelamat martabat!

**Pinned Comment:** Sejarah Sepak Bola #38 · AUDIRA Sport Facts (@AudiraSportFacts). Sumber: Arsip Sejarah SSC Napoli & Dokumen FIGC. Nama stadion kini diabadikan menjadi Stadio Diego Armando Maradona. Episode sebelumnya: EP37 Chelsea. Berikutnya: EP39 Benfica & Guttmann.

**Hashtags:** #Napoli #Maradona #DiegoMaradona #Scudetto1987 #SanPaolo #SejarahSepakBola #AUDIRA

## Instagram Reels

**Cover Headline:** KETIKA MARADONA MENGANGKAT DERAJAT SEBUAH KOTA

**5-Point Value Breakdown:**
1. Sambutan 75.000 Jiwa: Kedatangan terakbar seorang pesepak bola di San Paolo pada 1984.
2. Melawan Diskriminasi Sosial: Menjawab cemoohan kaum kaya Italia Utara di atas lapangan hijau.
3. Scudetto Pertama 1987: Menjuarai Serie A pertama kali dalam 61 tahun sejarah klub berdiri.
4. Gelar Eropa 1989: Mengangkat trofi Piala UEFA menumbangkan raksasa Bayern Munich dan Stuttgart.
5. Kultus Abadi: Menjadi sosok pelindung spiritual kota Naples yang dipuja melintasi generasi.

## YouTube Shorts

**Judul Utama:** Napoli Era Maradona: Mengapa Diego Dianggap Dewa Pelindung Kota Naples?
**Deskripsi:** Mengapa kedatangan Diego Maradona ke SSC Napoli pada 1984 jauh melampaui urusan olahraga? Simak kisah perlawanan kaum Selatan melawan hegemoni Italia Utara di episode #38 serial Sejarah Sepak Bola AUDIRA!
**Tags:** Napoli Maradona, Diego Armando Maradona, Scudetto 1987, Stadio San Paolo, Sejarah Sepak Bola, Italia Selatan, AUDIRA

## X (Twitter)

"Kalian tidak tahu apa yang kalian lewatkan!" Coretan di dinding pemakaman Naples saat Napoli juara liga 1987. Diego Maradona tidak hanya membawa trofi, ia mengembalikan martabat kaum Selatan! #Maradona #Napoli #AUDIRA

## Facebook & LinkedIn

Dalam sosiologi olahraga kontemporer, relasi antara Diego Maradona dan kota Naples dipelajari sebagai fenomena integrasi kultural paling intim antara seorang individu dan komunitas masyarakat kelas pekerja. Bagaimana sepak bola bertransformasi menjadi instrumen emansipasi sosial politik? Simak catatan sejarahnya di serial AUDIRA Sejarah Sepak Bola.
""",

"EP39_BENFICA_EUSEBIO_KUTUKAN_BELA_GUTTMANN": """# SOCIAL CAPTIONS: SL Benfica Era Eusébio & Kutukan Béla Guttmann

Seri AUDIRA · SEJARAH SEPAK BOLA EP39, channel AUDIRA Sport Facts (@AudiraSportFacts). Created by Agus Dwi R. Thumbnail: `style/cover-topic.png`. Video: `FINAL_VIDEO.mp4`.

## TikTok

**Hook:** 'Dalam 100 tahun ke depan, Benfica tidak akan pernah juara Eropa!'... kutukan mistis Béla Guttmann!

**Cover Text:** KUTUKAN 100 TAHUN BENFICA

**Caption:** Di awal era 1960-an, pelatih jenius asal Hungaria Béla Guttmann dan sang 'Pantera Hitam' Eusébio membawa SL Benfica merajai Eropa dengan menjuarai Piala Champions dua tahun berturut-turut (1961 mengalahkan Barca, 1962 menumbangkan Madrid 5–3)! Namun ketika permintaan kenaikan gaji Guttmann ditolak direksi klub, ia melangkah pergi sambil mengucap sumpah kutukan: 'Benfica tak akan juara Eropa lagi dalam 100 tahun!' Hasilnya mengerikan: Benfica lolos ke 8 final Eropa berikutnya dan semuanya kalah!

**Pinned Comment:** Sejarah Sepak Bola #39 · AUDIRA Sport Facts (@AudiraSportFacts). Sumber: Arsip Resmi UEFA & Sejarah SL Benfica. Bahkan ziarah Eusébio ke makam Guttmann di Wina pada 1990 gagal memecah kutukan. Episode sebelumnya: EP38 Napoli. Berikutnya: EP40 River Plate.

**Hashtags:** #Benfica #Eusebio #BelaGuttmann #KutukanBenfica #PialaChampions #SejarahSepakBola #AUDIRA

## Instagram Reels

**Cover Headline:** SUMPAH KELAM YANG MENGUTUK 8 FINAL EROPA

**5-Point Value Breakdown:**
1. Puncak Kejayaan 1961–1962: Meruntuhkan dominasi 5 gelar berturut-turut Real Madrid di Eropa.
2. Sihir Sang Pantera Hitam: Eusébio mencetak dua gol legendaris di final Amsterdam 1962.
3. Sumpah Kutukan 1962: Béla Guttmann meninggalkan klub setelah permohonan bonusnya ditolak.
4. Delapan Final Kelam: Kalah di final Eropa 1963, 1965, 1968, 1983, 1988, 1990, 2013, dan 2014!
5. Doa di Pusara Wina: Upaya Eusébio memohon pengampunan di makam sang pelatih yang tetap tak berdaya.

## YouTube Shorts

**Judul Utama:** Kutukan Béla Guttmann: Mengapa Benfica Selalu Kalah di 8 Final Eropa?
**Deskripsi:** Apakah kutukan mistis benar-benar ada dalam sepak bola? Saksikan kisah keagungan Eusébio dan sumpah 100 tahun Béla Guttmann yang menghantui SL Benfica di episode #39 serial Sejarah Sepak Bola AUDIRA!
**Tags:** Kutukan Benfica, Bela Guttmann, Eusebio, SL Benfica, Liga Champions, Final Eropa, Sejarah Sepak Bola, AUDIRA

## X (Twitter)

"Benfica tidak akan pernah juara Eropa dalam 100 tahun!" Sejak kutukan Béla Guttmann terucap pada 1962, Benfica telah melangkah ke 8 final kompetisi Eropa dan kalah di semuanya! Misteri terbesar sepak bola. #Benfica #Eusebio #AUDIRA

## Facebook & LinkedIn

Batas antara psikologi sugesti kekalahan massal dan mitos sejarah sering kali kabur ketika sebuah narasi telah berusia lebih dari setengah abad. Bagaimana sumpah Béla Guttmann pada tahun 1962 bertransformasi menjadi beban mental kolektif yang menghantui salah satu raksasa terbesar Portugal? Simak ulasannya di serial AUDIRA Sejarah Sepak Bola.
""",

"EP40_RIVER_PLATE_LA_MAQUINA_MILLONARIOS": """# SOCIAL CAPTIONS: River Plate Mesin Serang La Máquina & Era Millonarios

Seri AUDIRA · SEJARAH SEPAK BOLA EP40, channel AUDIRA Sport Facts (@AudiraSportFacts). Created by Agus Dwi R. Thumbnail: `style/cover-topic.png`. Video: `FINAL_VIDEO.mp4`.

## TikTok

**Hook:** Mesin serang paling sempurna di Amerika Latin yang melahirkan legenda Alfredo Di Stéfano... inilah La Máquina!

**Cover Text:** LA MÁQUINA RIVER PLATE

**Caption:** Di era 1940-an, raksasa Argentina River Plate membentuk lini serang paling legendaris dalam sejarah sepak bola dunia yang dijuluki 'La Máquina' (Sang Mesin)! Lima serangkai penyerang — Muñoz, Moreno, Pedernera, Labruna, dan Loustau — bermain dengan presisi mekanik roda jam yang memukau dunia! Dari rahim klub bertajuk 'Los Millonarios' dan stadion megah El Monumental inilah lahir talenta ajaib Alfredo Di Stéfano sebelum memikat Real Madrid! River Plate mengukuhkan diri sebagai raja domestik dengan rekor 38 gelar liga!

**Pinned Comment:** Sejarah Sepak Bola #40 · AUDIRA Sport Facts (@AudiraSportFacts). Sumber: AFA & Arsip Resmi Club Atlético River Plate. La Máquina diakui sejarawan sebagai pendahulu filosofi Total Football. Episode penutup batch 4 serial Sejarah Sepak Bola AUDIRA.

**Hashtags:** #RiverPlate #LaMaquina #DiStefano #ElMonumental #SepakBolaArgentina #AUDIRA

## Instagram Reels

**Cover Headline:** KETIKA LINI SERANG BEKERJA SEPERTI RODA GIGI JAM

**5-Point Value Breakdown:**
1. Harmoni Sempurna 1940-an: Lima serangkai penyerang legendaris yang bergerak tanpa posisi statis.
2. Identitas Los Millonarios: Julukan klub aristokrat kaya yang membangun stadion megah El Monumental.
3. Inkubator Alfredo Di Stéfano: Tempat lahirnya sang maestro sebelum mengubah sejarah Real Madrid di Eropa.
4. Rekor Domestik Abadi: Merajai kompetisi Argentina dengan 38 trofi liga resmi.
5. Inspirasi Taktik Dunia: Mengilhami formasi fluiditas sepak bola menyerang modern Amerika Latin dan Eropa.

## YouTube Shorts

**Judul Utama:** La Máquina River Plate: Mesin Serang Paling Mematikan dalam Sejarah Sepak Bola
**Deskripsi:** Bagaimana lima serangkai penyerang River Plate di era 1940-an bermain sepresisi roda gigi mesin dan melahirkan sang legenda Alfredo Di Stéfano? Saksikan di episode #40 serial Sejarah Sepak Bola AUDIRA!
**Tags:** River Plate, La Maquina, Alfredo Di Stefano, Angel Labruna, El Monumental, Sepak Bola Argentina, AUDIRA

## X (Twitter)

Muñoz, Moreno, Pedernera, Labruna, Loustau. Lini serang 'La Máquina' River Plate di era 1940-an bermain seindah orkestra dan sepresisi roda gigi mesin! Warisan agung sepak bola Amerika Latin. #RiverPlate #LaMaquina #AUDIRA

## Facebook & LinkedIn

Jauh sebelum Total Football diperkenalkan oleh Belanda di era 1970-an, publik sepak bola Buenos Aires di era 1940-an telah menyaksikan pergerakan pertukaran posisi dan sinkronisasi taktik mekanik tingkat tinggi lewat fenomena La Máquina River Plate. Bagaimana inovasi ini memengaruhi evolusi sepak bola global? Simak kajian lengkapnya di serial AUDIRA Sejarah Sepak Bola.
"""
}

now_iso = datetime.now().isoformat() + "Z"

for folder_name in storyboards.keys():
    ep_dir = ROOT / folder_name
    if not ep_dir.exists():
        continue
    
    # 1. docs/STORYBOARD.md
    (ep_dir / "docs" / "STORYBOARD.md").write_text(storyboards[folder_name], encoding="utf-8")
    print(f"Updated docs/STORYBOARD.md for {folder_name}")
    
    # 2. SOCIAL_CAPTIONS.md
    (ep_dir / "SOCIAL_CAPTIONS.md").write_text(social_captions[folder_name], encoding="utf-8")
    print(f"Updated SOCIAL_CAPTIONS.md for {folder_name}")
    
    # 3. STATUS.json
    status_path = ep_dir / "STATUS.json"
    if status_path.exists():
        data = json.loads(status_path.read_text(encoding="utf-8"))
        data["currentStage"] = "voice"
        data["updatedAt"] = now_iso
        for st in data.get("stages", []):
            if st["id"] in ["context", "research", "style", "script", "setup", "delivery"]:
                st["status"] = "done"
                if "approved" in st:
                    st["approved"] = True
            elif st["id"] in ["voice", "animation", "draft", "final", "review"]:
                st["status"] = "pending"
        status_path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"Synced STATUS.json for {folder_name}")

print("Batch 31-40 storyboards, captions, and status completely synchronized!")

