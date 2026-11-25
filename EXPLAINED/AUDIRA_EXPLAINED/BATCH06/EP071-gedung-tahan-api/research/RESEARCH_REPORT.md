# RESEARCH REPORT — AE-071 "Bagaimana Gedung Dirancang Agar Tidak Mudah Terbakar?"

Tanggal riset: 2026-11-10. Nomor klaim [#n] merujuk ke `SOURCE_REGISTER.md`.

## Verifikasi ide bank

| Ide bank | Status | Koreksi |
|---|---|---|
| Gedung dibagi kompartemen dengan dinding, pintu, pelat tahan api | BENAR [#1, #2] | Pelat lantai juga penghalang api; tembusan pipa/kabel wajib ditutup firestop [#11]. |
| Tangga darurat bertekanan positif | BENAR, bersyarat [#12, #13] | Di Indonesia wajib untuk gedung dengan tinggi hunian > 24 m, bukan semua gedung. |
| Material lambat terbakar | BENAR sebagian | Intinya bukan "material tak bisa terbakar", tapi rakitan teruji dengan TKA dalam menit [#3, #10]. Cladding dinding luar ikut menentukan (Grenfell) [#19]. |
| Reveal: pintu darurat yang menutup sendiri adalah bagian dari dinding pemisah api | BENAR [#4, #5, #7, #21] | Lebih tepat: bukaan di dinding tahan api harus diisi pintu tahan api berlabel yang menutup sendiri. Pintu terbuka = lubang di dinding api. |
| Hook: api di satu ruangan bisa ditahan agar tidak menjalar | BENAR, untuk waktu terbatas [#1, #3, #10] | Tambahkan "untuk waktu tertentu" / "membeli waktu evakuasi". |

## Mekanisme inti (berurutan)

1. **Gedung dibagi kotak-kotak (kompartemen).** Dinding dan lantai tahan api membelah gedung jadi ruang-ruang terpisah, supaya api dan asap tertahan di satu kompartemen [#1, #2].
2. **Tiap penghalang punya "jam" ketahanan.** Tingkat Ketahanan Api (TKA) diukur dalam menit untuk tiga hal: struktur tetap berdiri, api tidak tembus, dan panas tidak merambat ke sisi lain. Contohnya 60/60/60 [#3].
3. **Setiap lubang ditutup.** Bukaan di dinding api diisi pintu tahan api berlabel. Tembusan pipa, kabel, dan saluran disumbat bahan penyetop api (firestop) yang teruji [#8, #11].
4. **Pintunya menutup sendiri.** Pintu tahan api wajib punya penutup otomatis (door closer). Kalau ditahan terbuka, penahannya harus lepas otomatis saat detektor asap aktif atau listrik padam [#4, #5].
5. **Tangga darurat dijaga bebas asap.** Di gedung dengan tinggi hunian lebih dari 24 m, tangga kebakaran dipresurisasi: udara dipompa agar tekanannya lebih tinggi (≥50 Pa menurut Permen PU 26/2008), sehingga asap terdorong keluar saat pintu dibuka. Pintu tetap harus bisa dibuka dengan gaya ≤110 N [#12, #13].
6. **Sistem aktif ikut bekerja.** Detektor dan alarm memberi peringatan. Sprinkler menyemprot hanya di titik yang cukup panas, karena tiap kepala sprinkler bekerja sendiri saat bulb kacanya pecah [#14, #15, #17].
7. **Hasilnya waktu, bukan kekebalan.** Proteksi pasif memperlambat api untuk durasi uji tertentu. Waktu itu dipakai penghuni untuk evakuasi dan petugas untuk memadamkan [#10].

Pasif vs aktif secara singkat:
- **Pasif** (selalu ada, tanpa listrik): dinding, lantai, dan pintu tahan api; door closer; firestop; cladding/fasad tidak mudah terbakar; tangga terlindung.
- **Aktif** (perlu dipicu): detektor, alarm, sprinkler, pengendali asap, presurisasi tangga, hidran.

## Fakta paling menarik (aman untuk naskah)

1. **Pintu darurat adalah bagian dari tembok api.** Regulasi Indonesia mewajibkan pintu tahan api menutup sendiri, dan pintu di jalur keluar tidak boleh dibiarkan terbuka [#4, #5]. Pintu yang diganjal sama dengan melubangi dinding pemisah api [#6].
2. **Ketahanan api diukur dalam menit.** Contohnya dinding tangga kebakaran 2 jam dengan pintu 1½ jam, atau koridor 1 jam dengan pintu 20 menit [#3, #7]. Gunakan sebagai contoh, bukan aturan untuk semua gedung.
3. **Sprinkler tidak menyala semuanya sekaligus.** Tiap kepala punya bulb kaca berisi cairan. Bulb merah pecah sekitar 68 °C, lalu hanya kepala yang kepanasan itu yang menyemprot [#14, #15].
4. **Tangga darurat "meniup" asap.** Di gedung tinggi, tangga diberi tekanan udara lebih besar dari lantai di sekitarnya [#12, #13].
5. **Pelajaran Grenfell 2017** (London, 72 korban jiwa): inquiry menyimpulkan cladding ACM berinti polietilena sebagai penyebab utama api cepat menjalar di fasad. Pintu tahan api yang rusak juga membuat asap menyebar [#18, #19, #21]. Sampaikan netral, tanpa menyalahkan nama perusahaan.

## JANGAN DIKLAIM

- "Gedung tahan api selamanya", "pintu kebal api", atau "api tidak bisa menembus". Semua rating terbatas waktu [#3, #10].
- "Semua gedung di Indonesia punya tangga bertekanan." Kewajiban presurisasi hanya untuk tinggi hunian > 24 m [#12].
- "Tekanan tangga selalu 50 Pa." Itu angka Permen PU 26/2008. NFPA memakai angka lain [#12].
- "Sprinkler menyala karena asap" atau "semua sprinkler menyemprot bersamaan." Sprinkler dipicu panas, per kepala [#14].
- SNI 03-3989-2000 sebagai standar sprinkler yang masih berlaku. Katalog BSN menandainya "Tidak Berlaku", dan pengganti resminya tidak terverifikasi [#17].
- "Pintu tahan api terbuat dari bahan yang tidak bisa terbakar." Pintu itu boleh sebagian terbakar selama masih lolos uji [#10].
- Angka laju arang kayu, waktu aktivasi sprinkler 1–4 menit, dan jumlah gedung bercladding tidak dipakai (LOW).
- Nama perusahaan Grenfell, tuduhan pidana, atau "kebakaran X di Indonesia terjadi karena Y" tanpa sumber resmi.
- Angka korban atau kasus kebakaran gedung di Indonesia tidak diriset dan tidak terverifikasi.

## Saran visual akurat (untuk animasi 3D)

- **Kompartemen**: potongan gedung (cutaway) dengan dinding dan pelat lantai tahan api berwarna beda tipis. Api oranye tertahan di satu kotak, lalu tampilkan timer menit (mis. "60 menit") sebagai label HUD, bukan angka "∞".
- **Pintu tahan api**: daun pintu solid (baja atau kayu berinti), biasanya dengan door closer lengan di bagian atas (sisi tarik). Engsel kokoh, gagang dorong (panic bar) pada pintu eksit, kaca kecil berkawat bila ada jendela. Label sertifikasi logam kecil ada di tepi pintu dan di kusen. Strip intumesen tipis di tepi kusen bisa mengembang saat panas (MED).
- **Reveal**: pintu terbuka, lalu door closer menariknya menutup, dan garis dinding api "tersambung" utuh di HUD. Versi gagal: pintu diganjal baji, dan asap mengalir lewat celah.
- **Penahan magnet** (opsional): magnet di dinding menahan pintu, alarm berbunyi, magnet lepas, pintu menutup [#5].
- **Firestop**: pipa atau kabel menembus dinding, lalu celah di sekelilingnya diisi sealant atau kerah (collar) merah, karena merah umum di produk firestop. Warna adalah pilihan artistik, bukan standar.
- **Tangga bertekanan**: kipas di saf tangga, panah udara mengalir dari tangga ke koridor saat pintu dibuka, dan asap terdorong mundur.
- **Sprinkler**: kepala kuningan atau krom di plafon dengan deflektor bergerigi. Bulb kaca kecil berisi cairan **merah** (68 °C). Bulb pecah dan semprotan payung hanya keluar dari kepala di atas api. Kepala lain tetap kering.
- **Tanda eksit**: SNI 03-1746-2000 mewajibkan tanda eksit diterangi. Warna dan teks persis tanda (hijau atau merah, "EXIT" atau "KELUAR") tidak diverifikasi di sumber ini, jadi pakai generik dan jangan klaim standar warnanya.
- **Grenfell**: bila disebut, pakai diagram netral (panel fasad berlapis: aluminium–inti plastik–aluminium) dan teks "London, 2017". Jangan pakai rekonstruksi menara terbakar yang dramatis atau korban.

## Klaim yang gagal diverifikasi
- Datasheet produsen / NFPA 13 untuk warna bulb tidak berhasil diunduh, jadi tingkatnya tetap MED (Wikipedia).
- Teks laporan Grenfell Inquiry langsung terblokir CAPTCHA, sehingga dikonfirmasi lewat GOV.UK dan 2 judul media.
- SNI pengganti 03-3989-2000 (sprinkler) tidak terverifikasi.
- Isi SNI 03-6571-2001 (presurisasi) tidak dibaca langsung. Angka 50 Pa diambil dari Permen PU 26/2008.
