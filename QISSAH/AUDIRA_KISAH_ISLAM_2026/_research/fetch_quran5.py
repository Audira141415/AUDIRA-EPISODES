import json, subprocess
R = {
 "EP21_zakaria": [(19,2,15),(3,38,41)],
 "EP22_sabt": [(7,163,166),(2,65,66)],
 "EP23_luqman": [(31,12,19)],
 "EP24_seratus_tahun": [(2,259,259)],
 "EP25_saba": [(34,15,19)],
}
for ep, rngs in R.items():
    out=[]
    for s,a,b in rngs:
        for v in range(a,b+1):
            u=f"https://api.quran.com/api/v4/verses/by_key/{s}:{v}?translations=33&fields=text_uthmani"
            d=json.loads(subprocess.run(["curl","-s","-m","30",u],capture_output=True).stdout)["verse"]
            out.append(f"QS {s}:{v} | {d['text_uthmani']}\n  ID(Kemenag): {d['translations'][0]['text']}\n")
    open(f"quran/{ep}.txt","w",encoding="utf-8").write("\n".join(out)); print(ep,len(out))
