import re,sys,html
for p in sys.argv[1:]:
    s=open(p,encoding='utf8',errors='ignore').read()
    s=re.sub(r'(?s)<(script|style|nav|header|footer).*?</\1>',' ',s)
    s=re.sub(r'<[^>]+>',' ',s); s=html.unescape(s); s=re.sub(r'\s+',' ',s)
    open(p.replace('.html','.txt'),'w',encoding='utf8').write(s)
