"""Writes SOCIAL_CAPTIONS.md for EP26-EP30 (6 platforms, upload schedule, AI label). Chapters come from the voiced timeline.json.
Run from AUDIRA_CARA_KERJA_VIRAL_2026 after the finals pass QC: python _tools/captions-26-30.py"""
import json, sys
from pathlib import Path

sys.path.insert(0, "_tools")
from importlib import import_module
DOCS = import_module("docs-26-30").EPS

fmt = lambda t: f"{int(t // 60)}:{int(t % 60):02}"
BASE = "#CaraKerja #Sains #AUDIRA"

E = {
    "EP26_SAMPAH_JADI_LISTRIK": dict(
        day="Senin, 30 November 2026", cover="SAMPAH JADI LISTRIK", tags="#Sampah #EnergiTerbarukan",
        tiktok="1.100 ton sampah Palembang diangkut tiap hari. Mulai Desember, sebagian besar dibakar di tungku 850 derajat di PSEL Keramasan, lalu jadi listrik. Dari bunker, jeruji tungku, sampai turbin: ini cara kerjanya.",
        pin="CARA KERJA VIRAL · EP 26. Sumber: Pemkot Palembang (4 Nov 2026), Kompas.com, Antara, detikFinance, CNBC Indonesia, RRI Palembang. 1.100 ton = sampah yang diangkut per hari; 1.000 ton = kapasitas rancangan pabrik. Jadwal peresmian bisa berubah. Visual ilustrasi.",
        ig="Sampah tidak lenyap, ia berubah jadi uap, listrik, dan abu. Tahap mana yang paling bikin kaget? Tulis di komentar.",
        points=["4 November 2026, menteri meninjau PSEL Keramasan Palembang; saat uji coba pembangkitnya sudah mengalirkan 18,6 MW ke PLN.", "Sampah diperam 5 sampai 7 hari di bunker beton raksasa agar airnya menetes dan sampah makin kering.", "Jeruji tungku yang miring terus bergeser dan udara ditiup dari bawah: sampah mengering, menyala, lalu tinggal abu.", "Panasnya merebus air boiler jadi uap yang memutar turbin dan generator; kapasitas 20 MW, 17,7 MW dijual ke PLN.", "Gas panas wajib bertahan di atas 850 derajat minimal dua detik untuk memecah dioksin; asapnya dicuci kapur, karbon aktif, dan filter kantong."],
        audio="Deru tungku dan desis uap di bawah ketukan marimba tanah liat, lalu turbin berdengung saat listrik mengalir.",
        alts=["Bagaimana Sampah Palembang Bisa Jadi Listrik?", "Kenapa Tungku Sampah Harus 850 Derajat?", "Cara Kerja PLTSa dalam 90 Detik"],
        desc="Cara kerja pengolahan sampah jadi listrik (PSEL) Keramasan Palembang: sampah diperam di bunker, dibakar di tungku jeruji miring, panasnya merebus air boiler jadi uap yang memutar turbin, dan gas panas ditahan di atas 850 derajat selama dua detik untuk memecah dioksin.",
        src="Pemkot Palembang, Kompas.com, Antara, detikFinance, CNBC Indonesia, RRI Palembang.",
        ytags="psel keramasan, pltsa palembang, sampah jadi listrik, waste to energy, tungku sampah, dioksin, energi, cara kerja, palembang, audira",
        thumb="Diorama tanah liat truk sampah dan tungku menyala dengan judul SAMPAH JADI LISTRIK (style/cover-topic.png).",
        fb="Bayangkan sampah satu kota dikumpulkan di satu bak beton raksasa, didiamkan beberapa hari sampai airnya menetes, lalu dibakar perlahan di atas jeruji yang terus bergerak. Panasnya merebus air jadi uap, uapnya memutar turbin, dan lampu kota menyala. Itulah yang dikerjakan PSEL Keramasan di Palembang. Tapi sampah tidak benar-benar lenyap: abunya tetap harus ditangani.",
        q="Menurutmu, kotamu perlu pembangkit sampah seperti ini?",
        single="Tiap hari 1.100 ton sampah Palembang diangkut. Di PSEL Keramasan, sampah dibakar di atas 850 derajat, uapnya memutar turbin 20 MW. Sampah tidak lenyap: abunya tetap harus ditangani. #Sampah #CaraKerja",
        thread=["Tiap hari, 1.100 ton sampah Palembang diangkut truk. Mulai Desember, sebagian besar dibakar lalu jadi listrik. #CaraKerja", "Sampah diperam 5-7 hari di bunker raksasa sampai airnya menetes. Capit raksasa lalu mengangkatnya ke corong tungku.", "Jeruji tungku yang miring terus bergeser, udara ditiup dari bawah. Panasnya merebus air boiler jadi uap yang memutar turbin.", "Gas panas ditahan di atas 850 derajat minimal 2 detik untuk memecah dioksin. Abunya tetap harus ditangani. #Sampah"],
        th_open="1.100 ton sampah Palembang tiap hari, sebagian besar akan dibakar di tungku 850 derajat lalu jadi listrik. Ini cara kerja PSEL Keramasan. #CaraKerja",
        th=["Sampah diperam 5 sampai 7 hari di bunker, lalu dibakar di atas jeruji miring yang terus bergeser. Panasnya merebus air jadi uap bertekanan tinggi yang memutar turbin dan generator. Kapasitasnya 20 MW, saat uji coba sudah 18,6 MW mengalir ke PLN.", "Kenapa 850 derajat? Gas panas harus bertahan di atas suhu itu minimal dua detik agar dioksin terpecah. Asapnya lalu dicuci kapur, karbon aktif, dan filter kantong. Menurutmu kotamu perlu ini? #Sampah"],
    ),
    "EP27_KAPAL_AMONIA": dict(
        day="Selasa, 1 Desember 2026", cover="KAPAL TANPA KARBON", tags="#Pelayaran #EnergiBersih",
        tiktok="Bahan bakar kapal tanpa satu pun atom karbon: amonia. Di Ulsan, Korea Selatan, sebuah tanker raksasa diisi sekitar 800 ton amonia hijau untuk uji coba. Tapi untuk menyalakannya, mesinnya tetap butuh sedikit solar. Ini cara kerjanya.",
        pin="CARA KERJA VIRAL · EP 27. Sumber: ANTARA (5 Nov 2026), Ship & Bunker, Hydrogen Insight, Cyprus Shipping News, Marine Insight. Bukan kapal amonia pertama; tanker amonia raksasa pertama yang mesinnya bisa membakar amonia. Visual ilustrasi.",
        ig="Tanpa karbon tidak sama dengan nol emisi. Bagian mana yang baru kamu tahu? Tulis di komentar.",
        points=["25-26 Oktober 2026, tanker Terra Clove diisi sekitar 800 ton amonia hijau lewat pipa dari darat di Pelabuhan Ulsan.", "Amonia hijau dibuat di Chifeng, Tiongkok: listrik angin dan matahari memecah air jadi hidrogen, nitrogen diambil dari udara.", "Amonia mendidih di minus 33 derajat, jadi disimpan cair dan dingin di tangki kapal.", "Amonia baru menyala sendiri di 651 derajat, jadi sedikit solar pilot dipakai sebagai korek apinya.", "Hasil idealnya nitrogen dan uap air, tapi masih ada NOx, N2O, dan sisa amonia; energinya per liter hanya sekitar sepertiga solar."],
        audio="Riak air dermaga dan klakson kapal di hook, lalu letupan silinder yang sinkron dengan api solar pilot.",
        alts=["Kapal Berbahan Bakar Amonia, Bagaimana Cara Kerjanya?", "Bahan Bakar Tanpa Karbon tapi Butuh Solar", "Kenapa Amonia Sulit Terbakar?"],
        desc="Cara kerja mesin kapal berbahan bakar amonia: amonia hijau dari listrik angin dan matahari, disimpan cair di minus 33 derajat, disemprot ke silinder dan dinyalakan sedikit solar pilot, lalu NOx di saluran buang diubah katalis. Dipicu uji coba bunkering amonia hijau di Ulsan, Korea Selatan, 25-26 Oktober 2026.",
        src="ANTARA, Ship & Bunker, Hydrogen Insight, Cyprus Shipping News, Marine Insight.",
        ytags="kapal amonia, amonia hijau, bahan bakar kapal, ulsan, dekarbonisasi pelayaran, nol karbon, mesin kapal, cara kerja, energi bersih, audira",
        thumb="Pelabuhan voxel senja dengan molekul NH3 dan judul TANPA KARBON (style/cover-topic.png).",
        fb="Bayangkan bahan bakar yang tidak mengandung karbon sama sekali, jadi tidak menghasilkan CO2 saat dibakar. Itulah amonia: satu nitrogen dan tiga hidrogen. Masalahnya, amonia keras kepala, baru menyala sendiri di 651 derajat. Jadi mesin kapal tetap butuh sedikit solar sebagai korek api. Dan karena energinya per liter hanya sepertiga solar, tangkinya harus kira-kira tiga kali lebih besar.",
        q="Menurutmu, amonia bisa jadi bahan bakar kapal masa depan?",
        single="Bahan bakar kapal tanpa satu pun atom karbon: amonia. Tapi ia baru menyala sendiri di 651 derajat, jadi mesinnya tetap butuh sedikit solar sebagai korek. Dan ini bukan nol emisi. #Pelayaran #CaraKerja",
        thread=["Bahan bakar kapal tanpa satu pun atom karbon. Tapi untuk menyalakannya, tetap butuh sedikit solar. #CaraKerja", "25-26 Okt, di Ulsan, tanker Terra Clove diisi sekitar 800 ton amonia hijau lewat pipa dari darat untuk uji coba pembakaran.", "Amonia disimpan cair di minus 33 derajat. Ia baru menyala sendiri di 651 derajat, jadi solar pilot jadi korek apinya.", "Hasil idealnya nitrogen dan uap air, tapi masih ada NOx dan N2O. Katalis membersihkan sebagian. #Pelayaran"],
        th_open="Bahan bakar kapal tanpa satu pun atom karbon, tapi tetap butuh sedikit solar. Ini cara kerja mesin kapal amonia. #CaraKerja",
        th=["Di Ulsan, Korea Selatan, tanker Terra Clove diisi sekitar 800 ton amonia hijau buatan Chifeng, Tiongkok, dari listrik angin dan matahari. Amonia disimpan cair di minus 33 derajat lalu disemprot ke silinder, dan sedikit solar pilot menyalakannya.", "Bukan nol emisi: masih ada NOx, N2O, dan sisa amonia. Energinya per liter juga hanya sekitar sepertiga solar, jadi tangkinya harus tiga kali lebih besar. Menurutmu layak? #Pelayaran"],
    ),
    "EP28_MOTOR_RADAR": dict(
        day="Rabu, 2 Desember 2026", cover="MOTOR YANG BISA MELIHAT", tags="#Otomotif #Motor",
        tiktok="Motor ini bisa melihat mobil di belakangmu dan ikut menjaga jarak saat macet. Honda memperkenalkan SENSING RIDE di EICMA Milan, tapi ini bukan motor radar pertama di dunia. Ini cara kerja radarnya.",
        pin="CARA KERJA VIRAL · EP 28. Sumber: Honda Global (3 Nov 2026), CNN Indonesia, kumparan, Kompas.com, Paul Tan. Ducati memakai radar sejak 2020. Motor tidak mengerem darurat sendiri. Visual ilustrasi, motor generik tanpa logo.",
        ig="Radar membantu melihat, yang menyetir tetap kamu. Fitur mana yang paling kamu mau? Tulis di komentar.",
        points=["3 November 2026 di EICMA Milan, Honda memperkenalkan SENSING RIDE pada Africa Twin Adventure Sports versi DCT; Ducati sudah memakai radar sejak 2020.", "Dua radar gelombang milimeter di depan dan belakang menembakkan gelombang radio lalu mengukur waktu pantulnya untuk tahu jarak.", "Saat mobil di depan melambat, frekuensi pantulan naik sedikit, seperti sirene ambulans mendekat; dari situ motor tahu laju mendekatnya.", "Datanya dipakai cruise control adaptif, lampu spion titik buta, dan Stop & Go yang memanfaatkan transmisi kopling ganda.", "Saat bahaya, layar memberi peringatan dan rem ditambah saat kamu mengerem, tapi motor tidak mengerem darurat sendiri."],
        audio="Chirp radar naik untuk pulsa dan ping turun untuk pantulan di atas beat opening anime yang cepat.",
        alts=["Motor Honda Pertama dengan Radar, Bagaimana Cara Kerjanya?", "Radar Motor: Melihat Mobil di Belakangmu", "Kenapa Radar Motor Butuh Transmisi DCT?"],
        desc="Cara kerja radar motor Honda SENSING RIDE: dua radar gelombang milimeter mengukur waktu pantul dan pergeseran frekuensi untuk tahu jarak dan laju, lalu datanya dipakai cruise control adaptif, peringatan titik buta, dan Stop & Go dengan transmisi kopling ganda. Diperkenalkan di EICMA Milan, 3 November 2026.",
        src="Honda Global, CNN Indonesia, kumparan, Kompas.com, Paul Tan.",
        ytags="honda sensing ride, radar motor, africa twin, eicma 2026, adaptive cruise control, blind spot, dct, cara kerja, otomotif, audira",
        thumb="Motor anime dengan gelombang radar biru dan pink dan judul MOTOR INI BISA MELIHAT (style/cover-topic.png).",
        fb="Bayangkan motor yang punya mata di depan dan di belakang. Ia tahu jarak mobil di depan dari waktu gema radar yang kembali, tahu mobil itu melambat dari nada pantulan yang sedikit naik, dan menyalakan lampu di spion saat ada kendaraan di titik butamu. Honda baru memperkenalkannya di Milan, tapi Ducati sudah lebih dulu sejak 2020. Dan ingat, motornya tidak mengerem darurat sendiri.",
        q="Kamu lebih percaya radar atau insting sendiri saat berkendara?",
        single="Honda SENSING RIDE: dua radar gelombang milimeter membuat motor bisa melihat ke depan dan ke belakang. Tapi ini bukan yang pertama (Ducati sejak 2020), dan motor tidak mengerem darurat sendiri. #Otomotif #CaraKerja",
        thread=["Motor ini bisa melihat mobil di belakangmu dan ikut menjaga jarak saat macet. Tapi bukan motor radar pertama. #CaraKerja", "Radar menembakkan gelombang radio lalu menunggu pantulan. Dari mobil 50 m di depan, gema kembali dalam sepertiga sepersejuta detik.", "Kalau mobil di depan melambat, frekuensi pantulan naik sedikit, seperti sirene ambulans mendekat. Dari situ motor tahu lajunya.", "Saat bahaya, rem ditambah saat kamu mengerem. Motor tidak mengerem darurat sendiri. #Otomotif"],
        th_open="Motor yang bisa melihat mobil di belakangmu. Ini cara kerja radar Honda SENSING RIDE. #CaraKerja",
        th=["Dua radar gelombang milimeter di depan dan belakang mengukur waktu pantul untuk jarak dan pergeseran frekuensi untuk laju. Datanya dipakai cruise control adaptif, lampu spion titik buta, dan Stop & Go yang memanfaatkan transmisi kopling ganda.", "Ducati sudah memakai radar sejak 2020. Dan meski sistem menambah tenaga rem saat kamu mengerem, motor tidak mengerem darurat sendiri. Kamu mau fitur ini? #Otomotif"],
    ),
    "EP29_DRONE_TERMAL_SAR": dict(
        day="Kamis, 3 Desember 2026", cover="DRONE YANG MELIHAT PANAS", tags="#SAR #Drone",
        tiktok="Di lereng Semeru yang sedang erupsi, tim SAR gabungan memakai drone termal untuk mencari dua pendaki muda. Drone ini tidak melihat cahaya, ia melihat panas. Bagaimana caranya, dan apa batasnya?",
        pin="CARA KERJA VIRAL · EP 29. Sumber: Kompas.id, Kompas.com, Antara Jatim (pernyataan BB TNBTS), RRI, JPNN, DJI Enterprise (spesifikasi kamera termal referensi). Status pencarian per 10 Nov 2026: masih berjalan. Model drone tidak disebut sumber; visual ilustrasi, drone generik.",
        ig="Kamera termal tidak melihat manusia, ia melihat beda suhu. Doa terbaik untuk tim SAR dan keluarga. Patuhi jalur resmi saat mendaki.",
        points=["Tim SAR gabungan mencari dua pendaki muda yang tak ada kabar sejak 2 November; pencarian dimulai 7 November dan di hari ketiga 106 personel dibagi enam regu.", "Semua benda memancarkan inframerah; tubuh manusia memancar paling kuat sekitar 9,5 mikrometer, dan lensa kamera termal dibuat dari germanium karena kaca menghalanginya.", "Di balik lensa ada mikrobolometer: inframerah menghangatkan tiap piksel sehingga hambatan listriknya berubah dan dibaca puluhan kali per detik.", "Kamera termal tidak tembus daun, batu, kaca, atau air; batu terpanggang matahari dan uap fumarol bisa jadi sinyal palsu.", "Drone menyapu sektor dalam jalur sejajar, operator mengunci koordinat titik panas, lalu tim darat datang memastikan."],
        audio="Pad malam yang tenang dengan ping sensor lembut dan angin gunung; tanpa sirene.",
        alts=["Drone Termal Tim SAR, Bagaimana Cara Kerjanya?", "Kamera yang Melihat Panas, Bukan Cahaya", "Kenapa Drone Termal Tetap Butuh Tim Darat?"],
        desc="Cara kerja drone termal tim SAR: inframerah dari tubuh, lensa germanium, sensor mikrobolometer, warna dari suhu, batas kamera termal, dan pola sapuan jalur sejajar. Dipicu pencarian dua pendaki di lereng Gunung Semeru, November 2026. Tanpa nama, kondisi, atau hasil pencarian.",
        src="Kompas.id, Kompas.com, Antara Jatim, RRI, JPNN, DJI Enterprise, Edmund Optics.",
        ytags="drone termal, kamera termal, tim sar, semeru, basarnas, inframerah, mikrobolometer, pencarian pendaki, cara kerja, audira",
        thumb="Drone termal di atas lereng gunung dalam palet ironbow dengan judul DRONE TERMAL MELIHAT PANAS (style/cover-topic.png).",
        fb="Tubuh kita selalu memancarkan cahaya yang tidak bisa dilihat mata: inframerah. Kamera termal di drone tim SAR menangkapnya dan mengubah beda suhu menjadi warna. Tapi kamera ini tidak bisa menembus daun, batu, atau air, dan batu yang terpanggang matahari pun bisa ikut menyala. Karena itu drone hanya memperluas mata; yang memastikan tetap tim di darat. Doa terbaik untuk tim SAR di Semeru.",
        q="Kamu pernah mendaki lewat jalur resmi? Bagikan pengalamanmu soal keselamatan pendakian.",
        single="Drone termal tim SAR tidak melihat cahaya, ia melihat beda suhu. Tapi ia tak tembus daun, batu, atau air, dan batu panas bisa jadi sinyal palsu. Drone memperluas mata, tim darat yang memastikan. #SAR #CaraKerja",
        thread=["Di lereng Semeru yang sedang erupsi, ada anggota tim SAR yang tidak melihat cahaya. Ia melihat panas. #CaraKerja", "Tubuh manusia memancar paling kuat di sekitar 9,5 mikrometer, tak terlihat mata. Kaca menghalanginya, jadi lensanya dari germanium.", "Di balik lensa ada mikrobolometer: inframerah menghangatkan tiap piksel, hambatan listriknya berubah, chip membacanya puluhan kali per detik.", "Drone menyapu jalur sejajar dan mengunci titik panas, lalu tim darat memastikan. Patuhi jalur resmi. #SAR"],
        th_open="Drone termal yang dipakai tim SAR di Semeru tidak melihat cahaya, ia melihat panas. Ini cara kerjanya. #CaraKerja",
        th=["Semua benda memancarkan inframerah. Lensa germanium meneruskannya ke mikrobolometer, ratusan ribu piksel mungil yang menghangat dan berubah hambatannya. Tiap suhu lalu diberi warna: dingin gelap, hangat jingga, terpanas putih.", "Batasnya nyata: tak tembus daun, batu, kaca, atau air, dan batu terpanggang matahari bisa jadi sinyal palsu. Drone memperluas mata, tim darat yang memastikan. Patuhi jalur resmi saat mendaki. #SAR"],
    ),
    "EP30_ASTRONOT_MENCOBLOS": dict(
        day="Jumat, 4 Desember 2026", cover="MENCOBLOS DARI LUAR ANGKASA", tags="#Antariksa #Pemilu",
        tiktok="Bilik suara paling jauh di dunia ada 400 kilometer di atas kepala kita. Tiga astronaut NASA ikut pemilu sela Amerika dari Stasiun Luar Angkasa Internasional. Bagaimana surat suaranya pulang ke Bumi? Ini jalurnya.",
        pin="CARA KERJA VIRAL · EP 30. Sumber: Space.com, TIME, 20detik, Kompas.com, Liputan6, NASA (penjelasan umum jalur TDRS). Jalur yang ditampilkan adalah jalur yang biasa dijelaskan NASA, bukan rincian teknis pemilu 2026. Visual ilustrasi.",
        ig="Sejauh apa pun bilik suaranya, prosesnya sama: minta, isi, kirim, rahasia. Bagian mana yang paling bikin kaget? Tulis di komentar.",
        points=["3 November 2026, tiga astronaut NASA di Stasiun Luar Angkasa Internasional ikut memilih dalam pemilu sela Amerika Serikat dari kabin tidurnya.", "Sebelum terbang, astronaut meminta surat suara seperti warga Amerika di luar negeri, berdasarkan Bab 106 Undang-Undang Pemilu Texas.", "Petugas pemilu menyiapkan surat suara elektronik terenkripsi yang dikirim Mission Control Houston dengan kunci akses khusus tiap astronaut.", "Jalur pulang yang biasa dijelaskan NASA: satelit relay TDRS, antena White Sands di New Mexico, Mission Control, lalu petugas pemilu.", "Stasiun melaju 28.000 km/jam sehingga antena darat hanya melihatnya beberapa menit; lewat relay geostasioner, perjalanan sekitar 72.000 km butuh kira-kira seperempat detik."],
        audio="Kotak musik celesta dan desir lipatan kertas, dengan blip telemetri tiap lompatan relay.",
        alts=["Bagaimana Astronaut Memilih dari Luar Angkasa?", "Bilik Suara 400 Km di Atas Kepala", "Jalur Surat Suara dari Stasiun Luar Angkasa"],
        desc="Cara astronaut NASA memilih dari Stasiun Luar Angkasa Internasional: meminta surat suara sebelum terbang, menerima surat suara elektronik terenkripsi lewat Mission Control, lalu mengirimnya pulang lewat satelit relay TDRS dan antena White Sands. Dipicu pemilu sela Amerika Serikat, 3 November 2026.",
        src="Space.com, TIME, 20detik, Kompas.com, Liputan6, NASA.",
        ytags="astronaut memilih, pemilu luar angkasa, iss, nasa, tdrs, pemilu sela amerika, white sands, cara kerja, antariksa, audira",
        thumb="Stasiun luar angkasa kertas di atas planet kertas dengan judul Bilik suara paling jauh (style/cover-topic.png).",
        fb="Bayangkan kamu mencoblos dari ketinggian 400 kilometer, sambil melaju 28.000 km per jam. Itulah yang dilakukan tiga astronaut NASA saat pemilu sela Amerika. Surat suaranya tidak dikirim langsung ke Bumi, tapi naik dulu ke satelit relay hampir 36.000 km di atas khatulistiwa, baru turun ke antena di New Mexico. Total sekitar 72.000 km, dalam kira-kira seperempat detik, dan isinya tetap rahasia.",
        q="Menurutmu, kapan WNI di luar angkasa pertama kali ikut pemilu?",
        single="Bilik suara paling jauh di dunia: 400 km di atas kepala kita. Surat suara astronaut naik dulu ke satelit relay TDRS, turun ke White Sands, lalu ke petugas pemilu. Sekitar 72.000 km, seperempat detik. #Antariksa #CaraKerja",
        thread=["Bilik suara paling jauh di dunia: 400 km di atas kepala kita. Bagaimana surat suaranya pulang? #CaraKerja", "Sebelum terbang, astronaut meminta surat suara seperti warga Amerika di luar negeri. Dasarnya Bab 106 UU Pemilu Texas.", "Surat suara elektronik terenkripsi dikirim Mission Control ke stasiun. Jalur pulangnya lewat satelit relay TDRS dan antena White Sands.", "Total sekitar 72.000 km dalam kira-kira seperempat detik, dan isinya tetap rahasia. #Antariksa"],
        th_open="Tiga astronaut NASA ikut pemilu sela Amerika dari 400 km di atas Bumi. Ini jalur surat suaranya. #CaraKerja",
        th=["Astronaut meminta surat suara sebelum terbang, seperti warga di luar negeri. Surat suara elektronik terenkripsi dikirim lewat Mission Control Houston, diisi di laptop, lalu pulang lewat satelit relay TDRS dan antena White Sands di New Mexico.", "Kenapa memutar? Stasiun melaju 28.000 km/jam, jadi antena darat hanya melihatnya beberapa menit, sedangkan relay geostasioner hampir selalu melihatnya. Total sekitar 72.000 km, seperempat detik. #Antariksa"],
    ),
}


for name, e in E.items():
    D = DOCS[name]
    T = json.load(open(f"{name}/timeline.json", encoding="utf8"))
    chapters = "\n".join(f"{fmt(0 if i == 0 else s['start'])} {c}" for i, (s, c) in enumerate(zip(T["scenes"], D["ch"])))
    pts = "\n".join(f"{i + 1}. {p}" for i, p in enumerate(e["points"]))
    alts = "\n".join(f"- {a}" for a in e["alts"])
    thread = "\n\n".join(f"{i + 1}/ {t}" for i, t in enumerate(e["thread"]))
    tags = f"{e['tags']} {BASE}"
    th = "\n\n".join(f"{i + 1}/ {t}" for i, t in enumerate(e["th"]))
    n = D["n"]
    prev = f"EP {int(n) - 1:02}" 
    md = f"""# SOCIAL CAPTIONS, EP {n}: {D['title']}

## TikTok

**Hook:** {D['hook']}

**Cover Text:** {e['cover']}

**Caption:** {e['tiktok']}

**Pinned Comment:** {e['pin']}

**Hashtags:** {tags}

## Instagram Reels

**Caption:** {e['ig']}

**5-Point Value Breakdown:**

{pts}

**Audio Cue:** {e['audio']}

**Hashtags:** {tags}

## YouTube Shorts

**Judul:** {D['title']}

**Alternatif Judul:**
{alts}

**Deskripsi:**

{e['desc']}

Chapters:
{chapters}

Sumber: {e['src']}

Created by Agus Dwi R. AUDIRA.

{tags}

**Tags:** {e['ytags']}

**Pinned Comment:** {e['pin']}

**Thumbnail:** {e['thumb']}

## Facebook Reels

**Caption:** {e['fb']}

**Discussion Trigger:** {e['q']}

**Hashtags:** {tags}

## X/Twitter

**Cuitan tunggal:** {e['single']}

**Viral Hook Thread:**

{thread}

## Threads

**Post pembuka:**

{e['th_open']}

**Utas:**

{th}

## Jadwal Upload (WIB)

Hari tayang: {e['day']}. Default awal pola umum penonton Indonesia (slot utama malam), bukan data akun; ganti dengan jam aktif follower dari analytics setelah 2-4 minggu.

- TikTok: {e['day']}, 19.00 WIB
- Instagram Reels: {e['day']}, 19.20 WIB
- YouTube Shorts: {e['day']}, 19.40 WIB
- Facebook Reels: {e['day']}, 20.00 WIB
- X/Twitter: {e['day']}, 20.20 WIB
- Threads: {e['day']}, 20.40 WIB

## Label Konten AI

Voice over dan visual dibuat dengan AI, jadi centang labelnya saat upload:

- TikTok: aktifkan "AI-generated content".
- YouTube: pilih "Altered or synthetic content" = Ya.
- Meta (Facebook dan Instagram): aktifkan label "AI info".

## Catatan Upload

- Teks cover 3-5 kata per platform: {e['cover']}
- Upload `SUBTITLES.srt` dari folder episode ke YouTube dan Facebook.
- Komentar pin: sebut nomor seri "CARA KERJA VIRAL · EP {n}", playlist "Cara Kerja Viral", dan tautan {prev}.
- Musik dan SFX disintesis sendiri di `mix.py`, tanpa lisensi pihak ketiga (dicatat di SOURCE_REGISTER.md).
"""
    Path(name, "SOCIAL_CAPTIONS.md").write_text(md, encoding="utf8")
    print(name, "title", len(D["title"]), "threads", len(e["th_open"]), [len(t) for t in e["th"]], "single", len(e["single"]), [len(f"{i + 1}/ {t}") for i, t in enumerate(e["thread"])])
