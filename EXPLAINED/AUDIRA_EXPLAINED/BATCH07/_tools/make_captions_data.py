"""Build _tools/captions_data.json for Batch 7 (facts limited to SCRIPT.md + RESEARCH_REPORT.md). Usage (from BATCH07): python _tools/make_captions_data.py"""
import json
import openpyxl

wb = openpyxl.load_workbook("../AUDIRA_EXPLAINED_Master_Episode_365_v2.xlsx", read_only=True)
TITLE = {}
for r in wb.worksheets[0].iter_rows(values_only=True):
    if r and isinstance(r[0], str) and r[0].startswith("AE-"):
        TITLE[r[0]] = str(r[3]).rstrip("?")

D = {}

D["ep060"] = dict(
    no=60, date="Sabtu, 5 Desember 2026", prev=f"AE-073 {TITLE['AE-073']} (Batch 6)",
    title="Dermaga 3 Km di Tengah Laut Ini Tidak Mengapung, Ini Rahasianya",
    hook="Dermaga sepanjang lebih dari tiga kilometer ini tidak mengapung. Ia berdiri di atas barisan tiang yang menancap ke dasar laut.",
    cover="HUTAN TIANG DI LAUT",
    tags="#Dermaga #Pelabuhan #CaraKerja #TeknikSipil #AUDIRA",
    tt="Dermaga di laut berdiri di atas barisan tiang pancang. Tiang diangkat crane dari tongkang, digetarkan masuk ke lumpur, lalu dipukul palu raksasa sampai turunnya tinggal sekitar 1 mm per pukulan. Di Terminal Kijing, Kalbar, jalurnya menjorok 3.374 m ke laut sedalam 17 m.",
    pin="AUDIRA EXPLAINED #60. Sumber: ANTARA (Terminal Kijing, 2020), jurnal teknik tentang pemancangan tiang laut di terminal LPG Jawa Timur dan dermaga Selat Panjang, jurnal tiang pancang Patimban. Visual adalah ilustrasi 3D, bukan rekaman proyek.",
    points=[
        "Dermaga tiang terbuka berdiri di atas barisan tiang yang menancap ke dasar laut, bukan mengapung.",
        "Di Terminal Kijing, Kalbar, jalurnya dibuat menjorok 3.374 m untuk mencapai laut sedalam 17 m.",
        "Tiang diangkat crane dari tongkang, ditegakkan, digetarkan masuk ke lumpur, lalu dipukul palu raksasa.",
        "Di satu proyek, tiang berhenti dipukul saat turunnya tinggal sekitar 1 mm per pukulan, tanda ujungnya menumpu tanah keras.",
        "Satu tiang besar bisa makan sekitar 5 jam, jadi satu crane hanya memasang sekitar satu tiang sehari.",
    ],
    ig="Di bawah dermaga yang kamu lihat ada hutan tiang yang tersembunyi. Kamu pernah jalan di dermaga panjang di tengah laut? Cerita di komentar.",
    audio="Dengarkan dentum palu tiang, deru crane di atas tongkang, dan ombak di antara tiang.",
    alt=["Kenapa Dermaga di Laut Tidak Tenggelam?", "Cara Memancang Tiang dari Atas Tongkang", "Kapan Tiang Dermaga Berhenti Dipukul?"],
    desc="Bagaimana dermaga dibangun di atas laut? Dermaga tiang terbuka berdiri di atas barisan tiang pancang. Dari tongkang, crane mengangkat dan menegakkan tiang, tiang digetarkan masuk ke lumpur, lalu palu raksasa memukulnya. Setiap pukulan diukur, dan tiang berhenti dipukul saat turunnya tinggal sekitar 1 mm per pukulan. Setelah itu balok dan pelat beton dipasang di atasnya. Contohnya Terminal Kijing di Kalimantan Barat yang menjorok 3.374 m ke laut.",
    ytags="dermaga, pelabuhan, tiang pancang, cara membangun dermaga, terminal kijing, kalimantan barat, tongkang, crane, pile driving, kalendering, dermaga apung, teknik sipil, infrastruktur, edukasi, audira explained, AUDIRA",
    ytpin="AUDIRA EXPLAINED #60 (playlist AUDIRA EXPLAINED). Catatan: angka 1 mm per pukulan dan 5 jam per tiang berasal dari proyek tertentu, bukan standar untuk semua dermaga.",
    thumb="Dermaga beton panjang di tengah laut biru, di bawahnya barisan tiang baja rapat, crane di atas tongkang memancang tiang baru, teks: HUTAN TIANG DI LAUT",
    fb="Dermaga sepanjang lebih dari 3 km ini tidak mengapung. Ia berdiri di atas barisan tiang yang menancap ke dasar laut. Semuanya dikerjakan dari tongkang: crane mengangkat tiang, tiang digetarkan masuk ke lumpur, lalu palu raksasa memukulnya. Setiap pukulan diukur. Di satu proyek, tiang berhenti dipukul saat turunnya tinggal sekitar 1 mm per pukulan. Satu tiang besar bisa makan 5 jam. Dermaga apung pun tetap dikunci tiang.",
    fbq="Menurutmu, lebih sulit membangun dermaga di laut atau jembatan di atas sungai?",
    x1="Dermaga di Terminal Kijing menjorok 3.374 m ke laut sedalam 17 m, dan tidak mengapung. Ia berdiri di atas tiang yang dipukul sampai turunnya tinggal ±1 mm per pukulan. #Dermaga #AUDIRA",
    thread=[
        "1/ Dermaga sepanjang lebih dari 3 km bisa berdiri di tengah laut tanpa mengapung. Rahasianya hutan tiang di bawahnya. #Dermaga",
        "2/ Semuanya dikerjakan dari tongkang. Crane mengangkat dan menegakkan tiang, lalu tiang digetarkan masuk ke lumpur.",
        "3/ Palu raksasa memukulnya berulang kali. Di satu proyek, tiang berhenti dipukul saat turunnya tinggal sekitar 1 mm per pukulan.",
        "4/ Satu tiang besar bisa makan 5 jam. Setelah tiang berdiri, balok dan pelat beton dipasang di atasnya. #TeknikSipil #AUDIRA",
    ],
    th=[
        "Dermaga sepanjang lebih dari tiga kilometer ini tidak mengapung. Ia berdiri di atas barisan tiang yang menancap ke dasar laut. #Dermaga",
        "Dari tongkang, crane menegakkan tiang, tiang digetarkan masuk ke lumpur, lalu palu raksasa memukulnya. Setiap pukulan diukur. Di satu proyek, tiang berhenti saat turunnya tinggal sekitar 1 mm per pukulan.",
        "Satu tiang besar bisa makan 5 jam, jadi satu crane hanya memasang sekitar satu tiang sehari. Dermaga apung pun tetap dikunci tiang. Kamu pernah jalan di dermaga panjang?",
    ],
)

D["ep063"] = dict(
    no=63, date="Minggu, 6 Desember 2026", prev=f"AE-060 {TITLE['AE-060']} (Batch 7)",
    title="Atap Stadion Raksasa Melayang Tanpa Tiang di Depan Penonton, Ini Rahasianya",
    hook="Atap stadion ini menaungi tribun keliling tanpa satu pun tiang di depan penonton. Rahasianya mirip roda sepeda.",
    cover="ATAP SEPERTI RODA SEPEDA",
    tags="#Stadion #Arsitektur #CaraKerja #TeknikSipil #AUDIRA",
    tt="Atap stadion bisa membentang tanpa tiang di depan penonton karena bekerja seperti roda sepeda: cincin tarik di tengah, cincin tekan baja di tepi luar, dan kabel seperti jari-jari. Di stadion Stuttgart ada 40 rangka kabel. Tarikan dari semua sisi saling meniadakan, jadi atapnya seimbang sendiri.",
    pin="AUDIRA EXPLAINED #63. Sumber: halaman proyek insinyur perancang atap stadion Stuttgart, Maracanã, dan Warsawa; ANTARA dan Jakpro untuk pengangkatan atap JIS (2021). Visual adalah ilustrasi 3D, tanpa nama sponsor stadion.",
    points=[
        "Tiang atap tetap ada, tapi hanya di tepi luar, bukan di depan penonton.",
        "Atap yang menjorok jauh ke arah lapangan cenderung melengkung jatuh ke bawah.",
        "Di stadion Stuttgart, Jerman, cincin tarik di tengah dan cincin tekan baja di tepi luar dihubungkan 40 rangka kabel, seperti jari-jari sepeda.",
        "Kabel hanya kuat saat ditarik, cincin luar menahan dorongan; tarikan dari semua sisi saling meniadakan.",
        "Atap JIS di Jakarta memakai cara lain: rangka baja ruang 3.900 ton, dirakit di bawah lalu diangkat sekaligus dari 16 titik.",
    ],
    ig="Atap ribuan ton bisa melayang karena gayanya seimbang, persis roda sepeda. Stadion mana yang atapnya paling bikin kamu kagum? Tulis di komentar.",
    audio="Dengarkan dentang kabel baja yang menegang, derak cincin baja, dan riuh tribun di bawah atap.",
    alt=["Kenapa Atap Stadion Tidak Butuh Tiang di Tengah?", "Atap Stadion yang Bekerja Seperti Roda Sepeda", "Cara Atap JIS 3.900 Ton Diangkat"],
    desc="Bagaimana atap stadion raksasa bisa membentang tanpa tiang di depan penonton? Tiangnya hanya di tepi luar. Di stadion Stuttgart, Jerman, atapnya dibentuk seperti roda sepeda: cincin tarik di tengah, cincin tekan baja di tepi luar, dan 40 rangka kabel sebagai jari-jari. Kabel hanya kuat saat ditarik, cincin luar menahan dorongan, dan tarikan dari semua sisi saling meniadakan. Atap JIS di Jakarta memakai cara lain: rangka baja ruang 3.900 ton yang diangkat sekaligus dari 16 titik.",
    ytags="atap stadion, stadion, roda sepeda, spoked wheel, cincin tekan, cincin tarik, kabel baja, stuttgart, JIS, jakarta international stadium, space frame, rangka baja, teknik sipil, arsitektur, edukasi, audira explained, AUDIRA",
    ytpin="AUDIRA EXPLAINED #63 (playlist AUDIRA EXPLAINED). Catatan: JIS tidak memakai sistem roda sepeda; atapnya rangka baja ruang. Contoh roda sepeda yang terverifikasi: Stuttgart, Maracanã, Warsawa.",
    thumb="Atap stadion oval dari atas dengan kabel baja memancar seperti jari-jari sepeda dari cincin tengah ke cincin luar, membran putih, teks: ATAP SEPERTI RODA SEPEDA",
    fb="Atap stadion ini menaungi tribun keliling tanpa satu pun tiang di depan penonton. Tiangnya tetap ada, tapi hanya di tepi luar. Di stadion Stuttgart, Jerman, atapnya dibentuk seperti roda sepeda: cincin tarik di tengah, cincin tekan baja di tepi luar, dan 40 rangka kabel seperti jari-jari. Kabel hanya kuat saat ditarik, cincin luar menahan dorongan, jadi atap seberat ribuan ton seimbang sendiri. JIS di Jakarta memakai cara lain: rangka baja 3.900 ton diangkat dari 16 titik.",
    fbq="Kamu lebih suka atap stadion terbuka di tengah atau yang bisa ditutup penuh?",
    x1="Atap stadion bisa melayang tanpa tiang di depan penonton karena bekerja seperti roda sepeda: cincin tarik di tengah, cincin tekan di luar, 40 rangka kabel di Stuttgart sebagai jari-jari. #Stadion #AUDIRA",
    thread=[
        "1/ Atap stadion menaungi tribun keliling tanpa satu pun tiang di depan penonton. Rahasianya mirip roda sepeda. #Stadion",
        "2/ Di stadion Stuttgart, cincin tarik di tengah dan cincin tekan baja di tepi luar dihubungkan 40 rangka kabel.",
        "3/ Kabel hanya kuat saat ditarik, cincin luar menahan dorongan. Tarikan dari semua sisi saling meniadakan, jadi atap seimbang sendiri.",
        "4/ JIS di Jakarta memakai cara lain: rangka baja ruang 3.900 ton, dirakit di bawah lalu diangkat dari 16 titik. #Arsitektur #AUDIRA",
    ],
    th=[
        "Atap stadion ini menaungi tribun keliling tanpa satu pun tiang di depan penonton. Rahasianya mirip roda sepeda. #Stadion",
        "Di stadion Stuttgart, cincin tarik di tengah dan cincin tekan baja di tepi luar dihubungkan 40 rangka kabel. Kabel hanya kuat saat ditarik, cincin luar menahan dorongan, dan tarikan dari semua sisi saling meniadakan.",
        "Atap JIS di Jakarta memakai cara lain: rangka baja ruang 3.900 ton yang dirakit di bawah lalu diangkat sekaligus dari 16 titik. Stadion mana yang atapnya paling bikin kamu kagum?",
    ],
)

D["ep064"] = dict(
    no=64, date="Senin, 7 Desember 2026", prev=f"AE-063 {TITLE['AE-063']} (Batch 7)",
    title="Bandara Ini Sudah Turun Hampir 14 Meter, Begini Cara Insinyur Mengendalikannya",
    hook="Landasan pacu harus rata, padahal tanah di bawahnya bisa selembek bubur. Bandara Kansai di Jepang sudah turun hampir empat belas meter sejak dibangun.",
    cover="BANDARA TURUN 14 METER",
    tags="#Bandara #TeknikSipil #CaraKerja #Kansai #AUDIRA",
    tt="Lempung lunak penuh air. Saat ditimbun, air terperas keluar dan tanah ambles, prosesnya bisa puluhan tahun. Insinyur mempercepatnya dengan ribuan drain vertikal dan timbunan berat. Di Kansai, 1 juta tiang pasir membuat penurunan lapisan atas selesai sekitar setahun. Tapi lempung yang jauh lebih dalam tetap turun.",
    pin="AUDIRA EXPLAINED #64. Sumber: Kansai Airports (Technologies for Offshore Airports 1, 3, 4), manual FHWA tentang drain vertikal (PVD). Angka 13,72 m dihitung sejak awal konstruksi (data Desember 2025). Visual adalah ilustrasi 3D.",
    points=[
        "Lempung lunak penuh air; saat ditimbun, air pelan-pelan terperas keluar dan tanah ambles, secara alami bisa puluhan tahun.",
        "Insinyur menusuk tanah dengan ribuan drain vertikal sebagai jalur keluar air yang pendek.",
        "Di atasnya ditimbun tanah yang lebih berat dari beban bandara nanti, dan pelat ukur mencatat setiap sentimeter penurunan.",
        "Di Kansai, 1 juta tiang pasir membuat penurunan lapisan atas selesai sekitar setahun, bukan puluhan tahun.",
        "Lempung yang jauh lebih dalam tidak bisa diperbaiki, jadi 900 kolom terminalnya diukur otomatis dan yang turun didongkrak lalu diganjal pelat baja.",
    ],
    ig="Bandara di atas tanah lunak tidak dibuat diam, tapi dikendalikan. Kamu pernah terbang lewat Kansai? Cerita di komentar.",
    audio="Dengarkan deru rig drain yang menusuk tanah, desis air yang terperas keluar, dan dongkrak hidrolik di bawah terminal.",
    alt=["Kenapa Bandara Kansai Terus Turun?", "Satu Juta Tiang Pasir di Bawah Bandara", "Cara Membangun Landasan di Tanah Selembek Bubur"],
    desc="Bagaimana bandara dibangun di atas lahan lunak? Lempung lunak penuh air, dan saat ditimbun air terperas keluar sehingga tanah ambles, secara alami bisa puluhan tahun. Insinyur mempercepatnya dengan ribuan drain vertikal dan timbunan yang lebih berat dari beban bandara nanti, sambil pelat ukur mencatat penurunan. Di Bandara Kansai, Jepang, 1 juta tiang pasir membuat penurunan lapisan atas selesai sekitar setahun. Lempung yang jauh lebih dalam tetap turun, kini kurang dari 10 cm setahun, jadi 900 kolom terminalnya dipantau dan didongkrak.",
    ytags="bandara, kansai, lahan lunak, tanah lunak, penurunan tanah, drain vertikal, PVD, tiang pasir, preloading, konsolidasi, landasan pacu, teknik sipil, geoteknik, edukasi, audira explained, AUDIRA",
    ytpin="AUDIRA EXPLAINED #64 (playlist AUDIRA EXPLAINED). Catatan: Kansai turun 13,72 m sejak awal konstruksi, 9,82 m di antaranya sebelum bandara buka pada 1994. Operator menyebut lajunya melambat dan terus dipantau.",
    thumb="Penampang tanah di bawah landasan pacu dengan ribuan drain vertikal putih menembus lempung abu-abu, pesawat di atas, teks: BANDARA TURUN 14 METER",
    fb="Landasan pacu harus rata, padahal tanah di bawahnya bisa selembek bubur. Bandara Kansai di Jepang sudah turun hampir 14 meter sejak dibangun. Insinyur tidak bisa menghentikan penurunan, tapi bisa mempercepatnya: tanah ditusuk ribuan drain vertikal, lalu ditimbun tanah yang lebih berat dari beban bandara. Di Kansai, 1 juta tiang pasir membuat penurunan lapisan atas selesai sekitar setahun. Lempung yang jauh lebih dalam tetap turun, kini kurang dari 10 cm setahun.",
    fbq="Menurutmu, lebih baik bangun bandara di laut atau di darat yang jauh dari kota?",
    x1="Bandara Kansai sudah turun 13,72 m sejak awal konstruksi. Di bawahnya ada 1 juta tiang pasir, dan 900 kolom terminalnya diukur otomatis lalu didongkrak bila turun. #Bandara #AUDIRA",
    thread=[
        "1/ Landasan pacu harus rata, padahal tanah di bawahnya bisa selembek bubur. Kansai di Jepang sudah turun hampir 14 m. #Bandara",
        "2/ Lempung lunak penuh air. Saat ditimbun, air terperas keluar dan tanah ambles. Secara alami bisa puluhan tahun.",
        "3/ Insinyur menusuk tanah dengan ribuan drain vertikal lalu menimbun beban berat. Di Kansai, 1 juta tiang pasir membuat lapisan atas selesai turun sekitar setahun.",
        "4/ Lempung yang jauh lebih dalam tetap turun, kini <10 cm/tahun. 900 kolom terminal diukur otomatis dan didongkrak. #TeknikSipil #AUDIRA",
    ],
    th=[
        "Landasan pacu harus rata, padahal tanah di bawahnya bisa selembek bubur. Bandara Kansai di Jepang sudah turun hampir 14 meter sejak dibangun. #Bandara",
        "Insinyur mempercepat penurunan: tanah ditusuk ribuan drain vertikal, lalu ditimbun tanah yang lebih berat dari beban bandara nanti. Di Kansai, 1 juta tiang pasir membuat penurunan lapisan atas selesai sekitar setahun.",
        "Lempung yang jauh lebih dalam tidak bisa diperbaiki, jadi bandaranya masih turun. Sembilan ratus kolom terminalnya diukur otomatis dan yang turun didongkrak lalu diganjal pelat baja.",
    ],
)

D["ep067"] = dict(
    no=67, date="Selasa, 8 Desember 2026", prev=f"AE-064 {TITLE['AE-064']} (Batch 7)",
    title="Separuh Air Minum New York Lewat Satu Terowongan 137 Km, Tanpa Pompa",
    hook="Sekitar separuh air minum kota New York mengalir lewat satu terowongan sepanjang seratus tiga puluh tujuh kilometer.",
    cover="AIR MENGALIR 137 KM",
    tags="#Terowongan #AirBersih #CaraKerja #Gravitasi #AUDIRA",
    tt="Sekitar separuh air minum New York lewat Delaware Aqueduct, terowongan 137 km yang dibangun 1939–1945. Kuncinya beda ketinggian: waduk di pegunungan lebih tinggi dari kota, jadi air mengalir turun. 97% air New York sampai ke keran hanya dengan gravitasi. Tapi beton tetap bisa retak.",
    pin="AUDIRA EXPLAINED #67. Sumber: NYC Department of Environmental Protection (sistem air New York), Wikipedia EN Delaware Aqueduct, detikFinance dan Kementerian PUPR untuk Sodetan Ciliwung. Visual adalah ilustrasi 3D.",
    points=[
        "Delaware Aqueduct sepanjang 137 km, dibangun 1939–1945, membawa sekitar separuh air minum New York dari waduk di pegunungan.",
        "Waduk berada lebih tinggi dari kota, jadi air terus mengalir turun tanpa pompa.",
        "Kalau terowongan terisi penuh, air bisa naik lagi, asal ujungnya tetap lebih rendah dari permukaan waduk.",
        "97% air New York sampai ke keran hanya dengan gravitasi, tapi terowongannya pernah bocor sampai 136 juta liter sehari.",
        "Di Indonesia, Sodetan Ciliwung mengalirkan sekitar 60 m³ air banjir per detik ke Kanal Banjir Timur.",
    ],
    ig="Air cukup turun, terowongan yang menunjukkan jalannya. Menurutmu, air di rumahmu datang dari mana? Tulis di komentar.",
    audio="Dengarkan gemuruh air di dalam terowongan beton, tetes rembesan, dan aliran deras di pintu air.",
    alt=["Kenapa Air New York Tidak Perlu Dipompa?", "Terowongan Air 137 Km yang Pernah Bocor", "Cara Air Mengalir Antarwilayah Lewat Terowongan"],
    desc="Bagaimana terowongan air membawa air antarwilayah? Sekitar separuh air minum New York mengalir lewat Delaware Aqueduct, terowongan 137 km yang dibangun 1939–1945. Kuncinya beda ketinggian: waduk di pegunungan lebih tinggi dari kota, jadi air terus mengalir turun, bahkan bisa naik lagi bila terowongan penuh. Dindingnya dilapisi beton, tapi tetap bisa retak: kebocorannya sampai 136 juta liter sehari. Di Indonesia, Sodetan Ciliwung memindahkan sekitar 60 m³ air banjir per detik ke Kanal Banjir Timur.",
    ytags="terowongan air, delaware aqueduct, new york, air minum, gravitasi, waduk, aqueduct, sodetan ciliwung, kanal banjir timur, banjir jakarta, infrastruktur air, teknik sipil, edukasi, audira explained, AUDIRA",
    ytpin="AUDIRA EXPLAINED #67 (playlist AUDIRA EXPLAINED). Catatan: tidak semua terowongan air bekerja tanpa pompa; 3% air New York tetap dipompa. Angka 136 juta liter = 36 juta galon per hari.",
    thumb="Terowongan beton bundar penuh air biru menembus pegunungan menuju kota di kejauhan, waduk di atas, teks: AIR MENGALIR 137 KM",
    fb="Sekitar separuh air minum kota New York mengalir lewat satu terowongan sepanjang 137 km, dibangun 1939–1945. Kuncinya beda ketinggian: waduk di pegunungan lebih tinggi dari kota, jadi air terus mengalir turun. Hasilnya, 97% air New York sampai ke keran hanya dengan gravitasi. Tapi beton tetap bisa retak: terowongan ini bocor sampai 136 juta liter sehari, sampai dibuatkan jalur pintas di bawah Sungai Hudson. Di Indonesia, Sodetan Ciliwung memindahkan air banjir.",
    fbq="Menurutmu, Jakarta perlu lebih banyak terowongan air atau waduk?",
    x1="97% air New York sampai ke keran hanya dengan gravitasi. Separuhnya lewat satu terowongan 137 km dari waduk di pegunungan, yang pernah bocor 136 juta liter sehari. #Terowongan #AUDIRA",
    thread=[
        "1/ Sekitar separuh air minum New York mengalir lewat satu terowongan sepanjang 137 km: Delaware Aqueduct, dibangun 1939–1945. #Terowongan",
        "2/ Kuncinya beda ketinggian. Waduk di pegunungan lebih tinggi dari kota, jadi air terus mengalir turun.",
        "3/ 97% air New York sampai ke keran hanya dengan gravitasi. Tapi beton bisa retak: bocornya sampai 136 juta liter sehari.",
        "4/ Di Indonesia, Sodetan Ciliwung mengalirkan sekitar 60 m³ air banjir per detik ke Kanal Banjir Timur. #AirBersih #AUDIRA",
    ],
    th=[
        "Sekitar separuh air minum kota New York mengalir lewat satu terowongan sepanjang 137 km. Namanya Delaware Aqueduct. #Terowongan",
        "Kuncinya beda ketinggian. Waduk di pegunungan lebih tinggi dari kota, jadi air terus mengalir turun. Hasilnya, 97% air New York sampai ke keran hanya dengan gravitasi. Tapi beton tetap bisa retak, dan bocornya sampai 136 juta liter sehari.",
        "Di Indonesia, terowongan juga memindahkan air banjir. Sodetan Ciliwung mengalirkan sekitar 60 meter kubik per detik ke Kanal Banjir Timur. Air di rumahmu datang dari mana?",
    ],
)

D["ep068"] = dict(
    no=68, date="Rabu, 9 Desember 2026", prev=f"AE-067 {TITLE['AE-067']} (Batch 7)",
    title="Pipa Hampir 2 Meter Lewat di Bawah Jalan Tanpa Bongkar Aspal, Begini Caranya",
    hook="Pipa selebar hampir dua meter ini lewat di bawah jalan raya, tanpa aspalnya dibongkar.",
    cover="PIPA MERAYAP DI BAWAH JALAN",
    tags="#PipeJacking #Jakarta #CaraKerja #TeknikSipil #AUDIRA",
    tt="Teknik pipe jacking: di depan, mesin bor bulat mengikis tanah; di lubang dorong, dongkrak hidrolik mendorong pipa beton satu potong demi satu potong, dan laser menjaga arahnya. Di Jalan DI Panjaitan, Jakarta Timur, tiap potong pipa 2,43 m dan 189 potong didorong bergiliran.",
    pin="AUDIRA EXPLAINED #68. Sumber: Beritajakarta.id (jacking Jalan DI Panjaitan), detikNews dan PAM Jaya (microtunneling), Top Konstruksi dan detikFinance (Sodetan Ciliwung), Pipe Jacking Association. Visual adalah ilustrasi 3D.",
    points=[
        "Di Jalan DI Panjaitan, Jakarta Timur, beberapa lubang galian yang tampak diam ternyata pintu masuk dan keluar pipa.",
        "Pipe jacking: mesin bor bulat di depan mengikis tanah, dongkrak hidrolik di lubang dorong mendorong pipa beton di belakangnya.",
        "Laser menjaga arah mesin agar tetap lurus menuju lubang terima.",
        "Di proyek itu, tiap potong pipa panjangnya 2,43 m dan 189 potong didorong bergiliran; di Sodetan Ciliwung, pipa selebar 4 m didorong 590 m.",
        "Cara lain: pengeboran horizontal terarah (HDD), lubang kecil dibor miring, diperbesar, lalu pipanya ditarik pulang.",
    ],
    ig="Di atas lalu lintas jalan terus, di bawah pipa merayap pelan. Kamu pernah lihat lubang galian yang lama tidak ditutup di dekat rumah? Cerita di komentar.",
    audio="Dengarkan desis dongkrak hidrolik, gerinda mesin bor di bawah tanah, dan klakson lalu lintas di atasnya.",
    alt=["Kenapa Lubang Galian Ini Tampak Diam?", "Cara Mendorong Pipa Raksasa di Bawah Jalan", "189 Potong Pipa di Bawah Jakarta Timur"],
    desc="Bagaimana pipa raksasa dipasang di bawah jalan tanpa membongkar aspal? Teknik pipe jacking memakai dua lubang: lubang dorong dan lubang terima. Di depan, mesin bor bulat mengikis tanah; di lubang dorong, dongkrak hidrolik mendorong pipa beton satu potong demi satu potong, dan laser menjaga arahnya. Di Jalan DI Panjaitan, Jakarta Timur, pipa hampir 2 m dipasang dari 189 potong sepanjang 2,43 m. Di Sodetan Ciliwung, pipa selebar 4 m didorong 590 m. Ada juga HDD, yang menarik pipa pulang lewat lubang bor miring.",
    ytags="pipe jacking, microtunneling, pipa bawah tanah, galian tanpa bongkar jalan, trenchless, HDD, pengeboran horizontal, dongkrak hidrolik, jalan DI panjaitan, sodetan ciliwung, jakarta, teknik sipil, edukasi, audira explained, AUDIRA",
    ytpin="AUDIRA EXPLAINED #68 (playlist AUDIRA EXPLAINED). Catatan: diameter luar pipa Sodetan Ciliwung 4,05 m (disebut 4 m di video). Pipe jacking tetap butuh dua lubang, jadi bukan tanpa galian sama sekali.",
    thumb="Penampang jalan kota: di atas mobil lewat, di bawah pipa beton bulat didorong dongkrak hidrolik kuning dari lubang dorong, sinar laser merah di dalam pipa, teks: PIPA MERAYAP DI BAWAH JALAN",
    fb="Pipa selebar hampir 2 meter ini lewat di bawah jalan raya, tanpa aspalnya dibongkar. Di Jalan DI Panjaitan, Jakarta Timur, dari atas hanya terlihat beberapa lubang galian yang tampak diam. Padahal itu pintu masuk dan keluar pipa. Di bawah, mesin bor bulat mengikis tanah, dan dongkrak hidrolik mendorong pipa beton satu potong demi satu potong: 189 potong, tiap potong 2,43 m. Laser menjaga arahnya tetap lurus. Di Sodetan Ciliwung, pipa selebar 4 m didorong 590 m.",
    fbq="Pernah lihat lubang galian proyek yang lama tidak ditutup di dekat rumahmu? Ternyata mungkin itu pintu pipa.",
    x1="Pipa hampir 2 m di bawah Jalan DI Panjaitan, Jakarta Timur, dipasang tanpa bongkar aspal: 189 potong pipa beton @2,43 m didorong dongkrak hidrolik, arahnya dijaga laser. #PipeJacking #AUDIRA",
    thread=[
        "1/ Pipa selebar hampir 2 m bisa lewat di bawah jalan raya tanpa aspalnya dibongkar. Namanya pipe jacking. #PipeJacking",
        "2/ Di depan, mesin bor bulat mengikis tanah. Di lubang dorong, dongkrak hidrolik mendorong pipa beton satu potong demi satu potong.",
        "3/ Laser menjaga arah tetap lurus. Di Jalan DI Panjaitan, 189 potong pipa sepanjang 2,43 m didorong bergiliran.",
        "4/ Di Sodetan Ciliwung, pipa selebar 4 m didorong 590 m. Ada juga HDD: lubang dibor miring, lalu pipa ditarik pulang. #Jakarta #AUDIRA",
    ],
    th=[
        "Pipa selebar hampir dua meter ini lewat di bawah jalan raya, tanpa aspalnya dibongkar. Lubang galian yang tampak diam itu ternyata pintu pipa. #PipeJacking",
        "Di depan, mesin bor bulat mengikis tanah. Di lubang dorong, dongkrak hidrolik mendorong pipa beton satu potong demi satu potong, dan laser menjaga arahnya. Di Jalan DI Panjaitan, 189 potong pipa sepanjang 2,43 m didorong bergiliran.",
        "Di Sodetan Ciliwung, pipa selebar empat meter didorong sejauh 590 meter. Di atas lalu lintas jalan terus, di bawah pipa merayap pelan.",
    ],
)

json.dump(D, open("_tools/captions_data.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
for k, e in D.items():
    print(k, "x1", len(e["x1"]), "thread", [len(t) for t in e["thread"]], "th", [len(t) for t in e["th"]], "ytags", len(e["ytags"]), "title", len(e["title"]))
