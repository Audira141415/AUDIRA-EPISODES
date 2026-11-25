"""Writes each episode's script-lines.json. Markup {display|spoken}: display goes on screen and in subtitles, spoken goes to Cartesia.
Run from AUDIRA_FAKTA_GAME_2_2026: python _tools/write-scripts.py"""
import json, re
from pathlib import Path

AUD = "Ikuti {AUDIRA|Audira} untuk fakta game berikutnya."
NES = "{NES|En E Es}"
NT = "{Nintendo|Nintendo}"

S = {
    "EP01_KONAMI_CODE": [
        "Atas, atas, bawah, bawah, kiri, kanan, kiri, kanan, B, A. Kode cheat paling terkenal di dunia ini sebenarnya lupa dihapus.",
        f"Pembuatnya Kazuhisa {{Hashimoto|Hasyimoto}} dari Konami. Pertengahan tahun delapan puluhan, dia ditugaskan memindahkan game arkade {{Gradius,|Gradius,}} buatan {{1985,|seribu sembilan ratus delapan puluh lima,}} ke konsol {NT}, {{NES.|En E Es.}}",
        "Masalahnya, {Gradius|Gradius} sangat sulit. Saat pengujian, {Hashimoto|Hasyimoto} sendiri tidak sanggup memainkannya sampai tamat. Padahal tim harus bisa memeriksa setiap bagian game.",
        "Jadi dia membuat jalan pintas: sebuah kode yang dimasukkan saat game dijeda. Hasilnya, semua power-up langsung didapat, padahal biasanya dikumpulkan sedikit demi sedikit.",
        "Urutannya dipilih dengan cermat. Cukup mudah diingat penguji, tapi sulit ditekan tanpa sengaja oleh pemain biasa.",
        "Rencananya, kode itu dihapus sebelum rilis. Tapi terlewat, dan baru ketahuan saat game hampir diproduksi massal. Tim memilih membiarkannya, karena menghapusnya bisa memunculkan bug baru.",
        f"{{Gradius|Gradius}} versi {NES} rilis tahun {{1986,|seribu sembilan ratus delapan puluh enam,}} lengkap dengan kode itu. Di Amerika, kode ini makin terkenal lewat {{Contra,|Kontra,}} karena memberi tiga puluh nyawa. Sekarang kode yang sama jadi kejutan rahasia di banyak game dan situs, termasuk situs uang kertas Bank Kanada.",
        f"{{Hashimoto|Hasyimoto}} meninggal tahun {{2020,|dua ribu dua puluh,}} tapi kodenya masih hidup. Kamu pernah mencobanya di game apa? {AUD}",
    ],
    "EP02_KUBURAN_ET": [
        "Tahun {1983,|seribu sembilan ratus delapan puluh tiga,} Atari mengubur belasan truk berisi game di tempat pembuangan sampah di gurun. Lalu menutupnya dengan beton.",
        "Ceritanya berawal dari {E.T.,|I Ti,} film Steven Spielberg yang dijadikan game Atari. Karena urusan lisensinya lama, programmer Howard Scott Warshaw cuma punya lima minggu untuk membuatnya, supaya sempat dijual saat liburan akhir tahun {1982.|seribu sembilan ratus delapan puluh dua.}",
        "Hasilnya terburu-buru, dan kini sering disebut salah satu game terburuk yang pernah dibuat. Atari memproduksi lima juta cartridge. Yang terjual cuma satu setengah juta.",
        "September {1983,|seribu sembilan ratus delapan puluh tiga,} koran lokal Alamogordo, New Mexico, melaporkan sepuluh sampai dua puluh truk barang Atari dari gudang di El Paso dihancurkan dan dikubur di tempat pembuangan sampah kota. Mulai dua puluh sembilan September, timbunan itu dicor beton, hal yang jarang dilakukan untuk sampah.",
        "Bertahun-tahun, cerita ini dianggap legenda urban. Rumornya, jutaan copy {E.T.|I Ti} terkubur di sana.",
        "Lalu dua puluh enam April {2014,|dua ribu empat belas,} tim film dokumenter menggali lokasinya. Gamenya benar-benar ada. Sekitar seribu tiga ratus cartridge diangkat. Menurut pejabat Atari, total yang dikubur sekitar tujuh ratus ribu cartridge dari berbagai game, bukan cuma {E.T.|I Ti.}",
        "Kota Alamogordo lalu melelang sekitar delapan ratus delapan puluh cartridge, dan mengumpulkan lebih dari seratus tujuh ribu dolar. Satu copy {E.T.|I Ti} laku lebih dari seribu lima ratus dolar.",
        f"Jadi game yang dibuang sebagai sampah, kini dijual seperti benda bersejarah. Kamu mau punya satu? {AUD}",
    ],
    "EP03_NAMA_MARIO": [
        "Nama karakter game paling terkenal di dunia ternyata diambil dari pemilik gudang.",
        "Mario pertama muncul di game arkade Donkey Kong, tahun {1981.|seribu sembilan ratus delapan puluh satu.} Tim pembuatnya di Jepang memanggilnya {Ossan,|Ossan,} artinya bapak-bapak. Di buku petunjuk bahasa Inggris, namanya Jumpman. Shigeru Miyamoto bahkan sempat ingin menamainya Mister Video.",
        "Miyamoto belakangan bilang, kalau nama itu yang dipakai, karakternya mungkin sudah hilang dari muka bumi.",
        f"Tahun {{1981,|seribu sembilan ratus delapan puluh satu,}} {NT} of America menyewa gudang di Tukwila, dekat Seattle. Pemiliknya pengusaha keturunan Italia bernama Mario Segale.",
        f"Versi cerita paling terkenal datang dari buku Game Over karya David Sheff. Segale datang menagih uang sewa yang telat, dan berdebat dengan presiden {NT} of America, Minoru Arakawa. Setelah itu, Jumpman diberi nama Mario.",
        "Tapi ada versi lain. Mantan manajer gudang, Don James, bilang nama itu cuma lelucon, karena Segale sangat tertutup sampai tidak ada karyawan yang pernah bertemu dengannya.",
        "Segale sendiri jarang membahasnya. Saat meninggal tahun {2018,|dua ribu delapan belas,} di usia delapan puluh empat tahun, obituarinya menyebut dia selalu menghindari ketenaran itu. Dia ingin dikenal dari pekerjaannya sendiri.",
        f"Jadi nama Mario lahir dari urusan sewa gudang. Kamu lebih percaya versi yang mana? {AUD}",
    ],
    "EP04_NINTENDO_1889": [
        f"{NT} lahir tahun {{1889.|seribu delapan ratus delapan puluh sembilan.}} Bukan sebagai pembuat game, tapi pembuat kartu.",
        f"Dua puluh tiga September {{1889,|seribu delapan ratus delapan puluh sembilan,}} Fusajiro Yamauchi mendirikan {NT} di Kyoto untuk membuat kartu hanafuda buatan tangan, kartu bergambar bunga khas Jepang. Arti nama {NT} yang sering disebut, serahkan keberuntungan pada langit, ternyata tidak punya bukti sejarah.",
        f"Tahun {{1959,|seribu sembilan ratus lima puluh sembilan,}} {NT} bekerja sama dengan Disney membuat kartu bergambar karakter Disney. Penjualannya melonjak. Tapi bisnis kartu lama-lama jenuh.",
        "Maka mereka mencoba usaha lain. Tahun {1960,|seribu sembilan ratus enam puluh,} mereka menjalankan perusahaan taksi di Kyoto bernama Daiya Taxi. Setelah itu, mereka membuat nasi instan, dan penyedot debu bernama {Chiritory.|Ciritori.} Semuanya gagal.",
        f"Setelah Olimpiade Tokyo {{1964,|seribu sembilan ratus enam puluh empat,}} saham {NT} jatuh dari sembilan ratus yen ke enam puluh yen.",
        "Penyelamatnya datang dari tempat tak terduga. Tahun {1966,|seribu sembilan ratus enam puluh enam,} presiden Hiroshi Yamauchi melihat mainan lengan panjang buatan montir mesin kartunya, Gunpei Yokoi, yang dibuat untuk iseng. Mainan itu dijual sebagai Ultra Hand, dan laku ratusan ribu unit. Yokoi lalu dipindah ke bagian pengembangan produk.",
        f"Ada juga cerita bahwa {NT} pernah punya jaringan love hotel. Ternyata sejarawan {NT}, Isao Yamazaki, tidak menemukan buktinya, baik di laporan perusahaan maupun koran masa itu.",
        f"Jadi sebelum Mario, {NT} pernah jualan kartu, taksi, dan nasi instan. Menurutmu, usaha mana yang paling aneh? {AUD}",
    ],
    "EP05_TETRIS": [
        "Tetris dimainkan di seluruh dunia. Tapi selama lebih dari sepuluh tahun, penciptanya tidak menerima royalti sepeser pun.",
        "Namanya Alexey {Pajitnov,|Pazhitnov,} peneliti di pusat komputer Akademi Ilmu Pengetahuan Uni Soviet. Pertengahan tahun delapan puluhan, dia membuat game di sela waktu kerjanya, di komputer Elektronika enam puluh.",
        "Komputer itu tidak punya grafis. Jadi kepingan Tetris digambar dengan tanda kurung siku dan spasi.",
        "Idenya dari puzzle pentomino, dua belas bentuk dari lima kotak. {Pajitnov|Pazhitnov} menyederhanakannya jadi tujuh bentuk dari empat kotak, tetromino. Namanya pun gabungan tetra, artinya empat, dan tenis, olahraga favoritnya.",
        "Versi berwarna untuk {IBM PC|Ai Bi Em Pi Si} dibuat bersama Vadim Gerasimov, yang saat itu baru enam belas tahun.",
        "Tetris lalu menyebar ke luar negeri. Tapi karena {Pajitnov|Pazhitnov} pegawai negara, haknya dikelola lembaga Soviet bernama {ELORG.|Elorg.} Dia tidak mendapat royalti.",
        "Tetris versi Game Boy terjual lebih dari tiga puluh lima juta kopi. Baru tahun {1996,|seribu sembilan ratus sembilan puluh enam,} setelah haknya kembali, {Pajitnov|Pazhitnov} mendirikan The Tetris Company bersama Henk Rogers, dan akhirnya menerima bagiannya.",
        f"Jadi game yang membuat jutaan orang ketagihan, lama tidak menghasilkan apa-apa bagi penciptanya. Kamu pernah main Tetris sampai lupa waktu? {AUD}",
    ],
}

for ep, lines in S.items():
    Path(ep).mkdir(exist_ok=True)
    # punctuation must sit inside {display|spoken}, or it becomes its own caption word
    lines = [re.sub(r"\{([^|}]*)\|([^}]*)\}([,.?:!])", r"{\1\3|\2\3}", t) for t in lines]
    out = [{"id": f"s{i + 1}", "text": t} for i, t in enumerate(lines)]
    Path(ep, "script-lines.json").write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf8")
    print(ep, len(out))
