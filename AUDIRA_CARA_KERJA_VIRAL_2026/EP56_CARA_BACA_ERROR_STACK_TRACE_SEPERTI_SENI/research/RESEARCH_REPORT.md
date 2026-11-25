# Research Report — Cara Baca Error Stack Trace seperti Senior Developer

## Sumber utama

- Dokumentasi resmi Python (tutorial Errors and Exceptions, modul traceback, What's New 3.10, PEP 657) — #2, #3, #4, #10, #11.
- Dokumentasi API Java SE 21 `Throwable` (Oracle) — #5, #6.
- Dokumentasi V8 Stack trace API dan Node.js Errors — #7, #8.
- MDN `Error.prototype.stack` dan Wikipedia "Stack trace" (sekunder) — #1, #9.

## Fakta terverifikasi

1. Stack trace adalah laporan stack frame yang aktif pada satu titik saat program berjalan (#1).
2. Python mencetak "Traceback (most recent call last)": panggilan terbaru di paling bawah, jadi dibaca dari bawah ke atas (#2).
3. Baris terakhir error Python = jenis exception + detail; baris di atasnya = jejak pemanggilan (#3).
4. Python membedakan dua rantai: "During handling of the above exception..." (error baru muncul saat menangani error lama) dan "...was the direct cause of..." (error dilempar ulang dengan `raise ... from`) (#4).
5. Java: frame pertama (paling atas) = pemanggilan terakhir, biasanya tempat exception dibuat dan dilempar. Rantai penyebab ditampilkan dengan "Caused by:" (#5).
6. Java: "... n more" hanya menyingkat frame yang sama dengan trace exception pembungkus (#6).
7. JavaScript (V8): urutan dari panggilan terbaru ke terlama; bawaan hanya 10 frame (`Error.stackTraceLimit`) (#7, #8, #9).
8. Python 3.10 menambah saran "Did you mean" untuk NameError/AttributeError (#10).
9. Python 3.11 menambah penanda caret ke ekspresi persis yang gagal (#11).

## Perselisihan / Kontroversi

- **Judul "seperti Senior Developer"**: framing, bukan klaim yang bisa diverifikasi. Tidak ada sumber yang mendefinisikan cara baca "senior". Naskah menyajikan langkah dari dokumentasi resmi tanpa mengklaim itu kebiasaan senior developer. Judul tidak diubah.
- **Hook "petunjuk yang kamu abaikan"**: opini motivasional; tidak ada data bahwa developer mengabaikan pesan error. Naskah memakai versi netral ("bukan musuh, itu peta").
- **Arah baca tidak universal**: Python = terbaru di bawah; Java/JavaScript = terbaru di atas (#2, #5, #9). Naskah wajib menyebut perbedaan ini, jangan menyamaratakan "baca dari bawah".
- **"Caused by paling bawah = penyebab paling awal"**: kesimpulan logis dari rantai `Caused by` (#5), bukan kutipan langsung. Aman sebagai penjelasan.
- **10 frame** berlaku untuk V8 (Chrome, Node.js), tidak untuk semua mesin JS (#7, #9).
- Format stack trace bisa berubah antarversi bahasa; contoh di visual sebaiknya menyebut versi (Python 3.11+, Java 21, Node.js) — per 2026-11-25.

## Angka kunci untuk HUD

| angka/tahun/nama | konteks | # sumber |
|---|---|---|
| most recent call last | judul traceback Python | 2 |
| NameError | contoh jenis error di baris terakhir | 3 |
| 10 frame | batas bawaan stack trace V8 / Node.js | 7, 8 |
| Caused by: | penanda rantai error Java | 5 |
| ... 1 more | singkatan frame sama (Java) | 6 |
| During handling / direct cause | rantai error Python | 4 |
| Python 3.10 — Did you mean | saran salah ketik | 10 |
| Python 3.11 — ^^^^ | penunjuk ekspresi gagal (PEP 657) | 11 |

## Poin kunci

- Arah baca bergantung bahasa: Python dari bawah, Java/JS dari atas.
- Mulai dari jenis error + pesan, lalu cari frame dari kode sendiri, lalu telusuri rantai penyebab.
- `Caused by` / `direct cause` = error asli; "... n more" bukan informasi baru.
- Python modern membantu: saran "Did you mean" (3.10) dan caret (3.11).
- Visual: teks kode generik buatan sendiri, tanpa logo Python/Java/Node.js/Chrome (rule 15).
