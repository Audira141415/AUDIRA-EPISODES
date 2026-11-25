# Batch handoff — AUDIRA_FAKTA_OLAHRAGA_2026 EP06–EP10 (orkestrator)

Dibuat: 2026-11-23. Permintaan pengguna: "buatkan 5 riset untuk SPORTFACTS dan buatkan 5 video shortnya".

## Episode
| EP | Folder | Topik |
|---|---|---|
| 06 | EP06_USAIN_BOLT_9_KOMA_58_DETIK | Bolt 9,58 dtk, Berlin 2009 |
| 07 | EP07_PHELPS_MENANG_0_KOMA_01_DETIK | Phelps vs Čavić 0,01 dtk, Beijing 2008 |
| 08 | EP08_OWI_BUTET_EMAS_17_AGUSTUS_2016 | Owi/Butet emas Rio, 17 Agustus 2016 |
| 09 | EP09_BOBSLED_JAMAIKA_1988 | Bobsled Jamaika, Calgary 1988 |
| 10 | EP10_WILT_CHAMBERLAIN_100_POIN_1962 | Wilt Chamberlain 100 poin, 1962 |

## Alur
1. Riset tahap 2 dikerjakan subagent di sesi orkestrator → `research/SOURCE_REGISTER.md` + `RESEARCH_REPORT.md` tiap EP.
2. Produksi tahap 3–9 per episode di sesi sendiri (aplikasi maks 5 sesi sekaligus; mulai per slot kosong).
3. Satu-satunya gerbang: acc pengguna sebelum render final (tahap 9).

## Aturan batch
- Style + engine dipilih AI sendiri per topik (2D/3D), laporkan satu baris.
- Juri draf: 2 putaran maks; skor terbaik ≥ 3.5 → render final tanpa ganti style.
- Render: `--concurrency=2`, di background; final hanya setelah acc pengguna.
- Jam upload default = slot pertama `## Jadwal Upload (WIB)`.
- Akun: AUDIRA Sport Facts, @AudiraSportFacts.

## Status
- Riset: SELESAI 5/5 (2026-11-23). STATUS.json tahap research = done, catatan peringatan di note tiap EP.
  - EP06: 21 fakta/7 HIGH. 44,72 km/jam = rata-rata 60–80 m, bukan puncak.
  - EP07: 24 fakta/5 HIGH. Netral soal siapa menyentuh duluan.
  - EP08: 30 fakta/6 HIGH. "17 shuttle" hanya Kompas (MED).
  - EP09: 30 fakta/8 HIGH. Atlet berjalan di samping kereta (bukan memikul, itu film).
  - EP10: 30 fakta/7 HIGH. Klaim Bam Adebayo 83 poin (10 Mar 2026) perlu cek ulang.
- Produksi: 5 sesi dimulai 2026-11-23 atas perintah pengguna ("Gas, mulai 5"): local_44f358d4 (EP06), local_515b166b (EP07), local_bfccdf4a (EP08), local_9f8ade3f (EP09), local_57a57033 (EP10). Tiap sesi berhenti di gerbang acc render final.
- 2026-11-24: semua sempat berhenti (batas 5 jam / konteks). Dilanjutkan: EP06 s1 (local_44f358d4), EP07 s2 (local_11dd5e67), EP08 s2 (local_106831d3), EP09 s1 (local_9f8ade3f), EP10 s2 (local_c975ea6c, baru).
- Sesi aktif terkini (2026-11-24): EP06 s2 local_d75b981b, EP07 s2 local_11dd5e67, EP08 s2 local_106831d3, EP09 s2 local_262f3b3d, EP10 s2 local_c69c63e1. Duplikat EP10 s2 local_c975ea6c berhenti sendiri (tidak menulis file) — jangan dipakai.
