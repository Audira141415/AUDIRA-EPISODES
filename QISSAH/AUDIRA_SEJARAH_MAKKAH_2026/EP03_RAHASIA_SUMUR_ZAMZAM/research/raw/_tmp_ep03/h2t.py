import sys,re,html
sys.stdout.reconfigure(encoding='utf-8')
f=sys.argv[1]; s=int(sys.argv[2]) if len(sys.argv)>2 else 0; n=int(sys.argv[3]) if len(sys.argv)>3 else 8000
t=open(f,encoding='utf-8',errors='ignore').read()
t=re.sub(r'<script.*?</script>|<style.*?</style>','',t,flags=re.S)
t=html.unescape(re.sub(r'<[^>]+>',' ',t)); t=re.sub(r'\s+',' ',t)
if len(sys.argv)>4: open(sys.argv[4],'w',encoding='utf-8').write(t)
print(t[s:s+n])
