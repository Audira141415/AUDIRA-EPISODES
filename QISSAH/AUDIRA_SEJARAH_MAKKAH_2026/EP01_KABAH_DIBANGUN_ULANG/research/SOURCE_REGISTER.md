# Source Register — EP01 Ka'bah Dibangun Ulang

Tanggal baca semua sumber: 2026-11-10. File mentah di `research/raw/`.

Singkatan sumber:
- **Q2:127** = Al-Qur'an 2:127, terjemahan Kemenag via quran.com API — https://api.quran.com/api/v4/verses/by_key/2:127?translations=33&fields=text_uthmani (`raw/quran_2_127.json`)
- **Q3:96** = Al-Qur'an 3:96, idem — https://api.quran.com/api/v4/verses/by_key/3:96?translations=33&fields=text_uthmani (`raw/quran_3_96.json`)
- **BUK** = Shahih Bukhari no. 1582–1586 (Kitab Al-Hajj), fawazahmed0 hadith-api (eng/ind) — https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-bukhari/1584.json (dst.) (`raw/bukhari_*.json`)
- **IK-T** = Ibnu Katsir, *Tafsir Ibn Kathir* QS 2:127 (memuat kutipan Ibnu Ishaq dan Shahih Muslim), via quran.com tafsir 169 — https://api.quran.com/api/v4/tafsirs/169/by_ayah/2:127 (`raw/ibnkathir_2_127.txt`)
- **IK-B317 / IK-B339** = Ibnu Katsir, *Al-Bidayah wan-Nihayah* juz 11, tahun 317 H dan 339 H, Wikisource Arab — https://ar.wikisource.org/wiki/البداية_والنهاية/الجزء_الحادي_عشر/ثم_دخلت_سنة_سبع_عشرة_وثلاثمائة dan .../ثم_دخلت_سنة_تسع_وثلاثين_وثلاثمائة (`raw/bidaya_317*.txt`, `raw/bidaya_339.txt`)
- **GPH** = Ar-Ri'asah Al-'Ammah li Syu'un Al-Masjid Al-Haram wal-Masjid An-Nabawi, "الكعبة المشرفة", terbit 28 Mei 2020 — https://gph.gov.sa/index.php/ar/about-the-two-holy-mosques-ar/grand-mosque-ar/2020-05-28-09-37-55/95-2020-05-28-09-32-8 (diakses via arsip http://web.archive.org/web/20241224145420/… karena situs langsung tidak merespons) (`raw/gph_kaaba.txt`)
- **IW** = IslamWeb Markaz Al-Fatwa no. 143123 "سبب عدم إعادة بناء الكعبة على قواعد إبراهيم" (mengutip Shahih Muslim, Ibnu Katsir, Ibnu Hajar *Fath Al-Bari*) — https://www.islamweb.net/ar/fatwa/143123/ (`raw/islamweb_fatwa_143123.txt`)
- **WP-K** = Wikipedia (en) "Kaaba", rev. 2026-11-06 — https://en.wikipedia.org/wiki/Kaaba (`raw/wiki_Kaaba.txt`)
- **WP-BS** = Wikipedia (en) "Black Stone" — https://en.wikipedia.org/wiki/Black_Stone (`raw/wiki_Black_Stone.txt`)
- **WP-SM** = Wikipedia (en) "Sack of Mecca" — https://en.wikipedia.org/wiki/Sack_of_Mecca (`raw/wiki_Sack_of_Mecca.txt`)
- **WP-Q** = Wikipedia (en) "Qarmatians" — https://en.wikipedia.org/wiki/Qarmatians
- **WP-683 / WP-692** = Wikipedia (en) "Siege of Mecca (683)" / "Siege of Mecca (692)" — https://en.wikipedia.org/wiki/Siege_of_Mecca_(683), https://en.wikipedia.org/wiki/Siege_of_Mecca_(692)
- **WP-HI** = Wikipedia (en) "Hijr Ismail" — https://en.wikipedia.org/wiki/Hijr_Ismail
- **WP-MH** = Wikipedia (en) "Masjid al-Haram" — https://en.wikipedia.org/wiki/Masjid_al-Haram
- **ARW-K** = Wikipedia (ar) "الكعبة" (mengutip Al-Azraqi *Akhbar Makkah*, Al-Kurdi *At-Tarikh Al-Qawim*, dll.) — https://ar.wikipedia.org/wiki/الكعبة (`raw/arwiki_Kaaba.txt`)
- **ARW-HA** = Wikipedia (ar) "الحجر الأسود" — https://ar.wikipedia.org/wiki/الحجر_الأسود
- **ARW-HI** = Wikipedia (ar) "حجر إسماعيل" — https://ar.wikipedia.org/wiki/حجر_إسماعيل
- **ARW-BK** = Wikipedia (ar) "باب الكعبة" — https://ar.wikipedia.org/wiki/باب_الكعبة
- **ARW-KS** = Wikipedia (ar) "كسوة الكعبة" — https://ar.wikipedia.org/wiki/كسوة_الكعبة
- **IDW-K** = Wikipedia (id) "Ka'bah" (mengutip Peterson 1997, *Dictionary of Islamic Architecture*, h. 142) — https://id.wikipedia.org/wiki/Ka%27bah

Konversi H→M di tabel memakai kalender Hijriah tabular (selisih ±1–2 hari dari tanggal sebenarnya).

| # | Claim | Source (title, author/publisher, year) | URL | Date read | Level |
|---|---|---|---|---|---|
| 1 | Ibrahim meninggikan fondasi Baitullah bersama Ismail sambil berdoa "Rabbana taqabbal minna" | Al-Qur'an 2:127 (terj. Kemenag) | Q2:127 | 2026-11-10 | PRIMARY |
| 2 | Rumah ibadah pertama untuk manusia ada di Bakkah | Al-Qur'an 3:96 | Q3:96 | 2026-11-10 | PRIMARY |
| 3 | Ismail mengangkut batu, Ibrahim menyusun, sambil membaca doa 2:127 | Tafsir Ibnu Katsir 2:127 (riwayat Ibnu Abbas, Bukhari) | IK-T | 2026-11-10 | CLASSIC |
| 4 | Ibnu Katsir menilai lemah riwayat Ka'bah sudah dibangun sebelum Ibrahim | Wikipedia "Kaaba" (merangkum Tafsir Ibnu Katsir) | WP-K | 2026-11-10 | SECONDARY |
| 5 | Ka'bah masa Ismail tinggi 9 hasta, tanpa atap, pintu menempel tanah | Wikipedia Arab "الكعبة" (mengutip IslamWeb hadith library) | ARW-K | 2026-11-10 | SECONDARY |
| 6 | Fondasi Ibrahim terlihat saat pembongkaran Ibnu Zubair: batu seperti punuk unta | Shahih Bukhari 1586 | BUK | 2026-11-10 | PRIMARY |
| 7 | Renovasi Quraisy saat Nabi berusia 35 tahun | Ibnu Ishaq, dikutip Tafsir Ibnu Katsir | IK-T | 2026-11-10 | CLASSIC |
| 8 | Renovasi Quraisy sekitar 605 M, lima tahun sebelum wahyu pertama | Wikipedia "Black Stone" | WP-BS | 2026-11-10 | SECONDARY |
| 9 | Versi lain: "sekitar 600 M", setelah kebakaran lalu banjir | Wikipedia "Kaaba" | WP-K | 2026-11-10 | SECONDARY |
| 10 | Kebakaran dari perempuan Quraisy yang membakar dupa, lalu banjir merusak dinding; ~30 tahun setelah Tahun Gajah | Wikipedia Arab "الكعبة" | ARW-K | 2026-11-10 | SECONDARY |
| 11 | Kayu atap dari kapal pedagang Romawi karam di pantai Jeddah; tukang kayu Koptik di Makkah | Ibnu Ishaq via Tafsir Ibnu Katsir | IK-T | 2026-11-10 | CLASSIC |
| 12 | Kapal Bizantium karam di Syu'aibah; tukang kayu bernama Baqum (Pachomius) | Wikipedia "Kaaba" (Ibnu Ishaq, Al-Azraqi) | WP-K | 2026-11-10 | SECONDARY |
| 13 | Hanya harta halal (tanpa uang pelacuran, riba, kezaliman); Al-Walid bin Al-Mughirah merobohkan pertama | Ibnu Ishaq via Tafsir Ibnu Katsir | IK-T | 2026-11-10 | CLASSIC |
| 14 | Masa Nabi Ka'bah tingginya 18 hasta | Ibnu Ishaq via Tafsir Ibnu Katsir | IK-T | 2026-11-10 | CLASSIC |
| 15 | Quraisy menaikkan tinggi dari 4,32 m ke 8,64 m; pintu ditinggikan, pintu belakang ditutup, atap dan talang dibuat | Wikipedia Arab "الكعبة" | ARW-K | 2026-11-10 | SECONDARY |
| 16 | Sengketa Hajar Aswad 4–5 hari; hakim = orang pertama yang masuk; kain diangkat para kepala suku | Ibnu Ishaq via Tafsir Ibnu Katsir | IK-T | 2026-11-10 | CLASSIC |
| 17 | Kisah sengketa yang sama (Ibnu Ishaq, Al-Azraqi) | Wikipedia "Kaaba"; Wikipedia Arab "الكعبة" | WP-K; ARW-K | 2026-11-10 | SECONDARY |
| 18 | Hijr bagian dari Ka'bah; tidak dimasukkan karena Quraisy kekurangan biaya | Shahih Bukhari 1584 | BUK | 2026-11-10 | PRIMARY |
| 19 | Pintu ditinggikan agar Quraisy bisa memilih siapa yang masuk | Shahih Bukhari 1584 | BUK | 2026-11-10 | PRIMARY |
| 20 | Orang yang tak dikehendaki didorong jatuh saat hampir masuk | Shahih Muslim via Tafsir Ibnu Katsir | IK-T | 2026-11-10 | PRIMARY (via CLASSIC) |
| 21 | Nabi ingin membangun di atas fondasi Ibrahim dengan dua pintu rata tanah timur dan barat | Shahih Bukhari 1583, 1585, 1586; GPH | BUK; GPH | 2026-11-10 | PRIMARY |
| 22 | Nabi tidak mengusap dua sudut di sisi Hijr | Shahih Bukhari 1583 (perkataan Ibnu Umar) | BUK | 2026-11-10 | PRIMARY |
| 23 | Bagian tertinggal sekitar 6 hasta | Shahih Bukhari 1586 | BUK | 2026-11-10 | PRIMARY |
| 24 | Bagian tertinggal 5 hasta (riwayat Ibnu Zubair) / sekitar 7 hasta (riwayat Al-Harits) | Shahih Muslim via Tafsir Ibnu Katsir; IslamWeb 143123 | IK-T; IW | 2026-11-10 | PRIMARY (via CLASSIC) |
| 25 | Dinding Hijr tinggi 1,31 m, marmer putih | Wikipedia "Kaaba" | WP-K | 2026-11-10 | SECONDARY |
| 26 | Dinding Hijr tinggi 1,33 m / "sekitar 1,30 m" | Wikipedia "Hijr Ismail"; Wikipedia Arab "حجر إسماعيل" | WP-HI; ARW-HI | 2026-11-10 | SECONDARY |
| 27 | Kebakaran Ka'bah 3 Rabiul Awal 64 H = 31 Okt 683 M | Wikipedia "Kaaba" (mengutip D. Selwood, The Telegraph, 31 Okt 2017); konversi tabular 30 Okt 683 | WP-K | 2026-11-10 | SECONDARY |
| 28 | Pengepungan pertama 24 Sep – 26 Nov 683 M | Wikipedia "Siege of Mecca (683)" | WP-683 | 2026-11-10 | SECONDARY |
| 29 | Ibnu Abbas menyarankan perbaikan; Ibnu Zubair istikharah 3 hari; dibongkar rata tanah; tirai di atas tiang | Shahih Muslim via Tafsir Ibnu Katsir; IslamWeb 143123 | IK-T; IW | 2026-11-10 | PRIMARY (via CLASSIC) |
| 30 | Ibnu Zubair memasukkan Hijr, dua pintu rata tanah (masuk/keluar), tambah 10 hasta dari 18 | Shahih Muslim via IK-T dan IW | IK-T; IW | 2026-11-10 | PRIMARY (via CLASSIC) |
| 31 | Ibnu Zubair membangun tahun 64 H dengan dua pintu | GPH "الكعبة المشرفة" 2020 | GPH | 2026-11-10 | PRIMARY |
| 32 | Ibnu Zubair membangun tahun 65 H; tinggi 27 hasta; pintu timur dan barat | Wikipedia Arab "الكعبة" | ARW-K | 2026-11-10 | SECONDARY |
| 33 | Ibnu Zubair pertama mengikat Hajar Aswad dengan perak setelah retak (64 H) | Wikipedia Arab "الكعبة"; Wikipedia "Black Stone" ("silver ligament") | ARW-K; WP-BS | 2026-11-10 | SECONDARY |
| 34 | Pengepungan kedua oleh Al-Hajjaj Maret – Okt/Nov 692 M; dinding retak akibat manjanik | Wikipedia "Siege of Mecca (692)" | WP-692 | 2026-11-10 | SECONDARY |
| 35 | Ibnu Zubair terbunuh tahun 73 H | Wikipedia Arab "حجر إسماعيل"; Wikipedia Arab "الكعبة" | ARW-HI; ARW-K | 2026-11-10 | SECONDARY |
| 36 | Tahun 74 H Al-Hajjaj mengembalikan bentuk Quraisy atas perintah Abdul Malik; pintu barat ditutup | GPH; daftar pembangun Wikipedia Arab (74 H) | GPH; ARW-K | 2026-11-10 | PRIMARY |
| 37 | Tahun 693 M Abdul Malik merobohkan sisa bangunan Ibnu Zubair dan membangun di fondasi Quraisy; bentuk dasar tak berubah sejak itu | Wikipedia "Kaaba" | WP-K | 2026-11-10 | SECONDARY |
| 38 | Abdul Malik: tinggi dibiarkan, bagian Hijr dibongkar, pintu ditutup | Shahih Muslim via IK-T; IW | IK-T; IW | 2026-11-10 | PRIMARY (via CLASSIC) |
| 39 | Ambang pintu timur ditutup setinggi 4 hasta | Wikipedia Arab "الكعبة" (Al-Azraqi) | ARW-K | 2026-11-10 | SECONDARY |
| 40 | Pintu Ibnu Zubair 11 hasta; pintu Al-Hajjaj 6 hasta dan sejengkal (Ibnu Juraij) | Wikipedia Arab "الكعبة", "باب الكعبة" | ARW-K; ARW-BK | 2026-11-10 | SECONDARY |
| 41 | Abdul Malik menyesal: "andai kudengar sebelum merobohkan, akan kubiarkan" | Shahih Muslim via IK-T dan IW | IK-T; IW | 2026-11-10 | PRIMARY (via CLASSIC) |
| 42 | Al-Baladzuri: Abdul Malik menyesali perintahnya | Wikipedia "Siege of Mecca (692)" (Hitti & Murgotten 1916) | WP-692 | 2026-11-10 | SECONDARY |
| 43 | Al-Mahdi ingin mengembalikan bentuk Ibnu Zubair; Imam Malik: "aku tidak suka khalifah menjadikannya permainan" | Ibnu Katsir *Al-Bidayah*, dikutip IslamWeb 143123 dan Wikipedia Arab "حجر إسماعيل" | IW; ARW-HI | 2026-11-10 | CLASSIC |
| 44 | Versi lain: Harun Ar-Rasyid / Al-Mahdi / Al-Manshur; "khawatir jadi permainan para raja" | Ibnu Hajar *Fath Al-Bari* (mengutip Ibnu Abdil Barr, Iyadh), via IslamWeb | IW | 2026-11-10 | CLASSIC |
| 45 | Tidak ada khalifah yang mengubah bangunan Al-Hajjaj sesudahnya | Ibnu Hajar *Fath Al-Bari* via IslamWeb; GPH ("tetap di atas bangunan Abdul Malik sampai 1040 H") | IW; GPH | 2026-11-10 | CLASSIC / PRIMARY |
| 46 | Serangan Qaramithah pada Hari Tarwiyah 317 H; Abu Thahir; korban dimasukkan sumur Zamzam; pintu dicabut; kiswah dibagi; Hajar Aswad dibawa | Ibnu Katsir *Al-Bidayah* tahun 317 | IK-B317 | 2026-11-10 | CLASSIC |
| 47 | Penjarahan Makkah 11 Januari 930 M (tabular 8 Dzulhijjah 317 = 12 Jan 930) | Wikipedia "Sack of Mecca" | WP-SM | 2026-11-10 | SECONDARY |
| 48 | Hajar Aswad dibawa ke Hajar/Ahsa (Bahrain/Arabia Timur) | Wikipedia "Kaaba", "Black Stone"; Wikipedia Arab "الحجر الأسود" (Hajar/Qatif) | WP-K; WP-BS; ARW-HA | 2026-11-10 | SECONDARY |
| 49 | Bajkam At-Turki menawarkan 50.000 dinar, ditolak | Ibnu Katsir *Al-Bidayah* tahun 339 | IK-B339 | 2026-11-10 | CLASSIC |
| 50 | Dikembalikan Dzulqa'dah 339 H, digantung di tiang ke-7 Masjid Kufah dengan surat, dikirim ke Makkah "tanpa apa-apa"; hilang 22 tahun | Ibnu Katsir *Al-Bidayah* tahun 339 | IK-B339 | 2026-11-10 | CLASSIC |
| 51 | Hilang 22 tahun, kembali 339 H | Wikipedia Arab "الكعبة" (mengutip IslamWeb) | ARW-K | 2026-11-10 | SECONDARY |
| 52 | Kembali 952 M setelah 23 tahun (Al-Juwaini); ditebus; dilempar ke Masjid Kufah; pecah jadi 7 keping; dibingkai perak sejak itu | Wikipedia "Black Stone" | WP-BS | 2026-11-10 | SECONDARY |
| 53 | Kembali 951 M "setelah dicuri 21 tahun" (dalam bagian sains) | Wikipedia "Black Stone" | WP-BS | 2026-11-10 | SECONDARY |
| 54 | Ditebus Abbasiyah tahun 952 M | Wikipedia "Kaaba"; Wikipedia "Qarmatians" | WP-K; WP-Q | 2026-11-10 | SECONDARY |
| 55 | Kini terlihat 8 keping kecil, terbesar seukuran kurma; ~50 tahun sebelumnya 15 keping (Muhammad Thahir Al-Kurdi, abad 14 H) | Wikipedia Arab "الحجر الأسود" | ARW-HA | 2026-11-10 | SECONDARY (mengutip CLASSIC modern) |
| 56 | 7–8 keping disemen, muka terbuka ~20 × 16 cm, bingkai perak dipaku perak | Wikipedia "Black Stone" | WP-BS | 2026-11-10 | SECONDARY |
| 57 | Hajar Aswad diameter ~30 cm, 1,5 m dari tanah, bingkai perak murni | Wikipedia Arab "الكعبة", "الحجر الأسود" | ARW-K; ARW-HA | 2026-11-10 | SECONDARY |
| 58 | Bingkai: Harun Ar-Rasyid; Sultan Mehmed Reşad 1331 H; Raja Saud Sya'ban 1375 H; dipugar masa Fahd 1422 H | Wikipedia Arab "الكعبة" | ARW-K | 2026-11-10 | SECONDARY |
| 59 | Bingkai lama dari era Utsmani disimpan di Istana Topkapı | Wikipedia "Black Stone"; Wikipedia Arab "الحجر الأسود" (keterangan foto) | WP-BS; ARW-HA | 2026-11-10 | SECONDARY |
| 60 | Masa Ahmed I dinding retak, ulama menolak pembongkaran, dipasang dua sabuk kuningan berlapis emas | Wikipedia Arab "الكعبة" (Al-Kurdi, *At-Tarikh Al-Qawim* j.3 h.129) | ARW-K | 2026-11-10 | SECONDARY |
| 61 | Rabu 19 Sya'ban 1039 H hujan deras, banjir sampai setengah dinding; dinding Syami dan sebagian dinding timur dan barat roboh | GPH "الكعبة المشرفة" 2020 | GPH | 2026-11-10 | PRIMARY |
| 62 | Tanggal yang sama 19 Sya'ban 1039 H = April 1630 M; banjir menyeret kitab dan lampu | Wikipedia Arab "الكعبة"; konversi tabular 3 Apr 1630 | ARW-K | 2026-11-10 | SECONDARY |
| 63 | Versi lain: banjir 1626, dibangun ulang 1626/1627 | Wikipedia "Kaaba" (bagian sejarah dan Mizab) | WP-K | 2026-11-10 | SECONDARY (diragukan) |
| 64 | Versi lain: banjir 1621 dan 1629; renovasi masjid 1629 masa Murad IV | Wikipedia "Masjid al-Haram" | WP-MH | 2026-11-10 | SECONDARY |
| 65 | Murad IV memerintahkan pembangunan ulang; selesai 2 Dzulhijjah 1040 H (≈ 2 Juli 1631) | GPH | GPH | 2026-11-10 | PRIMARY |
| 66 | Dikerjakan insinyur Mesir; mulai 23 Jumadil Akhir 1040 H, selesai awal Ramadhan 1040 H; bangunan yang ada sekarang | Wikipedia Arab "الكعبة" (Al-Kurdi j.3 h.144) | ARW-K | 2026-11-10 | SECONDARY |
| 67 | Dibangun ulang dengan batu granit dari Makkah masa Murad IV | Wikipedia "Kaaba" | WP-K | 2026-11-10 | SECONDARY |
| 68 | Setelah 1040 H tidak ada pembangunan ulang, hanya pemugaran | GPH | GPH | 2026-11-10 | PRIMARY |
| 69 | Pintu baru 1045 H masa Murad IV, perak 166 rathl, disepuh emas | Wikipedia Arab "باب الكعبة" | ARW-BK | 2026-11-10 | SECONDARY |
| 70 | Pintu tertua yang masih ada dari 1045 H (1635–36 M) | Wikipedia "Kaaba" | WP-K | 2026-11-10 | SECONDARY |
| 71 | Renovasi total masa Raja Fahd: mulai Muharram 1417 H, selesai Jumadil Akhir 1417 H, karena kayu atap dan tiang rusak | GPH | GPH | 2026-11-10 | PRIMARY |
| 72 | Renovasi masa Fahd: atap dibongkar dan dibangun ulang, batu aus dipugar, lantai marmer; tiang diganti kayu jati Burma | Wikipedia Arab "الكعبة" (mengutip Sky News Arabia; sumber asli tidak bisa dibuka, captcha) | ARW-K | 2026-11-10 | SECONDARY (belum terverifikasi soal tiang) |
| 73 | 1417 H = Mei – Nov 1996 M | Konversi tabular (1 Muharram 1417 ≈ 19 Mei 1996; akhir Jumadil Akhir ≈ 12 Nov 1996) | — | 2026-11-10 | — |
| 74 | Prasasti marmer Raja Fahd di dinding timur antara pintu dan Bab At-Taubah; total 10 prasasti; 9 lainnya bertulis Tsuluts kecuali 1 Kufi | GPH; Wikipedia "Kaaba" | GPH; WP-K | 2026-11-10 | PRIMARY |
| 75 | Ukuran (UQU): 11,68 m (sisi pintu); 12,04 m; 10,18 m; 9,90 m | GPH (mengutip Pusat Riset Haji Univ. Umm Al-Qura) | GPH | 2026-11-10 | PRIMARY |
| 76 | Ukuran (Kompleks Kiswah): 11,82 m (sisi pintu); 12,15 m; 10,29 m; 10,30 m | Wikipedia Arab "كسوة الكعبة" | ARW-KS | 2026-11-10 | SECONDARY |
| 77 | Ukuran dalam (Basalamah 1352 H): 10,15 × 8,10 m | GPH | GPH | 2026-11-10 | PRIMARY |
| 78 | Tinggi ~15 m, sisi ~12 × 10,5 m | Wikipedia Indonesia "Ka'bah" (Peterson 1997, h.142) | IDW-K | 2026-11-10 | SECONDARY |
| 79 | Tinggi 15 m, sisi 12 m dan 10 m | Wikipedia Arab "الكعبة" | ARW-K | 2026-11-10 | SECONDARY |
| 80 | Kain kiswah tinggi 14 m; sabuk 95 cm | Wikipedia Arab "كسوة الكعبة" | ARW-KS | 2026-11-10 | SECONDARY |
| 81 | 3 tiang kayu, keliling ~150 cm, diameter 44 cm, dari masa Ibnu Zubair (>1.350 tahun) | GPH | GPH | 2026-11-10 | PRIMARY (bertentangan dengan #72) |
| 82 | Tiga tiang ("sebagian salah menyebut dua"); benda mirip lampu tergantung | Wikipedia "Kaaba" | WP-K | 2026-11-10 | SECONDARY |
| 83 | Palang di antara tiang tempat hadiah Ka'bah digantung; atap ganda dengan celah 120 cm; ruang tangga ke atap berpintu (Bab At-Taubah) | GPH; Wikipedia "Kaaba" | GPH; WP-K | 2026-11-10 | PRIMARY |
| 84 | Pintu: ambang 222 cm dari syadzarwan, tinggi 318 cm, lebar 171 cm | Wikipedia Arab "باب الكعبة", "الكعبة" | ARW-BK; ARW-K | 2026-11-10 | SECONDARY |
| 85 | Pintu 2,13 m di atas tanah | Wikipedia "Kaaba" (EI2, Wensinck & Jomier 1978, h.317) | WP-K | 2026-11-10 | SECONDARY |
| 86 | Pintu emas sekarang: Ahmad bin Ibrahim Badr, perintah Raja Khalid, ~280 kg emas 99,99 untuk dua pintu, dikerjakan 12 bulan mulai 1 Dzulhijjah 1398 H | Wikipedia Arab "باب الكعبة" | ARW-BK | 2026-11-10 | SECONDARY |
| 87 | Pintu emas 1979, 300 kg; menggantikan pintu perak buatan ayahnya, Ibrahim Badr, 1942 | Wikipedia "Kaaba" (Khaleej Times 2009) | WP-K | 2026-11-10 | SECONDARY |
| 88 | Pintu masa Raja Abdulaziz tahun 1363 H | Wikipedia Arab "باب الكعبة" | ARW-BK | 2026-11-10 | SECONDARY |
| 89 | Ka'bah dimandikan dua kali setahun (awal Sya'ban dan 15 Dzulqa'dah) dengan Zamzam berparfum | GPH | GPH | 2026-11-10 | PRIMARY |

## Musik dan SFX

- Musik latar: sintesis prosedural original (numpy, `mix.py` di proyek episode), tanpa lisensi pihak ketiga.
- SFX: pustaka internal AUDIRA `shared/assets/sfx/` (whoosh, chime, riser, impact, sparkle) sesuai `catalog.json`.
- Dicatat 2026-11-11 untuk delivery (YOUTUBE_LONG.md, SOCIAL_CAPTIONS.md).
