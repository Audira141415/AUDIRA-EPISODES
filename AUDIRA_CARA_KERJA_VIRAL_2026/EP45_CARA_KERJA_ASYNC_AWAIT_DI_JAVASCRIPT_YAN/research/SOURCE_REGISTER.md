# Source Register — Cara Kerja Async/Await di JavaScript yang Sebenarnya

> Standar EP01 Makkah: minimum 5 sumber, ≥ 3 HIGH. Pipeline guard blokir jika < 5 sumber.

| # | Fakta | Sumber (judul, penulis, tahun) | URL | Tanggal baca | Level |
|---|---|---|---|---|---|
| 1 | Fungsi async selalu mengembalikan Promise; await menjeda eksekusi sampai Promise selesai; kode sampai await pertama jalan sinkron; perilaku mirip gabungan generator dan Promise | async function, MDN Web Docs (Mozilla), terbaru | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function | 2026-11-25 | HIGH |
| 2 | Async function didukung penuh sejak Node.js 8 (V8 v6.2); optimasi await dari minimal 3 microtick jadi 1 microtick | Faster async functions and promises, V8 team (v8.dev) | https://v8.dev/blog/fast-async | 2026-11-25 | HIGH |
| 3 | Proposal Async functions (champion Brian Terlson) tercatat finished, masuk standar 2017 | Finished Proposals, TC39 (GitHub) | https://github.com/tc39/proposals/blob/main/finished-proposals.md | 2026-11-25 | HIGH |
| 4 | Spesifikasi punya operasi AsyncFunctionStart dan Await, memakai PerformPromiseThen | ECMAScript Language Specification (ECMA-262), Ecma TC39 | https://tc39.es/ecma262/multipage/control-abstraction-objects.html | 2026-11-25 | HIGH |
| 5 | Job dibagi tasks dan microtasks; antrean microtask dikosongkan lebih dulu sebelum antrean task | The event loop, MDN Web Docs (Mozilla) | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop | 2026-11-25 | HIGH |
| 6 | Event loop memungkinkan I/O non-blocking walau satu thread JavaScript, dengan menyerahkan operasi ke kernel sistem | The Node.js Event Loop, Timers, and process.nextTick(), OpenJS Foundation (nodejs.org) | https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick | 2026-11-25 | MEDIUM |
| 7 | Istilah callback hell dan bentuk piramida callback bersarang; promise sebagai alternatif top-down | Callback Hell, Max Ogden (callbackhell.com) | http://callbackhell.com/ | 2026-11-25 | MEDIUM |
