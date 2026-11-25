# SOURCE_REGISTER — EP21 Bug Y2K (AUDIRA TECH, @AudiraTECH)

Tanggal riset: 2026-11-23. Fakta diambil dari artikel Wikipedia yang dibaca langsung, dicek terhadap sumber primer yang dikutip artikel itu.

| # | Fakta | Angka dipakai di naskah | Sumber | Kepercayaan |
|---|---|---|---|---|
| F1 | Program lama menyimpan tahun 2 digit untuk hemat memori; memori inti awal ± US$1 per bit (1960-an), US$10–100 per KB (1975) | "satu dolar per bit" | Wikipedia "Year 2000 problem"; Our World in Data, historical cost of computer memory (ourworldindata.org/grapher/historical-cost-of-computer-memory-and-storage) | MEDIUM (angka 1960-an tanpa sitasi primer → dipakai sebagai "sekitar") |
| F2 | Program menambah "19" di depan 2 digit; tahun 2000 → "00" → dibaca 1900 | "00 = 1900" | Kappelman & Scott, Computerworld 1996 (comlinks.com/mag/accr.htm); Wikipedia | HIGH |
| F3 | Alan Greenspan (1998) mengaku menulis program seperti itu di 1960–70-an | — (opsional) | Senate Banking Committee report 1998 | HIGH |
| F4 | Biaya global persiapan Y2K kemungkinan > US$300 miliar | "lebih dari 300 miliar dolar" | BBC "Y2K: Overhyped and oversold?" (news.bbc.co.uk/2/hi/talking_point/586938.stm) | HIGH |
| F5 | IDC: dunia menghabiskan ± US$308 miliar; AS ± US$134 miliar persiapan + US$13 miliar perbaikan 2000–01 | "308 miliar dolar" | Computerworld, Mitchell 2009 (computerworld.com/s/article/9142555/) | HIGH |
| F6 | Bob Bemer menyadari masalah ini sejak 1958 dan memperingatkan ± 20 tahun | "1958" | Washington Post 2004 (washingtonpost.com/wp-dyn/articles/A4138-2004Jun24.html) | HIGH |
| F7 | Peter de Jager menulis "Doomsday 2000" di Computerworld, 1993 | — (opsional) | NYT 1998 via Wikipedia | HIGH |
| F8 | Insiden nyata: monitor radiasi PLTN Shika (Ishikawa, Jepang) gagal saat pergantian tahun | "PLTN di Jepang" | BBC (news.bbc.co.uk/2/hi/asia-pacific/585950.stm) | HIGH |
| F9 | 150 mesin slot di Delaware (AS) berhenti | "150 mesin slot" | BBC "Minor bug problems arise" (news.bbc.co.uk/1/hi/sci/tech/586620.stm) | HIGH |
| F10 | Situs US Naval Observatory menampilkan "1 Jan 19100" | "19100" | CNN (arsip) via Wikipedia | HIGH |
| F11 | Denda sewa video US$91.250 di New York | "91 ribu dolar" (opsional) | Wikipedia (sumber berita 2000) | MEDIUM |
| F12 | Tidak ada keruntuhan besar; kerusakan kecil dan cepat diperbaiki — karena perbaikan besar-besaran sebelumnya (perdebatan "overhyped" tetap ada) | narasi | BBC talking point; Guardian 9 Jan 2000 (IDC: AS mungkin "membuang" US$40 miliar) | HIGH |
| F13 | Masalah 2038: Unix time 32-bit bertanda; nilai maks 2.147.483.647 detik sejak 1 Jan 1970 00:00:00 UTC | "2.147.483.647" | Wikipedia "Year 2038 problem" | HIGH |
| F14 | Batas terakhir: 19 Januari 2038 03:14:07 UTC; satu detik kemudian melompat ke 13 Desember 1901 20:45:52 UTC | "19 Januari 2038", "1901" | Wikipedia "Year 2038 problem" | HIGH |
| F15 | Paling rentan: sistem tertanam/lama yang jarang di-update (mobil ABS/ESC, GPS, perangkat 32-bit) | narasi | Wikipedia "Year 2038 problem" | HIGH |
| F16 | Solusi: time_t 64-bit (± 292 miliar tahun); Linux 5.6 (2020), glibc 2.34 (2021) | "64-bit", "292 miliar tahun" | Wikipedia "Year 2038 problem" | HIGH |
| F17 | Bocoran 2038 sudah terjadi: Microsoft Exchange 1 Jan 2022 (angka 220101001 > 2.147.483.647) | "Exchange 2022" (opsional) | Wikipedia "Year 2038 problem" | HIGH |

## Koreksi dari brief awal
- Satelit mata-mata AS mati 31 Des 1999 karena **patch** Y2K, bukan bug itu sendiri → tidak dipakai agar tidak menyesatkan.
- Istilah "Y2K" dicetuskan David Eddy (email 12 Juni 1995), bukan Bob Bemer.
- Tidak ada angka Gartner/US Commerce di sumber yang dibaca → tidak dipakai.

## Musik/SFX
SFX prosedural dari `npm run sfx` (dibuat lokal, tanpa lisensi pihak ketiga). Tanpa musik berlisensi.
