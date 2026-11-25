"""Writes EP01 script-lines.json. Markup {display|spoken}: display goes on screen and in subtitles, spoken goes to Cartesia.
Run from AUDIRA_IJAZAH_2026: python _tools/write-script.py"""
import json
from pathlib import Path

TNR = "{Times New Roman|Taims Nyu Romen}"
Y19 = "{2019|dua ribu sembilan belas}"
Y22 = "{2022|dua ribu dua puluh dua}"
Y25 = "{2025|dua ribu dua puluh lima}"

LINES = [
    ("s1", "Hakim bilang, nanti saja setelah sidang. Jokowi memohon. Lalu ijazah itu terangkat di depan pengunjung."),
    ("s2", "Di dekatnya, terdakwa Roy Suryo tertawa. {“Wong|Wong} palsu kok {ditunjukkan,”|ditunjukkan,} katanya."),
    ("s3", "Pengadilan Negeri Jakarta Timur, {5|lima} November. {6.770|enam ribu tujuh ratus tujuh puluh} aparat berjaga, padahal ruang sidang cuma untuk {80|delapan puluh} orang."),
    ("s4", f"Tudingannya lama. {Y19} beredar di {{Facebook.|Fesbuk.}} {Y22} masuk gugatan, lalu dicabut. {Y25}, Rismon Sianipar menyorot font {TNR} pada dokumen {{1985.|sembilan belas delapan lima.}}"),
    ("s5", "Katanya, font itu belum ada. Padahal menurut pembuatnya, {Monotype,|Monotaip,} huruf ini lahir tahun {1932.|sembilan belas tiga puluh dua.} Jokowi bilang, ribuan skripsi di percetakan yang sama juga begitu."),
    ("s6", f"Mei {Y25}, labfor Bareskrim menguji kertas, tinta, stempel, dan tanda tangan. Hasilnya identik dengan milik tiga rekan seangkatan. Roy tetap menyebutnya palsu, dan mempersoalkan tanda tangan di skripsi."),
    ("s7", "Atas laporan Jokowi, {8|delapan} orang jadi tersangka. Rismon, Eggi, dan Damai berdamai, penyidikannya dihentikan. Roy dan Dokter Tifa kini terdakwa."),
    ("s8", "Di bawah sumpah, Jokowi bertanya: belum lihat ijazah asli, kok bilang palsu? Menurut survei yang ia ingat, {18|delapan belas} persen warga percaya tudingan ini. Sekitar {34|tiga puluh empat} juta orang."),
    ("s9", "Tapi ingat, yang diuji sidang ini adalah dakwaan terhadap terdakwa. Hakim belum memutus, jadi Roy dan Tifa belum bisa disebut bersalah. Kertasnya sudah terangkat. Putusannya belum."),
]
ep = Path("EP01_SELEMBAR_KERTAS")
ep.mkdir(exist_ok=True)
(ep / "script-lines.json").write_text(json.dumps([{"id": a, "text": b} for a, b in LINES], ensure_ascii=False, indent=1), encoding="utf8")
print("ok", len(LINES))
