"""Research pass for five new trial angles. TLS verification stays on. Run: python gn8.py <out-prefix>"""
import re, sys
src = open("gn5.py", encoding="utf8").read()
src = re.sub(r"TAILS = \[.*?\n\]\n", "TAILS = []\n", src, flags=re.S)
ANGLES = {
    "a_tifa": [("Jokowi bersaksi sidang Dokter Tifa keterangan malam", 4), ("Dokter Tifa pertanyaan Jokowi sidang hakim 5 November", 3), ("Tifauzia tanggapi kesaksian Jokowi", 2)],
    "b_dakwaan": [("isi dakwaan Roy Suryo Pasal 433 441 KUHP ancaman hukuman ijazah", 3), ("Pasal 35 Pasal 32 UU ITE dakwaan Roy Suryo manipulasi dokumen elektronik", 2), ("eksepsi Dokter Tifa dikabulkan dakwaan diperbaiki jaksa", 3), ("dakwaan Dokter Tifa dibacakan pasal 434", 2)],
    "c_saksi": [("saksi sidang Roy Suryo Lechumanan Maret Samuel Sueken kesaksian", 2), ("Dian Sandi saksi sidang Dokter Tifa foto ijazah unggah", 2), ("Dumatno Budi Utomo saksi sidang ijazah", 2), ("AKBP Syarif ajudan saksi sidang Roy Suryo", 2), ("saksi ahli sidang ijazah Jokowi jaksa 94 saksi 26 ahli", 2), ("rektor UGM saksi sidang ijazah Jokowi keterangan", 2)],
    "d_perdata": [("PN Surakarta tolak gugatan ijazah Jokowi Sigit Pratomo putusan", 2), ("gugatan ijazah Jokowi PN Sleman tidak berwenang", 2), ("gugatan ijazah Jokowi PN Jakarta Pusat Bambang Tri dicabut", 2), ("Bambang Tri Gus Nur vonis banding kasasi ijazah Jokowi", 3), ("praperadilan Roy Suryo ijazah Jokowi putusan", 2), ("KIP sengketa informasi ijazah Jokowi KPU putusan", 2)],
    "e_lanjut": [("sidang Roy Suryo berikutnya jadwal pekan depan saksi ahli", 3), ("kuasa hukum Jokowi usai sidang langkah berikutnya ijazah", 2), ("pakar hukum sidang ijazah Jokowi setelah kesaksian analisis pembuktian", 3), ("KUHAP baru pembuktian pencemaran nama baik fitnah kebenaran tuduhan Pasal 434", 2), ("Roy Suryo Tifa ditahan penahanan status sidang", 2), ("reaksi publik survei percaya ijazah Jokowi lembaga survei", 2)],
}
head = src.split("with open(OUT")[0]
head = re.sub(r"QUERIES = \[.*?\n\]\n", "QUERIES = []\n", head, flags=re.S)
exec(compile(head, "gn8head", "exec"))
for name, qs in ANGLES.items():
    seen = set()
    with open(f"{sys.argv[1]}{name}.txt", "w", encoding="utf8") as f:
        for q, limit in qs:
            url = "https://news.google.com/rss/search?q=" + urllib.parse.quote(q + " when:45d") + "&hl=id&gl=ID&ceid=ID:id"
            try:
                items = re.findall(r"<item>(.*?)</item>", get(url), re.S)
            except Exception as e:
                print("RSSFAIL", q, repr(e)[:50]); continue
            picked = 0
            for it in items:
                t = html.unescape(re.search(r"<title>(.*?)</title>", it, re.S).group(1))
                if t in seen:
                    continue
                seen.add(t)
                link = re.search(r"<link>(.*?)</link>", it).group(1)
                date = re.search(r"<pubDate>(.*?)</pubDate>", it).group(1)
                try:
                    real = decode(link); body = clean(get(real))
                except Exception:
                    continue
                if len(body) < 300 or len(body.split("\n")[0]) > 900 or not re.search(r"ijazah|Jokowi|Roy Suryo|Tifa", t + body[:400]):
                    continue
                f.write(f"\n##### {t}\nURL: {real}\nDATE: {date[5:22]}\n{body[:1500]}\n")
                picked += 1
                if picked >= limit:
                    break
    print(name, "done", len(seen))
