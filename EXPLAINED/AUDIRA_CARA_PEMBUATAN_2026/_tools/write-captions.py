"""Writes each episode's SOCIAL_CAPTIONS.md (6 platforms, upload schedule, AI label). Chapters come from project/timeline.json.
Adapted from the Sejarah Game series. Run after the final render: python _tools/write-captions.py"""
import json
from pathlib import Path

SERIES = Path(__file__).resolve().parent.parent
fmt = lambda t: f"{int(t // 60)}:{int(t % 60):02}"
BASE = "#CaraPembuatan #ProsesPabrik #AUDIRA"
CH = "AUDIRA Explained (@AudiraExplained)"

E = {
    "EP01_PENSIL": dict(
        day="Sabtu, 21 November 2026",
        title="Isi Pensil Bukan Timbal! Begini Cara Pensil Dibuat", cover="PENSIL TANPA TIMBAL", tags="#Pensil #FaktaUnik",
        hook="Isi pensil tidak pernah mengandung timbal. Sama sekali.",
        tiktok="Isi pensil itu campuran grafit dan tanah liat yang dibakar seperti keramik, lalu dijepit di antara dua papan kayu seperti roti lapis. Pensil tidak pernah dibor. Kamu tim pensil 2B atau HB?",
        pin="CARA PEMBUATAN · EP 01. Sumber: Wikipedia, How Products Are Made, situs produsen pensil, Electrochemistry Communications. Visual ilustrasi, bukan rekaman pabrik asli.",
        ig="Yang kamu pegang tiap hari ternyata keramik di dalam kayu. Kamu baru tahu? Tulis di komentar.",
        points=["Grafit ditemukan di Inggris abad ke-16 dan dikira bijih timbal, jadi namanya keliru sampai sekarang.", "Isinya bubuk grafit, tanah liat, dan air, dipres lewat lubang kecil jadi batang tipis seperti spageti.", "Batang dibakar sekitar 1.000 derajat tanpa oksigen, lalu direndam lilin panas.", "Isi diletakkan di alur papan kayu cedar, ditutup papan kedua, dipres, lalu dipotong jadi beberapa pensil sekaligus.", "Makin banyak tanah liat makin keras (kode H), makin banyak grafit makin hitam (kode B)."],
        audio="Musik akustik ringan dengan petikan pizzicato dan goresan pensil di kertas.",
        alts=["Kenapa Pensil Disebut Lead Padahal Bukan Timbal?", "Pensil Itu Keramik di Dalam Kayu", "Pensil Tidak Pernah Dibor, Ini Rahasianya"],
        desc="Isi pensil dibuat dari grafit dan tanah liat yang dibakar seperti keramik, lalu dijepit di antara dua papan kayu. Pensil tidak pernah dibor.",
        src="Wikipedia (Pencil, dibaca 11 Nov 2026); How Products Are Made Vol. 1; situs resmi produsen pensil Jerman dan Ceko; Electrochemistry Communications (2021)",
        ch=["Hook", "Grafit dikira timbal", "Adonan jadi spageti", "Dibakar seperti keramik", "Roti lapis kayu", "Kode H dan B", "Cat 8 lapis", "Penutup"],
        ytags="cara pembuatan pensil, pensil, grafit, proses pabrik, pensil bukan timbal, kode H B pensil, cara pembuatan, fakta unik, audira explained, audira",
        thumb="Sketsa pensil terbelah memperlihatkan isi grafit, teks PENSIL TANPA TIMBAL (style/cover-topic.png).",
        fb="Sejak kecil kita menyebutnya isi pensil timbal. Padahal isinya grafit dan tanah liat yang dibakar seperti keramik. Nama keliru itu bertahan sejak abad ke-16.",
        q="Kamu tim pensil 2B atau HB?",
        single="Isi pensil tidak pernah mengandung timbal. Isinya grafit dan tanah liat yang dibakar seperti keramik, lalu dijepit di antara dua papan kayu. Pensil tidak pernah dibor. #Pensil #CaraPembuatan",
        thread=["Isi pensil tidak pernah mengandung timbal. Sama sekali. #CaraPembuatan", "Abad ke-16, orang Inggris menemukan grafit dan mengira itu bijih timbal. Namanya keliru sampai sekarang.", "Grafit dan tanah liat dipres jadi batang tipis, lalu dibakar sekitar 1.000 derajat seperti keramik.", "Isi diletakkan di alur papan kayu, ditutup papan kedua, lalu dipotong. Pensil tidak pernah dibor. #Pensil"],
        th_open="Isi pensil tidak pernah mengandung timbal. Isinya keramik dari grafit dan tanah liat. #CaraPembuatan",
        th=["Batangnya dibakar sekitar 1.000 derajat tanpa oksigen, lalu dijepit di antara dua papan kayu seperti roti lapis. Pensil tidak pernah dibor.", "Kamu tim pensil 2B atau HB? #Pensil"],
    ),
    "EP02_KACA_JENDELA": dict(
        day="Minggu, 22 November 2026",
        title="Kaca Jendela Dibuat dengan Mengapung di Logam Cair", cover="KACA MENGAPUNG DI TIMAH", tags="#Kaca #FaktaUnik",
        hook="Kaca jendelamu dulu pernah mengapung di atas kolam logam cair.",
        tiktok="Kaca cair dialirkan ke kolam timah cair, mengapung, dan meratakan dirinya sendiri. Itu sebabnya kedua sisi kaca jendela mulus tanpa digosok. Kalau dibiarkan, tebalnya selalu berhenti di hampir 7 milimeter. Kamu baru tahu?",
        pin="CARA PEMBUATAN · EP 02. Sumber: Wikipedia (Float glass), situs resmi produsen kaca, Glass for Europe, Lehigh University. Visual ilustrasi, bukan rekaman pabrik asli.",
        ig="Jendela di rumahmu dulunya pita kaca yang berlayar di atas logam. Kamu baru tahu? Tulis di komentar.",
        points=["Metode float glass ditemukan Alastair Pilkington dan Kenneth Bickerstaff, eksperimen dimulai 1952, diumumkan 1959.", "Pasir, soda abu, dolomit, batu kapur, dan pecahan kaca bekas meleleh di tungku sekitar 1.500 derajat.", "Kaca cair mengapung di kolam timah cair di bawah selimut gas nitrogen dan hidrogen.", "Rol di tepi mengatur tebal; pita keluar sekitar 600 derajat lalu didinginkan pelan di terowongan kira-kira 100 meter.", "Timah lebih rapat dari kaca, tidak menempel, dan baru mendidih di atas 2.000 derajat."],
        audio="Ambient kristal dengan bel kaca dan dengung tungku yang hangat.",
        alts=["Cara Pembuatan Kaca Jendela di Pabrik", "Kenapa Kaca Jendela Bisa Rata Sempurna?", "Kaca yang Berlayar di Atas Timah Cair"],
        desc="Kaca jendela dibuat dengan metode float: kaca cair mengapung di kolam timah cair dan meratakan dirinya sendiri, jadi kedua sisinya mulus tanpa digosok.",
        src="Wikipedia (Float glass, dibaca 11 Nov 2026); situs resmi produsen kaca (sejarah proses float); Glass for Europe; Lehigh University IMI; arsip The New York Times",
        ch=["Hook", "Penemu 1952", "Bahan dan tungku", "Kolam timah cair", "Rol dan terowongan", "Kenapa timah", "Tebal 7 milimeter", "Penutup"],
        ytags="cara pembuatan kaca, kaca jendela, float glass, timah cair, proses pabrik, pilkington, cara pembuatan, fakta unik, audira explained, audira",
        thumb="Pita kaca bening melayang di atas kolam timah cair yang berkilau, teks KACA MENGAPUNG DI TIMAH (style/cover-topic.png).",
        fb="Pernah heran kenapa kaca jendela bisa rata sempurna di kedua sisinya? Rahasianya, kaca cair dibiarkan mengapung di atas kolam timah cair. Gravitasi yang meratakannya, bukan mesin gosok.",
        q="Menurutmu, kenapa yang dipakai timah, bukan logam lain?",
        single="Kaca jendela dibuat dengan mengapungkan kaca cair di atas kolam timah cair. Ia meratakan dirinya sendiri, jadi kedua sisinya mulus tanpa digosok. #Kaca #CaraPembuatan",
        thread=["Kaca jendelamu dulu pernah mengapung di atas kolam logam cair. #CaraPembuatan", "Bahannya pasir, soda abu, dolomit, batu kapur, dan pecahan kaca bekas, dilelehkan sekitar 1.500 derajat.", "Kaca cair dialirkan ke kolam timah cair. Ia mengapung, menyebar, dan meratakan dirinya sendiri.", "Kalau dibiarkan, tebalnya selalu berhenti di hampir 7 milimeter. #Kaca"],
        th_open="Kaca jendelamu dulu pernah mengapung di atas kolam logam cair. #CaraPembuatan",
        th=["Namanya metode float. Kaca cair mengapung di timah cair dan meratakan dirinya sendiri, jadi kedua sisinya mulus tanpa digosok.", "Kamu baru tahu fakta ini? #Kaca"],
    ),
    "EP03_KALENG_MINUMAN": dict(
        day="Senin, 23 November 2026",
        title="Kaleng Minuman Tanpa Sambungan, Dibuat dari Satu Cakram", cover="KALENG DARI SATU CAKRAM", tags="#Kaleng #FaktaUnik",
        hook="Kaleng minumanmu tidak punya sambungan. Seluruh badannya dulu cuma satu cakram aluminium datar.",
        tiktok="Satu cakram aluminium dipres jadi mangkuk, lalu didorong lewat cincin tarik dan tiga cincin setrika sampai jadi tabung tinggi. Semua dalam sekitar seperlima detik. Dindingnya cuma sekitar 0,1 milimeter. Kamu baru tahu?",
        pin="CARA PEMBUATAN · EP 03. Sumber: Wikipedia, Scientific American (Hosford & Duncan), Can Manufacturers Institute, The Aluminum Association. Visual ilustrasi, bukan rekaman pabrik asli.",
        ig="Kaleng di tanganmu dulunya cakram datar selebar telapak tangan. Kamu baru tahu? Tulis di komentar.",
        points=["Badan dan tutup kaleng dibuat di jalur terpisah, badan dari gulungan lembaran aluminium yang dilumasi.", "Mesin pres memotong cakram lalu menekannya jadi mangkuk pendek, ratusan per menit.", "Batang penekan mendorong mangkuk lewat satu cincin tarik dan tiga cincin setrika, sekitar seperlima detik.", "Leher dipersempit karena tutup dibuat dari paduan yang lebih keras dan tebal, supaya hemat logam.", "Kaleng soda dirancang menahan sekitar 6 bar; kaleng kosong hanya 13 sampai 15 gram."],
        audio="Groove mekanis yang memuaskan dengan dentang pres dan desis udara bertekanan.",
        alts=["Cara Pembuatan Kaleng Minuman di Pabrik", "Kenapa Kaleng Minuman Tidak Punya Sambungan?", "Kaleng Setipis Dua Halaman Majalah"],
        desc="Badan kaleng minuman dibuat dari satu cakram aluminium yang dipres dan ditarik jadi tabung tanpa sambungan dalam sekitar seperlima detik.",
        src="Wikipedia (Beverage can, dibaca 11 Nov 2026); Scientific American 271(3) (Hosford & Duncan); Can Manufacturers Institute; The Aluminum Association; Aluminium Magazine",
        ch=["Hook", "Gulungan aluminium", "Cakram jadi mangkuk", "Cincin tarik dan setrika", "Cetak, isi, tutup", "Kenapa leher menyempit", "Setipis 0,1 mm", "Penutup"],
        ytags="cara pembuatan kaleng, kaleng minuman, kaleng aluminium, proses pabrik, kaleng soda, cara pembuatan, satisfying, fakta unik, audira explained, audira",
        thumb="Cakram aluminium berubah jadi kaleng mengilap di lini pres, teks KALENG DARI SATU CAKRAM (style/cover-topic.png).",
        fb="Coba lihat kaleng minuman di dekatmu. Tidak ada jahitan di badannya. Seluruh badan itu dulunya satu cakram aluminium datar yang ditarik jadi tabung dalam sekejap.",
        q="Kamu biasa meremukkan kaleng kosong atau langsung buang?",
        single="Kaleng minuman tidak punya sambungan. Badannya dulu satu cakram aluminium datar, ditarik jadi tabung dalam sekitar seperlima detik. Dindingnya cuma 0,1 mm. #Kaleng #CaraPembuatan",
        thread=["Kaleng minumanmu tidak punya sambungan. Badannya dulu satu cakram aluminium datar. #CaraPembuatan", "Mesin pres memotong cakram lalu menekannya jadi mangkuk pendek, ratusan per menit.", "Batang penekan mendorong mangkuk lewat cincin tarik dan tiga cincin setrika. Dinding menipis dan memanjang.", "Hasilnya, dinding cuma sekitar 0,1 mm dan kaleng kosong hanya 13-15 gram. #Kaleng"],
        th_open="Kaleng minumanmu tidak punya sambungan. Seluruh badannya dulu satu cakram aluminium datar. #CaraPembuatan",
        th=["Cakram dipres jadi mangkuk, lalu didorong lewat cincin tarik dan tiga cincin setrika sampai jadi tabung tinggi, dalam sekitar seperlima detik.", "Kamu baru tahu? #Kaleng"],
    ),
    "EP04_KOREK_API": dict(
        day="Selasa, 24 November 2026",
        title="Kenapa Korek Api Cuma Menyala di Kotaknya?", cover="SETENGAH API DI KOTAK", tags="#KorekApi #FaktaUnik",
        hook="Korek api ini tidak akan menyala di dinding, batu, atau sepatu. Setengah resep apinya ada di kotak.",
        tiktok="Kepala korek berisi kalium klorat, sedangkan fosfor merahnya ada di kotak. Api baru menyala saat keduanya bertemu lewat gesekan. Merah di kepala korek cuma pewarna. Kamu baru tahu?",
        pin="CARA PEMBUATAN · EP 04. Sumber: Wikipedia, How Products Are Made Vol. 3, Tekniska museet, Museum Korek Api Jönköping, ChemEdX. Visual ilustrasi, bukan rekaman pabrik asli.",
        ig="Api kecil ini butuh dua bagian yang bertemu. Kamu baru tahu kenapa korek cuma menyala di kotaknya? Tulis di komentar.",
        points=["Korek fosfor putih dulu menyala di mana saja dan racunnya merusak rahang pekerja pabrik.", "Gustaf Erik Pasch dari Swedia memisahkan bahannya tahun 1844; Lundström bersaudara membuatnya massal tahun 1850-an.", "Satu gelondong kayu aspen bisa jadi sekitar 370.000 korek.", "Batang direndam amonium fosfat, dicelup parafin, lalu dicelup adonan kepala ribuan sekaligus.", "Gesekan mengubah sedikit fosfor merah di kotak jadi sangat reaktif, lalu bereaksi dengan kalium klorat di kepala."],
        audio="Ketukan mekanis mikro dengan desis api dan gemeretak sabuk baja.",
        alts=["Cara Pembuatan Korek Api di Pabrik", "Rahasia Korek Api Gores", "Merah di Kepala Korek Bukan Fosfor"],
        desc="Korek api pengaman hanya menyala di kotaknya karena bahan apinya dipisah: kalium klorat di kepala, fosfor merah di kotak.",
        src="Wikipedia (Match, dibaca 11 Nov 2026); How Products Are Made Vol. 3; Tekniska museet; Museum Korek Api Jönköping; Royal College of Surgeons of England; ChemEdX",
        ch=["Hook", "Racun fosfor putih", "Dari gelondong kayu", "Rendam dan parafin", "Celup kepala korek", "Kenapa menyala", "10 juta per shift", "Penutup"],
        ytags="cara pembuatan korek api, korek api, fosfor merah, kalium klorat, proses pabrik, korek api pengaman, cara pembuatan, fakta unik, audira explained, audira",
        thumb="Kepala korek dan bidang gores kotak bertemu dalam percikan mikro, teks SETENGAH API DI KOTAK (style/cover-topic.png).",
        fb="Coba gesekkan korek api ke dinding. Tidak akan menyala. Setengah resep apinya ada di bidang gores kotak, bukan di batangnya.",
        q="Kamu pernah mencoba menyalakan korek di tempat selain kotaknya?",
        single="Korek api pengaman cuma menyala di kotaknya karena bahannya dipisah: kalium klorat di kepala, fosfor merah di kotak. Merah di kepala korek cuma pewarna. #KorekApi #CaraPembuatan",
        thread=["Korek api ini tidak akan menyala di dinding, batu, atau sepatu. Setengah resep apinya ada di kotak. #CaraPembuatan", "Dulu korek fosfor putih menyala di mana saja, dan racunnya merusak rahang pekerja pabrik.", "Tahun 1844, Gustaf Erik Pasch dari Swedia memisahkan bahannya: kalium klorat di kepala, fosfor merah di kotak.", "Gesekan mempertemukan keduanya dan api menyala. Merah di kepala korek cuma pewarna. #KorekApi"],
        th_open="Korek api ini tidak akan menyala di dinding atau sepatu. Setengah resep apinya ada di kotak. #CaraPembuatan",
        th=["Kepala korek berisi kalium klorat, fosfor merahnya ada di kotak. Gesekan mempertemukan keduanya dan api menyala.", "Kamu baru tahu? #KorekApi"],
    ),
    "EP05_BOLA_GOLF": dict(
        day="Rabu, 25 November 2026",
        title="Kenapa Bola Golf Berlubang? Ternyata Terbang 2x Lebih Jauh", cover="LUBANG BIKIN TERBANG JAUH", tags="#BolaGolf #FaktaUnik",
        hook="Ratusan lubang kecil ini justru membuat bola golf terbang hampir dua kali lebih jauh.",
        tiktok="Dimple membuat lapisan udara tipis di permukaan bola bergolak dan menempel lebih lama. Pusaran di belakang bola mengecil, hambatan turun kira-kira separuh. Bola mulus cuma terbang kira-kira setengahnya. Kamu baru tahu?",
        pin="CARA PEMBUATAN · EP 05. Sumber: Wikipedia, How Products Are Made, The R&A dan USGA, Penn State University, Scientific American. Visual ilustrasi, bukan rekaman pabrik asli.",
        ig="Lubang kecil di bola golf itu bukan hiasan. Kamu baru tahu? Tulis di komentar.",
        points=["Bola getah abad ke-19 awalnya mulus, lalu pegolf sadar bola yang tergores terbang lebih jauh.", "Inti dari karet polybutadiene dicampur zinc diacrylate, dipanggang di cetakan bulat bertekanan.", "Kulit luar dicetak di antara dua setengah cetakan yang membentuk 300 sampai 500 dimple sekaligus.", "Bola dicat sambil diputar, dipernis, lalu diuji sinar-X dan robot pemukul.", "Batas kecepatan awal resmi bola golf sekitar 280 km/jam."],
        audio="Elektronik hangat bertempo sedang dengan desis udara dan bunyi pukulan bersih.",
        alts=["Cara Pembuatan Bola Golf di Pabrik", "Rahasia Lubang di Bola Golf", "Bola Golf Mulus Cuma Terbang Setengahnya"],
        desc="Dimple pada bola golf membuat aliran udara menempel lebih lama sehingga hambatan turun kira-kira separuh. Begini bola golf dibuat dari inti sampai kulit.",
        src="Wikipedia (Golf ball, dibaca 11 Nov 2026); How Products Are Made; The R&A dan USGA (aturan peralatan); Penn State University; Scientific American",
        ch=["Hook", "Bola tergores", "Inti karet", "Kulit dan dimple", "Cat dan uji", "Kenapa dimple", "Batas 280 km/jam", "Penutup"],
        ytags="cara pembuatan bola golf, bola golf, dimple, aerodinamika, proses pabrik, kenapa bola golf berlubang, cara pembuatan, fakta unik, audira explained, audira",
        thumb="Bola golf terbelah memperlihatkan inti dan kulit berdimple, teks LUBANG BIKIN TERBANG JAUH (style/cover-topic.png).",
        fb="Kenapa bola golf penuh lubang kecil? Ternyata lubang itu membuat bola terbang hampir dua kali lebih jauh dibanding bola mulus. Begini cara bola golf dibuat dan kenapa dimple bekerja.",
        q="Menurutmu, berapa jumlah dimple di bola golf yang pernah kamu pegang?",
        single="Ratusan lubang kecil di bola golf membuatnya terbang hampir dua kali lebih jauh. Dimple membuat udara menempel lebih lama, hambatan turun kira-kira separuh. #BolaGolf #CaraPembuatan",
        thread=["Ratusan lubang kecil ini membuat bola golf terbang hampir dua kali lebih jauh. #CaraPembuatan", "Bola mulus meninggalkan pusaran udara besar di belakangnya, yang menarik bola mundur.", "Dimple membuat lapisan udara tipis bergolak dan menempel lebih lama. Pusaran mengecil, hambatan turun kira-kira separuh.", "Pola 300 sampai 500 dimple dicetak sekaligus saat kulit bola dibentuk. #BolaGolf"],
        th_open="Ratusan lubang kecil ini justru membuat bola golf terbang hampir dua kali lebih jauh. #CaraPembuatan",
        th=["Dimple membuat udara menempel lebih lama di permukaan bola. Pusaran di belakangnya mengecil, hambatan turun kira-kira separuh.", "Kamu baru tahu? #BolaGolf"],
    ),
}

for name, e in E.items():
    T = json.load(open(SERIES / name / "project" / "timeline.json", encoding="utf8"))
    chapters = "\n".join(f"{fmt(0 if i == 0 else s['start'])} {c}" for i, (s, c) in enumerate(zip(T["scenes"], e["ch"])))
    pts = "\n".join(f"{i + 1}. {p}" for i, p in enumerate(e["points"]))
    alts = "\n".join(f"- {a}" for a in e["alts"])
    thread = "\n\n".join(f"{i + 1}/ {t}" for i, t in enumerate(e["thread"]))
    tags = f"{e['tags']} {BASE}"
    th = "\n\n".join(f"{i + 1}/ {t}" for i, t in enumerate(e["th"]))
    prev = list(E).index(name)
    prev_txt = f"episode sebelumnya {list(E)[prev - 1]}" if prev else "episode pertama, belum ada episode sebelumnya"
    md = f"""# SOCIAL CAPTIONS, EP {name[2:4]}: {e['title']}

Channel: {CH}

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

Created by Agus Dwi R. {CH}.

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
- Komentar pin: sebut nomor seri "CARA PEMBUATAN · EP {name[2:4]}", playlist "Cara Pembuatan", dan tautan {prev_txt}.
- Musik dan SFX disintesis sendiri di `project/mix.py` (pustaka SFX AUDIRA), tanpa lisensi pihak ketiga.
"""
    (SERIES / name / "SOCIAL_CAPTIONS.md").write_text(md, encoding="utf8")
    print(name, "threads", len(e["th_open"]), [len(t) for t in e["th"]], "title", len(e["title"]), "single", len(e["single"]), [len(f"{i + 1}/ {t}") for i, t in enumerate(e["thread"])])
