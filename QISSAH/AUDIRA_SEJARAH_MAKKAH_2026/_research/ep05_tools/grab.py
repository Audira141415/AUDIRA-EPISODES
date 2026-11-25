import subprocess, sys, re, html
# grab.py URL outfile  -> saves visible paragraph text
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
url,out=sys.argv[1],sys.argv[2]
r=subprocess.run(["curl","-s","-L","--max-time","40","-A",UA,"-H","Accept-Language: en,ar;q=0.8,id;q=0.7",url],capture_output=True)
t=r.stdout.decode('utf-8','replace')
t=re.sub(r'<(script|style)[^>]*>.*?</\1>','',t,flags=re.S)
title=re.search(r'<title[^>]*>(.*?)</title>',t,re.S)
ps=[html.unescape(re.sub('<.*?>','',p)).strip() for p in re.findall(r'<(?:p|h1|h2|li|td)[^>]*>(.*?)</(?:p|h1|h2|li|td)>',t,re.S)]
ps=[' '.join(p.split()) for p in ps if len(p.strip())>30]
txt=f"URL: {url}\nTITLE: {html.unescape(title.group(1).strip()) if title else ''}\nHTTP bytes: {len(t)}\n\n"+'\n'.join(ps)
open(out,'w',encoding='utf-8').write(txt)
print(out,len(t),len(txt)); print(txt[:int(sys.argv[3]) if len(sys.argv)>3 else 1500])
