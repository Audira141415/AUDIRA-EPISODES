# Naskah — Cara Baca Error Stack Trace seperti Senior Developer

> DRAF pra-produksi (backlog, 2026-11-25). Difinalkan di tahap 4 setelah style dipilih.
> Short: 190–210 kata @135–150 WPM.

## c00_hook — Hook

- Kata: **15** · estimasi **6 dtk**
- Visual: Terminal gelap dibanjiri teks error merah bergulir cepat; teks membeku, lalu garis-garis traceback berubah jadi rute peta dengan pin merah di satu baris. HUD: "BUKAN MUSUH".

> Layar merah penuh tulisan itu bukan musuh. Itu peta yang menunjuk langsung ke bug kamu.

## c01_intro — Intro

- Kata: **19** · estimasi **8 dtk**
- Visual: Tumpukan kartu frame (fungsi) tersusun vertikal seperti tumpukan piring; kartu paling atas retak saat program "jatuh". Label HUD di objek: "AUDIRA DEBUG LAB".

> Namanya stack trace: laporan fungsi yang sedang aktif saat program jatuh. Di AUDIRA, kita bedah bareng, baris demi baris.

## c02 — Python: baca dari bawah

- Kata: **28** · estimasi **12 dtk**
- Visual: Traceback Python generik (kode buatan sendiri, tanpa logo). Judul "most recent call last" disorot; panah besar meluncur ke bawah; baris terakhir membesar. Callout HUD: "NameError".

> Mulai dari Python. Judulnya: most recent call last. Artinya, panggilan terakhir ada di paling bawah. Jadi baca dari bawah. Baris terakhir berisi jenis error dan pesannya, misalnya NameError.

## c03 — Java & JavaScript: baca dari atas

- Kata: **23** · estimasi **10 dtk**
- Visual: Layar terbelah: trace gaya Java (`at ...`) dan gaya JavaScript; panah naik ke frame teratas, ikon "lemparan" bola merah keluar dari frame itu. Callout HUD: "10 FRAME" dengan penghitung 1→10 lalu sisa frame memudar.

> Java dan JavaScript kebalikannya. Baris paling atas adalah pemanggilan terakhir, titik tempat error dilempar. Di mesin V8, jejaknya cuma sepuluh frame secara bawaan.

## c04 — Caused by

- Kata: **29** · estimasi **12 dtk**
- Visual: Kotak error dibuka seperti boneka matryoshka/kardus berlapis: tiap lapisan bertulis "Caused by:", lapisan terdalam menyala sebagai akar. Baris "... 1 more" dilipat seperti akordeon. Callout HUD: "Caused by:" dan "... 1 more = singkatan".

> Ketemu tulisan Caused by? Itu error asli yang dibungkus error lain. Caused by paling bawah adalah penyebab paling awal. Baris titik-titik dengan kata more cuma menyingkat frame yang sama.

## c05 — Rantai error Python

- Kata: **25** · estimasi **11 dtk**
- Visual: Dua domino error: (a) domino kedua jatuh di tengah upaya menahan domino pertama, label "During handling"; (b) domino pertama dengan sengaja mendorong yang kedua, label "direct cause". Diagram panah berbeda warna.

> Python punya versinya sendiri. During handling berarti error kedua muncul saat menangani error pertama. Direct cause berarti error itu sengaja dilempar ulang dari error sebelumnya.

## c06 — Penjelasan: Python makin membantu

- Kata: **27** · estimasi **12 dtk**
- Visual: Timeline versi: chip "3.10" memunculkan balon saran "Did you mean: namedtuple?" yang mengoreksi teks salah ketik; chip "3.11" memunculkan deretan caret ^^^^ yang mengetik di bawah ekspresi gagal. Callout HUD: "Python 3.10", "Python 3.11".

> Python juga makin membantu. Sejak versi 3.10, salah ketik nama sering diberi saran Did you mean. Versi 3.11 menambah tanda caret yang menunjuk persis ekspresi yang gagal.

## c07_payoff — Payoff + outro

- Kata: **29** · estimasi **12 dtk**
- Visual: Checklist 3 langkah menyala berurutan (1 jenis error → 2 baris kode sendiri → 3 Caused by sampai dasar); layar merah berubah hijau "BUILD PASSED". Lalu outro card AUDIRA.

> Jadi urutannya: baca jenis error, cari baris dari kode kamu sendiri, lalu telusuri Caused by sampai dasar. Error itu bukan musuh, tapi petunjuk. Ikuti AUDIRA untuk cara kerja lainnya.

## Opsi hook lain

1. Programmer pemula panik lihat teks merah. Padahal jawabannya sering ada di satu baris.
2. Python bilang baca dari bawah, Java bilang dari atas. Salah arah, kamu memburu bug di tempat yang salah.

## Total

- **195 kata** ≈ **78–87 dtk**
