# NOTES — Detik-Detik Nabi Yusuf Memaafkan Saudaranya (`EP20`)

Channel AUDIRA QISSAH · Style HD2D · Remotion + R3F (diorama tilt-shift, sprite piksel voxel) · Final `FINAL_EP20_YUSUF_MEMAAFKAN.mp4`

## Ringkasan produksi
- Draf R2 LOLOS juri buta 4.17 setelah 2 putaran (R1 3.67 → R2 4.17: L4 M4 D4 C4 Mo5 R4).
- Acc render final dari pengguna (2026-11-27): "Gas, render final".
- Final 1080×1920 @ 60, 5505 frame (91.75 dtk), dirender sekali dalam 231.7 dtk (`audira_render_batch`, --jobs=7 --concurrency=2 --gl=vulkan --encoder=nvenc).
- Audio: −13.7 LUFS, true peak −1.8 dBFS; G18c VO −16.5 LUFS vs SFX ter-duck −32.4 LUFS (gap 15.9 LU, minimal 12).
- Metadata ffprobe: title, artist "AUDIRA (Agus Dwi R.)", copyright, comment `AUDIRA-nabi-yusuf-memaafkan-EP20 | audira.my.id`, date 2026-11-27. Signature Ed25519 VALID + C2PA.
- Cek frame MP4 (6 frame + blackdetect): 0 frame hitam, sprite berkerudung tanpa wajah, Nabi Muhammad ﷺ tidak digambar, outro AUDIRA QISSAH tampil.

## Yang berhasil (worked)
- Pita fokus tilt-shift: subjek (sprite, kartu ayat) di pita tajam tengah, FG/BG blur. Menaikkan depth dan composition di R2.
- Kartu ayat/hadis sebagai HUD (QS 12:58, 12:77, 12:89–90, 12:92, Bukhari 3374) membuat klaim terbaca dan bersumber.
- Angka "40 tahun" diberi label "riwayat tafsir, bukan hadis shahih" di layar dan di caption.

## Yang gagal (failed) + perbaikan (fix)
- Gerbang look.json menolak render: crushLo 10.7% di gudang (f1068). Fix: StoreSet background #2A1C1A, fog #3A2A24 (4.5–13), pointLight #FFC88A int 90 + hemisphereLight 2.6.
- Gerbang look.json menolak clipHi 1.3 di frame outro (f2707) yang ditambahkan otomatis oleh `stills.mjs`, karena kartu outro berlatar putih murni. Fix: draf ulang dengan `AUDIRA_OUTRO_TILE=off` dan hapus still lama di `draft/_stills/` (f1035, f2707), karena visual-audit membaca semua PNG di folder itu, termasuk sisa run sebelumnya.

## Teknis
- Offset VO: 0 (VO 88.1 dtk, voEnd 88.097, total 91.747; "Audira" di 12.26 dan 87.80 dtk).
- Parameter render: `npm run render:final` via `audira_render_batch`, `--sfx=public/audio/sfx.wav --vo=public/audio/vo.wav`, mix G18.
- Jadwal tayang: Senin, 14 Desember 2026, 19.00 WIB (TikTok) lalu tiap 20 menit.

## Review terjadwal
- Task: `review-nabi-yusuf-memaafkan-24h`, `review-nabi-yusuf-memaafkan-72h`, `review-nabi-yusuf-memaafkan-7d`.

## Pasca-tayang (24j / 72j / 7h)
| Waktu | Views | Avg durasi/retensi | Hook bertahan? | Komentar |
|-------|-------|--------------------|----------------|----------|
| 24j | | | | |
| 72j | | | | |
| 7h | | | | |
