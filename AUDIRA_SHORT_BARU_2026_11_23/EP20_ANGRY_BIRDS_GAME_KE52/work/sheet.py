import sys,glob
from PIL import Image,ImageDraw
d,out,cols,w=sys.argv[1],sys.argv[2],int(sys.argv[3]),int(sys.argv[4])
fs=sorted(glob.glob(d+'/frame-*.png'))
h=int(w*16/9);rows=(len(fs)+cols-1)//cols
S=Image.new('RGB',(cols*w,rows*h),'black');D=ImageDraw.Draw(S)
for i,f in enumerate(fs):
    im=Image.open(f).convert('RGB').resize((w,h),Image.LANCZOS);x,y=(i%cols)*w,(i//cols)*h;S.paste(im,(x,y))
    D.rectangle([x,y,x+60,y+16],fill='black');D.text((x+3,y+2),f.split('-at-')[1][:-4],fill='yellow')
S.save(out,quality=85)
