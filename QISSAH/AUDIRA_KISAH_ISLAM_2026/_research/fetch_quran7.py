import json, subprocess
R = {
 "EP31_ibrahim_burung": [(2,260,260)],
 "EP32_bayi_musa_peti": [(28,7,13),(20,37,40)],
 "EP33_ratu_saba_lantai_kaca": [(27,29,44)],
 "EP34_lelaki_ujung_kota": [(36,13,29)],
 "EP35_dua_belas_mata_air": [(2,60,61),(7,160,160)],
}
for ep, rngs in R.items():
    out=[]
    for s,a,b in rngs:
        for v in range(a,b+1):
            u=f"https://api.quran.com/api/v4/verses/by_key/{s}:{v}?translations=33&fields=text_uthmani"
            d=json.loads(subprocess.run(["curl","-s","-m","30",u],capture_output=True).stdout)["verse"]
            out.append(f"QS {s}:{v} | {d['text_uthmani']}\n  ID(Kemenag): {d['translations'][0]['text']}\n")
    open(f"quran/{ep}.txt","w",encoding="utf-8").write("\n".join(out)); print(ep,len(out))
