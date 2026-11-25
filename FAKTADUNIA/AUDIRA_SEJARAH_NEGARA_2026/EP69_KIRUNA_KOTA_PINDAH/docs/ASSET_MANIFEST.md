# ASSET_MANIFEST — EP69 Kiruna

Style: HD2D · Remotion + R3F · GLB lokal dari `E:/ASET/ASSET-AUDIRA/downloads/glb/` via `<AssetModel id type />` / `useGLTF`. Tanpa foto, tanpa wajah orang nyata, tanpa logo asli.

## GLB (sudah dicek ada di disk)

| Peran | Asset id | Tipe | Ukuran | Adegan |
|---|---|---|---|---|
| **Hero gereja** (recolor merah Falu #8E2B22, atap gelap; sama di semua adegan, G17) | clapboard-church-03a6f5 | building | 176 KB | S1, S5–S8 |
| Cadangan hero bila siluet kurang tinggi | brick-church-322885 | building | 332 KB | — |
| Trailer pengangkut (×2, berjajar) | eight-wheel-industrial-hauler-4dc3d7 | vehicle | 236 KB | S1, S6–S8 |
| Trailer cadangan | hauler-cargo-trailer-3a0262 | vehicle | 160 KB | — |
| Truk tambang | articulated-dump-truck-ee50f3 | vehicle | 348 KB | S3 |
| Menara tambang di bukit | mine-headframe-735cf4 | building | 192 KB | S1, S3, S8 |
| Mine cart + rel | mine-cart-21d7f0, mine-rail-track-9532dd | vehicle/prop | 248 / 44 KB | S3 |
| Bijih besi | iron-ore-deposit-577b67, iron-ore-chunk-1df386 | prop | — | S3 |
| Bor | core-drill-rig-3b355e | prop | 80 KB | S3 |
| Rumah kayu kota | log-cabin-4fac3b, gabled-farmhouse-c7534f, a-frame-cabin-6cb550 | building | 152 / 104 KB | S2, S4, S5 |
| Crane (angkat rumah, cabut tiang) | mobile-crane-671d3f | vehicle | — | S4, S6 |
| Jembatan dibongkar | bailey-bridge-section-d5c408 | building | 108 KB | S6 |
| Tiang lampu (practical hangat FG) | lamp-post-c9e409 | prop | 56 KB | S1, S6, S7 |
| Lampu lalu lintas | traffic-light-5e5ae6 | prop | — | S6 |
| Pohon | birch-tree-181b33, snow-laden-spruce-36716e, pine-tree-3ea075 | prop | — | semua |
| Kerucut lalu lintas | traffic-cone-247748 | prop | — | S6, S7 |
| Jalan | two-lane-street-tile-fe56b6 | prop | — | S1, S6, S7 |

Semua id dari katalog Polyfork (`audira_search_assets`). Sesi B: verifikasi skala & orientasi tiap GLB di still sebelum adegan dibangun.

## Prosedural (kode)
- Sprite pixel warga (billboard, 8 fps) + bayangan kontak — dari kit HD2D.
- Penampang tanah/terowongan tambang (S3), meteran kedalaman, peta Skandinavia + garis Lingkar Arktik (S2), panah pusat kota (S4), odometer pixel (S7), cutaway orgel 1.000 pipa (S8, silinder pipa instanced sebagai detail interior, bukan visual utama).
- Tekstur canvas plank/shingle/cobble sebagai map + bump (memori HD2D).
- HUD callout pixel-frame, kotak dialog JRPG, karaoke.

## Audio
- `public/audio/vo.wav`: Cartesia voice `04b567df-2923-4b0c-896b-4b7df0a07e1a`, teks `docs/VO_TEXT.txt`.
- `public/audio/sfx.wav`: `npm run sfx` prosedural (G18: stem −26 LUFS, trim −4 dB, duck ratio 8).

## Brand
- `src/brand/AudiraSignature.tsx` seed `kiruna-ep69`, handle `@AudiraFaktaDunia`; outro card `shared/assets/brand/audira-outro-card.svg`; papan "AUDIRA" S1 + plakat S8.
- Channel kit: `F:/AUDIRA-EPISODES/CHANNEL_BRAND/channel-brand-audira-fakta-dunia`.
