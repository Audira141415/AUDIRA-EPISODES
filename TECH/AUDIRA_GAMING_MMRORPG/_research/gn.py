"""gn.py "<query>" [n] [regex-filter]: Google News RSS, decode real URLs via batchexecute Fbv4je."""
import html, io, json, re, sys, urllib.parse, urllib.request

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf8", errors="replace")
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/130 Safari/537.36"}


def get(u, data=None, hdr=None):
    r = urllib.request.Request(u, data=data, headers={**UA, **(hdr or {})})
    return urllib.request.urlopen(r, timeout=25).read().decode("utf8", "ignore")


def decode(link):
    a = get(link)
    m = re.search(r'data-n-a-id="([^"]+)".*?data-n-a-ts="([^"]+)".*?data-n-a-sg="([^"]+)"', a, re.S)
    if not m:
        m2 = re.search(r'data-n-a-sg="([^"]+)".*?data-n-a-ts="([^"]+)"', a, re.S)
        i = re.search(r'data-n-a-id="([^"]+)"', a)
        if not (m2 and i):
            return None
        idv, ts, sg = i.group(1), m2.group(2), m2.group(1)
    else:
        idv, ts, sg = m.groups()
    inner = json.dumps(["garturlreq", [["X", "X", ["X", "X"], None, None, 1, 1, "US:en", None, 1, None, None, None, None, None, 0, 1], "X", "X", 1, [1, 1, 1], 1, 1, None, 0, 0, None, 0], idv, int(ts), sg])
    body = urllib.parse.urlencode({"f.req": json.dumps([[["Fbv4je", inner, None, "generic"]]])}).encode()
    t = get("https://news.google.com/_/DotsSplashUi/data/batchexecute", body, {"Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"})
    m = re.search(r'garturlres\\",\\"(.*?)\\"', t)
    return m.group(1).encode().decode("unicode_escape") if m else None


q = sys.argv[1]
n = int(sys.argv[2]) if len(sys.argv) > 2 else 12
flt = sys.argv[3] if len(sys.argv) > 3 else ""
rss = get("https://news.google.com/rss/search?" + urllib.parse.urlencode({"q": q, "hl": "en-US", "gl": "US", "ceid": "US:en"}))
items = re.findall(r"<item>.*?<title>(.*?)</title>.*?<link>(.*?)</link>.*?<pubDate>(.*?)</pubDate>", rss, re.S)
k = 0
for title, link, date in items:
    title = html.unescape(title)
    if flt and not re.search(flt, title, re.I):
        continue
    try:
        u = decode(html.unescape(link))
    except Exception as e:
        u = "ERR " + str(e)
    print(date[5:16], "|", title[:110], "|", u)
    k += 1
    if k >= n:
        break
