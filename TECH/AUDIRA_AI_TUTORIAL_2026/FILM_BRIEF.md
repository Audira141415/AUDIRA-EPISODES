# Brief film lengkap — AUDIRA AI TUTORIAL 2026

Style, cover topik, naskah, dan VO sudah DISETUJUI pengguna. Sekarang bangun film penuh episodemu di studio bersama, memakai dunia dan aset dari cover-mu (`src/scenes/<epNN>/Cover.tsx` dan file pendampingnya). Bahasa layar: Indonesia. Ini seri TUTORIAL: penonton harus bisa mengikuti langkahnya.

Studio: `F:\AUDIRA-VIDEO-MOTION\TECH\AUDIRA_AI_TUTORIAL_2026\studio` (Remotion 4 + R3F, starter v4.2). Komposisi `<EpNN>Preview` (540×960@30) dan `<EpNN>Final` sudah terdaftar dan sudah dibungkus AudiraSignature di `Root.tsx`.

## Masukan (jangan diubah)
- `studio/src/scenes/<epNN>/timeline.json`: Audio Master Clock. `total` = durasi film (detik). `sections` = {hook, konteks, langkah, penjelasan, payoff, outro: [start, end]} dalam detik VO. `clips[].words[]` = {w, s, e} per kata (teks layar sudah benar). Semua cut, beat animasi, dan caption WAJIB berpatokan ke detik ini (baca JSON-nya, jangan tebak angka).
- `studio/public/audio/<epNN>/vo.wav`: VO final. JANGAN masukkan audio ke komposisi; lead yang mux audio.
- Naskah: bagian episodemu di `../SCRIPTS_DRAFT.md`. Riset: `../research/TITLE_RESEARCH.md` + `../research/SOURCE_REGISTER.md`. Klaim di layar hanya yang ada di naskah/riset.
- Cover-mu: `../<EPFOLDER>/style/cover-topic.png`, keputusan style: `../<EPFOLDER>/style/STYLE_DECISION.md`.

## Keluaran
1. `studio/src/scenes/<epNN>/index.ts` mengekspor `Film`, `Cover` (hasil cover jangan berubah), dan `TOTAL_SECONDS` = `timeline.total` (impor dari JSON).
2. `../<EPFOLDER>/STORYBOARD.md`: tabel shot (detik mulai–selesai, bagian naskah, visual, gerak kamera, layer, teks layar, SFX yang disarankan + detik).
3. `../<EPFOLDER>/sfx-cues.json`: `[{"t": detik, "type": "whoosh|impact|pop|click|riser|glitch", "gain": 0.0-1.0}]`, maks ~14 cue, di transisi, klik tombol, dan momen kunci.
4. DRAF = CONTACT SHEET, BUKAN FILM. Jangan render film utuh dan jangan render resolusi penuh.
   - Contact sheet 8 frame kunci (hook, tengah tiap section, payoff, outro) di 540×960:
     `TEMP=F:/hf-render-tmp TMP=F:/hf-render-tmp node scripts/_stills-nocache-<epNN>.mjs ../<EPFOLDER>/draft/stills <detik,...> <EpNN>Preview` → `_sheet.jpg`.
   - Satu klip MP4 15–20 dtk dari bagian paling berisiko (gerak kamera/transisi tersulit):
     `TEMP=F:/hf-render-tmp TMP=F:/hf-render-tmp npx remotion render <EpNN>Preview ../<EPFOLDER>/draft/RISK_CLIP_silent.mp4 --frames=<a>-<b> --concurrency=4 --log=error --bundle-cache=false`.
   - Cek lewat versi diperkecil (lebar ±1200 px untuk sheet). Jangan baca banyak still terpisah.

## PENTING: cache webpack bersama
`node_modules` studio adalah junction ke studio lain, jadi cache webpack bisa merender kode LAMA. Selalu render still lewat salinan pribadi `scripts/_stills-nocache-<epNN>.mjs` (salinan `stills.mjs` dengan `bundle({ entryPoint: ..., enableCaching: false })`; salinan harus di folder `scripts/`, bukan folder lain). Untuk `npx remotion render` pakai `--bundle-cache=false`. Hapus salinanmu setelah selesai. 4 agen lain bekerja paralel; jangan sentuh file mereka.

## Tutorial: wajib terlihat
- Tiap langkah di naskah punya visual langkah yang jelas: panel antarmuka GENERIK bergaya style-mu (bukan tiruan persis aplikasi, tanpa logo Google/Gemini/NotebookLM) dengan tombol berlabel sesuai naskah (mis. "Studio", "Slide Deck", "Create video", "Add image", "Add files", "More tools", "Guided Learning"), kursor/jari yang menekan, dan nomor langkah besar (1, 2, 3…).
- Contoh perintah yang dibacakan VO muncul sebagai teks yang diketik (typewriter) di kotak chat/prompt stilisasi.
- Peringatan (18+, AI bisa salah, izin foto, "tidak terdeteksi ≠ asli") tampil sebagai kartu peringatan singkat yang terbaca.

## Aturan visual (Anti-PPT)
- Tiap section punya beberapa shot; kamera selalu bergerak halus (dolly/orbit/crane) dan transisi bermakna (match cut, zoom-through, potongan menembus objek), bukan slide. Multi-plane: BG, midground, foreground, HUD/label, caption.
- Mute test: tanpa suara, penonton tetap paham urutan langkahnya.
- Hook 0–3 detik: gambar paling kuat langsung, tanpa logo/intro.
- Safe zone 1080×1920: teks ≥180 px atas, ≥380 px bawah (skala `useVideoConfig().width/1080`). Headline kiri atas mulai y ≥ 262 px (AudiraSignature). Objek utama di 70% atas.
- Caption karaoke per kata dari `timeline.json`: frasa ≤4 kata satu baris, >4 kata dua baris seimbang (3/3, 4/3, 3/2), jangan sisakan 1 kata sendirian; kata aktif menyala (aksen style-mu) dengan micro-bounce; di atas batas 380 px bawah. Gaya caption sesuai style episodemu.
- Outro: di detik `sections.outro[1] + 0.2` pasang `<Outro start={...} />` dari `../_shared/Outro.tsx` sebagai layer paling atas (jangan diubah) sampai `total`. JANGAN pasang AudiraSignature sendiri.
- Nama AUDIRA di dalam adegan (sudah ada di cover-mu): tampilkan di film minimal sekali ≥2 dtk dalam safe zone.
- Tanpa logo merek nyata, tanpa wajah orang nyata. Manusia = `<ToyPerson>` (atau salinan lokalmu dari cover).
- Deterministik (`useCurrentFrame`, seed tetap). Jangan ubah `Root.tsx`, `src/core`, `src/kits`, `_shared`, atau scene episode lain.
- Pakai `<Finish>` dengan parameter yang sama seperti cover-mu. Poles objek dengan `src/core/polish/Polish.tsx`. InstancedMesh: bangun + `setColorAt` di `useMemo` sebelum first draw.
- Performa: preview 540×960@30 harus bisa dirender < ~15 menit.

## Nilai diri
Setelah contact sheet jadi, nilai 6 aspek (lighting, material, depth, composition, motion, readability; 1–5) dibanding cover-mu dan cover referensi. Kalau rata-rata < 4 atau ada aspek < 3, poles aspek lemah dan render ulang sheet sebelum lapor (maks 2 putaran). Jangan memanggil `record_score`.

## Lapor (singkat)
Path `_sheet.jpg` + `RISK_CLIP_silent.mp4` (rentang detik), durasi komposisi, daftar shot singkat, skor diri, dan apa yang masih lemah. Jangan klaim render sukses tanpa cek file.

## PENTING (batch 2, EP06–EP10)
- Naskah: `../SCRIPTS_DRAFT_B2.md` (bukan SCRIPTS_DRAFT.md). Riset: `../research/TITLE_RESEARCH_BATCH2.md` + `SOURCE_REGISTER.md` (S12–S16).
- Episode batch 1 (ep01–ep05) sudah final: jangan sentuh folder scene, file, atau `scripts/` milik mereka.
- Contoh kode film yang sudah lolos: `src/scenes/ep01/Film.tsx` s.d. `ep05/Film.tsx` (boleh dibaca untuk pola caption, Outro, timeline; jangan disalin mentah, style-mu berbeda).
- Label tombol di layar memakai nama Inggris persis seperti di naskah (mis. "Upload & tools", "Create music", "Add Files", "Canvas", "Preview", "Code", "Show console", "Select & ask", "Share & export", "Live", "Turn on video streaming", "Turn on screen sharing", "End", "Deep Research", "Edit plan", "Start research", "Open", "Audio Overview", "Settings & help", "Activity", "Delete", "Turn off and delete activity").
