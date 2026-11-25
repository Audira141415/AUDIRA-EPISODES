# Asset Manifest — EP03 RAHASIA SUMUR ZAMZAM

Semua geometri dibuat prosedural di kode (tanpa model 3D unduhan, tanpa gambar AI).

## Kode adegan (`project/src/scenes/zamzam/`)
| File | Isi |
|---|---|
| `layout.ts` | Ukuran (meter) dan palet bersama potongan pahlawan |
| `World.tsx` | Potongan pahlawan: lapisan diekstrusi dengan rongga sumur/basement, lapisan batu, air, pompa, pipa, kaca, tangga + segel, sensor, terowongan, gedung, hujan, vitrine, Ka'bah, kerumunan tawaf, arkade; `HeroState` |
| `state.ts` | Waktu → keadaan potongan pahlawan (ditambat kata) |
| `ch02.tsx`–`ch08.tsx` | Set bab: lembah, sumur tertimbun, kepala sumur lintas zaman (+ plakat AUDIRA), pabrik Kudai + peta, lab, ekspor |
| `kit.tsx` | Plinth, pipa, tempayan, kijang, pelat teks |
| `cam.ts` | Jalur kamera, cut, proyektor label |
| `time.ts` | Timeline, `at()` kata, peta waktu short |
| `ui.tsx` | Caption, kartu bab, tag, panel, penghitung, end screen, outro, kartu short |
| `ZamzamFilm.tsx` | Komposisi film (mode long / short01 / short02) |
| `ZamzamCover.tsx` | Cover topik (Stage A) |
| `timeline.json`, `short01.json`, `short02.json` | Salinan timeline terkunci dan peta short |
| `shorts.py`, `mix.py` | Penyusun suara short, bed dan mix |

## Tekstur prosedural (canvas, seeded)
Ubin marmer, blok pasangan batu, diorit bintik, mosaik kubah, strip pH, layar X-ray, pelat teks (Manrope). Grain permukaan dari `core/polish/Polish.tsx` (`useSurfaceGrain`).

## Aset bersama
| Aset | Sumber | Lisensi / catatan |
|---|---|---|
| Font Manrope 200–600 | `project/public/fonts/` | SIL OFL (`OFL-manrope.txt`) |
| HDRI `studio_small_09_1k.hdr` | `project/public/hdri/` | CC0 (Poly Haven) |
| Logo `brand/stacked-reversed.svg` | `project/public/brand/` (logo AUDIRA Monolit) | milik AUDIRA |
| `src/brand/AudiraSignature.tsx` | `F:/AUDIRA-ALL-SKILL/assets/brand/` | tanda tangan bergerak, seed `sejarah-makkah-ep03`, handle `@audira` |
| SFX whoosh-cinematic, chime, riser, impact-bass-1, sparkle | `F:/AUDIRA-VIDEO-MOTION/shared/assets/sfx/` | pustaka SFX AUDIRA (`catalog.json`) |
| Musik | disintesis di `mix.py` (numpy) | orisinal, tanpa lisensi pihak ketiga |
| Suara | Cartesia sonic-3, Galang | dibuat AI (label konten AI wajib saat upload) |

## Skrip pemeriksaan yang disalin dari starter
`project/scripts/rig-audit.mjs`, `project/scripts/camera-audit.mjs`, `project/scripts/lib/camera-metrics.mjs` (dari `F:/AUDIRA-SKILL-MOTION/starter/scripts/`).

## Output Stage B
- Draf: `draft/DRAFT_LONG_A.jpg`, `draft/DRAFT_LONG_B.jpg`, `draft/DRAFT_SHORTS.jpg`; still per bab di `project/out/draft/<bab>/`.
- Audio: `project/public/audio/{vo,bed,full,short01_vo,short01_bed,short01_full,short02_vo,short02_bed,short02_full}.wav`.
