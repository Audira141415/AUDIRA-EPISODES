import json, subprocess
R = {
 "EP11_qarun": [(28,76,83)],
 "EP12_habil_qabil": [(5,27,32)],
 "EP13_unta_saleh": [(7,73,79),(26,141,159),(91,11,15),(54,27,29)],
 "EP14_thalut_jalut": [(2,246,251)],
 "EP15_kebun": [(68,17,33)],
}
for ep, rngs in R.items():
    out=[]
    for s,a,b in rngs:
        for v in range(a,b+1):
            u=f"https://api.quran.com/api/v4/verses/by_key/{s}:{v}?translations=33&fields=text_uthmani"
            d=json.loads(subprocess.run(["curl","-s","-m","30",u],capture_output=True).stdout)["verse"]
            out.append(f"QS {s}:{v} | {d['text_uthmani']}\n  ID(Kemenag): {d['translations'][0]['text']}\n")
    open(f"quran/{ep}.txt","w",encoding="utf-8").write("\n".join(out)); print(ep,len(out))
