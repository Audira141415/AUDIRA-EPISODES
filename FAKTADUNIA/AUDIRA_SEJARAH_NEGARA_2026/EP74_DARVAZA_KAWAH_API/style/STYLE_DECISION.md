# STYLE DECISION — EP74 Darvaza, Lubang Api Sejak 1971

Style: WORLDFORGE

- **Tanggal:** 2026-11-25
- **Engine:** Remotion 4 + React Three Fiber (3D)
- **Style terpilih:** WORLDFORGE (dunia luar ruang yang bisa dijelajahi: terrain, langit, cahaya matahari)
- **Dipilih oleh:** AI (batch 10 short otonom 2026-11-25), sesuai keputusan pengguna 2026-11-23: style + engine dipilih AI tanpa acc
- **approved (style):** yes (tanpa gerbang; acc render final sudah diberikan pengguna lebih dulu untuk batch 2026-11-25)

## Alasan

Cerita Darvaza adalah cerita tempat: gurun pasir yang luas, satu lubang menyala di tengahnya, dan perubahan dari siang (pengeboran 1971) ke malam (api) lalu fajar (api meredup). WORLDFORGE dibuat untuk terrain, langit, dan matahari yang bergerak, jadi gurun Karakum, rute dari Ashgabat, kawah berpenampang, dan sumur-sumur baru bisa dibangun di satu dunia yang konsisten. Api yang menyala di kawah gelap memberi cahaya kontras yang kuat, menutup kelemahan WORLDFORGE yang tercatat (siang datar).

Kit dipakai sebagai resep terrain + cahaya, bukan lingkungan default: tidak ada benteng/kota contoh kit; lingkungan = bukit pasir Karakum.

## Alternatif yang ditolak

| Style | Alasan tidak dipilih |
|---|---|
| DISASTERSIM | Kuat untuk penampang bencana, tetapi rata-rata juri final 3,67 dan kelemahan tercatat (adegan gelap abu-abu, kawah tak terlihat). Penampang kawah tetap dipinjam sebagai satu adegan (S5) di dalam dunia WORLDFORGE. |
| CHRONICLE (2D) | Cocok untuk kronologi 1971→2025, tetapi topiknya visual-spasial (lubang menyala di gurun); 2D kehilangan skala dan cahaya api. |

## Parameter dari motion memory

- Wajib diterapkan: matahari rendah (raking) dengan bayangan panjang untuk adegan siang/fajar; tekstur detail pada terrain (surface.ts), bukan warna polos; subjek ≥ 50% lebar frame (lebar frame 9:16 ≈ 0,39 × jarak pada FOV 38); kartu HUD gelap rgba(20,14,12,0.82) + label ≥ 34 px; maks 1–2 kartu per beat; sprite asap/api dengan fade-in/out 0,5 dtk; jangan kamera menembus geometri kawah; render final --concurrency=1, part pendek.
- Parameter terbaik: Finish DOCUMENTARY_WARM, exposure 1, envIntensity 0,55, AO on, hdri "sky" (adegan malam: env dari shader langit, exposure dinaikkan).
- Hindari: siang datar tanpa rim, aset low-poly besar tanpa tekstur sebagai subjek utama close-up, aerial dengan subjek kecil di bidang kosong, payoff dengan subjek kecil.

## Hero GLB (G17)

- Hero lingkungan: kawah prosedural (heightfield `height(x,z)` kit) dengan lantai api emisif; satu kawah yang sama di semua adegan gurun.
- Hero GLB: `core-drill-rig-3b355e` (rig 1971, juga sumur baru 2025, diberi tint berbeda).
- Pendukung: `military-cargo-truck-652f66`, `canvas-wall-tent-de8a04`, `oil-drum-386c30`, `regolith-boulder-1f1f14`, `rope-coil-and-harness-5b51d5`, `spoil-heap-9aaa11`. Detail di `docs/ASSET_MANIFEST.md`.

## Cover

- `cover-reference.jpg` — quality-bar WORLDFORGE (`F:\AUDIRA-SKILL-MOTION\references\quality-bar\worldforge.jpg`).
- `cover-topic.png` — dirender di Sesi B setelah scaffold: frame hook (kawah menyala malam hari dari udara) + teks "GERBANG NERAKA" dan kartu "MENYALA SEJAK 1971".
