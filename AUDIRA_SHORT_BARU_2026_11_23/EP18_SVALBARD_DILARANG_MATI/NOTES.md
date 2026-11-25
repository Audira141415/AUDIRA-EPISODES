# NOTES — EP18 Longyearbyen, Svalbard: Kota Tempat Orang Dilarang Mati

Channel: AUDIRA Fakta Dunia (@AudiraFaktaDunia) · Style: PAPERWORLD · Engine: Remotion 2D (SVG/DOM, tanpa R3F) · Label memori: `short-baru-11-23-EP18` · Slug: `svalbard-ep18`

## Hasil final (2026-11-23)
- `FINAL_VIDEO.mp4`: 1080×1920 @ 60 fps, 91,82 dtk, 5.508 frame, h264 + aac (±72 MB). Salinan identik `project/out/FINAL.mp4`.
- Audio: −13,7 LUFS integrated, true peak −1,8 dBTP. G18c: VO −16,4 LUFS, SFX ter-duck −28,9 LUFS, gap 12,5 LU.
- Metadata (ffprobe): title "Longyearbyen: Kota Tempat Orang Dilarang Mati", artist "AUDIRA (Agus Dwi R.)", copyright "© 2026 AUDIRA - Agus Dwi R. All rights reserved.", comment "AUDIRA-svalbard-ep18-EP18 | audira.my.id", date 2026-11-23.
- Tanda tangan Ed25519: VALID (key 498c3302271aadce) + C2PA embedded, sidecar `FINAL_VIDEO.mp4.sig.json`.
- `audira_qa_video` hardOnly: PASS (10 potongan terencana, 0 temuan).
- Contact sheet final (17 frame dari MP4): `draft/final-contact-sheet.jpg`. Draf: `draft/contact-sheet.jpg`.
- Skor draf (putaran 1): self 4,33; **juri buta 3,83 LOLOS** (composition 3, readability 3).
- Skor final: **juri buta 4,17 LOLOS** (lighting 4, material 4, depth 4, composition 4, motion 5, readability 4) → diarsipkan GOLD di `AUDIRA-SKILL-MOTION/kits/paperworld/gold/short-baru-11-23-EP18`. Temuan terlemah: pintu Seed Vault (74 dtk) kotak abu-abu tanpa callout, tak terbaca tanpa suara.
- Offset VO: 0 (VO 88,72 dtk, outro card 88,9–91,8).

## Pelajaran
- **Gagal → Perbaikan**: "?" besar S6 digambar sebagai `<text>` di dalam `Layered` = 4 teks bertumpuk → audit:layout composition cap 3. Diganti path (stroke round + circle). Ceilings kembali 5.
- **Gagal (render:final G13)**: audit:camera skor 5 tapi deadPct 11 %, median 0,021. Kamera S5 (zoom linear, tx −16/dtk), S6 (ty 150−lt·36, tx 40−lt·8, zoom 0,018/dtk), S7 (tx 170−lt·52 / +34 dtk) dipercepat → parkir 0 %, median 0,059. Zoom besar sempat memotong buku & label "§ 1" (audit:layout) → zoom dikecilkan.
- **Gagal (juri)**: label sekunder kecil (LAUT BARENTS, LAPISAN AKTIF, PERMAFROST, IZIN), frame sheet di tengah crane S3, reveal payoff tanpa kartu nama.
- **Gagal (tool, berulang)**: EPERM rename `FINAL.tagged.tmp.mp4` → `FINAL.mp4` (render-final.mjs:404); dipulihkan dengan `mv` + tanda tangan manual (await signFile). `npm run verify` mencetak `undefined` (verifyFile tidak di-await di sign-video.mjs) → verifikasi via skrip await: VALID.
- Channel gate memindai scene contoh starter `PenggantiGibranWapres` → `--skip-channel` beralasan.
- C: penuh → semua render dengan `TEMP=F:/tmp-remotion TMP=F:/tmp-remotion`.

## Review terjadwal
Slot upload pertama: TikTok Kamis 26 Nov 2026 19.00 WIB.
- `review-svalbard-ep18-24h` → 27 Nov 2026 19.00 WIB
- `review-svalbard-ep18-72h` → 29 Nov 2026 19.00 WIB
- `review-svalbard-ep18-7d` → 3 Des 2026 19.00 WIB

Task hanya jalan saat aplikasi Claude terbuka (bila tertutup, jalan saat dibuka lagi). Mode izin sesi tidak tersimpan di task; atur di halaman task bila perlu. Jika upload diundur, ubah dengan `update_scheduled_task`.

## Review pasca-tayang
(diisi oleh task terjadwal)
