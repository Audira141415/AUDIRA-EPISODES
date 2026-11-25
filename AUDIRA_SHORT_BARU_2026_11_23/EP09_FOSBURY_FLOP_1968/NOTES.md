# NOTES — Fosbury Flop 1968 (EP09)

Style: CHRONICLE (pengganti TACTICBOARD yang gagal juri 2x: 3,33 dan 3,50) · Engine: Remotion 2D (tanpa R3F) · Channel: AUDIRA Sport Facts (@AudiraSportFacts)

## Yang berhasil (worked)
- Visual konkret per babak: kliping koran "World's laziest high jumper", profil atlet, evolusi gunting → straddle → flop, ikan menggelepar di perahu (literal VO), analisis pusat massa, penggaris tinggi + hitung naik 2,00 → 2,24 M, grid medali 34/36, outro DIEJEK → STANDAR.
- Fix G13: gerak kamera kuat dipindah ke lapisan backdrop (bx sin 95 px, zoom, inset −120); kartu tetap drift lembut. audit:camera film penuh 5/5 (parked 0%, median 0,059, hold 0 dtk).

## Yang gagal (failed) + perbaikan (fix)
- TACTICBOARD gagal juri draf 2x → ganti CHRONICLE (juri draf r2 4,0).
- render:final pertama ditolak G13 (deadPct 6, medianSpeed 0,014) → fix backdrop di atas.
- Juri final r1 3,67 (komposisi 3, keterbacaan 3): label tumpuk. Fix r2:
  - S5: label "PERAK 2,22 M" dalam pill gelap di luar tiang kanan (tidak lagi tertimpa pelompat/stempel REKOR); baris X X O turun ke y 1286.
  - HUD eyebrow (`kit.tsx` Hud): 36 px, lineHeight 1, top 60, latar gelap → tidak terpotong tepi atas kartu.
  - S4: banner "TENAGA SAMA → MISTAR LEBIH TINGGI" pindah dari y 1200 (menimpa pelompat) ke slot chip y 680.
  - S2a: chip pindah y 610 → 650 (jarak dari kartu profil).
- Windows EPERM: `render-final.mjs` gagal rename `*.tagged.tmp.mp4` → final dan `npm run sign` gagal rename `*.signing.mp4`, bahkan di file baru. Final tetap utuh: dipakai `FINAL_VIDEO_r2.tagged.tmp.mp4` (metadata sudah ada) → `FINAL_VIDEO.mp4`; tanda tangan lewat wrapper retry rename + fallback copy/unlink. `scripts/sign-video.mjs` juga memanggil `signFile`/`verifyFile` tanpa `await` (tag `audira_signature=e30` = `{}`, verify mencetak `undefined`).
- C: penuh saat render pertama (write EOF part 10) → TEMP/TMP ke F:.

## QA final (2026-11-23)
- File: `FINAL_VIDEO.mp4` (root episode), 89,0 dtk, 1080×1920 @ 60, 5340 frame, h264 + aac.
- Loudness: −13,6 LUFS (toleransi ±0,5 dari −14), true peak −1,8 dBFS. G18c: VO −16,4 LUFS, SFX duck −32,7 LUFS (gap 16,3 LU).
- Metadata: title, artist AUDIRA (Agus Dwi R.), copyright, comment `AUDIRA-fosbury-flop-1968-EP09 | audira.my.id`, date. Tanda tangan Ed25519 key 498c3302271aadce VALID + C2PA (`FINAL_VIDEO.mp4.sig.json`). `AudiraSignature seed="fosbury-flop-1968"` aktif di Ep09.tsx.
- `audira_qa_video` hardOnly: PASS (0 temuan, 4 potongan 29,9/59,9/72,2/81,9 dtk sesuai babak). Laporan `draft/qa-final/`.
- Skor final juri buta: r1 3,67 (PERLU POLES) → r2 **4,0 LOLOS** (L4 M3 D4 C4 Mo5 R4). Sheet: `draft/final-contact-sheet.jpg`. Sisa lemah: piktogram datar (material), set mistar 1,5 dtk & 8 dtk mirip.

## Teknis
- VO Cartesia 87,84 dtk; film 89 dtk (outro di akhir).
- Render: `npm run render:final -- --comp=Ep09Final --out=out/FINAL_VIDEO_r2.mp4 --vo=public/audio/vo.wav --sfx=public/audio/sfx.wav --jobs=6 --concurrency=2 --gl=vulkan --encoder=nvenc --log=error --title="Fosbury Flop 1968" --slug=fosbury-flop-1968 --ep=EP09` (221 dtk).

## Pasca-tayang (24j / 72j / 7h)
Scheduled task: `review-ep09-fosbury-flop-1968-24h` (25 Nov 19.00), `review-ep09-fosbury-flop-1968-72h` (27 Nov 19.00), `review-ep09-fosbury-flop-1968-7d` (1 Des 19.00 WIB). Upload default Selasa 24 Nov 2026 19.00 WIB. Task hanya jalan saat aplikasi Claude terbuka.

| Waktu | Views | Avg durasi/retensi | Hook bertahan? | Komentar |
|-------|-------|--------------------|----------------|----------|
| 24j | | | | |
| 72j | | | | |
| 7h | | | | |
