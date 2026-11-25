# NOTES — Owi/Butet Emas Rio, 17 Agustus 2016 (`EP08`)

> Seri Fakta Olahraga · style HD2D (setelah PIXELSTORY gagal juri, G21) · Remotion + R3F · 9:16. Tahap 10–11.

## Hasil
- Final: `FINAL_EP08.mp4` (1080×1920 @ 60, 81,6 dtk, 4.896 frame, h264 nvenc). Master render: `studio/out/ep08/FINAL_EP08.mp4`.
- Audio: −13,6 LUFS integrated, true peak −1,9 dBFS (graph G18, `--vo` + `--sfx`). Draf G18c: VO −16,6 vs SFX duck −35,9 LUFS = 19,3 LU.
- Metadata kepemilikan + tanda tangan Ed25519 + C2PA: VALID (`npm run verify`).
- Skor: draf juri buta putaran 2 = 4,17 (L4 M4 D4 C4 Mo5 R4). Final juri buta = 3,67 (L4 M4 D4 C3 Mo5 R2), verdict PERLU POLES; tidak dipoles karena final sudah di-acc dan dirender (tugas: jangan ubah visual).
- QA: `qa-video --hard-only` PASS (2 potongan, keduanya disengaja). Contact sheet final: `draft/final-contact-sheet.jpg`.
- Plakat penutup tetap "SUSY SUSANTI" (keputusan pengguna 2026-11-24).
- Catatan juri draf (non-blocking): F5 lawan Malaysia tidak terlihat; F2 kamar = aftermath semifinal.

## Yang berhasil (worked)
- Apron mat di sekeliling lapangan + roughness court dinaikkan membuat lantai tidak lagi kosong/silau.
- Arena `open` menghapus board sisi kamera, jadi kamera C/D/E2 bisa masuk rendah tanpa tertutup papan.
- Sub-teks chip ≥ 48 px: terbaca di layar ponsel.
- Render 4.896 frame dalam 88 dtk (6 job, concurrency 2, vulkan, nvenc).

## Yang gagal (failed) + perbaikan (fix)
- 2026-11-24 PIXELSTORY gagal juri buta 2 putaran (3,42 dan 3,42; readability dicap 2 oleh G22: C2 upacara dan OUT warisan hanya skyline + kartu teks). Skor terbaik < 3,5 → G21 ganti style ke HD2D. Kode PIXELSTORY tetap di `studio/src/scenes/ep08/` (Ep08Preview) sebagai referensi timing/HUD.
- HD2D putaran 1: lantai lapangan kosong dan chip HUD terpotong di tepi. Fix putaran 2: apron mat, kamera C/D/E2 dirapikan, sub-teks ≥ 48 px → LOLOS 4,17.

- Final juri buta: readability dicap 2 (G22) karena teaser Jamaika di outro hanya kartu HUD di atas adegan Owi/Butet; composition 3 karena pemain terpotong tepi (F2/F3/F4). Episode berikut: teaser wajib visual subjek baru.
- Papan skor di 49,3 dtk menampilkan 11-8 saat VO menyebut "sepuluh-dua belas" (papan masih menghitung); kecil, dibiarkan.

## Teknis
- Offset VO: 0 (VO terkunci `studio/public/audio/ep08/vo.wav`, 77,6 dtk + kartu outro = 81,6 dtk).
- Parameter render: `npm run render:final -- --comp=Ep08HdFinal --out=out/ep08/FINAL_EP08.mp4 --vo=public/audio/ep08/vo.wav --sfx=public/audio/ep08/sfx.wav --jobs=6 --concurrency=2 --gl=vulkan --encoder=nvenc --log=error --title="Owi/Butet Emas Rio 17 Agustus 2016" --slug=owi-butet-emas-17-agustus-2016 --ep=EP08`.
- Review terjadwal: `review-owi-butet-24h` (1 Des 19.00), `review-owi-butet-72h` (3 Des 19.00), `review-owi-butet-7d` (7 Des 19.00 WIB); upload Senin, 30 Nov 2026 19.00 WIB (dipilih pengguna).

## Pasca-tayang (24j / 72j / 7h)
| Waktu | Views | Avg durasi/retensi | Hook bertahan? | Komentar |
|-------|-------|--------------------|----------------|----------|
| 24j | | | | |
| 72j | | | | |
| 7h | | | | |
