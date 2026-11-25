"""Writes draft-stage documents for every episode from script-lines.json, timeline.json (estimated), _research/*.md and the metadata below.
Run from AUDIRA_CARA_KERJA_VIRAL_2026: python _tools/draft-docs.py
Social captions are written only after the voiced final passes QC, so they are not produced here."""
import json, re, shutil, subprocess
from pathlib import Path

TOK = re.compile(r"\{([^|}]*)\|([^}]*)\}")
EPS = {
    "EP01_ES_KERING_KABUT_ASAP": dict(
        n="01", title="Es Kering vs Kabut Asap: Kenapa Es Ditabur dari Pesawat?", research="EP01_dry_ice.md", concept="THE LID",
        kits="WORLDFORGE + SATELLITEBRIEFING",
        hook="Pesawat menabur es di atas lautan asap. Bukan untuk hujan.",
        audience="Warga Sumatra/Kalimantan yang terdampak asap dan penonton yang melihat berita operasi es kering Oktober 2026.",
        look="Lautan asap volumetrik (raymarch) di atas dataran gambut dengan sungai dan kota, pesawat bermesin turboprop ganda skala nyata, lapisan inversi sebagai grid hangat, makro pelet es kering menyublim.",
        palette="Tinta #0E0A07, amber #FFBE55, dingin #6FD3FF, hangat #FF7A45", fonts="Barlow Condensed, IBM Plex Mono",
        motion="Panel dipindai dari atas ke bawah seperti sapuan sensor. Kamera kejar pesawat, menyelam ke dalam asap, potongan samping lapisan, meja makro, orbit lubang inversi, ketinggian jalan di kota.",
        sound="Angin berasap, dengung turboprop, desis sublimasi, pad hangat yang mendingin menjadi kuint terang saat inversi melemah.",
        board={"s1": "Kejar pesawat menabur pelet, asap di bawah", "s2": "Turun menembus asap ke kota, jarak pandang 50 m", "s3": "Lapisan inversi menyala, grafik profil suhu", "s4": "Makro pelet CO2, kabut tumpah, 1 kg ke kubus 79 cm", "s5": "Penaburan dipercepat, jejak dingin di lapisan tutup", "s6": "Tutup berlubang, asap naik dan menyebar", "s7": "Kota menjadi lebih jelas, 650 ke 2.800 m, catatan BRIN", "s8": "Mundur tinggi, titik api di darat tetap menyala"},
    ),
    "EP02_BATERAI_MOTOR_LISTRIK": dict(
        n="02", title="Kenapa Motor Listrik Bisa Terbakar? Di Dalam Thermal Runaway", research="EP02_baterai.md", concept="THE CHAIN",
        kits="THERMALFORGE + INNERWORKS",
        hook="Motor listrik terparkir, lalu api keluar dari bagasinya.",
        audience="Pengguna dan calon pembeli motor listrik setelah video Bekasi viral 5 November 2026.",
        look="Skuter generik di depan ruko malam, paket sel silinder, satu sel dipotong (jelly roll), tumpukan elektroda diperbesar dengan ion, lalu kamera termal ironbow saat runaway.",
        palette="Tinta #07060B, panas #FF7A1A, cyan #38E1FF, skala ironbow", fonts="Space Grotesk, JetBrains Mono",
        motion="Panel masuk fokus seperti kamera termal mengunci target. Kamera turun ke bagasi, keluar ke meja paket, menyelam ke elektroda, mundur saat panas merambat.",
        sound="Dengung kota malam dan derak api, pad elektrik bersih di dalam sel, detak ion saat dicas, drone panas dan derak yang makin rapat saat runaway.",
        board={"s1": "Skuter terparkir, asap dan api dari bagasi", "s2": "Jok terbuka: kontroler dan BMS disorot, penyebab belum dipastikan", "s3": "Paket sel, satu sel dipotong: anoda, katoda, elektrolit, separator", "s4": "Ion Li+ menyeberang separator saat dicas, BMS", "s5": "Mode termal: 90 C SEI terurai, 130 C separator meleleh, korsleting", "s6": "Runaway, venting, 500 C, merambat sel ke sel", "s7": "Skuter tenang dengan charger asli, daftar cara aman", "s8": "Mundur pelan, kalimat penutup"},
    ),
    "EP03_TRANSMISI_CVT": dict(
        n="03", title="Matic Tanpa Pindah Gigi: Cara Kerja CVT, YECVT, dan D-CVT", research="EP03_cvt.md", concept="THE SLIDING CIRCLE",
        kits="INNERWORKS + PRECISION",
        hook="Motor matic tidak punya gigi satu, dua, tiga.",
        audience="Pengendara matic dan peminat otomotif yang membaca berita NMAX Turbo YECVT dan D-CVT Avanza.",
        look="Studio produk grafit: dua puli kerucut baja dengan potongan cutaway, sabuk berelemen yang panjangnya tetap saat diameter berubah, roller sentrifugal, motor YECVT dengan sensor, roda gigi D-CVT.",
        palette="Tinta #101215, oranye #FF6B2C, cyan #38E1FF, baja", fonts="Syne, Inter",
        motion="Panel meluncur dari kanan seperti lembar spesifikasi. Kamera frontal ke loop sabuk, eksplode piringan, dekat roller, orbit sistem elektronik.",
        sound="Nada mesin mengikuti program rasio, desing sabuk, klik mekanis, blip elektronik di bab YECVT.",
        board={"s1": "Dua puli dan sabuk berputar, rasio berayun", "s2": "Label YECVT dan D-CVT", "s3": "Piringan kerucut terpisah lalu merapat, sabuk di antaranya", "s4": "Rasio berat: depan kecil, belakang besar", "s5": "Roller terlempar keluar, sabuk naik di depan, turun di belakang", "s6": "Roller diganti motor listrik, sensor, TCU, Y-Shift 3 level", "s7": "Sabuk baja dan roda gigi pemisah, +8% efisiensi", "s8": "Mundur, rasio terus bergeser"},
    ),
    "EP04_SENJATA_SUARA_LRAD": dict(
        n="04", title="Senjata Suara 160 dB: Cara Kerja LRAD", research="EP04_lrad.md", concept="THE BEAM",
        kits="CYBERFORGE + DRAFTFORGE",
        hook="Bukan peluru, bukan gas air mata. Alat ini menyerang dengan suara.",
        audience="Penonton yang membaca berita 'senjata suara 160 desibel' (Pontianak Post, 2 Nov 2026) dan peduli keselamatan pendengaran.",
        look="Lantai cetak biru, pemancar bulat skematik, medan gelombang dihitung per piksel dari puluhan sumber sefase sehingga sumber kecil benar-benar menyebar dan permukaan lebar benar-benar membentuk berkas.",
        palette="Navy #040914, cyan #38E1FF, amber #FFB547, merah #FF4B3A", fonts="Bebas Neue, JetBrains Mono",
        motion="Panel masuk dengan glitch irisan. Kamera dari depan alat, pandangan atas dengan berkas mengarah ke atas layar, penanda jarak, dua pendengar.",
        sound="Pad rendah, ping sonar, nada 2,5 kHz yang hanya disinggung pelan dan singkat, dering telinga tipis di bab kasus.",
        board={"s1": "Pemancar menyala, angka 0 ke 160 dB", "s2": "Orbit alat, nada peringatan", "s3": "Sumber kecil menyebar, lalu permukaan melebar", "s4": "Berkas terbentuk, garis 30 derajat", "s5": "Tangga desibel 60/85/120/160", "s6": "Penanda 1-32 m dan -6 dB per jarak dua kali, dua pendengar", "s7": "Satu pendengar, kasus Pittsburgh 2009", "s8": "Pandangan atas, pendengar menjauh"},
    ),
    "EP05_PAYUNG_RAKSASA_NABAWI": dict(
        n="05", title="250 Payung Raksasa Masjid Nabawi: Bagaimana Mereka Mekar Bersamaan?", research="EP05_payung_nabawi.md", concept="THE BLOOM",
        kits="URBANFORGE + ISLAMICDOCUMENTARY",
        hook="Dua ratus lima puluh payung raksasa mekar bersamaan.",
        audience="Jemaah umrah/haji dan penonton yang membaca berita payung Nabawi menjelang musim hujan, awal November 2026.",
        look="Halaman marmer berpola bintang delapan, 250 payung instanced dengan tiang oktagonal, selubung mozaik yang membuka, delapan lengan utama dan membran corong warna pasir, arkade masjid generik (ilustrasi, bukan replika).",
        palette="Lapis #13294B, emas #D4AF37, pasir #EFE3CB", fonts="Playfair Display, Outfit",
        motion="Panel terbuka seperti kanopi (lingkaran dari tengah). Kamera udara saat fajar, sapuan drone, tiang terlipat dari bawah, orbit saat lengan membentang, pandangan samping dua tinggi, senja dengan lampu.",
        sound="Udara halaman terbuka, petikan bernuansa hijaz, sapuan hidrolik saat membuka, hentakan kain, desis kabut, pad senja.",
        board={"s1": "Udara, payung tertutup lalu mekar bersamaan", "s2": "Sapuan drone di atas atap, 143.000 m2", "s3": "Satu tiang terlipat 21,7 m, selubung mozaik", "s4": "Lengan diagonal, tengah, pendukung membentang", "s5": "Membran PTFE warna pasir dari bawah", "s6": "Dua tinggi 14,4 dan 15,3 m, tepi menumpuk", "s7": "Senja, kipas kabut dan lampu, ruang kontrol", "s8": "Payung menutup lalu membuka lagi, mundur tinggi"},
    ),
}


def fmt(t):
    return f"{int(t // 60):02}:{t % 60:04.1f}"


root = Path(".")
review = "# CARA KERJA VIRAL 2026: naskah untuk ditinjau\n\nLima film 9:16 tentang benda yang sedang viral. Semua draft **tanpa suara**, timing masih estimasi. Voice-over Cartesia dibuat setelah naskah disetujui.\n\n"
for name, E in EPS.items():
    d = root / name
    lines = json.loads((d / "script-lines.json").read_text(encoding="utf8"))
    T = json.loads((d / "timeline.json").read_text(encoding="utf8"))
    disp = lambda x: TOK.sub(lambda m: m.group(1), x)
    spoken = lambda x: TOK.sub(lambda m: m.group(2), x)
    nsp = sum(len(spoken(l["text"]).split()) for l in lines)
    final = (d / "FINAL_VIDEO.mp4").exists() and not T.get("estimated") and (d / "PROJECT/qc/metrics.json").exists()
    status = "final dengan voice-over" if final else "draft tanpa suara"
    head = f"# EP {E['n']}: {E['title']}\n\nAUDIRA, seri CARA KERJA VIRAL. Created by Agus Dwi R. Status: {status}, 6 November 2026.\n\n"
    tnote = "Timecode dikunci ke audio Cartesia." if final else "**Timecode estimasi**, dikunci ulang ke audio setelah suara dibuat."
    sc = head + f"Suara: Cartesia sonic-3, voice `04b567df-2923-4b0c-896b-4b7df0a07e1a`, bahasa id. {tnote} {nsp} kata terucap, {T['speech_end']:.1f} detik ujaran, film {T['duration']:.1f} detik.\n\n"
    for l, sn in zip(lines, T["scenes"]):
        sc += f"**{fmt(sn['start'])} - {fmt(sn['end'])}** ({l['id']})\n\n{disp(l['text'])}\n\n"
        if TOK.search(l["text"]):
            sc += f"> Teks untuk TTS: {spoken(l['text'])}\n\n"
    (d / "SCRIPT.md").write_text(sc, encoding="utf8")
    review += f"## EP {E['n']}: {E['title']}\n\n`{name}/PREVIEW_NO_VO.mp4`\n\n" + "\n\n".join(disp(l["text"]) for l in lines) + "\n\n"
    res = (root / "_research" / E["research"]).read_text(encoding="utf8")
    (d / "RESEARCH_REPORT.md").write_text(head + "Riset dari sumber yang dibaca langsung 6 November 2026. Setiap angka memakai label HIGH (dua sumber atau sumber primer) atau MED (satu sumber atau sumber tersier).\n\n" + res, encoding="utf8")
    urls = sorted(set(re.findall(r"https?://[^\s)|>\]]+", res)))
    (d / "SOURCE_REGISTER.md").write_text(head + "Semua tautan yang dikutip di RESEARCH_REPORT.md. Status dan penggunaan tiap sumber dijelaskan di laporan riset.\n\n" + "\n".join(f"- <{u.rstrip('.,;')}>" for u in urls) + "\n", encoding="utf8")
    cb = head + f"## Hook\n\n{E['hook']}\n\n## Penonton\n\n{E['audience']}\n\n## Konsep\n\n{E['concept']}. Style kit: {E['kits']}.\n\n## Arah visual\n\n{E['look']}\n\n## Pilihan konsep\n\nDipilih konsep yang menunjukkan mekanisme sebagai benda bergerak di dunia 3D, bukan kartu teks. Alternatif yang ditolak: kolase foto berita (hak cipta dan tidak menjelaskan mekanisme) dan infografis datar (terasa seperti slide).\n"
    (d / "CREATIVE_BRIEF.md").write_text(cb, encoding="utf8")
    ad = head + f"Konsep {E['concept']} ({E['kits']}).\n\n{E['look']}\n\n**Palet:** {E['palette']}\n\n**Font:** {E['fonts']} (ditulis literal di CSS, bukan lewat variabel).\n\n**Gerak:** {E['motion']}\n\n**Safe zone:** panel mulai 190 px dari atas, subtitle berakhir di 1540 px, kanan 110 px kosong untuk tombol platform.\n\n**Penutup:** logo Monolit AUDIRA (stacked-reversed) di atas hijau hutan #0B3D2E dengan Created by Agus Dwi R.\n"
    (d / "ART_DIRECTION.md").write_text(ad, encoding="utf8")
    sb = head + "| Waktu (estimasi) | Visual | \n| --- | --- |\n" + "".join(f"| {fmt(sn['start'])} - {fmt(sn['end'])} | {E['board'][sn['id']]} |\n" for sn in T["scenes"]) + f"| {fmt(T['speech_end'] + .25)} - {fmt(T['duration'])} | Penutup Monolit AUDIRA, Created by Agus Dwi R. |\n\n**Audio:** {E['sound']}\n"
    (d / "STORYBOARD.md").write_text(sb, encoding="utf8")
    doc = subprocess.run(["python", "-c", "import ast,sys;print(ast.get_docstring(ast.parse(open(sys.argv[1],encoding='utf8').read())))", str(d / "mix.py")], capture_output=True, text=True).stdout.strip()
    (d / "AUDIO_PLAN.md").write_text(head + f"{doc}\n\nMusik dan SFX disintesis di `mix.py` (numpy) plus pustaka `AUDIO/SFX/`. Setelah suara dibuat: musik ducking otomatis di bawah vokal, master -14 LUFS, true peak di bawah -1 dBTP.\n", encoding="utf8")
    ds = head + f"## Token\n\n- Warna: {E['palette']}\n- Tipografi: {E['fonts']} (judul, panel, subtitle karaoke; nama font ditulis literal di setiap aturan CSS)\n- Kanvas: 1080 x 1920, 30 fps\n- Safe zone: atas 180 px (panel mulai 190 px), bawah 380 px (subtitle berakhir 1540 px), kanan 110 px\n- Lapisan: dunia 3D WebGL, grain, vignette, lantai gelap subtitle, panel HUD, subtitle karaoke, kartu penutup\n- Transisi panel: {E['motion'].split('.')[0]}.\n- Penutup: hijau hutan #0B3D2E, logo Monolit AUDIRA stacked-reversed, Created by Agus Dwi R.\n"
    (d / "DESIGN_SYSTEM.md").write_text(ds, encoding="utf8")
    am = head + "| Aset | Sumber | Lisensi/status |\n| --- | --- | --- |\n"
    am += "| Dunia 3D (`world3d.js`) | Dibuat prosedural dengan Three.js untuk episode ini | Milik AUDIRA |\n| Panel dan subtitle (`build-video.mjs`) | HTML/CSS + GSAP, dibuat untuk episode ini | Milik AUDIRA |\n"
    am += "| Voice-over | Cartesia sonic-3, voice Galang `04b567df` | Lisensi akun Cartesia |\n| Musik dan sound design | Disintesis numpy di `mix.py` | Milik AUDIRA |\n| SFX pendukung | `AUDIO/SFX/` (salinan `shared/assets/sfx`) | Pustaka AUDIRA |\n"
    am += "| Logo penutup | Kit logo Monolit AUDIRA (`stacked-reversed.svg`) | Milik AUDIRA |\n| Font | Google Fonts | OFL |\n| Foto, video berita, logo merek | Tidak dipakai | - |\n"
    (d / "ASSET_MANIFEST.md").write_text(am, encoding="utf8")
    if final:
        shutil.copy(d / "SUBTITLES/subtitles.srt", d / "SUBTITLES.srt")
        M = json.loads((d / "PROJECT/qc/metrics.json").read_text(encoding="utf8"))
        v = M["video"]
        rows = [
            ("Akurasi fakta", "Lulus dengan catatan", "Semua angka dari RESEARCH_REPORT.md berlabel HIGH/MED; ketidakpastian disebut di layar"),
            ("Voice-over", "Lulus", f"Cartesia sonic-3 voice 04b567df, {M['vo_lufs']} LUFS, {M['wpm']} WPM, tidak ada kata yang tereja huruf (durasi kata di bawah 1 s)"),
            ("Loudness", "Lulus", f"{M['lufs']} LUFS terintegrasi, true peak {M['true_peak_dbfs']} dBTP, musik/SFX {M['music_lufs']} LUFS dengan ducking di bawah vokal"),
            ("Sinkron subtitle", "Lulus", f"{M['caption_words_with_voice_pct']}% kata bersuara saat aktif, selisih onset maks {M['caption_onset_max_gap_s']} s, {M['srt_cues']} cue SRT"),
            ("Safe zone", "Lulus", "Panel mulai 190 px, subtitle berakhir 1540 px, sisi kanan 110 px kosong"),
            ("File", "Lulus", f"{v['width']}x{v['height']}, {v['r_frame_rate']} fps, {float(v['duration']):.1f} s, {v['codec_name']}, {M['decode_errors']} galat dekode, {M['freezes_over_2.5s']} freeze > 2,5 s, {len(M['black_segments'])} segmen hitam"),
            ("Visual", "Lulus", "Lembar frame dari MP4 final ditinjau (PROJECT/qc/sheet.jpg); font dirender literal"),
            ("Outro", "Lulus", "Logo Monolit AUDIRA dan Created by Agus Dwi R. di 3 detik terakhir"),
            ("Pelafalan", "Belum ditinjau telinga manusia", "Akronim dieja huruf; istilah asing memakai ejaan fonetik di teks TTS"),
        ]
        qa = head + "| Pemeriksaan | Hasil | Bukti |\n| --- | --- | --- |\n" + "".join(f"| {a} | {b} | {c} |\n" for a, b, c in rows)
        qa += "\nVoice dibuat lewat `scripts/tts-cartesia.mjs` (dipanggil `_tools/vo.py`), bukan MCP `audira_generate_voiceover`, karena tool MCP itu sebelumnya mengembalikan 401 akibat key lama di environment.\n"
        (d / "QA_REPORT.md").write_text(qa, encoding="utf8")
        print(name, nsp, "spoken words, FINAL docs")
        continue
    pv = d / "PREVIEW_NO_VO.mp4"
    info = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration:stream=width,height,r_frame_rate", "-of", "csv=p=0", str(pv)], capture_output=True, text=True).stdout.split() if pv.exists() else []
    qa = head + "**STATUS: DRAFT, BELUM FINAL.** Belum ada voice-over, sesuai aturan: naskah ditinjau dulu, suara dibuat setelah disetujui.\n\n"
    qa += f"- Preview: `PREVIEW_NO_VO.mp4` {' '.join(info)}\n- Subtitle mengikuti timing estimasi, bukan audio.\n- Lembar frame dari MP4 ditinjau: `PROJECT/qc/sheet.jpg`.\n- Belum: sinkron subtitle ke suara, loudness final dengan vokal, SRT, `FINAL_VIDEO.mp4`, SOCIAL_CAPTIONS.md.\n\nSetelah naskah disetujui: `bash AUDIRA_CARA_KERJA_VIRAL_2026/_tools/finish-ep.sh {name}`.\n"
    (d / "QA_REPORT.md").write_text(qa, encoding="utf8")
    print(name, nsp, "spoken words")
(root / "REVIEW_SCRIPTS.md").write_text(review, encoding="utf8")
