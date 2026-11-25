# Research Report — Kenapa Code Review Kamu Nggak Efektif (dan Cara Memperbaikinya)

## Sumber utama

- Bacchelli & Bird, ICSE 2013 (Microsoft) — register #1, #2 (HIGH)
- Czerwonka, Greiler & Tilford, ICSE SEIP 2015 (Microsoft) — #3, #4 (HIGH)
- Sadowski dkk., ICSE SEIP 2018 (Google, 9 juta perubahan) — #5 (HIGH)
- Google Engineering Practices (pedoman publik) — #6 (MEDIUM)
- SmartBear, studi tim Cisco (materi vendor) — #7 (MEDIUM)

## Fakta terverifikasi

1. Studi 2013 mengklasifikasi 570 komentar review di tim Microsoft (#1).
2. Menemukan bug adalah motivasi utama (44% programmer), tapi komentar soal defect hanya 14% (#2).
3. Kategori komentar terbanyak adalah perbaikan kode (29%); manfaat lain: transfer pengetahuan, kesadaran tim, solusi alternatif (#2).
4. Pemahaman kode/perubahan adalah tantangan utama reviewer (#2).
5. Studi 2015: hanya ~15% komentar menunjuk kemungkinan defect; minimal 50% soal maintainability (#3).
6. Reviewer baru di suatu bagian kode: ~33% komentar berguna; review ketiga: ~67% (#4).
7. Makin banyak file per review, makin rendah rasio komentar berguna (mulai terasa ≥ 20 file) (#4).
8. Google: 9 juta perubahan, median 24 baris, median reviewer 1, median proses review < 4 jam (#5).
9. Pedoman Google: ~100 baris wajar, 1000 terlalu besar; balas review maks satu hari kerja (#6).
10. SmartBear/Cisco: 200–400 baris sekali review, < 500 LOC/jam, maks 60 menit (#7).

## Perselisihan / Kontroversi

- **Koreksi hook TOPIC.md**: hook "Banyak tim nggak dapat value dari code review karena melakukan ini" tidak didukung data. Riset tidak bilang tim tidak dapat value; riset bilang value-nya berbeda dari yang diharapkan (lebih ke perbaikan kode dan transfer ilmu, bukan bug) dan efektivitas turun karena review terlalu besar serta reviewer kurang konteks. Tidak ada "satu kesalahan" tunggal. Naskah memakai hook ekspektasi-vs-data. Judul tidak diubah.
- Judul "nggak efektif" bersifat retoris; naskah membingkainya sebagai "efektif untuk tujuan yang salah".
- Angka 200–400 baris dan 60 menit berasal dari materi vendor (SmartBear, penjual tool review) atas satu tim Cisco; dipakai sebagai MEDIUM, disebut "studi tim Cisco", bukan hukum umum. Klaim "70–90% defect ditemukan" di halaman yang sama tidak dipakai.
- Data Google & Microsoft adalah studi kasus perusahaan besar; tidak otomatis berlaku untuk tim kecil.
- Rule 15: nama Microsoft/Google/Cisco boleh disebut di VO sebagai sumber, tapi logo tidak boleh tampil di visual (pakai name plate teks).

## Angka kunci untuk HUD

| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| 2013 | Studi Bacchelli & Bird | 1 |
| 570 | komentar review dianalisis | 1 |
| 14% | komentar soal bug | 2 |
| 2015 | studi lanjutan | 3 |
| ~15% | komentar menunjuk kemungkinan bug | 3 |
| ≥ 50% | komentar soal perawatan kode | 3 |
| 200–400 baris | batas sekali review (Cisco) | 7 |
| 60 menit | batas durasi sekali duduk | 7 |
| 33% → 67% | komentar berguna, review ke-1 vs ke-3 | 4 |
| 9 juta | perubahan dianalisis di Google | 5 |
| 24 baris | median ukuran perubahan | 5 |
| < 4 jam | median proses review | 5 |
| ~100 baris | ukuran wajar | 6 |
| 1 hari kerja | batas waktu respons | 6 |

## Poin kunci

- Code review lebih banyak menghasilkan perbaikan kode dan transfer ilmu daripada menangkap bug.
- Dua penghambat terbesar: perubahan terlalu besar dan reviewer tanpa konteks.
- Resep: perubahan kecil (~100 baris), reviewer yang kenal kode, respons ≤ 1 hari kerja.
- Topik awet (riset 2013–2018 tetap jadi rujukan), mudah divisualkan dengan diagram/HUD.
