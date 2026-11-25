# NOTES — Kenapa Kucing Selalu Mendarat dengan Kaki (`EP10`)

> Seri AUDIRA Sains Anak 2026 · channel @AudiraSains · style ANATOMIX · Remotion + R3F · VO Cartesia 90,93 dtk + outro 3,2 dtk. Batch 10 short otonom (gerbang final pre-approved pengguna 2026-11-25).

## Yang berhasil (worked)
- Satu model kucing rigged (`cat-base`) dipakai dua mode: `real` (adegan ruang tamu, Marey sepia) dan `holo` (lab anatomi: tulang punggung, selangka, kanal vestibular) → satu dunia, 7 adegan berbeda.
- Kamera kontinu tanpa parkir: audit kamera 5/5 (0 jerk, 0 % parkir).
- Kartu kinetik terkunci ke detik kata VO (1894, 3–4 MINGGU, 90°/10° hitung naik, GANTIAN).

## Yang gagal (failed) + perbaikan (fix)
- Draf r1: frame 28,3 dtk ("Langkah pertama, mencari arah bawah") hanya menyorot tulang punggung, telinga belum menyala → G22 `tidak`. Fix: kanal telinga dalam menyala dari 27,6 dtk (`ear={ramp(t,27.6,28.2)}`, spine 0.1) + callout TELINGA DALAM ↑.
- Juri r1 3,67: adegan momentum (53,6–74,6 dtk) hologram melayang di ruang hampa karena kamera (sudut π) berada di balik dinding grid Lab (z −2,6, satu sisi). Fix: dinding grid kedua di z +2,9 menghadap kamera. Kucing hook tampak terjepit di rak (start z −0,7 → −0,25); kamera spine dimundurkan (d 4,7→3,9) karena kucing terpotong di kanan.
- Juri buta r2 tetap 3,67 (L4 M3 D3 C3 R4 Mo5): **diterima 3,67 setelah 2 putaran** (aturan ≥ 3,5). Kelemahan: set low-poly polos tanpa tekstur, label TELINGA DALAM menimpa badan kucing.
- Material dibatasi 3 oleh audit (low-poly flat 56 % bidang polos vs cover 24 %); tidak dipoles (butuh tekstur bulu/normal map, mahal).

## Teknis
- Offset VO: 0 (VO mulai di frame 0; potongan adegan di jeda VO 8,6 / 27,5 / 40,7 / 53,6 / 74,6 / 82,4 dtk).
- Parameter render: `node scripts/render-final.mjs --comp=CatFinal --vo=public/audio/vo.wav --offset=0 --sfx=public/audio/sfx.wav --jobs=3 --parts=6 --concurrency=2 --gl=vulkan --encoder=nvenc` (jobs 6 memicu ERR_CONNECTION_ABORTED).
- Scheduled task review: `review-kucing-mendarat-kaki-24h` (2026-11-28 19.00 WIB), `review-kucing-mendarat-kaki-72h` (2026-11-30 19.00 WIB), `review-kucing-mendarat-kaki-7d` (2026-12-04 19.00 WIB).

## Pasca-tayang (24j / 72j / 7h)
| Waktu | Views | Avg durasi/retensi | Hook bertahan? | Komentar |
|-------|-------|--------------------|----------------|----------|
| 24j | | | | |
| 72j | | | | |
| 7h | | | | |
