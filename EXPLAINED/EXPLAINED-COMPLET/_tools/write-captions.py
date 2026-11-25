"""Writes each episode's SOCIAL_CAPTIONS.md (6 platforms, upload schedule, AI label). Chapters come from project/timeline.json.
Run from anywhere after the voice exists: python _tools/write-captions.py"""
import json
from pathlib import Path

SERIES = Path(__file__).resolve().parent.parent
fmt = lambda t: f"{int(t // 60)}:{int(t % 60):02}"
BASE = "#CaraKerja #FaktaUnik #AUDIRA"
PIN = "Channel AUDIRA Explained (@AudiraExplained). Visual ilustrasi, bukan cuplikan asli."

E = {
    "EP01_MICROWAVE": dict(
        day="Senin, 16 November 2026",
        title="Microwave Tidak Memanaskan Piring, Ini Cara Kerjanya", cover="MICROWAVE GOYANG AIR", tags="#Microwave #Sains",
        hook="Microwave tidak memanaskan piringmu. Ia menggoyang air di dalam makanan sampai panas.",
        tiktok="Gelombang mikro 2,45 GHz membuat molekul air di makanan berputar dan panas. Gelombangnya cuma menembus sekitar 1 cm, dan jaring di pintu menahannya karena lubangnya jauh lebih kecil dari 12,2 cm. Kamu pernah iseng nonton piringnya berputar?",
        pin="CARA KERJA BENDA · EP 01. Sumber: Wikipedia (Microwave oven), AMAC, Science Friday. " + PIN,
        ig="Yang dipanaskan microwave sebenarnya air di makananmu. Kamu pernah iseng nonton piringnya berputar? Tulis di komentar.",
        points=["Tahun 1945, permen batangan di saku Percy Spencer meleleh di dekat radar.", "Microwave komersial pertama, Radarange, dijual 2 tahun kemudian.", "Magnetron membuat gelombang sekitar 2,45 GHz dengan panjang 12,2 cm.", "Molekul air ikut berputar mengikuti medan listrik yang bolak-balik, dan itu menghasilkan panas.", "Gelombang cuma menembus sekitar 1 cm; jaring pintu menahannya, tapi cahaya tetap lewat."],
        audio="Musik lab komik yang ceria: pizzicato, marimba, dengung microwave, dan bunyi ding.",
        alts=["Kenapa Microwave Bisa Memanaskan Makanan?", "Rahasia Jaring di Pintu Microwave", "Microwave Ditemukan Gara-Gara Permen Meleleh"],
        desc="Cara kerja microwave: magnetron, gelombang 2,45 GHz, molekul air yang berputar, dan jaring pintu yang menahan gelombang.",
        src="Wikipedia: Microwave oven (dibaca 12 Nov 2026); AMAC (2026); Science Friday (2017)",
        ch=["Hook", "Permen meleleh 1945", "Radarange", "Magnetron", "Molekul air berputar", "Bukan matang dari dalam", "Sangkar Faraday", "Pertanyaan"],
        ytags="cara kerja microwave, microwave, gelombang mikro, magnetron, sains sehari-hari, fakta unik, percy spencer, sangkar faraday, cara kerja benda, audira",
        thumb="Microwave isometrik komik yang dibelah dengan molekul air di makanan, teks MICROWAVE TIDAK MEMANASKAN PIRING (style/cover-topic.png).",
        fb="Pernah heran kenapa piring kadang tetap dingin padahal makanannya panas? Microwave tidak memanaskan piring. Ia menggoyang molekul air di dalam makanan. Dan semua ini ditemukan gara-gara sebatang permen yang meleleh di saku seorang insinyur.",
        q="Kamu pernah iseng menonton piring microwave berputar sampai bunyi ding?",
        single="Microwave tidak memanaskan piring. Gelombang 2,45 GHz membuat molekul air di makanan berputar dan panas, dan jaring pintunya menahan gelombang tapi meloloskan cahaya. #Microwave #CaraKerja",
        thread=["Microwave tidak memanaskan piringmu. Ia menggoyang air di dalam makanan. #CaraKerja", "Tahun 1945, permen di saku Percy Spencer meleleh di dekat radar. Dua tahun kemudian Radarange dijual.", "Magnetron membuat gelombang 2,45 GHz. Molekul air ikut berputar dan menghasilkan panas.", "Lubang jaring di pintu jauh lebih kecil dari 12,2 cm, jadi gelombang tertahan tapi cahaya lewat. #Microwave"],
        th_open="Microwave tidak memanaskan piringmu. Ia menggoyang molekul air di dalam makanan sampai panas. #CaraKerja",
        th=["Gelombangnya cuma menembus sekitar 1 cm, jadi bagian dalam ikut panas karena panas merambat dari luar. Itu sebabnya ada piring putar.", "Kamu pernah iseng nonton piringnya berputar? #Microwave"],
    ),
    "EP02_KULKAS": dict(
        day="Selasa, 17 November 2026",
        title="Kulkas Tidak Membuat Dingin, Ia Memindahkan Panas", cover="KULKAS PINDAHKAN PANAS", tags="#Kulkas #Sains",
        hook="Kulkas sebenarnya tidak membuat dingin. Ia memindahkan panas dari dalam ke luar.",
        tiktok="Refrigeran menguap di evaporator dan menyerap panas dari makanan, lalu kompresor menekannya sampai panas dan kondensor membuang panas itu ke udara ruangan. Pantas belakang kulkas hangat. Kamu pernah sadar?",
        pin="CARA KERJA BENDA · EP 02. Sumber: Wikipedia (Refrigerator, Vapor-compression refrigeration). " + PIN,
        ig="Kulkas bukan pembuat dingin, tapi pengangkut panas. Kamu pernah sadar belakang kulkasmu hangat? Tulis di komentar.",
        points=["Kulkas memindahkan panas dari dalam ke luar, bukan membuat dingin.", "Refrigeran berputar lewat 4 komponen: kompresor, kondensor, katup ekspansi, evaporator.", "Di evaporator, refrigeran menguap dan menyerap panas dari makanan.", "Kompresor menekan uap sampai panas; kondensor membuang panasnya ke udara ruangan.", "Prinsipnya sudah didemonstrasikan William Cullen; kulkas rumah praktis muncul 1915."],
        audio="Pad sintetis dingin dengan dengung kompresor dan bunyi pindai termal.",
        alts=["Kenapa Belakang Kulkas Panas?", "Cara Kerja Kulkas dalam 80 Detik", "Rahasia Refrigeran di Dalam Kulkas"],
        desc="Cara kerja kulkas: refrigeran, kompresor, kondensor, katup ekspansi, dan evaporator yang memindahkan panas dari dalam ke luar.",
        src="Wikipedia: Refrigerator dan Vapor-compression refrigeration (dibaca 12 Nov 2026); Greater Greater Washington (2026)",
        ch=["Hook", "Belakang kulkas hangat", "Empat komponen", "Evaporator menyerap panas", "Kompresor dan kondensor", "Katup ekspansi", "William Cullen dan 1915", "Pertanyaan"],
        ytags="cara kerja kulkas, kulkas, refrigeran, kompresor, kondensor, evaporator, sains sehari-hari, fakta unik, cara kerja benda, audira",
        thumb="Kulkas dalam tampilan kamera termal dengan pipa belakang menyala oranye, teks KULKAS TIDAK MEMBUAT DINGIN (style/cover-topic.png).",
        fb="Coba dekatkan tanganmu ke belakang kulkas: hangat, kan? Itu karena kulkas sebenarnya tidak membuat dingin. Ia mengangkut panas dari makananmu, lalu membuangnya ke udara ruangan lewat pipa di belakang.",
        q="Kamu pernah sadar belakang kulkasmu terasa hangat?",
        single="Kulkas tidak membuat dingin. Refrigeran menyerap panas dari makanan di evaporator, lalu kondensor di belakang kulkas membuang panas itu ke ruangan. #Kulkas #CaraKerja",
        thread=["Kulkas sebenarnya tidak membuat dingin. Ia memindahkan panas. #CaraKerja", "Refrigeran berputar lewat kompresor, kondensor, katup ekspansi, dan evaporator.", "Di evaporator ia menguap dan menyerap panas dari makanan. Kompresor lalu menekannya sampai panas.", "Kondensor membuang panas itu ke udara ruangan. Itu sebabnya belakang kulkas hangat. #Kulkas"],
        th_open="Kulkas sebenarnya tidak membuat dingin. Ia memindahkan panas dari dalam ke luar. #CaraKerja",
        th=["Panas dari makananmu diangkut refrigeran dan dibuang lewat pipa kondensor ke udara ruangan. Siklusnya berulang terus selama kulkas menyala.", "Kamu pernah sadar belakang kulkasmu hangat? #Kulkas"],
    ),
    "EP03_KUNCI_GEMBOK": dict(
        day="Rabu, 18 November 2026",
        title="Rahasia Gerigi Kunci Rumahmu: Cara Kerja Kunci Pin Tumbler", cover="GERIGI KUNCI = KODE", tags="#Kunci #Mekanisme",
        hook="Gerigi kunci rumahmu bukan hiasan. Setiap lekuknya adalah kode rahasia.",
        tiktok="Di dalam kunci silinder ada 5 atau 6 pin berpegas dengan panjang berbeda. Kunci yang benar mengangkat semua pin sejajar di garis batas plug, lalu plug berputar. Kamu pernah salah mencoba kunci di rumah sendiri?",
        pin="CARA KERJA BENDA · EP 03. Sumber: Wikipedia (Pin tumbler lock). " + PIN,
        ig="Setiap kunci membawa pola tinggi pinnya sendiri. Kamu pernah salah mencoba kunci di pintu rumah sendiri? Tulis di komentar.",
        points=["Kunci silinder pin tumbler disebut juga kunci Yale.", "Plug, silinder tempat kunci masuk, harus berputar supaya pintu terbuka.", "Plug punya 5 atau 6 lubang berisi pin berpegas dengan panjang berbeda.", "Kunci yang salah membuat pin tidak sejajar, jadi plug tertahan.", "Prinsip dasarnya sudah ada sekitar 2000 SM di Mesir; Linus Yale menyempurnakannya 1848 dan 1861."],
        audio="Detak mekanis jam dan cello rendah, dengan klik di setiap pin.",
        alts=["Cara Kerja Kunci Rumah", "Kenapa Kunci yang Salah Tidak Bisa Memutar?", "Kunci Pin Tumbler Dijelaskan"],
        desc="Cara kerja kunci pin tumbler (kunci Yale): plug, pin berpegas, dan garis batas yang membuat hanya kunci yang benar bisa membuka pintu.",
        src="Wikipedia: Pin tumbler lock (dibaca 12 Nov 2026)",
        ch=["Hook", "Kunci Yale", "Plug", "Pin berpegas", "Kunci salah", "Kunci benar", "Sejak 2000 SM", "Pertanyaan"],
        ytags="cara kerja kunci, kunci pin tumbler, kunci yale, gembok, mekanisme kunci, sains sehari-hari, fakta unik, cara kerja benda, linus yale, audira",
        thumb="Kunci kuningan dengan gerigi menyala dan angka kode, teks GERIGI KUNCI ADALAH KODE (style/cover-topic.png).",
        fb="Pernah perhatikan gerigi kunci rumahmu? Lekuk-lekuk itu bukan hiasan. Setiap lekuk mengangkat satu pin di dalam kunci sampai ketinggian yang pas. Kalau semuanya sejajar, baru pintunya bisa terbuka.",
        q="Kamu pernah salah mencoba kunci di pintu rumah sendiri?",
        single="Gerigi kunci itu kode. Tiap lekuk mengangkat satu pin berpegas sampai semua sejajar di garis batas plug. Kunci salah, pin tidak sejajar, pintu tetap terkunci. #Kunci #CaraKerja",
        thread=["Gerigi kunci rumahmu bukan hiasan. Setiap lekuknya adalah kode rahasia. #CaraKerja", "Di dalam kunci silinder ada plug yang harus berputar, dengan 5 atau 6 pin berpegas.", "Kunci yang salah membuat pin tidak sejajar, jadi plug tertahan.", "Kunci yang benar mengangkat semua pin sejajar, dan klik, pintu terbuka. #Kunci"],
        th_open="Gerigi kunci rumahmu bukan hiasan. Setiap lekuknya adalah kode rahasia. #CaraKerja",
        th=["Setiap gerigi mengangkat satu pin berpegas ke ketinggian yang pas. Kalau semua pin sejajar di garis batas plug, kunci bisa berputar.", "Kamu pernah salah mencoba kunci di rumah sendiri? #Kunci"],
    ),
    "EP04_LIFT_TIDAK_JATUH": dict(
        day="Kamis, 19 November 2026",
        title="Kenapa Lift Tidak Jatuh Walau Talinya Putus?", cover="TALI PUTUS, LIFT AMAN", tags="#Lift #Teknik",
        hook="Kalau tali lift putus, kabinnya tidak langsung jatuh. Rahasianya dipamerkan secara dramatis tahun 1854.",
        tiktok="Elisha Otis memamerkan pengaman lift di Crystal Palace, New York, tahun 1854. Lift modern punya governor dan rem yang ditahan terbuka oleh listrik, jadi saat listrik padam rem justru mengunci. Kamu masih takut naik lift?",
        pin="CARA KERJA BENDA · EP 04. Sumber: Wikipedia (Elevator, Elisha Otis), The New York Times, Salon. " + PIN,
        ig="Lift dirancang untuk berhenti saat ada yang salah. Kamu masih takut naik lift? Tulis di komentar.",
        points=["Elisha Otis menemukan pengaman yang menghentikan lift saat tali putus.", "Ia memamerkannya di pameran Crystal Palace, New York, tahun 1854.", "Lift modern ditarik tali baja di atas puli beralur dan diimbangi pemberat.", "Governor menghentikan kabin yang jatuh bebas.", "Rem motor ditahan terbuka oleh listrik dan ditutup pegas, jadi saat listrik padam rem mengunci."],
        audio="Piano lembut dan string arsitektural dengan riser tegang saat tali putus.",
        alts=["Rahasia Lift Tidak Pernah Jatuh", "Elisha Otis dan Lift Pertama", "Apa yang Terjadi Kalau Listrik Lift Padam?"],
        desc="Kenapa lift tidak jatuh: pengaman Elisha Otis (1854), tali baja, pemberat, governor, dan rem yang mengunci saat listrik padam.",
        src="Wikipedia: Elevator dan Elisha Otis (dibaca 12 Nov 2026); The New York Times (2013); Salon (2014)",
        ch=["Hook", "Pabrik 1852", "Pameran 1854", "Lift penumpang 1857", "Tali dan pemberat", "Governor", "Rem saat listrik padam", "Pertanyaan"],
        ytags="cara kerja lift, lift, elevator, elisha otis, governor lift, rem lift, teknik, fakta unik, cara kerja benda, audira",
        thumb="Maket menara putih dengan kabin lift yang terkunci di rel saat tali putus, teks TALI PUTUS, LIFT TIDAK JATUH (style/cover-topic.png).",
        fb="Banyak orang takut naik lift karena membayangkan talinya putus. Padahal sejak 1854, lift dirancang untuk berhenti justru saat ada yang salah. Bahkan saat listrik padam, remnya mengunci, bukan lepas.",
        q="Kamu masih takut naik lift setelah tahu ini?",
        single="Lift dirancang untuk berhenti saat ada yang salah. Rem motornya ditahan terbuka oleh listrik dan ditutup pegas, jadi saat listrik padam rem justru mengunci. #Lift #CaraKerja",
        thread=["Kalau tali lift putus, kabinnya tidak langsung jatuh. #CaraKerja", "Tahun 1854, Elisha Otis memamerkan alat pengaman lift di Crystal Palace, New York.", "Lift modern punya governor yang menghentikan kabin yang jatuh bebas.", "Remnya ditahan terbuka oleh listrik. Saat listrik padam, pegas membuatnya mengunci. #Lift"],
        th_open="Kalau tali lift putus, kabinnya tidak langsung jatuh. Rahasianya dipamerkan sejak 1854. #CaraKerja",
        th=["Lift modern punya governor dan rem yang ditutup pegas. Saat listrik padam, rem justru mengunci, bukan lepas.", "Kamu masih takut naik lift? #Lift"],
    ),
    "EP05_RICE_COOKER": dict(
        day="Jumat, 20 November 2026",
        title="Cara Rice Cooker Tahu Nasi Sudah Matang", cover="RICE COOKER BACA SUHU", tags="#RiceCooker #Dapur",
        hook="Rice cooker tidak punya mata. Tapi ia tahu kapan nasimu matang.",
        tiktok="Selama masih ada air, suhu mangkuk tertahan di titik didih. Begitu airnya habis, suhu naik cepat, termostat mendeteksinya, dan klik, pemanas mati. Rice cooker di rumahmu masih yang berbunyi klik?",
        pin="CARA KERJA BENDA · EP 05. Sumber: Wikipedia (Rice cooker), BBC Witness History. " + PIN,
        ig="Rice cooker membaca suhu, bukan waktu. Rice cooker di rumahmu masih yang tombolnya berbunyi klik? Tulis di komentar.",
        points=["Isinya pemanas, mangkuk, dan termostat yang mengukur suhu mangkuk.", "Rice cooker listrik pertama dibuat Mitsubishi Electric tahun 1923, tapi belum otomatis.", "Yang otomatis pertama untuk rumah buatan Toshiba, diperkenalkan 10 Desember 1955.", "Selama ada air, suhunya tertahan di sekitar titik didih.", "Begitu air habis, suhu naik cepat dan termostat mematikan pemanas."],
        audio="Musik dapur hangat: petikan mirip koto, marimba, gelembung air, dan bunyi klik.",
        alts=["Rice Cooker Tahu Nasi Matang dari Suhu", "Rahasia Tombol Klik Rice Cooker", "Sejarah Rice Cooker Otomatis Pertama"],
        desc="Cara rice cooker tahu nasi matang: termostat membaca lonjakan suhu setelah air habis. Plus sejarah rice cooker otomatis pertama dari Toshiba (1955).",
        src="Wikipedia: Rice cooker (dibaca 12 Nov 2026); BBC Witness History (2025)",
        ch=["Hook", "Termostat", "1923 dan 1955", "Masalah timer", "Air menahan suhu", "Klik, nasi matang", "Di balik penemuannya", "Pertanyaan"],
        ytags="cara kerja rice cooker, rice cooker, magic com, termostat, nasi, dapur, toshiba 1955, fakta unik, cara kerja benda, audira",
        thumb="Semangkuk nasi mengepul di depan rice cooker dalam cahaya dapur hangat, teks RICE COOKER TAHU NASI MATANG (style/cover-topic.png).",
        fb="Rice cooker di rumah tidak punya mata dan tidak menghitung menit. Ia cuma membaca suhu. Selama masih ada air, suhunya tertahan di titik didih. Begitu airnya habis, suhunya naik, dan klik, nasi matang.",
        q="Rice cooker di rumahmu masih yang tombolnya berbunyi klik?",
        single="Rice cooker tidak pakai timer. Selama masih ada air, suhunya tertahan di titik didih; begitu air habis, suhu naik dan termostat mematikan pemanas. Klik. #RiceCooker #CaraKerja",
        thread=["Rice cooker tidak punya mata, tapi tahu kapan nasimu matang. #CaraKerja", "Isinya pemanas, mangkuk, dan termostat. Yang otomatis pertama dibuat Toshiba tahun 1955.", "Selama masih ada air, suhu mangkuk tertahan di sekitar titik didih.", "Begitu air habis, suhu naik cepat, termostat mendeteksinya, dan klik, pemanas mati. #RiceCooker"],
        th_open="Rice cooker tidak punya mata. Tapi ia tahu kapan nasimu matang. #CaraKerja",
        th=["Rahasianya suhu: selama ada air, suhu tertahan di titik didih. Begitu air habis, suhu naik dan termostat mematikan pemanas.", "Rice cooker di rumahmu masih yang berbunyi klik? #RiceCooker"],
    ),
}

for name, e in E.items():
    if not (SERIES / name / "project" / "timeline.json").exists(): continue
    T = json.load(open(SERIES / name / "project" / "timeline.json", encoding="utf8"))
    chapters = "\n".join(f"{fmt(0 if i == 0 else s['start'])} {c}" for i, (s, c) in enumerate(zip(T["scenes"], e["ch"])))
    pts = "\n".join(f"{i + 1}. {p}" for i, p in enumerate(e["points"]))
    alts = "\n".join(f"- {a}" for a in e["alts"])
    thread = "\n\n".join(f"{i + 1}/ {t}" for i, t in enumerate(e["thread"]))
    tags = f"{e['tags']} {BASE}"
    th = "\n\n".join(f"{i + 1}/ {t}" for i, t in enumerate(e["th"]))
    md = f"""# SOCIAL CAPTIONS, EP {name[2:4]}: {e['title']}

## TikTok

**Hook:** {e['hook']}

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

**Judul:** {e['title']}

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
- Komentar pin: sebut nomor seri "CARA KERJA BENDA · EP {name[2:4]}", playlist "Cara Kerja Benda" di channel AUDIRA Explained (@AudiraExplained), dan tautan episode sebelumnya.
- Musik dan SFX disintesis sendiri di `project/mix.py`, tanpa lisensi pihak ketiga.
"""
    (SERIES / name / "SOCIAL_CAPTIONS.md").write_text(md, encoding="utf8")
    print(name, "threads", len(e["th_open"]), [len(t) for t in e["th"]], "title", len(e["title"]), "single", len(e["single"]), [len(f"{i + 1}/ {t}") for i, t in enumerate(e["thread"])])
