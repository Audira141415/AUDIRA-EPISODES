# Source Register — Cara Baca Error Stack Trace seperti Senior Developer

> Standar EP01 Makkah: minimum 5 sumber, ≥ 3 HIGH. Pipeline guard blokir jika < 5 sumber.

| # | Fakta | Sumber (judul, penulis, tahun) | URL | Tanggal baca | Level |
|---|---|---|---|---|---|
| 1 | Stack trace = laporan stack frame yang aktif pada satu titik waktu saat program berjalan | Stack trace, Wikipedia (rev. 2026-11-01) | https://en.wikipedia.org/wiki/Stack_trace | 2026-11-25 | MEDIUM |
| 2 | Traceback Python diberi judul "Traceback (most recent call last)": panggilan terbaru ada paling bawah | traceback — Print or retrieve a stack traceback, Python Software Foundation, 2025 (docs 3.x) | https://docs.python.org/3/library/traceback.html | 2026-11-25 | HIGH |
| 3 | Baris terakhir pesan error Python menunjukkan apa yang terjadi (jenis exception, mis. NameError, + detail); bagian sebelumnya adalah stack traceback | 8. Errors and Exceptions, The Python Tutorial, Python Software Foundation | https://docs.python.org/3/tutorial/errors.html | 2026-11-25 | HIGH |
| 4 | Rantai exception Python: "During handling of the above exception, another exception occurred" (error baru saat menangani error) dan "The above exception was the direct cause of the following exception" (raise ... from) | 8. Errors and Exceptions, The Python Tutorial, Python Software Foundation | https://docs.python.org/3/tutorial/errors.html | 2026-11-25 | HIGH |
| 5 | Java: elemen ke-0 stack trace = puncak stack = pemanggilan metode terakhir, biasanya titik exception dibuat dan dilempar; rantai ditampilkan dengan "Caused by:" | Throwable (Java SE 21 API), Oracle | https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Throwable.html | 2026-11-25 | HIGH |
| 6 | Java: baris "... n more" berarti sisa frame sama dengan n frame terbawah dari trace exception pembungkus (singkatan) | Throwable.printStackTrace (Java SE 21 API), Oracle | https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Throwable.html | 2026-11-25 | HIGH |
| 7 | V8 (mesin JS Chrome/Node.js) secara bawaan menyimpan 10 stack frame teratas; diatur lewat Error.stackTraceLimit | Stack trace API, V8 docs | https://v8.dev/docs/stack-trace-api | 2026-11-25 | HIGH |
| 8 | Node.js: nilai bawaan Error.stackTraceLimit = 10 | Errors, Node.js API documentation, OpenJS Foundation | https://nodejs.org/api/errors.html | 2026-11-25 | HIGH |
| 9 | error.stack di JavaScript non-standar; urutannya dari panggilan terbaru ke yang lebih awal, sampai pemanggilan global | Error.prototype.stack, MDN Web Docs, Mozilla | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/stack | 2026-11-25 | MEDIUM |
| 10 | Python 3.10: pesan NameError/AttributeError memberi saran "Did you mean: ...?" untuk salah ketik | What's New In Python 3.10, Python Software Foundation | https://docs.python.org/3/whatsnew/3.10.html | 2026-11-25 | HIGH |
| 11 | Python 3.11 (PEP 657): traceback menunjuk ekspresi persis yang gagal dengan penanda caret (^) dan tilde (~) | PEP 657 – Include Fine Grained Error Locations in Tracebacks, P. Galindo, B. Ali, A. Mohammad, 2021; What's New In Python 3.11 | https://peps.python.org/pep-0657/ | 2026-11-25 | HIGH |
