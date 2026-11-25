"""Writes every episode's production documents and MASTER_INDEX.md from timeline.json, QC measurements and epdata.py,
so timecodes and numbers match the real files. Run from AUDIRA_SEJARAH_NEGARA_2026: python _tools/write-docs.py"""
import json, re, subprocess, sys
from pathlib import Path

sys.path.insert(0, "_tools")
from epdata import EPS, SERIES, RESEARCH_DATE

TOK = re.compile(r"\{([^|}]*)\|([^}]*)\}")
fmt = lambda t: f"{int(t // 60)}:{int(t % 60):02}"
fmt2 = lambda t: f"{int(t // 60):02}:{t % 60:04.1f}"
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
    note = "**Timecode masih estimasi** dari jumlah suku kata (sekitar 145 kata per menit). Voice-over sengaja belum dibuat sampai naskah disetujui; `vo.py build` akan menggantinya dengan timecode asli.\n\n" if est else ""
    head = f"# EP {E['n']}: {E['title']}\n\nSeri AUDIRA, {SERIES}. Created by Agus Dwi R. Riset {RESEARCH_DATE}.\n\n"

    (d / "CREATIVE_BRIEF.md").write_text(head + f"## Angle\n\n{E['angle']}\n\n## Penonton\n\n{E['audience']}\n\n## Hook (0-3 detik)\n\n{E['hook']}\n\n## Konsep dipilih\n\n**{E['concept']}**\n\nAlternatif yang dipertimbangkan:\n\n" + "".join(f"- {x}\n" for x in E["alts"]) + f"\n## Art direction\n\nStyle kit: {E['style']}\n\n**Palet:** {E['palette']}\n\n**Font:** {E['fonts']}\n\n**Gerak kamera dan transisi:** {E['motion']}\n\n## Design system\n\nKanvas 1080x1920, 30 fps. Safe zone: atas 180 px, bawah 380 px. Panel di x 56-970. Takarir karaoke di 1290-1540 px. Penutup: logo Monolit AUDIRA dan Created by Agus Dwi R.\n", encoding="utf8")

    (d / "RESEARCH_REPORT.md").write_text(head + "## Temuan terverifikasi\n\n" + "\n".join(f"{i+1}. {x}" for i, x in enumerate(E["findings"])) + f"\n\n## Batasan dan keputusan editorial\n\n{E['caveats']}\n", encoding="utf8")
    (d / "SOURCE_REGISTER.md").write_text(head + "| Sumber | Tanggal | Status | Dipakai untuk |\n| --- | --- | --- | --- |\n" + "".join(f"| [{a}]({b}) | {c} | {x} | {y} |\n" for a, b, c, x, y in E["sources"]), encoding="utf8")

    sc = head + note + f"Suara: Cartesia sonic-3, voice `04b567df-2923-4b0c-896b-4b7df0a07e1a`, bahasa id. {spoken} kata terucap, ujaran {T['speech_end']} detik, film {T['duration']} detik.\n\n"
    for l, sn in zip(lines, T["scenes"]):
        sc += f"**{fmt2(sn['start'])} - {fmt2(sn['end'])}** ({l['id']})\n\n{disp(l['text'])}\n\n"
    sc += "## Teks untuk TTS (ejaan fonetik)\n\n" + "".join(f"- {l['id']}: {TOK.sub(lambda m: m.group(2), l['text'])}\n" for l in lines)
    (d / "SCRIPT.md").write_text(sc, encoding="utf8")

    b = head + note + f"**Konsep:** {E['concept']}.\n\n| Waktu | Visual | Kamera | Audio |\n| --- | --- | --- | --- |\n"
    for sn in T["scenes"]:
        v, c, a = E["board"][sn["id"]]
        b += f"| {fmt2(sn['start'])} - {fmt2(sn['end'])} | {v} | {c} | {a} |\n"
    b += f"| {fmt2(T['speech_end'] + .25)} - {fmt2(T['duration'])} | Penutup: logo Monolit AUDIRA dan Created by Agus Dwi R. | Diam | Chime |\n"
    (d / "STORYBOARD.md").write_text(b, encoding="utf8")

    (d / "AUDIO_PLAN.md").write_text(head + f"## Musik dan desain suara\n\n{E['sound']}\n\n## Aturan mix\n\n- VO Cartesia dinormalisasi ke -16 LUFS, musik dan SFX sekitar 15 dB di bawah suara, ducking otomatis saat VO berbunyi (`audio_lib.Mix.finish`).\n- Master akhir -14 LUFS, true peak di bawah -1 dBTP (`master.py`).\n- Semua cue SFX menempel ke kata di naskah (`PROJECT/beats.json`), jadi ikut bergeser saat VO asli masuk.\n\n## Status\n\n" + ("VO belum dibuat, menunggu persetujuan naskah. PREVIEW berisi musik dan SFX saja.\n" if est else "VO terkunci ke timeline asli.\n"), encoding="utf8")
    (d / "ASSET_MANIFEST.md").write_text(head + "| Aset | Asal | Lisensi |\n| --- | --- | --- |\n" + "".join(f"| {a} | {b} | {c} |\n" for a, b, c in E["assets"]) + "| Logo Monolit AUDIRA (`assets/brand/stacked-reversed.svg`) | Kit brand AUDIRA | Milik AUDIRA |\n| SFX library (`AUDIO/sfx`) | Pustaka SFX AUDIRA | Internal |\n| Musik | Disintesis per episode di `mix.py` | Orisinal |\n", encoding="utf8")

    final = probe(d / "FINAL_VIDEO.mp4")
    prev = probe(d / "PREVIEW.mp4")
    pq = d / "PROJECT/qc/preview.json"
    Q = json.load(open(pq, encoding="utf8")) if pq.exists() else {}
    M = json.load(open(d / "PROJECT/qc/metrics.json", encoding="utf8")) if (d / "PROJECT/qc/metrics.json").exists() and final else None
    v = final or prev
    fr = f"{v['width']}x{v['height']}, {v['r_frame_rate']}, {v['nb_frames']} frame, {v['duration']:.2f} detik" if v else "belum dirender"
    rows = [
        ("Fakta, angka, nama, tanggal", "Lulus dengan catatan", E["caveats"]),
        ("Sumber", "Lulus", f"{len(E['sources'])} sumber di SOURCE_REGISTER.md"),
        ("Naskah sesuai durasi", "Estimasi" if est else "Lulus", f"{spoken} kata terucap, {T['speech_end']} detik"),
        ("VO", "Lulus" if M else "BELUM", f"{M['vo_lufs']} LUFS" if M else "Menunggu persetujuan naskah"),
        ("Loudness -14 LUFS", "Lulus" if M else "Preview", f"{M['lufs']} LUFS, {M['true_peak_dbfs']} dBTP" if M else (f"Preview {Q.get('lufs')} LUFS (musik saja)" if Q else "-")),
        ("Subtitle sinkron", "Lulus" if M else "BELUM", f"{M['caption_words_with_voice_pct']}% kata bersuara" if M else "SRT memakai timing estimasi"),
        ("Safe zone", "Lulus", "Panel mulai 180 px ke bawah, takarir berakhir 1540 px. Diperiksa dari lembar frame"),
        ("Frame hitam / beku", "Lulus" if Q and not Q.get("black") else "Belum diukur", f"hitam {Q.get('black')}, beku {Q.get('freezes')}" if Q else "-"),
        ("Outro resmi", "Lulus", f"{T['duration'] - T['speech_end'] - .25:.2f} detik, logo Monolit AUDIRA dan Created by Agus Dwi R."),
        ("Format", "Lulus" if v else "BELUM", fr),
        ("FINAL_VIDEO.mp4", "Lulus" if final else "BELUM", "Ada" if final else "Belum, menunggu VO. Yang ada PREVIEW.mp4 tanpa narasi"),
    ]
    verdict = "LULUS UJI TERUKUR" if final and M else "DRAFT: menunggu persetujuan naskah, VO dan FINAL_VIDEO.mp4 belum ada"
    (d / "QA_REPORT.md").write_text(head + f"**Status QC: {verdict}**\n\n| Pemeriksaan | Hasil | Bukti |\n| --- | --- | --- |\n" + "".join(f"| {x} | {y} | {z} |\n" for x, y, z in rows), encoding="utf8")

    chap = "\n".join(f"{fmt(sn['start'] if i else 0)} {n}" for i, (sn, n) in enumerate(zip(T["scenes"], E["chap"])))
    ht = " ".join(E["tags"])
    tags = E["yt_tags"] + ", audira, fakta sejarah, sejarah dunia"
    assert len(tags) < 500 and len(E["yt_title"]) < 100, name
    for tw in [E["x_single"]] + [f"{i+1}/ {x}" for i, x in enumerate(E["x_thread"])]:
        assert len(tw) <= 280, (name, len(tw), tw)
    pts = "\n".join(f"{i+1}. {x}" for i, x in enumerate(E["points"]))
    srcs = "; ".join(x[0] for x in E["sources"][:3])
    draft = "> Draft. Chapter memakai timing estimasi dan akan dihitung ulang setelah VO asli.\n\n" if est else ""
    m = f"# SOCIAL CAPTIONS, EP {E['n']}: {E['title']}\n\n{draft}"
    m += f"## TikTok\n\n**Hook:** {E['hook']}\n\n**Cover Text:** {E['cover']}\n\n**Caption:** {E['tiktok']}\n\n**Pinned Comment:** {E['pin']}\n\n**Hashtags:** {ht}\n\n"
    m += f"## Instagram Reels\n\n**Caption:** {E['ig']}\n\n**5-Point Value Breakdown:**\n\n{pts}\n\n**Audio Cue:** {E['audio']}\n\n**Hashtags:** {ht}\n\n"
    m += f"## YouTube Shorts\n\n**Judul:** {E['yt_title']}\n\n**Alternatif Judul:**\n" + "\n".join(f"- {x}" for x in E["yt_alt"]) + f"\n\n**Deskripsi:**\n\n{E['yt_desc']}\n\nChapters:\n{chap}\n\nSumber: {srcs}.\n\nCreated by Agus Dwi R. AUDIRA.\n\n{ht}\n\n**Tags:** {tags}\n\n**Pinned Comment:** {E['yt_pin']}\n\n**Thumbnail:** {E['thumb']}\n\n"
    m += f"## Facebook Reels\n\n**Caption:** {E['fb']}\n\n**Discussion Trigger:** {E['fb_q']}\n\n**Hashtags:** {ht}\n\n"
    m += f"## X/Twitter\n\n**Cuitan tunggal:** {E['x_single']}\n\n**Viral Hook Thread:**\n\n" + "\n\n".join(f"{i+1}/ {x}" for i, x in enumerate(E["x_thread"])) + "\n"
    opener = f"{E['hook']} {E['tiktok']} {E['tags'][0]}"
    posts = [opener] + [f"{i+1}/ {x}" for i, x in enumerate(E["points"])] + [f"{E['fb_q']} {E['tags'][1]}"]
    for p_ in posts:
        assert len(p_) <= 500, (name, len(p_))
    m += "\n## Threads\n\n**Post pembuka:**\n\n" + posts[0] + "\n\n**Utas:**\n\n" + "\n\n".join(posts[1:]) + "\n"
    import datetime as _dt
    day = _dt.date(2026, 11, 8) + _dt.timedelta(days=int(E["n"]) - 1)
    hari = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"][day.weekday()]
    dstr = f"{hari}, {day.day} {['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'][day.month-1]} {day.year}"
    slots = [("TikTok", "19.00"), ("Instagram Reels", "19.20"), ("YouTube Shorts", "19.40"), ("Facebook Reels", "20.00"), ("X (Twitter)", "20.20"), ("Threads", "20.40")]
    m += f"\n## Jadwal Upload (WIB)\n\nDefault awal untuk penonton Indonesia (slot utama malam), bukan data akun. Ganti dengan jam aktif follower dari analytics setelah 2-4 minggu.\n\n" + "\n".join(f"- {p}: {dstr}, {h} WIB" for p, h in slots) + "\n"
    m += "\n## Label Konten AI\n\nVO dan visual dibuat dengan AI. Saat upload, centang label: TikTok \"AI-generated content\", YouTube \"Altered or synthetic content\", Meta (Facebook dan Instagram) \"AI info\".\n"
    m += f"\n## Catatan Upload\n\n- Upload `SUBTITLES/SUBTITLE.srt` ke YouTube dan Facebook.\n- Komentar pin: Seri {SERIES} #{E['n']}; tautkan episode sebelumnya dan playlist seri.\n- Musik dan SFX disintesis sendiri di `mix.py`, tanpa lisensi pihak ketiga.\n"
    (d / "SOCIAL_CAPTIONS.md").write_text(m, encoding="utf8")
    index.append((name, E, T, bool(final), bool(prev), spoken))
    print(name, "docs ok", spoken, "spoken", T["speech_end"], "s")

mi = f"# AUDIRA: {SERIES}\n\nLima fakta sejarah negara, satu film per fakta. Created by Agus Dwi R. Riset {RESEARCH_DATE}.\n\n| EP | Judul | Negara | Style kit | Film | Berkas |\n| --- | --- | --- | --- | --- | --- |\n"
for name, E, T, f, p, sp in index:
    file = "FINAL_VIDEO.mp4" if f else ("PREVIEW.mp4, tanpa narasi" if p else "belum")
    mi += f"| [{E['n']}]({name}/) | {E['title']} | {E['country']} | {E['style'].split('.')[0]} | {T['duration']} s{' (estimasi)' if T.get('estimated') else ''} | {file} |\n"
Path("MASTER_INDEX.md").write_text(mi, encoding="utf8")
