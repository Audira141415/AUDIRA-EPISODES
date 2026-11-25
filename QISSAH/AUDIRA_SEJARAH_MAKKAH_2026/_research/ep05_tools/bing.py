import subprocess, sys, urllib.parse, re, html
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
for q in sys.argv[1:]:
    r=subprocess.run(["curl","-s","-A",UA,"-H","Accept-Language: en-US,en;q=0.9","https://www.bing.com/search?q="+urllib.parse.quote(q)+"&count=15"],capture_output=True)
    t=r.stdout.decode('utf-8','replace')
    print("==",q)
    for m in re.finditer(r'<li class="b_algo".*?<h2[^>]*><a[^>]*href="([^"]+)"[^>]*>(.*?)</a>(.*?)</li>',t,re.S):
        snip=re.sub('<.*?>','',html.unescape(m.group(3)))
        print(' -',re.sub('<.*?>','',html.unescape(m.group(2)))[:100],'|',m.group(1))
        print('    ',' '.join(snip.split())[:280])
