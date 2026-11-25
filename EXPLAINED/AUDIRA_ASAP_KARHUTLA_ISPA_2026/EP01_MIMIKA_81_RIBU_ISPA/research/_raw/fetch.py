import html, io, re, sys, urllib.request, hashlib, os
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf8", errors="replace")
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/130 Safari/537.36"}
out = os.path.dirname(os.path.abspath(__file__))
for u in sys.argv[1:]:
    try:
        t = urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=30).read().decode("utf8", "ignore")
    except Exception as e:
        print("=====", u, "\nFAIL", e); continue
    t = re.sub(r"(?is)<(script|style|noscript)[^>]*>.*?</\1>", "", t)
    ps = [html.unescape(re.sub(r"<[^>]+>", "", p)).strip() for p in re.findall(r"(?is)<p[^>]*>(.*?)</p>", t)]
    ps = [p for p in ps if len(p) > 40]
    txt = "\n".join(ps)
    print("=====", u, "\n", re.sub(r"s{3,}", " ", txt)[:4500])
