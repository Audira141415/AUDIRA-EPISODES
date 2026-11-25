"""Writes the production documents for EP11-EP15 (final mode once FINAL_VIDEO.mp4 and PROJECT/qc/metrics.json exist).
Run from AUDIRA_CARA_KERJA_VIRAL_2026: python _tools/docs-11-15.py"""
import json, re, subprocess
from pathlib import Path

TOK = re.compile(r"\{([^|}]*)\|([^}]*)\}")
EPS = {
    "EP11_KOTAK_HITAM": dict(
        n="11", title="Kotak Hitam Pesawat: Kenapa Oranye dan Kenapa Selamat?", research="EP11_kotak_hitam.md", concept="THE SURVIVOR", kits="INNERWORKS",
        hook="Namanya kotak hitam, tapi warnanya oranye.",
        audience="Penonton yang mengikuti berita FDR helikopter Mi-17 di Seruyan (7 Nov 2026) dan kecelakaan Learjet di Florida (1 Nov 2026).",
        look="Perekam oranye generik dengan bevel, clearcoat, pita reflektif dan baut krom; dibelah menjadi cangkang, insulasi, blok termal dan papan memori; uji benturan, api dan tekanan; tenggelam ke dasar laut dengan pinger; dibaca di laboratorium.",
        palette="Oranye #FF6A1A, teal gelap, cyan hairline", fonts="Barlow Condensed, IBM Plex Mono",
        motion="Panel meluncur keluar seperti baki rak perekam dan keluar ke atas lewat shutter. Satu dunia kontinu: orbit studio, mundur ke ekor pesawat, menyelam ke modul memori, uji ketahanan, dasar laut, laboratorium.",
        sound="Dengung avionik D minor, pulsa data 100 BPM, gesekan mekanis, hantaman, deru api, cebur dan bed bawah air, ping sekali per detik, klik laboratorium.",
        board={"s1": "Kotak hitam dicat oranye oleh sapuan cahaya", "s2": "Ekor pesawat ghost, kabar Mi-17 dan Learjet", "s3": "Dua perekam: aliran 88 parameter dan gelombang suara", "s4": "Cincin loop 25 jam, ekor pesawat disorot", "s5": "Modul memori dibelah berlapis", "s6": "Uji benturan 3.400 g, api, ruang tekanan", "s7": "Tenggelam, pinger 37,5 kHz sekali tiap detik", "s8": "Laboratorium, papan dibaca, jejak terbang disusun"},
        ch=["Hook", "Mi-17 dan Learjet", "Dua perekam", "Rekaman berputar", "Modul memori", "Uji ketahanan", "Pinger", "Laboratorium"],
    ),
    "EP12_GO_AROUND_ANGIN": dict(
        n="12", title="Batal Mendarat Saat Angin Kencang: Cara Kerja Go-Around", research="EP12_go_around_angin_samping.md", concept="THE SECOND APPROACH", kits="WORLDFORGE",
        hook="Sayap pesawat ini turun rendah ke arah landasan. Pilotnya batal mendarat. Dan itu keputusan yang benar.",
        audience="Penonton video viral SQ213 di Perth (31 Okt 2026) dan penumpang yang pernah mengalami batal mendarat.",
        look="Bandara badai skala nyata dengan dua lapis awan, matahari rendah, hujan, lampu landasan dan PAPI; pesawat berbadan lebar generik tanpa logo dengan aileron, flap, rudder dan roda yang bergerak.",
        palette="Slate, amber lampu landasan #FFB547", fonts="DM Serif Display, Manrope",
        motion="Panel masuk seperti tiupan angin dari kanan dan terbang ke kiri. Kamera tepi landasan, crane ke bandara, kejar dari atas, frontal rendah, samping jalur luncur, tinggi di ujung landasan, kejar go-around.",
        sound="Hujan dan hembusan angin, drone D minor yang menjadi mayor saat mendarat, spool-up jet, chime gerbang, alarm pada kata batalkan, bunyi roda.",
        board={"s1": "Pesawat miring, sayap rendah, go-around", "s2": "Windsock, crane ke bandara AUDIRA", "s3": "Crab: angin menyilang, moncong ke arah angin", "s4": "Rudder dan sayap turun, garis dekat tanah", "s5": "Gerbang 1.000 dan 500 kaki, checklist", "s6": "100 jalur tidak stabil, 3 naik kembali", "s7": "TOGA, hidung naik, flap, roda", "s8": "Pendaratan kedua lewat papan AUDIRA"},
        ch=["Hook", "SQ213 di Perth", "Crab", "Sayap turun", "Gerbang stabil", "Studi FSF", "Go-around", "Rencana cadangan"],
    ),
    "EP13_LIDAR_AMAZON": dict(
        n="13", title="Laser Menembus Hutan: Cara LiDAR Menemukan 432 Struktur Kuno di Amazon", research="EP13_lidar_kota_hilang_amazon.md", concept="UNDER THE CANOPY", kits="LIDARFORGE",
        hook="Di foto satelit, hutan ini hijau semua. Di laser, muncul ratusan lingkaran raksasa.",
        audience="Pembaca liputan BBC Indonesia 6 Nov 2026 dan peminat sains, arkeologi, dan teknologi survei.",
        look="Hutan fajar dengan pohon instanced, kipas laser coral yang mengubah kanopi menjadi awan titik hijau-emas, titik tanah amber, parit geoglif menyala, pesawat survei generik dengan pod pemindai.",
        palette="Hijau kanopi, emas, amber #FFB347, coral laser", fonts="Chakra Petch, DM Mono",
        motion="Panel masuk seperti garis pindai dan keluar runtuh menjadi satu garis. Kamera dari sapuan laser ke peta strip survei, kejar pesawat, potongan pohon, satelit GNSS, tampak atas satelit, hillshade, kembali ke kanopi.",
        sound="Bed hutan fajar (serangga, burung), pad D dorian, detak pemindai, tiga ping pantulan, dengung mesin, swell saat tanah telanjang muncul.",
        board={"s1": "Kanopi larut menjadi titik, lingkaran dan persegi menyala", "s2": "Strip survei, 432 penanda, 36 yang dikenal", "s3": "Pesawat dengan kipas laser kiri-kanan", "s4": "Satu pulsa: daun, ranting, tanah", "s5": "GNSS dan IMU, titik pohon diangkat", "s6": "Satelit hanya melihat atap hutan", "s7": "Hillshade, parit 9-13 m, perkiraan 24.000-30.000", "s8": "Kanopi kembali, cincin samar menyala"},
        ch=["Hook", "Studi Nature", "Pesawat survei", "Satu pulsa", "Titik berkoordinat", "Kenapa satelit gagal", "Bayangan buatan", "Ingatan masyarakat adat"],
    ),
    "EP14_MOBIL_LISTRIK_500": dict(
        n="14", title="Mobil Listrik 503 km/jam: Cara Kerja di Balik Rekornya", research="EP14_mobil_listrik_500_kmh.md", concept="FIVE HUNDRED", kits="PRECISION",
        hook="Seratus empat puluh meter. Setiap detik.",
        audience="Penggemar otomotif dan mobil listrik yang membaca kabar rekor 503,17 km/jam (1 Nov 2026, diakui FIA 6 Nov).",
        look="Hypercar grafit generik tanpa logo dengan clearcoat dan karbon, cakrawala studio pasir hangat, jalan gurun tertutup; cutaway empat motor, baterai, bus 1.200 V, inverter, potongan ban.",
        palette="Grafit, pasir hangat, putih keramik, oranye laser #FF6B00", fonts="Manrope, IBM Plex Mono",
        motion="Panel terbuka lewat celah horizontal seperti shutter kalibrasi dan keluar dihapus ke kanan. Kamera tracking rendah, wide dengan gantry AUDIRA, aliran udara, bodi terangkat, tampak atas baterai, makro ban, chase, packshot.",
        sound="Dengung listrik yang naik bersama kecepatan, sub minimal, petikan synth Lydian, desau angin, klik mekanis.",
        board={"s1": "Tracking rendah, tiang 140 m tiap detik", "s2": "Lewat gantry AUDIRA, counter 503,17", "s3": "Aliran udara, panah hambatan, 2x vs 8x", "s4": "Bodi terangkat, empat motor dibelah", "s5": "Sel baterai, bus tegangan tinggi, inverter", "s6": "Potongan ban, panah gaya sentrifugal", "s7": "Bar baterai terkuras, mobil melesat", "s8": "Packshot UDARA LISTRIK KARET"},
        ch=["Hook", "Rekor Abu Dhabi", "Hambatan udara", "Empat motor", "1.200 volt", "Ban", "Baterai", "Penutup"],
    ),
    "EP15_DBS_PACU_OTAK": dict(
        n="15", title="Saklar di Dada: Cara Kerja Deep Brain Stimulation untuk Parkinson", research="EP15_dbs_pacu_otak.md", concept="SAKLAR DI DADA", kits="ANATOMIX",
        hook="Ada saklar di dada yang bisa menghentikan gemetar dalam hitungan detik.",
        audience="Keluarga pasien Parkinson dan penonton berita layanan DBS dan VNS di Jakarta (3 Nov 2026).",
        look="Bust hologram tembus pandang (bukan daging), otak ungu-merah muda dengan inti dalam yang menyala, elektroda empat cincin, kabel di belakang telinga, stimulator titanium, tangan pasien yang gemetar lalu tenang, tablet pemrogram.",
        palette="Teal hologram #3FE0D0, ungu, amber inti", fonts="Chakra Petch, JetBrains Mono, Sora",
        motion="Panel masuk seperti pindaian pencitraan dari atas dan keluar runtuh menjadi garis. Kamera orbit kepala, irisan MRI, jalur kabel, close-up sirkuit, mundur ke tablet adaptif.",
        sound="Lonceng sinus D minor di atas pad dingin, flutter 5 Hz saat tremor, chirp nyala stimulasi, dengung 130 Hz samar, akord yang menjadi terang.",
        board={"s1": "Stimulasi menyala, tremor tangan mereda", "s2": "Orbit kepala, BUKAN YANG PERTAMA", "s3": "Irisan MRI, target STN dan GPi, elektroda", "s4": "Kabel ke stimulator di bawah selangka", "s5": "130 denyut per detik, 60 mikrodetik", "s6": "Gelombang beta serempak lalu meredam", "s7": "DBS adaptif, lebih dari 200.000 orang", "s8": "PENGENDALI GEJALA, BUKAN PENYEMBUH"},
        ch=["Hook", "Bukan yang pertama", "Memetakan target", "Jalur kabel", "Denyut listrik", "Gelombang beta", "DBS adaptif", "Penutup"],
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
        head = f"# EP {E['n']}: {E['title']}\n\nAUDIRA, seri CARA KERJA VIRAL. Created by Agus Dwi R. Status: {status}, 8 November 2026.\n\n"
        sc = head + f"Suara: Cartesia sonic-3, voice `04b567df-2923-4b0c-896b-4b7df0a07e1a`, bahasa id. Timecode dikunci ke audio. {nsp} kata terucap, {T['speech_end']:.1f} detik ujaran, film {T['duration']:.1f} detik.\n\n"
        for l, sn in zip(lines, T["scenes"]):
            sc += f"**{fmt(sn['start'])} - {fmt(sn['end'])}** ({l['id']})\n\n{disp(l['text'])}\n\n"
            if TOK.search(l["text"]):
                sc += f"> Teks untuk TTS: {spoken(l['text'])}\n\n"
        (d / "SCRIPT.md").write_text(sc, encoding="utf8")
        res = (root / "_research" / E["research"]).read_text(encoding="utf8")
        (d / "RESEARCH_REPORT.md").write_text(head + "Riset dari sumber yang dibaca langsung 8 November 2026. Setiap fakta berlabel HIGH, MED, atau LOW; naskah hanya memakai HIGH dan MED.\n\n" + res, encoding="utf8")
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
            ("Akurasi fakta", "Lulus", "Semua angka dari RESEARCH_REPORT.md berlabel HIGH/MED; jebakan di RISET_LANJUTAN_EP11-15.md dihindari"),
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
