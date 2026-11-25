import subprocess, sys, urllib.parse, os
# usage: fetch.py outdir lang name1=title1 ...
out, lang = sys.argv[1], sys.argv[2]
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
for a in sys.argv[3:]:
    name, title = a.split('=',1)
    url=f"https://{lang}.wikipedia.org/w/index.php?title={urllib.parse.quote(title)}&action=raw"
    p=os.path.join(out,f"{lang}wiki_{name}.txt")
    subprocess.run(["curl","-s","-L","-A",UA,url,"-o",p])
    s=os.path.getsize(p)
    head=open(p,encoding='utf-8',errors='replace').read(120).replace('\n',' ')
    print(name,s,head)
