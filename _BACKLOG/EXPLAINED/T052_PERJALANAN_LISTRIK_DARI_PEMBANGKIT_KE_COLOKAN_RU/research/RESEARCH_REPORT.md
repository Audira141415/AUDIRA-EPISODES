# Research Report — Perjalanan Listrik dari Pembangkit ke Colokan Rumahmu

> Riset backlog 2026-11-27. Channel @AudiraExplained (rule 15: netral, tanpa wajah/logo/merek nyata; PLN hanya disebut sebagai lembaga dalam teks).

## Sumber utama

- **Statistik PLN 2024** (PDF resmi PLN, dibuka dan dibaca): susut energi, panjang jaringan per tegangan, jumlah trafo gardu induk dan distribusi, beban puncak sistem interkoneksi Jawa Bali (#1, #2, #3). Statistik PLN 2025 belum tersedia di URL yang sama (404 per 2026-11-27).
- **Regulasi**: Permen ESDM 20/2020 Grid Code (#4, status dicek di JDIH BPK: berlaku, mencabut aturan jaringan regional lama termasuk Jawa-Madura-Bali 03/2007); Permen ESDM 04/2009 Aturan Distribusi (#5).
- **Fisika**: HyperPhysics (Georgia State University) tentang kecepatan hanyut elektron dan trafo (#6, #7).
- **Kementerian ESDM**: berita resmi soal susut teknis dan nonteknis (#8).
- Pendukung MEDIUM: Wikipedia "Drift velocity" (#9) dan "Mains electricity by country" (#10).

## Fakta terverifikasi

1. Elektron di kabel hanyut sangat lambat (contoh 12 gauge, 10 A: ±0,22 mm/s, hitungan sendiri dari angka HyperPhysics); yang merambat hampir secepat cahaya adalah perubahan medan/energi (#6). Pada AC, elektron hanya bergeser maju-mundur sangat kecil tiap setengah siklus (#9).
2. Frekuensi nominal jaringan Indonesia 50 Hz (#4, #5).
3. Tegangan nominal transmisi: 500 kV, 275 kV, 150 kV, 66/70 kV (#2, #4).
4. Trafo menaikkan tegangan dan menurunkan arus sebanding (#7); rugi panas sebanding I²R, jadi arus ½ → rugi ¼ (hitungan sendiri, #7).
5. Akhir 2024 jaringan transmisi 72.655,85 kms, mayoritas 150 kV (54.043,47 kms); 500 kV 7.718,06 kms (#2).
6. Ada 2.359 trafo gardu induk dan 573.650 trafo gardu distribusi (#2).
7. Distribusi tegangan menengah 20 kV (kelas 15–20 kV di statistik) dan tegangan rendah 400/230 V ke konsumen (#3, #5).
8. Sistem Jawa Bali adalah satu sistem interkoneksi; beban puncaknya 42.635,66 MW di 2024 (#3); aturan jaringan Jawa-Madura-Bali lama kini dilebur ke Grid Code nasional (#4).
9. Susut energi 2024 = 8,55% (transmisi 2,03%, distribusi 6,65%), turun tipis dari 8,57% (2023) (#1); susut mencakup aspek teknis dan nonteknis (#8).

## Perselisihan / Kontroversi

- **Koreksi hook TOPIC.md** ("Listrik yang menyalakan lampumu dibuat ratusan kilometer jauhnya, sepersekian detik lalu"):
  - *Elektron tidak menempuh ratusan km.* Elektronnya hanyut ±0,2 mm/s dan pada AC 50 Hz hanya maju-mundur di tempat (#6, #9). Yang tiba "sepersekian detik" adalah **energi** yang dibawa medan elektromagnetik, merambat mendekati kecepatan cahaya (#6). Bagian "sepersekian detik" benar untuk energi, salah bila dibaca sebagai "listrik/elektron berjalan".
  - *"Ratusan kilometer" tidak selalu benar.* Jarak bergantung lokasi; di sistem interkoneksi Jawa Bali, listrik di colokan adalah gabungan banyak pembangkit yang tersambung satu jaringan (#3, #4), jadi tidak bisa ditunjuk satu pembangkit dan satu jarak. Tidak ditemukan sumber resmi untuk jarak tipikal pembangkit–rumah.
  - Hook diganti: "Saat saklar ditekan, lampu menyala seketika. Tapi elektron di kabelmu hampir tidak ke mana-mana."
- **220 V vs 230 V**: sebutan sehari-hari "220 volt" adalah tegangan lama; aturan distribusi (#5) dan referensi standar (#10) memakai 400/230 V. VO memakai 230 volt. SNI 04-0227-1994 (tegangan standar) yang disebut di brief **tidak berhasil diverifikasi** status/penggantinya (situs BSN tidak terbuka lewat alat riset); naskah tidak menyebut nomor SNI.
- **Status Permen ESDM 04/2009**: tidak ditemukan peraturan pencabut di JDIH BPK, dan Permen 20/2020 masih merujuk "Aturan Distribusi". Belum pasti 100%; cek di JDIH ESDM (diblokir 403 saat riset) sebelum produksi.
- **Persentase susut**: 2,03% + 6,65% ≠ 8,55% karena pembaginya berbeda (#1). VO hanya menyebut total 8,55% dan "sebagian besar di distribusi". Angka susut cepat basi: tulis "per 2024".
- **Susut nonteknis**: sumber resmi menyebut aspek nonteknis dan P2TL (#8), tanpa porsi angka. VO tidak menuduh pihak mana pun dan tidak menyebut "pencurian".
- **Keselamatan**: kabel tegangan menengah di tiang berbahaya; VO hanya memberi pesan "jangan didekati", tanpa instruksi teknis.
- **Rule 15**: PLN disebut sebagai lembaga di register, tidak di visual; tanpa logo PLN, tanpa merek charger/peralatan.

## Angka kunci untuk HUD

| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| ±0,2 mm/s (hitungan sendiri) | Kecepatan hanyut elektron, contoh kabel 12 gauge 10 A | 6 |
| ≈ kecepatan cahaya | Rambat energi/sinyal di kabel | 6 |
| 50 Hz | Frekuensi nominal jaringan Indonesia | 4, 5 |
| 500 kV · 275 kV · 150 kV | Tegangan transmisi | 2, 4 |
| Arus ½ → rugi ¼ (hitungan sendiri) | Prinsip I²R | 7 |
| 72.655 kms | Panjang jaringan transmisi, akhir 2024 | 2 |
| Jawa Bali: 1 sistem interkoneksi | Beban puncak 42.635 MW (2024) | 3, 4 |
| 20 kV | Jaringan tegangan menengah (distribusi) | 3, 5 |
| 400/230 V | Tegangan ke rumah | 5, 10 |
| 573.650 trafo | Trafo gardu distribusi, akhir 2024 | 2 |
| 8,55% | Susut energi 2024 (transmisi 2,03%, distribusi 6,65%) | 1 |

## Poin kunci

- Cerita = perjalanan **energi**, bukan elektron. Twist di hook justru jadi daya tarik: "elektronnya hampir tidak ke mana-mana".
- Tangga tegangan jadi tulang punggung visual: generator → trafo penaik → 500/150 kV → gardu induk → 20 kV → trafo distribusi → 230 V → colokan.
- Payoff: animasi satu pulsa energi melesat sepanjang rute, sementara elektron di kabel rumah hanya bergetar di tempat.
- Angka statistik (panjang jaringan, susut) ditulis "per 2024"; perbarui bila Statistik PLN 2025 terbit.
