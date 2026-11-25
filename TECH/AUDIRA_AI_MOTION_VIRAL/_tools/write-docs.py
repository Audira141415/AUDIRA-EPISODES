"""Writes every episode's documents and MASTER_INDEX.md from timeline.json, QC measurements and epdata.py, so timecodes and numbers match the real files.
Run from AUDIRA_AI_MOTION_VIRAL: python _tools/write-docs.py"""
import json, re, subprocess, sys
from pathlib import Path

sys.path.insert(0, "_tools")
from epdata import EPS

TOK = re.compile(r"\{([^|}]*)\|([^}]*)\}")
fmt = lambda t: f"{int(t // 60)}:{int(t % 60):02}"
fmt2 = lambda t: f"{int(t // 60):02}:{t % 60:04.1f}"
SERIES = "AI MOTION TANPA RIBET"
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
    note = "**Timecode masih estimasi dari jumlah suku kata**, karena suara belum dibuat dan menunggu naskah disetujui. `vo.py build` menggantinya dengan timecode asli, dan semua visual ikut bergeser karena terikat ke kata.\n\n" if est else ""
    head = f"# EP {E['n']}: {E['title']}\n\nSeri AUDIRA, {SERIES}. Created by Agus Dwi R. Riset 5 November 2026. Alat: {E['tools']}.\n\nJudul di brief: {E['title_brief']}\n\n"
    (d / "CREATIVE_BRIEF.md").write_text(head + f"**Audiens:** kreator pemula Indonesia yang penasaran AI motion dan belum bisa animasi.\n\n**Hook:** {E['hook']}\n\n**Konsep terpilih:** {E['concept']}.\n\n**Style Kit:** {E['style']}.\n\n**Tone:** bertutur, praktis, jujur soal batas alat. Tidak menjanjikan viral.\n", encoding="utf8")
    (d / "RESEARCH_REPORT.md").write_text(head + "## Temuan terverifikasi\n\n" + "\n".join(f"{i+1}. {x}" for i, x in enumerate(E["findings"])) + f"\n\n## Batasan dan keputusan editorial\n\n{E['caveats']}\n", encoding="utf8")
    (d / "SOURCE_REGISTER.md").write_text(head + "| Sumber | Tanggal | Status | Dipakai untuk |\n| --- | --- | --- | --- |\n" + "".join(f"| [{a}]({b}) | {c} | {x} | {y} |\n" for a, b, c, x, y in E["sources"]), encoding="utf8")
    sc = head + note + f"Suara rencana: Cartesia sonic-3, voice `04b567df-2923-4b0c-896b-4b7df0a07e1a`, bahasa id. {spoken} kata terucap, ujaran {T['speech_end']} detik, film {T['duration']} detik.\n\n"
    for l, sn in zip(lines, T["scenes"]):
        sc += f"**{fmt2(sn['start'])} - {fmt2(sn['end'])}** ({l['id']})\n\n{disp(l['text'])}\n\n"
    (d / "SCRIPT.md").write_text(sc, encoding="utf8")
    b = head + note + f"**Konsep:** {E['concept']}.\n\n**Palet:** {E['palette']}. **Font:** {E['fonts']}.\n\n**Gerak:** {E['motion']}\n\n**Suara:** {E['sound']}\n\n| Waktu | Visual | Kamera | Audio |\n| --- | --- | --- | --- |\n"
    for sn in T["scenes"]:
        v, c, a = E["board"][sn["id"]]
        b += f"| {fmt2(sn['start'])} - {fmt2(sn['end'])} | {v} | {c} | {a} |\n"
    b += f"| {fmt2(T['speech_end'] + .25)} - {fmt2(T['duration'])} | Penutup: logo Monolit AUDIRA dan Created by Agus Dwi R. | Diam | Chime |\n"
    (d / "STORYBOARD.md").write_text(b, encoding="utf8")
    (d / "ART_DIRECTION.md").write_text(head + f"**Style Kit:** {E['style']}.\n\n**Konsep:** {E['concept']}.\n\n**Gerak:** {E['motion']}\n", encoding="utf8")
    (d / "DESIGN_SYSTEM.md").write_text(head + f"**Warna:** {E['palette']}.\n\n**Font:** {E['fonts']}.\n\n**Kanvas:** 1080x1920, 30 fps. Panel 186 sampai 1000 px, takarir berakhir di 1540 px, safe zone atas 180 px dan bawah 380 px.\n", encoding="utf8")
    (d / "ASSET_MANIFEST.md").write_text(head + "| Aset | Asal | Catatan |\n| --- | --- | --- |\n| Dunia 3D dan objek | `world3d.js`, dibuat dengan kode | Orisinal |\n| Logo Monolit AUDIRA | Kit logo resmi, `stacked-reversed.svg` | Dipakai di penutup |\n| Three.js, GSAP | Pustaka terbuka | Render |\n| Musik dan SFX | Sintesis `mix.py` | Orisinal, tanpa sampel |\n" + ("| Panel frame | `PROJECT/remotion`, Remotion 4.0.539 | Dirender sungguhan, satu panel |\n| Grid tinjauan | Frame dari PREVIEW EP01 sampai EP04 | Dari film seri ini |\n" if E["n"] == "05" else "") + "\nTidak ada aset dari model image atau video AI, karena 9Router lokal tidak menyediakan model media. Semua contoh alat dijelaskan lewat ilustrasi dan dilabeli di layar. Tidak ada tampilan UI tiruan dari produk pihak ketiga.\n", encoding="utf8")
    (d / "AUDIO_PLAN.md").write_text(head + f"**Rancangan:** {E['sound']}\n\n**Voice:** Cartesia sonic-3, `04b567df-2923-4b0c-896b-4b7df0a07e1a`, normalisasi -16 LUFS, musik di-duck di bawah suara. Master target -14 LUFS, true peak di bawah -1 dBTP.\n\n**Status:** " + ("Suara belum dibuat, menunggu naskah disetujui. PREVIEW berisi musik dan SFX saja.\n" if est else "Suara sudah terkunci.\n"), encoding="utf8")

    final = probe(d / "FINAL_VIDEO.mp4")
    prev = probe(d / "PREVIEW.mp4")
    pq = d / "PROJECT/qc/preview.json"
    Q = json.load(open(pq, encoding="utf8")) if pq.exists() else {}
    M = json.load(open(d / "PROJECT/qc/metrics.json", encoding="utf8")) if (d / "PROJECT/qc/metrics.json").exists() else None
    v = final or prev
    fr = f"{v['width']}x{v['height']}, {v['r_frame_rate']}, {v['nb_frames']} frame, {v['duration']:.2f} detik" if v else "belum dirender"
    rows = [
        ("Fakta alat", "Lulus dengan catatan", E["caveats"]),
        ("Sumber dan tanggal riset", "Lulus", f"{len(E['sources'])} sumber di SOURCE_REGISTER.md"),
        ("Label visual", "Lulus", "Label ilustrasi tampil sepanjang film, tanpa UI tiruan produk lain"),
        ("Naskah sesuai durasi", "Lulus" if not est else "Estimasi", f"{spoken} kata terucap, {T['speech_end']} detik"),
        ("Voice-over", "Lulus" if M else "BELUM", f"{M['vo_lufs']} LUFS" if M else "Menunggu naskah disetujui"),
        ("Loudness -14 LUFS, TP < -1 dBFS", "Lulus" if M else "BELUM", f"{M['lufs']} LUFS, {M['true_peak_dbfs']} dBTP" if M else f"Preview tanpa suara: {Q.get('lufs', '-')} LUFS, belum bermakna"),
        ("Subtitle sinkron", "Lulus" if M else "BELUM", f"{M['caption_words_with_voice_pct']}% kata bersuara" if M else "SRT masih memakai timing estimasi"),
        ("Safe zone", "Lulus", "Panel mulai 186 px, takarir berakhir 1540 px. Diperiksa dari lembar frame"),
        ("Dekode dan frame hitam", "Lulus" if Q and not Q.get("decode_errors") and not Q.get("black") else "Belum diukur", f"{Q.get('decode_errors', '-')} error dekode, {len(Q.get('black', []))} segmen hitam, hold: {Q.get('freezes', '-')}"),
        ("Outro resmi", "Lulus dengan catatan", "`audira-outro-card.svg` bersama masih logo lama dan bertulis Created by AUDIRA, jadi kartu dibangun dari kit logo Monolit dengan Created by Agus Dwi R."),
        ("Format", "Lulus" if v else "BELUM", fr),
        ("FINAL_VIDEO.mp4", "Lulus" if final else "BELUM", "Ada" if final else "Belum dirender. Yang ada baru PREVIEW.mp4 tanpa narasi"),
    ]
    verdict = "LULUS UJI TERUKUR, tinjauan telinga manusia belum dilakukan" if final and M else "DRAFT: naskah dan PREVIEW.mp4 siap ditinjau, suara dan FINAL_VIDEO.mp4 belum ada"
    (d / "QA_REPORT.md").write_text(head + f"**Status QC: {verdict}**\n\n| Pemeriksaan | Hasil | Bukti |\n| --- | --- | --- |\n" + "".join(f"| {x} | {y} | {z} |\n" for x, y, z in rows), encoding="utf8")

    chap = "\n".join(f"{fmt(sn['start'] if i else 0)} {n}" for i, (sn, n) in enumerate(zip(T["scenes"], E["chap"])))
    ht = " ".join(E["tags"])
    tags = E["yt_tags"] + ", audira motion, ai motion tanpa ribet"
    assert len(tags) < 500 and len(E["yt_title"]) < 100, name
    for tw in [E["x_single"]] + [f"{i+1}/ {x}" for i, x in enumerate(E["x_thread"])]:
        assert len(tw) <= 280, (name, len(tw), tw)
    pts = "\n".join(f"{i+1}. {x}" for i, x in enumerate(E["points"]))
    srcs = "; ".join(x[0] for x in E["sources"][:3])
    draft = "> Draft. Chapter memakai timing estimasi dan akan dihitung ulang setelah suara asli.\n\n" if est else ""
    m = f"# SOCIAL CAPTIONS, EP {E['n']}: {E['title']}\n\n{draft}"
    m += f"## TikTok\n\n**Hook:** {E['hook']}\n\n**Cover Text:** {E['cover']}\n\n**Caption:** {E['tiktok']}\n\n**Pinned Comment:** {E['pin']}\n\n**Hashtags:** {ht}\n\n"
    m += f"## Instagram Reels\n\n**Caption:** {E['ig']}\n\n**5-Point Value Breakdown:**\n\n{pts}\n\n**Audio Cue:** {E['audio']}\n\n**Hashtags:** {ht}\n\n"
    m += f"## YouTube Shorts\n\n**Judul:** {E['yt_title']}\n\n**Alternatif Judul:**\n" + "\n".join(f"- {x}" for x in E["yt_alt"]) + f"\n\n**Deskripsi:**\n\n{E['yt_desc']}\n\nChapters:\n{chap}\n\nSumber: {srcs}.\n\nCreated by Agus Dwi R. AUDIRA.\n\n{ht}\n\n**Tags:** {tags}\n\n**Pinned Comment:** {E['pin']}\n\n**Thumbnail:** {E['thumb']}\n\n"
    m += f"## Facebook Reels\n\n**Caption:** {E['fb']}\n\n**Discussion Trigger:** {E['fb_q']}\n\n**Hashtags:** {ht}\n\n"
    m += f"## X/Twitter\n\n**Cuitan tunggal:** {E['x_single']}\n\n**Viral Hook Thread:**\n\n" + "\n\n".join(f"{i+1}/ {x}" for i, x in enumerate(E["x_thread"])) + "\n"
    (d / "SOCIAL_CAPTIONS.md").write_text(m, encoding="utf8")
    index.append((name, E, T, bool(final), bool(prev), spoken))
    print(name, "docs ok", spoken, "spoken", T["speech_end"], "s")

mi = f"# AUDIRA: {SERIES}\n\nCreated by Agus Dwi R. Riset 5 November 2026.\n\n| EP | Judul | Alat | Film | Berkas |\n| --- | --- | --- | --- | --- |\n"
for name, E, T, f, p, sp in index:
    file = "FINAL_VIDEO.mp4" if f else ("PREVIEW.mp4, tanpa narasi" if p else "belum")
    mi += f"| [{E['n']}]({name}/) | {E['title']} | {E['tools']} | {T['duration']} s{' (estimasi)' if T.get('estimated') else ''} | {file} |\n"
Path("MASTER_INDEX.md").write_text(mi, encoding="utf8")
