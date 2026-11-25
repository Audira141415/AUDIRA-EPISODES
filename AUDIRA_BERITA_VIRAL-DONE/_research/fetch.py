import html, io, re, sys, os, urllib.request
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf8", errors="replace")
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/130 Safari/537.36"}
N = int(os.environ.get("N", "3500"))
for u in sys.argv[1:]:
    try:
        t = urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=30).read().decode("utf8", "ignore")
    except Exception as e:
        print("=====", u, "\nFAIL", e); continue
    t = re.sub(r"(?is)<(script|style|noscript)[^>]*>.*?</\1>", "", t)
    ps = [re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", p))).strip() for p in re.findall(r"(?is)<p[^>]*>(.*?)</p>", t)]
    ps = [p for p in ps if len(p) > 40]
    print("=====", u)
    print("\n".join(ps)[:N])
