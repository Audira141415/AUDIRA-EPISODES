# Asset Manifest — EP05 Rumble in the Jungle 1974 (CHRONICLE)

Tokoh dan set digambar dengan kit CHRONICLE di `studio/src/scenes/ep05/chronicle/` (siluet `INK` + outline pass, props prosedural). Objek pendukung 3D non-tokoh memakai GLB dari katalog lokal `E:/ASET/ASSET-AUDIRA/downloads/glb/` lewat `studio/src/scenes/_shared/Glb.tsx` (salin ke `studio/public/glb/`). Tidak ada foto, wajah asli, logo WBA/WBC, sponsor, poster, atau logo film.

| Aset | Jenis | Sumber / cara buat | Dipakai di |
|---|---|---|---|
| Ring + tribun + menara lampu + palem + spanduk apron AUDIRA | set R3F | `scenes/ep05/RingSet.tsx` (ada, = cover) | A, E1, E2, OUT |
| Look `PREDAWN` | look | `RingSet.tsx` (ada) | A, C2, E1 |
| Look `MAPROOM`, `ROOM_NIGHT`, `NIGHT`, `MORNING` | look | `chronicle/looks.ts` (ada) | B, C1, D, E2 |
| Siluet Ali (amber) & Foreman (crimson): jaga, pukul, bersandar di tali, limbung, tumbang, angkat tangan | Figure | `chronicle/Figure.tsx` `POSES` + pose baru, `Boxer.topple` | A, B, C1, D, E1, E2 |
| Sparring partner, wasit, penonton | Figure tanpa kontur / kontur ivory | `Figure` + instancing penonton (`cheer`) | C1, C2, E1 |
| Peta Atlantik–Afrika (kertas tua, garis pantai, pin Kinshasa) | set R3F / overlay | baru di `scenes/ep05/MapSet.tsx` (bidang kertas + garis pantai dari data Natural Earth 110m public domain, `MapPin`, `RouteLine`) | B |
| Pesawat 1970-an | GLB | `widebody-airliner-ae0a5a` (`vehicle`, 7.483 tri) | B |
| Kamp latihan malam (dinding papan, lampu gantung, jendela + palem, ring sparing kecil, kalender dinding) | set R3F | baru di `scenes/ep05/CampSet.tsx` (props kit `Lantern`, `Palm`, tali ring dari `RingSet`) | C1 |
| Stadion 20 Mei wide (tribun melingkar, menara lampu, papan AUDIRA) | set R3F | turunan `RingSet` dengan tribun diperluas, baru di `scenes/ep05/StadiumSet.tsx` | C2, OUT |
| Piringan satelit | GLB | `comms-dish-7b129a` (`prop`, 592 tri) | C2 |
| Hujan miring, tetes lensa, kilat jauh | fx | partikel seeded baru + `chronicle/fx.tsx` `Bolt` | E2, OUT |
| Flash lampu stadion, debu cahaya | fx | `chronicle/fxextra.tsx` `Shafts` + flash overlay | A, E1 |
| HUD: Counter 40–0/37 KO/±60.000/7 TAHUN, DateStamp, NameTag, Cite NYT, MapPin, kartu odds 4:1, kalender, label ronde, bar tenaga, timer 2:58, hitungan 1–10, stamp ROPE-A-DOPE (≤ 860 px), kartu skor AUDIRA, kartu teaser | HTML overlay ≥ 34 px | `chronicle/Overlay.tsx` + baru di `scenes/ep05/hud.tsx` | semua |
| Caption karaoke | overlay | `chronicle/Overlay.tsx` `Captions` dari timing VO | semua |
| Font | OFL | `studio/public/fonts` (Anton, Barlow Condensed, Plus Jakarta Sans, Instrument Serif) | semua |
| VO | audio | Cartesia voice `04b567df-2923-4b0c-896b-4b7df0a07e1a`, lang id | semua |
| SFX | audio | `npm run sfx` prosedural dari SHOTLIST + timing VO (−20 LUFS); chant & crowd sintetis, tanpa rekaman arsip | semua |
| Outro + tanda tangan | brand | `studio/public/brand` kartu outro AUDIRA, `AudiraSignature seed="olahraga-EP05"` lewat `signed("Ep05", ...)` di `Root.tsx` | OUT, seluruh film |
