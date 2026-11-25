import io,re,sys,html,urllib.request
sys.stdout=io.TextIOWrapper(sys.stdout.buffer,encoding="utf8",errors="replace")
UA={"User-Agent":"Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/130 Safari/537.36"}
for u in sys.argv[1:]:
    print("=====",u)
    try:
        t=urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=30).read().decode("utf8","ignore")
    except Exception as e:
        print("FAIL",e);continue
    t=re.sub(r"(?s)<(script|style)[^>]*>.*?</\1>","",t)
    ps=[html.unescape(re.sub(r"<[^>]+>","",p)).strip() for p in re.findall(r"(?s)<p[^>]*>(.*?)</p>",t)]
    ps=[p for p in ps if len(p)>40]
    out="\n".join(ps)
    print(out[:int(__import__('os').environ.get('MAX','6000'))])
