# Source Register — Cara Debug Memory Leak di Node.js Aplikasi

> Standar EP01 Makkah: minimum 5 sumber, ≥ 3 HIGH. Pipeline guard blokir jika < 5 sumber.

| # | Fakta | Sumber (judul, penulis, tahun) | URL | Tanggal baca | Level |
|---|---|---|---|---|---|
| 1 | Heap snapshot: lewat inspector, flag --heapsnapshot-signal, writeHeapSnapshot; snapshot menghentikan thread utama, bisa >1 menit, bisa menggandakan ukuran heap; cara temukan leak dengan membandingkan dua snapshot | Using Heap Snapshot, Node.js Learn (OpenJS Foundation), n.d. | https://nodejs.org/en/learn/diagnostics/memory/using-heap-snapshot | 2026-11-25 | HIGH |
| 2 | --trace-gc mencetak tiap GC; Scavenge 102.2 MB (setelah GC) naik ke 116.7 MB pada contoh leak; objek yang selamat dari dua Scavenge dipromosikan ke old space; Mark-sweep untuk old space | Tracing garbage collection, Node.js Learn (OpenJS Foundation), n.d. | https://nodejs.org/en/learn/diagnostics/memory/using-gc-traces | 2026-11-25 | HIGH |
| 3 | --heapsnapshot-near-heap-limit=max_count menulis snapshot saat heap mendekati batas; --heapsnapshot-signal=signal (sejak v12.0.0); --max-old-space-size mengatur batas old space (MiB), makin dekat batas V8 makin sibuk GC | Command-line API, Node.js Documentation (OpenJS Foundation), n.d. | https://nodejs.org/api/cli.html | 2026-11-25 | HIGH |
| 4 | v8.writeHeapSnapshot (sejak v11.13.0); snapshot butuh memori ~2x ukuran heap, operasi sinkron yang memblokir event loop | V8 module, Node.js Documentation (OpenJS Foundation), n.d. | https://nodejs.org/api/v8.html | 2026-11-25 | HIGH |
| 5 | Marking mulai dari root set; objek yang terjangkau dipertahankan; Scavenger (minor GC) vs Mark-Compact (major GC); heap berlapis generasi | Trash talk: the Orinoco garbage collector, Peter Marshall (V8 team), 2019 | https://v8.dev/blog/trash-talk | 2026-11-25 | HIGH |
| 6 | process.memoryUsage() mengembalikan rss, heapTotal, heapUsed, external, arrayBuffers (byte) | process, Node.js Documentation (OpenJS Foundation), n.d. | https://nodejs.org/api/process.html#processmemoryusage | 2026-11-25 | HIGH |
| 7 | Garbage collection berbasis keterjangkauan (mark-and-sweep, root = global object); WeakMap/WeakSet memegang kunci secara lemah sehingga bisa dikumpulkan GC | Memory management, MDN Web Docs (Mozilla), n.d. | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Memory_management | 2026-11-25 | MEDIUM |
| 8 | Tampilan Comparison untuk membandingkan snapshot; Shallow size vs Retained size; penelusuran Retainers | Record heap snapshots, Chrome DevTools docs (Google), n.d. | https://developer.chrome.com/docs/devtools/memory-problems/heap-snapshots | 2026-11-25 | MEDIUM |
