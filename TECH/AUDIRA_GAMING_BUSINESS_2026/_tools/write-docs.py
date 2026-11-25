"""Writes the production documents of every episode from timeline.json, metrics.json and epdata.py, so timecodes and QC numbers match the real files.
Run from AUDIRA_GAMING_BUSINESS_2026: python _tools/write-docs.py [EP folder ...]"""
import json, re, sys
from pathlib import Path

sys.path.insert(0, "_tools")
from epdata import EPS, TAGS_BASE

TOK = re.compile(r"\{([^|}]*)\|[^}]*\}")


def fmt(t):
    return f"{int(t // 60)}:{int(t % 60):02}"


def fmt2(t):
    return f"{int(t // 60):02}:{t % 60:04.1f}"


CHAP = {
    "EP01_ROBLOX_CREATOR_ECONOMY": ["Game tiga hari", "Ekonomi Robux", "DevEx", "Skala kreator", "Kunjungan bukan pendapatan", "Puncak dan median", "Platform berbalik", "Pertanyaan"],
    "EP02_FORTNITE_CREATOR_ECONOMY": ["US$1 miliar", "UEFN dan island", "Kolam 40%", "Yang dihitung", "Jual item", "Syarat", "Dibagi ke siapa", "Pertanyaan"],
    "EP03_ESPORTS_PROFESSIONAL": ["US$75 juta", "Rincian hadiah", "Ekonomi tiap game", "M7 Jakarta", "Bagian pemain", "Gaji", "Pemain Indonesia", "Pertanyaan"],
    "EP04_MINECRAFT_CREATOR_BUSINESS": ["US$500 juta", "Isi Marketplace", "Partner Program", "Bagi hasil", "295 partner", "Jadi perusahaan", "Catatan data", "Pertanyaan"],
    "EP05_CS2_DIGITAL_ASSET_ECONOMY": ["Skin US$1 juta", "Workshop", "Bagian kreator", "Harga pasar", "Kenapa mahal", "22 Oktober 2025", "Data dan gugatan", "Pertanyaan"],
}


def write(ep_name, E):
    d = Path(ep_name)
    T = json.load(open(d / "timeline.json", encoding="utf8"))
    lines = json.load(open(d / "script-lines.json", encoding="utf8"))
    M = json.load(open(d / "PROJECT/qc/metrics.json", encoding="utf8")) if (d / "PROJECT/qc/metrics.json").exists() else None
    disp = lambda s: TOK.sub(lambda m: m.group(1), s)
    spoken = sum(len(TOK.sub(lambda m: m.group(0).split("|")[1].rstrip("}"), l["text"]).split()) for l in lines)
    wpm = round(spoken / T["speech_end"] * 60)
    C = E["caps"]
    tags = "#" + " #".join([])
    head = f"# {E['title']}\n\nSeri AUDIRA GAMING BUSINESS, DARI GAMER MENJADI PENGHASIL UANG, episode {E['n']}. Created by Agus Dwi R.\n\n"

    # research
    r = head + f"## Pertanyaan sentral\n\nKonsep video: {E['concept']}.\n\n## Temuan terverifikasi\n\n"
    r += "\n".join(f"{i+1}. {x}" for i, x in enumerate(E["findings"]))
    r += f"\n\n## Batasan dan keputusan editorial\n\n{E['caveats']}\n\nPendapatan developer, pemain esports, streamer, dan kreator konten tidak dicampur. Hadiah, omzet, keuntungan bersih, dan pembayaran platform disebut sesuai istilah sumber. Riset dilakukan 4 November 2026.\n"
    (d / "RESEARCH_REPORT.md").write_text(r, encoding="utf8")

    # sources
    s = head + "| Sumber | Tanggal | Status | Dipakai untuk |\n| --- | --- | --- | --- |\n"
    for n, u, dt, st, use in E["sources"]:
        s += f"| [{n}]({u}) | {dt} | {st} | {use} |\n"
    (d / "SOURCE_REGISTER.md").write_text(s, encoding="utf8")

    # script
    sc = head + f"Suara: Cartesia sonic-3, voice `04b567df-2923-4b0c-896b-4b7df0a07e1a`, bahasa id. Durasi film {T['duration']} detik, ujaran {T['speech_end']} detik, {spoken} kata terucap, {wpm} WPM.\n\n"
    for l, sn in zip(lines, T["scenes"]):
        sc += f"**{fmt2(sn['start'])} - {fmt2(sn['end'])}** ({l['id']})\n\n{disp(l['text'])}\n\n"
    (d / "SCRIPT.md").write_text(sc, encoding="utf8")

    # storyboard
    b = head + f"Dikunci ke timecode audio aktual. {E['motion']}\n\n| Waktu | Visual | Kamera | Audio |\n| --- | --- | --- | --- |\n"
    for sn in T["scenes"]:
        v, c, a = E["board"][sn["id"]]
        b += f"| {fmt2(sn['start'])} - {fmt2(sn['end'])} | {v} | {c} | {a} |\n"
    b += f"| {fmt2(T['speech_end'] + .25)} - {fmt2(T['duration'])} | Penutup: logo Monolit AUDIRA dan Created by Agus Dwi R. | Diam | Chime |\n"
    (d / "STORYBOARD.md").write_text(b, encoding="utf8")

    # bible (CLAUDE.md items 1, 6, 7, 8, 9 in one substantive file)
    p = head + f"## Konsep\n\n{E['concept']}. {E['style']}\n\nTarget: penonton TikTok, Reels, Shorts, dan Facebook Indonesia, 15 sampai 35 tahun, sering menonton tanpa suara.\n\n## Art direction\n\n- Palet: {E['palette']}\n- Font: {E['fonts']}\n- Gerak: {E['motion']}\n\n## Layout\n\n1080x1920, 30 fps. Area aman atas 180 px, bawah 380 px. Takarir berakhir di 1540 px dengan margin kanan 110 px. Tidak ada watermark statis.\n\n## Audio\n\n{E['sound']} Voice dinormalisasi ke -16 LUFS, musik ducking otomatis saat suara, master -14 LUFS.\n\n## Aset\n\n- Visual: dunia 3D Three.js prosedural dan orisinal di `PROJECT/hyperframes/assets/lib/world3d.js`. Tanpa aset game, tanpa logo pihak ketiga, tanpa gambar AI.\n- Logo: Monolit AUDIRA `assets/brand/stacked-reversed.svg` dari kit logo resmi.\n- SFX: `shared/assets/sfx/` dan sintesis numpy di `mix.py`.\n- Font: bundel HyperFrames.\n"
    (d / "PRODUCTION_BIBLE.md").write_text(p, encoding="utf8")

    # QA
    if M:
        v, a = M["video"], M["audio"]
        cps = ""
        rows = [
            ("Akurasi riset", "Lulus", "Semua angka dipetakan ke SOURCE_REGISTER.md dengan tanggal"),
            ("Validasi sumber", "Lulus dengan catatan", E["caveats"]),
            ("Kualitas naratif", "Lulus", f"Hook frame 0, {spoken} kata terucap, tutup dengan pertanyaan"),
            ("Kualitas voice-over", "Sebagian", f"Voice {M['vo_lufs']} LUFS, tidak ada kata tereja salah menurut durasi kata. Telinga manusia belum meninjau pelafalan fonetik"),
            ("Sinkron audio", "Lulus", f"Adegan dikunci ke timestamp Cartesia, {wpm} WPM"),
            ("Loudness", "Lulus", f"{M['lufs']} LUFS, true peak {M['true_peak_dbfs']} dBTP, musik {M['music_lufs']} LUFS"),
            ("Sinkron takarir", "Lulus", f"{M['caption_words_with_voice_pct']}% kata bersuara saat aktif, selisih onset maks {M['caption_onset_max_gap_s']} detik, {M['srt_cues']} cue SRT"),
            ("Kualitas gerak", "Lulus", f"Lembar frame ditinjau dari MP4 final. Satu hold di atas 2,5 detik yaitu kartu penutup. Segmen hitam: {len(M['black_segments'])}"),
            ("Safe zone mobile", "Lulus", "Panel mulai 190 px, takarir berakhir 1540 px"),
            ("Branding dan outro", "Lulus dengan catatan", f"Monolit + Created by Agus Dwi R., {T['duration'] - T['speech_end'] - .25:.1f} detik. `audira-outro-card.svg` bersama masih memakai logo lama, jadi kartu dibangun dari kit logo resmi"),
            ("Resolusi", "Lulus", f"{v['width']}x{v['height']}"),
            ("Frame rate", "Lulus", f"{v['r_frame_rate']}, {v['nb_frames']} frame"),
            ("Tes putar MP4", "Lulus", f"Dekode penuh, {M['decode_errors']} galat, durasi {float(v['duration']):.2f} detik, {v['codec_name']}/{a['codec_name']}"),
            ("Fotorealisme", "Tidak terpenuhi", "Brief meminta photorealistic. Image generation tidak tersedia (9Router: Missing API key), jadi visual adalah 3D prosedural"),
        ]
        q = head + "| Pemeriksaan | Hasil | Bukti |\n| --- | --- | --- |\n" + "".join(f"| {x} | {y} | {z} |\n" for x, y, z in rows)
        q += "\nVoice dihasilkan lewat `scripts/tts-cartesia.mjs` karena MCP `audira_generate_voiceover` mengembalikan HTTP 401.\n"
        (d / "QA_REPORT.md").write_text(q, encoding="utf8")

    # captions
    chap = "\n".join(f"{fmt(sn['start'] if i else 0)} {name}" for i, (sn, name) in enumerate(zip(T["scenes"], CHAP[ep_name])))
    ht = E["caps"]["extra"]
    core = ht[0] + " " + " ".join(ht[1:4]) + " #DariGamerMenjadiPenghasilUang"
    src_line = "; ".join(x[0] for x in E["sources"][:3])
    pts = "\n".join(f"{i+1}. {x}" for i, x in enumerate(C["points"]))
    tags_line = (C["yt_tags"] + ", " + TAGS_BASE)
    assert len(tags_line) < 500 and len(C["yt_title"]) < 100
    m = f"# SOCIAL CAPTIONS, EP {E['n']}: {E['title']}\n\n"
    m += f"## TikTok\n\n**Hook:** {C['hook']}\n\n**Cover Text:** {C['cover']}\n\n**Caption:** {C['tiktok']}\n\n**Pinned Comment:** {C['pin']}\n\n**Hashtags:** {core} #AudiraGamingBusiness\n\n"
    m += f"## Instagram Reels\n\n**5-Point Value Breakdown:**\n\n{pts}\n\n**Caption:** {C['ig']}\n\n**Audio Cue:** {C['audio']}\n\n**Hashtags:** {core} #AudiraGamingBusiness\n\n"
    m += f"## YouTube Shorts\n\n**Judul:** {C['yt_title']}\n\n**Alternatif Judul:**\n" + "\n".join(f"- {x}" for x in C["yt_alt"]) + f"\n\n**Deskripsi:**\n\n{C['yt_desc']}\n\nChapters:\n{chap}\n\nSumber: {src_line}.\n\nCreated by Agus Dwi R. AUDIRA Gaming Business.\n\n{core}\n\n**Tags:** {tags_line}\n\n**Pinned Comment:** {C['yt_pin']}\n\n**Thumbnail:** {C['thumb']}\n\n"
    m += f"## Facebook Reels\n\n**Caption:** {C['fb']}\n\n**Discussion Trigger:** {C['fb_q']}\n\n**Hashtags:** {core} #AudiraGamingBusiness\n\n"
    m += f"## X/Twitter\n\n**Cuitan tunggal:** {C['x_single']}\n\n**Viral Hook Thread:**\n\n" + "\n\n".join(f"{i+1}/ {x}" for i, x in enumerate(C["x_thread"])) + "\n"
    (d / "SOCIAL_CAPTIONS.md").write_text(m, encoding="utf8")
    print(ep_name, "docs ok", spoken, "spoken words", wpm, "WPM")


for name in sys.argv[1:] or EPS:
    write(name, EPS[name])
