# Naskah — Monorepo vs Polyrepo: Mana yang Lebih Baik untuk Tim Kamu

> DRAF pra-produksi (backlog, 2026-11-25). Difinalkan di tahap 4 setelah style dipilih.
> Short: 190–210 kata @135–150 WPM.

## c00_hook — Hook

- Kata: **18** · estimasi **8 dtk**
- Visual: satu gudang raksasa berisi tumpukan kardus kode menjulang; HUD menghentak "2 MILIAR BARIS KODE" lalu stempel merah "JANGAN IKUT-IKUTAN?". Name plate teks "Google" (tanpa logo).

> Google simpan dua miliar baris kode di satu gudang. Kenapa banyak engineer bilang jangan ditiru? Ini bedahan AUDIRA.

## c01_intro — Intro

- Kata: **24** · estimasi **10 dtk**
- Visual: layar terbelah. Kiri: satu gudang besar dengan semua kardus proyek. Kanan: deretan gudang kecil, tiap gudang satu kardus. Label HUD "MONOREPO" vs "POLYREPO".

> Ada dua cara menyimpan kode. Monorepo: semua proyek di satu repositori. Polyrepo: tiap proyek punya repositori sendiri. Ini mengatur cara tim kerja tiap hari.

## c02 — Skala Google

- Kata: **41** · estimasi **17 dtk**
- Visual: kamera terbang masuk ke gudang; rak server berderet; counter HUD "86 TB" dan "25.000+ DEVELOPER" (chip tahun "JAN 2015"); dua aliran kardus masuk, label "16.000 manusia" dan "24.000 otomatis"; papan nama "PIPER".

> Januari 2015, repo Google sekitar delapan puluh enam terabyte, dipakai lebih dari dua puluh lima ribu developer. Tiap hari kerja masuk enam belas ribu perubahan manusia, plus dua puluh empat ribu otomatis. Git biasa nggak kuat, jadi mereka bikin sendiri: Piper.

## c03 — Windows pindah ke Git

- Kata: **24** · estimasi **10 dtk**
- Visual: truk kontainer mengangkut ribuan kardus ke satu dermaga gudang; HUD "3,5 JUTA FILE", "300 GB", "±4.000 ENGINEER", chip "2017". Name plate teks "Windows · Microsoft" (tanpa logo).

> Microsoft menyusul. Tahun 2017, kode Windows, tiga setengah juta file dan tiga ratus gigabyte, dipindah ke satu repo Git untuk sekitar empat ribu engineer.

## c04 — Untungnya monorepo

- Kata: **20** · estimasi **8 dtk**
- Visual: denah gudang transparan, semua rak terlihat; satu balok "API" diganti, garis berpendar menjalar ke semua proyek pemakai dan ikut berubah serentak. Callout "1 COMMIT, SEMUA IKUT".

> Untungnya jelas. Semua kode kelihatan, gampang dicari dan dipakai ulang. Ubah satu API, semua kode pemakainya bisa ikut diperbarui sekaligus.

## c05 — Kartu polyrepo

- Kata: **23** · estimasi **10 dtk**
- Visual: kembali ke deretan gudang kecil; tiap pintu punya gembok sendiri; tiap gudang memakai perkakas berbeda. Kartu HUD "SURVEI 2018" dengan tiga ikon: perkakas bebas, akses terbatas, stabil.

> Polyrepo punya kartu sendiri. Survei engineer Google tahun 2018: repo terpisah memberi kebebasan memilih tools, akses yang bisa dibatasi, dan kode lebih stabil.

## c06 — Biaya tersembunyi

- Kata: **32** · estimasi **13 dtk**
- Visual: gudang tunggal mulai sesak, kabel dependensi saling membelit, roda gigi build berputar berat; kartu kutipan teks "Matt Klein, 2019" (tanpa foto) dan kutipan paper "not for everyone".

> Kritiknya keras. Matt Klein, engineer Lyft, menulis tahun 2019: di skala besar, monorepo tetap menghadapi masalah polyrepo, plus kode yang saling terikat. Penulis paper Google pun mengakui, ini bukan untuk semua orang.

## c07_payoff — Payoff + outro

- Kata: **27** · estimasi **11 dtk**
- Visual: timbangan besar; piring kiri "TOOLING + KODE TERBUKA", piring kanan "BATAS AKSES + TOOLS BEBAS"; timbangan bergoyang lalu dua jalur menyala ke gudang besar dan deretan gudang kecil. Outro card AUDIRA.

> Jangan tanya mana yang keren. Tanya: timmu siap investasi tooling, dan nyaman semua kode terbuka? Kalau iya, monorepo. Butuh batas tegas? Polyrepo. Ikuti AUDIRA buat bedahan berikutnya.

## Opsi hook lain

1. Satu repo, dua miliar baris kode. Google bilang berhasil, tapi penulisnya sendiri bilang: ini bukan untuk semua orang.
2. Kodemu satu gudang besar, atau puluhan gudang kecil? Pilihan ini diam-diam menentukan cara timmu kerja.

## Total

- **209 kata** ≈ **84–93 dtk**
