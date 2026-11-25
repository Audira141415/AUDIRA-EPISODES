"""Writes each episode's script-lines.json. Markup {display|spoken}: display goes on screen and in subtitles, spoken goes to Cartesia.
Every claim here is listed in _research/FACTS.md with its verse or source. Run from AUDIRA_KISAH_ISLAM_2026: python _tools/write-scripts.py"""
import json, re
from pathlib import Path

S = {
    "EP01_ASHABUL_KAHFI_309_TAHUN": [
        "Sekelompok pemuda tertidur di sebuah gua. Saat bangun, mereka mengira baru sehari. Padahal, {309|tiga ratus sembilan} tahun sudah lewat.",
        "Kisah ini ada di surah Al-Kahfi, ayat sembilan sampai dua puluh enam. Para pemuda itu hidup di tengah kaum yang menyembah selain Allah. Mereka memilih tetap beriman, walau taruhannya nyawa.",
        "Mereka berlindung ke dalam gua dan berdoa: Ya Tuhan kami, berikan rahmat dari sisi-Mu, dan sempurnakan petunjuk bagi urusan kami. Lalu Allah menidurkan mereka.",
        "Matahari terbit condong ke kanan gua, dan saat terbenam menjauh ke kiri. Tubuh mereka dibolak-balik ke kanan dan ke kiri. Anjing mereka berjaga, membentangkan kedua kaki depannya di ambang pintu.",
        "Lalu mereka dibangunkan. Salah seorang bertanya, sudah berapa lama kita di sini? Sehari, atau setengah hari, jawab yang lain. Satu orang diutus ke kota membawa uang perak untuk membeli makanan, dengan pesan: jangan sampai ketahuan.",
        "Ayat dua puluh lima menyebut angkanya: tiga ratus tahun, ditambah sembilan. Ibnu Katsir menjelaskan, tiga ratus tahun matahari setara dengan tiga ratus sembilan tahun bulan.",
        "Lalu berapa jumlah mereka? Orang menebak tiga, lima, atau tujuh. Al-Qur'an menjawab: Tuhanku lebih mengetahui. Di tengah kisah ini pula ada pesan: jangan berkata akan melakukan sesuatu besok, kecuali dengan insya Allah.",
        "Pemuda yang memilih iman dijaga melewati tiga abad. Keteguhan kecil di masa sulit bisa bertahan melampaui zaman. Menurut kamu, apa gua tempatmu berlindung hari ini?",
    ],
    "EP02_YUNUS_TIGA_KEGELAPAN": [
        "Gelap malam. Gelap lautan. Gelap perut ikan. Dari dalam tiga kegelapan itu, satu doa pendek didengar.",
        "Nabi Yunus diutus kepada kaumnya. Dalam riwayat, kaum itu tinggal di Niniwe, kini wilayah Irak. Seruannya ditolak. Al-Qur'an menyebut, ia lalu pergi dalam keadaan marah.",
        "Ia naik ke kapal yang penuh muatan. Di tengah laut, penumpang diundi. Undian jatuh pada Yunus, dan ia pun keluar dari kapal. Seekor ikan besar menelannya.",
        "Ibnu Mas'ud menafsirkan kegelapan dalam ayat itu: gelap perut ikan, gelap laut, dan gelap malam. Di sanalah Yunus berdoa: {Lā ilāha illā anta, subḥānaka, innī kuntu minaẓ-ẓālimīn.|la ilaha illa anta, subhanaka, inni kuntu minaz zalimin.}",
        "Artinya: tidak ada tuhan selain Engkau, Mahasuci Engkau, sungguh aku termasuk orang-orang yang zalim. Ia tidak menyalahkan kaumnya, tidak juga lautnya. Ia mengakui kesalahannya sendiri.",
        "Surah Ash-Shaffat menyebut, seandainya ia bukan orang yang banyak bertasbih, ia akan tetap di perut ikan sampai hari kebangkitan. Doanya dikabulkan. Ia dilemparkan ke daratan tandus dalam keadaan sakit, lalu tumbuh pohon dari jenis labu untuk menaunginya.",
        "Ia diutus lagi kepada seratus ribu orang atau lebih. Kali ini mereka beriman. Surah Yunus menyebut kaumnya sebagai pengecualian: iman mereka bermanfaat, dan azab diangkat dari mereka.",
        "Rasulullah bersabda, doa Yunus ini, tidaklah dibaca seorang muslim untuk urusan apa pun, kecuali Allah mengabulkannya. Kapan terakhir kali kamu berani mengakui salah, tanpa mencari kambing hitam?",
    ],
    "EP03_PASUKAN_GAJAH_ABRAHAH": [
        "Pasukan bergajah berbaris menuju Makkah. Targetnya satu: meruntuhkan Ka'bah. Yang menghentikannya, kawanan burung.",
        "Abrahah adalah penguasa Yaman, berasal dari Habasyah, Ethiopia. Prasasti batu di Yaman mencatat namanya. Menurut Ibnu Ishaq, ia membangun gereja megah di Sana'a, dan ingin orang Arab berziarah ke sana, bukan ke Ka'bah.",
        "Ia pun berangkat dengan pasukan besar dan gajah perang. Riwayat sirah menyebut gajah terdepannya bernama Mahmud. Kabilah-kabilah yang mencoba menghadang dikalahkan di perjalanan.",
        "Di pinggiran Makkah, pasukan itu merampas ternak, termasuk dua ratus unta milik Abdul Muthalib, kakek Nabi Muhammad. Ia datang menemui Abrahah. Bukan untuk membela Ka'bah, tapi meminta untanya kembali.",
        "Abrahah heran. Abdul Muthalib menjawab: aku pemilik unta. Ka'bah punya pemiliknya sendiri yang akan menjaganya. Lalu ia meminta warga Makkah mengungsi ke bukit-bukit.",
        "Menurut riwayat, gajah terdepan berhenti dan menolak masuk Makkah. Lalu datang burung yang berbondong-bondong, melempari mereka dengan batu dari tanah liat yang dibakar. Surah Al-Fil menutupnya: mereka dijadikan seperti daun yang dimakan ulat.",
        "Peristiwa ini begitu besar sehingga tahunnya disebut Tahun Gajah, sekitar {570|lima ratus tujuh puluh} Masehi. Menurut sumber-sumber Islam, di tahun itulah Nabi Muhammad lahir. Sebagian peneliti menduga peristiwanya terjadi beberapa tahun lebih awal.",
        "Penguasa terkuat di jazirah saat itu kalah oleh makhluk yang dianggap kecil. Menurut kamu, dari mana ketenangan Abdul Muthalib datang?",
    ],
    "EP04_MUSA_MEMBELAH_LAUT": [
        "Di depan, laut. Di belakang, pasukan Firaun. Pengikut Musa berteriak: kita pasti tersusul. Musa menjawab: sekali-kali tidak.",
        "Bani Israil hidup tertindas di Mesir. Allah mewahyukan kepada Musa: pergilah malam hari bersama hamba-hamba-Ku, karena kalian pasti dikejar. Itu surah Asy-Syu'ara ayat lima puluh dua.",
        "Firaun mengirim orang ke kota-kota untuk mengumpulkan pasukan. Katanya, mereka cuma sekelompok kecil. Saat matahari terbit, pasukan itu berhasil menyusul.",
        "Kedua golongan saling melihat. Pengikut Musa panik: kita benar-benar akan tersusul. Musa menjawab dengan tenang: sesungguhnya Tuhanku bersamaku, Dia akan memberi petunjuk kepadaku.",
        "Lalu wahyu turun: pukullah laut itu dengan tongkatmu. Laut terbelah. Setiap belahan, kata Al-Qur'an, seperti gunung yang besar. Surah Thaha menyebut jalan yang terbuka itu kering.",
        "Bani Israil menyeberang dan selamat. Firaun dan pasukannya menyusul masuk, lalu ombak menggulung mereka. Saat hampir tenggelam, Firaun berkata: aku percaya tidak ada tuhan selain Tuhan yang dipercayai Bani Israil.",
        "Tapi pengakuan itu terlambat. Allah berfirman: hari ini Kami selamatkan jasadmu, agar menjadi pelajaran bagi orang-orang sesudahmu. Menariknya, Al-Qur'an tidak pernah menyebut nama pribadi Firaun itu.",
        "Jalan keluar sering baru terlihat setelah langkah pertama diambil. Kalau kamu berdiri di tepi laut itu, kamu ikut panik, atau ikut yakin?",
    ],
    "EP05_BAHTERA_NUH_950_TAHUN": [
        "Seribu tahun kurang lima puluh. Selama itu Nabi Nuh tinggal bersama kaumnya dan menyeru mereka. Hasilnya, hanya sedikit yang beriman.",
        "Angka itu tertulis di surah Al-'Ankabut ayat empat belas. Nuh menyeru siang dan malam, terang-terangan dan diam-diam. Tapi kaumnya menyumbat telinga dengan jari, dan menutupi wajah dengan baju.",
        "Para pemuka kaumnya mengejek: kamu cuma manusia biasa, dan pengikutmu orang-orang rendahan. Nuh menjawab: aku tidak meminta harta darimu. Upahku hanya dari Allah.",
        "Lalu Allah memerintahkan: buatlah kapal, di bawah pengawasan Kami. Nuh mulai membangun. Setiap kali pemuka kaumnya lewat, mereka mengejeknya. Surah Al-Qamar menyebut, kapal itu terbuat dari papan dan pasak.",
        "Ketika perintah Allah datang, pintu-pintu langit terbuka dengan air yang tercurah, dan bumi menyemburkan mata air. Nuh memuat sepasang dari setiap jenis hewan, dan orang-orang beriman. Naiklah, dengan nama Allah, saat berlayar dan berlabuh.",
        "Kapal itu berlayar di tengah gelombang setinggi gunung. Nuh memanggil anaknya: naiklah bersama kami. Anaknya menjawab: aku akan berlindung ke gunung. Gelombang pun memisahkan mereka.",
        "Lalu difirmankan: wahai bumi, telanlah airmu, wahai langit, berhentilah. Air surut, dan kapal berlabuh di atas bukit Judi. Kapal itu dijadikan tanda. Adakah yang mau mengambil pelajaran?",
        "Hampir seribu tahun menyeru, Nuh tidak berhenti walau ditertawakan. Menurut kamu, berapa lama kamu sanggup bertahan pada hal yang benar?",
    ],
}

TOK = re.compile(r"\{([^|}]*)\|([^}]*)\}")
for ep, lines in S.items():
    d = Path(ep)
    (d / "SUBTITLES").mkdir(parents=True, exist_ok=True)
    (d / "PROJECT/HyperFrames_Remotion/compositions").mkdir(parents=True, exist_ok=True)
    # Punctuation written after a token moves inside it, so it never becomes a word of its own.
    # Words with an apostrophe (Al-Qur'an, Ka'bah) are spoken without it so Cartesia does not pause inside them.
    lines = [re.sub(r"(?<![{|\w'])([\w-]+'[\w-]+[.,:;?!]?)", lambda m: "{%s|%s}" % (m.group(1), m.group(1).replace("'", "")), t) for t in lines]
    lines = [re.sub(r"\{([^|}]*)\|([^}]*)\}([.,:;?!])", r"{\1\3|\2\3}", t) for t in lines]
    out = [{"id": f"s{i+1}", "text": t} for i, t in enumerate(lines)]
    (d / "script-lines.json").write_text("[\n" + ",\n".join(json.dumps(x, ensure_ascii=False) for x in out) + "\n]\n", encoding="utf8")
    n = sum(len(TOK.sub(lambda m: m.group(2), t).split()) for t in lines)
    print(ep, "spoken words", n, "at 145 WPM =", round(n / 145 * 60, 1), "s")
