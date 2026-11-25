# NOTES — Pedang Curang Montreal 1976 (`EP13`)

> Tahap 10–11. Style FILMNOIR · Remotion 2D · 9:16 · film 84,1 dtk (VO 80,1 dtk). Acc pengguna: "Gas, render final" (2026-11-24), "Ya, render langsung" (2026-11-25).

## Skor
- Juri buta draf ronde 1: **4,17 LOLOS** — lighting 4, material 4, depth 4, composition 4, motion 5, readability 4.
- Final, penilaian sendiri: 4,17.
- Juri buta final: **4,00 LOLOS** — lighting 4, material 4, depth 4, composition 3, motion 5, readability 4. Terlemah: F7 (payoff) ramai.

## Yang berhasil (worked)
- Subjek 8/8 frame cocok dengan kata VO (G22): benda bukti close-up (gagang, tombol, baki, potongan melintang) dan pemain bertopeng tanpa wajah.
- Celah dengan garis putus-putus dan panah di hook menjelaskan "tidak menyentuh" tanpa suara.
- Bantahan Onishchenko disebut di video dan caption, netral.

## Yang gagal (failed) + perbaikan (fix)
- Juri final, composition 3 (penilaian sendiri 4): jari F6/F7 kapsul tanpa telapak, F7 merah pudar dan ramai (judul merah di latar merah, jari menyentuh caption), F3 bilah melintasi judul dan kaki menyentuh caption, F5 penutup gagang menyentuh judul, F8 tanda tangan menabrak figur. Episode berikut: tangan utuh bersarung, satu subjek di payoff, judul terang di latar merah, jarak ≥ 60 px dari judul dan caption.
- Flicker di render final pertama (vulkan, 6 proses x 2 tab): bercak 34,03–34,65 dtk, strip tirai 34,90–35,07 dtk, kertas separuh terang di 64,40 dtk. Sebab bukan kode: rentang 34,03–34,63 dtk pada 1080×1920@60 bersih di satu proses vulkan (1 dan 2 tab), angle, dan swangle. Fix: render ulang `--gl=angle --jobs=3 --concurrency=1`. Yang terbukti adalah kombinasi ini; gl dan jumlah proses tidak diuji terpisah.

## Teknis
- Offset VO: 0 (timing dari `studio/src/scenes/ep13/timeline.json`).
- Contact sheet final: `draft/contact-sheet-final.jpg` (1,2 · 8,8 · 34,3 · 41,9 · 49,4 · 52,2 · 55,2 · 73,0 dtk); audit `draft/look-final.json`, `draft/camera-final.json`.
- Render final: `npm run render:final -- --comp=Ep13Final --out=../EP13_PEDANG_CURANG_MONTREAL_1976/FINAL_EP13.mp4 --vo=public/audio/ep13/vo.wav --sfx=public/audio/ep13/sfx.wav --jobs=3 --concurrency=1 --gl=angle --encoder=nvenc --title="Pedang Curang Montreal 1976" --slug=pedang-curang-montreal-1976 --ep=EP13` (242 dtk, 20,9 fps; dirender sebagai `FINAL_EP13_v2.mp4`, lalu diganti nama).
- G14 (`audira_render_batch`) dan G19 (`qa-scene.mjs`) dilewati atas izin pengguna untuk EP13: render batch menolak film 2D ini. Pengganti: `audira_qa_video` dan perbandingan dua render.
- Script `preflight` tidak ada di `package.json` studio, jadi pre-flight tidak dijalankan.
- `audit:visual` final tercatat di motion memory dengan label `kit-lab-2026-11-24`, bukan `fakta-olahraga-EP13`.
- Cuts: 3.6,6.5,10,12.5,18.95,24.7,27.4,30.7,34.9,40.1,42.5,47.517,49.7,52.65,55.9,59,62.2,64.4,67.3,69.7,73.5,77.733,80.3.
- File perantara (still, klip, bundle, final lama yang cacat) dihapus 2026-11-25 setelah pengguna menyetujui final ("Setuju, hapus").

## QA final
- 1080×1920 @ 60, h264 + aac, 84,118 dtk, 5046 frame, dekode tanpa error.
- −13,6 LUFS, true peak −1,9 dBFS.
- `audira_qa_video` hardOnly: PASS, 0 temuan (cuts lengkap di atas). Catatan alat: 122 perubahan area partikel diserahkan ke mata.
- `scan.py` + `scan2.py`: area cacat lama stabil; sisa 1 kandidat di 41,55 dtk = debu dan guncangan cap, bukan cacat.
- Perbandingan blok dengan render lama: bedanya hanya cacat lama, frame potongan, dan selisih halus antar renderer.
- Ed25519 VALID; C2PA embedded menurut log render. Metadata title, artist, copyright, comment `AUDIRA-pedang-curang-montreal-1976-EP13 | audira.my.id`, date lengkap.
- Outro AUDIRA Sport Facts / Created by Agus Dwi R. tampil di 82,5 dan 83,9 dtk.
- `audira_validate_social_captions`: ok, 0 error.

## Jadwal dan review
- Upload (asumsi): Sabtu 5 Des 2026, 19.00–20.40 WIB (lihat `SOCIAL_CAPTIONS.md`).
- Scheduled task: `review-pedang-curang-montreal-1976-24h` (6 Des 19.00), `review-pedang-curang-montreal-1976-72h` (8 Des 19.00), `review-pedang-curang-montreal-1976-7d` (12 Des 19.00) WIB. Hanya jalan saat aplikasi Claude terbuka.

## Pasca-tayang (24j / 72j / 7h)
| Waktu | Views | Avg durasi/retensi | Hook bertahan? | Komentar |
|-------|-------|--------------------|----------------|----------|
| 24j | | | | |
| 72j | | | | |
| 7h | | | | |
