# Research Report — Kenapa Macet Bisa Muncul Tanpa Ada Kecelakaan

> Riset backlog 2026-11-27. Channel @AudiraExplained (rule 15: netral, tanpa wajah/logo/merek nyata).

## Sumber utama

- **Sugiyama dkk. 2008, New Journal of Physics** (PDF dibuka penuh): eksperimen lintasan melingkar 230 m, 22 mobil; macet tanpa bottleneck; gelombang mundur ±20 km/jam; kepadatan kritis ±25 kendaraan/km (#1, #2, #3).
- **Stern dkk. 2018, Transportation Research Part C** (preprint arXiv dibuka penuh, DOI dicek di Crossref): eksperimen ulang 260 m, 21–22 mobil; satu mobil otonom meredam gelombang; BBM hemat hingga ±40% (#4, #5).
- **FHWA 2005, Traffic Congestion and Reliability** (ringkasan eksekutif + bab 2): komposisi sumber kemacetan AS, insiden 25% (#6).
- **Schönhof & Helbing 2007, Transportation Science** (preprint arXiv dibuka, data terbit dicek di Crossref): data tol A5 Jerman, gelombang stop-and-go merambat mundur ±15 km/jam; perdebatan "phantom jam" (#7).
- Pendukung MEDIUM: Wikipedia "Traffic wave" (#8) dan "Two-second rule" (#9).

## Fakta terverifikasi

1. Macet bisa muncul tanpa bottleneck: 22 mobil di lintasan 230 m yang awalnya lancar di ±30 km/jam membentuk gumpalan macet sendiri; pada snapshot 3 menit kemudian gumpalan (5 mobil) sudah terbentuk (#1).
2. Mobil di dalam gumpalan berhenti total; gumpalan bergerak mundur ±20 km/jam, sama dengan kecepatan macet di jalan tol, dan tidak bergantung panjang gumpalan (#2).
3. Syaratnya kepadatan: di bawah nilai kritis fluktuasi kecil hilang; di atasnya membesar. Data satu titik tol Jepang: kepadatan kritis hampir 25 kendaraan/km (#3, #8).
4. Data tol Jerman: gelombang stop-and-go merambat ke hulu ±15 km/jam (#7). Jadi kisaran kecepatan gelombang mundur dari sumber HIGH = 15–20 km/jam (#2, #7).
5. Di AS, insiden lalu lintas (termasuk kecelakaan) menyumbang ±25% kemacetan; bottleneck 40%, cuaca 15%, zona kerja 10%, lampu lalu lintas 5%, acara khusus/lainnya 5% (#6).
6. Satu kendaraan otonom yang melaju stabil di lintasan 260 m meredam gelombang: simpangan baku kecepatan turun 49,5–80,8%, BBM rombongan turun 22,1–42,5% (penulis meringkas "up to 40%") (#4, #5).
7. Jarak aman minimal 2 detik, banyak anjuran 3 detik; tambah saat hujan atau di turunan (#9).

## Perselisihan / Kontroversi

- **Koreksi hook TOPIC.md**: "Satu pengemudi menginjak rem bisa menciptakan gelombang macet sejauh kilometer" berlebihan dalam dua hal. (a) Satu rem saja tidak cukup: gelombang hanya membesar bila kepadatan sudah di atas ambang kritis (#3); di jalan sepi gangguannya hilang. (b) Tidak ada sumber HIGH yang dibuka yang menyebut satu gelombang dari satu injakan rem menempuh "kilometer". Yang terverifikasi hanya kecepatan gelombang mundur 15–20 km/jam (#2, #7). Hook dikoreksi menjadi "pemicunya **bisa** cuma satu injakan rem", syarat kepadatan dijelaskan di c04, dan jarak disajikan sebagai hitungan ilustrasi.
- **Hitungan sendiri (label wajib di HUD)**: 15–20 km/jam × 10 menit = 2,5–3,3 km. VO memakai "lebih dari dua kilometer" untuk gelombang yang bertahan sepuluh menit; ini skenario, bukan pengukuran.
- **Apakah macet benar-benar "tanpa sebab"?** Treiterer (foto udara 1966/1974) mengusulkan phantom jam, tetapi Daganzo berpendapat selalu ada pemicu kecil, misalnya pindah lajur di kerumunan rapat (#7). Sugiyama menyebut bottleneck hanya pemicu, bukan asal-usul utama (#2). Naskah aman: "tanpa tabrakan, tanpa perbaikan jalan", pemicu = rem atau gangguan kecil.
- **Data FHWA dari AS, 2005**, bukan Indonesia. VO menyebut "data jalan raya Amerika". Data setara Indonesia tidak berhasil dicari (WebSearch/WebFetch dan mesin pencari via curl error di sesi ini). Jangan menggeneralisasi ke kota Indonesia tertentu.
- **Kepadatan kritis 25 kendaraan/km** dari satu titik tol Jepang (data 1 bulan); nilainya berbeda per jalan dan lajur. HUD wajib menulis "data tol Jepang".
- **BBM hingga 40%** berlaku di lintasan eksperimen 260 m dengan gelombang kuat, bukan janji di jalan nyata. Angka per eksperimen 22,1–42,5%.
- **Netral politik**: tidak menyalahkan pemerintah daerah, operator tol, atau pengemudi tertentu; tidak menyebut kota Indonesia.

## Angka kunci untuk HUD

| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| ±25% | Porsi insiden (termasuk kecelakaan) dalam sumber macet AS | 6 |
| 2008 | Tahun publikasi eksperimen lingkaran Jepang | 1 |
| 230 m · 22 mobil | Lintasan dan jumlah mobil eksperimen | 1 |
| ±30 km/jam | Kecepatan jelajah awal | 1 |
| ±20 km/jam (mundur) | Kecepatan gumpalan macet bergerak berlawanan arah | 2 |
| ±15 km/jam (mundur) | Gelombang stop-and-go di tol A5 Jerman | 7 |
| ±25 kendaraan/km | Kepadatan kritis, data tol Jepang | 3 |
| 2,5–3,3 km | Hitungan ilustrasi: 15–20 km/jam × 10 menit | 2, 7 (hitungan sendiri) |
| 260 m · 1 mobil otonom | Eksperimen ulang di AS | 4 |
| hingga 40% | Penghematan BBM saat gelombang diredam | 5 |
| 2–3 detik | Jarak aman yang dianjurkan | 9 |

## Poin kunci

- Macet bisa lahir dari dinamika antrean itu sendiri saat jalan sudah padat; kecelakaan bukan satu-satunya penyebab.
- Gelombang macet berjalan mundur, jadi kita sering terjebak macet yang pemicunya sudah lama hilang.
- Visual paling kuat: eksperimen lingkaran (lancar, lalu gumpalan, lalu gelombang mundur) dan kontras jalan sepi vs padat.
- Pesan keselamatan: jaga jarak 2–3 detik, hindari rem mendadak dan serobot lajur.
