"""Today's (6 Nov 2026) follow-up stories. TLS verification stays on. Run: python gn9.py out.txt"""
import re, sys
src = open("gn5.py", encoding="utf8").read()
head = src.split("with open(OUT")[0]
head = re.sub(r"QUERIES = \[.*?\n\]\n", "QUERIES = []\n", head, flags=re.S)
head = re.sub(r"TAILS = \[.*?\n\]\n", "TAILS = []\n", head, flags=re.S)
exec(compile(head, "gn9head", "exec"))
QS = [("Kuasa Hukum Sampai Diusir Hakim Tifa Jokowi", 2), ("UGM respons Jokowi tunjukkan ijazah sidang", 3), ("Jokowi pertanyakan pengujian ulang ijazah sidang", 2), ("Dian Sandi dihadirkan sidang Roy Suryo ditanyakan", 2), ("Jokowi kembali ke Solo usai sidang ijazah capek", 1), ("Jokowi sanggah 31 video sidang", 1)]
seen = set()
with open(sys.argv[1], "w", encoding="utf8") as f:
    for q, limit in QS:
        url = "https://news.google.com/rss/search?q=" + urllib.parse.quote(q + " when:2d") + "&hl=id&gl=ID&ceid=ID:id"
        items = re.findall(r"<item>(.*?)</item>", get(url), re.S)
        picked = 0
        for it in items:
            t = html.unescape(re.search(r"<title>(.*?)</title>", it, re.S).group(1))
            if t in seen: continue
            seen.add(t)
            link = re.search(r"<link>(.*?)</link>", it).group(1)
            date = re.search(r"<pubDate>(.*?)</pubDate>", it).group(1)
            try:
                real = decode(link); body = clean(get(real))
            except Exception as e:
                print("FAIL", t[:60], repr(e)[:60]); continue
            if len(body) < 300: continue
            f.write(f"\n##### {t}\nURL: {real}\nDATE: {date[5:22]}\n{body[:2500]}\n")
            picked += 1
            if picked >= limit: break
print("done")
