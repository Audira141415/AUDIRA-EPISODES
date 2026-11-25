# Laporan Riset — Cara Debug Memory Leak di Node.js Aplikasi

Channel: EXPLAINED/TECH · riset 2026-11-25 · register: 8 sumber (6 HIGH, 2 MEDIUM). Dibaca via curl (WebFetch tool gagal: model error).

## Sumber utama
Dokumentasi resmi Node.js (diagnostics memory, CLI, modul v8, process), blog V8 tentang GC, MDN, dan dokumentasi Chrome DevTools. Lihat `SOURCE_REGISTER.md` #1–#8.

## Fakta terverifikasi
1. Garbage collector membuang objek yang tak terjangkau dari root; referensi yang tersisa menahan objek (#5, #7).
2. `--trace-gc` mencetak tiap GC; leak terlihat dari memori setelah GC yang naik terus (contoh Scavenge: 102.2 MB lalu 116.7 MB) (#2).
3. Objek yang selamat dari dua Scavenge dipindah ke old space; Mark-sweep membersihkan old space (#2, #5).
4. Heap snapshot bisa diambil via inspector, `--heapsnapshot-signal`, atau `v8.writeHeapSnapshot()` (#1, #3, #4).
5. Snapshot menghentikan thread utama, bisa >1 menit, dan butuh memori sekitar dua kali heap sehingga bisa memicu OOM (#1, #4).
6. Leak dicari dengan membandingkan dua snapshot setelah menjalankan fitur yang dicurigai (#1); Chrome DevTools menyediakan tampilan Comparison, retained size, dan retainers (#8).
7. `--heapsnapshot-near-heap-limit=N` menulis hingga N snapshot sebelum heap habis (#3).
8. `process.memoryUsage()` memberi heapUsed, external, arrayBuffers, rss (#6).
9. WeakMap/WeakSet tidak menahan kunci dari GC (#7).
10. `--max-old-space-size` hanya mengatur batas old space (#3).

## Perselisihan / Kontroversi
- Judul "Cara Debug Memory Leak di Node.js Aplikasi" janggal secara tata bahasa; saran judul tayang: "Cara Debug Memory Leak di Aplikasi Node.js". TOPIC.md tidak diubah.
- Hook "makin lambat sampai crash itu punya pola" akurat: pola khasnya memori setelah GC naik terus. Namun leak bukan satu-satunya penyebab lambat/crash (beban, CPU), jadi VO memakai "hampir pasti".
- Penyebab leak yang umum (listener, timer) tidak dinarasikan karena belum ada sumber di register; hanya referensi tak terlepas/cache tanpa batas (via MDN/doc Node).
- Doc Node hanya menyebut membandingkan dua snapshot (bukan "tiga snapshot"). Opsi hook lain #2 menyebut tiga snapshot: ganti sebelum dipakai.

## Angka kunci untuk HUD
| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| 102 MB → 117 MB | Memori setelah GC naik di trace leak | 2 |
| 2 kali Scavenge | Syarat promosi ke old space | 2 |
| 2x ukuran heap | Memori yang dibutuhkan snapshot | 1, 4 |
| > 1 menit | Durasi snapshot pada heap besar | 1 |
| SIGUSR2 | Sinyal contoh untuk --heapsnapshot-signal | 1 |
| near-heap-limit=3 | Contoh jumlah snapshot sebelum OOM | 3 |

## Poin kunci
- Pola: pantau, snapshot, bandingkan, lepas referensi.
- Snapshot di produksi berisiko; proses harus boleh crash.
- Menaikkan batas heap tidak memperbaiki leak.
- Angka contoh dari dokumentasi Node, bukan benchmark; versi Node per 2026-11-25.
