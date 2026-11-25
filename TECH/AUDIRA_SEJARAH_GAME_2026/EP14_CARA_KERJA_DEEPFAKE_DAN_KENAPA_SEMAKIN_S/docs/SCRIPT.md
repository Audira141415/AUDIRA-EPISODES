# Naskah — Cara Kerja Deepfake dan Kenapa Semakin Sulit Dideteksi

> DRAF pra-produksi (backlog, 2026-11-25). Difinalkan di tahap 4 setelah style dipilih.
> Short: 190–210 kata @135–150 WPM.

## c00_hook — Hook

- Kata: **20** · estimasi **9 dtk**
- Visual: Layar hitam, glitch: siluet kepala tanpa wajah (mannequin abstrak) terbentuk dari piksel dan noise; kamera kecil di sudut dicoret merah.

> Video ini tidak pernah direkam kamera. Wajah dan suaranya dibuat mesin. Begini cara kerja deepfake, dan kenapa makin sulit dideteksi.

## c01_intro — Intro

- Kata: **18** · estimasi **8 dtk**
- Visual: Papan forum anonim bergaya wireframe (tanpa logo), kalender bergulir ke akhir 2017, ikon topeng wajah dipindah antar siluet. HUD: 2017.

> Istilah deepfake lahir akhir 2017, dari satu pengguna Reddit bernama deepfakes. Dia menempelkan wajah selebriti ke video lain.

## c02 — Dua model saling berlomba (GAN)

- Kata: **32** · estimasi **14 dtk**
- Visual: Dua robot abstrak berhadapan: satu mencetak lembar gambar, satu memegang kaca pembesar dan stempel asli/palsu; skor berpindah. HUD: 2014.

> Mesin awalnya adalah GAN, diusulkan Ian Goodfellow dan kawan-kawan tahun 2014. Dua model saling berlomba. Satu membuat gambar palsu, satu lagi menebak asli atau palsu. Si pemalsu dilatih supaya tebakan lawannya meleset.

## c03 — Makin halus: StyleGAN dan model difusi

- Kata: **31** · estimasi **13 dtk**
- Visual: Slider atribut (pose, identitas) menggeser wajah sintetis abstrak; lalu noise statis jernih bertahap menjadi bentuk kepala. HUD: 2018, 2020.

> Tahun 2018, StyleGAN memisahkan atribut seperti pose dan identitas, jadi kontrolnya makin halus. Tahun 2020 muncul model difusi. Gambar dibangun dari noise acak, dibersihkan langkah demi langkah, sampai kualitasnya menyaingi GAN.

## c04 — Detektor ikut belajar

- Kata: **21** · estimasi **9 dtk**
- Visual: Pemindai grid melintasi bingkai video sintetis, kotak deteksi menyala hijau pada tepi wajah; timbangan manusia vs mesin. HUD: 2019.

> Detektor juga belajar. FaceForensics plus plus, tahun 2019, menunjukkan detektor otomatis bisa mengungguli pengamat manusia. Tapi detektor hanya sebaik data latihnya.

## c05 — Tantangan deteksi terbuka

- Kata: **34** · estimasi **15 dtk**
- Visual: Dinding ribuan klip kecil bergulir, kerumunan ikon tim, grafik batang skor mentok di tengah. HUD: 100.000 klip, 3.426 aktor, 2.114 tim, 0,73.

> Tahun 2020, tantangan deteksi terbuka memakai seratus ribu klip dari 3.426 aktor bayaran. Ikut 2.114 tim. Pada video asli dari internet, model terbaik hanya mencapai ROC-AUC sekitar 0,73. Penulisnya menyebut deteksi masih belum terpecahkan.

## c06 — Kenyataan di media sosial

- Kata: **27** · estimasi **12 dtk**
- Visual: Aliran umpan media sosial abstrak (tanpa logo) dengan klip bergaya acak; grafik AUC jatuh tajam. HUD: 2024, 50 persen.

> Benchmark Deepfake-Eval-2024 mengumpulkan deepfake yang beredar di media sosial tahun 2024. Hasilnya, detektor sumber terbuka anjlok. AUC untuk model video turun sekitar 50 persen dibanding benchmark lama.

## c07_payoff — Payoff + outro

- Kata: **25** · estimasi **11 dtk**
- Visual: Meja analis: layar mosaik verifikasi, stempel Cek Sumber; outro card AUDIRA. HUD: Juni 2023.

> FBI pada Juni 2023 memperingatkan, foto dan video orang dipalsukan untuk pelecehan dan pemerasan. Jadi jangan percaya satu video saja. Cek sumbernya dulu. Ini AUDIRA.

## Opsi hook lain

1. Wajah itu nyata, kata-katanya nyata, tapi orangnya tidak pernah mengatakannya.
2. Detektor deepfake terbaik gagal separuh saat diuji di dunia nyata.

## Total

- **208 kata** ≈ **90 dtk**
