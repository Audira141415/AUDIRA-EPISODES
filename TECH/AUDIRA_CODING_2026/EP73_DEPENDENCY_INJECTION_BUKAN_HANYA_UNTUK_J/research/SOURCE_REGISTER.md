# Source Register — Dependency Injection: Bukan Hanya untuk Java Enterprise

> Standar EP01 Makkah: minimum 5 sumber, ≥ 3 HIGH. Pipeline guard blokir jika < 5 sumber.

| # | Fakta | Sumber (judul, penulis, tahun) | URL | Tanggal baca | Level |
|---|---|---|---|---|---|
| 1 | Istilah "Dependency Injection" dibahas Martin Fowler dalam artikel 23 Januari 2004; tiga bentuk: Constructor, Setter, Interface Injection; ide dasar: objek terpisah (assembler) mengisi dependensi | Inversion of Control Containers and the Dependency Injection pattern, Martin Fowler, 2004 | https://martinfowler.com/articles/injection.html | 2026-11-25 | HIGH |
| 2 | FastAPI punya sistem Dependency Injection; kode mendeklarasikan kebutuhan lewat `Depends` | Dependencies, dokumentasi FastAPI | https://fastapi.tiangolo.com/tutorial/dependencies/ | 2026-11-25 | HIGH |
| 3 | FastAPI menyediakan `app.dependency_overrides` untuk mengganti dependensi saat tes | Testing Dependencies with Overrides, dokumentasi FastAPI | https://fastapi.tiangolo.com/advanced/testing-dependencies/ | 2026-11-25 | HIGH |
| 4 | NestJS dibangun di atas pola dependency injection; dependensi disuntik lewat constructor dan dikelola container IoC | Providers, dokumentasi NestJS | https://docs.nestjs.com/providers | 2026-11-25 | HIGH |
| 5 | Angular mendefinisikan DI sebagai pola menyuplai dependensi ke kelas, bukan membuatnya di dalam kelas | Dependency Injection, dokumentasi Angular | https://angular.dev/guide/di | 2026-11-25 | HIGH |
| 6 | Python punya `unittest.mock` dengan `patch()` untuk mengganti bagian sistem saat tes dengan objek mock | unittest.mock, dokumentasi Python 3 | https://docs.python.org/3/library/unittest.mock.html | 2026-11-25 | HIGH |
| 7 | "Dependency Injection" disebut istilah 25 dolar untuk konsep 5 sen; intinya meneruskan instance lewat parameter; berguna mengisolasi kelas saat tes | Dependency Injection Demystified, James Shore, 2006 | https://www.jamesshore.com/v2/blog/2006/dependency-injection-demystified | 2026-11-25 | MEDIUM |
| 8 | DI = objek/fungsi menerima yang dibutuhkan, bukan membuatnya sendiri; memisahkan pembuatan dan pemakaian objek | Dependency injection, Wikipedia (ringkasan, rev. 24 Nov 2026) | https://en.wikipedia.org/wiki/Dependency_injection | 2026-11-25 | MEDIUM |
