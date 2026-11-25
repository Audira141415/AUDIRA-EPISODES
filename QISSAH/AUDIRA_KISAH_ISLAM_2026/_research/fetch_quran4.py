import json, subprocess
R = {
 "EP16_ayyub": [(21,83,84),(38,41,44)],
 "EP17_ukhdud": [(85,1,11)],
 "EP18_sapi": [(2,67,74)],
 "EP19_hud_ad": [(89,6,8),(46,21,26),(69,6,8),(26,123,140)],
 "EP20_syuaib": [(11,84,95),(7,85,85),(83,1,6)],
}
for ep, rngs in R.items():
    out=[]
    for s,a,b in rngs:
        for v in range(a,b+1):
            u=f"https://api.quran.com/api/v4/verses/by_key/{s}:{v}?translations=33&fields=text_uthmani"
            d=json.loads(subprocess.run(["curl","-s","-m","30",u],capture_output=True).stdout)["verse"]
            out.append(f"QS {s}:{v} | {d['text_uthmani']}\n  ID(Kemenag): {d['translations'][0]['text']}\n")
    open(f"quran/{ep}.txt","w",encoding="utf-8").write("\n".join(out)); print(ep,len(out))
