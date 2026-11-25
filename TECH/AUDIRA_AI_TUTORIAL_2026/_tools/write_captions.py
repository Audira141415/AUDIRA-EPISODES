"""Write SOCIAL_CAPTIONS.md (6 platforms) per Batch 1 episode from _tools/captions_data.json.
Chapters come from studio/src/scenes/<ep>/timeline.json sections. Usage (from BATCH01): python _tools/write_captions.py"""
import json, glob, sys

LBL = {"hook": "Hook", "konteks": "Konteks", "langkah": "Langkah-langkah", "penjelasan": "Penjelasan", "payoff": "Tips & peringatan", "outro": "Penutup"}


def mmss(t):
    t = int(t)
    return f"{t // 60}:{t % 60:02d}"


E = json.load(open(sys.argv[1] if len(sys.argv) > 1 else "_tools/captions_data.json", encoding="utf-8"))
for ep, e in E.items():
    d = glob.glob(f"EP{ep[2:]}_*")[0]
    tl = json.load(open(f"studio/src/scenes/{ep}/timeline.json", encoding="utf-8"))
    ch = "\n".join(f"{mmss(a)} {LBL[k]}" for k, (a, b) in tl["sections"].items())
    ch += f"\n{mmss(tl['sections']['outro'][1])} Created by Agus Dwi R."
    L = [f"# SOCIAL CAPTIONS: {e['title']}", "",
         "AUDIRA AI TUTORIAL 2026. Created by Agus Dwi R. Thumbnail: `style/cover-topic.png`. Video: `FINAL_VIDEO.mp4`.", "",
         "## TikTok", "", f"**Hook:** {e['hook']}", "", f"**Cover Text:** {e['cover']}", "", f"**Caption:** {e['tt']}", "",
         f"**Pinned Comment:** {e['pin']}", "", f"**Hashtags:** {e['tags']}", "",
         "## Instagram Reels", "", "**5-Point Value Breakdown:**", ""]
    L += [f"{i + 1}. {p}" for i, p in enumerate(e["points"])]
    L += ["", f"**Caption:** {e['ig']}", "", f"**Audio Cue:** {e['audio']}", "", f"**Hashtags:** {e['tags']}", "",
          "## YouTube Shorts", "", f"**Judul:** {e['title']}", "", "**Alternatif Judul:**"]
    L += [f"- {a}" for a in e["alt"]]
    L += ["", "**Deskripsi:**", "", e["desc"], "", "Chapters:", ch, "", "Created by Agus Dwi R. AUDIRA AI Tutorial.", "", e["tags"], "",
          f"**Tags:** {e['ytags']}", "", f"**Pinned Comment:** {e['ytpin']}", "", f"**Thumbnail:** {e['thumb']}", "",
          "## Facebook Reels", "", f"**Caption:** {e['fb']}", "", f"**Discussion Trigger:** {e['fbq']}", "", f"**Hashtags:** {e['tags']}", "",
          "## X/Twitter", "", f"**Cuitan tunggal:** {e['x1']}", "", "**Viral Hook Thread:**", ""]
    for t in e["thread"]:
        L += [t, ""]
    L += ["## Threads", "", "**Post pembuka + utas:**", ""]
    for t in e["th"]:
        L += [t, ""]
    d8 = e["date"]
    L += ["## Jadwal Upload (WIB)", "", f"Hari: {d8}. Slot utama malam (default awal pola penonton Indonesia, bukan data akun; ganti dengan jam aktif follower dari TikTok Analytics, Instagram Insights, YouTube Studio setelah 2-4 minggu).", "",
          f"- TikTok: {d8}, 19.00 WIB", f"- Instagram Reels: {d8}, 19.20 WIB", f"- YouTube Shorts: {d8}, 19.40 WIB",
          f"- Facebook Reels: {d8}, 20.00 WIB", f"- X/Twitter: {d8}, 20.20 WIB", f"- Threads: {d8}, 20.40 WIB", "",
          "## Label Konten AI", "", "Centang label AI di tiap platform karena VO (Cartesia) dan visual dibuat dengan AI:",
          "- TikTok: AI-generated content", "- YouTube: Altered or synthetic content", "- Meta (Facebook dan Instagram): AI info", "",
          "## Catatan Upload", "", f"- Teks cover (3-5 kata) semua platform: {e['cover']}",
          "- Upload `SUBTITLES.srt` ke YouTube Shorts dan Facebook.",
          f"- Seri: AUDIRA AI TUTORIAL #{e["no"]} dari {5 if e["no"] <= 5 else 10}, playlist AUDIRA AI TUTORIAL; episode sebelumnya: {e['prev']} (tambahkan tautannya di komentar pin setelah tayang).",
          "- Musik: bed prosedural buatan sendiri (bebas lisensi), SFX dari pustaka AUDIRA `shared/assets/sfx` (lihat SOURCE_REGISTER.md).", ""]
    open(f"{d}/SOCIAL_CAPTIONS.md", "w", encoding="utf-8").write("\n".join(L))
    print(d, "x1", len(e["x1"]), "thread", [len(t) for t in e["thread"]], "threads", [len(t) for t in e["th"]])
