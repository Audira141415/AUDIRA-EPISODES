# ASSET MANIFEST — Yusuf Dibuang ke Sumur (EP44)

Style: PAPERWORLD  <!-- G21 -->

Engine 2D Remotion SVG: semua visual prosedural (dibuat di kode, tanpa file gambar/GLB). Tidak ada aset berlisensi pihak ketiga.

| Aset | Jenis | Sumber / file | Dipakai di | Catatan |
|---|---|---|---|---|
| Langit kertas (malam/senja/pagi/fajar) | SVG gradien | `project/src/ep44/scenes.tsx` `Frame bg` | semua | warna per bab (ART_DIRECTION) |
| Bintang 5 sudut ×11, matahari, bulan sabit | SVG `P`/`Layered` | `pieces.tsx` `Star5`, `Moon`, `Sun` | S1, S12 | "menunduk" = miring + turun |
| Figur berjubah tanpa wajah (Yusuf, Ya'qub, saudara) | SVG `Layered` | `pieces.tsx` `Robed` | S1–S12 | crease jubah, tepi potong; adab tanpa wajah |
| Sumur batu (mulut + potongan) | SVG `Layered` | `pieces.tsx` `WellMouth`, `WellSection` | S1, S5, S7, S10 | hero S7 |
| Kemah bergaris + pelita | SVG `Layered` | `pieces.tsx` `Tent2`, `Lamp` | S2, S3, S4, S9 | |
| Bukit pasir | SVG `Drift`/`Dune` | `pieces.tsx` | semua | |
| Pohon gelap + mata serigala | SVG | `pieces.tsx` `DarkTree`, `WolfEyes` | S6 | |
| Gulungan sketsa sumur | SVG | `pieces.tsx` `Scroll` | S5 | |
| Baju bernoda merah | SVG `Layered` | `pieces.tsx` `Shirt` | S8, S9 | noda kertas, bukan darah realistis |
| Unta + kafilah | SVG `Layered` | `pieces.tsx` `Camel` | S10, S12 | |
| Timba + tali | SVG | `pieces.tsx` `Bucket` | S10 | |
| Koin dirham + telapak tangan | SVG | `pieces.tsx` `Coin`, `Palm` | S11 | |
| Pita kaligrafi emas | SVG + teks Latin | `scenes.tsx` S9 | S9 | tanpa tulisan Arab buatan |
| Semak/batu FG blur DOF | SVG blur 9 | `pieces.tsx` `FGBrush` | semua | lesson PAPERWORLD |
| Serat kertas + mottle | SVG feTurbulence | `Film.tsx` `Fiber` | semua | |
| Font Anton, Manrope | font lokal | `src/core/type/` | HUD, caption | |
| Outro card AUDIRA | SVG brand | `public/brand/audira-outro-card.svg`, `src/brand/AudiraOutro.tsx` | akhir 2,9 dtk | |
| Tanda tangan bergerak | komponen | `src/brand/AudiraSignature.tsx` seed `yusuf-sumur-ep44` | seluruh film | |
| VO | Cartesia `04b567df-…` | `public/audio/vo.wav` + `vo-words.json` | master clock | Sesi B |
| SFX | prosedural | `npm run sfx` → `public/audio/sfx.wav` | whoosh/pop/riser/impact | Sesi B, G18 −26 LUFS |
