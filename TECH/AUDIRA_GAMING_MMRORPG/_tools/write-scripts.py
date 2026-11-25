"""Writes each episode's script-lines.json. Markup {display|spoken}: display goes on screen and in subtitles, spoken goes to Cartesia.
Run from AUDIRA_GAMING_MMRORPG: python _tools/write-scripts.py"""
import json, re
from pathlib import Path

MIR = "{MIR4|Mir Four}"
DS = "{Darksteel|Darkstil}"
DR = "{DRACO|Drako}"
WX = "{WEMIX|Wimiks}"
XD = "{XDRACO|Eks Drako}"
RO = "{R.O.H.A.N.2|Rohan Tu}"
RX = "{RUBYx|Rubi Eks}"
SR = "{sRUBY|Es Rubi}"
R = "{RUBY|Rubi}"
BT = "{BIGTIME|Big Taim}"
HG = "{Hourglass|Awergles}"
NCG = "{NCG|En Si Ji}"
WN = "{WNCG|We En Si Ji}"

S = {
    "EP01_MIR4": [
        f"Batu di dalam game ini pernah bisa jadi kripto. Sejak {{30|tiga puluh}} Oktober, jalurnya disetop.",
        f"Namanya {MIR}, {{MMORPG|Em Em O Ar Pi Ji}} buatan Wemade, rilis global {{2021.|dua ribu dua puluh satu.}} Bahan utamanya {DS}, mineral yang kamu tambang sendiri, dan juga dipakai untuk klan dan perang antarpemain.",
        f"Prosesnya disebut smelting. {{100.000|Seratus ribu}} {DS} dilebur jadi satu {DR}. Itu angka dasar. Kursnya naik mengikuti jumlah yang ditambang pemain, dan ada batas harian.",
        f"Syaratnya, karakter minimal level {{40,|empat puluh,}} dan akun terhubung ke dompet {WX}. Ada biaya transaksi. Tambang juga tidak bebas: ada batas level, dan penguasa wilayah menarik pajak.",
        f"Dari situ, {DR} bisa ditukar ke {WX}, lalu dikirim ke bursa kripto. Karakter dan item punya pasar sendiri, {XD}.",
        f"Masalahnya, semua jalur itu bergantung pada satu ekosistem. {{26|Dua puluh enam}} Juli {{2026,|dua ribu dua puluh enam,}} kontrak stablecoin {WX} dibobol. Peretas mencetak {{5,2|lima koma dua}} juta token. Semua bridge dihentikan.",
        f"Oktober, pengumuman resmi {MIR}: semua fitur blockchain, termasuk {{NFT|En Ef Ti}} karakter dan {XD}, disetop sampai ada kabar lanjutan. Alasannya pemeliharaan. Harga {WX} sudah turun lebih dari {{99|sembilan puluh sembilan}} persen dari puncak.",
        "Jadi hasil tambang bisa punya nilai, selama jalurnya terbuka dan ada pembeli. Menurut kamu, farming seperti ini sumber penghasilan, atau justru butuh modal dan waktu besar?",
    ],
    "EP02_ROHAN2": [
        f"Empat November {{2026.|dua ribu dua puluh enam.}} Di {RO}, pintu dari game ke kripto dijadwalkan tutup. Selamanya.",
        f"Setahun sebelumnya, {RO} Global rilis dengan tiga juta pra-registrasi dan model ekonomi bernama {{ROHANomics.|Rohanomiks.}} Idenya sederhana: main biasa tanpa dompet kripto, atau ubah hasil main jadi aset.",
        f"Ada tiga token. {R}, mata uang dalam game. {SR}, yang diterima penjual saat barangnya laku, dipotong sepuluh persen. {RX}, versi on-chain yang bisa diperdagangkan.",
        f"Jalurnya begini. Jual item ke pemain lain, dapat {SR}. Lewat {{CROSS RAMP,|Kros Remp,}} {SR} dicetak jadi {RX}. Lalu {RX} dijual di {{DEX,|Deks,}} bursa terdesentralisasi. Jalur ini juga bisa dibalik.",
        f"Pasokannya sudah dipangkas. Awalnya satu miliar {R}. Lewat {{Hyper Burn,|Haiper Bern,}} sisa lima belas juta. Tapi langka belum tentu dipakai. Empat November, saat layanan menuju tutup, dasbor resmi mencatat cuma sekitar {{1.382|seribu tiga ratus delapan puluh dua}} {R} terpakai sehari.",
        f"{{30|Tiga puluh}} September, pengelola mengumumkan layanan berakhir. Penjualan berbayar dihentikan. Refund khusus cuma untuk pembelian bulan itu, dan {SR} hasil pasar tidak termasuk.",
        f"{{30|Tiga puluh}} Desember, server tutup. {{13|Tiga belas}} Januari, {RX} dihapus dari {{DEX.|Deks.}} Tokennya tetap di dompet, tapi perdagangannya di sana berakhir.",
        f"Jadi token bisa hidup lebih lama dari gamenya, tapi nilainya belum tentu. Menurut kamu, apakah sistem seperti ini benar-benar memberi kesempatan kepada pemain biasa?",
    ],
    "EP03_BIG_TIME": [
        "Bayangkan loot dari dungeon bisa kamu jual. Di {Big Time,|Big Taim,} itu sungguhan. Tapi tidak semua loot, dan harganya tidak dijamin.",
        "{Big Time|Big Taim} gratis dimainkan. Kamu masuk dungeon yang dibuat prosedural, melawan monster, dan sesekali dapat drop langka yang disebut {Collectible.|Kolektibel.}",
        "{Collectible|Kolektibel} ada dua jenis. Kosmetik, yang mengubah tampilan tanpa menambah kekuatan. Dan utilitas, seperti tanah {SPACE|Spes} dan workshop. Jumlah cetaknya dibatasi.",
        f"Token {BT} cuma jatuh kalau kamu memakai {HG}. Benda ini punya waktu aktif. Habis, harus diisi ulang di {{Time Warden.|Taim Worden.}} Jadi, alat untuk dapat token itu sendiri harus dibeli atau dibuat.",
        f"Token itu dipakai pemilik {{Forge|Forj}} dan {{Armory|Armori}} untuk membuat kosmetik. Kosmetiknya dijual ke pemain lain di {{Open Loot.|Open Lut.}} {BT} sendiri tidak dijual di sana. Harus diekspor ke dompet kripto.",
        "Di sini biayanya. Ikut bermain memang gratis. Tapi ikut produksi perlu {SPACE|Spes} dan workshop, yang dibeli di marketplace, atau menunggu drop yang sangat langka.",
        f"Angka besar juga bisa menyesatkan. Maret {{2024,|dua ribu dua puluh empat,}} studionya mengumumkan pendapatan lebih dari seratus juta dolar. Itu pendapatan studio, bukan untung pemain. Harga {BT} kini sekitar {{0,67|nol koma enam tujuh}} sen dolar, turun lebih dari {{99|sembilan puluh sembilan}} persen dari puncak.",
        "Jadi loot bisa dijual, kalau ada pembelinya. Kalau item game bisa diperdagangkan, apakah berburu loot bisa jadi pekerjaan?",
    ],
    "EP04_NINE_CHRONICLES": [
        "Game ini tidak punya server. Setiap aksi dicatat di blockchain, di jaringan yang dijalankan para pemainnya.",
        "Namanya {Nine Chronicles,|Nain Kronikels,} {RPG|Ar Pi Ji} dari {Planetarium Labs,|Planetarium Lebs,} umurnya sudah enam tahun. Gratis dimulai, dan harga barang ditentukan permintaan pemain, bukan toko developer.",
        "Alurnya jelas. Bertarung, kumpulkan material, buka resep. Crafting butuh waktu yang dihitung dalam blok, rata-rata sepuluh detik per blok. Statistik item diacak, jadi nilai tiap barang bisa beda.",
        f"Hasilnya kamu pakai sendiri, atau jual di Shop. Mata uangnya {NCG}. Kamu yang pasang harga, dan saat laku dipotong pajak.",
        f"Arena menambah jalur lain. Hadiah dibagi menurut jumlah medali, jadi bukan cuma juara. Staking mulai {{50|lima puluh}} {NCG}, imbalannya ramuan dan {{Hourglass|Awergles}} yang bisa dijual lagi.",
        f"Keluar ke dunia kripto harus lewat {WN}, token Ethereum satu banding satu. Minimal seratus {NCG}. Menurut dokumen resmi, di bawah seribu kena biaya sepuluh {NCG}.",
        f"Sekarang hitung jujur. Oktober lalu, ulang tahun keenam menyiapkan lebih dari empat juta {NCG}. Kedengarannya besar. Dengan harga {WN} empat November, nilainya sekitar lima belas ribu dolar, untuk semua pemain. Puncak harganya dulu enam dolar. Kini tidak sampai setengah sen.",
        "Jadi ekonominya nyata, nilainya yang mengikuti pasar. Bisakah pemain membangun ekonomi sendiri hanya dengan mengumpulkan dan memperdagangkan item?",
    ],
    "EP05_PIXELS": [
        "Menanam di game, lalu dapat kripto? Di {Pixels,|Piksels,} tidak sesederhana itu.",
        "{Pixels|Piksels} adalah game farming online di jaringan {Ronin.|Ronin.} Gratis dimainkan. Situs resminya menyebut lebih dari sepuluh juta pemain.",
        "Alurnya akrab. Tanam, panen, kumpulkan sumber daya, masak, buat barang. Tiap aksi menguras energi. Energi terisi satu persen tiap lima menit, atau lewat makanan.",
        "Lahan membedakan hasil. Semua pemain dapat {Speck,|Spek,} lahan gratis dengan hasil terbatas. Lahan {NFT|En Ef Ti} memberi hasil tertinggi. Pemain tanpa lahan bisa bekerja di sana sebagai {sharecropper.|syerkroper.}",
        "Token {PIXEL|Piksel} beda dengan koin biasa. Koin untuk kebutuhan harian. {PIXEL|Piksel} mata uang premium: dipakai untuk peningkatan, dibagikan lewat tugas dan hadiah musiman, dan bisa diperdagangkan di {Ronin.|Ronin.}",
        "Tapi reward tidak otomatis. {Pixels|Piksels} berkali-kali merombak ekonominya. {Chapter 2.5|Cepter dua koma lima} memangkas inflasi koin harian hampir {84|delapan puluh empat} persen. Laporan terbaru CEO-nya: terlalu banyak nilai masih mengalir ke pengguna yang cuma mengambil.",
        "Harga {PIXEL|Piksel} empat November sekitar {0,42|nol koma empat dua} sen dolar, turun lebih dari {99|sembilan puluh sembilan} persen dari puncak {2024.|dua ribu dua puluh empat.} Gamenya tetap jalan. Kata pengembangnya, tidak akan ditutup.",
        "Jadi bermain tidak otomatis menghasilkan uang. Menurut kamu, game farming seperti {Pixels|Piksels} ini peluang ekonomi digital, atau hanya hiburan dengan sistem token?",
    ],
}
TOK = re.compile(r"\{([^|}]*)\|([^}]*)\}")
for ep, lines in S.items():
    d = Path(ep)
    (d / "AUDIO/work").mkdir(parents=True, exist_ok=True)
    (d / "SUBTITLES").mkdir(exist_ok=True)
    (d / "PROJECT/HyperFrames_Remotion/compositions").mkdir(parents=True, exist_ok=True)
    # Punctuation written after a token moves inside it, so it never becomes a word of its own.
    lines = [re.sub(r"\{([^|}]*)\|([^}]*)\}([.,:;?!])", r"{\1\3|\2\3}", t) for t in lines]
    out = [{"id": f"s{i+1}", "text": t} for i, t in enumerate(lines)]
    (d / "script-lines.json").write_text("[\n" + ",\n".join(json.dumps(x, ensure_ascii=False) for x in out) + "\n]\n", encoding="utf8")
    n = sum(len(TOK.sub(lambda m: m.group(2), t).split()) for t in lines)
    print(ep, "spoken words", n, "at 145 WPM =", round(n / 145 * 60, 1), "s")
