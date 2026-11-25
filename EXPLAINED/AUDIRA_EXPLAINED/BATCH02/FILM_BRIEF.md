# Brief film lengkap Batch 2 (lanjutan dari cover topikmu)

Cover, naskah, dan VO sudah DISETUJUI pengguna. Sekarang bangun film penuh episodemu di studio bersama, memakai dunia/aset dari cover-mu. Bahasa layar: Indonesia.

## Masukan (jangan diubah)
- `studio/src/scenes/<ep>/timeline.json`: Audio Master Clock. `total` = durasi film (detik). `sections` = {HOOK, KONTEKS, MEKANISME, REVEAL, PAYOFF, OUTRO: [start,end]} dalam detik VO. `clips[].words[]` = {w, s, e} per kata (teks layar sudah benar, termasuk tanda baca). Semua cut, beat animasi, dan caption WAJIB berpatokan ke detik ini (baca JSON-nya, jangan hardcode angka hasil tebakan).
- `studio/public/audio/<ep>/vo.wav`: VO final (tempo sudah disesuaikan). JANGAN masukkan audio ke komposisi; audio (VO+musik+SFX) dimux terpisah oleh lead.
- `../<EPFOLDER>/SCRIPT.md` (naskah per bagian) dan `../<EPFOLDER>/research/RESEARCH_REPORT.md` (bagian "Saran visual akurat" + "JANGAN DIKLAIM": patuhi).

## Keluaran
1. `studio/src/scenes/<ep>/index.ts` mengekspor `Film`, `Cover` (biarkan cover tetap sama hasilnya), dan `TOTAL_SECONDS` = `timeline.total` (impor dari JSON).
2. `../<EPFOLDER>/STORYBOARD.md`: tabel shot (detik VO mulai–selesai, bagian naskah, visual, gerak kamera, layer, teks layar, catatan SFX yang disarankan: whoosh/impact/pop/click/riser + detik).
3. `../<EPFOLDER>/sfx-cues.json`: `[{"t": detik, "type": "whoosh|impact|pop|click|riser|glitch", "gain": 0.0-1.0}]` maks ~14 cue, di transisi dan momen kunci.
4. DRAF = CONTACT SHEET, BUKAN FILM (aturan baru CLAUDE.md). Jangan render film utuh dan jangan render resolusi penuh.
   - Contact sheet 8 frame kunci (hook, tengah tiap section, payoff, outro) di 540×960: `TEMP=F:/hf-render-tmp TMP=F:/hf-render-tmp node scripts/stills.mjs ../<EPFOLDER>/draft/stills <detik,...> <Ep>Preview` → `_sheet.jpg`. (Jangan tambah argumen ke-4 seperti `--log=error`: argumen ke-4 dibaca sebagai scale.)
   - Satu klip MP4 15–20 dtk dari bagian paling berisiko (gerak kamera/transisi tersulit): `npx remotion render <Ep>Preview ../<EPFOLDER>/draft/RISK_CLIP_silent.mp4 --frames=<a>-<b> --concurrency=4 --log=error`.
   - Cek hasil lewat versi diperkecil (lebar ±1200 px untuk sheet); hemat token: jangan baca banyak still terpisah.

## Aturan visual (Anti-PPT)
- Tiap section punya beberapa shot; kamera selalu bergerak halus (dolly/orbit/crane) dan transisi bermakna (match cut, zoom-through, potongan menembus objek), bukan slide. Multi-plane: BG, midground, foreground, HUD/label, caption.
- Tiap kalimat VO punya visual yang menunjukkan isinya (mute test: tanpa suara, penonton tetap paham urutan mekanismenya). Label/callout pendek boleh, tapi objek dulu, teks kedua.
- Hook 0–3 detik: gambar paling kuat langsung, tanpa logo/intro.
- Teks & caption di safe zone: atas ≥180 px, bawah ≥380 px (untuk 1080×1920; skala sesuai `useVideoConfig().width/1080`). Objek utama di 70% atas.
- Caption karaoke per kata dari `timeline.json`: tampilkan frasa ±3–6 kata, kata aktif menyala (warna aksen style-mu) dengan micro-bounce; posisi di atas batas 380 px bawah. Gaya caption mengikuti style episodemu (tiap episode beda).
- Outro: di detik `sections.OUTRO[1] + 0.2` pasang `<Outro start={...} />` dari `../_shared/Outro.tsx` sebagai layer paling atas (kartu AUDIRA, jangan diubah, jangan bikin logo sendiri). Sampai `total`.
- Klaim di layar hanya yang ada di naskah/riset. Tanpa logo instansi/merek nyata, tanpa wajah orang nyata.
- Deterministik (`useCurrentFrame`, seed tetap). Jangan ubah `Root.tsx`, `src/core`, `src/kits`, `_shared`, atau scene episode lain.
- Performa: preview 540×960@30 harus selesai render < ~15 menit; hindari post-processing berat per frame kalau tidak perlu.

## Lapor (singkat)
Path `_sheet.jpg` + RISK_CLIP_silent.mp4 (rentang detik), durasi komposisi, daftar shot singkat, dan apa yang masih lemah. Jangan klaim render sukses tanpa cek file.
