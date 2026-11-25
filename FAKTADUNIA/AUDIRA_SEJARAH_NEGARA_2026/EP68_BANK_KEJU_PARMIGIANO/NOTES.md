# NOTES — EP68 Bank Keju Credem (FOODFORGE, Remotion + R3F)

## Ringkasan
- Topik: bank Credem (Reggio Emilia) menerima roda Parmigiano Reggiano sebagai jaminan pinjaman sejak 1953.
- Style FOODFORGE, 3D Remotion + R3F. Naskah 199 kata, VO Cartesia 73,51 dtk, film 75,5 dtk (outro card 73,5–75,5).
- Draf: r1 juri 3.67, r2 juri buta LOLOS 4.0 (L4 M4 D4 C3 Mo5 R4). Kamera 5/5, THEME_CHECK 10/10.
- Final: `FINAL_EP68_BANK_KEJU.mp4` 1080×1920@60, 4530 frame, 158 MB, nvenc. Contact sheet final `draft/FINAL_SHEET.jpg`.
- Audio final: −13,7 LUFS, true peak −1,9 dBFS. G18c: VO −16,8 LUFS, SFX ter-duck −29,6 LUFS, gap 12,8 LU.
- Metadata kepemilikan ditulis dan dicek ffprobe (title, artist, copyright, comment `AUDIRA-bank-keju-parmigiano-EP68 | audira.my.id`, date). Tanda tangan Ed25519 VALID + C2PA tertanam.
- Acc render final dari pengguna: 2026-11-25 ("Gas render").

## Offset VO
- VO di offset 0 dtk (`--offset` default). Outro card mulai 73,5 dtk.

## Yang gagal dan perbaikannya
- **G18c gagal di stem −26 LUFS**: gap VO vs SFX ter-duck hanya 10,3 LU (minimal 12). Stem integrated −26 lalu trim −4 dB seharusnya −30, tapi setelah duck terukur −27,1 LUFS (gating ebur128: bagian yang ter-duck jatuh di bawah gate, aksen di jeda VO yang dihitung). Fix: `TARGET_LUFS = -28.5` di `project/sfx/cues/auto.py`, `npm run sfx` ulang → gap 12,8 LU. Backup stem lama: `draft/_sfx_-26_backup.wav`.
- **Channel gate render:final** menolak karena `src/scenes/news/PenggantiGibranWapres.tsx` (scene template berita, bukan bagian KejuFinal) memakai `handle="@audira"`. Dilewati dengan `--skip-channel="<alasan>"`; KejuFilm tidak memakai prop handle.
- **`--jobs=6` gagal** di part 15: `net::ERR_NO_BUFFER_SPACE` (localhost:3005). Resume dengan `--jobs=4 --parts=51 --no-preflight`; 12 segmen lama dipakai ulang, 39 sisanya 1926 dtk.
- Sesi B: GLB mobil polisi harus `assetType="vehicle"` (404 di flat folder); klip draf butuh `--timeout=240000`.

## Delivery
- `SOCIAL_CAPTIONS.md` 6 platform + jadwal + label AI, lolos `audira_validate_social_captions`.
- Jadwal default: Kamis 14 Januari 2027, 19.00–20.40 WIB (urutan harian seri, sebelum EP69 Jumat 15 Januari).

## Review terjadwal (tahap 11)
- `review-bank-keju-parmigiano-24h` — 15 Januari 2027 19.00 WIB
- `review-bank-keju-parmigiano-72h` — 17 Januari 2027 19.00 WIB
- `review-bank-keju-parmigiano-7d` — 21 Januari 2027 19.00 WIB
- Task hanya berjalan saat aplikasi Claude terbuka. Bila jam upload sebenarnya berbeda, ubah `fireAt` ketiga task.
