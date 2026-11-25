from PIL import Image, ImageDraw, ImageFont
Q="F:/AUDIRA-SKILL-MOTION/references/quality-bar/"; C="F:/AUDIRA-ALL-SKILL/assets/style-covers/"
items=[("SATELLITEBRIEFING",Q+"satellitebriefing.png","EP01 utama"),("SKETCHFORGE",Q+"sketchforge.png","EP01/EP05 alt"),
("THERMALFORGE",C+"thermalforge.jpg","EP02 utama"),("DISASTERSIM",Q+"disastersim.png","EP02 alt"),
("VISUALINVESTIGATION",Q+"visualinvestigation.png","EP03 utama"),("DATAPHYSICAL",Q+"dataphysical.png","EP03/EP04 alt"),
("ANATOMIX",Q+"anatomix.png","EP04 utama"),("HISTORYMAP",Q+"historymap.png","EP05 utama")]
W,H=300,533; img=Image.new("RGB",(W*4,(H+56)*2),"#111")
try: f=ImageFont.truetype("arialbd.ttf",20); g=ImageFont.truetype("arial.ttf",17)
except: f=g=ImageFont.load_default()
d=ImageDraw.Draw(img)
for i,(n,p,t) in enumerate(items):
  x,y=(i%4)*W,(i//4)*(H+56)
  im=Image.open(p).convert("RGB"); r=max(W/im.width,H/im.height); im=im.resize((int(im.width*r)+1,int(im.height*r)+1))
  im=im.crop(((im.width-W)//2,(im.height-H)//2,(im.width-W)//2+W,(im.height-H)//2+H)); img.paste(im,(x,y))
  d.text((x+8,y+H+4),n,fill="#fff",font=f); d.text((x+8,y+H+30),t,fill="#f5b942",font=g)
img.save("F:/AUDIRA-VIDEO-MOTION/EXPLAINED/AUDIRA_ASAP_KARHUTLA_ISPA_2026/_style/rekomendasi-style.jpg",quality=85)
