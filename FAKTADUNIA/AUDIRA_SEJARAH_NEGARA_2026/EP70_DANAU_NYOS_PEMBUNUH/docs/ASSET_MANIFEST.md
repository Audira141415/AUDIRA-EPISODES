# ASSET MANIFEST — EP70 Danau Nyos, Danau yang Membunuh dalam Semalam
Style: TERRARIUM — toples kaca berpenampang di ruang gelap hangat

## GLB lokal (Polyfork, `E:/ASET/ASSET-AUDIRA/downloads/glb/`, dimuat lewat `<AssetModel id>`)

| ID | Tipe (folder) | Dipakai di |
|---|---|---|
| thatched-cottage-0e63f5 | building | pondok desa di lereng (A), empat desa (F) |
| cow-base | animal | 2–3 sapi berdiri jauh di padang, hanya F sebelum kabut (tanpa pose rebah) |
| goat-base | animal | cadangan ternak berdiri (F), opsional |
| broad-canopy-shade-tree-e7c4a2 | prop | pohon peneduh di desa dan lembah (E, F) |
| banana-plant-978d7f | prop | kebun pisang di sekitar pondok (F) |
| basalt-boulder-a1929c | prop | batu basal bibir kawah / lembah (A, E) |
| cattail-reed-6abbb3 | prop | ilalang FG tepi meja (A, E) |
| hand-lantern-cdbe1a | attachment | lentera di depan pondok, sumber cahaya hangat (A, F) |
| pipe-run-280a0d | prop | pipa degassing vertikal (G); `surface-pipe-run-62c4b3` cadangan |
| clay-storage-pot-626452 | prop | pot tanah liat di halaman pondok, detail desa (F) |
| mountain-refuge-hut-32ab1e | building | cadangan bila pondok jerami terlalu mirip satu sama lain |

## Dibangun prosedural (kit TERRARIUM, `src/episode/`)

- Toples kaca Nyos (hero) + toples kecil Monoun: silinder kaca transmission, leher + gabus, penampang kawah basal.
- Lapisan air: air atas, air dasar jenuh CO₂, garis termoklin, gelembung instanced (posisi seeded, tanpa `Math.random`).
- Glow magma di bawah alas (emissive + point light merah).
- Kolom air + busa erupsi, gelombang satu sisi, penurunan permukaan ±1 m (skala miniatur).
- Kabut CO₂: tumpukan plane transparan bertekstur noise seeded, mengalir mengikuti spline lembah.
- Lembah miniatur di meja: terrain displacement seeded + lumut.
- Pengukur tekanan tabung kaca, air mancur pipa (partikel instanced), plakat kuningan "AUDIRA · DANAU NYOS 1986".
- Bokeh latar: bola kecil `meshBasicMaterial` jauh di belakang + DOF (maxBlur ≈ 0,012), bukan sprite (fix EP04).

## Aset bersama

| Aset | Sumber | Lisensi |
|---|---|---|
| Outro card | `shared/assets/brand/audira-outro-card.svg` | milik AUDIRA |
| AudiraSignature | `F:/AUDIRA-ALL-SKILL/assets/brand/AudiraSignature.tsx`, `seed="danau-nyos-ep70"`, handle `@AudiraFaktaDunia` | milik AUDIRA |
| Brand channel | `F:/AUDIRA-EPISODES/CHANNEL_BRAND/channel-brand-audira-fakta-dunia/src/` | milik AUDIRA |
| HDRI | kit `public/hdri` "studio" (CC0) | CC0 |
| Font | Inter / Inter Tight (kit) | OFL |
| SFX | prosedural `npm run sfx` dari SHOTLIST + timing VO | dibuat sendiri |
| VO | Cartesia, voice `04b567df-2923-4b0c-896b-4b7df0a07e1a` | lisensi akun AUDIRA |

## Data di layar → sumber (`research/SOURCE_REGISTER.md`)

| Teks di layar | Fakta # | Sumber |
|---|---|---|
| 1.746 JIWA · 1 MALAM | 1, 7 | W-NY, EOS16, KL87, BBC-OTD |
| DANAU NYOS · KAMERUN | 15 | KL87, W-NY |
| CO₂ DARI MAGMA | 4 | KL87 |
| 21 AGT 1986 | 1 | W-NY, EOS16 |
| PEMICU: ? | 14 | W-NY |
| 100 M | 8 | W-NY |
| 300.000 TON CO₂ | 3 | W-NY |
| TEBAL 50 M · ≤ 50 KM/JAM | 5 | W-NY |
| NYOS · KAM · CHA · SUBUM | 7 | W-NY |
| MONOUN 1984 · 37 | 13 | W-MO |
| 2001 · PIPA PERTAMA | 11 | W-NY |
