"""Writes each episode's script-lines.json. Markup {display|spoken}: display goes on screen and in subtitles, spoken goes to Cartesia.
Run from AUDIRA_AI_GAME_2026: python _tools/write-scripts.py"""
import json, re
from pathlib import Path

AI = "{AI|Ei Ai}"
RB = "{Roblox|Roblocks}"
NPC = "{NPC|En Pi Si}"
BD = "{Build|Bild}"
Y26 = "{2026|dua ribu dua puluh enam}"

S = {
    "EP01_BUILD_HP": [
        "Satu kalimat di HP, dan kamu punya game.",
        f"Fiturnya bernama {BD}, tab baru di aplikasi {RB}, diumumkan Juli {Y26}. Tidak perlu komputer. Tidak perlu bisa coding. Cukup mengetik, seperti berkirim pesan ke teman. Versi dasarnya gratis.",
        "Contohnya, kamu ketik: game petualangan santai di hutan lebat, dengan banyak rintangan. Itu contoh dari {Roblox|Roblocks} sendiri, cuma satu kalimat.",
        f"Kalimat itu tidak langsung jadi game. {AI} menulis rencananya dulu, semacam dokumen desain. Baru setelah itu dia membuat kode, dunia, karakter, tampilan, dan suara.",
        "Hasilnya bisa langsung kamu mainkan di HP yang sama. Kurang seru? Minta diubah, lalu uji lagi. Kalau sudah yakin, bagikan ke teman, atau terbitkan.",
        "Yang mencoba juga bukan cuma developer. Dari percobaan awal, {71|tujuh puluh satu} persen penggunanya belum pernah memakai {Roblox|Roblocks} Studio. Jadi banyak dari mereka baru pertama kali membuka alat pembuat game {Roblox.|Roblocks.}",
        "Tapi ada batasnya. {Roblox|Roblocks} sendiri menyebut hasilnya game dasar, sebuah titik awal. Alpha-nya baru di empat negara: Selandia Baru, Singapura, Serbia, dan Thailand. Indonesia belum disebut. Game yang terbit juga cuma untuk usia enam belas tahun ke atas.",
        f"Jadi {AI} bisa memulai gamenya, tapi ide serunya tetap dari kamu. Kalau cuma boleh satu kalimat, game apa yang kamu minta?",
    ],
    "EP02_MOBIL_4D": [
        "Ketik: mobil. Lalu kamu masuk, dan menyetirnya.",
        f"Ini bukan gambar. Namanya {{4D|For Di}} generation, dari {RB}, dibuka sebagai beta publik Februari {Y26}. Yang keluar adalah objek yang benar-benar berfungsi.",
        "Model {3D|Tri Di} biasa itu satu bongkah. Sebagus apa pun bentuknya, rodanya menyatu dengan bodi, jadi tidak bisa berputar. Itu patung, bukan kendaraan.",
        f"Triknya ada pada aturan bernama schema. Untuk mobil, namanya {{Car-5.|Kar Faiv.}} Model {AI} bernama {{Cube|Kyub}} harus menghasilkan lima bagian terpisah: satu bodi dan empat roda, masing-masing punya nama.",
        "Lalu skrip perilakunya dipasang. Karena tiap mobil bentuknya beda, skrip itu disesuaikan dulu dengan ukuran mobil barunya. Hasilnya, roda berputar dan berbelok.",
        "Sekarang mobil dari satu kalimat tadi benar-benar bisa dikendarai. Kamu masuk, jalan, dan bawa keliling dunia game. Itulah yang disebut dimensi keempat: interaktivitas.",
        "Game pertama yang memakainya adalah {Wish Master.|Wisy Master.} Pemain meminta mobil, pesawat, sampai naga terbang. Saat akses awal, lebih dari {160.000|seratus enam puluh ribu} objek dibuat. Kata developernya, waktu main pemain yang memakai fitur ini naik {64|enam puluh empat} persen.",
        "Awalnya cuma ada dua schema: mobil, dan benda satu bagian. Tapi {Roblox|Roblocks} menargetkan ribuan jenis benda. Kalau bisa meminta apa saja di dalam game, apa yang kamu buat pertama?",
    ],
    "EP03_NPC_OTAK": [
        f"Pemain ini cuma mengetik: memberi tahu jawaban yang benar. Dan {{NPC-nya|En Pi Si nya}} percaya.",
        f"Itu terjadi di {{Where Winds Meet.|Wer Winds Mit.}} Lucunya, {NPC} itu tidak membaca naskah. Dia menyusun jawabannya sendiri.",
        f"{NPC} lama bekerja seperti daftar pilihan. Kamu pilih kalimat, dia keluarkan baris yang sudah ditulis. Tanya di luar daftar, tidak ada jawabannya.",
        f"{NPC} baru punya otak berupa {{LLM,|El El Em,}} model bahasa besar. Kepribadiannya ditulis sebagai instruksi. Di {RB}, contoh resminya: kamu berang-berang yang sangat sibuk, dan selalu ingat bendungannya.",
        "Pertanyaan pemain masuk, model menjawab sesuai karakter, dan ada token konteks untuk melanjutkan percakapan. Di {Total War: Pharaoh,|Total Wor Fero,} penasihat percobaan bahkan membaca lebih dari {1.200|seribu dua ratus} tabel data game.",
        "Lalu otak itu diberi tangan. Di {PUBG,|Pab Ji,} rekan bernama {Ally|Aelai} bisa diajak bicara, ikut bertarung, dan ikut mencari barang. Semuanya berjalan di komputer pemain.",
        f"Tapi otak ini bisa dibohongi, dan bisa salah. Pemain mengeluhkan petunjuk teka-teki yang keliru. Developer juga harus memangkas jeda jawaban, dan mencegah {NPC} terjebak dalam putaran tanpa akhir.",
        f"Sekarang {RB} melatih model {NPC} dari data permainan manusia, supaya geraknya makin mirip pemain sungguhan. Kalau suatu hari {NPC} bisa mengingatmu, kamu mau berteman, atau menipunya?",
    ],
    "EP04_AI_DEVELOPER": [
        "Game ini lolos semua tes, sembilan dari sembilan. Tapi nilai desainnya cuma {31.|tiga puluh satu.}",
        f"Namanya {{Skyforge Ascent,|Skaifoj Asen,}} contoh resmi dari {RB} {{Build.|Bild.}} Dari satu perintah, agen {AI} bekerja seperti tim kecil.",
        "Pertama, rencana. Dia menulis spesifikasi: lima bagian lintasan, titik simpan, tiga jenis rintangan, alur permainan, dan kontrol. Skornya {91.|sembilan puluh satu.}",
        "Kedua, bangun. Kode dan aset dibuat. Penilai teknik memberi {98.|sembilan puluh delapan.} Satu-satunya temuan: dua fungsi yang tidak terpakai.",
        "Ketiga, tes. Agen lain memainkan gamenya dengan input seperti pemain sungguhan. Melompat, kena rintangan, jatuh, bangkit lagi. Nol error, skor tes seratus. Tampilannya dapat {86.|delapan puluh enam.}",
        f"Alur rencana, bangun, dan tes ini juga dipakai kreator profesional. April lalu, {{44|empat puluh empat}} persen dari seribu kreator teratas sudah memakai {{AI.|Ei Ai.}} Pengguna harian server {{MCP,|Em Si Pi,}} jalur untuk alat {AI} luar, kini naik hampir lima kali lipat. Waktu pakai alat {AI} di kalangan kreator top juga naik tiga kali lipat.",
        "Lalu kenapa desainnya cuma {31?|tiga puluh satu?} Karena nilai progres, main ulang, pilihan pemain, dan daya tarik uniknya nol. Semuanya berjalan, tapi tidak ada alasan untuk main dua kali.",
        f"Jadi {AI} sudah bisa menulis dan menguji game. Yang belum tentu: membuatnya seru. Kalau begitu, apa tugas developer ke depan?",
    ],
    "EP05_TOP_20": [
        f"Dua game yang hampir seluruhnya dibuat {AI} masuk dua puluh besar {{Roblox.|Roblocks.}}",
        f"Namanya {{Break and Steal an Egg,|Breik en Stil en Eg,}} dan {{Huss Valley.|Has Veli.}} Klaim ini datang dari surat resmi {RB} kepada pemegang saham, kuartal ketiga {{2026.|dua ribu dua puluh enam.}}",
        "Skalanya besar. Laporan {GosuGamers|Gosu Gemers} mencatat {289|dua ratus delapan puluh sembilan} juta kunjungan untuk game pertama, dan {217|dua ratus tujuh belas} juta untuk yang kedua.",
        f"Bukan cuma dua itu. Lebih dari {{80|delapan puluh}} persen dari seratus game teratas memakai alat {{AI.|Ei Ai.}} Dan {BD} sudah dipakai lebih dari {{500.000|lima ratus ribu}} orang, yang menerbitkan lebih dari {{70.000|tujuh puluh ribu}} game.",
        f"Tapi baca dengan hati-hati. Dua puluh besar dihitung dari pemain bersamaan. Seratus besar dihitung dari jam main. Dan memakai {AI} tidak berarti seluruhnya dibuat {{AI.|Ei Ai.}}",
        f"Surat itu juga tidak merinci bagian mana yang dikerjakan manusia, dan tidak menyebut kedua game itu dibuat dengan {{Build.|Bild.}} Sumber angkanya data internal perusahaan.",
        "Bisnisnya pun sedang diuji. Pendapatan naik {16|enam belas} persen jadi {1,6|satu koma enam} miliar dolar. Tapi pemesanan turun {12|dua belas} persen, dan saham jatuh sekitar {19|sembilan belas} persen setelah bursa tutup.",
        f"Dari satu kalimat di HP, sampai dua puluh besar. {AI} bisa membawa game ke sana, tapi yang menentukan tetap pemain. Kalau tahu gamenya buatan {AI}, kamu masih mau main?",
    ],
}

TOK = re.compile(r"\{([^|}]*)\|([^}]*)\}|(\S+)")
for name, lines in S.items():
    d = Path(name)
    # Punctuation written after a token moves inside it, or it becomes its own caption word.
    lines = [re.sub(r"\{([^|}]*)\|([^}]*)\}([,.:;?!]+)", r"{\1\3|\2\3}", t) for t in lines]
    out = [{"id": f"s{i + 1}", "text": t} for i, t in enumerate(lines)]
    (d / "script-lines.json").write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf8")
    spoken = sum(len(b.split()) if b else 1 for t in lines for _, b, _c in TOK.findall(t))
    print(name, "lines", len(lines), "spoken", spoken)
