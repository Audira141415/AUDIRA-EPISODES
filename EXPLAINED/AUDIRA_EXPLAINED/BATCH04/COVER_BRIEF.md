# Brief cover topik Batch 4 (AUDIRA EXPLAINED)

Tugas: buat SATU still cover 1080×1920 untuk episodemu, dalam style yang sudah disetujui pengguna. Cover ini adalah "look development" dan nanti juga dipakai sebagai thumbnail sosial. Film lengkap BELUM dibuat sekarang.

Studio bersama (Remotion + React Three Fiber): `F:\AUDIRA-VIDEO-MOTION\EXPLAINED\AUDIRA_EXPLAINED\BATCH04\studio`
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

## Tambahan Batch 4 (aturan CLAUDE.md terbaru)
- Studio Batch 4 dibuat dari starter v4.2: pasang `<Finish>` dari `src/core/render/Finish.tsx` di kanvas 3D-mu (reflections + AO + bloom + PBR Neutral + grade), kecuali style sengaja datar. Parameter awal dari motion memory style-mu (lead memberi di pesan). Latar terang (putih/krem/langit): exposure ~0.82, envIntensity ~0.25. Kit dengan `<color attach="background">` jangan diberi prop background. Logam/kaca wajib environment map.
- Cek framing 9:16: lebar terlihat = 2·d·tan(fov/2)·9/16 sebelum menulis kamera.
- Masukkan nama "AUDIRA" (atau "AUDIRA EXPLAINED") sebagai bagian dunia 3D di cover juga (plat/label/papan kecil), selain baris teks "AUDIRA EXPLAINED".
- Cek hasil lewat versi diperkecil (lebar 540) untuk hemat token; maks 4 iterasi.
- Lapor juga skor diri 1–5 untuk: lighting, material, depth, composition, motion (isi 3 untuk still), readability, dibanding quality-bar style itu.

## Tambahan Batch 4
- Studio dibuat ulang dari starter terbaru: ada `src/core/polish/Polish.tsx` (RoundedBoxGeo, POLISH.*, useSurfaceGrain, lifeMotion) dan `src/core/polish/Person.tsx` (ToyPerson, SwimCrowd). Pakai untuk objek/karakter utama; jangan boxGeometry + meshStandardMaterial polos. Manusia (bila perlu) = ToyPerson, bukan kapsul + stik.
- Logam/krom/plastik hitam glossy: `<Finish hdri="studio">` (atau warmStudio/sky).
- InstancedMesh: bangun + setColorAt di useMemo sebelum first draw (bug abu-abu di final Batch 3).
- Teks/angka di cover hanya fakta yang ada di RESEARCH_REPORT (riset sudah selesai, baca dulu, termasuk daftar JANGAN DIKLAIM).
