import json,re,glob,os,sys
d=sys.argv[1]
t=json.load(open(os.path.join(d,'timeline.json'),encoding='utf8'))
norm=lambda s: re.sub(r'[^a-z0-9]','',s.lower())
words={}
for c in t['clips']: words.setdefault(c['chapter'],[]).extend(norm(w['w']) for w in c['words'])
bad=0
for f in glob.glob(os.path.join(d,'*.ts*')):
  s=open(f,encoding='utf8').read()
  consts=dict(re.findall(r'const (\w+) = "(c\d\d_\w+)"',s))
  for m in re.finditer(r'\bWE?\((\w+|"c\d\d_\w+"), "([^"]+)"(?:, (\d+))?\)',s):
    v,w,n=m.group(1),m.group(2),int(m.group(3) or 0)
    ch=v.strip('"') if v.startswith('"') else consts.get(v)
    if not ch: print('??',f,m.group(0)); continue
    if words[ch].count(norm(w))<=n: print('MISSING',os.path.basename(f),ch,w,n,'count',words[ch].count(norm(w))); bad+=1
print('bad',bad)
