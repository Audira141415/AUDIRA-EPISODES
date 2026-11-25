"""Batch 2 (EP06-EP10): writes script-lines.json. Same markup and rules as write-scripts.py; claims are listed in _research/FACTS2.md.
Run from AUDIRA_KISAH_ISLAM_2026: python _tools/write-scripts2.py, then python _tools/estimate.py EP06_... (pass folders explicitly; never run estimate.py without arguments, EP01-05 have real voice timelines)."""
import json, re
from pathlib import Path

S = {
    "EP06_IBRAHIM_API_JADI_DINGIN": [
        "Api terbesar yang pernah dinyalakan kaumnya justru tidak membakar. Satu perintah turun: wahai api, jadilah dingin.",
        "Nabi Ibrahim tumbuh di tengah kaum penyembah patung, termasuk ayahnya sendiri. Ia bertanya: patung apa yang kalian sembah dengan tekun ini? Jawab mereka: kami mendapati nenek moyang kami menyembahnya.",
        "Surah Al-An'am mencatat cara Ibrahim mengajak berpikir. Bintang terbenam. Bulan terbenam. Matahari pun terbenam. Yang tenggelam tidak pantas disembah. Ia menghadap Pencipta langit dan bumi.",
        "Suatu hari kaumnya pergi. Ibrahim mendatangi berhala-berhala itu dan bertanya: kenapa kalian tidak makan? Kenapa tidak menjawab? Lalu ia menghancurkan semuanya, kecuali yang paling besar.",
        "Kaumnya marah: siapa yang melakukan ini? Ibrahim menjawab: tanyakan saja pada patung yang besar itu, kalau mereka bisa bicara. Mereka tertunduk. Mereka tahu, patung tidak bisa bicara.",
        "Kalah berdebat, mereka memilih kekerasan. Bakarlah dia, kata mereka. Sebuah bangunan didirikan, api dinyalakan, dan Ibrahim dilemparkan ke dalamnya.",
        "Lalu Allah berfirman: wahai api, jadilah dingin, dan keselamatan bagi Ibrahim. Itu surah Al-Anbiya ayat enam puluh sembilan. Yang hendak mencelakainya justru menjadi orang-orang yang paling rugi.",
        "Keyakinan yang lahir dari berpikir tidak padam oleh api. Menurut kamu, kebiasaan apa yang masih kita ikuti hanya karena semua orang melakukannya?",
    ],
    "EP07_SULAIMAN_SEMUT_HUDHUD": [
        "Seekor semut berteriak memperingatkan kawanannya. Dan seorang nabi mendengarnya, lalu tersenyum.",
        "Nabi Sulaiman mewarisi Dawud. Surah An-Naml menyebut ia diajari bahasa burung. Bala tentaranya dari jin, manusia, dan burung berbaris dengan tertib.",
        "Saat mereka tiba di lembah semut, seekor semut berkata: wahai semut-semut, masuklah ke sarang kalian, agar tidak terinjak Sulaiman dan tentaranya, sedang mereka tidak menyadari.",
        "Sulaiman tersenyum, lalu berdoa: ya Tuhanku, ilhamkan aku untuk tetap mensyukuri nikmat-Mu. Kekuasaan sebesar itu, dan yang ia minta justru rasa syukur.",
        "Lalu ia memeriksa burung-burung. Hud-hud tidak ada. Tak lama, hud-hud datang membawa kabar dari negeri Saba: seorang ratu memerintah, punya singgasana besar, dan kaumnya menyembah matahari.",
        "Sulaiman mengirim surat yang dibuka dengan bismillah. Sang ratu bermusyawarah dengan para pembesarnya, lalu mengirim hadiah. Sulaiman menolak: apa yang Allah berikan kepadaku lebih baik.",
        "Sebelum ratu tiba, seorang yang berilmu dari Kitab memindahkan singgasananya, sebelum mata sempat berkedip. Lalu sang ratu masuk istana dan mengira lantainya kolam air. Ternyata, lantai yang dilapisi kaca.",
        "Di akhir kisah, sang ratu berserah diri kepada Allah, Tuhan seluruh alam. Kekuasaan sebesar itu dipakai untuk bersyukur. Kalau kamu diberi kelebihan, apa yang pertama kamu lakukan?",
    ],
    "EP08_YUSUF_TUJUH_SAPI": [
        "Tujuh sapi gemuk dimakan tujuh sapi kurus. Mimpi aneh seorang raja ini menyelamatkan satu negeri dari kelaparan.",
        "Raja Mesir menceritakan mimpinya: tujuh sapi gemuk dimakan tujuh sapi kurus, tujuh tangkai gandum hijau, dan tujuh lainnya kering. Para pemukanya angkat tangan: itu mimpi kosong.",
        "Seorang mantan tahanan lalu teringat seseorang di penjara yang pandai menakwilkan mimpi. Namanya Yusuf. Sejak kecil, Yusuf pernah bermimpi sebelas bintang, matahari, dan bulan bersujud kepadanya.",
        "Yusuf menjawab dengan sebuah rencana. Bercocok tanamlah tujuh tahun seperti biasa. Hasil panennya biarkan di tangkainya, kecuali sedikit untuk dimakan.",
        "Kenapa di tangkainya? Ibnu Katsir menjelaskan, supaya gandum lebih awet dan tetap baik lebih lama. Karena setelah itu akan datang tujuh tahun yang sangat sulit, yang menghabiskan simpanan, kecuali sedikit untuk bibit.",
        "Setelah tujuh tahun sulit, datang tahun yang penuh hujan, saat orang kembali memeras anggur. Mimpi tentang sapi ternyata adalah rencana empat belas tahun.",
        "Raja ingin bertemu. Tapi Yusuf menolak keluar sebelum namanya dibersihkan. Setelah terbukti tidak bersalah, Yusuf meminta: jadikan aku bendaharawan negeri, karena aku pandai menjaga dan berpengetahuan.",
        "Mimpi diselesaikan dengan rencana, bukan sekadar harapan. Kalau hidupmu sedang musim panen, sudahkah kamu menyimpan untuk musim kering?",
    ],
    "EP09_MUSA_KHIDIR_TIGA_KEJADIAN": [
        "Seekor burung kecil mencelupkan paruhnya ke laut. Sebanyak itulah ilmu manusia, dibanding ilmu Allah.",
        "Dalam hadis riwayat Bukhari, Nabi Musa pernah ditanya siapa manusia paling berilmu. Ia menjawab: aku. Allah menegurnya, dan menunjukkan seorang hamba di pertemuan dua laut. Hadis itu menyebutnya Khidir.",
        "Musa berangkat bersama pembantunya, membawa ikan sebagai bekal. Di sebuah batu, ikan itu melompat ke laut, dan di situlah tempatnya. Musa minta ikut. Jawabnya: kamu tidak akan sanggup sabar bersamaku.",
        "Pertama, mereka naik perahu, dan perahu itu dilubangi. Musa protes. Kedua, mereka bertemu seorang anak muda, dan Khidir membunuhnya. Musa protes lebih keras.",
        "Ketiga, di negeri yang menolak menjamu mereka, Khidir justru menegakkan dinding yang hampir roboh, tanpa upah. Musa bertanya lagi, dan di situlah mereka berpisah.",
        "Lalu semuanya dijelaskan. Perahu itu milik orang miskin; di depan ada raja yang merampas setiap perahu yang baik. Anak muda itu dikhawatirkan menyeret orang tuanya yang beriman pada kekafiran. Dan di bawah dinding itu, tersimpan harta dua anak yatim.",
        "Penutupnya: apa yang kuperbuat bukan menurut kemauanku sendiri. Itu surah Al-Kahfi ayat delapan puluh dua.",
        "Yang terlihat merugikan hari ini bisa jadi penyelamat yang belum kita pahami. Pernahkah kamu mengalami hal buruk yang belakangan ternyata baik?",
    ],
    "EP10_DZULQARNAIN_TEMBOK_BESI": [
        "Sebuah tembok dari besi dan tembaga mendidih, dibangun di antara dua gunung. Pembangunnya menolak dibayar.",
        "Surah Al-Kahfi menyebutnya Dzulqarnain, artinya pemilik dua tanduk. Siapa dia? Sebagian ulama menyebut Iskandar, sebagian Koresh dari Persia. Al-Qur'an tidak menyebut nama aslinya.",
        "Allah memberinya kedudukan di bumi dan jalan untuk mencapai segala sesuatu. Ia berjalan ke barat, sampai ke tempat matahari terbenam, dan melihatnya terbenam di laut berlumpur hitam.",
        "Lalu ke timur, tempat matahari terbit di atas kaum yang tak punya pelindung dari sinarnya. Di setiap tempat, ia adil: yang zalim dihukum, yang berbuat baik dimudahkan.",
        "Perjalanan ketiga membawanya ke antara dua gunung. Sebuah kaum mengadu: Ya'juj dan Ma'juj berbuat kerusakan. Bolehkah kami membayarmu, agar kau buatkan dinding penghalang?",
        "Ia menjawab: yang Tuhan berikan kepadaku lebih baik. Bantu aku dengan tenaga. Bawakan potongan besi. Besi ditumpuk sampai rata dengan puncak kedua gunung. Tiuplah api, sampai besi merah menyala. Lalu tembaga mendidih dituangkan ke atasnya.",
        "Hasilnya, mereka tidak bisa mendakinya, dan tidak bisa melubanginya. Tapi Dzulqarnain tidak menyombongkannya: ini rahmat dari Tuhanku. Bila janji-Nya datang, tembok ini akan dihancurkan.",
        "Membangun dengan kuat, menolak upah, lalu mengembalikan pujian kepada Allah. Menurut kamu, tembok apa yang sedang kamu bangun hari ini?",
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
