import re
src=open("gn5.py",encoding="utf8").read()
src=re.sub(r"TAILS = \[.*?\n\]\n","TAILS = []\n",src,flags=re.S)
src=re.sub(r"QUERIES = \[.*?\n\]\n",'''QUERIES = [
 ("Jokowi dan Roy Suryo salaman di akhir sidang", 3),
 ("Hakim Potong Ucapan Jokowi Jawab Saja Pertanyaannya Bukan Komentar", 2),
 ("Jaksa Pengacara Roy Suryo Saling Bentak di Depan Jokowi Sidang Diskors", 1),
 ("Jokowi sidang Dokter Tifa malam selesai keterangan hakim", 3),
 ("Jokowi ijazah dipakai KPU Kertas Kraft Aceh sidang", 1),
]
''',src,flags=re.S)
exec(compile(src,"gn6","exec"))
