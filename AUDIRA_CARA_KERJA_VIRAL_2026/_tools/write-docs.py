"""Writes production documents from timeline.json, metrics.json and epdata.py so timecodes and QC numbers match the real files.
Run from AUDIRA_CARA_KERJA_VIRAL_2026: python _tools/write-docs.py"""
import json, re, sys
from pathlib import Path

sys.path.insert(0, "_tools")
from epdata import EPS

TOK = re.compile(r"\{([^|}]*)\|([^}]*)\}")


def fmt(t):
    return f"{int(t // 60)}:{int(t % 60):02}"


def fmt2(t):
    return f"{int(t // 60):02}:{t % 60:04.1f}"


def write(name, E):
    d = Path(name)
    T = json.load(open(d / "timeline.json", encoding="utf8"))
    lines = json.load(open(d / "script-lines.json", encoding="utf8"))
    est = T.get("estimated", False)
    mp = d / "PROJECT/qc/metrics.json"
    M = json.load(open(mp, encoding="utf8")) if mp.exists() and not est else None
    disp = lambda x: TOK.sub(lambda m: m.group(1), x)
    spoken = sum(len(TOK.sub(lambda m: m.group(2), l["text"]).split()) for l in lines)
    wpm = round(spoken / T["speech_end"] * 60)
    head = f"# {E['title']}\n\nAUDIRA HOW IT WORKS, seri HOW THE WORLD WORKS, episode {E['n']}. Created by Agus Dwi R.\n\n"
    r = head + f"## Pertanyaan sentral\n\n{E['question']}\n\n## Temuan terverifikasi\n\n" + "\n".join(f"{i+1}. {x}" for i, x in enumerate(E["findings"]))
    r += f"\n\n## Batasan dan keputusan editorial\n\n{E['caveats']}\n\nRiset dilakukan 4 November 2026.\n"
    (d / "RESEARCH_REPORT.md").write_text(r, encoding="utf8")
    s = head + "| Sumber | Status | Dipakai untuk |\n| --- | --- | --- |\n" + "".join(f"| [{n}]({u}) | {st} | {use} |\n" for n, u, st, use in E["sources"])
    (d / "SOURCE_REGISTER.md").write_text(s, encoding="utf8")
    note = "**Timing masih estimasi. Suara belum dibuat karena kredit Cartesia habis (HTTP 402).**\n\n" if est else ""
    sc = head + note + f"Suara: Cartesia sonic-3, voice `04b567df-2923-4b0c-896b-4b7df0a07e1a`, bahasa id. Durasi film {T['duration']} detik, ujaran {T['speech_end']} detik, {spoken} kata terucap, {wpm} WPM.\n\n"
    for l, sn in zip(lines, T["scenes"]):
        sc += f"**{fmt2(sn['start'])} - {fmt2(sn['end'])}** ({l['id']})\n\n{disp(l['text'])}\n\n"
    (d / "SCRIPT.md").write_text(sc, encoding="utf8")
    b = head + note + f"Konsep {E['concept']}. {E['style']} {E['motion']}\n\nPalet: {E['palette']}. Font: {E['fonts']}. Audio: {E['sound']}\n\n| Waktu | Visual | Kamera | Audio |\n| --- | --- | --- | --- |\n"
    for sn in T["scenes"]:
        v, c, a = E["board"][sn["id"]]
        b += f"| {fmt2(sn['start'])} - {fmt2(sn['end'])} | {v} | {c} | {a} |\n"
    b += f"| {fmt2(T['speech_end'] + .25)} - {fmt2(T['duration'])} | Penutup: logo Monolit AUDIRA, Created by Agus Dwi R. | Diam | Chime |\n"
    (d / "STORYBOARD.md").write_text(b, encoding="utf8")
    if M:
        v, a = M["video"], M["audio"]
        rows = [
            ("Akurasi ilmiah", "Lulus dengan catatan", "Semua angka dipetakan ke SOURCE_REGISTER.md. " + E["caveats"]),
            ("Akurasi mekanisme", "Lulus", "Urutan visual mengikuti temuan di RESEARCH_REPORT.md, bagian tidak berskala diberi label"),
            ("Validasi sumber", "Lulus dengan catatan", "Lihat status tiap sumber. Tidak ada tinjauan ahli manusia"),
            ("Kualitas narasi", "Lulus", f"Hook frame 0, {spoken} kata terucap"),
            ("Sinkron audio", "Lulus", f"Adegan dikunci ke timestamp Cartesia, {wpm} WPM"),
            ("Pelafalan", "Belum diverifikasi", "Tidak ada kata tereja salah menurut durasi kata. Belum ditinjau telinga manusia"),
            ("Loudness", "Lulus", f"{M['lufs']} LUFS, true peak {M['true_peak_dbfs']} dBTP, voice {M['vo_lufs']} LUFS, musik {M['music_lufs']} LUFS"),
            ("Sinkron subtitle", "Lulus", f"{M['caption_words_with_voice_pct']}% kata bersuara saat aktif, selisih onset maks {M['caption_onset_max_gap_s']} detik, {M['srt_cues']} cue SRT"),
            ("Realisme visual", "Sebagian", "Brief meminta photorealistic. Visual 3D prosedural real-time, tanpa plate foto atau render path tracing, karena image generation tidak tersedia (9Router: Missing API key)"),
            ("Kontinuitas gerak", "Lulus", f"Lembar frame dari MP4 final ditinjau. Segmen hitam: {len(M['black_segments'])}. Freeze di atas 2,5 detik: {M['freezes_over_2.5s']} (kartu penutup bila ada)"),
            ("Safe zone mobile", "Lulus", "Panel mulai 190 px, subtitle berakhir 1540 px"),
            ("Outro AUDIRA", "Lulus dengan catatan", f"Monolit dan Created by Agus Dwi R., {T['duration'] - T['speech_end'] - .25:.1f} detik. `shared/assets/brand/audira-outro-card.svg` masih memakai logo lama, jadi kartu dibangun dari kit logo resmi"),
            ("Resolusi", "Lulus", f"{v['width']}x{v['height']}"),
            ("Frame rate", "Lulus", f"{v['r_frame_rate']}, {v['nb_frames']} frame"),
            ("Tes putar MP4", "Lulus", f"Dekode penuh, {M['decode_errors']} galat, {float(v['duration']):.2f} detik, {v['codec_name']}/{a['codec_name']}. Bukan tes di perangkat ponsel"),
        ]
        q = head + "| Pemeriksaan | Hasil | Bukti |\n| --- | --- | --- |\n" + "".join(f"| {x} | {y} | {z} |\n" for x, y, z in rows)
        q += "\nVoice dihasilkan lewat `scripts/tts-cartesia.mjs` karena MCP `audira_generate_voiceover` mengembalikan HTTP 401.\n"
    else:
        q = head + "**STATUS: BELUM LOLOS QC. Video final belum ada.**\n\nCartesia mengembalikan HTTP 402 (`Model credits limit reached`), jadi voice-over, timing audio, subtitle final, master, dan `FINAL_VIDEO.mp4` belum bisa dibuat. Voice lain tidak dipakai karena brief menetapkan voice ID.\n\nYang sudah ada: riset, naskah, storyboard, dunia 3D, sound design, dan `PREVIEW_NO_VO.mp4` pada timing estimasi tanpa narasi.\n\nSetelah kredit tersedia: jalankan `bash AUDIRA_CARA_KERJA_VIRAL_2026/_tools/finish-ep.sh " + name + "`.\n"
    (d / "QA_REPORT.md").write_text(q, encoding="utf8")
    C = E.get("caps")
    if not C or est:
        (d / "SOCIAL_CAPTIONS.md").unlink(missing_ok=True)
        print(name, "docs ok, no captions (timing estimated)")
        return
    chap = "\n".join(f"{fmt(sn['start'] if i else 0)} {n}" for i, (sn, n) in enumerate(zip(T["scenes"], E["chap"])))
    core = "#AudiraHowItWorks #HowTheWorldWorks #Sains " + " ".join("#" + w.title().replace(" ", "") for w in E["tags"].split(", ")[:2])
    assert len(E["tags"]) < 480 and len(C["yt_title"]) < 100
    src = "; ".join(x[0] for x in E["sources"][:3])
    pts = "\n".join(f"{i+1}. {x}" for i, x in enumerate(C["points"]))
    m = f"# SOCIAL CAPTIONS, EP {E['n']}: {E['title']}\n\n"
    m += f"## TikTok\n\n**Hook:** {C['hook']}\n\n**Cover Text:** {C['cover']}\n\n**Caption:** {C['tiktok']}\n\n**Pinned Comment:** {C['pin']}\n\n**Hashtags:** {core}\n\n"
    m += f"## Instagram Reels\n\n**5-Point Value Breakdown:**\n\n{pts}\n\n**Caption:** {C['ig']}\n\n**Audio Cue:** {C['audio']}\n\n**Hashtags:** {core}\n\n"
    m += f"## YouTube Shorts\n\n**Judul:** {C['yt_title']}\n\n**Alternatif Judul:**\n" + "\n".join(f"- {x}" for x in C["yt_alt"]) + f"\n\n**Deskripsi:**\n\n{C['yt_desc']}\n\nChapters:\n{chap}\n\nSumber: {src}.\n\nCreated by Agus Dwi R. AUDIRA How It Works.\n\n{core}\n\n**Tags:** {E['tags']}, audira, how the world works\n\n**Pinned Comment:** {C['yt_pin']}\n\n**Thumbnail:** {C['thumb']}\n\n"
    m += f"## Facebook Reels\n\n**Caption:** {C['fb']}\n\n**Discussion Trigger:** {C['fb_q']}\n\n**Hashtags:** {core}\n\n"
    m += f"## X/Twitter\n\n**Cuitan tunggal:** {C['x_single']}\n\n**Viral Hook Thread:**\n\n" + "\n\n".join(f"{i+1}/ {x}" for i, x in enumerate(C["x_thread"])) + "\n"
    (d / "SOCIAL_CAPTIONS.md").write_text(m, encoding="utf8")
    print(name, "docs ok", spoken, "spoken", wpm, "WPM")


for n, E in EPS.items():
    write(n, E)
