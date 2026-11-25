# Generates rich factual STORYBOARD.md, SOCIAL_CAPTIONS.md, and syncs STATUS.json for EP21-EP30
import pathlib, json
from datetime import datetime

ROOT = pathlib.Path(__file__).resolve().parent.parent

# --- STORYBOARDS ---
storyboards = {
"EP21_KEAJAIBAN_BERN_1954": """# Storyboard — EP21 Keajaiban Bern 1954 (TIMEFORGE)

Format 9:16 1080×1920 @ 60. Safe zone: atas 180 px, bawah 380 px. Kamera bergerak sinematis linimasa sepia-emas, multi-plane (BG badai hujan Stadion Wankdorf / midground pul sepatu Adidas & Rahn / foreground tetesan air hujan & percikan lumpur / HUD / subtitle karaoke).

| Beat | Dtk | VO (ringkas) | Visual | Kamera | HUD / Teks |
|---|---|---|---|---|---|
| Hook | 0–3 | "Tertinggal 2 gol dalam 8 menit di bawah badai hujan... Ini AUDIRA." | Stadion Wankdorf 3D diterpa hujan lebat; papan skor logam kuno tertera Hungaria 2–0; kilatan petir menyinari rumput berlumpur. | Slow dolly-in menembus deru hujan ke papan skor. | Kartu kecil "SEJARAH SEPAK BOLA #21" (safe atas). Teks "KEAJAIBAN BERN". |
| Context | 4–17 | 4 Juli 1954 di Bern; Hungaria rekor 31 laga tak terkalahkan. | Plakat jam kota Bern "1954"; formasi 'Mighty Magyars' Hungaria berdiri kokoh tak tertandingi; bendera Swiss basah berkibar. | Kran meluncur dari jam kota turun ke formasi Hungaria. | Linimasa tipis "1954" (HUD hijau); teks "Hungaria: 31 Laga Tak Terkalahkan". |
| Main | 18–45 | Puskas & Czibor 2–0; Sepp Herberger & pul sekrup Adi Dassler; skor 2–2. | Dua gol kilat Hungaria; pelatih Sepp Herberger memasang pul sekrup sepatu buatan Adi Dassler (Adidas); cengkeraman sepatu di lumpur stabil; gol balasan Jerman menyamakan 2–2. | Tilt naik dari sol sepatu bersekrup ke ekspresi juang pemain. | "Inovasi Adi Dassler (Pul Sekrup)"; skor "2–2 Babak Pertama". |
| Explanation | 46–70 | Menit 84, Helmut Rahn sambar bola muntah; tembakan kaki kiri 3–2. | Menit 84: bola liar memantul di luar kotak penalti; siluet nomor 10 Helmut Rahn melepaskan tembakan roket kaki kiri menembus gawang; jaring bergetar kencang. | Push-in dramatis mengikuti laju bola menembus gawang. | Counter menit "84'"; label "Helmut Rahn (3–2)"; "Jerman Juara Dunia". |
| Visual Payoff | 65–81 | Simbol kebangkitan ekonomi & psikologis Jerman pasca-PD II. | Trofi Jules Rimet terangkat di atas puing-puing kota yang berevolusi menjadi gedung-gedung modern (simbol Wirtschaftswunder / keajaiban ekonomi). | Orbit 360 derajat mengitari trofi Jules Rimet bercahaya fajar. | "Das Wunder von Bern" + "Kebangkitan Bangsa". Brand AUDIRA. |
| Outro | 82–91 | "Ini AUDIRA, Sejarah Sepak Bola. Berikutnya: dongeng Leicester City 2016." | Hujan reda berganti sinar mentari; kartu outro AUDIRA; teaser rubah Leicester. | Pull-back tenang ke kartu outro. | `<AudiraOutro code="SPORTFACTS">` + teaser EP22 Leicester City. |

## Catatan produksi
- Estetika TIMEFORGE atmosferik: hujan deras partikel volumetrik, desaturasi warna era 1950-an, tanpa logo sponsor modern.
""",

"EP22_DONGENG_LEICESTER_CITY_2016": """# Storyboard — EP22 Dongeng Leicester City 2016 (COMICFORGE)

Format 9:16 1080×1920 @ 60. Safe zone: atas 180 px, bawah 380 px. Kamera aksi pop-art berenergi tinggi (no slideshow), multi-plane (BG King Power Stadium biru menyala / midground Vardy, Mahrez, Ranieri / foreground konfeti biru-emas & lonceng pizza / HUD / subtitle karaoke).

| Beat | Dtk | VO (ringkas) | Visual | Kamera | HUD / Teks |
|---|---|---|---|---|---|
| Hook | 0–3 | "Peluang 5000 banding 1 di bursa taruhan... Ini AUDIRA." | Angka taruhan "5.000 : 1" raksasa pecah berkeping-keping; rubah biru melompat menembus pecahan angka; logo mahkota Premier League berpendar. | Dolly-in cepat mengikuti lompatan rubah. | Kartu kecil "SEJARAH SEPAK BOLA #22". Teks "PELUANG 5000:1". |
| Context | 4–17 | Awal musim 2015 tim gurem nyaris degradasi; Claudio Ranieri. | Papan klasemen musim lalu yang compang-camping; siluet Claudio Ranieri tersenyum sambil membunyikan lonceng khayal "Dilly Ding, Dilly Dong". | Kran turun dari papan klasemen ke sosok Ranieri. | Linimasa tipis "2015/16" (HUD hijau); label "The Foxes: Misi Bertahan Hidup". |
| Main | 18–45 | Jamie Vardy rekor 11 laga beruntun; gocekan Mahrez & jelajah Kante. | Panel aksi komik beruntun: Vardy berlari kencang memecahkan rekor 11 laga; siluet Mahrez meliuk-liuk; Kante memotong bola di mana-mana; raksasa elit tersungkur. | Quick pan dinamis antardiagram serangan balik kilat. | Counter rekor "Vardy: 11 Laga Beruntun"; label "Mahrez · Kante". |
| Explanation | 46–70 | Serangan balik mematikan & pertahanan kokoh; juara selisih 10 poin. | Skema taktik serangan 3 sentuhan; benteng pertahanan biru kokoh; tanggal 2 Mei 2016 Stamford Bridge memastikan gelar; selisih 10 poin di puncak. | Tracking cepat menembus lapangan lalu lock di puncak klasemen. | "Premier League Champions 2016" (Selisih +10 Poin). |
| Visual Payoff | 65–81 | Dongeng kemustahilan mengalahkan hegemoni triliunan rupiah. | Trofi Premier League dengan pita biru berkibar; Andrea Bocelli menyanyi di panggung King Power; konfeti biru berhamburan megah. | Orbit kamera 360 derajat melingkari pesta juara King Power. | "Dongeng Terbesar Sepak Bola" + "Uang Bukan Segalanya". Brand AUDIRA. |
| Outro | 82–91 | "Ini AUDIRA... Berikutnya: rekor abadi The Invincibles Arsenal." | Pesta kembang api meredup; kartu outro AUDIRA; teaser meriam emas Arsenal. | Pull-back mulus ke kartu outro. | `<AudiraOutro code="SPORTFACTS">` + teaser EP23 The Invincibles Arsenal. |

## Catatan produksi
- Estetika COMICFORGE pop-art cerah berlatar biru royal (#003090) & emas kejuaraan (#FDBE11).
""",

"EP23_INVINCIBLES_ARSENAL_2004": """# Storyboard — EP23 The Invincibles Arsenal 2004 (PRECISION)

Format 9:16 1080×1920 @ 60. Safe zone: atas 180 px, bawah 380 px. Kamera presisi teknis futuristik, multi-plane (BG arsitektur klasik Highbury Art Deco / midground trofi emas & Henry 14 / foreground laser ukur emas & statistik tak terkalahkan / HUD / subtitle karaoke).

| Beat | Dtk | VO (ringkas) | Visual | Kamera | HUD / Teks |
|---|---|---|---|---|---|
| Hook | 0–3 | "38 pertandingan liga tanpa satu pun kekalahan... Ini AUDIRA." | Papan meteran digital presisi mencatat deretan 38 balok tak terkalahkan bertuliskan "W" dan "D"; laser emas mengunci angka 0 di kolom kekalahan. | Dolly-in lurus menembus grid data presisi. | Kartu kecil "SEJARAH SEPAK BOLA #23". Angka "0 KALAH" berpendar emas. |
| Context | 4–17 | Musim 2003–2004 di Highbury London; manajer Arsene Wenger. | Gerbang Art Deco marmer stadion Highbury; siluet Arsene Wenger mengamati lapangan seperti profesor catur; denah taktik bergulir elegan. | Kran naik perlahan dari gerbang Highbury ke denah taktik. | Linimasa tipis "2003–2004" (HUD hijau); label "Arsene Wenger: Sang Visioner". |
| Main | 18–45 | Henry 30 gol, Bergkamp anggun, kapten Vieira; sepak bola indah. | Formasi emas bergerak presisi: bidak "HENRY 14" meluncur secepat kilat melepaskan placing melengkung; "BERGKAMP 10" memberi umpan belah bumi; "VIEIRA 4" memotong bola lawan. | Kamera miring menyusuri garis passing segitiga sempurna. | Counter gol "Henry: 30 Gol"; label "Vieira · Bergkamp". |
| Explanation | 46–70 | 15 Mei 2004 tekuk Leicester 2–1; rekor berlanjut 49 laga tak kalah. | Laga penutup 15 Mei 2004: skor berbalik 2–1; catatan 26 menang, 12 imbang, 0 kalah terkunci; counter laga terus bertambah hingga menyentuh 49 laga. | Tracking horizontal menyusuri rentetan 49 laga tak kalah. | "P:38 W:26 D:12 L:0" → Counter "49 Laga Beruntun". |
| Visual Payoff | 65–81 | Trofi khusus berlapis emas murni Premier League satu-satunya. | Trofi unik Premier League berlapis emas murni 24 karat berputar anggun; mahkota singa emas memantulkan cahaya gemerlap. | Orbit kamera 360 derajat memutari piala emas murni. | "The Golden Trophy" (Satu-satunya dalam Sejarah). Brand AUDIRA. |
| Outro | 82–91 | "Ini AUDIRA... Berikutnya: tragedi Heysel 1985 dan hukuman lima tahun." | Kilau emas meredup syahdu; kartu outro AUDIRA; teaser gerbang stadion Heysel. | Pull-back presisi ke kartu outro. | `<AudiraOutro code="SPORTFACTS">` + teaser EP24 Tragedi Heysel. |

## Catatan produksi
- Estetika PRECISION dominan palet merah garnet (#DB0007) dan emas murni (#FFD700) dengan grid arsitektural.
""",

"EP24_TRAGEDI_HEYSEL_1985": """# Storyboard — EP24 Tragedi Heysel 1985 & Reformasi Keamanan (FILMNOIR)

Format 9:16 1080×1920 @ 60. Safe zone: atas 180 px, bawah 380 px. Kamera noir dokumenter syahdu (penuh rasa hormat, no sensasionalisme), multi-plane (BG stadion tua abu-abu / midground 39 lilin memorial & plakat / foreground debu monokrom & tetesan air / HUD / subtitle karaoke).

| Beat | Dtk | VO (ringkas) | Visual | Kamera | HUD / Teks |
|---|---|---|---|---|---|
| Hook | 0–3 | "39 nyawa melayang di balik tembok stadion... Ini AUDIRA." | Dinding beton tua retak dalam pencahayaan noir dramatis; 39 titik cahaya lilin perlahan menyala dalam hening. | Slow push-in menembus bayangan temaram ke barisan lilin. | Kartu kecil "SEJARAH SEPAK BOLA #24". Teks "TRAGEDI HEYSEL". |
| Context | 4–17 | 29 Mei 1985 Brussels; final Piala Champions Liverpool vs Juventus. | Plakat penunjuk jalan Brussels "1985"; tiket usang final Piala Champions tergeletak; stadion Heysel yang rapuh dan usang. | Kran turun lambat dari plakat menuju tiket usang. | Linimasa tipis "29 Mei 1985" (HUD hijau); label "Brussels, Belgia". |
| Main | 18–45 | Kerusuhan sektor Z; dinding runtuh; laga dipaksakan Platini penalti. | Rekonstruksi arsitektur dinding pembatas sektor Z yang retak; suasana duka mendalam; bendera setengah tiang; penalti sunyi Michel Platini 1–0. | Kamera menyapu perlahan dari dinding pembatas ke bendera setengah tiang. | Simbol pita hitam berkibar; teks "Sektor Z · Penghormatan Abadi". |
| Explanation | 46–70 | Hukuman UEFA: klub Inggris dilarang 5 tahun di Eropa (Liverpool 6 tahun). | Pintu gerbang kompetisi Eropa menutup rapat; stempel larangan "5 TAHUN" terpateri pada peta sepak bola Inggris; era isolasi sepak bola Britania. | Dolly-out mundur memperlihatkan gerbang kompetisi yang terkunci. | "Sanksi UEFA: 5 Tahun Larangan Klub Inggris (1985–1990)". |
| Visual Payoff | 65–81 | Transformasi keamanan: hilangnya pagar kawat & modernisasi stadion. | Tembok rapuh dan kawat berduri runtuh, berganti menjadi blueprint stadion modern serba kursi (*all-seater*), aman dan manusiawi. | Kamera naik menatap transformasi stadion modern beratap megah. | "Reformasi Keamanan Total" + "Demi Nyawa Manusia". Brand AUDIRA. |
| Outro | 82–91 | "Ini AUDIRA... Berikutnya: Perang Sepak Bola 1969 Honduras vs El Salvador." | Lilin perdamaian tetap menyala; kartu outro AUDIRA; teaser peta Amerika Tengah. | Pull-back khidmat ke kartu outro. | `<AudiraOutro code="SPORTFACTS">` + teaser EP25 Perang Sepak Bola 1969. |

## Catatan produksi
- Estetika FILMNOIR monokromatik abu-abu gelap (#1A1A1A) dengan pencahayaan rim lembut, tanpa menampilkan kekerasan fisik.
""",

"EP25_PERANG_SEPAK_BOLA_1969": """# Storyboard — EP25 Perang Sepak Bola 1969 (HISTORYMAP)

Format 9:16 1080×1920 @ 60. Safe zone: atas 180 px, bawah 380 px. Kamera taktis peta militer 3D (no slideshow), multi-plane (BG peta topografi Amerika Tengah / midground Estadio Azteca & garis perbatasan / foreground asap taktis & radar kompas / HUD / subtitle karaoke).

| Beat | Dtk | VO (ringkas) | Visual | Kamera | HUD / Teks |
|---|---|---|---|---|---|
| Hook | 0–3 | "Pertandingan sepak bola yang menyulut perang militer dua negara... Ini AUDIRA." | Peta benua Amerika Tengah 3D; garis batas El Salvador dan Honduras menyala merah membara dengan dentuman drum perang. | Dolly-in tajam menukik ke perbatasan dua negara. | Kartu kecil "SEJARAH SEPAK BOLA #25". Teks "THE FOOTBALL WAR". |
| Context | 4–17 | Juni 1969 kualifikasi Piala Dunia 1970; tensi imigran & sengketa tanah. | Peta topografi perbatasan; dokumen sengketa agraria dan imigran terbakar di sudut meja arsip; bendera dua negara berkibar tegang. | Pan horizontal menyusuri garis perbatasan kedua negara. | Linimasa tipis "Juni 1969" (HUD hijau); label "El Salvador vs Honduras". |
| Main | 18–45 | 3 laga berdarah; laga penentu di Estadio Azteca 3–2 untuk El Salvador. | Tiga pin stadion menancap: Tegucigalpa (1–0), San Salvador (3–0), dan play-off netral Estadio Azteca Mexico City; babak tambahan drama 3–2. | Kamera meluncur cepat antartitik stadion di peta Meksiko. | Skor "Play-off Azteca: El Salvador 3–2 Honduras". |
| Explanation | 46–70 | 14 Juli 1969: pesawat tempur menyerang; Perang 100 Jam tewaskan 3.000 jiwa. | Garis perbatasan meledak menjadi pertempuran udara pesawat baling-baling; jam pasir militer menghitung mundur 100 jam perang; intervensi diplomasi OAS. | Tracking melayang di atas garis front pertempuran 100 jam. | "Perang 100 Jam (14–18 Juli 1969)" · "Gencatan Senjata OAS". |
| Visual Payoff | 65–81 | Bola bukan penyebab utama, melainkan pemantik bom waktu sosial politik. | Bola sepak kuno berdiri di antara dua moncong senapan yang diikat pita perdamaian; rumput hijau tumbuh menutupi parit perang. | Orbit 360 derajat mengitari monumen bola perdamaian. | "Sepak Bola Sebagai Pemantik" + "Pelajaran Sejarah". Brand AUDIRA. |
| Outro | 82–91 | "Ini AUDIRA... Berikutnya: skandal Calciopoli 2006 dan runtuhnya Juventus." | Peta taktis menutup rapi; kartu outro AUDIRA; teaser rekaman telepon Calciopoli. | Pull-back tenang ke kartu outro. | `<AudiraOutro code="SPORTFACTS">` + teaser EP26 Skandal Calciopoli. |

## Catatan produksi
- Estetika HISTORYMAP taktis dengan kontur topografi cokelat gurun-hijau militer (#4B5320 / #C2B280).
""",

"EP26_SKANDAL_CALCIOPOLI_2006": """# Storyboard — EP26 Skandal Calciopoli 2006 (VISUALINVESTIGATION)

Format 9:16 1080×1920 @ 60. Safe zone: atas 180 px, bawah 380 px. Kamera investigasi forensik dokumen (no slideshow), multi-plane (BG papan bukti kabel telepon & berkas jaksa / midground rekaman audio & kartu wasit / foreground gelombang suara digital / HUD / subtitle karaoke).

| Beat | Dtk | VO (ringkas) | Visual | Kamera | HUD / Teks |
|---|---|---|---|---|---|
| Hook | 0–3 | "Panggilan telepon rahasia yang meruntuhkan dinasti terkuat Italia... Ini AUDIRA." | Gelombang suara audio sadapan telepon berdenyut hijau neon di layar gelap; transkrip ketikan dokumen rahasia terbentang. | Dolly-in cepat ke pusat denyut gelombang suara. | Kartu kecil "SEJARAH SEPAK BOLA #26". Teks "CALCIOPOLI 2006". |
| Context | 4–17 | Mei 2006 menjelang Piala Dunia; jaksa Napoli ungkap jaringan Moggi. | Papan bukti investigasi kejaksaan: foto manajer umum Luciano Moggi terhubung benang merah ke kartu wasit dan nomor telepon rahasia. | Pan lateral menyusuri benang merah investigasi forensik. | Linimasa tipis "Mei 2006" (HUD hijau); label "Operasi Jaksa Penuntut Napoli". |
| Main | 18–45 | Pemilihan wasit diatur; Juventus didegradasi ke Serie B, 2 gelar dicabut. | Skema jaringan telepon memanipulasi jadwal wasit; stempel merah raksasa "SERIE B" menghantam emblem Juventus; dua lencana Scudetto 2005 & 2006 dicabut. | Tilt turun cepat mengikuti dentuman stempel degradasi. | "Degradasi Serie B (-9 Poin)"; "2 Gelar Scudetto Dicabut". |
| Explanation | 46–70 | Bintang eksodus, legenda setia (Buffon, Del Piero); Italia juara dunia. | Bintang-bintang pergi, namun Del Piero, Buffon, dan Nedved bertahan di Serie B; kontras dramatis skuad Italia justru menjuarai Piala Dunia 2006 di Berlin. | Tracking kontras antara lapangan Serie B dan trofi Piala Dunia Berlin. | "Kesetiaan Para Legenda" + "Italia Juara Dunia 2006". |
| Visual Payoff | 65–81 | Integritas tak bisa dibeli; kebangkitan kembali La Vecchia Signora. | Lencana Juventus kembali berkilau bersih dari lumpur skandal; trofi Serie A kembali berdiri kokoh di museum Turin. | Orbit kamera 360 derajat mengitari kebangkitan lencana hitam-putih. | "Integritas Tanpa Kompromi" + "Jalan Kebangkitan". Brand AUDIRA. |
| Outro | 82–91 | "Ini AUDIRA... Berikutnya: Nottingham Forest dan keajaiban Brian Clough." | Berkas investigasi tertutup; kartu outro AUDIRA; teaser hutan Sherwood & Clough. | Pull-back presisi ke kartu outro. | `<AudiraOutro code="SPORTFACTS">` + teaser EP27 Nottingham Forest. |

## Catatan produksi
- Estetika VISUALINVESTIGATION bergaya intelijen forensik dengan palet cyan neon (#00E5FF) dan slate gelap (#121820).
""",

"EP27_NOTTINGHAM_FOREST_CLOUGH": """# Storyboard — EP27 Nottingham Forest & Brian Clough (PAPERWORLD)

Format 9:16 1080×1920 @ 60. Safe zone: atas 180 px, bawah 380 px. Kamera stop-motion lipatan kertas taktil (no slideshow), multi-plane (BG pohon hutan Sherwood & City Ground / midground Brian Clough sweater hijau & 2 trofi Eropa / foreground potongan koran kuno / HUD / subtitle karaoke).

| Beat | Dtk | VO (ringkas) | Visual | Kamera | HUD / Teks |
|---|---|---|---|---|---|
| Hook | 0–3 | "Dari divisi dua Inggris menuju puncak tertinggi Eropa dua kali beruntun... Ini AUDIRA." | Pohon kertas hutan Sherwood terbelah; dua trofi Si Kuping Besar emas raksasa muncul dari balik lipatan kertas pohon; sweater hijau ikonik Clough terangkat. | Dolly-in halus menembus ranting kertas ke dua trofi. | Kartu kecil "SEJARAH SEPAK BOLA #27". Teks "NOTTINGHAM FOREST". |
| Context | 4–17 | 1975 tim papan bawah divisi dua; duet ajaib Brian Clough & Peter Taylor. | Kliping koran 1975 melaporkan Forest di peringkat 13 kasta kedua; figur kertas Brian Clough dan Peter Taylor bergandengan menyusun taktik di tepi Sungai Trent. | Kran meluncur dari kliping koran ke tepi lapangan kertas. | Linimasa tipis "1975" (HUD hijau); label "Clough & Peter Taylor". |
| Main | 18–45 | Juara Inggris 1978; kalahkan Malmö di Munich 1979 lewat Trevor Francis. | Tangga promosi kertas dinaiki kilat: juara Divisi Dua 1977, juara Divisi Satu 1978; sundulan Trevor Francis (pemain 1 juta pounds pertama) memastikan Piala Champions 1979. | Kamera miring menaiki tangga juara lalu zoom ke sundulan Francis. | "Juara Liga 1978" → "Piala Champions Eropa 1979". |
| Explanation | 46–70 | Pertahankan gelar di Madrid 1980 tekuk Hamburg lewat tembakan John Robertson. | Final Madrid 1980: tembakan menyusur tanah John Robertson menembus gawang raksasa Jerman Hamburg; dua trofi Eropa berdiri berdampingan. | Tracking menyusuri lapangan kertas menuju dua piala bergengsi. | "Final Madrid 1980: Forest 1–0 Hamburg" (Back-to-Back Champions). |
| Visual Payoff | 65–81 | Rekor abadi: satu-satunya klub punya trofi UCL lebih banyak dari trofi liga! | Timbangan kertas berayun: sisi Eropa memuat 2 Piala Champions, sisi domestik 1 gelar liga; Forest tersenyum dalam keabadian sejarah. | Orbit 360 derajat mengitari timbangan trofi unik. | "2 Trofi Eropa > 1 Gelar Liga" (Rekor Abadi Dunia). Brand AUDIRA. |
| Outro | 82–91 | "Ini AUDIRA... Berikutnya: La Remontada 2017 keajaiban Barcelona atas Paris." | Lipatan koran City Ground menutup; kartu outro AUDIRA; teaser Camp Nou. | Pull-back taktil ke kartu outro. | `<AudiraOutro code="SPORTFACTS">` + teaser EP28 La Remontada. |

## Catatan produksi
- Estetika PAPERWORLD hangat dengan tekstur kertas koran lawas dan warna hijau hutan (#1B4D3E) & merah Forest (#DD0000).
""",

"EP28_LA_REMONTADA_BARCELONA_2017": """# Storyboard — EP28 La Remontada Barcelona vs PSG 2017 (TACTICBOARD)

Format 9:16 1080×1920 @ 60. Safe zone: atas 180 px, bawah 380 px. Kamera dinamis papan taktik digital bertekanan tinggi, multi-plane (BG megah Camp Nou malam hari / midground Neymar, Sergi Roberto & jam digital / foreground seismograf getaran bumi / HUD / subtitle karaoke).

| Beat | Dtk | VO (ringkas) | Visual | Kamera | HUD / Teks |
|---|---|---|---|---|---|
| Hook | 0–3 | "Butuh 3 gol dalam 7 menit terakhir... kebangkitan paling gila sepak bola modern. Ini AUDIRA." | Papan taktik digital Camp Nou menunjukkan jam menit 87:00; probabilitas lolos 0.001% menyala merah; atmosfer stadion tegang membeku. | Dolly-in dramatis menatap detik jam yang terus berdetik. | Kartu kecil "SEJARAH SEPAK BOLA #28". Teks "LA REMONTADA". |
| Context | 4–17 | 8 Maret 2017 Camp Nou; defisit 0–4 leg pertama di Paris belum pernah ada yang lolos. | Papan skor leg pertama Paris "PSG 4–0 BARCA"; 96.000 suporter Camp Nou membentangkan mosaik raksasa; misi kemustahilan dimulai. | Kran meluncur dari tribun Camp Nou ke titik tengah lapangan. | Linimasa tipis "8 Maret 2017" (HUD hijau); label "Defisit Agregat 0–4". |
| Main | 18–45 | Unggul 3–0; gol Cavani menit 62 membungkam stadion; wajib 3 gol tanpa balas. | Tiga gol awal menyalakan asa (Suarez, bunuh diri, Messi penalti); gol gledek Cavani menit 62 membungkam seisi stadion; Barcelona wajib cetak 3 gol lagi. | Kamera berguncang pelan merefleksikan kepanikan sebelum tenang kembali. | Skor "3–1 (Agregat 3–5)" · "Butuh 3 Gol Lagi". |
| Explanation | 46–70 | Menit 88 free-kick Neymar, menit 91 penalti, menit 95 sontekan Sergi Roberto 6–1. | Tiga kilatan halilintar emas: menit 88 tendangan bebas melengkung Neymar; menit 91 eksekusi penalti dingin; menit 94:39 sontekan terbang Sergi Roberto; ledakan histeria. | Rangkaian 3 push-in kilat pada tiap gol, berakhir di luncuran Sergi Roberto. | Counter menit "88' · 91' · 95'" → Skor "BARCELONA 6–1 PSG". |
| Visual Payoff | 65–81 | Gempa mikro seismograf kota Barcelona; keajaiban bagi mereka yang tak menyerah. | Grafik jarum seismograf kota Barcelona melompat liar merekam getaran gempa mikro perayaan suporter; Lionel Messi berdiri di atas pagar tribun. | Orbit 360 derajat mengitari grafik seismograf dan pesta Camp Nou. | "Getaran Seismograf Kota" + "Kemenangan Mustahil 6–1". Brand AUDIRA. |
| Outro | 82–91 | "Ini AUDIRA... Berikutnya: lahirnya cungkilan penalti Panenka 1976." | Gemuruh Camp Nou meredup; kartu outro AUDIRA; teaser titik putih penalti Panenka. | Pull-back cepat ke kartu outro. | `<AudiraOutro code="SPORTFACTS">` + teaser EP29 Penalti Panenka. |

## Catatan produksi
- Estetika TACTICBOARD elektrik dengan warna blaugrana (#004D98 / #A50044) dan grafik visual seismometer getaran tanah.
""",

"EP29_PENALTI_PANENKA_1976": """# Storyboard — EP29 Lahirnya Penalti Panenka 1976 (SKETCHFORGE)

Format 9:16 1080×1920 @ 60. Safe zone: atas 180 px, bawah 380 px. Kamera sketsa arang & pensil bergerak artistik (no slideshow), multi-plane (BG stadion Marakana Belgrade 1976 / midground Antonin Panenka & Sepp Maier / foreground goresan busur lambung bola / HUD / subtitle karaoke).

| Beat | Dtk | VO (ringkas) | Visual | Kamera | HUD / Teks |
|---|---|---|---|---|---|
| Hook | 0–3 | "Ancang-ancang tembakan geledek, diakhiri cungkilan lembut ke tengah gawang... Ini AUDIRA." | Goresan arang sketsa tangan membentuk bola di titik penalti; siluet kiper melompat ke sisi kiri sementara bola melayang pelan parabolik ke tengah gawang. | Dolly-in mengikuti garis busur lambung bola sketsa. | Kartu kecil "SEJARAH SEPAK BOLA #29". Teks "PENALTI PANENKA". |
| Context | 4–17 | 20 Juni 1976 Belgrade; final Piala Eropa Cekoslowakia vs Jerman Barat adu penalti. | Lembar sketsa arsitektur stadion Marakana Belgrade; skor 2–2 setelah babak tambahan; babak adu penalti pertama dalam sejarah final turnamen besar. | Kran turun menyusuri lembar sketsa menuju titik putih penalti. | Linimasa tipis "20 Juni 1976" (HUD hijau); label "Final Euro 1976 Belgrade". |
| Main | 18–45 | Uli Hoeness tembakan melambung; Antonin Panenka hadapi kiper terbaik Sepp Maier. | Sketsa arang tembakan Uli Hoeness melambung ke langit malam; Antonin Panenka berkumis tebal berjalan tenang; di gawang berdiri raksasa Sepp Maier. | Kamera miring menatap duel tatapan mata Panenka vs Maier. | "Uli Hoeness: Gagal" → "Antonin Panenka: Penentu Juara". |
| Explanation | 46–70 | Ancang-ancang lari kencang, Maier terkecoh, cungkilan dingin melayang ke gawang kosong. | Panenka berlari kencang seolah menembak keras; Maier menjatuhkan badan ke kiri; di detik terakhir kaki Panenka mencungkil lembut bola melayang di udara; gol! | Gerakan kamera melambat (slow-motion) saat bola melayang di udara. | "Kecohan Paling Dingin di Dunia" · "Cekoslowakia Juara Eropa". |
| Visual Payoff | 65–81 | Pele: 'Sosok jenius atau orang gila sejati'; teknik legendaris abadi selamanya. | Kata-kata Pele tergores indah di atas kanvas: "Orang gila atau jenius sejati"; teknik tendangan diabadikan dengan nama 'Panenka' di seluruh dunia. | Orbit 360 derajat mengitari bola melayang di atas garis gawang. | "Panenka: Jenius atau Gila?" + "Teknik Abadi Dunia". Brand AUDIRA. |
| Outro | 82–91 | "Ini AUDIRA... Berikutnya: tragedi Chapecoense 2016, air mata dan solidaritas." | Goresan pensil memudar lembut; kartu outro AUDIRA; teaser sayap pesawat hijau Chapecoense. | Pull-back artistik ke kartu outro. | `<AudiraOutro code="SPORTFACTS">` + teaser EP30 Tragedi Chapecoense. |

## Catatan produksi
- Estetika SKETCHFORGE monokrom artistik pensil grafit dengan aksen hijau zamrud (#00A859) pada momen bola mencungkil.
""",

"EP30_TRAGEDI_CHAPECOENSE_2016": """# Storyboard — EP30 Tragedi Chapecoense 2016 (MARBLEMUSEUM)

Format 9:16 1080×1920 @ 60. Safe zone: atas 180 px, bawah 380 px. Kamera marmer agung penuh kehormatan (no slideshow), multi-plane (BG lereng gunung Medellín temaram / midground monumen sayap hijau & 71 bintang / foreground lautan lilin suporter / HUD / subtitle karaoke).

| Beat | Dtk | VO (ringkas) | Visual | Kamera | HUD / Teks |
|---|---|---|---|---|---|
| Hook | 0–3 | "Mimpi terindah yang terhempas di lereng gunung... solidaritas kemanusiaan tertinggi. Ini AUDIRA." | Aula marmer temaram dengan pedestal sayap hijau Chapecoense; 71 bintang emas kecil melayang ke langit malam yang tenang dan damai. | Slow dolly-in menembus deretan lilin menuju pedestal sayap. | Kartu kecil "SEJARAH SEPAK BOLA #30". Teks "FORÇA CHAPE". |
| Context | 4–17 | November 2016; dongeng klub kecil Chapecoense melaju ke final Copa Sudamericana. | Peta perjalanan dongeng klub dari kasta terbawah Brasil melesat hingga final benua; lambang hijau putih Chapecoense bersinar terang. | Kran meluncur dari peta Brasil ke arah langit Kolombia. | Linimasa tipis "November 2016" (HUD hijau); label "Dongeng Menuju Final". |
| Main | 18–45 | Pesawat jatuh dekat Medellín; 71 korban jiwa; duka mendalam dunia. | Kabut putih menyelimuti lereng pegunungan Andes dekat Medellín; 71 plakat marmer nama korban berdiri dalam keheningan; bendera dunia setengah tiang. | Kamera melayang khidmat menyusuri deretan plakat nama korban. | "LaMia 2933 · 71 Jiwa Gugur" · "Duka Abadi Sepak Bola Dunia". |
| Explanation | 46–70 | Kebesaran hati Atletico Nacional: meminta trofi diserahkan penuh ke Chapecoense. | Klub lawan, Atletico Nacional Kolombia, mengajukan surat resmi dengan tulus; tangan persaudaraan menyerahkan piala Copa Sudamericana kepada Chapecoense. | Push-in lembut ke momen penyerahan simbolis trofi piala. | "Kebesaran Jiwa Atletico Nacional" · "Trofi Juara untuk Chapecoense". |
| Visual Payoff | 65–81 | Puluhan ribu suporter berbaju putih bernyanyi dengan lilin; nilai kemanusiaan mahkota tertinggi. | Stadion Atanasio Girardot dipadati 45.000 suporter berbaju putih menyalakan lilin dan menyanyikan himne penghormatan; piala bersinar di altar cinta. | Orbit kamera 360 derajat mengitari lautan lilin dan piala bercahaya. | "Kemanusiaan di Atas Segalanya" + "Juara Abadi di Hati". Brand AUDIRA. |
| Outro | 82–91 | "Ini AUDIRA, Sejarah Sepak Bola. Tamat serial sejarah sepak bola dunia." | Cahaya lilin berpendar hangat; kartu outro penutup serial agung AUDIRA. | Pull-back agung dan tenang ke kartu outro serial. | `<AudiraOutro code="SPORTFACTS">` + Penutup Resmi Serial. |

## Catatan produksi
- Estetika MARBLEMUSEUM bernuansa sakral dan penuh hormat dengan palet marmer putih, hijau zamrud Chapecoense (#007A3D), dan cahaya keemasan lilin.
"""
}

# --- SOCIAL CAPTIONS ---
social_captions = {
"EP21_KEAJAIBAN_BERN_1954": """# SOCIAL CAPTIONS: Keajaiban Bern 1954 (Das Wunder von Bern)

Seri AUDIRA · SEJARAH SEPAK BOLA EP21, channel AUDIRA Sport Facts (@AudiraSportFacts). Created by Agus Dwi R. Thumbnail: `style/cover-topic.png`. Video: `FINAL_VIDEO.mp4`.

## TikTok

**Hook:** Tertinggal dua gol dalam 8 menit di bawah badai hujan... inilah titik balik kebangkitan sebuah bangsa!

**Cover Text:** KEAJAIBAN BERN 1954

**Caption:** 4 Juli 1954 di Bern, Swiss. Jerman Barat menghadapi tim terkuat di bumi, Hungaria, yang memegang rekor 31 laga tak terkalahkan! Tertinggal 0–2 secara kilat oleh Puskas dan Czibor, Jerman bangkit berkat sepatu berpaku sekrup revolusioner buatan Adi Dassler (pendiri Adidas) yang mencengkeram lapangan lumpur. Puncaknya, tembakan kaki kiri Helmut Rahn di menit 84 mengunci kemenangan 3–2! Kemenangan ini membangkitkan martabat dan ekonomi Jerman pasca-Perang Dunia II!

**Pinned Comment:** Sejarah Sepak Bola #21 · AUDIRA Sport Facts (@AudiraSportFacts). Sumber: Arsip FIFA World Cup 1954 & Museum Sepak Bola Jerman. Momen ini dikenal sebagai 'Das Wunder von Bern'. Episode sebelumnya: EP20 Celtic Lisbon Lions. Berikutnya: EP22 Dongeng Leicester City 2016.

**Hashtags:** #PialaDunia #KeajaibanBern #Jerman1954 #Adidas #SejarahSepakBola #AUDIRA

## Instagram Reels

**Cover Headline:** KETIKA SEPATU MENGUBAH TAKDIR DUNIA

**5-Point Value Breakdown:**
1. Laga Paling Mustahil: Hungaria datang dengan rekor 31 pertandingan internasional tak terkalahkan.
2. Badai Wankdorf: Lapangan berubah jadi kubangan lumpur akibat hujan lebat di Bern.
3. Inovasi Adi Dassler: Sepatu berpul sekrup Adidas pertama kali diuji coba di level dunia.
4. Tembakan Emas Helmut Rahn: Gol penentu di menit 84 membalikkan skor menjadi 3–2.
5. Simbol Kebangkitan Bangsa: Mengawali era mukjizat ekonomi Jerman (Wirtschaftswunder).

## YouTube Shorts

**Judul Utama:** Keajaiban Bern 1954: Bagaimana Sepatu Adidas Mengalahkan Tim Terkuat di Bumi?
**Deskripsi:** Bagaimana Jerman Barat yang tertinggal 0–2 dari tim perkasa Hungaria asuhan Ferenc Puskas mampu membalikkan takdir di final Piala Dunia 1954? Simak kisah epik inovasi pul sekrup Adi Dassler dan tembakan legendaris Helmut Rahn di episode #21 serial Sejarah Sepak Bola AUDIRA!
**Tags:** Keajaiban Bern, Piala Dunia 1954, Helmut Rahn, Ferenc Puskas, Adi Dassler, Adidas, Jerman Barat, Sejarah Sepak Bola, AUDIRA

## X (Twitter)

4 Juli 1954, Jerman Barat tertinggal 0–2 dalam 8 menit dari Hungaria yang tak terkalahkan 31 laga. Di bawah hujan deras Bern, pul sekrup Adi Dassler dan kaki kiri Helmut Rahn mengubah takdir sebuah bangsa! #DasWundervonBern #SejarahSepakBola #AUDIRA

## Facebook & LinkedIn

Kemenangan Jerman Barat di Final Piala Dunia 1954 bukan sekadar trofi sepak bola di atas lapangan hijau. Bagi para sejarawan dan sosiolog, 'Das Wunder von Bern' adalah kelahiran kembali Republik Federal Jerman dari abu kehancuran Perang Dunia II. Simak analisis mendalam peristiwa olahraga paling berpengaruh di abad ke-20 ini hanya di serial AUDIRA Sejarah Sepak Bola.
""",

"EP22_DONGENG_LEICESTER_CITY_2016": """# SOCIAL CAPTIONS: Dongeng Leicester City 2016 — Peluang 5000:1

Seri AUDIRA · SEJARAH SEPAK BOLA EP22, channel AUDIRA Sport Facts (@AudiraSportFacts). Created by Agus Dwi R. Thumbnail: `style/cover-topic.png`. Video: `FINAL_VIDEO.mp4`.

## TikTok

**Hook:** Peluang 5000 banding 1 di bursa taruhan... inilah dongeng kemustahilan terbesar sepak bola modern!

**Cover Text:** DONGENG 5000:1

**Caption:** Di awal musim 2015/16, peluang Leicester City juara Liga Inggris dihargai 5.000 banding 1 — sama mustahilnya dengan menemukan monster Loch Ness! Namun di bawah Claudio Ranieri, Jamie Vardy mencetak rekor gol dalam 11 laga beruntun, Riyad Mahrez menyihir pertahanan lawan, dan N'Golo Kante menjelajahi seluruh rumput lapangan! The Foxes resmi mengunci gelar juara Premier League dengan keunggulan 10 poin bersih!

**Pinned Comment:** Sejarah Sepak Bola #22 · AUDIRA Sport Facts (@AudiraSportFacts). Sumber: Premier League Archives & BBC Sport. Bukti nyata bahwa kekompakan tim mampu meruntuhkan hegemoni modal triliunan rupiah. Episode sebelumnya: EP21 Keajaiban Bern. Berikutnya: EP23 The Invincibles Arsenal.

**Hashtags:** #LeicesterCity #JamieVardy #PremierLeague #Ranieri #SejarahSepakBola #AUDIRA

## Instagram Reels

**Cover Headline:** DARI TIM GUREM JADI JUARA INGGRIS

**5-Point Value Breakdown:**
1. Peluang 5.000 banding 1: Taruhan paling berisiko yang justru dibayar lunas oleh sejarah.
2. Rekor Fenomenal Jamie Vardy: Dari liga amatir non-liga hingga mencetak gol dalam 11 laga beruntun.
3. Segitiga Magis: Kolaborasi brilian Ranieri, sihir gocekan Mahrez, dan filter tanpa lelah Kante.
4. Dominasi Nyata: Mengunci gelar juara dengan selisih 10 poin dari peringkat kedua.
5. Kemenangan Romantisme: Menumbangkan oligarki kekayaan klub raksasa elit Eropa.

## YouTube Shorts

**Judul Utama:** Dongeng Leicester City 2016: Juara Liga Inggris Berpeluang 5.000 Banding 1
**Deskripsi:** Bagaimana tim yang diprediksi degradasi justru menjuarai liga terketat di dunia? Saksikan kisah keajaiban Jamie Vardy, Claudio Ranieri, dan Leicester City saat mengguncang panggung dunia di episode #22 serial Sejarah Sepak Bola AUDIRA!
**Tags:** Leicester City, Jamie Vardy, Claudio Ranieri, Riyad Mahrez, Ngolo Kante, Premier League 2016, Sejarah Sepak Bola, AUDIRA

## X (Twitter)

5.000 banding 1 di bursa taruhan. Leicester City membuktikan bahwa tekad baja, kekompakan tim, dan strategi serangan balik cepat mampu mengalahkan hegemoni modal triliunan rupiah! #LeicesterCity #Vardy #AUDIRA

## Facebook & LinkedIn

Dalam era sepak bola modern yang didikte oleh neraca keuangan miliaran euro, gelar juara Leicester City di musim 2015/2016 adalah pengingat paling indah: bahwa di atas lapangan rumput 105x68 meter, kerja keras dan kebersamaan taktik masih bisa mengalahkan segalanya. Simak kajian lengkapnya di serial AUDIRA Sejarah Sepak Bola.
""",

"EP23_INVINCIBLES_ARSENAL_2004": """# SOCIAL CAPTIONS: The Invincibles Arsenal 2003–2004 — Standar Kesempurnaan

Seri AUDIRA · SEJARAH SEPAK BOLA EP23, channel AUDIRA Sport Facts (@AudiraSportFacts). Created by Agus Dwi R. Thumbnail: `style/cover-topic.png`. Video: `FINAL_VIDEO.mp4`.

## TikTok

**Hook:** 38 pertandingan liga tanpa satu pun kekalahan! Inilah standar kesempurnaan tertinggi sepak bola Inggris!

**Cover Text:** THE INVINCIBLES

**Caption:** Di musim 2003/2004, Arsene Wenger memimpin Arsenal mengukir rekor abadi di Stadion Highbury: 26 menang, 12 imbang, dan 0 kalah dalam 38 pertandingan Premier League! Ditenagai ketajaman Thierry Henry (30 gol), keanggunan Dennis Bergkamp, dan ketangguhan kapten Patrick Vieira, The Gunners diganjar satu-satunya trofi Premier League berlapis emas murni dalam sejarah! Rekor tak terkalahkan mereka bahkan berlanjut hingga 49 laga!

**Pinned Comment:** Sejarah Sepak Bola #23 · AUDIRA Sport Facts (@AudiraSportFacts). Sumber: Premier League Official & Arsenal FC Archives. Belum ada satu pun klub Inggris yang mampu mengulangi rekor emas ini. Episode sebelumnya: EP22 Leicester City. Berikutnya: EP24 Tragedi Heysel 1985.

**Hashtags:** #Arsenal #TheInvincibles #ThierryHenry #ArseneWenger #SejarahSepakBola #AUDIRA

## Instagram Reels

**Cover Headline:** 38 LAGA, 0 KALAH: KEAJAIBAN ARSENAL 2004

**5-Point Value Breakdown:**
1. Kesempurnaan Mutlak: Melewati 38 laga Premier League tanpa pernah kalah sekali pun.
2. Sang Maestro Thierry Henry: Memborong 30 gol liga dan meraih Sepatu Emas Eropa.
3. Filosofi Wengerball: Sepak bola menyerang cepat berkecepatan tinggi yang memesona dunia.
4. Trofi Emas Abadi: Satu-satunya replika trofi Premier League berlapis emas murni 24 karat.
5. Rekor 49 Laga: Rentetan tak terkalahkan berlanjut hingga musim berikutnya.

## YouTube Shorts

**Judul Utama:** The Invincibles Arsenal 2004: Musim Sempurna Tanpa Kalah dan Trofi Emas Murni
**Deskripsi:** Bagaimana Arsene Wenger, Thierry Henry, dan Arsenal merajai Inggris tanpa satu pun kekalahan sepanjang musim? Saksikan sejarah di balik trofi emas legendaris The Invincibles di episode #23 serial Sejarah Sepak Bola AUDIRA!
**Tags:** Arsenal, The Invincibles, Thierry Henry, Arsene Wenger, Dennis Bergkamp, Patrick Vieira, Premier League, Highbury, AUDIRA

## X (Twitter)

38 Laga. 26 Menang. 12 Imbang. 0 Kalah. Trofi emas murni Premier League menjadi saksi abadi keagungan The Invincibles Arsenal 2004 yang belum tertandingi hingga hari ini! #Arsenal #TheInvincibles #AUDIRA

## Facebook & LinkedIn

Ketika Arsene Wenger memprediksi bahwa timnya bisa melewati satu musim penuh tanpa terkalahkan, pers Inggris mencemoohnya sebagai bualan. Namun pada 15 Mei 2004, sejarah membuktikan kejeniusan sang manajer Prancis. Simak ulasan mendalam mengenai taktik revolusioner The Invincibles hanya di serial AUDIRA Sejarah Sepak Bola.
""",

"EP24_TRAGEDI_HEYSEL_1985": """# SOCIAL CAPTIONS: Tragedi Heysel 1985 & Reformasi Keamanan Stadion

Seri AUDIRA · SEJARAH SEPAK BOLA EP24, channel AUDIRA Sport Facts (@AudiraSportFacts). Created by Agus Dwi R. Thumbnail: `style/cover-topic.png`. Video: `FINAL_VIDEO.mp4`.

## TikTok

**Hook:** 39 nyawa melayang di balik tembok stadion yang rapuh... titik balik paling kelam sepak bola dunia!

**Cover Text:** TRAGEDI HEYSEL 1985

**Caption:** 29 Mei 1985 di Brussels, Belgia. Final Piala Champions antara Liverpool dan Juventus berubah menjadi neraka ketika tembok pembatas sektor Z runtuh di bawah tekanan kerusuhan penonton. Tiga puluh sembilan suporter tewas dan ratusan luka-luka. UEFA menjatuhkan sanksi terberat dalam sejarah: seluruh klub Inggris dilarang tampil di kompetisi Eropa selama 5 tahun! Tragedi memilukan ini memaksa perombakan total standar keamanan stadion di seluruh dunia!

**Pinned Comment:** Sejarah Sepak Bola #24 · AUDIRA Sport Facts (@AudiraSportFacts). Sumber: UEFA Archives & Laporan Resmi Investigasi Kehakiman Belgia. Penghormatan tulus bagi 39 jiwa yang berpulang. Episode sebelumnya: EP23 The Invincibles. Berikutnya: EP25 Perang Sepak Bola 1969.

**Hashtags:** #TragediHeysel #Heysel1985 #Juventus #Liverpool #SejarahSepakBola #AUDIRA

## Instagram Reels

**Cover Headline:** MALAM KELAM YANG MENGUBAH STADION DUNIA

**5-Point Value Breakdown:**
1. Final Berdarah Brussels: Kondisi stadion Heysel yang usang dan tidak layak untuk partai puncak.
2. Runtuhnya Sektor Z: Tembok pembatas roboh menewaskan 39 pendukung sepak bola.
3. Laga dalam Keheningan: Pertandingan tetap dimainkan demi mencegah kerusuhan meluas ke luar stadion.
4. Isolasi 5 Tahun: Klub-klub Inggris dihukum dilarang bertanding di Eropa dari 1985 hingga 1990.
5. Kelahiran Stadion Modern: Penghapusan pagar pembatas dan standarisasi stadion serba kursi (*all-seater*).

## YouTube Shorts

**Judul Utama:** Tragedi Heysel 1985: Malam Kelam yang Mengubah Keamanan Stadion Selamanya
**Deskripsi:** Apa yang sebenarnya terjadi di final Piala Champions 1985 di Brussels? Simak kronologi Tragedi Heysel, sanksi 5 tahun klub Inggris, dan lahirnya era baru keamanan stadion modern di episode #24 serial Sejarah Sepak Bola AUDIRA!
**Tags:** Tragedi Heysel, Heysel 1985, Juventus, Liverpool, UEFA, Keamanan Stadion, Sejarah Sepak Bola, AUDIRA

## X (Twitter)

29 Mei 1985 di Brussels. 39 jiwa gugur di balik runtuhnya tembok Heysel. Tragedi memilukan yang menghentikan arogansi hooliganisme dan merombak sistem keamanan stadion sepak bola selamanya. #Heysel1985 #AUDIRA

## Facebook & LinkedIn

Di atas rivalitas dan perebutan piala, keselamatan manusia adalah garis batas yang tak boleh dilanggar. Tragedi Stadion Heysel 1985 menjadi alarm paling keras dalam sejarah olahraga modern yang mendorong lahirnya regulasi keamanan dan infrastruktur stadion modern seperti yang kita nikmati hari ini. Simak catatan sejarahnya di serial AUDIRA Sejarah Sepak Bola.
""",

"EP25_PERANG_SEPAK_BOLA_1969": """# SOCIAL CAPTIONS: Perang Sepak Bola 1969 — Ketika Pertandingan Menyulut Konflik Militer

Seri AUDIRA · SEJARAH SEPAK BOLA EP25, channel AUDIRA Sport Facts (@AudiraSportFacts). Created by Agus Dwi R. Thumbnail: `style/cover-topic.png`. Video: `FINAL_VIDEO.mp4`.

## TikTok

**Hook:** Pertandingan sepak bola yang menyulut perang militer dua negara... inilah Perang 100 Jam 1969!

**Cover Text:** PERANG SEPAK BOLA 1969

**Caption:** Juni 1969, El Salvador dan Honduras bertarung sengit dalam babak kualifikasi Piala Dunia 1970. Di tengah ketegangan krisis imigran dan sengketa perbatasan, rivalitas di atas lapangan memuncak pada laga penentu di Stadion Azteca yang dimenangi El Salvador 3–2. Hanya berselang beberapa minggu, pada 14 Juli 1969, jet tempur dan artileri militer diluncurkan! Perang 100 Jam menewaskan ribuan orang sebelum akhirnya dihentikan oleh gencatan senjata OAS!

**Pinned Comment:** Sejarah Sepak Bola #25 · AUDIRA Sport Facts (@AudiraSportFacts). Sumber: Buku Ryszard Kapuściński 'The Soccer War' & Arsip Sejarah OAS. Sepak bola menjadi pemantik bagi bom waktu geopolitik yang telah lama tersimpan. Episode sebelumnya: EP24 Tragedi Heysel. Berikutnya: EP26 Skandal Calciopoli.

**Hashtags:** #PerangSepakBola #FootballWar #PialaDunia1970 #ElSalvador #Honduras #AUDIRA

## Instagram Reels

**Cover Headline:** KETIKA SEPAK BOLA BERUBAH JADI PERANG NYATA

**5-Point Value Breakdown:**
1. Kualifikasi Piala Dunia Panas: Laga hidup mati penentuan tiket menuju Meksiko 1970.
2. Bom Waktu Agraria: Perseteruan hak tanah dan pengusiran ratusan ribu imigran Salvador di Honduras.
3. Tiga Partai Berdarah: Bentrokan antarsuporter memuncak di laga play-off netral Mexico City.
4. Perang 100 Jam: Serangan udara militer meletus pada 14 Juli 1969 menelan ribuan korban.
5. Diplomasi Internasional: Intervensi Organisasi Negara-negara Amerika (OAS) menghentikan konflik.

## YouTube Shorts

**Judul Utama:** Perang Sepak Bola 1969: Laga Kualifikasi Piala Dunia yang Menelan 3.000 Nyawa
**Deskripsi:** Benarkah sebuah pertandingan bola bisa menyulut perang bersenjata antardua negara? Simak sejarah nyata 'The Football War' antara El Salvador dan Honduras di episode #25 serial Sejarah Sepak Bola AUDIRA!
**Tags:** Perang Sepak Bola, Football War 1969, El Salvador, Honduras, Ryszard Kapuscinski, Kualifikasi Piala Dunia 1970, AUDIRA

## X (Twitter)

14 Juli 1969, bom dan jet tempur meletus setelah laga penentuan El Salvador vs Honduras di Mexico City. Perang Sepak Bola 100 Jam membuktikan berbahayanya nasionalisme sempit di panggung olahraga! #FootballWar #AUDIRA

## Facebook & LinkedIn

Jurnalis perang legendaris Polandia Ryszard Kapuściński mencatat bahwa sepak bola tidak menciptakan perang, namun menjadi pemicu emosi massa yang meledakkan dendam sosial politik yang telah terpendam puluhan tahun. Simak ulasan geopolitik dan sejarah olahraga ini hanya di serial AUDIRA Sejarah Sepak Bola.
""",

"EP26_SKANDAL_CALCIOPOLI_2006": """# SOCIAL CAPTIONS: Skandal Calciopoli 2006 — Keruntuhan Dinasti Juventus

Seri AUDIRA · SEJARAH SEPAK BOLA EP26, channel AUDIRA Sport Facts (@AudiraSportFacts). Created by Agus Dwi R. Thumbnail: `style/cover-topic.png`. Video: `FINAL_VIDEO.mp4`.

## TikTok

**Hook:** Rekaman telepon rahasia yang meruntuhkan dinasti klub terkuat di Italia... inilah skandal Calciopoli!

**Cover Text:** SKANDAL CALCIOPOLI 2006

**Caption:** Mei 2006, transkrip sadapan telepon jaksa penuntut Napoli membongkar jaringan manajer umum Juventus, Luciano Moggi, yang memanipulasi pemilihan wasit Serie A! Hukuman terberat dijatuhkan: Juventus didegradasi paksa ke Serie B, dua gelar Scudetto dicabut, dan pengurangan poin besar-besaran! Ironisnya, di musim panas yang sama, skuad timnas Italia yang dipimpin pilar-pilar Juventus justru berhasil menjuarai Piala Dunia 2006 di Berlin!

**Pinned Comment:** Sejarah Sepak Bola #26 · AUDIRA Sport Facts (@AudiraSportFacts). Sumber: Putusan Sidang FIGC & Laporan Investigasi Kejaksaan Federal Italia. Del Piero, Buffon, dan Nedved memilih setia bertahan di Serie B. Episode sebelumnya: EP25 Perang Sepak Bola. Berikutnya: EP27 Nottingham Forest.

**Hashtags:** #Calciopoli #Juventus #SerieB #Buffon #DelPiero #SejarahSepakBola #AUDIRA

## Instagram Reels

**Cover Headline:** REKAMAN TELEPON YANG MENJATUHKAN RAKSASA ITALIA

**5-Point Value Breakdown:**
1. Sadapan Telepon Jaksa: Terbongkarnya jaringan komunikasi rahasia penetapan jadwal wasit.
2. Vonis Bersejarah: Juventus dihukum degradasi ke Serie B pertama kali dalam 108 tahun sejarahnya.
3. Scudetto Dicabut: Gelar juara liga musim 2004/05 dibatalkan dan 2005/06 dialihkan ke Inter Milan.
4. Kesetiaan Para Legenda: Buffon, Del Piero, Nedved, dan Camoranesi menolak hengkang dari Serie B.
5. Paradoks Berlin: Italia menjuarai Piala Dunia 2006 di tengah guncangan skandal domestik terbesar.

## YouTube Shorts

**Judul Utama:** Skandal Calciopoli 2006: Mengapa Juventus Didegradasi Paksa ke Serie B?
**Deskripsi:** Bagaimana rekaman sadapan telepon Luciano Moggi mengguncang sepak bola Italia dan menghukum sang Nyonya Tua? Saksikan kronologi Calciopoli dan kesetiaan legenda Del Piero di episode #26 serial Sejarah Sepak Bola AUDIRA!
**Tags:** Calciopoli, Juventus, Serie B, Luciano Moggi, Alessandro Del Piero, Gianluigi Buffon, Scudetto, Italia 2006, AUDIRA

## X (Twitter)

Mei 2006, skandal Calciopoli menjatuhkan Juventus ke Serie B dan mencabut 2 gelar Scudetto. Namun dari kawah degradasi itulah lahir legenda kesetiaan abadi Del Piero dan Buffon! #Calciopoli #Juventus #AUDIRA

## Facebook & LinkedIn

Calciopoli adalah gempa bumi hukum olahraga terbesar dalam sejarah modern Eropa. Bagaimana institusi peradilan olahraga membongkar relasi kuasa informal dan menetapkan standar integritas wasit baru di era sepak bola komersial? Simak telaah hukum dan sejarahnya di serial AUDIRA Sejarah Sepak Bola.
""",

"EP27_NOTTINGHAM_FOREST_CLOUGH": """# SOCIAL CAPTIONS: Nottingham Forest & Brian Clough — Dongeng Dua Piala Champions Eropa

Seri AUDIRA · SEJARAH SEPAK BOLA EP27, channel AUDIRA Sport Facts (@AudiraSportFacts). Created by Agus Dwi R. Thumbnail: `style/cover-topic.png`. Video: `FINAL_VIDEO.mp4`.

## TikTok

**Hook:** Dari divisi dua Inggris menuju puncak tertinggi Eropa dua tahun berturut-turut! Inilah mukjizat Brian Clough!

**Cover Text:** MUKJIZAT NOTTINGHAM FOREST

**Caption:** Tahun 1975, Nottingham Forest hanyalah tim semenjana di peringkat 13 kasta kedua Liga Inggris. Namun di tangan manajer bermulut pedas Brian Clough dan Peter Taylor, mukjizat teraneh sepak bola tercipta! Promosi tahun 1977, langsung juara Liga Inggris 1978, lalu menjuarai Piala Champions Eropa tahun 1979 dan mempertahankannya di 1980! Forest mencatat rekor abadi: satu-satunya klub yang punya trofi Liga Champions lebih banyak daripada gelar liga domestiknya!

**Pinned Comment:** Sejarah Sepak Bola #27 · AUDIRA Sport Facts (@AudiraSportFacts). Sumber: Arsip UEFA & Nottingham Forest FC. Rekor 2 trofi Eropa berbanding 1 trofi liga domestik belum pernah disamai klub mana pun. Episode sebelumnya: EP26 Calciopoli. Berikutnya: EP28 La Remontada Barcelona.

**Hashtags:** #NottinghamForest #BrianClough #PialaChampions #UCL #SejarahSepakBola #AUDIRA

## Instagram Reels

**Cover Headline:** DARI KASTA KEDUA JADI RAJA EROPA BERUNTUN

**5-Point Value Breakdown:**
1. Datang dari Dasar: Brian Clough mengambil alih tim yang terpuruk di kasta kedua pada 1975.
2. Lompatan Tiga Tahun: Promosi 1977, juara kasta tertinggi Inggris 1978, juara Eropa 1979.
3. Pembelian 1 Juta Pounds Pertama: Trevor Francis mencetak gol sundulan kemenangan di final Munich 1979.
4. Back-to-Back Champions: Mempertahankan trofi Eropa di Madrid 1980 menumbangkan Hamburg 1–0.
5. Rekor Abadi Dunia: Mengoleksi 2 trofi Piala Champions Eropa berbanding 1 gelar liga domestik.

## YouTube Shorts

**Judul Utama:** Nottingham Forest & Brian Clough: Punya Trofi Liga Champions Lebih Banyak dari Gelar Liga!
**Deskripsi:** Bagaimana klub kecil di tepi Sungai Trent mampu merajai benua Eropa dua tahun berturut-turut di bawah komando sang genius Brian Clough? Saksikan kisahnya di episode #27 serial Sejarah Sepak Bola AUDIRA!
**Tags:** Nottingham Forest, Brian Clough, Peter Taylor, Trevor Francis, Piala Champions, Liga Champions, Sejarah Sepak Bola, AUDIRA

## X (Twitter)

1977 promosi ke kasta tertinggi. 1978 juara Inggris. 1979 & 1980 juara Eropa beruntun! Brian Clough dan Nottingham Forest mencatat sejarah paling ajaib dalam sejarah sepak bola Britania! #NottinghamForest #BrianClough #AUDIRA

## Facebook & LinkedIn

Dalam kurun waktu lima tahun, duet Brian Clough dan Peter Taylor membuktikan bahwa manajemen psikologi pemain dan pembacaan taktik yang presisi sanggup mengubah kumpulan pemain biasa menjadi mesin juara benua Eropa. Simak salah satu dongeng paling memikat dalam sejarah olahraga hanya di serial AUDIRA Sejarah Sepak Bola.
""",

"EP28_LA_REMONTADA_BARCELONA_2017": """# SOCIAL CAPTIONS: La Remontada Barcelona vs PSG 2017 — Kebangkitan Paling Dramatis

Seri AUDIRA · SEJARAH SEPAK BOLA EP28, channel AUDIRA Sport Facts (@AudiraSportFacts). Created by Agus Dwi R. Thumbnail: `style/cover-topic.png`. Video: `FINAL_VIDEO.mp4`.

## TikTok

**Hook:** Butuh 3 gol dalam 7 menit terakhir... inilah kebangkitan paling gila sepanjang sejarah sepak bola modern!

**Cover Text:** LA REMONTADA 6-1

**Caption:** 8 Maret 2017 di Camp Nou. Barcelona menghadapi kemustahilan mutlak setelah tertinggal agregat 0–4 dari PSG. Asa sempat redup ketika Cavani mencetak gol di menit 62, memaksa Barca harus mencetak 3 gol tambahan tanpa balas. Hingga menit 87, peluang lolos masih 0%. Lalu keajaiban meletus: tendangan bebas spektakuler Neymar menit 88, penalti dingin menit 91, dan sontekan Sergi Roberto di detik akhir menit 95 memastikan kemenangan 6–1! Gemuruh stadion bahkan memicu getaran gempa mikro seismograf kota!

**Pinned Comment:** Sejarah Sepak Bola #28 · AUDIRA Sport Facts (@AudiraSportFacts). Sumber: UEFA Champions League Archives & Institut Ilmu Kebumian Jaume Almera Barcelona. Kemenangan dengan defisit terbesar yang pernah dibalikkan di UCL. Episode sebelumnya: EP27 Nottingham Forest. Berikutnya: EP29 Penalti Panenka.

**Hashtags:** #LaRemontada #Barcelona #Neymar #SergiRoberto #UCL #CampNou #AUDIRA

## Instagram Reels

**Cover Headline:** KETIKA CAMP NOU MEMICU GEMPA BUMI MIKRO

**5-Point Value Breakdown:**
1. Defisit Mustahil 0–4: Belum pernah ada tim yang mampu lolos setelah kalah 0–4 di leg pertama.
2. Pukulan Telak Cavani: Gol menit 62 membuat Barcelona wajib mencetak 3 gol lagi dalam waktu tersisa.
3. Masterclass Neymar: Mencetak 2 gol dan 1 assist penentu dalam kurun waktu 7 menit krusial.
4. Sentuhan Takdir Sergi Roberto: Menit 94:39 menyambar umpan lambung meloloskan Barcelona 6–1.
5. Seismograf Kota Bergetar: Seismometer kota mencatat getaran setara gempa bumi mikro akibat lompatan 96.000 suporter.

## YouTube Shorts

**Judul Utama:** La Remontada 2017: 3 Gol dalam 7 Menit Barcelona Mengguncang Seismograf Kota!
**Deskripsi:** Bagaimana Barcelona membalikkan agregat 0–4 menjadi kemenangan 6–1 atas PSG di detik terakhir babak tambahan? Saksikan momen paling dramatis dalam sejarah Liga Champions di episode #28 serial Sejarah Sepak Bola AUDIRA!
**Tags:** La Remontada, Barcelona vs PSG, Neymar, Sergi Roberto, Lionel Messi, Camp Nou, Liga Champions 2017, AUDIRA

## X (Twitter)

Menit 87: Barcelona butuh 3 gol lagi. Menit 88: Neymar. Menit 91: Neymar. Menit 95: Sergi Roberto! La Remontada 6–1 membuktikan bahwa keajaiban sejati selalu ada bagi mereka yang menolak menyerah! #LaRemontada #Barca #AUDIRA

## Facebook & LinkedIn

Dalam teori probabilitas sepak bola analitis modern, peluang Barcelona lolos di menit 87 berada pada angka mendekati nol koma nol persen. Namun malam 8 Maret 2017 di Camp Nou menjadi monumen abadi mengapa manusia jatuh cinta pada sepak bola: karena drama kemanusiaan tak pernah bisa dihitung sekadar oleh algoritma. Simak kajiannya di serial AUDIRA Sejarah Sepak Bola.
""",

"EP29_PENALTI_PANENKA_1976": """# SOCIAL CAPTIONS: Lahirnya Penalti Panenka 1976 — Cungkilan Berani Antonín Panenka

Seri AUDIRA · SEJARAH SEPAK BOLA EP29, channel AUDIRA Sport Facts (@AudiraSportFacts). Created by Agus Dwi R. Thumbnail: `style/cover-topic.png`. Video: `FINAL_VIDEO.mp4`.

## TikTok

**Hook:** Ancang-ancang lari kencang, diakhiri cungkilan lembut ke tengah gawang... aksi paling berani dalam sejarah final!

**Cover Text:** PENALTI PANENKA 1976

**Caption:** 20 Juni 1976 di Belgrade. Final Piala Eropa antara Cekoslowakia dan Jerman Barat harus ditentukan lewat adu penalti untuk pertama kalinya. Setelah sepakan Uli Hoeness melambung, Antonin Panenka maju sebagai penendang penentu. Menghadapi Sepp Maier, kiper terbaik dunia, Panenka berpura-pura menembak keras lalu mencungkil bola pelan melayang santai ke tengah gawang kosong! Pele menyebutnya: 'Orang gila atau jenius sejati!' Teknik ini abadi dengan nama Penalti Panenka!

**Pinned Comment:** Sejarah Sepak Bola #29 · AUDIRA Sport Facts (@AudiraSportFacts). Sumber: Arsip UEFA Euro 1976 & Wawancara Resmi Antonín Panenka. Dicontoh oleh Zidane, Pirlo, hingga Messi di partai-partai krusial dunia. Episode sebelumnya: EP28 La Remontada. Berikutnya: EP30 Tragedi Chapecoense.

**Hashtags:** #Panenka #PenaltiPanenka #Euro1976 #SeppMaier #SejarahSepakBola #AUDIRA

## Instagram Reels

**Cover Headline:** KECOHAN PALING KURANG AJAR DALAM SEJARAH FINAL

**5-Point Value Breakdown:**
1. Final Bersejarah Belgrade: Adu penalti pertama yang menentukan mahkota juara Euro.
2. Kegagalan Uli Hoeness: Penyerang Jerman Barat melepaskan tendangan yang melesat ke angkasa.
3. Ketenangan Tingkat Dewa: Antonin Panenka telah melatih teknik cungkilan ini berbulan-bulan di Praha.
4. Sepp Maier Tersungkur: Kiper legendaris Bayern Munich melompat ke kiri sementara bola melayang pelan ke tengah.
5. Mahakarya Abadi: Pele memuji eksekusinya sebagai bukti keberanian jenius yang tak tertandingi.

## YouTube Shorts

**Judul Utama:** Lahirnya Penalti Panenka 1976: Cungkilan Dingin Antonín Panenka Mengelabui Sepp Maier
**Deskripsi:** Bagaimana Antonin Panenka berani mempertaruhkan gelar juara Piala Eropa dengan mencungkil bola pelan ke gawang kiper terbaik dunia? Simak sejarah lahirnya teknik tendangan paling legendaris di episode #29 serial Sejarah Sepak Bola AUDIRA!
**Tags:** Penalti Panenka, Antonin Panenka, Euro 1976, Sepp Maier, Cekoslowakia, Adu Penalti, Sejarah Sepak Bola, AUDIRA

## X (Twitter)

Ancang-ancang kencang menipu kiper terbaik dunia, diakhiri cungkilan pelan ke tengah gawang kosong. 20 Juni 1976, Antonin Panenka tidak hanya membawa Cekoslowakia juara Eropa, tetapi menciptakan seni baru sepak bola! #Panenka #AUDIRA

## Facebook & LinkedIn

Dibutuhkan tingkat keyakinan psikologis dan penguasaan teknik yang luar biasa untuk mengeksekusi cungkilan penalti pelan di hadapan puluhan ribu penonton dalam partai final turnamen besar. Bagaimana Antonin Panenka merevolusi seni tendangan penalti dari sebuah eksperimen latihan klub menjadi warisan budaya global? Simak ulasannya di serial AUDIRA Sejarah Sepak Bola.
""",

"EP30_TRAGEDI_CHAPECOENSE_2016": """# SOCIAL CAPTIONS: Tragedi Chapecoense 2016 — Air Mata dan Mahkota Kemanusiaan

Seri AUDIRA · SEJARAH SEPAK BOLA EP30, channel AUDIRA Sport Facts (@AudiraSportFacts). Created by Agus Dwi R. Thumbnail: `style/cover-topic.png`. Video: `FINAL_VIDEO.mp4`.

## TikTok

**Hook:** Mimpi terindah yang terhempas di lereng gunung... solidaritas kemanusiaan tertinggi dalam sejarah lapangan hijau!

**Cover Text:** FORÇA CHAPE 2016

**Caption:** November 2016, klub kecil Brasil Chapecoense mengukir dongeng ajaib melaju ke final Copa Sudamericana. Namun pesawat yang membawa skuad kehabisan bahan bakar dan jatuh di pegunungan dekat Medellin, Kolombia, menewaskan 71 orang termasuk 19 pemain. Di tengah duka, lawan mereka, Atletico Nacional, menunjukkan kebesaran hati luar biasa: meminta CONMEBOL menyerahkan trofi juara sepenuhnya kepada Chapecoense! Puluhan ribu suporter lawan memadati stadion dengan lilin menyala menyanyikan himne perdamaian!

**Pinned Comment:** Sejarah Sepak Bola #30 · AUDIRA Sport Facts (@AudiraSportFacts). Sumber: Laporan Resmi Penerbangan Sipil Kolombia & Arsip CONMEBOL. Penghormatan abadi bagi 71 jiwa pahlawan Chapecoense. Tamat serial Sejarah Sepak Bola AUDIRA Sport Facts.

**Hashtags:** #Chapecoense #ForcaChape #AtleticoNacional #SolidaritasSepakBola #SejarahSepakBola #AUDIRA

## Instagram Reels

**Cover Headline:** KETIKA RIVALITAS BERTEKUK LUTUT DI DEPAN KEMANUSIAAN

**5-Point Value Breakdown:**
1. Dongeng Menuju Puncak: Perjalanan heroik Chapecoense dari kasta terbawah Brasil melaju ke final benua.
2. Tragedi Penerbangan LaMia 2933: Jatuh di lereng Andes Cerro Gordo menjelang mendarat di Medellin.
3. Kehilangan 71 Jiwa: Merenggut pemain, pelatih, jurnalis, dan kru pesawat yang bertugas.
4. Teladan Ksatria Atletico Nacional: Meminta trofi Copa Sudamericana diserahkan kepada sang korban.
5. Lautan Lilin di Medellin: 45.000 suporter lawan berbaju putih menyanyikan doa persaudaraan abadi.

## YouTube Shorts

**Judul Utama:** Tragedi Chapecoense 2016: Mengapa Lawan Meminta Trofi Diberikan Kepada Korban?
**Deskripsi:** Simak kisah pilu jatuhnya pesawat skuad Chapecoense di Medellin dan keteladanan solidaritas kemanusiaan paling menyentuh dari Atletico Nacional di episode penutup #30 serial Sejarah Sepak Bola AUDIRA.
**Tags:** Chapecoense, Forca Chape, Atletico Nacional, Medellin, Tragedi Pesawat, Copa Sudamericana 2016, Sejarah Sepak Bola, AUDIRA

## X (Twitter)

71 jiwa berpulang di lereng pegunungan Medellin. Sikap ksatria Atletico Nacional yang menyerahkan trofi juara kepada Chapecoense membuktikan bahwa nilai kemanusiaan adalah piala tertinggi sepak bola! #ForcaChape #AUDIRA

## Facebook & LinkedIn

Dalam era modern di mana kemenangan sering kali diukur semata oleh trofi dan kapital komersial, tragedi Chapecoense tahun 2016 menjadi pengingat yang meremukkan sekaligus memuliakan hati: bahwa di balik seragam dan bendera klub yang berbeda, kita semua disatukan oleh persaudaraan kemanusiaan yang sama. Simak ulasan penutup serial agung AUDIRA Sejarah Sepak Bola.
"""
}

# Apply STORYBOARD.md and SOCIAL_CAPTIONS.md
now_iso = datetime.now().isoformat() + "Z"

for folder_name in storyboards.keys():
    ep_dir = ROOT / folder_name
    if not ep_dir.exists():
        continue
    
    # 1. Write docs/STORYBOARD.md
    sb_path = ep_dir / "docs" / "STORYBOARD.md"
    sb_path.write_text(storyboards[folder_name], encoding="utf-8")
    print(f"Updated docs/STORYBOARD.md for {folder_name}")
    
    # 2. Write SOCIAL_CAPTIONS.md
    sc_path = ep_dir / "SOCIAL_CAPTIONS.md"
    sc_path.write_text(social_captions[folder_name], encoding="utf-8")
    print(f"Updated SOCIAL_CAPTIONS.md for {folder_name}")
    
    # 3. Synchronize STATUS.json
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

print("Batch 21-30 completely updated!")

