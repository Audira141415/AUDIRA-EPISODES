import json, pathlib
p = pathlib.Path("audio/vo-chapters.json"); d = json.loads(p.read_text(encoding="utf-8"))
R = {
 "c02_lembah": [
  ("Lembah utamanya bernama Wadi Ibrahim. Ia membentang dari Asy-Syara'i di utara, melewati Masjidil Haram, lalu turun ke Al-Misfalah dan Kakiyah di selatan. Sumur Zamzam juga ada di sepanjang wadi ini. ",
   "Lembah utamanya bernama Wadi Ibrahim, dan ia melintas tepat di Masjidil Haram. "),
  ("Sebuah studi hidrologi tahun 2025 memodelkan banjir Wadi Ibrahim. Untuk banjir besar yang datang sekali dalam lima puluh sampai dua ratus tahun, zona genangan lebih dari dua meter bisa mencapai tujuh sampai hampir sepuluh kilometer persegi.",
   "Studi hidrologi tahun 2025 menghitung, banjir besar yang datang sekali dalam lima puluh sampai dua ratus tahun bisa menggenangi lebih dari dua meter di area tujuh sampai hampir sepuluh kilometer persegi.")],
 "c03_banjir_klasik": [("Umar datang dalam keadaan cemas, untuk umrah di bulan Ramadan. ", "")],
 "c04_banjir_1941": [("Ali Al-Awadhi wafat di Bahrain pada Mei 2015, dalam usia delapan puluh enam tahun. ", "")],
 "c05_zubaidah": [("Muslim India menggalang dana renovasi dari tahun 1876 sampai 1883. ", "")],
 "c06_nusantara": [("Total perjalanannya sekitar lima sampai enam bulan. ", ""),
                   ("Mengurus jemaah Jawi saja melibatkan seratus delapan puluh syekh pemandu. ", "")],
 "c07_ajyad_menara": [("Di sisi barat, bukit bersejarah Jabal Omar juga dibongkar untuk proyek Jabal Omar. ", "")],
 "c08_kota_modern": [("Tahun 1979, untuk pertama kalinya, jumlahnya lebih dari dua juta. ", ""),
                     ("Di bawah kota, kini ada sekitar enam puluhan terowongan. ", "")],
}
for c in d["chapters"]:
    for a, b in R.get(c["id"], []):
        assert a in c["text"], (c["id"], a[:40]); c["text"] = c["text"].replace(a, b)
s2 = d["shorts"][1]
s2["lines"] = [
 "c06_nusantara: dari 'Sebelum ada kapal uap, jemaah Nusantara menumpang kapal layar dagang.' sampai '... tak kurang dari lima bulan.'",
 "c06_nusantara: dari 'Kapal-kapal Kongsi Tiga bahkan diberi nama daerah kita.' sampai '... dua ribu enam ratus tiga puluh empat orang meninggal.'",
 "c06_nusantara: dari 'Tahun 1952, Indonesia pertama kali memberangkatkan jemaah dengan pesawat.' sampai '... berhenti di akhir 1970-an.'",
 "c09_payoff: dari 'Yang tidak berubah hanya satu.' sampai '... pernah sampai empat puluh tujuh tahun.'"]
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
