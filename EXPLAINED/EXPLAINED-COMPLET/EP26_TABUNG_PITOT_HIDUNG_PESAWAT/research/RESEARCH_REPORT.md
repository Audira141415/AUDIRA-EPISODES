# Research Report — EP26 Tabung Pitot di Hidung Pesawat

Riset 2026-11-13. Nomor `#n` merujuk ke tabel fakta di `SOURCE_REGISTER.md`.

## Ringkasan inti

Pesawat tidak bisa mengukur kecepatan dari putaran roda, karena di udara yang penting adalah kecepatan terhadap udara. Alatnya tabung pitot: tabung kecil yang lubang depannya menghadap arah terbang (#1, #4). Udara yang masuk tidak bisa keluar, jadi terhenti dan tekanannya naik menjadi tekanan total. Lubang statis di sisi badan pesawat (atau di sisi tabung, pada versi pitot-statis/Prandtl) hanya merasakan tekanan udara sekitar (#5, #8). Selisih keduanya, tekanan dinamis, diubah jadi kecepatan lewat persamaan Bernoulli; selisih itu sebanding kuadrat kecepatan (#6, #7).

Prinsipnya ditemukan Henri Pitot pada 1732 saat mengukur aliran Sungai Seine, lalu dimodifikasi Henry Darcy pada 1858 (#2, #3). Pesawat penumpang membawa tiga tabung untuk cadangan dan perbandingan (#10), dipasang di dekat hidung, di bawah kokpit (#11).

Kelemahan tabung pitot adalah lubangnya yang terbuka. Es, air, dan serangga bisa menyumbatnya, sehingga tabung diberi pemanas (#12). Kristal es pada pitot menjadi pemicu rangkaian kecelakaan Air France 447 tahun 2009 (#21). Ancaman paling tak terduga adalah tawon: Birgenair 301 (1996) jatuh setelah satu pitot diduga tersumbat sarang tawon (#15–16), dan studi di Bandara Brisbane mencatat 93 probe tiruan tersumbat penuh sarang tawon keyhole dalam 39 bulan (#17).

## Cara kerja langkah demi langkah

| Tahap | Yang terjadi | Fakta |
|---|---|---|
| 1. Udara menabrak | Lubang depan menghadap arah terbang; udara masuk dan terhenti | #4 |
| 2. Tekanan total | Udara yang terhenti menaikkan tekanan di saluran pitot | #1, #4 |
| 3. Tekanan statis | Lubang statis di sisi badan/tabung merasakan tekanan sekitar | #5, #8 |
| 4. Selisih | Diafragma indikator (atau air data computer) membaca pt − ps | #6 |
| 5. Kecepatan | V = √(2Δp/ρ); 2× cepat = 4× selisih tekanan | #7 |
| 6. Redundansi | Tiga tabung; komputer membandingkan | #10 |
| 7. Proteksi | Pemanas mencegah es; penutup saat parkir mencegah serangga | #12, #16 |

## Sejarah singkat

- 1732: Henri Pitot mempublikasikan alatnya (aliran Seine) (#2).
- 1858: Henry Darcy memodifikasi ke bentuk modern (#3).
- Ludwig Prandtl: tabung pitot-statis koaksial ("tabung Prandtl") (#8).
- 1974, 1996, 2009: kecelakaan terkait pitot/static (#24, #15, #23, #21).

## Miskonsepsi yang dibantah

- "Spidometer pesawat membaca roda/GPS" → indikator kecepatan udara membaca tekanan udara, bukan roda (#1, #6). (GPS memberi ground speed, bukan airspeed; tidak dipakai di naskah agar singkat.)
- "Tabung kecil di hidung itu antena" → itu sensor tekanan udara (#1).
- "Tawon tidak mungkin menjatuhkan pesawat" → Birgenair 301 diduga kuat begitu (#15), dan Brisbane membuktikan tawon rutin bersarang di probe (#17–18).

## Angka untuk visual payoff

- **93 tabung tersumbat dalam 39 bulan** di Brisbane (#17), counter naik di atas deretan tabung tiruan.
- 2× kecepatan = 4× tekanan (#7), batang tekanan membesar kuadrat.
- 3 tabung per pesawat (#10).

## Catatan naskah

- Dilarang menyebut tawon sebagai penyebab pasti Birgenair: tabung tidak pernah ditemukan. Naskah memakai "diduga" (#15).
- Tidak menyebut jumlah korban di naskah (189 / 228) supaya nada tidak sensasional; bisa ditambah bila pengguna mau.
- AF447 sengaja tidak dibahas: penyebab akhirnya respons pilot, butuh konteks panjang.
- Hindari mengulang EP18 (sayap/gaya angkat). Bernoulli hanya disebut sebagai selisih tekanan, tanpa menyebut nama persamaan.
- Ejaan fonetik: pitot → "pito" (t akhir tidak dibaca dalam bahasa Prancis; dalam aviasi Inggris "PEE-toh"), Henri Pitot → "Ongri Pito", Seine → "Sen", Boeing → "Boing", Brisbane → "Brisben".
- Ide visual 3D kasar: hidung pesawat close-up dengan tiga tabung; potongan melintang tabung memperlihatkan partikel udara menumpuk di ujung; manometer dua kolom (total vs statis); indikator kecepatan analog; makro tawon membawa lumpur ke lubang tabung; deretan tabung tiruan di tiang lampu bandara dengan counter 93; pita merah "REMOVE BEFORE FLIGHT" di penutup.
