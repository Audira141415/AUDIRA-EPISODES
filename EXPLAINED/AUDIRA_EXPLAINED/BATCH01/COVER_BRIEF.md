# Brief cover topik Batch 1 (AUDIRA EXPLAINED)

Tugas: buat SATU still cover 1080×1920 untuk episodemu, dalam style yang sudah disetujui pengguna. Cover ini adalah "look development" dan nanti juga dipakai sebagai thumbnail sosial. Film lengkap BELUM dibuat sekarang.

Studio bersama (Remotion + React Three Fiber): `F:\AUDIRA-VIDEO-MOTION\EXPLAINED\AUDIRA_EXPLAINED\BATCH01\studio`
- Episode-mu ada di `src/scenes/<ep>/index.ts`. Ekspor `Cover` (wajib), dan biarkan `Film` + `TOTAL_SECONDS` tetap ada (placeholder boleh).
- Komposisi `<Ep>Cover` sudah terdaftar di `src/Root.tsx` (1080×1920, 30 frame, 30 fps). JANGAN ubah `Root.tsx`, `src/core`, `src/kits`, atau folder scene episode lain. Kalau butuh mengubah kode kit, salin ke folder scene-mu.
- Render: dari folder studio, `TEMP=F:/hf-render-tmp TMP=F:/hf-render-tmp node scripts/stills.mjs ../<EPFOLDER>/style/_cover 15 <Ep>Cover` lalu salin `f0015.png` ke `../<EPFOLDER>/style/cover-topic.png`.
- Typecheck hanya file-mu (kit lain memang punya error TS lama; abaikan yang bukan file-mu).

Wajib baca dulu (urut):
1. `F:\AUDIRA-SKILL-MOTION\SKILL.md` (bagian Determinism dan Production contract).
2. `F:\AUDIRA-SKILL-MOTION\references\<style>.md` dan `references\quality-gates.md`.
3. `src/kits/<style>/KIT.md` di studio, plus contoh kit-nya.
4. Quality bar: `F:\AUDIRA-SKILL-MOTION\references\quality-bar\<style>.*` (kalau ada) dan poster `F:\AUDIRA-VIDEO-MOTION\TECH\AUDIRA_STYLE_SHOWCASE_2026\deliver\poster\*-<style>.jpg` (kalau ada). Lihat gambarnya.
5. Riset episode: `../<EPFOLDER>/research/RESEARCH_REPORT.md` kalau sudah ada (riset sedang berjalan paralel). Pakai bagian "saran visual" supaya komponen yang digambar benar secara teknis. Kalau belum ada, ikuti deskripsi visual di bawah dan jangan menggambar detail teknis yang meragukan.

Isi cover:
- Objek/adegan hero topik yang langsung terbaca (lihat deskripsi episode). Bukan abstrak. Multi-plane: background, midground, foreground.
- Judul pendek berbahasa Indonesia (3–6 kata, besar, terbaca di HP) + baris kecil "AUDIRA EXPLAINED". Font & warna sesuai style. Teks di dalam safe zone: atas ≥180 px, bawah ≥380 px dari tepi; objek utama di 70% atas.
- Tanpa watermark besar. Tanpa wajah orang nyata. Tanpa logo merek/instansi resmi.
- Deterministik: semua dari `useCurrentFrame()`; tidak ada random tanpa seed.

Kualitas: lihat hasil still-mu sendiri (Read gambar PNG). Iterasi sampai sekelas quality bar style itu: komposisi kuat, pencahayaan bagus, bukan bentuk primitif polos. Maks ~6 iterasi.

Selesai: laporkan path `cover-topic.png`, 3 baris keputusan visual (palet, objek hero, kamera), dan apa yang masih lemah.
