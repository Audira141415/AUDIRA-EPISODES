"""Batch 5 (EP21-EP25): writes script-lines.json. Same markup and rules as write-scripts.py; claims are listed in _research/FACTS5.md.
Run from AUDIRA_KISAH_ISLAM_2026: python _tools/write-scripts2.py, then python _tools/estimate.py EP21_... (pass folders explicitly; never run estimate.py without arguments, EP01-05 have real voice timelines)."""
import json, re
from pathlib import Path

S = {
    "EP21_ZAKARIA_DOA_USIA_TUA": [
        "Tulangnya sudah lemah, rambutnya penuh uban, istrinya mandul. Secara logika, harapannya sudah habis. Tapi ia masih berdoa meminta seorang anak.",
        "Surah Maryam dibuka dengan kisah Nabi Zakaria. Ia berdoa kepada Tuhannya dengan suara yang lembut, hampir berbisik, di dalam mihrab. Ia khawatir tidak ada yang meneruskan dakwahnya sepeninggalnya.",
        "Ya Tuhanku, tulangku telah melemah, kepalaku dipenuhi uban, dan aku belum pernah kecewa dalam berdoa kepada-Mu.",
        "Kalimat terakhir itu kuncinya. Ia tidak berdoa karena yakin pada keadaannya, tapi karena yakin pada pengalamannya bersama Tuhan, yang tidak pernah mengecewakannya.",
        "Jawabannya datang: Kami memberi kabar gembira kepadamu dengan seorang anak bernama Yahya, nama yang belum pernah diberikan kepada siapa pun sebelumnya.",
        "Zakaria bertanya, bagaimana mungkin, aku sudah sangat tua dan istriku mandul? Jawabnya: hal itu mudah bagi-Ku. Engkau pun dulu Aku ciptakan, padahal engkau belum ada sama sekali.",
        "Ia meminta tanda. Tandanya: tiga malam ia tidak bisa berbicara dengan manusia, padahal ia sehat. Ia keluar dari mihrab, lalu memberi isyarat kepada kaumnya: bertasbihlah pagi dan petang.",
        "Yahya kelak tumbuh berbakti kepada orang tuanya, tidak sombong, dan diberi hikmah sejak kecil. Tidak ada kata terlambat untuk berdoa. Doa apa yang sudah lama kamu simpan? Kisah dalam Al-Qur'an, bersama {AUDIRA.|Audira.}",
    ],
    "EP22_ASHABUS_SABT_IKAN_SABTU": [
        "Setiap hari Sabat, ikan-ikan berdatangan ke permukaan. Di hari lain, tak satu pun muncul. Ujian itu ternyata soal menahan diri, tepat ketika godaan paling dekat.",
        "Surah Al-A'raf ayat seratus enam puluh tiga menceritakan sebuah negeri di dekat laut. Penduduknya dilarang menangkap ikan pada hari Sabat, hari yang dikhususkan untuk ibadah.",
        "Justru pada hari itu, ikan-ikan datang terapung di permukaan. Pada hari lain, ikan-ikan itu menghilang. Ayatnya menyebut: demikianlah Kami menguji mereka.",
        "Penduduk itu terbelah menjadi tiga. Sebagian mencari celah dan melanggar. Sebagian lain menasihati. Dan ada kelompok ketiga yang bertanya: untuk apa menasihati kaum yang akan dibinasakan?",
        "Jawaban para penasihat patut diingat: agar kami punya alasan di hadapan Tuhanmu, dan siapa tahu mereka bertakwa.",
        "Ketika peringatan itu dilupakan, orang-orang yang melarang kejahatan diselamatkan. Yang zalim ditimpa siksaan yang keras, dan dijadikan kera yang hina.",
        "Surah Al-Baqarah ayat enam puluh enam menutupnya: peristiwa itu dijadikan peringatan bagi orang-orang saat itu dan sesudahnya, serta pelajaran bagi orang yang bertakwa.",
        "Ujian sering datang tepat di saat kita dilarang. Dan menasihati tetap berharga, walau hasilnya belum terlihat. Kamu ada di kelompok yang mana? Kisah dalam Al-Qur'an, bersama {AUDIRA.|Audira.}",
    ],
    "EP23_LUQMAN_NASIHAT_ANAK": [
        "Seorang ayah menasihati anaknya. Nasihatnya begitu berharga sampai diabadikan dalam Al-Qur'an, dan surahnya dinamai dengan namanya. Ia bukan raja, bukan panglima, hanya seorang ayah yang bijak.",
        "Surah Luqman ayat dua belas: Allah memberi Luqman hikmah. Dan hikmah pertamanya sederhana: bersyukurlah kepada Allah.",
        "Nasihat pertamanya kepada anaknya adalah fondasi segalanya. Wahai anakku, jangan mempersekutukan Allah. Sesungguhnya mempersekutukan Allah adalah kezaliman yang besar.",
        "Di tengah nasihat itu, Allah menyelipkan pesan tentang orang tua: ibu mengandung dalam keadaan lemah yang bertambah-tambah, lalu menyapih dalam dua tahun. Bersyukurlah kepada-Ku dan kepada kedua orang tuamu.",
        "Lalu Luqman mengajarkan bahwa tidak ada yang luput. Wahai anakku, perbuatan seberat biji sawi pun, walau tersembunyi di dalam batu, di langit, atau di bumi, Allah akan mendatangkannya.",
        "Dirikan salat, ajak kepada kebaikan, cegah kemungkaran, dan bersabarlah atas apa yang menimpamu. Semua itu termasuk perkara yang penting.",
        "Jangan memalingkan wajah dari manusia karena sombong, jangan berjalan di bumi dengan angkuh. Sederhanakan langkahmu, dan lunakkan suaramu. Seburuk-buruk suara, katanya, adalah suara keledai.",
        "Dari tauhid sampai cara berjalan dan berbicara. Nasihat mana yang paling ingin kamu wariskan? Kisah dalam Al-Qur'an, bersama {AUDIRA.|Audira.}",
    ],
    "EP24_SERATUS_TAHUN_KELEDAI": [
        "Ia tertidur, lalu bangun dan mengira baru sehari. Padahal seratus tahun telah berlalu, makanannya masih segar, dan keledainya tinggal tulang.",
        "Surah Al-Baqarah ayat dua ratus lima puluh sembilan. Seorang laki-laki melewati sebuah negeri yang runtuh, atap-atapnya sudah rata dengan puing, dan tak ada satu penghuni pun.",
        "Ia berhenti dan bergumam, bukan karena ragu, tapi ingin melihat: bagaimana Allah menghidupkan kembali negeri ini setelah hancur? Lalu Allah mematikannya selama seratus tahun, kemudian membangkitkannya kembali.",
        "Ditanyakan kepadanya: berapa lama engkau tinggal di sini? Ia menjawab: sehari, atau setengah hari. Tidak, engkau telah tinggal seratus tahun.",
        "Lihatlah makanan dan minumanmu, belum berubah sedikit pun. Tapi lihatlah keledaimu, sudah menjadi tulang belulang.",
        "Lalu di depan matanya, tulang-tulang keledai itu disusun kembali, kemudian dibalut dengan daging. Agar ia menjadi tanda kekuasaan Allah bagi manusia.",
        "Ketika semuanya nyata, ia berkata: aku yakin, Allah Mahakuasa atas segala sesuatu. Al-Qur'an tidak menyebut namanya. Menurut riwayat Ibnu Abbas yang dikutip Ibnu Katsir, ia adalah Uzair.",
        "Pertanyaan yang jujur bisa dijawab dengan cara yang tak terduga. Pertanyaan apa yang sedang kamu bawa? Kisah dalam Al-Qur'an, bersama {AUDIRA.|Audira.}",
    ],
    "EP25_BENDUNGAN_SABA_BANJIR": [
        "Kerajaan ini punya dua kebun di kanan dan kiri lembahnya. Lalu satu banjir besar mengubah semuanya, karena satu hal: mereka berhenti bersyukur.",
        "Surah Saba ayat lima belas: bagi kaum Saba ada tanda di tempat tinggal mereka. Dua kebun, di kanan dan di kiri. Makanlah dari rezeki Tuhanmu, dan bersyukurlah.",
        "Negeri yang baik, dan Tuhan Yang Maha Pengampun. Mereka juga punya jalur perjalanan yang aman, dengan kampung-kampung yang berdekatan sampai ke negeri yang diberkahi.",
        "Tapi mereka berpaling. Bahkan mereka berdoa: ya Tuhan kami, jauhkanlah jarak perjalanan kami. Mereka bosan dengan kemudahan, dan menzalimi diri mereka sendiri.",
        "Maka datanglah banjir besar, sail al-arim. Kebun mereka diganti dengan pohon berbuah pahit, pohon atsl, dan sedikit pohon sidr.",
        "Di Ma'rib, Yaman, reruntuhan bendungan kuno itu masih ada. Bendungan pertamanya dibangun sekitar abad kedelapan sebelum Masehi, dan sejak {2023|dua ribu dua puluh tiga} menjadi Warisan Dunia UNESCO.",
        "Sejarawan berbeda pendapat, jebolan yang mana yang dimaksud ayat ini. Tapi pesan ayatnya jelas: semua itu tanda, bagi setiap orang yang sabar dan bersyukur.",
        "Nikmat yang terlalu biasa sering lupa disyukuri. Nikmat apa yang hari ini kamu anggap biasa? Kisah dalam Al-Qur'an, bersama {AUDIRA.|Audira.}",
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
