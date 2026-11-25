# HANDOFF s2 → s3 — EP01 Kenapa Langit Biru (WORLDFORGE, Remotion + R3F)

## Selesai di s2
- `npm run check-env` OK (Ready). Smoke belum dijalankan.
- `docs/SCRIPT.md` final: 196 kata, 6 babak, koreksi fakta sudah masuk (hampir 6 kali, Tyndall 1869, tanpa Einstein).
- VO Cartesia: `project/public/audio/vo.wav` 82,66 dtk + `vo-words.json` (196 kata) + `vo.timing.json` (`npm run vo` sudah).
  - Catatan: `audira_generate_voiceover` dengan `scriptPath` gagal ("no timed lines"); pakai parameter `text`.
- Film total 86 dtk: VO 0–82,66, outro card AUDIRA 83–86 (`OUTRO_SECONDS = 3`).

## Belum (urutan)
1. `docs/ART_DIRECTION.md`, `STORYBOARD.md` (≥6 baris, kolom `Scene | Waktu | BG/MG/FG/HUD | Kamera | Audio`), `SHOTLIST.md` (format EP56: `| # | Waktu | Objek | Aksi | Kamera | Teks layar | Beat |`, baris `Style:`/`Hook:`/`Offset: 0`), `ASSET_MANIFEST.md`. Semua diawali `Style: WORLDFORGE`. Isi dari tabel adegan di bawah. Tiga file docs sekarang masih template.
2. `project/src/episodes/ep01/Film.tsx` (+ `world.ts`, `Props.tsx`) pola EP56: `F:/AUDIRA-EPISODES/FAKTADUNIA/AUDIRA_SEJARAH_NEGARA_2026/EP56_KURSI_LISTRIK_1890/project/src/episodes/ep56/Film.tsx` (FilmFromConfig, KEYS framing → `frame()` move, kartu HUD, `Subtitle` y=1300, `AudiraSignature seed="sains-anak-ep01-langit-biru"`, `AudiraOutro seconds={3}`, `WORDS` dari `public/audio/vo-words.json`). Daftarkan `LangitBiruPreview` (540×960@30) + `LangitBiruFinal` (1080×1920@60) di `src/Root.tsx`, durasi 86 dtk.
3. Cover topik (`npm run cover`, frame hook) → `style/cover-topic.png`; smoke; `npm run sfx`; `npm run draft`; `audit:visual`; `audit:camera`; `draft/THEME_CHECK.md`; juri buta (`record_score` self lalu jury).
4. BERHENTI di gerbang tahap 9 (contact sheet, skor juri, durasi, G18c), tunggu acc pengguna.

## Temuan API (supaya s3 tidak membaca ulang)
- `templates/FilmFromConfig`: `config.beats`, `startFraming`, `shots` (`{at, move}`; EP56 menaruh semua KEYS di `shots.hook` dan `[]` di beat lain), `scenes` per beat (BeatContent dapat `t, progress, frame, fps`), `overlay(scale, beat, props)`, `fade`, `alive`, `lens`, `hdri`, `profile` (COLOR_PROFILES di `core/render/FinishingPresets.ts`), `envIntensity`, `exposure`, `background`.
- Framing = `{target, az, el, dist, fov}`; posisi kamera = target + dist·(cos el·sin az, sin el, cos el·cos az) (derajat). az 0 = kamera di +z melihat ke −z. el negatif = kamera di bawah target (melihat ke atas).
- `BeatSwitch` hanya me-mount beat aktif.
- Kit WORLDFORGE (`src/kits/worldforge`): `SkyDome({sun, colors})` + `SkyColors {zenith, horizon, glow, halo, ground, sunDisk}` (`Sky.tsx`); terrain = `makeGrid(expAxis(...), expAxis(...), height)` → `bakeSun`/`bakeAO`/`gridNormals` → `gridGeometry` + `makeTerrainMaterial()` (`surface.ts`, pakai atribut `aShade` sun/AO). Resep lengkap ada di `kits/worldforge/example/world.ts` + `Starter.tsx` (salin, ganti height/albedo, cache per kunci). Grid lebih kecil agar cepat: near `expAxis(-400,400,1.5,0.008)`, far `expAxis(-6000,6000,20,0.01)`.
- Konsep sains `core/concepts` (`science.tsx`): `SunDisc({rays})`, `LightBeam({from,to,width,photons,source,color})`, `WaveRibbon({wavelength:"short"|"long"|num, length, color, ruler})`, `AirMolecule({gas:"N2"|"O2", face, mood})`, `ScatterBurst({gas, directions})`. Semua props `f = frame/fps*60`, `palette`, `material`, `position`, `scale`. `decalTexture(text, {bg, ink})` di `core/concepts/parts.tsx` untuk papan teks 3D (brand in-scene, rumus).
- `AssetModel` (`core/assets/AssetModel.tsx`): `id`, `size`, `ground`, `polish`, `tint`, `emissive`, `position`, `rotation`.
- GLB terpilih: `exploration-rover-7afd91` (vehicle, rover Mars), `student-in-a-hoodie-7c8223` / `school-student-385134` (character), `tall-pine-tree-ab4108`, `pine-tree-3ea075`, `rock-outcrop-158ac3`, `field-rock-5e37c6`, `optics-table-66db15`, `write-up-desk-38763a`, `chalkboard-menu-board-a24d9d`, `lab-wall-solid-8bd631`, `lab-floor-tile-ad0da8`, `top-hinged-survival-shutter-cd9054`.
- Memory WORLDFORGE: kartu teks di langit terang wajib panel gelap `rgba(20,14,12,0.82)`, label ≥ 34 px, subjek FG mengisi lebar, horizon y≈630, ToyPerson + rumput datar = plastik (pakai GLB karakter).

## Tabel adegan (waktu dari VO)
| # | Waktu | Adegan / subjek | Kartu HUD |
|---|---|---|---|
| 1 | 0–1,84 | Lanskap Mars senja biru (terrain merah, halo biru di Matahari rendah) | MARS · SENJA BIRU |
| 2 | 1,84–3,0 | Lanskap Bumi siang, langit biru, pinus | BUMI · LANGIT BIRU |
| 3 | 3,0–5,0 | Lanskap Bumi senja oranye-merah | BUMI · SENJA MERAH |
| 4 | 5,0–8,2 | Bumi siang + papan "AUDIRA SAINS" 3D (brand in-scene) | KENAPA KEBALIKAN? |
| 5 | 8,2–12,4 | Angkasa gelap: SunDisc + LightBeam putih + 7 pita spektrum | CAHAYA PUTIH = SEMUA WARNA |
| 6 | 12,4–20,1 | Kamar gelap Newton: shutter berlubang, sinar → prisma kaca segitiga (physical) di meja → kipas 7 warna di dinding | ISAAC NEWTON · 1666 |
| 7 | 20,1–27,9 | Dalam atmosfer (latar biru gradasi): AirMolecule N2/O2 + LightBeam + WaveRibbon jauh lebih besar | N₂ & O₂ · ±1.200× lebih kecil dari gelombangnya |
| 8 | 27,9–31,3 | ScatterBurst besar | BIRU TERPENTAL KE SEGALA ARAH |
| 9 | 31,3–37,3 | WaveRibbon biru pendek vs merah panjang + molekul | hitung naik "≈ 6×" · biru 450 nm vs merah 700 nm · ∝ 1/λ⁴ |
| 10 | 37,3–41,5 | Bumi siang, siswa GLB menatap langit, berkas biru dari banyak arah ke matanya | BIRU YANG NYASAR |
| 11 | 41,5–47,9 | Lab: optics-table, tabung kaca, sinar di dalamnya kebiruan | JOHN TYNDALL · 1869 |
| 12 | 47,9–51,4 | Lab: papan tulis rumus "I ∝ 1/λ⁴" (decalTexture) | LORD RAYLEIGH · 1871 |
| 13 | 51,4–59,2 | Grafik 3D batang: cahaya Matahari per warna (ungu kecil, puncak hijau-biru) + kepekaan mata | KENAPA BUKAN UNGU? · Matahari sedikit ungu · mata kurang peka |
| 14 | 59,2–63,8 | Globe Bumi + cangkang atmosfer: sinar siang pendek vs sinar senja panjang, titik biru rontok di sepanjang jalur | ±38× LEBIH TEBAL |
| 15 | 63,8–66,4 | Bumi senja merah-oranye | BIRU HABIS DI JALAN |
| 16 | 66,4–72,9 | Mars siang oranye berdebu + rover | MARS · UDARA TIPIS + DEBU → siang oranye, senja biru |
| 17 | 72,9–76,6 | Mars senja biru + siluet rover | CURIOSITY · 15 APRIL 2015 · Kawah Gale |
| 18 | 76,6–83 | Bumi siang hero, papan AUDIRA SAINS | LANGIT TIDAK BERWARNA → CAHAYA YANG TERSESAT → IKUTI AUDIRA SAINS |
| 19 | 83–86 | AudiraOutro | — |

Beat: hook 0–8,2 · context 8,2–20,1 · main 20,1–41,5 · explanation 41,5–66,4 · payoff 66,4–76,6 · outro 76,6–86.

Langit-senja SkyColors usulan: EARTH_DAY zenith #2f6fd0 horizon #bcd6ef glow #fff4dc halo #ffffff ground #5d6b45; EARTH_SUNSET zenith #3a4f86 horizon #ff8a3d glow #ff5a1f halo #ffd08a ground #3a2a22; MARS_DAY zenith #c9905e horizon #e8b98a glow #f3d0a0 halo #fff0d8 ground #8a4a2a; MARS_SUNSET zenith #4a3a35 horizon #8a6a55 glow #5f86c0 halo #a8d0ff ground #3a2218.
