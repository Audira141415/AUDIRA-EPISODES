# NOTES — EP57 Paraguay melawan Tiga Negara (Perang Aliansi Tiga, 1864–1870)

Style: HISTORYMAP · Remotion + R3F · channel FAKTADUNIA (@AudiraFaktaDunia) · memory `sejarah-negara-EP57`

## Hasil
- `FINAL_VIDEO.mp4`: 1080×1920 @ 60 fps, 93,93 dtk (VO 90,74 dtk), −13,7 LUFS, true peak −1,8 dBFS.
- Metadata kepemilikan (ffprobe ok), signature Ed25519 + C2PA VALID (`npm run verify`), `AudiraSignature seed="sejarah-negara-ep57"` aktif (handle dari channel).
- `npm run deliver`: GREEN. Yellow tersisa: `src/templates/MultiSceneDirector.tsx` memakai `handle={channelHandle}` (template starter, tidak dipakai film).
- G18c: VO −16,9 LUFS, SFX ter-duck −33,6 LUFS, selisih 16,7 LU.

## Juri
- Draf **diterima 3.50 setelah 2 putaran juri** (juri buta: L4 M3 D4 C3 Mo5 R2; self 4.17). Aturan 2026-11-23: skor terbaik ≥ 3,5 setelah 2 putaran langsung final, tanpa poles lagi.
- Skor final (self, dikoreksi bias): 3,67 (L4 M3 D4 C3 Mo5 R3).
- Aspek lemah: keterbacaan label negara 3D kecil di HP, material peta polos, frame hook padat (3 panah + label terpotong di tepi).

## Offset VO
- Offset VO = 0 dtk (`<Voiceover src="audio/vo.wav" offset={0} />`). VO dirapatkan dari 96,5 ke 90,7 dtk; film 93,91 dtk termasuk outro.

## Pelajaran
- Berhasil: meja peta 3D dengan 6 babak berbeda (panah kepungan, tenda + figur prajurit, palem gerilya, balok populasi, figur perempuan bertani, peta wilayah) dan callout HUD angka per beat. Topik korban massal tetap terbaca tanpa tubuh, darah, atau wajah.
- Angka korban selalu ditulis sebagai perkiraan atau rentang (±420–450 ribu ke ±150 ribu, 60–70%), konsisten di layar, VO, dan caption.
- `render:final` menerima `--comp=` dan `--out=`, bukan nama komposisi positional (perintah di handover s3 salah).
- Memory gate menolak final karena draf juri 3,50 tidak LOLOS. Sesuai aturan 2 putaran dipakai `--skip-memory-gate="<alasan>"`.
- Channel gate menolak `handle="@audira"` di file starter `src/scenes/news/PenggantiGibranWapres.tsx` (tidak dipakai). Prop `handle` dihapus.
- `--jobs=6` crash (`Page crashed!`) dan satu worker gagal (`ERR_SOCKET_NOT_CONNECTED`) saat sesi EP56/58/59 merender paralel. `--jobs=3` + resume segmen berhasil (3757 frame dalam 160 dtk).
- `npm run sfx` di Windows perlu `PYTHONUTF8=1`.

## Review pasca-tayang (scheduled task)
Jadwal upload asumsi: Minggu, 3 Januari 2027, 19.00 WIB (slot pertama `## Jadwal Upload (WIB)`). Ubah fireAt bila jam upload sebenarnya berbeda.
- `review-sejarah-negara-ep57-24h`: 2027-01-04 19.00 WIB
- `review-sejarah-negara-ep57-72h`: 2027-01-06 19.00 WIB
- `review-sejarah-negara-ep57-7d`: 2027-01-10 19.00 WIB
