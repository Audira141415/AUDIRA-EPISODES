"""Writes <EP>/SOCIAL_CAPTIONS.md for a finished episode. Chapters come from the final timeline.json, so run it after the voiced render.
Run from AUDIRA_CARA_KERJA_VIRAL_2026: python _tools/captions.py <EP>"""
import json, sys
from pathlib import Path

C = {
    "EP01_ES_KERING_KABUT_ASAP": dict(
        title="Es Kering vs Kabut Asap",
        chap=["Hook", "Palembang, Oktober 2026", "Lapisan inversi", "Es kering = CO2 padat", "Penaburan", "Tutup melemah", "Hasil & catatan BRIN", "Penutup"],
        tags=["#EsKering", "#KabutAsap", "#Karhutla", "#CaraKerja", "#AudiraCaraKerja"],
        hook="Pesawat menabur es di atas kabut asap. Bukan untuk hujan.",
        cover="KENAPA ES DITABUR DI ATAS ASAP?",
        tiktok="Di musim kemarau ada lapisan udara hangat di ketinggian sekitar 1,5 sampai 2 km yang mengurung asap seperti tutup panci. Es kering (CO2 padat, minus 78,5 derajat) ditabur tepat di lapisan itu. Saat berubah langsung jadi gas, es kering menyerap panas, jadi tutupnya diharapkan melemah dan asap bisa naik lalu menyebar.",
        pin="Sumber: BMKG, BNPB, dan BRIN via Kompas, detik, InfoPublik (Oktober 2026). Catatan: BRIN menyebut mekanismenya masih hipotesis ilmiah. Visual adalah simulasi. Di daerahmu asapnya separah apa?",
        points=["Asap terkurung oleh lapisan inversi, udara hangat di ketinggian sekitar 1,5 sampai 2 km.", "Es kering adalah CO2 padat bersuhu minus 78,5 derajat Celsius.", "Ia menyublim: langsung jadi gas, 1 kg menjadi sekitar 500 liter gas (hitungan gas ideal).", "Saat menyublim, es kering menyerap panas sehingga lapisan tutup diharapkan mendingin.", "Laporan hari pertama: jarak pandang 650 m menjadi 2.800 m, tetapi efeknya hanya beberapa jam."],
        ig="Es kering tidak memadamkan api. Ia hanya membuka tutupnya. Menurutmu, operasi ini perlu diteruskan? Tulis di komentar.",
        audio="Dengarkan desis sublimasi saat es kering berubah jadi gas, dan dengung pesawat di awal.",
        yt_title="Kenapa Es Kering Ditabur di Atas Kabut Asap? Ini Cara Kerjanya",
        yt_alt=["Es Kering vs Kabut Asap Karhutla: Bukan untuk Hujan", "Tutup Panci di Langit: Rahasia Asap Tak Bisa Naik", "Cara Kerja Es Kering Urai Kabut Asap, Benarkah Ampuh?"],
        yt_desc="Oktober 2026, BMKG bersama BNPB dan TNI menebar es kering dari udara di atas Palembang dan Kalimantan Tengah. Video ini menjelaskan lapisan inversi yang mengurung asap, sublimasi es kering, hasil hari pertama, dan catatan BRIN bahwa mekanismenya masih hipotesis.",
        yt_tags="es kering, dry ice, kabut asap, karhutla, lapisan inversi, BMKG, BNPB, BRIN, modifikasi cuaca, Palembang, Kalimantan Tengah, sublimasi, cara kerja, sains, audira",
        yt_pin="Sumber lengkap ada di deskripsi. Mekanisme ini masih diuji, jadi kami tampilkan hasil dan keraguannya sekaligus. Pertanyaanmu apa?",
        thumb="Pesawat kecil di atas lautan asap oranye, butiran putih jatuh, teks besar: ES DI ATAS ASAP?",
        fb="Bayangkan panci berisi uap yang ditutup rapat. Uapnya tidak bisa keluar. Di musim kemarau, langit di atas daerah karhutla bisa seperti itu: ada lapisan udara hangat di ketinggian sekitar dua kilometer yang menahan asap di bawahnya. Es kering yang ditabur dari pesawat menyerap panas saat berubah jadi gas, dengan harapan tutup itu melemah dan asap bisa naik. Hari pertama, jarak pandang dilaporkan membaik, tetapi efeknya hanya beberapa jam, dan BRIN menyebut mekanismenya masih hipotesis.",
        fb_q="Menurutmu, dana operasi seperti ini lebih baik dipakai untuk menabur es di udara atau memadamkan api di darat?",
        x_single="Es kering ditabur di atas asap karhutla bukan untuk hujan. Ia menyerap panas saat jadi gas, supaya lapisan udara hangat yang mengurung asap melemah. Hari pertama: jarak pandang 650 m menjadi 2.800 m. Catatan BRIN: masih hipotesis. #EsKering #KabutAsap",
        x_thread=["Kenapa pesawat menabur es kering di atas kabut asap? Bukan untuk hujan. Utas singkat #EsKering #KabutAsap", "Masalahnya lapisan inversi: di ketinggian sekitar 1,5 sampai 2 km ada udara yang justru lebih hangat. Asap di bawahnya tidak bisa naik.", "Es kering = CO2 padat, minus 78,5 derajat Celsius. Ia langsung berubah jadi gas dan menyerap panas dari udara sekitarnya.", "Hari pertama dilaporkan jarak pandang naik dari 650 m ke 2.800 m. Efeknya hanya beberapa jam, dan BRIN menyebut mekanismenya masih hipotesis.", "Es kering hanya membuka tutupnya. Sumber asap tetap harus dipadamkan di darat. #Karhutla #AudiraCaraKerja"],
    ),
    "EP02_BATERAI_MOTOR_LISTRIK": dict(
        title="Kenapa Motor Listrik Bisa Terbakar?",
        chap=["Hook", "Kasus Bekasi", "Anatomi sel", "Saat dicas", "Saat disalahgunakan", "Thermal runaway", "Cara aman", "Penutup"],
        tags=["#MotorListrik", "#BateraiLithium", "#ThermalRunaway", "#CaraKerja", "#AudiraCaraKerja"],
        hook="Motor listrik terparkir, lalu api keluar dari bagasinya.",
        cover="KENAPA MOTOR LISTRIK BISA TERBAKAR?",
        tiktok="Penyebab kasus Bekasi belum dipastikan. Bengkel yang menanganinya menyebut kontrolernya sudah di-remap dan BMS-nya aftermarket. Di dalam baterai, sekat plastik tipis memisahkan anoda dan katoda. Kalau sel kepanasan, di sekitar 130 derajat sekat meleleh, kutub bertemu, dan panas memicu reaksi berantai: thermal runaway.",
        pin="Sumber: Kompas 6 Nov 2026; Liu dkk. 2018 (Science Advances); Battery University; NFPA; NTSB. Penyebab kasus Bekasi belum dipastikan. Kamu pernah modifikasi motor listrik?",
        points=["Penyebab kasus Bekasi belum dipastikan; bengkel menyebut kontroler di-remap dan BMS aftermarket.", "Tiap sel lithium-ion berisi anoda grafit, katoda logam, elektrolit mudah terbakar, dan separator tipis.", "BMS menjaga tegangan dan suhu tiap sel tetap di batas aman.", "Sekitar 90 derajat lapisan pelindung grafit terurai, sekitar 130 derajat separator meleleh.", "Thermal runaway bisa membuat sel tembus 500 derajat dan merambat ke sel sebelahnya."],
        ig="Simpan video ini untuk orang rumah yang pakai motor listrik. Mana tips yang paling sering dilanggar? Tulis di komentar.",
        audio="Perhatikan bunyi derak yang makin rapat saat suhu sel naik dari 130 ke 500 derajat.",
        yt_title="Kenapa Motor Listrik Bisa Terbakar? Ini yang Terjadi di Dalam Baterai",
        yt_alt=["Thermal Runaway: Saat Baterai Motor Listrik Memanaskan Dirinya Sendiri", "Motor Listrik Terbakar di Bekasi: Apa yang Terjadi di Dalam Sel?", "Jangan Ubah BMS! Cara Kerja Baterai Motor Listrik"],
        yt_desc="Video motor listrik terbakar di Bekasi viral pada 5 November 2026. Penyebabnya belum dipastikan. Video ini menjelaskan isi sel lithium-ion, peran BMS, tahap suhu menuju thermal runaway, dan cara memakai motor listrik dengan aman.",
        yt_tags="motor listrik, baterai lithium, thermal runaway, BMS, kontroler, motor listrik terbakar, Bekasi, lithium ion, separator, keselamatan, charger, cara kerja, sains, audira",
        yt_pin="Penyebab kasus Bekasi belum dipastikan dan kami tidak menuduh merek mana pun. Yang kami jelaskan adalah cara kerja sel lithium-ion secara umum.",
        thumb="Skuter di malam hari dengan cahaya oranye dari bawah jok, sel baterai berwarna termal, teks: KENAPA TERBAKAR?",
        fb="Baterai itu seperti gudang energi yang dijaga satpam. Satpamnya adalah BMS, yang memastikan tidak ada sel yang dicas berlebih atau kepanasan. Di dalam tiap sel ada sekat plastik sangat tipis yang memisahkan dua kutub. Kalau sel terlalu panas, sekat itu meleleh, dua kutub bertemu, dan panas memicu reaksi yang menambah panas lagi. Itulah thermal runaway. Karena itu, mengganti BMS atau mengubah kontroler sembarangan bisa berarti memecat satpam gudang.",
        fb_q="Menurutmu, perlu tidak ada aturan yang melarang bengkel memodifikasi BMS motor listrik?",
        x_single="Kenapa motor listrik bisa terbakar? Di sekitar 130 derajat, sekat tipis di dalam sel meleleh, kutub bertemu, dan panas memicu reaksi berantai sampai 500 derajat. Kasus Bekasi penyebabnya belum dipastikan. #MotorListrik #ThermalRunaway",
        x_thread=["Motor listrik terbakar di Bekasi viral. Penyebabnya belum dipastikan, tapi begini cara sel baterainya bisa terbakar. Utas #MotorListrik #BateraiLithium", "Bengkel yang menangani menyebut kontrolernya di-remap dan BMS-nya aftermarket. Sel baterainya disebut masih bawaan pabrik.", "Di dalam sel: anoda grafit, katoda logam, elektrolit mudah terbakar, dan sekat plastik tipis. BMS menjaga tegangan dan suhu tiap sel.", "Sekitar 90 derajat lapisan pelindung grafit terurai. Sekitar 130 derajat sekat meleleh. Lalu panas memicu reaksi, reaksi menambah panas, sampai 500 derajat.", "Pakai charger asli, jangan ubah kontroler atau BMS, dan jangan pakai baterai yang gembung atau berbau. #ThermalRunaway #AudiraCaraKerja"],
    ),
    "EP03_TRANSMISI_CVT": dict(
        title="Cara Kerja CVT, YECVT, dan D-CVT",
        chap=["Hook", "YECVT & D-CVT", "Anatomi puli", "Saat berangkat", "Putaran naik", "YECVT elektronik", "D-CVT mobil", "Penutup"],
        tags=["#CVT", "#NMAXTurbo", "#YECVT", "#CaraKerja", "#AudiraCaraKerja"],
        hook="Motor matic tidak punya gigi satu, dua, tiga.",
        cover="MATIC TANPA PINDAH GIGI, KOK BISA?",
        tiktok="CVT memakai dua puli kerucut dan satu sabuk. Saat berangkat sabuk duduk di lingkaran kecil di depan dan besar di belakang. Saat putaran naik, roller terlempar keluar dan mendorong puli depan merapat, jadi rasio berubah mulus. YECVT di NMAX Turbo mengganti roller dengan motor listrik yang diatur komputer.",
        pin="Sumber: Yamaha Indonesia, detikOto (YIMM), rilis Daihatsu 2019, Toyota Raize, Wikipedia. Model 3D adalah ilustrasi. Kamu tim matic biasa atau tim YECVT?",
        points=["CVT punya dua puli kerucut: depan diputar mesin, belakang memutar roda.", "Saat berangkat: puli depan renggang, sabuk di lingkaran kecil, rasio berat seperti gigi satu.", "Putaran naik: roller terlempar oleh gaya sentrifugal, piringan merapat, rasio bergeser mulus.", "YECVT mengganti roller dengan motor listrik, dibaca sensor kedua puli, plus Y-Shift tiga level.", "D-CVT Daihatsu menambah roda gigi; di kecepatan tinggi tenaga dibagi sabuk dan gigi, klaim efisiensi naik sekitar 8 persen."],
        ig="Kalau kamu pengendara matic, bagian mana yang paling sering kamu servis? Tulis di komentar.",
        audio="Dengarkan nada mesin yang naik saat roller terlempar keluar dan rasio bergeser.",
        yt_title="Matic Tanpa Pindah Gigi: Cara Kerja CVT, YECVT NMAX Turbo, dan D-CVT",
        yt_alt=["Kenapa Motor Matic Tidak Punya Gigi? Ini Rahasia CVT", "YECVT NMAX Turbo vs CVT Biasa: Bedanya di Roller", "D-CVT Avanza: CVT yang Punya Roda Gigi"],
        yt_desc="Motor matic melaju dari diam sampai kencang tanpa pindah gigi. Video ini memperlihatkan dua puli kerucut, sabuk, roller sentrifugal, versi elektronik YECVT di Yamaha NMAX Turbo, dan D-CVT Daihatsu yang menambah roda gigi.",
        yt_tags="CVT, transmisi CVT, motor matic, YECVT, NMAX Turbo, Yamaha, D-CVT, Daihatsu, Avanza, roller, puli, v-belt, cara kerja, otomotif, audira",
        yt_pin="Angka efisiensi D-CVT adalah klaim Daihatsu. Model 3D adalah ilustrasi, bukan replika transmisi tertentu.",
        thumb="Dua puli baja dengan sabuk dan roller oranye menyala, teks: TANPA GIGI?",
        fb="Coba ingat sepeda dengan gir belakang yang banyak. Saat menanjak kita pindah ke gir besar, saat ngebut ke gir kecil, dan selalu ada hentakan saat pindah. CVT menghapus hentakan itu: ukuran lingkarannya yang berubah, terus-menerus, karena dua piringan kerucut bisa merapat dan menjauh. Di NMAX Turbo, yang menggeser piringan bukan lagi roller pemberat, melainkan motor listrik yang diatur komputer.",
        fb_q="Lebih suka rasa tarikan matic CVT atau motor bergigi? Kenapa?",
        x_single="Motor matic tidak pindah gigi. Dua puli kerucut menggeser lingkaran sabuk terus-menerus: roller terlempar keluar, puli depan merapat, rasio berubah mulus. YECVT NMAX Turbo menggantinya dengan motor listrik. #CVT #NMAXTurbo",
        x_thread=["Kenapa motor matic bisa melaju tanpa pindah gigi? Rahasianya dua puli dan satu sabuk. Utas #CVT #YECVT", "Tiap puli adalah dua piringan kerucut yang bisa merapat dan menjauh. Sabuk duduk di antaranya.", "Saat berangkat, sabuk di lingkaran kecil di depan dan besar di belakang. Saat putaran naik, roller terlempar keluar dan mendorong piringan merapat.", "YECVT di NMAX Turbo membuang roller. Motor listrik menggeser puli depan, dibaca sensor di kedua puli, plus tombol Y-Shift tiga level.", "D-CVT Daihatsu menambah roda gigi, dan di kecepatan tinggi tenaga dibagi lewat sabuk dan gigi. #NMAXTurbo #AudiraCaraKerja"],
    ),
    "EP04_SENJATA_SUARA_LRAD": dict(
        title="Senjata Suara 160 dB: Cara Kerja LRAD",
        chap=["Hook", "Apa itu LRAD", "Kenapa terarah", "Interferensi", "Skala desibel", "Jarak & arah", "Kasus Pittsburgh", "Penutup"],
        tags=["#LRAD", "#SenjataSuara", "#Desibel", "#CaraKerja", "#AudiraCaraKerja"],
        hook="Bukan peluru, bukan gas air mata. Alat ini menyerang dengan suara.",
        cover="SUARA BISA JADI SENJATA?",
        tiktok="LRAD bisa membidik suara seperti senter karena permukaan pemancarnya jauh lebih lebar dari panjang gelombang suaranya. Gelombang saling menguatkan di depan dan saling meredam ke samping, jadi berkasnya sekitar 30 derajat. Angka 160 desibel diukur satu meter dari perangkat; rasa sakit mulai sekitar 120 desibel.",
        pin="Sumber: lembar data Genasys LRAD, ACLU Pennsylvania, NIDCD, NIOSH, Pontianak Post 2 Nov 2026. Visual adalah simulasi skematik. Pernah lihat alat ini dipakai?",
        points=["LRAD disebut pembuatnya alat komunikasi, tetapi punya nada peringatan yang bisa menyakitkan.", "Berkas terarah karena pemancarnya jauh lebih lebar dari panjang gelombang suaranya.", "Gelombang menguatkan di depan dan meredam ke samping: berkas sekitar 30 derajat.", "Tiap +10 dB berarti intensitas 10 kali; rasa sakit sekitar 120 dB; 160 dB diukur 1 meter dari perangkat.", "Kasus Pittsburgh 2009 berakhir dengan ganti rugi 72.000 dolar AS untuk gangguan pendengaran permanen."],
        ig="Kalau suatu saat mendengar nada tajam yang menyakitkan, menjauh dan tutup telinga. Bagikan ke teman yang sering ikut acara ramai.",
        audio="Nada peringatan di video sengaja dibuat pelan dan singkat. Yang terdengar adalah ping sonar mengikuti gelombang.",
        yt_title="Senjata Suara 160 Desibel: Begini Cara LRAD Membidik Suara",
        yt_alt=["Kenapa Suara LRAD Bisa Terarah Seperti Senter?", "Bukan Peluru, Bukan Gas Air Mata: Cara Kerja LRAD", "160 dB Itu Seberapa Keras? Fisika di Balik LRAD"],
        yt_desc="Pontianak Post menulis tentang senjata suara hingga 160 desibel. Video ini mensimulasikan medan gelombang dari puluhan sumber suara sefase untuk menunjukkan kenapa LRAD terarah, menjelaskan skala desibel, pelemahan terhadap jarak, dan kasus gangguan pendengaran di Pittsburgh 2009.",
        yt_tags="LRAD, senjata suara, long range acoustic device, desibel, gelombang suara, interferensi, gangguan pendengaran, Genasys, Pittsburgh G20, akustik, fisika, cara kerja, audira",
        yt_pin="Angka 160 dB adalah puncak satu model, diukur 1 meter dari perangkat. Simulasi gelombang memakai skala yang diperbesar.",
        thumb="Pemancar bulat bercahaya cyan dengan berkas gelombang oranye-biru, teks: 160 dB",
        fb="Coba bandingkan lampu bohlam dan senter. Bohlam menyebar ke segala arah, senter memusatkan cahaya ke satu arah. Suara biasa seperti bohlam. LRAD seperti senter, karena permukaan pemancarnya jauh lebih lebar dari panjang gelombangnya, sehingga gelombang menguatkan di depan dan meredam ke samping. Akibatnya, orang di depan corong bisa mendengar jauh lebih keras daripada orang di sebelahnya.",
        fb_q="Menurutmu, alat seperti ini perlu aturan pemakaian yang lebih ketat di Indonesia?",
        x_single="LRAD membidik suara seperti senter: pemancarnya jauh lebih lebar dari panjang gelombang, jadi gelombang menguatkan di depan dan meredam ke samping. Berkas sekitar 30 derajat. 160 dB diukur 1 meter dari perangkat. #LRAD #SenjataSuara",
        x_thread=["Senjata suara 160 desibel. Bagaimana suara bisa dibidik seperti senter? Utas #LRAD #SenjataSuara", "Kuncinya ukuran: permukaan pemancar LRAD jauh lebih lebar dari panjang gelombang suara yang dipancarkannya.", "Gelombang dari seluruh permukaan saling menguatkan di depan dan saling meredam ke samping. Hasilnya berkas sekitar 30 derajat.", "Tiap +10 dB = intensitas 10 kali. Rasa sakit sekitar 120 dB. Angka 160 dB itu diukur 1 meter dari perangkat.", "Kasus Pittsburgh 2009 berakhir dengan ganti rugi 72.000 dolar AS. Menjauh dan tutup telinga. #Desibel #AudiraCaraKerja"],
    ),
    "EP05_PAYUNG_RAKSASA_NABAWI": dict(
        title="250 Payung Raksasa Masjid Nabawi",
        chap=["Hook", "Sejak 2010", "Saat terlipat", "Lengan lipat", "Membran PTFE", "Dua tinggi", "Tim & sistem", "Penutup"],
        tags=["#MasjidNabawi", "#PayungNabawi", "#Arsitektur", "#CaraKerja", "#AudiraCaraKerja"],
        hook="Dua ratus lima puluh payung raksasa mekar bersamaan.",
        cover="250 PAYUNG MEKAR DALAM 3 MENIT",
        tiktok="Payung di halaman Masjid Nabawi berdiri seperti tiang setinggi hampir 22 meter saat terlipat. Saat dibuka, 4 lengan diagonal, 4 lengan tengah, dan 16 lengan pendukung membentang, kain PTFE tertarik kencang. Tingginya dibuat dua jenis, 14,4 dan 15,3 meter, jadi tepi kain saling menumpuk menjadi satu atap.",
        pin="Sumber: SL Rasch, Architect Magazine/SEFAR, SPA via detikHikmah dan Elharamain (3 Nov 2026), Wikipedia. Model 3D adalah ilustrasi, bukan replika. Sudah pernah berteduh di bawahnya?",
        points=["250 payung menaungi sekitar 143.000 meter persegi, dipasang sejak 2010.", "Saat terlipat, tiap payung setinggi sekitar 21,7 meter, kainnya disimpan di selubung mozaik.", "Lengan lipat: 4 diagonal, 4 tengah, 16 pendukung, membuka dalam sekitar 3 menit.", "Kain PTFE berwarna pasir, bukan putih, supaya tidak menyilaukan.", "Dua tinggi, 14,4 dan 15,3 meter, membuat tepi kain saling menumpuk menjadi satu atap."],
        ig="Tag teman atau keluarga yang sedang bersiap umrah. Bagian mana yang baru kamu tahu?",
        audio="Dengarkan sapuan mekanis panjang tepat saat payung mulai mekar.",
        yt_title="Bagaimana 250 Payung Raksasa Masjid Nabawi Bisa Mekar Bersamaan?",
        yt_alt=["Cara Kerja Payung Raksasa Masjid Nabawi", "Payung Setinggi 22 Meter yang Terbuka dalam 3 Menit", "Arsitektur yang Bergerak: Payung Halaman Masjid Nabawi"],
        yt_desc="Payung raksasa Masjid Nabawi kembali ramai dibahas awal November 2026 menjelang musim hujan. Video ini memperlihatkan bagaimana tiang terlipat setinggi hampir 22 meter membuka lengan-lengan lipatnya, menarik kain PTFE, dan bergabung menjadi satu atap seluas sekitar 143.000 meter persegi.",
        yt_tags="payung masjid nabawi, masjid nabawi, payung raksasa, madinah, arsitektur, SL Rasch, Liebherr, PTFE, umrah, haji, cara kerja, teknik, audira",
        yt_pin="Model masjid dan payung di video adalah ilustrasi 3D, bukan replika. Data kipas kabut dan lampu berasal dari laporan SPA.",
        thumb="Ratusan payung putih pasir mekar di halaman marmer saat fajar, teks: 250 PAYUNG, 3 MENIT",
        fb="Pernah membuka payung lipat? Rangkanya mendorong jari-jari yang terhubung engsel sampai kain tertarik kencang. Payung di Masjid Nabawi bekerja dengan prinsip yang mirip, hanya saja tingginya lebih dari 20 meter dan jumlahnya 250. Saat tertutup, ia hanya tiang ramping berselubung mozaik. Saat terbuka, tepi kainnya saling menumpuk karena tingginya dibuat dua jenis, sehingga ratusan payung menjadi satu atap teduh.",
        fb_q="Menurutmu, teknologi payung seperti ini cocok dipakai di masjid atau alun-alun di Indonesia?",
        x_single="250 payung raksasa Masjid Nabawi: saat terlipat setinggi hampir 22 m, saat dibuka lengan lipat membentang dan kain PTFE tertarik. Dua tinggi, 14,4 dan 15,3 m, membuat tepinya menumpuk jadi satu atap. #MasjidNabawi #PayungNabawi",
        x_thread=["Bagaimana 250 payung raksasa Masjid Nabawi bisa mekar bersamaan? Utas #MasjidNabawi #PayungNabawi", "Saat terlipat, tiap payung berdiri seperti tiang ramping setinggi sekitar 21,7 m. Kainnya tersimpan di selubung mozaik.", "Saat dibuka, 4 lengan diagonal, 4 lengan tengah, dan 16 lengan pendukung membentang. Prosesnya sekitar 3 menit.", "Kain PTFE berwarna pasir supaya tidak menyilaukan. Tingginya dua jenis, 14,4 dan 15,3 m, jadi tepi kain saling menumpuk.", "Hasilnya satu atap teduh sekitar 143.000 meter persegi, dikendalikan dari ruang kontrol pusat. #Arsitektur #AudiraCaraKerja"],
    ),
}


def fmt(t):
    return f"{int(t // 60)}:{int(t % 60):02}"


name = sys.argv[1]
E = C[name]
d = Path(name)
T = json.loads((d / "timeline.json").read_text(encoding="utf8"))
assert not T.get("estimated"), "timeline still estimated; voice the episode first"
tags = " ".join(E["tags"])
chap = "\n".join(f"{fmt(s['start'] if i else 0)} {n}" for i, (s, n) in enumerate(zip(T["scenes"], E["chap"])))
assert len(E["yt_title"]) < 100 and len(E["yt_tags"]) < 500
for x in [E["x_single"], *E["x_thread"]]:
    assert len(x) <= 280, (len(x), x)
pts = "\n".join(f"{i+1}. {x}" for i, x in enumerate(E["points"]))
m = f"# SOCIAL CAPTIONS: {E['title']}\n\nAUDIRA, seri CARA KERJA VIRAL. Created by Agus Dwi R.\n\n"
m += f"## TikTok\n\n**Hook:** {E['hook']}\n\n**Cover Text:** {E['cover']}\n\n**Caption:** {E['tiktok']}\n\n**Pinned Comment:** {E['pin']}\n\n**Hashtags:** {tags}\n\n"
m += f"## Instagram Reels\n\n**5-Point Value Breakdown:**\n\n{pts}\n\n**Caption:** {E['ig']}\n\n**Audio Cue:** {E['audio']}\n\n**Hashtags:** {tags}\n\n"
m += f"## YouTube Shorts\n\n**Judul:** {E['yt_title']}\n\n**Alternatif Judul:**\n" + "\n".join(f"- {x}" for x in E["yt_alt"]) + f"\n\n**Deskripsi:**\n\n{E['yt_desc']}\n\nChapters:\n{chap}\n\nCreated by Agus Dwi R. AUDIRA Cara Kerja Viral.\n\n{tags}\n\n**Tags:** {E['yt_tags']}\n\n**Pinned Comment:** {E['yt_pin']}\n\n**Thumbnail:** {E['thumb']}\n\n"
m += f"## Facebook Reels\n\n**Caption:** {E['fb']}\n\n**Discussion Trigger:** {E['fb_q']}\n\n**Hashtags:** {tags}\n\n"
m += f"## X/Twitter\n\n**Cuitan tunggal:** {E['x_single']}\n\n**Viral Hook Thread:**\n\n" + "\n\n".join(f"{i+1}/ {x}" for i, x in enumerate(E["x_thread"])) + "\n"
(d / "SOCIAL_CAPTIONS.md").write_text(m, encoding="utf8")
print(name, "captions ok")
