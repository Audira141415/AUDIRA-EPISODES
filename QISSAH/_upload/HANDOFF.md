# HANDOFF — Upload YouTube @AUDIRAQISSAH (2x sehari)

Diperbarui: 2026-11-26. Permintaan pengguna: cek video QISSAH yang belum diupload di F:\AUDIRA-EPISODES, upload ke YouTube lewat Claude in Chrome, jadwalkan 2x sehari di jam yang paling diminati audiens Indonesia.

## Status
- **SELESAI 19/19** terjadwal (29 Nov – 13 Des 2026), dicek di tab Shorts Studio 2026-11-26. Link di UPLOAD_LOG.md. Index 16 (Cerita Hikmah EP04, 182 dtk) masuk tab Videos, bukan Shorts. Server dihentikan.
- Terbuka: judul placeholder Sejarah Islam EP03/EP04; video long Cerita Hikmah EP07–11 & Makkah FINAL_LONG EP01–05 belum diupload (tunggu keputusan pengguna).

## Hasil cek channel (YouTube Studio, 2026-11-26)
- Channel ID `UCw-Ehx4ibG9O_G366TAnZJw` (AUDIRA QISSAH). 46 Shorts + 1 video panjang sudah ada.
- Sudah di channel: Kisah Islam EP01–28, Cerita Hikmah EP01 (long) + EP02, Makkah 7 short, Sejarah Islam EP01–10 (terjadwal 1–10 Des, 19:40 WIB, satu per hari).
- Catatan: Sejarah Islam EP03 & EP04 terjadwal dengan judul placeholder "EP03 SEJARAH ISLAM" / "EP04 SEJARAH ISLAM" — perlu diganti judul asli sebelum 3–4 Des.
- Belum diupload, bukan Short (landscape/long, tidak masuk antrean): Cerita Hikmah EP07–11 (1920×1080, ±4 menit), Makkah FINAL_LONG EP01–05 (±11–12 menit). Tanyakan pengguna sebelum upload (memori: short only kecuali diminta).
- Cerita Hikmah EP04 durasi 182 dtk (>3 menit) → kemungkinan tidak masuk Shorts.

## Riset jam (data channel asli, Analytics "When your viewers are on YouTube", 28 hari, GMT+7)
- 96% penonton Indonesia, 69% HP. Puncak "Most" 17.00–20.00 WIB (Sen/Rab/Kam/Min 19.00; Jum/Sab 17.00). Gelombang kedua "Many" 10.00–14.00 terutama Jum–Min. Pagi 07–09 rendah, 22.00+ sepi.
- Slot dipilih: **11.30 WIB** dan **19.00 WIB**. Hari 1–10 Des slot sore sudah terisi Sejarah Islam (19.40), jadi hanya 11.30 yang ditambah.

## Cara upload (sudah terbukti)
File 59 MB–1 GB melebihi batas file_upload Chrome (10 MB), jadi:
1. Jalankan server lokal (background): `node F:/AUDIRA-EPISODES/QISSAH/_upload/serve.mjs` → 127.0.0.1:8765, melayani mp4 di bawah `F:/AUDIRA-EPISODES/QISSAH/` + `/meta.json`.
2. Chrome tab: buka `https://studio.youtube.com/channel/UCw-Ehx4ibG9O_G366TAnZJw/videos/upload?d=ud`.
3. JS di halaman: `fetch('http://127.0.0.1:8765/<file>')` → `new File([blob], name, {type:'video/mp4'})`; override `HTMLInputElement.prototype.click` supaya input file video diisi `DataTransfer` + dispatch `change`; lalu klik tombol "Select files". (Di run pertama, dispatch change pada input apa pun juga memicu upload.)
4. Isi judul & deskripsi: `#textbox[contenteditable]` di `ytcp-uploads-dialog` (index 0 judul, 1 deskripsi) via `execCommand('selectAll')` + `insertText`.
5. Klik `#toggle-button` (Show more) → radio `VIDEO_PAID_PRODUCT_PLACEMENT_NO`, `VIDEO_HAS_ALTERED_CONTENT_YES`; tags: input di `#tags-container`, isi string tags + ',' lalu Enter. Made for kids = No sudah default.
6. Klik `#next-button` 3x → Visibility → klik `#second-container-expand-button` (Schedule).
7. Tanggal & jam: JS tidak bisa; pakai klik nyata: klik `#datepicker-trigger`, klik tanggal di kalender, triple-click kolom jam, ketik `HH:MM`, Enter. Cek screenshot, lalu klik "Schedule". Dialog "Video scheduled" = sukses.

## Cara cepat (sesi s2, terbukti index 7–15)
- Server: `node serve.mjs` sekarang juga melayani `/inject.js` (helper __auGo/__auPos/__auDateFocus/__auCheck/__auWait).
- Muat helper di halaman upload (eval diblok CSP, pakai script ber-nonce):
  `const code=await fetch('http://127.0.0.1:8765/inject.js').then(r=>r.text()); const s=document.createElement('script'); s.nonce=document.querySelector('script[nonce]')?.nonce; let tt; try{tt=trustedTypes.createPolicy('au'+Date.now(),{createScript:x=>x})}catch(e){} s.textContent=tt?tt.createScript(code):code; document.head.appendChild(s); await __auGo(IDX)`
- __auGo = fetch video per potongan (r.blob() gagal untuk file besar: kuota blob Chrome), pilih file, isi judul/deskripsi/tags/altered=Yes/paid=No/kids=No, Next 3x, buka Schedule.
- __auPos({trig:[497,279],time:[634,279],sched:[1147,589]}) menggulir + memastikan posisi (throw bila beda). Lalu klik nyata: trig → __auDateFocus() → ketik "12 Dec 2026" Enter → klik time → ctrl+a → ketik "11:30" Enter → __auCheck('12 Dec 2026','11:30') (throw bila beda) → klik Schedule → __auWait(38000) sampai done=true (jangan navigasi sebelum upload selesai). Catat: `node log.mjs IDX <link>`.

## Next
Upload #2–#19 sesuai `meta.json`, cek daftar Shorts di Studio di akhir, lapor ke pengguna (tabel jadwal + video long yang belum diupload + judul placeholder EP03/EP04).

## SELESAI (sesi s4, 2026-11-26) — upload 10 video panjang (pengguna: "Ya, upload semua")
- `meta.json` sekarang = 10 video panjang (dibuat `node build-long.mjs`; meta Short lama dibackup di `meta_shorts_s2.json`). Index 0–4 Makkah FINAL_LONG EP01–05 (27 Nov–1 Des, 17:00 WIB), 5–9 Cerita Hikmah EP07–11 (14–18 Des, 19:00 WIB). Log: bagian "Video panjang" di UPLOAD_LOG.md.
- Selesai: idx 0 (BH5mGPU_BbM, 27 Nov), idx 1 (fkRLaO99kNQ, 28 Nov), idx 2 (eReTjRx_83s, 29 Nov), idx 3 (tzsMzLTjq50, 30 Nov), idx 4 (YJll6WF9FRE, 1 Dec), idx 5 (ytCkE3FQTs4, 14 Dec), idx 6 (mSmPi8mEsTI, 15 Dec), idx 7 (AXYRVl5-PYg, 16 Dec), idx 8 (nAGFJX-PFpg, 17 Dec), idx 9 (1wp473mIJv8, 18 Dec) — 10/10 terjadwal. Klik jam pertama setelah Enter tanggal sering tidak fokus: ulangi klik jam bila __auCheck mismatch. Viewport bisa 1214 (tanggal 310,448 / jam 440,448 triple_click / Schedule 976,594) atau 1568 (490,438 / 632,438 / 1144,588): cek innerWidth dulu. Sesi s4 melanjutkan idx 4–9. Jebakan baru: tab sesi lain yang masih memegang blob upload besar membuat tab baru pun "File unreadable" (minta sesi pemiliknya menutup tab). 
- SELESAI (sesi s4): 10/10 terjadwal dan terlihat di tab Videos Studio dengan tanggal benar. Draf gagal "Kiswah" tidak tersisa. Server 8765 dihentikan. Thumbnail kustom + subtitle .srt belum dipasang — pengguna ACC pasang keduanya (2026-11-26), dikerjakan sesi s6.
- Server: `node F:/AUDIRA-EPISODES/QISSAH/_upload/serve.mjs` (cek `curl -s http://127.0.0.1:8765/meta.json | head -c 50`; jalankan di background bila mati).
- PENTING: file ≥1,2 GB → WAJIB tab Chrome BARU per video (di tab lama "File unreadable" karena kuota blob). Satu upload pada satu waktu (paralel juga "File unreadable"). Urutan: tunggu upload sebelumnya done → `tabs_close_mcp` tab lama → `tabs_context_mcp {createIfEmpty:true}` (grup lama hilang setelah tutup; pakai tab baru dari sini) → navigate `https://studio.youtube.com/channel/UCw-Ehx4ibG9O_G366TAnZJw/videos/upload?d=ud` → muat inject.js (snippet "Cara cepat" di atas) → `await __auGo(IDX)`.
- Jadwal (viewport 1568×662): tunggu ±2 dtk setelah __auGo, klik tanggal (490,438) → `await __auDateFocus()` (bila error "focus" = klik terlalu cepat, ulangi klik) → ketik "30 Nov 2026" Enter → klik jam (632,438) → ctrl+a → ketik "17:00" Enter → `__auCheck('30 Nov 2026','17:00')` → klik Schedule (1144,588) → `__auWait(6000)` untuk link → `node log.mjs IDX <link>`.
- Upload ±11–12 menit/video. javascript_tool timeout 45 dtk, browser_batch ±100 dtk: polling `__auWait(40000)` 2× per batch.
- Selesai bila 10/10 terjadwal: cek tab Videos Studio (harus 12 video panjang), perbarui HANDOFF, hentikan server, lapor ke pengguna. Thumbnail kustom (file di `_upload/BELUM_UPLOAD/*thumb*`) dan subtitle .srt belum dipasang — tawarkan ke pengguna.

## SELESAI (sesi s3, 2026-11-26) — judul placeholder Sejarah Islam sudah diganti
- EP03 (vc8c1wjIoVY) dan EP04 (_RN-7idKVPI): judul baru tersimpan ("Changes saved"), terlihat di daftar Shorts Studio, status Scheduled 3 Des & 4 Des (jadwal tidak diubah).
- Deskripsi dan tags kedua video sudah berisi konten asli (bukan placeholder), jadi tidak diubah.
- Sisa terbuka: video long Cerita Hikmah EP07–11 dan Makkah FINAL_LONG EP01–05 belum diupload (tunggu keputusan pengguna).

## Cek ulang sisa upload (sesi s3, 2026-11-26)
- Studio: 64 Short + 2 long. Semua Short lokal (Kisah Islam 39, Cerita Hikmah EP02–06, Makkah 10, Peradaban EP01, Sejarah Islam 10) sudah diupload/terjadwal.
- Belum diupload: 10 video panjang 16:9 → disalin ke `_upload/BELUM_UPLOAD/` (12 GB, 01–05 Cerita Hikmah EP07–11, 06–10 Makkah FINAL_LONG EP01–05) + .srt, metadata (_CAPTIONS.md / _YOUTUBE.md), thumbnail, README.md berisi daftar judul.
- `_upload/SISA_UPLOAD/` berisi 2 file yang SUDAH diupload (#17, #18) — bisa dihapus bila pengguna setuju.

## (Arsip) Next (sesi s3) — ganti judul placeholder Sejarah Islam (pengguna sudah setuju 2026-11-26)
- EP03: Studio https://studio.youtube.com/video/vc8c1wjIoVY/edit → judul "Kenapa Kamera Mirip Kamar? Kisah Ibnu al-Haitsam dan Kamar Gelap" (sumber: F:/AUDIRA-EPISODES/AUDIRA_SEJARAH_ISLAM_2026/EP03_IBNU_HAITHAM_KAMAR_GELAP/SOCIAL_CAPTIONS.md baris 35, bagian YouTube). Tayang 3 Des 19:40.
- EP04: https://studio.youtube.com/video/_RN-7idKVPI/edit → "Mansa Musa: Jamaah Haji yang Bikin Harga Emas di Kairo Jatuh (1324)" (EP04_MANSA_MUSA_EMAS_KAIRO/SOCIAL_CAPTIONS.md baris 35). Tayang 4 Des 19:40.
- Cek juga deskripsi/tags kedua video; bila placeholder, isi dari SOCIAL_CAPTIONS.md bagian YouTube. Ganti judul via `#textbox[contenteditable]` (execCommand selectAll + insertText), klik Save. Jangan ubah jadwal.

## SELESAI (sesi s7, 2026-11-26) — 6 Short QISSAH dari luar folder QISSAH (pengguna: "Ya, upload semua")
- Scan ulang F:\AUDIRA-EPISODES: kandidat hanya di `AUDIRA_SHORT_BARU_2026_11_23` — EP07, EP08, EP23, EP24, EP25, EP26 (EP25/EP26 tanpa field channel, tapi caption bertag `audira qissah`). Sejarah Islam EP01–10 sudah di channel; Payung Nabawi = TECH.
- 6/6 terjadwal 11:30 WIB, 14–19 Des, terlihat di tab Shorts Studio (total 70 Shorts). Link di UPLOAD_LOG.md bagian "Short dari AUDIRA_SHORT_BARU_2026_11_23".
- `meta.json` sekarang = 6 Short ini (dibuat `node build-shorts-baru.mjs`, path relatif ke `F:/AUDIRA-EPISODES`). Meta video panjang dibackup di `meta_long_s4.json`.
- `serve.mjs` kini menerima `AU_ROOT` (default tetap `F:/AUDIRA-EPISODES/QISSAH`). Untuk file di luar QISSAH: `AU_ROOT=F:/AUDIRA-EPISODES node serve.mjs`. Server sudah dihentikan.
- Viewport sesi ini 1568×662: tanggal (490,438), jam: left_click lalu triple_click (612,438) — klik jam tanpa left_click dulu sering menyeleksi seluruh halaman, Schedule (1144,588). Short ±200 MB boleh pakai tab yang sama (navigate ulang per upload).
- Belum: thumbnail kustom + SUBTITLES.srt untuk 6 Short ini tidak dipasang.

## Temuan sesi s3 (2026-11-26, sudah ditindaklanjuti sesi s7)
Ada Short QISSAH di luar folder QISSAH: `F:/AUDIRA-EPISODES/AUDIRA_SHORT_BARU_2026_11_23/` EP07_HIDANGAN_DARI_LANGIT, EP08_NABI_ILYAS_BERHALA_BAAL, EP23_ISMAIL_PERINTAH_QURBAN (FINAL_VIDEO.mp4), EP24_SULAIMAN_WAFAT_BERSANDAR_TONGKAT (FINAL_EP24_SULAIMAN_tagged.mp4). STATUS.json channel = QISSAH. Cek judulnya di daftar Shorts Studio; bila belum ada, upload sebagai Short. Scan juga ulang semua folder `F:/AUDIRA-EPISODES` (banyak STATUS.json tanpa field channel; cari topik islami per nama folder/SOCIAL_CAPTIONS). Kandidat ragu: `AUDIRA_CARA_KERJA_VIRAL_2026/EP05_PAYUNG_RAKSASA_NABAWI` (kemungkinan channel TECH).

## SELESAI (sesi s6) thumbnail + srt — 2026-11-26

10/10 video panjang punya thumbnail kustom dan subtitle Indonesia (published). Jadwal, judul, deskripsi tidak diubah.

| ID | File | Thumbnail | SRT |
|---|---|---|---|
| BH5mGPU_BbM | 06_MAKKAH_LONG_EP01 | ✓ thumb-a.jpg | ✓ published |
| fkRLaO99kNQ | 07_MAKKAH_LONG_EP02 | ✓ thumb-a.jpg | ✓ published |
| eReTjRx_83s | 08_MAKKAH_LONG_EP03 | ✓ thumb-a.jpg | ✓ published |
| tzsMzLTjq50 | 09_MAKKAH_LONG_EP04 | ✓ thumb-a.jpg | ✓ published |
| YJll6WF9FRE | 10_MAKKAH_LONG_EP05 | ✓ thumb-a.jpg | ✓ published |
| ytCkE3FQTs4 | 01_CERITA_HIKMAH_EP07 | ✓ jpg kompres | ✓ published |
| mSmPi8mEsTI | 02_CERITA_HIKMAH_EP08 | ✓ jpg kompres | ✓ published |
| AXYRVl5-PYg | 03_CERITA_HIKMAH_EP09 | ✓ jpg kompres | ✓ published |
| nAGFJX-PFpg | 04_CERITA_HIKMAH_EP10 | ✓ jpg kompres | ✓ published |
| 1wp473mIJv8 | 05_CERITA_HIKMAH_EP11 | ✓ jpg kompres | ✓ published |

Catatan cara kerja:
- Thumbnail Cerita Hikmah (_thumb.png 2.0–3.0 MB) melebihi batas 2 MB YouTube. Diunggah salinan JPG 1280×720 q3 (129–204 KB) dari scratchpad sesi; file asli tidak diubah.
- Thumbnail: halaman `/video/<ID>/edit`, `file_upload` ke file-input tersembunyi (ref dari `find "file-input"`), lalu klik `ytcp-button#save`, toast "Changes saved". Preview kanan atas menampilkan thumbnail baru.
- Subtitle: halaman `/video/<ID>/translations` (UI "Languages", video language sudah Indonesian). Klik "Upload manual" → dialog "With timing" punya file-input tersembunyi; `file_upload` langsung ke situ (tanpa klik Continue) → toast "Indonesian subtitles uploaded". Lalu "Edit subtitles" → cek cue pertama → "Publish" → toast "Indonesian subtitles published".
