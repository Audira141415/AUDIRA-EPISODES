"""Viral news 8 Nov 2026: 3 topics, up to 3 articles per query. TLS verification stays on. Run: python gn11.py out.txt"""
import re, sys
src = open("gn5.py", encoding="utf8").read()
head = src.split("with open(OUT")[0]
head = re.sub(r"QUERIES = \[.*?\n\]\n", "QUERIES = []\n", head, flags=re.S)
head = re.sub(r"TAILS = \[.*?\n\]\n", "TAILS = []\n", head, flags=re.S)
exec(compile(head, "gn11head", "exec"))
QS = [("MBG","BGN tanggapi siswa review daging MBG alot Bengkulu"),("MBG","SPPG minta maaf siswa review MBG"),("MBG","review daging MBG alot Bengkulu"),("SWIFT","penyebab satelit Swift jatuh orbit menurun aktivitas matahari"),("SWIFT","NASA Swift reboost Katalyst misi penyelamatan"),("LISTRIK","PLN Balikpapan tagihan listrik naik pemadaman"),("LISTRIK","cara cek tagihan listrik naik meteran PLN pengaduan")]
seen = set()
with open(sys.argv[1], "w", encoding="utf8") as f:
    for tag, q in QS:
        url = "https://news.google.com/rss/search?q=" + urllib.parse.quote(q + " when:5d") + "&hl=id&gl=ID&ceid=ID:id"
        try: items = re.findall(r"<item>(.*?)</item>", get(url), re.S)
        except Exception as e: print("RSSFAIL", q); continue
        n = 0
        for it in items[:7]:
            if n >= 3: break
            t = html.unescape(re.search(r"<title>(.*?)</title>", it, re.S).group(1))
            if t in seen or "antaranews" in t.lower(): continue
            link = re.search(r"<link>(.*?)</link>", it).group(1); date = re.search(r"<pubDate>(.*?)</pubDate>", it).group(1)
            try: real = decode(link); body = clean(get(real))
            except Exception as e: print("FAIL", t[:60], repr(e)[:50]); continue
            if len(body) < 400: continue
            seen.add(t); n += 1
            f.write(f"\n##### [{tag}] {t}\nQ: {q}\nURL: {real}\nDATE: {date[5:22]}\n{body[:4000]}\n")
        print(tag, n, q)
