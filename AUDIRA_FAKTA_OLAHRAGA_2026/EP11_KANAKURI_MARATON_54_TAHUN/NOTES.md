# NOTES — Kanakuri, Maraton 54 Tahun (`EP11`)

> Tahap 9–10. Style CHRONICLE · Remotion + R3F · 9:16 · film 91,44 dtk (VO selesai 87,42 dtk). Acc render final pengguna 2026-11-25 ("Gas, render final").

## Skor
- Draf, juri buta putaran 1: **3,83 LOLOS** — lighting 4, material 3, depth 4, composition 3, motion 5, readability 4. Skor ini diambil sebelum poles terakhir (Hakone backlit + selempang besar, tiang papan mundur, vignette).
- Final, juri buta: **3,83 LOLOS** — lighting 4, material 3, depth 4, composition 4, motion 4, readability 4 (self 3,67). Terlemah: frame 82,9 dtk, pelari putih terpotong tepi kanan, dan figur manekin polos.
- QA final kedua (render 00.15): `audira_qa_video` hardOnly PASS dengan 11 perubahan di `allow`: 9 `<Flash>` sengaja + 2 perubahan kecil di 1,55 dtk yang tertutup jendela `allow` 1,6 dtk (luma rata-rata hanya turun 0,6, penyebabnya tidak dilacak). 15 perubahan di area partikel tidak dicek satu per satu.
- Ukur final: 1080×1920 @ 60, 91,44 dtk, −13,6 LUFS (target −14, dalam toleransi 0,5 LU `deliver.mjs`), TP −2,3 dBFS, tanda tangan Ed25519 VALID.
- Review terjadwal: `review-kanakuri-maraton-54-tahun-24h` (4 Des 19.00), `-72h` (6 Des 19.00), `-7d` (10 Des 19.00). Upload Kamis 3 Des 2026 19.00 WIB, dikonfirmasi pengguna 2026-11-25.

## Yang berhasil (worked)
- Dua momen kembar (start 1912, finis 1967) memakai siluet kontur emas yang sama, jadi tokoh terbaca tanpa wajah.
- Papan waktu menyalakan satu baris per kata VO (54 tahun, 8 bulan, 6 hari, 5 jam, 32 menit, 20,3 detik).

## Yang gagal (failed) + perbaikan (fix)
- Final pertama gagal `audira_qa_video` hardOnly. Dua glitch nyata:
  - 82,43 dtk: pelari cepat dipasang dengan `t > ...` tepat di depan kamera, jadi siluet raksasa muncul dalam satu frame. Fix: pelari masuk dari belakang kamera dengan offset x (`RoadEndSet`, `sets2.tsx`).
  - 17,75 dtk: kapal berganti kereta dalam satu frame dan progres rute melompat 0,235 ke 0,27. Fix: kapal mengecil, kereta membesar, progres rute kontinu (`MapSet`, `sets.tsx`; `mapP`, `Film.tsx`).
- Sembilan LONCAT lain adalah `<Flash>` yang sengaja dipasang pada kata VO (1,6 / 26,87 / 66,47 / 68,25 / 69,68 / 70,58 / 71,48 / 72,23 / 73,28), masuk `allow`.
- `qa_video` seharusnya dijalankan di klip draf sebelum acc, bukan baru di final.

## Teknis
- Offset VO: 0 (kata pertama 0,10 dtk; SRT memakai `audio/timeline.json` langsung).
- G14: `rig-audit.json` tidak ada karena rig ada di `Film.tsx`, bukan modul pose `.ts`. Pengukuran pengganti: klip 13–24 dtk audit:camera 4/5 (peta B2 31 perubahan kecepatan mendadak), klip 58–76 dtk 5/5. `render:final` tidak menolak.
- G19: `audira_qa_scene` diganti `audira_qa_video` hardOnly pada MP4 final.
- Satu run `audit:visual` CHRONICLE terlanjur tercatat di motion memory dengan label `kit-lab-2026-11-24`, seharusnya `fakta-olahraga-EP11`.
- Slug metadata: `kanakuri-maraton-54-tahun`, mengikuti pola EP01–EP10 (`AUDIRA-<slug>-EPnn`).
