# HANDOFF — riset bank EXPLAINED T001–T100 (mulai 2026-11-26)

- Lokasi: folder benih `_BACKLOG/EXPLAINED/T0xx_*` (keputusan pengguna: riset di benih, belum promote).
- Cara: batch 6 topik, 1 subagen general-purpose per topik, spec `F:/AUDIRA-ALL-SKILL/scripts/backlog-tools/PILOT_SPEC.md`
  (tanggal = hari ini, rule 15 EXPLAINED), cek `node F:/AUDIRA-ALL-SKILL/scripts/backlog-tools/verify-eps.mjs <folder...>`,
  lalu commit repo episode `feat(backlog): riset EXPLAINED batch N (T..)` + push.
- Progres: batch 1 = T001–T006: SELESAI, 6/6 OK, commit b5a1baf1. Batch 2 = T007–T012: SELESAI, 6/6 OK, commit dde22419. Batch 3 = T013–T018: SELESAI, 6/6 OK, commit a4068c80. Batch 4 = T019–T024: SELESAI, 6/6 OK, commit b409670d. Batch 5 = T025–T030: SELESAI, 6/6 OK. Batch 1–5 sudah di origin. Batch 6 = T031–T036.
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
