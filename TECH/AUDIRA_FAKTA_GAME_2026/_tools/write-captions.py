"""Writes each episode's SOCIAL_CAPTIONS.md (6 platforms). Chapters come from timeline.json so they match the voiced film.
Run from AUDIRA_FAKTA_GAME_2026 after the voice exists: python _tools/write-captions.py"""
import json
from pathlib import Path

fmt = lambda t: f"{int(t // 60)}:{int(t % 60):02}"
BASE = "#FaktaGame #Gamer #AudiraGaming"

E = {
    "EP01_WABAH_WOW": dict(
        title="Wabah di World of Warcraft yang Bikin CDC Minta Data", cover="WABAH DI GAME, CDC IKUT BERTANYA", tags="#WorldOfWarcraft #CorruptedBlood",
        hook="Tahun 2005, sebuah wabah menyapu kota-kota di game online.",
        tiktok="Corrupted Blood: kutukan bos di World of Warcraft yang bocor lewat hewan peliharaan dan menyebar ke kota. CDC sampai menghubungi Blizzard minta datanya. Kamu jadi healer atau kabur?",
        pin="Sumber: Wikipedia (Corrupted Blood incident), Lofgren & Fefferman di The Lancet Infectious Diseases 2007, Ars Technica 2020, TIME 2007. Visual ilustrasi, bukan cuplikan game.",
        ig="Sebuah bug game pernah jadi bahan riset wabah. Kalau kamu ada di sana, kamu jadi healer, penjaga gerbang, atau kabur? Tulis di komentar.",
        points=["13 September 2005, area Zul'Gurub dibuka; bos Hakkar menebar kutukan Corrupted Blood.", "Pet yang disimpan saat bertarung membawa kutukan ke kota karena tidak ada tombol mati.", "Damage 263-337 tiap 2 detik; NPC jadi pembawa tanpa gejala.", "Karantina dan restart gagal; server di-reset total, patch 8 Oktober membuat pet kebal.", "CDC meminta data ke Blizzard; peneliti menulisnya di jurnal ilmiah."],
        audio="Drone fantasi gelap dengan taiko yang makin keras saat wabah menyebar.",
        alts=["Bug Game yang Jadi Bahan Riset Wabah", "Corrupted Blood: Pandemi Virtual 2005", "Kenapa CDC Menghubungi Pembuat Game?"],
        desc="Kisah Corrupted Blood, wabah tak sengaja di World of Warcraft tahun 2005 yang menarik perhatian peneliti penyakit.",
        src="Wikipedia (Corrupted Blood incident), The Lancet Infectious Diseases 2007, Ars Technica, TIME.",
        ch=["Hook", "Kutukan dari bos", "Celah hewan peliharaan", "Damage dan NPC", "Reaksi pemain", "Respons Blizzard", "CDC dan jurnal", "Pertanyaan"],
        ytags="world of warcraft, corrupted blood, wabah game, pandemi virtual, fakta game, bug game, cdc, blizzard, sejarah game, audira gaming",
        thumb="Peta perkamen dunia fantasi dengan kota-kota menyala merah dan berkas cyan bertulisan CDC.",
        fb="Bayangkan satu orang pulang dari perjalanan membawa penyakit, lalu masuk ke pasar yang ramai. Itu persis yang terjadi di World of Warcraft tahun 2005, cuma penyakitnya kutukan game dan pembawanya hewan peliharaan. Kota-kota lumpuh, pemain panik, sampai lembaga kesehatan Amerika ikut minta datanya.",
        q="Kalau kamu ada di sana, kamu jadi healer, atau kabur?",
        single="2005: kutukan bos di World of Warcraft bocor lewat hewan peliharaan dan jadi wabah di kota-kota. Damage 263-337 tiap 2 detik. CDC sampai minta datanya ke Blizzard. #CorruptedBlood #FaktaGame",
        thread=["Tahun 2005, sebuah wabah menyapu kota-kota di World of Warcraft. #FaktaGame", "Bos Hakkar menebar kutukan Corrupted Blood. Pet yang disimpan saat bertarung membawanya keluar ke kota.", "NPC tertular tapi tidak mati, jadi pembawa tanpa gejala. Karantina dan restart gagal, server di-reset total.", "CDC meminta datanya. Jawaban Blizzard: ini cuma bug. Tapi peneliti tetap menulisnya di jurnal. #CorruptedBlood"],
        th_open="Kamu tahu nggak, tahun 2005 ada wabah di game online yang bikin lembaga kesehatan Amerika ikut bertanya? Namanya Corrupted Blood, di World of Warcraft. #FaktaGame",
        th=["Kutukan bos bocor lewat hewan peliharaan yang disimpan pemain, lalu menyebar di kota-kota ramai. NPC jadi pembawa tanpa gejala.", "Blizzard akhirnya reset server, dan CDC sempat minta datanya. Kalau kamu di sana, jadi healer atau kabur? #CorruptedBlood"],
    ),
    "EP02_CREEPER": dict(
        title="Creeper Minecraft Ternyata Lahir dari Bug Model Babi", cover="CREEPER = BABI YANG SALAH UKURAN", tags="#Minecraft #Creeper",
        hook="Monster paling terkenal di Minecraft ternyata lahir dari bug.",
        tiktok="20 Agustus 2009, Notch menukar ukuran panjang dan tinggi model babi. Hasilnya berdiri tegak di empat kaki pendek. Bukannya dihapus, dia simpan jadi Creeper. Kamu pernah salah yang malah keren?",
        pin="Sumber: Wikipedia (Creeper, Minecraft), Kotaku 2016. Model di video adalah ilustrasi voxel sendiri, bukan aset Mojang.",
        ig="Kadang kesalahan justru jadi ide terbaik. Kamu pernah bikin salah yang ternyata malah keren? Ceritakan di komentar.",
        points=["20 Agustus 2009, Minecraft masih pre-alpha.", "Notch tidak sengaja menukar panjang dan tinggi model babi.", "Dia menyimpannya untuk makhluk yang menyeramkan: creepy creature.", "Diberi warna dari tekstur daun dan AI agresif, masuk game 1 September 2009 di versi 0.24_SURVIVAL_TEST.", "Kini ikon Minecraft, masuk daftar top 50 penjahat game Guinness World Records Gamer's Edition."],
        audio="Synth petik dan kotak musik saat senja, lalu desis sumbu dan ledakan.",
        alts=["Asal-Usul Creeper: Bug yang Tidak Dihapus", "Creeper Awalnya Adalah Babi", "Fakta Minecraft yang Jarang Diketahui"],
        desc="Bagaimana kesalahan ukuran model babi di Minecraft pre-alpha menjadi Creeper, monster paling ikonik di game itu.",
        src="Wikipedia (Creeper), Kotaku.",
        ch=["Hook", "Minecraft pre-alpha", "Ukuran tertukar", "Creepy creature", "Hijau dan agresif", "Cara menyerang", "Ikon Minecraft", "Pertanyaan"],
        ytags="creeper minecraft, asal usul creeper, fakta minecraft, minecraft pre alpha, notch, bug game, charged creeper, sejarah minecraft, fakta game, audira gaming",
        thumb="Babi voxel merah muda yang berdiri tegak di samping makhluk hijau tinggi saat senja, teks CREEPER = BUG.",
        fb="Pernah salah masak, tapi rasanya malah enak dan jadi menu andalan? Itu yang terjadi pada Creeper. Pembuat Minecraft salah memasukkan ukuran model babi, hasilnya makhluk aneh yang berdiri tegak. Bukannya dihapus, dia simpan, dan sekarang jadi monster paling terkenal di Minecraft.",
        q="Kamu pernah bikin salah yang ternyata malah keren?",
        single="Creeper Minecraft lahir dari bug: 20 Agustus 2009, Notch menukar panjang dan tinggi model babi. Bukannya dihapus, dia simpan untuk makhluk menyeramkan. #Creeper #FaktaGame",
        thread=["Monster paling terkenal di Minecraft, Creeper, ternyata lahir dari bug. #FaktaGame", "20 Agustus 2009, Notch membuat model babi dan tidak sengaja menukar panjang dan tingginya.", "Hasilnya berdiri tegak di empat kaki pendek. Dia simpan untuk makhluk yang menyeramkan, diberi tekstur daun dan AI agresif.", "1 September 2009 Creeper resmi masuk Minecraft. Kesalahan yang jadi ikon. #Creeper"],
        th_open="Fakta kecil yang jarang dibahas: Creeper di Minecraft itu awalnya model babi yang salah ukuran. #FaktaGame",
        th=["Notch menukar panjang dan tinggi model babi, hasilnya makhluk tegak berkaki empat pendek. Dia memilih menyimpannya untuk makhluk yang menyeramkan.", "Kamu pernah bikin salah yang ternyata malah keren? #Creeper"],
    ),
    "EP03_PACMAN_256": dict(
        title="Pac-Man Punya Ujung: Rahasia Level 256", cover="LEVEL 256: PAC-MAN RUSAK", tags="#PacMan #RetroGaming",
        hook="Pac-Man punya ujung. Di level 256, separuh layarnya hancur.",
        tiktok="Satu byte cuma muat 0 sampai 255. Di level 256 hitungannya meluap, game mencoba menggambar 256 buah dan menimpa sisi kanan labirin. Levelnya tidak bisa diselesaikan. Kamu pernah sampai level berapa?",
        pin="Sumber: Wikipedia (Pac-Man, Integer overflow), TechRaptor 2015. Bentuk karakter di video digambar sendiri, bukan sprite asli.",
        ig="Satu byte kecil membatasi game sebesar Pac-Man. Kamu pernah main sampai level berapa? Tulis di komentar.",
        points=["Satu byte menampung 256 nilai, dari 0 sampai 255.", "Di level 256 hitungannya meluap (integer overflow).", "Game biasanya menggambar maksimal 7 buah, di level 256 mencoba 256 buah dan menimpa sisi kanan labirin.", "Skor sempurna 3.333.360 tanpa mati sekali pun.", "1982, Jeffrey Yee dapat surat Presiden Reagan untuk skor yang hanya mungkin bila melewati level 256."],
        audio="Bed arkade square wave dengan ledakan glitch saat overflow.",
        alts=["Kenapa Pac-Man Rusak di Level 256?", "Kill Screen Pac-Man Dijelaskan", "Satu Byte yang Menghentikan Pac-Man"],
        desc="Kenapa level 256 Pac-Man rusak: integer overflow, buah yang menimpa labirin, dan skor sempurna 3.333.360.",
        src="Wikipedia (Pac-Man, Integer overflow), TechRaptor.",
        ch=["Hook", "Cara main", "Satu byte", "Buah yang meluap", "Kill screen", "Skor sempurna", "Surat dari Reagan", "Pertanyaan"],
        ytags="pac-man, level 256, kill screen, integer overflow, game retro, fakta game, arcade, billy mitchell, sejarah game, audira gaming",
        thumb="Labirin neon biru yang separuh kanannya hancur jadi simbol acak, teks LEVEL 256.",
        fb="Bayangkan odometer motor yang cuma punya tiga angka. Lewat 999, angkanya kembali ke 000. Pac-Man mengalami hal yang mirip di level 256. Hitungannya meluap, separuh layarnya berubah jadi simbol acak, dan level itu tidak pernah bisa diselesaikan.",
        q="Kamu pernah main Pac-Man sampai level berapa?",
        single="Pac-Man punya ujung: di level 256 hitungannya meluap dari 1 byte, separuh labirin tertimpa simbol acak, dan level itu tidak bisa diselesaikan. Skor sempurna: 3.333.360. #PacMan #FaktaGame",
        thread=["Pac-Man punya ujung. Di level 256, separuh layarnya hancur. #FaktaGame", "Satu byte cuma muat 0 sampai 255. Lewat dari itu, angkanya kembali ke nol: integer overflow.", "Game mencoba menggambar 256 buah, bukan maksimal 7. Gambarnya menimpa sisi kanan labirin.", "Skor sempurna 3.333.360. Dan surat Presiden Reagan 1982 untuk skor yang mustahil. #PacMan"],
        th_open="Pac-Man ternyata punya ujung. Di level 256, separuh layarnya rusak dan levelnya tidak bisa diselesaikan. #FaktaGame",
        th=["Penyebabnya satu byte: angka 0 sampai 255. Di level 256 hitungannya meluap, dan game mencoba menggambar 256 buah sampai menimpa labirin.", "Skor sempurnanya 3.333.360. Kamu pernah main sampai level berapa? #PacMan"],
    ),
    "EP04_GANDHI_NUKLIR": dict(
        title="Bug Gandhi Nuklir di Civilization Ternyata Mitos", cover="GANDHI NUKLIR? MITOS", tags="#Civilization #MitosGame",
        hook="Gandhi gila nuklir gara-gara bug? Ternyata itu mitos.",
        tiktok="Ceritanya: agresi 1 dikurangi 2 meluap jadi 255. Faktanya: desainer Brian Reynolds dan Sid Meier membantah. Leluconnya baru sengaja dibuat di Civilization V. Kamu dulu percaya mitos ini?",
        pin="Sumber: Wikipedia (Nuclear Gandhi), Sid Meier's Memoir! (2020) hlm. 261-266. Gandhi tampil sebagai pion bernama, tanpa wajah.",
        ig="Gandhi nuklir bukan bug, tapi lelucon yang dibuat belakangan. Kamu dulu percaya mitos ini? Tulis di komentar.",
        points=["Legenda: agresi Gandhi 1, demokrasi mengurangi 2, jadi -1 yang meluap ke 255.", "Klaim ditulis di TV Tropes tahun 2012, 21 tahun setelah rilis, tanpa bukti.", "Brian Reynolds: Civilization pertama cuma punya tiga tingkat agresi.", "Sid Meier (memoar 2020): angka bulat di C bertanda, dan pemerintahan tidak mengubah agresi AI.", "Civilization V (2010): Jon Shafer sengaja memberi Gandhi nilai nuklir 12 sebagai lelucon."],
        audio="Pizzicato jenaka, desir kertas, dan gong pada plot twist.",
        alts=["Gandhi Nuklir Bukan Bug, Ini Faktanya", "Mitos Game Paling Terkenal yang Ternyata Palsu", "Integer Overflow yang Tidak Pernah Terjadi"],
        desc="Membongkar mitos bug Gandhi nuklir di Civilization: dari klaim TV Tropes 2012 sampai bantahan Sid Meier dan lelucon di Civilization V.",
        src="Wikipedia (Nuclear Gandhi), Sid Meier's Memoir! (2020).",
        ch=["Hook", "Ceritanya", "Overflow 255", "Asal klaim", "Bantahan Reynolds", "Memoar Sid Meier", "Plot twist Civ V", "Pertanyaan"],
        ytags="gandhi nuklir, nuclear gandhi, civilization, mitos game, integer overflow, sid meier, civilization v, fakta game, game strategi, audira gaming",
        thumb="Papan strategi kertas dengan roket kertas dan stempel merah MITOS?",
        fb="Ada cerita yang terdengar sangat masuk akal sampai semua orang percaya, padahal tidak ada buktinya. Gandhi nuklir di game Civilization contohnya. Bertahun-tahun orang yakin ini bug. Ternyata pembuatnya sendiri membantah, dan versi nuklirnya baru sengaja dibuat sebagai lelucon di Civilization V.",
        q="Kamu dulu percaya mitos Gandhi nuklir?",
        single="Bug Gandhi nuklir di Civilization ternyata mitos. Klaimnya muncul di TV Tropes 2012 tanpa bukti, dibantah Sid Meier. Gandhi nuklir baru sengaja dibuat di Civ V sebagai lelucon. #Civilization #FaktaGame",
        thread=["Gandhi gila nuklir gara-gara bug di Civilization? Ternyata mitos. #FaktaGame", "Ceritanya: agresi 1 dikurangi 2 jadi -1, lalu meluap jadi 255. Masuk akal, tapi muncul di TV Tropes 2012 tanpa bukti.", "Brian Reynolds: cuma ada tiga tingkat agresi. Sid Meier: angka di C bertanda, -1 tetap -1.", "Plot twist: di Civ V, Jon Shafer sengaja memberi Gandhi nilai nuklir 12 sebagai lelucon. #Civilization"],
        th_open="Mitos game paling terkenal: Gandhi di Civilization jadi gila nuklir karena bug. Ternyata tidak pernah terjadi. #FaktaGame",
        th=["Sid Meier sendiri membantahnya di memoar tahun 2020. Leluconnya justru baru sengaja dibuat di Civilization V.", "Kamu dulu percaya mitos ini? #Civilization"],
    ),
    "EP05_SPACE_INVADERS": dict(
        title="Alien Space Invaders Makin Cepat Karena Prosesor Kewalahan", cover="BUKAN DESAIN, TAPI PROSESOR", tags="#SpaceInvaders #RetroGaming",
        hook="Alien di Space Invaders makin cepat saat tinggal sedikit. Itu bukan rancangan awal.",
        tiktok="Prosesor Space Invaders menggambar alien lebih cepat saat jumlahnya sedikit. Makin banyak yang ditembak, makin cepat sisanya. Nishikado membiarkannya jadi mekanik game. Kamu pernah main?",
        pin="Sumber: Wikipedia (Space Invaders, bagian development dan hardware, mengutip wawancara Nishikado). Alien di video digambar sendiri, bukan sprite asli.",
        ig="Kadang batasan justru melahirkan desain terbaik. Kamu pernah main Space Invaders? Tulis di komentar.",
        points=["Space Invaders rilis 1978, buatan Tomohiro Nishikado dari Taito, dengan prosesor Intel 8080.", "Papan kendalinya tidak cukup kuat untuk warna atau alien yang lebih cepat.", "Prosesor menggambar frame alien lebih cepat saat aliennya sedikit.", "Karena posisi diperbarui tiap frame, alien yang tersisa makin cepat, musiknya juga.", "Nishikado tidak menambalnya dan menjadikannya mekanik permainan."],
        audio="Denyut empat langkah yang temponya mengikuti jumlah alien.",
        alts=["Kenapa Alien Space Invaders Makin Cepat?", "Kurva Kesulitan yang Lahir dari Prosesor", "Bug 1978 yang Jadi Fitur Legendaris"],
        desc="Kenapa alien di Space Invaders makin cepat: keterbatasan hardware 1978 yang dijadikan mekanik permainan oleh Tomohiro Nishikado.",
        src="Wikipedia (Space Invaders), mengutip wawancara Tomohiro Nishikado.",
        ch=["Hook", "1978 dan Intel 8080", "Keterbatasan papan", "Prosesor dan frame", "Tidak ditambal", "Alien terakhir", "Hit dunia", "Pertanyaan"],
        ytags="space invaders, tomohiro nishikado, game arcade, intel 8080, fakta game, game retro, bug jadi fitur, taito, sejarah game, audira gaming",
        thumb="Layar CRT hitam putih di dalam kabinet arkade terurai dengan chip Intel 8080 menyala.",
        fb="Bayangkan pelayan restoran yang makin cepat melayani saat pengunjung tinggal sedikit. Begitulah prosesor di Space Invaders. Makin sedikit alien yang harus digambar, makin cepat alien yang tersisa bergerak. Pembuatnya tidak menambalnya, malah menjadikannya bagian paling menegangkan dari game.",
        q="Kamu pernah main Space Invaders?",
        single="Alien Space Invaders makin cepat bukan karena desain: prosesor 1978 menggambar frame lebih cepat saat alien tinggal sedikit. Nishikado membiarkannya jadi mekanik game. #SpaceInvaders #FaktaGame",
        thread=["Alien di Space Invaders makin cepat saat tinggal sedikit. Itu bukan rancangan awal. #FaktaGame", "1978, Tomohiro Nishikado merancang hardware sendiri dengan Intel 8080. Papannya tidak cukup kuat untuk warna atau alien cepat.", "Prosesor menggambar frame lebih cepat saat alien sedikit. Makin banyak yang ditembak, makin cepat sisanya.", "Dia tidak menambalnya. Batasan hardware jadi kurva kesulitan legendaris. #SpaceInvaders"],
        th_open="Fakta arkade: alien di Space Invaders makin cepat karena prosesornya kewalahan, bukan karena dirancang begitu. #FaktaGame",
        th=["Makin sedikit alien yang digambar, makin cepat tiap frame selesai, jadi sisanya bergerak makin cepat. Tomohiro Nishikado membiarkannya jadi mekanik.", "Kamu pernah main Space Invaders? #SpaceInvaders"],
    ),
}

for name, e in E.items():
    T = json.load(open(f"{name}/timeline.json", encoding="utf8"))
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
"""
    Path(name, "SOCIAL_CAPTIONS.md").write_text(md, encoding="utf8")
    print(name, "threads", len(e["th_open"]), [len(t) for t in e["th"]], "title", len(e["title"]), "single", len(e["single"]), [len(f"{i + 1}/ {t}") for i, t in enumerate(e["thread"])])
