"""Reads article endings that were cut off, plus evening coverage. TLS verification stays on. Run: python -I gn5.py <output.txt>"""
import html, json, re, sys, urllib.parse, urllib.request

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"}
OUT = sys.argv[1]
TAILS = [
    ("https://www.cnnindonesia.com/nasional/20261105142404-12-1423674/refly-harun-dan-jaksa-debat-panas-saat-jokowi-bersaksi-suara-meninggi", "Hakim meminta untuk sidang"),
    ("https://news.detik.com/berita/d-8739780/hakim-tegur-pengacara-roy-suryo-tunjuk-tunjuk-jaksa-saat-jokowi-bersaksi/amp", "Saksi ini melapor"),
    ("https://afu.id/hukum-kriminal/sidang-ijazah-jokowi-memanas-jaksa-dan-pengacara-roy-suryo-adu-mulut-hakim-terpaksa-skors-sidang", "Perdebatan kemudian"),
    ("https://www.owrite.id/hukum/2026/11/05/jokowi-tolak-tantangan-kubu-roy-suryo-ogah-ijazah-aslinya-diuji-ulang-di-persidangan/", "Saya tidak meneliti"),
    ("https://tirto.id/jokowi-keberatan-apabila-ijazahnya-diuji-ulang-di-labfor-h1ex", "Lebih lanjut, Refly"),
]
QUERIES = [
    ("Jokowi tanggal ujian skripsi wisuda detail kelulusan S1 UGM sidang", 3),
    ("Jokowi sidang Dokter Tifa sore kesaksian pertanyaan", 4),
    ("usai sidang Jokowi Masa diuji-uji Labfor Polri", 2),
    ("kuasa hukum Jokowi tanggapi permintaan uji ulang ijazah Refly", 3),
    ("hakim izinkan Jokowi tunjukkan ijazah pengunjung tidak izin Refly tata tertib", 2),
    ("sidang Roy Suryo lanjutan agenda saksi berikutnya November", 3),
]
BAD = re.compile(r"(Baca Juga|Saksikan|Simak|Copyright|Follow|WhatsApp|Google News|Login|ADVERTISEMENT|Gabung|Tautan)", re.I)


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


def plain(page):
    page = re.sub(r"(?is)<(script|style|noscript).*?</\1>", " ", page)
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", page)))


def clean(page):
    page = re.sub(r"(?is)<(script|style|noscript|aside|nav|footer|header).*?</\1>", " ", page)
    out = []
    for p in re.findall(r"(?is)<p[^>]*>(.*?)</p>", page):
        t = re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", p))).strip()
        if len(t) > 50 and not BAD.search(t):
            out.append(t)
    return "\n".join(out)


with open(OUT, "w", encoding="utf-8") as f:
    for u, k in TAILS:
        try:
            t = plain(get(u))
            i = t.rfind(k)
            f.write(f"\n##### TAIL {u}\n{t[i:i + 1500] if i >= 0 else 'NOT FOUND'}\n")
            print("TAIL", i >= 0, u[:70])
        except Exception as e:
            print("FAIL", u[:70], repr(e)[:60])
    seen = set()
    for q, limit in QUERIES:
        url = "https://news.google.com/rss/search?q=" + urllib.parse.quote(q + " when:2d") + "&hl=id&gl=ID&ceid=ID:id"
        items = re.findall(r"<item>(.*?)</item>", get(url), re.S)
        items.sort(key=lambda it: re.search(r"<pubDate>.*? (\d\d:\d\d):", it).group(1), reverse=True)
        picked = 0
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
                print("FAIL", t[:70], repr(e)[:50])
                continue
            if len(body) < 300 or len(body.split("\n")[0]) > 900:
                continue
            f.write(f"\n##### {t}\nURL: {real}\nDATE: {date[:22]}\n{body[:1900]}\n")
            print("OK", date[17:22], t[:85])
            picked += 1
            if picked >= limit:
                break
