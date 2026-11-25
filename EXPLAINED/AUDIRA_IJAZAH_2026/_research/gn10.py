"""Jokowi news 8 Nov 2026: fetch named stories. TLS verification stays on. Run: python gn10.py out.txt"""
import re, sys
src = open("gn5.py", encoding="utf8").read()
head = src.split("with open(OUT")[0]
head = re.sub(r"QUERIES = \[.*?\n\]\n", "QUERIES = []\n", head, flags=re.S)
head = re.sub(r"TAILS = \[.*?\n\]\n", "TAILS = []\n", head, flags=re.S)
exec(compile(head, "gn10head", "exec"))
QS = ["Apa kata Jokowi soal kasus penyadapan Presiden Prabowo BBC", "Kasus Penyadapan Prabowo Mengapa Mata Publik Tertuju ke Jokowi", "Hasto Ungkap Dugaan Penyadapan Ilegal Era Jokowi",
      "PSI Minta Jangan Kaitkan Jokowi dengan Penyadapan Listyo Sigit", "tiga jenderal polisi tersangka penyadapan presiden", "Fakta-fakta Terbaru Kasus Tudingan Ijazah Palsu Jokowi CNN",
      "Bisakah Uji Forensik Keaslian Ijazah Jokowi Diulang Tirto", "Roy Cs Persoalkan Beda Tanggal Lulus Jokowi Fisik Ijazah Sangat Rapi", "Jokowi Beda Nama SMA Album Alumni UGM Yang Salah yang Cetak",
      "Aktivis Luke Susilo Dianiaya OTK PN Jaktim", "Gibran Disarankan Mundur Burhanuddin Muhtadi", "Nasib Dua Eks Ajudan Jokowi Masuk Bui", "Pernyataan Lengkap UGM soal Jokowi Pamer Ijazah CNN",
      "Dino Patti Djalal Kritik Respons Normatif Jokowi Penyadapan", "Jokowi Sekeluarga Kondangan Pura Mangkunegaran"]
with open(sys.argv[1], "w", encoding="utf8") as f:
    for q in QS:
        url = "https://news.google.com/rss/search?q=" + urllib.parse.quote(q + " when:5d") + "&hl=id&gl=ID&ceid=ID:id"
        try: items = re.findall(r"<item>(.*?)</item>", get(url), re.S)
        except Exception as e: print("RSSFAIL", q); continue
        ok = False
        for it in items[:4]:
            t = html.unescape(re.search(r"<title>(.*?)</title>", it, re.S).group(1))
            link = re.search(r"<link>(.*?)</link>", it).group(1); date = re.search(r"<pubDate>(.*?)</pubDate>", it).group(1)
            try: real = decode(link); body = clean(get(real))
            except Exception as e: print("FAIL", t[:60], repr(e)[:50]); continue
            if len(body) < 400: continue
            f.write(f"\n##### {t}\nQ: {q}\nURL: {real}\nDATE: {date[5:22]}\n{body[:3000]}\n"); ok = True; break
        print("OK" if ok else "MISS", q)
