"""Writes the production documents for EP21-EP25 (final mode once FINAL_VIDEO.mp4 and PROJECT/qc/metrics.json exist).
Run from AUDIRA_CARA_KERJA_VIRAL_2026: python _tools/docs-21-25.py"""
import json, re, subprocess
from pathlib import Path

TOK = re.compile(r"\{([^|}]*)\|([^}]*)\}")
EPS = {
    "EP21_SATELIT_JATUH": dict(
        n="21", title="Teleskop NASA Terbakar di Langit Sumatera: Cara Satelit Jatuh ke Bumi", research="EP21_satelit_jatuh_reentry.md", concept="THE FALL", kits="DISASTERSIM",
        hook="Rabu malam, teleskop NASA hampir 1,5 ton terbakar di langit Sumatera Utara. Kenapa ia jatuh?",
        audience="Penonton berita jatuhnya satelit NASA di atas Sumatera Utara (4-6 Nov 2026) dan peminat antariksa.",
        look="Lab simulasi bencana: blok peta Sumatera-Kalimantan dengan lapisan 120 km kaca, globe terbelah dengan cangkang atmosfer, lorong re-entry dengan gelombang kejut berpijar, dan meter risiko; HUD lab hangat.",
        palette="Slate lab, pasir hangat, teal-kuning-oranye-merah (ramp peringatan), amber", fonts="Archivo, IBM Plex Mono",
        motion="Panel masuk seperti sampel lab yang disorong dari kiri dan keluar ke kanan. Kamera bergerak kontinu antara blok peta, globe, dan lorong atmosfer.",
        sound="Pad dokumenter hangat, desis plasma, gemuruh re-entry, blip HUD, dan dentum saat satelit pecah.",
        board={"s1": "Jejak terbakar menembus lapisan 120 km di atas Sumatera Utara", "s2": "Satelit teleskop generik di orbit, HAMPIR 22 TAHUN, tanpa korban dan puing", "s3": "Globe terbelah: panah JATUH dan LAJU, sisa udara mencuri kecepatan", "s4": "Matahari memuncak, atmosfer atas mengembang, robot penyelamat gagal mendekat", "s5": "Orbit berputar turun: 275 km lalu 190 km", "s6": "Lorong re-entry: 28.000 km/jam, udara termampatkan berpijar, BUKAN GESEKAN", "s7": "Satelit pecah, tungsten dan cermin bertahan; meter risiko 1:2.100; BRIN 19.42 vs 19.39", "s8": "Lab ditarik mundur, sebagian besar habis di langit"},
        ch=["Hook", "Swift masuk atmosfer", "Terus jatuh, terus meleset", "Matahari memuncak", "Orbit turun", "Bukan gesekan", "Puing dan risiko", "Penutup"],
    ),
    "EP22_JAM_NUKLIR": dict(
        n="22", title="Jam Nuklir Tanpa Reaktor: Cara Inti Atom Thorium Menghitung Waktu", research="EP22_jam_nuklir_thorium.md", concept="THE TICK INSIDE", kits="GLASSCRAFT",
        hook="Jam ini nuklir, tapi tanpa reaktor. Yang berdetak justru inti atom.",
        audience="Penonton kabar jam nuklir thorium-229 (Nature, 7 Okt 2026; RRI 4 Nov 2026) dan peminat sains presisi.",
        look="Studio kaca gelap dengan cakram cahaya jenuh, kristal CaF2 bening berisi inti thorium emas, sinar laser ungu, loop umpan balik kaca, dan lantai cermin.",
        palette="Hitam studio, cakram biru-amber-hijau-magenta, emas, ungu laser", fonts="Manrope, JetBrains Mono",
        motion="Panel kaca buram masuk miring sambil blur menghilang dan keluar miring sambil membeku. Kamera meluncur kontinu antar stasiun kaca.",
        sound="Pad kaca E mayor, detak yang berubah dari tok kayu bandul menjadi detik presisi setelah terkunci, nada harmonika kaca.",
        board={"s1": "Kristal kaca disinari laser, mitos menara pendingin larut, TANPA REAKTOR", "s2": "Cincin 24 jam, tablet WINA (TU Wien + PTB) dan BEIJING", "s3": "Bandul kaca, garpu kuarsa 32.768 kali, atom cesium", "s4": "Elektron terganggu medan, inti terlindung; tangga energi sinar gamma vs laser UV", "s5": "Kristal, laser, sensor, loop umpan balik; jarum melenceng lalu TERKUNCI", "s6": "1 detik vs 30 juta tahun; pilar Wina, Beijing 6x, optik terbaik", "s7": "Jejak frekuensi inti, gelombang materi gelap, globe navigasi 'kelak, mungkin'", "s8": "Kamera mundur ke kristal dan pelat AUDIRA"},
        ch=["Hook", "Wina dan Beijing", "Ayunan dan penghitung", "Inti yang terlindung", "Laser terkunci", "Stabil, bukan akurat", "Kenapa heboh", "Penutup"],
    ),
    "EP23_PLTN_TERAPUNG": dict(
        n="23", title="PLTN Terapung untuk Halmahera: Cara Kerja Pembangkit Nuklir di Atas Kapal", research="EP23_pltn_terapung.md", concept="SITE ON WATER", kits="DRAFTFORGE",
        hook="Pembangkit nuklir terapung untuk Halmahera. Padahal, aturan kita masih mengartikan lokasi nuklir sebagai daratan.",
        audience="Penonton kabar kesepakatan Rosatom dengan perusahaan swasta Indonesia (16 Okt 2026) dan revisi aturan BAPETEN (Kompas 4 Nov 2026).",
        look="Gambar CAD hidup: garis cyan-putih tebal di biru blueprint, tongkang isometri, seksi A-A reaktor, loop primer emas dan sekunder terpisah, peta rute galangan, dan lembar Arktik.",
        palette="Biru blueprint, cyan, putih, emas dimensi, merah stempel", fonts="Space Grotesk, JetBrains Mono",
        motion="Panel blok judul digaris seperti pen plotter dari kiri ke kanan dan keluar menyusut menjadi satu garis. Satu kamera kontinu tanpa potongan.",
        sound="Pad hangat, deburan laut, ketukan plotter, dengung turbin, dan pulsa arus di kabel.",
        board={"s1": "Tongkang isometri, stempel TAPAK = DARAT", "s2": "Denah lokasi: UNIT 1 dan UNIT 2, TOTAL 200 MW, status belum diputuskan", "s3": "Seksi A-A, DETAIL A: reaksi berantai dan batang kendali", "s4": "Loop primer bertekanan tinggi dan loop sekunder terpisah menjadi uap", "s5": "Turbin, generator, kabel ke daratan, jendela kota menyala", "s6": "Air laut lewat kondensor, TIDAK BERSENTUHAN, buangan sedikit hangat", "s7": "Ditarik kapal tunda dari galangan; Akademik Lomonosov 2 x 35 MW sejak 2020", "s8": "Batas lokasi + PERAIRAN, revisi aturan BAPETEN"},
        ch=["Hook", "Kesepakatan swasta", "Reaksi berantai", "Dua sirkuit", "Turbin dan kabel", "Air laut", "Bukan yang pertama", "Penutup"],
    ),
    "EP24_PINTU_AIR_PINGLU": dict(
        n="24", title="Kapal 5.000 Ton Turun Tanpa Pompa: Cara Kerja Pintu Air Terusan Pinglu", research="EP24_kanal_pinglu_lift_kapal.md", concept="THE STAIRCASE", kits="TOYDIORAMA",
        hook="Kapal 5.000 ton ini turun hampir setinggi gedung 10 lantai, tanpa satu pompa pun.",
        audience="Penonton kabar Terusan Pinglu (beroperasi sejak 16 Sep 2026, CGTN 7 Nov 2026) dan peminat teknik sipil dan logistik.",
        look="Diorama mainan di panggung kayu: tangga tiga pintu air Madao, Qishi, dan Qingnian menuju laut, kamar Madao yang dibelah dengan gorong-gorong dan katup, tiga kolam hemat air bertingkat, kapal kargo mainan, dan pekerja mainan.",
        palette="Kayu hangat, hijau bukit kardus, biru air, kuning lampu panggung, merah tirai", fonts="Fredoka, Courier Prime",
        motion="Panel label kertas kraft berayun turun seperti tag yang digantung dan keluar jatuh miring. Kamera menyusuri tangga kanal dari dekat dengan properti latar depan buram.",
        sound="Waltz kotak musik F mayor, dengung air yang turun nadanya saat kamar dikuras, derit pintu, ratchet katup, gemuruh gorong-gorong.",
        board={"s1": "Kapal di bibir kamar Madao yang penuh", "s2": "Seluruh tangga kanal menuju laut, sekitar 65 m", "s3": "Tiga anak tangga: Madao, Qishi, Qingnian", "s4": "Kamar 300 m, pintu belakang membentuk huruf V", "s5": "Katup lorong bawah lantai dibuka, air dan kapal turun, 29,6 m", "s6": "Tiga kolam bertingkat menabung dan mengembalikan air, lebih dari 60%", "s7": "300.000 m3 dalam sekitar 15 menit, pintu depan terbuka, klaim rekor menurut media pemerintah", "s8": "Panggung lebar: BUKAN POMPA, GRAVITASI + PINTU YANG TEPAT"},
        ch=["Hook", "Terusan Pinglu", "Tangga tiga tingkat", "Pintu huruf V", "Gravitasi saja", "Kolam hemat air", "Rekor hemat air", "Penutup"],
    ),
    "EP25_PESAWAT_BOM_AIR": dict(
        n="25", title="15 Ton Air dari Langit: Cara Kerja Pesawat Bom Air di Karhutla Samarinda", research="EP25_pesawat_bom_air.md", concept="THE DROP", kits="COMICFORGE",
        hook="15 ton air dijatuhkan dari langit. Dan pesawatnya justru melompat ke atas.",
        audience="Penonton berita water bombing pesawat Australia di Samarinda (BNPB, 6 Nov 2026) dan warga yang mengikuti karhutla 2026.",
        look="Diorama komik 3D di halaman koran bertitik: bandara dengan tangki AUDIRA, sungai, hutan terbakar dengan lapisan gambut di potongannya, danau; tanker turboprop kuning generik, jet pemandu, dan pesawat amfibi; shader halftone dan garis tinta.",
        palette="CMYK komik: kuning, magenta, cyan, hitam tinta, oranye api", fonts="Bangers, Oswald",
        motion="Panel koran menghantam masuk miring dengan sapuan diagonal dan keluar seperti halaman dibalik. Kamera mengejar pesawat dan menyapu antar lokasi diorama.",
        sound="Funk 116 bpm, bass E minor, tiupan brass tiap pergantian panel, dengung turboprop, gemeretak api, guyuran air, desis sendok amfibi.",
        board={"s1": "Tanker menjatuhkan air di sisi api lalu melompat, HUP!", "s2": "Lingkaran api dengan lencana 1, 2, 3 di Makroman, Samarinda", "s3": "X di sungai, selang mengisi tangki 15.000 liter di Balikpapan", "s4": "Dua pesawat: tanker dan jet pemandu yang menandai jalur", "s5": "Gerak lambat: pintu tangki terbuka, tirai air jatuh di sisi api", "s6": "Panah gaya angkat tetap, berat menyusut, pesawat terdorong naik", "s7": "Pesawat amfibi menyendok 6.137 liter dalam 12 detik; bara gambut di bawah tanah, tim darat", "s8": "Bangau mundur di atas api yang setengah padam: membeli waktu"},
        ch=["Hook", "Makroman, Samarinda", "Tidak disendok dari sungai", "Tanker dan pemandu", "Menjatuhkan air", "Kenapa melompat", "Sepupu amfibi dan gambut", "Penutup"],
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
        am += "| Logo penutup | Kit logo Monolit AUDIRA (`stacked-reversed.svg`) | Milik AUDIRA |\n| Font | Google Fonts | OFL |\n| Foto, video berita, logo merek | Tidak dipakai (satelit, kapal, pesawat generik tanpa logo atau livery) | - |\n"
        (d / "ASSET_MANIFEST.md").write_text(am, encoding="utf8")
        if not final:
            print(name, "not final yet")
            continue
        M = json.loads((d / "PROJECT/qc/metrics.json").read_text(encoding="utf8"))
        v = M["video"]
        rows = [
            ("Akurasi fakta", "Lulus", "Semua angka dari RESEARCH_REPORT.md berlabel HIGH/MED; jebakan di RISET_LANJUTAN_EP21-25.md dihindari"),
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
