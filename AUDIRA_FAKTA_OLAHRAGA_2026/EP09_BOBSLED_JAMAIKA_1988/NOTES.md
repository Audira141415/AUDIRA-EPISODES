# NOTES — `Fakta olahraga dunia lintas cabang (bulu tangkis, atletik, tenis, F1, tinju)` (`EP09`)

> Tahap 10–11. Pelajaran agar episode berikut mulai dari kualitas lebih tinggi. Simpan juga ke motion memory (`append_lesson` worked/failed/fix, `set_best`).

## Yang berhasil (worked)
- CINESTORY (Remotion + R3F): 6 babak berbeda (lintasan malam → pantai Kingston → Calgary → START/Kreisel → FINISH → Lillehammer/papan skor → 2022·2026) dengan callout kinetik tiap angka (±130 KM/JAM, KE-30 DARI 41, KE-14 DARI 30, 0,01 DETIK).
- Lampu dikunci di dunia (bukan ikut kamera) menghilangkan jerk di audit:camera.
- Mix G18: VO −16,5 vs SFX −35,0 LUFS (selisih 18,5 LU); final −13,6 LUFS, TP −1,9 dBFS.

## Yang gagal (failed) + perbaikan (fix)
- Draf CINESTORY diterima 3,67 setelah 2 putaran juri buta (P1 3,5; P2 L4 M3 D4 C3 Mo4 R4). Lemah: material lintasan/dinding slab polos, backdrop gradasi datar, crop kereta. Lampu yang ikut kamera membuat jerk di audit:camera → lampu dikunci di dunia.

## Teknis
- Offset VO: 0 (ucapan 0,10–86,59 dtk; film 90,741 dtk termasuk outro card).
- Parameter render (2026-11-24, s8): `--jobs=6 --concurrency=1 --gl=vulkan --encoder=nvenc`, 5445 frame dalam 138 dtk. Tiga percobaan pertama gagal (Chrome "ran out of memory or disk space" ×2, lalu "Timed out after 30000ms while setting up the headless browser") karena dua render final episode lain berjalan bersamaan, VRAM 9,2/12 GB terpakai dan C: tinggal ±300 MB. Berhasil setelah menunggu PC kosong dan mengarahkan TEMP/TMP ke `F:/temp/remotion-ep09`.
- Final: `FINAL_EP09_BOBSLED_JAMAIKA.mp4` 1080×1920@60, 90,77 dtk, 255 MB; metadata kepemilikan dicek ffprobe; tanda tangan Ed25519 VALID + C2PA.
- Upload terjadwal: Selasa, 1 Des 2026, TikTok 19.00 WIB (urutan di `SOCIAL_CAPTIONS.md`).

## Pasca-tayang (24j / 72j / 7h)
| Waktu | Views | Avg durasi/retensi | Hook bertahan? | Komentar |
|-------|-------|--------------------|----------------|----------|
| 24j | | | | |
| 72j | | | | |
| 7h | | | | |

## Review terjadwal
- `review-bobsled-jamaika-24h` — Rabu, 2 Des 2026 19.00 WIB
- `review-bobsled-jamaika-72h` — Jumat, 4 Des 2026 19.00 WIB
- `review-bobsled-jamaika-7d` — Selasa, 8 Des 2026 19.00 WIB
(Asumsi upload Selasa 1 Des 2026 19.00 WIB. Bila diundur, ubah dengan `update_scheduled_task`.)
