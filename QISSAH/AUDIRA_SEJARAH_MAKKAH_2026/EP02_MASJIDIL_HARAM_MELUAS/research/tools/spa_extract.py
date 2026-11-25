import sys,re,json,html
sys.stdout.reconfigure(encoding='utf-8')
s=open(sys.argv[1],encoding='utf-8',errors='ignore').read()
m=re.search(r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>',s,re.S)
d=json.loads(m.group(1))
best=[]
def walk(o,path=''):
    if isinstance(o,dict):
        for k,v in o.items(): walk(v,path+'/'+k)
    elif isinstance(o,list):
        for i,v in enumerate(o): walk(v,path)
    elif isinstance(o,str) and len(o)>300: best.append((path,o))
walk(d)
out=[]
for p,t in best:
    if any(k in p for k in ('content','body','description','title')):
        t=re.sub(r'<[^>]+>','\n',t);t=html.unescape(t);t=re.sub(r'\n\s*\n+','\n',t)
        out.append(f'### {p}\n{t}')
# also title/date
for k in ('title','published_at','date','created_at'):
    for mm in re.finditer(r'"%s":"([^"]{5,200})"'%k,m.group(1)): out.insert(0,f'{k}: {mm.group(1)}'); break
open(sys.argv[2],'w',encoding='utf-8').write('\n'.join(out))
print(len('\n'.join(out)))
