# Research Report — Cara Kerja Aspal: Kenapa Jalan Cepat Berlubang Saat Hujan

> Riset backlog 2026-11-27. Nomor dalam kurung merujuk baris di `SOURCE_REGISTER.md`. H1/H2 = hitungan sendiri.

## Sumber utama

- **FHWA LTPP Distress Identification Manual (2014)** (#1): definisi resmi lubang, retak lelah (kulit buaya), dan water bleeding/pumping, plus ambang kedalaman lubang.
- **Jurnal Materials (MDPI) 2026 & 2019** (#7, #8): mekanisme kerusakan akibat air (tekanan air dinamis dari roda, debonding aspal–agregat).
- **Ditjen Bina Marga** (#9, #10, #11): MDP 2024 (menggantikan MDP 2017, termasuk drainase bawah permukaan), Spesifikasi Umum 2025 (menggantikan SU 2018 Rev 2), manual pemeliharaan rutin 2011 (tutup retak, tambal lubang, bersihkan saluran).
- **AASHO Road Test / fourth power law** (#2, #3, #4): via Pavement Interactive (tabel LEF AASHTO 1993) dan Wikipedia. Belum ada laporan primer AASHO/HRB yang dibuka (lihat Kontroversi).
- **ANTARA 2026** (#12, #13, #14): konteks Indonesia (air melemahkan ikatan aspal, ODOL, WIM). Hanya MEDIUM, tidak menyebut instansi/daerah di VO.

## Fakta terverifikasi

1. Lubang (pothole) adalah lubang berbentuk mangkuk di permukaan, dimensi minimum 150 mm; kedalaman > 50 mm = tingkat keparahan tinggi (#1).
2. Retak lelah terjadi di jalur roda akibat beban berulang dan berkembang menjadi pola kulit buaya (#1); lubang biasanya didahului pola ini, lalu kepingan dicungkil roda (#5).
3. Pembentukan lubang butuh dua faktor bersamaan: air dan lalu lintas (CRREL, dikutip #5). Pejabat dinas jalan juga menyebut air melemahkan ikatan aspal terutama saat dilintasi kendaraan berat (#12).
4. Stripping = lepasnya ikatan aspal dan agregat, umumnya mulai dari dasar lapisan aspal lalu naik, sehingga sulit dilihat dari permukaan (#6); ikatan lemah aspal–agregat adalah penyebab utama percepatan kerusakan (#8).
5. Roda di jalan basah menimbulkan tekanan air dinamis yang mengikis campuran aspal (#7); pumping = air menyembur dari bawah perkerasan lewat retak membawa butiran halus dari lapisan pendukung (#1).
6. AASHO Road Test (1956–1960, Ottawa, Illinois) melahirkan konsep ESAL dan aturan praktis pangkat empat: kerusakan ≈ (beban gandar)^4 (#2, #3). Contoh tabel AASHTO: gandar 133 kN merusak ≈ 7,9 kali gandar standar 80 kN (#2).
7. Berdasarkan aturan itu, beban gandar 2× → kerusakan ≈ 16× (H1, hitungan sendiri).
8. Desain perkerasan Indonesia (MDP 2024) menghitung beban dalam ESAL dan menyediakan opsi lapisan drainase bawah permukaan beserta outlet (#9).
9. Pemeliharaan rutin Bina Marga mencakup penutupan/pengisian retak, penambalan lubang, dan pembersihan saluran drainase (#11).
10. Kendaraan bermuatan/berdimensi lebih (ODOL) disebut mempercepat kerusakan jalan; pemerintah memasang WIM dan menargetkan zero ODOL 2027 (#13, #14).

## Perselisihan / Kontroversi

- **Koreksi hook.** Hook awal TOPIC.md ("Musuh terbesar aspal bukan truk berat, melainkan air yang masuk ke bawahnya") **berlebihan**. Sumber justru menunjukkan beban gandar sangat menentukan (aturan pangkat empat, #2–#4; ODOL disebut penyebab utama oleh operator jalan, #13, #14), sementara air mempercepat lewat stripping, pumping, dan pelemahan lapis fondasi (#1, #5–#8). CRREL menyebut lubang butuh **air dan lalu lintas sekaligus** (#5). Hook dikoreksi menjadi: "Jalan berlubang bukan cuma salah truk berat, bukan juga cuma salah hujan. Lubang lahir saat keduanya bekerja bareng."
- **Pangkat empat = aturan praktis**, bukan hukum pasti. ARRB 1988: pangkat 2 lebih cocok untuk retak lelah; NZTA 2017: eksponen bervariasi lebar (#4); Wikipedia AASHO menyebut ekstrapolasi problematis (#3). Di VO dibilang "kira-kira" dan "aturan praktis"; HUD "×16" wajib berlabel "≈, aturan praktis".
- **Sumber AASHO primer** (HRB Special Report 61, 1962) belum dibuka; fakta #2–#4 berstatus MEDIUM. Sebelum produksi: buka laporan primer atau halaman FHWA tentang AASHO Road Test (halaman `fhwa.dot.gov/infrastructure/50aasho.cfm` mengembalikan SERVER ERROR saat dicek 2026-11-27).
- **Spesifikasi Umum 2018 Rev 2 sudah diganti** SU 2025 (#10). Jangan menyebut SU 2018 sebagai aturan yang berlaku.
- **Klaim "satu gandar 30–40 ton"** di #13 (kutipan operator) tidak terverifikasi dan berpotensi salah kutip (mungkin berat total); TIDAK dipakai di naskah.
- **Rule 15 / netralitas:** VO tidak menyebut kota, instansi, operator tol, atau pejabat tertentu. Contoh Jakarta (#12) dan ruas tol (#13) hanya konteks riset. Tanpa logo dinas, aplikasi pengaduan, atau merek truk; tanpa wajah orang nyata (petugas sebagai siluet tanpa wajah).

## Angka kunci untuk HUD

| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| 1956–1960 | Periode AASHO Road Test (Ottawa, Illinois) | 3 |
| pangkat 4 | Aturan praktis kerusakan vs beban gandar | 2, 3, 4 |
| ×16 (≈) | Beban gandar 2× → kerusakan ≈ 16× (hitungan sendiri, aturan praktis) | H1 (dari 2, 3, 4) |
| 80 kN | Gandar standar ESAL (opsional) | 2 |
| > 5 cm | Kedalaman lubang tingkat berat (> 50 mm) | 1, H2 |
| 150 mm | Dimensi minimum lubang (opsional) | 1 |
| AIR + BEBAN | Dua syarat terbentuknya lubang | 5 |
| STRIPPING / PUMPING | Istilah mekanisme kerusakan akibat air | 1, 6, 7 |

## Poin kunci

- Lubang = hasil kerja sama air dan beban berat, bukan salah satunya saja.
- Air: masuk lewat retak → stripping (perekat lepas dari batu, dari bawah) → roda memompa air dan menyedot butiran halus fondasi.
- Beban: kerusakan naik kira-kira pangkat empat dari beban gandar, jadi kelebihan muatan sangat merusak, apalagi saat fondasi basah.
- Pencegahan: drainase yang baik, batas muatan, tutup retak sebelum air masuk.
- Pesan keselamatan: kurangi kecepatan saat hujan; genangan bisa menyembunyikan lubang; laporkan jalan rusak lewat kanal pengaduan resmi (disebut generik).
