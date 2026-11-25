# RESEARCH_REPORT — AE-066 Bagaimana Menara Pengawas Bandara Mengatur Pergerakan Pesawat?

Tanggal riset: 2026-11-10. Nomor [#] merujuk tabel klaim di `SOURCE_REGISTER.md`.

## Verifikasi ide bank

- "Petugas menara mengatur izin lepas landas, mendarat, dan taxi": **benar**, dengan koreksi. Di bandara sibuk tugas ini dibagi ke beberapa posisi. Clearance Delivery memberi izin rute. Ground mengatur taxi. Tower mengatur landasan [2].
- "Dibantu radar dan approach yang menjaga jarak": **benar**. Approach (APP) memandu pesawat di sekitar bandara setelah lepas landas dan sebelum mendarat. Di luar itu, Area Control Centre (ACC) memandu pesawat di jalur jelajah [3]. Bantuan pengamatan meliputi radar primer, radar sekunder, dan ADS-B [16][17].
- Reveal "taxiway punya lampu lalu lintas sendiri": **benar**. Tepi taxiway berlampu biru, garis tengahnya hijau [11][12]. Di bandara yang memasangnya, stop bar merah melintang di depan landasan [13]. Catatan: stop bar dipakai terutama saat jarak pandang rendah, dan tidak semua bandara memilikinya.
- Hook "pilot tidak bebas mendarat sendiri": **benar** untuk bandara bermenara. Pendaratan butuh "cleared to land" [9]. Pesawat juga harus mendapat izin sebelum bergerak di area pergerakan bandara [8].
- AirNav Indonesia sebagai penyelenggara tunggal: **benar**. Dasarnya PP 77/2012, dan AirNav menyebut dirinya "pengelola tunggal pelayanan navigasi" [5].

## Mekanisme inti (urutan satu penerbangan)

1. **Dengar ATIS.** Sebelum menelepon menara, pilot mendengarkan siaran otomatis yang terus berulang. Isinya cuaca, landasan aktif, dan informasi rutin. Tiap versi ATIS punya kode huruf, dan pilot menyebut kode itu saat kontak pertama [10].
2. **Clearance Delivery.** Pilot meminta izin rute ke tujuan. Izin ini memuat rute dan ketinggian, dan diberikan sebelum taxi [2].
3. **Ground Control.** Ground mengatur pushback dan rute taxiway sampai pesawat menunggu di dekat ujung landasan [2][8]. Di posisi tunggu ada garis marka, lampu kuning runway guard lights, dan, bila terpasang, stop bar merah [13][14].
4. **Tower.** Tower mengatur landasan aktif. "Line up and wait" berarti masuk landasan lalu berhenti, dan itu belum izin terbang. Pesawat baru boleh lepas landas setelah "cleared for takeoff" [9].
5. **Approach (APP).** Setelah mengudara, pesawat diserahkan ke Approach. Approach memakai radar atau ADS-B untuk mengurutkan dan menjaga jarak antarpesawat di sekitar bandara [3][16][17].
6. **Area Control (ACC).** Di jalur jelajah, pesawat dipandu pusat kendali area. Indonesia punya 2 ACC dan 2 FIR, yaitu Jakarta dan Ujung Pandang [4].
7. **Kedatangan (urutan terbalik).** Pesawat bergerak dari ACC ke Approach, lalu Approach mengurutkan pesawat ke landasan dengan jarak aman. Jarak ini diperbesar di belakang pesawat berat karena wake turbulence [19]. Tower lalu memberi "cleared to land", dan setelah keluar landasan pesawat kembali diatur Ground sampai parkir [2][9].
8. **Di Indonesia** semua layanan ini diselenggarakan AirNav Indonesia (Perum LPPNPI) [5][7].

## Fakta paling menarik yang aman dipakai

1. "Line up and wait" artinya pesawat sudah di landasan tapi belum boleh terbang. Izin terbang hanya "cleared for takeoff" [9].
2. Taxiway punya "lampu lalu lintas": tepi biru, garis tengah hijau, dan stop bar merah melintang [11][12][13]. Aturannya, pilot tidak boleh melintasi stop bar merah yang menyala, walaupun sudah mendapat izin lisan. Begitu izin diberikan, stop bar dimatikan dan lampu hijau lead-on menyala ke arah landasan [13].
3. Pesawat besar meninggalkan pusaran udara di belakangnya, disebut wake turbulence. Karena itu pesawat di belakang pesawat berat diberi jarak lebih jauh [19].
4. Pesawat modern melaporkan posisinya sendiri dari satelit sekitar sekali per detik lewat ADS-B. AirNav punya stasiun ADS-B di Natuna dan Matak [17].
5. Seluruh pemanduan lalu lintas udara Indonesia dipegang satu lembaga, AirNav Indonesia, sejak PP 77/2012. Sebelumnya tugas ini terbagi antara Angkasa Pura I, Angkasa Pura II, dan Ditjen Perhubungan Udara [5].

Cadangan: bila radio mati, menara bisa memberi isyarat dengan lampu sinyal. Hijau tetap berarti izin, merah tetap berarti berhenti [15].

## JANGAN DIKLAIM

- Angka separasi spesifik (mis. "3 mil", "5 mil", "2 menit"). Satu-satunya angka yang ditemukan adalah aturan FAA di AS [21], bukan aturan Indonesia atau ICAO yang terverifikasi.
- "Semua bandara punya stop bar" atau "stop bar selalu menyala". Stop bar dipasang di sebagian bandara dan dipakai terutama saat jarak pandang rendah [13].
- "Menara mengatur pesawat sepanjang penerbangan". Menara hanya mengurus darat dan landasan; sisanya Approach dan ACC [2][3].
- "Pilot bebas mendarat di mana saja tanpa izin." Di bandara tanpa menara ada prosedur lain (AFIS/CTAF [4]); jangan generalisasi ke semua bandara.
- "Wajib ICAO English Level 4 sejak 2008" sebagai angka atau tanggal pasti. Klaim ini tidak terverifikasi langsung ke ICAO [22]. Cukup sebut "bahasa Inggris standar penerbangan".
- Jumlah unit atau menara AirNav sebagai angka "sekarang". Angkanya data halaman AirNav yang efektif sejak 2024 [4]. Kalau dipakai, sebut sumber dan tahunnya.
- Tanggal pendirian AirNav. Sumber tidak sepakat (13 Sep 2012 vs abstrak BPK "13 September 2013") [5].
- "Radar melihat semua pesawat di landasan" atau "semua bandara RI punya radar permukaan" [18].
- Kutipan percakapan ATC asli atau callsign maskapai nyata. Pakai callsign fiktif yang jelas fiktif, mis. "AUDIRA 66".
- "ATC menara melihat semuanya dari jendela saja." Menara juga memakai layar radar atau pengamatan dan strip penerbangan [16][23].

## Saran visual akurat

- **Kabin menara:** ruang kaca segi banyak di puncak menara dengan pandangan 360° ke landasan. Isinya meja konsol melingkar mengikuti jendela, beberapa monitor (tampilan radar/ADS-B dengan label pesawat, cuaca), headset dengan mikrofon, dan papan strip penerbangan [13][23]. Bisa ditambah lampu sinyal (light gun) bertangkai sebagai detail kecil [15]. Branding "AUDIRA" bisa muncul di label konsol atau layar.
- **Strip penerbangan:** kertas panjang tipis di dudukan plastik berwarna, tersusun vertikal di papan berlajur ("darat / landasan / udara"). Versi elektronik berupa layar sentuh [23].
- **Layar radar/ADS-B:** latar gelap, garis pantai atau peta, ikon pesawat dengan label data (callsign, ketinggian, kecepatan). Jangan menggambar sapuan radar hijau gaya film lama sebagai satu-satunya tampilan.
- **Taxiway malam:** lampu tepi **biru** di kedua sisi, lampu garis tengah **hijau** di permukaan, dan garis marka kuning [11][12][17].
- **Posisi tunggu runway:** marka kuning dua garis utuh plus dua garis putus (sisi putus menghadap landasan) [17]. Pasang **runway guard lights** berupa sepasang lampu kuning berkedip di kiri-kanan taxiway [14]. **Stop bar** adalah barisan lampu **merah** di permukaan melintang seluruh lebar taxiway, plus lampu merah tegak di kedua sisi. Saat izin keluar, stop bar padam dan lampu hijau lead-on menyala ke arah landasan [13].
- **Landasan:** jangan pakai lampu biru taxiway di tepi landasan. Warna lampu landasan belum diverifikasi di riset ini (umumnya putih). Kalau perlu digambar detail, cek dulu di AIM 2-1 sebelum tahap still.
- **Urutan kedatangan:** pesawat berbaris di jalur pendekatan dengan jarak antar-pesawat yang kelihatan. Pusaran ekor (wake) bisa digambar sebagai dua pusaran dari ujung sayap yang turun ke belakang [19]. Jangan beri angka jarak.
- **Peta Indonesia:** dua wilayah FIR, Jakarta (barat) dan Ujung Pandang (timur) [4].
- **Radio:** gelembung teks frasa standar: "cleared for takeoff", "line up and wait", "cleared to land" [9].
