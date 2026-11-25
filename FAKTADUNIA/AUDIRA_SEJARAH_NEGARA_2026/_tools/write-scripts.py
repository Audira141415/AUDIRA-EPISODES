"""Writes each episode's script-lines.json. Markup {display|spoken}: display goes on screen and in subtitles, spoken goes to Cartesia.
Every fact here is listed in the episode's SOURCE_REGISTER.md. Run from AUDIRA_SEJARAH_NEGARA_2026: python _tools/write-scripts.py"""
import json, re
from pathlib import Path

S = {
    "EP01_ZANZIBAR_38_MENIT": [
        "Ada perang yang selesai sebelum kopimu dingin. Kira-kira {38|tiga puluh delapan} menit.",
        "Ini Zanzibar, pulau di lepas pantai Afrika Timur, sekarang bagian dari Tanzania. Sejak {1890,|delapan belas sembilan puluh,} Zanzibar jadi protektorat Inggris. Artinya, setiap sultan baru butuh restu Inggris.",
        "{25|Dua puluh lima} Agustus {1896,|delapan belas sembilan puluh enam,} Sultan Hamad wafat mendadak. Hari itu juga, Khalid bin Barghash, umur {29|dua puluh sembilan} tahun, masuk ke istana tanpa restu Inggris.",
        "Sekitar {2.800|dua ribu delapan ratus} orang berjaga di istana. Di pelabuhan, lima kapal perang Inggris membidik. Ultimatumnya jelas: turunkan bendera dan tinggalkan istana sebelum jam sembilan pagi.",
        "Jam sembilan lewat dua menit, meriam kapal menembak. Istana yang sebagian besar dari kayu itu terbakar. Kapal kebanggaan sultan, {HHS|Ha Ha Es} Glasgow, ditenggelamkan.",
        "Bendera istana ditembak jatuh, dan tembakan berhenti. Tergantung cara menghitung, perang ini berlangsung {38|tiga puluh delapan} sampai {45|empat puluh lima} menit. Korban di pihak sultan sekitar lima ratus orang, termasuk warga sipil. Di pihak Inggris, satu pelaut terluka.",
        "Khalid kabur ke konsulat Jerman, lalu ke daratan Afrika. Inggris mengangkat sultan pilihannya sendiri, dan Zanzibar tidak lagi benar-benar berdaulat.",
        "Jadi perang tersingkat dalam sejarah ini bukan lelucon. Ia memperlihatkan betapa timpangnya kekuatan di zaman kolonial. Menurut kamu, apa yang membuat Khalid tetap bertahan?",
    ],
    "EP02_PERANG_EMU_AUSTRALIA": [
        "Tahun {1932,|sembilan belas tiga puluh dua,} tentara Australia berperang melawan burung. Dan bisa dibilang, burungnya yang menang.",
        "Setelah Perang Dunia Pertama, para veteran diberi lahan pertanian di Australia Barat. Lalu datang Depresi Besar, dan harga gandum terus jatuh.",
        "Kemudian sekitar dua puluh ribu emu bermigrasi ke ladang mereka. Tanaman dimakan, pagar dirusak, dan kelinci ikut masuk lewat lubangnya.",
        "Para veteran minta senapan mesin. Menteri Pertahanan, George Pearce, setuju. Mayor Meredith berangkat dengan dua senapan Lewis dan sepuluh ribu butir peluru.",
        "Dua November, operasi dimulai. Tapi emu berpencar jadi kelompok kecil. Saat seribu lebih emu mendekat, senapannya macet setelah dua belas ekor. Senapan dipasang di truk, tapi truknya kalah cepat.",
        "Beritanya memalukan, dan pasukan ditarik. Lalu dikirim lagi. Sampai sepuluh Desember, Meredith mengklaim {986|sembilan ratus delapan puluh enam} emu tewas dengan {9.860|sembilan ribu delapan ratus enam puluh} peluru. Tepat sepuluh peluru per ekor, dan angka itu pun diragukan sejarawan.",
        "Meredith sendiri bilang, emu menghadapi senapan mesin seperti tank. Permintaan bantuan militer berikutnya ditolak. Petani beralih ke pagar.",
        "Pelajarannya, masalah alam jarang selesai dengan senjata. Kalau kamu petani saat itu, kamu pilih pagar, atau tetap minta tentara?",
    ],
    "EP03_DAGEN_H_SWEDIA": [
        "Jam lima pagi, satu negara pindah jalur. Semua kendaraan, serentak, dari kiri ke kanan.",
        "Ini Swedia. Selama puluhan tahun mereka menyetir di kiri, padahal tetangga daratnya, Norwegia dan Finlandia, di kanan. Lebih dari {90|sembilan puluh} persen mobilnya pun bersetir kiri.",
        "Rakyatnya menolak. Referendum {1955:|sembilan belas lima puluh lima:} {83|delapan puluh tiga} persen pilih tetap di kiri. Tapi mobil melonjak dari setengah juta jadi satu setengah juta. Tahun {1963,|sembilan belas enam puluh tiga,} parlemen tetap memutuskan pindah.",
        "Persiapannya empat tahun. Sekitar {350.000|tiga ratus lima puluh ribu} rambu diganti. Di tiap persimpangan, lampu baru dipasang dan dibungkus plastik hitam. Marka baru dicat, lalu ditutup selotip.",
        "Minggu, tiga September {1967.|sembilan belas enam puluh tujuh.} Hari itu disebut {Dagen H.|Dagen Ho.} Jam {04.50,|empat lewat lima puluh,} semua kendaraan berhenti, pindah ke kanan, lalu berhenti lagi. Jam lima tepat, jalan kembali.",
        "Hasilnya? Hari itu tercatat {157|seratus lima puluh tujuh} kecelakaan kecil. Senin berikutnya, {125,|seratus dua puluh lima,} lebih sedikit dari Senin-Senin sebelumnya. Orang jadi ekstra hati-hati.",
        "Tapi efek waspada itu tidak bertahan. Tahun {1969,|sembilan belas enam puluh sembilan,} angka kecelakaan kembali seperti semula. Dan kereta api Swedia sampai sekarang tetap berjalan di kiri.",
        "Satu negara bisa mengubah kebiasaan jutaan orang dalam satu pagi, asal persiapannya matang. Menurut kamu, kalau Indonesia pindah ke kanan, kita siap?",
    ],
    "EP04_ALASKA_DIJUAL_RUSIA": [
        "Rusia pernah menjual wilayah seluas satu setengah juta kilometer persegi. Harganya? Sekitar dua sen dolar per acre.",
        "Abad ke-{19,|sembilan belas,} Rusia menguasai Alaska lewat pos dagang bulu. Tapi berang-berang laut hampir habis diburu, dan Rusia baru kalah di Perang Krimea.",
        "Masalah terbesarnya, Alaska sulit dipertahankan. Kalau perang lagi, Inggris dari Kanada bisa merebutnya. Daripada jatuh ke musuh, lebih baik dijual ke Amerika.",
        "Negosiasinya semalam suntuk. Jam empat pagi, {30|tiga puluh} Maret {1867,|delapan belas enam puluh tujuh,} Menteri Luar Negeri Amerika, William Seward, dan diplomat Rusia, Eduard de Stoeckl, menandatangani perjanjian. Harganya {7,2|tujuh koma dua} juta dolar.",
        "Senat menyetujui, {37|tiga puluh tujuh} lawan dua. Ada yang mengejek, {Seward's Folly,|Siwerds Foli,} kebodohan Seward. Tapi penelusuran puluhan koran menunjukkan, sebagian besar justru mendukung.",
        "{18|Delapan belas} Oktober, di Sitka, bendera Rusia diturunkan. Menurut catatan seorang saksi, benderanya tersangkut di tiang, dan baru tentara ketiga yang berhasil menurunkannya.",
        "Alaska juga ganti kalender. Rusia memakai kalender Julian, dua belas hari tertinggal. Setelah serah terima, Alaska memakai kalender Gregorian. Tahun {1959,|sembilan belas lima puluh sembilan,} Alaska resmi menjadi negara bagian.",
        "Dua sen per acre, untuk negara bagian terluas di Amerika hari ini. Menurut kamu, Rusia rugi besar, atau keputusannya masuk akal saat itu?",
    ],
    "EP05_BOLIVIA_ANGKATAN_LAUT": [
        "Negara ini tidak punya laut. Tapi punya angkatan laut, dengan sekitar lima ribu personel.",
        "Ini Bolivia. Saat merdeka tahun {1825,|delapan belas dua puluh lima,} Bolivia mengklaim pantai di Samudra Pasifik, lewat Gurun Atacama.",
        "Tahun {1879,|delapan belas tujuh puluh sembilan,} sengketa pajak dan sumber daya memicu Perang Pasifik. Bolivia dan Peru melawan Chile. Chile menang, dan seluruh pantai Bolivia lepas.",
        "Perjanjian {1904|sembilan belas nol empat} mengesahkannya. Sebagai gantinya, Chile membangun rel kereta dari Arica ke La Paz, dan Bolivia boleh berdagang lewat pelabuhan Chile.",
        "Tapi Bolivia tidak pernah melupakan lautnya. Tahun {1963,|sembilan belas enam puluh tiga,} mereka membentuk pasukan sungai dan danau. Kini angkatan lautnya berpatroli di sungai-sungai Amazon dan di Danau Titicaca, {3.812|tiga ribu delapan ratus dua belas} meter di atas permukaan laut.",
        "Setiap {23|dua puluh tiga} Maret, Bolivia memperingati {Día|Dia} del Mar, Hari Laut. Angkatan lautnya berparade, dan tuntutan akses ke laut diulang lagi.",
        "Tahun {2013,|dua ribu tiga belas,} Bolivia menggugat Chile ke Mahkamah Internasional. Satu Oktober {2018,|dua ribu delapan belas,} putusannya keluar: Chile tidak wajib berunding.",
        "Lautnya lepas hampir {150|seratus lima puluh} tahun lalu, tapi angkatan lautnya tetap berlayar, menjaga harapan. Menurut kamu, ini keras kepala, atau kesetiaan pada sejarah?",
    ],
    "EP06_SAMOA_HAPUS_SATU_HARI": [
        "Di negara ini, hari Jumat, tiga puluh Desember {2011,|dua ribu sebelas,} tidak pernah ada.",
        "Ini Samoa, di Pasifik Selatan, tepat di samping garis tanggal internasional. Garis khayal inilah yang menentukan di mana hari berganti.",
        "Tahun {1892,|delapan belas sembilan puluh dua,} para pedagang Amerika membujuk Raja {Mālietoa|Malietoa} Laupepa supaya Samoa memakai tanggal Amerika. Caranya unik: hari Senin, empat Juli, diulang dua kali. Hari itu bertepatan dengan hari kemerdekaan Amerika.",
        "Seratus tahun lebih kemudian, dunia berubah. Mitra dagang terbesar Samoa kini Australia dan Selandia Baru, yang hidup sehari lebih dulu. Tertinggal {21|dua puluh satu} jam, hari kerja yang sama tinggal empat dalam seminggu.",
        "Maka Perdana Menteri Tuilaepa Sailele Malielegaoi memutuskan pindah. Kamis, {29|dua puluh sembilan} Desember {2011,|dua ribu sebelas,} tepat tengah malam, Samoa langsung melompat ke Sabtu, {31|tiga puluh satu} Desember.",
        "Hari Jumat hilang dari kalender. Zona waktunya berubah dari {UTC|U Te Se} minus sebelas menjadi {UTC|U Te Se} plus tiga belas. Tokelau, wilayah Selandia Baru di utaranya, ikut melompat.",
        "Hasilnya unik. Samoa dan tetangganya, Samoa Amerika, hanya dipisahkan laut sempit, tapi tanggalnya beda satu hari. Natal di Samoa datang sehari lebih dulu. Kini Samoa termasuk tempat pertama di Bumi yang menyambut hari baru.",
        "Satu negara pernah mengulang sehari, lalu menghapus sehari, demi dagang. Kalau kamu bisa memilih, hari apa yang ingin kamu hapus?",
    ],
    "EP07_LIECHTENSTEIN_80_JADI_81": [
        "Delapan puluh tentara berangkat perang. Yang pulang, konon, delapan puluh satu.",
        "Ini Liechtenstein, negara kecil di Pegunungan Alpen, di antara Swiss dan Austria. Tahun {1866,|delapan belas enam puluh enam,} pecah Perang Austria-Prusia.",
        "Pangeran Johann Kedua menyerahkan pasukannya ke Konfederasi Jerman, dengan syarat: hanya untuk menjaga Tirol, dan tidak melawan sesama orang Jerman. Parlemennya tidak diajak bicara, dan perang ini tidak populer.",
        "Pasukan dipimpin Peter Rheinberger. Mereka berjaga di celah gunung {Stilfser Joch,|Stilfser Yokh,} mengawasi kemungkinan serangan pasukan Italia di bawah Garibaldi. Dua orang tinggal menjaga Kastil Vaduz.",
        "Tak ada pertempuran besar bagi mereka. Perang berakhir {22|dua puluh dua} Juli, dan pasukan pulang ke Vaduz disambut upacara.",
        "Di sinilah legendanya lahir. Delapan puluh berangkat, delapan puluh satu pulang. Siapa orang tambahan itu? Ada yang bilang perwira penghubung Austria. Ada juga yang bilang petani Italia. Sejarawan menyebutnya legenda populer.",
        "Yang pasti, dua belas Februari {1868,|delapan belas enam puluh delapan,} Liechtenstein membubarkan tentaranya dan menyatakan netral permanen. Sampai hari ini, negara ini tidak punya tentara tetap.",
        "Perang tanpa pertempuran, tentara yang konon malah bertambah, lalu dibubarkan. Menurut kamu, negara tanpa tentara itu berani, atau naif?",
    ],
    "EP08_PULAU_HANS_PERANG_WISKI": [
        "Dua negara berebut satu pulau selama hampir lima puluh tahun. Senjatanya? Bendera, dan sebotol minuman.",
        "Ini Pulau Hans, batu gundul tak berpenghuni di Selat Nares, antara Kanada dan Greenland. Luasnya cuma {1,3|satu koma tiga} kilometer persegi. Selatnya hanya {35|tiga puluh lima} kilometer, jadi pulau ini masuk perairan kedua negara.",
        "Tahun {1973,|sembilan belas tujuh puluh tiga,} Kanada dan Denmark menyepakati batas laut di kawasan itu. Tapi soal Pulau Hans, keduanya sama-sama mengklaim, dan tidak ada titik temu.",
        "Tahun {1984,|sembilan belas delapan puluh empat,} menteri Denmark urusan Greenland mendarat, menancapkan bendera Denmark, dan meninggalkan pesan: selamat datang di pulau Denmark. Konon, juga sebotol minuman keras Denmark.",
        "Kanada membalas dengan benderanya sendiri dan sebotol wiski Canadian Club. Begitu terus, bergantian. Media menjulukinya Perang Wiski, sengketa paling ramah di dunia. Tahun {2005,|dua ribu lima,} perangnya bahkan pindah ke iklan Google.",
        "Akhirnya, empat belas Juni {2022,|dua ribu dua puluh dua,} setelah {17|tujuh belas} tahun negosiasi, Kanada, Denmark, dan Greenland menandatangani pembagian pulau, kira-kira separuh-separuh, mengikuti retakan alami di permukaannya.",
        "Lahirlah perbatasan darat sepanjang {1.280|seribu dua ratus delapan puluh} meter. Kanada dan Denmark kini bertetangga di darat, dan ini perbatasan darat antarnegara paling utara di dunia.",
        "Perang yang berakhir tanpa pecundang. Menurut kamu, sengketa perbatasan lain bisa diselesaikan sesantai ini?",
    ],
    "EP09_ONODA_29_TAHUN": [
        "Perang Dunia Kedua berakhir tahun {1945.|sembilan belas empat puluh lima.} Tapi satu tentara Jepang terus bertempur di hutan Filipina, sampai {1974.|sembilan belas tujuh puluh empat.}",
        "Namanya Hiroo Onoda, letnan dua. Akhir {1944,|sembilan belas empat puluh empat,} ia dikirim ke Pulau Lubang, Filipina, untuk bergerilya. Perintahnya tegas: jangan menyerah, dan jangan bunuh diri.",
        "Februari {1945,|sembilan belas empat puluh lima,} pasukan Amerika dan Filipina merebut pulau itu. Onoda dan tiga anak buahnya lari ke pegunungan.",
        "Oktober tahun itu, mereka menemukan selebaran: perang sudah berakhir {15|lima belas} Agustus. Mereka menganggapnya propaganda musuh. Surat keluarga dari udara pun dianggap tipuan.",
        "Satu anak buahnya menyerah tahun {1950.|sembilan belas lima puluh.} Dua lainnya tewas dalam baku tembak, tahun {1954|sembilan belas lima puluh empat} dan {1972.|sembilan belas tujuh puluh dua.} Selama itu, mereka menyerang warga. Onoda diduga membunuh hingga {30|tiga puluh} orang di pulau itu.",
        "Februari {1974,|sembilan belas tujuh puluh empat,} petualang Jepang, Norio Suzuki, menemukannya. Onoda menolak menyerah tanpa perintah komandan. Maka mantan atasannya, Mayor Yoshimi Taniguchi, yang sudah jadi penjual buku, terbang ke Lubang dan membacakan perintah.",
        "Sepuluh Maret, Onoda menyerah. Presiden Marcos memberinya pengampunan. Di Jepang ia disambut bak pahlawan, meski sejarawan meragukan ia benar-benar tidak tahu perang sudah usai. Ia punya radio transistor.",
        "Hampir {29|dua puluh sembilan} tahun. Dan ada yang lebih lama: Prajurit Teruo Nakamura, ditangkap akhir tahun itu di Indonesia. Menurut kamu, Onoda setia, atau keras kepala yang memakan korban?",
    ],
    "EP10_VATIKAN_GARDA_SWISS": [
        "Tentara terkecil di dunia hanya berisi sekitar {135|seratus tiga puluh lima} orang. Dan semuanya orang Swiss.",
        "Ini Garda Swiss Kepausan, penjaga Paus di Vatikan, negara terkecil di dunia. Kisahnya dimulai lebih dari lima ratus tahun lalu.",
        "Paus Julius Kedua meminta pasukan tetap dari Swiss, yang terkenal sebagai tentara bayaran tangguh. {150|Seratus lima puluh} prajurit berjalan kaki ke Roma, dan tiba {22|dua puluh dua} Januari {1506.|lima belas nol enam.} Tanggal itu menjadi hari lahir mereka.",
        "Ujian terbesar datang enam Mei {1527,|lima belas dua puluh tujuh,} saat Penjarahan Roma. Pasukan Kaisar Karl Kelima menyerbu kota.",
        "Dari {189|seratus delapan puluh sembilan} pengawal, {147|seratus empat puluh tujuh} gugur di dekat Basilika Santo Petrus. Sisanya, {42|empat puluh dua} orang, mengawal Paus Klemens Ketujuh kabur lewat lorong di atas tembok, Passetto di Borgo.",
        "Hingga kini, rekrutan baru disumpah setiap enam Mei. Syaratnya ketat: pria Katolik berkewarganegaraan Swiss, lajang, usia {19|sembilan belas} sampai {30,|tiga puluh,} tinggi minimal {174|seratus tujuh puluh empat} sentimeter, dan sudah lulus latihan militer Swiss.",
        "Seragam belang biru, merah, dan kuning itu sering disebut rancangan Michelangelo. Faktanya, desain yang dipakai sekarang dibuat komandan Jules Repond, dan diperkenalkan penuh tahun {1914.|sembilan belas empat belas.}",
        "Lima abad lebih, tugasnya tetap sama. Menurut kamu, kenapa Vatikan tetap memilih penjaga dari negara lain?",
    ],
    "EP11_PULAU_RUN_DITUKAR_MANHATTAN": [
        "Satu pulau kecil di Maluku pernah ditukar dengan Manhattan, pulau tempat kota New York berdiri sekarang.",
        "Ini Pulau Run, di Kepulauan Banda. Panjangnya cuma sekitar tiga kilometer. Tapi di {abad ke-17,|abad ke tujuh belas,} pulau ini penghasil pala, rempah yang harganya luar biasa mahal di Eropa.",
        "Tahun {1616,|enam belas enam belas,} warga Run memilih bersekutu dengan Inggris, karena takut pada Belanda. Kapten Nathaniel Courthope tiba dan membangun benteng.",
        "Kongsi dagang Belanda, {VOC,|Fe O Se,} mengepung pulau itu. Courthope dan pasukannya bertahan {1.540|seribu lima ratus empat puluh} hari, sampai ia tewas tahun {1620.|enam belas dua puluh.}",
        "Setelah Belanda menguasai Run, sejarah mencatat sisi kelamnya. Laki-laki dewasa dibunuh atau diperbudak, perempuan dan anak diusir, dan semua pohon pala ditebang, supaya Inggris tak bisa kembali.",
        "Sementara itu di Amerika, tahun {1664,|enam belas enam puluh empat,} Inggris merebut New Amsterdam milik Belanda di Pulau Manhattan, lalu menamainya New York.",
        "Tahun {1667,|enam belas enam puluh tujuh,} Perjanjian Breda mengesahkan keadaan itu. Inggris tetap memegang Manhattan, dan Run resmi dilepas untuk Belanda.",
        "Hari ini Manhattan jadi salah satu pusat dunia, dan pohon pala masih tumbuh di Run. Menurut kamu, siapa sebenarnya yang menang dalam pertukaran ini? Ikuti {AUDIRA|Audira} untuk fakta sejarah berikutnya.",
    ],
    "EP12_NAURU_KAYA_LALU_BANGKRUT": [
        "Negara ini pernah membuat warganya termasuk orang terkaya di dunia. Lalu banknya tutup, dan uang tunainya harus diterbangkan dari Australia.",
        "Ini Nauru, pulau karang di Pasifik, luasnya cuma {21|dua puluh satu} kilometer persegi. Negara terkecil ketiga di dunia.",
        "Tahun {1900,|sembilan belas ratus,} ditemukan fosfat di pulau ini, bahan pupuk yang sangat berharga. Sejak {1906,|sembilan belas nol enam,} fosfatnya ditambang dan dikapalkan, di bawah Jerman, lalu Australia, Inggris, dan Selandia Baru.",
        "Tahun {1968|sembilan belas enam puluh delapan} Nauru merdeka, dan dua tahun kemudian tambangnya dikelola sendiri. Uang mengalir deras. Warga Nauru termasuk yang terkaya di dunia.",
        "Tapi penambangan hampir seabad mengeruk sebagian besar bagian tengah pulau. Yang tersisa, tiang-tiang batu karang yang tak bisa ditanami.",
        "Cadangan utamanya habis tahun sembilan puluhan. Dana perwalian untuk masa depan tergerus belanja besar dan investasi yang buruk. Tahun {2006,|dua ribu enam,} Bank Nauru tutup.",
        "Kini pemasukan utamanya dari izin menangkap ikan dan pusat penahanan imigran yang dibiayai Australia. Tahun {2026,|dua ribu dua puluh enam,} nama resminya pun berganti menjadi Republik Naoero.",
        "Kaya dari tanah sendiri, lalu tanahnya habis. Menurut kamu, apa pelajaran Nauru untuk negara yang kaya sumber daya alam? Ikuti {AUDIRA|Audira} untuk fakta sejarah berikutnya.",
    ],
    "EP13_TURKI_GANTI_ALFABET": [
        "Dalam hitungan bulan, satu negara mengganti seluruh hurufnya. Koran, papan nama, sampai buku.",
        "Ini Turki. Selama lebih dari seribu tahun, bahasa Turki Utsmani ditulis dengan aksara Arab.",
        "Aksara itu kaya huruf mati, sedangkan bahasa Turki kaya huruf vokal, jadi banyak kata harus ditebak dari konteks. Usulan memakai huruf Latin sudah muncul sejak {abad ke-19,|abad ke sembilan belas,} dan ditentang keras kelompok konservatif dan agama.",
        "Tahun {1928,|sembilan belas dua puluh delapan,} Presiden Mustafa Kemal {Atatürk|Atatur} mengumumkan rencananya dan membentuk Komisi Bahasa. Hasilnya, alfabet Latin {29|dua puluh sembilan} huruf, dengan huruf khusus untuk bunyi Turki.",
        "Komisi mengusulkan masa transisi lima tahun. {Atatürk|Atatur} memangkasnya jadi tiga bulan, lalu berkeliling negeri memperkenalkan huruf baru.",
        "Satu November {1928,|sembilan belas dua puluh delapan,} undang-undangnya disahkan. Mulai satu Desember, koran, iklan, dan papan nama wajib memakai huruf baru. Mulai satu Januari {1929,|sembilan belas dua puluh sembilan,} semua komunikasi resmi dan buku juga.",
        "Aturannya ketat. Sampai tahun {2013,|dua ribu tiga belas,} huruf Latin yang tidak ada dalam alfabet Turki, seperti Q, W, dan X, dilarang di dokumen resmi dan papan nama.",
        "Satu keputusan mengubah cara sebuah bangsa menulis. Menurut kamu, kalau Indonesia harus ganti huruf, berapa lama kita butuh untuk terbiasa? Ikuti {AUDIRA|Audira} untuk fakta sejarah berikutnya.",
    ],
    "EP14_BRASILIA_41_BULAN": [
        "Sebuah ibu kota negara dibangun dari nol, hanya dalam empat puluh satu bulan.",
        "Ini Brasília, ibu kota Brasil. Sebelumnya ibu kota ada di Rio de Janeiro, di pesisir, tempat sebagian besar penduduk dan kekayaan menumpuk.",
        "Ide memindahkannya ke pedalaman sudah muncul tahun {1827.|delapan belas dua puluh tujuh.} Konstitusi {1891|delapan belas sembilan puluh satu} bahkan mewajibkan ibu kota pindah ke dataran tengah. Tapi selama puluhan tahun, tak kunjung dibangun.",
        "Lalu datang Juscelino Kubitschek, presiden sejak {1956.|sembilan belas lima puluh enam.} Janjinya: lima puluh tahun kemajuan dalam lima tahun. Ia langsung memulai ibu kota baru.",
        "Tahun {1957|sembilan belas lima puluh tujuh} digelar sayembara. Rancangan Lúcio Costa menang: kota berbentuk pesawat, dengan sumbu monumental sebagai badannya. Arsitek Oscar Niemeyer merancang gedung-gedung putihnya.",
        "Empat puluh satu bulan kemudian, {21|dua puluh satu} April {1960,|sembilan belas enam puluh,} Brasília diresmikan. Danau buatan Paranoá ikut dibangun, dan kampung para pekerja pertamanya kini tenggelam di dasar danau itu.",
        "Tahun {1987,|sembilan belas delapan puluh tujuh,} UNESCO menetapkannya sebagai Warisan Dunia. Kini Brasília berpenduduk sekitar {2,8|dua koma delapan} juta jiwa.",
        "Ibu kota baru di dataran tinggi pedalaman, dibangun secepat itu. Menurut kamu, pelajaran apa yang bisa diambil untuk ibu kota baru Indonesia? Ikuti {AUDIRA|Audira} untuk fakta sejarah berikutnya.",
    ],
    "EP15_PENGUIN_JENDERAL_NORWEGIA": [
        "Di Skotlandia, ada penguin berpangkat mayor jenderal. Dan ia juga bergelar ksatria.",
        "Namanya Sir Nils Olav, penguin raja di Kebun Binatang Edinburgh. Ia maskot sekaligus kolonel kehormatan Garda Raja Norwegia.",
        "Ceritanya bermula tahun {1961.|sembilan belas enam puluh satu.} Garda Raja Norwegia tampil di festival militer Edinburgh, dan seorang letnan bernama Nils Egelien tertarik pada koloni penguin di kebun binatang.",
        "Tahun {1972,|sembilan belas tujuh puluh dua,} saat kembali ke Edinburgh, resimen itu mengadopsi seekor penguin. Namanya Nils Olav, dari nama Nils Egelien dan komandan kontingen, Olav Siggerud. Pangkat pertamanya kopral muda.",
        "Setiap kali Garda Raja datang lagi, pangkatnya naik. Kopral, sersan, lalu sersan mayor resimen. Saat penguin pertama mati, penggantinya meneruskan nama dan pangkatnya.",
        "Tahun {2005,|dua ribu lima,} ia diangkat menjadi kolonel kehormatan. Tahun {2008,|dua ribu delapan,} dengan persetujuan Raja Harald Kelima, ia dianugerahi gelar ksatria, disaksikan {130|seratus tiga puluh} prajurit.",
        "Penguin ketiga meneruskan tradisinya: brigadir tahun {2016,|dua ribu enam belas,} dan mayor jenderal tahun {2023.|dua ribu dua puluh tiga.} Guinness mencatatnya sebagai penguin berpangkat tertinggi. Pangkatnya bahkan sempat melampaui Nils Egelien sendiri.",
        "Tradisi jenaka yang dijaga lebih dari lima puluh tahun. Menurut kamu, hewan apa yang pantas jadi maskot tentara Indonesia? Ikuti {AUDIRA|Audira} untuk fakta sejarah berikutnya.",
    ],
}
import sys, os
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "_research", "b4_scripts.py"), encoding="utf8").read())
S.update(B4)
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "_research", "b5_scripts.py"), encoding="utf8").read())
S.update(B5)
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "_research", "b6_scripts.py"), encoding="utf8").read())
S.update(B6)
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "_research", "b7_scripts.py"), encoding="utf8").read())
S.update(B7)
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "_research", "b8_scripts.py"), encoding="utf8").read())
S.update(B8)
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "_research", "b9_scripts.py"), encoding="utf8").read())
S.update(B9)
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "_research", "b10_scripts.py"), encoding="utf8").read())
S.update(B10)
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "_research", "b11_scripts.py"), encoding="utf8").read())
S.update(B11)
if len(sys.argv) > 1:
    S = {k: v for k, v in S.items() if k in sys.argv[1:]}
TOK = re.compile(r"\{([^|}]*)\|([^}]*)\}")
for ep, lines in S.items():
    d = Path(ep)
    (d / "AUDIO/work").mkdir(parents=True, exist_ok=True)
    (d / "SUBTITLES").mkdir(exist_ok=True)
    (d / "PROJECT/HyperFrames_Remotion/compositions").mkdir(parents=True, exist_ok=True)
    # Punctuation written after a token moves inside it, so it never becomes a word of its own.
    lines = [re.sub(r"\{([^|}]*)\|([^}]*)\}([.,:;?!])", r"{\1\3|\2\3}", t) for t in lines]
    out = [{"id": f"s{i+1}", "text": t} for i, t in enumerate(lines)]
    (d / "script-lines.json").write_text("[\n" + ",\n".join(json.dumps(x, ensure_ascii=False) for x in out) + "\n]\n", encoding="utf8")
    n = sum(len(TOK.sub(lambda m: m.group(2), t).split()) for t in lines)
    print(ep, "spoken words", n, "at 145 WPM =", round(n / 145 * 60, 1), "s")
