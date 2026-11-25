# SOURCE_REGISTER — AE-066 Bagaimana Menara Pengawas Bandara Mengatur Pergerakan Pesawat?

Tanggal akses semua sumber: 2026-11-10. Jalur: curl + parsing teks (WebFetch/WebSearch error; DuckDuckGo diblok; Google News decode kena 429).

## Daftar sumber

| Kode | Sumber | Penerbit | URL |
|---|---|---|---|
| S1 | Aeronautical Information Manual (AIM) Ch. 2 Sec. 1 "Airport Lighting Aids" (para 2-1-10 taxiway lights, runway guard lights, stop bar) | FAA (AS) | https://www.faa.gov/air_traffic/publications/atpubs/aim_html/chap2_section_1.html |
| S2 | AIM Ch. 4 Sec. 1 "Services Available to Pilots" (4-1-2 Control Towers, 4-1-13 ATIS) | FAA | https://www.faa.gov/air_traffic/publications/atpubs/aim_html/chap4_section_1.html |
| S3 | AIM Ch. 4 Sec. 3 "Airport Operations" (4-3-13 light signals, 4-3-14 communications, 4-3-18 taxiing, LUAW) | FAA | https://www.faa.gov/air_traffic/publications/atpubs/aim_html/chap4_section_3.html |
| S4 | AIM Ch. 4 Sec. 5 "Surveillance Systems" (4-5-1 radar, 4-5-2 secondary radar, 4-5-5 ASDE-X, 4-5-7 ADS-B) | FAA | https://www.faa.gov/air_traffic/publications/atpubs/aim_html/chap4_section_5.html |
| S5 | AIM Ch. 7 Sec. 4 "Wake Turbulence" (7-4-3, 7-4-9) | FAA | https://www.faa.gov/air_traffic/publications/atpubs/aim_html/chap7_section_4.html |
| S6 | Pilot/Controller Glossary huruf C & L ("Cleared to land", "Cleared for takeoff", "Line up and wait") | FAA | https://www.faa.gov/air_traffic/publications/atpubs/pcg_html/glossary-c.html ; .../glossary-l.html |
| S7 | Sejarah Perum LPPNPI | AirNav Indonesia | https://www.airnavindonesia.co.id/?page_id=160 |
| S8 | Ruang Udara (FIR, jumlah unit TWR/APP/ACC) | AirNav Indonesia | https://www.airnavindonesia.co.id/?page_id=250 |
| S9 | Layanan Kami | AirNav Indonesia | https://www.airnavindonesia.co.id/?page_id=236 |
| S10 | "AirNav Indonesia–CAAS Perkuat Layanan Lintas FIR melalui Pertukaran Data ADS-B" (siaran pers, 21 Sep 2026) | AirNav Indonesia | https://www.airnavindonesia.co.id/berita-dan-siaran-pers/airnav-indonesia-caas-perkuat-layanan-lintas-fir-melalui-pertukaran-data-ads-b/ |
| S11 | Abstrak PP No. 77 Tahun 2012 tentang Perum LPPNPI (LN 2012 No. 176) | JDIH BPK RI | https://peraturan.bpk.go.id/Search?keywords=Lembaga+Penyelenggara+Pelayanan+Navigasi+Penerbangan |
| S12 | "Air traffic control" | Wikipedia EN (konteks) | https://en.wikipedia.org/wiki/Air_traffic_control |
| S13 | "Pemandu lalu lintas udara" (rujuk PM 17/2016 CASR Part 69) | Wikipedia ID (konteks) | https://id.wikipedia.org/wiki/Pemandu_lalu_lintas_udara |
| S14 | "AirNav Indonesia" | Wikipedia ID (konteks) | https://id.wikipedia.org/wiki/AirNav_Indonesia |
| S15 | "Wake turbulence category" (rujuk ICAO PANS-ATM Doc 4444, Amdt 9) | Wikipedia EN (konteks) | https://en.wikipedia.org/wiki/Wake_turbulence_category |
| S16 | "Aviation English" (rujuk ICAO Annex 10 & Annex 1) | Wikipedia EN (konteks) | https://en.wikipedia.org/wiki/Aviation_English |
| S17 | "Taxiway" (bagian Lights) | Wikipedia EN (konteks) | https://en.wikipedia.org/wiki/Taxiway |
| S18 | "Flight progress strip" (foto strip bay di Jakarta) | Wikipedia EN (konteks) | https://en.wikipedia.org/wiki/Flight_progress_strip |

Sumber yang dicoba tapi gagal diakses (tidak dipakai sebagai bukti): ICAO LPR (icao.int, 403), SKYbrary (JS challenge), Eurocontrol RECAT-EU (503), PDF ICAO RAAC8 (gagal unduh), Google News decode (429).

## Tabel klaim

| # | Klaim | Sumber | Tanggal akses | Tingkat | Catatan |
|---|---|---|---|---|---|
| 1 | Menara (tower) dibentuk untuk arus lalu lintas yang aman, tertib, dan lancar di bandara dan sekitarnya. | S2 (4-1-2); S12 | 2026-11-10 | HIGH | FAA: "safe, orderly and expeditious flow of traffic on and in the vicinity of an airport". |
| 2 | Pembagian kerja di menara: Clearance Delivery (izin rute sebelum taxi), Ground Control (pergerakan di area darat: pushback, taxiway, sampai menunggu di ujung landasan), Tower/Local Control (landasan aktif: lepas landas & mendarat). | S12; S13; S3 (4-3-14) | 2026-11-10 | HIGH | Di bandara kecil beberapa posisi bisa digabung. |
| 3 | Setelah lepas landas, pesawat diserahkan ke Approach (APP) lalu ke Area Control Centre (ACC); kedatangan urutannya terbalik. | S13; S12 | 2026-11-10 | MED | Dua sumber ensiklopedia; konsisten dengan struktur unit AirNav (S8). |
| 4 | Di Indonesia ada unit TWR, APP/TWR gabungan, dan 2 ACC; ruang udara dibagi 2 FIR (Jakarta & Ujung Pandang). Halaman AirNav: 59 TWR, 17 APP/TWR combine, 2 ACC, 106 AFIS, 302 unit pelayanan; efektif 22 Maret 2024. | S8; S14 | 2026-11-10 | MED (angka) / HIGH (2 FIR) | Angka unit hanya dari S8 (satu sumber, data 2024). Wiki ID menyebut 2 FIR. |
| 5 | AirNav Indonesia (Perum LPPNPI) adalah pengelola tunggal pelayanan navigasi penerbangan di Indonesia, berdasar PP 77/2012; sebelumnya dikelola Angkasa Pura I, Angkasa Pura II, dan Ditjen Perhubungan Udara. | S7; S11; S14 | 2026-11-10 | HIGH | S7: "pengelola tunggal pelayanan navigasi". Tanggal: S7 & S14 = 13 Sep 2012; abstrak BPK menulis "mulai berlaku 13 September 2013" (diduga salah ketik). Hindari menyebut tanggal di naskah. |
| 6 | Pembentukan AirNav dipicu audit ICAO USOAP 2005 dan 2007. | S7; S14 | 2026-11-10 | HIGH | |
| 7 | Layanan AirNav: pemanduan lalu lintas udara, informasi aeronautika (NOTAM), telekomunikasi penerbangan; meteorologi berkoordinasi dengan BMKG; SAR dengan Basarnas. | S9 | 2026-11-10 | MED | |
| 8 | Pilot harus mendapat izin sebelum menggerakkan pesawat di movement area saat menara beroperasi. | S3 (4-3-18) | 2026-11-10 | MED | FAA: "Approval must be obtained prior to moving an aircraft or vehicle onto the movement area". Prinsip sama di ICAO, tapi teks ICAO tidak terakses. |
| 9 | "Cleared to land" = izin mendarat; "Cleared for takeoff" = izin lepas landas; "Line up and wait" = masuk landasan dan berhenti menunggu, BUKAN izin lepas landas. | S6; S3 | 2026-11-10 | HIGH | Frasa ICAO sama ("line up and wait"); ICAO Doc 4444 tidak terakses langsung. |
| 10 | ATIS = siaran berulang terus-menerus berisi informasi rutin non-kendali (cuaca, landasan aktif, dll.) di frekuensi VHF tersendiri; tiap versi diberi kode huruf alfabet, pilot menyebut kode itu saat kontak pertama. | S2 (4-1-13) | 2026-11-10 | MED | Satu sumber resmi (FAA). |
| 11 | Lampu tepi taxiway berwarna biru. | S1; S17 | 2026-11-10 | HIGH | |
| 12 | Lampu garis tengah taxiway hijau, menyala tetap; di dekat/menyeberang runway bisa bergantian hijau-kuning. | S1; S17 | 2026-11-10 | HIGH | |
| 13 | Stop bar = barisan lampu merah di permukaan melintang seluruh lebar taxiway di posisi tunggu runway, plus lampu merah tegak di kedua sisi; dimatikan setelah izin ATC, lalu lampu lead-on hijau menyala ke arah runway. Pilot tidak boleh melintasi stop bar merah yang menyala, walau sudah diberi izin. | S1; S17 | 2026-11-10 | HIGH | Dipakai terutama saat jarak pandang rendah (FAA: RVR < 1.200 ft); tidak semua bandara punya. |
| 14 | Runway guard lights = sepasang lampu kuning berkedip di kedua sisi taxiway, atau barisan lampu kuning di permukaan, di garis tunggu runway. | S1; S17 | 2026-11-10 | HIGH | |
| 15 | Menara punya lampu sinyal (light gun) untuk pesawat tanpa radio: hijau tetap = boleh mendarat/lepas landas, merah tetap = berhenti, dll. | S3 (4-3-13) | 2026-11-10 | MED | Fakta cadangan menarik. |
| 16 | Radar primer: gelombang radio dipantulkan pesawat; radar sekunder (SSR) menginterogasi transponder pesawat. | S4 (4-5-1, 4-5-2); S12 | 2026-11-10 | HIGH | |
| 17 | ADS-B: pesawat menentukan posisi sendiri via GNSS (satelit) lalu memancarkannya ke stasiun darat sekitar sekali per detik. | S4 (4-5-7); S10 | 2026-11-10 | HIGH | S10: AirNav mensyaratkan pembaruan posisi tiap 1 detik; stasiun ADS-B AirNav di Natuna & Matak. |
| 18 | Bandara besar bisa memakai radar/sensor permukaan untuk melihat pesawat & kendaraan di landasan dan taxiway (mis. ASDE-X di AS). | S4 (4-5-5) | 2026-11-10 | MED | Jangan klaim bandara Indonesia tertentu punya sistem ini. |
| 19 | Pesawat menghasilkan turbulensi ekor (wake turbulence); kekuatannya naik seiring berat dan turun seiring kecepatan, jadi pesawat di belakang pesawat berat diberi jarak lebih. | S5 (7-4-3, 7-4-9); S15 | 2026-11-10 | HIGH | |
| 20 | ICAO membagi kategori wake turbulence: Light (L), Medium (M), Heavy (H), Super (J); Super saat ini hanya A380. | S15 | 2026-11-10 | MED | Dari Wikipedia yang mengutip ICAO Doc 4444/8643; tidak terverifikasi langsung ke ICAO. |
| 21 | Contoh angka separasi wake (FAA, AS): heavy di belakang heavy 3 mil; small/large di belakang heavy 5 mil; dll. | S5 (7-4-9) | 2026-11-10 | MED | Aturan AS, bukan aturan Indonesia. JANGAN dipakai di naskah. |
| 22 | Bahasa Inggris dipakai sebagai bahasa radio penerbangan internasional (rekomendasi ICAO Annex 10 sejak 1951); ICAO mensyaratkan uji kemahiran bahasa yang dicatat di lisensi pilot & ATC (standar diperbarui 2008). | S16 | 2026-11-10 | LOW–MED | Hanya Wikipedia (mengutip dokumen ICAO). Situs ICAO 403. "Level 4" tidak terverifikasi langsung. Di naskah cukup: "bahasa Inggris standar penerbangan". |
| 23 | Flight progress strip (kertas/elektronik) dipakai menara untuk mewakili tiap pesawat; posisinya di papan menunjukkan status (darat, landasan, udara). | S18; S12 | 2026-11-10 | MED | S12 menampilkan sistem strip elektronik di menara São Paulo. |
| 24 | Pesawat berat/super menyebut "heavy"/"super" setelah callsign saat kontak pertama. | S15 | 2026-11-10 | LOW | Konteks saja. |
