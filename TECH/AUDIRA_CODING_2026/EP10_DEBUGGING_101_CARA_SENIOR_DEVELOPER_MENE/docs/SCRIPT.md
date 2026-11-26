# Naskah — Debugging 101: Cara Senior Developer Menemukan Bug Lebih Cepat

> DRAF pra-produksi (backlog, 2026-11-25). Difinalkan di tahap 4 setelah style dipilih.
> Short: 190–210 kata @135–150 WPM.

## c00_hook — Hook

- Kata: **14** · estimasi **6 dtk**
- Visual: Layar terminal ilustratif penuh teks error merah, kaca pembesar menyapu dan menyorot satu baris sampai berubah jadi panah petunjuk hijau.

> Tulisan merah di layar itu bukan musuh. Itu petunjuk, dan kebanyakan orang malah melewatinya.

## c01_intro — Intro

- Kata: **14** · estimasi **6 dtk**
- Visual: Meja kerja developer tanpa wajah (tangan + siluet dari belakang), tiga ikon alat muncul berjajar: kaca pembesar, gunting belah dua, bebek karet.

> Developer berpengalaman tidak menebak-nebak. Mereka punya urutan kerja. Dan ceritanya dimulai dari seekor serangga.

## c02 — Ngengat di Mark II

- Kata: **35** · estimasi **14 dtk**
- Visual: Ilustrasi lemari relay komputer Harvard Mark II (generik, tanpa orang), kamera masuk ke relay, ngengat terjepit, lalu buku log terbuka dengan ngengat ditempel. HUD: chip "9 SEP 1947", chip "HARVARD MARK II", chip "EDISON · 1878" saat kalimat terakhir.

> Sembilan September 1947, tim komputer Harvard Mark II menemukan ngengat terjepit di relay. Ngengatnya ditempel di buku log dengan catatan: kasus bug pertama yang benar-benar ditemukan. Lucunya, kata bug sudah dipakai Thomas Edison sejak 1878.

## c03 — Baca errornya sampai habis

- Kata: **27** · estimasi **11 dtk**
- Visual: Traceback Python ilustratif dibelah per lapis: tumpukan pemanggilan menyala satu per satu dari atas ke bawah, baris terakhir membesar dan diberi label. HUD: callout "BARIS TERAKHIR = APA YANG TERJADI", callout "TRACEBACK = JALUR KODE".

> Langkah pertama: baca pesan errornya sampai habis. Dokumentasi resmi Python bilang, baris terakhir pesan error menunjukkan apa yang terjadi. Traceback di atasnya menunjukkan jalur kode menuju masalah.

## c04 — Persempit lokasinya

- Kata: **28** · estimasi **12 dtk**
- Visual: Deretan commit sebagai titik di garis waktu horizontal, dibelah dua berulang (setengah meredup tiap langkah) sampai tinggal satu titik merah. HUD: counter "675 REVISI" turun ke "±10 LANGKAH", label "GIT BISECT · PENCARIAN BINER".

> Kedua, persempit lokasinya. Git punya perintah bisect yang memakai pencarian biner. Riwayat kode dibelah dua berulang kali. Dari 675 revisi, sisanya kira-kira sepuluh langkah sampai ketemu commit penyebabnya.

## c05 — Jelaskan ke bebek karet

- Kata: **25** · estimasi **10 dtk**
- Visual: Bebek karet kuning di samping monitor, baris kode muncul satu per satu sebagai balon kata, satu baris tiba-tiba berkedip merah. HUD: chip buku "THE PRAGMATIC PROGRAMMER · 1999" (sampul generik, tanpa logo penerbit).

> Ketiga, jelaskan kodenya baris demi baris ke bebek karet. Teknik ini dipopulerkan buku The Pragmatic Programmer tahun 1999. Saat kamu menjelaskan, kesalahannya sering muncul sendiri.

## c06 — Kenapa ini penting

- Kata: **37** · estimasi **15 dtk**
- Visual: Tumpukan koin/uang kertas generik membesar di atas peta siluet Amerika Serikat, lalu transisi ke kartu kutipan tipografis (tanpa foto orang). HUD: counter "US$59,5 MILIAR / TAHUN", chip "NIST · 2002", name plate teks "BRIAN KERNIGHAN · 1979".

> Kenapa ini penting? Laporan NIST tahun 2002 memperkirakan pengujian software yang kurang memadai merugikan Amerika 59,5 miliar dolar per tahun. Brian Kernighan menulis, alat debugging paling ampuh tetap pikiran yang teliti, ditambah print di tempat yang tepat.

## c07_payoff — Payoff + outro

- Kata: **28** · estimasi **12 dtk**
- Visual: Tiga alat (kaca pembesar, gunting belah dua, bebek karet) menyatu jadi checklist tiga langkah yang tercentang, layar error berubah hijau "PASSED", lalu kartu outro AUDIRA.

> Jadi urutannya: baca errornya, persempit lokasinya, lalu jelaskan kodenya. Lain kali muncul error, jangan langsung ditutup. Baca dulu. Simpan video ini, dan ikuti AUDIRA untuk cara kerja lainnya.

## Opsi hook lain

1. Bug pertama di dunia komputer itu bukan kode. Itu ngengat sungguhan.
2. Senior developer tidak lebih pintar menebak. Mereka cuma lebih rajin membaca error.

## Total

- **208 kata** ≈ **83–92 dtk** (@150–135 WPM)
