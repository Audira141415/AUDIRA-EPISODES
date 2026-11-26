# Naskah — Cara Kerja Timbangan Digital

> DRAF pra-produksi (backlog, 2026-11-26). Difinalkan di tahap 4 setelah style dipilih.
> Short: 190–210 kata @135–150 WPM.

## c00_hook — Hook

- Kata: **18** · estimasi **7 dtk**
- Visual: Timbangan dapur generik (tanpa merek) meledak jadi potongan (exploded view): piringan terangkat, tidak ada per spiral di dalam, kamera menukik ke balok logam berlubang yang melengkung halus. HUD: "< 0,5 mm" (#2).

> Timbangan digital tidak punya per spiral. Pegasnya justru sebatang logam yang melengkung kurang dari setengah milimeter. Ini Audira.

## c01_intro — Intro

- Kata: **22** · estimasi **9 dtk**
- Visual: Split screen: kiri timbangan badan jarum transparan, pegas spiral melendut dan jarum berputar; kanan timbangan digital, di bawah piringannya balok aluminium dengan lubang "kacamata" menyala. Label HUD: "load cell" (#9, #1).

> Timbangan badan model jarum memakai pegas. Makin berat, pegas makin melendut. Timbangan digital memakai load cell, balok aluminium berlubang di bawah piringannya.

## c02 — Logamnya yang jadi pegas

- Kata: **27** · estimasi **11 dtk**
- Visual: Close-up balok load cell; sekantong gula generik diletakkan, balok melengkung dengan skala dilebih-lebihkan (label kecil "skala dibesarkan"), lalu kembali lurus saat diangkat. Penggaris mikro muncul: "lendutan beban penuh < 0,5 mm" (#2). Kartu istilah: "spring element" (#9).

> Saat kamu menaruh sekilo gula, balok itu melengkung sedikit, lalu kembali lurus saat diangkat. Sifat lentur itulah pegasnya. Bahkan di beban penuh, lendutannya kurang dari setengah milimeter.

## c03 — Strain gauge

- Kata: **26** · estimasi **11 dtk**
- Visual: Zoom makro ke permukaan balok: stiker foil logam berpola zig-zag. Saat balok melengkung, satu foil meregang (garis memanjang, merah, "hambatan naik"), foil di sisi lain tertekan (biru, "hambatan turun") (#3).

> Di permukaannya ditempel strain gauge, jalur foil logam tipis yang berliku. Saat balok melengkung, foil ikut meregang dan hambatan listriknya naik. Sisi lainnya tertekan, hambatannya turun.

## c04 — Jembatan Wheatstone

- Kata: **24** · estimasi **10 dtk**
- Visual: Empat foil "terbang" keluar dari balok dan menyusun diagram belah ketupat jembatan Wheatstone; arus 5 V mengalir, jarum voltmeter generik bergerak sedikit. HUD: "±0,1% perubahan hambatan" (#10), "5 V → 5–10 mV" (hitungan sendiri dari #3, #12).

> Perubahannya kecil sekali, sekitar sepersepuluh persen. Jadi empat strain gauge dirangkai jadi jembatan Wheatstone. Dengan listrik lima volt, beban penuh cuma menghasilkan beberapa milivolt.

## c05 — Dari milivolt ke angka

- Kata: **27** · estimasi **11 dtk**
- Visual: Sinyal gelombang tipis masuk ke chip generik (tanpa logo), membesar jadi gelombang tebal ("×128"), lalu dipotong jadi tangga digital 0/1 dan berubah jadi deretan angka. Counter HUD: "24-bit", "10–80× per detik" (#11).

> Di chip penguat yang umum dipakai, sinyal itu dikuatkan sampai seratus dua puluh delapan kali, lalu diubah jadi angka digital dua puluh empat bit, berkali-kali tiap detik.

## c06 — Kalibrasi, tare, dan tera

- Kata: **32** · estimasi **13 dtk**
- Visual: Layar timbangan menampilkan "0.000", mangkuk diletakkan lalu tombol tare ditekan dan angka kembali nol (#4). Transisi ke lapak pasar: timbangan dagang dengan stiker tanda tera generik, kalender berputar satu tahun. HUD: "UU 2/1981 Metrologi Legal" (#5), "Tera ulang: 1 tahun" (#6).

> Prosesor lalu mencocokkan angka itu dengan kalibrasi pabrik, dan tombol tare membuat berat wadah jadi nol. Timbangan dagang di Indonesia diatur Undang-Undang Metrologi Legal tahun 1981 dan wajib ditera ulang setiap tahun.

## c07_payoff — Payoff + outro

- Kata: **27** · estimasi **11 dtk**
- Visual: Kamera mundur dari foil → jembatan → chip → layar angka → timbangan utuh di dapur, jalur sinyal menyala sepanjang perjalanan. Outro card AUDIRA.

> Jadi angka di layar sebenarnya cerita logam yang melengkung, foil yang meregang, dan sinyal milivolt. Pegasnya ada, cuma tersembunyi di dalam logam. Ikuti Audira untuk benda berikutnya.

## Opsi hook lain

1. Taruh sekilo gula di timbangan digital, dan sebatang logam di dalamnya langsung melengkung, terlalu kecil untuk dilihat mata.
2. Timbangan dagang di pasar wajib diperiksa negara setiap tahun. Yang diperiksa adalah logam kecil yang melengkung di dalamnya.

## Total

- **203 kata** ≈ **84 dtk** (@145 WPM; 81–90 dtk di 135–150 WPM)
