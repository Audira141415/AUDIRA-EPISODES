"""Writes each episode's project/script-lines.json. Markup {display|spoken}: display goes on screen and in subtitles, spoken goes to Cartesia.
Run from anywhere: python _tools/write-scripts.py"""
import json, re
from pathlib import Path

SERIES = Path(__file__).resolve().parent.parent
AUD = "Ikuti {AUDIRA|Audira} untuk sejarah game berikutnya."
HG = "{Higinbotham|Higinbotem}"
BU, AL = "{Bushnell|Busnel}", "{Alcorn|Alkorn}"
SC = "{Scoggins|Skogins}"
DM, WN = "{Doom|Dum}", "{Windows|Windos}"

S = {
    "EP01_BOM_ATOM_TENNIS": [
        "Salah satu video game pertama di dunia dibuat oleh fisikawan yang ikut membuat bom atom pertama.",
        f"Namanya William {HG}. Ia anggota tim yang mengembangkan bom nuklir pertama. Setelah itu, ia justru menjadi pemimpin gerakan untuk membatasi penyebaran senjata nuklir.",
        "Tahun seribu sembilan ratus lima puluh delapan, ia memimpin divisi instrumentasi di laboratorium {Brookhaven|Brukheiven}, New York. Setiap tahun lab itu dibuka untuk pengunjung, tapi isinya cuma tur dan pajangan yang diam.",
        f"{HG} ingin pengunjung punya sesuatu untuk dimainkan. Dari buku manual, ia tahu komputer analog di lab bisa menghitung lintasan rudal, atau bola yang memantul dengan hambatan angin.",
        "Kemampuan itu ia ubah jadi permainan tenis. Lapangannya dilihat dari samping, tampil di layar osiloskop. Ada dua pengendali aluminium: kenop untuk mengatur sudut pukulan, dan tombol untuk memukul.",
        "Alatnya dirakit dalam tiga minggu. Delapan belas Oktober seribu sembilan ratus lima puluh delapan, game bernama {Tennis for Two|Tenis for Tu} dipamerkan. Ratusan pengunjung antre untuk mencobanya.",
        f"Setahun kemudian game ini dibongkar, lalu dilupakan. Namanya baru diingat lagi akhir tahun tujuh puluhan, saat {HG} bersaksi di pengadilan dalam sengketa paten video game.",
        f"Jadi salah satu game hiburan pertama lahir dari tangan ilmuwan nuklir. Kamu baru tahu fakta ini? {AUD}",
    ],
    "EP02_PONG_KOIN_PENUH": [
        "Mesin game Pong yang pertama dilaporkan rusak. Ternyata penyebabnya koin yang terlalu banyak.",
        f"Agustus seribu sembilan ratus tujuh puluh dua. Dua orang dari perusahaan baru bernama Atari, Nolan {BU} dan Allan {AL}, menaruh prototipe Pong di sebuah bar di California, {{Andy Capp's Tavern|Endi Keps Tavern}}.",
        f"Prototipenya dirakit {AL} dari televisi hitam-putih seharga tujuh puluh lima dolar, dimasukkan ke lemari kayu. Mesinnya diletakkan di dekat jukebox dan mesin pinball. Permainannya sederhana: dua pemukul dan satu bola, seperti tenis meja di layar.",
        "Malam pertama, mesin itu langsung ramai. Selama satu setengah minggu berikutnya, makin banyak orang datang untuk bermain.",
        f"Lalu mesinnya bermasalah. Pemilik bar menelepon {AL} untuk memperbaikinya. Saat dibuka, masalahnya ketemu: wadah koinnya penuh sampai meluap oleh koin dua puluh lima sen.",
        f"Mendengar itu, {BU} berubah pikiran. Atari tidak jadi menjual lisensi Pong ke perusahaan lain. Mereka memutuskan membuat mesinnya sendiri.",
        "Bank sempat menolak memberi pinjaman, karena menganggap Pong sejenis pinball, yang waktu itu dicap dekat dengan mafia. Tapi Atari akhirnya mendapat kredit, dan Pong diumumkan pada dua puluh sembilan November seribu sembilan ratus tujuh puluh dua.",
        f"Kerusakan paling menguntungkan dalam sejarah game. Kalau kamu pemilik bar itu, kamu senang atau panik? {AUD}",
    ],
    "EP03_STREET_FIGHTER_COMBO": [
        "Combo, jurus berantai di game fighting, awalnya adalah bug yang tidak sengaja ditemukan.",
        "Tahun seribu sembilan ratus sembilan puluh satu, {Capcom|Kepkom} merilis {Street Fighter II|Strit Faiter Tu} untuk mesin arcade. Pengembangannya makan waktu sekitar dua tahun, dikerjakan tiga puluh lima sampai empat puluh orang.",
        "Suatu hari, seorang pengembang sedang mengecek bug di bonus stage. Babak tambahan ini muncul setiap tiga pertandingan: pemain menghancurkan sebuah mobil untuk mendapat poin tambahan.",
        "Ia melihat sesuatu yang aneh. Adegannya direkam lalu diputar ulang. Ternyata, di momen pukulan pertama, pemain bisa menyelipkan pukulan kedua, lalu pukulan berikutnya.",
        "Masalahnya, timing-nya sangat sulit. Tim menganggap trik ini mustahil dipakai pemain biasa. Jadi fitur itu tidak dihapus, tapi dibiarkan tersembunyi.",
        "Di {Street Fighter II,|Strit Faiter Tu,} tim mengira paling banyak empat pukulan bisa disambung. Ternyata bisa sampai delapan.",
        "Di game-game berikutnya, timing-nya dibuat lebih longgar, dan combo dijadikan fitur resmi. Sistem ini lalu menjadi fitur standar game fighting. Gamenya sendiri laris: lebih dari dua ratus ribu mesin arcade dari semua versinya terjual di seluruh dunia.",
        f"Jadi kadang kesalahan bisa jadi fitur terbaik. Combo terpanjang yang pernah kamu lakukan berapa pukulan? {AUD}",
    ],
    "EP04_GAME_BOY_PERANG_TELUK": [
        "Sebuah {Game Boy|Geim Boi} terbakar dan meleleh kena bom. Tapi saat dinyalakan, ia masih bisa main Tetris.",
        f"{{Game Boy|Geim Boi}} adalah konsol genggam Nintendo yang dirilis tahun seribu sembilan ratus delapan puluh sembilan. Di Amerika, konsol ini dijual satu paket dengan Tetris. Salah satu pemiliknya Stephan {SC}, seorang petugas medis yang bertugas di Perang Teluk.",
        "Saat baraknya terkena bom, {Game Boy|Geim Boi} miliknya ikut terbakar. Bagian depannya meleleh parah.",
        f"Masih dalam masa tugas, {SC} mengirim konsol itu ke majalah {{Nintendo Power|Nintendo Pawer}}. Ia berharap {{Game Boy-nya|Geim Boi-nya}} bisa diganti.",
        "Teknisi yang menerimanya menilai konsol itu sudah tidak tertolong. Tapi saat dicoba, ternyata masih menyala. Tombol Start dan Select masih berfungsi. Mereka mengujinya dengan kaset Tetris.",
        f"Majalah itu mengirim {{Game Boy|Geim Boi}} pengganti, sebagai hadiah khusus {{Desert Storm|Dezert Storm}}. Surat {SC} dan foto konsolnya dimuat di edisi dua puluh enam.",
        "Konsol rusak itu lalu dipajang di toko Nintendo di New York sebagai bukti ketangguhannya, terus menyala dan dirawat berkala. Tahun dua ribu dua puluh tiga, konsol itu dipastikan sudah dikembalikan ke kantor pusat Nintendo Amerika.",
        f"Konsol paling tangguh di dunia: kena bom, tetap main Tetris. Konsol game pertamamu dulu masih ada? {AUD}",
    ],
    "EP05_DOOM_WINDOWS_95": [
        f"Tahun seribu sembilan ratus sembilan puluh lima, ada satu game yang diperkirakan terpasang di lebih banyak komputer daripada {WN} sembilan puluh lima.",
        f"Namanya {DM}, dirilis studio kecil {{id Software|ai di Sofwer}} tahun seribu sembilan ratus sembilan puluh tiga untuk komputer {{MS-DOS.|em es dos.}}",
        f"Cara jualnya unik. {DM} memakai model {{shareware:|syerwer:}} episode pertama dibagikan gratis dan boleh disalin siapa saja. Dua episode sisanya harus dibeli.",
        "Menurut perkiraan perusahaan, cuma sekitar satu persen pengunduh yang membeli versi lengkap. Tapi itu sudah menghasilkan sekitar seratus ribu dolar per hari di awal penjualan.",
        "Bulan Mei seribu sembilan ratus sembilan puluh empat, versi gratisnya diperkirakan sudah tersebar lebih dari satu juta kali. Setiap salinan gratis bisa disalin lagi ke komputer lain.",
        f"Akhir tahun seribu sembilan ratus sembilan puluh lima, {DM} diperkirakan terpasang di lebih banyak komputer di dunia daripada {WN} sembilan puluh lima, sistem operasi baru {{Microsoft|Maikrosof}} saat itu.",
        f"Salah satu video promosi {WN} sembilan puluh lima bahkan menampilkan {{Bill Gates|Bil Geits}} yang disisipkan secara digital ke dalam game itu. Tapi ingat, semua angka tadi perkiraan, bukan hitungan pasti.",
        f"Game yang dibagikan gratis justru menyebar paling jauh. Kamu pernah main versi demo gratis yang bikin ketagihan? {AUD}",
    ],
}

for ep, lines in S.items():
    d = SERIES / ep / "project"
    d.mkdir(parents=True, exist_ok=True)
    # punctuation must sit inside {display|spoken}, or it becomes its own caption word
    lines = [re.sub(r"\{([^|}]*)\|([^}]*)\}([,.?:!])", r"{\1\3|\2\3}", t) for t in lines]
    out = [{"id": f"s{i + 1}", "text": t} for i, t in enumerate(lines)]
    (d / "script-lines.json").write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf8")
    print(ep, len(out))
