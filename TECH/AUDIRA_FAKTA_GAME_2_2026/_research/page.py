import sys, urllib.request, re, html
def get(url):
    r = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36"})
    return urllib.request.urlopen(r, timeout=30).read().decode("utf8", "ignore")
url, out = sys.argv[1], sys.argv[2]
try:
    h = get(url)
except Exception as e:
    print("ERR", url, e); sys.exit()
open(out + ".html", "w", encoding="utf8").write(h)
t = re.sub(r"<script.*?</script>|<style.*?</style>", " ", h, flags=re.S)
t = html.unescape(re.sub(r"<[^>]+>", " ", t)); t = re.sub(r"\s+", " ", t)
open(out + ".txt", "w", encoding="utf8").write(t)
print("OK", out, len(t))
