import re,html,sys,io
sys.stdout=io.TextIOWrapper(sys.stdout.buffer,encoding='utf8',errors='replace')
for f in sys.argv[2:]:
    t=open(f,encoding='utf8',errors='ignore').read()
    t=re.sub(r'<(script|style|svg|noscript)[^>]*>.*?</\1>',' ',t,flags=re.S)
    t=re.sub(r'<[^>]+>','\n',t); t=html.unescape(t)
    t='\n'.join(l.strip() for l in t.splitlines() if l.strip())
    print('=====',f,len(t)); print(t[:int(sys.argv[1])])
