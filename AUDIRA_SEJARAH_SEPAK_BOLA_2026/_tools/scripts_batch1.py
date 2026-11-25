# Writes docs/SCRIPT.md for EP01-05 (batch 1) and prints word counts.
# Run from the series folder: python -X utf8 _tools/scripts_batch1.py
import re, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
TC = ["Hook (0–3 dtk)", "Context (4–15 dtk)", "Main Development (16–45 dtk)",
      "Explanation (46–70 dtk)", "Visual Payoff (71–85 dtk)", "Outro (86–90 dtk)"]

EPS = {
"EP01_SEMUA_JUARA_PIALA_DUNIA": ("Semua Juara Piala Dunia", "HISTORYMAP", [
"Dua puluh tiga kali Piala Dunia digelar. Juaranya? Cuma delapan negara.",
"Sejak 1930 di Uruguay, delapan puluh empat negara pernah tampil. Tiga belas pernah masuk final. Tapi hanya delapan yang pernah mengangkat trofi.",
"Inggris, satu gelar, di kandang sendiri tahun 1966. Uruguay dan Prancis, masing-masing dua. Spanyol juga dua, dan yang kedua baru Juli lalu: menang satu-nol atas Argentina lewat gol Ferran Torres di menit seratus enam. Argentina, tiga. Italia dan Jerman, masing-masing empat, tiga di antaranya atas nama Jerman Barat. Dan di puncak, Brasil, lima bintang.",
"Sekarang lihat petanya. Semua juara datang dari dua benua saja. Eropa tiga belas gelar, Amerika Selatan sepuluh. Belum pernah ada tim Afrika, Asia, atau Amerika Utara yang sampai ke final. Tuan rumah sudah enam kali juara, tapi terakhir tahun 1998.",
"Dan trofinya punya drama sendiri. Trofi pertama dicuri tahun 1966, lalu ditemukan seekor anjing bernama Pickles. Tahun 1983, trofi itu dicuri lagi, dan sampai hari ini tidak pernah kembali. Trofi yang kini dipegang Spanyol adalah penggantinya, dipakai sejak 1974.",
"Ini AUDIRA, Sejarah Sepak Bola. Episode berikutnya: kenapa Brasil punya lima bintang."]),
"EP02_BRASIL_LIMA_BINTANG": ("Brasil Lima Bintang", "TIMEFORGE", [
"Lima bintang di dada Brasil. Tapi trofi aslinya dicuri, dan tak pernah kembali.",
"Brasil satu-satunya negara yang tak pernah absen dari Piala Dunia, dua puluh tiga dari dua puluh tiga. Tapi kisah bintangnya dimulai dari luka: tahun 1950, di Maracanã, Brasil cukup seri untuk juara, dan kalah dari Uruguay.",
"Delapan tahun kemudian di Swedia, bocah tujuh belas tahun bernama Pelé mencetak dua gol di final. Brasil menang lima-dua, memakai baju biru. Bintang pertama. Tahun 1962, Pelé cedera, Garrincha mengambil alih. Bintang kedua. Tahun 1970, Brasil menang enam dari enam laga dan menghajar Italia empat-satu. Bintang ketiga, dan trofi Jules Rimet jadi milik Brasil selamanya, sampai dicuri tahun 1983.",
"Lalu kemarau dua puluh empat tahun. Tahun 1994, final melawan Italia ditentukan adu penalti, yang pertama dalam sejarah. Bintang keempat. Tahun 2002, Ronaldo mencetak dua gol ke gawang Jerman. Bintang kelima.",
"Sejak itu, kosong. Tahun 2014, kalah satu-tujuh dari Jerman di kandang sendiri. Dan Juli lalu, Brasil tersingkir di enam belas besar oleh Norwegia, satu-satunya lawan yang tak pernah bisa mereka kalahkan.",
"Ini AUDIRA, Sejarah Sepak Bola. Episode berikutnya: siapa pemain terbaik sepanjang masa?"]),
"EP03_PEMAIN_TERBAIK_SEPANJANG_MASA": ("Pemain Terbaik Sepanjang Masa", "DATAPHYSICAL", [
"Siapa pemain terbaik sepanjang masa? Jawabannya tergantung timbangan yang kamu pakai.",
"Empat nama selalu muncul: Pelé, Maradona, Messi, dan Cristiano Ronaldo. Kita taruh semuanya di atas timbangan data, per November 2026.",
"Timbangan pertama: gol resmi. Ronaldo memimpin dengan lebih dari sembilan ratus delapan puluh gol, hampir seribu. Messi lebih dari sembilan ratus tiga puluh. Pelé tujuh ratus enam puluh dua, atau seribu dua ratus tujuh puluh sembilan versi Guinness, karena laga persahabatan ikut dihitung. Timbangan kedua: Piala Dunia. Pelé satu-satunya dengan tiga trofi. Maradona dan Messi masing-masing satu. Ronaldo nol, meski ia satu-satunya pencetak gol di enam Piala Dunia.",
"Timbangan ketiga: Ballon d'Or. Messi delapan, rekor. Ronaldo lima. Pelé dan Maradona nol, tapi bukan karena kalah: sampai 1995, penghargaan itu hanya untuk pemain Eropa. Tahun 2000, FIFA mencari pemain terbaik abad ini. Internet memilih Maradona, panel ahli memilih Pelé. Hasilnya, dua pemenang.",
"Jadi, ganti timbangan, ganti juara. Gol, Ronaldo. Ballon d'Or, Messi. Piala Dunia, Pelé. Satu turnamen paling magis, Maradona, 1986.",
"Kamu pakai timbangan yang mana? Ini AUDIRA, Sejarah Sepak Bola. Episode berikutnya: Real Madrid, raja Eropa."]),
"EP04_REAL_MADRID_RAJA_EROPA": ("Real Madrid Raja Eropa", "MARBLEMUSEUM", [
"Sejak 1981, Real Madrid tidak pernah kalah di final Liga Champions. Sembilan final, sembilan trofi.",
"Turnamen ini pertama digelar tahun 1956. Juara edisi pertamanya Real Madrid. Juara kedua, ketiga, keempat, dan kelima? Real Madrid juga.",
"Lima gelar beruntun, 1956 sampai 1960, bersama Di Stéfano dan Puskás. Puncaknya final 1960 di Glasgow: menang tujuh-tiga atas Eintracht Frankfurt. Puskás empat gol, Di Stéfano tiga. Gelar keenam datang tahun 1966, lalu kemarau panjang tiga puluh dua tahun.",
"Tahun 1998, mesin itu hidup lagi. 2000, 2002. Lalu 2014, kemudian tiga gelar beruntun 2016 sampai 2018, satu-satunya di era Liga Champions. 2022. Dan 2024, menang dua-nol atas Dortmund di Wembley. Delapan belas final, lima belas menang.",
"Lima belas trofi. Klub peringkat dua, AC Milan, baru tujuh, belum setengahnya. Sepuluh klub lain cuma pernah juara sekali. Tapi dua musim terakhir, takhta itu direbut PSG. Sang raja sedang diuji.",
"Ini AUDIRA, Sejarah Sepak Bola. Episode berikutnya: klub paling sering juara liga, dan itu bukan Real Madrid."]),
"EP05_KLUB_RAJA_LIGA": ("Klub Raja Liga", "TACTICBOARD", [
"Klub paling sering juara liga di dunia bukan Real Madrid, bukan Bayern. Namanya Linfield.",
"Linfield, klub dari Belfast, Irlandia Utara. Lima puluh tujuh gelar liga, rekor dunia. Real Madrid saja baru tiga puluh enam.",
"Tepat di belakangnya, dua klub dari satu kota, Glasgow. Celtic dan Rangers sudah bersaing lebih dari seratus tahun. Mei 2026, Celtic juara lagi dan menyalip Rangers. Skornya kini lima puluh enam lawan lima puluh lima, dan Celtic tinggal satu gelar dari rekor dunia.",
"Lalu siapa yang paling lama juara tanpa putus? Bayern juara Jerman sebelas kali beruntun, 2013 sampai 2023. Rekor liga top Eropa, tapi bukan rekor dunia. Skonto Riga dari Latvia, Lincoln Red Imps dari Gibraltar, dan Ludogorets dari Bulgaria, masing-masing empat belas kali beruntun. Dan dari tetangga kita, Johor Darul Ta'zim di Malaysia, dua belas musim tak pernah gagal juara, dan masih berjalan.",
"Tapi tak ada raja yang abadi. Rentetan Bayern dipatahkan Leverkusen, yang juara tanpa kalah sekali pun. Rentetan Ludogorets berhenti musim lalu. Juara sekali bisa kebetulan. Juara terus-menerus, itu dinasti.",
"Ini AUDIRA, Sejarah Sepak Bola. Episode berikutnya: lahirnya sepak bola modern, tahun 1863."]),
}

_A = ["", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas"]

def _say(x):
    if x < 12: return _A[x]
    if x < 20: return _A[x - 10] + " belas"
    if x < 100: return _A[x // 10] + " puluh " + _say(x % 10)
    if x < 200: return "seratus " + _say(x - 100)
    if x < 1000: return _A[x // 100] + " ratus " + _say(x % 100)
    if x < 2000: return "seribu " + _say(x - 1000)
    return _A[x // 1000] + " ribu " + _say(x % 1000)

def words(t):
    # spoken words: a year like 1966 counts as the words the narrator says
    return sum(len(_say(int(w)).split()) if w.isdigit() else 1 for w in re.findall(r"[\wÀ-ÿ'’]+", t))

for folder, (title, style, parts) in EPS.items():
    n = sum(words(p) for p in parts)
    lo, hi = n / 150 * 60, n / 135 * 60
    body = [f"# Naskah — {title}", "",
            f"Seri: Sejarah Sepak Bola (AUDIRA) · Style: {style} · Format: short 9:16 · Fakta dari `research/RESEARCH_REPORT.md` (HIGH).",
            f"Jumlah kata terucap (tahun dihitung sebagai kata yang dibaca): **{n}** → estimasi **{lo:.0f}–{hi:.0f} dtk** (135–150 WPM). Status: disetujui pengguna 2026-11-11 (Setuju semua).", ""]
    for tc, p in zip(TC, parts):
        body += [f"### {tc}", p, ""]
    body += ["---",
             "Catatan VO: tahun dibaca normal; nama asing, singkatan (IFFHS, PSG, AC) dan AUDIRA dieja fonetik di `audio/` saat VO dibuat. Naskah ini tetap ejaan normal untuk subtitle."]
    (ROOT / folder / "docs" / "SCRIPT.md").write_text("\n".join(body) + "\n", encoding="utf-8")
    print(f"{folder}: {n} kata, {lo:.0f}-{hi:.0f} dtk")
