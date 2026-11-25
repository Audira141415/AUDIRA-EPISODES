# RESEARCH_REPORT — AE-073 "Bagaimana Teknologi 3D Printing Bisa Membangun Rumah?"

Tanggal riset: 2026-11-10. Nomor [#] merujuk ke baris klaim di `SOURCE_REGISTER.md`.

## Verifikasi ide bank

- "Printer menyemprotkan campuran beton khusus mengikuti jalur digital, menumpuk lapisan yang cepat mengeras": **benar, dengan koreksi kata**. Printer *mengekstrusi* (memeras seperti pasta gigi), bukan menyemprot. Material berupa mortar/beton halus khusus (agregat kecil, maks 4,75–10 mm). Lapisan tidak "mengeras" penuh dalam hitungan menit; ia cukup *kaku* untuk menahan lapisan berikutnya, lalu mengeras pelan seperti beton biasa [2][4][6][7].
- Reveal "dinding dicetak berongga lalu diisi tulangan atau insulasi": **benar untuk banyak sistem, tapi tidak selalu**. ICON: dua cangkang dengan rongga, diisi spray foam, inti bertulang tiap ±1,2 m [8]. Beckum (Jerman): dinding 2–3 lapis, *tanpa tulangan* [9]. Rumuskan: "dindingnya sering dicetak berongga, lalu rongganya diisi insulasi, besi, atau kabel".
- Hook "printer sebesar truk": **aman**. Vulcan lebih dari 13 m lebar [23]; Titan berat kering 21,8 ton dan diangkut dengan dimensi kemas 11,2 × 2,1 × 2,5 m, seukuran trailer truk [7].

## Mekanisme inti (urutan)

1. **Desain digital.** Arsitek membuat model 3D rumah. Software (slicer) memotongnya jadi lapisan tipis dan mengubahnya jadi jalur gerak nozzle [2].
2. **Pasang printer di lokasi.** Fondasi/pelat lantai dicor konvensional dulu. Printer gantry (rangka portal) dirakit mengelilingi denah dalam 1–2 hari. Printer lengan/boom (ICON Titan) berjalan di atas track [1][21][22].
3. **Campur dan pompa.** Semen, pasir halus, air, dan aditif dicampur di mixer dekat printer, dipompa lewat selang ke kepala cetak [11][2].
4. **Ekstrusi lapis demi lapis.** Nozzle memeras "tali" beton setinggi 1–4 cm dan selebar 3–10 cm. Kepala cetak berputar keliling denah, lalu naik satu lapis [6].
5. **Material menahan bentuk.** Beton cetak dirancang cair saat dipompa, tapi langsung kaku setelah keluar (sifat tiksotropik / structural build-up). Lapisan bawah harus cepat cukup kuat menahan beban lapisan atas. Ini kunci yang membuat dinding tidak ambruk tanpa cetakan [4].
6. **Dinding berongga + pola pengisi.** Biasanya dua kulit (dalam dan luar) dengan garis zigzag/penghubung di antaranya. Rongga ditinggalkan untuk insulasi, tulangan vertikal, dan jalur kabel/pipa [3][8].
7. **Isi rongga dan pasang utilitas.** Tulangan dan cor inti di titik tertentu (ICON), spray foam, saluran listrik dan air [8].
8. **Pekerjaan konvensional.** Atap, kusen, jendela, pintu, instalasi, plester/finishing dikerjakan pekerja seperti biasa [12][21].

## Fakta menarik yang aman dipakai

1. **Wolf Ranch, Texas**: 100 rumah dinding cetak 3D (ICON + Lennar, desain BIG), mulai dicetak November 2022, selesai 2025. Tiap rumah butuh sekitar 3 minggu pencetakan dinding; fondasi dan atap logam tetap dipasang cara biasa [11][12].
2. **Beckum, Jerman (2020)**: rumah tinggal cetak 3D pertama di Jerman, dua lantai, sekitar 80 m² per lantai, waktu cetak murni 100 jam, dan dindingnya tidak memakai tulangan sama sekali [3][10].
3. **Printer BOD2** mencetak 1 m² dinding berongga dalam sekitar 5 menit, dengan lapisan 1–4 cm. Pengawasnya cukup 2–3 orang [6][22].
4. **Jam cetak ≠ rumah jadi**: rumah 160 m² di Arizona dicetak dalam 45 jam [14], tapi ICON sendiri menyebut rata-rata proyek berjalan 6,1 bulan dari desain sampai selesai [13].
5. **Indonesia**: Kementerian PUPR menguji coba 3D printing rumah tapak di Yogyakarta pada 12–31 Januari 2021 [19]. Pada Agustus 2025, Indocement dan Modula3D (patungan Bakrie & Brothers dan COBOD) mencetak bangunan Indocement Collaborative Hub sekitar 120 m² dengan printer COBOD BOD3 [20].

## JANGAN DIKLAIM

- "Rumah jadi dalam 24 jam" atau "sehari". Klaim WinSun 2014 tidak termasuk fondasi, utilitas, pintu/jendela, dan dipersoalkan [17]. Yang bisa dalam jam/hari hanya **pencetakan dinding**.
- "Seluruh rumah dicetak". Atap, jendela, pintu, instalasi, dan umumnya fondasi tidak dicetak [21].
- "Selalu diisi besi/tulangan". Beckum tanpa tulangan [9]; ICON pakai tulangan di inti dan ikat silang [8]. Bergantung desain dan aturan setempat.
- "Beton langsung keras dalam detik/menit". Material hanya cukup kaku untuk menahan bentuk; pengerasan (curing) tetap butuh waktu seperti beton biasa. Jangan sebut angka waktu set [5].
- Angka harga spesifik Wolf Ranch: sumber berbeda (mulai US$400 ribu vs US$450–600 ribu) [15].
- Klaim hemat biaya: "US$20/sq ft", "40% lebih murah", "hemat 70% waktu", "rumah 6 hari". Semua klaim perusahaan, bukan data independen [16][20].
- "Vulcan berat 4,75 ton". Konflik antar sumber [23].
- "Menyemprot". Proses yang benar adalah ekstrusi (diperas), bukan semprot (shotcrete).
- "Rusus 3D printing PUPR sudah dibangun". Hanya rencana 2022; realisasi tidak terverifikasi [19].
- Istilah "G-code" untuk semua printer. Aman: "jalur cetak digital" / "kode gerak".

## Saran visual akurat (untuk 3D)

- **Printer gantry (BOD2 style)**: rangka portal baja persegi yang *mengelilingi* seluruh denah rumah. Tiang vertikal di sudut (bisa 4 atau lebih modul), balok jembatan horizontal bergerak naik turun, kereta kepala cetak meluncur di balok. Ukuran bisa 13,5 m lebar × 9 m tinggi. Warna PERI/COBOD: rangka abu baja/biru tua dengan aksen oranye/kuning. Selang pompa hitam tebal menggantung ke kepala cetak [2].
- **Printer lengan/boom (ICON Titan style)**: unit berat di atas track rantai baja, boom berlengan banyak menjulur ke denah, kepala cetak di ujung. Diesel, 2 operator [7]. Vulcan di Wolf Ranch: printer besar lebar >13 m yang mencetak satu rumah tanpa dipindah [12][23]; bentuk rangka detailnya tidak diverifikasi di riset ini, jadi jangan meniru Vulcan secara spesifik.
- **Nozzle & tali beton**: tali beton abu muda, lebar 3–10 cm dan tebal 1–4 cm, tepi membulat. Hasil dinding bergaris horizontal ("corduroy"), bukan halus [6][11]. Nozzle bisa berputar mengikuti arah jalur.
- **Penampang dinding (reveal)**: dua kulit tipis (dalam & luar) + garis zigzag/diagonal di tengah sebagai penghubung; rongga kosong. Lalu animasikan: busa insulasi kuning/krem mengisi rongga, batang besi vertikal (tulangan) di beberapa titik, pipa air biru dan saluran kabel oranye/abu di rongga [8].
- **Dinding membulat**: sudut lengkung umum dan mudah dicetak (Beckum, Apis Cor) [3][18].
- **Peralatan pendukung**: silo/mixer pompa di samping printer, selang ke kepala cetak [2][11].
- **Bagian konvensional**: fondasi pelat beton sudah ada sebelum cetak; atap logam (standing seam) atau rangka kayu dipasang setelah dinding; jendela besar dipasang manual oleh pekerja [10][11][12].
- **Hindari**: printer kecil seperti printer meja, filamen plastik, beton keluar seperti semprotan cair, rumah lengkap dengan atap muncul dari nozzle, dinding beton padat tanpa rongga untuk adegan reveal, tanpa manusia sama sekali (selalu ada 2–3 operator).
- **Label HUD yang aman**: "Lapisan 1–4 cm", "Cetak dinding: jam–minggu", "Atap & jendela: dipasang manual".
