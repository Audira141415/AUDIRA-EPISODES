# BATCH07 — Poles draf setelah juri buta r1 (2026-11-24, sesi 3)

Tujuan: draf lolos juri buta putaran 2 (terakhir): rata-rata ≥ 3.8, tidak ada aspek < 3. Juri r2 menilai `_sheet.jpg` baru tanpa tahu naskah.

## Aturan umum (semua EP)
- Baca dulu `EP_BRIEF.md` (perintah render, aturan GLB, multi-scene, kinetic HUD, G22) dan file episode yang ada. Lanjutkan dari kode yang ada di `studio/src/scenes/<ep>/`; jangan tulis ulang dari nol.
- JANGAN ubah VO, `timeline.json`, naskah, atau durasi. JANGAN render final 1080×1920. JANGAN panggil juri; skor sendiri saja (`audira_style_memory record_score judge self stage draft`).
- Channel EXPLAINED (rule 15): tanpa wajah orang nyata, tanpa logo nyata; setiap angka on-screen wajib cocok `research/SOURCE_REGISTER.md`.
- **Counter angka**: nilai akhir harus sudah tampil saat VO mengucapkan angkanya. Ramp maks 0,6 dtk dan selesai paling lambat di awal kata angka (mulai ramp lebih awal). Juri r1 menangkap counter di tengah naik di beberapa EP; ini dihitung sebagai angka salah.
- Leader line, garis kursor, dan watermark tidak boleh memotong caption atau kartu judul. Label/tag kecil opacity penuh dengan chip latar gelap.
- Cahaya: key light berarah (rendah, hangat/sesuai style), bayangan kontak + AO, kabut jarak untuk memisahkan latar. Material: beton bertekstur/roughness bervariasi, logam memantul, air memantul + riak + tint kedalaman; hindari plastik polos.
- Render ulang contact sheet di **detik yang sama** seperti sheet r1 (lihat `draft/THEME_CHECK.md`), kecuali satu frame perlu digeser sedikit agar counter final terbaca — catat bila digeser. Bila ada perubahan kamera di rentang RISK_CLIP, render ulang klip + `audit:camera`.
- `npm run audit:visual` pada sheet baru → simpan ceilings di `draft/` (nama file sama seperti sebelumnya).
- Perbarui `draft/THEME_CHECK.md` (kolom Subjek di layar).
- stills.mjs kadang gagal bila agen lain render bersamaan (folder `.audira` bersama) → ulangi saja.
- Hapus folder iterasi sementara.

## Laporan balik (singkat)
Path sheet baru, frame yang berubah dan apa yang diperbaiki, skor diri 6 aspek, camera.json bila diulang, ceilings, kelemahan yang masih tersisa. Jangan klaim render sukses tanpa cek file.
