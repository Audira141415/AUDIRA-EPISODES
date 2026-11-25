# ASSET MANIFEST — EP68 Bank Keju Credem
Style: FOODFORGE — keju berkilau glaze, gudang kayu hangat, brankas logam

## GLB lokal (`E:/ASET/ASSET-AUDIRA/downloads/glb/`, dimuat lewat `<AssetModel id assetType>`)
| ID | Tipe | Dipakai di |
|---|---|---|
| vault-strongroom-d2c032 | building | pintu/ruang brankas (A) |
| iron-vault-safe-8b8f29 | prop | brankas kecil FG (A, D) |
| gold-coin-stack-a9ef52 | prop | tumpukan koin FG (A, D) |
| banded-cash-bundle-7da278 | prop | uang pinjaman di neraca (D) |
| classical-bank-04954e | building | fasad bank (B) |
| bank-414f6b | building | bangunan kota pendamping (B) |
| red-barn-d41683 | building | kandang (C) |
| alpine-hay-barn-3965e5 | building | lumbung latar (C) |
| cow-base | animal | sapi (C) |
| milk-churn-895735 | prop | milk churn menuang (C, FG) |
| milk-churn-stand-130fe2 | prop | dudukan churn (C) |
| haystack-77b0dd | prop | jerami FG (C) |
| firewood-stack-810f49 | prop | tumpukan FG latar kandang (C) |
| farmer-304a43 | character | pembuat keju (C, D) — tambah rambut/wajah/celemek bila GLB polos |
| front-desk-clerk-99f0c2 | character | pegawai bank (D) |
| cash-counting-machine-1f6eca | prop | meja kredit (D) |
| villager-40255c | character | pencuri siluet (E) |
| village-guard-5f0f6f | character | polisi/penjaga (E) |
| hand-lantern-cdbe1a | prop | lentera/senter (E) |
| delivery-truck-a9537e | vehicle | truk keju (B latar, E) |
| hammer-fa3e51 | ultra | palu penguji (F) |

Catatan: katalog tidak punya GLB keju (`audira_search_assets` "cheese", 2026-11-24). Sesi B: cek skala/orientasi tiap GLB di still; ganti bila terbaca plastik.

## Dibangun prosedural (material FOODFORGE, `src/episode/materials.ts`)
- Roda Parmigiano (lathe sisi cembung, clearcoat 0.9, tulisan titik generik), instanced ribuan untuk rak katedral (jauh = LOD sederhana).
- Wedge keju terbuka + kristal glossy instanced.
- Rak kayu katedral (tiang + papan, serat kayu), berkas cahaya lembut (plane aditif).
- Bejana tembaga (lathe, metalness 1), kain linen curd, timbangan, gelas ukur susu.
- Prosciutto (lathe + material daging marmer) + botol minyak zaitun (kaca hijau transmission) + stempel DITOLAK.
- Cap bakar oval menyala (emissive + asap tipis transparan), stempel nomor seri.
- Terowongan tanah (tube geometry + bump tanah), lampu sirene biru-merah.
- Pelat kuningan "AUDIRA" (brankas) + papan stensil "AUDIRA · RAK 68".

## Audio
- VO: `project/public/audio/vo.wav` (Cartesia, voice 04b567df-2923-4b0c-896b-4b7df0a07e1a) dari `docs/VO_TTS.txt`, dibuat sesi B tahap 6.
- SFX: prosedural `npm run sfx` dari SHOTLIST + timing VO (stem −26 LUFS, G18).
- Musik: tidak ada.

## Brand
- `AudiraSignature seed="ep68-bank-keju" handle="@AudiraFaktaDunia"`; outro `shared/assets/brand/audira-outro-card.svg`; brand kit `CHANNEL_BRAND/channel-brand-audira-fakta-dunia`.
