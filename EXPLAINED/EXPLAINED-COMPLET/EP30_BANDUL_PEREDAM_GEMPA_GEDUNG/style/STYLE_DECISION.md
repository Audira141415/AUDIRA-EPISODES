# STYLE_DECISION — EP30_BANDUL_PEREDAM_GEMPA_GEDUNG

- **Gaya terpilih:** DISASTERSIM (lab simulasi bahaya yang tenang: model gedung terbelah di atas plinth batu tulis, lantai grid, debu halus, skala warna peringatan teal → kuning → oranye → merah-oranye).
- **Alasan:** topiknya peredam goyangan gedung terhadap angin dan gempa. Model gedung terbelah memperlihatkan lantai, bandul emas 41 lempeng, kabel, dan 8 peredam hidrolik sekaligus; meteran goyang berwarna peringatan membuat naik-turunnya goyangan terbaca tanpa suara. Nada kit "tenang, bukan sensasional" cocok dengan payoff "gedung jadi tenang".
- **Sumber:** `audira_recommend_style` peringkat #1 (skor 69.3, cocok topik "gempa"). Tidak sama dengan gaya 3 episode sebelumnya (dicek 2026-11-14: EP27 UKIYOFORGE, EP28 SATELLITEBRIEFING, EP29 NANOFORGE).
- **Alternatif ditolak:** TACTICBOARD (69.1, cocok hanya karena kata "bola"; papan taktik sepak bola tidak relevan); BUILDFORGE (52.2, gaya konstruksi gedung, tapi tidak punya bahasa visual bahaya/goyangan).
- **Memori gaya diterapkan:** wajib DOCUMENTARY_WARM, exposure 1, envIntensity 0.55 (`scene.environmentIntensity = 0.55`, grade hangat-netral). Hindari: benda putih yang bloom terlalu terang (bloom 0.35, threshold 0.86, beton krem, bukan putih).
- **Mesin:** HyperFrames + Three.js (pipeline seri), bukan Remotion.
- **Tanggal:** 2026-11-14
- **approved:** menunggu konfirmasi cover di gerbang render
- **Cover referensi:** `style/cover-reference.png` (quality-bar kit DISASTERSIM). Cover topik dibuat di gerbang render.
