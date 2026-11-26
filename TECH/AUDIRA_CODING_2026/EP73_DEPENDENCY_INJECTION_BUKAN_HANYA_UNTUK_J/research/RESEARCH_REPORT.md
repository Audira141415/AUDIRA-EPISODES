# Research Report — Dependency Injection: Bukan Hanya untuk Java Enterprise

## Sumber utama
Fowler 2004 (#1), dokumentasi FastAPI (#2, #3), NestJS (#4), Angular (#5), Python unittest.mock (#6). Pendukung: James Shore 2006 (#7), Wikipedia (#8). Semua diambil via curl (WebSearch/WebFetch gagal: error model).

## Fakta terverifikasi
1. Martin Fowler menerbitkan artikel yang membahas "Dependency Injection" pada 23 Januari 2004; nama dipilih karena "Inversion of Control" terlalu umum (#1).
2. Fowler membagi DI jadi tiga gaya: Constructor, Setter, Interface Injection; contoh container: PicoContainer dan Spring (#1).
3. Ide dasar: objek terpisah (assembler) mengisi dependensi sebuah kelas (#1).
4. Definisi umum: objek/fungsi menerima yang dibutuhkan, tidak membuatnya sendiri (#5, #8).
5. DI bukan monopoli Java: FastAPI (Python) memakai `Depends` (#2); NestJS dan Angular (TypeScript/JS) memakai DI sebagai fondasi (#4, #5).
6. FastAPI menyediakan `app.dependency_overrides` untuk mengganti dependensi saat tes (#3).
7. Python punya `unittest.mock.patch()` untuk mengganti bagian sistem saat tes (#6): DI bukan satu-satunya cara tes.
8. James Shore (2006): DI = istilah 25 dolar untuk konsep 5 sen; intinya meneruskan instance lewat parameter (#7).

## Perselisihan / Kontroversi
- Judul/hook akurat. "Jauh lebih testable" adalah opini rekayasa, bukan angka. Naskah dibingkai "lebih mudah diganti saat tes", bukan "pasti lebih baik".
- DI tidak wajib container/framework; Shore (#7) menekankan itu sekadar parameter.
- Debat constructor vs setter injection ada di Fowler (#1); tidak dinarasikan sebagai pasti.
- Python punya cara tes alternatif (patch, #6); jangan klaim DI satu-satunya jalan.

## Angka kunci untuk HUD
| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| 2004 | Artikel Martin Fowler tentang DI | 1 |
| 3 | Gaya injection: Constructor, Setter, Interface | 1 |
| Depends | Kata kunci FastAPI untuk deklarasi dependensi | 2 |
| dependency_overrides | Atribut FastAPI untuk ganti dependensi saat tes | 3 |
| 25 dolar vs 5 sen | Ungkapan James Shore, 2006 | 7 |

## Poin kunci
- Inti DI: jangan buat sendiri, minta dari luar.
- Manfaat utama: ganti dependensi asli dengan palsu saat tes.
- Sudah mainstream di Python (FastAPI) dan JS/TS (NestJS, Angular).
- Tidak butuh framework: cukup parameter.
