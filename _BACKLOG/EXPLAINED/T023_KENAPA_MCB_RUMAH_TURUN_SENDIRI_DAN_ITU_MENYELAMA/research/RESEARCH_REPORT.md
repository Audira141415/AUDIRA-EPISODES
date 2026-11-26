# Research Report — Kenapa MCB Rumah Turun Sendiri — dan Itu Menyelamatkanmu

> Riset backlog 2026-11-26. Channel @AudiraExplained (rule 15: netral, tanpa wajah orang nyata, tanpa logo/merek nyata; MCB digambar generik tanpa logo PLN atau pabrikan).

## Sumber utama

- **Data waktu kedip**: BioNumbers Harvard (#1), didukung Wikipedia "Blinking" (#8).
- **Cara kerja dan data uji MCB**: tiga makalah jurnal/prosiding teknik elektro Indonesia dengan pengukuran lab (#2 Polban 2023, #3 Polnep 2021, #4 UNJ 2020); buku teks *Lessons In Electric Circuits* (#5).
- **Standar**: PUIL 432.4 → IEC 60898 (dikutip #2), PUIL 2011 soal KHA kabel vs MCB (#6), ringkasan IEC 60898-1 di Wikipedia (#7, #9).
- **Kebakaran**: data BPBD/Gulkarmat DKI lewat ANTARA (#10, #11, #12) dan kutipan Diskominfotik DKI di #4.
- **Keselamatan**: Gulkarmat DKI (#11), pengabdian masyarakat UTU (#13), buku teks (#5).

## Fakta terverifikasi

1. MCB punya dua mekanisme: **termal** (keping bimetal memanas dan melengkung saat beban lebih) dan **magnetik** (kumparan/solenoid menarik tuas saat hubung singkat) (#2, #5, #7, #9).
2. Trip termal lambat dan makin cepat bila arus makin besar: uji MCB 4A pada 2×In trip setelah 38–47 detik, pada 1,4×In 488–4.564 detik (#3); MCB B2 pada 2×In trip 46,41 detik (#2). Suhu ruangan ikut memengaruhi (#4).
3. Trip magnetik cepat: MCB B2 pada 5,5–7,5×In trip 0,06–0,07 detik (#2); sumber lain menyebut "beberapa milidetik" pada hubung singkat (#9).
4. Kedipan mata 0,1–0,4 detik (#1, #8). Jadi trip magnetik (≈0,06–0,07 s di uji lab) memang lebih cepat dari kedipan; trip termal (puluhan detik sampai lebih dari satu jam) tidak.
5. Tipe MCB menurut IEC 60898-1: B = 3–5×In, C = 5–10×In, D = 10–20×In (#7; #2 menulis D = 10–14×In).
6. Tugas utama gawai arus lebih adalah melindungi kabel dari panas berlebih dan kebakaran; MCB tidak dirancang mendeteksi sengatan listrik pada manusia (#5; ELCB untuk arus bocor, #13).
7. MCB dipilih sesuai KHA kabel (PUIL 2011), misalnya kabel 2,5 mm² dengan MCB 10A pada studi #6. Mengganjal MCB yang sering turun dan memakai kabel di luar KHA disebut Gulkarmat DKI sebagai penyebab korsleting (#11).
8. Jakarta: korsleting listrik = 607 dari 864 kebakaran (2023, ≈70%) dan 541 dari 789 (2024, ≈69%) (#10); 2013–2018 = 61% (#4); 60–70% dalam lima tahun per 2022 (#12).

## Perselisihan / Kontroversi

- **Hook "lebih cepat dari kedipan mata" hanya benar untuk trip magnetik (hubung singkat).** Trip termal karena beban lebih butuh puluhan detik sampai lebih dari satu jam (#2, #3). Kasus "MCB turun" sehari-hari karena kebanyakan alat menyala biasanya trip termal, jadi tidak secepat kedipan. Naskah memisahkan keduanya dengan jelas: hook dikaitkan ke korsleting, adegan c03 menyebut termal "sekitar empat puluh detik".
- **Angka "lebih cepat dari kedipan" berasal dari satu uji lab** (MCB tipe B, 0,06–0,07 s, #2). Standar IEC 60898-1 menurut ringkasan sekunder (#7) hanya mengatur rentang arus trip seketika; batas waktunya (<0,1 s di batas atas) belum terverifikasi dari teks standar asli (IEC/BSN tidak bisa dibuka). Naskah memakai angka uji lab, bukan klaim standar.
- **Tabel #2 memuat nilai janggal**: 4,5×In = 0,13 s lalu 5×In = 0,9 s (kemungkinan salah ketik 0,09). Naskah hanya memakai baris 5,5–7,5×In (0,06–0,07 s) yang konsisten.
- **Tipe D**: 10–20×In (#7) vs 10–14×In (#2). Tidak dipakai di VO.
- **"Korsleting" di statistik kebakaran adalah kategori luas** (termasuk sambungan longgar, beban menumpuk, alat tak standar, #11), bukan hanya hubung singkat murni. Total 2024 juga beda tipis antar-berita (789 di #10 vs 787 di #11). VO memakai "hampir tujuh dari sepuluh" yang aman untuk 2023 (70,3%) dan 2024 (68,6%).
- **"Menyelamatkanmu" di judul**: MCB melindungi kabel dan instalasi dari kebakaran, bukan dari sengatan listrik (#5). Naskah tidak mengklaim MCB mencegah kesetrum.
- **Rule 15**: MCB, panel, dan rumah digambar generik; tanpa logo PLN/merek MCB; tanpa wajah petugas Damkar atau teknisi (siluet/tangan saja). Merek MCB di makalah #3 tidak disebut.

## Angka kunci untuk HUD

| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| 0,1–0,4 dtk | Durasi satu kedipan mata | 1, 8 |
| 0,06–0,07 dtk | Trip magnetik MCB tipe B di uji lab (5,5–7,5×In) | 2 |
| ±40 dtk (38–47) | Trip termal pada arus 2× batas (uji lab MCB 4A) | 3, 2 |
| 2× batas | Beban lebih pada c03 | 3 |
| 607/864 (2023) · 541/789 (2024) | Kebakaran Jakarta akibat korsleting, data BPBD DKI | 10 |
| ≈7 dari 10 | Ringkasan rasio korsleting 2023–2024 | 10, 11 |
| B 3–5×In · C 5–10×In | Ambang trip magnetik per tipe (opsional, HUD kecil) | 7, 2 |
| 2,5 mm² → MCB 10A | Contoh kabel sesuai KHA (opsional) | 6 |

## Poin kunci

- Cerita = dua penjaga di dalam satu kotak kecil: bimetal (lambat, beban lebih) dan magnet (kilat, korsleting).
- Payoff: split-screen stopwatch "kedipan 0,1–0,4 dtk" vs "MCB 0,06 dtk".
- Pesan keselamatan wajib tampil: jangan ganjal MCB, jangan ganti sendiri dengan ampere lebih besar, kurangi beban, panggil teknisi listrik.
- Topik awet (fisika dan standar tidak cepat berubah); hanya data kebakaran yang perlu ditulis "per 2023–2024".
