# Naskah — Docker Bukan Magic: Cara Kerja Container yang Sebenarnya

> DRAF pra-produksi (backlog, 2026-11-25). Difinalkan di tahap 4 setelah style dipilih.
> Short: 190–210 kata @135–150 WPM.

## c00_hook — Hook

- Kata: **15** · estimasi **6 dtk**
- Visual: satu kotak container berlabel "Docker" retak terbelah; di dalamnya hanya satu titik proses kecil yang menyala, bukan komputer mini. HUD: "PROSES BIASA".

> Container Docker itu bukan komputer mini. Isinya cuma proses biasa, yang dibohongi supaya merasa sendirian.

## c01_intro — Intro

- Kata: **33** · estimasi **14 dtk**
- Visual: dua panel berdampingan: mesin virtual (tumpukan OS + kernel sendiri-sendiri) lawan container (banyak kotak di atas satu kernel). Callout "±1 DETIK".

> Banyak orang kira container itu mesin virtual kecil. Salah. Mesin virtual menyalakan sistem operasi lengkap. Container tidak. Semua container berbagi satu kernel, makanya nyala dalam sekitar satu detik. Di AUDIRA, kita bongkar triknya.

## c02 — Trik 1: Namespace

- Kata: **28** · estimasi **12 dtk**
- Visual: delapan kaca transparan bertingkat mengelilingi satu proses; tiap kaca berlabel jenisnya (PID, NET, MNT, UTS...). Callout "8 NAMESPACE".

> Trik pertama: namespace. Saat docker run, Docker membuat satu set namespace. Kernel Linux punya delapan jenis, dari proses sampai jaringan. Hasilnya, container cuma melihat proses dan jaringannya sendiri.

## c03 — Ilusi PID

- Kata: **22** · estimasi **9 dtk**
- Visual: dua daftar proses: di dalam container proses bernomor "PID 1"; di sisi host proses yang sama bernomor besar. Garis penghubung antar keduanya.

> Contohnya nomor proses. Proses pertama di namespace baru dapat PID satu, seolah dia pegang seluruh sistem. Padahal di mesin aslinya nomornya lain.

## c04 — Trik 2: Cgroup

- Kata: **24** · estimasi **10 dtk**
- Visual: bar CPU dan memori dengan pagar batas; satu proses rakus menabrak pagar dan tertahan. Callout "CPU + MEMORI".

> Trik kedua: cgroup. Kernel bisa menghitung dan membatasi pemakaian CPU dan memori satu kelompok proses. Tanpa itu, satu container rakus bisa menghabiskan memori server.

## c05 — Trik 3: Filesystem berlapis

- Kata: **30** · estimasi **13 dtk**
- Visual: tumpukan layer image abu-abu (terkunci) dengan satu layer baru berwarna di atasnya; lapisan menyatu jadi satu tampilan "merged"; saat container dihapus, layer berwarna menghilang.

> Trik ketiga: filesystem berlapis. Image itu tumpukan layer yang hanya bisa dibaca. Docker menaruh satu layer baru yang bisa ditulis di atasnya, digabung lewat OverlayFS. Hapus container, tulisannya ikut hilang.

## c06 — Penjelasan

- Kata: **24** · estimasi **10 dtk**
- Visual: rumus visual: proses + kacamata namespace + jatah cgroup + layer = "container". Di bawahnya satu kernel besar menopang semua kotak.

> Jadi container itu proses biasa, plus namespace, plus cgroup, plus layer. Karena kernelnya dibagi, keamanan kernel ikut menentukan keamanan container. Penting dipahami sebelum production.

## c07_payoff — Payoff + outro

- Kata: **29** · estimasi **12 dtk**
- Visual: kotak "Docker" terbuka, isinya potongan fitur Linux tersusun rapi; kalender "22 JUNI 2015" muncul dengan label OCI (teks saja, tanpa logo); kartu outro AUDIRA.

> Standarnya pun terbuka. Sejak Juni 2015, Open Container Initiative menetapkan format image dan runtime, dengan runC dari Docker sebagai fondasi. Docker bukan magic, cuma fitur Linux yang dirangkai rapi.

## Opsi hook lain

1. Docker nggak punya komputer di dalamnya. Yang ada cuma proses yang ditipu.
2. Satu perintah, tiga trik kernel Linux, dan kamu menyebutnya container.

## Total

- **205 kata** ≈ **82–91 dtk** @135–150 WPM
