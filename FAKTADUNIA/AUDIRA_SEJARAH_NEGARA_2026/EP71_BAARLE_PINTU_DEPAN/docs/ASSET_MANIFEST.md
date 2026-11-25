# ASSET_MANIFEST — EP71 Baarle, Pintu Depan Menentukan Negaramu

Style: SATELLITEBRIEFING

GLB dari katalog lokal `E:/ASET/ASSET-AUDIRA/downloads/glb/` via `<AssetModel id=... assetType=... />` (fallback CDN polyfork). Salin yang dipakai ke `project/public/models/polyfork/`. Ingat: `AssetModel` mengabaikan `tint` bila `polish` diset.

## Model 3D (hero per adegan)

| Adegan | Peran | Asset ID | Tipe | Catatan |
|---|---|---|---|---|
| S1, S4 | Rumah terbelah di pintu (hero) | `townhouse-row-unit-b9544b` | building | 822 tri; deret rumah Loveren; atap bata desaturasi |
| S1, S2, S6 | Blok kota (variasi) | `brownstone-row-house-1b84fd`, `brick-tenement-7d2014`, `corner-tenement-92fb62` | building | instanced/kloning kecil dari atas, tint analis |
| S2, S6 | Gereja (landmark kota dari atas) | `brick-church-322885` | building | penanda pusat kota |
| S3 | Rumah pertanian 1198 | `gabled-farmhouse-c7534f` | building | lahan abad pertengahan |
| S3 | Pagar tanaman / batas bidang | `bocage-hedgerow-section-4c3126` | prop | pembatas bidang sewa |
| S3 | Pohon baris (FG siluet) | `poplar-row-run-cdc69f` | prop | dipakai sebagai siluet gelap |
| S4 | Pintu (close-up) | `door-set-single-04e5f0` | building | pintu yang dibelah garis batas |
| S4 | Lampu jalan / curb | `curb-strip-28e992` | prop | jalan Loveren |
| S5A | Meja kafe | `bistro-table-877a6d` | prop | meja yang dipindah melintasi batas |
| S5A | Kursi kafe | `bistro-chair-7c354d` | prop | 2–4 kursi |
| S5A | Awning | `retractable-box-awning-85d8dd` | prop | teras kafe |
| S5A | Papan menu | `chalkboard-menu-board-a24d9d` | prop | tanpa merek |
| S5B | Toko pakaian (dibelah) | `corner-shop-5aec8c` | building | tanpa logo merek; signage generik "TOKO" |
| S5B | Toko kedua (berputar) | `department-store-ffbd58` | building | diskala kecil; atau duplikat corner-shop dengan tint berbeda |
| S1, S6 FG | Tiang antena + papan AUDIRA | `antenna-mast-0954b0` | prop | siluet gelap `#0F1418` berkap amber |
| Cadangan | Tiang radar kit | `radar-aerial-mast-f88914` | prop | sudah ada di starter kit |

## Prosedural (bukan visual utama)

- Terrain relief kota + padang: plane bersubdivisi dengan heightmap seeded (`useSurfaceGrain(38)`), atas terang/sisi gelap. Bukan RoundedBox polos.
- Kepingan eksklave: ShapeGeometry tipis (extrude 0.02) dari poligon bergaya (bukan peta kadaster persis) dengan cap emisif amber (B) / biru (NL). Total 22 amber + 7 biru + 1 biru "Ginhoven".
- Panel layar emisif latar, grid emisif, scan line amber: resep memori SATELLITEBRIEFING.
- Kartu dokumen traktat 1843: plane bertekstur canvas (teks "TRAKTAT MAASTRICHT 1843"), stempel.
- Plat nomor `B · 2` / `NL · 19`: plane canvasTex.

## Overlay / HUD (React DOM di atas FilmScene)

- Header card, chip status, callout kinetik, jam NL/B, stempel DITUTUP, label B / NL: font kit `DISPLAY` (Space Grotesk + Anton), ≥ 36 px.
- Subtitle karaoke y 1300 (jarak kata ≥ 0,4em, bounce ≤ 1,04).

## Brand

- `F:/AUDIRA-ALL-SKILL/assets/brand/AudiraSignature.tsx` → `project/src/brand/`, `seed="sejarah-negara-ep71"`, `handle="@AudiraFaktaDunia"`.
- Outro card: `shared/assets/brand/audira-outro-card.svg` (2–3 dtk terakhir).
- Channel brand: `F:/AUDIRA-EPISODES/CHANNEL_BRAND/channel-brand-audira-fakta-dunia/src/wordmark-reversed.svg`.

## Audio

- VO: Cartesia voice `04b567df-2923-4b0c-896b-4b7df0a07e1a`, teks `audio/vo.txt`.
- SFX: prosedural `npm run sfx` (stem −26 LUFS, G18). Tanpa musik.

## Referensi

- Kit: `F:/AUDIRA-SKILL-MOTION/kits/satellitebriefing/` (KIT.md, example, gold `polling-wapres-EP01`).
- Cover referensi: `style/cover-reference.png`.
