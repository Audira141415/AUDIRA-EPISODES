# Brief cover topik — AUDIRA AI TUTORIAL 2026

Tugas: buat SATU still cover 1080×1920 untuk episodemu dalam style yang sudah dipilih pengguna. Cover ini adalah look development dan nanti dipakai sebagai thumbnail sosial. Film lengkap BELUM dibuat sekarang.

## Studio bersama
`F:\AUDIRA-VIDEO-MOTION\TECH\AUDIRA_AI_TUTORIAL_2026\studio` (Remotion 4 + React Three Fiber, starter v4.2).
- Episodemu ada di `src/scenes/<epNN>/`. Ganti isi `Cover.tsx` (ekspor `<EpNN>Cover` tetap sama). Boleh menambah file di folder itu. `index.ts` jangan diubah kecuali perlu.
- Komposisi `<EpNN>Cover` sudah terdaftar (1080×1920, 30 frame, 30 fps). JANGAN ubah `src/Root.tsx`, `src/core`, `src/kits`, atau folder scene episode lain. Kalau perlu mengubah kode kit, salin ke folder scene-mu.
- Render dari folder studio (Git Bash):
  `TEMP=F:/hf-render-tmp TMP=F:/hf-render-tmp node scripts/stills.mjs ../<EPFOLDER>/style/_cover 15 <EpNN>Cover`
  lalu salin `f0015.png` ke `../<EPFOLDER>/style/cover-topic.png`. Untuk cek cepat, pakai argumen skala `0.5`.
- Typecheck hanya file-mu (kit lain punya error TS lama; abaikan).
- 4 agen lain bekerja paralel di studio yang sama. Jangan menghapus `out/` atau file mereka.

## PENTING (batch 2, EP06–EP10)
- `node_modules` studio adalah junction bersama: cache webpack bisa merender kode LAMA. Render still lewat salinan pribadi `scripts/_stills-nocache-<epNN>.mjs` (salinan `stills.mjs` dengan `bundle({ entryPoint: ..., enableCaching: false })`; harus di folder `scripts/`). Hapus salinanmu setelah selesai.
- Riset batch 2: `F:\AUDIRA-VIDEO-MOTION\TECH\AUDIRA_AI_TUTORIAL_2026\research\TITLE_RESEARCH_BATCH2.md`.
- Episode batch 1 (ep01–ep05) sudah final: jangan sentuh folder scene mereka.

## Wajib baca dulu
1. `F:\AUDIRA-SKILL-MOTION\SKILL.md` (bagian Determinism dan Production contract).
2. `F:\AUDIRA-SKILL-MOTION\references\<style>.md` (kalau ada) dan `references\quality-gates.md`.
3. `src/kits/<style>/KIT.md` di studio plus contoh kit-nya.
4. Quality bar: cover referensi di `../<EPFOLDER>/style/cover-reference.*`. Lihat gambarnya.
5. Riset: `F:\AUDIRA-VIDEO-MOTION\TECH\AUDIRA_AI_TUTORIAL_2026\research\TITLE_RESEARCH.md` (bagian episodemu).
6. Motion memory: panggil MCP `audira_style_memory` `get` untuk style-mu dan untuk `GLOBAL`. Terapkan "wajib diterapkan" dan "parameter terbaik", hindari "hindari". Kalau tool MCP tidak tersedia, baca `F:\AUDIRA-ALL-SKILL\motion-memory\styles\<STYLE>.md` dan `GLOBAL.md`.

## Isi cover
- Objek atau adegan hero yang langsung terbaca sesuai deskripsi episode. Bukan abstrak. Multi-plane: background, midground, foreground.
- Judul pendek Bahasa Indonesia (diberikan di pesanmu; besar, terbaca di HP) + baris kecil **"AUDIRA AI TUTORIAL"**. Font dan warna sesuai style.
- Safe zone: teks ≥180 px dari atas dan ≥380 px dari bawah; headline kiri atas mulai di y ≥ 262 px. Objek utama di 70% atas.
- Nama "AUDIRA" juga muncul sebagai bagian dunia 3D (plat, label, papan kecil).
- Tanpa logo resmi Google, Gemini, NotebookLM, atau merek lain. Nama produk boleh ditulis sebagai teks biasa, dan antarmuka aplikasi digambar sebagai versi stilisasi generik (bukan tiruan persis).
- Tanpa wajah orang nyata. Manusia (bila perlu) = `<ToyPerson>` dari `src/core/polish/Person.tsx`, bukan kapsul + stik.
- Teks dan angka hanya fakta yang ada di TITLE_RESEARCH.md.
- Deterministik: semua dari `useCurrentFrame()`; tidak ada random tanpa seed.

## Finishing (starter v4.2)
- Pasang `<Finish>` dari `src/core/render/Finish.tsx` di kanvas 3D (reflections, AO, bloom, PBR Neutral, grade), kecuali style sengaja datar. Latar terang (putih/krem/kertas): exposure ~0.82, envIntensity ~0.25. Kit dengan `<color attach="background">` jangan diberi prop background. Logam/krom/plastik hitam glossy: `hdri="studio"` (atau `warmStudio`).
- Objek dan karakter utama: `src/core/polish/Polish.tsx` (`RoundedBoxGeo`, `POLISH.*`, `useSurfaceGrain`), bukan `boxGeometry` + `meshStandardMaterial` polos.
- InstancedMesh: bangun + `setColorAt` di `useMemo` sebelum first draw.
- Cek framing 9:16 sebelum menulis kamera: lebar terlihat = 2·d·tan(fov/2)·9/16.

## Kualitas
Lihat still-mu sendiri lewat versi diperkecil (lebar 540) untuk hemat token. Iterasi sampai sekelas cover referensi: komposisi kuat, cahaya bagus, bukan bentuk primitif polos. Maksimal 4 iterasi.

## Laporan akhir (singkat)
- Path `cover-topic.png`.
- 3 baris keputusan visual (palet, objek hero, kamera).
- Skor diri 1–5: lighting, material, depth, composition, motion (isi 3 untuk still), readability, dibanding cover referensi.
- Apa yang masih lemah.
Jangan memanggil `record_score`; lead yang mencatat skor.
