# HANDOFF — riset bank EXPLAINED T001–T100 (mulai 2026-11-26)

- Lokasi: folder benih `_BACKLOG/EXPLAINED/T0xx_*` (keputusan pengguna: riset di benih, belum promote).
- Cara: batch 6 topik, 1 subagen general-purpose per topik, spec `F:/AUDIRA-ALL-SKILL/scripts/backlog-tools/PILOT_SPEC.md`
  (tanggal = hari ini, rule 15 EXPLAINED), cek `node F:/AUDIRA-ALL-SKILL/scripts/backlog-tools/verify-eps.mjs <folder...>`,
  lalu commit repo episode `feat(backlog): riset EXPLAINED batch N (T..)` + push.
- Progres: batch 1 = T001–T006: SELESAI, 6/6 OK, commit b5a1baf1. Batch 2 = T007–T012: SELESAI, 6/6 OK verify, di-commit (belum push). Batch 3 = T013–T018.
- Catatan agen: WebSearch/WebFetch error (model haiku tidak tersedia) -> agen pakai curl ke halaman asli/Bing/Wikipedia API; tulis itu di brief.
- Cek ulang sebelum produksi: T002 BI-Rate 6,00% (per 18 Nov 2026), T003 JISDOR + puncak 1998 (baru Wikipedia), T005 MDR/pengguna QRIS, T001 inflasi per Sep 2026.
  Batch 2: T007 "maks 100 lembar/setor" (1 bank), aturan BI uang dicek mesin sebelum masuk ATM belum ketemu;
  T008 unsur pengaman TE 2022 per pecahan + Pasal 374 KUHP/PBI 3/2026 (baru Hukumonline);
  T009 batas bunga pindar 0,3%/hari & total 100% (SEOJK 19/2025) baru dari media, baca teks OJK;
  T010 premi/klaim/penetrasi OJK 2024 (ganti bila Statistik 2025 terbit), Genoa 1347 baru Wikipedia;
  T011 rawit Rp124.400/kg per awal Nov 2026 cek PIHPS/Bapanas, judul "lima kali lipat dalam sebulan" tidak didukung data (pakai ~3x/3 minggu);
  T012 margin +20,83% (BPS 2018), HET Rp13.500 & rata-rata Rp14.677/kg per Okt 2026, cadangan ±4,5 juta ton.
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
