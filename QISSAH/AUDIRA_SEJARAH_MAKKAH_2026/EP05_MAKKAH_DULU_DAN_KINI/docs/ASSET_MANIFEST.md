# Asset Manifest — EP05 MAKKAH DULU DAN KINI

Semua visual dibuat secara prosedural di proyek ini (Remotion + React Three Fiber). Tidak ada foto, video stok, atau gambar AI generatif.

## Kode adegan (`project/src/scenes/makkah/`)
| Berkas | Isi |
|---|---|
| `film.tsx` | Film panjang `MakkahFilm`, short `MakkahShort01/02`, kamera spline, cahaya, kartu, caption, end screen, outro |
| `tl.ts`, `timeline.json` | Salinan `audio/timeline.json` dan helper waktu (bab, kata) |
| `hub.tsx` | Maket lembah: medan, Ka'bah, Maqam, riwaq per era, rumah batu Makkah (roshan kayu, parapet, jendela), blok modern, Bukit Bulbul, Benteng Ajyad, Abraj Al-Bait (naik bertahap), plakat AUDIRA |
| `sets.tsx` | Set Zubaidah (rute, potongan tanah, saluran, lubang, koin) dan peta laut (garis pantai tangan, rute, kapal layar, kapal uap, armada, pesawat, mimbar + kitab) |
| `parts.tsx` | Label gravir billboard, air gravir, garis arus, tali ukur, hujan, riak |
| `engraving.ts`, `textures.ts` | Shader gravir, langit gravir, muka jam (tanpa teks) |
| `ch/ch00.tsx` … `ch/ch09.tsx`, `ch/common.tsx` | Satu berkas per bab: kunci kamera, status maket, objek ekstra, kartu data |
| `shorts.py`, `short01.json`, `short02.json` | Perakitan narasi short dan jam short |
| `mix.py` | Bed musik, ambience, dan SFX, beserta penggabungan dengan VO |
| `MakkahCover.tsx`, `MakkahWorld.tsx`, `ShipVignette.tsx` | Cover topik yang sudah disetujui (16:9 dan 9:16) |

## Aset bersama
| Aset | Sumber | Lisensi |
|---|---|---|
| `project/public/brand/stacked-reversed.svg` | `shared/assets/brand/` (logo AUDIRA) | milik AUDIRA |
| `project/src/brand/AudiraSignature.tsx` | `F:/AUDIRA-ALL-SKILL/assets/brand/` | milik AUDIRA |
| `public/hdri/brown_photostudio_02_1k.hdr` | starter (Poly Haven) | CC0 |
| SFX `whoosh-cinematic`, `chime`, `impact-bass-1`, `riser` | `shared/assets/sfx/` (katalog AUDIRA) | pustaka internal AUDIRA |
| Font Georgia | font sistem Windows | dipakai untuk render |
| Musik | disintesis di `mix.py` (numpy) | orisinal, milik AUDIRA |

## Data di layar
Setiap angka dan kutipan di kartu berasal dari `research/SOURCE_REGISTER.md`, dengan hedging dari tabel Sengketa. Sumber untuk kartu-kartu yang berupa kutipan:
- QS Ibrahim 14:37 (terjemahan Kemenag) [S03]
- Al-Azraqi [S11]
- Saudi Gazette (Ali Al-Awadhi) [S16]
- Musfir Al-Umairi [S15]
- riwayat Zubaidah [S19]
- Kemenag (Ahmad Khatib) [S24][S25]
- Turki dan Saudi (Ajyad) [S27–S29]
- GASTAT [S45][S46]
- Kemenhaj [S48]

Foto arsip 1941 dan foto Ahmad Khatib **tidak dipakai** dan direkonstruksi tanpa sosok.
