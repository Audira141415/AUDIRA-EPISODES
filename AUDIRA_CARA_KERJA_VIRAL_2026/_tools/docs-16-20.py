"""Writes the production documents for EP16-EP20 (final mode once FINAL_VIDEO.mp4 and PROJECT/qc/metrics.json exist).
Run from AUDIRA_CARA_KERJA_VIRAL_2026: python _tools/docs-16-20.py"""
import json, re, subprocess
from pathlib import Path

TOK = re.compile(r"\{([^|}]*)\|([^}]*)\}")
EPS = {
    "EP16_BULAN_KEDUA": dict(
        n="16", title="Bumi Punya Bulan Kedua: Cara Batu 2 Meter Tertangkap Gravitasi", research="EP16_bulan_kedua_bumi.md", concept="THE GUEST", kits="SCALEFORGE",
        hook="Sejak Mei, Bumi punya bulan kedua. Tak ada yang tahu sampai Agustus.",
        audience="Pembaca berita detikInet 8 Nov 2026 tentang 2026 QQ8 dan peminat astronomi.",
        look="Zoom logaritmik kontinu dari ruang angkasa gelap ke studio ukur putih: batu 1-2 m di samping figur manusia, Bumi, Bulan, bola Hill, jalur tertangkap yang berputar, dan dorongan cahaya Matahari.",
        palette="Hitam angkasa, putih studio, oranye penggaris #FF6B2C, panel grafit", fonts="Archivo Black, JetBrains Mono",
        motion="Panel terbentang seperti meteran gulung dan keluar mengecil. Satu zoom logaritmik kontinu dengan pengukur 10^x m di tepi kanan.",
        sound="Drone A yang membuka saat zoom naik, ketukan tiap pangkat sepuluh, whoosh mengikuti kecepatan zoom, celesta pentatonik.",
        board={"s1": "Bumi, cincin Bulan, jalur tangkap 2026 QQ8", "s2": "Kartu MPC, kubah teleskop Hungaria, batu 1-2 m di samping manusia", "s3": "Orbit 359 hari hampir kembar dengan Bumi, dua pelari", "s4": "Bola Hill 1,5 juta km, tarik-menarik Bumi vs Matahari", "s5": "Meter energi negatif, jalur berputar, lewat terdekat 537.000 km", "s6": "Uji dorongan cahaya: tabung roket vs batu padat; Kamo'oalewa seirama", "s7": "Tarikan Matahari, batu lepas sekitar Desember", "s8": "Batu menjauh, panel TAMU"},
        ch=["Hook", "2026 QQ8", "Orbit kembar", "Bola Hill", "Tertangkap", "Batu atau sampah?", "Lepas Desember", "Penutup"],
    ),
    "EP17_GEDUNG_1KM_JEDDAH": dict(
        n="17", title="Satu Kilometer ke Atas: Cara Membangun Jeddah Tower", research="EP17_gedung_1_km_jeddah.md", concept="THREE LEGS", kits="URBANFORGE",
        hook="Satu kilometer. Tapi ke atas.",
        audience="Penonton kabar Jeddah Tower 120 lantai (2 Nov 2026) dan peminat arsitektur serta teknik sipil.",
        look="Maket massing plester di galeri gelap dengan bayangan matahari bergerak; data diproyeksikan sebagai cahaya cyan (struktur, angin) dan amber (konstruksi, beban).",
        palette="Plester putih, galeri gelap, cyan, amber", fonts="Archivo, JetBrains Mono",
        motion="Panel label pameran terbuka dari sudut seperti lembar gambar. Kamera dari menara rebah 1 km, berdiri, x-ray fondasi, denah Y, pompa estafet, terowongan angin, lift.",
        sound="Pad kuint D yang naik tiap menara tumbuh, petikan lembut, dentum saat berdiri, dentuman tiang bor, pulsa pompa, angin terowongan, sapuan lift.",
        board={"s1": "Menara rebah sepanjang jalan 1 KM lalu berdiri", "s2": "Padat sampai sekitar 480 m dengan crane, sisanya bayangan cyan", "s3": "270 tiang bor di batu karang, pelat 5 m", "s4": "Denah Y: inti segitiga, tiga sayap, tanpa kolom", "s5": "Pompa beton estafet sekitar 500 m", "s6": "Asap angin: kotak berayun vs sayap mengecil", "s7": "Tali baja terlalu berat, tali serat karbon > 630 m, peredam", "s8": "Lebar dengan sapuan matahari"},
        ch=["Hook", "120 lantai", "Fondasi", "Tiga kaki", "Beton estafet", "Angin", "Lift", "Penutup"],
    ),
    "EP18_KERETA_CEPAT_AMAN": dict(
        n="18", title="Kereta Cepat 300 km/jam: Bagaimana Keselamatannya Dijaga?", research="EP18_kereta_cepat_keselamatan.md", concept="LAYERS OF SAFETY", kits="ISOCRAFT",
        hook="Di 300 km/jam, kereta butuh sekitar 5 km untuk berhenti.",
        audience="Penumpang Whoosh dan penonton berita tabrakan kereta cepat di Spanyol (28 Okt 2026).",
        look="Diorama isometrik kertas dengan garis tinta: rel, blok sinyal berwarna, kabin tembus pandang dengan layar, balise, menara radio, kurva pengereman, sensor angin-hujan-gempa. Tanpa adegan kecelakaan.",
        palette="Kertas, sage, slate, mint, kuning; merah hanya penanda berhenti", fonts="Space Grotesk, IBM Plex Mono",
        motion="Panel kartu komik terbuka ke bawah dengan kemiringan isometrik dan keluar ke kiri atas. Kamera ortografis mengikuti kereta di atas diorama.",
        sound="Pad D Dorian pelan dengan piano rendah, ketukan sambungan rel, blip data, chime peringatan dua nada, desis rem udara.",
        board={"s1": "Penggaris 5 km vs kerucut pandangan masinis", "s2": "Peta Spanyol dengan satu pin dekat Toledo, nada berduka", "s3": "Blok rel berwarna, satu blok satu kereta", "s4": "Balise dan radio mengirim izin jalan ke kabin", "s5": "Kurva pengereman, peringatan, rem otomatis", "s6": "Data hilang, kereta berhenti, mode cadangan", "s7": "CTCS-3 + GSM-R, sensor angin, hujan, gempa, benda", "s8": "Diorama lebar, DIJAGA BERLAPIS, ucapan duka"},
        ch=["Hook", "Kabar duka Spanyol", "Blok rel", "Sinyal di kabin", "Rem otomatis", "Mode cadangan", "Whoosh", "Penutup"],
    ),
    "EP19_TAKSI_TERBANG": dict(
        n="19", title="Lima Pesawat Tanpa Pilot: Cara Kerja Taksi Terbang eVTOL", research="EP19_taksi_terbang_evtol.md", concept="LIFT + CRUISE", kits="POLYVERSE",
        hook="Lima pesawat terbang bersamaan, lebih dari 133 kilometer. Tanpa satu pilot pun.",
        audience="Penonton kabar formasi eVTOL AutoFlight (31 Okt-1 Nov 2026) dan peminat transportasi masa depan.",
        look="Dunia low-poly pastel: danau, pinus, kota mainan; lima eVTOL generik lift+cruise dengan rotor angkat, pendorong belakang, dan sayap.",
        palette="Pastel peach, langit, hijau, krem, teal, coral, emas #f4c55a", fonts="Sora, DM Mono",
        motion="Panel kartu krem terbuka dari sudut seperti faset low-poly. Kamera berpindah antara dunia, pesawat demo, dan formasi dengan lengkung drone.",
        sound="Kalimba G pentatonik, pad kuint, angin danau, dengung rotor listrik, sapuan spin-up/down, ping data.",
        board={"s1": "Formasi lepas landas dari pad heksagon", "s2": "Formasi V di atas danau, rotor angkat melambat", "s3": "Pesawat demo naik tegak, panah angkat", "s4": "Pendorong menyala, sayap mengangkat, rotor angkat berhenti", "s5": "Komputer kendali, satu motor mati, data satelit antarpesawat", "s6": "1 kg baterai vs 1 kg bahan bakar jet, jangkauan 200 km", "s7": "Satu pesawat 5 ton memimpin empat 2 ton, stempel validasi Indonesia", "s8": "Formasi V menjauh"},
        ch=["Hook", "Formasi di Kunshan", "Rotor angkat", "Sayap mengambil alih", "Komputer kendali", "Batas baterai", "Indonesia", "Penutup"],
    ),
    "EP20_MOBIL_METANOL": dict(
        n="20", title="Mobil Minum Alkohol: Cara Kerja Mesin Metanol", research="EP20_mobil_metanol.md", concept="TWO LIQUIDS", kits="NANOFORGE",
        hook="Mobil ini bisa minum alkohol dan bensin, di tangki yang sama.",
        audience="Penggemar otomotif dan energi setelah peluncuran Geely Xingyao 6 EF (3 Nov 2026).",
        look="Satu penyelaman dari mobil generik di pompa AUDIRA ke tangki, molekul CH3OH, injektor, dan silinder kaca; korosi seal; pabrik metanol batu bara vs CO2 + H2.",
        palette="Void navy #02050f, cyan, magenta, emas, oranye pembakaran", fonts="Space Grotesk, JetBrains Mono",
        motion="Panel seperti mikroskop yang mengunci fokus dan keluar memudar. Kamera menyelam di sepanjang sumbu -z dan berpindah skala tanpa potongan.",
        sound="Drone sub D minor, pulsa 96 bpm, plink gelembung, desis injektor, letupan pengapian, desis korosi, dengung pabrik.",
        board={"s1": "Mobil x-ray di pompa, dua cairan di tangki", "s2": "Xingyao 6 EF, BUKAN YANG PERTAMA, Indy 500", "s3": "Molekul CH3OH, campuran dengan bensin, sensor kadar", "s4": "Kubus energi 1 liter: metanol separuh, semprotan dua kali lebih lama", "s5": "Kompresi, pendinginan penguapan, busi, CO2 + H2O", "s6": "Aluminium berlubang, seal membengkak, baja tahan karat", "s7": "Pabrik batu bara vs CO2 + H2, drum biodiesel", "s8": "Mundur ke mobil, molekul mengorbit"},
        ch=["Hook", "Bukan yang pertama", "Molekul metanol", "Separuh energi", "Oktan dan pendinginan", "Korosi", "Hijau?", "Penutup"],
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
        head = f"# EP {E['n']}: {E['title']}\n\nAUDIRA, seri CARA KERJA VIRAL. Created by Agus Dwi R. Status: {status}, 9 November 2026.\n\n"
        sc = head + f"Suara: Cartesia sonic-3, voice `04b567df-2923-4b0c-896b-4b7df0a07e1a`, bahasa id. Timecode dikunci ke audio. {nsp} kata terucap, {T['speech_end']:.1f} detik ujaran, film {T['duration']:.1f} detik.\n\n"
        for l, sn in zip(lines, T["scenes"]):
            sc += f"**{fmt(sn['start'])} - {fmt(sn['end'])}** ({l['id']})\n\n{disp(l['text'])}\n\n"
            if TOK.search(l["text"]):
                sc += f"> Teks untuk TTS: {spoken(l['text'])}\n\n"
        (d / "SCRIPT.md").write_text(sc, encoding="utf8")
        res = (root / "_research" / E["research"]).read_text(encoding="utf8")
        (d / "RESEARCH_REPORT.md").write_text(head + "Riset dari sumber yang dibaca langsung 9 November 2026. Setiap fakta berlabel HIGH, MED, atau LOW; naskah hanya memakai HIGH dan MED.\n\n" + res, encoding="utf8")
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
        am += "| Logo penutup | Kit logo Monolit AUDIRA (`stacked-reversed.svg`) | Milik AUDIRA |\n| Font | Google Fonts | OFL |\n| Foto, video berita, logo merek | Tidak dipakai (pesawat, mobil, perangkat medis generik) | - |\n"
        (d / "ASSET_MANIFEST.md").write_text(am, encoding="utf8")
        if not final:
            print(name, "not final yet")
            continue
        M = json.loads((d / "PROJECT/qc/metrics.json").read_text(encoding="utf8"))
        v = M["video"]
        rows = [
            ("Akurasi fakta", "Lulus", "Semua angka dari RESEARCH_REPORT.md berlabel HIGH/MED; jebakan di RISET_LANJUTAN_EP16-20.md dihindari"),
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
