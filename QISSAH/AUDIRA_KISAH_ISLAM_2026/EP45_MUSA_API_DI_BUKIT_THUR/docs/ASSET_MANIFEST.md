# ASSET_MANIFEST — Musa dan Api di Bukit Thur (`EP45`)

Style: PAPERWORLD

Kit: `F:/AUDIRA-SKILL-MOTION/kits/paperworld` (salin lewat `new-project.mjs --kit=paperworld`). Gold acuan: `kits/paperworld/gold/short-baru-11-23-EP18` (GOLD.json, cover.json, code/).
GLB lokal: `E:/ASET/ASSET-AUDIRA/downloads/glb/` via `<AssetModel id assetType>`; semua GLB diberi material `paperFace` supaya terbaca kertas.

## GLB (model nyata)
| Aset | ID / path | Scene | Catatan |
|---|---|---|---|
| Domba | `animal/sheep-base.glb` | S2, S8 | 3–4 ekor, instance, warna krem |
| Kambing | `animal/goat-base.glb` | S2 | 2 ekor |
| Unta | `animal/camel-base.glb` | S2, S8 | 1 ekor bawa perbekalan |
| Api unggun | `prop/campfire-4390aa.glb` | S1, S3, S8 | kayu; lidah api = kartu kertas + pointLight |
| Tenda | `prop/canvas-ridge-tent-f0df0d.glb` | S2, S8 | ShearPop |
| Lentera tangan | `attachment/hand-lantern-cdbe1a.glb` | S3 | pointLight kecil |
| Semak gurun | `prop/creosote-bush-5b17d5.glb` | S1–S3 FG | DOF FG |
| Semak berduri | `prop/bare-thorn-bush-91a238.glb` | S4 FG, S5 | |
| Batu basal | `prop/basalt-boulder-a1929c.glb` | S2–S5 | jalan setapak, occluder reveal S4 |
| Lantai gurun | `prop/desert-floor-tile-cf69a2.glb` | S2 | opsional bila pasir Cut kurang detail |

## Komponen kit PAPERWORLD (procedural kertas, bukan primitif polos)
| Aset | Komponen | Scene |
|---|---|---|
| Lapis gunung + bukit pasir | `PaperHill`, `Cut` + `S.hill` | semua |
| Langit bintang + bulan | `Cut` + `S.circle` holes, `Thread` | S1, S2, S8 |
| Pohon bercahaya | `PaperTree` (cloud/round) 3 lapis + emissive holy | S4–S6 |
| Figur Musa (tanpa wajah, bertudung) | `PaperCharacter` dengan kepala tudung, `colors` cokelat/krem, `curl:false` | S2, S3, S5, S7 |
| Keluarga & Harun (siluet) | `PaperCharacter` skala kecil, tanpa wajah | S2, S7 |
| Tongkat | `Cut` batang + serat | S3, S5 |
| Ular | rantai segmen `Cut` + `S.path` bersisik cetak (`Print`) | S5 |
| Terompah | `Cut` + `Print` tali | S4 |
| Tangan + lengan jubah | `Cut` + `Hinge` lipatan, emissive | S6 |
| Istana + piramida Mesir | `PaperBuilding` (`facadeOnly`), `S.poly` | S7 |
| Pita ayat & label HUD | pita kertas sobek (overlay React/SVG) | semua |
| Papan "AUDIRA QISSAH" + cap AUDIRA di kotak perbekalan | `Cut` + `Print` | S2, S8 |

## Audio
| Aset | Sumber | Catatan |
|---|---|---|
| VO | Cartesia Galang `04b567df-2923-4b0c-896b-4b7df0a07e1a`, sonic-3, id | teks `work/vo.txt`, 198 kata |
| SFX | `npm run sfx` (prosedural dari SHOTLIST + timing VO) | whoosh tiap potongan, pop teks, satu riser + impact di S7; stem −26 LUFS |
| Musik | tidak ada (adab kisah nabi, sama seperti seri) | ambient angin + crackle api dari SFX |

## Brand
- `shared/assets/brand/audira-outro-card.svg` (outro 2–3 dtk terakhir)
- `AudiraSignature` seed `kisah-islam-EP45`, handle `@AUDIRAQISSAH` (dari channel, jangan diketik manual)
- Wordmark channel: `F:/AUDIRA-EPISODES/CHANNEL_BRAND/channel-brand-audira-qissah/src/wordmark-reversed.svg`

## Font
Anton (HUD), Lora Italic (ayat), font caption starter.
