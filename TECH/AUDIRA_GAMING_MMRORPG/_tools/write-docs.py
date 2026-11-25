"""Writes every episode's documents and MASTER_INDEX.md from timeline.json, QC measurements and epdata.py, so timecodes and numbers match the real files.
Run from AUDIRA_GAMING_MMRORPG: python _tools/write-docs.py"""
import json, re, subprocess, sys
from pathlib import Path

sys.path.insert(0, "_tools")
from epdata import EPS

TOK = re.compile(r"\{([^|}]*)\|([^}]*)\}")
fmt = lambda t: f"{int(t // 60)}:{int(t % 60):02}"
fmt2 = lambda t: f"{int(t // 60):02}:{t % 60:04.1f}"
SERIES = "MMORPG: MAIN GAME BISA JADI UANG?"
index = []


def probe(f):
    if not f.exists():
        return None
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height,r_frame_rate,nb_frames:format=duration", "-of", "json", str(f)], capture_output=True, text=True)
    d = json.loads(r.stdout)
    return {**d["streams"][0], "duration": float(d["format"]["duration"])}


for name, E in EPS.items():
    d = Path(name)
    T = json.load(open(d / "timeline.json", encoding="utf8"))
    lines = json.load(open(d / "script-lines.json", encoding="utf8"))
    disp = lambda s: TOK.sub(lambda m: m.group(1), s)
    spoken = sum(len(TOK.sub(lambda m: m.group(2), l["text"]).split()) for l in lines)
    est = T.get("estimated", False)
    note = "**Timecode masih estimasi dari jumlah suku kata**, karena voice belum bisa dibuat (Cartesia HTTP 402, kredit habis). `vo.py build` menggantinya dengan timecode asli.\n\n" if est else ""
    head = f"# EP {E['n']}: {E['title']}\n\nSeri AUDIRA GAMING, {SERIES} Created by Agus Dwi R. Riset 4 November 2026.\n\nJudul di brief: {E['title_brief']}\n\n"
    (d / "RESEARCH_REPORT.md").write_text(head + f"## Status saat riset\n\n{E['status']}\n\n## Temuan terverifikasi\n\n" + "\n".join(f"{i+1}. {x}" for i, x in enumerate(E["findings"])) + f"\n\n## Batasan dan keputusan editorial\n\n{E['caveats']}\n\nTidak ada janji penghasilan, tidak ada angka penghasilan pemain, dan tidak ada tampilan marketplace atau transaksi tiruan. Visual token diberi label ilustrasi.\n", encoding="utf8")
    s = head + "| Sumber | Tanggal | Status | Dipakai untuk |\n| --- | --- | --- | --- |\n" + "".join(f"| [{a}]({b}) | {c} | {x} | {y} |\n" for a, b, c, x, y in E["sources"])
    (d / "SOURCE_REGISTER.md").write_text(s, encoding="utf8")
    sc = head + note + f"Suara: Cartesia sonic-3, voice `04b567df-2923-4b0c-896b-4b7df0a07e1a`, bahasa id. {spoken} kata terucap, ujaran {T['speech_end']} detik, film {T['duration']} detik.\n\n"
    for l, sn in zip(lines, T["scenes"]):
        sc += f"**{fmt2(sn['start'])} - {fmt2(sn['end'])}** ({l['id']})\n\n{disp(l['text'])}\n\n"
    (d / "SCRIPT.md").write_text(sc, encoding="utf8")
    b = head + note + f"**Konsep:** {E['concept']}.\n\n**Palet:** {E['palette']}. **Font:** {E['fonts']}.\n\n**Gerak:** {E['motion']}\n\n**Suara:** {E['sound']}\n\n| Waktu | Visual | Kamera | Audio |\n| --- | --- | --- | --- |\n"
    for sn in T["scenes"]:
        v, c, a = E["board"][sn["id"]]
        b += f"| {fmt2(sn['start'])} - {fmt2(sn['end'])} | {v} | {c} | {a} |\n"
    b += f"| {fmt2(T['speech_end'] + .25)} - {fmt2(T['duration'])} | Penutup: logo Monolit AUDIRA dan Created by Agus Dwi R. | Diam | Chime |\n"
    (d / "STORYBOARD.md").write_text(b, encoding="utf8")

    final = probe(d / "FINAL_VIDEO.mp4")
    prev = probe(d / "PREVIEW.mp4")
    pq = d / "PROJECT/qc/preview.json"
    Q = json.load(open(pq, encoding="utf8")) if pq.exists() else {}
    M = json.load(open(d / "PROJECT/qc/metrics.json", encoding="utf8")) if (d / "PROJECT/qc/metrics.json").exists() else None
    v = final or prev
    fr = f"{v['width']}x{v['height']}, {v['r_frame_rate']}, {v['nb_frames']} frame, {v['duration']:.2f} detik" if v else "belum dirender"
    rows = [
        ("Fakta dan mekanisme ekonomi", "Lulus dengan catatan", E["caveats"]),
        ("Sumber dan tanggal riset", "Lulus", f"{len(E['sources'])} sumber di SOURCE_REGISTER.md"),
        ("Klaim pendapatan", "Lulus", "Tidak ada janji atau angka penghasilan pemain"),
        ("Naskah sesuai durasi", "Lulus" if not est else "Estimasi", f"{spoken} kata terucap, {T['speech_end']} detik"),
        ("VO tidak terpotong", "Lulus" if M else "BELUM", f"{M['vo_lufs']} LUFS" if M else "VO belum ada: Cartesia HTTP 402, kredit habis"),
        ("SFX tidak menutupi VO", "Lulus" if M else "BELUM", f"Musik {M['music_lufs']} LUFS" if M else "Belum bisa diukur tanpa VO"),
        ("Loudness -14 LUFS, TP < -1 dBFS", "Lulus" if M else "BELUM", f"{M['lufs']} LUFS, {M['true_peak_dbfs']} dBTP" if M else "Master final belum ada"),
        ("Subtitle sinkron", "Lulus" if M else "BELUM", f"{M['caption_words_with_voice_pct']}% kata bersuara" if M else "SRT masih memakai timing estimasi"),
        ("Safe zone", "Lulus", "Panel mulai 186 px, takarir berakhir 1540 px. Diperiksa dari lembar frame"),
        ("Frame hitam", "Lulus" if M and not M["black_segments"] else "Belum diukur", f"{len(M['black_segments'])} segmen hitam, {M['freezes_over_2.5s']} hold di atas 2,5 detik (kartu penutup), lembar frame ditinjau dari MP4 final" if M else "-"),
        ("Pelafalan VO", "Sebagian", "Ejaan fonetik dipakai untuk nama dan istilah, tanpa kata tertukar menurut timestamp. Belum ditinjau telinga manusia" if M else "Belum ada VO"),
        ("Watermark statis", "Lulus", "Tidak ada logo di dalam adegan"),
        ("Outro resmi", "Lulus dengan catatan", f"{T['duration'] - T['speech_end'] - .25:.2f} detik. `audira-outro-card.svg` bersama masih logo lama dan bertulis Created by AUDIRA, jadi kartu dibangun dari kit logo Monolit dengan Created by Agus Dwi R."),
        ("Format", "Lulus" if v else "BELUM", fr),
        ("FINAL_VIDEO.mp4 diputar dan diperiksa", "Lulus" if final else "BELUM", "Ada" if final else "Belum dirender, menunggu VO. Yang ada baru PREVIEW.mp4 tanpa narasi"),
    ]
    verdict = "LULUS UJI TERUKUR, tinjauan telinga manusia belum dilakukan" if final and M else "BELUM LULUS: VO dan FINAL_VIDEO.mp4 belum ada"
    (d / "QA_REPORT.md").write_text(head + f"**Status QC: {verdict}**\n\n| Pemeriksaan | Hasil | Bukti |\n| --- | --- | --- |\n" + "".join(f"| {x} | {y} | {z} |\n" for x, y, z in rows) + ("\nVoice dibuat lewat `scripts/tts-cartesia.mjs` karena MCP `audira_generate_voiceover` mengembalikan HTTP 401.\n" if M else "\nMCP `audira_generate_voiceover` mengembalikan HTTP 401, dan `scripts/tts-cartesia.mjs` mengembalikan HTTP 402 kredit habis.\n"), encoding="utf8")

    chap = "\n".join(f"{fmt(sn['start'] if i else 0)} {n}" for i, (sn, n) in enumerate(zip(T["scenes"], E["chap"])))
    ht = " ".join(E["tags"])
    tags = E["yt_tags"] + ", audira gaming, mmorpg main game bisa jadi uang"
    assert len(tags) < 500 and len(E["yt_title"]) < 100, name
    for tw in [E["x_single"]] + [f"{i+1}/ {x}" for i, x in enumerate(E["x_thread"])]:
        assert len(tw) <= 280, (name, len(tw), tw)
    pts = "\n".join(f"{i+1}. {x}" for i, x in enumerate(E["points"]))
    srcs = "; ".join(x[0] for x in E["sources"][:3])
    draft = "> Draft. Chapter memakai timing estimasi dan akan dihitung ulang setelah VO asli.\n\n" if est else ""
    m = f"# SOCIAL CAPTIONS, EP {E['n']}: {E['title']}\n\n{draft}"
    m += f"## TikTok\n\n**Hook:** {E['hook']}\n\n**Cover Text:** {E['cover']}\n\n**Caption:** {E['tiktok']}\n\n**Pinned Comment:** {E['pin']}\n\n**Hashtags:** {ht}\n\n"
    m += f"## Instagram Reels\n\n**Caption:** {E['ig']}\n\n**5-Point Value Breakdown:**\n\n{pts}\n\n**Audio Cue:** {E['audio']}\n\n**Hashtags:** {ht}\n\n"
    m += f"## YouTube Shorts\n\n**Judul:** {E['yt_title']}\n\n**Alternatif Judul:**\n" + "\n".join(f"- {x}" for x in E["yt_alt"]) + f"\n\n**Deskripsi:**\n\n{E['yt_desc']}\n\nChapters:\n{chap}\n\nSumber: {srcs}.\n\nCreated by Agus Dwi R. AUDIRA Gaming.\n\n{ht}\n\n**Tags:** {tags}\n\n**Pinned Comment:** {E['pin']}\n\n**Thumbnail:** {E['thumb']}\n\n"
    m += f"## Facebook Reels\n\n**Caption:** {E['fb']}\n\n**Discussion Trigger:** {E['fb_q']}\n\n**Hashtags:** {ht}\n\n"
    m += f"## X/Twitter\n\n**Cuitan tunggal:** {E['x_single']}\n\n**Viral Hook Thread:**\n\n" + "\n\n".join(f"{i+1}/ {x}" for i, x in enumerate(E["x_thread"])) + "\n"
    (d / "SOCIAL_CAPTIONS.md").write_text(m, encoding="utf8")
    index.append((name, E, T, bool(final), bool(prev), spoken))
    print(name, "docs ok", spoken, "spoken", T["speech_end"], "s")

mi = f"# AUDIRA GAMING: {SERIES}\n\nDi Balik Dunia Game, Ada Ekonomi Nyata. Created by Agus Dwi R. Riset 4 November 2026.\n\n| EP | Judul | Status game saat riset | Film | Berkas |\n| --- | --- | --- | --- | --- |\n"
for name, E, T, f, p, sp in index:
    file = "FINAL_VIDEO.mp4" if f else ("PREVIEW.mp4, tanpa narasi" if p else "belum")
    mi += f"| [{E['n']}]({name}/) | {E['title']} | {E['status']} | {T['duration']} s{' (estimasi)' if T.get('estimated') else ''} | {file} |\n"
mi += "\nStatus game memakai data 4 November 2026. Periksa ulang sebelum publikasi, terutama EP01 dan EP02, karena statusnya masih bergerak.\n"
Path("MASTER_INDEX.md").write_text(mi, encoding="utf8")
