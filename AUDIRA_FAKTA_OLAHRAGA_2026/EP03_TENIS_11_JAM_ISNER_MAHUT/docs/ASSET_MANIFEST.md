# Asset Manifest — EP03 Tenis 11 Jam: Isner vs Mahut

| Aset | Jenis | Sumber | Dipakai di | Lisensi / catatan |
|---|---|---|---|---|
| `stand-roof-run-cfd457.glb` | GLB building | Polyfork katalog lokal `E:/ASET/ASSET-AUDIRA/downloads/glb/building/` → `studio/public/glb/` | S1, S3, S6, S8 (tribun) | Polyfork CC0 |
| `advertising-hoarding-run-efe4bc.glb` | GLB prop | Polyfork → `studio/public/glb/` | cadangan papan pinggir | Polyfork CC0 |
| ToyPerson (Isner, Mahut, wasit) | prosedural | `studio/src/core/polish/Person.tsx` | semua scene pemain | AUDIRA kit; tanpa wajah realistis/logo |
| Studio virtual (meja, LED wall) | prosedural | resep kit `AUDIRA-SKILL-MOTION/starter/src/kits/broadcastforge/scene/*` (port ke `scenes/ep03/`) | S2 | AUDIRA kit |
| Lapangan rumput, net, garis, dinding AUDIRA, papan skor lapangan, raket, bola | prosedural (canvas texture deterministik) | `studio/src/scenes/ep03/court.tsx` | S1, S3–S8 | buatan sendiri |
| Grafis siaran (LIVE bug, jam durasi, score bug, ticker, headline, stamp) | HTML overlay | `studio/src/scenes/ep03/hud.tsx` | semua | buatan sendiri |
| Barlow Condensed ExtraBold/SemiBold | font | `studio/public/fonts/` | grafis | SIL OFL |
| Manrope | font | `studio/public/fonts/` | cadangan | SIL OFL |
| HDRI `kloofendal_48d_partly_cloudy_puresky_1k.hdr` | HDRI | `studio/public/hdri/` | refleksi | Poly Haven CC0 |
| VO | audio | Cartesia, voice `04b567df-2923-4b0c-896b-4b7df0a07e1a` | semua | AI, dicatat di label konten AI |
| SFX | audio | `npm run sfx` (prosedural dari SHOTLIST + timing VO) | semua | buatan sendiri, −20 LUFS stem |
| Outro card | SVG | `shared/assets/brand/audira-outro-card.svg` via `AudiraOutro` | 3,8 dtk terakhir | AUDIRA |
| Tanda tangan bergerak | TSX | `studio/src/brand/AudiraSignature.tsx`, seed `olahraga-EP03` | dari 3 dtk sampai outro | AUDIRA |

Tidak ada foto, logo Wimbledon/AELTC/IBM/sponsor, atau rekaman siaran asli.
