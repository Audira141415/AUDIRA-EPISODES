# NOTES — Usain Bolt 9,58 Detik (`EP06`)

> Seri Fakta Olahraga (AUDIRA Sport Facts). Style TOYDIORAMA, Remotion 4 + R3F, 9:16. Pelajaran juga sudah disimpan di motion memory TOYDIORAMA (`append_lesson`, episode `fakta-olahraga-EP06`).

## Ringkasan produksi
- VO Cartesia terkunci 90,46 dtk, 207 kata ucapan (6 blok: hook, context, main, explanation, payoff, outro). "Audira" disebut di hook.
- Draf: contact sheet 8 frame (`draft/contact-sheet.jpg`), THEME_CHECK 8/8 `ya`.
- Juri buta: r1 rata-rata 3,5 (PERLU POLES) → r2 rata-rata 4,0 (LOLOS).
- Cek audio G18c lolos: VO −16,3 LUFS, SFX efektif −30 LUFS.
- Acc render final dari pengguna: 2026-11-24 ("Gas render final").

## Yang berhasil (worked)
- Spot hangat yang mengikuti pelari utama (angle 0.3, penumbra 0.55, target Object3D di scene) + point light rim jarak pendek memisahkan figur Bolt dari rombongan 8 pelari.
- Kamera tracking dekat-rendah (tinggi 1,8–1,9, jarak 8,2–8,8, fov 32), lalu blend ke sudut depan 3/4 untuk beat berikutnya, supaya framing lomba tidak berulang.
- Set meja ukur (jejak kaki ±41 vs ±45, penggaris 2,47 m) dan speedometer mainan membuat angka abstrak terbaca tanpa suara.

## Yang gagal (failed) + perbaikan (fix)
- Juri r1 3,5: pelari utama tenggelam di rombongan dan framing lomba berulang. Fix: spot pengikut + rim light + blend kamera (lihat atas) → r2 4,0.
- Readability masih 3 di r2: papan in-world OWENS 1936 tampil besar saat VO menyebut 2009, membingungkan saat mute. Episode berikut: papan konteks sejarah hanya muncul saat VO menyebutnya.
- Tiga label (timer + tag 3D BOLT + chip HUD) menumpuk di atas pelari di hook. Aturan: satu label dominan per frame.
- Angka HUD di atas papan 3D wajib panel gelap, dan papan 3D jangan menulis angka yang sama (dobel). Papan in-world selebar ≤ lebar terlihat − margin (9:16 fov 32: lebar ≈ 0,32 × jarak kamera).

## Teknis
- Offset VO: 0 (timeline dari word times Cartesia).
- Komposisi: `Ep06Final` di studio bersama `AUDIRA_FAKTA_OLAHRAGA_2026/studio`, scene di `studio/src/scenes/ep06/`.
- Parameter render: `npm run render:final -- --comp=Ep06Final --vo=public/audio/ep06/vo.wav --sfx=public/audio/ep06/sfx.wav --jobs=2 --concurrency=2 --gl=vulkan --encoder=nvenc` (jobs diturunkan dari 6 ke 2 karena GPU dipakai bersama render EP07–EP10).
- Mix G18: SFX stem −26 LUFS + `volume=-4dB`, VO `loudnorm=I=-16`, duck sidechain ratio 8.
- Render final: 5428 frame dalam 1960 dtk (6 part, 2 paralel).
- QA final: `FINAL_EP06_USAIN_BOLT_9_KOMA_58.mp4`, h264 1080×1920 @ 60, 90,48 dtk, 181 MB. Loudness −13,6 LUFS (toleransi ±0,5 dari −14), true peak −2,2 dBFS, LRA 2,6. Metadata ffprobe: artist "AUDIRA (Agus Dwi R.)", copyright, comment `AUDIRA-usain-bolt-9-58-EP06 | audira.my.id`, date 2026-11-24. Tanda tangan Ed25519 VALID + C2PA. Contact sheet 10 frame dari MP4: `draft/final-sheet.jpg`, outro AUDIRA ada.
- Skor final: self 3,83; juri buta 3,67 (lighting 4, material 4, depth 4, composition 3, motion 4, readability 3). Lebih rendah dari draf r2 (4,0); final tetap diterima karena draf sudah lolos dan render final cukup sekali. Kelemahan menurut juri: timer slow motion 2,81 / 8,27 tanpa label bertabrakan dengan angka VO, timer hook 1,06 saat VO "9,58", label + kartu menumpuk di atas pelari, teks tepi terpotong. Dicatat `append_lesson` failed.
- File perantara dihapus: `studio/out/ep06/test`, `test2`, `draft`, `draft2`, `clip-s3.mp4`.

## Pasca-tayang (24j / 72j / 7h)
Upload: Sabtu, 28 Nov 2026, 19.00 WIB (dikonfirmasi pengguna 2026-11-24). Scheduled task (sekali jalan, mode Auto):
- `review-usain-bolt-9-58-24h` → Minggu, 29 Nov 2026 19.00 WIB
- `review-usain-bolt-9-58-72h` → Selasa, 1 Des 2026 19.00 WIB
- `review-usain-bolt-9-58-7d` → Sabtu, 5 Des 2026 19.00 WIB

| Waktu | Views | Avg durasi/retensi | Hook bertahan? | Komentar |
|-------|-------|--------------------|----------------|----------|
| 24j | | | | |
| 72j | | | | |
| 7h | | | | |
