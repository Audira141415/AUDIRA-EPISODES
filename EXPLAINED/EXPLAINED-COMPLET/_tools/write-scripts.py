"""Writes each episode's project/script-lines.json. Markup {display|spoken}: display goes on screen and in subtitles, spoken goes to Cartesia.
Run from anywhere: python _tools/write-scripts.py"""
import json, re
from pathlib import Path

SERIES = Path(__file__).resolve().parent.parent
AUD = "Ikuti {AUDIRA|Audira} untuk cara kerja benda berikutnya."
YL = "{Yale|Yel}"
TS = "{Toshiba|Tosiba}"

S = {
    "EP01_MICROWAVE": [
        "Microwave tidak memanaskan piringmu. Ia menggoyang air di dalam makanan sampai panas.",
        "Semua berawal tahun seribu sembilan ratus empat puluh lima. Percy Spencer, insinyur di perusahaan {Raytheon|Reitheon}, sedang bekerja di dekat radar. Tiba-tiba permen batangan di sakunya meleleh.",
        "Penyebabnya gelombang mikro dari radar itu. Dua tahun kemudian, microwave komersial pertama bernama {Radarange|Radar Reinj} mulai dijual.",
        "Di dalam microwave ada komponen bernama magnetron. Ia membuat gelombang mikro dengan frekuensi sekitar dua koma empat lima gigahertz, dengan panjang gelombang dua belas koma dua sentimeter.",
        "Gelombang itu membawa medan listrik yang berbalik arah sangat cepat. Molekul air di dalam makanan ikut berputar mengikutinya, dan gerakan itu menghasilkan panas.",
        "Tapi makanan tidak matang dari dalam. Gelombang ini hanya menembus sekitar satu sentimeter. Bagian dalamnya ikut panas karena panas merambat dari lapisan luar. Karena itu ada piring putar, supaya panasnya lebih merata.",
        "Lalu kenapa gelombangnya tidak bocor? Ruang masaknya bekerja seperti sangkar {Faraday.|Faradei.} Kaca pintunya dilapisi jaring logam dengan lubang yang jauh lebih kecil dari dua belas koma dua sentimeter. Gelombang mikro tertahan, tapi cahaya tetap lewat, jadi isinya bisa kamu lihat.",
        f"Jadi yang dipanaskan microwave sebenarnya air di makananmu. Kamu pernah iseng menonton piringnya berputar? {AUD}",
    ],
    "EP02_KULKAS": [
        "Kulkas sebenarnya tidak membuat dingin. Ia memindahkan panas dari dalam ke luar.",
        "Coba dekatkan tanganmu ke pipa di belakang kulkas. Terasa hangat, kan? Di situlah panas dari makananmu dibuang ke udara ruangan.",
        "Kuncinya ada di cairan pendingin bernama refrigeran, misalnya {R134a.|er satu tiga empat a.} Cairan ini terus berputar lewat empat komponen: kompresor, kondensor, katup ekspansi, dan evaporator.",
        "Di dalam kulkas, refrigeran menguap di pipa evaporator. Saat menguap, ia menyerap panas dari udara dan makanan di sekitarnya. Itulah yang membuat isi kulkas dingin.",
        "Uap itu lalu masuk ke kompresor dan ditekan sampai panas. Uap panas bertekanan tinggi ini mengalir ke pipa kondensor, melepas panasnya ke udara ruangan, lalu mengembun jadi cair lagi.",
        "Setelah itu, cairan melewati katup ekspansi. Tekanannya turun, dan ia siap menguap lagi di dalam kulkas. Siklus ini berulang terus selama kulkas menyala.",
        "Prinsip ini sudah lama ditemukan. William {Cullen|Kalen} pernah mendidihkan eter di ruang yang hampir hampa udara, dan cairan itu menyerap panas di sekitarnya. Kulkas rumah yang praktis baru muncul tahun seribu sembilan ratus lima belas.",
        f"Jadi kulkas bukan pembuat dingin, tapi pengangkut panas. Kamu pernah sadar belakang kulkasmu hangat? {AUD}",
    ],
    "EP03_KUNCI_GEMBOK": [
        "Gerigi kunci rumahmu bukan hiasan. Setiap lekuknya adalah kode rahasia.",
        f"Kebanyakan pintu memakai kunci silinder jenis pin tumbler, disebut juga kunci {YL}, dari nama Linus {YL} Junior.",
        "Di dalamnya ada silinder kecil bernama plug, tempat kunci dimasukkan. Plug inilah yang harus berputar supaya pintu terbuka.",
        "Plug punya deretan lubang, biasanya lima atau enam. Di tiap lubang ada pin yang didorong pegas, dan panjang pinnya berbeda-beda.",
        "Tanpa kunci, pin-pin ini menahan plug sehingga tidak bisa berputar. Kalau kuncinya salah, pinnya tidak sejajar, dan plug tetap tertahan.",
        "Begitu kunci yang benar masuk, setiap gerigi mengangkat satu pin ke ketinggian yang pas. Semua pin sejajar tepat di garis batas plug, dan plug bebas berputar. Klik, pintu terbuka.",
        f"Idenya sangat tua. Prinsip dasarnya mungkin sudah ada sekitar dua ribu tahun sebelum Masehi di Mesir, berupa kunci kayu dengan baut geser. Linus {YL} Senior mengembangkannya tahun seribu delapan ratus empat puluh delapan, lalu anaknya menyempurnakannya tahun seribu delapan ratus enam puluh satu.",
        f"Jadi setiap kunci membawa pola tinggi pinnya sendiri. Kamu pernah salah mencoba kunci di pintu rumah sendiri? {AUD}",
    ],
    "EP04_LIFT_TIDAK_JATUH": [
        "Kalau tali lift putus, kabinnya tidak langsung jatuh. Rahasianya dipamerkan secara dramatis tahun seribu delapan ratus lima puluh empat.",
        "Tahun seribu delapan ratus lima puluh dua, Elisha Otis bekerja di sebuah pabrik di New York. Pabrik itu butuh alat angkat untuk mesin berat, tapi alat angkat saat itu berbahaya kalau talinya putus.",
        "Otis lalu menemukan alat pengaman yang otomatis menghentikan lift kalau tali pengangkatnya putus. Tahun seribu delapan ratus lima puluh empat, ia memamerkannya di pameran {Crystal Palace,|Kristal Pales,} New York, dengan aksi yang menantang maut.",
        "Tiga tahun kemudian, lift penumpang pertama dengan pengaman ini dipasang di sebuah toko di New York. Prinsip pengamannya masih dipakai sampai sekarang.",
        "Lift modern ditarik tali baja yang melintasi puli beralur. Gesekan tali dengan puli itulah yang menggerakkan kabin. Di sisi lain ada pemberat yang mengimbangi berat kabin, dan keduanya meluncur di rel pemandu.",
        "Lalu ada beberapa alat pengaman. Salah satunya governor, juga temuan Otis. Kalau kabin sampai jatuh bebas, governor bekerja dan menghentikannya.",
        "Rem motornya juga cerdik. Rem ini ditahan terbuka oleh listrik, dan ditutup oleh pegas. Jadi saat listrik padam, rem justru mengunci. Tahun dua ribu tujuh, tali sebuah lift rumah sakit anak di Seattle putus, dan kabinnya jatuh sampai governor menghentikannya.",
        f"Jadi lift dirancang untuk berhenti saat ada yang salah. Kamu masih takut naik lift? {AUD}",
    ],
    "EP05_RICE_COOKER": [
        "Rice cooker tidak punya mata. Tapi ia tahu kapan nasimu matang.",
        "Isinya sederhana: pemanas, mangkuk, dan termostat yang mengukur suhu mangkuk. Termostat inilah otaknya.",
        f"Rice cooker listrik pertama dibuat {{Mitsubishi|Mitsubisi}} Electric tahun seribu sembilan ratus dua puluh tiga, tapi belum otomatis. Yang otomatis pertama untuk rumah adalah buatan {TS}, diperkenalkan sepuluh Desember seribu sembilan ratus lima puluh lima.",
        "Pembuatnya menemukan masalah. Riset menunjukkan nasi paling enak dimasak di sembilan puluh delapan derajat selama dua puluh menit. Tapi kalau hanya pakai timer, hasilnya kacau: kadang gosong, kadang belum matang, karena waktu air mendidih selalu berbeda.",
        "Jawabannya ada di air. Selama masih ada air di dalam mangkuk, suhunya tertahan di sekitar titik didih. Panas dari pemanas dipakai untuk menguapkan air, bukan untuk menaikkan suhu.",
        "Begitu air terserap dan menguap habis, suhu mangkuk naik dengan cepat. Termostat mendeteksi lonjakan itu, lalu mematikan pemanas. Klik, nasi matang.",
        f"Proyek {TS} ini dikerjakan sejak tahun seribu sembilan ratus lima puluh satu, dengan banyak percobaan, termasuk oleh Fumiko, istri penemunya, Yoshitada Minami. Keberhasilannya memicu perang produksi rice cooker di Jepang.",
        f"Jadi rice cooker membaca suhu, bukan waktu. Rice cooker di rumahmu masih yang tombolnya berbunyi klik? {AUD}",
    ],
}

for ep, lines in S.items():
    d = SERIES / ep / "project"
    d.mkdir(parents=True, exist_ok=True)
    # punctuation must sit inside {display|spoken}, or it becomes its own caption word
    lines = [re.sub(r"\{([^|}]*)\|([^}]*)\}([,.?:!])", r"{\1\3|\2\3}", t) for t in lines]
    out = [{"id": f"s{i + 1}", "text": t} for i, t in enumerate(lines)]
    (d / "script-lines.json").write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf8")
    print(ep, len(out))
