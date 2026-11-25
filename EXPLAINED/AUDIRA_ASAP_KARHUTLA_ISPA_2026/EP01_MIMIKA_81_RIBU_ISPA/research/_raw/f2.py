import html, io, re, sys, urllib.request
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf8", errors="replace")
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/130 Safari/537.36"}
kw = re.compile(sys.argv[1], re.I)
for u in sys.argv[2:]:
    try:
        t = urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=30).read().decode("utf8", "ignore")
    except Exception as e:
        print("=====", u, "\nFAIL", e); continue
    t = re.sub(r"(?is)<(script|style|noscript)[^>]*>.*?</\1>", "", t)
    t = re.sub(r"(?is)<br\s*/?>|</p>|</div>|</li>", "\n", t)
    lines = [re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", l))).strip() for l in t.split("\n")]
    seen=set(); out=[]
    for l in lines:
        if len(l) > 70 and l not in seen and kw.search(l):
            seen.add(l); out.append(l)
    print("=====", u); print("\n".join(out)[:3500])
