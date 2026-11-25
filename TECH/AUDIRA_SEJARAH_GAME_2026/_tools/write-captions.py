"""Writes each episode's SOCIAL_CAPTIONS.md (6 platforms, upload schedule, AI label). Chapters come from project/timeline.json.
Run from anywhere after the voice exists: python _tools/write-captions.py"""
import json
from pathlib import Path

SERIES = Path(__file__).resolve().parent.parent
fmt = lambda t: f"{int(t // 60)}:{int(t % 60):02}"
BASE = "#SejarahGame #FaktaGame #AUDIRA"

E = {
    "EP01_BOM_ATOM_TENNIS": dict(
        day="Jumat, 20 November 2026",
        title="Game Pertama Dibuat Ilmuwan Bom Atom? Kisah Tennis for Two", cover="GAME DARI ILMUWAN BOM ATOM", tags="#TennisForTwo #RetroGame",
        hook="Salah satu video game pertama di dunia dibuat oleh fisikawan yang ikut membuat bom atom pertama.",
        tiktok="William Higinbotham, anggota tim bom nuklir pertama, membuat Tennis for Two tahun 1958 untuk pengunjung lab Brookhaven. Layar osiloskop, dua pengendali aluminium, dan ratusan orang antre. Kamu baru tahu?",
        pin="SEJARAH GAME · EP 01. Sumber: Wikipedia (Tennis for Two, William Higinbotham), APS News, Kotaku. Visual ilustrasi, bukan cuplikan asli.",
        ig="Salah satu game hiburan pertama lahir dari tangan ilmuwan nuklir. Kamu baru tahu fakta ini? Tulis di komentar.",
        points=["William Higinbotham ikut tim bom nuklir pertama, lalu memimpin gerakan membatasi senjata nuklir.", "Tahun 1958 ia memimpin divisi instrumentasi di laboratorium Brookhaven, New York.", "Komputer analog lab bisa menghitung lintasan rudal atau bola memantul dengan hambatan angin.", "Tennis for Two tampil di osiloskop, dengan kenop untuk sudut dan tombol untuk memukul.", "Dirakit 3 minggu, dipamerkan 18 Oktober 1958, ratusan pengunjung antre."],
        audio="Jazz noir 1950-an: bass betot, snare sapu, dan nada terompet bisu, ditambah bunyi blip osiloskop.",
        alts=["Kisah Tennis for Two, Game Tahun 1958", "Ilmuwan Nuklir yang Bikin Video Game", "Game Pertama Lahir di Laboratorium"],
        desc="Tennis for Two dibuat tahun 1958 oleh William Higinbotham, fisikawan yang ikut tim bom nuklir pertama, untuk pameran laboratorium Brookhaven.",
        src="Wikipedia: Tennis for Two dan William Higinbotham (dibaca 10 Nov 2026); APS News (2008); Kotaku (2021)",
        ch=["Hook", "Ilmuwan bom atom", "Brookhaven 1958", "Komputer analog", "Tenis di osiloskop", "Ratusan pengunjung antre", "Dibongkar dan dilupakan", "Pertanyaan"],
        ytags="tennis for two, sejarah game, game pertama, william higinbotham, brookhaven, osiloskop, game retro, fakta game, sejarah video game, audira",
        thumb="Osiloskop hijau menyala di lab noir hitam-putih, teks GAME DARI ILMUWAN BOM ATOM (style/cover-topic.png).",
        fb="Bayangkan pameran laboratorium tahun 1958 yang isinya cuma pajangan diam. Lalu seorang fisikawan, yang dulu ikut membuat bom atom, memasang permainan tenis di layar osiloskop. Ratusan orang antre untuk mencobanya.",
        q="Menurutmu, apa game pertama yang kamu mainkan seumur hidup?",
        single="Salah satu video game pertama dibuat tahun 1958 oleh William Higinbotham, fisikawan yang ikut tim bom nuklir pertama. Namanya Tennis for Two, tampil di layar osiloskop. #TennisForTwo #SejarahGame",
        thread=["Salah satu video game pertama di dunia dibuat oleh fisikawan yang ikut membuat bom atom pertama. #SejarahGame", "Tahun 1958, William Higinbotham ingin pengunjung lab Brookhaven punya sesuatu untuk dimainkan.", "Komputer analog lab bisa menghitung bola memantul. Ia mengubahnya jadi tenis di layar osiloskop.", "Dirakit 3 minggu, ratusan orang antre, lalu dibongkar dan dilupakan. #TennisForTwo"],
        th_open="Salah satu video game pertama di dunia dibuat oleh fisikawan yang ikut membuat bom atom pertama. #SejarahGame",
        th=["Namanya Tennis for Two, tahun 1958: lapangan tenis dari samping di layar osiloskop, dengan kenop dan tombol di pengendali aluminium.", "Kamu baru tahu fakta ini? #TennisForTwo"],
    ),
    "EP02_PONG_KOIN_PENUH": dict(
        day="Sabtu, 21 November 2026",
        title="Mesin Pong Pertama Rusak karena Kebanyakan Koin", cover="PONG RUSAK KARENA KOIN", tags="#Pong #Atari",
        hook="Mesin game Pong yang pertama dilaporkan rusak. Ternyata penyebabnya koin yang terlalu banyak.",
        tiktok="Agustus 1972, Atari menaruh prototipe Pong di bar Andy Capp's Tavern. Beberapa hari kemudian mesinnya mati: wadah koinnya penuh sampai meluap oleh koin 25 sen. Kamu senang atau panik kalau jadi pemilik bar?",
        pin="SEJARAH GAME · EP 02. Sumber: Wikipedia (Pong, Andy Capp's Tavern), Vanity Fair. Visual ilustrasi, bukan cuplikan asli.",
        ig="Kerusakan paling menguntungkan dalam sejarah game. Kalau kamu pemilik bar itu, kamu senang atau panik? Tulis di komentar.",
        points=["Agustus 1972, Nolan Bushnell dan Allan Alcorn menaruh prototipe Pong di Andy Capp's Tavern, California.", "Prototipenya dari televisi hitam-putih seharga 75 dolar di lemari kayu.", "Malam pertama ramai, dan makin ramai selama 1,5 minggu.", "Mesinnya mati karena wadah koin penuh sampai meluap oleh koin 25 sen.", "Bank sempat menolak karena Pong dianggap sejenis pinball; Pong diumumkan 29 November 1972."],
        audio="Groove lo-fi hangat dengan marimba, Rhodes, dan bunyi koin berdenting.",
        alts=["Pong Rusak karena Terlalu Laris", "Kisah Prototipe Pong di Bar 1972", "Kerusakan Paling Menguntungkan di Sejarah Game"],
        desc="Prototipe Pong di Andy Capp's Tavern tahun 1972 berhenti bekerja karena wadah koinnya penuh. Dari situ Atari memutuskan membuat mesinnya sendiri.",
        src="Wikipedia: Pong dan Andy Capp's Tavern (dibaca 10 Nov 2026); Vanity Fair (2011)",
        ch=["Hook", "Bar di California", "Prototipe 75 dolar", "Malam pertama ramai", "Wadah koin meluap", "Atari bikin sendiri", "Bank menolak", "Pertanyaan"],
        ytags="pong, atari, sejarah game, andy capps tavern, nolan bushnell, allan alcorn, arcade 1972, game retro, fakta game, audira",
        thumb="Kabinet kayu pastel dengan koin tumpah dari pintunya, teks PONG RUSAK KARENA KOIN (style/cover-topic.png).",
        fb="Pemilik bar menelepon karena mesin game barunya rusak. Teknisinya datang, membuka mesin, dan menemukan penyebabnya: wadah koinnya penuh sampai meluap. Itu prototipe Pong, tahun 1972.",
        q="Kalau kamu pemilik bar itu, kamu senang atau panik?",
        single="Prototipe Pong di bar Andy Capp's Tavern tahun 1972 berhenti bekerja. Penyebabnya: wadah koinnya penuh sampai meluap oleh koin 25 sen. #Pong #SejarahGame",
        thread=["Mesin Pong yang pertama dilaporkan rusak. Penyebabnya koin yang terlalu banyak. #SejarahGame", "Agustus 1972, Atari menaruh prototipe Pong di sebuah bar di California, dekat jukebox dan mesin pinball.", "Beberapa hari kemudian mesinnya mati. Saat dibuka, wadah koinnya penuh sampai meluap.", "Atari batal menjual lisensi dan membuat mesinnya sendiri. Pong diumumkan 29 November 1972. #Pong"],
        th_open="Mesin Pong yang pertama dilaporkan rusak. Ternyata penyebabnya koin yang terlalu banyak. #SejarahGame",
        th=["Wadah koin prototipe di bar Andy Capp's Tavern penuh sampai meluap oleh koin 25 sen. Dari situ Atari memutuskan membuat mesinnya sendiri.", "Kamu senang atau panik kalau jadi pemilik bar itu? #Pong"],
    ),
    "EP03_STREET_FIGHTER_COMBO": dict(
        day="Minggu, 22 November 2026",
        title="Combo di Game Fighting Ternyata Berawal dari Bug", cover="COMBO BERAWAL DARI BUG", tags="#StreetFighter #GameFighting",
        hook="Combo, jurus berantai di game fighting, awalnya adalah bug yang tidak sengaja ditemukan.",
        tiktok="Saat mengecek bug di bonus stage Street Fighter II, pengembang Capcom melihat pukulan kedua bisa diselipkan di momen pukulan pertama. Timing-nya sulit, jadi dibiarkan tersembunyi. Combo terpanjangmu berapa pukulan?",
        pin="SEJARAH GAME · EP 03. Sumber: Wikipedia (Street Fighter II), TheXboxHub. Petarung di video adalah desain orisinal, bukan karakter asli.",
        ig="Kadang kesalahan bisa jadi fitur terbaik. Combo terpanjang yang pernah kamu lakukan berapa pukulan? Tulis di komentar.",
        points=["Street Fighter II dirilis Capcom tahun 1991 untuk arcade, dikerjakan 35-40 orang selama sekitar 2 tahun.", "Bonus stage muncul setiap 3 pertandingan: pemain menghancurkan mobil.", "Saat cek bug di sana, pengembang melihat pukulan kedua bisa diselipkan.", "Timing-nya sangat sulit, jadi fitur itu tidak dihapus tapi disembunyikan.", "Tim mengira maksimal 4 pukulan, ternyata bisa 8; combo lalu jadi standar game fighting."],
        audio="Groove arcade fighting 140 BPM dengan dentuman di setiap pukulan.",
        alts=["Asal Usul Combo di Street Fighter II", "Bug yang Mengubah Game Fighting", "Kenapa Game Fighting Punya Combo?"],
        desc="Sistem combo di Street Fighter II berawal dari bug yang ditemukan saat pengecekan bonus stage, lalu menjadi fitur standar game fighting.",
        src="Wikipedia: Street Fighter II (dibaca 10 Nov 2026); TheXboxHub (2021)",
        ch=["Hook", "Street Fighter II 1991", "Bonus stage mobil", "Ada yang aneh", "Dibiarkan tersembunyi", "Bisa sampai 8", "Jadi fitur standar", "Pertanyaan"],
        ytags="street fighter 2, combo, sejarah game, capcom, game fighting, bug game, arcade 1991, fakta game, game retro, audira",
        thumb="Dua petarung cel-shaded dengan bintang benturan dan stempel BUG?, teks COMBO BERAWAL DARI BUG (style/cover-topic.png).",
        fb="Bayangkan kamu sedang mengecek bug, lalu menemukan trik yang ternyata mengubah satu genre. Itulah kisah combo di Street Fighter II: awalnya dianggap terlalu sulit, disembunyikan, dan akhirnya jadi fitur standar game fighting.",
        q="Combo terpanjang yang pernah kamu lakukan berapa pukulan?",
        single="Combo di game fighting awalnya bug. Pengembang Street Fighter II menemukannya saat mengecek bonus stage, lalu membiarkannya tersembunyi. Ternyata bisa sampai 8 pukulan. #StreetFighter #SejarahGame",
        thread=["Combo, jurus berantai di game fighting, awalnya adalah bug. #SejarahGame", "Saat mengecek bug di bonus stage Street Fighter II, pengembang melihat pukulan kedua bisa diselipkan.", "Timing-nya terlalu sulit, jadi fitur itu tidak dihapus, tapi dibiarkan tersembunyi.", "Tim mengira maksimal 4 pukulan, ternyata bisa 8. Combo lalu jadi standar game fighting. #StreetFighter"],
        th_open="Combo di game fighting ternyata berawal dari bug yang tidak sengaja ditemukan. #SejarahGame",
        th=["Pengembang Street Fighter II menemukannya saat mengecek bonus stage menghancurkan mobil. Awalnya disembunyikan karena timing-nya terlalu sulit.", "Combo terpanjangmu berapa pukulan? #StreetFighter"],
    ),
    "EP04_GAME_BOY_PERANG_TELUK": dict(
        day="Senin, 23 November 2026",
        title="Game Boy Kena Bom di Perang Teluk, Tetap Main Tetris", cover="KENA BOM, TETAP MAIN TETRIS", tags="#GameBoy #Nintendo",
        hook="Sebuah Game Boy terbakar dan meleleh kena bom. Tapi saat dinyalakan, ia masih bisa main Tetris.",
        tiktok="Game Boy milik Stephan Scoggins, petugas medis di Perang Teluk, meleleh saat baraknya kena bom. Teknisi Nintendo Power menyebutnya tidak tertolong, tapi konsolnya masih menyala dan main Tetris. Konsol pertamamu masih ada?",
        pin="SEJARAH GAME · EP 04. Sumber: Wikipedia (Nintendo New York, Game Boy), The Verge, Military.com. Visual ilustrasi, bukan cuplikan asli.",
        ig="Konsol paling tangguh di dunia: kena bom, tetap main Tetris. Konsol game pertamamu dulu masih ada? Tulis di komentar.",
        points=["Game Boy dirilis Nintendo tahun 1989 dan di Amerika dijual satu paket dengan Tetris.", "Game Boy milik Stephan Scoggins terbakar saat baraknya terkena bom di Perang Teluk.", "Ia mengirimnya ke majalah Nintendo Power, berharap bisa diganti.", "Teknisi menilainya tidak tertolong, tapi ternyata masih menyala dan bisa main Tetris.", "Konsol itu dipajang di toko Nintendo New York, lalu kembali ke kantor pusat Nintendo Amerika (2023)."],
        audio="Bed produk premium yang tenang: pad lembut, piano, dan denyut sub, berubah gelap saat bom.",
        alts=["Game Boy Paling Tangguh di Dunia", "Kisah Game Boy dari Perang Teluk", "Game Boy Meleleh Masih Bisa Main Tetris"],
        desc="Game Boy milik petugas medis Stephan Scoggins meleleh kena bom di Perang Teluk, tapi masih menyala dan bisa main Tetris. Konsol itu sempat dipajang di toko Nintendo New York.",
        src="Wikipedia: Nintendo New York dan Game Boy (dibaca 10 Nov 2026); The Verge (2023); Military.com (2023)",
        ch=["Hook", "Game Boy 1989", "Barak kena bom", "Dikirim ke majalah", "Masih menyala", "Hadiah Desert Storm", "Dipajang di New York", "Pertanyaan"],
        ytags="game boy, perang teluk, game boy kena bom, nintendo, tetris, nintendo power, sejarah game, konsol retro, fakta game, audira",
        thumb="Konsol genggam abu-abu yang meleleh dengan layar hijau menyala, teks KENA BOM, MASIH MAIN TETRIS (style/cover-topic.png).",
        fb="Kebanyakan barang elektronik langsung mati kalau terbakar. Tapi ada satu Game Boy yang meleleh kena bom di Perang Teluk, dan saat dicoba masih bisa main Tetris. Konsol itu bahkan sempat dipajang di toko Nintendo di New York.",
        q="Konsol game pertamamu dulu masih ada, atau sudah hilang?",
        single="Game Boy milik petugas medis di Perang Teluk meleleh saat baraknya kena bom. Teknisi bilang tidak tertolong, tapi ternyata masih menyala dan bisa main Tetris. #GameBoy #SejarahGame",
        thread=["Sebuah Game Boy meleleh kena bom, tapi masih bisa main Tetris. #SejarahGame", "Pemiliknya Stephan Scoggins, petugas medis di Perang Teluk. Ia mengirim konsolnya ke majalah Nintendo Power.", "Teknisi menilainya tidak tertolong. Tapi saat dicoba, masih menyala; Start dan Select masih berfungsi.", "Konsol itu dipajang di toko Nintendo New York, lalu dikembalikan ke kantor pusat Nintendo Amerika. #GameBoy"],
        th_open="Ada Game Boy yang meleleh kena bom di Perang Teluk, tapi masih bisa main Tetris. #SejarahGame",
        th=["Majalah Nintendo Power mengirim Game Boy pengganti sebagai hadiah khusus Desert Storm, dan yang meleleh dipajang di toko Nintendo New York.", "Konsol pertamamu masih ada? #GameBoy"],
    ),
    "EP05_DOOM_WINDOWS_95": dict(
        day="Selasa, 24 November 2026",
        title="Game Ini Pernah Mengalahkan Windows 95: Kisah Doom", cover="DOOM KALAHKAN WINDOWS 95", tags="#Doom #RetroPC",
        hook="Tahun 1995, ada satu game yang diperkirakan terpasang di lebih banyak komputer daripada Windows 95.",
        tiktok="Doom dirilis 1993 dengan model shareware: episode pertama gratis dan boleh disalin. Akhir 1995 ia diperkirakan terpasang di lebih banyak komputer daripada Windows 95. Kamu pernah main demo gratis yang bikin ketagihan?",
        pin="SEJARAH GAME · EP 05. Sumber: Wikipedia (Doom 1993), Tom's Hardware, PC Gamer. Semua angka adalah perkiraan. Visual ilustrasi, bukan cuplikan asli.",
        ig="Game yang dibagikan gratis justru menyebar paling jauh. Kamu pernah main versi demo gratis yang bikin ketagihan? Tulis di komentar.",
        points=["Doom dirilis id Software tahun 1993 untuk MS-DOS.", "Model shareware: episode pertama gratis dan boleh disalin, dua episode lain dibeli.", "Hanya sekitar 1% pengunduh yang membeli, tapi itu sudah sekitar 100 ribu dolar per hari di awal.", "Mei 1994 versi gratisnya diperkirakan tersebar lebih dari 1 juta kali.", "Akhir 1995 Doom diperkirakan terpasang di lebih banyak komputer daripada Windows 95."],
        audio="Elektronik glossy akhir 90-an: arpeggio synth berbuih dan breakbeat ringan.",
        alts=["Doom Lebih Banyak Terpasang daripada Windows 95", "Rahasia Shareware Doom", "Bill Gates Pernah Masuk ke Game Doom"],
        desc="Doom menyebar lewat model shareware dan akhir 1995 diperkirakan terpasang di lebih banyak komputer daripada Windows 95. Semua angka di video ini adalah perkiraan.",
        src="Wikipedia: Doom (1993 video game) (dibaca 10 Nov 2026); Tom's Hardware (2026); PC Gamer (2026)",
        ch=["Hook", "Doom dari id Software", "Model shareware", "Satu persen pembeli", "Satu juta salinan", "Mengalahkan Windows 95", "Bill Gates di video promosi", "Pertanyaan"],
        ytags="doom, doom 1993, windows 95, shareware, id software, sejarah game, bill gates doom, game pc retro, fakta game, audira",
        thumb="Dua monitor krom DOOM vs Windows 95 di atas awan, teks GAME INI KALAHKAN WINDOWS 95? (style/cover-topic.png).",
        fb="Dulu banyak orang kenal game dari disket demo gratis yang disalin dari teman ke teman. Doom memakai cara itu, dan akhir 1995 diperkirakan sudah terpasang di lebih banyak komputer daripada Windows 95, sistem operasi baru Microsoft saat itu.",
        q="Kamu pernah main versi demo gratis yang bikin ketagihan? Game apa?",
        single="Akhir 1995, Doom diperkirakan terpasang di lebih banyak komputer daripada Windows 95. Rahasianya shareware: episode pertama gratis dan boleh disalin siapa saja. #Doom #SejarahGame",
        thread=["Tahun 1995 ada game yang diperkirakan terpasang di lebih banyak komputer daripada Windows 95. #SejarahGame", "Namanya Doom, dirilis id Software tahun 1993. Episode pertamanya gratis dan boleh disalin siapa saja.", "Hanya sekitar 1% pengunduh yang membeli versi lengkap, tapi itu sudah sekitar 100 ribu dolar per hari di awal.", "Video promosi Windows 95 bahkan menyisipkan Bill Gates ke dalam Doom. Semua angka ini perkiraan. #Doom"],
        th_open="Tahun 1995 ada satu game yang diperkirakan terpasang di lebih banyak komputer daripada Windows 95: Doom. #SejarahGame",
        th=["Rahasianya shareware: episode pertama gratis dan boleh disalin siapa saja. Versi gratisnya diperkirakan tersebar lebih dari 1 juta kali pada Mei 1994.", "Kamu pernah main demo gratis yang bikin ketagihan? #Doom"],
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
- Komentar pin: sebut nomor seri "SEJARAH GAME · EP {name[2:4]}", playlist "Sejarah Game", dan tautan episode sebelumnya.
- Musik dan SFX disintesis sendiri di `project/mix.py`, tanpa lisensi pihak ketiga.
"""
    (SERIES / name / "SOCIAL_CAPTIONS.md").write_text(md, encoding="utf8")
    print(name, "threads", len(e["th_open"]), [len(t) for t in e["th"]], "title", len(e["title"]), "single", len(e["single"]), [len(f"{i + 1}/ {t}") for i, t in enumerate(e["thread"])])
