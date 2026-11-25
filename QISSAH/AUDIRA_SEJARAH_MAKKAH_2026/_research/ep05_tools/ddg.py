import subprocess, sys, urllib.parse, re, html
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
for q in sys.argv[1:]:
    r=subprocess.run(["curl","-s","-A",UA,"https://html.duckduckgo.com/html/?q="+urllib.parse.quote(q)],capture_output=True)
    t=r.stdout.decode('utf-8','replace')
    print("==",q)
    for m in re.finditer(r'class="result__a" href="([^"]+)"[^>]*>(.*?)</a>.*?class="result__snippet"[^>]*>(.*?)</a>',t,re.S):
        u=m.group(1)
        mm=re.search(r'uddg=([^&]+)',u)
        if mm: u=urllib.parse.unquote(mm.group(1))
        print(' -',re.sub('<.*?>','',html.unescape(m.group(2)))[:100],'|',u)
        print('    ',re.sub('<.*?>','',html.unescape(m.group(3)))[:260])
