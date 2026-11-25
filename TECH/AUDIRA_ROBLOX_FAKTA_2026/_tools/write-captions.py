"""Writes each episode's SOCIAL_CAPTIONS.md. Chapters come from timeline.json so they match the voiced film.
Run from AUDIRA_ROBLOX_FAKTA_2026 after the voice exists: python _tools/write-captions.py"""
import json
from pathlib import Path

fmt = lambda t: f"{int(t // 60)}:{int(t % 60):02}"
BASE = "#FaktaRoblox #Roblox #AudiraGaming"

E = {
    "EP01_SUARA_OOF": dict(
        title="Suara Oof Roblox Ternyata Bukan Milik Roblox", cover="SUARA OOF BUKAN MILIK ROBLOX", tags="#OofRoblox #MemeRoblox",
        hook="Suara mati paling terkenal di Roblox ternyata pinjaman dari game lain.",
        tiktok="Oof berasal dari game PC Messiah (2000). Sempat jadi sengketa hak cipta, dihapus Juli 2022, lalu kembali Juli 2025. Kamu tim oof lama atau suara pengganti?",
        pin="Sumber: Wikipedia (Messiah), Polygon dan Eurogamer 27 Jul 2022, Windows Central 18 Jul 2025, Distractify. Siapa pembuat aslinya masih diperdebatkan. Video ini tidak memakai rekaman oof asli.",
        ig="Suara sekecil itu pernah jadi urusan hak cipta bertahun-tahun. Kamu tim oof lama, atau tim suara pengganti? Tulis di komentar.",
        points=["Oof berasal dari game PC Messiah, rilis tahun 2000.", "Komposer Tommy Tallarico mengaku memegang haknya, dan menyebut Joey Kuras ikut membuatnya.", "2019 dipersoalkan, 2020 sepakat: developer membayar 1 dolar atau 100 Robux untuk memakainya.", "26 Juli 2022 oof dihapus karena masalah lisensi, diganti suara yang lebih datar.", "18 Juli 2025 oof kembali: \"A comeback so good it hurts\"."],
        audio="Bed lo-fi studio dengan desis pita, tape-stop saat oof dihapus, rewind saat kembali.",
        alts=["Kenapa Suara Oof Roblox Sempat Hilang 3 Tahun?", "Asal Suara Oof Roblox: Game Messiah Tahun 2000", "Oof Roblox Pernah Berbayar 100 Robux"],
        desc="Kisah suara oof Roblox: dari game Messiah tahun 2000, sengketa hak cipta, dihapus 2022, sampai kembali 2025.",
        src="Wikipedia (Messiah), Polygon, Eurogamer, Windows Central, Distractify, CBR.",
        ch=["Hook", "Suara yang semua orang kenal", "Asal dari Messiah", "Sengketa dan biaya $1", "Dihapus 2022", "Kembali 2025", "Pelajaran buat kreator"],
        ytags="oof roblox, suara oof, roblox death sound, fakta roblox, messiah game, tommy tallarico, roblox 2022, roblox 2025, meme roblox, audira gaming",
        thumb="Kaset bertulisan OOF di studio gelap dengan gelombang suara oranye, teks BUKAN MILIK ROBLOX.",
        fb="Bayangkan lagu ulang tahun yang dinyanyikan di setiap pesta, lalu suatu hari ada yang bilang lagunya punya pemilik dan harus bayar. Itu yang terjadi pada suara oof di Roblox. Suaranya berasal dari game Messiah tahun 2000, sempat berbayar satu dolar, dihapus tahun 2022, lalu kembali Juli 2025.",
        q="Kamu tim oof lama, atau tim suara pengganti?",
        single="Suara oof Roblox berasal dari game PC Messiah (2000). Sempat berbayar $1 atau 100 Robux, dihapus 26 Juli 2022, kembali 18 Juli 2025. Kamu tim oof lama? #OofRoblox #FaktaRoblox",
        thread=["Suara mati paling terkenal di Roblox, oof, ternyata bukan buatan Roblox. #FaktaRoblox", "Asalnya game PC Messiah, rilis tahun 2000. Komposer Tommy Tallarico mengaku memegang haknya.", "2019 dipersoalkan. 2020 sepakat: developer yang mau memakai oof membayar 1 dolar atau 100 Robux.", "26 Juli 2022 oof dihapus. 18 Juli 2025 kembali: a comeback so good it hurts. Pelajaran: cek lisensi suara. #OofRoblox"],
    ),
    "EP02_DYNABLOCKS": dict(
        title="Roblox Dulu Bernama DynaBlocks, Lahir dari Software Fisika", cover="DULU NAMANYA DYNABLOCKS", tags="#SejarahRoblox #DynaBlocks",
        hook="Sebelum bernama Roblox, game ini punya nama lain: DynaBlocks.",
        tiktok="Roblox berakar dari Interactive Physics, software simulasi fisika 2D untuk sekolah. Nama kerjanya: eBlocks, GoBlocks, DynaBlocks, lalu Roblox. Kamu lebih suka main atau bikin game?",
        pin="Sumber: Wikipedia (David Baszucki, Roblox, Roblox Corporation), Business Insider 2021. Visual pendiri memakai avatar generik.",
        ig="Roblox lahir dari pengamatan sederhana: anak-anak lebih suka membangun daripada sekadar menonton. Kamu lebih suka main, atau bikin game?",
        points=["1989: Interactive Physics, simulasi fisika 2D untuk sekolah, dari Knowledge Revolution.", "Erik Cassel adalah wakil presiden bidang teknik software itu.", "Desember 1998 perusahaannya dibeli MSC Software senilai 20 juta dolar.", "Nama kerja: eBlocks, GoBlocks, DynaBlocks, lalu Roblox (robots + blocks) pada Januari 2004.", "Rilis resmi 1 September 2006; Erik Cassel meninggal karena kanker tahun 2013."],
        audio="Arpeggio komputer lawas yang berubah jadi piano elektrik hangat.",
        alts=["Nama Asli Roblox Bukan Roblox", "Roblox Lahir dari Software Pelajaran Fisika", "eBlocks, GoBlocks, DynaBlocks: Sejarah Nama Roblox"],
        desc="Sejarah Roblox dari software fisika sekolah tahun 1989, nama DynaBlocks, sampai rilis 2006.",
        src="Wikipedia (David Baszucki, Roblox, Roblox Corporation), Business Insider.",
        ch=["Hook", "Interactive Physics", "Erik Cassel dan penjualan 1998", "Inspirasi dari pelajar", "eBlocks sampai Roblox", "Rilis 2006", "Erik Cassel", "Pertanyaan"],
        ytags="sejarah roblox, dynablocks, nama asli roblox, interactive physics, david baszucki, erik cassel, fakta roblox, roblox 2006, asal usul roblox, audira gaming",
        thumb="Komputer krem tahun 1989 dengan bola 1-bit di layar dan papan nama DYNABLOCKS.",
        fb="Banyak bisnis besar lahir dari hal kecil yang diperhatikan baik-baik. Roblox begitu juga. Pendirinya dulu membuat software pelajaran fisika, lalu melihat murid-murid paling suka membangun sendiri. Dari situ lahir DynaBlocks, yang kemudian berganti nama jadi Roblox.",
        q="Kamu lebih suka main game, atau bikin game sendiri?",
        single="Nama awal Roblox: eBlocks, lalu GoBlocks, lalu DynaBlocks. Akarnya Interactive Physics, software fisika sekolah 1989. Rilis 1 September 2006. #SejarahRoblox #FaktaRoblox",
        thread=["Sebelum bernama Roblox, game ini dipanggil DynaBlocks. Akarnya software pelajaran fisika. #FaktaRoblox", "1989: Knowledge Revolution membuat Interactive Physics, simulasi fisika 2D untuk sekolah. Dijual ke MSC Software 1998, 20 juta dolar.", "Desember 2003 prototipe dimulai. Namanya eBlocks, GoBlocks, DynaBlocks. Januari 2004 jadi Roblox: robots + blocks.", "Rilis 1 September 2006. Co-founder Erik Cassel meninggal tahun 2013. Kamu lebih suka main atau bikin game? #SejarahRoblox"],
    ),
    "EP03_JOHN_DOE": dict(
        title="John Doe Roblox Bukan Hacker: Ini Akun Nomor 2", cover="JOHN DOE BUKAN HACKER", tags="#JohnDoeRoblox #HoaksRoblox",
        hook="Setiap 18 Maret muncul peringatan John Doe akan meretas akunmu. Datanya bilang lain.",
        tiktok="Akun nomor 1 milik Roblox, nomor 2 John Doe, nomor 3 Jane Doe. Ketiganya dibuat di detik yang sama, 27 Februari 2006. Akun nomor 4 dan 5 tidak ada. Rumor hacker-nya? Hoaks.",
        pin="Sumber: API publik Roblox (users.roblox.com, dicek 6 Nov 2026), Bloomberg 2021, DualShockers 2021. Jangan pernah berikan password ke siapa pun.",
        ig="Ancaman sebenarnya bukan John Doe, tapi orang yang memakai rumor ini untuk minta password kamu. Kamu pernah termakan rumor ini?",
        points=["Akun ID 1 bernama Roblox, ID 2 John Doe, ID 3 Jane Doe.", "John Doe dan Jane Doe adalah nama samaran untuk orang tak dikenal, mirip si Fulan.", "Ketiganya tercatat dibuat 27 Februari 2006 pukul 21:06 UTC, di detik yang sama.", "Akun ID 4 dan 5 tidak ada; builderman milik David Baszucki bernomor 156.", "Rumor hacker 18 Maret disebar YouTuber sekitar 2017; akun itu tidak diblokir dan tidak terbukti meretas siapa pun."],
        audio="Bass betot noir, detak jam, mesin ketik, dan dentum stempel HOAKS.",
        alts=["Siapa John Doe di Roblox? Ini Datanya", "Akun Roblox Nomor 2 Ternyata John Doe", "Rumor John Doe 18 Maret Itu Hoaks"],
        desc="Membongkar rumor John Doe Roblox dengan data API publik: akun nomor 2 yang dibuat bersamaan dengan akun Roblox.",
        src="API publik Roblox, Bloomberg, DualShockers, Sportskeeda.",
        ch=["Hook", "Akun nomor 1, 2, 3", "Arti John Doe", "Detik yang sama", "Builderman nomor 156", "Asal rumor", "Fakta dan penipuan", "Pertanyaan"],
        ytags="john doe roblox, jane doe roblox, hoaks roblox, 18 maret roblox, akun roblox pertama, builderman, fakta roblox, keamanan akun roblox, roblox hacker, audira gaming",
        thumb="Kartu ID #2 JOHN DOE di papan gabus dengan stempel merah HOAKS.",
        fb="Ingat pesan berantai yang bilang \"jangan terima telepon dari nomor ini\"? Rumor John Doe di Roblox mirip itu. Padahal datanya bisa dicek: John Doe cuma akun nomor dua, dibuat di detik yang sama dengan akun resmi Roblox tahun 2006. Yang perlu diwaspadai justru orang yang memanfaatkan rumor untuk minta password.",
        q="Kamu atau adikmu pernah termakan rumor John Doe?",
        single="John Doe Roblox = akun ID 2. Dibuat di detik yang sama dengan akun Roblox (ID 1) dan Jane Doe (ID 3), 27 Feb 2006. ID 4 dan 5 tidak ada. Rumor hack 18 Maret? Hoaks. #JohnDoeRoblox #FaktaRoblox",
        thread=["Tiap 18 Maret ada peringatan: John Doe akan meretas akun Roblox kamu. Kita cek datanya. #FaktaRoblox", "API publik Roblox: ID 1 Roblox, ID 2 John Doe, ID 3 Jane Doe. Ketiganya dibuat 27 Feb 2006, 21:06 UTC, di detik yang sama.", "ID 4 dan 5 tidak ada. Akun builderman milik pendiri Roblox baru nomor 156.", "Rumor hacker disebar YouTuber sekitar 2017. Akunnya tidak diblokir. Yang minta password kamu, itulah penipunya. #JohnDoeRoblox"],
    ),
    "EP04_GRAVITASI": dict(
        title="Gravitasi Roblox Hampir 6 Kali Bumi, Ini Hitungannya", cover="GRAVITASI 6X BUMI", tags="#FisikaRoblox #RobloxStudio",
        hook="Pakai satuan resmi Roblox, gravitasinya hampir enam kali bumi.",
        tiktok="Gravitasi bawaan Roblox 196,2 stud/s². Dengan 1 stud = 28 cm, itu 54,9 m/s², hampir 6x bumi. Kalau diganti realistis, lompatanmu bisa sekitar 11 meter. Gravitasi berapa yang kamu pilih?",
        pin="Sumber: Roblox Creator Docs (Roblox units, Workspace.Gravity, Humanoid). Angka 40 stud, 11 m dan 3 detik adalah hitungan AUDIRA.",
        ig="Developer bebas mengubah gravitasi, misalnya untuk level di bulan. Kalau kamu bikin game, gravitasi berapa yang kamu pilih?",
        points=["1 stud = 28 cm menurut dokumentasi resmi Roblox.", "Gravitasi bawaan 196,2 stud/s² = 54,9 m/s², bumi 9,8: hampir 6 kali.", "Nilai realistis menurut dokumen yang sama: 35 stud/s².", "Tinggi lompat bawaan 7,2 stud, sekitar 2 meter, cuma setengah detik di udara.", "Dengan gravitasi realistis, hitungan kami sekitar 40 stud (11 m) dan melayang 3 detik."],
        audio="Groove marimba riang dengan bunyi boing di setiap lompatan.",
        alts=["Kenapa Karakter Roblox Lompatnya Cepat?", "Kalau Roblox Pakai Gravitasi Bumi, Kamu Lompat 11 Meter", "1 Stud Roblox Itu Berapa Sentimeter?"],
        desc="Gravitasi, lompatan dan kecepatan jalan Roblox diubah ke satuan nyata memakai dokumentasi resmi Roblox.",
        src="Roblox Creator Docs: Roblox units, Workspace, Humanoid.",
        ch=["Hook", "Satuan stud", "196,2 vs 9,8", "Gravitasi realistis", "Lompatan 2 meter", "Kalau gravitasi realistis", "Kecepatan jalan", "Pertanyaan"],
        ytags="gravitasi roblox, fisika roblox, stud roblox, roblox studio, workspace gravity, jump height roblox, walkspeed roblox, fakta roblox, belajar fisika, audira gaming",
        thumb="Avatar balok melompat di samping gedung empat lantai dengan garis putus-putus 11 M.",
        fb="Pernah merasa karakter Roblox melompat cepat lalu langsung turun lagi? Itu bukan perasaan saja. Menurut satuan resmi Roblox, gravitasi bawaannya hampir enam kali bumi. Lompatannya juga dibuat kuat, jadi seimbang. Kalau gravitasinya diganti seperti bumi tapi tenaga lompatnya tetap, karakter bisa melambung setinggi gedung empat lantai.",
        q="Kalau kamu bikin game, gravitasi berapa yang kamu pilih?",
        single="Gravitasi bawaan Roblox: 196,2 stud/s². Dengan 1 stud = 28 cm, itu 54,9 m/s², hampir 6x bumi. Gravitasi realistis + lompatan sama = sekitar 11 m. #FisikaRoblox #FaktaRoblox",
        thread=["Kalau dihitung pakai satuan resmi Roblox, gravitasinya hampir 6 kali bumi. #FaktaRoblox", "Dokumentasi Roblox: 1 stud = 28 cm. Gravitasi bawaan 196,2 stud/s² = 54,9 m/s². Bumi 9,8.", "Tinggi lompat bawaan 7,2 stud, sekitar 2 m, cuma setengah detik di udara. Jalan 16 stud/s, sekitar 16 km/jam.", "Ganti ke gravitasi realistis 35 stud/s² dengan lompatan sama: sekitar 40 stud, 11 m, melayang 3 detik. #FisikaRoblox"],
    ),
    "EP05_TIX": dict(
        title="Roblox Dulu Punya Dua Mata Uang: Robux dan Tix", cover="DULU ADA TIX, BUKAN CUMA ROBUX", tags="#TixRoblox #Robux",
        hook="Dulu Roblox punya mata uang gratis yang didapat cuma dengan login tiap hari.",
        tiktok="Namanya Tickets atau Tix. Didapat dari login harian dan kunjungan ke game buatanmu. 15 Maret 2016 Baszucki mengumumkan Tix dihapus dalam 30 hari. Kamu masih ingat Tix?",
        pin="Sumber: blog Roblox \"Saying Goodbye to Tickets\" oleh David Baszucki, 15 Maret 2016 (arsip web), Wikipedia Roblox. Koin di video adalah ilustrasi, bukan logo Robux.",
        ig="Kalau Tix masih ada sekarang, kamu bakal rajin login tiap hari? Tulis di komentar.",
        points=["Roblox dulu punya dua mata uang: Robux dan Tickets (Tix).", "Tix menghadiahi pemain yang aktif tanpa membagi Robux gratis yang bisa memicu inflasi.", "Tix didapat dari bonus login harian dan kunjungan ke tempat buatan developer, bisa ditukar ke Robux.", "15 Maret 2016 Baszucki mengumumkan Tix dihentikan dalam 30 hari.", "Alasannya: membingungkan pemain baru, memicu akun tambahan dan bot, dan Roblox tidak mau pemain datang cuma demi absen."],
        audio="Chiptune arkade dengan denting koin dan gemerincing tiket.",
        alts=["Kenapa Tix Roblox Dihapus?", "Mata Uang Gratis Roblox yang Hilang Tahun 2016", "Robux Dulu Punya Saudara Bernama Tix"],
        desc="Kisah Tickets (Tix), mata uang kedua Roblox yang dihapus pada 2016, dan alasan resminya.",
        src="Roblox Blog (David Baszucki, 15 Maret 2016), Wikipedia Roblox.",
        ch=["Hook", "Tickets alias Tix", "Kenapa dua mata uang", "Cara dapat Tix", "Pengumuman 2016", "Tiga alasan", "Bukan demi uang", "Pertanyaan"],
        ytags="tix roblox, tickets roblox, mata uang roblox, robux, sejarah roblox, roblox 2016, david baszucki, fakta roblox, roblox lama, audira gaming",
        thumb="Mesin tiket arkade memuntahkan tiket emas di samping tumpukan koin hijau, teks DULU ADA TIX.",
        fb="Dulu, seperti tiket di wahana permainan, Roblox memberi pemain tiket gratis setiap hari hanya karena datang. Namanya Tix. Tahun 2016 tiket itu dihapus. Kata pendirinya, bukan untuk cari uang, tapi karena dua mata uang membingungkan, memancing akun bot, dan Roblox tidak mau orang datang cuma demi absen.",
        q="Kalau Tix masih ada, kamu bakal rajin login tiap hari?",
        single="Roblox dulu punya dua mata uang: Robux dan Tix. Tix gratis dari login harian. 15 Maret 2016 Baszucki mengumumkan Tix dihapus dalam 30 hari. Masih ingat Tix? #TixRoblox #FaktaRoblox",
        thread=["Dulu Roblox punya dua mata uang. Salah satunya gratis, cukup login tiap hari. #FaktaRoblox", "Namanya Tickets atau Tix. Didapat dari bonus login harian dan kunjungan ke game buatanmu, bisa ditukar ke Robux.", "15 Maret 2016, Baszucki menulis: Tix dihentikan dalam 30 hari. Salah satu perubahan terbesar Roblox.", "Alasannya: membingungkan pemain baru, memicu bot dan akun tambahan, dan bukan demi uang lebih banyak. #TixRoblox"],
    ),
}

for name, e in E.items():
    T = json.load(open(f"{name}/timeline.json", encoding="utf8"))
    chapters = "\n".join(f"{fmt(0 if i == 0 else s['start'])} {c}" for i, (s, c) in enumerate(zip(T["scenes"], e["ch"])))
    pts = "\n".join(f"{i + 1}. {p}" for i, p in enumerate(e["points"]))
    alts = "\n".join(f"- {a}" for a in e["alts"])
    thread = "\n\n".join(f"{i + 1}/ {t}" for i, t in enumerate(e["thread"]))
    tags = f"{e['tags']} {BASE}"
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
"""
    Path(name, "SOCIAL_CAPTIONS.md").write_text(md, encoding="utf8")
    print(name, "title", len(e["title"]), "single", len(e["single"]), [len(f"{i + 1}/ {t}") for i, t in enumerate(e["thread"])])
