# NOTES — EP16 Tristan da Cunha

Channel: AUDIRA Fakta Dunia (@AudiraFaktaDunia) · Style: HISTORYMAP · Engine: Remotion 2D (SVG/DOM, tanpa R3F) · Label memori: `short-baru-11-23-EP16` · Slug: `tristan-da-cunha-ep16`

## Hasil final (2026-11-23)
- `FINAL_VIDEO.mp4`: 1080×1920 @ 60 fps, 88,1 dtk, 5.286 frame, h264 + aac (49 MB). Salinan dari `project/out/FINAL.mp4` (identik, `cmp`).
- Audio: −13,7 LUFS integrated, true peak −1,9 dBFS (target −14 ±0,5, TP < −1). G18c: VO −16,4 LUFS, SFX ter-duck −29,3 LUFS, gap 12,9 LU.
- Metadata (ffprobe): title, artist "AUDIRA (Agus Dwi R.)", copyright "© 2026 AUDIRA - Agus Dwi R. All rights reserved.", comment "AUDIRA-tristan-da-cunha-ep16-EP16 | audira.my.id", date 2026-11-23.
- Tanda tangan Ed25519: VALID (key 498c3302271aadce), sidecar `FINAL_VIDEO.mp4.sig.json`.
- `audira_qa_video` hardOnly: PASS (0 KEDIP/LONCAT/BLACK/WHITE).
- Contact sheet final (10 frame dari MP4): `draft/final-contact-sheet.jpg`.
- Skor final: self 4.00 (lighting 4, material 3, depth 4, composition 4, motion 5, readability 4). Juri buta: 4.00, LOLOS (lighting 4, material 4, depth 4, composition 4, motion 5, readability 3; weighted 3.96). Temuan terlemah juri: F9 kartu terbaca "RUMAH = JARAK" karena font tidak punya glyph "≠", jadi maknanya terbalik dari VO "bukan soal jarak". Teks diganti "BUKAN SOAL JARAK" di `timing.ts`, final dirender ulang dan QA diulang (angka di atas dari render kedua). Sisa temuan: F2 hanya ada label ST HELENA, Tristan tidak dilabeli.
- Offset VO: 0 (VO mulai di frame 0; outro 2,9 dtk setelah VO 85,03 dtk).

## Pelajaran
- **Gagal**: juri buta putaran 1 cuma 3.33. Vektor datar tanpa tekstur, peta satu lapis, hook 0–3 dtk kosong, label peta kecil.
- **Perbaikan**: tekstur kertas multiply, garis lipatan peta, awan FG parallax, label Tag 50 px, hook pulau besar + riak air. Juri putaran 2: 3.83 (LOLOS).
- **Gagal**: label nama laut sebagai teks SVG dekoratif gagal `audit:layout`; dihapus. Teks penting taruh di HTML div (pola `Plate`), jangan SVG text.
- **Perbaikan**: SFX `TARGET_LUFS` −29 supaya G18c lolos (gap ≥ 12 LU).
- **Gagal (tool)**: `render:final` mati di langkah rename metadata (`EPERM` saat `FINAL.tagged.tmp.mp4` → `FINAL.mp4`, file tujuan sedang terbuka proses lain). Akibatnya langkah signature tidak jalan. Dipulihkan manual: `mv` file tagged, lalu tanda tangan ulang.
- **Gagal (tool)**: `scripts/sign-video.mjs` memanggil `signFile`/`verifyFile` (async) tanpa `await` → `npm run sign` menulis tag kosong (`audira_signature=e30`) dan `npm run verify` / `audira_verify_signature` mencetak `undefined`. Di salinan proyek EP16 sudah ditambah `await` (3 baris). Starter kit `F:/AUDIRA-SKILL-MOTION/starter/scripts/sign-video.mjs` masih bug yang sama.
- **Gagal**: simbol unicode di kartu kinetik ("≠") hilang di font display. Tulis dengan kata, dan cek teks kartu di frame MP4 nyata. Self memberi readability 4, juri 3.
- **Gagal (tool, berulang)**: EPERM rename terjadi di kedua render, juga saat `out/FINAL.mp4` sudah dihapus sebelum render. Ini bug `render-final.mjs` baris 404, bukan kebetulan.
- Kicker atas + callout plat gelap border-left merah + karaoke terbukti terbaca; 15 adegan berbeda dalam 88 dtk.

## Review terjadwal
Slot upload pertama: TikTok Selasa 24 Nov 2026 19.00 WIB.
- `review-tristan-da-cunha-ep16-24h` → 25 Nov 2026 19.00 WIB
- `review-tristan-da-cunha-ep16-72h` → 27 Nov 2026 19.00 WIB
- `review-tristan-da-cunha-ep16-7d` → 1 Des 2026 19.00 WIB

Task hanya jalan saat aplikasi Claude terbuka (bila tertutup, jalan saat dibuka lagi). Jika upload diundur, ubah dengan `update_scheduled_task`.
