# STYLE_DECISION — EP72 Gempa Lisbon 1755

Style: MOSAICFORGE
- Engine: 3D Remotion + React Three Fiber (ENGINE_DECISION.md: remotion default).
- Alasan: azulejo, ubin biru-putih Portugal, adalah bahasa visual Lisbon sendiri. Tiap babak bencana bisa "dilukis" di panel ubin 3D yang retak (gempa), tersapu ubin biru (laut), dan menghitam/menyala (api), lalu ubin tersusun lagi jadi Baixa baru di payoff. Skor juri MOSAICFORGE rata-rata 4.0 (9 episode, EP46 Portugal lolos).
- Alternatif ditolak:
  - VINTAGEFORGE: nuansa gravure abad-18 cocok, tapi kurang khas Portugal dan payoff "ubin tersusun kembali" hilang.
  - DISASTERSIM: kuat untuk simulasi gelombang, tapi look teknis/modern tidak cocok untuk kisah sejarah 1755 dan kehilangan identitas budaya.
- Wajib dari motion memory: azulejo sebagai grid 3D per ubin (tilt/tone seeded, nat abu-abu #8F806B), exposure 0,84, envIntensity 0,4, finish DOCUMENTARY_WARM, AO on; semua teks di kartu solid kobalt #13306F (88%) dengan teks putih/oker, tanda TIDAK emisif di bawah bloom, teks ≥34 px pada lebar 1080; tokoh tanpa wajah = kain kepala bulat + bahu (material kain), bukan kerucut; gelapkan lantai dengan falloff lembut + haze di belakang subjek (jangan sembunyikan detail ubin).
- Kit bukan jebakan lingkungan: panel ubin dipakai sebagai lantai/dinding dan "lukisan" per babak, tapi lingkungan tiap adegan ikut fakta (gereja berlilin, pelabuhan Tejo, kota terbakar, lokasi konstruksi Baixa), dengan GLB katalog.
- Dipilih AI sendiri tanpa acc (keputusan pengguna 2026-11-23). Acc hanya di gerbang render final.
- Tanggal: 2026-11-24
- approved: yes (pilihan AI, dilaporkan satu baris)
- Cover referensi: style/cover-reference.png (quality-bar mosaicforge.png).
- Cover topik: style/cover-topic.png dirender di Sesi B (tahap 5–7) setelah scaffold proyek; belum ada.
