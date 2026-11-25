"""Writes each episode's script-lines.json. Markup {display|spoken}: display goes on screen and in subtitles, spoken goes to Cartesia.
Run from AUDIRA_FAKTA_GAME_2026: python _tools/write-scripts.py"""
import json, re
from pathlib import Path

WOW = "{World of Warcraft|Werld of Workraft}"
MC = "{Minecraft|Mainkraft}"
MCd = "{Minecraft.|Mainkraft.}"
MCc = "{Minecraft,|Mainkraft,}"
PM = "{Pac-Man|Pekmen}"
CIV = "{Civilization|Sivilaiseisyen}"
SI = "{Space Invaders|Spes Invaders}"
NK = "{Nishikado|Nisyikado}"

S = {
    "EP01_WABAH_WOW": [
        "Tahun {2005,|dua ribu lima,} sebuah wabah menyapu kota-kota di game online. Sampai lembaga kesehatan Amerika ikut bertanya.",
        f"Gamenya {WOW}. Tiga belas September {{2005,|dua ribu lima,}} Blizzard membuka area baru bernama {{Zul'Gurub.|Zul Gurub.}} Bosnya, {{Hakkar,|Hakar,}} menyebarkan kutukan bernama Corrupted Blood. Darah tercemar ini menular ke pemain yang berdekatan, dan seharusnya hilang begitu bos dikalahkan.",
        "Masalahnya ada di hewan peliharaan. Pemain bisa menyimpan pet mereka di tengah pertarungan. Developer lupa memasang tombol mati, jadi pet yang terinfeksi tetap membawa kutukan itu. Begitu dikeluarkan lagi di kota yang ramai, wabah pun menyebar.",
        "{Damage-nya|Demej nya} dua ratus enam puluh tiga sampai tiga ratus tiga puluh tujuh poin setiap dua detik. Karakter level tertinggi bisa mati dalam tiga puluh detik atau kurang. {NPC|En Pi Si} juga tertular, tapi tidak bisa mati. Mereka jadi pembawa tanpa gejala.",
        "Reaksi pemainnya mirip dunia nyata. Ada healer yang jadi relawan di kota. Ada yang berjaga di pinggir kota, memperingatkan orang lain supaya tidak masuk. Ada juga yang sengaja menularkan diri, lalu datang ke keramaian.",
        "Blizzard mencoba karantina dan restart server, tapi wabah terus muncul lagi. Akhirnya server di-reset total, dan delapan Oktober, sebuah patch membuat pet kebal.",
        "Lalu {CDC,|Si Di Si,} lembaga pengendalian penyakit Amerika, menghubungi Blizzard dan meminta datanya. Jawabannya: ini cuma bug, datanya tidak ada. Tapi peneliti tetap menulis kejadian ini di jurnal ilmiah, karena reaksi pemainnya adalah reaksi manusia sungguhan.",
        "Jadi sebuah bug di game pernah jadi bahan riset wabah. Kalau kamu ada di sana, kamu jadi healer, atau kabur?",
    ],
    "EP02_CREEPER": [
        f"Monster paling terkenal di {MCc} Creeper, ternyata lahir dari bug.",
        f"Dua puluh Agustus {{2009.|dua ribu sembilan.}} {MC} masih versi awal sekali, pre-alpha. Pembuatnya, Markus Persson, yang dikenal sebagai {{Notch,|Noc,}} sedang membuat model babi.",
        "Model {3D|tri di} itu punya ukuran panjang dan tinggi. {Notch|Noc} tidak sengaja menukar keduanya. Babi yang harusnya pendek dan memanjang ke belakang, malah jadi tinggi dan berdiri tegak di atas empat kaki pendek. Di dalam kode, cuma dua angka yang tertukar.",
        "Hasilnya aneh. Tapi bukannya dihapus, {Notch|Noc} bilang: aku simpan saja, untuk makhluk yang menyeramkan. Dalam bahasa Inggris, creepy creature. Nama Creeper pas sekali dengan kata itu.",
        f"Model itu diberi warna hijau dari tekstur daun di game, lalu diberi {{AI|Ei Ai}} yang agresif. Satu September {{2009,|dua ribu sembilan,}} Creeper resmi masuk {MCc} di versi bernama {{0.24_SURVIVAL_TEST.|zero point two four survival test.}}",
        "Cara menyerangnya juga beda. Creeper hampir tanpa suara. Dia mendekat diam-diam, mendesis, lalu meledak dan menghancurkan blok di sekitarnya. Pemain yang terlalu dekat bisa terluka, bahkan mati. Belakangan ditambah versi Charged Creeper, yang muncul kalau tersambar petir.",
        f"Sekarang Creeper jadi salah satu ikon terbesar {MCc} muncul di merchandise dan iklan. Dia bahkan masuk daftar lima puluh penjahat game terbaik versi Guinness World Records Gamer's Edition.",
        "Jadi kadang kesalahan justru jadi ide terbaik. Kamu pernah bikin salah yang ternyata malah keren?",
    ],
    "EP03_PACMAN_256": [
        f"{PM} punya ujung. Di level dua ratus lima puluh enam, separuh layarnya hancur, dan levelnya tidak bisa diselesaikan.",
        f"{PM} rilis tahun {{1980.|seribu sembilan ratus delapan puluh.}} Makan semua titik, hindari empat hantu, lalu naik level. Di bawah layar, ikon buah menunjukkan level kamu.",
        "Komputer menyimpan angka dalam bit. Delapan bit, atau satu byte, cuma bisa menampung dua ratus lima puluh enam nilai, dari nol sampai dua ratus lima puluh lima. Lewat dari itu, angkanya kembali ke nol. Namanya integer overflow.",
        "Biasanya game cuma menggambar paling banyak tujuh buah. Tapi di level dua ratus lima puluh enam, hitungannya meluap, dan program mencoba menggambar dua ratus lima puluh enam buah. Gambarnya meluber, menimpa sisi kanan labirin dengan simbol acak.",
        "Titik di sisi yang rusak tidak bisa dimakan semua, jadi level itu tidak pernah selesai. Para pemain menyebutnya kill screen.",
        "Skor sempurnanya tiga juta tiga ratus tiga puluh tiga ribu tiga ratus enam puluh, tanpa mati sekali pun. Billy Mitchell disebut sebagai orang pertama yang mencapainya dengan saksi, tahun {1999.|seribu sembilan ratus sembilan puluh sembilan.}",
        "Lucunya, tahun {1982,|seribu sembilan ratus delapan puluh dua,} anak delapan tahun bernama Jeffrey Yee mendapat surat dari Presiden Ronald Reagan, untuk skor lebih dari enam juta. Skor itu hanya mungkin kalau dia melewati level dua ratus lima puluh enam. Tidak ada yang pernah terbukti bisa.",
        f"Jadi satu byte kecil membatasi game sebesar {PM}. Kamu pernah main sampai level berapa?",
    ],
    "EP04_GANDHI_NUKLIR": [
        f"Kamu mungkin pernah dengar: di game {CIV}, Gandhi yang cinta damai tiba-tiba gila nuklir gara-gara bug. Ternyata, itu mitos.",
        "Ceritanya begini. Setiap pemimpin punya nilai agresi. Gandhi paling kalem, nilainya satu. Saat India memilih demokrasi, nilai itu dikurangi dua. Satu dikurangi dua, jadi minus satu.",
        "Kalau angka disimpan sebagai delapan bit tanpa tanda minus, minus satu meluap jadi dua ratus lima puluh lima. Gandhi pun jadi sekitar dua puluh lima kali lebih agresif dari pemimpin paling galak, dan mulai menembakkan nuklir.",
        f"Ceritanya masuk akal, dan menyebar ke mana-mana. Klaim ini ditulis di wiki TV Tropes tahun {{2012,|dua ribu dua belas,}} dua puluh satu tahun setelah {CIV} rilis, tanpa bukti apa pun.",
        f"Lalu desainer {{Civilization II,|Sivilaiseisyen tu,}} Brian Reynolds, membantahnya. Di {CIV} pertama cuma ada tiga tingkat agresi, dan sepertiga pemimpin punya nilai yang sama dengan Gandhi. Di bagian kode itu juga tidak ada variabel tanpa tanda.",
        f"Pencipta {CIV}, Sid Meier, menegaskannya di memoarnya tahun {{2020.|dua ribu dua puluh.}} Menurutnya, angka bulat di bahasa C punya tanda secara bawaan, jadi minus satu tetap minus satu. Bentuk pemerintahan juga sama sekali tidak mengubah agresi AI.",
        f"Plot twist-nya ada di {{Civilization V,|Sivilaiseisyen faiv,}} tahun {{2010.|dua ribu sepuluh.}} Desainer Jon Shafer sengaja memberi Gandhi nilai tertinggi, dua belas, untuk membangun dan memakai nuklir, sebagai lelucon. Bisa jadi, dari sinilah orang yakin bug itu nyata.",
        "Jadi Gandhi nuklir bukan bug, tapi lelucon yang dibuat belakangan. Kamu dulu percaya mitos ini?",
    ],
    "EP05_SPACE_INVADERS": [
        f"Alien di {SI} makin cepat saat jumlahnya tinggal sedikit. Itu bukan rancangan awal. Itu prosesor yang kewalahan.",
        f"{SI} rilis tahun {{1978,|seribu sembilan ratus tujuh puluh delapan,}} buatan Tomohiro {NK} dari Taito. Dia bekerja sendiri selama setahun, termasuk merancang hardware-nya sendiri, dengan prosesor Intel {{8080.|delapan puluh delapan puluh.}} Inspirasinya antara lain game Breakout dari Atari, dan novel The War of the Worlds.",
        f"{NK} sebenarnya ingin grafis berwarna, dan alien yang bergerak lebih cepat. Tapi papan kendalinya tidak cukup kuat. Layarnya hitam putih, dan saat layar penuh, alien bergerak pelan.",
        "Lalu dia menemukan sesuatu. Prosesor bisa menggambar setiap frame animasi alien lebih cepat kalau aliennya lebih sedikit. Karena posisi alien diperbarui setiap frame, makin banyak yang kamu tembak, makin cepat sisanya bergerak. Musiknya ikut makin cepat.",
        f"Developer lain mungkin akan menambalnya, supaya kecepatannya stabil. {NK} memilih tidak. Fitur tak terduga ini dia jadikan mekanik permainan.",
        f"Hasilnya, ketegangan naik dengan sendirinya. Alien terakhir paling cepat, dan paling susah ditembak. Belakangan {NK} bilang, justru bagian ini yang membuat gamenya lebih menarik, sekaligus menutupi keterbatasan hardware-nya.",
        f"{SI} jadi hit di seluruh dunia. Dan kurva kesulitan yang terus naik itu, awalnya lahir dari prosesor yang kewalahan menggambar alien.",
        f"Jadi kadang batasan justru melahirkan desain terbaik. Kamu pernah main {{Space Invaders?|Spes Invaders?}}",
    ],
}

for ep, lines in S.items():
    Path(ep).mkdir(exist_ok=True)
    # punctuation must sit inside {display|spoken}, or it becomes its own caption word
    lines = [re.sub(r"\{([^|}]*)\|([^}]*)\}([,.?:!])", r"{\1\3|\2\3}", t) for t in lines]
    out = [{"id": f"s{i + 1}", "text": t} for i, t in enumerate(lines)]
    Path(ep, "script-lines.json").write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf8")
    print(ep, len(out))
