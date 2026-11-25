"""Adds verified detail so each film reaches about 200 spoken words. Run from AUDIRA_IJAZAH_2026, then rerun write-script-viral.py."""
from pathlib import Path

F = Path("_tools/write-script-viral.py")
s = F.read_text(encoding="utf8")
PAIRS = [
    ('mengangkat ijazahnya di {PN} Jakarta Timur."', 'mengangkat ijazahnya di {PN} Jakarta Timur. Hakim sempat bilang, nanti saja setelah sidang. Jokowi memohon, karena sudah berjanji."'),
    ('mulai {{1980.|sembilan belas delapan puluh.}}"' if False else 'mulai {1980.|sembilan belas delapan puluh.}"', 'mulai {1980.|sembilan belas delapan puluh.} Katanya, fakultasnya tak punya jurusan, dan ia banyak mengambil mata kuliah teknologi kayu."'),
    ('Wisuda, {19|sembilan belas} November."', 'Wisuda, {19|sembilan belas} November, bersama {14|empat belas} orang dari fakultasnya."'),
    ('("s5", "Ia bilang, ijazah itu ditunjukkan', '("s5", "Judul skripsinya, katanya, diajukan sampai tiga kali. Lalu ijazah itu ditunjukkan'),
    ('Ijazah itu sudah diuji Labfor Polri. Dan itu', 'Ijazah itu sudah diuji Labfor Polri, Bareskrim. Dan itu'),
    ('Tapi Roy meminta uji independen,', 'Kertas, tinta, stempel, sampai tanda tangan diuji. Tapi Roy meragukannya, dan meminta uji independen,'),
    ('masa diuji-uji, sudah selesai."', 'masa diuji-uji, sudah selesai. Masa mau diuji lagi, diuji mana lagi."'),
    ('Kubu Roy bilang akan terus memintanya.', 'Refly juga menduga ijazah di sidang berbeda dengan yang ditunjukkan di Polda Metro, Desember lalu, meski ia sendiri menyebut itu baru perasaan. Kubu Roy bilang akan terus meminta pengujian.'),
    ('ia menyebut Roy Suryo bukan peneliti. Hakim', 'ia menyebut Roy Suryo bukan peneliti. Peneliti etikanya tidak seperti ini, katanya. Hakim'),
    ('Hakim menilai itu sudah dijawab.', 'Jokowi mengutip ucapan Roy di video April {2025.|dua ribu dua puluh lima.} Hakim menilai itu sudah dijawab.'),
    ('Pelan saja, santai."', 'Pelan saja, santai. Setelah reda, sidang dibuka lagi, dan tiap tim diminta menjaga anggotanya."'),
    ('Mau lanjut atau keluar?"', 'Mau lanjut atau keluar? Unsur pasal, kata hakim, jangan ditanyakan ke saksi."'),
    ('("s7", "Sidang Roy berjalan', '("s7", "Di luar, ratusan pendukung bertahan sampai petang. Sidang Roy berjalan'),
]
for a, b in PAIRS:
    if a not in s:
        raise SystemExit("MISSING " + a)
    s = s.replace(a, b)
F.write_text(s, encoding="utf8")
print("ok")
