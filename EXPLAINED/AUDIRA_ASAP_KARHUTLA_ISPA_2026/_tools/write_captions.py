"""Write SOCIAL_CAPTIONS.md (6 platforms + Jadwal Upload (WIB) + Label Konten AI) for each episode.
Run from the series folder: python _tools/write_captions.py
Facts come only from the approved scripts (docs/SCRIPT.md) and research HIGH items."""
import json, glob

SERIES = "AUDIRA · ASAP & ISPA"
BASE_TAGS = "#AUDIRA"

EPS = {
 "01": dict(
  title="81 Ribu Kasus ISPA di Mimika: Asapnya Kiriman, tapi Bukan Cuma Soal Asap",
  day="Rabu, 11 November 2026", start=(11, 30),
  hook="Lebih dari 81 ribu kasus ISPA di Mimika. Tapi Dinas Kesehatannya sendiri bilang: ini bukan cuma soal asap.",
  cover="81 RIBU KASUS, BUKAN CUMA ASAP",
  tags="#ISPA #Mimika #Papua #Karhutla #AUDIRA",
  tiktok="Sejak akhir September Timika berselimut asap kiriman dari Papua Selatan. Angka ISPA Mimika memang 81.355 kasus, tapi itu dihitung sejak Januari. Akhir Agustus, sebelum asap datang, sudah hampir 64 ribu. Asap memperberat, tapi tidak semua kasus karena asap.",
  pin="Sumber: Dinkes Mimika (81.355 kasus 1 Jan–30 Okt 2026; 63.856 akhir Agustus; 61.758 periode sama 2025), Pemkab Mimika, liputan media nasional (daftar lengkap di SOURCE_REGISTER). Angka = jumlah kasus, bukan jumlah orang. Ilustrasi peta, bukan citra asli.",
  points=["81.355 kasus ISPA di Mimika dihitung sejak 1 Januari 2026, bukan sejak asap datang.",
          "Akhir Agustus, sebelum asap, angkanya sudah hampir 64 ribu.",
          "Tahun lalu di periode yang sama: hampir 62 ribu. ISPA memang selalu 10 besar penyakit di Mimika.",
          "Asap kiriman dari Papua Selatan (terutama Merauke) memperberat asma, TBC, dan pneumonia.",
          "Awal November udara Timika membaik, tapi titik panas di Papua Selatan naik lagi."],
  audio="Dengarkan dengung pesawat yang berputar di atas kabut sebelum kamera turun ke Timika.",
  yt_alts=["81.355 Kasus ISPA di Mimika: Bukan Semuanya karena Asap", "Asap Kiriman dari Merauke ke Timika", "Kenapa Angka ISPA Mimika Sudah Tinggi Sebelum Asap Datang?"],
  ytdesc="Video ini membedah angka 81.355 kasus ISPA di Mimika: dihitung sejak Januari, sudah hampir 64 ribu sebelum asap datang, dan hampir 62 ribu di periode yang sama tahun lalu. Asap kiriman dari Papua Selatan memperberat yang sudah sakit, tapi tidak semua kasus karena asap.",
  ytags="ISPA, Mimika, Timika, Papua, Papua Selatan, Merauke, karhutla, kabut asap, kesehatan, kasus ISPA, asap kiriman, AUDIRA",
  thumb="Peta satelit Papua dengan asap dari Merauke ke Timika, teks 81.355 KASUS ISPA",
  fb="Lebih dari 81 ribu kasus ISPA di Mimika terdengar mengerikan. Tapi coba lihat urutannya: angka itu dihitung sejak Januari. Akhir Agustus, sebelum asap kiriman dari Papua Selatan datang, kasusnya sudah hampir 64 ribu. Tahun lalu di periode yang sama hampir 62 ribu. Jadi asap memang memperberat, terutama bagi yang sudah sakit asma, TBC, atau pneumonia, tapi tidak semua kasus karena asap.",
  fbq="Menurutmu, apa yang paling dibutuhkan warga Timika saat asap kiriman datang lagi?",
  x="81.355 kasus ISPA di Mimika dihitung sejak Januari. Sebelum asap datang, sudah hampir 64 ribu. Asap memperberat, tapi tidak semua karena asap. #ISPA #AUDIRA",
  thread=["Lebih dari 81 ribu kasus ISPA di Mimika. Tapi Dinkes-nya sendiri bilang: ini bukan cuma soal asap. #ISPA",
          "Angka 81.355 itu kasus sejak 1 Januari. Akhir Agustus, saat asap belum datang, sudah hampir 64 ribu.",
          "Tahun lalu di periode yang sama hampir 62 ribu. ISPA memang selalu masuk 10 besar penyakit di Mimika.",
          "Asap kiriman dari Papua Selatan memperberat yang sudah sakit. Selama apinya belum padam, asap bisa datang lagi. #Papua #AUDIRA"],
  threads=["Lebih dari 81 ribu kasus ISPA di Mimika. Tapi Dinas Kesehatannya sendiri bilang: ini bukan cuma soal asap. #ISPA",
           "Angka itu dihitung sejak Januari. Akhir Agustus, sebelum asap kiriman dari Papua Selatan datang, kasusnya sudah hampir 64 ribu. Tahun lalu di periode yang sama hampir 62 ribu.",
           "Asap memperberat yang sudah sakit: asma, TBC, pneumonia. Pakai masker saat berasap, dan ke puskesmas bila sesak. Menurutmu apa yang paling dibutuhkan warga Timika?"],
  prev="Episode pertama seri ini."),
 "02": dict(
  title="6.700 Titik Panas dalam Sehari: Papua Selatan Dikepung Api",
  day="Kamis, 12 November 2026", start=(11, 30),
  hook="Enam ribu tujuh ratus titik panas dalam satu hari. Bukan di Kalimantan, tapi di Papua Selatan.",
  cover="6.700 TITIK PANAS SEHARI",
  tags="#Karhutla #PapuaSelatan #Merauke #TitikPanas #AUDIRA",
  tiktok="Catatan BMKG 11 Oktober: 6.700 titik panas dalam sehari di Papua Selatan. Merauke 100 hari tanpa hujan, rawa yang biasanya jadi sekat api mengering. Kenapa luas kebakarannya simpang siur dari 63 sampai 25 ribu hektare? Karena yang diukur berbeda.",
  pin="Sumber: BMKG (6.700 titik panas, 11 Okt 2026), BNPB, Pemkab Merauke (25 ribu ha total kemarau), laporan awal 63 ha dari 9 lokasi, BBC Indonesia (kutipan warga Ilwayab), Dinkes Papua Selatan. Penyebab pasti kebakaran belum ditetapkan. Visual kamera termal = ilustrasi.",
  points=["11 Oktober, BMKG mencatat sekitar 6.700 titik panas dalam satu hari di Papua Selatan.",
          "El Nino sangat kuat: Merauke 100 hari tanpa hujan, rawa yang biasanya jadi sekat api alami mengering.",
          "Asap menyeberang laut sampai Maluku; ISPA naik di 4 kabupaten.",
          "63 ha = laporan awal 9 lokasi; 25 ribu ha = total sepanjang kemarau versi Pemkab Merauke. Beda yang diukur.",
          "Titik panas belum tentu api: itu panas permukaan yang ditangkap satelit. Penyebab pasti belum ditetapkan."],
  audio="Dengarkan desis panas dan sapuan drone termal di atas garis api Merauke.",
  yt_alts=["Merauke 100 Hari Tanpa Hujan: Kenapa Rawa Ikut Terbakar", "63 Hektare atau 25 Ribu Hektare? Membedah Angka Karhutla Papua Selatan", "Titik Panas Bukan Selalu Api"],
  ytdesc="Papua Selatan mencatat sekitar 6.700 titik panas dalam satu hari pada 11 Oktober 2026. Video ini menjelaskan kemarau panjang dan El Nino, rawa yang mengering, asap yang sampai ke Maluku, kenaikan ISPA di empat kabupaten, kenapa angka luas kebakaran berbeda (63 ha vs 25 ribu ha), dan beda titik panas dengan api.",
  ytags="karhutla, Papua Selatan, Merauke, titik panas, hotspot, El Nino, kebakaran hutan, rawa, BMKG, BNPB, ISPA, kabut asap, AUDIRA",
  thumb="Medan kamera termal ironbow dengan garis api dan kolom asap, teks 6.700 TITIK PANAS",
  fb="Bayangkan 6.700 titik panas muncul dalam satu hari, dan itu bukan di Kalimantan, tapi di Papua Selatan. Merauke melewati 100 hari tanpa hujan. Rawa yang dulu jadi sekat api alami ikut kering. Angka luas kebakarannya pun simpang siur, dari 63 sampai 25 ribu hektare, karena yang diukur memang berbeda: laporan awal sembilan lokasi versus total sepanjang kemarau. Penyebab pastinya belum ditetapkan.",
  fbq="Menurutmu, apa yang harus disiapkan Merauke sebelum musim kemarau berikutnya?",
  x="6.700 titik panas dalam sehari di Papua Selatan (BMKG, 11 Okt). Merauke 100 hari tanpa hujan, rawa mengering. Penyebab pasti belum ditetapkan. #Karhutla #AUDIRA",
  thread=["Enam ribu tujuh ratus titik panas dalam satu hari. Bukan di Kalimantan, tapi di Papua Selatan. #Karhutla",
          "El Nino kuat bikin Merauke 100 hari tanpa hujan. Rawa yang biasanya jadi sekat api alami ikut kering.",
          "Luas kebakaran 63 ha atau 25 ribu ha? Dua-duanya benar: laporan awal 9 lokasi vs total sepanjang kemarau.",
          "Titik panas = panas permukaan yang ditangkap satelit, belum tentu api. 6 Nov titik panas naik lagi 66%. #PapuaSelatan #AUDIRA"],
  threads=["Enam ribu tujuh ratus titik panas dalam satu hari, bukan di Kalimantan, tapi di Papua Selatan. #Karhutla",
           "Merauke melewati 100 hari tanpa hujan, rawa yang biasanya menahan api ikut kering, dan asapnya menyeberang laut sampai Maluku.",
           "Angka luas kebakaran 63 vs 25 ribu hektare beda karena yang diukur beda. Penyebab pastinya belum ditetapkan. Ikuti info BMKG, karena musim hujan membawa ancaman banjir."],
  prev="Episode sebelumnya: EP01 81 Ribu Kasus ISPA di Mimika."),
 "03": dict(
  title="3,58 Juta Berpotensi ISPA? Membedah Angka Viral Papua Tengah",
  day="Jumat, 13 November 2026", start=(11, 30),
  hook="3,58 juta orang berpotensi kena ISPA, dan Papua Tengah paling tinggi. Tapi angka viral ini bukan hitungan pasien.",
  cover="BUKAN HITUNGAN PASIEN",
  tags="#ISPA #PapuaTengah #CekFakta #Karhutla #AUDIRA",
  tiktok="Grafik viral: 3,58 juta orang berpotensi ISPA, Papua Tengah tertinggi. Angka itu estimasi model CELIOS, bukan kasus terkonfirmasi. Rumusnya: penduduk × angka ISPA dasar × 1,78. Hasilnya lebih ditentukan angka ISPA lama, bukan luas api.",
  pin="Sumber: laporan CELIOS 2 Nov 2026 (estimasi berpotensi, bukan kasus), Survei Kesehatan Indonesia 2023 (prevalensi dasar dikutip CELIOS), Kemenkes (lonjakan Kalteng sepekan, asal pengali 1,78), NASA Earth Observatory (emisi kebakaran Papua tertinggi ke-3), Dinkes Nabire. Angka 54 ribu = hitungan ilustrasi AUDIRA, bukan angka CELIOS.",
  points=["3,58 juta adalah estimasi orang berpotensi ISPA dari model CELIOS (2 Nov), bukan kasus terkonfirmasi.",
          "Papua Tengah: hampir 1,4 juta penduduk × angka ISPA dasar hampir 19% × 1,78 = 463 ribu berpotensi.",
          "Pengali 1,78 berasal dari lonjakan kasus sepekan di Kalimantan Tengah, dipakai sama rata ke semua provinsi.",
          "Papua Selatan terbakar paling luas, tapi potensinya hanya 37 ribu. Dengan rata-rata nasional, Papua Tengah sekitar 54 ribu (ilustrasi AUDIRA).",
          "Asapnya tetap nyata: NASA mencatat emisi kebakaran Papua tahun ini tertinggi ketiga dalam hampir tiga dekade."],
  audio="Dengarkan stempel yang menghantam meja tepat saat kata 'bukan hitungan pasien'.",
  yt_alts=["Rumus di Balik 3,58 Juta Berpotensi ISPA", "Kenapa Papua Tengah Juara Grafik ISPA?", "Baca Angkanya, Bukan Cuma Judulnya"],
  ytdesc="Grafik viral menyebut 3,58 juta orang berpotensi ISPA dengan Papua Tengah tertinggi. Video ini membedah sumbernya (laporan CELIOS, bukan Kemenkes atau BNPB), rumus penduduk × prevalensi dasar × 1,78, kenapa peringkatnya lebih ditentukan angka ISPA lama daripada luas api, dan fakta asap yang tetap nyata di Papua.",
  ytags="ISPA, Papua Tengah, CELIOS, cek fakta, karhutla, kabut asap, Papua, Nabire, Timika, Wamena, NASA, El Nino, data kesehatan, AUDIRA",
  thumb="Meja investigasi dengan grafik viral 3,58 JUTA dan stempel BUKAN HITUNGAN PASIEN",
  fb="Grafik 3,58 juta orang berpotensi ISPA ramai dibagikan, dengan Papua Tengah di puncak. Tapi angka itu estimasi model, bukan pasien. Rumusnya sederhana: penduduk dikali angka ISPA dasar, lalu dikali 1,78 yang diambil dari lonjakan sepekan di Kalimantan Tengah. Akibatnya Papua Tengah teratas karena angka ISPA lamanya tinggi, bukan karena apinya paling luas. Asapnya tetap nyata, dan Papua butuh data kasus nyata per kabupaten.",
  fbq="Pernah ikut membagikan grafik yang ternyata estimasi? Bagaimana caramu mengecek angka viral?",
  x="3,58 juta 'berpotensi ISPA' = estimasi model CELIOS, bukan pasien. Papua Tengah teratas karena angka ISPA lama, bukan luas api. #CekFakta #AUDIRA",
  thread=["3,58 juta orang berpotensi ISPA, Papua Tengah tertinggi. Tapi angka viral ini bukan hitungan pasien. #CekFakta",
          "Rumusnya: penduduk ±1,4 juta × angka ISPA dasar ±19% × 1,78 = 463 ribu berpotensi.",
          "Pengali 1,78 dari lonjakan sepekan di Kalteng, dipakai rata ke semua provinsi. Papua Selatan yang terbakar paling luas cuma 37 ribu.",
          "Asapnya tetap nyata: emisi kebakaran Papua tertinggi ke-3 dalam hampir 3 dekade (NASA). Baca angkanya, bukan cuma judulnya. #ISPA #AUDIRA"],
  threads=["3,58 juta orang berpotensi kena ISPA, dan Papua Tengah paling tinggi. Tapi angka viral ini bukan hitungan pasien. #CekFakta",
           "Itu estimasi model CELIOS: penduduk × angka ISPA dasar × 1,78. Peringkatnya lebih ditentukan angka ISPA lama, bukan luas api.",
           "Asapnya tetap nyata, dan Papua butuh data kasus nyata per kabupaten. Kamu biasanya cek apa dulu sebelum membagikan grafik?"],
  prev="Episode sebelumnya: EP02 Papua Selatan Dikepung Api."),
 "04": dict(
  title="425 Ribu Kasus ISPA, Hampir 96 Ribu Balita: Kenapa Anak Paling Rentan Asap",
  day="Sabtu, 14 November 2026", start=(9, 30),
  hook="425 ribu kasus ISPA di wilayah karhutla. Hampir satu dari lima menimpa balita.",
  cover="1 DARI 5 KASUS: BALITA",
  tags="#ISPA #Balita #KabutAsap #Kesehatan #AUDIRA",
  tiktok="Data Kemenkes sejak Agustus di 7 provinsi Sumatra dan Kalimantan: 425 ribu kasus ISPA, hampir 96 ribu pada balita. Partikel PM2.5 lebih dari 20 kali lebih kecil dari sehelai rambut. Ini cara melindungi anak di rumah.",
  pin="Sumber: Kemenkes (425.167 kasus ISPA, 95.627 balita, 18 Agu–5 Nov 2026, 7 provinsi: Riau, Jambi, Sumsel + 4 provinsi Kalimantan; bukan Papua), BBC Indonesia, IDAI (anjuran masker dan ruang bersih). Angka = kasus, bukan jumlah orang. Penyebab kematian anak belum dipastikan dokter.",
  points=["Kemenkes: 425 ribu kasus ISPA sejak Agustus di 7 provinsi Sumatra dan Kalimantan; hampir 96 ribu pada balita.",
          "Kasus harian turun dari sepuluh ribuan ke sekitar tiga ribu, tapi tetap bertambah setiap hari.",
          "PM2.5 lebih dari 20 kali lebih kecil dari sehelai rambut dan masuk sampai ujung saluran napas.",
          "Balita bernapas lebih cepat, menghirup lebih banyak udara per berat badan, dan parunya masih tumbuh.",
          "Dewasa: N95 rapat. Balita di bawah 2 tahun: satu ruang bersih (jendela tertutup, penyaring udara, AC sirkulasi dalam)."],
  audio="Dengarkan napas cepat yang melambat saat kamera keluar dari paru-paru menuju ruang bersih.",
  yt_alts=["Kenapa Balita Paling Rentan Kabut Asap?", "PM2.5 Lebih Kecil 20 Kali dari Rambut", "Cara Melindungi Balita dari Asap Karhutla"],
  ytdesc="Kemenkes mencatat 425 ribu kasus ISPA di wilayah karhutla sejak Agustus 2026, hampir 96 ribu pada balita. Video ini menjelaskan kenapa balita paling rentan terhadap partikel PM2.5, apa arti kasus harian yang turun, dan cara melindungi keluarga: masker N95 untuk dewasa dan ruang bersih untuk balita di bawah dua tahun.",
  ytags="ISPA, balita, kabut asap, PM2.5, karhutla, masker N95, ruang bersih, Kemenkes, IDAI, kesehatan anak, ISPU, Riau, Kalimantan, AUDIRA",
  thumb="Paru-paru hologram dengan partikel asap, teks 425.167 KASUS ISPA",
  fb="Sejak Agustus, Kemenkes mencatat 425 ribu kasus ISPA di tujuh provinsi Sumatra dan Kalimantan, dan hampir satu dari lima menimpa balita. Kenapa anak kecil paling rentan? Partikel asap PM2.5 lebih dari dua puluh kali lebih kecil dari sehelai rambut, balita bernapas lebih cepat dan parunya masih tumbuh. Balita di bawah dua tahun tidak dianjurkan bermasker, jadi siapkan satu ruang bersih di rumah.",
  fbq="Apa yang sudah kamu siapkan di rumah supaya anak aman saat kabut asap datang?",
  x="425 ribu kasus ISPA di wilayah karhutla sejak Agustus (Kemenkes), hampir 96 ribu balita. Balita <2 th jangan bermasker: siapkan ruang bersih. #ISPA #AUDIRA",
  thread=["425 ribu kasus ISPA di wilayah karhutla. Hampir satu dari lima menimpa balita. #ISPA",
          "Data Kemenkes sejak Agustus di 7 provinsi: Riau, Jambi, Sumsel, dan 4 provinsi Kalimantan. Satuannya kasus, bukan orang.",
          "PM2.5 >20× lebih kecil dari rambut. Balita napas lebih cepat, hirup lebih banyak udara per berat badan, paru masih tumbuh.",
          "Dewasa: N95 rapat. Balita <2 th: ruang bersih, jendela tertutup, penyaring udara. Sesak atau sulit menyusu? Segera ke faskes. #Balita #AUDIRA"],
  threads=["425 ribu kasus ISPA di wilayah karhutla, dan hampir satu dari lima menimpa balita. #ISPA",
           "Partikel PM2.5 lebih dari dua puluh kali lebih kecil dari sehelai rambut. Balita bernapas lebih cepat dan parunya masih tumbuh, jadi paling rentan.",
           "Balita di bawah dua tahun tidak dianjurkan bermasker. Siapkan satu ruang bersih dan cek ISPU daerahmu. Apa yang sudah kamu siapkan di rumah?"],
  prev="Episode sebelumnya: EP03 3,58 Juta Berpotensi ISPA?"),
 "05": dict(
  title="Asap Tak Kenal Batas: Dari Pekanbaru, Batam, sampai Malaysia",
  day="Minggu, 15 November 2026", start=(9, 30),
  hook="56 hari Pekanbaru tertutup asap. Padahal sumber apinya bukan di Riau.",
  cover="ASAP TAK KENAL BATAS",
  tags="#KabutAsap #Riau #Malaysia #Karhutla #AUDIRA",
  tiktok="56 hari Pekanbaru berasap, tapi BMKG menyebut asapnya kiriman dari Sumsel, Jambi, dan Bengkulu. Batam sempat ISPU 240. Asap dari Sumatra dan Kalimantan menyeberang ke Malaysia, sekolah di Johor ditutup. Bareskrim menetapkan 20 korporasi tersangka.",
  pin="Sumber: BMKG (asal asap Pekanbaru), Dinkes Pekanbaru (hampir 14 ribu warga ISPA, 24 Agu–18 Okt), ISPU Batam, BBC (kisah warga Malaysia), Kemlu RI, Bareskrim (20 korporasi tersangka, 4 PMA; nama belum dibuka), Walhi. Asal asap ke Malaysia: Sumatra dan Kalimantan. Peta = ilustrasi.",
  points=["Pekanbaru tertutup asap 56 hari; BMKG menyebut asapnya kiriman dari Sumsel, Jambi, dan Bengkulu.",
          "18 Oktober pagi Riau nol titik panas, tapi Pekanbaru tetap berasap; hampir 14 ribu warga kena ISPA.",
          "Batam sempat ISPU 240 (sangat tidak sehat); asap dari Sumatra dan Kalimantan menyeberang ke Malaysia, sekolah di Johor ditutup.",
          "Indonesia meratifikasi perjanjian ASEAN soal asap lintas batas tahun 2014.",
          "Bareskrim menetapkan 20 korporasi tersangka, 4 bermodal asing; nama lengkap belum dibuka."],
  audio="Dengarkan angin yang membawa asap melintasi peta dari Sumatra ke Semenanjung.",
  yt_alts=["Pekanbaru 56 Hari Berasap, Apinya Bukan di Riau", "Asap Karhutla Sampai Malaysia: Apa Kata Perjanjian ASEAN?", "20 Korporasi Tersangka Karhutla, 4 Bermodal Asing"],
  ytdesc="Pekanbaru tertutup asap 56 hari padahal sumber apinya di provinsi lain. Video ini mengikuti pergerakan asap dari Sumatera Selatan, Jambi, dan Bengkulu ke Riau, Batam, hingga Malaysia, menjelaskan perjanjian ASEAN tentang asap lintas batas yang diratifikasi Indonesia pada 2014, dan penetapan 20 korporasi tersangka oleh Bareskrim.",
  ytags="kabut asap, Pekanbaru, Riau, Batam, Malaysia, Johor, karhutla, asap lintas batas, ASEAN, ISPU, Bareskrim, korporasi, Walhi, AUDIRA",
  thumb="Peta dokumenter Sumatra–Malaysia dengan aliran asap, teks 56 HARI TERTUTUP ASAP",
  fb="Warga Pekanbaru hidup 56 hari di bawah asap, padahal pada 18 Oktober pagi Riau nol titik panas. Asapnya kiriman, terbawa angin dari Sumatera Selatan, Jambi, dan Bengkulu. Asap juga tidak berhenti di batas negara: Batam sempat ISPU 240, lalu asap dari Sumatra dan Kalimantan menyeberang ke Malaysia sampai sekolah di Johor ditutup. Di dalam negeri, Bareskrim menetapkan 20 korporasi tersangka.",
  fbq="Menurutmu, siapa yang paling harus bertanggung jawab ketika asap melewati batas provinsi dan negara?",
  x="56 hari Pekanbaru berasap, apinya bukan di Riau. Asap Sumatra & Kalimantan sampai Malaysia. Bareskrim: 20 korporasi tersangka, 4 bermodal asing. #KabutAsap #AUDIRA",
  thread=["56 hari Pekanbaru tertutup asap. Padahal sumber apinya bukan di Riau. #KabutAsap",
          "BMKG: asapnya kiriman dari Sumsel, Jambi, dan Bengkulu. 18 Okt pagi Riau nol titik panas, Pekanbaru tetap berasap.",
          "Batam sempat ISPU 240. Asap dari Sumatra dan Kalimantan menyeberang ke Malaysia; sekolah di Johor ditutup.",
          "Bareskrim menetapkan 20 korporasi tersangka, 4 bermodal asing. Asap tidak kenal batas negara. Pantau ISPU dan pakai masker. #Karhutla #AUDIRA"],
  threads=["56 hari Pekanbaru tertutup asap. Padahal sumber apinya bukan di Riau. #KabutAsap",
           "Asapnya kiriman dari Sumatera Selatan, Jambi, dan Bengkulu, lalu terus bergerak: Batam sempat ISPU 240, dan asap dari Sumatra dan Kalimantan sampai ke Malaysia.",
           "Bareskrim menetapkan 20 korporasi tersangka, empat bermodal asing. Asap tidak kenal batas negara. Menurutmu siapa yang paling harus bertanggung jawab?"],
  prev="Episode sebelumnya: EP04 425 Ribu Kasus ISPA, 95 Ribu Balita."),
}

PLAT = ["TikTok", "Instagram Reels", "YouTube Shorts", "Facebook Reels", "X/Twitter", "Threads"]

def mmss(t):
    t = int(t); return f"{t // 60}:{t % 60:02d}"

for nn, e in EPS.items():
    d = glob.glob(f"EP{nn}_*")[0]
    tl = json.load(open(f"studio/src/scenes/ep{nn}/timeline.json", encoding="utf8"))
    names = {"HOOK": "Hook", "KONTEKS": "Konteks", "PENGEMBANGAN": "Pengembangan", "PENJELASAN": "Penjelasan", "PAYOFF": "Payoff", "OUTRO": "Penutup"}
    ch = [f"{mmss(0 if k == 'HOOK' else v[0])} {names[k]}" for k, v in tl["sections"].items()]
    ch.append(f"{mmss(tl['sections']['OUTRO'][1] + 0.2)} Created by Agus Dwi R.")
    h, m = e["start"]
    times = []
    for i, p in enumerate(PLAT):
        mm = m + 15 * i
        times.append(f"- {p}: {e['day']}, {h + mm // 60:02d}.{mm % 60:02d} WIB")
    L = []
    L += [f"# SOCIAL CAPTIONS: {e['title']}", "",
          f"Seri AUDIRA · ASAP & ISPA EP{nn} (5 episode). Created by Agus Dwi R. Thumbnail: `style/cover-topic.png`. Video: `FINAL_VIDEO.mp4`.", "",
          "## TikTok", "", f"**Hook:** {e['hook']}", "", f"**Cover Text:** {e['cover']}", "", f"**Caption:** {e['tiktok']}", "",
          f"**Pinned Comment:** AUDIRA ASAP & ISPA EP{nn}. {e['pin']} {e['prev']}", "", f"**Hashtags:** {e['tags']}", "",
          "## Instagram Reels", "", "**5-Point Value Breakdown:**", ""]
    L += [f"{i}. {p}" for i, p in enumerate(e["points"], 1)]
    L += ["", f"**Caption:** {e['hook']} Simpan dan bagikan ke keluarga yang tinggal di daerah berasap. Ceritakan kondisi udara di daerahmu di komentar.", "",
          f"**Audio Cue:** {e['audio']}", "", f"**Hashtags:** {e['tags']}", "",
          "## YouTube Shorts", "", f"**Judul:** {e['title'][:95]}", "", "**Alternatif Judul:**"]
    L += [f"- {a}" for a in e["yt_alts"]]
    L += ["", "**Deskripsi:**", "", e["ytdesc"], "", "Chapters:"] + ch + ["", "Created by Agus Dwi R. AUDIRA.", "", e["tags"], "",
          f"**Tags:** {e['ytags']}", "",
          f"**Pinned Comment:** AUDIRA ASAP & ISPA EP{nn} (playlist AUDIRA ASAP & ISPA). {e['pin']} {e['prev']}", "",
          f"**Thumbnail:** {e['thumb']}", "",
          "## Facebook Reels", "", f"**Caption:** {e['fb']}", "", f"**Discussion Trigger:** {e['fbq']}", "", f"**Hashtags:** {e['tags']}", "",
          "## X/Twitter", "", f"**Cuitan tunggal:** {e['x']}", "", "**Viral Hook Thread:**", ""]
    L += [f"{i}/ {t}" for i, t in enumerate(e["thread"], 1)] + [""]
    L += ["## Threads", "", "**Post pembuka + utas:**", ""]
    for t in e["threads"]:
        L += [t, ""]
    L += ["## Jadwal Upload (WIB)", "",
          f"Hari: {e['day']}. Satu episode per hari selama berita masih hangat; slot {'siang' if h < 12 and h >= 11 else 'pagi akhir pekan'} dipilih agar tidak bertabrakan dengan slot malam seri lain (default awal pola penonton Indonesia, bukan data akun; ganti dengan jam aktif follower dari TikTok Analytics, Instagram Insights, YouTube Studio setelah 2-4 minggu).", ""]
    L += times
    L += ["", "## Label Konten AI", "", "Centang label AI di tiap platform karena VO (Cartesia) dan visual dibuat dengan AI:",
          "- TikTok: AI-generated content", "- YouTube: Altered or synthetic content", "- Meta (Facebook dan Instagram): AI info", "",
          "## Catatan Upload", "", f"- Teks cover (3-5 kata) semua platform: {e['cover']}",
          "- Upload `SUBTITLES.srt` ke YouTube Shorts dan Facebook.",
          f"- Seri: AUDIRA · ASAP & ISPA EP{nn}, playlist AUDIRA ASAP & ISPA. {e['prev']} (tambahkan tautannya di komentar pin setelah tayang).",
          "- Berita bencana yang masih berjalan: cek ulang status titik panas dan ISPU sebelum upload.",
          "- Musik: bed prosedural buatan sendiri (bebas lisensi), SFX dari pustaka AUDIRA `shared/assets/sfx` (lihat research/SOURCE_REGISTER.md).", ""]
    open(f"{d}/SOCIAL_CAPTIONS.md", "w", encoding="utf8").write("\n".join(L))
    print(d, "captions ok")
