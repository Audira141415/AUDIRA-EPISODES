# Brief cover topik — AUDIRA ASAP KARHUTLA ISPA 2026

Tugas: buat SATU still cover 1080×1920 untuk episodemu dalam style yang sudah dipilih pengguna. Cover ini adalah look development dan nanti dipakai sebagai thumbnail sosial. Film lengkap BELUM dibuat sekarang. Ini berita bencana yang menimpa orang sungguhan: nada serius dan faktual, bukan sci-fi atau sensasional.

## Studio bersama
`F:\AUDIRA-VIDEO-MOTION\EXPLAINED\AUDIRA_ASAP_KARHUTLA_ISPA_2026\studio` (Remotion 4 + React Three Fiber, starter v4.3; node_modules = junction ke `_cache/remotion-r3f`).
- Episodemu ada di `src/scenes/<epNN>/`. Ganti isi `Cover.tsx` (ekspor `Ep<NN>Cover` tetap sama). Boleh menambah file di folder itu. `index.ts` jangan diubah kecuali perlu.
- Komposisi `Ep<NN>Cover` sudah terdaftar (1080×1920, 30 frame, 30 fps). JANGAN ubah `src/Root.tsx`, `src/core`, `src/kits`, atau folder scene episode lain. Kalau perlu mengubah kode kit, salin ke folder scene-mu.
- Render dari folder studio (Git Bash). `scripts/stills.mjs` sudah memakai `enableCaching: false`:
  `TEMP=F:/hf-render-tmp TMP=F:/hf-render-tmp node scripts/stills.mjs ../<EPFOLDER>/style/_cover 15 Ep<NN>Cover`
  lalu salin `f0015.png` ke `../<EPFOLDER>/style/cover-topic.png`. Cek cepat: argumen skala `0.5` bila skrip mendukungnya (baca skripnya).
- Typecheck hanya file-mu (kit lain bisa punya error TS lama; abaikan).
- 4 agen lain bekerja paralel di studio yang sama. Jangan menghapus `out/` atau file mereka.

## Wajib baca dulu
1. `F:\AUDIRA-SKILL-MOTION\SKILL.md` (bagian Determinism dan Production contract).
2. `F:\AUDIRA-SKILL-MOTION\references\<style>.md` (kalau ada) dan `references\quality-gates.md`.
3. `src/kits/<style>/KIT.md` di studio plus contoh kit-nya (`src/kits/<style>/example/`).
4. Quality bar: `../<EPFOLDER>/style/cover-reference.*`. Lihat gambarnya.
5. Riset episodemu: `../<EPFOLDER>/research/RESEARCH_REPORT.md` (bagian fakta, risiko, ide visual).
6. Motion memory: MCP `audira_style_memory` `get` untuk style-mu dan `GLOBAL`. Terapkan "wajib diterapkan" dan "parameter terbaik", hindari "hindari". Kalau tool MCP tidak ada, baca `F:\AUDIRA-ALL-SKILL\motion-memory\styles\<STYLE>.md` dan `GLOBAL.md`.

## Isi cover
- Objek/adegan hero yang langsung terbaca sesuai topik (peta Papua, asap, titik panas, paru-paru, dsb.). Bukan abstrak. Multi-plane: background, midground, foreground.
- Judul pendek Bahasa Indonesia (diberikan di pesanmu; besar, terbaca di HP) + baris kecil **"AUDIRA · ASAP & ISPA"**. Font dan warna sesuai style.
- Safe zone: teks ≥180 px dari atas dan ≥380 px dari bawah; headline kiri atas mulai di y ≥ 262 px. Objek utama di 70% atas.
- Nama "AUDIRA" juga muncul sebagai bagian dunia 3D (label HUD, tag peta, plat kecil).
- Peta: bentuk pulau/provinsi harus dikenali (Papua, Sumatra, Semenanjung Malaysia). Kalau tidak bisa akurat, pakai bentuk sederhana yang tetap mirip, beri label nama tempat.
- Tanpa wajah orang nyata dan tanpa foto. Manusia (bila perlu) = `<ToyPerson>` dari `src/core/polish/Person.tsx`, bukan kapsul + stik. Tanpa wajah anak sama sekali.
- Teks dan angka hanya fakta HIGH dari RESEARCH_REPORT.md, dengan kata yang benar ("kasus", bukan "orang"; "berpotensi" bila itu proyeksi).
- Tanpa logo instansi (BNPB, BMKG, Kemenkes) atau media.
- Deterministik: semua dari `useCurrentFrame()`; tidak ada random tanpa seed.

## Finishing
- Pasang `<Finish>` dari `src/core/render/Finish.tsx` di kanvas 3D kecuali style sengaja datar; pakai parameter terbaik dari memori style. Kit dengan `<color attach="background">` jangan diberi prop background.
- Objek utama: `src/core/polish/Polish.tsx` (`RoundedBoxGeo`, `POLISH.*`, `useSurfaceGrain`), bukan `boxGeometry` + `meshStandardMaterial` polos.
- InstancedMesh: bangun + `setColorAt` di `useMemo` sebelum first draw.
- Cek framing 9:16 sebelum menulis kamera: lebar terlihat = 2·d·tan(fov/2)·9/16.
- three r186: set `scene.environmentIntensity` ke envIntensity style (bukan material.envMapIntensity).

## Kualitas
Lihat still-mu lewat versi diperkecil (lebar 540) untuk hemat token. Iterasi sampai sekelas cover referensi: komposisi kuat, cahaya bagus, bukan bentuk primitif polos. Maksimal 4 iterasi.

## Laporan akhir (singkat)
- Path `cover-topic.png`.
- 3 baris keputusan visual (palet, objek hero, kamera).
- Skor diri 1–5: lighting, material, depth, composition, motion (isi 3 untuk still), readability, dibanding cover referensi.
- Apa yang masih lemah.
Jangan memanggil `record_score`; lead yang mencatat skor. Jangan ubah STATUS.json atau STYLE_DECISION.md.
