"""Batch 6 (EP26-EP30): writes script-lines.json. Same markup and rules as write-scripts.py; claims are listed in _research/FACTS6.md.
Run from AUDIRA_KISAH_ISLAM_2026: python _tools/write-scripts2.py, then python _tools/estimate.py EP26_... (pass folders explicitly; never run estimate.py without arguments, EP01-05 have real voice timelines)."""
import json, re
from pathlib import Path

S = {
    "EP26_IBRAHIM_DEBAT_RAJA": [
        "Seorang raja mengaku bisa menghidupkan dan mematikan. Satu kalimat Nabi Ibrahim membuatnya terdiam, tanpa bisa menjawab apa pun.",
        "Surah Al-Baqarah ayat dua ratus lima puluh delapan. Al-Qur'an menyebutnya orang yang mendebat Ibrahim tentang Tuhannya, karena Allah telah memberinya kerajaan. Para mufasir menyebut namanya Namrud.",
        "Ibrahim berkata: Tuhanku adalah Yang menghidupkan dan mematikan. Raja itu, yang terbiasa dituruti semua orang, menjawab dengan sombong: aku pun bisa menghidupkan dan mematikan.",
        "Sebagian mufasir menjelaskan maksudnya: ia memanggil dua orang yang dihukum mati. Satu dieksekusi, satu dibebaskan. Itulah yang ia sebut menghidupkan dan mematikan. Ia memainkan kata, bukan menjawab pertanyaan.",
        "Ibrahim tidak memperpanjang debat soal istilah. Ia pindah ke bukti yang tidak bisa dipalsukan: Allah menerbitkan matahari dari timur. Maka terbitkanlah ia dari barat.",
        "Maka bingunglah orang yang kafir itu. Kekuasaannya atas manusia tidak berlaku untuk matahari. Ia tidak bisa menggesernya sedikit pun.",
        "Ayat itu ditutup dengan tegas: Allah tidak memberi petunjuk kepada orang-orang yang zalim. Bukan karena kalah pintar, tapi karena menolak kebenaran yang sudah jelas.",
        "Kadang argumen terbaik bukan yang paling panjang, tapi yang paling jelas. Menurut kamu, kapan sebaiknya kita berhenti berdebat? Kisah dalam Al-Qur'an, bersama {AUDIRA.|Audira.}",
    ],
    "EP27_HAJAR_ZAMZAM_TUJUH_KALI": [
        "Seorang ibu berlari tujuh kali di antara dua bukit. Jutaan orang mengulang langkahnya setiap tahun, sampai hari ini.",
        "Hadis riwayat Bukhari dari Ibnu Abbas: Nabi Ibrahim membawa Hajar dan bayinya, Ismail, ke lembah dekat Ka'bah. Saat itu tidak ada seorang pun di Makkah, dan tidak ada air.",
        "Ia meninggalkan sekantong kurma dan sedikit air, lalu berjalan pergi. Hajar bertanya: apakah Allah yang memerintahkanmu? Ibrahim menjawab: ya. Hajar berkata: kalau begitu, Dia tidak akan menyia-nyiakan kami.",
        "Dari kejauhan, Ibrahim berdoa: ya Tuhan kami, aku tempatkan keturunanku di lembah yang tak bertanaman, di dekat rumah-Mu yang suci. Itu surah Ibrahim ayat tiga puluh tujuh.",
        "Air habis. Bayinya kehausan. Hajar naik ke bukit Shafa, mencari siapa pun. Tidak ada. Ia berlari menuruni lembah ke bukit Marwah. Tidak ada. Ia mengulanginya tujuh kali.",
        "Di kali terakhir, ia mendengar suara. Air memancar dari tanah. Ia membendungnya dengan kedua tangan, lalu mengisi kantong airnya. Itulah Zamzam.",
        "Rasulullah bersabda dalam hadis yang sama: itulah asal mula orang berjalan di antara Shafa dan Marwah. Dan Al-Qur'an menyebut keduanya termasuk syiar Allah.",
        "Tawakal bukan diam menunggu. Hajar yakin, lalu tetap berlari. Menurut kamu, di bagian mana kita sering lupa berusaha? Kisah dalam Al-Qur'an, bersama {AUDIRA.|Audira.}",
    ],
    "EP28_MUSA_PARA_PENYIHIR": [
        "Para penyihir terbaik Mesir datang untuk mengalahkan Musa. Di akhir hari itu, mereka semua justru bersujud.",
        "Firaun menuduh Musa membawa sihir untuk mengusir mereka dari negeri. Ia menantang: kami akan datangkan sihir yang sama. Waktunya disepakati: hari raya, pagi hari, di depan orang banyak.",
        "Para penyihir datang berbaris, yakin akan menang, bahkan sudah membicarakan hadiah dari Firaun. Mereka bertanya: wahai Musa, kamu yang melempar dulu, atau kami? Musa menjawab: silakan kalian dulu.",
        "Tali dan tongkat mereka tampak merayap cepat. Surah Thaha mencatatnya dengan jujur: Musa merasa takut dalam hatinya. Seorang nabi pun bisa merasa takut.",
        "Lalu wahyu turun: jangan takut, sungguh kamulah yang unggul. Lemparkan apa yang ada di tangan kananmu. Tongkat itu pun menelan semua yang mereka buat.",
        "Para penyihir paham, ini bukan sihir. Hanya beberapa saat sebelumnya mereka adalah lawan. Kini mereka langsung merunduk bersujud dan berkata: kami beriman kepada Tuhannya Harun dan Musa.",
        "Firaun murka dan mengancam akan menghukum mereka dengan kejam. Jawab mereka: putuskanlah apa yang hendak kau putuskan. Kau hanya berkuasa di kehidupan dunia ini.",
        "Orang yang paling paham sebuah tipuan, paling cepat mengenali kebenaran. Menurut kamu, apa yang membuat mereka seberani itu? Kisah dalam Al-Qur'an, bersama {AUDIRA.|Audira.}",
    ],
    "EP29_MARYAM_POHON_KURMA": [
        "Sendirian, menahan sakit, bersandar pada sebatang pohon kurma. Lalu ia diminta melakukan hal yang terdengar mustahil: goyangkan pohon itu.",
        "Surah Maryam ayat enam belas. Maryam mengasingkan diri dari keluarganya ke suatu tempat di sebelah timur. Di sana ia diberi kabar akan mengandung seorang anak laki-laki yang suci.",
        "Ia bertanya: bagaimana mungkin, tak pernah ada laki-laki yang menyentuhku? Jawabnya: hal itu mudah bagi-Ku, dan ia akan menjadi tanda bagi manusia serta rahmat.",
        "Ia mengandung, lalu menjauh ke tempat yang terpencil. Saat rasa sakit melahirkan datang, ia bersandar di pangkal pohon kurma dan berkata: alangkah baiknya aku mati sebelum ini.",
        "Lalu ia diseru dari tempat yang rendah: janganlah engkau bersedih hati. Tuhanmu telah menjadikan anak sungai di bawahmu.",
        "Dan goyanglah pangkal pohon kurma itu ke arahmu, niscaya ia menggugurkan kurma yang masak. Maka makan, minum, dan bersenanghatilah engkau.",
        "Banyak ulama mengambil pelajaran dari sini: pohon kurma tak akan bergoyang oleh tenaga seorang perempuan yang lemah. Tapi ia tetap diminta bergerak, dan pertolongan datang setelahnya.",
        "Pertolongan datang, tapi kita tetap diminta melangkah. Usaha kecil apa yang sedang kamu tunda? Kisah dalam Al-Qur'an, bersama {AUDIRA.|Audira.}",
    ],
    "EP30_DAUD_BESI_LUNAK": [
        "Gunung-gunung bertasbih bersamanya, dan besi menjadi lunak di tangannya. Tapi Nabi Daud tetap memilih makan dari hasil kerja tangannya sendiri.",
        "Surah Saba ayat sepuluh: Kami berikan kepada Dawud karunia dari Kami. Wahai gunung-gunung dan burung-burung, bertasbihlah berulang-ulang bersama Dawud.",
        "Surah Shad menyebut, gunung-gunung bertasbih bersamanya pagi dan petang, dan burung-burung datang berkumpul. Masing-masing sangat taat kepada Allah. Alam pun ikut memuji bersamanya.",
        "Dan Kami lunakkan besi untuknya. Perintahnya jelas: buatlah baju besi yang besar-besar, dan ukurlah anyamannya dengan tepat. Besi yang biasanya dipanaskan dan dipukul keras, menjadi lunak di tangannya.",
        "Surah Al-Anbiya menambahkan: Kami ajarkan Dawud cara membuat baju besi, untuk melindungi kalian dalam peperangan. Lalu ayat itu bertanya: apakah kalian bersyukur?",
        "Rasulullah bersabda dalam hadis riwayat Bukhari: tidak ada makanan yang lebih baik daripada hasil kerja tangan sendiri, dan Nabi Daud makan dari hasil kerja tangannya.",
        "Seorang raja dengan kerajaan yang kuat dan penuh hikmah, tetap menempa besinya sendiri. Ayatnya ditutup: kerjakanlah kebajikan, Aku Maha Melihat apa yang kalian kerjakan.",
        "Karunia besar tidak menghapus kerja keras. Kerja tangan sendiri adalah kemuliaan. Hasil tangan sendiri apa yang paling kamu banggakan? Kisah dalam Al-Qur'an, bersama {AUDIRA.|Audira.}",
    ],
}

TOK = re.compile(r"\{([^|}]*)\|([^}]*)\}")
for ep, lines in S.items():
    d = Path(ep)
    (d / "SUBTITLES").mkdir(parents=True, exist_ok=True)
    (d / "PROJECT/HyperFrames_Remotion/compositions").mkdir(parents=True, exist_ok=True)
    # Words with an apostrophe (Al-Qur'an, Ya'juj) are spoken without it so Cartesia does not pause inside them.
    lines = [re.sub(r"(?<![{|\w'])([\w-]+'[\w-]+[.,:;?!]?)", lambda m: "{%s|%s}" % (m.group(1), m.group(1).replace("'", "")), t) for t in lines]
    lines = [re.sub(r"\{([^|}]*)\|([^}]*)\}([.,:;?!])", r"{\1\3|\2\3}", t) for t in lines]
    out = [{"id": f"s{i+1}", "text": t} for i, t in enumerate(lines)]
    (d / "script-lines.json").write_text("[\n" + ",\n".join(json.dumps(x, ensure_ascii=False) for x in out) + "\n]\n", encoding="utf8")
    n = sum(len(TOK.sub(lambda m: m.group(2), t).split()) for t in lines)
    print(ep, "spoken words", n, "at 145 WPM =", round(n / 145 * 60, 1), "s")
