"""Writes SOCIAL_CAPTIONS.md for EP11-EP15 (6 platforms, upload schedule, AI label). Chapters come from the voiced timeline.json.
Run from AUDIRA_CARA_KERJA_VIRAL_2026 after the finals pass QC: python _tools/captions-11-15.py"""
import json, sys
from pathlib import Path

sys.path.insert(0, "_tools")
from importlib import import_module
DOCS = import_module("docs-11-15").EPS

fmt = lambda t: f"{int(t // 60)}:{int(t % 60):02}"
BASE = "#CaraKerja #Sains #AUDIRA"

E = {
    "EP11_KOTAK_HITAM": dict(
        day="Minggu, 15 November 2026", cover="KOTAK HITAM TAPI ORANYE", tags="#KotakHitam #Penerbangan",
        tiktok="Kotak hitam pesawat sebenarnya oranye, dan ia dirancang selamat justru saat pesawatnya hancur: tahan benturan 3.400 kali gravitasi, api 1.100 derajat sekitar satu jam, dan tekanan laut dalam. Kamu baru tahu yang mana?",
        pin="CARA KERJA VIRAL · EP 11. Sumber: NTSB, eCFR 14 CFR 91.609, Federal Register (FAA, Feb 2026), ANTARA/Kompas.tv/Media Indonesia (7 Nov 2026), CNN Indonesia (3 Nov 2026). Visual ilustrasi.",
        ig="Benda paling tangguh di pesawat justru berwarna oranye. Fakta mana yang paling bikin kaget? Tulis di komentar.",
        points=["Ada dua perekam: data penerbangan (minimal 88 parameter) dan suara kokpit.", "Rekaman berputar: data tertua ditimpa, perekam data menyimpan sekitar 25 jam terakhir.", "Chip memori dibungkus blok termal, insulasi, lalu cangkang baja atau titanium.", "Diuji benturan 3.400 g, api 1.100 °C sekitar satu jam, tekanan air 20.000 kaki.", "Pinger berbunyi sekali tiap detik di nada 37,5 kHz selama 30 hari; aturan Eropa kini 90 hari."],
        audio="Dengung avionik, hantaman uji benturan, lalu ping bawah air sekali per detik.",
        alts=["Kenapa Kotak Hitam Pesawat Berwarna Oranye?", "Benda Paling Tangguh di Pesawat", "Bagaimana Kotak Hitam Selamat dari Kecelakaan?"],
        desc="Cara kerja kotak hitam pesawat: dua perekam, rekaman berputar 25 jam, modul memori tahan benturan, uji ketahanan, dan pinger bawah air. Dibuat setelah FDR helikopter Mi-17 ditemukan di Seruyan (7 Nov 2026).",
        src="NTSB, eCFR 14 CFR 91.609, Federal Register (FAA 2026), ANTARA, Kompas.tv, Media Indonesia, CNN Indonesia.",
        ytags="kotak hitam, black box pesawat, flight recorder, fdr, cvr, mi-17, learjet, cara kerja, penerbangan, sains, audira",
        thumb="Perekam oranye dengan judul KOTAK HITAM TAPI ORANYE (style/cover-topic.png).",
        fb="Lucu ya, benda yang disebut kotak hitam justru dicat oranye terang. Alasannya sederhana: setelah kecelakaan, tim harus menemukannya di antara puing, bahkan di dasar laut. Di dalamnya ada chip memori yang dibungkus berlapis supaya selamat dari benturan, api, dan tekanan air.",
        q="Menurutmu, kenapa namanya tetap kotak hitam?",
        single="Kotak hitam pesawat warnanya oranye. Ia diuji tahan benturan 3.400 g, api 1.100 °C sekitar satu jam, dan tekanan air 20.000 kaki. Pingernya berbunyi sekali tiap detik selama 30 hari. #KotakHitam #CaraKerja",
        thread=["Namanya kotak hitam, tapi warnanya oranye. Ini cara kerjanya. #CaraKerja", "Ada dua perekam: data (minimal 88 parameter, sekitar 25 jam terakhir) dan suara kokpit.", "Chip memorinya dibungkus blok termal, insulasi, dan cangkang baja atau titanium. Diuji benturan 3.400 g dan api 1.100 °C.", "Kalau tercebur, pinger berbunyi sekali tiap detik di nada 37,5 kHz selama 30 hari. #KotakHitam"],
        th_open="Namanya kotak hitam, tapi warnanya oranye. Dan ia dirancang selamat justru saat pesawatnya hancur. #CaraKerja",
        th=["Di dalamnya, chip memori dibungkus berlapis: blok termal, insulasi, lalu cangkang baja atau titanium. Ia diuji benturan 3.400 kali gravitasi dan api 1.100 derajat sekitar satu jam.", "Kalau jatuh ke laut, pinger berbunyi sekali tiap detik selama 30 hari. Fakta mana yang baru kamu tahu? #KotakHitam"],
    ),
    "EP12_GO_AROUND_ANGIN": dict(
        day="Senin, 16 November 2026", cover="BATAL MENDARAT ITU BENAR", tags="#Penerbangan #Pilot",
        tiktok="Pesawat SQ213 di Perth batal mendarat saat angin kencang, lalu mendarat normal. Ternyata menurut studi FSF, cuma sekitar 3% pendekatan tidak stabil yang berakhir go-around. Kamu pernah mengalami batal mendarat?",
        pin="CARA KERJA VIRAL · EP 12. Sumber: The West Australian, Straits Times, detikTravel (31 Okt-2 Nov 2026); METAR Perth; FAA Airplane Flying Handbook; Flight Safety Foundation; NASA. Visual ilustrasi, bukan rekaman asli.",
        ig="Batal mendarat bukan kegagalan, tapi rencana cadangan. Pernah mengalaminya? Ceritakan di komentar.",
        points=["Angin menyilang membuat pesawat hanyut, jadi moncong diarahkan ke angin (crab).", "Sesaat sebelum menyentuh, badan diluruskan dengan rudder dan sayap sisi angin diturunkan.", "Gerbang stabil: 1.000 kaki dalam awan, 500 kaki saat cerah; satu meleset, batalkan.", "Studi FSF: hanya sekitar 3% pendekatan tidak stabil yang berakhir go-around.", "Go-around: TOGA, daya penuh, hidung naik, flap dikurangi, roda dilipat; 1-3 kali tiap 1.000 pendekatan."],
        audio="Hujan dan hembusan angin, spool-up mesin jet, chime gerbang, lalu akord hangat saat mendarat.",
        alts=["Kenapa Pilot Batal Mendarat Saat Angin Kencang?", "Cara Pilot Mendarat Saat Angin Samping", "Go-Around: Rencana Cadangan Pilot"],
        desc="Cara kerja pendaratan saat angin samping (crab dan sayap turun), gerbang pendekatan stabil, dan go-around, dari kasus SQ213 di Perth, 31 Oktober 2026.",
        src="The West Australian, Straits Times, detikTravel, METAR Perth (IEM), FAA Airplane Flying Handbook, Flight Safety Foundation, NASA.",
        ytags="go around, batal mendarat, angin samping, crosswind landing, sq213, perth, pilot, cara kerja, penerbangan, audira",
        thumb="Pesawat miring di atas landasan berangin dengan judul BATAL MENDARAT (style/cover-topic.png).",
        fb="Bayangkan kamu menyetir, lalu di depan ada yang tidak beres. Pilihan paling aman adalah mundur dulu, bukan memaksa. Itulah go-around. Pilot SQ213 di Perth memilih naik lagi saat angin kencang, lalu mendarat normal. Anehnya, studi menunjukkan sebagian besar pilot justru jarang melakukannya.",
        q="Kamu lebih tenang kalau pilot batal mendarat atau memaksa mendarat?",
        single="SQ213 batal mendarat saat angin kencang di Perth, lalu mendarat normal. Studi FSF: hanya sekitar 3% pendekatan tidak stabil yang berakhir go-around. Batal mendarat itu rencana cadangan. #Penerbangan #CaraKerja",
        thread=["Pilot batal mendarat saat angin kencang. Dan itu keputusan yang benar. #CaraKerja", "Angin menyilang membuat pesawat hanyut. Pilot mengarahkan moncong ke angin, lalu meluruskannya dengan rudder sesaat sebelum menyentuh.", "Ada gerbang stabil di 1.000 dan 500 kaki. Satu syarat meleset, batalkan.", "Studi FSF: hanya sekitar 3% pendekatan tidak stabil berakhir go-around. #Penerbangan"],
        th_open="Pesawat SQ213 batal mendarat saat angin kencang di Perth, lalu mendarat normal. Ini cara kerjanya. #CaraKerja",
        th=["Pilot terbang menyerong seperti kepiting melawan angin, lalu meluruskan badan dengan rudder. Kalau pendekatan tidak stabil di 1.000 atau 500 kaki, aturannya batalkan.", "Go-around terjadi 1-3 kali tiap 1.000 pendekatan. Pernah mengalaminya? #Penerbangan"],
    ),
    "EP13_LIDAR_AMAZON": dict(
        day="Selasa, 17 November 2026", cover="LASER TEMBUS HUTAN AMAZON", tags="#LiDAR #Arkeologi",
        tiktok="Di foto satelit hutan Amazon hijau semua. Tapi laser dari pesawat menemukan 432 struktur tanah kuno, hanya 36 yang sudah dikenal. Caranya: sebagian kecil pulsa laser menyelinap lewat celah daun sampai ke tanah. Keren atau seram?",
        pin="CARA KERJA VIRAL · EP 13. Sumber: Pärssinen dkk., Nature (29 Jul 2026); BBC News Indonesia (6 Nov 2026); NEON; NOAA. Visual 3D adalah ilustrasi, bukan data survei asli.",
        ig="Hutan yang terlihat kosong dari satelit ternyata menyimpan ratusan struktur kuno. Mau lihat cara laser menemukannya? Tulis LASER di komentar.",
        points=["Pesawat survei terbang sekitar 1,1 km di atas hutan, laser hingga 1,6 juta pulsa per detik.", "Satu pulsa memantul beberapa kali; sebagian kecil menyelinap lewat celah daun ke tanah.", "GNSS mencatat posisi, IMU kemiringan; rata-rata 31 titik per meter persegi.", "Titik pohon dibuang, tanah telanjang diberi bayangan buatan, parit 9-13 m muncul.", "Ditemukan 432 struktur, hanya 36 yang dikenal; total diperkirakan 24.000-30.000."],
        audio="Suara hutan fajar, detak pemindai, dan tiga ping pantulan laser.",
        alts=["Laser Menemukan Ratusan Struktur Kuno di Amazon", "Cara LiDAR Melihat Tanah di Bawah Hutan", "Yang Tak Terlihat Satelit, Terlihat Laser"],
        desc="Cara kerja LiDAR udara menembus kanopi hutan dan menemukan 432 struktur tanah kuno di Acre dan Amazonas, Brasil, dari studi Nature (Juli 2026) yang diangkat BBC Indonesia, 6 November 2026.",
        src="Pärssinen dkk., Nature (2026); BBC News Indonesia; NEON; NOAA.",
        ytags="lidar, amazon, geoglif, arkeologi, laser, point cloud, nature, struktur kuno, cara kerja, sains, audira",
        thumb="Awan titik laser di atas hutan dengan lingkaran dan persegi menyala (style/cover-topic.png).",
        fb="Coba bayangkan memotret hutan dari atas: yang terlihat cuma daun. Laser dari pesawat bekerja lain. Ia menembakkan jutaan pulsa per detik, dan sebagian kecil lolos lewat celah daun sampai ke tanah. Setelah titik pohon dibuang, muncul ratusan lingkaran dan persegi raksasa buatan manusia ribuan tahun lalu. Tersembunyi dari peta ilmuwan, bukan dari ingatan masyarakat adat.",
        q="Menurutmu, untuk apa lingkaran raksasa ini dibuat?",
        single="Laser dari pesawat menemukan 432 struktur tanah kuno di bawah hutan Amazon, hanya 36 yang sudah dikenal. Sebagian kecil pulsa lolos lewat celah daun sampai ke tanah. #LiDAR #CaraKerja",
        thread=["Di foto satelit hutan ini hijau semua. Di laser, muncul ratusan lingkaran raksasa. #CaraKerja", "Pesawat survei menembakkan hingga 1,6 juta pulsa laser per detik. Satu pulsa memantul dari daun, ranting, lalu sebagian kecil sampai ke tanah.", "GNSS dan IMU membuat tiap pantulan jadi titik berkoordinat. Titik pohon dibuang, tanah telanjang tersisa.", "Hasilnya 432 struktur tanah, hanya 36 yang dikenal. Total diperkirakan 24.000-30.000. #LiDAR"],
        th_open="Laser dari pesawat menemukan 432 struktur tanah kuno di bawah hutan Amazon. Hanya 36 yang sudah dikenal. #CaraKerja",
        th=["Satelit hanya melihat atap hutan. LiDAR cukup butuh segelintir pulsa yang lolos lewat celah daun sampai ke tanah, lalu titik pohon dibuang dan bayangan buatan menampakkan paritnya.", "Tersembunyi dari peta ilmuwan, bukan dari ingatan masyarakat adat. #LiDAR"],
    ),
    "EP14_MOBIL_LISTRIK_500": dict(
        day="Rabu, 18 November 2026", cover="140 METER TIAP DETIK", tags="#MobilListrik #Otomotif",
        tiktok="Mobil listrik tembus 503,17 km/jam, mobil produksi pertama yang lewat 500 km/jam. Rahasianya: empat motor 555 kW, sistem 1.200 volt, dan ban khusus. Dua kali lebih cepat butuh delapan kali tenaga. Mau naik?",
        pin="CARA KERJA VIRAL · EP 14. Sumber: FIA (6 Nov 2026), Top Gear, Electrek, evo, CarNewsChina. Mobil 3D adalah ilustrasi generik, bukan model aslinya.",
        ig="503 km/jam itu 140 meter setiap detik. Bagian mana yang paling bikin kaget? Tulis di komentar.",
        points=["Rekor 503,17 km/jam pada 1 November di jalan tertutup Abu Dhabi, diakui FIA untuk satu arah.", "Tenaga melawan hambatan udara naik pangkat tiga: dua kali lebih cepat, delapan kali tenaga.", "Empat motor 555 kW, total 2.220 kW, hampir 3.000 tenaga kuda, hingga 30.000 rpm.", "Sistem 1.200 volt: arus lebih kecil, kabel lebih dingin dan ringan.", "Batas sebenarnya ban semi-slick 325 mm; baterai pada tenaga penuh habis sekitar dua menit."],
        audio="Dengung listrik yang naik bersama kecepatan dan desau angin.",
        alts=["Bagaimana Mobil Listrik Tembus 500 km/jam?", "503 km/jam: Rahasia Empat Motor dan 1.200 Volt", "Mobil Produksi Pertama di Atas 500 km/jam"],
        desc="Cara kerja mobil listrik yang mencapai 503,17 km/jam: hambatan udara pangkat tiga, empat motor 555 kW, sistem 1.200 volt, batas ban, dan baterai yang dikuras habis.",
        src="FIA, Top Gear, Electrek, evo, CarNewsChina.",
        ytags="mobil listrik, 500 km/jam, rekor kecepatan, yangwang u9, byd, 1200 volt, hypercar, cara kerja, otomotif, audira",
        thumb="Hypercar grafit di jalan gurun dengan judul 140 m SETIAP DETIK (style/cover-topic.png).",
        fb="Kalau kamu mengayuh sepeda dua kali lebih cepat, rasanya jauh lebih dari dua kali lebih berat, kan? Untuk mobil, tenaga melawan udara naik pangkat tiga. Karena itu mobil listrik yang tembus 503 km/jam butuh empat motor, sistem 1.200 volt, dan ban khusus yang ditarik gaya sentrifugal ribuan kali gravitasi.",
        q="Menurutmu, batas kecepatan mobil berikutnya ada di mana?",
        single="Mobil listrik tembus 503,17 km/jam, mobil produksi pertama di atas 500 km/jam. Empat motor 555 kW, sistem 1.200 volt, ban semi-slick 325 mm. 2x lebih cepat = 8x tenaga. #MobilListrik #CaraKerja",
        thread=["140 meter setiap detik. Begini mobil listrik tembus 503 km/jam. #CaraKerja", "Musuh utamanya udara: tenaga melawan hambatan naik pangkat tiga. Dua kali lebih cepat butuh delapan kali tenaga.", "Jawabannya empat motor 555 kW, total 2.220 kW, dan sistem 1.200 volt supaya arus kecil dan kabel dingin.", "Batas sebenarnya ban. Baterai pada tenaga penuh habis sekitar dua menit. #MobilListrik"],
        th_open="Mobil listrik ini tembus 503,17 km/jam, mobil produksi pertama di atas 500 km/jam. Ini cara kerjanya. #CaraKerja",
        th=["Tenaga melawan udara naik pangkat tiga, jadi dipakai empat motor 555 kW dan sistem 1.200 volt. Bannya semi-slick khusus selebar 325 milimeter.", "Udara, listrik, dan karet harus seimbang. Bagian mana yang paling bikin kaget? #MobilListrik"],
    ),
    "EP15_DBS_PACU_OTAK": dict(
        day="Kamis, 19 November 2026", cover="SAKLAR DI DADA", tags="#Parkinson #Kesehatan",
        tiktok="Ada alat di dada yang bisa meredakan gemetar Parkinson dalam hitungan detik: Deep Brain Stimulation. Elektroda di otak mengirim sekitar 130 denyut per detik. Bukan obat penyembuh, tapi pengendali gejala. Konsultasikan dengan dokter saraf.",
        pin="CARA KERJA VIRAL · EP 15. Sumber: Koeglsperger dkk. 2019 (Front Neurol), Kühn dkk. 2008 (J Neurosci), AJMC (Feb 2025), Medtronic, Media Indonesia & Olenka (3 Nov 2026), detikNews 2015. Ilustrasi, bukan saran medis.",
        ig="Alat pacu jantung untuk otak itu nyata. Kenal seseorang dengan Parkinson? Bagikan supaya keluarganya tahu pilihannya.",
        points=["Elektroda tipis dengan empat cincin kontak ditanam di inti otak (nukleus subtalamikus atau globus palidus).", "Kabel lewat di bawah kulit menuju stimulator di bawah tulang selangka.", "Stimulator mengirim sekitar 130 denyut per detik, tiap denyut 60 mikrodetik.", "Ritme beta 13-30 Hz yang terlalu serempak diredam; caranya belum sepenuhnya dipahami.", "Versi adaptif disetujui FDA Februari 2025; lebih dari 200.000 orang di dunia memakainya."],
        audio="Lonceng klinis yang menjadi terang saat stimulasi dinyalakan.",
        alts=["Alat Pacu Jantung untuk Otak", "Bagaimana DBS Meredakan Tremor Parkinson?", "Saklar di Dada yang Menghentikan Gemetar"],
        desc="Cara kerja Deep Brain Stimulation untuk Parkinson: elektroda di inti otak, stimulator di dada, 130 denyut per detik, gelombang beta, dan DBS adaptif. Bukan saran medis.",
        src="Koeglsperger dkk. 2019, Kühn dkk. 2008, AJMC 2025, Medtronic, Media Indonesia, Olenka, detikNews.",
        ytags="dbs, deep brain stimulation, parkinson, tremor, stimulasi otak, neurologi, kesehatan, cara kerja, sains, audira",
        thumb="Hologram kepala dengan otak dan stimulator, judul SAKLAR DI DADA (style/cover-topic.png).",
        fb="Bayangkan alat pacu jantung, tapi untuk otak. Pada Parkinson, sirkuit gerak berdenyut terlalu serempak. DBS mengirim denyut listrik kecil lewat elektroda di inti otak, dan pada banyak pasien gemetarnya mereda hampir seketika. Ini bukan obat penyembuh dan bukan yang pertama di Indonesia, tapi pilihan pengendali gejala yang perlu dibicarakan dengan dokter saraf.",
        q="Apakah kamu pernah mendengar tentang DBS sebelumnya?",
        single="DBS: elektroda di inti otak + stimulator di dada, sekitar 130 denyut per detik. Pada banyak pasien Parkinson tremor mereda hampir seketika. Bukan penyembuh, tapi pengendali gejala. #Parkinson #CaraKerja",
        thread=["Ada saklar di dada yang bisa meredakan gemetar Parkinson dalam hitungan detik. #CaraKerja", "Elektroda tipis ditanam di inti kecil otak, kabelnya lewat di bawah kulit ke stimulator di bawah tulang selangka.", "Stimulator mengirim sekitar 130 denyut per detik dan meredam ritme beta yang terlalu serempak.", "Bukan penyembuh, tapi pengendali gejala. Konsultasikan dengan dokter saraf. #Parkinson"],
        th_open="Alat pacu jantung untuk otak: cara kerja Deep Brain Stimulation untuk Parkinson. #CaraKerja",
        th=["Elektroda di inti otak mengirim sekitar 130 denyut per detik dari stimulator di dada. Ritme beta yang terlalu serempak diredam, dan tremor bisa mereda hampir seketika.", "Bukan obat penyembuh, tapi pengendali gejala. Konsultasikan dengan dokter saraf. #Parkinson"],
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
    prev = f"EP {int(n) - 1:02}" if n != "11" else "EP 10 (Combine Harvester)"
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
