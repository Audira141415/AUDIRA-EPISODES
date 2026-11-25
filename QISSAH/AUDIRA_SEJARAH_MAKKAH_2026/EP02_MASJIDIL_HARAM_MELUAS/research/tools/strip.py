import sys,re,html
s=open(sys.argv[1],encoding='utf-8',errors='ignore').read()
s=re.sub(r'(?is)<(script|style|noscript|svg|header|footer|nav)[^>]*>.*?</\1>',' ',s)
s=re.sub(r'(?i)<br\s*/?>|</p>|</h\d>|</li>|</div>','\n',s)
s=re.sub(r'<[^>]+>',' ',s); s=html.unescape(s)
s=re.sub(r'[ \t\r]+',' ',s); s=re.sub(r'\n\s*\n+','\n',s)
open(sys.argv[2],'w',encoding='utf-8').write(s)
