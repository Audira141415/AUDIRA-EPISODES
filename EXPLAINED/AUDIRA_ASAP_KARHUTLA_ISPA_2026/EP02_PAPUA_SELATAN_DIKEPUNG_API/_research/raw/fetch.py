import sys, re, html, urllib.request, io, os
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf8", errors="replace")
UA={"User-Agent":"Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/130 Safari/537.36","Accept-Language":"id,en"}
out=sys.argv[1]
for i,u in enumerate(sys.argv[2:]):
    tag=out+f"/a{i:02d}.txt"
    try:
        t=urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=30).read().decode("utf8","ignore")
        ps=re.findall(r"<(?:p|h1|li)[^>]*>(.*?)</(?:p|h1|li)>",t,re.S)
        txt="\n".join(html.unescape(re.sub(r"<[^>]+>","",p)).strip() for p in ps)
        txt="\n".join(l for l in txt.splitlines() if len(l)>40)
        open(tag,"w",encoding="utf8").write(u+"\n"+txt)
        print(i,"OK",len(txt),u)
    except Exception as e:
        print(i,"FAIL",type(e).__name__,str(e)[:80],u)
