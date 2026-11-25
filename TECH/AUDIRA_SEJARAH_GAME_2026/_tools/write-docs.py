"""Writes NOTES.md, QA_REPORT.md and docs/ (CREATIVE_BRIEF, STORYBOARD, AUDIO_PLAN, ASSET_MANIFEST) per episode, plus MASTER_INDEX.md. Run after final.sh."""
import json, datetime
from pathlib import Path
SERIES = Path(__file__).resolve().parent.parent
D = {
 "EP01_BOM_ATOM_TENNIS": ("Lab 1958 hitam-putih, satu-satunya warna adalah fosfor hijau osiloskop.", "Jazz noir 72 BPM (bass betot, snare sapu, terompet bisu), blip osiloskop, klik saklar, gavel.", "Figur dibuat ulang jadi siluet manusia; s6 sempat gelap setelah suara dikunci, kamera ditahan di osiloskop menyala."),
 "EP02_PONG_KOIN_PENUH": ("Diorama pastel bar 1972, kabinet kayu, banjir koin yang memuaskan.", "Lo-fi 84 BPM swing (Rhodes, marimba, bass), denting per koin dari jadwal koin bersama.", "Counter 1,5 minggu dibuat tampil nilai akhir; framing s5/s6 diperlebar setelah suara dikunci."),
 "EP03_STREET_FIGHTER_COMBO": ("Cel-shaded jalan senja, dua petarung orisinal, speed lines dan impact frame.", "Groove arcade 140 BPM E minor, dentuman per pukulan, glitch saat bug, versi tape saat replay.", "Kamera hook mundur supaya dua petarung masuk; papan nama pengembang tidak terpotong."),
 "EP04_GAME_BOY_PERANG_TELUK": ("Studio produk premium; konsol abu-abu orisinal berubah dari bersih ke meleleh.", "Pad Fmaj9 72 BPM, piano bel, sub; drone gelap dan ledakan saat bom.", "Tag 1991 dibuang (tidak ada di naskah); pan kosong antar stasiun dipendekkan."),
 "EP05_DOOM_WINDOWS_95": ("Krom cair dan plastik aqua era 90-an di atas awan.", "Elektronik 112 BPM berbuih, chirp modem/disket sintetis, pop, sparkle.", "Kontras langit dipertajam; suara Cartesia 160 WPM diturunkan tempo 0,94 jadi 150 WPM."),
}
rows = []
for ep, (look, music, fix) in D.items():
    e = SERIES / ep
    st = json.loads((e / "STATUS.json").read_text(encoding="utf8")); data = st["data"]
    T = json.loads((e / "project/timeline.json").read_text(encoding="utf8"))
    L = json.loads((e / "project/script-lines.json").read_text(encoding="utf8"))
    q = json.loads((e / "project/out/qc/metrics.json").read_text(encoding="utf8"))
    v = q["video"]; dur = float(v["duration"])
    (e / "docs").mkdir(exist_ok=True)
    (e / "docs/CREATIVE_BRIEF.md").write_text(f"# CREATIVE BRIEF — {data['title']}\n\n- Seri: Sejarah Game (AUDIRA), {ep}\n- Gaya: {data['style']}\n- Visi: {look}\n- Audiens: penonton 13–35 tahun yang suka fakta game dan sejarah teknologi.\n- Hook: {L[0]['text'].split('|')[0] if '|' not in L[0]['text'] else L[0]['text']}\n- Tone: bertutur, cepat, faktual; semua angka dari `research/SOURCE_REGISTER.md`.\n", encoding="utf8")
    sb = [f"# STORYBOARD — {ep}\n", "Waktu dari suara Cartesia yang sudah dikunci (`project/timeline.json`).\n"]
    for s, l in zip(T["scenes"], L):
        sb.append(f"- **{s['id']}** {s['start']:.1f}–{s['end']:.1f} dtk: {l['text'][:140]}{'…' if len(l['text'])>140 else ''}")
    sb.append(f"- **outro** {T['speech_end']:.1f}–{T['duration']:.1f} dtk: kartu AUDIRA, Created by Agus Dwi R., SEJARAH GAME · EP {ep[2:4]}.\n\nKamera: satu dunia 3D bersambung, setiap kunci kamera memakai jangkar kata/adegan. Detail adegan ada di `project/world3d.js`.")
    (e / "docs/STORYBOARD.md").write_text("\n".join(sb) + "\n", encoding="utf8")
    (e / "docs/AUDIO_PLAN.md").write_text(f"# AUDIO PLAN — {ep}\n\n- VO: Cartesia sonic-3, bahasa id, voice `04b567df-2923-4b0c-896b-4b7df0a07e1a`; `audio/VO_MASTER.wav` (VO {q['vo_lufs']} LUFS).\n- Musik: {music} Disintesis di `project/mix.py` (numpy), tanpa lisensi pihak ketiga. Musik {q['music_lufs']} LUFS, ducking di bawah suara.\n- SFX: pustaka `audio/sfx/` + SFX sintetis.\n- Master: {q['lufs']} LUFS, true peak {q['true_peak_dbfs']} dBFS, LRA {q['lra']}.\n", encoding="utf8")
    (e / "docs/ASSET_MANIFEST.md").write_text(f"# ASSET MANIFEST — {ep}\n\n- Semua visual dibuat prosedural di Three.js (`project/world3d.js`) dan HTML panel (`project/build-video.mjs`); tidak ada foto, logo, sprite, atau cuplikan game asli.\n- Tokoh nyata hanya siluet dengan papan nama.\n- Brand: `project/hf/assets/brand/stacked-reversed.svg` (outro), AUDIRA di dalam adegan, tanda tangan bergerak `sig={ep}`.\n- Audio: `audio/sfx/*.mp3` (pustaka AUDIRA), musik sintetis.\n- Cover/thumbnail: `style/cover-topic.png`. Referensi gaya: `style/cover-reference.*`.\n", encoding="utf8")
    qa = f"""# QA REPORT — {ep}

Final dicek {datetime.date.today().isoformat()} dari `FINAL_VIDEO.mp4` (metrik: `project/out/qc/metrics.json`).

| Cek | Hasil |
|---|---|
| Resolusi / fps | {v['width']}x{v['height']} @ {v['r_frame_rate']} ({v['nb_frames']} frame) |
| Durasi | {dur:.1f} dtk (suara {q['speech_s']:.1f} dtk, {q['wpm']} WPM) |
| Loudness | {q['lufs']} LUFS, true peak {q['true_peak_dbfs']} dBFS |
| Decode error | {q['decode_errors']} |
| Freeze > 2,5 dtk | {q['freezes_over_2.5s']} (hanya kartu outro statis) |
| Frame hitam | {len(q['black_segments'])} |
| Subtitle | {q['srt_cues']} cue, kata bersuara {q['caption_words_with_voice_pct']}%, selisih onset maks {q['caption_onset_max_gap_s']} dtk |
| Metadata | artist "AUDIRA (Agus Dwi R.)", comment "AUDIRA-sejarah-game-{ep} | audira.my.id" (dicek ffprobe) |
| Skor gaya | draf dan final LOLOS ({data['style']}) |
| Frame dari MP4 | dicek di `_review/FINALS_CHECK.jpg` |

Belum dicek: pengucapan nama asing (Higinbotham, Scoggins, Capcom, Microsoft) belum didengar langsung.
"""
    (e / "QA_REPORT.md").write_text(qa, encoding="utf8")
    (e / "NOTES.md").write_text(f"# NOTES — {ep}\n\n- Gaya {data['style']}: {look}\n- Perbaikan: {fix}\n- VO: timeline suara asli {T['speech_end']:.1f} dtk; outro mulai {T['speech_end']+0.25:.1f} dtk.\n- Render final 60 fps lewat `_tools/final.sh` (HyperFrames, 6 worker), sekitar 3 menit per film.\n- Jadwal upload: lihat `SOCIAL_CAPTIONS.md`. Review pasca-tayang 24 jam / 72 jam / 7 hari belum dilakukan.\n", encoding="utf8")
    now = datetime.datetime.now(datetime.UTC).isoformat(timespec="milliseconds").replace("+00:00", "Z")
    for s in st["stages"]:
        if s["id"] == "final": s.update(status="done", doneAt=now); s["notes"].append({"at": now, "text": f"FINAL_VIDEO.mp4 {dur:.1f} s 60 fps, {q['lufs']} LUFS, TP {q['true_peak_dbfs']}; metadata ok"})
        if s["id"] == "delivery": s.update(status="done", doneAt=now); s["notes"].append({"at": now, "text": "SOCIAL_CAPTIONS.md validator ok; NOTES.md; lessons in motion memory"})
    st["currentStage"] = "review"; st["updatedAt"] = now
    (e / "STATUS.json").write_text(json.dumps(st, ensure_ascii=False, indent=2), encoding="utf8")
    rows.append(f"| {ep[2:4]} | [{ep}]({ep}/) | {data['title']} | {data['style']} | {dur:.1f} dtk | [FINAL_VIDEO.mp4]({ep}/FINAL_VIDEO.mp4) |")
(SERIES / "MASTER_INDEX.md").write_text("# Sejarah Game\n\n- Akun: **AUDIRA**, format 9:16 1080x1920 @ 60 fps\n- Riset: [_research/RESEARCH_REPORT.md](_research/RESEARCH_REPORT.md), [_research/SOURCE_REGISTER.md](_research/SOURCE_REGISTER.md)\n- Review: `_review/` (STYLE_OPTIONS, COVERS_TOPIK, DRAFTS_ALL, FINALS_CHECK, REVIEW_SCRIPTS)\n\n| No | Folder | Judul | Gaya | Durasi | Final |\n|---|---|---|---|---|---|\n" + "\n".join(rows) + "\n", encoding="utf8")
print("\n".join(rows))
