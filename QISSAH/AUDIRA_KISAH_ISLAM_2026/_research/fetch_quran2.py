import json, subprocess
R = {
 "EP06_ibrahim": [(21,51,73),(37,83,98),(6,74,79)],
 "EP07_sulaiman": [(27,15,44)],
 "EP08_yusuf": [(12,4,6),(12,43,57)],
 "EP09_khidir": [(18,60,82)],
 "EP10_dzulqarnain": [(18,83,98)],
}
for ep, rngs in R.items():
    out=[]
    for s,a,b in rngs:
        for v in range(a,b+1):
            u=f"https://api.quran.com/api/v4/verses/by_key/{s}:{v}?translations=33&fields=text_uthmani"
            d=json.loads(subprocess.run(["curl","-s","-m","30",u],capture_output=True).stdout)["verse"]
            out.append(f"QS {s}:{v} | {d['text_uthmani']}\n  ID(Kemenag): {d['translations'][0]['text']}\n")
    open(f"quran/{ep}.txt","w",encoding="utf-8").write("\n".join(out)); print(ep,len(out))
