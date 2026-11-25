# BATCH07 AUDIRA EXPLAINED — Handoff (2026-11-23, sesi 1 → sesi 2)

Permintaan pengguna: "buatkan 5 riset untuk EXPLAINED dan buatkan 5 video shortnya".
Keputusan pengguna (CLAUDE.md global): style + engine dipilih AI tanpa acc; SATU-SATUNYA acc = tepat sebelum render final 1080×1920@60 (tahap 9). Ikuti pipeline 11 tahap, guard G1–G22.

## Episode (folder ini)
| EP | Topik | Style (Remotion+R3F 3D) |
|---|---|---|
| EP060-dermaga-di-laut | AE-060 Dermaga dibangun di atas laut | BEDAH |
| EP063-atap-stadion-tanpa-tiang | AE-063 Atap stadion tanpa banyak tiang | BUILDFORGE |
| EP064-bandara-lahan-lunak | AE-064 Bandara di atas lahan lunak | LIDARFORGE |
| EP067-terowongan-air | AE-067 Terowongan air antarwilayah | WORLDFORGE |
| EP068-pipa-bawah-jalan | AE-068 Pipa raksasa di bawah jalan | URBANFORGE |

Topik dari bank ide `../AUDIRA_EXPLAINED_Master_Episode_365_v2.xlsx` (AE-061 & AE-074 dilewati: duplikat episode lain). Durasi mengikuti format seri: ~60 dtk (~150 kata), sama dengan BATCH01–06.

## Sudah selesai
- Riset 5 EP: `<EP>/research/SOURCE_REGISTER.md` + `RESEARCH_REPORT.md` (ada "JANGAN DIKLAIM" + "Saran visual akurat" — wajib dipatuhi cover/film).
- `<EP>/style/STYLE_DECISION.md` (baris `Style: <ID>`), `<EP>/STATUS.json` (init).
- Naskah: `_write_scripts.py` (dict S, sumber kebenaran) → `<EP>/SCRIPT.md` (136–154 kata).
- VO request: `_tools/make_vo_requests.py` sudah dijalankan → `<EP>/voiceover.json` (fonetik `_tools/phon.py`, out_dir `studio/public/audio/ep0NN/clips`).
- Studio: `studio/` dari starter terbaru `F:\AUDIRA-SKILL-MOTION\starter` (node_modules = junction ke starter/node_modules, Remotion 4.0.544). `src/scenes/_shared/Outro.tsx` + `public/audio/music` disalin dari BATCH06. Root.tsx BELUM didaftarkan untuk Ep060..Ep068.
- `_tools/` disalin dari BATCH06 (path sudah diganti ke BATCH07); `make_captions_data.py`, `synth_bgm.py`, `write_notes_qa.py` masih berisi entri ep065..ep073 → ganti untuk ep060/063/064/067/068 saat dipakai.

## Langkah berikutnya (urut)
1. Synth VO per EP: dari folder `F:\AUDIRA-EPISODES` jalankan `node scripts/tts-cartesia.mjs --request EXPLAINED/AUDIRA_EXPLAINED/BATCH07/<EP>/voiceover.json` (butuh CARTESIA_API_KEY di `.env` folder kerja; cari file .env yang dipakai batch sebelumnya, jangan tampilkan nilainya; alternatif: MCP `audira_generate_voiceover`). Lalu dari BATCH07: `python _tools/build_vo.py ep060` dst → `studio/public/audio/<ep>/vo.wav` + `studio/src/scenes/<ep>/timeline.json`. Cek lafal "Audira", "paip jeking", "Syututgart", "Delawer Akuadak".
2. Daftarkan `Ep060/063/064/067/068 Cover|Preview|Final` di `studio/src/Root.tsx` (pola: `../BATCH06/studio/src/Root.tsx`, termasuk SLUG + AudiraSignature wrapper) dan buat placeholder `src/scenes/<ep>/index.ts` (Cover, Film, TOTAL_SECONDS).
3. Tulis `COVER_BRIEF.md` + `FILM_BRIEF.md` BATCH07 dari versi BATCH06 (ganti path studio ke `F:\AUDIRA-EPISODES\EXPLAINED\AUDIRA_EXPLAINED\BATCH07\studio`; tambahkan aturan multi-scene ≥4–6 adegan + kinetic HUD callout untuk angka, G22 THEME_CHECK). Jalankan 5 subagen (satu per EP): cover-topic.png → film + STORYBOARD.md + sfx-cues.json + contact sheet draf 540×960 + RISK_CLIP. Motion memory `audira_style_memory get` tiap style → mustApply/avoid di pesan subagen.
4. Juri buta per EP (`record_score` judge jury, stage draft); LOLOS ≥3.8, maks 2 putaran; isi `draft/THEME_CHECK.md`.
5. GERBANG: tampilkan 5 contact sheet + skor juri + durasi + G18c ke pengguna, tunggu acc. Baru render final (`npm run render:final -- ... --vo=... --sfx=...`, setelan G18, −14 LUFS, TP < −1), metadata, SOCIAL_CAPTIONS (validator), NOTES, lesson memori, scheduled review.

## Sesi 2 (2026-11-23)
- Langkah 1 SELESAI: VO 5 EP disintesis, `build_vo.py` → vo.wav + timeline.json (film 63.3 / 63.9 / 65.0 / 65.0 / 65.0 dtk). Model whisper lokal (F:/hf-cache) hilang → sync_check.py tidak jalan; ejaan fonetik sudah benar di voiceover.json.
- Langkah 2 SELESAI: Root.tsx mendaftarkan Ep060/063/064/067/068 Cover|Preview|Final (+SLUG, AudiraSignature starter). Placeholder index.ts + timing.ts per EP. tsc bersih untuk file ini.
- Langkah 3: brief gabungan `EP_BRIEF.md` (cover + film + draf, aturan GLB, multi-scene, kinetic HUD, G22). 5 subagen (satu per EP) dijalankan di background dari sesi 2.
- 2026-11-24: 5 subagen (EP060/063/064/067/068, brief `EP_BRIEF.md`) terhenti 2x karena limit API (5 jam, lalu mingguan reset 14.00 WIB). Dilanjutkan lagi lewat SendMessage. Cek progres per EP dari file: `style/cover-topic.png`, `studio/src/scenes/<ep>/`, `STORYBOARD.md`, `draft/stills/_sheet.jpg`. Bila subagen tidak bisa dilanjutkan, sesi baru jalankan subagen baru per EP dengan brief yang sama + "lanjutkan dari file yang ada".
- Sisa setelah subagen: juri buta per EP (`F:\AUDIRA-SKILL-MOTION\qa\jury.md`, record_score judge jury stage draft) → GERBANG acc pengguna → final.

## Status 2026-11-24 (akhir sesi 2, batas konteks)
| EP | Status draf | Juri buta |
|---|---|---|
| EP060 BEDAH | SELESAI: cover, `draft/stills/_sheet.jpg` (2.8,12.6,22.5,30.8,35.8,47.6,52.8,57.0), RISK_CLIP 18.5–36.0, camera.json (motion 5), ceilings.json, THEME_CHECK, STORYBOARD, sfx-cues. Self 4.0 (material 3). Lemah: peta tipis, crane low-poly dominan di 30.8s, slab melayang turun. | BELUM — jalankan juri r1 |
| EP063 BUILDFORGE | SELESAI: cover, `_sheet.jpg` (2.0,6.3,11.5,24.8,32.6,47.8,53.8,58.0), RISK_CLIP 15–33, camera.json (5), THEME_CHECK, STORYBOARD, sfx-cues. Self 3.83 (material 3.5, composition 3.5). Lemah: penonton kapsul, close-up rangka JIS 47.8s ramai, chip 38 px. Catatan: junction `BATCH07ssetspolyfork` dibuat agar bundle assetSearch.ts jalan; studio
ode_modules kini menunjuk F:AUDIRA-SKILL-MOTION
ode_modules. | BELUM — jalankan juri r1 |
| EP064 LIDARFORGE | subagen sesi 2 masih jalan (render background) | – |
| EP067 WORLDFORGE | draf r1 selesai; juri r1 = 3.17 PERLU POLES (penampang datar, counter 136 tertangkap mid-ramp=128, band hitam F3, konteks Sodetan Jakarta). Subagen sesi 2 sedang poles r1 → sheet baru. | r2 = putaran terakhir |
| EP068 URBANFORGE | subagen sesi 2 masih jalan | – |

Subagen sesi 2 tidak bisa dihubungi dari sesi baru. Sesi baru: cek file tiap EP; EP yang belum punya `_sheet.jpg` setelah subagen sesi 2 berhenti → jalankan subagen baru dengan `EP_BRIEF.md` + "lanjutkan dari file yang ada" (motion memory per style ada di pesan sesi 2; ambil ulang via audira_style_memory get).
Juri buta: subagen terpisah, hanya lihat `_sheet.jpg` + quality-bar style (`F:\AUDIRA-SKILL-MOTION\references\quality-bar\`) + ceilings + camera.json; protokol `F:\AUDIRA-SKILL-MOTION\qa\jury.md`; record_score judge jury stage draft episode `batch07-EPnn`. LOLOS ≥3.8 tanpa aspek <3; maks 2 putaran; setelah 2 putaran terbaik ≥3.5 → terima.
STATUS.json tiap EP sudah berisi data.engine=remotion + style.
Lalu GERBANG: tampilkan 5 sheet + skor juri + durasi + G18c, tunggu acc pengguna → final (`_tools/render_finals.sh`/`finalize.sh` pola BATCH06, ganti entri ep065.. ke ep060/063/064/067/068 di make_captions_data.py, synth_bgm.py, write_notes_qa.py) → SOCIAL_CAPTIONS (validator) → NOTES → lesson memori → scheduled review.
- EP067 update: poles r1 SELESAI (sheet baru, frame detik sama; counter 136 di 42.37s; peta Jakarta; band hitam hilang; RISK_CLIP baru camera 5). Self 3.83 (~3.5 setelah bias). Berikutnya: juri r2 (putaran terakhir). Cover belum dirender ulang (warna tanah lama) — render ulang `Ep067Cover` sebelum delivery.
- EP068 update: draf SELESAI setelah 2 poles subagen: `_sheet.jpg` (2.6/11/20/24.2/37.6/42/49.8/58.4), RISK_CLIP 15.6–31.6 (camera 5), visual.json, THEME_CHECK 8/8, STORYBOARD, sfx-cues. Self 3.33, depth 2 (ceiling terukur depth 2, lighting 3: separasi subjek 36 vs cover 105). Juri r1 kemungkinan gagal → poles fokus: rim light kuat + latar gelap di belakang subjek, hook (1/3 frame tanah kosong, caption di atas pipa), HDD jarang. PAYOFF memakai HDD (sesuai naskah/riset).
- Lingkungan: starter kini workspaces → paket di `F:\AUDIRA-SKILL-MOTION\node_modules`; `studio\node_modules` junction ke sana; `tsc` studio tidak melihat modul (bundle/render tetap jalan). `npm install` sekali di starter menulis ulang `F:\AUDIRA-SKILL-MOTION\package-lock.json`. stills.mjs kadang gagal bila agen paralel berbagi folder `.audira` → ulangi.
- EP064 update: draf SELESAI setelah 2 poles: `_sheet.jpg` (2.0/8.3/14.2/24.6/31.8/40.0/55.0/59.2), RISK_CLIP 18.5–35.5 (camera 5), THEME_CHECK 8/8, STORYBOARD, sfx-cues. Self 3.67 (lighting 3, depth 3). Lemah: close-up KONTEKS/MEKANISME datar & amber, pulau Kansai slab polos, lapisan dalam REVEAL terpotong, papan AUDIRA di tepi kanan outro. CEK FAKTA sebelum gerbang: kartu "TURUN 13,72 m" dan "900 KOLOM" harus cocok `EP064/research/SOURCE_REGISTER.md`. AssetModel diimpor langsung dari `core/assets/AssetModel.tsx` (catalog.json polyfork BATCH07 tidak ada).
- SEMUA 5 DRAF SELESAI. Subagen sesi 2 berhenti. Sesi 3: juri r1 untuk EP060, EP063, EP064, EP068; juri r2 untuk EP067 → poles yang gagal (maks 2 putaran juri) → gerbang acc.

## Sesi 3 (2026-11-24)
- Cek fakta EP064: "TURUN 13,72 m" = SOURCE_REGISTER #16 (S1), "900 KOLOM" = #20 (S2). Cocok, tidak diubah.
- Juri buta (record_score judge jury, stage draft, episode `batch07-EPnn`): EP060 r1 3.50 · EP063 r1 3.50 · EP064 r1 2.83 (G22 gagal F6) · EP067 r2 3.67 → DITERIMA (2 putaran, ≥3.5; catat di NOTES saat delivery) · EP068 r1 3.00. Pola umum: counter angka tertangkap mid-ramp di sheet (EP060 2.481, EP064 10,61, EP068 57).
- Poles r1 untuk EP060/063/064/068 via subagen dengan brief `POLISH_R1.md` + temuan juri per EP. Setelah itu: juri r2 (terakhir). Skor terbaik ≥3.5 → terima; <3.5 → ganti style (G21).
- Audio: `_tools/mix.py` path SFX diganti ke `F:/AUDIRA-EPISODES/shared/assets/sfx/` (folder AUDIRA-VIDEO-MOTION tidak ada). `synth_bgm.py` diberi tema ep060/063/064/067/068 (argumen: `<ep> <durasi>`). Bed + `studio/public/audio/<ep>/mix.wav` sudah dibuat: −14 LUFS, TP −1.5. G18c (skrip scratch g18c): VO 21.7–23.4 LU di atas SFX, semua LOLOS. Bila sfx-cues.json berubah saat poles → jalankan ulang mix.py.

## Status akhir sesi 3 (2026-11-24, batas konteks)
| EP | Juri buta | Status |
|---|---|---|
| EP060 BEDAH | r1 3.50 → r2 3.67 | DITERIMA (2 putaran). Counter 3.374 m cocok VO + register #4. |
| EP063 BUILDFORGE | r1 3.50 → r2 3.67 | DITERIMA (2 putaran). F7 sheet digeser 53.8→54.3. |
| EP064 LIDARFORGE | r1 2.83 → r2 3.67 | DITERIMA (2 putaran). Angka 13,72 / 1 juta / 900 cocok register. Cacat kecil: judul F8 menyentuh tepi kanan. |
| EP067 WORLDFORGE | r1 3.17 → r2 3.67 | DITERIMA (2 putaran). Cover perlu render ulang `Ep067Cover` sebelum delivery. |
| EP068 URBANFORGE | r1 3.00 | POLES r1 sedang/terhenti: subagen sesi 3 kena limit API lalu dilanjutkan; mungkin selesai/tidak. Cek file: `EP068.../draft/stills/_sheet.jpg` lebih baru dari r1? `draft/visual.json` ceilings depth/lighting naik? THEME_CHECK diperbarui? Bila belum selesai → subagen baru dengan `POLISH_R1.md` + temuan juri r1 EP068 (di bawah) + "lanjutkan dari file yang ada". Lalu juri r2 (terakhir). |

Temuan juri r1 EP068: F5 counter "57 POTONG" vs VO 189 (harus final saat angka diucapkan); depth 2 (ceiling terukur 2) & lighting 3: subjek tenggelam di tanah cokelat → rim light dingin, latar gelap/kabut, pipa beton bertekstur kasar; caption menutupi dongkrak F4 & pipa F1; label "PIPA BETON"/"PIPA MERAYAP" pudar.

Juri: prompt `JURY_PROMPT.md` dan pembuat input `mkjury.py` ada di scratchpad sesi 3 (mungkin hilang). Isi prompt = `F:\AUDIRA-SKILL-MOTION\qa\jury.md` + "angka di layar wajib cocok angka di VO" + minta "fixes". Input: sheet, quality-bar `urbanforge.png`, ceilings `draft/visual.json`, camera.json, kolom Frame|Detik|Kata VO THEME_CHECK. record_score judge jury stage draft episode `batch07-EP068`. ≥3.8 tanpa aspek <3 = lolos; setelah r2 terbaik ≥3.5 = terima; <3.5 = ganti style (G21).
Lesson memori sudah ditulis: GLOBAL (counter mid-ramp), BEDAH, BUILDFORGE, LIDARFORGE, WORLDFORGE.
Audio: mix.wav 5 EP sudah ada (−14 LUFS, TP −1.5), G18c lolos 21.7–23.4 LU. Bila sfx-cues.json EP berubah saat poles, jalankan ulang `python _tools/mix.py <ep>` dari BATCH07.
Durasi film: EP060 63.3 · EP063 63.9 · EP064 65.0 · EP067 65.0 · EP068 65.0 dtk.

GERBANG (setelah EP068 selesai): kirim 5 `_sheet.jpg` (SendUserFile) + skor juri + durasi + G18c, tunggu acc pengguna. JANGAN render final tanpa acc. NOTES.md tiap EP: "diterima 3.67 setelah 2 putaran".

## Status sesi 4 (2026-11-24)
- EP068 URBANFORGE: juri buta r2 = 3.83 LOLOS (L4 M4 D4 C3 Mo5 R3), record_score batch07-EP068 tersimpan. Catatan juri: F6 "Ø 4,05 M" vs VO "empat meter"; caption F4 pudar di beton terang; 40% bawah F3/F4 kosong; rantai 189 segmen agak abstrak.
- sfx-cues EP068 tidak berubah (14:27 < mix 16:51) → mix tidak diulang. Ukur ulang mix.wav 5 EP: −14.0 LUFS (EP063 −13.9), peak −1.5/−1.6 dBFS.
- GERBANG dibuka: 5 sheet dikirim ke pengguna, menunggu acc. Belum ada render final.
- **ACC PENGGUNA 2026-11-24**: pengguna menjawab "Gas, render final" untuk kelima EP (EP060, EP063, EP064, EP067, EP068). Sesi C (tahap 9–10) dibuka di sesi baru; acc sudah ada, tidak perlu tanya lagi.

## Brief Sesi C (render final + delivery)
1. Final 1080×1920@60 per EP (Root.tsx: Ep060/063/064/067/068 Final). Pola BATCH06: `_tools/render_finals.sh` / `finalize.sh` — ganti entri ep065.. ke ep060/063/064/067/068 di `make_captions_data.py`, `synth_bgm.py`, `write_notes_qa.py` bila belum. Audio = `studio/public/audio/<ep>/mix.wav` (sudah −14 LUFS, TP −1.5, G18c lolos). Setelan PC: `--jobs=6 --concurrency=2 --gl=vulkan --encoder=nvenc`, `--log=error`. Render di background, satu per satu.
2. QA: −14 LUFS & TP < −1 dBFS dari MP4, cek frame dari MP4, AudiraSignature aktif, outro AUDIRA, metadata kepemilikan (ffmpeg -metadata ... lalu ffprobe), `record_score stage final` (judge self) per EP: batch07-EP060/063/064/067/068.
3. Sebelum delivery: render ulang `Ep067Cover`. Opsional kecil: judul F8 EP064 menyentuh tepi kanan.
4. Delivery: SOCIAL_CAPTIONS.md 6 platform + Jadwal Upload (WIB) + Label Konten AI, lolos `audira_validate_social_captions`; rule 15 (tanpa wajah/logo nyata, angka cocok SOURCE_REGISTER); SUBTITLES.srt; NOTES.md tiap EP (EP060/063/064/067: "diterima 3.67 setelah 2 putaran"; EP068: juri r2 LOLOS 3.83); lesson memori URBANFORGE (append_lesson); hapus perantara (RISK_CLIP, still png, mix-pre); tanya jam upload lalu buat 3 scheduled task per EP (review-<slug>-24h/-72h/-7d).
5. Jangan commit.

## Status Sesi C (2026-11-24, sesi render final)
- `_tools/render_finals.sh` diperbarui: `--jobs=6 --concurrency=2 --gl=vulkan --encoder=nvenc --log=error --skip-channel=...` (gate channel gagal karena file starter `studio/src/scenes/news/PenggantiGibranWapres.tsx` yang tidak dipakai Root; signature EP tanpa handle → dari CHANNEL.json).
- Render batch background: `bash _tools/render_finals.sh ep060 ep063 ep064 ep067 ep068 > _tools/render_finals.out`. Hasil per EP di `_tools/render_finals.out`, log di `EPxxx/draft/render-final.log`.
- EP060 percobaan 1 FAIL: `part 4 failed ... RuntimeError: unreachable` (source-map wasm di onConsole Remotion, tampak flaky). Ulangi: `bash _tools/render_finals.sh ep060` (bila gagal lagi, coba `--jobs=4`).
- SELESAI: `_tools/make_captions_data.py` (data 5 EP Batch 7, jadwal default Sab 5 – Rab 9 Des 2026, 19.00–20.40 WIB) → `write_captions.py` → SOCIAL_CAPTIONS.md 5 EP, LOLOS validator. SUBTITLES.srt 5 EP (write_srt.py).
- BELUM: `write_notes_qa.py` masih isi Batch 6 (STYLE/SCORES/PHON/LESSON/WEAK + teks "2026-11-10", "concurrency 8", gerbang lama) → ganti untuk ep060 BEDAH, ep063 BUILDFORGE, ep064 LIDARFORGE, ep067 WORLDFORGE, ep068 URBANFORGE; butuh `_tools/sync_final.txt` (sync_check.py) dan `qa/final_frames.jpg`. finalize.sh per EP (metadata + arsip). record_score final (self) batch07-EPxxx. Render ulang Ep067Cover. append_lesson URBANFORGE. Hapus perantara. Tanya jam upload → 3 scheduled task per EP.

## Catatan render final (dari subagen poles EP068, sesi 3)
- Render dengan `--concurrency=4` sempat memberi frame putih (14 shader validation error per tab) saat GPU dipakai bersama; `--concurrency=1` benar. Pakai concurrency rendah bila terjadi.
- Cover belum dirender ulang setelah material berubah: render ulang `Ep068Cover` (dan `Ep067Cover`) sebelum delivery.
- `EP068.../draft/render-final.log` muncul tanpa dibuat subagen poles: cek apakah ada render final yang jalan tanpa acc pengguna.

## Status Sesi C — handover ke sesi berikut (2026-11-24, batas konteks)
- EP064, EP067: FINAL_VIDEO.mp4 OK, ter-tag (finalize.sh, ffprobe cek), arsip `archive/2026-11-24/`, QA: 1080×1920@60, 65,0 dtk, −13,6 LUFS, TP −1,9, blackdetect 0, signature + outro terlihat. record_score final (self) tersimpan batch07-EP064 (3,67) dan batch07-EP067 (3,67).
- EP060/063/068: percobaan 1 gagal (`RuntimeError: unreachable` source-map wasm saat 6 worker, flaky). Render ulang SEDANG JALAN di background dari sesi lama: `JOBS=4 CONC=3 bash _tools/render_finals.sh ep068 ep060 ep063 > _tools/render_finals2.out`. Cek `_tools/render_finals2.out` (baris "epXXX OK/FAIL"); bila proses node masih jalan (tasklist | grep node) tunggu. Segmen jadi dipakai ulang (cache `studio/out/seg`), jadi ulangi saja perintah yang sama untuk EP yang FAIL (coba `JOBS=3 CONC=4`).
- Setelah tiap EP OK: `python -c` ambil judul dari `_tools/captions_data.json` → `bash _tools/finalize.sh epXXX "<judul>"`; `bash _tools/qa_frames.sh epXXX`; ukur ebur128; cek 1 frame outro (`-sseof -1.5`); `record_score` stage final judge self episode `batch07-EPxxx` (style ep060 BEDAH, ep063 BUILDFORGE, ep068 URBANFORGE).
- Lalu (GPU bebas): `python _tools/sync_check.py ep060 ep063 ep064 ep067 ep068 > _tools/sync_final.txt` (cek format baris yang diharapkan `write_notes_qa.py`: "epXXX: ... NN% ... median offset X.XXs"); `python _tools/write_notes_qa.py ep060 ep063 ep064 ep067 ep068` (sudah diisi Batch 7); tambahkan `## Review terjadwal` + 3 taskId ke tiap NOTES.md.
- Render ulang cover EP067: dari studio `TEMP=F:/hf-render-tmp TMP=F:/hf-render-tmp node scripts/stills.mjs ../EP067-terowongan-air/style/_cover 15 Ep067Cover` → salin `f0015.png` ke `style/cover-topic.png`, hapus `style/_cover`.
- Hapus perantara per EP: `draft/RISK_CLIP*.mp4`, `draft/stills/*.png` (sisakan `_sheet.jpg`), `studio/public/audio/<ep>/mix-pre.wav`.
- SUDAH: SOCIAL_CAPTIONS.md 5 EP lolos validator; SUBTITLES.srt 5 EP; lesson URBANFORGE; jadwal upload pengguna = default (EP060 Sab 5 Des … EP068 Rab 9 Des 2026, 19.00 WIB); 15 scheduled task dibuat: review-{dermaga-di-laut,atap-stadion-tanpa-tiang,bandara-lahan-lunak,terowongan-air,pipa-bawah-jalan}-{24h,72h,7d}.
- Kandidat promosi memori: "Parameter exposure diperbaiki di 2 episode" (tawarkan ke pengguna).
- Jangan commit. Laporan akhir: caption 6 platform lengkap di chat per EP.

## Sesi C SELESAI (2026-11-24)
- 5 FINAL_VIDEO.mp4 ter-tag + arsip `archive/2026-11-24/`. EP068 berhasil di percobaan 3 (`JOBS=3 CONC=2`, 202 dtk; percobaan 2 gagal "Chrome ran out of memory" karena render sesi lain jalan bersamaan).
- QA: semua 1080×1920@60, −13,6/−13,7 LUFS, TP −1,8/−1,9, blackdetect 0, outro + signature terlihat. Sinkron (whisper large-v3; model `F:/hf-cache/manual/fw-medium` sudah tidak ada, `sync_check.py` diarahkan ke `F:/AUDIRA-CLIP-AI/ai-engine/models/...large-v3`): median +0,12–0,14 dtk, 72–82% kata ±0,25 dtk.
- record_score final self: batch07-EP060 BEDAH 3,67, EP063 BUILDFORGE 3,67, EP068 URBANFORGE 3,83 (EP064/067 sesi sebelumnya).
- NOTES.md + QA_REPORT.md 5 EP ditulis (`write_notes_qa.py`, termasuk `## Review terjadwal`). Cover EP067 dirender ulang. Perantara dihapus.
- Sisa: tawaran promosi memori "exposure" ke pengguna. Belum di-commit.
