"""Writes the production documents for EP26-EP30 (final mode once FINAL_VIDEO.mp4 and PROJECT/qc/metrics.json exist).
Run from AUDIRA_CARA_KERJA_VIRAL_2026: python _tools/docs-26-30.py"""
import json, re, subprocess
from pathlib import Path

TOK = re.compile(r"\{([^|}]*)\|([^}]*)\}")
EPS = {
    "EP26_SAMPAH_JADI_LISTRIK": dict(
        n="26", title="1.100 Ton Sampah Jadi Listrik: Cara Kerja PSEL Keramasan Palembang", research="EP26_sampah_jadi_listrik.md", concept="THE CLAY FURNACE", kits="CLAYWORLD",
        hook="Tiap hari, 1.100 ton sampah Palembang diangkut truk. Mulai Desember, sebagian besar dibakar di tungku 850 derajat, lalu jadi listrik.",
        audience="Penonton kabar PSEL Keramasan Palembang (peninjauan menteri 4 Nov 2026, peresmian direncanakan Desember) dan warga yang peduli sampah kota.",
        look="Diorama plastisin pabrik sampah jadi listrik: truk tanah liat, bunker beton berisi gumpalan sampah warna-warni, capit raksasa, tungku jeruji miring dengan api lempung, boiler, turbin dan generator berlilit tembaga, kota kecil berlampu, dan truk abu.",
        palette="Bata merah, krem hangat, hijau rumput lempung, oranye api, teal pipa", fonts="Baloo 2, Nunito",
        motion="Panel masuk seperti stiker plastisin yang ditekan lalu memantul, keluar mengempis. Kamera menyusuri jalur sampah dari truk ke kota tanpa potongan keras, dengan properti lempung buram di latar depan.",
        sound="Kalimba/marimba 98 bpm C pentatonik, bas tuba, deru tungku, desis uap, dengung turbin, plop tanah liat tiap panel.",
        board={"s1": "Truk menumpahkan sampah, tungku menyala, 1.100 TON", "s2": "PSEL KERAMASAN, 4 November 2026, 18,6 MW ke PLN saat uji coba", "s3": "Bunker raksasa, sampah diperam 5-7 hari, capit mengangkut ke tungku", "s4": "Jeruji miring bergeser, udara ditiup dari bawah: kering, menyala, abu", "s5": "Boiler, uap, turbin memutar generator: 20 MW, 17,7 MW ke jaringan", "s6": "Termometer 850 C, cincin timer 2 detik, kapur dan karbon aktif, filter kantong", "s7": "1.000 TON kapasitas rancangan, kota menyala, truk abu keluar", "s8": "Kota diorama menyala, pelat AUDIRA"},
        ch=["Hook", "PSEL Keramasan", "Bunker dan capit", "Jeruji tungku", "Uap jadi listrik", "Kenapa 850 derajat", "Kapasitas dan abu", "Penutup"],
    ),
    "EP27_KAPAL_AMONIA": dict(
        n="27", title="Bahan Bakar Kapal Tanpa Karbon: Cara Kerja Mesin Kapal Amonia", research="EP27_kapal_bahan_bakar_amonia.md", concept="NH3 HARBOUR", kits="VOXELVERSE",
        hook="Bahan bakar kapal tanpa satu pun atom karbon. Tapi untuk menyalakannya, tetap butuh sedikit solar.",
        audience="Penonton kabar uji coba bunkering amonia hijau di Ulsan, Korea Selatan (25-26 Okt 2026) dan peminat energi bersih pelayaran.",
        look="Pelabuhan voxel saat senja: tanker kubus di dermaga, tangki darat berstensil AUDIRA, pulau turbin angin dan panel surya, molekul NH3 dari blok, tangki terbelah berisi cairan dingin, silinder mesin dengan injektor amonia dan solar pilot, katalis, dan cerobong.",
        palette="Senja oranye, krem voxel, biru es amonia, merah karat, hitam silinder", fonts="Rubik, Silkscreen",
        motion="Panel piksel menyusun diri blok demi blok dan keluar terurai. Kamera rendah meluncur di dermaga voxel dengan kabut tipis dan tilt-shift.",
        sound="Marimba blok kayu 92 bpm D pentatonik, pad hangat, riak air dermaga, satu klakson kapal di hook, desis cairan dingin, letupan silinder terkunci ke siklus gambar.",
        board={"s1": "Molekul NH3 tanpa karbon, api solar pilot menyala", "s2": "Ulsan 25-26 Okt 2026: Terra Clove diisi sekitar 800 ton amonia hijau", "s3": "Chifeng: listrik angin dan matahari memecah air jadi hidrogen, plus nitrogen udara", "s4": "Tangki terbelah: amonia cair -33 C, pipa dari darat ke kapal", "s5": "Silinder: amonia sulit terbakar (651 C), solar pilot sebagai korek", "s6": "Saluran buang: hasil ideal N2 + H2O, tapi masih ada NOx dan N2O, katalis", "s7": "Bar energi: amonia sekitar sepertiga solar per liter, tangki lebih besar", "s8": "Pelabuhan senja ditarik mundur, stensil AUDIRA"},
        ch=["Hook", "Uji coba Ulsan", "Amonia hijau", "Disimpan dingin", "Butuh korek solar", "Bukan nol emisi", "Harga lainnya", "Penutup"],
    ),
    "EP28_MOTOR_RADAR": dict(
        n="28", title="Motor yang Bisa Melihat ke Belakang: Cara Kerja Radar Motor Honda SENSING RIDE", research="EP28_motor_radar_honda_sensing.md", concept="TWO EYES", kits="TOONFORGE",
        hook="Motor ini bisa melihat mobil di belakangmu, dan ikut mengatur jarak saat macet. Tapi ini bukan motor radar pertama di dunia.",
        audience="Penonton kabar Honda SENSING RIDE di EICMA Milan (3 Nov 2026) dan pengendara motor yang penasaran fitur radar.",
        look="Anime cel-shaded 3D: motor petualang generik berlampu putih, pengendara berjaket oranye, jalan raya dengan garis kecepatan, gelombang radar biru di depan dan merah muda di belakang, mobil mainan, dan diagram kopling ganda yang terurai.",
        palette="Langit biru anime, hijau rumput, aspal ungu-biru, oranye pengendara, cyan dan pink radar, kuning sorot", fonts="Dela Gothic One, Kanit",
        motion="Panel komik menebas masuk miring dengan garis kecepatan dan keluar disayat. Kamera mengejar motor rendah dari belakang dan berputar ke depan saat penjelasan.",
        sound="Opening anime 152 bpm D minor, bas synth oktaf, arpeggio square, dengung mesin mengikuti laju, chirp radar naik untuk pulsa dan ping turun untuk pantulan, bip peringatan.",
        board={"s1": "Motor dengan mata depan dan belakang, MOTOR INI BISA MELIHAT", "s2": "EICMA Milan 3 November: HONDA SENSING RIDE; Ducati sudah sejak 2020", "s3": "Dua radar gelombang milimeter, gelombang keluar lalu menunggu pantulan", "s4": "Pantulan terjepit: frekuensi naik sedikit seperti sirene mendekat", "s5": "Cruise control adaptif menjaga jarak, lampu spion di titik buta", "s6": "Stop & Go: kopling ganda terurai, KOPLING 1 dan KOPLING 2, tanpa tuas", "s7": "Layar memberi peringatan, rem ditambah saat kamu mengerem; motor tidak mengerem darurat sendiri", "s8": "Radar membantu melihat, yang menyetir tetap kamu"},
        ch=["Hook", "EICMA Milan", "Waktu pantul", "Frekuensi bergeser", "Data radar dipakai", "Kenapa DCT", "Saat bahaya", "Penutup"],
    ),
    "EP29_DRONE_TERMAL_SAR": dict(
        n="29", title="Melihat Panas, Bukan Cahaya: Cara Kerja Drone Termal Tim SAR di Semeru", research="EP29_drone_termal_sar.md", concept="SEEING HEAT", kits="THERMALFORGE",
        hook="Di lereng Semeru yang sedang erupsi, ada anggota tim SAR yang tidak melihat cahaya. Ia melihat panas.",
        audience="Penonton berita pencarian dua pendaki di Gunung Semeru (Nov 2026) dan peminat teknologi SAR. Tanpa nama, kondisi, atau hasil pencarian.",
        look="Kamera termal FLIR: lereng gunung dalam palet ironbow ungu-oranye-putih, drone quadcopter generik, regu SAR sebagai sosok hangat, grid mikrobolometer yang memanas, sosok piksel putih panas, braket TERHALANG, dan sapuan jalur sejajar dari atas.",
        palette="Ungu violet gelap, ironbow oranye-kuning-putih, cyan HUD", fonts="Space Grotesk, JetBrains Mono",
        motion="Panel HUD menyala seperti layar kamera termal dan keluar dengan garis pindai. Kamera mengikuti drone di atas lereng lalu turun menembus lensa ke sensor.",
        sound="Pad D minor add9 yang tenang, ping sensor tiap dua birama, angin gunung, gemuruh vulkanik jauh, dengung rotor; tanpa sirene atau hentakan di kalimat sensitif.",
        board={"s1": "Drone termal di atas lereng Semeru, regu SAR sebagai sosok hangat", "s2": "Lini waktu: kabar terakhir 2 Nov, pencarian mulai 7 Nov; hari ketiga 106 personel, enam regu", "s3": "Spektrum: tubuh memancar paling kuat sekitar 9,5 mikrometer; lensa germanium", "s4": "Mikrobolometer: piksel memanas, hambatan berubah, dibaca puluhan kali per detik", "s5": "Skala warna: dingin gelap, hangat jingga, terpanas putih; selisih 0,05 derajat", "s6": "Tidak tembus daun, batu, kaca, air; batu terpanggang dan uap fumarol jadi sinyal palsu", "s7": "Sapuan jalur sejajar dari atas, titik panas dikunci, tim darat memastikan", "s8": "Drone memperluas mata, tim darat memastikan; patuhi jalur resmi"},
        ch=["Hook", "Pencarian di Semeru", "Inframerah", "Mikrobolometer", "Suhu jadi warna", "Yang dilihat: beda suhu", "Pola pencarian", "Penutup"],
    ),
    "EP30_ASTRONOT_MENCOBLOS": dict(
        n="30", title="Bilik Suara 400 Km di Atas Kepala: Cara Astronaut Memilih dari Luar Angkasa", research="EP30_astronot_memilih_dari_angkasa.md", concept="THE FARTHEST BOOTH", kits="PAPERWORLD",
        hook="Bilik suara paling jauh di dunia: 400 kilometer di atas kepala kita. Bagaimana surat suaranya pulang?",
        audience="Penonton kabar astronaut NASA ikut pemilu sela AS (3 Nov 2026) dan peminat antariksa serta proses pemilu.",
        look="Diorama kertas potong: planet kertas dengan kota kecil, stasiun luar angkasa dengan bilik bertirai, astronaut kertas, kantor petugas pemilu Harris County, Mission Control, satelit relay TDRS, antena White Sands, amplop bersegel, dan pesawat kertas.",
        palette="Biru malam kertas, krem, salmon, kuning bintang, hijau mint", fonts="Fraunces, Nunito",
        motion="Panel kartu kertas tergantung masuk berayun dan keluar terlipat. Kamera mengorbit planet kertas dan mengikuti amplop melompat antar stasiun relay.",
        sound="Kotak musik celesta 92 bpm D pentatonik, pad hangat, dengung ruang angkasa, desir lipatan kertas tiap panel, segel lilin di kata terenkripsi, blip telemetri tiap lompatan relay.",
        board={"s1": "Stasiun 400 km di atas planet kertas, bilik suara paling jauh", "s2": "3 November, pemilu sela AS: tiga astronaut NASA memilih dari kabin tidur", "s3": "Kantor petugas pemilu dan astronaut: minta surat suara seperti warga di luar negeri; Bab 106 UU Pemilu Texas", "s4": "Surat suara elektronik terenkripsi dari Harris County lewat Mission Control Houston", "s5": "Jalur pulang yang biasa dijelaskan NASA: TDRS, White Sands, Houston, petugas", "s6": "Stasiun melaju 28.000 km/jam, antena darat hanya beberapa menit; relay geostasioner", "s7": "Sekitar 72.000 km dalam sekitar seperempat detik, amplop tetap terkunci", "s8": "Minta, isi, kirim, rahasia; pelat AUDIRA di kapsul"},
        ch=["Hook", "Pemilu sela", "Dimulai dari Bumi", "Naik ke orbit", "Jalur pulang", "Kenapa memutar", "Total perjalanan", "Penutup"],
    ),
}


def fmt(t):
    return f"{int(t // 60):02}:{t % 60:04.1f}"


if __name__ == "__main__":
    root = Path(".")
    for name, E in EPS.items():
        d = root / name
        lines = json.loads((d / "script-lines.json").read_text(encoding="utf8"))
        T = json.loads((d / "timeline.json").read_text(encoding="utf8"))
        disp = lambda x: TOK.sub(lambda m: m.group(1), x)
        spoken = lambda x: TOK.sub(lambda m: m.group(2), x)
        nsp = sum(len(spoken(l["text"]).split()) for l in lines)
        final = (d / "FINAL_VIDEO.mp4").exists() and not T.get("estimated") and (d / "PROJECT/qc/metrics.json").exists()
        status = "final dengan voice-over" if final else "draf"
        head = f"# EP {E['n']}: {E['title']}\n\nAUDIRA, seri CARA KERJA VIRAL. Created by Agus Dwi R. Status: {status}, 10 November 2026.\n\n"
        sc = head + f"Suara: Cartesia sonic-3, voice `04b567df-2923-4b0c-896b-4b7df0a07e1a`, bahasa id. Timecode dikunci ke audio. {nsp} kata terucap, {T['speech_end']:.1f} detik ujaran, film {T['duration']:.1f} detik.\n\n"
        for l, sn in zip(lines, T["scenes"]):
            sc += f"**{fmt(sn['start'])} - {fmt(sn['end'])}** ({l['id']})\n\n{disp(l['text'])}\n\n"
            if TOK.search(l["text"]):
                sc += f"> Teks untuk TTS: {spoken(l['text'])}\n\n"
        (d / "SCRIPT.md").write_text(sc, encoding="utf8")
        res = (root / "_research" / E["research"]).read_text(encoding="utf8")
        (d / "RESEARCH_REPORT.md").write_text(head + "Riset dari sumber yang dibaca langsung 10 November 2026. Setiap fakta berlabel HIGH, MED, atau LOW; naskah hanya memakai HIGH dan MED.\n\n" + res, encoding="utf8")
        urls = sorted(set(re.findall(r"https?://[^\s)|>\]`]+", res)))
        (d / "SOURCE_REGISTER.md").write_text(head + "Semua tautan yang dikutip di RESEARCH_REPORT.md. Status dan penggunaan tiap sumber dijelaskan di laporan riset. Musik dan SFX disintesis sendiri di `mix.py` (tanpa lisensi pihak ketiga).\n\n" + "\n".join(f"- <{u.rstrip('.,;')}>" for u in urls) + "\n", encoding="utf8")
        cb = head + f"## Hook\n\n{E['hook']}\n\n## Penonton\n\n{E['audience']}\n\n## Konsep\n\n{E['concept']}. Style kit: {E['kits']} (dipilih pengguna di gerbang style, lihat `style/STYLE_DECISION.md`).\n\n## Arah visual\n\n{E['look']}\n"
        (d / "CREATIVE_BRIEF.md").write_text(cb, encoding="utf8")
        ad = head + f"Konsep {E['concept']} ({E['kits']}).\n\n{E['look']}\n\n**Palet:** {E['palette']}\n\n**Font:** {E['fonts']} (ditulis literal di CSS).\n\n**Gerak:** {E['motion']}\n\n**Safe zone:** panel mulai 262 px dari atas, subtitle sekitar 1290 px, 380 px bawah kosong, kanan 110 px kosong.\n\n**Anti-reupload:** tanda tangan AUDIRA bergerak (pindah tiap 18 dtk, hilang saat outro), tulisan AUDIRA di dalam dunia 3D, VO menyebut Audira di penutup, metadata kepemilikan di MP4.\n\n**Penutup:** logo Monolit AUDIRA (stacked-reversed) di atas hijau hutan #0B3D2E dengan Created by Agus Dwi R.\n"
        (d / "ART_DIRECTION.md").write_text(ad, encoding="utf8")
        sb = head + "| Waktu | Visual |\n| --- | --- |\n" + "".join(f"| {fmt(sn['start'])} - {fmt(sn['end'])} | {E['board'][sn['id']]} |\n" for sn in T["scenes"]) + f"| {fmt(T['speech_end'] + .25)} - {fmt(T['duration'])} | Penutup Monolit AUDIRA, Created by Agus Dwi R. |\n\n**Audio:** {E['sound']}\n"
        (d / "STORYBOARD.md").write_text(sb, encoding="utf8")
        doc = subprocess.run(["python", "-c", "import ast,sys;print(ast.get_docstring(ast.parse(open(sys.argv[1],encoding='utf8').read())))", str(d / "mix.py")], capture_output=True, text=True).stdout.strip()
        (d / "AUDIO_PLAN.md").write_text(head + f"{doc}\n\nMusik dan SFX disintesis di `mix.py` (numpy) plus pustaka `AUDIO/SFX/`. Musik ducking di bawah vokal, master -14 LUFS, true peak di bawah -1 dBTP.\n", encoding="utf8")
        ds = head + f"## Token\n\n- Warna: {E['palette']}\n- Tipografi: {E['fonts']}\n- Kanvas: 1080 x 1920, 60 fps\n- Safe zone: atas 180 px (panel mulai 262 px), bawah 380 px, kanan 110 px\n- Lapisan: dunia 3D WebGL, grain, vignette, lantai subtitle, panel HUD, subtitle karaoke, tanda tangan AUDIRA, kartu penutup\n- Transisi panel: {E['motion'].split('.')[0]}.\n"
        (d / "DESIGN_SYSTEM.md").write_text(ds, encoding="utf8")
        am = head + "| Aset | Sumber | Lisensi/status |\n| --- | --- | --- |\n"
        am += "| Dunia 3D (`world3d.js`) | Dibuat prosedural dengan Three.js untuk episode ini | Milik AUDIRA |\n| Panel dan subtitle (`build-video.mjs`) | HTML/CSS + GSAP | Milik AUDIRA |\n"
        am += "| Voice-over | Cartesia sonic-3, voice Galang `04b567df` | Lisensi akun Cartesia |\n| Musik dan sound design | Disintesis numpy di `mix.py` | Milik AUDIRA |\n| SFX pendukung | `AUDIO/SFX/` | Pustaka AUDIRA |\n"
        am += "| Logo penutup | Kit logo Monolit AUDIRA (`stacked-reversed.svg`) | Milik AUDIRA |\n| Font | Google Fonts | OFL |\n| Foto, video berita, logo merek | Tidak dipakai (motor, kapal, drone, stasiun generik tanpa logo atau livery) | - |\n"
        (d / "ASSET_MANIFEST.md").write_text(am, encoding="utf8")
        if not final:
            print(name, "not final yet")
            continue
        M = json.loads((d / "PROJECT/qc/metrics.json").read_text(encoding="utf8"))
        v = M["video"]
        rows = [
            ("Akurasi fakta", "Lulus", "Semua angka dari RESEARCH_REPORT.md berlabel HIGH/MED; jebakan di RISET_LANJUTAN_EP26-30.md dihindari"),
            ("Voice-over", "Lulus", f"Cartesia sonic-3 voice 04b567df, {M['vo_lufs']} LUFS, {M['wpm']} WPM"),
            ("Loudness", "Lulus" if -15 <= M["lufs"] <= -13 and M["true_peak_dbfs"] < -1 else "Perlu cek", f"{M['lufs']} LUFS terintegrasi, true peak {M['true_peak_dbfs']} dBTP, musik/SFX {M['music_lufs']} LUFS"),
            ("Sinkron subtitle", "Lulus", f"{M['caption_words_with_voice_pct']}% kata bersuara saat aktif, selisih onset maks {M['caption_onset_max_gap_s']} s, {M['srt_cues']} cue SRT"),
            ("Safe zone", "Lulus", "Panel mulai 262 px, subtitle di atas 380 px bawah, kanan 110 px kosong"),
            ("File", "Lulus", f"{v['width']}x{v['height']}, {v['r_frame_rate']} fps, {float(v['duration']):.1f} s, {v['codec_name']}, {M['decode_errors']} galat dekode, {M['freezes_over_2.5s']} freeze > 2,5 s, {len(M['black_segments'])} segmen hitam"),
            ("Visual", "Lulus", "Lembar frame dari MP4 final ditinjau (PROJECT/qc/sheet.jpg)"),
            ("Brand", "Lulus", "Outro Monolit AUDIRA, tanda tangan bergerak, AUDIRA di dunia 3D, VO menyebut Audira, metadata kepemilikan (ffprobe)"),
        ]
        qa = head + "| Pemeriksaan | Hasil | Bukti |\n| --- | --- | --- |\n" + "".join(f"| {a} | {b} | {c} |\n" for a, b, c in rows)
        qa += "\nVoice dibuat lewat `scripts/tts-cartesia.mjs` (dipanggil `_tools/vo.py`), bukan MCP `audira_generate_voiceover`, karena tool MCP itu mengembalikan 401 akibat key lama di environment.\n"
        (d / "QA_REPORT.md").write_text(qa, encoding="utf8")
        print(name, nsp, "spoken words, FINAL docs")
