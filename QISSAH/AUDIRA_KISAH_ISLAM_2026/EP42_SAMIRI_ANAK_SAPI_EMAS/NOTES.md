# NOTES — Samiri dan Anak Sapi Emas (`EP42`)

> Tahap 10–11. Style CHRONICLE (Remotion + R3F 3D, siluet tanpa wajah: Musa kontur emas, Harun cyan, Samiri merah). Tanpa musik (kisah nabi).

## Yang berhasil (worked)
- Kontur warna per tokoh (emas/cyan/merah) membuat siluet tanpa wajah tetap terbaca siapa siapa, tanpa melanggar adab.
- Framing medium shot `src/film/stage.ts` (d 7.0, fov 42, aim y 0.89): kaki tokoh y≈1264, di atas caption y=1300.
- Callout ayat (QS 7:142, 7:148, 20:90, 20:97) di zona atas sebagai HUD data; name plate NABI HARUN / SAMIRI.
- Mix tanpa musik: SFX 0.22, VO 12.4 LU di atas SFX (G18c), master -14.0 LUFS TP -1.4.
- Juri buta draf putaran 1 = 3.83 LOLOS (lighting 4, material 3, depth 4, composition 4, motion 4, readability 4).

## Yang gagal (failed) + perbaikan (fix)
- Juri: cincin cakram emas transparan memotong patung di hook; siluet matte datar (material 3); frame 74 dtk belum menampilkan laut/abu.
- Kit `scripts/make.mjs --final` gagal di Windows: `execFileSync("npx")` → `spawnSync npx ENOENT`. Fix: tambah `shell: process.platform === "win32"`.
- Kit `scripts/qa.mjs`: path absolut `F:\...` di opsi filter ffmpeg `metadata=...:file=` rusak (`No option name near ...`). Fix: path relatif dengan slash maju.
- QA gate scene sebelum render: "the probe sent nothing" (QaProbe tidak terpasang di Stage3D) — gate dilewati, QA video setelah render PASS.
- QA kit 10/11: "plan has no warnings" gagal karena 3 adegan tanpa tokoh (bakar patung, laut senja, laut pagi) — disengaja sesuai naskah.

## Teknis
- VO: audio/vo.wav, 86,66 dtk, offset 0; film 91,7 dtk (VO + end card).
- Render: `cd project && node scripts/make.mjs samiri --final` (Remotion ChronicleFinal, 1080×1920 @ 60, h264 crf 18, concurrency 3, gl angle).
- Final: `FINAL_SAMIRI_ANAK_SAPI_EMAS.mp4` (84,5 MB), metadata kepemilikan ditulis dan dicek ffprobe.
- QA: `project/out/samiri/qa/` (10/11, lihat di atas), qa-video delivered scan PASS, contact sheet final `qa/final-contact-sheet.jpg`.

## Review terjadwal
- Upload asumsi: Rabu 25 Nov 2026 19.00 WIB (slot pertama). Bila diundur: update_scheduled_task, jangan buat task baru.
- review-samiri-anak-sapi-emas-24h → 26 Nov 2026 19.00 WIB
- review-samiri-anak-sapi-emas-72h → 28 Nov 2026 19.00 WIB
- review-samiri-anak-sapi-emas-7d → 2 Des 2026 19.00 WIB

## Skor final
- Self 3.83; juri buta final 3.67 PERLU POLES (lighting 4, material 3, depth 3, composition 3, motion 5, readability 4). Final tetap dikirim: acc pengguna sudah diberikan atas draf LOLOS 3.83, aturan render final sekali.

## Pasca-tayang (24j / 72j / 7h)
| Waktu | Views | Avg durasi/retensi | Hook bertahan? | Komentar |
|-------|-------|--------------------|----------------|----------|
| 24j | | | | |
| 72j | | | | |
| 7h | | | | |
