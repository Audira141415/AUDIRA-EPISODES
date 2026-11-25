"""Write SOCIAL_CAPTIONS.md (6 platforms + Jadwal Upload (WIB) + Label Konten AI) for each episode.
Run from the series folder: python _tools/write_captions.py
Facts come only from the approved scripts (docs/SCRIPT.md) and research HIGH items (MED items are attributed)."""
import json, glob, sys

SERIES = "AUDIRA · BERITA VIRAL"

EPS = {
 "01": dict(
  title="Gibran Niat Mundur dari Wapres: Mundur atau Bertahan?",
  day="Rabu, 11 November 2026", start=(19, 0),
  hook="Istana bilang Wapres Gibran ingin mundur. Gibran bilang tetap berjuang. Jadi, mana yang benar?",
  cover="MUNDUR ATAU BERTAHAN?",
  tags="#Gibran #Wapres #BeritaHariIni #PolitikIndonesia #AUDIRA",
  tiktok="Selasa 10 November, Mensesneg Prasetyo Hadi mengumumkan Wapres Gibran menyatakan niat mengundurkan diri setelah bertemu Presiden Prabowo sekitar 2,5 jam. Tapi Gibran bilang akan tetap fight di PTUN, dan kuasa hukumnya membantah ada rencana mundur. Statusnya: masih niat, belum surat.",
  pin="Sumber: konferensi pers Mensesneg 10 Nov 2026 (Kompas, CNN Indonesia, Hukumonline, ANTARA), Putusan MA 742 K/TUN/2026, Pasal 8 ayat 2 UUD 1945, arsip surat Hatta 1956 (CNBC Insight). Per 11 Nov pagi belum ada surat pengunduran diri. Visual sketsa = ilustrasi, bukan wajah asli.",
  points=["Mensesneg: Gibran menyatakan niat mundur setelah bertemu Presiden ±2,5 jam (10 Nov 2026).",
          "Pemicunya: MA membatalkan surat penyetaraan ijazah SMA Gibran untuk Pilpres 2024 (742 K/TUN/2026).",
          "Gibran tidak mengucapkan kata mundur; ia akan tetap fight di PTUN. Kuasa hukumnya membantah rencana mundur.",
          "Kalau kursi wapres kosong: Presiden usul 2 nama, MPR memilih paling lambat 60 hari (Pasal 8 ayat 2 UUD 1945).",
          "Wapres pertama yang pernah mundur: Mohammad Hatta, 1956, lewat sepucuk surat."],
  audio="Dengarkan hentakan stempel DIBATALKAN saat putusan MA dibacakan.",
  yt_alts=["Niat Mundur atau Tetap Fight? Membedah Kabar Gibran", "Kalau Wapres Mundur, Siapa Penggantinya? Ini Aturan UUD", "Dari Hatta 1956 ke Gibran 2026: Wapres yang Ingin Mundur"],
  ytdesc="Selasa 10 November 2026, Istana mengumumkan Wapres Gibran Rakabuming Raka menyatakan niat mengundurkan diri, di tengah putusan MA yang membatalkan surat penyetaraan ijazah SMA-nya. Video ini membedah apa yang sebenarnya terjadi: niat belum berarti mundur, sikap Gibran yang tetap berjuang di PTUN, bantahan kuasa hukum, usulan hak menyatakan pendapat di DPR, aturan pengganti wapres di Pasal 8 UUD 1945, dan preseden Mohammad Hatta 1956.",
  ytags="Gibran, Gibran mundur, wakil presiden, Prabowo, Prasetyo Hadi, putusan MA, ijazah Gibran, PTUN, hak menyatakan pendapat, Pasal 8 UUD 1945, MPR, Mohammad Hatta, berita hari ini, AUDIRA",
  thumb="Sketsa pensil ruang kerja Wapres dengan tiga tokoh berkartu nama dan amplop bersegel, teks MUNDUR ATAU BERTAHAN?",
  fb="Kabar Wapres Gibran ingin mundur bikin ramai sejak Selasa sore. Tapi kalau dilihat pelan-pelan, yang diumumkan Istana adalah niat, bukan surat pengunduran diri. Gibran sendiri bilang akan tetap fight di PTUN, dan kuasa hukumnya malah membantah. Ibarat orang bilang ingin pindah rumah, tapi belum mengemasi barang. Kalau kursi wapres benar-benar kosong, UUD sudah mengatur: Presiden mengusulkan dua nama, MPR memilih paling lambat 60 hari.",
  fbq="Menurutmu, Gibran akhirnya mundur atau bertahan?",
  x="Istana: Wapres Gibran berniat mundur. Gibran: tetap fight di PTUN. Kuasa hukum: tidak ada rencana mundur. Status 11 Nov: masih niat, belum surat. #Gibran #AUDIRA",
  thread=["Wapres Gibran ingin mundur atau tetap bertahan? Ini yang sebenarnya diumumkan 10 Nov 2026. #Gibran",
          "Mensesneg: Gibran menyatakan niat mundur setelah bertemu Presiden ±2,5 jam. Presiden tidak menolak, hanya memberi saran.",
          "Pemicunya putusan MA 742 K/TUN/2026: surat penyetaraan ijazah SMA Gibran untuk Pilpres 2024 dibatalkan.",
          "Gibran tidak mengucapkan kata mundur; ia akan tetap fight di PTUN. Kuasa hukumnya membantah rencana mundur.",
          "Kalau kursi wapres kosong: Presiden usul 2 nama, MPR memilih ≤60 hari (Pasal 8 UUD 1945). Preseden: Hatta, 1956. #Wapres #AUDIRA"],
  threads=["Istana bilang Wapres Gibran ingin mundur. Gibran bilang tetap berjuang. Jadi mana yang benar? #Gibran",
           "Yang diumumkan Mensesneg 10 Nov adalah niat, bukan surat. Gibran akan tetap fight di PTUN, dan kuasa hukumnya membantah rencana mundur. Di DPR, usulan hak menyatakan pendapat sudah di meja pimpinan.",
           "Kalau kursi wapres benar-benar kosong, Pasal 8 UUD 1945 mengatur: Presiden usul dua nama, MPR memilih paling lambat 60 hari. Wapres pertama yang pernah mundur: Mohammad Hatta, 1956. Menurutmu, mundur atau bertahan?"],
  prev="Episode pertama seri ini.",
  check="Berita politik yang masih berjalan: cek ulang status Gibran (niat vs surat resmi) tepat sebelum upload; bila sudah ada surat resmi, jangan upload versi ini tanpa revisi."),
 "02": dict(
  title="19 Pahlawan Nasional Baru 2026: Dari Hoegeng sampai Kakek Presiden",
  day="Kamis, 12 November 2026", start=(19, 0),
  hook="Ada lelucon yang sering dikaitkan dengan Gus Dur: polisi jujur cuma tiga. Polisi tidur, patung polisi, dan Hoegeng. Hari ini, yang ketiga resmi jadi Pahlawan Nasional.",
  cover="19 PAHLAWAN NASIONAL BARU",
  tags="#PahlawanNasional #HariPahlawan #Hoegeng #SejarahIndonesia #AUDIRA",
  tiktok="Hari Pahlawan 2026: Presiden Prabowo menganugerahkan gelar Pahlawan Nasional kepada 19 tokoh dari 12 provinsi lewat Keppres 93/TK/2026. Ada Hoegeng, Ali Sadikin, Mohamad Roem, Ali Sastroamidjojo, Sutan Takdir Alisjahbana, sampai Kiai Wasyid. Satu nama memancing perdebatan: Margono Djojohadikusumo, kakek Presiden.",
  pin="Sumber: Keppres 93/TK/Tahun 2026 (Kompas, CNN Indonesia, ANTARA, Bloomberg Technoz), keterangan Menteri Kebudayaan Fadli Zon dan Mensos Saifullah Yusuf, keluarga Hoegeng (Kompas). Klaim 'rekor' adalah pernyataan Fadli Zon. Kritik sejarawan dikutip dari Tempo via Ruang.id. Lelucon 'tiga polisi jujur' sering dikaitkan dengan Gus Dur, bukan kutipan rekaman.",
  points=["19 tokoh dari 12 provinsi jadi Pahlawan Nasional pada 10 November 2026 (Keppres 93/TK/2026).",
          "Hoegeng, Kapolri 1968–1971, dikenal menolak suap; cucunya bercerita tamu wajib menulis buku mutasi.",
          "Ada Ali Sadikin, Mohamad Roem, Ali Sastroamidjojo, Sutan Takdir Alisjahbana, dan Kiai Wasyid (Geger Cilegon 1888).",
          "Jalur gelar: tim peneliti kabupaten/kota → provinsi → Kementerian Sosial → Dewan Gelar → Presiden.",
          "Margono Djojohadikusumo (pendiri BNI, kakek Presiden): pemerintah menyebut memenuhi syarat, sejumlah sejarawan mengkritik konflik kepentingan."],
  audio="Dengarkan langkah kamera menyusuri aula prasasti marmer saat tiap nama disebut.",
  yt_alts=["Polisi Jujur Cuma Tiga: Hoegeng Akhirnya Pahlawan Nasional", "Siapa Saja 19 Pahlawan Nasional 2026?", "Kakek Presiden Jadi Pahlawan Nasional: Kenapa Diperdebatkan?"],
  ytdesc="Pada Hari Pahlawan, 10 November 2026, Presiden Prabowo menganugerahkan gelar Pahlawan Nasional kepada 19 tokoh dari 12 provinsi lewat Keppres 93/TK/2026. Video ini mengenalkan sebagian nama (Hoegeng, Ali Sadikin, Mohamad Roem, Ali Sastroamidjojo, Sutan Takdir Alisjahbana, Kiai Wasyid), menjelaskan jalur pengusulan gelar, dan perdebatan seputar Margono Djojohadikusumo, kakek Presiden.",
  ytags="pahlawan nasional 2026, Hari Pahlawan, Hoegeng, Ali Sadikin, Mohamad Roem, Ali Sastroamidjojo, Sutan Takdir Alisjahbana, Kiai Wasyid, Margono Djojohadikusumo, Keppres 93/TK/2026, Fadli Zon, sejarah Indonesia, AUDIRA",
  thumb="Aula museum malam dengan prasasti marmer berderet dan plakat Hoegeng di depan, teks 19 PAHLAWAN NASIONAL BARU",
  fb="Ada lelucon lama: polisi jujur di Indonesia cuma tiga, polisi tidur, patung polisi, dan Hoegeng. Hari Pahlawan kemarin, yang ketiga resmi jadi Pahlawan Nasional, bersama 18 tokoh lain dari 12 provinsi. Gelar ini tidak turun begitu saja: usulnya naik berjenjang dari kabupaten sampai Presiden. Tapi satu nama memancing diskusi, yaitu Margono Djojohadikusumo, pendiri BNI sekaligus kakek Presiden Prabowo.",
  fbq="Dari 19 nama itu, tokoh mana yang paling kamu kenal ceritanya?",
  x="19 Pahlawan Nasional baru, 12 provinsi (Keppres 93/TK/2026). Ada Hoegeng, Ali Sadikin, Mohamad Roem, sampai Kiai Wasyid. Siapa yang paling kamu kenal? #PahlawanNasional #AUDIRA",
  thread=["Polisi jujur cuma tiga: polisi tidur, patung polisi, dan Hoegeng. Kini Hoegeng resmi Pahlawan Nasional. #PahlawanNasional",
          "10 Nov 2026, Presiden Prabowo memberi gelar Pahlawan Nasional kepada 19 tokoh dari 12 provinsi lewat Keppres 93/TK/2026.",
          "Di antaranya Ali Sadikin, Mohamad Roem, Ali Sastroamidjojo, Sutan Takdir Alisjahbana, dan Kiai Wasyid dari Geger Cilegon 1888.",
          "Satu nama diperdebatkan: Margono Djojohadikusumo, kakek Presiden. Pemerintah: memenuhi syarat. Sejarawan: konflik kepentingan. #HariPahlawan #AUDIRA"],
  threads=["Ada lelucon yang sering dikaitkan dengan Gus Dur: polisi jujur cuma tiga. Polisi tidur, patung polisi, dan Hoegeng. Kini Hoegeng resmi Pahlawan Nasional. #PahlawanNasional",
           "Ia satu dari 19 tokoh dari 12 provinsi yang diberi gelar pada Hari Pahlawan 2026, bersama Ali Sadikin, Mohamad Roem, Ali Sastroamidjojo, Sutan Takdir Alisjahbana, dan Kiai Wasyid.",
           "Satu nama memancing perdebatan: Margono Djojohadikusumo, pendiri BNI dan kakek Presiden. Tokoh mana yang paling kamu kenal?"],
  prev="Episode sebelumnya: EP01 Gibran Niat Mundur dari Wapres.",
  check="Sebelum upload, pastikan ejaan 19 nama di caption sama dengan daftar Keppres di research/RESEARCH_REPORT.md."),
 "03": dict(
  title="2 Juta Serangan Siber Sehari ke Indonesia: Diblokir, Bukan Dibobol",
  day="Jumat, 13 November 2026", start=(19, 0),
  hook="Dua juta serangan siber ke Indonesia dalam sehari. Kedengarannya horor. Tapi angka ini bukan jumlah bank yang jebol.",
  cover="DIBLOKIR, BUKAN DIBOBOL",
  tags="#SeranganSiber #KeamananSiber #Bank #OTP #AUDIRA",
  tiktok="Peta ancaman FortiGuard ramai dibagikan: lebih dari 1,2 juta upaya serangan ke sektor keuangan dalam 24 jam, 2,1 juta ke seluruh Indonesia, 7,3 juta sepekan. Semuanya benar, beda periode dan cakupan. Dan yang dicatat adalah upaya yang diblokir, bukan bank yang dibobol.",
  pin="Sumber: dashboard FortiGuard Labs via detikFinance, CNBC Indonesia, Kompas.id (9–10 Nov 2026); OJK (Dian Ediana Rae); BSSN (Jubir Prabaswari, 151 tim tanggap insiden); Alfons Tanujaya, Vaksincom. Angka dashboard berubah setiap saat dan mencatat upaya, bukan pembobolan. Visual hologram = ilustrasi.",
  points=["Lebih dari 1,2 juta upaya serangan ke sektor keuangan dalam 24 jam (s.d. Senin malam, 9 Nov).",
          "2,1 juta = total seluruh Indonesia per Selasa; 7,3 juta = hitungan sepekan. Beda periode dan cakupan.",
          "Dashboard mencatat upaya yang tertangkap perangkat keamanan, bukan jumlah pembobolan (BSSN).",
          "OJK berkoordinasi dengan tim IT bank sejak Jumat dan meminta transaksi tidak wajar ditunda untuk verifikasi.",
          "Bagian kita: jangan bagikan kode OTP, jangan pasang aplikasi dari tautan asing."],
  audio="Dengarkan dentum serangan yang pecah di kubah firewall.",
  yt_alts=["1,2 Juta, 2,1 Juta, 7,3 Juta: Kenapa Angka Serangan Siber Beda-beda?", "Bank Indonesia Diserang Jutaan Kali? Ini Penjelasannya", "Serangan Siber Bukan Berarti Bank Jebol"],
  ytdesc="Angka jutaan serangan siber ke Indonesia ramai dibagikan pada 9–10 November 2026. Video ini membedah dari mana angkanya (dashboard FortiGuard), kenapa 1,2 juta, 2,1 juta, dan 7,3 juta sama-sama benar, apa beda upaya serangan dengan pembobolan, langkah OJK dan BSSN, serta dua kebiasaan yang melindungi rekeningmu.",
  ytags="serangan siber, keamanan siber, bank, FortiGuard, OJK, BSSN, Vaksincom, Alfons Tanujaya, OTP, phishing, aplikasi APK, keamanan rekening, AUDIRA",
  thumb="Peta hologram kepulauan Indonesia di bawah kubah firewall dengan panah serangan merah pecah, teks DIBLOKIR, BUKAN DIBOBOL",
  fb="Angka dua juta serangan siber sehari memang bikin panik. Tapi angka itu seperti satpam yang mencatat setiap orang mencurigakan di depan pagar, bukan jumlah rumah yang kemasukan maling. Bedanya angka 1,2 juta, 2,1 juta, dan 7,3 juta pun cuma soal periode dan cakupan. Regulator tetap siaga: OJK minta transaksi tidak wajar ditunda, BSSN menyiagakan 151 tim. Bagian kita: jangan bagikan OTP, jangan pasang aplikasi dari tautan asing.",
  fbq="Pernah dapat pesan minta kode OTP atau tautan aplikasi aneh? Ceritakan di komentar supaya yang lain waspada.",
  x="1,2 juta (sektor keuangan, 24 jam), 2,1 juta (seluruh RI), 7,3 juta (sepekan): semuanya upaya yang tercatat, bukan bank yang dibobol. Jangan bagikan OTP. #SeranganSiber #AUDIRA",
  thread=["Dua juta serangan siber sehari ke Indonesia. Kedengarannya horor, tapi itu bukan jumlah bank yang jebol. #SeranganSiber",
          "1,2 juta = sektor keuangan, 24 jam s.d. Senin malam. 2,1 juta = seluruh Indonesia, per Selasa. 7,3 juta = sepekan.",
          "Dashboard mencatat upaya yang tertangkap perangkat keamanan. BSSN: itu bukan jumlah pembobolan.",
          "OJK minta transaksi tidak wajar ditunda untuk verifikasi; BSSN siagakan 151 tim. Kamu: jangan bagikan OTP. #KeamananSiber #AUDIRA"],
  threads=["Dua juta serangan siber sehari ke Indonesia. Kedengarannya horor, tapi angka ini bukan jumlah bank yang jebol. #SeranganSiber",
           "1,2 juta itu sektor keuangan per Senin malam, 2,1 juta total seluruh Indonesia per Selasa, 7,3 juta hitungan sepekan. Semuanya benar, hanya beda periode dan cakupan. Yang dicatat adalah upaya yang diblokir.",
           "Regulator tetap siaga: OJK minta transaksi tidak wajar ditunda, BSSN menyiagakan 151 tim. Bagian kita: jangan bagikan OTP dan jangan pasang aplikasi dari tautan asing. Pernah dapat pesan mencurigakan?"],
  prev="Episode sebelumnya: EP02 19 Pahlawan Nasional Baru 2026.",
  check="Cek apakah ada laporan resmi insiden pembobolan bank di Indonesia sebelum upload; bila ada, tambahkan konteksnya di komentar pin."),
 "05": dict(
  title="GTA 6 Butuh 212 GB: Kenapa Pre-load Dibuka 9 Hari Sebelum Rilis?",
  day="Sabtu, 14 November 2026", start=(19, 0),
  hook="212 gigabyte. Itu ukuran satu game. Dan sejak 10 November, pemain sudah boleh mengunduhnya.",
  cover="212 GB UNTUK SATU GAME",
  tags="#GTA6 #BeritaGame #PS5 #Xbox #AUDIRA",
  tiktok="GTA 6 rilis Kamis 19 November untuk PS5 dan Xbox Series, tapi pre-load sudah dibuka 10 November. Ukurannya sampai 212 GB, lebih dari separuh ruang Xbox Series S. Sensor Tower memperkirakan 7,71 juta pre-order digital, sekitar US$751 juta. Itu estimasi, bukan penjualan resmi.",
  pin="Sumber: FAQ pre-load Rockstar via Engadget, RRI, Marketing.co.id (10 Nov 2026); estimasi Sensor Tower via Kompas dan Liputan6 (bukan data resmi Rockstar/Take-Two); harga PlayStation Store Indonesia via VIVA; Take-Two via Variety/Gizmologi. Tanpa aset resmi GTA; visual = ilustrasi.",
  points=["GTA 6 rilis Kamis, 19 November 2026 untuk PS5 dan Xbox Series; pre-load dibuka 10 November.",
          "Ukuran unduhan sampai 212 GB, lebih dari separuh ruang pakai Xbox Series S.",
          "Sensor Tower memperkirakan 7,71 juta pre-order digital, sekitar US$751 juta (estimasi, bukan penjualan resmi).",
          "Edisi standar di PlayStation Store Indonesia: Rp1,19 juta; versi fisik berisi kode unduhan, tanpa cakram.",
          "Versi PC belum diumumkan."],
  audio="Dengarkan aliran data yang mengisi tumpukan chip sampai 212 GB.",
  yt_alts=["212 GB untuk Satu Game: Siapkan Ruang Sebelum 19 November", "Kenapa GTA 6 Bisa Diunduh Sebelum Rilis?", "Rp13 Triliun Sebelum Rilis? Membaca Angka Pre-order GTA 6"],
  ytdesc="GTA 6 dijadwalkan rilis 19 November 2026 untuk PS5 dan Xbox Series, dan pre-load sudah dibuka sejak 10 November. Video ini menjelaskan ukuran unduhan 212 GB, kenapa pre-load membantu, estimasi Sensor Tower soal pre-order (7,71 juta, sekitar US$751 juta, bukan angka resmi), harga edisi standar di PlayStation Store Indonesia, versi fisik tanpa cakram, dan status versi PC.",
  ytags="GTA 6, GTA VI, pre-load GTA 6, ukuran GTA 6, 212 GB, rilis GTA 6, harga GTA 6 Indonesia, PS5, Xbox Series S, Sensor Tower, Take-Two, berita game, AUDIRA",
  thumb="Makro papan SSD dengan tumpukan chip menyala berlabel 212 GB dan siluet kota pantai senja, teks 212 GB UNTUK SATU GAME",
  fb="Bayangkan satu game makan 212 GB, lebih dari separuh ruang Xbox Series S. Itulah GTA 6, yang rilis 19 November tapi sudah bisa diunduh sejak 10 November. Kenapa duluan? Supaya jutaan pemain tidak mengunduh bersamaan di hari rilis. Antusiasmenya juga terlihat dari estimasi Sensor Tower: 7,71 juta pre-order digital. Ingat, itu estimasi, bukan angka penjualan resmi.",
  fbq="Kamu main di konsol apa, dan ruangnya sudah siap 212 GB?",
  x="GTA 6: 212 GB, pre-load sejak 10 Nov, rilis 19 Nov (PS5 & Xbox Series). Sensor Tower: ±7,71 juta pre-order digital (estimasi). Versi PC belum diumumkan. #GTA6 #AUDIRA",
  thread=["212 GB. Itu ukuran satu game, dan sejak 10 November pemain sudah boleh mengunduhnya. #GTA6",
          "GTA 6 rilis Kamis 19 November untuk PS5 dan Xbox Series. Pre-load dibuka 9 hari lebih awal; game baru bisa dimainkan saat rilis.",
          "212 GB lebih dari separuh ruang pakai Xbox Series S. Pre-load membagi beban unduhan sebelum hari H.",
          "Sensor Tower: ±7,71 juta pre-order digital, ±US$751 juta (estimasi, bukan resmi). Versi PC belum diumumkan. #BeritaGame #AUDIRA"],
  threads=["212 gigabyte. Itu ukuran satu game, dan sejak 10 November pemain sudah boleh mengunduhnya. #GTA6",
           "GTA 6 rilis 19 November untuk PS5 dan Xbox Series. 212 GB itu lebih dari separuh ruang pakai Xbox Series S, jadi pre-load membagi beban unduhan sebelum hari rilis.",
           "Sensor Tower memperkirakan 7,71 juta pre-order digital (estimasi, bukan angka resmi). Edisi standar di PlayStation Store Indonesia Rp1,19 juta, versi PC belum diumumkan. Kamu main di konsol apa?"],
  prev="Episode sebelumnya: EP03 Serangan Siber Sehari ke Indonesia.",
  check="Cek ulang tanggal rilis dan harga di PlayStation Store Indonesia sebelum upload (rilis sempat diundur di masa lalu)."),
 "06": dict(
  title="Kalau Wapres Mundur, Siapa Gantinya? Sejarah Kursi Wapres yang Pernah Kosong",
  day="Kamis, 12 November 2026", start=(12, 0),
  hook="Wakil presiden ingin mundur. Indonesia pernah mengalaminya sekali, dan kursinya kosong enam belas tahun.",
  cover="KALAU WAPRES MUNDUR?",
  tags="#Gibran #Wapres #SejarahIndonesia #UUD1945 #AUDIRA",
  tiktok="Kalau Wapres benar mundur, tidak ada pemilu ulang. Pasal 8 ayat 2 UUD 1945: Presiden usul dua nama, MPR memilih paling lambat 60 hari. Sejarahnya? Hatta mundur 1 Desember 1956, kursinya kosong sampai 1973. Habibie memimpin tanpa wakil, dan MPR memilih Hamzah Haz di 2001.",
  pin="Sumber: Pasal 8 ayat 2 UUD 1945 (dikutip Kompas.com 11 Nov 2026), Tirto, CNBC Indonesia Research (mengutip Jurnal Majelis MPR dan ANRI), MetroTV, detikNews (Hamzah Haz 26 Juli 2001), Wikipedia (surat Hatta 20 Juli dan 23 Nov 1956). Status per 11 Nov 2026: Gibran baru menyatakan niat, belum ada surat resmi.",
  points=["10 Nov 2026: Wapres Gibran menyampaikan niat mundur ke Presiden Prabowo. Statusnya masih niat, belum surat resmi.",
          "Kalau mundur: tidak ada pemilu ulang. Presiden usul 2 nama, MPR memilih paling lambat 60 hari (Pasal 8 ayat 2 UUD 1945).",
          "Pemakzulan beda jalur: DPR, lalu Mahkamah Konstitusi, lalu MPR. Selama kursi kosong, pemerintahan tetap jalan.",
          "Mohammad Hatta menyurati DPR Juli 1956 dan resmi berhenti 1 Desember 1956. Kursi wapres kosong sampai Sri Sultan HB IX menjabat 1973.",
          "Habibie memimpin 1998–1999 tanpa wakil. MPR memilih Hamzah Haz di tengah masa jabatan, 26 Juli 2001."],
  audio="Dengarkan desir waktu berputar mundur saat kursi kembali ke 1945.",
  yt_alts=["Wapres Mundur, Apa yang Terjadi? Pasal 8 UUD Dijelaskan", "Hatta 1956: Satu-satunya Wapres yang Pernah Mundur", "Kursi Wapres Pernah Kosong 16 Tahun, Ini Ceritanya"],
  ytdesc="Wapres Gibran Rakabuming Raka menyampaikan niat mundur kepada Presiden Prabowo pada 10 November 2026. Kalau benar mundur, apa yang terjadi? Video ini menjelaskan Pasal 8 ayat 2 UUD 1945 (Presiden mengusulkan dua calon, MPR memilih paling lambat 60 hari), bedanya dengan jalur pemakzulan, dan sejarah kursi wakil presiden: Mohammad Hatta mundur 1956, kursi kosong sampai 1973, Habibie tanpa wakil 1998–1999, dan Hamzah Haz dipilih MPR pada 2001. Status per 11 November 2026: masih niat, belum surat resmi.",
  ytags="wapres mundur, Gibran mundur, Pasal 8 UUD 1945, MPR, pengganti wapres, Mohammad Hatta 1956, kursi wapres kosong, Habibie tanpa wakil, Hamzah Haz 2001, pemakzulan, sejarah Indonesia, AUDIRA",
  thumb="Kursi wakil presiden navy di atas panggung dengan pita KOSONG setengah tergulung, odometer tahun 2026, teks KALAU WAPRES MUNDUR?",
  fb="Bayangkan kursi di ruang rapat yang tiba-tiba kosong. Rapat tetap jalan, tapi semua orang bertanya siapa yang akan duduk di sana. Itulah yang diatur Pasal 8 ayat 2 UUD 1945: kalau wapres mundur, Presiden mengusulkan dua nama dan MPR memilih paling lambat 60 hari. Indonesia pernah mengalaminya. Mohammad Hatta mundur tahun 1956, dan kursinya kosong lebih dari enam belas tahun. Sekarang, Gibran baru menyatakan niat, belum surat resmi.",
  fbq="Menurutmu, kursi wapres akan kosong lagi?",
  x="Kalau Wapres mundur: tidak ada pemilu ulang. Presiden usul 2 nama, MPR pilih ≤60 hari (Pasal 8 UUD). Hatta mundur 1956, kursi kosong sampai 1973. #Wapres #AUDIRA",
  thread=["Kalau Wapres Gibran benar mundur, apa yang terjadi? Dan pernahkah ini terjadi? #Wapres",
          "Pasal 8 ayat 2 UUD 1945: Presiden usul dua nama, MPR memilih paling lambat 60 hari. Tidak ada pemilu ulang.",
          "Pemakzulan beda jalur: DPR, lalu MK, lalu MPR. Selama kursi kosong, pemerintahan tetap jalan.",
          "Hatta menyurati DPR Juli 1956, berhenti 1 Des 1956. Kursi wapres kosong sampai 1973. Habibie memimpin tanpa wakil 1998–1999.",
          "MPR pernah memilih wapres di tengah masa jabatan: Hamzah Haz, 26 Juli 2001. Status Gibran per 11 Nov: masih niat. #SejarahIndonesia #AUDIRA"],
  threads=["Wakil presiden ingin mundur. Indonesia pernah mengalaminya sekali, dan kursinya kosong enam belas tahun. #Wapres",
           "Kalau benar mundur, Pasal 8 ayat 2 UUD 1945 mengatur: Presiden usul dua nama, MPR memilih paling lambat 60 hari. Beda dengan pemakzulan yang lewat DPR, MK, lalu MPR.",
           "Hatta mundur 1 Desember 1956, kursi kosong sampai 1973. Habibie tanpa wakil 1998–1999. MPR memilih Hamzah Haz tahun 2001. Menurutmu, kursi ini akan kosong lagi?"],
  prev="Episode sebelumnya: EP01 Gibran Niat Mundur dari Wapres.",
  check="Berita politik yang masih berjalan: cek ulang status Gibran (niat vs surat resmi) tepat sebelum upload; bila sudah ada surat resmi atau MPR sudah bersidang, revisi teks status sebelum upload."),
}

PLAT = ["TikTok", "Instagram Reels", "YouTube Shorts", "Facebook Reels", "X/Twitter", "Threads"]

def mmss(t):
    t = int(t); return f"{t // 60}:{t % 60:02d}"

ONLY = sys.argv[1:]
for nn, e in EPS.items():
    if ONLY and nn not in ONLY:
        continue
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
          f"Seri {SERIES} EP{nn}. Created by Agus Dwi R. Thumbnail: `style/cover-topic.png`. Video: `FINAL_VIDEO.mp4`.", "",
          "## TikTok", "", f"**Hook:** {e['hook']}", "", f"**Cover Text:** {e['cover']}", "", f"**Caption:** {e['tiktok']}", "",
          f"**Pinned Comment:** AUDIRA BERITA VIRAL EP{nn}. {e['pin']} {e['prev']}", "", f"**Hashtags:** {e['tags']}", "",
          "## Instagram Reels", "", "**5-Point Value Breakdown:**", ""]
    L += [f"{i}. {p}" for i, p in enumerate(e["points"], 1)]
    L += ["", f"**Caption:** {e['hook']} Simpan dan bagikan ke teman yang ikut membahas berita ini. Tulis pendapatmu di komentar.", "",
          f"**Audio Cue:** {e['audio']}", "", f"**Hashtags:** {e['tags']}", "",
          "## YouTube Shorts", "", f"**Judul:** {e['title'][:95]}", "", "**Alternatif Judul:**"]
    L += [f"- {a}" for a in e["yt_alts"]]
    L += ["", "**Deskripsi:**", "", e["ytdesc"], "", "Chapters:"] + ch + ["", "Created by Agus Dwi R. AUDIRA.", "", e["tags"], "",
          f"**Tags:** {e['ytags']}", "",
          f"**Pinned Comment:** AUDIRA BERITA VIRAL EP{nn} (playlist AUDIRA Berita Viral). {e['pin']} {e['prev']}", "",
          f"**Thumbnail:** {e['thumb']}", "",
          "## Facebook Reels", "", f"**Caption:** {e['fb']}", "", f"**Discussion Trigger:** {e['fbq']}", "", f"**Hashtags:** {e['tags']}", "",
          "## X/Twitter", "", f"**Cuitan tunggal:** {e['x']}", "", "**Viral Hook Thread:**", ""]
    L += [f"{i}/ {t}" for i, t in enumerate(e["thread"], 1)] + [""]
    L += ["## Threads", "", "**Post pembuka + utas:**", ""]
    for t in e["threads"]:
        L += [t, ""]
    L += ["## Jadwal Upload (WIB)", "",
          f"Hari: {e['day']}. Berita cepat basi, jadi satu episode per hari mulai 11 Nov di slot malam utama 19.00–20.15 WIB (seri ASAP & ISPA memakai slot siang 11–15 Nov). Default awal pola penonton Indonesia, bukan data akun; ganti dengan jam aktif follower dari TikTok Analytics, Instagram Insights, YouTube Studio setelah 2-4 minggu.", ""]
    L += times
    L += ["", "## Label Konten AI", "", "Centang label AI di tiap platform karena VO (Cartesia) dan visual dibuat dengan AI:",
          "- TikTok: AI-generated content", "- YouTube: Altered or synthetic content", "- Meta (Facebook dan Instagram): AI info", "",
          "## Catatan Upload", "", f"- Teks cover (3-5 kata) semua platform: {e['cover']}",
          "- Upload `SUBTITLES.srt` ke YouTube Shorts dan Facebook.",
          f"- Seri: {SERIES} EP{nn}, playlist AUDIRA Berita Viral. {e['prev']} (tambahkan tautannya di komentar pin setelah tayang).",
          f"- {e['check']}",
          "- Musik: bed prosedural buatan sendiri (bebas lisensi), SFX dari pustaka AUDIRA `shared/assets/sfx` (lihat research/SOURCE_REGISTER.md).", ""]
    open(f"{d}/SOCIAL_CAPTIONS.md", "w", encoding="utf8").write("\n".join(L))
    print(d, "captions ok")
