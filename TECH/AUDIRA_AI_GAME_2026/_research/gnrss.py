import sys,urllib.request,urllib.parse,re,html
qs=sys.argv[1:]
for q in qs:
    for hl,gl,ce in (("en-US","US","US:en"),("id","ID","ID:id")):
        u="https://news.google.com/rss/search?"+urllib.parse.urlencode({"q":q,"hl":hl,"gl":gl,"ceid":ce})
        try:
            d=urllib.request.urlopen(urllib.request.Request(u,headers={"User-Agent":"Mozilla/5.0"}),timeout=20).read().decode("utf8","ignore")
        except Exception as e:
            print("ERR",q,e);continue
        print("=== ",q,hl)
        for it in re.findall(r"<item>(.*?)</item>",d,re.S)[:10]:
            t=html.unescape(re.search(r"<title>(.*?)</title>",it,re.S).group(1))
            p=re.search(r"<pubDate>(.*?)</pubDate>",it).group(1)[5:16]
            print(p,"|",t)
