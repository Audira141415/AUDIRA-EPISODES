# ASSET_MANIFEST — Pit Stop F1 1,80 Detik (`EP04`)

Style: TOYDIORAMA

| Aset | Jenis | Sumber | Dipakai di | Lisensi |
|---|---|---|---|---|
| `service-bay-garage-aaf8e0.glb` | GLB building | katalog lokal `E:/ASET/ASSET-AUDIRA/downloads/glb/building/` → `studio/public/glb/` | S1, S3, S6 (garasi) | Polyfork catalog (lisensi katalog AUDIRA) |
| `tire-ccf0eb.glb` | GLB prop | katalog lokal `prop/` | FG ban di semua babak modern | Polyfork catalog |
| `oil-drum-386c30.glb` | GLB prop | katalog lokal `prop/` | dekor pit box | Polyfork catalog |
| `traffic-cone-c421e4.glb` | GLB prop | katalog lokal `prop/` | FG pit box, S2 jalur pit | Polyfork catalog |
| `checkered-flag-81784a.glb` | GLB prop | katalog lokal `prop/` | S2 lintasan Qatar | Polyfork catalog |
| `traffic-light-5e5ae6.glb` | GLB prop | katalog lokal `prop/` | S2 lampu jalur pit (opsional) | Polyfork catalog |
| Mobil F1 mainan (teal) | prosedural | `studio/src/scenes/ep04/PitSet.tsx` `ToyF1` | S1–S4, S6 | kode AUDIRA |
| Mobil generik navy (rekor 2019) | prosedural | `ToyF1` dengan livery navy | S4 | kode AUDIRA |
| Mobil 1957 bermesin depan | prosedural | baru di `scenes/ep04/` | S5 | kode AUDIRA |
| Kru, pembalap, mekanik 1957 | `ToyPerson` | `core/polish/Person.tsx` | semua babak | kode AUDIRA |
| Font Anton, Space Grotesk | font | `studio/public/fonts` | HUD, caption | OFL |
| Outro card + AudiraSignature | brand | `studio/src/brand/` | akhir film, seluruh film | milik AUDIRA |
| VO | audio | Cartesia `04b567df-2923-4b0c-896b-4b7df0a07e1a` | seluruh film | Cartesia (AI, diberi label) |
| SFX | audio prosedural | `npm run sfx` | seluruh film | prosedural AUDIRA |

Katalog GLB tidak punya mobil F1 (dicek 2026-11-22: hanya mobil jalan 60–80an), jadi mobil hero dibuat prosedural.
