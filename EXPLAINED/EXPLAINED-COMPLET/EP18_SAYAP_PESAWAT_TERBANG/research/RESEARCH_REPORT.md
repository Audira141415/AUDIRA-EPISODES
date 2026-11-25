# Research Report — EP18 Sayap Pesawat Terbang

Riset 2026-11-13. Nomor `#n` merujuk ke tabel fakta di `SOURCE_REGISTER.md`.

## Ringkasan inti

Penjelasan gaya angkat yang paling populer berbunyi: udara di atas sayap menempuh jalur lebih panjang, jadi harus lebih cepat agar tiba di ujung belakang bersamaan dengan udara di bawah. Penjelasan ini dikenal sebagai "equal transit time" dan keliru (#1). Video asap Prof. Holger Babinsky dari Cambridge menunjukkan udara di atas justru tiba jauh lebih dulu (#2). Udara di atas memang lebih cepat, dan Bernoulli memang benar; yang salah hanya alasannya (#3).

Penjelasan yang benar: sayap dipasang dengan sudut serang dan berpenampang melengkung (camber) (#4, #5). Kombinasi ini membelokkan aliran udara, baik oleh permukaan atas maupun bawah (#7). Aliran yang melengkung menghasilkan tekanan rendah di atas dan tekanan tinggi di bawah; selisih tekanan itu adalah gaya angkat (#8). Dilihat dari sisi Newton, sayap mendorong udara ke bawah dan udara mendorong sayap ke atas (#6). Dua sudut pandang ini saling melengkapi, bukan saling bersaing.

Gaya angkat punya batas. Melewati sudut serang kritis, aliran di permukaan atas terlepas dan gaya angkat anjlok: stall (#9). Gaya angkat juga sebanding kuadrat kecepatan: dua kali lebih cepat, empat kali gaya angkat pada sudut yang sama (#11). Karena itu, saat lepas landas dan mendarat (kecepatan rendah) sayap dibantu flap yang menambah lengkungan (#13).

## Cara kerja langkah demi langkah

| Tahap | Mekanisme | Fakta |
|---|---|---|
| 1 | Pesawat bergerak, udara mengalir relatif terhadap sayap | #12, #19 |
| 2 | Sudut serang + camber membelokkan aliran ke bawah | #4, #5, #7 |
| 3 | Aliran melengkung → tekanan rendah di atas, tinggi di bawah | #8 |
| 4 | Selisih tekanan = gaya angkat; reaksi Newton atas udara yang didorong ke bawah | #6, #8 |
| 5 | Udara atas jadi lebih cepat (akibat beda tekanan, bukan "lomba") | #2, #3 |
| 6 | Sudut terlalu curam → separasi aliran → stall | #9 |
| 7 | Kecepatan 2× → gaya angkat 4× | #11 |

## Sejarah singkat

Tidak dipakai di naskah. Catatan: Cambridge merilis ulang video Babinsky sebagai bahan Subject Masterclass (S1).

## Miskonsepsi yang dibantah

- **Equal transit time** (#1, #2): sumber hook utama. Jangan diulang sebagai fakta; naskah menyebutnya "versi yang keliru".
- "Hanya permukaan atas yang bekerja" (#7).
- "Bernoulli salah." Juga keliru: Bernoulli benar, hanya dipakai dengan alasan yang salah (#3). Naskah tidak menyerang Bernoulli.

## Angka untuk visual payoff

- **2× kecepatan → 4× gaya angkat** (#11, FAA). Visual: dua pesawat identik, panah gaya angkat satu kali vs empat kali lebih panjang.
- Opsi (MED): A380 ±680 kg per meter persegi sayap (#17).

## Catatan naskah

- Batas topik seri: jangan masuk ke vortex generator (EP34), pusaran ujung sayap/winglet (#20), atau tabung pitot (EP26).
- Dilarang/berisiko: angka sudut kritis "20°" sebagai angka umum (#10 khusus satu penampang), 95% hadirin (#16, anekdot), A380 (#17, satu sumber).
- Ejaan fonetik: Cambridge → "Kembrij"; FAA → "ef-ei-ei"; stall dibaca "stol" bila VO salah ucap (cek saat VO).
- Ide visual 3D kasar: terowongan angin dengan pulsa asap (rekonstruksi eksperimen Babinsky, dua garis waktu: udara atas tiba lebih dulu); penampang sayap dengan peta warna tekanan (biru di atas, merah di bawah); garis arus dibelokkan ke bawah di belakang sayap; slider sudut serang sampai aliran atas "robek" (stall); dua pesawat dengan panah gaya angkat 1× vs 4×.
