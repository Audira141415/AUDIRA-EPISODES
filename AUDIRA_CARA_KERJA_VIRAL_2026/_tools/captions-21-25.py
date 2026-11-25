"""Writes SOCIAL_CAPTIONS.md for EP21-EP25 (6 platforms, upload schedule, AI label). Chapters come from the voiced timeline.json.
Run from AUDIRA_CARA_KERJA_VIRAL_2026 after the finals pass QC: python _tools/captions-21-25.py"""
import json, sys
from pathlib import Path

sys.path.insert(0, "_tools")
from importlib import import_module
DOCS = import_module("docs-21-25").EPS

fmt = lambda t: f"{int(t // 60)}:{int(t % 60):02}"
BASE = "#CaraKerja #Sains #AUDIRA"

E = {
    "EP21_SATELIT_JATUH": dict(
        day="Rabu, 25 November 2026", cover="SATELIT NASA TERBAKAR", tags="#Antariksa #Satelit",
        tiktok="Rabu malam 4 November, teleskop NASA Swift hampir 1,5 ton terbakar di langit Sumatera Utara setelah hampir 22 tahun mengorbit. Kenapa satelit bisa jatuh, dan kenapa panasnya bukan dari gesekan? Ini cara kerjanya.",
        pin="CARA KERJA VIRAL · EP 21. Sumber: NASA (blog Swift), US Space Force via NASA, BRIN (via Kompas), ESA. Hingga 9 Nov 2026 belum ada puing yang ditemukan. Visual ilustrasi, ketinggian dilebih-lebihkan.",
        ig="Satelit bukan jatuh tiba-tiba, ia kalah pelan-pelan oleh udara tipis. Fakta mana yang paling bikin kaget? Tulis di komentar.",
        points=["4 November 2026 pukul 19.39 WIB, teleskop NASA Swift masuk atmosfer di atas Sumatera Utara setelah hampir 22 tahun mengorbit.", "Satelit sebenarnya terus jatuh, tapi melaju begitu cepat sehingga selalu meleset dari Bumi; sisa udara tipis mencuri kecepatannya.", "Saat Matahari memuncak, atmosfer atas memanas dan mengembang. Swift tak punya mesin, dan misi robot penyelamatnya gagal.", "Di batas 120 km lajunya sekitar 28.000 km/jam; udara di depannya termampatkan sampai berpijar, bukan gesekan.", "Risiko melukai orang menurut NASA 1:2.100, di atas ambang 1:10.000. Prakiraan BRIN 19.42, nyatanya 19.39."],
        audio="Gemuruh re-entry dan desis plasma saat satelit pecah, di atas pad dokumenter yang hangat.",
        alts=["Kenapa Satelit NASA Bisa Jatuh di Langit Sumatera?", "Satelit Terbakar Bukan karena Gesekan", "Cara Kerja Satelit Jatuh ke Bumi"],
        desc="Cara kerja re-entry satelit: orbit yang terus jatuh, sisa udara yang mencuri kecepatan, atmosfer yang mengembang saat Matahari memuncak, dan udara termampatkan yang membakar teleskop NASA Swift di langit Sumatera Utara pada 4 November 2026.",
        src="NASA, US Space Force (via NASA), BRIN (via Kompas), ESA Space Debris Office.",
        ytags="satelit jatuh, swift nasa, re-entry, sumatera utara, sampah antariksa, brin, atmosfer, cara kerja, antariksa, audira",
        thumb="Jejak terbakar di atas peta Sumatera dengan judul TELESKOP NASA TERBAKAR (style/cover-topic.png).",
        fb="Bayangkan melempar bola sekencang mungkin sampai lengkungan jatuhnya sama dengan lengkungan Bumi: bola itu jatuh terus tapi tak pernah mendarat. Itulah satelit. Masalahnya, di ketinggian ratusan kilometer masih ada sedikit udara yang pelan-pelan mencuri kecepatannya. Itulah yang menjatuhkan teleskop NASA Swift di langit Sumatera Utara, Rabu malam 4 November.",
        q="Kamu lihat cahaya aneh di langit Sumatera Utara malam itu?",
        single="4 Nov 19.39 WIB, teleskop NASA Swift (±1,5 ton) terbakar di langit Sumatera Utara. Panasnya dari udara yang termampatkan, bukan gesekan. Belum ada puing yang ditemukan. #Antariksa #CaraKerja",
        thread=["Rabu malam, teleskop NASA hampir 1,5 ton terbakar di langit Sumatera Utara. Kenapa ia jatuh? #CaraKerja", "Satelit terus jatuh, tapi melaju begitu cepat sehingga selalu meleset dari Bumi. Sisa udara tipis pelan-pelan mencuri kecepatannya.", "Saat Matahari memuncak, atmosfer atas mengembang. Swift turun dari 275 km (20 Okt) ke 190 km (3 Nov).", "Di 120 km lajunya sekitar 28.000 km/jam. Udara di depannya termampatkan sampai berpijar. #Antariksa"],
        th_open="Teleskop NASA hampir 1,5 ton terbakar di langit Sumatera Utara, 4 November 19.39 WIB. Ini cara satelit jatuh ke Bumi. #CaraKerja",
        th=["Swift tak punya mesin untuk naik lagi. Saat Matahari memuncak, atmosfer atas mengembang dan orbitnya turun makin cepat. Di batas 120 km, udara di depannya termampatkan sampai berpijar, bukan karena gesekan.", "NASA menghitung risiko melukai orang 1:2.100. Prakiraan BRIN 19.42, nyatanya 19.39. Kamu sempat melihatnya? #Antariksa"],
    ),
    "EP22_JAM_NUKLIR": dict(
        day="Kamis, 26 November 2026", cover="JAM NUKLIR TANPA REAKTOR", tags="#Fisika #JamNuklir",
        tiktok="Jam ini nuklir, tapi tanpa reaktor. Yang berdetak adalah inti atom thorium di dalam kristal, dan untuk pertama kalinya ia mengoreksi lasernya sendiri lebih dari 24 jam. Ini cara kerjanya.",
        pin="CARA KERJA VIRAL · EP 22. Sumber: Nature (7 Okt 2026, TU Wien + PTB; Tsinghua di hari yang sama), rilis PTB, RRI (4 Nov 2026). '1 detik dalam 30 juta tahun' adalah kestabilan rata-rata sehari, bukan akurasi. Visual ilustrasi.",
        ig="Jam nuklir belum mengalahkan jam atom terbaik, tapi ia membuka pintu baru. Bagian mana yang paling bikin penasaran? Tulis di komentar.",
        points=["'Nuklir' di sini bukan reaktor: yang berdetak adalah inti atom thorium 229.", "Setiap jam butuh ayunan teratur dan penghitung: bandul, kuarsa 32.768 kali per detik, lalu elektron cesium.", "Inti atom 10.000 kali lebih kecil dan terlindung; thorium 229 cukup digeser dengan laser ultraviolet, bukan sinar gamma.", "Inti di kristal hanya menyerap cahaya bila frekuensi laser pas; sensor membaca, laser didorong kembali, laser yang terkunci itulah detaknya.", "Rata-rata sehari setara meleset 1 detik dalam 30 juta tahun, tapi jam atom optik terbaik masih unggul dan jam Beijing sekitar 6 kali lebih stabil."],
        audio="Detak tok kayu bandul yang berubah menjadi detik presisi saat laser terkunci, di atas pad kaca.",
        alts=["Jam Nuklir Tanpa Reaktor, Apa Maksudnya?", "Jam yang Berdetak dengan Inti Atom", "Cara Kerja Jam Nuklir Thorium"],
        desc="Cara kerja jam nuklir thorium 229: inti atom di dalam kristal hanya menyerap laser pada frekuensi yang pas, lalu umpan balik menjaga laser tetap terkunci. Jam TU Wien dan PTB mengoreksi dirinya lebih dari 24 jam (Nature, 7 Oktober 2026); tim Beijing terbit di hari yang sama.",
        src="Nature (7 Oktober 2026), rilis PTB via EurekAlert, ScienceDaily, RRI.",
        ytags="jam nuklir, thorium 229, jam atom, tu wien, ptb, fisika, laser, inti atom, cara kerja, sains, audira",
        thumb="Kristal kaca bercahaya dengan judul JAM NUKLIR dan stempel TANPA REAKTOR (style/cover-topic.png).",
        fb="Bayangkan jam yang tidak berdetak dengan roda gigi atau baterai, tapi dengan inti atom di dalam kristal sebesar butir gula. Inti thorium hanya 'menjawab' cahaya laser bila frekuensinya pas, jadi laser terus dikoreksi agar tetap pas. Hasilnya, rata-rata sehari, setara meleset satu detik dalam 30 juta tahun. Tapi ini belum jam terbaik di dunia.",
        q="Menurutmu, untuk apa manusia butuh jam setepat ini?",
        single="Jam nuklir tanpa reaktor: yang berdetak inti atom thorium di kristal. Untuk pertama kalinya ia mengoreksi lasernya sendiri >24 jam. Tapi jam atom optik terbaik masih unggul. #Fisika #CaraKerja",
        thread=["Jam ini nuklir, tapi tanpa reaktor. Yang berdetak justru inti atom. #CaraKerja", "Elektron gampang terganggu. Inti atom 10.000 kali lebih kecil dan terlindung. Thorium 229 bisa digeser cukup dengan laser ultraviolet.", "Inti di kristal hanya menyerap cahaya bila frekuensi laser pas. Melenceng sedikit, laser didorong kembali. Laser yang terkunci itulah detaknya.", "Rata-rata sehari: meleset 1 detik dalam 30 juta tahun. Itu kestabilan, bukan akurasi. #Fisika"],
        th_open="Jam nuklir tanpa reaktor: yang berdetak adalah inti atom thorium di dalam kristal. Ini cara kerjanya. #CaraKerja",
        th=["Laser ultraviolet diarahkan ke kristal berisi triliunan inti thorium. Inti hanya menyerap cahaya bila frekuensinya pas, jadi sensor terus mendorong laser kembali ke titik itu. Jam TU Wien dan PTB bertahan lebih dari 24 jam, dan tim Beijing terbit di hari yang sama.", "Belum mengalahkan jam atom optik terbaik, tapi berpotensi jauh lebih peka pada perubahan konstanta alam. Menurutmu untuk apa jam setepat ini? #Fisika"],
    ),
    "EP23_PLTN_TERAPUNG": dict(
        day="Jumat, 27 November 2026", cover="PLTN DI ATAS KAPAL", tags="#Energi #Nuklir",
        tiktok="Rencana pembangkit nuklir terapung untuk Halmahera: dua kapal, total 200 megawatt. Padahal aturan kita masih mengartikan lokasi nuklir sebagai daratan. Bagaimana cara kerjanya, dan apa yang sudah benar-benar diputuskan?",
        pin="CARA KERJA VIRAL · EP 23. Sumber: rilis Rosatom (16 Okt 2026), Kompas (4 Nov 2026), Dunia Energi (kutipan BAPETEN), IAEA PRIS (Akademik Lomonosov). Pemerintah belum memutuskan, izin operasi belum diajukan. Visual ilustrasi.",
        ig="Ini bukan keputusan pemerintah, tapi kontrak swasta. Bagian mana yang baru kamu tahu? Tulis di komentar.",
        points=["16 Oktober 2026, Rosatom meneken kontrak listrik dengan perusahaan swasta Indonesia untuk dua kapal pembangkit, total 200 MW, untuk Halmahera.", "Pemerintah belum memutuskan dan izin operasi belum diajukan; BAPETEN merevisi aturan agar lokasi bisa di perairan.", "Di reaktor, neutron membelah inti uranium; batang kendali menyerap neutron berlebih agar reaksi stabil.", "Air bertekanan tinggi membawa panas ke sirkuit kedua yang terpisah; uapnya memutar turbin dan generator.", "Air laut hanya mendinginkan uap bekas di kondensor tanpa menyentuh air reaktor; Akademik Lomonosov sudah beroperasi sejak 2020."],
        audio="Ketukan pen plotter dan deburan laut di bawah pad hangat, lalu dengung turbin saat listrik mengalir.",
        alts=["PLTN Terapung untuk Halmahera, Bagaimana Cara Kerjanya?", "Pembangkit Nuklir di Atas Kapal", "Kenapa Aturan PLTN Kita Harus Diubah?"],
        desc="Cara kerja pembangkit listrik tenaga nuklir terapung: reaksi berantai yang dikendalikan, dua sirkuit air terpisah, turbin dan generator, serta air laut yang hanya mendinginkan kondensor. Dipicu kontrak Rosatom dengan perusahaan swasta Indonesia untuk Halmahera dan revisi aturan BAPETEN.",
        src="Rosatom, Kompas, Dunia Energi (kutipan BAPETEN), IAEA PRIS, World Nuclear Association.",
        ytags="pltn terapung, pembangkit nuklir, halmahera, rosatom, bapeten, akademik lomonosov, energi nuklir, cara kerja, energi, audira",
        thumb="Tongkang PLTN dalam garis blueprint dengan judul PLTN terapung (style/cover-topic.png).",
        fb="Bayangkan pembangkit listrik yang dirakit di galangan kapal, lalu ditarik ke laut dan dihubungkan ke daratan dengan kabel. Itulah PLTN terapung. Cara kerjanya sama seperti pembangkit uap biasa, bedanya sumber panas dari reaksi nuklir. Untuk Halmahera, yang ada baru kontrak swasta; pemerintah belum memutuskan dan aturannya masih direvisi.",
        q="Menurutmu, PLTN terapung cocok untuk pulau-pulau di Indonesia timur?",
        single="PLTN terapung untuk Halmahera: dua kapal, total 200 MW, dari kontrak Rosatom dengan perusahaan swasta. Pemerintah belum memutuskan, dan aturan lokasi nuklir masih 'daratan'. #Energi #CaraKerja",
        thread=["Pembangkit nuklir terapung untuk Halmahera. Padahal aturan kita masih mengartikan lokasi nuklir sebagai daratan. #CaraKerja", "16 Okt, Rosatom meneken kontrak listrik dengan perusahaan swasta Indonesia: dua kapal, total 200 MW. Pemerintah belum memutuskan.", "Reaktor kecil memanaskan air bertekanan tinggi, panasnya diteruskan ke sirkuit kedua yang terpisah, uapnya memutar turbin.", "Air laut hanya mendinginkan kondensor dan kembali sedikit lebih hangat. #Energi"],
        th_open="Pembangkit nuklir di atas kapal untuk Halmahera. Ini cara kerjanya, dan apa yang sudah benar-benar diputuskan. #CaraKerja",
        th=["Yang ada baru kontrak listrik antara Rosatom dan perusahaan swasta Indonesia: dua kapal, total 200 MW. Pemerintah belum memutuskan, izin operasi belum diajukan, dan BAPETEN sedang merevisi aturan agar lokasi nuklir bisa di perairan.", "PLTN terapung bukan hal baru: Akademik Lomonosov sudah beroperasi di Arktik Rusia sejak 2020. Menurutmu cocok untuk Indonesia timur? #Energi"],
    ),
    "EP24_PINTU_AIR_PINGLU": dict(
        day="Sabtu, 28 November 2026", cover="KAPAL TURUN TANPA POMPA", tags="#TeknikSipil #Kapal",
        tiktok="Kapal 5.000 ton turun hampir setinggi gedung 10 lantai, tanpa satu pompa pun. Rahasianya pintu air bertingkat di Terusan Pinglu, Tiongkok, dan kolam yang menabung airnya. Ini cara kerjanya.",
        pin="CARA KERJA VIRAL · EP 24. Sumber: Xinhua, CGTN (7 Nov 2026), CCTV via Global Times, Panama Canal Authority. Klaim rekor berasal dari media pemerintah Tiongkok. Visual diorama adalah ilustrasi.",
        ig="Cuma gravitasi dan pintu yang tepat. Bagian mana yang paling bikin kagum? Tulis di komentar.",
        points=["Terusan Pinglu di Tiongkok melayani kapal niaga sejak 16 September 2026; airnya turun sekitar 65 meter menuju laut.", "Sungai dibuat seperti tangga tiga tingkat: pintu air Madao, Qishi, dan Qingnian.", "Kamar sepanjang 300 meter ditutup dua daun pintu berbentuk V yang makin rapat ditekan air.", "Katup di lorong bawah lantai dibuka, air mengalir keluar sendiri dan kapal ikut turun, di Madao sampai 29,6 meter.", "Tiga kolam bertingkat menabung air saat kapal turun dan mengembalikannya saat kapal naik; lebih dari 60% air dipakai ulang."],
        audio="Waltz kotak musik dengan dengung air yang turun nadanya saat kamar dikuras, plus derit pintu dan ratchet katup.",
        alts=["Kapal 5.000 Ton Turun Tanpa Pompa", "Cara Kerja Pintu Air Raksasa Terusan Pinglu", "Kenapa Kanal Dibuat Seperti Tangga?"],
        desc="Cara kerja pintu air (ship lock) di Terusan Pinglu, Tiongkok: tangga tiga tingkat, pintu berbentuk V, katup di lorong bawah lantai, gravitasi tanpa pompa, dan kolam hemat air yang memakai ulang lebih dari 60% air.",
        src="Xinhua, CGTN, CCTV via Global Times, Panama Canal Authority.",
        ytags="terusan pinglu, pintu air, ship lock, kanal, kapal, teknik sipil, madao, gravitasi, cara kerja, tiongkok, audira",
        thumb="Diorama kanal dengan kapal mainan dan judul TURUN 10 LANTAI (style/cover-topic.png).",
        fb="Bayangkan bak mandi bertingkat: buka keran di dasar bak atas, airnya turun sendiri, dan perahu mainan di dalamnya ikut turun. Pintu air bekerja persis begitu, hanya saja baknya sepanjang 300 meter dan perahunya kapal 5.000 ton. Di Terusan Pinglu, airnya bahkan ditabung di kolam samping untuk dipakai lagi.",
        q="Menurutmu, sungai di Indonesia mana yang cocok diberi pintu air seperti ini?",
        single="Kapal 5.000 ton turun hampir setinggi gedung 10 lantai tanpa satu pompa pun. Terusan Pinglu memakai tangga pintu air dan kolam yang memakai ulang >60% air. #TeknikSipil #CaraKerja",
        thread=["Kapal 5.000 ton turun hampir setinggi gedung 10 lantai, tanpa satu pompa pun. #CaraKerja", "Terusan Pinglu dibuat seperti tangga tiga tingkat: Madao, Qishi, Qingnian. Tiap anak tangga adalah pintu air.", "Katup di lorong bawah lantai dibuka, air mengalir keluar sendiri, kapal ikut turun. Di Madao sampai 29,6 meter.", "Tiga kolam bertingkat menabung airnya untuk kapal yang naik. Lebih dari 60% dipakai ulang. #TeknikSipil"],
        th_open="Kapal 5.000 ton turun setinggi gedung 10 lantai tanpa pompa. Ini cara kerja pintu air Terusan Pinglu. #CaraKerja",
        th=["Kapal masuk kamar sepanjang 300 meter, pintu belakang berbentuk V menutup, lalu katup di bawah lantai dibuka. Air turun sendiri karena gravitasi. Satu kamar memuat sekitar 300.000 meter kubik air, terisi dalam kira-kira 15 menit.", "Menurut media pemerintah Tiongkok, ini rekor untuk pintu air hemat air. Sungai Indonesia mana yang cocok diberi pintu air? #TeknikSipil"],
    ),
    "EP25_PESAWAT_BOM_AIR": dict(
        day="Minggu, 29 November 2026", cover="15 TON AIR DARI LANGIT", tags="#Karhutla #Penerbangan",
        tiktok="15 ton air dijatuhkan dari langit Samarinda, dan pesawatnya justru melompat ke atas. Airnya bukan disendok dari sungai. Ini cara kerja pesawat bom air yang membantu memadamkan karhutla.",
        pin="CARA KERJA VIRAL · EP 25. Sumber: BNPB (6 Nov 2026), ANTARA, RRI, spesifikasi CL-415. Pesawat amfibi CL-415 hanya contoh tipe, bukan pesawat di Samarinda. Visual komik adalah ilustrasi.",
        ig="Pesawat bom air tidak memadamkan sendirian, ia membeli waktu untuk tim darat. Fakta mana yang paling mengejutkan? Tulis di komentar.",
        points=["6 November 2026, tanker Hercules C-130 sipil milik pemadam New South Wales tiga kali menjatuhkan air di Makroman, Samarinda.", "Airnya diisi selang di Balikpapan: 15.000 liter, kira-kira 15 ton, isi ulang sekitar 20 menit.", "Ada dua pesawat, tapi hanya satu yang membawa air; yang kecil adalah pemandu yang menandai jalur dan mengecek bahaya.", "Begitu 15 ton hilang dalam beberapa detik, gaya angkat sayap masih sama tapi beratnya turun drastis, jadi pesawat terdorong naik.", "Pesawat amfibi seperti CL-415 menyendok 6.137 liter dalam 12 detik, tapi bara gambut di bawah tanah tetap butuh tim darat."],
        audio="Funk 116 bpm dengan dengung turboprop, guyuran air saat pintu tangki terbuka, dan HUP! saat pesawat melompat.",
        alts=["Kenapa Pesawat Bom Air Melompat Setelah Menjatuhkan Air?", "15 Ton Air dari Langit Samarinda", "Cara Kerja Pesawat Pemadam Karhutla"],
        desc="Cara kerja pesawat bom air: tangki 15.000 liter yang diisi di bandara, pesawat pemandu, pintu tangki yang dibuka komputer, dan alasan pesawat melompat setelah menjatuhkan air. Dipicu water bombing tanker C-130 dari Australia di Samarinda, 6 November 2026.",
        src="BNPB, ANTARA, RRI, spesifikasi pabrikan CL-415.",
        ytags="water bombing, pesawat pemadam, karhutla, samarinda, c-130, hercules, cl-415, kebakaran hutan, cara kerja, penerbangan, audira",
        thumb="Tanker kuning menjatuhkan air di atas hutan terbakar dengan judul 15 TON AIR (style/cover-topic.png).",
        fb="Bayangkan memanggul ember berisi 15 ton air, lalu tiba-tiba ember itu kosong dalam beberapa detik. Tubuhmu pasti terdorong naik. Itulah yang dialami pesawat bom air setelah menjatuhkan muatannya di atas api di Samarinda. Tapi pesawat ini tidak memadamkan sendirian: ia membeli waktu untuk tim darat, terutama saat bara gambut menyala di bawah tanah.",
        q="Menurutmu, Indonesia perlu punya armada pesawat bom air sendiri?",
        single="15 ton air dijatuhkan dari langit Samarinda, dan pesawatnya melompat ke atas. Airnya diisi di Balikpapan, bukan disendok dari sungai. Hanya satu pesawat yang membawa air. #Karhutla #CaraKerja",
        thread=["15 ton air dijatuhkan dari langit. Dan pesawatnya justru melompat ke atas. #CaraKerja", "6 Nov, tanker C-130 sipil milik pemadam New South Wales tiga kali menjatuhkan air di Makroman, Samarinda.", "Airnya tidak disendok dari sungai. Selang di Balikpapan mengisi 15.000 liter. Pesawat kecil di depannya adalah pemandu.", "Begitu 15 ton hilang dalam beberapa detik, gaya angkat masih sama tapi berat turun drastis. Pesawat terdorong naik. #Karhutla"],
        th_open="15 ton air dari langit Samarinda, lalu pesawatnya melompat ke atas. Ini cara kerja pesawat bom air. #CaraKerja",
        th=["Tanker C-130 diisi 15.000 liter di Balikpapan, dipandu pesawat kecil yang menandai jalur, lalu terbang rendah dan membuka pintu tangki dengan lebar dan lama tertentu. Air pecah jadi hujan lebat di sisi api.", "Tapi bara gambut menyala di bawah tanah, jadi tetap butuh tim darat. Perlukah Indonesia punya armada sendiri? #Karhutla"],
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
