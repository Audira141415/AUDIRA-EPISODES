from PIL import Image, ImageDraw, ImageFont
import glob
eps=sorted(glob.glob("EP0*"));W,H=360,640
img=Image.new("RGB",(W*5,H+40),"#111");d=ImageDraw.Draw(img)
f=ImageFont.truetype("arialbd.ttf",20)
for i,e in enumerate(eps):
  im=Image.open(f"{e}/style/cover-topic.png").convert("RGB");print(e,im.size)
  img.paste(im.resize((W,H)),(i*W,0));d.text((i*W+8,H+8),e[:4],fill="#fff",font=f)
  d.line([(i*W,H-int(380/3)),(i*W+W,H-int(380/3))],fill="#ff3b3b",width=1)
img.save("_style/cover-topik-5ep.jpg",quality=88)
