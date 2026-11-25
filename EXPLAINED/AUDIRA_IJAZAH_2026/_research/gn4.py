"""Fetches articles for the three viral angles through Google News RSS. TLS verification stays on; sites that refuse are logged and skipped.
Run: python -I gn4.py <output.txt>"""
import html, json, re, sys, urllib.parse, urllib.request

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"}
OUT = sys.argv[1]
QUERIES = [
    ("Jokowi tolak uji ijazah labfor Refly Harun sidang", 5),
    ("Refly Harun tanya Jokowi uji ulang ijazah laboratorium forensik independen", 4),
    ("Refly Harun debat jaksa sidang Jokowi ijazah", 4),
    ("Refly Harun ungkap kejanggalan Jokowi tunjukkan ijazah persidangan", 2),
    ("Jokowi ditegur hakim sebut Roy Suryo bukan peneliti", 3),
    ("hakim tegur Jokowi sidang Roy Suryo", 3),
    ("sidang ijazah Jokowi memanas hakim Refly Harun", 3),
    ("tim hukum Roy Suryo ijazah Jokowi berbeda dokumen 15 Desember", 2),
    ("Jokowi sidang Dokter Tifa kesaksian ijazah hasil", 4),
    ("Jokowi uraikan riwayat pendidikan SD 111 SMP 1 SMA 6 UGM sidang", 2),
    ("Jokowi wisuda nama teman seangkatan sidang jaksa kumis kacamata", 2),
    ("sidang Roy Suryo berikutnya jadwal lanjutan setelah Jokowi bersaksi", 2),
]
BAD = re.compile(r"(Baca Juga|Saksikan|Simak|Copyright|Follow|WhatsApp|Google News|Login|ADVERTISEMENT|Gabung|Komentar|Tautan)", re.I)


def get(url, data=None, headers=None):
    req = urllib.request.Request(url, data=data, headers={**UA, **(headers or {})})
    return urllib.request.urlopen(req, timeout=30).read().decode("utf-8", "replace")


def decode(link):
    page = get(link)
    art = re.search(r"/articles/([^?/]+)", link).group(1)
    sig = re.search(r'data-n-a-sg="([^"]+)"', page).group(1)
    ts = re.search(r'data-n-a-ts="([^"]+)"', page).group(1)
    inner = json.dumps(["garturlreq", [["X", "X", ["X", "X"], None, None, 1, 1, "US:en", None, 1, None, None, None, None, None, 0, 1], "X", "X", 1, [1, 1, 1], 1, 1, None, 0, 0, None, 0], art, int(ts), sig])
    body = urllib.parse.urlencode({"f.req": json.dumps([[["Fbv4je", inner, None, "generic"]]])}).encode()
    r = get("https://news.google.com/_/DotsSplashUi/data/batchexecute", body, {"Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"})
    return json.loads(json.loads(r.split("\n\n", 1)[1])[0][2])[1]


def clean(page):
    page = re.sub(r"(?is)<(script|style|noscript|aside|nav|footer|header).*?</\1>", " ", page)
    out = []
    for p in re.findall(r"(?is)<p[^>]*>(.*?)</p>", page):
        t = re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", p))).strip()
        if len(t) > 50 and not BAD.search(t):
            out.append(t)
    return "\n".join(out)


seen = set()
with open(OUT, "w", encoding="utf-8") as f:
    for q, limit in QUERIES:
        url = "https://news.google.com/rss/search?q=" + urllib.parse.quote(q + " when:7d") + "&hl=id&gl=ID&ceid=ID:id"
        items = re.findall(r"<item>(.*?)</item>", get(url), re.S)
        picked = 0
        print("==", q, len(items))
        for it in items:
            t = html.unescape(re.search(r"<title>(.*?)</title>", it, re.S).group(1))
            if t in seen:
                continue
            seen.add(t)
            link = re.search(r"<link>(.*?)</link>", it).group(1)
            date = re.search(r"<pubDate>(.*?)</pubDate>", it).group(1)
            try:
                real = decode(link)
                body = clean(get(real))
            except Exception as e:
                print("FAIL", t[:70], repr(e)[:60])
                continue
            if len(body) < 300:
                continue
            f.write(f"\n##### {t}\nURL: {real}\nDATE: {date[:22]}\n{body[:2300]}\n")
            print("OK", date[17:22], t[:85])
            picked += 1
            if picked >= limit:
                break
