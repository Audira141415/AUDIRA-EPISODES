"""Batch 7 (EP31-EP35): writes script-lines.json. Same markup and rules as write-scripts.py; claims are listed in _research/FACTS7.md.
Run from AUDIRA_KISAH_ISLAM_2026: python _tools/write-scripts7.py, then python _tools/estimate.py EP31_... (pass folders explicitly; never run estimate.py without arguments)."""
import json, re
from pathlib import Path

S = {
    "EP31_IBRAHIM_EMPAT_BURUNG": [
        "Seorang nabi yang sudah yakin masih memohon satu hal: perlihatkan kepadaku bagaimana Engkau menghidupkan yang mati.",
        "Surah Al-Baqarah ayat dua ratus enam puluh. Nabi Ibrahim berdoa: ya Tuhanku, perlihatkanlah kepadaku bagaimana Engkau menghidupkan orang mati. Sebagian ulama menyebut, doa ini datang setelah debatnya dengan sang raja tentang menghidupkan dan mematikan.",
        "Allah bertanya: belum percayakah engkau? Ibrahim menjawab: aku percaya, tetapi agar hatiku tenang. Ia tidak ragu. Ia ingin keyakinannya menjadi sesuatu yang dilihat mata.",
        "Perintahnya: ambillah empat ekor burung, lalu cincanglah. Letakkan satu bagian di atas masing-masing bukit, berjauhan satu sama lain.",
        "Kemudian panggillah mereka, niscaya mereka datang kepadamu dengan segera. Ibrahim memanggil, dan dari empat bukit, burung-burung itu datang kembali, hidup seperti semula.",
        "Ayat itu ditutup: ketahuilah, Allah Mahaperkasa, Mahabijaksana. Ibrahim melihatnya dengan mata kepala sendiri. Yang mengumpulkan kembali burung dari empat penjuru, mudah bagi-Nya membangkitkan manusia.",
        "Rasulullah bersabda dalam hadis riwayat Bukhari: kita lebih pantas ragu daripada Ibrahim. Para ulama menjelaskan, Ibrahim tidak ragu sama sekali. Yang ia cari adalah ketenangan hati.",
        "Bertanya untuk menenangkan hati bukan tanda iman yang lemah. Pertanyaan apa yang ingin kamu temukan jawabannya? Kisah dalam Al-Qur'an, bersama {AUDIRA.|Audira.}",
    ],
    "EP32_BAYI_MUSA_PETI_NIL": [
        "Seorang ibu menaruh bayinya di dalam peti, lalu melepasnya ke sungai. Justru itulah cara bayinya diselamatkan.",
        "Tafsir Ibnu Katsir menceritakan: Firaun memerintahkan bayi laki-laki Bani Israil dibunuh. Para bidan mendata setiap perempuan yang hamil. Tapi kehamilan ibu Musa tidak tampak, dan Musa lahir tepat di tahun itu.",
        "Surah Al-Qashash ayat tujuh: Kami ilhamkan kepada ibu Musa, susuilah dia. Jika engkau khawatir, hanyutkanlah ia ke sungai. Jangan takut, jangan bersedih. Kami akan mengembalikannya kepadamu.",
        "Ia meletakkan bayinya di dalam peti dan melepasnya ke sungai Nil. Arus membawanya ke tepi, dan bayi itu dipungut oleh keluarga Firaun, rumah musuhnya sendiri.",
        "Istri Firaun berkata: ia penyejuk mata bagiku dan bagimu, jangan kalian bunuh dia. Sementara itu, hati ibu Musa menjadi kosong. Ia hampir membuka rahasianya, seandainya Allah tidak meneguhkan hatinya.",
        "Ia berkata kepada putrinya: ikutilah dia. Kakak Musa memperhatikan dari jauh. Bayi itu menolak menyusu kepada setiap perempuan yang didatangkan.",
        "Kakaknya berkata: maukah aku tunjukkan keluarga yang akan memeliharanya? Maka Kami kembalikan dia kepada ibunya, agar senang hatinya, dan agar ia tahu janji Allah itu benar.",
        "Kadang bagian tersulit dari percaya adalah melepaskan. Pernahkah kamu harus melepas sesuatu agar ia selamat? Kisah dalam Al-Qur'an, bersama {AUDIRA.|Audira.}",
    ],
    "EP33_RATU_SABA_LANTAI_KACA": [
        "Seorang ratu melangkah masuk istana, lalu menyingkap kainnya karena mengira lantainya air. Ternyata itu kaca.",
        "Surah An-Naml. Ratu negeri Saba menerima surat dari Nabi Sulaiman: dengan nama Allah Yang Maha Pengasih, Maha Penyayang. Janganlah kalian sombong, datanglah dengan berserah diri.",
        "Ia tidak tergesa. Ia bermusyawarah dengan para pembesarnya. Mereka berkata: kita kuat dan berani berperang. Ia menjawab: raja-raja, bila memasuki sebuah negeri, merusaknya. Maka ia memilih mengirim hadiah, lalu menunggu.",
        "Sulaiman menolak hadiah itu: apa yang Allah berikan kepadaku lebih baik. Lalu ia bertanya: siapa yang sanggup membawa singgasana ratu itu kemari?",
        "Seorang yang memiliki ilmu dari Kitab berkata: aku membawanya sebelum matamu berkedip. Singgasana itu pun ada di hadapannya. Sulaiman berkata: ini karunia Tuhanku, untuk mengujiku, apakah aku bersyukur.",
        "Singgasana itu diubah. Saat sang ratu datang, ia ditanya: serupa inikah singgasanamu? Jawabnya cerdas: seakan-akan itulah dia. Tidak terburu membenarkan, tidak terburu menyangkal.",
        "Lalu ia diminta masuk istana. Dikiranya kolam air, ternyata lantai yang dilapisi kaca. Ia berkata: aku berserah diri bersama Sulaiman kepada Allah, Tuhan seluruh alam.",
        "Ia tidak tunduk pada ancaman pasukan, tapi pada kebenaran yang ia lihat sendiri. Menurut kamu, apa yang membuatnya berubah? Kisah dalam Al-Qur'an, bersama {AUDIRA.|Audira.}",
    ],
    "EP34_LELAKI_UJUNG_KOTA": [
        "Ia bukan nabi, bukan pula utusan. Hanya seorang lelaki yang bergegas dari ujung kota. Al-Qur'an mengabadikan kata-katanya.",
        "Surah Yasin ayat tiga belas. Allah menjadikannya perumpamaan. Sebuah negeri didatangi dua orang utusan. Penduduknya mendustakan keduanya, lalu datang utusan ketiga. Mereka tetap menolak.",
        "Kata penduduk: kalian hanyalah manusia seperti kami. Kami malah sial karena kalian. Jika tidak berhenti, kami rajam kalian.",
        "Lalu datanglah dari ujung kota seorang laki-laki, bergegas. Ia berkata: wahai kaumku, ikutilah utusan-utusan itu. Ikutilah orang yang tidak meminta imbalan darimu.",
        "Ia berkata: mengapa aku tidak menyembah Dia yang telah menciptakanku? Mengapa aku menyembah tuhan lain, yang tak bisa menolongku sedikit pun? Sungguh, aku telah beriman kepada Tuhanmu, maka dengarkanlah aku.",
        "Menurut riwayat dalam Tafsir Ibnu Katsir, kaumnya membunuhnya saat itu juga. Qatadah meriwayatkan, saat disakiti ia masih berdoa: ya Allah, berilah petunjuk kepada kaumku, karena mereka tidak mengetahui. Al-Qur'an tidak merinci kematiannya. Ayat berikutnya langsung berkata: masuklah ke surga.",
        "Dan kalimat pertamanya di sana bukan tentang dirinya: alangkah baiknya sekiranya kaumku mengetahui, apa yang membuat Tuhanku mengampuniku.",
        "Bahkan setelah disakiti, yang ia pikirkan tetap kaumnya. Siapa yang paling ingin kamu ajak pada kebaikan? Kisah dalam Al-Qur'an, bersama {AUDIRA.|Audira.}",
    ],
    "EP35_DUA_BELAS_MATA_AIR": [
        "Satu batu, satu pukulan tongkat, dan dua belas mata air memancar. Satu untuk setiap suku.",
        "Surah Al-Baqarah ayat enam puluh. Bani Israil berada di padang yang tandus dan kehausan. Nabi Musa memohon air untuk kaumnya.",
        "Allah berfirman: pukullah batu itu dengan tongkatmu. Musa memukulkan tongkatnya, dan dari batu yang kering itu memancarlah dua belas mata air.",
        "Surah Al-A'raf ayat seratus enam puluh menjelaskan: mereka terbagi menjadi dua belas suku. Setiap suku telah mengetahui tempat minumnya masing-masing.",
        "Ibnu Abbas, dalam Tafsir Ibnu Katsir, menyebut batunya persegi, dan dari setiap sisinya memancar tiga mata air. Setiap suku punya sumbernya sendiri. Tidak ada yang perlu berebut.",
        "Mereka juga dinaungi awan, dan diberi mann dan salwa. Pesannya: makan dan minumlah dari rezeki Allah, dan jangan berbuat kerusakan di bumi.",
        "Tapi tak lama, mereka mengeluh: kami tidak tahan dengan satu macam makanan. Mintakan sayur, mentimun, bawang putih, kacang adas, dan bawang merah. Musa menjawab: apakah kalian meminta yang buruk sebagai ganti yang baik?",
        "Nikmat yang sudah dibagi adil mudah terlupa saat kita sibuk membandingkan. Nikmat apa yang hari ini lupa kamu syukuri? Kisah dalam Al-Qur'an, bersama {AUDIRA.|Audira.}",
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
