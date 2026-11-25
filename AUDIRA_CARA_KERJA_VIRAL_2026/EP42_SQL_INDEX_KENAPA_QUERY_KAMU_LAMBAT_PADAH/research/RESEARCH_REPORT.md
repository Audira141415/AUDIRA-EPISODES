# Research Report — SQL Index: Kenapa Query Kamu Lambat Padahal Sudah Benar

## Sumber utama
- Dokumentasi resmi PostgreSQL (§11.1, §11.7, §14.1) — #1–#4
- MySQL 8.0 Reference Manual (Oracle) — #5
- Makalah asli Bayer & McCreight, Acta Informatica 1972 — #6
- Wikipedia B-tree (sejarah Boeing) — #7
- Use The Index, Luke (Markus Winand) — #8–#10

## Fakta terverifikasi
1. Tanpa index, database memindai seluruh tabel baris demi baris; dengan index cukup turun beberapa tingkat pohon pencarian (#1).
2. Di PostgreSQL, rencana eksekusi bisa dilihat dengan EXPLAIN: "Seq Scan" = pindai seluruh tabel, "Index Scan" = lewat index (#4).
3. B-tree dirancang Rudolf Bayer dan Edward M. McCreight di Boeing Scientific Research Labs, beredar Juli 1970, terbit di Acta Informatica 1972 (#6, #7).
4. Kedalaman B-tree tumbuh logaritmik; index dengan jutaan record biasanya hanya 4–5 tingkat (#8).
5. Fungsi pada kolom di WHERE (LOWER/UPPER) membuat index biasa tidak terpakai; solusinya index ekspresi (#3, #9).
6. LIKE hanya memakai bagian sebelum wildcard pertama; pola `'%kata'` tidak bisa menelusuri pohon (#10).
7. Index multi-kolom MySQL hanya dipakai bila query menyentuh leftmost prefix (#5).
8. Index menambah beban pada insert/update/delete; index yang jarang dipakai sebaiknya dihapus (#2).

## Perselisihan / Kontroversi
- **Hook TOPIC.md "100x lebih keras" tidak akurat sebagai angka tetap.** Tidak ada sumber yang memberi rasio 100x; selisih kerja bergantung ukuran tabel (full scan linear vs kedalaman pohon logaritmik). Untuk tabel jutaan baris selisihnya bisa jauh lebih dari 100x, untuk tabel kecil bisa hampir nol (planner bahkan memilih Seq Scan bila lebih murah, #1). Koreksi hook: pakai perbandingan "jutaan baris vs 4–5 langkah" (#1, #8), jangan sebut "100x".
- Arti huruf "B" pada B-tree tidak pernah dijelaskan penemunya (Boeing, balanced, Bayer, dll.) (#7). Jangan dinarasikan sebagai pasti.
- Wikipedia (#7) MEDIUM; tahun terbit 1972 dikonfirmasi Crossref (#6).
- Judul "padahal sudah benar": query benar secara logika tetap bisa lambat; itu akurat.

## Angka kunci untuk HUD
| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| Seq Scan | label rencana eksekusi pindai penuh | #4 |
| 1972 | B-tree terbit, Acta Informatica | #6 |
| Bayer & McCreight | penemu B-tree (nama, tanpa wajah) | #6, #7 |
| Boeing | tempat B-tree lahir (teks saja, tanpa logo — rule 15) | #7 |
| 4–5 tingkat | kedalaman index jutaan record | #8 |
| LOWER(kolom) | fungsi yang mematikan index | #3, #9 |
| '%kata' | wildcard di depan | #10 |
| kolom paling kiri | aturan index gabungan MySQL | #5 |

## Poin kunci
- Lambat bukan karena query salah, tapi karena database terpaksa membaca semua baris.
- B-tree = daftar isi bertingkat; kedalaman nyaris tidak bertambah walau data membengkak.
- Tiga jebakan index tidak terpakai: fungsi di kolom, wildcard di depan, urutan kolom index gabungan.
- Index punya harga: tulis data makin berat. Cek dengan EXPLAIN sebelum menambah index.
- Rule 15: tanpa wajah Bayer/McCreight, tanpa logo Boeing/PostgreSQL/MySQL; pakai name plate teks.
