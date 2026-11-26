# STYLE_DECISION — Dua Kali Khalid bin Walid Mundur (EP19)

- **Tanggal:** 2026-11-25
- **Engine:** Remotion + React Three Fiber (3D)
- engine: remotion
- **Style terpilih:** HISTORYMAP
- **Alasan (awam, terkait topik):** Ceritanya bergerak di satu peta: Madinah di selatan, Mu'tah di tengah, Syria di utara. Meja peta perang membuat penarikan pasukan terbaca tanpa suara. Pasukan diwakili panji, kuda, dan tenda, jadi tidak ada sosok sahabat yang digambar (adab visual).
- **Skor tercatat:** juri final Remotion 4.11 (3 episode, 3 lolos); topik Islam 4.0 (1 episode); gold sejarah-sepak-bola-EP01 4.33 (3D). Skor recommender 82.4, dipakai 13 episode lintas seri.
- **Alternatif ditolak:** TACTICBOARD (82.7) — papan olahraga, terlalu ringan untuk gugurnya sahabat; CHRONICLE (3.83) — 2D datar, material lemah; PAPERWORLD (3.96) — dipakai EP18, kuat untuk kisah satu orang, lemah untuk pergerakan pasukan. ASSET_CANDIDATES menyarankan 2D karena GLB figur Arab tidak ada; masalah itu hilang karena film ini tidak memakai figur manusia.
- **Cover referensi:** cover-reference.png
- **Cover topik:** cover-topic.png — dirender di Sesi B dari frame hook film (proyek Remotion belum ada di fase A)
- **approved:** yes (dipilih AI dan dilaporkan; aturan 2026-11-23, acc pengguna hanya di gerbang render final)

## Parameter dari motion memory (HISTORYMAP)
- Wajib: Finish DOCUMENTARY_WARM, exposure 1, envIntensity 0.55, ao=false; warm spot pool di peta bawah setelah hook; satu prop + satu kartu HTML per frame, kartu di dalam frame; label peta ±1.6x lebih besar; subjek diberi nama saat VO menyebutnya.
- Kamera: jarak ≥ 8 untuk adegan peta; sudut berubah nyata (oblique, top-down, close) supaya diversity ≥ 30; push-in lt*0.035–0.06, jangan diam; potong scene ≥ 0.5 dtk setelah kata terakhir babak.
- Tekstur: serat kertas di sheet peta; relief dari seeded peak, bukan sin periodik.
- Audio: TARGET_LUFS -28 di sfx/cues/auto.py, jalankan `PYTHONUTF8=1 npm run sfx`, ukur G18c (≥ 12 LU).
- GLB ber-rig (horse-base, camel-base): clone lewat SkeletonUtils.clone.
- Hindari: stempel 3D di atas prop, kartu terpotong tepi, label padat, glyph `≠`, caption satu kata yatim, tanda tangan menimpa judul, dua frame yang hanya beda zoom, balok polos sebagai data.
- Render: --jobs=3 bila GPU dipakai sesi lain; hapus handle "@audira" di file starter sisa (channel gate).
