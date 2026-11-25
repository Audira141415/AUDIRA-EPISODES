import json, subprocess
R = {
 "EP01_kahfi": [(18,9,26)],
 "EP02_yunus": [(37,139,148),(21,87,88),(68,48,50),(10,98,98)],
 "EP03_fil": [(105,1,5),(106,1,4)],
 "EP04_musa": [(26,52,68),(20,77,79),(10,90,92),(2,50,50)],
 "EP05_nuh": [(11,25,49),(29,14,15),(71,5,9),(54,9,15),(23,27,27)],
}
for ep, rngs in R.items():
    out=[]
    for s,a,b in rngs:
        for v in range(a,b+1):
            u=f"https://api.quran.com/api/v4/verses/by_key/{s}:{v}?translations=33&fields=text_uthmani"
            d=json.loads(subprocess.run(["curl","-s","-m","30",u],capture_output=True).stdout)["verse"]
            tr=d["translations"][0]["text"]
            out.append(f"QS {s}:{v} | {d['text_uthmani']}\n  ID(Kemenag): {tr}\n")
    open(f"quran/{ep}.txt","w",encoding="utf-8").write("\n".join(out))
    print(ep,len(out))
