# EP72 — Timing terkunci (Audio Master Clock)

VO: `project/public/audio/vo.wav` 86,24 dtk (Cartesia, voice 04b567df…, 213 kata, 1 segmen, speed 1).
Lafal dicek faster-whisper (id): "markis di pombal", "baisha", "Gaiola", "audira" — OK, tidak perlu rakit ulang.
Film: FILM_SECONDS = 89.5, OUTRO_SECONDS = 3 (outro 86,5–89,5). Offset VO 0.
Subtitle display map: Baisya→Baixa, gayola→gaiola, Markis→Marquis, Audira→AUDIRA.

## Batas scene (dari awal kalimat VO)

| Scene | Dari–sampai (dtk) | Kalimat |
|---|---|---|
| S1 Hook | 0–7.0 | Pagi hari raya … gempa (4.3), laut (5.4), api (6.3) |
| S2 Hari raya | 7.0–17.5 | Satu November 1755 (7.1–9.8), Hari Raya (10.2), lilin (13.5), pukul 09.40 (15.0–15.8), berguncang (16.5) |
| S3 Guncangan | 17.5–25.3 | 3,5–6 menit (18.6–19.7), Atlantik (20.9), M 7,7–±9 (22.9–24.2) |
| S4 Laut surut | 25.3–31.6 | dermaga (26.3), laut surut (28.2), bangkai kapal (30.5) |
| S5 Tsunami | 31.6–36.7 | 40 menit (32.2), tsunami (34.1), dua gelombang lagi (35.4) |
| S6 Api | 36.7–45.1 | lilin roboh (38.2–39.3), kebakaran (39.9), berjam-jam (41.4), istana (42.7), 70.000 jilid (44.1–44.7) |
| S7 Dampak | 45.1–50.6 | 85% (45.2–45.9), hancur (46.9), 30.000–40.000 jiwa (48.7–49.9) |
| S8 Pombal | 50.6–59.5 | Markis de Pombal (52.4), kutipan (54.6–56.1), Baixa (57.7), jalan lurus lebar (58.5) |
| S9 Gaiola | 59.5–69.5 | rangka kayu bersilang (61.3), gaiola (62.5), pasukan menghentak (64.4–65.2), pertama di Eropa (66.8–68.6) |
| S10 Kuesioner | 69.5–76.8 | kuesioner (70.5), paroki (71.3), jam berapa (72.1), berapa lama (72.9), lautnya (74.1), cikal bakal (74.9) |
| S11 Payoff | 76.8–86.5 | satu pagi (77.0), lebih kuat (80.3), rumahmu siap? (82.9), Ikuti Audira (84.5–85.8) |
| Outro | 86.5–89.5 | AudiraOutro |

Waktu semua kata: `node -e "const w=require('./public/audio/vo-words.json');console.log(w.map(x=>x.start.toFixed(1)+':'+x.text).join(' '))"` di `project/`.

## Pola kode (referensi)

- Template terbaik: `EP59_FINLANDIA_3_JUTA_SAUNA/project/src/episode/` (SaunaFilm.tsx: FilmScene + overlay HUD + Subtitle + Voiceover + AudiraOutro + AudiraSignature; timeline.ts: SHOTS Catmull-Rom per scene + CARDS; scenes.tsx; parts.tsx; Root.tsx daftar Preview + Final).
- Kit: `project/src/kits/mosaicforge/` — `lib/post.tsx` (MosaicCameraRig + MosaicPost; FilmScene `post={false}`), `lib/materials.ts` (makeCeramicMaterial, makeGroutTexture, makeFlagstoneTexture), `lib/palette.ts` (lapis #1A2F78/#2747A3, cream, terracotta, grout #8F806B), `scene/TesseraeField3D.tsx` (instanced RoundedBox per ubin + drop curve), `lib/image.ts` (SDF sampler per tile), `core/motion.ts` (mulberry32, dropCurve, track).
- `<AssetModel id assetType size ground tint roughness position rotation />` dari `core/assets/AssetModel.tsx`; `<ToyPerson>` dari `core/polish/Person.tsx`.
- Polyfork lokal: `project/public/models/polyfork/<type>/` = junction ke `E:/ASET/ASSET-AUDIRA/downloads/glb/<type>` (11 GLB manifest terverifikasi ada).
