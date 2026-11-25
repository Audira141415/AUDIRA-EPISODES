# Naskah — Dependency Injection: Bukan Hanya untuk Java Enterprise

> DRAF pra-produksi (backlog, 2026-11-25). Difinalkan di tahap 4 setelah style dipilih.
> Short: 190–210 kata @135–150 WPM.

## c00_hook — Hook

- Kata: **14** · estimasi **6 dtk**
- Visual: Kotak fungsi di blueprint menarik kabel langsung ke ikon database; indikator tes berkedip merah. Callout "tes gagal".

> Kamu menulis satu tes kecil, tapi kodenya malah menghubungi database sungguhan. Penyebabnya cuma satu.

## c01_intro — Intro

- Kata: **29** · estimasi **12 dtk**
- Visual: Kotak kelas membuat sendiri kotak kecil di dalamnya; teks "new" menyala di tiap kotak.

> Kelasnya membuat sendiri barang yang dia butuhkan. Di sini AUDIRA akan membahas dependency injection. Kedengarannya urusan Java enterprise, padahal inti ide ini sederhana: jangan bikin sendiri, minta dari luar.

## c02 — Apa itu DI

- Kata: **29** · estimasi **12 dtk**
- Visual: Modul perakit memasang kotak kecil ke slot sebuah kelas. Callout HUD "2004 · Martin Fowler".

> Tahun 2004, Martin Fowler menulis artikel yang membuat istilah ini terkenal. Idenya, ada satu perakit terpisah yang memasang kebutuhan sebuah kelas. Kelasnya tinggal memakai, tanpa perlu tahu cara membuatnya.

## c03 — Tiga bentuk

- Kata: **25** · estimasi **10 dtk**
- Visual: Tiga jalur kabel berlabel Constructor, Setter, Interface; jalur Constructor menyala. Callout "3 gaya".

> Fowler menyebut tiga gaya: lewat constructor, lewat setter, dan lewat interface. Yang paling gampang dibaca biasanya constructor, karena semua kebutuhan kelas tertulis jelas di parameternya.

## c04 — Python

- Kata: **21** · estimasi **9 dtk**
- Visual: Diagram kode Python; kata "Depends" menyala dengan panah ke fungsi endpoint.

> Di Python, FastAPI punya Depends. Kamu tulis apa yang dibutuhkan fungsimu, lalu framework yang menyediakannya. Tidak ada new bertebaran di mana-mana.

## c05 — JS

- Kata: **19** · estimasi **8 dtk**
- Visual: Diagram TypeScript: kelas controller menerima kotak "service" lewat constructor; container di tengah menyambungkan.

> Di dunia JavaScript, NestJS dan Angular dibangun di atas pola yang sama. Constructor meminta service, dan container yang mengantarkannya.

## c06 — Penjelasan (tes)

- Kata: **36** · estimasi **15 dtk**
- Visual: Slot database asli dicabut, diganti kotak palsu berlabel "fake"; indikator tes berubah hijau. Callout "dependency_overrides".

> Nah, bagian testable-nya. Karena dependensi datang dari luar, saat tes kamu tinggal menukar database asli dengan yang palsu. FastAPI bahkan menyediakan dependency_overrides khusus untuk ini. Hasilnya, tes jalan cepat dan tidak menyentuh apa pun yang sungguhan.

## c07_payoff — Payoff + outro

- Kata: **36** · estimasi **15 dtk**
- Visual: Kabel rapi dengan colokan bisa dicabut-pasang; kartu outro AUDIRA. Callout "25 dolar vs 5 sen".

> James Shore menyebut dependency injection istilah dua puluh lima dolar untuk konsep lima sen. Intinya cuma meneruskan objek lewat parameter, tanpa wajib framework. Coba di fungsi berikutnya yang kamu tulis. Ikuti AUDIRA untuk pola kode lainnya.

## Opsi hook lain

1. Kenapa tesmu lambat dan gampang rusak? Karena kodenya membuat semuanya sendiri.
2. Istilahnya dua puluh lima dolar, konsepnya lima sen. Kamu mungkin sudah memakainya.

## Total

- **209 kata** ≈ **87 dtk**
