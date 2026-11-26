# STYLE_DECISION — Kisah Bilal bin Rabah (EP18)

- **Tanggal:** 2026-11-25
- **Engine:** remotion (2D, SVG kertas berlapis)
- engine: remotion
- **Style terpilih:** PAPERWORLD
- **Alasan (awam, terkait topik):** Dunia diorama potongan kertas membuat siluet tanpa wajah terlihat wajar, sesuai adab visual sahabat. Batu, pasir, rantai, atap Madinah, dan Ka'bah bisa dibangun konkret berlapis, lalu cahaya putih terik di awal berubah jadi fajar emas saat azan. Katalog GLB hampir tidak punya aset Makkah atau Madinah (docs/ASSET_CANDIDATES.md), jadi 2D.
- **Skor tercatat:** juri final rata-rata 3.89; gold short-baru-11-23-EP18 (4.17). Termasuk 17 style unggulan.
- **Alternatif ditolak:** ISLAMICDOCUMENTARY — skor juri 3.59, flat 2D lemah pada narasi satu lokasi; HISTORYMAP — kuat untuk peta, tetapi kisah ini tentang satu orang, bukan wilayah; STAINEDGLASS — megah, tetapi belum pernah dinilai juri dan panel kaca sulit menceritakan aksi batu di dada.
- **Cover referensi:** cover-reference.jpg
- **Cover topik:** cover-topic.png — dirender di Sesi B dari frame hook film (proyek Remotion belum ada di fase A)
- **approved:** yes (dipilih AI dan dilaporkan; aturan 2026-11-23, acc pengguna hanya di gerbang render final)

## Parameter dari motion memory (PAPERWORLD)
- Wajib: kartu berdinding tepi gelap (5.5, 7.5) + tepi potong pucat + rim 3.4 px; serat feTurbulence multiply 0.55; bayangan jatuh panjang searah 26–34 / 36–46 px; haze krem hanya antara BG dan MG (parallax 0.35–0.4); FG DOF blur 9 di sudut bawah; orbit elips per scene (s 1.045 + 0.006·lt, x ±22·sin1.3lt, y 34·cos1.3lt); push-in linear sampai akhir scene; export rigPose (G14).
- Cahaya: krem #FFF4DE op ≤ 0.62, beam ≤ 0.45, impact ≤ 0.42 (clipHi 0). Key light terarah + pool cahaya per adegan sejak awal.
- Audio: TARGET_LUFS -28 di sfx/cues/auto.py (PYTHONUTF8=1), ukur G18c dengan render-final.
- Hindari: semua frame satu template (kartu atas + diorama mid-wide + caption bawah); figur kerucut halus; plakat kosong; label peta di luar x 60–1020 atau menempel di atas caption; peta top-down datar; dua frame yang hanya beda zoom.
