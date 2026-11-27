# HANDOFF — riset bank EXPLAINED T001–T100 (mulai 2026-11-26)

- Lokasi: folder benih `_BACKLOG/EXPLAINED/T0xx_*` (keputusan pengguna: riset di benih, belum promote).
- Cara: batch 6 topik, 1 subagen general-purpose per topik, spec `F:/AUDIRA-ALL-SKILL/scripts/backlog-tools/PILOT_SPEC.md`
  (tanggal = hari ini, rule 15 EXPLAINED), cek `node F:/AUDIRA-ALL-SKILL/scripts/backlog-tools/verify-eps.mjs <folder...>`,
  lalu commit repo episode `feat(backlog): riset EXPLAINED batch N (T..)` + push.
- Progres: batch 1 = T001–T006: SELESAI, 6/6 OK, commit b5a1baf1. Batch 2 = T007–T012: SELESAI, 6/6 OK, commit dde22419. Batch 3 = T013–T018: SELESAI, 6/6 OK, commit a4068c80. Batch 4 = T019–T024: SELESAI, 6/6 OK, commit b409670d. Batch 5 = T025–T030: SELESAI, 6/6 OK, commit a2694336. Batch 6 = T031–T036: SELESAI, 6/6 OK, commit 6c91d788. Batch 7 = T037–T042: SELESAI, 6/6 OK, commit 40bdc7b8. Batch 1–7 sudah di origin.
  Batch 8 = T043–T048: SELESAI, 6/6 OK, commit 43eccee1. Batch 9 = T049–T054: SELESAI, 6/6 OK, commit dfbd9fda. Batch 10 = T055–T060: SELESAI, 6/6 OK, commit ce871ccd. Batch 11 = T061–T066: SELESAI, 6/6 OK, commit 4da4b891. Batch 12 = T067–T072: SELESAI, 6/6 OK, di-commit + push. Batch 13 = T073–T078.
- Catatan agen: WebSearch/WebFetch error (model haiku tidak tersedia) -> agen pakai curl ke halaman asli/Bing/Wikipedia API; tulis itu di brief.
- Cek ulang sebelum produksi: T002 BI-Rate 6,00% (per 18 Nov 2026), T003 JISDOR + puncak 1998 (baru Wikipedia), T005 MDR/pengguna QRIS, T001 inflasi per Sep 2026.
  Batch 2: T007 "maks 100 lembar/setor" (1 bank), aturan BI uang dicek mesin sebelum masuk ATM belum ketemu;
  T008 unsur pengaman TE 2022 per pecahan + Pasal 374 KUHP/PBI 3/2026 (baru Hukumonline);
  T009 batas bunga pindar 0,3%/hari & total 100% (SEOJK 19/2025) baru dari media, baca teks OJK;
  T010 premi/klaim/penetrasi OJK 2024 (ganti bila Statistik 2025 terbit), Genoa 1347 baru Wikipedia;
  T011 rawit Rp124.400/kg per awal Nov 2026 cek PIHPS/Bapanas, judul "lima kali lipat dalam sebulan" tidak didukung data (pakai ~3x/3 minggu);
  T012 margin +20,83% (BPS 2018), HET Rp13.500 & rata-rata Rp14.677/kg per Okt 2026, cadangan ±4,5 juta ton.
  Batch 3: T013 harga keekonomian Solar/Pertalite/LPG masih data Ags 2025 + realisasi subsidi/kompensasi s.d. TW III 2026;
  T014 harga emas US$4.045,81/oz (per akhir Nov 2026) + rekor US$5.405 Jan 2026 + bank sentral 863 t;
  T015 T+2 (sumber 2018, cek apakah sudah T+1), 963 emiten (ANTARA, idx.co.id blokir curl), 10,37 juta investor (label: saham & surat berharga lain);
  T016 persentase TBA per kelas layanan + cap fuel surcharge 40% (PM 20/2019 & KM 106/2019 sedang direvisi);
  T017 tarif ojol KP 667/2022 per zona (Perpres 27/2026 komisi 8% bisa mengubah), judul "Begini Rumusnya" setengah keliru (rumus aplikator tidak publik);
  T018 semua angka rupiah ilustrasi (stempel ILUSTRASI), Pasal 11f UU PK khusus obral.
  Batch 4: T019 ±60 rpm (hitungan dari rumus) & 1.000+ rpm peras (Wikipedia); hook = cegah melilit, bukan lecek;
  T020 suhu per titik setrika GINETEX 120/160/210 °C vs Wikipedia 110/150/200; SNI/IEC belum terbaca;
  T021 batas hisap 10,33 m (teoretis, permukaan laut) vs praktis 7,6 m (USGS) / 5–8 m (Wiki): pilih satu;
  T022 tarif Rp1.444,70/kWh per TW III 2026 (ANTARA); belum ada dokumen PLN/SPLN resmi soal STS;
  T023 trip magnetik 0,06–0,07 dtk dari 1 uji lab (cek IEC 60898-1); kebakaran Jakarta 2024 789 vs 787;
  T024 tekanan tabung ±4 bar = estimasi sendiri (label HUD), tekanan keluar resmi SNI 7369 belum terbaca.
  Batch 5: T025 −60% kematian & "3 dari 5" = data NFPA AS 2018–2022 (cek laporan baru), Am-241 ≤1 µCi (NRC 2021), aturan buang BAPETEN belum diriset;
  T026 Permenaker 04/1980 masih berlaku? (1,2 m / 15 m / 2x setahun), 112 baru pilot Bali per Sep 2026, interval isi ulang bertentangan di regulasi (tidak dipakai);
  T027 ELCB ≤30 mA (HSE UK) cocokkan PUIL, 9,5 L/menit konversi ENERGY STAR AS, termostat ±55 °C baru Wikipedia, SNI/ESDM belum terverifikasi;
  T028 25.000 rpm = spek maks 1 model 1.200 W (berbeban ±17.900), "motor universal" baru Wikipedia, 267–533 put/dtk = hitungan sendiri;
  T029 13 kPa dari 1 simulasi CFD (bukan rata-rata pasar), ±25 kPa hanya Wikipedia de, larangan abu panas belum bersumber resmi;
  T030 "½–¼ waktu masak" baru Wikipedia, kolagen "±60 °C" penyederhanaan 53–63 °C, 120,9 °C interpolasi NIST (label), SNI presto belum terbaca.
  Batch 6: T031 "7 dari 10 RT minum air ber-E. coli" = SKAMRT 2020 (semua sumber air, cari data baru), "3 minggu bakteri naik" studi 1981, pori UF/RO CDC vs Wikipedia;
  T032 FMR ≤1:10.000 & FNMR <5% = syarat pedoman NIST SP 800-63B-4 (bukan spek kunci konsumen), "jari luka" belum bersumber;
  T033 lendutan <0,5 mm dari 1 datasheet, HX711 ×128/24-bit khusus chip itu, 5–10 mV hitungan sendiri, tera ulang 1 tahun (Permendag 24/2024);
  T034 "≈4 °C terasa lebih sejuk" hanya pada 27 °C/RH 50%/1 m/s (HUD wajib "terasa"), ambang suhu kipas beda antar sumber (tidak di VO), panas motor baru Wikipedia;
  T035 >150 m/dtk dari unit bermerek di studi, 540 km/jam konversi sendiri, 40 dtk & 10 dtk=90% dari tinjauan 2012, 17 dtk hanya pria; debat higiene didanai industri (sajikan netral);
  T036 tahun 1974 & inspirasi Morse baru Wikipedia, jangan tulis "barcode tak pernah memuat harga" (barang timbang toko), jangan tampilkan 13 digit 899 lengkap.
  Batch 7: T037 urutan 6 lapisan baru dari produsen, "10x lebih tipis dari rambut" pembulatan (sumber 8–18x), suhu/waktu UHT beda antar sumber, BPOM/Codex UHT belum terbuka;
  T038 12D "1 banding 1 triliun" disederhanakan, 121 °C (acuan 121,1), pH 4,6, Appert "1810" = tahun publikasi; regulasi semua FDA (jangan tulis "aturan Indonesia");
  T039 status MLFF setelah 27 Sep 2026 (dipakai di VO c06), ERP Singapura "1998" + klaim alat dasbor dihapus akhir 2026 (GNSS) baru Wikipedia/LTA, 5,8 GHz baru Wikipedia;
  T040 "20 kV AC dari PLN" 1 studi lintas Bogor, IEC 60850 1.000–1.800 V via Wikipedia, rel jalur balik tanpa dokumen KAI, data pelanggan per Jul 2026;
  T041 800–1.200 m hanya rilis KAI (cari dok DJKA), >1,6 km & 6.000 t = kereta barang AS (label HUD), "lebih dari 20x" hitungan sendiri beda kecepatan;
  T042 PM 44/2018 masih berlaku?, LRT Jabodebek CBTC GoA3 & gagal-aman track circuit baru Wikipedia, jarak pengereman samakan dgn T041, judul saran "Cara Sinyal Mencegah Kereta Bertabrakan".
  Batch 8: T043 3.674 perlintasan sebidang (KAI per Mei/Okt 2026 via ANTARA, cari data DJKA), "4–7 dtk" hanya palang ≤7,5 m (9 m: 9–13 dtk), 1–1,5 km & 3 menit "atau sesuai desain"; hook dikoreksi: palang berpenjaga tetap ditutup petugas, kabar dari stasiun + sensor.
  T045 (OK src=9 high=7 kata=201): insiden ±25% penyebab macet = data AS 2005, BBM hemat "hingga 40%" (22–42,5%, lintasan 260 m), kepadatan kritis 25 kend/km 1 titik tol Jepang, aturan 2–3 dtk baru Wikipedia (cari Korlantas/Kemenhub), ">2 km" hitungan sendiri; hook: satu rem saja tak cukup, perlu kepadatan di atas ambang.
  T048 (OK src=10 high=6 kata=208): PM 82/2018 dicabut PM 48/2023 (berlaku 13 Okt 2023, tanpa angka; ukuran oleh Dirjen Hubdat Psl 13(3), belum ketemu) → angka naskah dari PM 14/2021 ("aturan 2021"), ganti bila ada aturan Dirjen baru; "12 cm" populer tidak dipakai; cek UU 6/2023 ubah pidana UU 22/2009; efektivitas FHWA/ITE 33–48% studi AS tidak di VO.
  T047 (OK src=14 high=6 kata=206): "×16" hitungan sendiri dari aturan pangkat empat (sumber baru MEDIUM, laporan AASHO belum dibuka), tahun 1956–1960 baru Wikipedia, SU 2018 Rev 2 sudah diganti SU 2025; hook: truk berat + air bekerja bersama, bukan salah satu.
  T046 (OK src=15 high=7 kata=202): judul "ribuan ton" berlebihan → usul "Ratusan Ton per Bentang di Atas Tiang Ramping" (1 bentang ±40 m = 520,73 t dari prosiding mahasiswa PNJ, MEDIUM, cari HIGH; 40 m disimpulkan), −60% gaya gempa contoh spektrum AASHTO, kedalaman tiang "puluhan meter" data FHWA AS, cek versi SNI terbaru; gaya gempa ditanggung bantalan/isolator, SNI 2833 target "tidak runtuh".
  T044 (OK src=17 high=7 kata=203): klaim operator "penuh ≤2 jam" vs hitungan 350 kWh/120 kW ≈2,9 jam (naskah "beberapa jam"), "80% dalam 15 menit" pantograf = 1 armada Turki (label), rute kota ±200 km/hari baru Wikipedia, "500 bus per Okt 2026" cepat basi, pantograf di Jakarta belum terbukti (visual c06 generik), baterai "sebagian di atap".
  Batch 9: T049 kala ulang (Lampiran I per tipologi kota + luas tangkapan, bukan per tingkat saluran) baru dari salinan paralegal (MEDIUM), kapasitas drainase Jakarta 100–150 mm/hari pernyataan pejabat tidak konsisten (per 2025), Permen PU 12/2014 "Berlaku" tapi cek jdih.pu.go.id; hook: drainase satu faktor saja.
  T050 hanya ±18–20% Jakarta di bawah laut (kajian SDA+ITB 2021 via berita), Waduk Pluit 39 vs ±49 m³/dtk tidak konsisten, −190 cm MEDIUM, 602 pompa/205 lokasi per Jun 2025 cepat basi, turun tanah ±5,7 cm/th (cek periode di PDF BRIN); hook: pompa jalan saat muka air lewat batas, bukan nonstop.
  T051 ±575 km & status tahap (mangrove Okt 2026, tanggul beton 2027, NCICD A3 432 m) MEDIUM cepat basi, "±25×" = titik terparah 15 cm/th vs laut 5–6 mm/th (hitungan sendiri, HUD "titik terparah"), Perpres 77/2025 cek JDIH Setneg; hook: tanggul ikut amblas, harus ditinggikan.
  T052 susut 8,55%, 72.655 kms, 573.650 trafo = Statistik PLN 2024 (ganti bila 2025 terbit), drift 0,22 mm/s hitungan sendiri, Permen ESDM 04/2009 Aturan Distribusi status belum pasti (JDIH ESDM 403); rumah 230 V bukan 220 V; hook: energi merambat, elektron hampir diam.
  T053 semua angka 2019 (21,9 juta pelanggan, 11.45→11.48, ±9 jam, pohon 8,5 m) baru MEDIUM, laporan investigasi resmi belum ketemu; judul usul "…ke Separuh Pulau"; angka 49,5 Hz/≥30% dari Grid Code 2020 (bukan aturan saat kejadian); hook: rangkaian gangguan, bukan satu.
  T054 SPLN D3.002-1:2007 dibaca dari salinan kupdf (cek asli; "10–400 kVA" bacaan tabel rusak), "≈50:1" rasio tegangan bukan lilitan (Dyn5 ±87:1), status Permen ESDM 04/2009 & SNI 04-0227-2003 vs IEC 60038:2009; hook: 20.000 V → 230 V, tangki tak selalu tabung.
  Batch 10: T055 kehilangan air 33,2% (data 2022 via ANTARA) & cakupan pipa ±20% per Feb 2026 MEDIUM, Permenkes 2/2023 dicabut sebagian Permenkes 3/2026 (lampiran baku mutu masih berlaku, cek JDIH); hook: jernih belum tentu siap diminum.
  T056 26% terkelola, 141.926 t/hari, 481 vs ±369 TPA open dumping MEDIUM cepat basi; tenggat open dumping berubah-ubah (Jul 2026/2027/2028, VO hanya "ratusan TPA"); dasbor resmi kini sampahnasional.kemenlh.go.id; hook: ±3 dari 4 kantong tak terkelola (hitungan sendiri).
  T057 71% daur ulang botol PET = studi industri (label HUD, cek/hapus), "1% tekstil" data 2021; Perbadan BPOM 20/2019 dicabut 11/2026 (aturan teknis daur ulang Psl 9(2) belum ketemu); hook: dua jalur (botol lagi vs kaus/downcycling).
  T058 asal HPSN 21 Feb hanya MEDIUM, contoh BRIN Malang per Mei 2026; Leuwigajah 143 jiwa (Lavigne 2014); hook: metana menyala sendiri baru ±537 °C, "terbakar sendiri" dihapus.
  T059 141 kab/kota per Mar 2025 vs "182" Des 2025 (MEDIUM, bentrok), Kendari 2.360→22 valid hanya sepekan pertama, pilot Bali 25 Sep 2026 = integrasi nasional (bukan awal 112); hook: belum semua daerah bisa menjawab, "hitungan detik" dihapus.
  T060 Permenkes 19/2016 (SPGDT/119) dicabut Permenkes 1/2026 tanpa angka 119 (cek Kepmenkes), daftar alat kabin baru Wikipedia (cari standar resmi), cek tekstur GLB ambulance-van-29919a (lambang palang merah); judul usul "Cara Kerja Ambulans Gawat Darurat: Bukan Sekadar Mobil Bersirene".
  Catatan sumber: halaman ANTARA memuat larangan crawling AI tanpa izin — kutip fakta saja, jangan salin teks; utamakan sumber resmi.
  Batch 11: T061 skylift DKI 104 m & 90 m (MEDIUM via media, cepat basi), tinggi lantai 30/40 hitungan sendiri, ambang lift kebakaran/presurisasi dari Permen PU 26/2008 (berlaku via Psl 348 PP 16/2021), versi SNI belum dicek BSN; hook: 104 m hampir sampai lantai 30 → VO pakai lantai 40.
  T062 waktu tunggu 10/30/60/120 menit = ATS Australia (sebut Australia), Indonesia 4 warna (Permenkes 47/2018 masih berlaku, cek JDIH); hook: "yang datang duluan belum tentu dilayani duluan".
  T063 5,6 juta kantong/th (Menkes Des 2024 via ANTARA) MEDIUM; "2% penduduk WHO" tidak ada di fact sheet (tidak dipakai); PP 7/2011 dicabut PP 28/2024, Permenkes 91/2015 masih dipertahankan Psl 1169 (cek pengganti); hook: bisa dipecah 3, tidak selalu.
  T064 peserta 285,8 juta, PBI 96,8 juta, iuran Rp118 T vs manfaat Rp132 T, aset DJS Rp30,04 T = MEDIUM cepat basi (awet: tidak); iuran masih Perpres 64/2020, KRIS/iDRG uji coba per Okt 2026 — cek perubahan keempat Perpres 82/2018; hook: "jutaan" → ratusan juta + APBN/pemberi kerja.
  T065 −90…−60 °C hanya 1 vaksin mRNA per Feb 2022, lampiran Permenkes 12/2017 dicabut Permenkes 3/2026 (pedoman vaksin pengganti belum ketemu), CDOB: Per BPOM 20/2025 dicabut sebagian 16/2026 (teks belum dibaca); "50% vaksin terbuang" tidak dipakai; judul usul "…Tidak Boleh Panas, Tidak Boleh Beku".
  T066 galat ±3,1/2,2/1,5% & 0,24% hitungan sendiri, 820.161 TPS (MEDIUM), nomor putusan MK 2019 belum pasti (mkri.id Cloudflare), PKPU 9/2022 Psl 19 aturan 2 jam; netral: hanya angka ILUSTRASI; judul usul "…Kenapa Sampel Kecil Bisa Mendekati Hasil Resmi".
  Batch 12: T067 suara/kursi 2024 (peringkat 4: 16,1 jt→68 kursi vs peringkat 5: 14,7 jt→69) & 84 dapil MEDIUM (Wikipedia), isi Putusan MK 116/PUU-XXI/2023 via ANTARA; Panja RUU Pemilu mulai 11 Nov 2026 (wacana ambang 5%) → bila disahkan tulis ulang c02/c06; awet tidak.
  T068 ±3,1/2,2/4,9/5,8 hitungan sendiri (rumus 0,98/√n via Wikipedia), ±6,9 n=200 AAPOR HIGH; hook: "plus minus tiga" = poin persen, bukan 3%.
  T069 UU 12/2011 diubah UU 15/2019, 13/2022, 1/2026 (hanya Psl 15); cek RUU perubahan; pengundang kini menteri kesekretariatan negara (UU 13/2022 Psl 85); hook: disetujui paripurna belum berlaku sampai diundangkan.
  T070 KUHAP baru UU 20/2025 berlaku 2 Jan 2026 (istilah: advokat, perlawanan, pembelaan, jawaban; 8 alat bukti Psl 235, "pengamatan hakim" diuji MK 92/PUU-XXIV/2026), Psl 215 diperbaiki MK 383/PUU-XXIV/2026 (MEDIUM); judul usul "Cara Kerja Sidang Pidana: Siapa Melakukan Apa".
  T071 tiga angka berlabel: 270,20 jt (SP2020), 284,67 jt (SUPAS 2025, MEDIUM), 288.315.089 (Dukcapil 31 Des 2025, MEDIUM, cek DKB Sem I 2026); SP2030 & RUU Statistik belum pasti.
  T072 "7 juta paket/hari" klaim Wamenkomdigi Feb 2026 (MEDIUM), alur hub&spoke dari 1 kurir (generik); Permenkomdigi 8/2025 (diskon di bawah biaya pokok ≤3 hari/bln Psl 45, ganti rugi ≤10× ongkir Psl 73) cek perubahan; hook: "dua hari" keliru (batas 3/7 hari).
- Lanjut: Lanjut dari topik pertama yang TOPIC.md-nya masih `stage: backlog`:
  `grep -L "stage: drafted" _BACKLOG/EXPLAINED/*/TOPIC.md | head -6`.

# HANDOFF — bank topik baru EXPLAINED (2026-11-26)

Status: selesai 2026-11-26 — topics.md 100 baris + EXPLAINED terdaftar di make-seeds/backlog; belum di-commit (tunggu acc pengguna). Benih _BACKLOG/EXPLAINED belum dibuat (node make-seeds.mjs).
- Tugas: buat `F:/AUDIRA-ALL-SKILL/channel-topics/audira-explained/topics.md`, 100 topik untuk @AudiraExplained,
  format sama dengan bank channel lain (`# | Topik | Hook singkat | Style Rekomendasi | Status`, status `[ ]`).
- Referensi: `channel-topics/audira-{faktadunia,qissah,sains,sportfacts,tech}/topics.md`, `make-seeds.mjs`, `backlog.mjs`.
- Konteks: topik coding (audira-dev) sudah pindah ke TECH/AUDIRA_CODING_2026 (commit 88324ca2 / hub fd9f3e5).
  EXPLAINED kini tanpa bank. Niche EXPLAINED: berita + explainer umum + cara kerja (rule 15 berita-explained-standard).
- Sisa: daftarkan `audira-explained` -> `EXPLAINED` di make-seeds.mjs dan `EXPLAINED: "audira-explained"` di backlog.mjs,
  cek duplikat dengan 33 EP di `AUDIRA_CARA_KERJA_VIRAL_2026` + seri EXPLAINED/, commit + push bila pengguna setuju.
