"""Batch 4 (EP16-EP20): writes script-lines.json. Same markup and rules as write-scripts.py; claims are listed in _research/FACTS4.md.
Run from AUDIRA_KISAH_ISLAM_2026: python _tools/write-scripts2.py, then python _tools/estimate.py EP16_... (pass folders explicitly; never run estimate.py without arguments, EP01-05 have real voice timelines)."""
import json, re
from pathlib import Path

S = {
    "EP16_AYYUB_HENTAKAN_KAKI": [
        "Ia kehilangan kesehatannya, juga keluarganya. Lalu satu hentakan kaki memancarkan air yang sejuk.",
        "Al-Qur'an menyebut kisah Nabi Ayyub dalam surah Al-Anbiya dan surah Shad. Ia ditimpa penyakit dan penderitaan yang berat. Ia sendiri menyebutnya gangguan setan, berupa derita dan bencana. Dan keluarganya pun tak lagi bersamanya.",
        "Tapi doanya tidak berisi keluhan panjang. Hanya satu kalimat: ya Tuhanku, sungguh aku telah ditimpa penyakit, padahal Engkau Yang Maha Penyayang dari semua yang penyayang.",
        "Perhatikan caranya berdoa. Ia tidak menuntut, tidak menyalahkan siapa pun. Ia menyebut keadaannya, lalu menyebut sifat Tuhannya. Dan ia berhenti di situ, menyerahkan sisanya kepada Allah.",
        "Jawabannya tercatat di surah Shad ayat empat puluh dua: hentakkanlah kakimu. Inilah air yang sejuk, untuk mandi dan untuk minum. Kesembuhan datang dari langkah kecil yang ia lakukan sendiri.",
        "Penyakitnya dilenyapkan. Keluarganya dikembalikan kepadanya, bahkan dilipatgandakan, sebagai rahmat dan pelajaran bagi orang-orang yang berpikir.",
        "Lalu Allah memujinya dengan tiga sebutan sekaligus: sungguh, Kami dapati dia seorang yang sabar. Dialah sebaik-baik hamba. Dia sangat taat.",
        "Sabar bukan diam tanpa doa. Sabar adalah mengadu, hanya kepada-Nya. Hal apa yang ingin kamu adukan kepada-Nya hari ini? Kisah dalam Al-Qur'an, bersama {AUDIRA.|Audira.}",
    ],
    "EP17_ASHABUL_UKHDUD_PEMUDA": [
        "Seorang raja berhasil membunuh seorang pemuda. Tapi di hari yang sama, rakyatnya justru beriman kepada Tuhan pemuda itu.",
        "Surah Al-Buruj menyebut para pembuat parit berapi, yang menyiksa orang beriman hanya karena mereka beriman kepada Allah. Kisah lengkapnya ada dalam hadis riwayat Muslim.",
        "Seorang raja punya penyihir istana yang sudah tua. Penyihir itu meminta seorang pemuda untuk diajari sihir. Di perjalanan, pemuda itu bertemu seorang rahib, dan mulai belajar iman darinya.",
        "Suatu hari seekor binatang besar menghalangi jalan. Pemuda itu melempar batu sambil berdoa, dan jalan kembali terbuka. Ia mulai menyembuhkan orang buta dan orang sakit, tapi selalu berkata: bukan aku yang menyembuhkan, Allah yang menyembuhkan.",
        "Raja murka. Ia mencoba menyingkirkan pemuda itu dari puncak gunung, lalu di tengah laut. Dua kali gagal. Lalu pemuda itu berkata: kamu tidak akan bisa membunuhku, kecuali dengan satu cara.",
        "Kumpulkan orang di satu lapangan, lalu panah aku sambil berkata: dengan nama Allah, Tuhan pemuda ini. Raja melakukannya, dan pemuda itu wafat. Orang-orang serentak berseru: kami beriman kepada Tuhan pemuda ini.",
        "Raja lalu menggali parit-parit berapi untuk memaksa mereka kembali. Mereka tetap teguh. Al-Qur'an menutupnya: Allah Maha Menyaksikan segala sesuatu.",
        "Kemenangan tidak selalu berarti selamat di dunia. Kadang ia berarti keyakinan yang menular ke ribuan orang. Menurut kamu, apa yang membuat pemuda itu begitu teguh? Kisah dalam Al-Qur'an, bersama {AUDIRA.|Audira.}",
    ],
    "EP18_SAPI_BETINA_BANI_ISRAIL": [
        "Surah terpanjang dalam Al-Qur'an dinamai dari seekor sapi. Dan kisahnya tentang orang-orang yang terlalu banyak bertanya.",
        "Surah Al-Baqarah ayat enam puluh tujuh. Musa berkata kepada kaumnya: Allah memerintahkan kalian menyembelih seekor sapi betina. Jawab mereka: apakah engkau mengejek kami?",
        "Mereka bertanya: sapi yang bagaimana? Jawabnya: tidak tua, tidak muda, pertengahan. Mereka bertanya lagi: apa warnanya? Kuning cerah, menyenangkan orang yang memandang.",
        "Mereka bertanya lagi: sapi itu masih belum jelas bagi kami. Jawabnya: belum pernah dipakai membajak tanah, tidak untuk mengairi tanaman, sehat, dan tanpa belang.",
        "Setiap pertanyaan membuat syaratnya makin sempit. Akhirnya mereka menyembelihnya, dan ayat itu mencatat dengan jujur: nyaris mereka tidak melaksanakannya.",
        "Ternyata perintah itu berkaitan dengan sebuah pembunuhan, yang pelakunya saling dituduhkan. Allah memerintahkan: pukullah jenazah itu dengan bagian dari sapi tersebut. Dan apa yang mereka sembunyikan pun tersingkap.",
        "Tapi ayat berikutnya justru menyorot hati mereka: setelah itu hatimu menjadi keras seperti batu, bahkan lebih keras. Padahal ada batu yang terbelah dan memancarkan air.",
        "Perintah sederhana bisa jadi berat karena kita sendiri yang mempersulitnya. Pernahkah kamu membuat hal yang mudah menjadi rumit, hanya karena enggan melakukannya? Kisah dalam Al-Qur'an, bersama {AUDIRA.|Audira.}",
    ],
    "EP19_HUD_ANGIN_KAUM_AD": [
        "Mereka melihat awan gelap mendekat, lalu bersorak: hujan akan turun. Ternyata itu angin yang menghancurkan segalanya, kecuali bekas rumah mereka sendiri.",
        "Kaum {'Ad|Ad} tinggal di bukit-bukit pasir, Al-Ahqaf. Surah Al-Fajr menyebut Iram, dengan bangunan tinggi yang belum pernah dibangun di negeri lain.",
        "Nabi Hud bertanya kepada mereka: apakah kalian membangun istana di setiap tanah tinggi hanya untuk bermegah, dan benteng-benteng seolah akan hidup kekal?",
        "Ia mengingatkan nikmat mereka: ternak, anak-anak, kebun, dan mata air. Jawab mereka: sama saja, kau menasihati atau tidak. Ini hanya adat orang-orang dahulu, dan kami tidak akan diazab.",
        "Bahkan mereka menantang: datangkan azab yang kau ancamkan, kalau kau benar. Hud menjawab: ilmu tentang itu hanya pada Allah. Aku hanya menyampaikan.",
        "Lalu datang awan yang menuju lembah-lembah mereka. Mereka mengira itu hujan. Ternyata angin yang sangat dingin, berhembus tujuh malam delapan hari, terus-menerus.",
        "Surah Al-Ahqaf menyebut, angin itu menghancurkan segala sesuatu, sampai yang tersisa hanya bekas tempat tinggal mereka. Pendengaran, penglihatan, dan hati mereka tidak berguna sedikit pun.",
        "Bangunan tertinggi tak bisa menahan angin yang diperintah. Menurut kamu, apa yang sedang kita bangun agar terasa kekal? Kisah dalam Al-Qur'an, bersama {AUDIRA.|Audira.}",
    ],
    "EP20_SYUAIB_TIMBANGAN_MADYAN": [
        "Di negeri ini, kejahatan terbesar tidak terjadi di medan perang, tapi di atas timbangan pasar, sedikit demi sedikit, setiap hari.",
        "Penduduk Madyan hidup makmur dan ramai berdagang. Nabi Syu'aib diutus kepada mereka dengan pesan: sembahlah Allah, dan jangan kurangi takaran dan timbangan.",
        "Penuhilah takaran dan timbangan dengan adil. Jangan rugikan hak orang lain. Sisa yang halal dari Allah lebih baik bagimu. Itu surah Hud ayat delapan puluh lima dan delapan puluh enam.",
        "Jawab mereka: apakah agamamu melarang kami mengelola harta sesuka kami? Bagi mereka, curang di timbangan adalah urusan pribadi, bukan urusan agama.",
        "Mereka bahkan mengancam: kalau bukan karena keluargamu, kami sudah merajammu. Syu'aib menjawab: apakah keluargaku lebih terhormat bagimu daripada Allah?",
        "Syu'aib menutup dengan tenang: berbuatlah menurut kemampuanmu, dan tunggulah. Saat keputusan datang, Syu'aib dan orang-orang beriman diselamatkan. Yang zalim dibinasakan oleh suara yang mengguntur, seolah mereka tidak pernah tinggal di sana.",
        "Pesan yang sama diulang di surah Al-Muthaffifin: celakalah orang-orang yang curang. Minta dicukupkan saat menerima, tapi mengurangi saat menakar untuk orang lain.",
        "Timbangan yang jujur adalah ibadah. Di pekerjaanmu, timbangan apa yang harus kamu jaga? Kisah dalam Al-Qur'an, bersama {AUDIRA.|Audira.}",
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
