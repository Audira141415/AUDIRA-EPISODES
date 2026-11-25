from PIL import Image,ImageDraw
import glob,os,sys
fs=sorted(glob.glob('stills/*.png'),key=lambda f:float(os.path.basename(f)[1:-4].replace('_','.')))
W,H=270,480;cols=7
sheet=Image.new('RGB',(W*cols,H*((len(fs)+cols-1)//cols)),'black')
for i,f in enumerate(fs):
  im=Image.open(f).convert('RGB').resize((W,H));d=ImageDraw.Draw(im);d.text((6,6),os.path.basename(f),fill='red');sheet.paste(im,((i%cols)*W,(i//cols)*H))
sheet.save(sys.argv[1] if len(sys.argv)>1 else 'contact-sheet.jpg',quality=85);print(sheet.size)
