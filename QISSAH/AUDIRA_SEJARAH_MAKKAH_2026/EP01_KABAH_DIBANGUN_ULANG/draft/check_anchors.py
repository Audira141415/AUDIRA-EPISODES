import json, re, glob, sys
d = json.load(open(sys.argv[1] + "/timeline.json", encoding="utf8"))
norm = lambda s: re.sub(r"[.,:;?!]", "", s.lower())
bad = 0
for f in glob.glob(sys.argv[1] + "/*.ts*"):
    src = open(f, encoding="utf8").read()
    for m in re.finditer(r'W\("(c\d\d)",\s*"([^"]+)"(?:,\s*(\d+))?\)', src):
        ch, w, n = m.group(1), m.group(2), int(m.group(3) or 0)
        hits = [x for c in d["clips"] if c["chapter"].startswith(ch) for x in c["words"] if norm(x["w"]) == norm(w)]
        if len(hits) <= n:
            bad += 1
            print("MISSING", f.split("\\")[-1].split("/")[-1], ch, w, n, len(hits))
print("bad", bad)
