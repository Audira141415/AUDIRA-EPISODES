"""Third pass: NASA smoulder duration, latest corporate suspect count, peat age and depth."""
import html, re, sys, urllib.parse, urllib.request

src = open("gn.py", encoding="utf8").read().split("q = sys.argv[1]")[0]
ns = {}
exec(src, ns)


def plain(t):
    t = re.sub(r"<(script|style|nav|footer)[^>]*>.*?</\1>", " ", t, flags=re.S)
    ps = re.findall(r"<p[^>]*>(.*?)</p>", t, re.S)
    return "\n".join(re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", p))).strip() for p in ps)


for k, q in {
    "nasa": "NASA Peringatkan Bahaya Kebakaran Bawah Tanah Indonesia Membara Berbulan-bulan",
    "korp20": "20 korporasi tersangka karhutla when:14d",
    "ganti": "Tak Cukup Tersangka Korporasi Ganti Rugi Pemulihan Lingkungan Karhutla",
    "gambutdalam": "kedalaman api gambut karhutla pakar IPB smouldering 2026 when:60d",
}.items():
    rss = ns["get"]("https://news.google.com/rss/search?" + urllib.parse.urlencode({"q": q, "hl": "id", "gl": "ID", "ceid": "ID:id"}))
    items = re.findall(r"<item>.*?<title>(.*?)</title>.*?<link>(.*?)</link>.*?<pubDate>(.*?)</pubDate>", rss, re.S)[:2]
    for i, (title, link, date) in enumerate(items):
        try:
            u = ns["decode"](html.unescape(link))
            body = plain(ns["get"](u))
            open(f"txt/{k}{i}.txt", "w", encoding="utf8").write(f"{html.unescape(title)}\n{date}\n{u}\n\n{body}")
            print("=====", k, i, date[5:16], html.unescape(title)[:90], u)
            print(body[:2300])
        except Exception as e:
            print(k, i, "ERR", str(e)[:100], html.unescape(title)[:80])
