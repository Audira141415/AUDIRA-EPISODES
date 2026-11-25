"""Build EPxx_*/voiceover.json from SCRIPTS_DRAFT.md (one line per sentence).
TTS text gets phonetic swaps that keep the word count equal to the display text (captions map 1:1).
Usage (from AUDIRA_AI_TUTORIAL_2026): python _tools/make_vo_requests.py [SCRIPTS_DRAFT_B2.md]"""
import sys
import json, re, glob
PHON = [(r"\bAUDIRA\b", "Audira"), (r"\bgemini\.google\.com\b", "jemini-titik-gugel-titik-kom"),
        (r"\bGemini\b", "Jemini"), (r"\bGoogle-mu\b", "Gugel-mu"), (r"\bGoogle\b", "Gugel"),
        # whisper tests 2026-11-08: English terms (NotebookLM, PDF, PR, slide, Add image, Add files, More tools,
        # Guided Learning, ...) read clearer as written; "e-ai" read as "i"/"saya", "ei-ai" reads "AI"; "SynthID" read "SIM-TD"
        (r"\bPowerPoint\b", "Pawerpoin"), (r"\bYouTube\b", "Yutub"),
        (r"\bSynthID\b", "Sint-ai-di"), (r"\bAI\b", "ei-ai"), (r"\bJuli 2026\b", "Juli dua-ribu-dua-puluh-enam"),
        (r"\bNano Banana 2\b", "Nano Banana dua"), (r"\bOmni\b", "Omni"), (r"\bpas foto\b", "pas foto"),
        # batch 2: "Upload & tools", "Share & export", "Select & ask", "Settings & help"
        (r"(?<= )&(?= )", "en"), (r"\blo-fi\b", "lo-fai")]
t = open(sys.argv[1] if len(sys.argv) > 1 else "SCRIPTS_DRAFT.md", encoding="utf-8").read()
for part in re.split(r"\n## ", t)[1:]:
    ep = part[:4]
    if not re.match(r"EP\d\d", ep): continue
    num = ep[2:]; d = glob.glob(f"{ep}_*")[0]; lines = []; n = 0
    secs = re.findall(r"\*\*\[([A-Z]+) [^\]]+\]\*\* (.+)", part)
    for sec, txt in secs:
        sents = re.findall(r"(?:[^.?!]|\.(?=\w))+(?:\.(?!\w)|[?!])+", txt)
        assert "".join(sents).replace(" ", "") == txt.replace(" ", ""), (ep, sec, sents)
        for j, s in enumerate(sents):
            s = s.strip(); n += 1; tt = s
            for a, b in PHON: tt = re.sub(a, b, tt)
            assert len(tt.split()) == len(s.split()), (ep, s, tt)
            lines.append({"id": f"l{n:02d}", "who": "narator", "section": sec.lower(), "speed": 1.0,
                          "gap": 0.6 if j == len(sents) - 1 else 0.3, "text": tt, "display": s})
    base = f"F:/AUDIRA-VIDEO-MOTION/TECH/AUDIRA_AI_TUTORIAL_2026/studio/public/audio/ep{num}"
    req = {"model": "sonic-3", "language": "id", "voice": "04b567df-2923-4b0c-896b-4b7df0a07e1a",
           "out_dir": base + "/clips", "meta": base + "/vo-meta.json", "lead": 0.6, "tail": 4.2, "target_vo_end": 86.0, "lines": lines}
    json.dump(req, open(f"{d}/voiceover.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(ep, len(lines), "lines")
