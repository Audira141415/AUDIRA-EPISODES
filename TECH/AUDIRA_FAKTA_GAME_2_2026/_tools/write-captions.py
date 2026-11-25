"""Writes each episode's SOCIAL_CAPTIONS.md (6 platforms, upload schedule, AI label). Chapters come from timeline.json.
Run from AUDIRA_FAKTA_GAME_2_2026 after the voice exists: python _tools/write-captions.py"""
import json
from pathlib import Path

fmt = lambda t: f"{int(t // 60)}:{int(t % 60):02}"
BASE = "#FaktaGame #Gamer #AUDIRA"

E = {
    "EP01_KONAMI_CODE": dict(
        day="Selasa, 10 November 2026",
        title="Konami Code: Kode Cheat Legendaris yang Lupa Dihapus", cover="KODE CHEAT YANG LUPA DIHAPUS", tags="#KonamiCode #RetroGaming",
        hook="Atas atas bawah bawah kiri kanan kiri kanan B A. Kode ini sebenarnya lupa dihapus.",
        tiktok="Kazuhisa Hashimoto membuat Konami Code karena Gradius terlalu sulit untuk ditamatkan saat pengujian. Seharusnya dihapus sebelum rilis, tapi terlewat. Kamu pernah mencobanya di game apa?",
        pin="FAKTA GAME 2 · EP 01, playlist Fakta Game Dunia. Sumber: Wikipedia (Konami Code, Kazuhisa Hashimoto), IGN 26 Feb 2020. Visual ilustrasi, bukan cuplikan game.",
        ig="Kode cheat paling terkenal di dunia lahir dari game yang terlalu sulit. Kamu pernah mencobanya di game apa? Tulis di komentar.",
        points=["Dibuat Kazuhisa Hashimoto saat memindahkan Gradius (1985) ke NES.", "Gradius terlalu sulit untuk ditamatkan saat pengujian.", "Kode memberi semua power-up saat game dijeda.", "Seharusnya dihapus sebelum rilis, tapi terlewat dan dibiarkan agar tidak muncul bug baru.", "Populer lewat Contra (30 nyawa), kini jadi kejutan rahasia di banyak game dan situs."],
        audio="Chiptune arkade dengan bunyi blip tiap tombol kode ditekan.",
        alts=["Asal-Usul Konami Code yang Jarang Diketahui", "Kode Cheat yang Seharusnya Dihapus", "Kenapa Atas Atas Bawah Bawah Jadi Legendaris?"],
        desc="Asal-usul Konami Code: alat bantu uji Kazuhisa Hashimoto untuk Gradius NES yang lupa dihapus dan jadi kode cheat paling terkenal di dunia.",
        src="Wikipedia (Konami Code, Kazuhisa Hashimoto), IGN.",
        ch=["Hook", "Kazuhisa Hashimoto", "Terlalu sulit", "Kode saat dijeda", "Urutan yang cermat", "Lupa dihapus", "Contra dan easter egg", "Pertanyaan"],
        ytags="konami code, kode cheat, gradius, contra, kazuhisa hashimoto, game retro, nes, fakta game, easter egg, audira",
        thumb="Stik retro dengan 10 tombol kode menyala dan layar POWER-UP MAX (style/cover-topic.png).",
        fb="Pernah bikin catatan contekan buat diri sendiri, lalu lupa membuangnya? Itulah Konami Code. Pembuatnya membuat kode itu karena Gradius terlalu sulit untuk dia tamatkan saat pengujian. Kodenya lupa dihapus, lalu jadi kode cheat paling terkenal di dunia.",
        q="Kamu pernah mencoba Konami Code di game apa?",
        single="Konami Code (atas atas bawah bawah kiri kanan kiri kanan B A) dibuat Kazuhisa Hashimoto karena Gradius terlalu sulit diuji. Seharusnya dihapus sebelum rilis, tapi terlewat. #KonamiCode #FaktaGame",
        thread=["Kode cheat paling terkenal di dunia ini sebenarnya lupa dihapus. #FaktaGame", "Kazuhisa Hashimoto memindahkan Gradius ke NES dan tidak sanggup menamatkannya saat pengujian. Jadi dia membuat kode yang memberi semua power-up.", "Kodenya seharusnya dihapus sebelum rilis, tapi terlewat. Tim membiarkannya karena menghapusnya bisa memunculkan bug baru.", "Contra membuatnya terkenal dengan 30 nyawa. Hashimoto meninggal 2020, kodenya masih hidup. #KonamiCode"],
        th_open="Atas, atas, bawah, bawah, kiri, kanan, kiri, kanan, B, A. Kode cheat paling terkenal ini sebenarnya lupa dihapus. #FaktaGame",
        th=["Kazuhisa Hashimoto membuatnya karena Gradius terlalu sulit untuk ditamatkan saat pengujian. Seharusnya dihapus, tapi terlewat sampai rilis.", "Kamu pernah mencobanya di game apa? #KonamiCode"],
    ),
    "EP02_KUBURAN_ET": dict(
        day="Rabu, 11 November 2026",
        title="Kuburan Game E.T.: Legenda Urban yang Ternyata Nyata", cover="KUBURAN GAME ITU NYATA", tags="#Atari #RetroGaming",
        hook="Tahun 1983, Atari mengubur belasan truk berisi game di gurun, lalu menutupnya dengan beton.",
        tiktok="Game E.T. dibuat dalam 5 minggu, diproduksi 5 juta, terjual 1,5 juta. Sisanya dikubur di Alamogordo dan dicor beton. 2014 digali, dan ternyata benar ada. Kamu mau punya satu?",
        pin="FAKTA GAME 2 · EP 02, playlist Fakta Game Dunia. Sumber: Wikipedia (Atari video game burial), WIRED 2014, New Mexico Magazine 2025. Kotak game di video adalah ilustrasi.",
        ig="Game yang dibuang sebagai sampah kini dijual seperti benda bersejarah. Kamu mau punya satu? Tulis di komentar.",
        points=["E.T. untuk Atari dibuat dalam lima minggu demi liburan akhir 1982.", "Diproduksi 5 juta cartridge, terjual 1,5 juta.", "September 1983, 10-20 truk barang Atari dikubur di Alamogordo dan dicor beton.", "26 April 2014 digali: sekitar 1.300 cartridge diangkat; total yang dikubur sekitar 700.000 dari berbagai game.", "Sekitar 880 cartridge dilelang, lebih dari $107.000; satu copy E.T. laku lebih dari $1.500."],
        audio="Bed dokumenter tegang dengan suara truk, cor beton, dan palu lelang.",
        alts=["Atari Pernah Mengubur Game di Gurun", "Legenda Urban Game E.T. yang Ternyata Benar", "Game Terburuk yang Kini Dilelang Mahal"],
        desc="Kisah kuburan game E.T. di Alamogordo: dikubur 1983, dianggap legenda urban, digali 2014, lalu dilelang.",
        src="Wikipedia (Atari video game burial), WIRED, New Mexico Magazine.",
        ch=["Hook", "Lima minggu", "5 juta vs 1,5 juta", "Dikubur dan dicor", "Legenda urban", "Penggalian 2014", "Dilelang", "Pertanyaan"],
        ytags="atari, game e.t., kuburan game, alamogordo, legenda urban, video game crash 1983, game retro, fakta game, sejarah game, audira",
        thumb="Maket lubang sampah gurun penuh kotak game di bawah berkas EXHIBIT: ALAMOGORDO 1983 (style/cover-topic.png).",
        fb="Bayangkan stok barang yang tidak laku saking banyaknya sampai harus dikubur dan dicor beton. Itu yang dilakukan Atari tahun 1983. Puluhan tahun orang menganggapnya dongeng, sampai 2014 lokasinya digali dan gamenya benar-benar ada.",
        q="Kalau ketemu cartridge dari kuburan itu, kamu simpan atau jual?",
        single="1983: Atari mengubur 10-20 truk barang di Alamogordo dan mencornya dengan beton. Dianggap legenda urban, lalu digali 2014: sekitar 1.300 cartridge diangkat. #Atari #FaktaGame",
        thread=["Atari pernah mengubur game di gurun lalu mencornya dengan beton. Lama dianggap legenda urban. #FaktaGame", "Game E.T. dibuat dalam 5 minggu. Diproduksi 5 juta, terjual cuma 1,5 juta.", "September 1983, 10-20 truk barang Atari dikubur di Alamogordo, New Mexico. Mulai 29 September dicor beton.", "26 April 2014 digali. Sekitar 880 cartridge dilelang, lebih dari $107.000. #Atari"],
        th_open="Legenda urban yang ternyata nyata: Atari mengubur truk-truk berisi game di gurun tahun 1983. #FaktaGame",
        th=["Lokasinya digali tahun 2014. Sekitar 1.300 cartridge diangkat, dan satu copy E.T. dilelang lebih dari 1.500 dolar.", "Kalau ketemu satu, kamu simpan atau jual? #Atari"],
    ),
    "EP03_NAMA_MARIO": dict(
        day="Kamis, 12 November 2026",
        title="Nama Mario Ternyata dari Pemilik Gudang", cover="NAMA MARIO DARI PEMILIK GUDANG", tags="#Nintendo #SejarahGame",
        hook="Nama karakter game paling terkenal di dunia ternyata diambil dari pemilik gudang.",
        tiktok="Dulu namanya Jumpman. Nintendo of America menyewa gudang milik Mario Segale, lalu karakternya dinamai Mario. Tapi ada dua versi ceritanya. Kamu percaya yang mana?",
        pin="FAKTA GAME 2 · EP 03, playlist Fakta Game Dunia. Sumber: Wikipedia (Mario, Mario Segale), NPR dan Ars Technica 2 Nov 2018. Tidak ada karakter atau logo Nintendo di video.",
        ig="Nama Mario lahir dari urusan sewa gudang, tapi ceritanya punya dua versi. Kamu lebih percaya yang mana? Tulis A atau B.",
        points=["Di Donkey Kong (1981) tim menyebutnya Ossan; buku petunjuk Inggris menyebutnya Jumpman.", "Miyamoto sempat ingin memberinya nama Mr. Video.", "Nintendo of America menyewa gudang di Tukwila milik Mario Segale sejak 1981.", "Versi A (buku Game Over): Segale menagih sewa yang telat. Versi B (Don James): nama itu lelucon.", "Segale wafat 2018 di usia 84 dan selalu menghindari ketenaran itu."],
        audio="Groove komik ceria dengan efek ketukan pintu dan goresan piringan hitam.",
        alts=["Asal Nama Mario yang Jarang Diketahui", "Mario Dulu Bernama Jumpman", "Pemilik Gudang di Balik Nama Mario"],
        desc="Asal nama Mario: dari Jumpman dan Mr. Video sampai Mario Segale, pemilik gudang Nintendo of America, dengan dua versi ceritanya.",
        src="Wikipedia (Mario, Mario Segale), NPR, Ars Technica.",
        ch=["Hook", "Ossan dan Jumpman", "Mr. Video", "Gudang di Tukwila", "Versi A", "Versi B", "Mario Segale", "Pertanyaan"],
        ytags="mario, asal nama mario, mario segale, jumpman, donkey kong, nintendo of america, fakta game, sejarah game, game retro, audira",
        thumb="Halaman komik NAMANYA DARI PEMILIK GUDANG? dengan hero orisinal dan kardus GUDANG (style/cover-topic.png).",
        fb="Kadang nama besar lahir dari hal sepele. Karakter game paling terkenal di dunia awalnya bernama Jumpman. Lalu ada pemilik gudang bernama Mario Segale. Ada yang bilang dia datang menagih sewa, ada yang bilang namanya cuma lelucon.",
        q="Kamu lebih percaya versi A atau versi B?",
        single="Nama Mario diambil dari Mario Segale, pemilik gudang yang disewa Nintendo of America tahun 1981. Versi populer: dia menagih sewa telat. Versi lain: cuma lelucon. #Nintendo #FaktaGame",
        thread=["Nama karakter game paling terkenal di dunia ternyata diambil dari pemilik gudang. #FaktaGame", "Di Donkey Kong 1981 namanya Jumpman. Miyamoto bahkan sempat ingin menamainya Mr. Video.", "Nintendo of America menyewa gudang di Tukwila milik Mario Segale. Versi buku Game Over: Segale datang menagih sewa yang telat.", "Versi mantan manajer gudang Don James: itu cuma lelucon. Kamu percaya yang mana? #Nintendo"],
        th_open="Fakta yang jarang dibahas: nama Mario berasal dari Mario Segale, pemilik gudang yang disewa Nintendo of America. #FaktaGame",
        th=["Versi A: Segale menagih sewa yang telat. Versi B: namanya dipakai sebagai lelucon karena tidak ada karyawan yang pernah bertemu dengannya.", "Kamu lebih percaya yang mana? #Nintendo"],
    ),
    "EP04_NINTENDO_1889": dict(
        day="Jumat, 13 November 2026",
        title="Nintendo Lahir 1889 dan Pernah Punya Perusahaan Taksi", cover="NINTENDO DULU JUAL KARTU", tags="#Nintendo #SejarahGame",
        hook="Nintendo lahir tahun 1889, bukan sebagai pembuat game, tapi pembuat kartu.",
        tiktok="Nintendo didirikan 1889 untuk membuat kartu hanafuda. Tahun 1960-an mereka pernah punya taksi, jualan nasi instan, sampai saham jatuh ke 60 yen. Usaha mana yang paling aneh?",
        pin="FAKTA GAME 2 · EP 04, playlist Fakta Game Dunia. Sumber: Wikipedia (Nintendo, History of Nintendo), Inc. 2025. Cerita love hotel adalah mitos yang dibantah sejarawan Isao Yamazaki.",
        ig="Sebelum Mario, Nintendo pernah jualan kartu, taksi, dan nasi instan. Menurutmu usaha mana yang paling aneh? Tulis di komentar.",
        points=["23 September 1889, Fusajiro Yamauchi mendirikan Nintendo di Kyoto untuk kartu hanafuda.", "1959 kerja sama kartu bergambar karakter Disney.", "1960 Daiya Taxi, lalu nasi instan dan penyedot debu Chiritory; semuanya gagal.", "Setelah Olimpiade Tokyo 1964, saham jatuh dari 900 ke 60 yen.", "1966 mainan Ultra Hand buatan montir Gunpei Yokoi laku ratusan ribu unit."],
        audio="Petikan ala koto dan taiko dengan bunyi pegas Ultra Hand.",
        alts=["Nintendo Pernah Punya Perusahaan Taksi", "Sejarah Nintendo Sebelum Video Game", "Mainan Iseng yang Menyelamatkan Nintendo"],
        desc="Sejarah Nintendo sebelum video game: kartu hanafuda 1889, taksi, nasi instan, saham jatuh, dan Ultra Hand.",
        src="Wikipedia (Nintendo, History of Nintendo), Inc.",
        ch=["Hook", "Kartu hanafuda 1889", "Kartu Disney 1959", "Taksi dan nasi instan", "Saham jatuh", "Ultra Hand", "Mitos love hotel", "Pertanyaan"],
        ytags="sejarah nintendo, nintendo 1889, hanafuda, daiya taxi, ultra hand, gunpei yokoi, fakta game, sejarah game, fakta nintendo, audira",
        thumb="Bengkel kartu Kyoto gaya cetak kayu dengan papan 1889 dan kipas kartu (style/cover-topic.png).",
        fb="Bayangkan perusahaan game terbesar di dunia dulu jualan kartu, lalu coba buka taksi dan jualan nasi instan, lalu hampir bangkrut. Penyelamatnya justru mainan iseng buatan montir mesin kartu. Itulah perjalanan Nintendo sebelum Mario.",
        q="Usaha Nintendo mana yang menurutmu paling aneh?",
        single="Nintendo lahir 1889 sebagai pembuat kartu hanafuda. Tahun 1960-an pernah punya taksi dan jualan nasi instan. Penyelamatnya: Ultra Hand, mainan iseng montir mesin kartu. #Nintendo #FaktaGame",
        thread=["Nintendo lahir tahun 1889. Bukan sebagai pembuat game, tapi pembuat kartu hanafuda. #FaktaGame", "1960 mereka menjalankan Daiya Taxi di Kyoto, lalu jualan nasi instan dan penyedot debu Chiritory. Semuanya gagal.", "Setelah Olimpiade Tokyo 1964 saham jatuh dari 900 ke 60 yen. Lalu Ultra Hand buatan Gunpei Yokoi laku ratusan ribu unit.", "Cerita love hotel? Mitos, kata sejarawan Isao Yamazaki. #Nintendo"],
        th_open="Sebelum Mario, Nintendo pernah jualan kartu, taksi, dan nasi instan. Perusahaan ini berdiri sejak 1889. #FaktaGame",
        th=["Saham mereka sempat jatuh dari 900 ke 60 yen, lalu diselamatkan Ultra Hand, mainan iseng buatan montir Gunpei Yokoi.", "Usaha mana yang menurutmu paling aneh? #Nintendo"],
    ),
    "EP05_TETRIS": dict(
        day="Sabtu, 14 November 2026",
        title="Pencipta Tetris Tidak Dibayar Lebih dari 10 Tahun", cover="TETRIS: ROYALTI 0", tags="#Tetris #SejarahGame",
        hook="Tetris dimainkan di seluruh dunia, tapi penciptanya tidak menerima royalti selama lebih dari sepuluh tahun.",
        tiktok="Alexey Pajitnov membuat Tetris di komputer Soviet tanpa grafis, kepingannya dari tanda kurung. Karena pegawai negara, dia tidak dapat royalti sampai 1996. Kamu pernah main sampai lupa waktu?",
        pin="FAKTA GAME 2 · EP 05, playlist Fakta Game Dunia. Sumber: Wikipedia (Tetris, Alexey Pajitnov), Biography.com 2023. Musik di video orisinal, bukan lagu tema Tetris.",
        ig="Game yang membuat jutaan orang ketagihan lama tidak menghasilkan apa-apa bagi penciptanya. Kamu pernah main sampai lupa waktu?",
        points=["Dibuat Alexey Pajitnov di Akademi Ilmu Pengetahuan Uni Soviet, di komputer Elektronika 60.", "Komputernya tanpa grafis, kepingan digambar dengan tanda kurung siku dan spasi.", "Nama Tetris = tetra (empat) + tenis, olahraga favoritnya.", "Hak dikelola lembaga Soviet ELORG, Pajitnov tidak dapat royalti.", "Versi Game Boy terjual 35 juta lebih; baru 1996 dia mendirikan The Tetris Company dan dibayar."],
        audio="Melodi rakyat orisinal di synth square, bukan lagu tema Tetris.",
        alts=["Tetris Dibuat dari Tanda Kurung", "Arti Nama Tetris yang Jarang Diketahui", "Game Terlaris yang Tidak Membayar Penciptanya"],
        desc="Kisah Alexey Pajitnov: Tetris dari tanda kurung di komputer Soviet, nama dari tetra dan tenis, dan royalti yang baru datang tahun 1996.",
        src="Wikipedia (Tetris, Alexey Pajitnov), Biography.com.",
        ch=["Hook", "Akademi Soviet", "Tanpa grafis", "Tetra dan tenis", "Versi berwarna", "Hak ke ELORG", "35 juta dan 1996", "Pertanyaan"],
        ytags="tetris, alexey pajitnov, sejarah tetris, arti nama tetris, game boy, elorg, the tetris company, fakta game, game retro, audira",
        thumb="Dinding balok cetak riso dengan label ROYALTI: 0 dan 10+ TAHUN (style/cover-topic.png).",
        fb="Bayangkan kamu menciptakan sesuatu yang dipakai jutaan orang, tapi tidak dibayar karena kamu pegawai negara. Itulah yang dialami pencipta Tetris. Baru tahun 1996, lebih dari sepuluh tahun kemudian, dia akhirnya menerima bagiannya.",
        q="Kamu pernah main Tetris sampai lupa waktu?",
        single="Tetris dibuat Alexey Pajitnov di komputer Soviet tanpa grafis. Karena pegawai negara, dia tidak dapat royalti. Versi Game Boy laku 35 juta lebih; baru 1996 dia dibayar. #Tetris #FaktaGame",
        thread=["Tetris dimainkan di seluruh dunia, tapi penciptanya tidak dibayar lebih dari 10 tahun. #FaktaGame", "Alexey Pajitnov membuatnya di komputer Elektronika 60 tanpa grafis. Kepingannya digambar dengan tanda kurung siku.", "Namanya gabungan tetra (empat) dan tenis. Haknya dikelola lembaga Soviet ELORG, jadi Pajitnov tidak dapat royalti.", "Game Boy menjual 35 juta lebih. Baru 1996 dia mendirikan The Tetris Company dan dibayar. #Tetris"],
        th_open="Pencipta Tetris tidak menerima royalti sepeser pun selama lebih dari sepuluh tahun. #FaktaGame",
        th=["Alexey Pajitnov membuatnya sebagai pegawai Akademi Soviet, jadi haknya dikelola negara. Baru 1996 dia mendirikan The Tetris Company dan menerima bagiannya.", "Kamu pernah main sampai lupa waktu? #Tetris"],
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
- Komentar pin: sebut nomor seri "FAKTA GAME 2 · EP {name[2:4]}", playlist "Fakta Game Dunia", dan tautan episode sebelumnya.
- Musik dan SFX disintesis sendiri di `mix.py`, tanpa lisensi pihak ketiga.
"""
    Path(name, "SOCIAL_CAPTIONS.md").write_text(md, encoding="utf8")
    print(name, "threads", len(e["th_open"]), [len(t) for t in e["th"]], "title", len(e["title"]), "single", len(e["single"]), [len(f"{i + 1}/ {t}") for i, t in enumerate(e["thread"])])
