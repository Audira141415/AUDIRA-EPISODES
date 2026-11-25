# TEMPLATE SKOR SEMPURNA — AUDIRA (wajib tiap episode)

> Satu lembar. Tempel di tiap episode. Skor tinggi bukan kebetulan — ia keluar dari **gerbang skor + hindari jebakan**. Aturan penuh tetap di directive 11-tahap; ini checklist operasionalnya. Tandai `[x]` saat lolos. Gerbang ✅ = berhenti, tunjukkan ke pengguna, lanjut hanya setelah acc.

---

## A. SEBELUM MULAI — baca memori (tahap 1)
Skor naik karena tidak mengulang kesalahan. Wajib dibaca dulu:
- [ ] `audira_motion_brain` (versi engine, episode terakhir, keputusan sistem)
- [ ] `audira_style_memory` `style: "GLOBAL"` (pelajaran lintas style)
- [ ] `audira_style_memory` `scope: "channel"` (jam upload, hook yang berhasil)
- [ ] `NOTES.md` + `STYLE_DECISION.md` 2–3 episode terakhir seri (anti-template: hook, style, visual tidak boleh berulang)

## B. STYLE + COVER = QUALITY BAR (tahap 3, gerbang ✅)
Cover bukan hiasan. Cover adalah **tolok ukur skor**: draf dan final dinilai dibanding cover ini.
- [ ] `audira_recommend_style` → tawarkan 1 utama + 1–2 alternatif, tiap satu kalimat alasan awam + cover referensi
- [ ] Pilih engine: **Remotion** (dunia 3D) / **HyperFrames** (motion graphic 2D)
- [ ] Channel sudah benar: `node scripts/channel-of.mjs --guess "<judul>"` (RAGU = tanya pengguna)
- [ ] ✅ Tunggu pengguna pilih style
- [ ] Render **cover topik** 1080×1920 dari komposisi film di frame hook → simpan framing di `style/cover.json`
- [ ] ✅ Tunggu acc cover
- [ ] `STYLE_DECISION.md` terisi (style, alasan, alternatif ditolak, `approved: yes`)

## C. NASKAH + VO (tahap 4, 6; gerbang ✅)
- [ ] WPM 135–150, struktur 6 tahap (Hook 0–3s → Context → Main → Explanation → Payoff → Outro)
- [ ] Hook tajam 0–3 dtk, berbeda dari episode sebelumnya
- [ ] VO menyebut "AUDIRA" di hook atau outro (anti-reupload lapis 3)
- [ ] ✅ Acc naskah **sebelum** VO
- [ ] TTS: ejaan **fonetik** untuk akronim/CAPS (AUDIRA jangan dieja huruf per huruf) → voice-lock merge
- [ ] `npm run vo -- <audio>` — kunci durasi VO = Audio Master Clock
- [ ] **JANGAN render MP4 apa pun sebelum VO dikunci** (durasi berubah = render terbuang)

## D. BUILD KUALITAS (tahap 5, 7) — ini yang menaikkan skor mentah
- [ ] `audira_project_layout check` → `errors` kosong
- [ ] Terapkan dari `audira_style_memory get <style>`: semua **"wajib diterapkan"** + **"parameter terbaik"**, hindari semua **"hindari"**
- [ ] `<Finish>` aktif (reflections, AO, bloom, tone map PBR Neutral, grade) kecuali style sengaja datar
- [ ] Logam/krom/emas/plastik glossy → `hdri="studio"` (bukan kotak lampu)
- [ ] `core/polish/Polish.tsx`: `<RoundedBoxGeo>` ganti `<boxGeometry>`, material `POLISH.*`, `useSurfaceGrain`, `lifeMotion`
- [ ] Manusia/kerumunan → `<ToyPerson>` / `<SwimCrowd>` (kepala berwajah, bahu>pinggang, siku/lutut menekuk). **JANGAN kapsul + 4 stik satu warna**
- [ ] Kamera: `audira-camera` / `core/camera/moves.ts` — gerak kontinu, **bukan slide statis** (Anti-PPT Law)
- [ ] Multi-plane (BG/mid/FG/HUD/subtitle), safe zone atas 180px bawah 380px
- [ ] Brand di dalam adegan (label HUD/objek) min. 1× (anti-reupload lapis 2)
- [ ] `<AudiraSignature seed="<slug>" />` + `<AudiraOutro />` — handle **otomatis dari channel**, jangan ketik `@audira`

## E. GERBANG DRAF — pintu skor pertama (tahap 8, ✅)
Gerbang draf hanya terbuka oleh **skor juri LOLOS**. Urutan wajib:
1. [ ] `npm run draft -- <Comp>Preview` (contact sheet 8 frame + audit:visual + klip risiko + audit:camera + jury_input.json)
2. [ ] Skor sendiri: `audira_style_memory record_score stage:"draft"` (6 aspek 1–5 vs cover)
3. [ ] Jika **PERLU POLES** → poles aspek lemah → `npm run draft` lagi → skor lagi (ulang sampai lolos)
4. [ ] **Juri buta**: subagent baru, hanya lihat contact sheet + cover + jury_input.json + `qa/jury.md` → `record_score judge:"jury"`
5. [ ] ✅ Acc draf **hanya setelah juri LOLOS**
- [ ] `npm run audit:cover` lolos (hook buka dengan framing cover)
- DILARANG: render draf utuh, render resolusi penuh sebelum acc draf

## F. FINAL + QA — pintu skor kedua (tahap 9, ✅)
- [ ] `RENDER_TMPDIR` di F: (C: penuh), bukan temp default
- [ ] Render 1080×1920 @60 via `audira_render_batch` — **semua film satu seri masuk SATU batch** (paralel). Jangan tulis skrip render berurutan. Jangan hapus `out/seg`
- [ ] Beri `--title/--slug/--ep` → metadata kepemilikan + tanda tangan Ed25519 + C2PA otomatis
- [ ] Audio: −14 LUFS, true peak < −1 dBFS; suara di atas musik/SFX (~15 dB di bawah)
- [ ] `npm run deliver -- ../FINAL_VIDEO.mp4` → qa:gate, verifikasi tanda tangan, tag kepemilikan, **FINAL_CHECK.jpg** (cek frame dari MP4 jadi, bukan dari draf — jebakan black-frame NaN+bloom), validasi caption
- [ ] `record_score stage:"final"`
- Hentikan jika: `<AudiraOutro>` hilang / channel tak cocok (render:final berhenti, qa:gate merah)

## G. DELIVERY + MEMORI (tahap 10–11) — agar skor berikutnya lebih tinggi
- [ ] `SOCIAL_CAPTIONS.md`: 6 platform + `## Jadwal Upload (WIB)` + `## Label Konten AI` → lolos `audira_validate_social_captions`
- [ ] Caption lengkap tampil di chat
- [ ] `NOTES.md`: pelajaran, offset VO, yang gagal
- [ ] Simpan ke motion memory: `append_lesson` (worked/failed/fix) + `set_best` (parameter terbukti)
- [ ] Ada **kandidat promosi** (perbaikan berhasil di 2 episode)? Tawarkan masuk kit → `mark_promoted`
- [ ] Hapus perantara (draf/raw MP4, still sementara); sisakan final, contact sheet, VO, dokumen
- [ ] Review pasca-tayang 24j/72j/7h → catat + `set_best uploadTimes`

---

## JEBAKAN PEMBUNUH SKOR (dari memori — jangan terulang)
- Render sebelum VO dikunci → durasi salah, terbuang
- Figur kapsul+stik / karakter CGI plastik generik → ditolak juri
- Slide statis tanpa gerak kamera (Anti-PPT) → skor motion rendah
- Akronim/CAPS dibaca huruf-per-huruf oleh Cartesia → pakai ejaan fonetik + voice-lock
- Black-frame NaN + bloom → selalu cek `FINAL_CHECK.jpg` dari MP4 jadi
- `environmentIntensity` (trap r186), cek saat upgrade engine
- Temp render di C: (penuh) → set `RENDER_TMPDIR` ke F:
- Junction `node_modules` selain ke `<WS>/_cache/`
- Ketik handle `@audira` manual → handle wajib otomatis dari channel seri
- Lewati juri buta → gerbang draf/final tidak boleh dibuka tanpa skor juri LOLOS

## RUMUS INTI
Skor sempurna = **(cover quality-bar tinggi) × (wajib-diterapkan dari memori) × (poles sampai juri LOLOS) × (nol jebakan)**. Bukan sekali jadi; ulang poles+skor sampai lolos.
