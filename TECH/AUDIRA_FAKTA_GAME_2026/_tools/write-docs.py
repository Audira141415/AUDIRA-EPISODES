"""Writes each episode's production documents and MASTER_INDEX.md from timeline.json, so timecodes match the real files.
Run from AUDIRA_FAKTA_GAME_2026: python _tools/write-docs.py"""
import json, re, subprocess
from pathlib import Path

TOK = re.compile(r"\{([^|}]*)\|([^}]*)\}")
fmt = lambda t: f"{int(t // 60)}:{int(t % 60):02}"

# (title, url, date, kind)
WP_CB = ("Wikipedia: Corrupted Blood incident", "https://en.wikipedia.org/wiki/Corrupted_Blood_incident", "Dibaca 6 Nov 2026", "Ensiklopedia, rujukan lengkap")
LANCET = ("Lofgren & Fefferman, The Lancet Infectious Diseases: virtual game worlds and epidemics", "https://www.thelancet.com/journals/laninf/article/PIIS1473-3099(07)70212-8/fulltext", "2007", "Jurnal ilmiah")
ARS = ("Ars Technica: What a WoW virtual outbreak taught us", "https://arstechnica.com/science/2020/03/that-time-world-of-warcraft-helped-epidemiologists-model-an-outbreak/", "16 Mar 2020", "Sekunder")
TIME = ("TIME: World of Warcraft, a pandemic lab?", "https://time.com/archive/6932135/world-of-warcraft-a-pandemic-lab/", "21 Agu 2007", "Sekunder")
WP_CR = ("Wikipedia: Creeper (Minecraft)", "https://en.wikipedia.org/wiki/Creeper_(Minecraft)", "Dibaca 6 Nov 2026", "Ensiklopedia")
KOT = ("Kotaku: The history of the Creeper", "https://kotaku.com/the-history-of-the-creeper-minecrafts-most-infamous-mo-1789304071", "23 Nov 2016", "Sekunder")
WP_PM = ("Wikipedia: Pac-Man (gameplay, records)", "https://en.wikipedia.org/wiki/Pac-Man", "Dibaca 6 Nov 2026", "Ensiklopedia")
TR = ("TechRaptor: 35 years of Pac-Man, the kill screen", "https://techraptor.net/gaming/opinion/35-years-pac-man-kill-screen", "22 Mei 2015", "Sekunder, penjelasan teknis")
WP_IO = ("Wikipedia: Integer overflow", "https://en.wikipedia.org/wiki/Integer_overflow", "Dibaca 6 Nov 2026", "Ensiklopedia")
WP_NG = ("Wikipedia: Nuclear Gandhi", "https://en.wikipedia.org/wiki/Nuclear_Gandhi", "Dibaca 6 Nov 2026", "Ensiklopedia, mengutip Reynolds, Shafer, Meier")
MEIER = ("Sid Meier, Sid Meier's Memoir! A Life in Computer Games, hlm. 261-266", "https://wwnorton.com/books/9781324005872", "8 Sep 2020", "Primer (buku), lewat kutipan Wikipedia")
WP_SI = ("Wikipedia: Space Invaders (development, hardware)", "https://en.wikipedia.org/wiki/Space_Invaders", "Dibaca 6 Nov 2026", "Ensiklopedia, mengutip wawancara Nishikado")

EPS = {
    "EP01_WABAH_WOW": dict(n="01", title="Wabah di World of Warcraft yang Dilirik CDC", role="Pembuka seri, cerita paling mengejutkan", look="PETA WABAH", kit="WORLDFORGE + NANOFORGE",
        audience="Gamer, penggemar MMO, dan penonton umum yang ingat pandemi.", angle="Bug sebuah game menjadi simulasi wabah dengan reaksi manusia sungguhan.",
        hook="Tahun 2005, sebuah wabah menyapu kota-kota di game online.",
        palette="Perkamen #E8D9B5, tinta cokelat #3B2A1A, merah infeksi #D7263D, cyan lab #36C5F0, biru malam #101826", fonts="Cinzel, IBM Plex Sans Condensed",
        world="Peta meja dunia fantasi 3D: kuil raid, kota ramai, rute perjalanan, lapisan HUD lab.",
        motion="Panel terbuka seperti tinta merembes. Kamera terbang rendah di atas peta seperti dokumenter.",
        audio="Drone fantasi gelap dan taiko rendah yang tumbuh bersama penyebaran, detak saat damage, pad paduan suara saat reset.",
        board=["Cahaya merah menyebar ke ikon kota, HUD lab 2005.", "Kuil raid, bos menebar partikel merah, 13 SEP 2005.", "Pet disimpan, dibawa ke kota, wabah melompat antar orang.", "Angka damage 263-337 per 2 detik, NPC pembawa tanpa gejala.", "Healer, penjaga gerbang, dan griefer.", "Tembok karantina, server restart, reset total, patch 8 OKT.", "Berkas CDC, stempel BUG, halaman jurnal.", "Peta tenang saat fajar, pahlawan dan pet."],
        findings=["Insiden Corrupted Blood berlangsung 13 September sampai 8 Oktober 2005 di World of Warcraft.", "Debuff dari bos Hakkar di raid Zul'Gurub seharusnya hilang saat bos kalah; pet yang disimpan membawa debuff ke kota karena tidak ada \"off-switch\".", "Damage 263-337 HP tiap dua detik; karakter level tertinggi mati dalam 30 detik atau kurang; NPC tertular tapi tidak mati (pembawa tanpa gejala).", "Pemain bereaksi sebagai healer, penjaga yang memperingatkan, dan griefer yang sengaja menyebarkan.", "Blizzard mencoba karantina dan restart bergilir, lalu hard reset; patch 8 Oktober membuat pet kebal.", "CDC menghubungi Blizzard meminta data; Blizzard menjawab itu bug tanpa data. Peneliti menulis di jurnal, antara lain Lofgren dan Fefferman di The Lancet Infectious Diseases (2007) dan Balicer di Epidemiology."],
        caveats="Tidak ada angka korban resmi, jadi naskah tidak menyebut jumlah karakter mati. Visual tidak memakai peta, logo, atau desain karakter Blizzard.",
        sources=[WP_CB, LANCET, ARS, TIME]),
    "EP02_CREEPER": dict(n="02", title="Creeper Minecraft Lahir dari Bug Babi", role="Fakta ringan yang mudah dibagikan", look="BENGKEL VOXEL", kit="VOXELVERSE",
        audience="Pemain Minecraft segala usia.", angle="Monster paling ikonik justru hasil salah ukuran yang tidak dihapus.",
        hook="Monster paling terkenal di Minecraft, Creeper, ternyata lahir dari bug.",
        palette="Langit senja #2E2A5A, rumput #5DBB4A, tanah #8B5A2B, babi #F4A6B8, daun #3FA34D, oranye #FF7A1A, krem #FFF6E5", fonts="Silkscreen, Rubik",
        world="Pulau voxel saat senja dengan gizmo editor model, pohon, dan rak trofi.",
        motion="Panel tersusun dari ubin blok, pergi dengan pecah jadi ubin. Kamera mengorbit pulau.",
        audio="Synth petik riang dan kotak musik, klik editor, desis sumbu dan ledakan, retakan petir.",
        board=["Makhluk hijau berkaki empat di senja, kilat cahaya.", "Babi voxel dibangun di editor, 20 AGU 2009.", "Pegangan PANJANG dan TINGGI tertukar, babi berdiri tegak.", "Penjelajah bingung, kutipan makhluk menyeramkan.", "Tekstur daun menempel, chip AI, versi 0.24_SURVIVAL_TEST.", "Makhluk mengendap, meledak, kawah; petir membuat versi charged.", "Rak trofi dan plakat Guinness.", "Penjelajah dan makhluk berdampingan."],
        findings=["Model yang menjadi Creeper dibuat 20 Agustus 2009 di masa pre-alpha saat Markus Persson membuat model babi.", "Persson menukar panjang dan tinggi, lalu berkata \"I'll keep it for a creepy creature\".", "Model diberi tekstur hijau dari tekstur daun dan AI agresif.", "Creeper masuk game 1 September 2009 di versi 0.24_SURVIVAL_TEST.", "Creeper hampir tanpa suara, mendesis, lalu meledak dan menghancurkan blok; bisa melukai atau membunuh pemain.", "Charged Creeper muncul saat tersambar petir.", "Masuk daftar top 50 penjahat game Guinness World Records Gamer's Edition."],
        caveats="Kalimat bahwa nama Creeper cocok dengan kata creepy adalah pengamatan, bukan klaim asal-usul nama resmi. Wajah makhluk di video adalah gambar sendiri, bukan tekstur Mojang.",
        sources=[WP_CR, KOT]),
    "EP03_PACMAN_256": dict(n="03", title="Pac-Man Punya Ujung: Level 256", role="Teknologi di balik glitch legendaris", look="LABIRIN 1 BYTE", kit="PIXELSTORY + CIRCUITFORGE",
        audience="Gamer retro, pelajar komputer, penonton umum.", angle="Satu byte memori menentukan akhir game paling terkenal di dunia.",
        hook="Pac-Man punya ujung. Di level 256, separuh layarnya hancur.",
        palette="Hitam #050510, biru labirin #2B3BFF, krem titik #FFE8C2, kuning #FFD400, magenta glitch #FF2E88, cyan data #2EE6FF", fonts="Major Mono Display, Space Mono",
        world="Labirin neon 3D di ruang hitam dengan register 8 lampu biner yang melayang.",
        motion="Panel digambar baris demi baris seperti scanline, keluar dengan irisan glitch. Kamera meluncur dari labirin ke register.",
        audio="Bed arkade square dan noise orisinal, blip makan bergantian, detak biner, ledakan glitch saat overflow.",
        board=["Chomper berlari ke labirin yang separuh kanannya hancur.", "Permainan normal, empat hantu, ikon buah, 1980.", "Register 8 lampu: 11111111 jadi 00000000.", "Buah digambar melewati 7 dan menimpa sisi kanan.", "Chomper terjebak, stempel KILL SCREEN.", "Odometer skor 3.333.360, pelat BILLY MITCHELL 1999.", "Surat untuk Jeffrey Yee 1982, BELUM TERBUKTI.", "Chomper berputar di sisi kiri yang utuh."],
        findings=["Pac-Man rilis 1980; level ditandai ikon buah di bawah layar.", "Integer overflow membuat level 256 rusak dan tidak bisa diselesaikan (kill screen).", "Satu byte menampung 0-255; rutinitas penggambar buah biasanya maksimal tujuh, di level 256 mencoba menggambar 256 dan menimpa sisi kanan layar (TechRaptor).", "Skor sempurna 3.333.360; Billy Mitchell disebut yang pertama dengan saksi dan terverifikasi.", "Desember 1982 Jeffrey Yee (8 tahun) menerima surat Presiden Reagan untuk skor 6.131.940, yang hanya mungkin bila melewati level 256; tidak ada yang terbukti bisa."],
        caveats="Tahun 1999 untuk skor sempurna Mitchell berasal dari TechRaptor. Rekor Mitchell pernah disengketakan untuk game lain; naskah memakai kata \"disebut\". Bentuk chomper dan hantu digambar sendiri.",
        sources=[WP_PM, TR, WP_IO]),
    "EP04_GANDHI_NUKLIR": dict(n="04", title="Gandhi Nuklir di Civilization Ternyata Mitos", role="Membongkar mitos internet", look="PAPAN STRATEGI KERTAS", kit="PAPERWORLD + DRAFTFORGE",
        audience="Pemain game strategi, pelajar pemrograman, pencinta trivia.", angle="Bug paling terkenal di dunia game ternyata tidak pernah ada, dan lelucon belakanganlah yang membuatnya terasa nyata.",
        hook="Gandhi yang cinta damai tiba-tiba gila nuklir gara-gara bug. Ternyata, itu mitos.",
        palette="Kertas #F4EEDC, terakota #C65D3B, teal #2A7F7A, kunyit #F2A541, tinta #2B2B2B, merah mitos #D33A2C", fonts="Fraunces, IBM Plex Mono",
        world="Papan strategi heksagon dari kertas di atas meja, pion pemimpin dengan pelat nama.",
        motion="Panel terbuka dari lipatan kertas dan pergi dengan dilipat. Kamera meluncur seperti dokumenter board game.",
        audio="Pizzicato orkestra jenaka, desir kertas, tik kode, roket kartun yang gagal meluncur, gong pada plot twist.",
        board=["Roket kertas dari kota pion Gandhi, stempel MITOS?", "Dial agresi 1, kartu DEMOKRASI -2, 1 - 2 = -1.", "Register memutar -1 jadi 255, bar melesat.", "Halaman TV Tropes 2012 menyebar seperti selebaran.", "Pelat Brian Reynolds, dial jadi tiga tingkat.", "Memoar Sid Meier 2020, int = signed.", "Papan CIV V 2010, kartu NUKE = 12, Jon Shafer.", "Stempel LELUCON, BUKAN BUG, pengintai melambai."],
        findings=["Legenda: agresi Gandhi 1, demokrasi mengurangi 2, menjadi -1 yang meluap ke 255 dalam bilangan 8-bit tanpa tanda.", "Klaim ditulis di TV Tropes tahun 2012 tanpa bukti, 21 tahun setelah Civilization rilis (1991).", "Brian Reynolds: hanya tiga tingkat agresi, sepertiga pemimpin setara Gandhi, tidak ada variabel unsigned di bagian itu.", "Sid Meier (memoar, 8 Sep 2020): variabel integer bertanda secara bawaan di C dan C++, bentuk pemerintahan tidak memengaruhi agresi AI.", "Civilization V (2010): Jon Shafer memberi Gandhi nilai Build Nuke dan Use Nuke 12, tertinggi, sebagai lelucon."],
        caveats="Pernyataan integer bertanda di C dikutip sebagai klaim Sid Meier. Angka 25 kali adalah bagian dari legenda. Gandhi tampil sebagai pion dengan pelat nama, tanpa wajah atau karikatur.",
        sources=[WP_NG, MEIER]),
    "EP05_SPACE_INVADERS": dict(n="05", title="Alien Space Invaders Makin Cepat karena Prosesor", role="Penutup seri, desain lahir dari keterbatasan", look="DALAM MESIN 1978", kit="INNERWORKS + CIRCUITFORGE",
        audience="Gamer retro, developer game, pelajar teknik.", angle="Kurva kesulitan paling terkenal di arkade lahir dari prosesor yang kewalahan.",
        hook="Alien di Space Invaders makin cepat saat jumlahnya tinggal sedikit. Itu bukan rancangan awal.",
        palette="Hitam kabinet #050505, fosfor putih #F2F2F2, PCB hijau #0F5132, tembaga #C77B30, hijau sinyal #39FF14, amber #FFB020", fonts="Chakra Petch, Share Tech Mono",
        world="Kabinet arkade terurai: layar CRT di dalam, papan sirkuit dan chip di belakang, meja kerja insinyur.",
        motion="Panel menyala dari garis CRT tipis, padam menyusut jadi titik. Kamera bergerak dari CRT ke PCB dan kembali.",
        audio="Denyut empat langkah rendah yang temponya mengikuti jumlah alien, dengung CRT, desis solder, tembakan laser.",
        board=["Barisan alien di CRT makin cepat, chip CPU memanas.", "Meja kerja: 1978, Taito, Intel 8080, kartu inspirasi.", "Keinginan WARNA dan LEBIH CEPAT dicoret, layar monokrom.", "Beban CPU sebanding jumlah alien, waktu frame turun, langkah makin cepat.", "Sakelar PATCH dibiarkan mati, JADI MEKANIK GAME.", "Alien terakhir melesat, kutipan Nishikado.", "Kabinet berlipat jadi titik di peta dunia, kurva kesulitan.", "Insinyur melambai di samping kabinet."],
        findings=["Space Invaders (1978) dirancang Tomohiro Nishikado, bekerja sendiri selama setahun termasuk merancang hardware.", "Hardware memakai CPU Intel 8080 dan framebuffer bitmap pada CRT.", "Inspirasi antara lain Breakout dan The War of the Worlds.", "Papan kendali tidak cukup kuat untuk grafis berwarna atau menggerakkan musuh lebih cepat.", "Prosesor menggambar frame animasi alien lebih cepat saat alien lebih sedikit; karena posisi diperbarui per frame, alien makin cepat dan audio ikut cepat.", "Nishikado membiarkannya sebagai mekanik; menurutnya ini membuat game lebih menarik dan menutupi keterbatasan hardware.", "Space Invaders sukses komersial di seluruh dunia."],
        caveats="Inspirasi game lain diringkas dari daftar yang lebih panjang di Wikipedia. Bentuk alien digambar sendiri, bukan sprite asli.",
        sources=[WP_SI]),
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
    head = f"# EP {E['n']}: {E['title']}\n\nSeri AUDIRA, FAKTA GAME DUNIA. Created by Agus Dwi R. Riset 6 November 2026. Fungsi dalam seri: {E['role']}.\n\n"
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
    w("ART_DIRECTION.md", head + f"**Dunia:** {E['world']}\n\n**Gerak:** {E['motion']}\n\n**Warna:** {E['palette']}\n\n**Karakter:** karakter orisinal dengan peran aktif. Bukan aset game asli, dan layar diberi label ilustrasi.\n")
    w("DESIGN_SYSTEM.md", head + f"**Warna:** {E['palette']}\n\n**Tipografi:** {E['fonts']}\n\n**Format:** 1080x1920, 30 fps. Panel mulai 236 px dari atas, label 176-186 px, caption berakhir di 1540 px (safe zone atas 180, bawah 380), margin kanan 110 px.\n\n**Kode:** nilai pasti ada di `build-video.mjs`.\n")
    w("ASSET_MANIFEST.md", head + f"Seluruh visual dibuat prosedural di Three.js (`world3d.js`) dan HTML (`build-video.mjs`). Tidak ada aset, logo, atau cuplikan dari game yang dibahas.\n\n- Three.js dan pass bloom: `PROJECT/HyperFrames_Remotion/assets/lib/`\n- Logo AUDIRA: `assets/brand/stacked-reversed.svg`\n- SFX: `AUDIO/sfx/` dari pustaka AUDIRA\n- Font: {E['fonts']}\n")
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
Path("MASTER_INDEX.md").write_text("# FAKTA GAME DUNIA\n\nSeri 5 video 9:16 tentang fakta game dunia yang jarang diketahui. Created by Agus Dwi R.\n\n| EP | Judul | Konsep | Style kit | Durasi | Kata | Status |\n| --- | --- | --- | --- | --- | --- | --- |\n" + "\n".join(index) + "\n", encoding="utf8")
print("\n".join(index))
