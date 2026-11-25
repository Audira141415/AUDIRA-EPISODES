"""Write SOCIAL_CAPTIONS.md (6 platforms) per Batch 1 episode from _tools/captions_data.json.
Chapters come from studio/src/scenes/<ep>/timeline.json sections. Usage (from BATCH01): python _tools/write_captions.py"""
import json, glob

LBL = {"HOOK": "Hook", "KONTEKS": "Konteks", "MEKANISME": "Mekanisme", "REVEAL": "Reveal", "PAYOFF": "Payoff", "OUTRO": "Penutup"}


def mmss(t):
    t = int(t)
    return f"{t // 60}:{t % 60:02d}"


E = json.load(open("_tools/captions_data.json", encoding="utf-8"))
for ep, e in E.items():
    d = glob.glob(f"EP{ep[2:]}-*")[0]
    tl = json.load(open(f"studio/src/scenes/{ep}/timeline.json", encoding="utf-8"))
    ch = "\n".join(f"{mmss(a)} {LBL[k]}" for k, (a, b) in tl["sections"].items())
    ch += f"\n{mmss(tl['sections']['OUTRO'][1])} Created by Agus Dwi R."
    L = [f"# SOCIAL CAPTIONS: {e['title']}", "",
         "AUDIRA EXPLAINED, Batch 1. Created by Agus Dwi R. Thumbnail: `style/cover-topic.png`. Video: `FINAL_VIDEO.mp4`.", "",
         "## TikTok", "", f"**Hook:** {e['hook']}", "", f"**Cover Text:** {e['cover']}", "", f"**Caption:** {e['tt']}", "",
         f"**Pinned Comment:** {e['pin']}", "", f"**Hashtags:** {e['tags']}", "",
         "## Instagram Reels", "", "**5-Point Value Breakdown:**", ""]
    L += [f"{i + 1}. {p}" for i, p in enumerate(e["points"])]
    L += ["", f"**Caption:** {e['ig']}", "", f"**Audio Cue:** {e['audio']}", "", f"**Hashtags:** {e['tags']}", "",
          "## YouTube Shorts", "", f"**Judul:** {e['title']}", "", "**Alternatif Judul:**"]
    L += [f"- {a}" for a in e["alt"]]
    L += ["", "**Deskripsi:**", "", e["desc"], "", "Chapters:", ch, "", "Created by Agus Dwi R. AUDIRA Explained.", "", e["tags"], "",
          f"**Tags:** {e['ytags']}", "", f"**Pinned Comment:** {e['ytpin']}", "", f"**Thumbnail:** {e['thumb']}", "",
          "## Facebook Reels", "", f"**Caption:** {e['fb']}", "", f"**Discussion Trigger:** {e['fbq']}", "", f"**Hashtags:** {e['tags']}", "",
          "## X/Twitter", "", f"**Cuitan tunggal:** {e['x1']}", "", "**Viral Hook Thread:**", ""]
    for t in e["thread"]:
        L += [t, ""]
    L += ["## Threads", "", "**Post pembuka + utas:**", ""]
    for t in e["th"]:
        L += [t, ""]
    open(f"{d}/SOCIAL_CAPTIONS.md", "w", encoding="utf-8").write("\n".join(L))
    print(d, "x1", len(e["x1"]), "thread", [len(t) for t in e["thread"]], "threads", [len(t) for t in e["th"]])
