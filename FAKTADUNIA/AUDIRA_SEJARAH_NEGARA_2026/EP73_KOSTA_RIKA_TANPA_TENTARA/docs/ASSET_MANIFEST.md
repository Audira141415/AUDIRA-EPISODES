# ASSET_MANIFEST — EP73 Kosta Rika Tanpa Tentara

Style: CHRONICLE · Remotion 2D · tanpa foto, tanpa wajah orang nyata, tanpa logo organisasi.

## Kode basis (salin dari gold EP29)
- `src/lib/fig.tsx` (Figure siluet berpose: stand, walk, run, armsUp, crouch, wave, smash, ready, lunge) — tambah pegangan palu/senapan bila perlu.
- `src/lib/set.tsx` (Sky, Fog, Skyline, Finish, MOODS, rng seeded).
- `src/lib/hud.tsx` (DateStamp, Counter, Card, NameTag, Quote, Citation, Medal, BrandPlate — ubah teks default BrandPlate ke "AUDIRA · FAKTA DUNIA").
- `src/brand/AudiraOutro.tsx`, `AudiraSignature.tsx`, `channel.json` (FAKTADUNIA).
- `public/fonts` (Anton, BarlowCondensed, PlusJakartaSans, InstrumentSerif).

## Gambar vektor baru (SVG prosedural, src/lib/costa.tsx)
| Adegan | Aset |
|---|---|
| S1, S3, S5 | Markas/benteng bergerigi (Bellavista): dinding bata + menara jaga |
| S1 | Pos jaga + helm |
| S2a | Peta Amerika Tengah: poligon Nikaragua / Kosta Rika / Panama + label |
| S2b | Senapan siluet, api atap |
| S3 | Palu godam, retakan bertahap, debu |
| S4 | Halaman konstitusi krem + teks serif |
| S5 | Spanduk museum, batang anggaran kinetik |
| S6 | Aula pilar + meja sidang, Medal "1987" |
| S7 | Peta dunia titik seeded |
| S8 | Sekolah tropis, buku |
| semua | Gunung api, palem, dedaunan FG |

## Audio
- VO Cartesia → `project/public/audio/vo.wav` + `vo-words.json`.
- SFX prosedural `npm run sfx` dari `docs/SHOTLIST.md` (G18: stem −26/−27 LUFS).
