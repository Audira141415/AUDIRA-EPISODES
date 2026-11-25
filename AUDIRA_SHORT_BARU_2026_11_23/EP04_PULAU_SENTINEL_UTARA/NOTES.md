# NOTES — EP04 Pulau Sentinel Utara

Channel: AUDIRA Fakta Dunia (@AudiraFaktaDunia) · Style: PAINTERLY · Engine: Remotion 2D (SVG/DOM, tanpa R3F) · Label memori: `short-baru-11-23-EP04` · Slug: `sentinel-utara-ep04`

## Hasil final (2026-11-23)
- `FINAL_VIDEO.mp4`: 1080×1920 @ 60 fps, 89,51 dtk, 5.370 frame, h264 + aac (±80 MB). Salinan identik `project/out/FINAL.mp4`.
- Audio: −13,7 LUFS integrated, true peak −1,9 dBFS. G18c: VO −16,5 LUFS, SFX ter-duck −30,0 LUFS, gap 13,5 LU.
- Metadata (ffprobe): title, artist "AUDIRA (Agus Dwi R.)", copyright "© 2026 AUDIRA - Agus Dwi R. All rights reserved.", comment "AUDIRA-sentinel-utara-ep04-EP04 | audira.my.id", date 2026-11-23.
- Tanda tangan Ed25519: VALID (key 498c3302271aadce), sidecar `FINAL_VIDEO.mp4.sig.json`.
- `audira_qa_video` hardOnly: PASS (render ke-2 gagal KEDIP 7,45 dtk, diperbaiki, lihat Pelajaran).
- Contact sheet final (14 frame dari MP4): `draft/final-contact-sheet.jpg`.
- Skor draf (putaran 1 PAINTERLY): self 4,17, juri buta 4,00 LOLOS (material 3).
- Skor final: self 4,00; **juri buta 3,50** (lighting 3, material 3, depth 4, composition 3, motion 5, readability 3). Temuan terlemah: overlay sapuan/grain vertikal di setiap frame membuat cahaya dan warna keruh; cat terbaca sebagai filter di atas siluet vektor datar. F12 ("tidak pernah kembali") figur perahu terlalu kecil; label peta kecil (TELUK BENGGALA) di batas terbaca.
- Offset VO: 0 (VO 86,52 dtk, outro card 2,9 dtk mulai 86,6).
- Riwayat style: PAPERWORLD (juri 3,83, gugur), CHRONICLE (juri 3,67, gugur), PAINTERLY (draf lolos).

## Pelajaran
- **Gagal**: tekstur cat statis screen-space menguasai vidstab → audit:camera parkir 100%. `feOffset` pada feTurbulence meninggalkan pita vertikal bertepi keras.
- **Perbaikan**: tekstur sapuan = PNG noise seeded (`public/paint-strokes.png`) sebagai lapisan terakhir di dalam grup `cam()` tiap adegan; filter `#paint` hanya wobble tepi. Camera 5/5, ceilings 5.
- **Gagal**: overlay sapuan global vertikal terbaca "kaca berembun/hujan", bukan cat (juri material 3 di draf dan final). Berikutnya: sapuan per bentuk (clip ke shape, arah ikut bentuk), variasi warna dalam siluet, overlay global tipis.
- **Gagal (render:final)**: G18c gap 11,3 LU dengan stem −26 → `TARGET_LUFS` −28 (gap 13,5). G13 gagal walau audit:camera skor 5 (deadPct 6, median 0,024) → pan S8/S9 dipercepat (median 0,04). Channel gate memindai scene contoh starter `PenggantiGibranWapres` → `--skip-channel` beralasan.
- **Gagal (tool, berulang)**: EPERM rename `FINAL.tagged.tmp.mp4` → `FINAL.mp4` (render-final.mjs:404) di setiap render; dipulihkan dengan `mv` + tanda tangan manual (`await signFile`).
- **Perbaikan**: `<image href=staticFile(png)>` kosong di frame pertama tiap chunk (KEDIP 7,45 dtk = frame 447 = awal part 2/12). `PaintStrokes` kini `delayRender` sampai `img.decode()`.
- C: penuh → semua render dengan `TEMP=F:/tmp-remotion TMP=F:/tmp-remotion`.

## Review terjadwal
Slot upload pertama: TikTok Rabu 25 Nov 2026 19.00 WIB.
- `review-sentinel-utara-ep04-24h` → 26 Nov 2026 19.00 WIB
- `review-sentinel-utara-ep04-72h` → 28 Nov 2026 19.00 WIB
- `review-sentinel-utara-ep04-7d` → 2 Des 2026 19.00 WIB

Task hanya jalan saat aplikasi Claude terbuka (bila tertutup, jalan saat dibuka lagi). Mode izin sesi tidak tersimpan di task; atur di halaman task bila perlu. Jika upload diundur, ubah dengan `update_scheduled_task`.

## Review pasca-tayang
(diisi oleh task terjadwal)
