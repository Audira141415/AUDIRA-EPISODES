import re
src=open("gn5.py",encoding="utf8").read()
src=re.sub(r"TAILS = \[.*?\n\]\n","TAILS = []\n",src,flags=re.S)
src=re.sub(r"QUERIES = \[.*?\n\]\n",'''QUERIES = [
 ("Jokowi sidang Dokter Tifa keterangan hakim malam", 3),
 ("Dokter Tifa tanggapi keterangan Jokowi sidang tolak", 2),
 ("hakim uji ulang ijazah Jokowi labfor perintah majelis", 2),
 ("sidang lanjutan Roy Suryo Tifa jadwal saksi berikutnya setelah Jokowi", 2),
]
''',src,flags=re.S)
src=src.replace('when:2d','when:1d')
exec(compile(src,"gn7","exec"))
