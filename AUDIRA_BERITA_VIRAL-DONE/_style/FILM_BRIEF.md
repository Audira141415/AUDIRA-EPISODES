# Brief film lengkap — AUDIRA BERITA VIRAL 10 NOV 2026 (lanjutan dari cover topikmu)

Cover (2026-11-10), naskah, dan VO (2026-11-11) sudah DISETUJUI pengguna. Sekarang bangun film penuh episodemu di studio bersama, memakai dunia/aset dari cover-mu. Ini berita viral tentang orang dan lembaga sungguhan: nada faktual, tenang, tidak memihak. Bahasa layar: Indonesia.

Studio: `F:\AUDIRA-VIDEO-MOTION\AUDIRA_BERITA_VIRAL_10_NOV_2026\studio` (Remotion 4 + R3F, starter v4.3). Folder episodemu: `F:\AUDIRA-VIDEO-MOTION\AUDIRA_BERITA_VIRAL_10_NOV_2026\<EPFOLDER>`. 3 agen lain bekerja paralel di studio yang sama.

## Masukan (jangan diubah)
- `studio/src/scenes/<epNN>/timeline.json`: Audio Master Clock. `total` = durasi film (detik, VO + 4 dtk outro). `sections` = {HOOK, KONTEKS, PENGEMBANGAN, PENJELASAN, PAYOFF, OUTRO: [start,end]} dalam detik. `clips[].words[]` = {w, s, e} per kata (teks layar sudah benar: angka berdigit, singkatan asli, "AUDIRA."). Semua cut, beat animasi, dan caption WAJIB berpatokan ke detik ini (impor JSON-nya; jangan hardcode angka tebakan). Contoh pola: `studio`-mu belum punya; lihat `F:\AUDIRA-VIDEO-MOTION\EXPLAINED\AUDIRA_EXPLAINED\BATCH05\studio\src\scenes\ep062\Film.tsx` (fungsi `W(id,i)`, `seg`, `win`) — pola saja, jangan tiru tampilannya.
- `studio/public/audio/<epNN>/vo.wav`: VO final. JANGAN masukkan audio ke komposisi; audio (VO+musik+SFX) dimux terpisah oleh lead.
- `../<EPFOLDER>/docs/SCRIPT.md` (naskah per bagian; tokoh di layar ada di prompt-mu) dan `../<EPFOLDER>/research/RESEARCH_REPORT.md` (ide visual, risiko, JANGAN DIKLAIM): patuhi.

## Keluaran
1. `studio/src/scenes/<epNN>/index.ts` mengekspor `Film`, `Cover` (hasil Cover TIDAK boleh berubah), dan `TOTAL_SECONDS` = `timeline.total` (impor dari JSON). Film boleh dipecah ke file lain di folder scene-mu.
2. `../<EPFOLDER>/docs/STORYBOARD.md`: tabel shot (detik mulai–selesai, bagian naskah, visual, gerak kamera, layer, teks layar, SFX yang disarankan).
3. `../<EPFOLDER>/audio/sfx-cues.json`: `[{"t": detik, "type": "whoosh|impact|pop|click|riser|glitch|ping|chime", "gain": 0.0-1.0}]`, maks ~14 cue, di transisi dan momen kunci. Nada berita: hemat impact.
4. DRAF = CONTACT SHEET, BUKAN FILM. Jangan render film utuh dan jangan render resolusi penuh.
   - Contact sheet 8 frame kunci (hook, tengah tiap section, payoff, outro) di 540×960, dari folder studio (Git Bash):
     `RENDER_TMPDIR=F:/render-tmp TEMP=F:/hf-render-tmp TMP=F:/hf-render-tmp node scripts/stills.mjs ../<EPFOLDER>/draft/stills <detik,...> Ep<NN>Preview` → `_sheet.jpg`. Argumen ke-4 = scale; jangan isi `--log=error`. Detik pakai akhiran `s` (mis. `2.5s,12s`).
   - Satu klip MP4 bisu 15–20 dtk dari bagian paling berisiko (gerak kamera/transisi tersulit):
     `RENDER_TMPDIR=F:/render-tmp TEMP=F:/hf-render-tmp TMP=F:/hf-render-tmp npx remotion render Ep<NN>Preview ../<EPFOLDER>/draft/RISK_CLIP_silent.mp4 --frames=<a>-<b> --concurrency=4 --log=error` (frame @30 fps).
   - Lihat sheet lewat versi diperkecil (lebar ±1200 px). Hemat token: jangan baca banyak still terpisah.

## Aturan visual (Anti-PPT)
- Tiap section punya beberapa shot; kamera selalu bergerak halus (dolly/orbit/crane) dan transisi bermakna (match cut, zoom-through, menembus asap/objek), bukan slide. Multi-plane: BG, midground, foreground, HUD/label, caption.
- Mute test: tanpa suara, penonton tetap paham tiap kalimat VO (siapa, di mana, angka berapa, apa artinya). Objek dulu, teks kedua; label pendek.
- Hook 0–3 dtk: gambar paling kuat langsung (sekuat cover), tanpa logo/intro. Frame 0 = thumbnail.
- Safe zone 1080×1920 (skala `useVideoConfig().width/1080`): teks ≥180 px dari atas, kicker kiri-atas mulai y ≥ 262 px (AudiraSignature di y≈221), bawah 380 px kosong. Objek utama di 70% atas.
- Caption karaoke per kata dari `timeline.json`: ≤4 kata satu baris, >4 kata dua baris seimbang, jangan satu kata sendirian; kata aktif menyala (aksen style-mu) dengan bounce ≤1.04; gap antar kata ≥22 px (kata aktif membesar memakan spasi). Posisi di atas batas 380 px bawah (atas caption ±1290 px). Gaya caption mengikuti style episodemu (tiap episode beda).
- Tokoh yang disebut di prompt-mu: tampilkan kartu nama (nama + jabatan) saat namanya diucapkan, dengan bahasa visual cover-mu (figur sketsa/potongan kertas, plakat, siluet, atau ikon). Jangan meniru wajah orang nyata, jangan foto.
- Kutipan langsung hanya yang ada di naskah. Tanpa logo instansi, bank, perusahaan, atau media (MA, MK, DPR, OJK, BSSN, FortiGuard, Rockstar, PlayStation, Xbox, BNI); tulis namanya sebagai teks biasa. EP05: tanpa aset/logo/karakter GTA.
- Outro: di detik `sections.OUTRO[1] + 0.2` pasang `<Outro start={...} />` dari `../_shared/Outro.tsx` sebagai layer paling atas sampai `total` (kartu AUDIRA; jangan diubah, jangan bikin logo sendiri).
- Nama AUDIRA di dalam adegan (sudah ada di cover-mu): tampilkan lagi di film minimal sekali ≥2 dtk, di dalam safe zone.
- JANGAN pasang AudiraSignature sendiri: lead sudah membungkusnya di Root.tsx.
- Chip kecil "ILUSTRASI" saat adegan merekonstruksi kejadian nyata (pertemuan di Istana, serangan, unduhan).

## Teknis
- Pakai `<Finish>` (`src/core/render/Finish.tsx`) dengan parameter sama seperti cover-mu (kecuali style sengaja datar). three r186: set `scene.environmentIntensity`, bukan `material.envMapIntensity`.
- Poles objek utama dengan `src/core/polish/Polish.tsx` (`RoundedBoxGeo`, `POLISH.*`, `useSurfaceGrain`, `lifeMotion`).
- InstancedMesh: bangun + `setColorAt` di `useMemo` sebelum first draw; per frame ubah matrix saja; `frustumCulled = false` bila digerakkan.
- Satu piksel NaN (normal panjang nol, bagi nol di shader) + bloom = blok/frame hitam. Cegah sumbernya; cek still di tiap section.
- Cek framing 9:16 sebelum menulis kamera: lebar terlihat = 2·d·tan(fov/2)·9/16. Shot lebar 9:16 sering menyisakan pita 900–1250 px kosong: kamera lebih dekat/rendah, beri foreground.
- Counter angka: ambil frame sheet setelah counter selesai (angka setengah jalan terlihat salah).
- Deterministik (`useCurrentFrame`, seed tetap, tanpa `Math.random`). Jangan ubah `Root.tsx`, `src/core`, `src/kits`, `src/scenes/_shared`, `src/brand`, atau scene episode lain. Kalau perlu mengubah kode kit, salin ke folder scene-mu.
- Typecheck hanya file-mu (`npx tsc --noEmit -p . 2>&1 | grep scenes/<epNN>`); error lama di kit lain abaikan.
- Performa: preview 540×960@30 utuh harus bisa dirender < ~15 menit nanti; hindari post-processing berat per frame bila tidak perlu.
- Jangan menghapus `out/` atau file agen lain. Hapus folder iterasi sementara milikmu; sisakan `draft/stills/_sheet.jpg` + frame-nya dan `draft/RISK_CLIP_silent.mp4`.
- `cat > file` tanpa heredoc membuat Bash hang. Pakai tool Write.

## Kualitas
- Motion memory: MCP `audira_style_memory` `get` untuk style-mu dan `GLOBAL` (kalau tool MCP tidak ada, baca `F:\AUDIRA-ALL-SKILL\motion-memory\styles\<STYLE>.md` dan `GLOBAL.md`). Terapkan "wajib diterapkan" + "parameter terbaik", hindari "hindari".
- Setelah contact sheet jadi, nilai diri 6 aspek bilangan bulat 1–5 (lighting, material, depth, composition, motion, readability) dibanding cover-reference style-mu (`../<EPFOLDER>/style/cover-reference.*`). Kalau rata-rata < 4 atau ada aspek < 3, poles aspek lemah dan render ulang sheet (maks 2 putaran poles).
- Jangan memanggil `record_score`; lead yang mencatat skor. Jangan ubah STATUS.json atau STYLE_DECISION.md.

## Lapor (singkat)
Path `_sheet.jpg` + `RISK_CLIP_silent.mp4` (rentang detik), durasi komposisi, daftar shot singkat per section, 6 skor diri, dan apa yang masih lemah. Jangan klaim render sukses tanpa cek file.
