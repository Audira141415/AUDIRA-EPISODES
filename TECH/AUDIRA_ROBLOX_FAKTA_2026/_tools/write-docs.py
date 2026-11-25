"""Writes each episode's production documents and MASTER_INDEX.md from timeline.json, so timecodes match the real files.
Run from AUDIRA_ROBLOX_FAKTA_2026: python _tools/write-docs.py"""
import json, re, subprocess
from pathlib import Path

TOK = re.compile(r"\{([^|}]*)\|([^}]*)\}")
fmt = lambda t: f"{int(t // 60)}:{int(t % 60):02}"

# (title, url, date, kind)
WP_MES = ("Wikipedia: Messiah (video game), bagian Legacy", "https://en.wikipedia.org/wiki/Messiah_(video_game)", "Dibaca 6 Nov 2026", "Ensiklopedia")
POLY = ("Polygon: Say goodbye to Roblox's iconic 'oof'", "https://www.polygon.com/23280931/roblox-oof-sound-effect-replaced-copyright-licensing", "27 Jul 2022", "Sekunder")
EURO = ("Eurogamer: Roblox has removed its oof sound", "https://www.eurogamer.net/roblox-has-removed-its-oof-sound-of-death", "27 Jul 2022", "Sekunder, memuat pernyataan Roblox")
GB = ("GamesBeat: Tallarico settles copyright dispute with Roblox", "https://gamesbeat.com/tommy-tallarico-settles-copyright-dispute-with-roblox-over-oof-sound/", "10 Nov 2020", "Sekunder (403 saat diambil, lewat ringkasan Wikipedia)")
WC = ("Windows Central: the Roblox oof sound is back", "https://www.windowscentral.com/gaming/surprise-the-iconic-roblox-oof-sound-is-back-the-beloved-meme-makes-a-comeback-so-good-it-hurts-after-three-years-of-licensing-issues", "18 Jul 2025", "Sekunder, memuat unggahan resmi Roblox")
DIS = ("Distractify: Why did Roblox change the oof sound", "https://www.distractify.com/p/why-did-roblox-change-the-oof-sound", "4 Jun 2024", "Sekunder, klaim Kuras")
CBR = ("CBR: Roblox players furious over removed sound", "https://www.cbr.com/roblox-oof-sound-licensing/", "1 Agu 2022", "Sekunder")
WP_RB = ("Wikipedia: Roblox, bagian History", "https://en.wikipedia.org/wiki/Roblox", "Dibaca 6 Nov 2026", "Ensiklopedia")
WP_DB = ("Wikipedia: David Baszucki", "https://en.wikipedia.org/wiki/David_Baszucki", "Dibaca 6 Nov 2026", "Ensiklopedia, mengutip Forbes 2016")
WP_RC = ("Wikipedia: Roblox Corporation", "https://en.wikipedia.org/wiki/Roblox_Corporation", "Dibaca 6 Nov 2026", "Ensiklopedia")
BI = ("Business Insider: the lesser-known cofounder of Roblox", "https://www.businessinsider.com/robloxs-other-cofounder-is-not-forgotten-2021-3", "13 Mar 2021", "Sekunder")
API = ("Roblox Users API v1: users/1, 2, 3, 4, 5, 156", "https://users.roblox.com/v1/users/2", "Dicek 6 Nov 2026", "Primer, data langsung")
BLOOM = ("Bloomberg: David Baszucki, Roblox's Builderman", "https://www.bloomberg.com/news/features/2021-12-01/david-baszucki-ceo-who-took-roblox-rblx-public-bloomberg-50-2021", "1 Des 2021", "Sekunder")
DS = ("DualShockers: Is the John Doe Roblox hack on March 18 real?", "https://www.dualshockers.com/is-the-john-doe-roblox-hack-on-march-18-real-tiktok-videos-explained/", "18 Mar 2021", "Sekunder")
SK = ("Sportskeeda: What is John Doe Day in Roblox", "https://www.sportskeeda.com/roblox-news/what-john-doe-day-roblox-explained", "21 Mar 2023", "Sekunder, kualitas rendah, konteks saja")
UNITS = ("Roblox Creator Docs: Roblox units", "https://create.roblox.com/docs/physics/units", "Diperbarui 5 Nov 2026", "Primer")
WS = ("Roblox Creator Docs: Workspace.Gravity", "https://create.roblox.com/docs/reference/engine/classes/Workspace", "Dibaca 6 Nov 2026", "Primer")
HUM = ("Roblox Creator Docs: Humanoid (WalkSpeed, JumpHeight)", "https://create.roblox.com/docs/reference/engine/classes/Humanoid", "Dibaca 6 Nov 2026", "Primer")
TIX = ("Roblox Blog, David Baszucki: Saying Goodbye to Tickets (arsip)", "https://web.archive.org/web/20220814104209/https://blog.roblox.com/2016/03/saying-goodbye-to-tickets/", "15 Mar 2016", "Primer")

EPS = {
    "EP01_SUARA_OOF": dict(n="01", title="Suara Oof Ternyata Bukan Milik Roblox", role="Pembuka seri, meme yang semua orang kenal", look="RUANG REKAM", kit="INNERWORKS + PRECISION",
        audience="Pemain Roblox lama dan baru, penikmat meme, kreator konten yang memakai efek suara.", angle="Suara paling ikonik Roblox ternyata pinjaman, sempat hilang tiga tahun, lalu kembali.",
        hook="Suara mati paling terkenal di Roblox, oof, ternyata bukan buatan Roblox.",
        palette="Arang studio #121014, oranye pita #FF6B1A, amber VU #FFB000, krem #F3E9D2, merah sinyal #E8384F", fonts="Archivo Black, IBM Plex Mono",
        world="Studio rekaman gelap di atas meja panjang: pita kaset, PC CRT tahun 2000, gelombang suara 3D, meter VU.",
        motion="Panel masuk seperti pita yang ditarik, keluar seperti tape-stop. Kamera dolly sepanjang meja studio.",
        audio="Bed lo-fi studio (keys hangat, desis pita, kick lembut), efek tape-stop di 2022 dan rewind di 2025. Tidak memakai suara oof asli.",
        board=["Avatar jatuh dan pecah jadi bagian-bagian, gelombang suara melonjak.", "Bagian tubuh berserakan, layar meme dengan gelombang suara.", "PC CRT tahun 2000 dan kaset MESSIAH, pelat nama Tallarico dan Kuras.", "Kontrak, stempel, koin dan label $1 = 100 Robux.", "Tanggal 26.07.2022, kaset dikeluarkan, gelombang jadi datar.", "Tanggal 18.07.2025, kaset masuk lagi, avatar tersusun kembali.", "Daftar cek lisensi, avatar melambai, meter VU bergerak."],
        findings=["Suara oof berasal dari game PC Messiah (2000). Tommy Tallarico mengaku memegang haknya.", "Tallarico juga menyebut sound designer Joey Kuras ikut membuatnya (Distractify).", "Tallarico mempersoalkan pemakaian di Roblox pada 2019; kesepakatan kompensasi tercapai 2020 (GamesBeat via Wikipedia).", "Setelah kesepakatan, developer yang memakai suara itu membayar 1 dolar atau 100 Robux (Polygon).", "26 Juli 2022 Roblox menghapus suara oof karena masalah lisensi dan meluncurkan suara pengganti (Eurogamer, pernyataan Roblox).", "18 Juli 2025 Roblox mengumumkan oof kembali dengan kalimat \"A comeback so good it hurts\", dan menautkan file audionya di Creator Hub (Windows Central)."],
        caveats="Siapa pembuat sebenarnya diperdebatkan, jadi naskah memakai kata \"mengaku\" dan \"menyebut\". Tahun masuknya oof ke Roblox berbeda antar sumber (2004 vs 2005), jadi tidak disebut. \"Banyak pemain protes\" bersandar pada liputan CBR. Video tidak memakai rekaman oof asli.",
        sources=[WP_MES, POLY, EURO, GB, WC, DIS, CBR]),
    "EP02_DYNABLOCKS": dict(n="02", title="Roblox Lahir dari Software Fisika Sekolah", role="Asal-usul, rasa penasaran", look="1989 KE 2006", kit="TIMEFORGE + DRAFTFORGE",
        audience="Pemain yang suka sejarah game, pelajar, orang tua.", angle="Platform game raksasa berakar dari software pelajaran fisika.",
        hook="Sebelum bernama Roblox, game ini punya nama lain: DynaBlocks.",
        palette="Platinum krem #D8D2C4, layar fosfor #1D3B3A, hijau retro #3FBF7F, tinta #222222, merah #D94A38", fonts="Space Grotesk, VT323",
        world="Meja lab komputer dengan rel garis waktu 1989-2013: komputer krem 1989, layar simulasi 2D, ubin nama, dunia balok pertama.",
        motion="Wipe piksel bertangga (steps). Kamera dolly sepanjang rel tahun.",
        audio="Arpeggio square-wave dan bunyi bip di paruh awal, piano elektrik hangat sejak nama Roblox lahir, hening di babak Cassel.",
        board=["Komputer 1989, bola 1-bit menggelinding di layar.", "Masuk ke layar: simulasi 2D bola, bidang miring, pegas.", "Peti dengan label $20 juta berpindah ke MSC Software, 1998.", "Avatar pelajar membangun dari balok di sekitar komputer.", "Ubin nama berganti: eBlocks, GoBlocks, DynaBlocks, ROBLOX.", "Dua avatar pendiri membangun dunia pertama, penguji berdatangan, 1 SEP 2006.", "Hening: pelat ERIK CASSEL 2013 dengan cahaya hangat.", "Garis 2D naik jadi balok 3D, avatar membangun lalu melambai."],
        findings=["Baszucki dan saudaranya Greg mendirikan Knowledge Revolution akhir 1980-an; Interactive Physics adalah simulasi fisika 2D untuk pendidikan (1989 menurut Wikipedia Roblox Corporation).", "Erik Cassel adalah VP Engineering untuk Interactive Physics.", "Knowledge Revolution dibeli MSC Software Desember 1998 senilai 20 juta dolar.", "Desember 2003 prototipe dibuat dengan nama kerja eBlocks, GoBlocks, lalu DynaBlocks; Januari 2004 menjadi Roblox, gabungan robots dan blocks.", "Di wawancara Forbes Juni 2016, Baszucki menyebut kesuksesan Interactive Physics dan Working Model di kalangan pelajar muda sebagai inspirasi.", "Versi awal dikerjakan berdua; beberapa lusin pemain ikut menguji; Roblox rilis 1 September 2006.", "Erik Cassel meninggal karena kanker pada 2013."],
        caveats="Wikipedia menyebut Knowledge Revolution didirikan \"akhir 1980-an\" dan Interactive Physics rilis 1989; naskah memakai 1989 untuk keduanya, perlu dicek saat review. Visual pendiri memakai avatar generik, bukan wajah asli.",
        sources=[WP_DB, WP_RC, WP_RB, BI]),
    "EP03_JOHN_DOE": dict(n="03", title="John Doe, Akun Nomor 2 di Roblox", role="Membongkar hoaks yang viral tiap tahun", look="BERKAS KASUS", kit="CYBERFORGE",
        audience="Pemain muda yang pernah melihat peringatan 18 Maret, dan orang tuanya.", angle="Data publik membongkar mitos: akun nomor dua yang dibuat bersamaan dengan akun Roblox.",
        hook="Setiap 18 Maret, muncul peringatan: John Doe akan meretas akun Roblox kamu.",
        palette="Hitam noir #0B0B0D, manila #D9C49A, benang merah #C1272D, tinta #1A1A1A, cyan data #6FE3FF, lampu #FFD38A", fonts="Special Elite, Oswald",
        world="Meja penyelidik gelap di bawah satu lampu, laci berkas, papan gabus dengan benang merah.",
        motion="Panel jatuh seperti kertas dengan sedikit rotasi, keluar meluncur ke bawah. Kamera melayang di atas meja dan papan.",
        audio="Bass betot berjalan, hi-hat sapu, detak jam di babak timestamp, tik mesin ketik dan dentum stempel HOAKS.",
        board=["Poster 18 MARET berkedip, siluet avatar abu-abu.", "Kartu ID #1 ROBLOX, #2 JOHN DOE, #3 JANE DOE keluar dari laci.", "Kartu kamus: John Doe = nama samaran, si Fulan.", "Tiga jam identik 27.02.2006 21:06:40 UTC, slot #4 dan #5 kosong.", "Kartu #156 BUILDERMAN 08.03.2006 jauh di ujung deret.", "Layar video rumor berlipat ganda, tag 2017.", "Stempel HOAKS, TIDAK DIBLOKIR, form password palsu jadi merah.", "Avatar John Doe melambai di bawah lampu."],
        findings=["API publik Roblox: ID 1 \"Roblox\", ID 2 \"John Doe\", ID 3 \"Jane Doe\", ketiganya created 2006-02-27T21:06:40.3Z.", "ID 4 dan 5 mengembalikan \"The user id is invalid\".", "ID 156 \"builderman\", created 2006-03-08; builderman adalah akun David Baszucki (Bloomberg, WSJ).", "Akun John Doe isBanned: false.", "Rumor peretasan 18 Maret disebar YouTuber sekitar 2017 dan terus diulang di TikTok (DualShockers).", "John Doe dan Jane Doe adalah nama samaran baku di AS untuk orang yang tidak diketahui namanya."],
        caveats="Tujuan pembuatan akun John Doe tidak dinyatakan resmi oleh Roblox, jadi naskah hanya menyebut \"nama contoh\". Asal tanggal 18 Maret tidak terverifikasi dan tidak dibahas. Data API dicek 6 November 2026.",
        sources=[API, BLOOM, DS, SK]),
    "EP04_GRAVITASI": dict(n="04", title="Gravitasi Roblox Hampir 6 Kali Bumi", role="Fakta sains yang bisa dihitung sendiri", look="LAB UJI LOMPAT", kit="POLYVERSE + PRECISION",
        audience="Pemain dan calon developer Roblox, pelajar yang suka fisika.", angle="Angka bawaan Roblox diubah ke satuan nyata, lalu diuji dengan lompatan.",
        hook="Kalau dihitung pakai satuan resmi Roblox, gravitasinya hampir enam kali gravitasi bumi.",
        palette="Langit #BFE3FF, rumput mint #8FD6A8, pasir #F4E1B5, oranye penggaris #FF8A3D, navy #1E2A4A, biru bumi #3B82F6, magenta Roblox #E0457B", fonts="Syne, JetBrains Mono",
        world="Lapangan uji low-poly pastel: tiang ukur stud, kusen pintu, gedung empat lantai, lintasan lari, petak bulan.",
        motion="Panel jatuh mengikuti gravitasi, memantul, lalu melompat keluar. Kamera mengikuti avatar, lintasan lompat dihitung dengan rumus gerak.",
        audio="Groove marimba dan pizzicato, bunyi boing tersintesis pada tiap lompatan, desir angin saat melayang tiga detik.",
        board=["Avatar melompat, lencana BUMI 9,8 vs ROBLOX 54,9.", "Tiang ukur: 1 stud = 28 cm.", "Batang 3D: 196,2 stud/s² = 54,9 m/s² vs 9,8.", "Penanda REALISTIS 35 stud/s² dari halaman dokumen.", "Lompat 7,2 stud di samping pintu, stopwatch 0,54 detik.", "Gravitasi realistis: avatar melambung sekitar 40 stud di samping gedung empat lantai.", "Avatar berlari 16 stud/s, speedometer 16 km/jam.", "Petak bulan, lompatan melayang, avatar melambai."],
        findings=["Dokumentasi resmi Roblox: 1 stud = 28 cm, 1 RMU = 21,952 kg.", "Gravitasi bawaan Roblox 196,2 stud/s² = 54,936 m/s²; nilai realistis 35 stud/s² = 9,8 m/s².", "54,936 / 9,8 = 5,6 kali.", "JumpHeight bawaan 7,2 stud (sekitar 2,02 m); JumpPower bawaan 50.", "WalkSpeed bawaan 16 stud/s = 4,48 m/s, sekitar 16 km/jam.", "Hitungan AUDIRA: kecepatan lepas landas v = akar(2 x 196,2 x 7,2) = 53,15 stud/s; waktu di udara 2v/g = 0,54 s.", "Hitungan AUDIRA: dengan g = 35 dan v sama, tinggi v²/2g = 40,4 stud (11,3 m), waktu di udara 3,04 s."],
        caveats="Roblox menulis bahwa mesin fisika tidak memakai konversi satuan secara internal; konversi ke meter adalah acuan resmi, bukan sifat mesin. Angka 40 stud dan 3 detik adalah hitungan kami, dan naskah menyebutnya begitu. Satu lantai gedung dianggap sekitar 3 meter.",
        sources=[UNITS, WS, HUM]),
    "EP05_TIX": dict(n="05", title="Roblox Dulu Punya Dua Mata Uang", role="Penutup seri, nostalgia pemain lama", look="ARKADE TIKET", kit="PIXELSTORY + BRICKCRAFT",
        audience="Pemain lama yang ingat Tix, pemain baru yang hanya kenal Robux.", angle="Mata uang gratis dari login harian sengaja dihapus, dan alasannya ditulis sendiri oleh pendiri.",
        hook="Dulu, Roblox punya dua mata uang. Salah satunya bisa kamu dapat gratis, cukup dengan login setiap hari.",
        palette="Ungu malam arkade #1B1036, emas tiket #F6C445, hijau koin #00B06F, pink neon #FF4FA3, krem #FFF4D6", fonts="Bungee, Press Start 2P",
        world="Ruang arkade: mesin tiket, brankas koin, mesin kalender login, loket penukaran, papan hitung mundur.",
        motion="Panel keluar dari slot seperti tiket, pergi dengan sobekan ke samping. Kamera berpindah antar mesin.",
        audio="Chiptune arkade (square dan triangle, arpeggio cepat), denting koin, gemerincing tiket, bunyi rolling door saat TUTUP.",
        board=["Mesin tiket memuntahkan pita tiket, avatar menangkap.", "Tiket emas dan koin hijau di dua podium, empat pelat nama perancang.", "Brankas koin, meter nilai turun saat koin dibagi gratis.", "Mesin kalender login, penghitung kunjungan, loket tukar tiket dan koin.", "Pelat 15 MARET 2016, hitung mundur 30 hari.", "Tiga alasan: avatar bingung, deret bot kembar, kalender absen dicoret.", "Avatar menghabiskan tiket, loket penukaran TUTUP.", "Tiket tertiup hilang, tinggal koin, avatar melambai."],
        findings=["Blog Roblox 15 Maret 2016 oleh David Baszucki: Tickets dihentikan dalam 30 hari, \"one of the biggest changes\".", "Ekonomi awal dirancang Baszucki, Erik Cassel, John Shedletsky, dan Matt Dusek, dengan dua mata uang.", "Robux tulang punggung ekonomi; Tickets menghadiahi partisipasi tanpa membagi Robux gratis yang memicu inflasi.", "Ada bonus Ticket login harian dan bonus Ticket untuk kunjungan tempat developer; Tix bisa diperdagangkan lewat sistem tukar mata uang.", "Alasan: membingungkan pengguna baru, botting dan akun alt, tidak ingin memancing check-in harian.", "\"The impetus behind removing tickets is not to make more money.\" 30 hari untuk menghabiskan Tix, Trade Currency ditutup.", "Wikipedia: Tickets resmi berhenti April 2016."],
        caveats="Logo Robux tidak dipakai; koin hijau adalah ilustrasi generik. Naskah merangkum alasan dari blog asli tanpa menambah motif lain.",
        sources=[TIX, WP_RB]),
}

def probe(f):
    if not f.exists():
        return None
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height,r_frame_rate:format=duration", "-of", "json", str(f)], capture_output=True, text=True)
    d = json.loads(r.stdout)
    return {**d["streams"][0], "duration": round(float(d["format"]["duration"]), 2)}


index = []
for name, E in EPS.items():
    d = Path(name)
    T = json.load(open(d / "timeline.json", encoding="utf8"))
    lines = json.load(open(d / "script-lines.json", encoding="utf8"))
    disp = lambda s: TOK.sub(lambda m: m.group(1), s)
    spoken = sum(len(TOK.sub(lambda m: m.group(2), l["text"]).split()) for l in lines)
    est = T.get("estimated", False)
    head = f"# EP {E['n']}: {E['title']}\n\nSeri AUDIRA, FAKTA ROBLOX. Created by Agus Dwi R. Riset 6 November 2026. Fungsi dalam seri: {E['role']}.\n\n"
    note = "**Timecode masih estimasi dari jumlah suku kata. Suara belum dibuat, menunggu persetujuan naskah.**\n\n" if est else ""
    w = lambda f, s: (d / f).write_text(s, encoding="utf8")
    w("CREATIVE_BRIEF.md", head + f"**Konsep:** {E['look']}. {E['world']}\n\n**Style kit:** {E['kit']}\n\n**Audiens:** {E['audience']}\n\n**Sudut:** {E['angle']}\n\n**Hook:** {E['hook']}\n\n**Konsep yang tidak dipilih:** tampilan kartu teks generik dan satu template untuk seluruh seri, karena tiap episode butuh subjek visual sendiri.\n")
    w("RESEARCH_REPORT.md", head + "## Temuan terverifikasi\n\n" + "\n".join(f"{i + 1}. {x}" for i, x in enumerate(E["findings"])) + f"\n\n## Batasan dan keputusan editorial\n\n{E['caveats']}\n")
    w("SOURCE_REGISTER.md", head + "| Sumber | Tanggal | Jenis |\n| --- | --- | --- |\n" + "".join(f"| [{a}]({b}) | {c} | {x} |\n" for a, b, c, x in E["sources"]))
    sc = head + note + f"Suara: Cartesia sonic-3, voice `04b567df-2923-4b0c-896b-4b7df0a07e1a`, bahasa id. {spoken} kata terucap, ujaran {T['speech_end']} detik, film {T['duration']} detik.\n\n"
    sb = head + note + "| Waktu | Visual | Teks ucapan |\n| --- | --- | --- |\n"
    for s, l, b in zip(T["scenes"], lines, E["board"]):
        sc += f"**[{fmt(s['start'])}-{fmt(s['end'])}]** {disp(l['text'])}\n\n"
        sb += f"| {fmt(s['start'])}-{fmt(s['end'])} | {b} | {disp(l['text'])} |\n"
    sb += f"| {fmt(T['speech_end'])}-{fmt(T['duration'])} | Outro: logo AUDIRA, Created by Agus Dwi R. | (musik) |\n"
    w("SCRIPT.md", sc + "\nEjaan fonetik untuk Cartesia ada di `script-lines.json`.\n")
    w("STORYBOARD.md", sb)
    w("ART_DIRECTION.md", head + f"**Dunia:** {E['world']}\n\n**Gerak:** {E['motion']}\n\n**Warna:** {E['palette']}\n\n**Karakter:** avatar balok orisinal dengan proporsi klasik, punya peran aktif. Bukan aset Roblox, dan layar diberi label ilustrasi.\n")
    w("DESIGN_SYSTEM.md", head + f"**Warna:** {E['palette']}\n\n**Tipografi:** {E['fonts']}\n\n**Format:** 1080x1920, 30 fps. Panel mulai 236 px dari atas, label 176-186 px, caption berakhir di 1540 px (safe zone atas 180, bawah 380), margin kanan 110 px.\n\n**Kode:** nilai pasti ada di `build-video.mjs`.\n")
    w("ASSET_MANIFEST.md", head + f"Seluruh visual dibuat prosedural di Three.js (`world3d.js`) dan HTML (`build-video.mjs`). Tidak ada aset, logo, atau cuplikan Roblox dan game lain.\n\n- Three.js dan pass bloom: `PROJECT/HyperFrames_Remotion/assets/lib/`\n- Logo AUDIRA: `assets/brand/stacked-reversed.svg`\n- SFX: `AUDIO/sfx/` dari pustaka AUDIRA\n- Font: {E['fonts']}\n")
    w("AUDIO_PLAN.md", head + note + f"**Musik:** {E['audio']} Disintesis di `mix.py`, tanpa sampel musik pihak ketiga.\n\n**Voice:** dinormalisasi ke -16 LUFS, musik di-duck saat vokal.\n\n**Master:** target -14 LUFS, true peak -1,5 dBTP.\n\n**Status:** " + ("draft tanpa narasi." if est else "voice final terpasang.") + "\n")
    v = probe(d / "PREVIEW.mp4"); f = probe(d / "FINAL_VIDEO.mp4")
    qa = head + "## Status\n\n" + (f"FINAL_VIDEO.mp4 ada: {f}\n" if f else f"Draft tanpa narasi: {v}. Belum final, dan belum ada FINAL_VIDEO.mp4.\n")
    mp = d / "PROJECT" / "qc" / "metrics.json"
    if f and mp.exists():
        m = json.load(open(mp))
        qa += f"""
## Hasil ukur `_tools/qc.py`

| Cek | Hasil |
| --- | --- |
| Video | {m['video']['width']}x{m['video']['height']}, {m['video']['r_frame_rate']} fps, decode error {m['decode_errors']} |
| Durasi | {f['duration']} detik (target brief sekitar 90 detik) |
| Loudness | {m['lufs']} LUFS, true peak {m['true_peak_dbfs']} dBTP |
| Voice dan musik | voice {m['vo_lufs']} LUFS, musik {m['music_lufs']} LUFS |
| Tempo | {m['wpm']} kata per menit |
| Caption | {m['caption_words_with_voice_pct']}% kata bersuara, selisih awal terbesar {m['caption_onset_max_gap_s']} detik, {m['srt_cues']} cue SRT |
| Freeze di atas 2,5 detik | {m['freezes_over_2.5s']} (kartu outro statis) |
| Segmen hitam | {len(m['black_segments'])} |

## Belum diverifikasi

Pengucapan belum didengar atau ditranskripsi, karena model Whisper lokal tidak tersedia. Ejaan fonetik ada di `script-lines.json`. Uji visual lewat contact sheet per episode.
"""
    else:
        qa += "\nBelum diukur pada draft: sinkron caption terhadap suara asli dan loudness akhir.\n"
    w("QA_REPORT.md", qa)
    index.append(f"| {E['n']} | [{E['title']}]({name}/SCRIPT.md) | {E['look']} | {E['kit']} | {fmt(T['duration'])} | {spoken} | {'FINAL' if f else 'Draft tanpa narasi' if v else 'Belum render'} |")
Path("MASTER_INDEX.md").write_text("# FAKTA ROBLOX\n\nSeri 5 video 9:16 tentang fakta Roblox yang jarang diketahui. Created by Agus Dwi R.\n\n| EP | Judul | Konsep | Style kit | Durasi | Kata | Status |\n| --- | --- | --- | --- | --- | --- | --- |\n" + "\n".join(index) + "\n", encoding="utf8")
print("\n".join(index))
