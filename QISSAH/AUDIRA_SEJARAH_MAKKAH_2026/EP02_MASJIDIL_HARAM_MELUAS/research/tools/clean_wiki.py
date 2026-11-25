import re,sys
sys.stdout.reconfigure(encoding='utf-8')
L=open(sys.argv[1],encoding='utf-8').read().split('\n')
s='\n'.join(L[int(sys.argv[2])-1:int(sys.argv[3])])
s=re.sub(r'<ref[^>]*/>','',s);s=re.sub(r'<ref[^>]*>.*?</ref>','',s,flags=re.S)
s=re.sub(r'\[\[(?:ملف|File):[^\n]*','',s)
s=re.sub(r'\[\[(?:[^|\]]*\|)?([^\]]*)\]\]',r'\1',s)
print('\n'.join(x for x in s.split('\n') if x.strip()))
