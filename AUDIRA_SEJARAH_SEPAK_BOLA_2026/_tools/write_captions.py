"""Write SOCIAL_CAPTIONS.md (6 platforms + Jadwal Upload (WIB) + Label Konten AI) for each episode of batch 1.
Run from the series folder: python -X utf8 _tools/write_captions.py [01 02 ...]
Facts come only from the approved scripts (docs/SCRIPT.md) and HIGH rows of each research/RESEARCH_REPORT.md.
Channel: AUDIRA Sport Facts (@AudiraSportFacts), playlist "Sejarah Sepak Bola"."""
import json, glob, sys

SERIES = "AUDIRA · SEJARAH SEPAK BOLA"
CH = "AUDIRA Sport Facts (@AudiraSportFacts)"
PLAYLIST = "Sejarah Sepak Bola — AUDIRA"

EPS = {
 "01": dict(
  title="Cuma 8 Negara Pernah Juara Dunia: Semua Juara Piala Dunia 1930–2026",
  day="Jumat, 13 November 2026", start=(19, 0),
  hook="23 kali Piala Dunia digelar. Juaranya? Cuma 8 negara.",
  cover="CUMA 8 NEGARA",
  tags="#PialaDunia #SejarahSepakBola #SepakBola #FIFAWorldCup #AUDIRA",
  tiktok="Dari 1930 sampai 2026, Piala Dunia sudah digelar 23 kali, tapi juaranya cuma 8 negara: Brasil 5, Italia 4, Jerman 4, Argentina 3, Uruguay 2, Prancis 2, Spanyol 2, Inggris 1. Juara terbaru Spanyol, 1–0 atas Argentina lewat gol Ferran Torres menit 106. Semua juara dari Eropa dan Amerika Selatan.",
  pin="Sumber: daftar final Piala Dunia FIFA (Wikipedia EN/ID, dicek silang dengan ESPN, Reuters, AP untuk final 2026), kisah trofi Jules Rimet dan anjing Pickles (Wikipedia, beberapa sumber). Jerman 4 gelar: 3 di antaranya atas nama Jerman Barat. Data per 11 Nov 2026.",
  points=["Piala Dunia putra sudah digelar 23 kali (1930–2026); edisi 1942 dan 1946 batal karena Perang Dunia II.",
          "Cuma 8 negara pernah juara: Brasil 5, Italia 4, Jerman 4, Argentina 3, Uruguay 2, Prancis 2, Spanyol 2, Inggris 1.",
          "Final 2026: Spanyol 1–0 Argentina setelah perpanjangan waktu, gol Ferran Torres menit 106.",
          "Semua juara dari dua benua: Eropa 13 gelar, Amerika Selatan 10. Tuan rumah juara 6 kali, terakhir 1998.",
          "Trofi Jules Rimet dicuri 1966 lalu ditemukan anjing bernama Pickles; dicuri lagi 1983 dan tak pernah kembali."],
  audio="Dengarkan denting bintang emas setiap negara juara menyala di peta.",
  yt_alts=["Semua Juara Piala Dunia dalam 90 Detik", "Kenapa Juara Dunia Cuma dari Eropa dan Amerika Selatan?", "Trofi Piala Dunia Pernah Ditemukan Seekor Anjing"],
  ytdesc="Piala Dunia FIFA putra sudah digelar 23 kali sejak 1930, tapi hanya 8 negara yang pernah mengangkat trofinya. Video ini menghitung gelar tiap negara sampai juara terbaru Spanyol (final 19 Juli 2026, 1–0 atas Argentina lewat gol Ferran Torres menit 106), menunjukkan bahwa semua juara datang dari Eropa dan Amerika Selatan, dan menceritakan trofi Jules Rimet yang dicuri dua kali. Episode #01 seri Sejarah Sepak Bola dari AUDIRA Sport Facts.",
  ytags="juara piala dunia, piala dunia 2026, sejarah piala dunia, Spanyol juara dunia, Ferran Torres, Brasil 5 bintang, Jules Rimet, Pickles, sejarah sepak bola, FIFA World Cup, AUDIRA",
  thumb="Meja peta dunia gelap dengan 8 negara juara menyala emas dan bintang di atas kartu nama, trofi emas di depan, teks CUMA 8 NEGARA",
  fb="Coba tebak: dari puluhan negara yang pernah main di Piala Dunia, berapa yang pernah juara? Jawabannya cuma 8. Dan kalau diwarnai di peta, semuanya mengumpul di dua benua saja, Eropa dan Amerika Selatan. Juli lalu Spanyol menambah bintang keduanya lewat gol menit 106. Trofinya sendiri punya cerita yang lebih liar: pernah hilang, lalu ditemukan seekor anjing.",
  fbq="Menurutmu, negara mana yang paling mungkin jadi juara dunia kesembilan?",
  x="23 Piala Dunia, cuma 8 negara juara. Brasil 5, Italia 4, Jerman 4, Argentina 3, Uruguay 2, Prancis 2, Spanyol 2, Inggris 1. Semua dari Eropa & Amerika Selatan. #PialaDunia #AUDIRA",
  thread=["Sejak 1930, Piala Dunia digelar 23 kali. Juaranya cuma 8 negara. #PialaDunia",
          "Brasil 5, Italia 4, Jerman 4 (3 sebagai Jerman Barat), Argentina 3, Uruguay 2, Prancis 2, Spanyol 2, Inggris 1.",
          "Juara terbaru: Spanyol, 1–0 atas Argentina di final 19 Juli 2026, gol Ferran Torres menit 106.",
          "Semua juara dari dua benua: Eropa 13, Amerika Selatan 10. Tuan rumah juara 6 kali, terakhir 1998.",
          "Trofi pertama dicuri 1966, ditemukan anjing bernama Pickles. Dicuri lagi 1983 dan hilang sampai sekarang. #SejarahSepakBola #AUDIRA"],
  threads=["23 kali Piala Dunia digelar. Juaranya cuma 8 negara. #SejarahSepakBola",
           "Brasil 5, Italia 4, Jerman 4, Argentina 3, Uruguay 2, Prancis 2, Spanyol 2, Inggris 1. Spanyol menambah gelar kedua Juli 2026 lewat gol Ferran Torres menit 106.",
           "Semua juara dari Eropa dan Amerika Selatan. Belum pernah ada tim Afrika, Asia, atau Amerika Utara di final. Negara mana yang menurutmu jadi juara kesembilan?"],
  prev="Episode pertama seri ini. Berikutnya: EP02 Brasil Lima Bintang."),
 "02": dict(
  title="Brasil Lima Bintang: Dari Pelé 17 Tahun sampai Tersingkir Norwegia",
  day="Sabtu, 14 November 2026", start=(19, 0),
  hook="Lima bintang di dada Brasil. Tapi trofi aslinya dicuri, dan tak pernah kembali.",
  cover="5 BINTANG BRASIL",
  tags="#Brasil #PialaDunia #SejarahSepakBola #Pele #AUDIRA",
  tiktok="Brasil satu-satunya negara yang ikut 23 dari 23 Piala Dunia. Lima bintangnya: 1958 (Pelé 17 tahun, 5–2 Swedia), 1962 (Garrincha), 1970 (6 dari 6 menang, 4–1 Italia), 1994 (adu penalti), 2002 (Ronaldo 2 gol). Sejak itu kosong: 1–7 dari Jerman 2014, dan Juli 2026 tersingkir di 16 besar oleh Norwegia.",
  pin="Sumber: Brazil at the FIFA World Cup, halaman final 1958/1962/1970/1994/2002, Mineirazo, Jules Rimet (Wikipedia EN/ID, dicek silang), hasil Piala Dunia 2026 (Wikipedia + berita). Maracanazo 1950 bukan final resmi, melainkan laga penentu grup akhir. Data per 11 Nov 2026.",
  points=["Brasil satu-satunya negara yang ikut semua Piala Dunia: 23 dari 23.",
          "1958: Pelé 17 tahun mencetak 2 gol di final, Brasil menang 5–2 atas Swedia memakai baju biru.",
          "1970: menang 6 dari 6 laga, trofi Jules Rimet jadi milik Brasil; dicuri dari markas federasi 1983 dan tak pernah ditemukan.",
          "1994: final pertama yang ditentukan adu penalti. 2002: Ronaldo 2 gol ke gawang Jerman.",
          "Sejak 2002 kosong: 1–7 dari Jerman 2014, dan Juli 2026 kalah 1–2 dari Norwegia di 16 besar."],
  audio="Dengarkan tiap bintang menyala satu per satu di koridor era.",
  yt_alts=["Kenapa Brasil Punya 5 Bintang?", "Pelé 17 Tahun dan Baju Biru: Gelar Pertama Brasil", "Bintang Keenam Brasil Masih Kosong"],
  ytdesc="Brasil adalah raja Piala Dunia: lima gelar dan satu-satunya negara yang tak pernah absen. Video ini berjalan dari luka Maracanã 1950 ke lima bintang (1958, 1962, 1970, 1994, 2002), kisah trofi Jules Rimet yang dicuri, sampai paceklik panjang: 1–7 dari Jerman 2014 dan tersingkir oleh Norwegia di 16 besar Piala Dunia 2026. Episode #02 seri Sejarah Sepak Bola dari AUDIRA Sport Facts.",
  ytags="Brasil, timnas Brasil, 5 bintang Brasil, Pele, Garrincha, Ronaldo, Piala Dunia 1958, Piala Dunia 1970, Maracanazo, Jules Rimet, Brasil vs Norwegia, Piala Dunia 2026, sejarah sepak bola, AUDIRA",
  thumb="Koridor studio putih dengan lima podium era, figur berbaju kuning, lima bintang emas dan bintang keenam putus-putus, teks 5 BINTANG BRASIL",
  fb="Bayangkan negara yang tak pernah absen satu kali pun dari Piala Dunia, dan sudah juara lima kali. Itu Brasil. Tapi kisah lima bintangnya dimulai dari tangis di Maracanã tahun 1950. Delapan tahun kemudian, bocah 17 tahun bernama Pelé mengubah segalanya. Sejak 2002, bintang keenam tak kunjung datang, dan Juli lalu yang menghentikan mereka justru Norwegia.",
  fbq="Menurutmu, kapan Brasil akhirnya dapat bintang keenam?",
  x="Brasil: 23/23 Piala Dunia, 5 gelar (1958, 1962, 1970, 1994, 2002). Sejak itu kosong. Juli 2026 tersingkir 1–2 oleh Norwegia di 16 besar. #Brasil #AUDIRA",
  thread=["Lima bintang di dada Brasil. Tapi trofi aslinya dicuri dan tak pernah kembali. #Brasil",
          "1958: Pelé 17 tahun, 2 gol di final, Brasil menang 5–2 atas Swedia memakai baju biru.",
          "1962 Garrincha mengambil alih saat Pelé cedera. 1970: 6 dari 6 menang, Jules Rimet jadi milik Brasil, dicuri 1983.",
          "1994: final pertama lewat adu penalti. 2002: Ronaldo 2 gol ke gawang Jerman.",
          "Lalu 1–7 dari Jerman 2014, dan Juli 2026 tersingkir oleh Norwegia di 16 besar. Bintang keenam masih kosong. #SejarahSepakBola #AUDIRA"],
  threads=["Lima bintang di dada Brasil. Tapi trofi aslinya dicuri dan tak pernah kembali. #SejarahSepakBola",
           "Bintang 1958 dimulai bocah 17 tahun bernama Pelé. Lalu 1962, 1970, 1994, dan 2002. Brasil juga satu-satunya negara yang ikut 23 dari 23 Piala Dunia.",
           "Sejak 2002 kosong: 1–7 dari Jerman 2014, dan Juli 2026 tersingkir oleh Norwegia di 16 besar. Kapan bintang keenam datang?"],
  prev="Episode sebelumnya: EP01 Semua Juara Piala Dunia. Berikutnya: EP03 Pemain Terbaik Sepanjang Masa."),
 "03": dict(
  title="Siapa Pemain Terbaik Sepanjang Masa? Pelé, Maradona, Messi, Ronaldo dalam Data",
  day="Minggu, 15 November 2026", start=(19, 0),
  hook="Siapa pemain terbaik sepanjang masa? Jawabannya tergantung timbangan yang kamu pakai.",
  cover="SIAPA YANG TERBAIK?",
  tags="#GOAT #Messi #Ronaldo #SejarahSepakBola #AUDIRA",
  tiktok="Tiga timbangan, tiga juara. Gol resmi: Ronaldo lebih dari 980, Messi lebih dari 930 (per November 2026). Piala Dunia: Pelé 3, satu-satunya. Ballon d'Or: Messi 8, rekor. Pelé dan Maradona tak dapat Ballon d'Or karena sampai 1995 hanya untuk pemain Eropa. Tahun 2000, FIFA memberi gelar pemain terbaik abad ini ke dua orang.",
  pin="Sumber: IFFHS dan RSSSF untuk gol karier (angka Messi/Ronaldo per November 2026, masih bisa bertambah), Guinness untuk 1.279 gol Pelé (termasuk laga persahabatan), daftar Ballon d'Or, FIFA Player of the Century 2000 (Wikipedia, dicek silang). Tidak ada lembaga yang menetapkan 'GOAT' resmi.",
  points=["Gol resmi (per November 2026): Ronaldo lebih dari 980, Messi lebih dari 930, Pelé 762 (1.279 versi Guinness, termasuk laga persahabatan).",
          "Piala Dunia: Pelé 3 (satu-satunya), Maradona 1, Messi 1, Ronaldo 0.",
          "Ronaldo satu-satunya pencetak gol di 6 Piala Dunia.",
          "Ballon d'Or: Messi 8 (rekor), Ronaldo 5; sampai 1995 penghargaan itu hanya untuk pemain Eropa.",
          "Pemain Terbaik Abad Ini FIFA 2000: internet memilih Maradona, panel ahli memilih Pelé, hasilnya dua pemenang."],
  audio="Dengarkan balok trofi berdentang di atas pilar tiap pemain.",
  yt_alts=["GOAT Sepak Bola: Ganti Timbangan, Ganti Juara", "Messi vs Ronaldo vs Pelé vs Maradona dalam Angka", "Kenapa Pelé dan Maradona Tak Punya Ballon d'Or?"],
  ytdesc="Debat GOAT sepak bola tidak pernah selesai, jadi kami menimbangnya dengan data. Tiga timbangan: gol resmi (Ronaldo memimpin, per November 2026), gelar Piala Dunia (Pelé satu-satunya dengan tiga), dan Ballon d'Or (Messi delapan, rekor). Ada juga alasan Pelé dan Maradona tak punya Ballon d'Or, dan kenapa FIFA memberi gelar Pemain Terbaik Abad Ini kepada dua orang. Episode #03 seri Sejarah Sepak Bola dari AUDIRA Sport Facts.",
  ytags="GOAT sepak bola, pemain terbaik sepanjang masa, Messi, Cristiano Ronaldo, Pele, Maradona, Ballon d'Or, gol karier Ronaldo, Messi 8 Ballon d'Or, IFFHS, Player of the Century, sejarah sepak bola, AUDIRA",
  thumb="Empat pilar logam berpelat nama Pelé, Maradona, Messi, C. Ronaldo dengan balok trofi emas dan oranye, teks SIAPA YANG TERBAIK?",
  fb="Setiap kali debat GOAT muncul di grup WhatsApp, ujungnya pasti ribut. Padahal jawabannya tergantung kamu menimbang pakai apa. Kalau gol resmi, Ronaldo di atas. Kalau Piala Dunia, Pelé tak tertandingi dengan tiga trofi. Kalau Ballon d'Or, Messi punya delapan. Dan Maradona? Satu turnamen 1986 yang tak pernah dilupakan orang.",
  fbq="Kamu pakai timbangan yang mana, dan siapa jawabanmu?",
  x="GOAT tergantung timbangan: Gol → Ronaldo (980+). Piala Dunia → Pelé (3). Ballon d'Or → Messi (8). Momen tunggal → Maradona 1986. Kamu pilih yang mana? #GOAT #AUDIRA",
  thread=["Siapa pemain terbaik sepanjang masa? Kita timbang pakai data. #GOAT",
          "Timbangan 1, gol resmi (per Nov 2026): Ronaldo 980+, Messi 930+, Pelé 762 (1.279 versi Guinness, termasuk laga persahabatan).",
          "Timbangan 2, Piala Dunia: Pelé 3, Maradona 1, Messi 1, Ronaldo 0. Tapi Ronaldo satu-satunya pencetak gol di 6 Piala Dunia.",
          "Timbangan 3, Ballon d'Or: Messi 8, Ronaldo 5. Pelé & Maradona 0, karena sampai 1995 hanya untuk pemain Eropa.",
          "Tahun 2000 FIFA memberi gelar pemain terbaik abad ini ke dua orang: Pelé dan Maradona. Kamu pakai timbangan mana? #SejarahSepakBola #AUDIRA"],
  threads=["Siapa pemain terbaik sepanjang masa? Jawabannya tergantung timbangan yang kamu pakai. #SejarahSepakBola",
           "Gol resmi: Ronaldo memimpin (lebih dari 980 per November 2026). Piala Dunia: Pelé satu-satunya dengan tiga. Ballon d'Or: Messi delapan, rekor.",
           "Pelé dan Maradona tak pernah dapat Ballon d'Or karena sampai 1995 hanya untuk pemain Eropa. Kamu pakai timbangan yang mana?"],
  prev="Episode sebelumnya: EP02 Brasil Lima Bintang. Berikutnya: EP04 Real Madrid Raja Eropa."),
 "04": dict(
  title="Real Madrid 15 Kali Raja Eropa: Tak Pernah Kalah di Final Sejak 1981",
  day="Senin, 16 November 2026", start=(19, 0),
  hook="Sejak 1981, Real Madrid tidak pernah kalah di final Liga Champions. Sembilan final, sembilan trofi.",
  cover="15 KALI RAJA EROPA",
  tags="#RealMadrid #LigaChampions #UCL #SejarahSepakBola #AUDIRA",
  tiktok="Real Madrid juara Eropa 15 kali, rekor: 18 final, 15 menang, dan tak pernah kalah di final sejak 1981. Mereka juara 5 edisi pertama beruntun (1956–1960), termasuk final 7–3 atas Eintracht Frankfurt di Glasgow. Klub peringkat dua, AC Milan, baru 7. Tapi dua musim terakhir, juaranya PSG.",
  pin="Sumber: daftar final Piala Champions/Liga Champions dan peringkat klub (Wikipedia EN/ID, dicek silang dengan halaman final per tahun), final 2025 dan 2026 (PSG 5–0 Inter; PSG 1–1 Arsenal, adu penalti 4–3). Tanpa logo klub atau trofi asli; visual = ilustrasi. Data per 11 Nov 2026.",
  points=["Real Madrid juara Eropa 15 kali, rekor; terakhir 2024 (2–0 Dortmund di Wembley).",
          "18 final, 15 menang; tak pernah kalah di final sejak 1981 (9 final beruntun menang).",
          "Juara 5 edisi pertama beruntun 1956–1960; final 1960 menang 7–3, Puskás 4 gol, Di Stéfano 3 gol.",
          "Tiga gelar beruntun 2016–2018, satu-satunya di era Liga Champions.",
          "AC Milan di peringkat dua dengan 7 gelar; PSG juara 2025 dan 2026."],
  audio="Dengarkan langkah kamera menyusuri aula marmer, satu trofi per tahun.",
  yt_alts=["Kenapa Real Madrid Selalu Menang di Final?", "15 Trofi Eropa: Galeri Real Madrid 1956–2024", "Lima Juara Pertama Eropa Adalah Klub yang Sama"],
  ytdesc="Real Madrid adalah klub paling sukses di Eropa: 15 gelar Piala Champions/Liga Champions, 18 final dengan 15 kemenangan, dan tak pernah kalah di final sejak 1981. Video ini menyusuri galeri trofinya: lima gelar beruntun pertama bersama Di Stéfano dan Puskás, final 7–3 di Glasgow, kemarau 32 tahun, tiga gelar beruntun 2016–2018, sampai 2024 di Wembley, lalu PSG yang merebut takhta 2025 dan 2026. Episode #04 seri Sejarah Sepak Bola dari AUDIRA Sport Facts.",
  ytags="Real Madrid, Liga Champions, UCL, 15 gelar Liga Champions, Di Stefano, Puskas, final 1960, AC Milan, PSG juara Liga Champions 2026, klub paling sukses Eropa, sejarah sepak bola, AUDIRA",
  thumb="Galeri museum marmer dengan 15 trofi bertelinga besar di alas, trofi utama di depan, teks 15 KALI RAJA EROPA",
  fb="Ada klub yang kalau sudah masuk final Eropa, rasanya hasil akhirnya sudah bisa ditebak. Sejak 1981, Real Madrid sembilan kali masuk final dan sembilan kali juara. Total 15 trofi, sementara klub di peringkat dua, AC Milan, baru tujuh. Lima juara pertama turnamen ini pun klub yang sama. Tapi dua musim terakhir, takhta itu diambil PSG.",
  fbq="Menurutmu, kapan ada klub yang bisa menyamai 15 gelar Real Madrid?",
  x="Real Madrid: 15 gelar Eropa, 18 final, 15 menang. Tak pernah kalah di final sejak 1981. Milan di posisi 2 baru 7. Tapi 2025 & 2026 juaranya PSG. #RealMadrid #AUDIRA",
  thread=["Sejak 1981, Real Madrid tak pernah kalah di final Liga Champions: 9 final, 9 trofi. #RealMadrid",
          "Lima juara pertama turnamen ini (1956–1960) klub yang sama. Final 1960: 7–3, Puskás 4 gol, Di Stéfano 3.",
          "Lalu kemarau 32 tahun sampai 1998. Disusul 2000, 2002, 2014, dan 3 beruntun 2016–2018.",
          "2024: 2–0 Dortmund di Wembley. Total 18 final, 15 menang. Milan di posisi 2 baru 7.",
          "Tapi 2025 dan 2026, juaranya PSG. Sang raja sedang diuji. #LigaChampions #AUDIRA"],
  threads=["Sejak 1981, Real Madrid tak pernah kalah di final Liga Champions. Sembilan final, sembilan trofi. #SejarahSepakBola",
           "Total 15 gelar: lima pertama beruntun 1956–1960, lalu 1966, 1998, 2000, 2002, 2014, 2016–2018, 2022, 2024. AC Milan di peringkat dua dengan tujuh.",
           "Dua musim terakhir, takhta itu diambil PSG. Kapan ada klub yang menyamai 15?"],
  prev="Episode sebelumnya: EP03 Pemain Terbaik Sepanjang Masa. Berikutnya: EP05 Klub Raja Liga."),
 "05": dict(
  title="Raja Liga Dunia Bukan Real Madrid atau Bayern: Kenalan dengan Linfield",
  day="Selasa, 17 November 2026", start=(19, 0),
  hook="Klub paling sering juara liga di dunia bukan Real Madrid, bukan Bayern. Namanya Linfield.",
  cover="RAJA LIGA DUNIA",
  tags="#SepakBola #RekorSepakBola #Celtic #SejarahSepakBola #AUDIRA",
  tiktok="Rekor dunia gelar liga dipegang Linfield dari Belfast, Irlandia Utara: 57 gelar. Real Madrid baru 36. Di Glasgow, Celtic juara lagi Mei 2026 dan menyalip Rangers, 56 lawan 55. Rekor beruntun? Bayern 11 kali (rekor liga top Eropa), tapi Skonto Riga, Lincoln Red Imps, dan Ludogorets 14 kali. JDT Malaysia 12 musim dan masih berjalan.",
  pin="Sumber: Guinness/RSSSF via Wikipedia (gelar liga terbanyak), halaman klub Linfield, Celtic, Rangers, Bayern, JDT, Skonto, Lincoln Red Imps, Ludogorets (Wikipedia EN, dicek silang). Data per akhir musim 2025–26 (11 Nov 2026). Tanpa logo klub; visual = ilustrasi.",
  points=["Rekor dunia gelar liga domestik: Linfield (Irlandia Utara), 57 gelar; Real Madrid 36.",
          "Mei 2026 Celtic juara lagi dan menyalip Rangers: 56 lawan 55, tinggal satu dari rekor dunia.",
          "Bayern juara Jerman 11 kali beruntun (2013–2023): rekor liga top Eropa, bukan rekor dunia.",
          "Skonto Riga, Lincoln Red Imps, dan Ludogorets: masing-masing 14 kali beruntun; JDT Malaysia 12 musim dan masih berjalan.",
          "Rentetan Bayern dipatahkan Leverkusen yang juara tanpa kalah; rentetan Ludogorets berhenti musim 2025–26."],
  audio="Dengarkan keping gelar menumpuk sampai 57 di papan taktik.",
  yt_alts=["Klub Paling Sering Juara Liga di Dunia Ternyata dari Irlandia Utara", "Celtic Salip Rangers 56–55: Rivalitas Glasgow", "Rekor Juara Beruntun: Bayern Bukan yang Terlama"],
  ytdesc="Klub dengan gelar liga domestik terbanyak di dunia bukan Real Madrid atau Bayern, melainkan Linfield dari Belfast dengan 57 gelar. Video ini membahas rivalitas Celtic dan Rangers yang kini 56–55, rekor juara beruntun (Bayern 11, Skonto Riga, Lincoln Red Imps, Ludogorets 14, JDT Malaysia 12 dan masih berjalan), dan bagaimana dinasti akhirnya runtuh. Episode #05 seri Sejarah Sepak Bola dari AUDIRA Sport Facts.",
  ytags="klub paling sering juara liga, Linfield, Celtic, Rangers, Old Firm, Bayern 11 kali beruntun, Leverkusen tak terkalahkan, JDT, Johor Darul Takzim, Ludogorets, rekor sepak bola, sejarah sepak bola, AUDIRA",
  thumb="Papan taktik lapangan dengan tiga tumpukan keping gelar 56, 57, 55 dan lingkaran kapur REKOR DUNIA, teks RAJA LIGA DUNIA",
  fb="Kalau ditanya klub mana yang paling sering juara liga di dunia, kebanyakan orang menjawab Real Madrid atau Bayern. Jawabannya ternyata Linfield, klub dari Belfast, dengan 57 gelar. Di Glasgow, Celtic baru saja menyalip Rangers jadi 56. Dan soal juara beruntun, ada klub tetangga kita di Malaysia yang sudah 12 musim tak pernah gagal juara.",
  fbq="Klub mana yang menurutmu akan memecahkan rekor 57 gelar duluan?",
  x="Raja liga dunia: Linfield (Irlandia Utara) 57 gelar. Celtic 56, Rangers 55. Real Madrid 36. Rekor beruntun: 14 kali, bukan Bayern (11). #SepakBola #AUDIRA",
  thread=["Klub paling sering juara liga di dunia bukan Real Madrid, bukan Bayern. Namanya Linfield. #SepakBola",
          "Linfield, Belfast, Irlandia Utara: 57 gelar liga, rekor dunia. Real Madrid 36.",
          "Mei 2026 Celtic juara lagi dan menyalip Rangers: 56–55, tinggal satu dari rekor dunia.",
          "Juara beruntun: Bayern 11 (rekor liga top Eropa). Skonto Riga, Lincoln Red Imps, Ludogorets 14. JDT Malaysia 12 dan masih berjalan.",
          "Rentetan Bayern dipatahkan Leverkusen tanpa kalah. Juara sekali bisa kebetulan; juara terus-menerus, itu dinasti. #SejarahSepakBola #AUDIRA"],
  threads=["Klub paling sering juara liga di dunia bukan Real Madrid, bukan Bayern. Namanya Linfield. #SejarahSepakBola",
           "57 gelar liga, rekor dunia. Celtic menyalip Rangers Mei 2026 jadi 56–55. Soal juara beruntun, Bayern 11, tapi tiga klub lain 14 kali, dan JDT Malaysia 12 musim masih berjalan.",
           "Juara sekali bisa kebetulan. Juara terus-menerus, itu dinasti. Klub mana yang akan memecahkan 57 duluan?"],
  prev="Episode sebelumnya: EP04 Real Madrid Raja Eropa. Berikutnya: EP06 Lahirnya Sepak Bola Modern 1863."),
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
          f"Seri {SERIES} EP{nn}, channel {CH}. Created by Agus Dwi R. Thumbnail: `style/cover-topic.png`. Video: `FINAL_VIDEO.mp4`.", "",
          "## TikTok", "", f"**Hook:** {e['hook']}", "", f"**Cover Text:** {e['cover']}", "", f"**Caption:** {e['tiktok']}", "",
          f"**Pinned Comment:** Sejarah Sepak Bola #{nn} · {CH}. {e['pin']} {e['prev']}", "", f"**Hashtags:** {e['tags']}", "",
          "## Instagram Reels", "", "**5-Point Value Breakdown:**", ""]
    L += [f"{i}. {p}" for i, p in enumerate(e["points"], 1)]
    L += ["", f"**Caption:** {e['hook']} Simpan, lalu tulis jawabanmu di komentar. Ikuti @AudiraSportFacts untuk episode berikutnya.", "",
          f"**Audio Cue:** {e['audio']}", "", f"**Hashtags:** {e['tags']}", "",
          "## YouTube Shorts", "", f"**Judul:** {e['title'][:95]}", "", "**Alternatif Judul:**"]
    L += [f"- {a}" for a in e["yt_alts"]]
    L += ["", "**Deskripsi:**", "", e["ytdesc"], "", "Chapters:"] + ch + ["", "Created by Agus Dwi R. AUDIRA Sport Facts.", "", e["tags"], "",
          f"**Tags:** {e['ytags']}", "",
          f"**Pinned Comment:** Sejarah Sepak Bola #{nn} (playlist {PLAYLIST}). {e['pin']} {e['prev']}", "",
          f"**Thumbnail:** {e['thumb']}", "",
          "## Facebook Reels", "", f"**Caption:** {e['fb']}", "", f"**Discussion Trigger:** {e['fbq']}", "", f"**Hashtags:** {e['tags']}", "",
          "## X/Twitter", "", f"**Cuitan tunggal:** {e['x']}", "", "**Viral Hook Thread:**", ""]
    L += [f"{i}/ {t}" for i, t in enumerate(e["thread"], 1)] + [""]
    L += ["## Threads", "", "**Post pembuka + utas:**", ""]
    for t in e["threads"]:
        L += [t, ""]
    L += ["## Jadwal Upload (WIB)", "",
          f"Hari: {e['day']}. Seri ini satu episode per hari berurutan EP01–EP05 (13–17 Nov 2026) di slot malam utama 19.00–20.15 WIB. Default awal pola penonton Indonesia, bukan data akun; ganti dengan jam aktif follower dari TikTok Analytics, Instagram Insights, YouTube Studio setelah 2–4 minggu.", ""]
    L += times
    L += ["", "## Label Konten AI", "", "Centang label AI di tiap platform karena VO (Cartesia) dan visual dibuat dengan AI:",
          "- TikTok: AI-generated content", "- YouTube: Altered or synthetic content", "- Meta (Facebook dan Instagram): AI info", "",
          "## Catatan Upload", "", f"- Teks cover (3–5 kata) semua platform: {e['cover']}",
          "- Upload `SUBTITLES.srt` ke YouTube Shorts dan Facebook.",
          f"- Seri: {SERIES} EP{nn}, playlist {PLAYLIST}. {e['prev']} (tambahkan tautan episode sebelumnya di komentar pin setelah tayang).",
          "- Angka yang bisa berubah (gol pemain aktif, gelar klub) ditulis per November 2026; cek ulang bila upload tertunda.",
          "- Musik: bed prosedural buatan sendiri (bebas lisensi), SFX dari pustaka AUDIRA `shared/assets/sfx` (lihat research/SOURCE_REGISTER.md).", ""]
    open(f"{d}/SOCIAL_CAPTIONS.md", "w", encoding="utf8").write("\n".join(L))
    print(d, "captions ok")
