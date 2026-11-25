"""Writes each episode's production documents and MASTER_INDEX.md from timeline.json, so timecodes match the real files.
Run from AUDIRA_AI_GAME_2026: python _tools/write-docs.py"""
import json, re, subprocess
from pathlib import Path

TOK = re.compile(r"\{([^|}]*)\|([^}]*)\}")
fmt = lambda t: f"{int(t // 60)}:{int(t % 60):02}"

LETTER = ("Surat pemegang saham Roblox Q3 2026", "https://s27.q4cdn.com/984876518/files/content_files/Q3-2026-Earnings-Shareholder-Letter.pdf", "Okt 2026", "Primer, klaim perusahaan")
BUILD = ("Introducing Build, Roblox Newsroom", "https://about.roblox.com/newsroom/2026/07/build-without-limits-on-roblox", "16 Jul 2026", "Primer")
EVAL = ("How Roblox Evaluates Build Game Creation", "https://about.roblox.com/newsroom/2026/10/how-roblox-evaluates-build-game-creation", "8 Okt 2026", "Primer")
CUBE = ("Accelerating Creation, Powered by Cube", "https://about.roblox.com/newsroom/2026/02/accelerating-creation-powered-roblox-cube-foundation-model", "4 Feb 2026", "Primer")
AGENT = ("Plan, Build, and Test Faster With Agentic Workflows", "https://about.roblox.com/newsroom/2026/04/roblox-studio-going-agentic", "15 Apr 2026", "Primer")
IGNB = ("IGN: Roblox Build", "https://www.ign.com/articles/roblox-will-let-anyone-use-ai-to-turn-text-prompts-into-a-basic-game-on-their-phone", "16 Jul 2026", "Sekunder")
TC2 = ("TechCrunch: RDC 2026", "https://techcrunch.com/2026/09/11/roblox-is-making-it-easier-to-build-games-with-ai-and-play-them-outside-roblox/", "11 Sep 2026", "Sekunder")
TC1 = ("TechCrunch: 4D open beta", "https://techcrunch.com/2026/02/04/robloxs-4d-creation-feature-is-now-available-in-open-beta/", "4 Feb 2026", "Sekunder")
DOCS = ("Roblox Creator Docs: TextGenerator", "https://create.roblox.com/docs/reference/engine/classes/TextGenerator", "Dibaca 5 Nov 2026", "Primer")
IGNW = ("IGN: Where Winds Meet, Solid Snake Method", "https://www.ign.com/articles/where-winds-meet-players-are-using-the-solid-snake-method-to-trick-ai-chatbot-npcs-into-skipping-sidequests", "1 Des 2025", "Sekunder")
GB = ("GamingBolt: NPC chatbot Where Winds Meet", "https://gamingbolt.com/whats-the-deal-with-where-winds-meets-npc-chatbots", "21 Nov 2025", "Sekunder")
NV = ("NVIDIA: ACE Game Agent SDK", "https://developer.nvidia.com/blog/build-on-device-ai-companions-with-the-nvidia-ace-game-agent-sdk-and-unreal-engine-5-plugins/", "16 Jun 2026", "Primer vendor")
PCG = ("PC Gamer: kutipan surat Q3", "https://www.pcgamer.com/software/ai/ai-powered-game-development-is-leading-to-an-explosion-of-content-roblox-says-as-it-brags-about-70-000-games-published-on-its-platform-in-the-last-5-months-alone/", "30 Okt 2026", "Sekunder")
XS = ("XenoSpectrum: analisis metrik", "https://xenospectrum.com/en/roblox-ai-build-game-quality/", "1 Nov 2026", "Analisis")
GG = ("GosuGamers: 289 jt dan 217 jt kunjungan", "https://www.gosugamers.net/entertainment/news/79447-over-70-000-games-on-roblox-are-developed-using-ai-including-80-of-its-top-games", "30 Okt 2026", "Sekunder, satu sumber")
MG = ("Mobilegamer.biz: saham turun 19% after hours", "https://mobilegamer.biz/roblox-shares-fall-as-it-beats-billings-guidance-but-growth-stalls/", "30 Okt 2026", "Sekunder")

EPS = {
    "EP01_BUILD_HP": dict(n="01", title="AI Membuat Game dari HP", role="Menjangkau pemula", look="SATU KALIMAT", kit="BRICKCRAFT + PRECISION",
        audience="Pemula, pemain Roblox, dan orang tua yang belum pernah membuat game.", angle="Hambatan masuk turun ke satu kalimat, tapi hasilnya titik awal, bukan game jadi.",
        hook="Satu kalimat di HP, dan kamu punya game.",
        palette="Kayu hangat #C98F55, krem #FFFBEF, tinta #1F2A44, kuning #FFC61A, merah #E5392F, biru #1F7AE0", fonts="Fredoka, Nunito",
        world="Meja kayu bermatahari. Sebuah HP tergeletak, dan game tumbuh dari layarnya: ribuan bata instanced dengan stud, jatuh dan terpasang satu per satu.",
        motion="Kartu turun dan terpasang seperti bata (back.out). Kamera terus bergerak di atas meja. Keluar ke outro lewat iris bulat.",
        audio="Petikan mirip ukulele dan tepuk tangan 108 BPM, klik bata plastik mengikuti bata yang jatuh.",
        board=["Teks diketik di layar HP, bata meledak keluar dari layar.", "Layar menampilkan tab Build, kamera turun pelan.", "Prompt contoh Roblox diketik per huruf.", "Lembar rencana naik, lalu kode, dunia, karakter, tampilan, dan suara terpasang tepat pada katanya.", "Avatar berlari, melompati batang kayu. Saat diubah, hutan jadi merah muda, lalu uji lagi.", "100 avatar: 71 menyala, 29 abu-abu.", "Pelat game dasar yang polos, lalu 4 ubin negara dan 1 ubin abu-abu Indonesia.", "Kembali ke HP, dunia lengkap, avatar melambai."],
        findings=["Build adalah tab pembuatan mobile-first di aplikasi Roblox, diumumkan 16 Juli 2026, memakai prompt teks.", "Contoh prompt resmi: game petualangan santai di hutan lebat dengan rintangan lingkungan.", "Build menerjemahkan prompt menjadi spesifikasi, lalu membuat game (agen end-to-end).", "Build menangani mekanik, lingkungan, karakter, gaya visual, dan suara.", "Versi dasar gratis, ada opsi berbayar untuk pengguna berat.", "Pada alpha awal, 71% dari yang membuat game belum pernah memakai Roblox Studio.", "Alpha per surat Q3: Selandia Baru, Singapura, Serbia, Thailand. Indonesia tidak disebut.", "Build untuk usia 9+ yang sudah cek usia; game terbit tersedia untuk usia 16+."],
        caveats="Roblox menyebut hasilnya \"basic game\" dan \"starting point\". Ketersediaan berdasarkan surat Q3 dan bisa berubah. Kalimat \"baru pertama kali membuka alat pembuat game Roblox\" adalah penafsiran dari angka 71%, perlu dicek saat review naskah.",
        sources=[BUILD, EVAL, IGNB, LETTER, TC2]),
    "EP02_MOBIL_4D": dict(n="02", title="AI Membuat Mobil Interaktif", role="Visual paling mengejutkan", look="CAR-5", kit="DRAFTFORGE + INNERWORKS",
        audience="Pemain dan kreator yang suka melihat cara kerja di balik layar.", angle="Yang baru bukan bentuk mobilnya, tapi bagian-bagian dan perilakunya.",
        hook="Ketik: mobil. Lalu kamu masuk, dan menyetirnya.",
        palette="Navy #06122B, sian #39D0FF, merah #FF3B30, amber #FFD166, putih #EAF6FF", fonts="Space Grotesk, JetBrains Mono",
        world="Meja gambar malam hari. Partikel membentuk wireframe, wireframe jadi mobil merah, lalu mobil meninggalkan cetak biru dan melaju.",
        motion="Panel digambar kiri ke kanan seperti plotter. Mobil terurai jadi 5 mesh dengan label, roda berputar dan berbelok, kamera ikut mengejar saat berkendara.",
        audio="Arpeggio synth gelap 112 BPM yang terbuka jadi beat saat berkendara, ditambah mesin yang nadanya naik.",
        board=["Partikel membentuk mobil, avatar masuk.", "Mobil berputar di atas cetak biru.", "Mobil jadi bongkah abu-abu, roda macet, tanda silang.", "Mobil terurai: body dan empat roda berlabel nama asli schema.", "Sinar skrip tersambung, penggaris menyesuaikan panjang, roda berputar dan berbelok.", "Mobil melaju di jalan, kota pilar lewat.", "Pesawat dan naga muncul di atas jalan, angka 160.000+ dan +64%.", "Wireframe benda lain memenuhi cakrawala."],
        findings=["4D generation memakai Cube Foundation Model, beta 4 Februari 2026, early access sejak November 2025.", "Schema Car-5: lima MeshPart bernama body, front left wheel, front right wheel, rear left wheel, rear right wheel.", "Skrip disesuaikan ke ukuran objek hasil generasi (retarget).", "Dua schema saat beta: Car-5 dan Body-1.", "Wish Master: mobil, pesawat, naga terbang; 160.000+ objek saat early access; +64% waktu main menurut developer.", "Roblox mengharapkan schema untuk ribuan jenis benda."],
        caveats="Angka 64% adalah pernyataan developer Wish Master tentang pemain yang memakai fitur, bukan hubungan sebab akibat. Mobil pada video adalah ilustrasi, bukan cuplikan.",
        sources=[CUBE, TC1, BUILD]),
    "EP03_NPC_OTAK": dict(n="03", title="NPC dengan Otak AI", role="Memancing rasa penasaran", look="OTAK NPC", kit="TOONFORGE",
        audience="Pemain game yang penasaran apakah NPC sekarang benar-benar berpikir.", angle="NPC kini menyusun jawaban sendiri, dan justru karena itu bisa ditipu.",
        hook="Pemain ini cuma mengetik: memberi tahu jawaban yang benar. Dan NPC-nya percaya.",
        palette="Kertas #F5EFE0, tinta #14110F, merah #E0242A sebagai warna pikiran, biru pemain #3B5FA8", fonts="Bangers, Patrick Hand",
        world="Desa manga cel-shaded dengan kontur tinta. Kepala NPC terbuka memperlihatkan otak merah.",
        motion="Potongan keras antar panel dengan speed line, tanpa fade. Caption berupa balon bicara.",
        audio="Pizzicato jahil dan taiko 96 BPM, dengung otak saat kepala terbuka, stinger komik tiap panel.",
        board=["Dua tokoh berhadapan, balon teks, NPC percaya.", "Close-up NPC, tanpa naskah.", "Kartu pilihan kaku, baris keempat kosong dan disilang.", "Kepala terbuka, otak merah, lalu berang-berang dan bendungan.", "Jaringan saraf dan cip konteks, lalu dinding 1.200 tabel.", "NPC ikut berlari, bertarung, dan membuka peti.", "NPC berputar di lingkaran merah tanpa akhir.", "Bayangan gerak manusia, lalu pertanyaan penutup."],
        findings=["Di Where Winds Meet, pemain mengetik \"(tells him the correct answer)\" untuk mengelabui NPC chatbot, dan sebagian mengeluhkan petunjuk yang salah.", "Roblox TextGenerator: LLM dengan system prompt dan user prompt, kegunaan utamanya NPC interaktif; contoh resminya berang-berang sibuk; ada ContextToken.", "NVIDIA: PUBG Ally mengerti suara, ikut bertarung dan mencari barang, berjalan penuh di perangkat.", "Total War: Pharaoh: penasihat eksperimental memakai RAG atas 1.200+ tabel data.", "NVIDIA menyebut tantangan: jeda jawaban, sinkron status game, putaran tanpa akhir.", "Surat Q3 Roblox: model NPC dilatih dari data gameplay manusia untuk playtest dan memberi masukan ke agen."],
        caveats="Tidak semua NPC Where Winds Meet memakai chatbot. Klaim PUBG Ally dan Pharaoh berasal dari vendor. Model NPC Roblox di surat Q3 disebut terutama untuk playtest.",
        sources=[IGNW, GB, DOCS, NV, LETTER, TC2]),
    "EP04_AI_DEVELOPER": dict(n="04", title="AI Developer Otomatis", role="Memperlihatkan kemampuan teknis", look="PAPAN SIRKUIT", kit="CIRCUITFORGE",
        audience="Developer dan kreator yang ingin tahu sejauh mana agen AI bekerja.", angle="AI lulus semua tes teknis, dan tetap gagal menjawab pertanyaan paling penting: seru atau tidak.",
        hook="Game ini lolos semua tes, sembilan dari sembilan. Tapi nilai desainnya cuma 31.",
        palette="PCB #114634, amber #FFA726, hijau #39FF9C, merah #FF3B47, krem #FFEFD2", fonts="Chakra Petch, IBM Plex Mono",
        world="Pabrik game di papan sirkuit: cip RENCANA, BANGUN, TES dialiri pulsa, lintasan tumbuh di atas cip, agen tes bermain, soket kelima kosong.",
        motion="Panel menyala dari garis seperti CRT, skor dihitung naik, kamera terbang rendah di atas jalur tembaga.",
        audio="Sequencer 7/8 124 BPM dengan tik relay, chirp hijau saat lolos, dengung rendah saat gagal.",
        board=["Agen menyusuri lintasan, 9/9 lalu 31.", "Tiga cip dan pulsa loop.", "Spesifikasi naik satu per satu, skor 91.", "Lintasan tumbuh, skor 98.", "Agen melompat, kena, jatuh, bangkit, skor 100 dan 86.", "1.000 LED kreator, 440 menyala.", "Empat dial turun ke nol, skor 31.", "Soket kosong dengan tanda tanya, avatar berdiri di sampingnya."],
        findings=["Skyforge Ascent, contoh evaluasi Roblox: spek 91, teknik 98, desain 31, playtest 100 (9 dari 9), visual 86.", "Desain mendapat nol pada progresi, replayability, player agency, dan hook orisinal.", "Satu-satunya temuan teknik: dua ekspor fungsi helper tak terpakai.", "Playtest memakai input seperti pemain, bukan memicu event dari kode.", "April 2026: 44% dari 1.000 kreator teratas memakai Assistant atau AI pihak ketiga via MCP.", "Surat Q3: waktu pakai alat AI tiga kali lipat di kreator top, pengguna harian MCP hampir 5x."],
        caveats="Skor berasal dari evaluator otomatis internal Roblox pada satu contoh, bukan rata-rata semua game Build. LED adalah visualisasi 44%, bukan data per kreator.",
        sources=[EVAL, AGENT, LETTER, XS, BUILD]),
    "EP05_TOP_20": dict(n="05", title="Game AI Masuk Top 20", role="Penutup seri, berita dan data nyata", look="PAPAN ATAS", kit="URBANFORGE",
        audience="Penonton seri, kreator, dan pembaca berita industri game.", angle="Klaim besarnya nyata sebagai klaim, tapi tiap angka mengukur hal yang berbeda.",
        hook="Dua game yang hampir seluruhnya dibuat AI masuk dua puluh besar Roblox.",
        palette="Putih #F4F1EA, kertas #F7F4EC, tinta #1B1A18, oranye #FF5A1F, hijau #2D8A57, merah #C7321F", fonts="Playfair Display, IBM Plex Sans",
        world="Maket kota putih: tiap menara satu game, matahari menyapu bayangan, dua menara oranye menembus garis Top 20.",
        motion="Panel koran naik seperti pelat cetak, baris belum terungkap tampak pudar, kota disusun ulang saat ukuran berubah.",
        audio="Piano hangat dan mallet 88 BPM yang menipis saat bagian hati-hati, tik mesin ketik pada data.",
        board=["Dua menara naik melewati garis Top 20.", "Sorot nama kedua game.", "Titik pengunjung mengalir ke menara.", "Kamera naik, 81 dari 100 menara berwarna.", "Kota menyusun ulang tinggi saat ukurannya berganti.", "Rangka kawat dan tanda tanya pada menara.", "Tiga kolom: pendapatan naik, pemesanan dan saham turun.", "Avatar di atap, kerumunan pemain, pertanyaan penutup."],
        findings=["Surat Q3 2026: Break and Steal an Egg dan Huss Valley \"created almost entirely with AI\" dan masuk Top 20 menurut pemain bersamaan.", "Lebih dari 80% dari 100 game teratas (jam main) memakai alat AI dalam sebulan terakhir.", "Build: 500.000+ pengguna dan 70.000+ game terbit sejak alpha.", "GosuGamers: 289 juta dan 217 juta kunjungan.", "Pendapatan US$1,6 miliar (+16%), bookings US$1,7 miliar (-12%).", "Mobilegamer.biz: saham turun 19% setelah bursa tutup."],
        caveats="Surat tidak merinci peran manusia dan tidak menyatakan kedua game dibuat dengan Build. Top 20 dan Top 100 memakai ukuran berbeda. Angka kunjungan berasal dari satu sumber sekunder. Tinggi menara adalah ilustrasi. Bukan saran investasi.",
        sources=[LETTER, PCG, XS, GG, MG, BUILD]),
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
    head = f"# EP {E['n']}: {E['title']}\n\nSeri AUDIRA, AI BIKIN GAME. Created by Agus Dwi R. Riset 5 November 2026. Fungsi dalam seri: {E['role']}.\n\n"
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

Pengucapan belum didengar atau ditranskripsi, karena model Whisper lokal tidak tersedia. Ejaan fonetik ada di `script-lines.json`. Satu-satunya jalur uji visual: contact sheet 8 frame per episode.
"""
    else:
        qa += "\nBelum diukur pada draft: sinkron caption terhadap suara asli dan loudness akhir.\n"
    w("QA_REPORT.md", qa)
    index.append(f"| {E['n']} | [{E['title']}]({name}/SCRIPT.md) | {E['look']} | {E['kit']} | {fmt(T['duration'])} | {spoken} | {'FINAL' if f else 'Draft tanpa narasi' if v else 'Belum render'} |")
Path("MASTER_INDEX.md").write_text("# AI BIKIN GAME\n\nSeri 5 video 9:16 tentang AI di pembuatan game, berpusat pada Roblox. Created by Agus Dwi R.\n\n| EP | Judul | Konsep | Style kit | Durasi | Kata | Status |\n| --- | --- | --- | --- | --- | --- | --- |\n" + "\n".join(index) + "\n", encoding="utf8")
print("\n".join(index))
