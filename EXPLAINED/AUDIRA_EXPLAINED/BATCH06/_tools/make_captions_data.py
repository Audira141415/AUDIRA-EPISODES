"""Build _tools/captions_data.json for Batch 6 (facts limited to SCRIPT.md + RESEARCH_REPORT.md). Usage (from BATCH06): python _tools/make_captions_data.py"""
import json
import openpyxl

wb = openpyxl.load_workbook("../AUDIRA_EXPLAINED_Master_Episode_365_v2.xlsx", read_only=True)
TITLE = {}
for r in wb.worksheets[0].iter_rows(values_only=True):
    if r and isinstance(r[0], str) and r[0].startswith("AE-"):
        TITLE[r[0]] = str(r[3]).rstrip("?")

D = {}

D["ep065"] = dict(
    no=65, date="Senin, 30 November 2026", prev=f"AE-062 {TITLE['AE-062']} (Batch 5)",
    title="Jembatan Seberat 1.000 Ton Bisa Diangkat Motor Kecil, Ini Rahasianya",
    hook="Jalan raya ini sebentar lagi berdiri hampir tegak. Mobil berhenti, dan kapal tinggi lewat di bawahnya.",
    cover="JALAN BERDIRI TEGAK",
    tags="#Jembatan #Teknik #CaraKerja #TowerBridge #AUDIRA",
    tt="Jembatan jungkit (bascule) punya rahasia: di belakang poros ada pemberat besar. Daun jembatan dan pemberat jadi satu jungkat-jungkit yang hampir seimbang, jadi motor kecil cukup melawan selisihnya, gesekan, dan angin. Daun Tower Bridge beratnya lebih dari seribu ton.",
    pin="AUDIRA EXPLAINED #65. Sumber: situs resmi Tower Bridge (How does Tower Bridge work, Engine Rooms, Bascule Chambers), Multnomah County (operator jembatan Portland), catatan sejarah Jembatan Ampera. Visual ilustrasi bergaya gambar teknik lawas.",
    points=[
        "Saat jembatan dibuka, lampu jadi merah, palang turun, dan jalan dikosongkan beberapa menit.",
        "Tiap daun jembatan berputar pada poros di dalam pilar.",
        "Ekor daun di belakang poros membawa pemberat besar.",
        "Motor memutar roda gigi kecil yang menggigit rak gigi lengkung; pemberat turun, ujung jalan naik.",
        "Ampera di Palembang dulu jembatan angkat lurus (vertical lift), berhenti diangkat sejak 1970.",
    ],
    ig="Jembatan seberat ribuan ton bisa berdiri tegak cuma karena seimbang. Kamu pernah lihat jembatan dibuka langsung? Cerita di komentar.",
    audio="Dengarkan bel peringatan, derak roda gigi, dan klakson kapal yang lewat di bawah jembatan.",
    alt=["Kenapa Jembatan Bisa Berdiri Tegak?", "Rahasia Pemberat di Dalam Pilar Jembatan", "Jembatan Ampera Dulu Bisa Diangkat"],
    desc="Bagaimana jembatan angkat bekerja? Video ini membedah jembatan jungkit (bascule): daun jembatan berputar pada poros di dalam pilar, ekornya membawa pemberat besar, dan motor memutar roda gigi pada rak gigi lengkung. Kuncinya keseimbangan, seperti jungkat-jungkit. Contohnya Tower Bridge di London, dan Jembatan Ampera di Palembang yang dulu bisa diangkat lurus sampai 1970.",
    ytags="jembatan angkat, bascule bridge, jembatan jungkit, tower bridge, jembatan ampera, palembang, cara kerja jembatan, pemberat, counterweight, teknik sipil, infrastruktur, edukasi, audira explained, AUDIRA",
    ytpin="AUDIRA EXPLAINED #65 (playlist AUDIRA EXPLAINED). Catatan: angka sudut buka dan berat pasti Tower Bridge berbeda antarsumber, jadi kami pakai \"hampir tegak\" dan \"lebih dari seribu ton\".",
    thumb="Jembatan gaya gambar tinta lawas di kertas tua, daun jalan terangkat tinggi dan kapal layar lewat di bawah, teks: JALAN BERDIRI TEGAK",
    fb="Pernah lihat jalan raya berdiri hampir tegak supaya kapal bisa lewat? Itu jembatan jungkit. Rahasianya bukan motor raksasa, tapi pemberat besar di ekor daun jembatan, di belakang poros di dalam pilar. Daun dan pemberat jadi satu jungkat-jungkit yang hampir seimbang, jadi motor cuma melawan selisih kecil, gesekan, dan angin. Jembatan Ampera di Palembang dulu juga bisa diangkat, dengan cara naik lurus seperti lift, sampai berhenti sejak 1970.",
    fbq="Menurutmu, Jembatan Ampera sebaiknya bisa diangkat lagi atau tidak?",
    x1="Daun Tower Bridge beratnya lebih dari 1.000 ton, tapi motornya kecil. Rahasianya pemberat di balik poros: daun + pemberat = jungkat-jungkit yang hampir seimbang. #Jembatan #AUDIRA",
    thread=[
        "1/ Jalan raya bisa berdiri hampir tegak supaya kapal tinggi lewat. Namanya jembatan jungkit atau bascule. #Jembatan",
        "2/ Tiap daun berputar pada poros di dalam pilar. Di belakang poros, ekor daun membawa pemberat besar.",
        "3/ Motor memutar roda gigi kecil di rak gigi lengkung. Daun + pemberat hampir seimbang, jadi motor cuma melawan selisih, gesekan, dan angin.",
        "4/ Ampera di Palembang dulu naik lurus seperti lift, sampai berhenti diangkat sejak 1970. #Teknik #AUDIRA",
    ],
    th=[
        "Jalan raya bisa berdiri hampir tegak supaya kapal tinggi lewat. Namanya jembatan jungkit atau bascule, dan rahasianya ada di dalam pilar. #Jembatan",
        "Di belakang poros, ekor daun jembatan membawa pemberat besar. Daun dan pemberat jadi satu jungkat-jungkit yang hampir seimbang, jadi motor kecil cukup melawan selisihnya, gesekan, dan angin.",
        "Jembatan Ampera di Palembang dulu juga bisa diangkat, naik lurus seperti lift, sampai berhenti sejak 1970. Kamu pernah lihat jembatan dibuka langsung?",
    ],
)

D["ep066"] = dict(
    no=66, date="Selasa, 1 Desember 2026", prev="AE-065 Bagaimana Jembatan Bisa Diangkat agar Kapal Bisa Lewat",
    title="Pilot Tidak Bebas Terbang: Begini Menara ATC Mengatur Bandara",
    hook="Pilot tidak bebas terbang atau mendarat sendiri. Setiap gerakan di bandara menunggu izin.",
    cover="SEMUA MENUNGGU IZIN",
    tags="#Penerbangan #ATC #Bandara #CaraKerja #AUDIRA",
    tt="Di bandara sibuk, izin dibagi ke beberapa petugas: Delivery memberi izin rute, Ground mengatur taxiway, Tower mengatur landasan, lalu Approach memakai radar. Pesawat baru boleh terbang setelah mendengar \"cleared for takeoff\". Di Indonesia semuanya dipegang AirNav Indonesia.",
    pin="AUDIRA EXPLAINED #66. Sumber: FAA Aeronautical Information Manual (lampu taxiway, stop bar, operasi bandara, wake turbulence), FAA Pilot/Controller Glossary, situs resmi AirNav Indonesia, PP 77/2012. Visual ilustrasi kaca hologram. Episode sebelumnya: AE-065 Jembatan Angkat.",
    points=[
        "Delivery memberi izin rute, Ground mengatur pesawat di taxiway, Tower mengatur landasan.",
        "\"Line up and wait\" artinya masuk landasan lalu diam; terbang hanya setelah \"cleared for takeoff\".",
        "Setelah mengudara, Approach memakai radar untuk menjaga jarak antarpesawat.",
        "Lampu taxiway: tepi biru, garis tengah hijau; di bandara yang memasangnya ada stop bar merah.",
        "Pesawat besar meninggalkan pusaran udara, jadi pesawat berikutnya diberi jarak lebih jauh.",
    ],
    ig="Satu kata yang membuat langit tetap tertib: izin. Kamu baru tahu taxiway punya lampu lalu lintas sendiri? Tulis di komentar.",
    audio="Dengarkan suara radio menara, dengung mesin jet, dan bunyi radar yang berputar.",
    alt=["Kenapa Pilot Harus Minta Izin untuk Setiap Gerakan?", "Lampu Merah di Landasan Pacu", "Arti \"Cleared for Takeoff\""],
    desc="Bagaimana menara pengawas bandara mengatur pesawat? Di bandara sibuk, izin dibagi ke Delivery (rute), Ground (taxiway), dan Tower (landasan). Kata-katanya baku: \"line up and wait\" lalu \"cleared for takeoff\". Setelah terbang, Approach menjaga jarak dengan radar. Taxiway punya lampu biru dan hijau, sebagian bandara memasang stop bar merah, dan pesawat besar meninggalkan pusaran udara. Di Indonesia, pemanduan ini dipegang AirNav Indonesia.",
    ytags="menara atc, air traffic control, pemandu lalu lintas udara, bandara, pilot, cleared for takeoff, line up and wait, taxiway, stop bar, wake turbulence, airnav indonesia, penerbangan, edukasi, audira explained, AUDIRA",
    ytpin="AUDIRA EXPLAINED #66 (playlist AUDIRA EXPLAINED). Catatan: stop bar tidak dipasang di semua bandara, dan bandara tanpa menara memakai prosedur lain.",
    thumb="Bandara malam dalam gaya kaca hologram, strip penerbangan AUDIRA 66 dan lampu taxiway hijau-biru, teks: SEMUA MENUNGGU IZIN",
    fb="Banyak yang mengira pilot bebas lepas landas kapan saja. Faktanya, setiap gerakan di bandara menunggu izin. Di bandara sibuk izin itu dibagi: Delivery untuk rute, Ground untuk taxiway, Tower untuk landasan, lalu Approach memakai radar setelah pesawat mengudara. Bahkan ada lampu merah di taxiway: selama stop bar menyala, pilot tidak boleh melintas walau sudah diberi izin lisan.",
    fbq="Kalau jadi petugas menara, bagian mana yang menurutmu paling menegangkan?",
    x1="Pilot tidak bebas lepas landas. Delivery beri izin rute, Ground atur taxiway, Tower atur landasan, Approach jaga jarak pakai radar. Tanpa \"cleared for takeoff\", pesawat diam. #ATC #AUDIRA",
    thread=[
        "1/ Pilot tidak bebas terbang atau mendarat sendiri. Setiap gerakan di bandara menunggu izin. #ATC",
        "2/ Di bandara sibuk izin dibagi: Delivery untuk rute, Ground untuk taxiway, Tower untuk landasan, Approach untuk jarak di udara.",
        "3/ \"Line up and wait\" = masuk landasan lalu diam. Terbang hanya setelah \"cleared for takeoff\".",
        "4/ Taxiway punya lampu: tepi biru, tengah hijau, dan di sebagian bandara stop bar merah. Merah menyala = jangan lewat. #Bandara #AUDIRA",
    ],
    th=[
        "Pilot tidak bebas terbang atau mendarat sendiri. Setiap gerakan di bandara menunggu izin, dan izin itu dibagi ke beberapa petugas. #ATC",
        "Delivery memberi izin rute, Ground mengatur taxiway, Tower mengatur landasan. \"Line up and wait\" artinya masuk landasan lalu diam, dan pesawat baru terbang setelah \"cleared for takeoff\".",
        "Taxiway juga punya lampu lalu lintas: tepi biru, tengah hijau, dan di sebagian bandara ada stop bar merah. Di Indonesia semua pemanduan dipegang AirNav Indonesia. Kamu baru tahu?",
    ],
)

D["ep069"] = dict(
    no=69, date="Rabu, 2 Desember 2026", prev="AE-066 Bagaimana Menara Pengawas Bandara Mengatur Pergerakan Pesawat",
    title="Air Bekas Mandimu Bisa Kembali ke Sungai Lebih Bersih, Begini Caranya",
    hook="Air bekas mandimu bisa kembali ke sungai jauh lebih bersih. Syaratnya, rumahmu tersambung ke IPAL.",
    cover="PEKERJANYA BAKTERI",
    tags="#Lingkungan #AirLimbah #IPAL #CaraKerja #AUDIRA",
    tt="Di IPAL, saringan menahan sampah, pasir diendapkan, lalu bakteri memakan kotoran terlarut di bak yang ditiup udara. Di IPAL Krukut, Jakarta, BOD turun dari sekitar 150 jadi di bawah 30 mg/L. Lebih bersih, tapi tetap bukan air minum.",
    pin="AUDIRA EXPLAINED #69. Sumber: Kementerian PUPR (IPAL Krukut), Perumda Paljaya, Beritajakarta.id (IPAL MBBR Setiabudi), World Bank Blogs, Permen LH 11/2025 baku mutu air limbah domestik. Kebanyakan rumah di kota masih memakai tangki septik. Visual ilustrasi diorama kertas. Episode sebelumnya: AE-066 Menara ATC.",
    points=[
        "Kebanyakan rumah di kota masih memakai tangki septik; hanya kawasan berpipa yang tersambung ke IPAL.",
        "Saringan batang menahan sampah, pasir diendapkan, kotoran berat turun di bak yang tenang.",
        "Udara ditiupkan dari dasar bak supaya bakteri memakan kotoran terlarut.",
        "Di Jakarta, bakteri menempel di potongan plastik kecil yang terus berputar (MBBR).",
        "IPAL Krukut: BOD turun dari sekitar 150 jadi di bawah 30 mg/L, lalu didesinfeksi sebelum ke sungai.",
    ],
    ig="Pekerja terpenting di IPAL bukan mesin, tapi bakteri. Rumahmu sudah tersambung pipa limbah atau masih tangki septik? Jawab di komentar.",
    audio="Dengarkan aliran air di pipa, gelembung udara di bak aerasi, dan gemericik air bersih ke sungai.",
    alt=["Bakteri yang Membersihkan Air Limbah Jakarta", "Ke Mana Air Bekas Mandimu Pergi?", "Cara Kerja IPAL Kota"],
    desc="Bagaimana sistem sewerage kota mengolah air limbah? Di kawasan berpipa, air kamar mandi dan kloset mengalir ke IPAL. Di sana saringan batang menahan sampah, pasir diendapkan, kotoran berat mengendap, lalu bakteri di bak beraerasi memakan kotoran terlarut. Di Jakarta bakteri menempel di potongan plastik yang berputar. Di IPAL Krukut, BOD turun dari sekitar 150 jadi di bawah 30 mg/L sebelum air didesinfeksi dan dialirkan ke sungai.",
    ytags="ipal, pengolahan air limbah, sewerage, air limbah domestik, ipal krukut, paljaya, jakarta, bakteri, mbbr, bod, tangki septik, lingkungan, sungai, edukasi, audira explained, AUDIRA",
    ytpin="AUDIRA EXPLAINED #69 (playlist AUDIRA EXPLAINED). Catatan: cakupan pipa limbah Jakarta masih kecil; angka pastinya berbeda antarsumber. Air hasil IPAL tetap bukan air minum.",
    thumb="Diorama kertas IPAL dengan pipa dari rumah ke bak-bak pengolahan dan zoom bakteri di potongan plastik, teks: PEKERJANYA BAKTERI",
    fb="Pernah kepikiran ke mana air bekas mandimu pergi? Kebanyakan rumah di kota masih memakai tangki septik. Tapi di kawasan berpipa, air itu mengalir ke IPAL: sampah disaring, pasir diendapkan, lalu jutaan bakteri memakan kotoran terlarut di bak yang ditiup udara. Di IPAL Krukut, Jakarta, ukuran kotoran yang mencuri oksigen sungai (BOD) turun dari sekitar 150 jadi di bawah 30 mg/L. Lebih bersih, tapi tetap bukan air minum.",
    fbq="Menurutmu, kota kita lebih perlu memperluas pipa limbah atau merawat tangki septik?",
    x1="Pekerja terpenting di IPAL itu bakteri. Udara ditiup dari dasar bak, bakteri memakan kotoran. Di IPAL Krukut, BOD turun dari ±150 ke <30 mg/L. Tapi tetap bukan air minum. #AirLimbah #AUDIRA",
    thread=[
        "1/ Air bekas mandimu bisa kembali ke sungai jauh lebih bersih, asal rumahmu tersambung ke IPAL. #AirLimbah",
        "2/ Kebanyakan rumah kota masih pakai tangki septik. Di kawasan berpipa, air mengalir ke IPAL lewat pipa miring di bawah jalan.",
        "3/ Saringan menahan sampah, pasir diendapkan, lalu bakteri memakan kotoran di bak yang ditiup udara. Di Jakarta bakteri menempel di potongan plastik berputar.",
        "4/ IPAL Krukut: BOD turun dari ±150 ke <30 mg/L, lalu didesinfeksi. Lebih bersih, tetap bukan air minum. #Lingkungan #AUDIRA",
    ],
    th=[
        "Air bekas mandimu bisa kembali ke sungai jauh lebih bersih, asal rumahmu tersambung ke IPAL. Kebanyakan rumah kota masih memakai tangki septik. #AirLimbah",
        "Di IPAL, saringan menahan sampah, pasir diendapkan, lalu bakteri memakan kotoran terlarut di bak yang ditiup udara. Di Jakarta, bakteri menempel di potongan plastik kecil yang terus berputar.",
        "Di IPAL Krukut, BOD turun dari sekitar 150 jadi di bawah 30 mg/L sebelum air didesinfeksi dan dialirkan ke sungai. Lebih bersih, tapi tetap bukan air minum.",
    ],
)

D["ep071"] = dict(
    no=71, date="Kamis, 3 Desember 2026", prev="AE-069 Bagaimana Sistem Sewerage Kota Mengolah Air Limbah",
    title="Jangan Ganjal Pintu Darurat: Begini Gedung Menahan Api",
    hook="Api di satu ruangan bisa ditahan supaya tidak menjalar ke ruang sebelah. Setidaknya untuk waktu tertentu.",
    cover="JANGAN GANJAL PINTUNYA",
    tags="#Kebakaran #Keselamatan #Gedung #CaraKerja #AUDIRA",
    tt="Gedung dibagi kompartemen dengan dinding dan lantai tahan api, misalnya 60 menit. Lubang pipa dan kabel disumbat penyetop api, sprinkler pecah per kepala karena panas, dan pintu tahan api wajib menutup sendiri. Pintu yang diganjal sama saja melubangi dinding pemisah api.",
    pin="AUDIRA EXPLAINED #71. Sumber: Permen PU 26/PRT/M/2008 (proteksi kebakaran bangunan gedung), katalog SNI BSN, UK Home Office fact sheet pintu tahan api, laporan Grenfell Tower Inquiry. Ketahanan api selalu terbatas waktu. Visual ilustrasi kamera termal. Episode sebelumnya: AE-069 Pengolahan Limbah.",
    points=[
        "Gedung dibagi kompartemen; ketahanan api dinding dan lantai diukur dalam menit, misalnya 60 menit.",
        "Pipa dan kabel yang menembus dinding disumbat bahan penyetop api (firestop).",
        "Bulb kaca sprinkler pecah karena panas, jadi hanya kepala di atas api yang menyemprot.",
        "Pintu tahan api wajib menutup sendiri; pintu yang diganjal merusak kompartemen.",
        "Gedung lebih tinggi dari 24 meter: tangga darurat diberi tekanan udara agar asap terdorong keluar.",
    ],
    ig="Satu kebiasaan kecil bisa merusak seluruh sistem tahan api: mengganjal pintu darurat. Di kantormu masih ada yang begitu? Tulis di komentar.",
    audio="Dengarkan api yang berderak, bulb kaca yang pecah, dan pintu darurat yang menutup sendiri.",
    alt=["Kenapa Pintu Darurat Harus Selalu Tertutup?", "Sprinkler Tidak Menyemprot Bersamaan", "Rahasia Gedung Menahan Api 60 Menit"],
    desc="Bagaimana gedung dirancang agar api tidak cepat menjalar? Gedung dibagi kompartemen dengan dinding dan lantai tahan api yang ketahanannya diukur dalam menit. Lubang pipa dan kabel disumbat penyetop api, sprinkler pecah per kepala karena panas, pintu tahan api wajib menutup sendiri, dan di gedung lebih tinggi dari 24 meter tangga darurat diberi tekanan udara. Semua ini membeli waktu untuk evakuasi.",
    ytags="gedung tahan api, kompartemen kebakaran, pintu tahan api, pintu darurat, sprinkler, firestop, tangga darurat, presurisasi tangga, keselamatan kebakaran, proteksi kebakaran, permen pu 26 2008, edukasi, audira explained, AUDIRA",
    ytpin="AUDIRA EXPLAINED #71 (playlist AUDIRA EXPLAINED). Catatan: tidak ada gedung yang kebal api selamanya; semua rating tahan api terbatas waktu.",
    thumb="Denah gedung dalam warna kamera termal, api oranye tertahan di satu kompartemen dan pintu darurat menutup, teks: JANGAN GANJAL PINTUNYA",
    fb="Di banyak gedung, pintu darurat sering diganjal supaya gampang lewat. Padahal pintu itu bagian dari dinding pemisah api. Gedung dibagi kompartemen yang bisa menahan api untuk waktu tertentu, misalnya 60 menit. Lubang pipa ditutup, sprinkler pecah hanya di atas api, dan di gedung tinggi tangga darurat diberi tekanan udara agar asap keluar. Semua itu membeli waktu evakuasi, dan semuanya gagal kalau pintunya diganjal.",
    fbq="Pernah lihat pintu darurat diganjal di gedung tempatmu? Apa yang sebaiknya dilakukan?",
    x1="Gedung menahan api dengan kompartemen: dinding tahan api 60 menit, lubang pipa disumbat, sprinkler pecah per kepala. Tapi pintu darurat yang diganjal = dinding berlubang. #Kebakaran #AUDIRA",
    thread=[
        "1/ Api di satu ruangan bisa ditahan agar tidak menjalar ke ruang sebelah, untuk waktu tertentu. #Kebakaran",
        "2/ Gedung dibagi kompartemen. Dinding dan lantai tahan api diukur dalam menit, misalnya 60 menit. Lubang pipa dan kabel disumbat penyetop api.",
        "3/ Sprinkler pecah karena panas, per kepala. Jadi hanya kepala di atas api yang menyemprot, bukan semuanya.",
        "4/ Bagian terpenting: pintu tahan api wajib menutup sendiri. Diganjal = melubangi dinding pemisah api. #Keselamatan #AUDIRA",
    ],
    th=[
        "Api di satu ruangan bisa ditahan agar tidak menjalar ke ruang sebelah, setidaknya untuk waktu tertentu. Caranya: gedung dibagi kompartemen tahan api. #Kebakaran",
        "Lubang pipa dan kabel disumbat penyetop api, sprinkler pecah per kepala karena panas, dan di gedung lebih tinggi dari 24 meter tangga darurat diberi tekanan udara supaya asap terdorong keluar.",
        "Bagian terpenting justru pintunya. Pintu tahan api wajib menutup sendiri; kalau diganjal, sama saja melubangi dinding pemisah api. Jadi jangan pernah mengganjal pintu darurat.",
    ],
)

D["ep073"] = dict(
    no=73, date="Jumat, 4 Desember 2026", prev="AE-071 Bagaimana Gedung Dirancang Agar Tidak Mudah Terbakar",
    title="Printer Sebesar Truk Mencetak Rumah, Tapi Bukan Seluruh Rumah",
    hook="Mesin sebesar truk ini tidak menyemprot beton. Ia memerasnya seperti pasta gigi, lapis demi lapis.",
    cover="DIPERAS SEPERTI PASTA",
    tags="#3DPrinting #Konstruksi #Rumah #CaraKerja #AUDIRA",
    tt="Printer rumah memeras tali beton setebal 1–4 cm, mengelilingi denah, lalu naik satu lapis. Adonannya cair saat dipompa tapi kaku setelah keluar, jadi tak perlu cetakan. Di Beckum, Jerman, dindingnya dicetak 100 jam, tapi atap, jendela, dan instalasi tetap dipasang pekerja.",
    pin="AUDIRA EXPLAINED #73. Sumber: PERI 3D Construction (COBOD BOD2, rumah Beckum 2020, FAQ), ICON (Wall System, Titan), Reuters dan New Atlas (Wolf Ranch). Fondasi tetap dicor biasa dan rumah tidak selesai dalam sehari. Visual ilustrasi. Episode sebelumnya: AE-071 Gedung Tahan Api.",
    points=[
        "Model 3D dipotong software jadi lapisan tipis dan jalur gerak kepala cetak.",
        "Fondasi tetap dicor dengan cara biasa.",
        "Mortar khusus dipompa lewat selang; nozzle memeras tali beton setebal 1–4 cm, lapis demi lapis.",
        "Adonan cair saat dipompa, kaku setelah keluar, jadi tahan lapisan di atasnya tanpa cetakan.",
        "Dinding sering berongga (dua kulit + penghubung zigzag), lalu diisi insulasi, besi, atau kabel.",
    ],
    ig="Printer 3D mencetak dinding, bukan seluruh rumah. Kamu mau tinggal di rumah hasil cetak? Jawab di komentar.",
    audio="Dengarkan dengung pompa, desis nozzle yang memeras beton, dan derak gantry yang naik lapis demi lapis.",
    alt=["Rumah Dicetak 100 Jam, Lalu Apa?", "Rahasia Beton yang Bisa Dicetak", "Cara Kerja Printer 3D Rumah"],
    desc="Bagaimana printer 3D membangun rumah? Model 3D dipotong jadi lapisan dan jalur gerak, fondasi dicor biasa, lalu mortar khusus dipompa dan diperas nozzle setebal 1–4 cm, lapis demi lapis. Adonannya cair saat dipompa tapi kaku setelah keluar. Dinding sering berongga dan diisi insulasi, besi, atau kabel. Di Beckum, Jerman, dinding dicetak 100 jam, sedangkan atap, jendela, dan instalasi tetap dipasang pekerja.",
    ytags="3d printing rumah, printer 3d beton, rumah cetak 3d, konstruksi 3d printing, beckum, cobod, icon, mortar, teknologi konstruksi, rumah masa depan, teknik sipil, edukasi, audira explained, AUDIRA",
    ytpin="AUDIRA EXPLAINED #73 (playlist AUDIRA EXPLAINED). Koreksi umum: rumah cetak 3D tidak jadi dalam 24 jam; yang cepat hanya pencetakan dinding.",
    thumb="Nozzle printer memeras tali beton berlapis di atas denah rumah, gantry besar di belakang, teks: DIPERAS SEPERTI PASTA",
    fb="Video rumah dicetak printer 3D sering terlihat ajaib: dinding naik lapis demi lapis. Faktanya, printer sebesar truk itu memeras mortar khusus seperti pasta gigi. Adonannya cair saat dipompa tapi langsung kaku setelah keluar, jadi tidak perlu cetakan. Tapi jam cetak bukan rumah jadi: di Beckum, Jerman, dinding dicetak 100 jam, sedangkan fondasi, atap, jendela, dan instalasi tetap dikerjakan manusia.",
    fbq="Menurutmu, rumah cetak 3D cocok untuk perumahan murah di Indonesia?",
    x1="Printer rumah 3D tidak menyemprot beton, tapi memerasnya seperti pasta gigi, 1–4 cm per tali. Di Beckum, dinding dicetak 100 jam; atap, jendela, instalasi tetap dipasang pekerja. #3DPrinting #AUDIRA",
    thread=[
        "1/ Printer sebesar truk tidak menyemprot beton. Ia memerasnya seperti pasta gigi, lapis demi lapis. #3DPrinting",
        "2/ Model 3D dipotong jadi lapisan dan jalur gerak. Fondasinya tetap dicor biasa.",
        "3/ Rahasianya adonan: cair saat dipompa, kaku setelah keluar. Jadi lapisan bawah kuat menahan lapisan atas tanpa cetakan.",
        "4/ Jam cetak bukan rumah jadi. Di Beckum, Jerman, dinding dicetak 100 jam; atap, jendela, instalasi tetap dipasang pekerja. #Konstruksi #AUDIRA",
    ],
    th=[
        "Printer sebesar truk tidak menyemprot beton. Ia memerasnya seperti pasta gigi, tali beton setebal 1–4 cm, lapis demi lapis. #3DPrinting",
        "Rahasianya adonan: cair saat dipompa, tapi langsung kaku setelah keluar, sehingga kuat menahan lapisan di atasnya tanpa cetakan. Dindingnya sering berongga, lalu diisi insulasi, besi, atau kabel.",
        "Tapi jam cetak bukan rumah jadi. Di Beckum, Jerman, dinding dicetak 100 jam, sedangkan atap, jendela, dan instalasi tetap dipasang pekerja. Kamu mau tinggal di rumah cetak?",
    ],
)

json.dump(D, open("_tools/captions_data.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
for k, e in D.items():
    print(k, "x1", len(e["x1"]), "thread", [len(t) for t in e["thread"]], "th", [len(t) for t in e["th"]], "ytags", len(e["ytags"]), "title", len(e["title"]))
