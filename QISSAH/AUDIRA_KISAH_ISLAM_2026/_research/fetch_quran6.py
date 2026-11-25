import json, subprocess
R = {
 "EP26_ibrahim_namrud": [(2,258,258)],
 "EP27_hajar_zamzam": [(14,35,41),(2,158,158)],
 "EP28_musa_penyihir": [(20,56,73),(7,117,122)],
 "EP29_maryam_kurma": [(19,16,26)],
 "EP30_daud_besi": [(34,10,11),(21,79,80),(38,17,20)],
}
for ep, rngs in R.items():
    out=[]
    for s,a,b in rngs:
        for v in range(a,b+1):
            u=f"https://api.quran.com/api/v4/verses/by_key/{s}:{v}?translations=33&fields=text_uthmani"
            d=json.loads(subprocess.run(["curl","-s","-m","30",u],capture_output=True).stdout)["verse"]
            out.append(f"QS {s}:{v} | {d['text_uthmani']}\n  ID(Kemenag): {d['translations'][0]['text']}\n")
    open(f"quran/{ep}.txt","w",encoding="utf-8").write("\n".join(out)); print(ep,len(out))
