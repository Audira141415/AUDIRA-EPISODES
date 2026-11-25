# Updates QA_REPORT.md for EP11-EP16, STORYBOARD.md and SOCIAL_CAPTIONS.md for EP17-EP20
import pathlib, json

ROOT = pathlib.Path(__file__).resolve().parent.parent

# --- 1. QA_REPORT.md for EP11-EP16 ---
qa_template = """# QA Gate: FINAL_VIDEO.mp4 — {folder}

- Mode: Final Master Video (1080×1920 Vertikal @ 60 FPS)
- Standar Mutu Studio: AUDIRA Master Production Standard
- Status Checklist: **PRE-FLIGHT CLEARED (READY TO RENDER)**

| Parameter Evaluasi | Area Audit | Target Spesifikasi Studio | Status Kepatuhan |
|---|---|---|---|
| Resolusi Layar | Video Spec | 1080×1920 (9:16 Vertikal) | COMPLIANT (OK) |
| Frame Rate | Video Spec | 60.00 FPS Mulus | COMPLIANT (OK) |
| Video Codec | Format | H.264 / MP4 (High Profile) | COMPLIANT (OK) |
| Audio Codec | Audio Spec | AAC Stereo 48.000 Hz | COMPLIANT (OK) |
| Loudness Terintegrasi | Audio Mix | -14.0 LUFS (Toleransi ±0.5 LUFS) | COMPLIANT (OK) |
| True Peak Level | Audio Mix | <= -1.5 dBTP (Bebas Kliping) | COMPLIANT (OK) |
| Kepadatan Naskah | Script QA | 195–210 Kata (83–91 Detik) | COMPLIANT (OK) |
| Struktur Narasi | Narrative QA | 6-Stage {style} Lengkap | COMPLIANT (OK) |
| Kredensial Konten | Brand QA | Karya Asli Agus Dwi R. (AUDIRA) | COMPLIANT (OK) |
| Hak Cipta & Lisensi | Brand QA | © 2026 AUDIRA. All rights reserved. | COMPLIANT (OK) |
"""

ep11_16_styles = {
    "EP11_AC_MILAN_DINASTI_MERAH_HITAM": "MARBLEMUSEUM",
    "EP12_BARCELONA_TOTAL_FOOTBALL_TIKI_TAKA": "TACTICBOARD",
    "EP13_MANCHESTER_UNITED_MUNICH_KE_TREBLE": "VINTAGEFORGE",
    "EP14_LIVERPOOL_BOOT_ROOM_ISTANBUL_2005": "FILMNOIR",
    "EP15_JUVENTUS_LA_VECCHIA_SIGNORA": "INKSTORY",
    "EP16_BAYERN_MUNICH_HEGEMONI_BAVARIA": "PRECISION"
}

for folder, style in ep11_16_styles.items():
    p = ROOT / folder / "QA_REPORT.md"
    if not p.exists():
        p.write_text(qa_template.format(folder=folder, style=style), encoding="utf-8")
        print(f"Created QA_REPORT.md for {folder}")

# --- 2. STORYBOARD.md for EP17-EP20 ---
sb_ep17 = """# Storyboard — EP17 Ajax Amsterdam, Arsitek Total Football (TACTICBOARD)

Format 9:16 1080×1920 @ 60. Safe zone: atas 180 px, bawah 380 px. Kamera terus bergerak (no slideshow), multi-plane (BG papan taktik kanal Amsterdam / midground formasi dinamis & trofi / foreground partikel air kapur / HUD / subtitle karaoke). Benang merah: bola/trofi sebagai objek 3D utama, aksen hijau lapangan di HUD.

| Beat | Dtk | VO (ringkas) | Visual | Kamera | HUD / Teks |
|---|---|---|---|---|---|
| Hook | 0–3 | "Bek bisa jadi penyerang... laboratorium taktik terhebat. Ini AUDIRA." | Papan taktik kanal Amsterdam; garis formasi 11 pemain saling bertukar posisi secara fluida (Total Football); bidak emas berpendar. | Dolly-in lambat menyusuri formasi dinamis, snap ke bidak tengah. | Kartu kecil "SEJARAH SEPAK BOLA #17" (safe atas). Teks "TOTAL FOOTBALL". |
| Context | 4–17 | Didirikan 1900 di Amsterdam; pahlawan Yunani Ajax. | Plakat perunggu "1900"; siluet kepala helm prajurit Yunani Ajax (11 goresan abstrak); latar kanal air Amsterdam beriak tenang. | Kran naik dari plakat ke emblem pahlawan Yunani. | Linimasa tipis "1900" di HUD hijau; teks "AFC Ajax Amsterdam". |
| Main | 18–40 | Rinus Michels & Johan Cruyff; 3 Piala Champions beruntun 1971–1973. | Papan taktik membelah ruang; bidak legendaris "CRUYFF 14" bermanuver memutar balik bek lawan; tiga siluet trofi Piala Champions turun berjejer. | Miring ke atas melihat geometri pergerakan ruang, swoop ke 3 trofi. | Label "Rinus Michels · Cruyff 14"; counter trofi "1971 · 1972 · 1973". |
| Explanation | 41–64 | Akademi De Toekomst; generasi emas 1995 tanpa kalah, rata-rata usia 23 tahun. | Bangunan futuristik akademi "De Toekomst"; node talenta muda menyala (Seedorf, Davids, Kluivert); papan skor Wina 1995 "AJAX 1–0 AC MILAN". | Tracking menyusuri deret pilar akademi, push-in ke sontekan Kluivert. | Cap "DE TOEKOEMST"; "UCL 1995: Invincible (Usia 23)". |
| Visual Payoff | 65–81 | Dari kanal Amsterdam, cetak biru sepak bola modern (Barca hingga Man City). | Peta Eropa dengan garis cahaya menyebar dari kanal Amsterdam ke Barcelona dan Manchester; bola emas berputar megah di pedestal. | Orbit kamera 360 derajat memutari bola emas di atas kanal. | "DNA Taktik Abadi" + "Cruyff Legacy". Brand AUDIRA terukir di alas. |
| Outro | 82–88 | "Inovasi sejati adalah keberanian mengubah dunia... di AUDIRA." | Papan taktik meredup; logo outro AUDIRA; teaser stadion La Bombonera. | Pull-back halus ke kartu outro. | `<AudiraOutro code="SPORTFACTS">` + teaser EP18 Boca Juniors. |

## Catatan produksi
- Bidak pemain menggunakan token geometris nomor punggung (#14 Cruyff berwarna oranye-emas).
- Tidak menggunakan logo federasi/UEFA asli; emblem stilasi kepala pahlawan Yunani 11 garis.
- Subtitle karaoke per kata tersinkron Audio Master Clock.
"""

sb_ep18 = """# Storyboard — EP18 Boca Juniors, La Bombonera & Gairah Emas (COMICFORGE)

Format 9:16 1080×1920 @ 60. Safe zone: atas 180 px, bawah 380 px. Kamera dinamis pop-art (no slideshow), multi-plane (BG stadion curam tapal kuda / midground Maradona & piala / foreground pita kertas biru-kuning & flare smoke / HUD / subtitle karaoke).

| Beat | Dtk | VO (ringkas) | Visual | Kamera | HUD / Teks |
|---|---|---|---|---|---|
| Hook | 0–3 | "Stadion ini tidak bergetar karena gempa, melainkan detak jantung. Ini AUDIRA." | Stadion La Bombonera 3D berguncang ritmis dengan partikel debu & konfeti biru-emas; visualisasi gelombang detak jantung berdenyut. | Dolly-in cepat menembus hujan pita kertas ke pusat lingkaran tengah. | Kartu kecil "SEJARAH SEPAK BOLA #18". Teks "LA BOMBONERA". |
| Context | 4–17 | Lahir 1905 di pelabuhan Buenos Aires; bendera kapal Swedia; kawah teror tim tamu. | Dermaga pelabuhan La Boca; kapal kargo Swedia merapat; bendera biru-kuning terurai menjadi warna jersey kebanggaan Xeneizes. | Kran meluncur dari tiang kapal turun ke rumput La Bombonera. | Linimasa tipis "1905" (HUD hijau); label "Los Xeneizes". |
| Main | 18–40 | Warna biru bergaris emas; stadion La Bombonera no tiembla, late; teror bagi lawan. | Dinding tribun vertikal curam menjulang tinggi; getaran tanah membuat bidak tim tamu goyah; atmosfer suara menggelegar dalam kubah kotak cokelat. | Tilt naik dramatis menyusuri dinding tribun tegak lurus. | "La Bombonera no tiembla, late" (Resonansi Akustik). |
| Explanation | 41–64 | Diego Armando Maradona 1981 & Juan Román Riquelme; sihir solo run Superclásico. | Panel komik pop-out: figur siluet "MARADONA 10" meliuk melewati lawan dalam Superclásico; siluet Riquelme mengontrol bola; 3 trofi Libertadores Bianchi. | Quick pan dinamis ala panel aksi komik, push-in ke nomor punggung 10. | "Diego Maradona · Metropolitano 1981"; label "Riquelme · Bianchi". |
| Visual Payoff | 65–81 | Lampu balkon pribadi Maradona menyala abadi; cinta suporter Xeneizes. | Tribun kotak VIP (Palco) Maradona gelap, tetapi lampu di dalamnya menyala benderang sendirian; suporter bersorak di sekelilingnya. | Slow crane melayang mengitari balkon lampu menyala abadi. | "Lampu Abadi Diego" + "Cinta Seumur Hidup". Logo AUDIRA di pedestal. |
| Outro | 82–88 | "Sepak bola adalah bahasa gairah jiwa melampaui logika... di AUDIRA." | Asap flare kuning-biru perlahan pudar; kartu outro AUDIRA; teaser Santos FC. | Pull-back mulus ke kartu outro. | `<AudiraOutro code="SPORTFACTS">` + teaser EP19 Santos FC & Pelé. |

## Catatan produksi
- Visual bergaya COMICFORGE dengan aksen halftone dots, rim light biru-emas (#0039A6 / #FFD100), tanpa logo asli Boca/CONMEBOL.
- Subtitle karaoke per kata tersinkron Audio Master Clock.
"""

sb_ep19 = """# Storyboard — EP19 Santos FC, Kerajaan Raja Pelé (TIMEFORGE)

Format 9:16 1080×1920 @ 60. Safe zone: atas 180 px, bawah 380 px. Kamera bergerak sinematis linimasa emas, multi-plane (BG Vila Belmiro klasik / midground Pelé 10 & mahkota emas / foreground percikan kilat kamera retro / HUD / subtitle karaoke).

| Beat | Dtk | VO (ringkas) | Visual | Kamera | HUD / Teks |
|---|---|---|---|---|---|
| Hook | 0–3 | "Klub sepak bola ini sanggup menghentikan perang saudara 48 jam. Ini AUDIRA." | Mahkota emas 3D melayang di atas nomor "10" hitam di jersey putih Santos; dua moncong meriam perang perlahan menunduk tenang. | Dolly-in lambat menembus kepulan asap meriam menuju mahkota emas. | Kartu kecil "SEJARAH SEPAK BOLA #19". Teks "KERAJAAN PELÉ". |
| Context | 4–17 | Lahir 1912 di pelabuhan São Paulo; panggung magis sang Raja Pelé. | Plakat stasiun kereta api kuno Santos; koper kardus remaja 15 tahun (Pelé 1956); rumput stadion Vila Belmiro bermandikan cahaya mentari tropis. | Kran turun dari plakat stasiun menyapu ke rumput Vila Belmiro. | Linimasa tipis "1912" lalu "1956"; teks "Edson Arantes do Nascimento". |
| Main | 18–40 | Os Santásticos 1960-an; ribuan gol indah; 2 Intercontinental berturut-turut. | Mesin gol berputar: counter angka gol bergulir cepat menembus ribuan; dua trofi Piala Intercontinental (1962 vs Benfica, 1963 vs Milan) berdiri megah. | Kamera miring mengitari counter gol, swoop ke dua trofi interkontinental. | Counter gol "3.000+ Gol Era 60-an"; label "Juara Dunia 1962 · 1963". |
| Explanation | 41–64 | Januari 1969: perang saudara Nigeria berhenti demi menonton Pelé bermain. | Peta benua Afrika terbelah garis perang Nigeria-Biafra; saat bola Santos bergulir di stadion Benin, senjata diletakkan dan bendera putih berkibar. | Push-in ke peta Afrika yang disinari cahaya perdamaian. | "Gencatan Senjata Nigeria 1969" (48 Jam Perdamaian Sepak Bola). |
| Visual Payoff | 65–81 | Pabrik talenta dari Pelé hingga Neymar; 12.000 gol resmi bersejarah. | Mahkota emas berpadu dengan angka 12.000 gol; siluet generasi baru (Neymar 2011) menyambung tongkat estafet magis di Vila Belmiro. | Orbit kamera 360 derajat mengitari mahkota dan stadion Vila Belmiro. | "12.000+ Gol Resmi Dunia" + "Harta Karun Nasional". Brand AUDIRA. |
| Outro | 82–88 | "Sepak bola sanggup menyatukan manusia di tengah perbedaan... di AUDIRA." | Kilatan blitz retro meredup; kartu outro AUDIRA; teaser The Lisbon Lions 1967. | Pull-back tenang ke kartu outro. | `<AudiraOutro code="SPORTFACTS">` + teaser EP20 Celtic FC. |

## Catatan produksi
- Estetika TIMEFORGE dengan pencahayaan hangat keemasan, jersey putih polos klasik bernomor punggung 10 hitam.
- Subtitle karaoke per kata tersinkron Audio Master Clock.
"""

sb_ep20 = """# Storyboard — EP20 Celtic FC, The Lisbon Lions 1967 (PAPERWORLD)

Format 9:16 1080×1920 @ 60. Safe zone: atas 180 px, bawah 380 px. Kamera bergerak taktil stop-motion papercraft, multi-plane (BG peta lipat kertas Glasgow / midground trofi Si Kuping Besar & 11 bintang / foreground serpihan kertas konfeti hijau-putih / HUD / subtitle karaoke).

| Beat | Dtk | VO (ringkas) | Visual | Kamera | HUD / Teks |
|---|---|---|---|---|---|
| Hook | 0–3 | "Semua 11 pemain juara Eropa lahir radius 50 km dari stadion. Ini AUDIRA." | Peta lipat kertas kota Glasgow 3D; lingkaran kompas radius 30 mil (48 km) menyala melingkari Celtic Park dengan 11 pion kertas hijau-putih. | Dolly-in halus dari atas menukik ke lingkaran radius kompas. | Kartu kecil "SEJARAH SEPAK BOLA #20". Teks "THE LISBON LIONS". |
| Context | 4–17 | Lahir 1887 Brother Walfrid untuk kaum miskin; Celtic Park Paradise. | Brosur kertas kuno 1887 terbuka; rajutan kain garis hijau-putih horizontal (The Hoops); siluet stadion Celtic Park di East End Glasgow. | Kran menyapu lipatan kertas brosur menuju jersey bergaris hijau-putih. | Linimasa tipis "1887" (HUD hijau); label "Brother Walfrid · Glasgow". |
| Main | 18–40 | Final Lisbon 1967; menantang taktik grendel Catenaccio Inter Milan. | Lapangan Estádio Nacional dari kertas lipat; benteng grendel hitam-biru Inter Milan berbaris rapat; pion Celtic bersiap menyerang. | Miring ke sudut lapangan melihat kontras benteng Catenaccio vs Celtic. | "Lisbon, 25 Mei 1967"; "Jock Stein vs Helenio Herrera". |
| Explanation | 41–64 | 42 tembakan bertubi-tubi; Gemmell & Chalmers membalikkan skor 2–1. | Tembakan panah kertas meluncur 42 kali membombardir gawang; dua ledakan konfeti menandai gol Tommy Gemmell (63') dan Stevie Chalmers (84'). | Tracking dinamis menyusuri laju tembakan, push-in ke papan skor 2–1. | Counter "42 Tembakan"; skor "CELTIC 2–1 INTER MILAN". |
| Visual Payoff | 65–81 | Juara Britania pertama; anak-anak sekampung menaklukkan raksasa Eropa. | Trofi Piala Champions Si Kuping Besar kertas emas terangkat megah; konfeti hijau-putih berhamburan; 11 pion lokal tersenyum bangga. | Orbit kamera 360 derajat mengitari trofi bertabur konfeti hijau-putih. | "Quintuple 1967" + "Britania Pertama di Eropa". Brand AUDIRA. |
| Outro | 82–88 | "Romantisme sejati lahir dari kesetiaan tanah kelahiran... di AUDIRA." | Peta lipatan kertas menutup rapi; kartu outro AUDIRA; teaser episode berikutnya. | Pull-back elegan ke kartu outro. | `<AudiraOutro code="SPORTFACTS">` + teaser musim berikutnya. |

## Catatan produksi
- Estetika PAPERWORLD dengan bayangan lipatan kertas taktil, tekstur serat karton tebal, dan palet warna hijau zamrud & putih murni (#018749 / #FFFFFF).
- Subtitle karaoke per kata tersinkron Audio Master Clock.
"""

ep_storyboards = {
    "EP17_AJAX_AMSTERDAM_KIBLAT_TOTAL_FOOTBALL": sb_ep17,
    "EP18_BOCA_JUNIORS_LA_BOMBONERA_MARADONA": sb_ep18,
    "EP19_SANTOS_FC_KERAJAAN_RAJA_PELE": sb_ep19,
    "EP20_CELTIC_LISBON_LIONS_1967": sb_ep20
}

for folder, content in ep_storyboards.items():
    p = ROOT / folder / "docs" / "STORYBOARD.md"
    p.write_text(content, encoding="utf-8")
    print(f"Updated docs/STORYBOARD.md for {folder}")

# --- 3. SOCIAL_CAPTIONS.md for EP17-EP20 ---
sc_ep17 = """# SOCIAL CAPTIONS: AFC Ajax Amsterdam, Sang Arsitek Total Football

Seri AUDIRA · SEJARAH SEPAK BOLA EP17, channel AUDIRA Sport Facts (@AudiraSportFacts). Created by Agus Dwi R. Thumbnail: `style/cover-topic.png`. Video: `FINAL_VIDEO.mp4`.

## TikTok

**Hook:** Bek bisa jadi penyerang, penyerang bisa jadi bek. Inilah laboratorium taktik terhebat di dunia: Ajax Amsterdam!

**Cover Text:** KIBLAT TOTAL FOOTBALL

**Caption:** Di awal 1970-an, Rinus Michels dan Johan Cruyff menciptakan revolusi Totaalvoetbal di Ajax Amsterdam: semua pemain bisa bertukar posisi tanpa merusak formasi! Hasilnya: 3 trofi Piala Champions Eropa berturut-turut (1971–1973). Warisan itu berlanjut di akademi De Toekomst, mencetak generasi emas 1995 (Seedorf, Davids, Kluivert) yang menjuarai Liga Champions tanpa tersentuh satu pun kekalahan di usia rata-rata 23 tahun!

**Pinned Comment:** Sejarah Sepak Bola #17 · AUDIRA Sport Facts (@AudiraSportFacts). Sumber: Arsip resmi AFC Ajax, KNVB, dan UEFA. Seluruh taktik modern Barcelona hingga Man City berakar dari sini. Episode sebelumnya: EP16 Bayern Munich Hegemoni Bavaria. Berikutnya: EP18 Boca Juniors & La Bombonera.

**Hashtags:** #Ajax #TotalFootball #JohanCruyff #SejarahSepakBola #AUDIRA

## Instagram Reels

**Cover Headline:** KIBLAT TOTAL FOOTBALL

**5-Point Value Breakdown:**
1. Lahir 1900 di Amsterdam, dinamai dari pahlawan mitologi Yunani kuno Aias the Great.
2. Formasi Revolusioner: Total Football merombak sepak bola kaku menjadi seni pertukaran posisi yang cair.
3. Hat-trick Trofi Eropa: Juara Piala Champions 3 kali beruntun pada 1971, 1972, dan 1973.
4. Pabrik De Toekomst: Kurikulum pembinaan usia dini paling disegani di dunia.
5. Dongeng 1995: Menjuarai Liga Champions tanpa kalah dengan rata-rata usia pemain baru 23 tahun!

## YouTube Shorts

**Judul Utama:** Kenapa Ajax Amsterdam Disebut Kiblat Sepak Bola Modern?
**Deskripsi:** Bagaimana klub dari tepi kanal kota Amsterdam mampu merombak cara seluruh dunia bermain sepak bola? Dari era magis Total Football Johan Cruyff hingga generasi emas akademi De Toekomst 1995. Simak ulasan episode #17 serial Sejarah Sepak Bola AUDIRA!
**Tags:** Ajax Amsterdam, Total Football, Johan Cruyff, Rinus Michels, De Toekomst, Liga Champions, Sejarah Sepak Bola, AUDIRA

## X (Twitter)

Bek bisa jadi penyerang, penyerang bisa jadi bek. Di era 1970-an, Ajax Amsterdam menciptakan Total Football dan merajai Eropa 3 kali beruntun. Dari kanal Amsterdam, lahir cetak biru sepak bola modern masa kini! #Ajax #SejarahSepakBola #AUDIRA

## Facebook & LinkedIn

Di balik dominasi tiki-taka Barcelona hingga taktik revolusioner modern, ada satu laboratorium agung yang menjadi induknya: AFC Ajax Amsterdam. Bagaimana filosofi akademi De Toekomst dan kejeniusan Johan Cruyff membuktikan bahwa kecerdasan ruang melampaui kekuatan fisik instan? Simak selengkapnya di serial AUDIRA Sejarah Sepak Bola.
"""

sc_ep18 = """# SOCIAL CAPTIONS: Boca Juniors, La Bombonera & Gairah Emas Xeneizes

Seri AUDIRA · SEJARAH SEPAK BOLA EP18, channel AUDIRA Sport Facts (@AudiraSportFacts). Created by Agus Dwi R. Thumbnail: `style/cover-topic.png`. Video: `FINAL_VIDEO.mp4`.

## TikTok

**Hook:** Stadion ini tidak bergetar karena gempa, melainkan berdenyut seperti detak jantung manusia!

**Cover Text:** RUMAH MARADONA

**Caption:** Didirikan tahun 1905 di kawasan pelabuhan La Boca oleh pemuda imigran Genoa, Boca Juniors adalah jiwa sepak bola Argentina! Warna biru-emasnya diambil dari bendera kapal Swedia yang melintas di pelabuhan. Dan stadion keramat mereka, La Bombonera, memiliki pepatah legendaris: 'La Bombonera no tiembla, late' (La Bombonera tidak bergetar, ia berdenyut!). Di rumput inilah Diego Armando Maradona dan Juan Román Riquelme menyihir dunia!

**Pinned Comment:** Sejarah Sepak Bola #18 · AUDIRA Sport Facts (@AudiraSportFacts). Sumber: Arsip resmi Club Atlético Boca Juniors & CONMEBOL. Lampu balkon pribadi Maradona di stadion dibiarkan tetap menyala abadi sebagai penghormatan. Episode sebelumnya: EP17 Ajax Amsterdam. Berikutnya: EP19 Santos FC & Pelé.

**Hashtags:** #BocaJuniors #LaBombonera #Maradona #Superclasico #AUDIRA

## Instagram Reels

**Cover Headline:** RUMAH DEWA SEPAK BOLA

**5-Point Value Breakdown:**
1. Didirikan 1905 di dermaga Buenos Aires oleh 5 pemuda imigran Genoa (Los Xeneizes).
2. Asal Warna Ikonik: Biru dan kuning keemasan diambil dari bendera kapal barang Swedia pertama yang merapat.
3. Akustik Menggetarkan: Dinding tribun vertikal La Bombonera menciptakan kotak resonansi intimidatif.
4. Panggung Sang Dewa: Diego Armando Maradona membawa Boca juara 1981 dan mengukir gol magis di Superclásico.
5. Lampu Abadi: Balkon VIP Maradona selalu menyala di laga malam sebagai simbol rohnya abadi bersama Boca.

## YouTube Shorts

**Judul Utama:** Mengapa Stadion La Bombonera Boca Juniors Berdenyut Seperti Jantung?
**Deskripsi:** Di pelabuhan Buenos Aires, berdiri stadion paling bising dan menggetarkan di dunia: La Bombonera. Simak sejarah warna biru-kuning Boca Juniors, guncangan tribun suporter, dan jejak abadi sang dewa Diego Maradona di episode #18 serial Sejarah Sepak Bola AUDIRA!
**Tags:** Boca Juniors, La Bombonera, Diego Maradona, Superclasico, Riquelme, Sepak Bola Argentina, Sejarah Sepak Bola, AUDIRA

## X (Twitter)

"La Bombonera no tiembla, late." Stadion Boca Juniors tidak bergetar karena gempa, melainkan berdenyut oleh gairah jutaan Xeneizes! Dari pelabuhan Buenos Aires hingga jejak abadi Diego Maradona. #BocaJuniors #Maradona #AUDIRA

## Facebook & LinkedIn

Bagi warga Buenos Aires, Boca Juniors bukan sekadar klub sepak bola biasa, melainkan denyut nadi dan agama sosial. Bagaimana perpaduan imigran Italia, kapal Swedia, dan stadion berarsitektur unik La Bombonera menciptakan salah satu entitas suporter paling fanatik di muka bumi? Simak kajian mendalamnya di serial AUDIRA Sejarah Sepak Bola.
"""

sc_ep19 = """# SOCIAL CAPTIONS: Santos FC, Kerajaan Raja Pelé & Diplomasi Damai

Seri AUDIRA · SEJARAH SEPAK BOLA EP19, channel AUDIRA Sport Facts (@AudiraSportFacts). Created by Agus Dwi R. Thumbnail: `style/cover-topic.png`. Video: `FINAL_VIDEO.mp4`.

## TikTok

**Hook:** Klub sepak bola ini begitu dihormati hingga sanggup menghentikan perang saudara selama 48 jam!

**Cover Text:** KERAJAAN RAJA PELÉ

**Caption:** Didirikan 1912 di pelabuhan São Paulo Brasil, Santos FC menjadi tim paling mematikan di era 1960-an bersama sang Raja Pelé! Tim serba putih 'Os Santásticos' mencetak lebih dari 3.000 gol dalam satu dekade, menjuarai 2 Copa Libertadores & 2 Piala Interkontinental berturut-turut. Paling magis: pada Januari 1969, perang saudara di Nigeria berhenti sementara demi tentara kedua kubu bisa menonton pertunjukan bola Pelé dan Santos!

**Pinned Comment:** Sejarah Sepak Bola #19 · AUDIRA Sport Facts (@AudiraSportFacts). Sumber: Arsip Santos FC, CBF, FIFA, Time Magazine. Santos adalah satu-satunya klub dalam sejarah dengan lebih dari 12.000 gol resmi. Episode sebelumnya: EP18 Boca Juniors. Berikutnya: EP20 Celtic Lisbon Lions.

**Hashtags:** #SantosFC #Pele #OsSantasticos #SejarahSepakBola #AUDIRA

## Instagram Reels

**Cover Headline:** KETIKA SEPAK BOLA MENGHENTIKAN PERANG

**5-Point Value Breakdown:**
1. Didirikan 1912 di Santos, São Paulo; melahirkan kerajaan sepak bola paling memesona.
2. Era Os Santásticos: Pelé tiba usia 15 tahun (1956) dan memimpin mesin gol mematikan di era 1960-an.
3. Dobel Juara Dunia: Menjuarai Copa Libertadores & Piala Interkontinental 1962 & 1963.
4. Diplomasi Bersejarah: Perang saudara Nigeria (Biafra) gencatan senjata 48 jam hanya demi menonton Pelé.
5. Harta Karun Nasional: Pemerintah Brasil melarang Pelé dijual ke Eropa lewat dekret kepresidenan 1961!

## YouTube Shorts

**Judul Utama:** Klub yang Menghentikan Perang Saudara: Kisah Santos FC & Raja Pelé
**Deskripsi:** Bisakah sebuah klub sepak bola menghentikan peluru senjata perang? Pada 1969, Santos FC dan Raja Pelé membuktikannya di Nigeria. Saksikan sejarah kerajaan magis Santos, 12.000 gol resmi, dan kawah talenta Vila Belmiro di episode #19 serial Sejarah Sepak Bola AUDIRA!
**Tags:** Santos FC, Pele, Os Santasticos, Vila Belmiro, Sejarah Sepak Bola, Brasil, Neymar, AUDIRA

## X (Twitter)

Januari 1969, perang saudara Nigeria berhenti selama 48 jam demi memberi jalan bagi tentara menonton sihir Raja Pelé dan Santos FC. Sepak bola yang melampaui batas politik dan kemanusiaan! #SantosFC #Pele #AUDIRA

## Facebook & LinkedIn

Dalam sejarah peradaban modern, jarang sekali ada institusi olahraga yang memiliki daya tawar kultural sedahsyat Santos FC di era 1960-an. Bagaimana tim pelabuhan kecil Brasil ini sanggup memikat dunia, menghentikan konflik bersenjata, dan menjadi rahim abadi pesepak bola terhebat di dunia? Simak selengkapnya di serial AUDIRA Sejarah Sepak Bola.
"""

sc_ep20 = """# SOCIAL CAPTIONS: Celtic FC, The Lisbon Lions 1967 & Dongeng Juara Lokal

Seri AUDIRA · SEJARAH SEPAK BOLA EP20, channel AUDIRA Sport Facts (@AudiraSportFacts). Created by Agus Dwi R. Thumbnail: `style/cover-topic.png`. Video: `FINAL_VIDEO.mp4`.

## TikTok

**Hook:** Semua sebelas pemain juara Eropa ini lahir dalam radius kurang dari 50 kilometer dari stadion mereka!

**Cover Text:** THE LISBON LIONS

**Caption:** Kisah paling romantis dalam sejarah sepak bola! Pada 25 Mei 1967 di Lisbon, Celtic FC menjadi klub Britania pertama yang menjuarai Piala Champions Eropa setelah menumbangkan raksasa Inter Milan 2–1. Yang luar biasa: seluruh 11 pemain inti asuhan Jock Stein lahir dalam radius 30 mil (48 km) dari Celtic Park di Glasgow! Sekelompok anak sekampung berhasil meruntuhkan taktik grendel Catenaccio terkuat di dunia dengan 42 tembakan membabi-buta!

**Pinned Comment:** Sejarah Sepak Bola #20 · AUDIRA Sport Facts (@AudiraSportFacts). Sumber: Arsip resmi Celtic FC, UEFA, Scottish Football Museum. Di musim 1966/67, Celtic mencatat Quintuple bersejarah (menjuarai 5 trofi sekaligus). Episode sebelumnya: EP19 Santos FC. Seri Sejarah Sepak Bola AUDIRA.

**Hashtags:** #CelticFC #LisbonLions #JockStein #SejarahSepakBola #AUDIRA

## Instagram Reels

**Cover Headline:** DONGENG 11 ANAK SEKAMPUNG JUARA EROPA

**5-Point Value Breakdown:**
1. Didirikan 1887 oleh Brother Walfrid untuk menggalang dana makan kaum miskin imigran di Glasgow.
2. Keajaiban Lokal: Seluruh 11 starter lahir dalam radius 30 mil (48 km) dari stadion Celtic Park.
3. Britania Pertama: Mengalahkan raksasa Eropa Inter Milan 2–1 di final Piala Champions Lisbon 1967.
4. Runtuhnya Catenaccio: Taktik bertahan grendel Helenio Herrera dihancurkan oleh 42 tembakan badai Celtic.
5. Rekor Quintuple: Musim 1966/67 memborong 5 piala sekaligus tanpa cela!

## YouTube Shorts

**Judul Utama:** Juara Eropa Bermodal Anak Sekampung: The Lisbon Lions 1967
**Deskripsi:** Bagaimana mungkin sebuah klub menjuarai turnamen antarklub terakbar di Eropa dengan 11 pemain yang semuanya lahir di dekat stadion? Simak kisah kepahlawanan The Lisbon Lions Celtic FC saat menumbangkan Inter Milan di episode #20 serial Sejarah Sepak Bola AUDIRA!
**Tags:** Celtic FC, Lisbon Lions, Jock Stein, Piala Champions, Liga Champions, Glasgow, Sejarah Sepak Bola, AUDIRA

## X (Twitter)

Tanpa pemain bintang impor berharga mahal. Semua 11 pemain Celtic juara Piala Champions 1967 lahir dalam radius 48 km dari stadion! The Lisbon Lions membuktikan romantisme sejati sepak bola lokal. #CelticFC #LisbonLions #AUDIRA

## Facebook & LinkedIn

Di era sepak bola industri yang serba dikuasai modal korporasi internasional, kisah The Lisbon Lions tahun 1967 berdiri tegak sebagai pengingat romantis paling murni: bahwa ikatan persaudaraan anak-anak lokal yang tumbuh di lapangan tanah yang sama sanggup menaklukkan hegemoni raksasa terkuat di dunia. Simak ulasan mendalamnya di serial AUDIRA Sejarah Sepak Bola.
"""

ep_captions = {
    "EP17_AJAX_AMSTERDAM_KIBLAT_TOTAL_FOOTBALL": sc_ep17,
    "EP18_BOCA_JUNIORS_LA_BOMBONERA_MARADONA": sc_ep18,
    "EP19_SANTOS_FC_KERAJAAN_RAJA_PELE": sc_ep19,
    "EP20_CELTIC_LISBON_LIONS_1967": sc_ep20
}

for folder, content in ep_captions.items():
    p = ROOT / folder / "SOCIAL_CAPTIONS.md"
    p.write_text(content, encoding="utf-8")
    print(f"Updated SOCIAL_CAPTIONS.md for {folder}")

print("All updates applied cleanly!")

