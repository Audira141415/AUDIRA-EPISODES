# Naskah — Cara Kerja Gembok Pintu Digital dengan Sidik Jari

> DRAF pra-produksi (backlog, 2026-11-26). Difinalkan di tahap 4 setelah style dipilih.
> Short: 190–210 kata @135–150 WPM.

## c00_hook — Hook

- Kata: **18** · estimasi **7 dtk**
- Visual: Ujung jari ilustrasi (tanpa wajah, tangan generik) menempel ke sensor di gagang pintu; pola garis "terangkat" dari kulit lalu runtuh jadi belasan titik bercahaya. Bingkai "FOTO" dicoret, label "PETA TITIK" muncul (#1, #2).

> Kunci pintu sidik jari umumnya tidak menyimpan foto jarimu. Yang disimpan cuma peta titik. Ini Audira, kita bongkar.

## c01_intro — Intro

- Kata: **20** · estimasi **8 dtk**
- Visual: Makro ujung jari: garis timbul (ridge) dan lembah (valley) seperti kontur pegunungan mini; kamera turun ke penampang kulit, lalu menarik mundur ke gagang pintu digital generik (tanpa merek). HUD chip: "Ridge · Valley" (#7).

> Ujung jarimu penuh garis timbul, dan di antaranya ada lembah kecil. Pola inilah yang dibaca sensor mungil di gagang pintu.

## c02 — Sensor kapasitif

- Kata: **26** · estimasi **11 dtk**
- Visual: Cutaway sensor: kisi sel listrik seperti papan catur di bawah lapisan pelindung; jari menempel, sel di bawah garis timbul menyala terang, sel di bawah lembah redup; peta terang-gelap terbentuk jadi citra garis. HUD callout: "Kapasitansi beda = pola" dan ikon kamera dicoret (#7, #9).

> Salah satu jenis sensornya kapasitif. Permukaannya berisi deretan sel listrik kecil. Garis timbul dan lembah menghasilkan kapasitansi yang berbeda, jadi sensor bisa memetakan polanya tanpa kamera.

## c03 — Minutiae jadi template

- Kata: **30** · estimasi **12 dtk**
- Visual: Citra garis di-zoom; penanda merah di ujung garis yang berhenti, penanda biru di titik percabangan; tiap titik diberi panah arah. Citra garis memudar, tinggal titik + panah di atas grid koordinat (x, y, sudut). HUD: "Ridge ending", "Bifurcation", "Template minutiae · ISO/IEC 19794-2" (#1, #2, #4).

> Lalu perangkat lunak mencari titik-titik khusus: ujung garis yang berhenti, dan percabangan saat satu garis terbelah dua. Titik ini disebut minutiae. Posisi dan arahnya dicatat jadi template, semacam peta koordinat.

## c04 — Pencocokan dan grendel

- Kata: **24** · estimasi **10 dtk**
- Visual: Dua peta titik (baru dan tersimpan) melayang lalu ditumpuk; garis hijau menghubungkan titik yang cocok, bar "skor kecocokan" naik melewati garis ambang. Cutaway pintu: motor/solenoid menarik grendel, pintu membuka sedikit (#1, #10).

> Saat kamu menempelkan jari, peta baru dibandingkan dengan peta tersimpan. Kalau cukup banyak titik yang cocok, motor atau solenoid menarik grendel dan pintu terbuka.

## c05 — Tidak semua, dan selalu peluang

- Kata: **39** · estimasi **16 dtk**
- Visual: Dua laci arsip: "minutiae" (ISO/IEC 19794-2) dan "citra jari" (ISO/IEC 19794-4), keduanya menyala. Lalu timbangan peluang: satu orang asing di antara grid 10.000 ikon tangan generik, dan bar "salah tolak < 5%". HUD callout besar: "Salah terima ≤ 1 : 10.000" · "Salah tolak < 5%" · "Pedoman NIST, Juli 2025" (#3, #5, #8).

> Tapi umumnya bukan berarti semua. Standar ISO juga punya format untuk menyimpan citra jari, dan hasil cocok selalu berupa peluang. Pedoman NIST tahun 2025 meminta salah terima maksimal satu dari sepuluh ribu, dan salah tolak di bawah lima persen.

## c06 — Siapkan cadangan

- Kata: **31** · estimasi **13 dtk**
- Visual: Jari basah berembun dan jari berplester gagal dibaca (ikon silang); lalu tiga ikon cadangan menyala berurutan di samping pintu: keypad PIN, kunci mekanis, port daya darurat. Ikon baterai turun ke merah dengan peringatan "baterai lemah" (#6, #7, #11, #12). Tanpa merek produk, tanpa adegan membobol.

> Sidik jari juga bisa gagal saat jari basah, kering, atau luka. Karena itu kunci yang baik menyediakan PIN dan kunci mekanis cadangan. Ganti baterai begitu muncul peringatan lemah, jangan tunggu mati.

## c07_payoff — Payoff + outro

- Kata: **21** · estimasi **9 dtk**
- Visual: Kamera menarik mundur dari peta titik yang menyala, titik-titik melebur jadi garis lalu jadi ujung jari, pintu terbuka ke ruang hangat. Outro card AUDIRA.

> Jadi yang umumnya membuka pintumu bukan foto jari, tapi peta titik yang dicocokkan dalam sekejap. Ikuti Audira untuk bongkar teknologi lainnya.

## Opsi hook lain

1. Sensor di gagang pintumu tidak melihat jarimu. Ia mengukur listrik di setiap garisnya.
2. Dari semua garis di ujung jarimu, kunci pintu biasanya cuma peduli pada titik ujung dan cabangnya.

## Total

- **209 kata** ≈ **86 dtk** (@145 WPM; 84–93 dtk di 135–150 WPM)
