import sys, json, urllib.request, urllib.parse
def get(url):
    r = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 research-script"})
    return urllib.request.urlopen(r, timeout=30).read().decode("utf8", "ignore")
for t in sys.argv[2:]:
    lang = sys.argv[1]
    u = f"https://{lang}.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&format=json&redirects=1&titles=" + urllib.parse.quote(t)
    d = json.loads(get(u))
    for p in d["query"]["pages"].values():
        open(f"wp_{lang}_{t.replace(' ','_')}.txt", "w", encoding="utf8").write(p.get("extract", ""))
        print(t, len(p.get("extract", "")))
