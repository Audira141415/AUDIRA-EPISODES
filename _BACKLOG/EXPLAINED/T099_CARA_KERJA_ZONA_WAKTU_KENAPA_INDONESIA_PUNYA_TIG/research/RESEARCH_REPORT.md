# Research Report — Cara Kerja Zona Waktu: Kenapa Indonesia Punya Tiga

> Riset backlog 2026-11-27. Channel @AudiraExplained (rule 15: netral, tanpa wajah/logo nyata).

## Sumber utama

- **BMKG** (#2): situs resmi acuan waktu nasional Indonesia, mengonfirmasi 3 zona dan Keppres 41/1987 (HIGH).
- **IANA time zone database** (#3): sumber primer teknis, mencatat 4 entri zona untuk Indonesia (HIGH).
- **timeanddate.com** (#7): referensi waktu global tepercaya, mengonfirmasi 3 zona dan proposal penyatuan 2012 (HIGH).
- **Wikipedia EN** (#1, #4, #5, #6, #8, #9, #10, #13): artikel terperinci dengan kutipan ke sumber primer (Keppres, prosiding Konferensi Meridian 1884, karya Fleming). Wikipedia = MEDIUM.
- **Wikipedia ID** (#11, #12): mengonfirmasi cakupan wilayah WIT dan WIB serta nomor Keppres (MEDIUM).

## Fakta terverifikasi

1. Indonesia punya 3 zona waktu: WIB (UTC+7, Sumatra+Jawa+Kalbar+Kalteng), WITA (UTC+8, Kaltim+Kalsel+Sulawesi+Bali+NTB+NTT), WIT (UTC+9, Maluku+Papua) (#1, #2, #3, #7, #11, #12).
2. Pembagian saat ini berdasarkan Keppres No. 41 Tahun 1987, berlaku 1 Januari 1988. Sebelumnya Keppres No. 243 Tahun 1963 (Bali di WIB, seluruh Kalimantan di WITA). Dikonfirmasi BMKG (#2) dan Wikipedia (#1, #11, #12).
3. Sabang (Aceh) = WIB (UTC+7), Merauke (Papua) = WIT (UTC+9). Selisih = 2 jam. Hook BENAR (#1, #2, #3, #11).
4. Sandford Fleming: makalah pertama "Terrestrial Time" 1876, makalah revisi di Canadian Institute 8 Februari 1879 mengusulkan 24 zona waktu + meridian Greenwich sebagai basis (#5).
5. Konferensi Meridian Internasional di Washington D.C., Oktober 1884: 26 negara, 41 delegasi. Resolusi utama: Greenwich = meridian utama. Konferensi TIDAK mengadopsi zona waktu (zona dianggap urusan lokal) (#4).
6. Rel kereta AS mengadopsi zona waktu standar 18 November 1883, setahun sebelum konferensi (#6).
7. 360° ÷ 24 jam = 15° per zona waktu. Ini model teoretis; batas aktual mengikuti wilayah administratif, bukan meridian persis (#14).
8. China: satu zona (UTC+8) untuk wilayah seluas 5 zona geografis (dari Xinjiang di barat sampai Heilongjiang di timur) (#8).
9. India: UTC+05:30, membentang >29° bujur, selisih matahari ±2 jam antara ujung timur dan barat (#9).
10. Nepal: UTC+05:45, salah satu dari 3 zona di dunia dengan offset 45 menit. Diadopsi 1986 (#10).
11. Proposal 2012: Menko Perekonomian Hatta Rajasa mengusulkan penyatuan ke UTC+8 untuk menghemat "triliunan rupiah". Gagal dilaksanakan, tanpa tenggat baru per 2013 (#13, #7).

## Perselisihan / Kontroversi

- **Hook TOPIC.md**: "Jam di Sabang dan Merauke berbeda dua jam, padahal masih satu negara" — **BENAR**, tidak perlu koreksi. Sabang = WIB (UTC+7), Merauke = WIT (UTC+9), selisih tepat 2 jam.
- **Sandford Fleming dan 1879**: brief menyebut "Sandford Fleming 1879". Fleming memang menerbitkan makalah revisinya di 1879, tapi gagasan awalnya sudah ditulis 1876. Naskah menyebut 1879 untuk makalah yang disebarkan ke 18 negara, dan 1876 untuk ide awal.
- **Konferensi 1884 TIDAK mengadopsi zona waktu**: ini fakta penting yang sering disalahpahami. Konferensi hanya menetapkan meridian nol (Greenwich) dan hari universal. Zona waktu diadopsi bertahap oleh masing-masing negara secara mandiri. Naskah wajib membedakan ini.
- **"Waktu Indonesia Bersatu"**: istilah ini beredar di media saat proposal 2012, tapi TIDAK ditemukan di sumber terverifikasi yang berhasil dibuka. Sumber primer (Wikipedia mengutip Okezone dan Jakarta Post) hanya menyebut "penyatuan zona waktu" dan "single time zone using UTC+08:00". Naskah tidak memakai istilah ini.
- **Status terkini proposal penyatuan**: per sumber 2013, proposal tidak punya tenggat. Tidak ditemukan perkembangan baru. Topik ini TIDAK sensitif secara politik; hanya pernah wacana.
- **Keppres 41/1987 masih berlaku**: BMKG (#2) menyebut pembagian 3 zona "berlaku sejak 1 Januari 1988" tanpa catatan pencabutan. Tidak ditemukan peraturan pengganti. Wikipedia dan timeanddate.com juga mengonfirmasi pembagian ini masih aktif.

## Angka kunci untuk HUD

| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| 2 jam | Selisih waktu Sabang–Merauke (WIB vs WIT) | 1, 2, 3, 11 |
| 3 zona waktu | WIB, WITA, WIT | 1, 2, 3, 7 |
| UTC+7 / +8 / +9 | Offset masing-masing zona | 1, 2, 3, 7 |
| 15° per zona | 360° ÷ 24 jam | 14 (hitungan sendiri) |
| 1884 | Konferensi Meridian Internasional, Washington D.C. | 4 |
| 26 negara | Peserta Konferensi Meridian 1884 | 4 |
| 1879 | Makalah zona waktu Fleming disebarkan ke 18 negara | 5 |
| 1 zona untuk 5 zona geografis | China (UTC+8) | 8 |
| UTC+05:30 | India Standard Time | 9 |
| UTC+05:45 | Nepal Standard Time | 10 |
| 1988 | Tahun berlaku pembagian zona waktu Indonesia saat ini (Keppres 41/1987) | 1, 2, 11, 12 |
| Triliunan rupiah | Klaim penghematan dari proposal penyatuan 2012 | 13 |

## Poin kunci

- Cerita = mekanisme zona waktu (kenapa 15° per zona, kenapa batas tidak lurus) → penerapan di Indonesia (3 zona, Keppres) → perbandingan negara lain (China, India, Nepal) → wacana penyatuan.
- Hook sudah akurat, tidak perlu koreksi.
- Visual: peta Indonesia terbagi 3 warna, globe dengan garis meridian, diorama stasiun kereta (sejarah), jam dinding menunjukkan waktu berbeda.
- Angka HUD: 2 jam, 3 zona, 15°, 26 negara, 1884, 1988. Semuanya stabil (awet).
- Topik awet: fakta zona waktu tidak berubah-ubah. Satu-satunya yang bisa berubah: proposal penyatuan (tapi sudah mati sejak 2013).
