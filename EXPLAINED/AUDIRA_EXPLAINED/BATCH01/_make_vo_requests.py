# Build voiceover.json per episode from the approved script.
# TTS text = display text with per-token phonetic swaps (same token count), so captions map 1:1.
import json, re, importlib.util, pathlib
spec=importlib.util.spec_from_file_location("w","_write_scripts.py"); src=open("_write_scripts.py",encoding="utf-8").read()
S={}; exec(src.split("for ep,(title,parts)")[0], S); S=S["S"]
# display-text edits approved in meaning; numerals spelled out so VO and captions match
DISPLAY_FIX={
 "Buktinya pada banjir 1 Januari 2020:":"Buktinya pada banjir awal Januari dua ribu dua puluh:",
 "plat diganti putih sejak 2022:":"plat diganti putih sejak dua ribu dua puluh dua:",
}
PHON={"AKAP":"akap","AKAP?":"akap?","AKAP,":"akap,","Sentinel-1.":"Sentinel-satu.","bio":"bio"}
EP_ID={"EP036-mrt-tidak-kebanjiran":"ep036","EP037-toilet-bus-akap":"ep037","EP038-jakarta-turun-tanah":"ep038","EP040-etle-malam-hari":"ep040","EP043-air-pdam-keruh":"ep043"}
for ep,(title,parts) in S.items():
    lines=[]; n=0
    for si,(sec,txt) in enumerate(parts):
        for a,b in DISPLAY_FIX.items(): txt=txt.replace(a,b)
        sents=re.findall(r"[^.!?]+[.!?]+",txt)
        for j,s in enumerate(sents):
            s=s.strip(); n+=1
            toks=s.split(); tts=" ".join(PHON.get(t,t) for t in toks)
            last=j==len(sents)-1
            lines.append({"id":f"l{n:02d}","who":"narator","section":sec,"speed":1.0,
                          "gap":0.65 if last else 0.32,"text":tts,"display":s})
    sid=EP_ID[ep]
    req={"model":"sonic-3","language":"id","voice":"04b567df-2923-4b0c-896b-4b7df0a07e1a",
         "out_dir":f"F:/AUDIRA-VIDEO-MOTION/EXPLAINED/AUDIRA_EXPLAINED/BATCH01/studio/public/audio/{sid}/clips",
         "meta":f"F:/AUDIRA-VIDEO-MOTION/EXPLAINED/AUDIRA_EXPLAINED/BATCH01/studio/public/audio/{sid}/vo-meta.json",
         "lead":0.6,"tail":4.0,"lines":lines}
    pathlib.Path(ep,"voiceover.json").write_text(json.dumps(req,ensure_ascii=False,indent=1),encoding="utf-8")
    print(ep,len(lines),"lines")
