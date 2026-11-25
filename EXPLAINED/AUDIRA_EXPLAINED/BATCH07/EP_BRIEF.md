# Brief episode Batch 7 (AUDIRA EXPLAINED) — cover + film + draf

Kamu menggarap SATU episode dari awal look-dev sampai draf contact sheet. Style dan naskah sudah dipilih; VO sudah dikunci. Bahasa layar: Indonesia. Jangan render resolusi penuh, jangan render film utuh.

## Lokasi
- Batch: `F:\AUDIRA-EPISODES\EXPLAINED\AUDIRA_EXPLAINED\BATCH07`, folder episode `<EPFOLDER>` (lead memberi di pesan).
- Studio bersama (Remotion 4 + React Three Fiber): `BATCH07\studio`. Root sudah mendaftarkan `Ep060/063/064/067/068 Cover|Preview|Final` dan membungkus Film dengan `AudiraSignature` (jangan pasang sendiri).
- Hanya sentuh `studio/src/scenes/<ep>/` milikmu, file di `<EPFOLDER>/`, dan GLB yang kamu salin ke `studio/public/models/polyfork/`. JANGAN ubah `Root.tsx`, `src/core`, `src/kits`, `src/scenes/_shared`, atau episode lain. Butuh ubah kode kit → salin ke folder scene-mu.
- Agen lain mengerjakan episode lain paralel di studio yang sama. Render gagal karena file episode lain rusak sementara → tunggu sebentar, coba lagi; jangan sentuh file mereka.
- Placeholder sekarang: `src/scenes/<ep>/index.ts` + `timing.ts` (helper SEC, CL, TOTAL, wordT dari `timeline.json`). Ganti isinya; tetap ekspor `Cover`, `Film`, `TOTAL_SECONDS` (= `timeline.total`).

## Wajib baca dulu (urut, hemat: bagian relevan saja)
1. `F:\AUDIRA-SKILL-MOTION\SKILL.md` (Determinism + Production contract).
2. `F:\AUDIRA-SKILL-MOTION\references\<style>.md` dan `references\quality-gates.md`.
3. `studio/src/kits/<style>/KIT.md` + contoh kit-nya.
4. Quality bar: `F:\AUDIRA-SKILL-MOTION\references\quality-bar\<style>.*` (lihat gambarnya, versi kecil).
5. `<EPFOLDER>/research/RESEARCH_REPORT.md` — patuhi "JANGAN DIKLAIM" dan "Saran visual akurat". Teks/angka di layar hanya fakta dari riset/naskah.
6. `<EPFOLDER>/SCRIPT.md` dan `studio/src/scenes/<ep>/timeline.json` (Audio Master Clock: `total`, `sections` HOOK/KONTEKS/MEKANISME/REVEAL/PAYOFF/OUTRO, `clips[].words[]` {w,s,e}). Semua cut, beat, caption berpatokan ke detik ini (baca JSON, jangan tebak).

## A. Cover topik (look development)
- Satu still 1080×1920: objek hero topik langsung terbaca, multi-plane (BG/MG/FG). Judul 3–6 kata besar + baris kecil "AUDIRA EXPLAINED". Teks mulai y ≥ 262 px, bawah ≥ 380 px bersih; objek utama di 70% atas, mengisi 50–70% tinggi frame.
- Nama "AUDIRA" juga sebagai bagian dunia 3D (plat/papan/label kecil).
- Render: dari studio `TEMP=F:/hf-render-tmp TMP=F:/hf-render-tmp node scripts/stills.mjs ../<EPFOLDER>/style/_cover 15 <Ep>Cover` → salin `f0015.png` ke `../<EPFOLDER>/style/cover-topic.png`. Cek versi lebar 540; maks 4 iterasi. Hapus `style/_cover` setelah selesai.

## B. Film
### Hukum wajib (CLAUDE.md, tidak bisa ditawar)
1. **Model 3D nyata (.glb)** untuk objek utama bila katalog punya yang cocok: cari dengan MCP `audira_search_assets` (action search/topic), file ada di `E:/ASET/ASSET-AUDIRA/downloads/glb/<type>/<id>.glb`; salin yang dipakai ke `studio/public/models/polyfork/<id>.glb` lalu `<AssetModel id="<id>" size={..} ground polish=".." fallback={..} />` (`src/core/assets`). Struktur teknis khusus yang tak ada di katalog (tiang pancang, rangka atap kabel, terowongan, pipa jacking, lapisan tanah) boleh dibangun prosedural dengan `src/core/polish/Polish.tsx` (RoundedBoxGeo, POLISH.*, useSurfaceGrain) — bentuknya harus benar secara teknis menurut riset. DILARANG visual utama berupa partikel `Points`, `LineSegments` acak, atau `<boxGeometry>` polos. Manusia = `<ToyPerson>` (`src/core/polish/Person.tsx`).
2. **Multi-scene, 5–6 adegan berbeda**: tiap section naskah (HOOK, KONTEKS, MEKANISME, REVEAL, PAYOFF, OUTRO) punya adegan/lingkungan/objek utama yang berganti atau bertransformasi total sesuai yang diucapkan VO. Memutar kamera mengelilingi satu objek BUKAN multi-scene. Arsitektur kode: director per waktu, contoh `{t < SEC.KONTEKS[0] && <SceneHook/>}` … dst., tiap adegan komponen sendiri.
3. **Kinetic HUD callout**: setiap angka, tahun, nama tempat/proyek, atau istilah kunci yang diucapkan VO → kartu grafis/callout kinetik di area tengah/atas (bukan hanya caption), muncul tepat di detik kata itu (`wordT`). Chip/teks HUD ≥ 34 px pada 1080 lebar (skala `width/1080`), kontras tinggi (kartu gelap rgba(…,0.82) di latar terang).
4. **Style = shader/mood, bukan lingkungan**: lingkungan mengikuti fakta topik (laut, stadion, rawa/landasan, pegunungan/terowongan, jalan kota bawah tanah).
5. **G22 keselarasan**: subjek di layar = kata VO saat itu. Mute test: tanpa suara, urutan mekanisme tetap terbaca.

### Aturan visual
- Hook 0–3 dtk: gambar paling kuat langsung, tanpa logo/intro.
- Kamera selalu bergerak halus kontinu tiap shot (dolly/orbit/crane, `src/core/camera/moves.ts`, `fitDistance`); transisi bermakna (match cut, zoom-through), bukan slide. Jenis shot beda antar beat bersebelahan. Ambang G13: deadPct ≤ 5%, longestHold ≤ 1.5 dtk.
- `<Finish>` (`src/core/render/Finish.tsx`) dengan parameter style dari lead; logam/kaca wajib env map; latar terang: exposure ~0.82, envIntensity ~0.25. Cek framing 9:16: lebar terlihat = 2·d·tan(fov/2)·9/16.
- InstancedMesh: bangun + setColorAt di useMemo sebelum first draw.
- Caption karaoke per kata dari `timeline.json` (teks display sudah benar): ≤4 kata satu baris, >4 kata dua baris seimbang, tanpa satu kata yatim; kata aktif warna aksen, bounce ≤ 1.04, gap kata ≥ 22 px; posisi di atas batas 380 px bawah (sekitar y=1300). Gaya caption sesuai style.
- Nama AUDIRA di dalam adegan film minimal sekali ≥ 2 dtk di safe zone.
- Outro: `<Outro start={SEC.OUTRO[1] + 0.2} />` dari `../_shared/Outro.tsx` sebagai layer paling atas sampai `total`. VO sudah memuat "Ini Audira Explained." (caption tampil "AUDIRA").
- Tanpa logo instansi/merek nyata, tanpa wajah orang nyata. Deterministik (`useCurrentFrame`, seed tetap, tanpa Math.random).
- JANGAN masukkan audio ke komposisi (lead mux terpisah).
- Performa: preview 540×960@30 harus wajar; hindari post berat per frame.

## C. Keluaran
1. `<EPFOLDER>/STORYBOARD.md`: tabel ≥ 6 baris `Scene | Waktu (dtk VO) | BG/MG/FG/HUD | Kamera | Audio` (Audio = momen SFX: whoosh di potongan, pop teks, satu riser + satu impact di payoff), plus baris `Style: <ID>`.
2. `<EPFOLDER>/sfx-cues.json`: `[{"t": detik, "type": "whoosh|impact|pop|click|riser|glitch", "gain": 0.0-1.0}]`, maks ~14 cue.
3. DRAF = CONTACT SHEET: 8 frame kunci (hook, tengah tiap section, payoff, outro) di 540×960: `TEMP=F:/hf-render-tmp TMP=F:/hf-render-tmp node scripts/stills.mjs ../<EPFOLDER>/draft/stills <detik,...> <Ep>Preview` → `_sheet.jpg` (jangan tambah argumen ke-4). Cek versi lebar ±1200 px.
4. Satu klip risiko 15–20 dtk: `npx remotion render <Ep>Preview ../<EPFOLDER>/draft/RISK_CLIP_silent.mp4 --frames=<a>-<b> --concurrency=4 --log=error`, lalu `npm run audit:camera -- ../<EPFOLDER>/draft/RISK_CLIP_silent.mp4 --json=../<EPFOLDER>/draft/camera.json`.
5. `npm run audit:visual` pada sheet bila tersedia (lihat package.json) → simpan ceilings.
6. `<EPFOLDER>/draft/THEME_CHECK.md` (G22): tabel per frame sheet `Frame | Detik | Kata VO | Subjek di layar | Cocok (ya/tidak)`; semua harus `ya`.
7. Nilai diri 6 aspek (lighting, material, depth, composition, motion, readability; 1–5) dibanding quality-bar. Rata-rata < 4 atau ada aspek < 3 → poles, render ulang sheet (maks 2 putaran poles).
8. Hapus folder iterasi sementaramu; sisakan `style/cover-topic.png`, `draft/stills/_sheet.jpg` + frame, `draft/RISK_CLIP_silent.mp4`, `draft/camera.json`.

## Lapor (singkat, ≤ 25 baris)
Path cover + `_sheet.jpg` + RISK_CLIP (rentang detik), durasi komposisi, daftar adegan (5–6) dengan detik, GLB yang dipakai (id), skor diri 6 aspek, ringkasan camera.json (score, deadPct, medianSpeed), ceilings audit:visual, dan apa yang masih lemah. Jangan klaim render sukses tanpa cek file.
