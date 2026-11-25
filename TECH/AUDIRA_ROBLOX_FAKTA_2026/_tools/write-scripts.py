"""Writes each episode's script-lines.json. Markup {display|spoken}: display goes on screen and in subtitles, spoken goes to Cartesia.
Run from AUDIRA_ROBLOX_FAKTA_2026: python _tools/write-scripts.py"""
import json
from pathlib import Path

RB = "{Roblox|Roblocks}"
RBd = "{Roblox.|Roblocks.}"
RBc = "{Roblox,|Roblocks,}"
OOF = "{oof|uf}"
BZ = "{Baszucki|Bazuki}"

S = {
    "EP01_SUARA_OOF": [
        f"Suara mati paling terkenal di {RBc} {OOF}, ternyata bukan buatan {RBd}",
        f"Hampir semua pemain lama kenal suara ini. Karakter jatuh, badannya copot berantakan, lalu terdengar: {{oof.|uf.}} Suara itu jadi meme di mana-mana, dari video lucu sampai remix lagu.",
        "Asalnya dari game komputer bernama {Messiah,|Mesaiya,} rilis tahun {2000.|dua ribu.} Komposer {Tommy Tallarico|Tomi Talariko} mengaku memegang hak atas suara itu. Dia juga menyebut sound designer {Joey Kuras|Joi Kuras} ikut membuatnya.",
        f"Tahun {{2019,|dua ribu sembilan belas,}} {{Tallarico|Talariko}} mempersoalkan pemakaiannya di {RBd} Tahun {{2020,|dua ribu dua puluh,}} mereka sepakat. Developer yang ingin memakai suara {OOF} di gamenya harus membayar satu dolar, atau seratus {{Robux.|Robaks.}}",
        f"Lalu dua puluh enam Juli {{2022,|dua ribu dua puluh dua,}} {RB} mengumumkan suara {OOF} dihapus karena masalah lisensi. Penggantinya suara erangan baru yang terdengar jauh lebih datar. Banyak pemain protes.",
        f"Selama tiga tahun, {OOF} cuma hidup di meme. Sampai delapan belas Juli {{2025,|dua ribu dua puluh lima,}} akun resmi {RB} menulis: a comeback so good it hurts. Suara {OOF} kembali, dan file audionya dibagikan di Creator Hub untuk dipakai developer.",
        f"Jadi suara sekecil itu pernah jadi urusan hak cipta bertahun-tahun. Pelajaran buat kreator: cek dulu lisensi setiap suara yang kamu pakai. Kamu tim {OOF} lama, atau tim suara pengganti?",
    ],
    "EP02_DYNABLOCKS": [
        f"Sebelum bernama {RBc} game ini punya nama lain: {{DynaBlocks.|Dainablocks.}} Dan akarnya justru software pelajaran fisika.",
        "Tahun {1989,|seribu sembilan ratus delapan puluh sembilan,} David {Baszucki|Bazuki} bersama saudaranya, Greg, mendirikan Knowledge Revolution. Produknya bernama Interactive Physics, simulasi fisika dua dimensi untuk sekolah. Bola menggelinding, pegas memantul, semuanya bisa dicoba di layar.",
        "Insinyur yang ikut mengerjakannya bernama Erik Cassel, wakil presiden bidang teknik. Desember {1998,|seribu sembilan ratus sembilan puluh delapan,} perusahaan itu dibeli MSC Software senilai dua puluh juta dolar.",
        f"Software itu ternyata paling populer di kalangan pelajar muda. Di wawancara dengan Forbes tahun {{2016,|dua ribu enam belas,}} {BZ} menyebut kesuksesan itulah inspirasi {RBd} Dunianya tetap dunia fisika, tapi pemainnya yang membangun.",
        f"Desember {{2003,|dua ribu tiga,}} {BZ} dan Cassel mulai membuat prototipe. Nama kerjanya berganti-ganti: {{eBlocks,|iblocks,}} lalu {{GoBlocks,|goblocks,}} lalu {{DynaBlocks.|Dainablocks.}} Januari {{2004,|dua ribu empat,}} namanya jadi {RBc} gabungan kata robots dan blocks.",
        f"Awalnya cuma mereka berdua. Mereka membuat game sendiri sebelum alat pembuatnya selesai, lalu beberapa lusin pemain ikut menguji. {RB} resmi dirilis satu September {{2006.|dua ribu enam.}}",
        f"Erik Cassel tidak sempat melihat {RB} sebesar sekarang. Dia meninggal karena kanker tahun {{2013.|dua ribu tiga belas.}}",
        f"Jadi {RB} lahir dari pengamatan sederhana: anak-anak lebih suka membangun daripada sekadar menonton. Kamu sendiri, lebih suka main, atau bikin game?",
    ],
    "EP03_JOHN_DOE": [
        f"Setiap delapan belas Maret, muncul peringatan: John Doe akan meretas akun {{Roblox|Roblocks}} kamu. Siapa sebenarnya dia?",
        f"Setiap akun {RB} punya nomor ID. Akun nomor satu milik {RB} sendiri. Nomor dua bernama John Doe. Nomor tiga, Jane Doe.",
        "Di Amerika, John Doe dan Jane Doe adalah nama samaran untuk orang yang tidak diketahui namanya, mirip si Fulan di sini. Jadi ini nama contoh, bukan nama orang sungguhan.",
        f"Datanya bisa dicek lewat API publik {RBd} Ketiga akun itu tercatat dibuat di detik yang sama: dua puluh tujuh Februari {{2006,|dua ribu enam,}} pukul sembilan malam lewat enam menit, waktu UTC. Akun nomor empat dan lima? Tidak ada.",
        f"Bandingkan dengan akun builderman milik pendiri {RBc} David {BZ}. Nomornya seratus lima puluh enam, dibuat delapan Maret {{2006.|dua ribu enam.}}",
        "Lalu dari mana cerita hacker-nya? Sekitar tahun {2017,|dua ribu tujuh belas,} beberapa YouTuber menyebar rumor bahwa John Doe akan meretas akun pemain tanggal delapan belas Maret. Rumor itu terus diulang setiap tahun, sampai ke TikTok.",
        "Faktanya, tidak ada bukti akun itu pernah meretas siapa pun. Statusnya pun tidak diblokir. Kalau ada yang memakai rumor ini untuk menakut-nakuti, lalu minta password kamu, itulah penipuan yang sebenarnya.",
        f"Jadi John Doe bukan hacker. Dia cuma akun nomor dua yang lahir bersama {RBd} Kamu pernah termakan rumor ini?",
    ],
    "EP04_GRAVITASI": [
        f"Kalau dihitung pakai satuan resmi {RBc} gravitasinya hampir enam kali gravitasi bumi.",
        f"{RB} mengukur jarak dengan satuan stud. Menurut dokumentasi resmi {RBc} satu stud setara dua puluh delapan sentimeter. Dari situ, semua angka fisika di {RB} bisa diubah ke meter.",
        f"Gravitasi bawaan {RB}: seratus sembilan puluh enam koma dua stud per detik kuadrat. Kalau diubah, hasilnya lima puluh empat koma sembilan meter per detik kuadrat. Bumi cuma sembilan koma delapan. Hampir enam kali lipat.",
        f"Dokumen yang sama bahkan menulis angka gravitasi realistis: tiga puluh lima stud per detik kuadrat. Jadi angka bawaan {RB} memang jauh dari dunia nyata.",
        "Lalu kenapa karakter tidak terasa berat? Karena lompatannya juga kuat. Tinggi lompat bawaan tujuh koma dua stud, sekitar dua meter, setinggi pintu. Dan karakter cuma sekitar setengah detik di udara.",
        "Sekarang bayangkan gravitasinya diganti jadi realistis, tapi tenaga lompatnya tetap. Hitungan kami, karakter melambung sekitar empat puluh stud. Itu kira-kira sebelas meter, hampir setinggi gedung empat lantai, dan melayang tiga detik.",
        "Kecepatan jalannya juga tinggi: enam belas stud per detik. Kalau diubah, sekitar enam belas kilometer per jam, setara orang yang berlari cukup kencang.",
        "Developer bebas mengubah angka gravitasi ini, misalnya untuk level di bulan. Kalau kamu bikin game, gravitasi berapa yang kamu pilih?",
    ],
    "EP05_TIX": [
        f"Dulu, {RB} punya dua mata uang. Salah satunya bisa kamu dapat gratis, cukup dengan login setiap hari.",
        f"Namanya Tickets, atau {{Tix.|Tiks.}} Mata uang ini dirancang bersama {{Robux|Robaks}} oleh David {BZ}, Erik Cassel, John {{Shedletsky,|Syedletski,}} dan Matt {{Dusek.|Dusek.}}",
        "{Robux|Robaks} jadi tulang punggung ekonomi, dan bisa dibeli dengan uang. {Tix|Tiks} dibuat untuk menghadiahi pemain yang aktif membangun dan bermain, tanpa membagikan {Robux|Robaks} gratis. Kalau {Robux|Robaks} dibagi gratis, nilainya bisa turun, alias inflasi.",
        "{Tix|Tiks} didapat dari bonus login harian. Developer juga dapat {Tix|Tiks} setiap kali tempat buatannya dikunjungi. Pemain bahkan bisa menukar {Tix|Tiks} dengan {Robux|Robaks} di bursa mata uang.",
        f"Lalu lima belas Maret {{2016,|dua ribu enam belas,}} {BZ} menulis di blog {RB}: dalam tiga puluh hari, Tickets akan dihentikan. Dia menyebutnya salah satu perubahan terbesar di platform itu.",
        "Alasannya tiga. Dua mata uang membingungkan pemain baru. Bonus {Tix|Tiks} mendorong orang membuat akun tambahan dan bot. Dan {Roblox|Roblocks} tidak mau pemain datang cuma demi absen harian.",
        "{Baszucki|Bazuki} juga menulis, penghapusan ini bukan untuk mencari uang lebih banyak. Pemain diberi waktu tiga puluh hari untuk menghabiskan {Tix|Tiks} mereka, dan bursa mata uang ditutup.",
        f"Sejak itu, {{Robux|Robaks}} jadi satu-satunya mata uang {RBd} Kalau {{Tix|Tiks}} masih ada sekarang, kamu bakal rajin login tiap hari?",
    ],
}

for ep, lines in S.items():
    Path(ep).mkdir(exist_ok=True)
    out = [{"id": f"s{i + 1}", "text": t} for i, t in enumerate(lines)]
    Path(ep, "script-lines.json").write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf8")
    print(ep, len(out))
