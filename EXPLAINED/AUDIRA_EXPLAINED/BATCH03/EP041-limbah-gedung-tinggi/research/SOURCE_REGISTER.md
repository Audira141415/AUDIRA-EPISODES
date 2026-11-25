# SOURCE_REGISTER — EP041 "Bagaimana Air dan Limbah dari Lantai 50 Bisa Turun?"

Tanggal akses semua sumber: 2026-11-07. Jalur: curl (PDF + pdftotext), browser (Bing, ICC Digital Codes, Grundfos, Goetze), Wikipedia API. WebFetch/WebSearch error (model tidak tersedia) di sesi ini.

## Daftar sumber

| Kode | Sumber | Penerbit | URL | Catatan |
|---|---|---|---|---|
| S1 | SNI 8153:2015 Sistem plambing pada bangunan gedung | Badan Standardisasi Nasional (BSN) | https://archive.org/download/SNI81532015SistemPlambingPadaBangunanGedung/SNI%208153-2015_Sistem%20plambing%20pada%20bangunan%20gedung.pdf | Salinan di archive.org (watermark "dibuat untuk penayangan di www.bsn.go.id"). Menggabungkan & merevisi SNI 03-6481-2000 dan SNI 03-7065-2005. |
| S2 | 2018 International Plumbing Code (IPC), Ch. 6, 7, 9, 10 | International Code Council (ICC) | https://codes.iccsafe.org/content/IPC2018/chapter-9-vents (juga chapter-10-traps-interceptors-and-separators, chapter-7-sanitary-drainage, chapter-6-water-supply-and-distribution) | Kode AS (bukan aturan Indonesia), dipakai sebagai pembanding prinsip. |
| S3 | Wyly, R.S. & Eaton, H.N., "Capacities of Stacks in Sanitary Drainage Systems for Buildings", NBS Monograph 31, issued 3 Juli 1961 | National Bureau of Standards (kini NIST) | https://nvlpubs.nist.gov/nistpubs/Legacy/MONO/nbsmonograph31.pdf | Data lama (1961) tapi masih rujukan dasar. Memuat ulang data Hunter (1940-an) dan Dawson & Kalinske (Univ. Iowa). |
| S4 | Cheng, C.L., Liao, W.J., He, K.C., Lin, J.L., "Empirical study on terminal water velocity of drainage stack, Part 2", CIB W062 Symposium (±2009) | National Taiwan Univ. of Science & Technology / CIB (via IRB iconda) | https://www.irbnet.de/daten/iconda/CIB17189.pdf | Tahun tidak tercetak di teks; merujuk Part 1 (CIB W062 Hong Kong, Sep 2008). |
| S5 | Cheng, C.L., He, K.C., Lin, C.L., "Empirical study on terminal water velocity of drainage stack" (Part 1), CIB W062 2008 | NTUST / CIB | https://www.irbnet.de/daten/iconda/CIB11926.pdf | Menjelaskan tekanan negatif di atas, positif di bawah stack. |
| S6 | Peraturan Gubernur DKI Jakarta No. 122 Tahun 2005 tentang Pengelolaan Air Limbah Domestik | Pemprov DKI Jakarta | https://pelayanan.jakarta.go.id/download/regulasi/peraturan-gubernur-nomor-122-tahun-2005-tentang-pengelolaan-air-limbah-domestik-di-provinsi-daerah-khusus-ibukota-jakarta.pdf | Ditetapkan 19 Okt 2005. Status revisi terbaru TIDAK diverifikasi. |
| S7 | Permen LHK No. P.68/MENLHK/SETJEN/KUM.1/8/2016 tentang Baku Mutu Air Limbah Domestik | KLHK | https://docs.paralegal.id/PERMEN/PERMEN-LHK/2016/PERMEN-LHK-P-68-MENLHK-SETJEN-KUM-1-8-2016.pdf (indeks resmi: https://peraturan.go.id/id/permen-lhk-no-p-68-menlhk-setjen-2016-tahun-2016) | Status berlaku terkini TIDAK diverifikasi. |
| S8 | "Water supply systems in zones" | Grundfos (produsen pompa) | https://www.grundfos.com/solutions/learn/research-and-insights/water-supply-systems-in-zones | Sumber produsen. |
| S9 | "Pressure control problems in high-rise buildings" | Goetze Group (produsen katup) | https://www.goetze-group.com/en/stories/pressure-control-problems-high-rise-buildings | Sumber produsen. |
| S10 | Devy Friska, "Sistem Plambing Apartemen Setiabudi Bandung", Tugas Akhir, pembimbing Ir. Suprihanto Notodarmojo PhD | Digilib ITB | https://digilib.itb.ac.id/gdl/view_data/sistem-plambing-apartemen-setiabudi-bandung | Tahun terbit kosong di halaman (NIM 15300073, angkatan 2000). |
| S11 | "Perencanaan sistem plambing apartemen The Newton 2, Jakarta Selatan" (skripsi) | Repository Univ. Trisakti | http://repository.trisakti.ac.id/usaktiana/index.php/home/detail/detail_koleksi/0/SKR/judul/00000000000000039636/perancangan%20tata%20letak | Halaman diblok Cloudflare; isi dikutip dari cuplikan hasil Bing saja. Cek manual. |
| S12 | Wikipedia EN: "Trap (plumbing)", "Drain-waste-vent system", "Greywater", "Blackwater (waste)", "Sump pump" | Wikipedia | https://en.wikipedia.org/wiki/Drain-waste-vent_system (dst.) | Konteks saja. |

## Register klaim

| # | Klaim | Sumber | Tanggal akses | Tingkat | Catatan |
|---|---|---|---|---|---|
| 1 | Limbah di gedung turun karena **gravitasi**, lewat pipa tegak (stack) yang terhubung ke saluran gedung lalu ke riol/pengolahan; pipa limbah tidak bertekanan, beda dengan pipa air bersih yang bertekanan. | S1 (6.2.5, 6.7), S12 DWV, S2 Ch.7 | 2026-11-07 | HIGH | |
| 2 | Tiap alat plambing wajib punya **perangkap (trap)** berisi **air penutup** yang menahan gas selokan. SNI: kedalaman air penutup **5–10 cm**. IPC: **2–4 inci (51–102 mm)**. | S1 (6.3.4), S2 (1002.4), S12 Trap | 2026-11-07 | HIGH | Angka SNI dan IPC setara. |
| 3 | **Sistem ven** = pipa udara yang mengalirkan udara masuk/keluar agar air penutup tidak tersedot (efek sifon) atau terdorong (tekanan balik). | S1 (def. 3.29), S2 (901.2), S12 DWV | 2026-11-07 | HIGH | |
| 4 | IPC membatasi beda tekanan pada air penutup perangkap maksimal **1 inci kolom air (249 Pa)**. | S2 (901.2) | 2026-11-07 | MED | Aturan AS; SNI setara tidak ditemukan dalam angka yang sama. |
| 5 | Air yang jatuh mendorong udara di depannya (tekanan positif) dan menarik udara di belakangnya (tekanan negatif); di stack terjadi **tekanan negatif di bagian atas, positif di bagian bawah**; tekanan terbesar dekat **dasar stack**. | S12 DWV (Operation), S5, S3 (7.5) | 2026-11-07 | HIGH | |
| 6 | Air di stack turun sebagai **lapisan/cincin air menempel di dinding pipa** (annular flow) dengan inti udara di tengah, bukan jatuh bebas seperti batu. | S3 (layer flow, annular layer), S4/S5 ("annulated flowing", Wyly) | 2026-11-07 | HIGH | Penting untuk visual. |
| 7 | Air di stack mencapai **kecepatan terminal** (gesekan dinding + udara = gaya gravitasi) dan tidak terus bertambah cepat. Wyly & Eaton: "in most practical cases" kecepatan terminal tercapai dalam jarak **1–2 lantai**. | S3 (4.2), S4 | 2026-11-07 | HIGH | |
| 8 | Besaran kecepatan terminal terukur: Dawson & Kalinske (stack 3 in) **11,5–19,5 ft/s ≈ 3,5–5,9 m/s**; Hunter: 16,8 ft/s (≈5,1 m/s) dicapai setelah ±15 ft (±4,6 m) untuk 100 gpm. Cheng dkk. (kamera high-speed): **4,39–5,18 m/s** untuk debit 1–3 L/s. | S3 (Tabel 4, sec. 2), S4 (Tabel 2) | 2026-11-07 | HIGH | Aman: "sekitar 4–6 meter per detik", "kira-kira secepat orang bersepeda santai" hanya jika dibulatkan hati-hati (18 km/jam). |
| 9 | Stack sebaiknya tidak terisi lebih dari ±1/4 sampai 1/3 penampangnya saat kecepatan terminal, agar udara tetap punya jalan dan tidak terjadi gangguan tekanan/bising/getar. | S3 (sec. 2 Hunter; Dawson & Kalinske; 7.2) | 2026-11-07 | MED | Satu dokumen, tapi memuat tiga kelompok peneliti. |
| 10 | Pipa tegak air limbah yang melayani **lebih dari 10 tingkat** wajib diberi **ven penghubung/pelepas setiap lantai kesepuluh, dihitung dari lantai teratas**, menghubungkan pipa tegak air limbah ke pipa tegak ven. | S1 (6.13.8 butir 2), S2 (908.1 "relief vent at each tenth interval") | 2026-11-07 | HIGH | Fakta inti untuk lantai 50. |
| 11 | IPC: **vent stack wajib** untuk setiap drainage stack dengan **5 branch interval atau lebih**; ujung ven harus ke udara terbuka (di atap) atau AAV tipe stack. | S2 (904.2, 904.3); S1 (6.2.5 pipa tegak utama tembus atap) | 2026-11-07 | HIGH (prinsip tembus atap) / MED (angka 5 interval, AS) | |
| 12 | **Ofset** (belokan miring >45° pada pipa tegak) dianggap titik rawan tekanan: harus diberi ven pelepas/ven penghubung di atas dan di bawah ofset (SNI: bila ofset >12 m di bawah cabang teratas). | S1 (6.13.8 butir 3, 6.2.4), S2 (907) | 2026-11-07 | HIGH | Tidak ditemukan sumber yang menyebut ofset sebagai "pemecah/rem kecepatan". |
| 13 | **Floor drain**: wajib saringan yang bisa diangkat, perangkap jenis air penutup dalam, tinggi perangkap 5,5–10 cm, diameter ≥80 mm, dan harus ada air untuk mengisi ulang perangkap bila menguap. IPC: perangkap rawan penguapan dilindungi **trap seal primer**. | S1 (6.4), S2 (1002.4.1), S12 Trap | 2026-11-07 | HIGH | Fakta menarik: lantai kamar mandi jarang dipakai bisa bau karena air penutup menguap. |
| 14 | **Air bekas (grey water)** = dari wastafel, shower, mesin cuci, dapur; **air kotor (black water)** = dari kloset/tinja. | S6 (Pasal 1 butir 15), S12 Greywater/Blackwater | 2026-11-07 | HIGH | |
| 15 | Pemisahan pipa air kotor dan air bekas adalah **pilihan desain**, bukan keharusan universal: contoh ada yang terpisah (The Newton 2) dan ada yang campuran satu pipa (Apartemen Setiabudi). | S10, S11 | 2026-11-07 | MED | S11 hanya cuplikan. |
| 16 | Contoh gedung: air buangan dialirkan ke **STP di Basement 2**, air dapur lewat **grease trap** dulu, lalu hasil olahan dibuang ke **riol kota**. | S10 | 2026-11-07 | MED | Satu contoh, bukan aturan umum. |
| 17 | DKI Jakarta: bangunan rumah tinggal dan non rumah tinggal **wajib mengelola air limbah domestik sebelum dibuang ke saluran umum/drainase kota**; instalasi air limbah jadi syarat izin bangunan (IMB, IPB/KMB saat itu). | S6 (Pasal 7, 8) | 2026-11-07 | MED | Satu sumber resmi; istilah izin sudah berubah (kini PBG/SLF) dan status revisi Pergub tidak diverifikasi. |
| 18 | Nasional: setiap usaha/kegiatan penghasil air limbah domestik (termasuk rumah susun, perkantoran, perniagaan) **wajib mengolah** air limbahnya; baku mutu: pH 6–9, BOD 30, COD 100, TSS 30, minyak & lemak 5, amoniak 10 mg/L, total coliform 3000/100 mL. | S7 (Pasal 3, Lampiran I) | 2026-11-07 | MED | Status berlaku terkini tidak diverifikasi. |
| 19 | Air limbah yang **lebih rendah dari riol kota** (basement) tidak bisa turun sendiri: dikumpulkan di **sumuran/bak penampung** lalu diangkat dengan **pompa ejektor/pompa otomatis** ke saluran gravitasi. | S1 (6.7, 6.9), S2 (712.1, 712.4), S12 DWV | 2026-11-07 | HIGH | |
| 20 | Air bersih **naik** butuh tekanan: SNI mensyaratkan desain dengan tekanan minimum 100 kPa (10 m kolom air), minimal 0,5 kg/cm² di keran; bila tekanan kota kurang, dipasang tangki (gravitasi/tekan) atau pompa booster. | S1 (5.3) | 2026-11-07 | HIGH (bersama #21) | |
| 21 | Pola umum gedung tinggi: air ditampung di **tangki bawah**, **dipompa** ke **tangki atap (roof tank)**, lalu turun ke lantai-lantai dengan gravitasi; lantai teratas dapat diberi booster tambahan. | S8, S9, S10 | 2026-11-07 | HIGH | |
| 22 | Gedung tinggi dibagi **zona tekanan**; tiap zona dilindungi **katup pengurang tekanan (PRV)** atau booster bertingkat. Grundfos: tekanan lantai teratas zona ≥1,5–2 bar, lantai terbawah zona ≤4–4,5 bar. SNI: tekanan >5 kg/cm² (50 m kolom air) wajib dilengkapi alat pelepas tekanan/pencegah pukulan air. IPC: >80 psi (552 kPa) wajib PRV. | S8, S9, S1 (5.3 butir 4), S2 (604.8) | 2026-11-07 | HIGH | |
| 23 | Hitungan turunan: setiap 10 m beda tinggi ≈ 1 kg/cm² (100 kPa). Kalau gedung 50 lantai dengan tinggi lantai asumsi 3,5–4 m (±175–200 m), satu pipa tanpa zona memberi tekanan statis ±17–20 bar di bawah, jauh di atas batas 5 kg/cm². | S1 (5.3 konversi 100 kPa = 10 m), hitungan sendiri | 2026-11-07 | MED | Tinggi lantai adalah ASUMSI; sebut "kira-kira" atau jangan pakai angka. |
| 24 | Ven udara mekanis (air admittance valve, AAV) hanya bekerja pada tekanan negatif; di gedung tinggi perlu dikombinasikan perangkat peredam tekanan positif. | S12 DWV | 2026-11-07 | LOW | Wikipedia saja; tidak perlu dipakai di naskah. |

## Gagal / tidak terverifikasi
- Ambang jumlah lantai atau luas yang mewajibkan **STP di dalam gedung** di Jakarta: tidak ditemukan angka resmi.
- Status terbaru Pergub DKI 122/2005 dan Permen LHK P.68/2016 (dicabut/diubah?): tidak diverifikasi.
- Klaim "ofset pipa berfungsi sebagai pemecah/peredam kecepatan": tidak ada sumber; sumber justru memperlakukan ofset sebagai titik yang butuh ven tambahan.
- Kecepatan limbah jatuh "ratusan km/jam": tidak didukung (lihat #7–8).
- Skripsi Trisakti (S11): isi penuh tidak bisa dibuka (Cloudflare 403).

## Musik & SFX

| Aset | Sumber | Lisensi |
|---|---|---|
| Musik latar | Prosedural numpy `_tools/synth_bgm.py` (dibuat AUDIRA) | Milik sendiri, bebas lisensi |
| SFX | Pustaka AUDIRA `shared/assets/sfx` | Pustaka internal AUDIRA |
| VO | Cartesia sonic-3, suara Galang | Lisensi akun Cartesia AUDIRA |
