import sys,urllib.request,re,html
u=sys.argv[1]; n=int(sys.argv[2]) if len(sys.argv)>2 else 5000
try:
    d=urllib.request.urlopen(urllib.request.Request(u,headers={"User-Agent":"Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/130 Safari/537.36","Accept":"text/html"}),timeout=25).read().decode("utf8","ignore")
except Exception as e:
    print("ERR",u,e);sys.exit()
d=re.sub(r"<(script|style|nav|footer|header|aside)[\s\S]*?</\1>"," ",d)
ps=[html.unescape(re.sub(r"<[^>]+>","",p)).strip() for p in re.findall(r"<(?:p|h2|h3|li)[^>]*>([\s\S]*?)</(?:p|h2|h3|li)>",d)]
t="\n".join(p for p in ps if len(p)>50)
print("#####",u,len(t));print(t[:n])
