# EP09 handover sesi 4 → sesi 5 (2026-11-24)

## Hasil sesi 4 (TOYDIORAMA gagal → ganti style)
- Contact sheet TOYDIORAMA 8 frame: `draft/contact-sheet.jpg` (frame 190,360,612,1065,1722,1995,2250,2490 dari Ep09Preview 30 fps, 540×960). Stills di `draft/cs2/`.
- `npm run audit:visual`: semua ceiling 5 (`draft/look.json`). `npm run audit:camera` klip S4–S5 (`draft/clip_s4s5.mp4`, frame 1500–2099): motion 5/5 (`draft/camera.json`).
- `draft/THEME_CHECK.md` 8/8 `ya` (untuk frame TOYDIORAMA; isi ulang setelah restyle).
- Juri: self 4.17; juri buta putaran 1 = 3.33, putaran 2 = 3.33 → < 3.5 → aturan: GANTI STYLE, ulang tahap 4 (G21). Lesson `failed` sudah dicatat di TOYDIORAMA.
- Keluhan juri (berlaku juga untuk style baru):
  1. Lantai salju/pasir polos + vignette berat → 25–40% bawah frame kosong/gelap.
  2. Crash S1 (hook) dan S4 (KREISEL) memakai set + sudut yang sama → sheet terlihat berulang. Bedakan sudut/lensa S1 vs S4.
  3. S2 pantai (detik ~12, VO "Ini AUDIRA, dan ini kisah nyata tim") tanpa tokoh → tambahkan tim/atlet.
  4. S6 payoff hanya papan skor teks → sertakan kereta/tim Jamaika di frame bersama papan skor.
  5. S5 kereta terpotong di tepi kanan.
- G18c pra-cek audio lolos: VO loudnorm −16,5 LUFS, SFX (stem −20, volume −10 dB, duck ratio 8) −35,0 LUFS → selisih 18,5 LU.
- Perubahan kode sesi 4 di `studio/src/scenes/ep09/Film.tsx`: Timer ±130 S1 `top={560} size={170}`; `StageApron` (papan kayu + footlight, khusus mainan — buang untuk CINESTORY); `SubjectSpot` (spot hangat ke target kamera — boleh dipertahankan); ambient 0.32/0.2; dua sprinter di belakang gerobak S2; kamera crash `front` target `s.x - 0.45`, fov 44.

## Keputusan style baru (AI, tanpa acc)
Style: **CINESTORY** (3D, Remotion + R3F, unggulan). Alasan: kisah underdog nyata yang dramatis → look film sinematik (lampu realistis, grading film, DOF, gerak kamera bermotivasi). Alternatif: PAINTERLY (juri 3.67, overlay sapuan keruh), PANELVERSE (komik). Fallback tool menyarankan GACHAREVEAL/BRUTALFORGE/PAINTERLY (kategori playful) tetapi kecocokan topik rendah. CINESTORY & PANELVERSE belum punya data motion memory.

## Sisa (sesi 5)
1. `audira_motion_style_guide` CINESTORY + baca kit `kits/cinestory/KIT.md`; cover acuan (lihat `F:/AUDIRA-ALL-SKILL/assets/style-covers/README.md`).
2. Tulis ulang `style/STYLE_DECISION.md` (CINESTORY, alasan, alternatif ditolak + alasan, tanggal, approved: no), salin cover acuan, render `style/cover-topic.png` gaya CINESTORY. `audira_episode_status update` data.style = CINESTORY.
3. Ulang tahap 4 (G21): `docs/ART_DIRECTION.md`, `docs/STORYBOARD.md`, `docs/ASSET_MANIFEST.md`, `docs/SHOTLIST.md` dengan baris `Style: CINESTORY`. Naskah + VO tetap (VO TERKUNCI 90,741 dtk, `studio/public/audio/ep09/vo.wav`). SFX `studio/public/audio/ep09/sfx.wav` boleh dipakai ulang (jalankan `npm run sfx` lagi bila shotlist di-retime).
4. Restyle `studio/src/scenes/ep09/` (Film.tsx, Set.tsx, Model.tsx, Cover.tsx): material realistis (GLB dari `E:/ASET/ASSET-AUDIRA/downloads/glb/` via `audira_search_assets`), lampu sinematik, perbaiki 5 keluhan juri di atas. Multi-scene 7 adegan tetap. Batas fakta tetap (atlet BERJALAN di samping kereta, tidak memikul/mendorong; Lillehammer ke-14 dari 30 di atas USA 1 3:29,96 vs 3:29,97; "sekitar 130 km/jam"; four-man 1988 tidak finis; tanpa materi/nama film).
5. Contact sheet 8 frame 540×960 → `draft/contact-sheet.jpg`, audit:visual, audit:camera, isi ulang THEME_CHECK.md, juri self + buta → record_score CINESTORY stage draft (maks 2 putaran).
6. Gerbang tahap 9: tampilkan sheet, skor juri, durasi 90,741 dtk, G18c; minta acc pengguna. Setelah acc: `npm run render:final -- ... --sfx=public/audio/ep09/sfx.wav --vo=public/audio/ep09/vo.wav`, `--concurrency=2`, background; QA; tahap 10.
