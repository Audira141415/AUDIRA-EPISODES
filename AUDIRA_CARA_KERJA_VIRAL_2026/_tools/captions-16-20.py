"""Writes SOCIAL_CAPTIONS.md for EP16-EP20 (6 platforms, upload schedule, AI label). Chapters come from the voiced timeline.json.
Run from AUDIRA_CARA_KERJA_VIRAL_2026 after the finals pass QC: python _tools/captions-11-15.py"""
import json, sys
from pathlib import Path

sys.path.insert(0, "_tools")
from importlib import import_module
DOCS = import_module("docs-16-20").EPS

fmt = lambda t: f"{int(t // 60)}:{int(t % 60):02}"
BASE = "#CaraKerja #Sains #AUDIRA"

E = {
    "EP16_BULAN_KEDUA": dict(
        day="Jumat, 20 November 2026", cover="BUMI PUNYA BULAN KEDUA", tags="#Astronomi #Antariksa",
        tiktok="Sejak Mei, Bumi punya bulan kedua: batu 1-2 meter bernama 2026 QQ8. Orbitnya hampir kembar dengan Bumi, jadi ia masuk pelan dan tertangkap gravitasi. Sekitar Desember ia pergi lagi. Kamu sudah tahu?",
        pin="CARA KERJA VIRAL · EP 16. Sumber: Minor Planet Center (MPEC 2026-U95, 29 Okt 2026), NASA/JPL, detikInet (8 Nov 2026). Visual ilustrasi, skala disesuaikan.",
        ig="Bulan kedua Bumi cuma setinggi manusia, dan sebentar lagi pergi. Fakta mana yang paling bikin kaget? Tulis di komentar.",
        points=["2026 QQ8 ditemukan dari Hungaria 19 Agustus dan diumumkan Minor Planet Center 29 Oktober.", "Ukurannya sekitar 1-2 meter, orbitnya mengelilingi Matahari 359 hari, nyaris kembar dengan Bumi.", "Di dalam bola Hill (jari-jari sekitar 1,5 juta km) tarikan Bumi menang; energinya negatif, jadi tertangkap.", "Lewat paling dekat 18 Agustus, sekitar 537.000 km; dorongan cahaya Matahari membuktikan ia batu padat, bukan sampah roket.", "Sekitar Desember tarikan Matahari melepaskannya; Kamo'oalewa berbeda karena hanya berjalan seirama."],
        audio="Drone yang membuka saat zoom dari batu 2 meter ke tata surya, dengan ketukan tiap pangkat sepuluh.",
        alts=["Bumi Punya Bulan Kedua, Tapi Cuma Sebentar", "Batu 2 Meter yang Tertangkap Gravitasi Bumi", "Kenapa Bulan Kedua Bumi Akan Pergi Desember?"],
        desc="Cara kerja mini-moon 2026 QQ8: orbit hampir kembar dengan Bumi, masuk pelan ke bola Hill, tertangkap gravitasi, lalu dilepas tarikan Matahari sekitar Desember 2026.",
        src="Minor Planet Center, NASA/JPL Small-Body Database, detikInet.",
        ytags="bulan kedua, mini moon, 2026 qq8, bumi, astronomi, asteroid, bola hill, kamo'oalewa, cara kerja, antariksa, audira",
        thumb="Bumi dengan jalur tangkap batu kecil dan judul BULAN KEDUA (style/cover-topic.png).",
        fb="Bayangkan dua pelari di lintasan yang sama dengan kecepatan hampir sama: yang satu bisa menempel lama di sebelahmu. Itulah 2026 QQ8. Orbitnya nyaris kembar dengan Bumi, jadi ia masuk pelan dan tertangkap gravitasi kita sejak Mei. Ukurannya cuma setinggi manusia, dan sekitar Desember ia akan pergi lagi.",
        q="Kalau bisa memberi nama bulan kedua ini, kamu mau menamainya apa?",
        single="Sejak Mei Bumi punya bulan kedua: batu 1-2 m bernama 2026 QQ8. Orbitnya hampir kembar dengan Bumi, jadi tertangkap gravitasi. Sekitar Desember ia pergi lagi. #Astronomi #CaraKerja",
        thread=["Sejak Mei Bumi punya bulan kedua. Tak ada yang tahu sampai Agustus. #CaraKerja", "Namanya 2026 QQ8, batu sekitar 1-2 meter. Orbitnya mengelilingi Matahari 359 hari, nyaris kembar dengan Bumi.", "Karena masuk sangat pelan ke bola Hill Bumi, energinya negatif: ia tertangkap. Lewat terdekat sekitar 537.000 km.", "Tapi Matahari terus menarik. Sekitar Desember ia lepas lagi. #Astronomi"],
        th_open="Bumi punya bulan kedua sejak Mei. Ukurannya cuma 1-2 meter, dan sekitar Desember ia pergi. Ini cara kerjanya. #CaraKerja",
        th=["Orbit 2026 QQ8 hampir kembar dengan Bumi, jadi ia mendekat pelan dan tertangkap di dalam bola Hill. Dorongan cahaya Matahari yang kecil membuktikan ia batu padat, bukan sampah roket.", "Kalau bisa memberi nama, kamu mau menamainya apa? #Astronomi"],
    ),
    "EP17_GEDUNG_1KM_JEDDAH": dict(
        day="Sabtu, 21 November 2026", cover="GEDUNG SATU KILOMETER", tags="#Arsitektur #TeknikSipil",
        tiktok="Jeddah Tower sudah 120 lantai, sekitar 480 meter, dan targetnya lebih dari satu kilometer. Rahasianya: denah tiga kaki, sayap yang makin pendek untuk mengecoh angin, dan lift bertali serat karbon. Kamu berani naik?",
        pin="CARA KERJA VIRAL · EP 17. Sumber: Kingdom Holding (2 Nov 2026), Newsweek, New Civil Engineer, KONE (Okt 2025), CTBUH. Visual maket adalah ilustrasi.",
        ig="Gedung tertinggi dunia berdiri di atas tiga kaki. Bagian mana yang paling bikin penasaran? Tulis di komentar.",
        points=["Per 2 November 2026 sudah 120 lantai, sekitar 480 meter; target selesai 2028, lebih dari 1 km.", "Fondasi 270 tiang bor sedalam 45-105 meter di batu karang, diikat pelat beton sekitar 5 meter.", "Denah huruf Y: inti segitiga, tiga sayap, tanpa kolom; tiga kaki adalah jumlah minimum agar stabil.", "Sayap makin pendek ke atas supaya pusaran angin tidak kompak; diuji di terowongan angin.", "Di atas sekitar 500 m tali baja terlalu berat, jadi lift ke dek pengamatan memakai tali serat karbon."],
        audio="Pad yang naik setiap kali menara tumbuh, dentuman tiang bor, dan angin terowongan.",
        alts=["Kenapa Gedung Tertinggi Dunia Berkaki Tiga?", "Cara Membangun Gedung Satu Kilometer", "Jeddah Tower: Satu Kilometer ke Atas"],
        desc="Cara kerja Jeddah Tower, gedung lebih dari 1 km: fondasi tiang bor di batu karang, denah Y tiga kaki, sayap pengecoh angin, beton estafet, dan lift tali serat karbon.",
        src="Kingdom Holding, Newsweek, New Civil Engineer, KONE, CTBUH.",
        ytags="jeddah tower, gedung tertinggi, 1 km, pencakar langit, arsitektur, teknik sipil, burj khalifa, lift, cara kerja, audira",
        thumb="Menara putih menjulang dengan judul 1 KM KE ATAS (style/cover-topic.png).",
        fb="Bayangkan jalan sepanjang satu kilometer, lalu diberdirikan. Itulah Jeddah Tower. Supaya tidak roboh dan tidak berayun, gedung ini berdiri di atas tiga kaki seperti tripod, dan sayapnya makin pendek ke atas supaya angin tidak bisa membentuk pusaran yang rapi. Sekarang sudah 120 lantai.",
        q="Kalau sudah jadi, kamu mau naik sampai lantai berapa?",
        single="Jeddah Tower sudah 120 lantai (sekitar 480 m), target lebih dari 1 km. Denah tiga kaki, sayap pengecoh angin, 270 tiang bor di batu karang, dan lift bertali serat karbon. #Arsitektur #CaraKerja",
        thread=["Satu kilometer. Tapi ke atas. Begini Jeddah Tower dibangun. #CaraKerja", "Fondasinya 270 tiang bor sedalam 45-105 meter di batu karang, diikat pelat beton sekitar 5 meter.", "Denahnya huruf Y: inti segitiga dan tiga sayap, tanpa kolom. Sayapnya makin pendek ke atas supaya pusaran angin tidak kompak.", "Di atas sekitar 500 m tali baja terlalu berat, jadi liftnya pakai tali serat karbon. #Arsitektur"],
        th_open="Jeddah Tower sudah 120 lantai dan targetnya lebih dari satu kilometer. Kenapa ia berkaki tiga? #CaraKerja",
        th=["Tiga kaki adalah jumlah minimum agar stabil. Sayapnya makin pendek ke atas supaya angin tidak membentuk pusaran yang mengayunkan gedung, dan semuanya diuji di terowongan angin.", "Kalau sudah jadi, kamu mau naik sampai lantai berapa? #Arsitektur"],
    ),
    "EP18_KERETA_CEPAT_AMAN": dict(
        day="Minggu, 22 November 2026", cover="5 KM UNTUK BERHENTI", tags="#KeretaCepat #Transportasi",
        tiktok="Di 300 km/jam, kereta cepat butuh sekitar 5 km untuk berhenti, lebih jauh dari pandangan masinis. Karena itu sinyalnya dipindah ke kabin dan kereta bisa direm otomatis. Turut berduka untuk korban kecelakaan di Spanyol.",
        pin="CARA KERJA VIRAL · EP 18. Sumber: AITAT/Kementerian Transportasi Spanyol, RTVE, El País, ANTARA (Nov 2026), KCIC. Penyebab kecelakaan masih diselidiki. Visual ilustrasi.",
        ig="Keselamatan kereta cepat dijaga berlapis, oleh sistem dan aturan. Turut berduka untuk para korban di Spanyol.",
        points=["Di 300 km/jam jarak berhenti sekitar 5 km, lebih jauh dari pandangan masinis.", "Rel dibagi menjadi blok: satu blok untuk satu kereta.", "Balise, sirkuit rel, dan radio mengirim izin jalan dan kecepatan target ke layar kabin.", "Jika masinis melewati batas, sistem memberi peringatan lalu mengerem otomatis; tanpa data, kereta berhenti.", "Whoosh memakai CTCS-3 dengan radio GSM-R, ditambah sensor angin, hujan, gempa, dan benda di rel."],
        audio="Pad tenang dan ketukan sambungan rel, tanpa efek dramatis.",
        alts=["Bagaimana Kereta Cepat Dijaga Agar Aman?", "Kenapa Kereta Cepat Butuh 5 km untuk Berhenti?", "Sinyal di Kabin: Cara Kerja Keselamatan Kereta Cepat"],
        desc="Cara kerja sistem keselamatan kereta cepat: jarak berhenti sekitar 5 km dari 300 km/jam, blok rel, sinyal di kabin, rem otomatis, mode cadangan, dan sensor di Whoosh. Dibuat setelah tabrakan kereta cepat di Spanyol, 28 Oktober 2026; penyebabnya masih diselidiki.",
        src="AITAT/Kementerian Transportasi Spanyol, RTVE, El País, ANTARA, KCIC.",
        ytags="kereta cepat, whoosh, keselamatan kereta, sinyal kereta, rem otomatis, ctcs-3, spanyol, cara kerja, transportasi, audira",
        thumb="Diorama rel isometrik dengan penggaris 5 km dan judul ±5 km (style/cover-topic.png).",
        fb="Saat kamu naik kereta cepat, masinis tidak bisa mengandalkan matanya saja. Di 300 km/jam, kereta butuh sekitar 5 km untuk berhenti. Karena itu rel dibagi menjadi blok, sinyalnya dikirim langsung ke kabin, dan komputer siap mengerem otomatis bila batas dilampaui. Turut berduka untuk para korban di Spanyol; penyebab kecelakaan masih diselidiki.",
        q="Apa yang paling bikin kamu merasa aman saat naik kereta cepat?",
        single="Di 300 km/jam kereta cepat butuh sekitar 5 km untuk berhenti. Maka sinyal dipindah ke kabin dan rem otomatis siap bekerja. Turut berduka untuk korban di Spanyol. #KeretaCepat #CaraKerja",
        thread=["Di 300 km/jam, kereta butuh sekitar 5 km untuk berhenti. Bagaimana masinis tahu ada bahaya di depan? #CaraKerja", "Rel dibagi menjadi blok, satu blok untuk satu kereta. Balise dan radio mengirim izin jalan ke layar kabin.", "Lewat batas? Sistem memberi peringatan, lalu mengerem otomatis. Tanpa data, kereta berhenti.", "Turut berduka untuk korban di Spanyol; penyebabnya masih diselidiki. #KeretaCepat"],
        th_open="Kereta cepat butuh sekitar 5 km untuk berhenti dari 300 km/jam. Begini keselamatannya dijaga. #CaraKerja",
        th=["Sinyal dipindah dari tepi rel ke kabin. Komputer menghitung kurva pengereman, memberi peringatan, lalu mengerem otomatis bila masinis melewati batas. Whoosh juga punya sensor angin, hujan, dan gempa.", "Turut berduka untuk para korban di Spanyol. #KeretaCepat"],
    ),
    "EP19_TAKSI_TERBANG": dict(
        day="Senin, 23 November 2026", cover="LIMA PESAWAT TANPA PILOT", tags="#TaksiTerbang #eVTOL",
        tiktok="Lima pesawat listrik terbang bersamaan lebih dari 133 km tanpa pilot. Caranya: rotor angkat untuk naik tegak, baling-baling pendorong untuk melaju, lalu sayap mengambil alih. Pesawat jenis ini sudah dapat validasi di Indonesia. Mau naik?",
        pin="CARA KERJA VIRAL · EP 19. Sumber: AutoFlight (5 Nov 2026), Xinhua (4 Nov 2026), AeroTime, sUAS News, China Daily. Visual ilustrasi, pesawat generik.",
        ig="Naik seperti helikopter, terbang seperti pesawat, dikemudikan komputer. Kamu berani naik? Tulis di komentar.",
        points=["31 Oktober-1 November, lima eVTOL terbang formasi otomatis 47 menit, lebih dari 133 km, di Kunshan, Tiongkok.", "Pesawatnya kargo dan pemadam, bukan taksi penumpang.", "Rotor angkat membuat pesawat naik tegak; baling-baling pendorong membuatnya melaju; sayap lalu mengambil alih dan rotor angkat berhenti.", "Komputer kendali mengatur tiap motor; kalau satu mati, yang lain menambah dorongan.", "Baterai menyimpan energi jauh lebih sedikit dari bahan bakar jet, jadi jangkauan CarryAll sekitar 200 km."],
        audio="Kalimba ringan dan dengung rotor listrik yang naik saat lepas landas.",
        alts=["Lima Pesawat Terbang Tanpa Pilot", "Cara Kerja Taksi Terbang eVTOL", "Naik Seperti Helikopter, Terbang Seperti Pesawat"],
        desc="Cara kerja pesawat eVTOL lift+cruise: rotor angkat, baling-baling pendorong, sayap, komputer kendali, dan batas baterai. Dari formasi lima pesawat AutoFlight di Kunshan, 31 Oktober-1 November 2026.",
        src="AutoFlight, Xinhua, AeroTime, sUAS News, China Daily.",
        ytags="evtol, taksi terbang, pesawat listrik, autoflight, carryall, drone, pesawat tanpa pilot, cara kerja, teknologi, audira",
        thumb="eVTOL low-poly pastel di atas danau dengan judul 133 km (style/cover-topic.png).",
        fb="Bayangkan pesawat yang lepas landas seperti helikopter dari halaman sempit, lalu terbang hemat seperti pesawat biasa. Itulah eVTOL. Lima pesawat seperti ini baru saja terbang bersamaan lebih dari 133 km, sepenuhnya otomatis. Kendalanya masih baterai: per kilo, energinya jauh di bawah bahan bakar jet.",
        q="Kalau taksi terbang sudah ada di kotamu, kamu mau naik?",
        single="Lima eVTOL terbang formasi otomatis 47 menit, lebih dari 133 km, tanpa pilot. Rotor angkat untuk naik, pendorong untuk melaju, sayap mengambil alih. #eVTOL #CaraKerja",
        thread=["Lima pesawat terbang bersamaan lebih dari 133 km. Tanpa satu pilot pun. #CaraKerja", "Rotor angkat meniup udara ke bawah, pesawat naik tegak seperti helikopter.", "Baling-baling pendorong membuatnya melaju, sayap mulai mengangkat, rotor angkat berhenti. Sayap jauh lebih hemat.", "Batasnya baterai: jangkauan CarryAll sekitar 200 km. #eVTOL"],
        th_open="Lima pesawat listrik terbang bersamaan lebih dari 133 km tanpa pilot. Ini cara kerjanya. #CaraKerja",
        th=["Rotor angkat untuk naik tegak, baling-baling pendorong untuk melaju, lalu sayap mengambil alih. Komputer kendali mengatur tiap motor, dan kalau satu mati yang lain menambah dorongan.", "Kalau taksi terbang ada di kotamu, kamu mau naik? #eVTOL"],
    ),
    "EP20_MOBIL_METANOL": dict(
        day="Selasa, 24 November 2026", cover="MOBIL MINUM ALKOHOL", tags="#MobilListrik #Otomotif",
        tiktok="Mobil ini bisa minum metanol dan bensin di tangki yang sama. Oktannya sekitar 109 dan mendinginkan silinder, tapi energinya cuma separuh bensin. Dan ini bukan mobil metanol pertama. Tahu?",
        pin="CARA KERJA VIRAL · EP 20. Sumber: Geely (3 Nov 2026), CnEVPost, CarExpert, Verhelst dkk. 2019, IRENA & Methanol Institute 2021, Antara (Apr 2026). Mobil 3D adalah ilustrasi generik.",
        ig="Satu tangki, dua cairan, satu mesin yang paham kimia. Fakta mana yang paling kaget? Tulis di komentar.",
        points=["Geely meluncurkan Xingyao 6 EF pada 3 November: bisa listrik, metanol, bensin, atau campurannya.", "Bukan yang pertama: Indy 500 memakai metanol sampai 2006.", "Metanol energinya sekitar separuh bensin per liter, jadi injektor menyemprot lebih lama.", "Oktan sekitar 109 dan penguapan yang mendinginkan silinder membuat mesin bisa memampatkan lebih keras.", "Metanol menyerang aluminium dan seal karet; kebanyakan metanol Tiongkok dari batu bara, jadi belum tentu hijau."],
        audio="Plink gelembung, desis injektor, dan letupan pengapian.",
        alts=["Mobil yang Bisa Minum Alkohol dan Bensin", "Cara Kerja Mesin Metanol", "Benarkah Mobil Metanol Pertama di Dunia?"],
        desc="Cara kerja mobil metanol: molekul CH3OH, energi separuh bensin, oktan tinggi, pendinginan penguapan, korosi, dan asal metanol. Dari peluncuran Geely Xingyao 6 EF, 3 November 2026.",
        src="Geely, CnEVPost, CarExpert, Verhelst dkk. (2019), IRENA & Methanol Institute (2021), Antara.",
        ytags="metanol, mobil metanol, geely, xingyao 6 ef, bahan bakar alternatif, oktan, biodiesel, cara kerja, otomotif, audira",
        thumb="Mobil di pompa dua cairan dengan judul MINUM ALKOHOL (style/cover-topic.png).",
        fb="Bayangkan mengisi bensin dan alkohol ke tangki yang sama, lalu mesin tetap jalan normal. Mobil metanol bisa begitu karena sensornya membaca kadar campuran dan komputer mengatur semprotan. Tapi metanol cuma punya separuh energi bensin per liter, dan kebanyakan dibuat dari batu bara. Jadi hijau atau tidak, tergantung cara membuatnya.",
        q="Menurutmu, metanol cocok jadi bahan bakar mobil di Indonesia?",
        single="Mobil metanol bisa minum metanol dan bensin di tangki yang sama. Oktan sekitar 109, energi separuh bensin per liter. Dan bukan yang pertama: Indy 500 memakainya sampai 2006. #Otomotif #CaraKerja",
        thread=["Mobil ini bisa minum alkohol dan bensin di tangki yang sama. #CaraKerja", "Metanol itu alkohol cair: satu karbon, satu oksigen, empat hidrogen. Sensor membaca kadarnya, komputer mengatur semprotan.", "Energinya separuh bensin per liter, tapi oktan sekitar 109 dan efek pendinginannya membantu mesin.", "Belum tentu hijau: kebanyakan metanol Tiongkok dari batu bara. #Otomotif"],
        th_open="Mobil yang bisa minum metanol dan bensin di tangki yang sama. Dan ternyata bukan yang pertama. #CaraKerja",
        th=["Metanol punya oktan sekitar 109 dan mendinginkan silinder saat menguap, tapi energinya cuma separuh bensin per liter. Ia juga menyerang aluminium dan seal karet, jadi materialnya diganti.", "Hijau atau tidak tergantung cara membuatnya. Menurutmu cocok untuk Indonesia? #Otomotif"],
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
