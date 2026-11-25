# EP75 Son Doong — rencana build film (Sesi B s2 → s3)

## Sudah selesai di s2
- Tahap 6 VO: `project/public/audio/vo.wav` (Cartesia, 83,41 dtk, 198 kata) + `vo-words.json` + `vo.timing.json` (`npm run vo`). VO DIKUNCI, jangan generate ulang.
- 18 GLB manifest disalin dari `E:/ASET/ASSET-AUDIRA/downloads/glb/` ke `project/public/models/polyfork/` (gedung art-deco/office/monolith, widebody-airliner, tree-fern, tropical-fern-bush, bamboo-grove-clump, banana-plant, club-moss-mat, large-coastal-boulder, landscape-boulder, rock-cave-ledge, canvas-ridge-tent, canvas-wall-tent, camping-lantern, campfire, haul-rope-span, ruined-lair-wall). palm-tree-a307da sudah ada.
- `project/src/episode/materials.ts` disalin dari EP59 (real(), stoneGrain, rockGeometry).
- `project/src/episode/` selain itu masih kosong; `src/Root.tsx` belum mendaftarkan film.

## Template kode
Salin pola EP59 WORLDFORGE: `../../EP59_FINLANDIA_3_JUTA_SAUNA/project/src/episode/` (SaunaFilm.tsx = FilmScene + LOOK per scene + HudCard + Subtitle + Voiceover + AudiraOutro + AudiraSignature; timeline.ts = SHOTS Catmull-Rom + CARDS; parts.tsx = Shape/pop/Ground/softTexture/Smoke/Haze/textTexture/SignBoard). Root.tsx: daftarkan `SonDoongPreview` + `SonDoongFinal` seperti EP72 (`PRESETS.preview/final`).
- AssetModel: `size` = sisi terpanjang, `ground` = taruh di y=0. ToyPerson scale 0.55–0.8 di EP59. Poses: stand/walk/point/crouch/carry/think/lean/kneel. Headwear prop = helm + lampu kepala emisif.
- FilmScene: profile DOCUMENTARY_WARM, exposure ~0.95, envIntensity 0.55 (gua: turunkan per LOOK), ao.
- Subtitle DISPLAY: `Kan`→`Khanh` (VO "Ho Kan"), `Son`→`Sơn`, `Dong`→`Đoòng`, `Audira`→`AUDIRA`.
- AudiraSignature seed `son-doong-ep75`. FILM_SECONDS = 86.4 (VO 83.41 + outro 3 dtk, outro mulai 83.4).

## Batas scene (detik VO)
| Scene | Waktu | Isi |
|---|---|---|
| S1 | 0–9.3 | cutaway: lapisan tanah + hutan (palm, fern, bamboo, banana) di atas, rongga gua di bawah berisi menara GLB (art-deco + office). Shot 2 (5.6–9.3): push ke rongga, berkas cahaya + pohon di dasar |
| S2 | 9.3–17.6 | lantai hutan + tebing kapur dengan mulut gua gelap, kabut/daun tersembur (Smoke), ToyPerson Ho Khanh mundur; papan "AUDIRA · FAKTA DUNIA" |
| S3 | 17.6–23.7 | mulut gua sama, pakis/bambu tumbuh menutup (scale), figur pergi lalu kembali; kamera top-down memutar |
| S4 | 23.7–33.4 | lorong gelap, dinding raksasa, 5 penjelajah berhelm lampu kepala turun tali (haul-rope), sinar ukur; peti "AUDIRA EXPEDITION" |
| S5 | 33.4–42.9 | lorong raksasa terang, garis ukur kinetik, menara GLB untuk skala, Boeing 747 (widebody-airliner) terbang lewat mulai 39.9 |
| S6 | 42.9–50.9 | doline: tabung gua dengan celah atap (theta gap) → langit, kerucut cahaya additive, hutan (tree-fern, palm, banana) di lantai, puing boulder |
| S7 | 50.9–56.8 | doline dari dalam lorong, sprite kabut besar melayang menembus cahaya, figur kecil di tepi |
| S8 | 56.8–65.0 | dinding flowstone 60 m berundak (displaced), pemanjat di tali; 61.7+ macro kolam mutiara gua (bola kalsit) + bola bisbol |
| S9 | 65.0–69.5 | cutaway lapisan kapur, sungai bawah tanah (plane biru beranimasi), rongga membesar |
| S10 | 69.5–77.9 | kamp: canvas tents, lanterns, campfire, rombongan wisata; kereta gantung dicoret 76.0–77.9 |
| S11 | 77.9–86.4 | lanskap karst pagi dari atas, kanopi + mulut doline, pull-back tinggi, outro 83.4 |

Geometri gua: CylinderGeometry open-ended sumbu Z, vertex digeser noise seeded, lantai diratakan (y < −0.55R), material stone DoubleSide/BackSide (clone, jangan ubah cache real()). Doline = thetaStart/thetaLength menyisakan celah atap. Stalagmit = cone displaced. DILARANG Points/LineSegments/box polos sebagai visual utama.

## Kartu HUD (waktu kata VO)
0.4–2.5 "VIETNAM" sub "di bawah hutan" · 2.6–5.5 "MUAT 1 BLOK NEW YORK" sub "gedung pencakar langit" · 7.8–9.3 "HUTAN DI DALAM GUA" · 9.5–11.9 "10 DES 1990" · 12.0–14.3 "HO KHANH" sub "pencari kayu gaharu" · 15.3–17.5 "ANGIN + GEMURUH SUNGAI" · 18.9–20.3 "LUPA LETAKNYA" · 20.4–23.6 counter 1990→2008 "18 TAHUN" · 23.9–27.9 "APRIL 2009" sub "tim penjelajah gua Inggris" · 30.9–33.3 "HANG SƠN ĐOÒNG" sub "gua terbesar di dunia" · 34.6–36.1 count ">5 KM" · 36.5–37.5 "200 M" tinggi · 38.0–39.8 "150 M" lebar · 40.2–42.8 "BOEING 747" sub "bisa terbang melewatinya" · 43.3–45.6 "2 ATAP RUNTUH" sub "doline" · 47.5–50.8 "HUTAN 200 M" sub "di bawah tanah" · 52.4–54.6 "EKOSISTEM SENDIRI" · 54.7–56.7 "KABUT SEPERTI AWAN" · 58.5–59.3 "60 M" sub "dinding kalsit" · 59.8–61.6 "TEMBOK BESAR VIETNAM" · 63.0–64.9 "MUTIARA GUA" sub "≈ bola bisbol" · 67.8–69.4 "2–5 JUTA TAHUN" sub "dipahat sungai bawah tanah" · 69.7–71.9 "SEJAK 2013" sub "wisatawan boleh masuk" · 72.5–73.7 "IZIN TERBATAS" · 74.1–75.9 "TUTUP MUSIM HUJAN" · 76.3–77.9 "KERETA GANTUNG" sub "DIBATALKAN" · 78.2–80.9 "GUA TERBESAR DI DUNIA" sub "ditemukan karena angin" · 81.1–83.3 "IKUTI AUDIRA" sub "@AudiraFaktaDunia".

## Sisa langkah
Bangun film → `npx tsc --noEmit` → stills per scene (`npm run stills -- out/s <times> SonDoongPreview`) → docs/SHOTLIST.md (SFX cues) + `npm run sfx` → `draft/THEME_CHECK.md` (G22) → `npm run draft -- SonDoongPreview` (contact sheet + audit) → record_score self + juri buta subagent (qa/jury.md) → Sesi C: render final antre `F:/AUDIRA-EPISODES/_render.lock`, `--concurrency=1 --jobs=4 --sfx=public/audio/sfx.wav --vo=public/audio/vo.wav`, tag metadata, tahap 10.
