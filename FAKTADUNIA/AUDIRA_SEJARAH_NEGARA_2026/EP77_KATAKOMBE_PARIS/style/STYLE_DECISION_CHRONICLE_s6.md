# STYLE_DECISION — EP77 Katakombe Paris

Style: CHRONICLE
- Engine: 3D Remotion + React Three Fiber (look siluet dokumenter CHRONICLE: satu sumber cahaya rendah — lentera/lilin/obor — siluet hitam berkontur warna, kabut, grade ink-teal/amber).
- Alasan: kisah sejarah gelap di lorong bawah tanah paling aman dan paling kuat dibawakan sebagai siluet bercahaya lentera. Tengkorak dan tulang tampil sebagai relief/siluet artistik di dinding batu (bukan gore), prosesi gerobak malam dan pekerja tambang terbaca sebagai siluet. CHRONICLE termasuk 17 style unggulan, ada gold (fakta-olahraga-EP05 4.17), rata-rata juri final 3.83.
- Alternatif ditolak:
  - URBANFORGE: maket putih terang tidak cocok untuk lorong gelap; memori juri depth lemah (ceiling 3.5).
  - CINESTORY: rata-rata juri 3.5 (2 episode), belum terbukti.
- Implementasi: proyek berbasis starter EP72 (scripts render-final G18, sfx, stills, audit) + salin `F:/AUDIRA-SKILL-MOTION/kits/chronicle/project/src/kits/chronicle/` ke `project/src/kits/chronicle/` dan `src/film/fxextra.tsx` (Flames, Shafts, Candle). Pakai `ShotCanvas` + `Stage` + `Look` + `Figure` + `INK`.
- Wajib dari motion memory CHRONICLE: jangan percaya self (+0.43 bias); variasikan lokasi per beat (bukan satu set); sumber cahaya berarah + haze + rim + occluder FG; kontur warna per peran (INK.hero amber pekerja/inspektur, INK.grief violet untuk yang wafat); label ≥ 40 px, caption y 1300, kaki subjek ≤ 1290; pilih detik contact sheet setelah angka terkunci.
- Kit bukan jebakan lingkungan: adegan = jalan Paris runtuh, lorong tambang, pemakaman Saints-Innocents, prosesi gerobak malam, dinding tulang ossuarium, gerbang "empire de la Mort", pengunjung modern.
- Dipilih AI sendiri tanpa acc (keputusan pengguna 2026-11-23).
- Tanggal: 2026-11-25
- approved: yes (pilihan AI, dilaporkan satu baris)
- Cover referensi: `F:/AUDIRA-SKILL-MOTION/references/quality-bar/chronicle.jpg`. Cover topik dirender di sesi B setelah scaffold.
