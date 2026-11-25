"""Viral news 8 Nov 2026: 3 topics, up to 3 articles per query. TLS verification stays on. Run: python gn11.py out.txt"""
import re, sys
src = open("gn5.py", encoding="utf8").read()
head = src.split("with open(OUT")[0]
head = re.sub(r"QUERIES = \[.*?\n\]\n", "QUERIES = []\n", head, flags=re.S)
head = re.sub(r"TAILS = \[.*?\n\]\n", "TAILS = []\n", head, flags=re.S)
exec(compile(head, "gn11head", "exec"))
QS = [("GIBRAN","Gibran viral"),("GIBRAN","Gibran Wapres terbaru"),("GIBRAN","hoaks Gibran transfer uang Raffi Ahmad Willie Salim Polri"),
      ("GIBRAN","video aktivis turunkan foto Gibran"),("GIBRAN","Gibran mundur Burhanuddin Muhtadi"),
      ("PRABOWO","Prabowo viral"),("PRABOWO","Prabowo penyadapan makar tanggapan"),("PRABOWO","Presiden Prabowo hari ini pernyataan"),
      ("PRABOWO","Prabowo reshuffle kabinet November"),("JOKOWI","Jokowi viral terbaru"),("JOKOWI","Jokowi Gibran Prabowo hubungan retak"),
      ("TRIO","Prabowo Jokowi Gibran penyadapan Listyo")]
seen = set()
with open(sys.argv[1], "w", encoding="utf8") as f:
    for tag, q in QS:
        url = "https://news.google.com/rss/search?q=" + urllib.parse.quote(q + " when:3d") + "&hl=id&gl=ID&ceid=ID:id"
        try: items = re.findall(r"<item>(.*?)</item>", get(url), re.S)
        except Exception as e: print("RSSFAIL", q); continue
        n = 0
        for it in items[:7]:
            if n >= 4: break
            t = html.unescape(re.search(r"<title>(.*?)</title>", it, re.S).group(1))
            if t in seen or "antaranews" in t.lower(): continue
            link = re.search(r"<link>(.*?)</link>", it).group(1); date = re.search(r"<pubDate>(.*?)</pubDate>", it).group(1)
            try: real = decode(link); body = clean(get(real))
            except Exception as e: print("FAIL", t[:60], repr(e)[:50]); continue
            if len(body) < 400: continue
            seen.add(t); n += 1
            f.write(f"\n##### [{tag}] {t}\nQ: {q}\nURL: {real}\nDATE: {date[5:22]}\n{body[:1800]}\n")
        print(tag, n, q)
