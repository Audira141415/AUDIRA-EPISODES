"""Second research pass: expert explanation, canal history, rain relapse, Ombudsman."""
import html, json, os, re, ssl, subprocess, sys, urllib.parse, urllib.request

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/130 Safari/537.36"}


def grab(u):
    r = urllib.request.Request(u, headers=UA)
    return urllib.request.urlopen(r, timeout=25).read().decode("utf8", "ignore")


def plain(t):
    t = re.sub(r"<(script|style|nav|footer)[^>]*>.*?</\1>", " ", t, flags=re.S)
    ps = re.findall(r"<p[^>]*>(.*?)</p>", t, re.S)
    return "\n".join(re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", p))).strip() for p in ps)


QUERIES = {
    "pakar": "Ada Bara Api di Bawah Tanah Karhutla Palangka Raya pakar when:30d",
    "orba": "warisan pembangunan era Orde Baru kebakaran hutan Kalimantan BBC when:90d",
    "banjar": "Sempat Mereda Diguyur Hujan Karhutla Kembali Melanda Kabupaten Banjar",
    "ombudsman": "Ombudsman investigasi dampak Karhutla pelayanan publik when:14d",
    "batola": "Batola perpanjangan status tanggap darurat karhutla 10 November 2026",
    "rewet": "Pembasahan 10.378 Ha Gambut di Kalteng when:14d",
    "kematian": "CREA 3.560 kematian asap karhutla September when:45d",
    "bpgmn": "Badan Pengelola Gambut dan Mangrove Nasional BPGMN when:60d",
}
sys.path.insert(0, ".")
src = open("gn.py", encoding="utf8").read().split("q = sys.argv[1]")[0]
ns = {}
exec(src, ns)
os.makedirs("txt", exist_ok=True)
for k, q in QUERIES.items():
    rss = ns["get"]("https://news.google.com/rss/search?" + urllib.parse.urlencode({"q": q, "hl": "id", "gl": "ID", "ceid": "ID:id"}))
    items = re.findall(r"<item>.*?<title>(.*?)</title>.*?<link>(.*?)</link>.*?<pubDate>(.*?)</pubDate>", rss, re.S)[:3]
    for i, (title, link, date) in enumerate(items):
        try:
            u = ns["decode"](html.unescape(link))
            u = u.encode().decode("unicode_escape") if u and "\\u" in u else u
            body = plain(grab(u))
            name = f"{k}{i}"
            open(f"txt/{name}.txt", "w", encoding="utf8").write(f"{html.unescape(title)}\n{date}\n{u}\n\n{body}")
            print(name, len(body), date[5:16], html.unescape(title)[:90], u)
        except Exception as e:
            print(k, i, "ERR", str(e)[:100], html.unescape(title)[:80])
