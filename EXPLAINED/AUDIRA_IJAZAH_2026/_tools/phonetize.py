"""Adds {display|spoken} markup to script-lines.json so Cartesia reads numbers and acronyms in Indonesian.
Existing markup is kept. Run from AUDIRA_IJAZAH_2026: python _tools/phonetize.py EP05_RANTAI_FOTO [...]"""
import json, re, sys
U = "nol satu dua tiga empat lima enam tujuh delapan sembilan sepuluh sebelas".split()
def num(n):
    if n < 12: return U[n]
    if n < 20: return U[n - 10] + " belas"
    if n < 100: return U[n // 10] + " puluh" + ("" if n % 10 == 0 else " " + U[n % 10])
    if n < 200: return "seratus" + ("" if n == 100 else " " + num(n - 100))
    if n < 1000: return U[n // 100] + " ratus" + ("" if n % 100 == 0 else " " + num(n % 100))
    if n < 2000: return "seribu" + ("" if n == 1000 else " " + num(n - 1000))
    return num(n // 1000) + " ribu" + ("" if n % 1000 == 0 else " " + num(n % 1000))
ACR = {"UGM": "U Ge Em", "KPU": "Ka Pe U", "PN": "Pe En", "X": "eks", "AI": "e ai", "ITE": "I Te E", "KUHP": "Ka U Ha Pe",
       "AFU": "A Ef U", "JPKP": "Je Pe Ka Pe", "AKBP": "A Ka Be Pe", "SD": "Es De", "S1": "Es satu", "BAP": "Be A Pe",
       "@HyperPoison": "Haiper Poison", "HyperPoison": "Haiper Poison", "UU": "U U", "Labfor": "Labfor"}
TOK = re.compile(r"(\{[^}]*\})|(\S+)")
def fix(tok):
    m = re.match(r"^([\"“(]?)(.*?)([.,:;?!”)]*)$", tok)
    pre, core, post = m.groups()
    if core in ACR and ACR[core] != core: return "{%s|%s}" % (tok, pre + ACR[core] + post)
    if re.fullmatch(r"\d+", core): return "{%s|%s}" % (tok, pre + num(int(core)) + post)
    return tok
for d in sys.argv[1:]:
    f = f"{d}/script-lines.json"
    L = json.load(open(f, encoding="utf8"))
    for l in L:
        l["text"] = " ".join(a if a else fix(b) for a, b in TOK.findall(l["text"]))
    json.dump(L, open(f, "w", encoding="utf8"), ensure_ascii=False, indent=1)
    for l in L:
        print(d[:4], l["id"], re.sub(r"\{([^|}]*)\|([^}]*)\}", r"\2", l["text"]))
