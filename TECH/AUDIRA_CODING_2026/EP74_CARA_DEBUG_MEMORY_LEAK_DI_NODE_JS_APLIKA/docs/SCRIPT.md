# Naskah — Cara Debug Memory Leak di Node.js Aplikasi

> DRAF pra-produksi (backlog, 2026-11-25). Difinalkan di tahap 4 setelah style dipilih.
> Short: 190–210 kata @135–150 WPM.

## c00_hook — Hook

- Kata: **19** · estimasi **8 dtk**
- Visual: grafik memori server menanjak seperti tangga tanpa pernah turun, lampu merah menyala, lalu layar terminal menulis "heap out of memory".

> Aplikasi Node.js kamu makin lambat tiap jam, lalu mati sendiri? Itu hampir pasti memory leak, dan polanya bisa dibaca.

## c01_intro — Intro

- Kata: **30** · estimasi **12 dtk**
- Visual: tempat sampah (garbage collector) membuang objek tak terhubung; satu objek tertahan oleh tali dari array global bertuliskan "cache".

> Di Node.js, garbage collector membuang objek yang sudah tidak terjangkau. Kalau masih ada satu referensi tersisa, misalnya di cache global yang tak pernah dikosongkan, objek itu hidup terus. Itulah leak.

## c02 — Baca polanya dengan trace-gc

- Kata: **25** · estimasi **10 dtk**
- Visual: log terminal bergulir, callout HUD "102 MB → 117 MB", objek berpindah dari young space ke old space setelah dua Scavenge.

> Pertama, lihat polanya. Jalankan Node dengan flag trace-gc. Kalau memori setelah GC naik terus, dari sekitar 102 megabita ke 117 dan seterusnya, itu tanda leak.

## c03 — Pantau memoryUsage

- Kata: **20** · estimasi **8 dtk**
- Visual: panel HUD tiga meteran: heapUsed, external, arrayBuffers; jarum satu meteran terus naik.

> Kedua, pantau process memoryUsage. Lihat heapUsed, external, dan arrayBuffers. Yang naik menunjukkan bocornya di heap JavaScript atau di luar heap.

## c04 — Ambil heap snapshot

- Kata: **29** · estimasi **12 dtk**
- Visual: kamera memotret isi memori; ikon sinyal SIGUSR2 masuk ke proses; tanda peringatan menyala, jam berputar, balok memori berlipat dua.

> Ketiga, ambil heap snapshot. Pakai heapsnapshot-signal SIGUSR2, atau panggil writeHeapSnapshot dari modul v8. Hati-hati. Snapshot menghentikan thread utama, bisa lebih dari semenit, dan butuh memori sekitar dua kali heap.

## c05 — Bandingkan dua snapshot

- Kata: **31** · estimasi **12 dtk**
- Visual: dua snapshot berdampingan di DevTools, tampilan Comparison, baris objek bertambah menyala, rantai retainers ditelusuri ke satu referensi.

> Ambil snapshot pertama, ulangi fitur yang dicurigai, lalu ambil snapshot kedua. Buka di DevTools, pilih Comparison, cari objek yang bertambah. Urutkan dengan retained size, lalu telusuri retainers sampai ketemu referensi penahannya.

## c06 — Penjelasan: crash dan perbaikan

- Kata: **26** · estimasi **10 dtk**
- Visual: server mendekati batas heap, kamera otomatis memotret tiga kali sebelum padam; cache bocor diganti WeakMap yang tali-talinya putus saat kunci hilang.

> Kalau keburu crash, pakai heapsnapshot-near-heap-limit sama dengan tiga. Node menulis snapshot sebelum heap habis. Perbaikannya, putus referensi tak terpakai, misalnya ganti cache tanpa batas dengan WeakMap.

## c07_payoff — Payoff + outro

- Kata: **22** · estimasi **9 dtk**
- Visual: grafik memori berubah dari tangga menjadi gigi gergaji yang stabil; kartu empat langkah; outro AUDIRA.

> Menaikkan max-old-space-size cuma memperbesar batas, bukan menutup kebocoran. Polanya selalu sama: pantau, snapshot, bandingkan, lepas referensi. Ikuti AUDIRA untuk panduan debugging berikutnya.

## Opsi hook lain

1. Server kamu restart sendiri tiap malam? Memorinya sedang bocor pelan-pelan.
2. Tiga snapshot dan lima menit bisa menunjukkan objek yang menahan memori server kamu.

## Total

- **202 kata** ≈ **81 dtk**
