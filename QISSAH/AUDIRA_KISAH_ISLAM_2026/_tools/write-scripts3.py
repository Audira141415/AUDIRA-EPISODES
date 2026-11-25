"""Batch 3 (EP11-EP15): writes script-lines.json. Same markup and rules as write-scripts.py; claims are listed in _research/FACTS3.md.
Run from AUDIRA_KISAH_ISLAM_2026: python _tools/write-scripts2.py, then python _tools/estimate.py EP11_... (pass folders explicitly; never run estimate.py without arguments, EP01-05 have real voice timelines)."""
import json, re
from pathlib import Path

S = {
    "EP11_QARUN_KUNCI_HARTA": [
        "Kunci-kuncinya saja terlalu berat dipikul sekelompok orang kuat. Bayangkan seberapa banyak hartanya, dan bayangkan bagaimana semuanya lenyap dalam sekejap.",
        "Namanya Qarun. Surah Al-Qasas menyebut ia dari kaum Musa sendiri, tapi berlaku zalim kepada mereka. Allah menganugerahinya perbendaharaan yang luar biasa, sampai kunci gudangnya pun menjadi beban.",
        "Kaumnya menasihati: jangan terlalu bangga. Carilah akhirat dengan hartamu, tapi jangan lupakan bagianmu di dunia. Berbuat baiklah, sebagaimana Allah berbuat baik kepadamu.",
        "Jawaban Qarun singkat: aku diberi harta ini karena ilmuku sendiri. Al-Qur'an mengingatkan, umat sebelumnya yang lebih kuat dan lebih banyak hartanya pun sudah dibinasakan.",
        "Suatu hari Qarun keluar ke tengah kaumnya dengan segala kemegahannya. Orang-orang yang mengejar dunia berkata: andai kita punya harta seperti Qarun. Dia sungguh beruntung.",
        "Tapi orang-orang berilmu menjawab: celaka kalian. Pahala Allah lebih baik bagi yang beriman dan beramal saleh, dan itu hanya didapat orang-orang yang sabar.",
        "Lalu Qarun dibenamkan ke dalam bumi, bersama rumahnya. Tak ada satu golongan pun yang menolongnya. Dan mereka yang kemarin iri berkata: untung Allah tidak membenamkan kita juga.",
        "Harta itu titipan, bukan bukti kehebatan diri. Menurut kamu, kapan rasa bangga berubah menjadi sombong? Kisah dalam Al-Qur'an, bersama {AUDIRA.|Audira.}",
    ],
    "EP12_HABIL_QABIL_GAGAK": [
        "Pembunuhan pertama dalam sejarah manusia. Dan pelakunya justru belajar dari seekor burung gagak, tentang sesuatu yang paling sederhana: cara mengubur saudaranya sendiri.",
        "Surah Al-Ma'idah ayat dua puluh tujuh: dua putra Adam mempersembahkan kurban. Kurban salah satunya diterima, yang lain tidak. Tradisi menamai mereka Habil dan Qabil.",
        "Qabil marah: aku pasti membunuhmu. Habil tidak membalas dengan ancaman. Ia menjawab dengan tenang: Allah hanya menerima dari orang-orang yang bertakwa.",
        "Lalu ia berkata: kalau kamu menggerakkan tangan untuk membunuhku, aku tidak akan menggerakkan tanganku untuk membunuhmu. Aku takut kepada Allah, Tuhan seluruh alam.",
        "Tapi nafsu Qabil menang. Ia membunuh saudaranya sendiri, dan jadilah ia termasuk orang-orang yang rugi.",
        "Lalu Allah mengutus seekor gagak yang menggali tanah, untuk memperlihatkan cara mengubur jenazah saudaranya. Qabil berkata: celaka aku, mengapa aku tidak mampu seperti gagak ini? Dan ia pun menyesal.",
        "Karena peristiwa itu, ayat berikutnya menetapkan: siapa membunuh satu jiwa tanpa hak, seakan membunuh semua manusia. Dan siapa memelihara satu jiwa, seakan memelihara semua manusia.",
        "Iri yang dibiarkan bisa berakhir dengan penyesalan seumur hidup. Menurut kamu, apa cara terbaik memadamkan iri sebelum membesar? Kisah dalam Al-Qur'an, bersama {AUDIRA.|Audira.}",
    ],
    "EP13_UNTA_NABI_SALEH": [
        "Satu sumber air, dua giliran: sehari untuk seekor unta, sehari untuk seluruh kaum. Aturan sederhana ini menjadi ujian bagi kaum Tsamud.",
        "Kaum Tsamud hidup makmur. Mereka memahat gunung menjadi rumah, punya kebun, mata air, dan kurma yang mayangnya lembut. Surah Asy-Syu'ara mencatat semua itu.",
        "Nabi Saleh mengajak mereka menyembah Allah. Jawab mereka: kamu cuma manusia seperti kami. Datangkan mukjizat kalau kamu memang benar.",
        "Datanglah seekor unta betina dari Allah. Pesannya jelas: unta ini punya giliran minum, kalian juga punya giliran. Jangan sentuh dia dengan niat jahat.",
        "Tapi para pemuka yang sombong menolak. Mereka memanggil kawannya, orang paling celaka di antara mereka, lalu unta itu disembelih. Wahai Saleh, buktikan ancamanmu, kata mereka.",
        "Lalu datanglah gempa. Rumah-rumah yang mereka pahat dengan bangga menjadi reruntuhan. Surah Asy-Syams menyebut, Tuhan meratakan mereka dengan tanah.",
        "Di barat laut Arab Saudi ada Al-Hijr, atau {Mada'in|Madain} Saleh. Al-Qur'an mengaitkan Al-Hijr dengan kaum Tsamud. Tapi makam batu yang terkenal di sana dipahat bangsa Nabath, jauh setelahnya. Situs ini menjadi Warisan Dunia UNESCO sejak {2008.|dua ribu delapan.}",
        "Ujiannya bukan unta, tapi kesediaan berbagi air. Menurut kamu, ujian berbagi apa yang paling sulit hari ini? Kisah dalam Al-Qur'an, bersama {AUDIRA.|Audira.}",
    ],
    "EP14_THALUT_UJIAN_SUNGAI": [
        "Sebelum perang, satu pasukan diuji dengan sebuah sungai. Yang minum sepuasnya, tidak boleh ikut. Dan yang lolos ujian ini ternyata hanya sedikit.",
        "Setelah masa Musa, para pemuka Bani Israil meminta seorang raja kepada nabi mereka. Allah mengangkat Thalut. Mereka protes: dia tidak kaya. Jawab nabi mereka: Allah memberinya kelebihan ilmu dan fisik.",
        "Agar mereka yakin, nabi itu memberi tanda. Tanda kerajaannya adalah datangnya Tabut, yang berisi ketenangan dari Tuhan dan peninggalan keluarga Musa dan Harun.",
        "Thalut membawa pasukannya, lalu berkata: Allah akan menguji kalian dengan sebuah sungai. Siapa meminumnya bukan pengikutku, kecuali menciduk seciduk dengan tangan.",
        "Hampir semua minum. Hanya sebagian kecil yang menahan diri dan menyeberang. Melihat besarnya pasukan Jalut, sebagian lagi berkata: kami tidak kuat hari ini.",
        "Tapi yang yakin akan bertemu Allah menjawab: betapa banyak kelompok kecil mengalahkan kelompok besar dengan izin Allah. Allah bersama orang-orang yang sabar.",
        "Mereka berdoa: limpahkan kesabaran, kokohkan langkah kami. Lalu dengan izin Allah mereka menang, dan Dawud mengalahkan Jalut. Kelak, Dawud diberi kerajaan dan hikmah.",
        "Kemenangan besar dimulai dari menahan diri pada hal kecil, seperti seteguk air. Kalau kamu di tepi sungai itu, kamu minum, atau menahan diri? Kisah dalam Al-Qur'an, bersama {AUDIRA.|Audira.}",
    ],
    "EP15_KEBUN_HANGUS_SEMALAM": [
        "Malam hari mereka bersumpah akan memanen besok pagi. Paginya, kebun itu sudah hitam seperti malam. Tidak ada satu buah pun yang tersisa.",
        "Surah Al-Qalam ayat tujuh belas menceritakan para pemilik kebun. Menurut riwayat yang dikutip Ibnu Katsir, ayah mereka biasa menyisihkan sebagian panen untuk orang miskin.",
        "Setelah sang ayah wafat, anak-anaknya sepakat: tahun ini, jangan beri orang miskin apa pun. Mereka bersumpah akan memetik hasilnya pagi-pagi, tanpa mengucap insya Allah.",
        "Lalu kebun itu ditimpa bencana dari Tuhan ketika mereka sedang tidur. Jadilah ia hitam, seperti malam yang gelap gulita.",
        "Pagi-pagi mereka saling memanggil, lalu berangkat sambil berbisik: hari ini jangan sampai ada orang miskin masuk ke kebunmu.",
        "Saat melihat kebunnya, mereka berkata: kita pasti tersesat. Bukan, kita memang tidak mendapat apa-apa. Yang paling bijak di antara mereka berkata: bukankah sudah kubilang, kenapa kalian tidak bertasbih?",
        "Mereka saling menyalahkan, lalu mengaku: Mahasuci Tuhan kami, sungguh kami orang-orang yang zalim. Semoga Tuhan mengganti dengan kebun yang lebih baik. Sungguh, kami berharap ampunan dari Tuhan kami.",
        "Harta yang ditahan dari orang lain bisa hilang dalam semalam. Menurut kamu, kenapa memberi justru menjaga rezeki? Kisah dalam Al-Qur'an, bersama {AUDIRA.|Audira.}",
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
