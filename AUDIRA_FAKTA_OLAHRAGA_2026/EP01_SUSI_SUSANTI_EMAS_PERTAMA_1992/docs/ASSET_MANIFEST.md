# Asset Manifest — EP01 Susi Susanti, Emas Pertama 1992 (PIXELSTORY)

Semua visual digambar prosedural dengan kit `studio/src/kits/pixelstory` (albedo + `painter`, sprite + `finish`). Tidak ada GLB, foto, wajah asli, atau logo pihak ketiga (IOC, BWF, PBSI, maskot Barcelona '92).

| Aset | Jenis | Sumber / cara buat | Dipakai di |
|---|---|---|---|
| Set arena malam (tribun, Merah Putih, spot atap, papan iklan AUDIRA, lapangan hijau, net) | albedo 3 layer | `scenes/ep01/arena.ts` `buildArena` (sudah ada, = cover) | A, OUT |
| Arena sisi samping (lapangan dari samping, tribun, papan iklan AUDIRA) | albedo 3 layer | turunan `buildArena` dengan sudut samping, baru di `scenes/ep01/` | C, E2 (relight dingin) |
| Net close-up (pita net, tiang, tribun gelap blur) | albedo | baru di `scenes/ep01/` | D |
| Kamar atlet malam (dinding, jendela + siluet Barcelona, ranjang, lampu meja, jam digital, tas raket) | albedo | props kit (`plankWall`, `nightWindow`, `shelf`) + ranjang, jam, tas baru | B |
| Papan waktu 1952 → 1992 + kotak emas kosong | HUD pixel | baru di `scenes/ep01/hud.tsx` | B |
| Podium 3 tingkat + tiang bendera + sorot lampu aula | albedo | baru | E1 |
| Jalan Jakarta sore (langit, siluet Monas, gedung, massa pixel, tiang spanduk AUDIRA) | albedo 3 layer | baru | F |
| Mobil terbuka pixel | sprite | baru | F |
| Hero Susi (putih + pita merah): smash (ada), siap, pukul, duduk, podium, berdiri di mobil | sprite | `scenes/ep01/sprites.ts` `heroSmash` + pose baru, `finish` kit | A, B, C, D, E1, F |
| Lawan generik (merah tua, `RIVAL_PAL`): siap, pukul | sprite | `rival` diperluas | A, C, D |
| Alan generik (putih, palet swap) angkat raket / berdiri | sprite | `recolor` dari hero | E2, F |
| Kok | sprite | `shuttle` (ada) | A, C, D |
| Medali emas generik berpita, kalung bunga | bagian sprite | baru | E1, F |
| Konfeti bunga, debu cahaya, kilat kamera | partikel | kit `DustMotes`, konfeti seeded | A, E1, F |
| HUD: papan skor arcade, bar nyawa, "LEVEL UP", bagan turnamen, kartu nama, chip, stempel (≤ 860 px, tanpa rotasi), kartu teaser EP02 | HTML + Silkscreen ≥ 34 px | baru di `scenes/ep01/hud.tsx` (pola `scenes/ep45/hud.tsx`) | semua |
| Font | OFL | `studio/public/fonts` (Anton, Silkscreen) | semua |
| VO | audio | Cartesia voice `04b567df-2923-4b0c-896b-4b7df0a07e1a`, lang id | semua |
| SFX | audio | `npm run sfx` prosedural dari SHOTLIST + timing VO (−20 LUFS); tanpa rekaman lagu kebangsaan | semua |
| Outro + tanda tangan | brand | `shared/assets/brand/audira-outro-card.svg`, `src/brand/AudiraSignature.tsx` (`seed="olahraga-EP01"`) lewat `signed()` di `Root.tsx` | OUT, seluruh film |
