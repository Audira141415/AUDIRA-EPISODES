# STYLE_DECISION — EP45_DENMARK_JUARA_TANPA_LOLOS_1992

- Style terpilih: **PIXELSTORY** (dipilih pengguna 2026-11-22 lewat gerbang style sesi ini: "Ya, ganti kit")
- Engine: Remotion, kit `studio/src/kits/pixelstory` (pixel-art 2.5D: albedo dilukis lalu di-relight per frame)
- Alasan: tahun 1992 adalah era game 16-bit; kisah tim cadangan yang dipanggil 10 hari sebelum turnamen lalu juara terasa seperti game "pemain cadangan masuk, menang". Bahasa pixel memberi identitas yang beda dari cover seri lain.
- Alternatif ditolak:
  - PANELVERSE (pilihan awal): set kit hanya warung/kafe/jalan/taman/toko, tidak ada stadion atau bola — melanggar aturan seri (bola/piala/lapangan wajib jadi hero 3D) tanpa kerja engine baru.
  - STORYBOOK: buku cerita kertas cocok dengan julukan "dongeng", tapi kit belum pernah dipakai dan tidak punya set lapangan.
  - CINESTORY: world builder fleksibel, tapi belum pernah dipakai dan perlu verifikasi engine dulu.
- Rotasi seri: EP01–EP11 tidak memakai PIXELSTORY.
- Kelemahan tercatat yang diantisipasi: audit kit menahan lighting dan composition di plafon 3 (draft style-test 3.83 gagal). Antisipasi: satu sumber cahaya dominan (lampu stadion) + rim light, satu subjek utama (pemain dengan piala) di tengah, tanpa deretan objek setara.
- Cover referensi: `cover-reference.jpg` (salinan `F:/AUDIRA-SKILL-MOTION/references/quality-bar/pixelstory.jpg`)
- Cover topik: `cover-topic.png` (komposisi `Ep45Cover`, `studio/src/scenes/ep45/Cover.tsx`; dirender 2026-11-22, self-score 4.2 LOLOS)
- Tanggal: 2026-11-22
- approved: yes (style + cover topik disetujui pengguna 2026-11-22: "Setuju, lanjut naskah")
