# Asset Candidates — Detik-Detik Hijrah Nabi

Dicari 2026-11-25 lewat `audira_search_assets` + listing katalog `E:/ASET/ASSET-AUDIRA/downloads/glb/`. Adab QISSAH: tidak ada karakter manusia berwajah; tokoh = siluet/kain/tangan saja.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Unta berbaris, counter 100, gulungan maklumat | `camel-base` (animal), `campaign-map-scroll-d4a382` (prop), `desert-floor-tile-cf69a2` (prop) | Instancing unta untuk counter 0 → 100 |
| c01_intro | Peta Hijaz Makkah → Madinah | `campaign-map-scroll-d4a382` (prop), `sand-terrain-blob-f6255a` (prop) | Peta/garis rute dibuat 2D (HUD), bukan GLB |
| c02 | Rumah Makkah siang, kantong kulit, kain | `copper-dome-dwelling-dc8848` (building), `dry-soft-sand-tile-4a1df7` (prop) | Siluet berselubung dibuat 2D/kain; tangan tanpa wajah |
| c03 | Bukit batu + mulut Gua Tsur, domba, lentera | `smuggler-cave-mouth-69a07e` (building), `cave-overhang-arch-b3ef4e` (prop), `sheep-base` (animal), `hand-lantern-cdbe1a` (attachment) | Re-material batu kering Hijaz, buang kesan pantai |
| c04 | Kaki pengejar + bayangan tombak di atas gua | `spear-soldier-base` (character), `cave-overhang-arch-b3ef4e` (prop) | Hanya kaki/bayangan dari sudut dalam gua; wajah tidak masuk frame |
| c05 | Pesisir Laut Merah, 2 unta, kuda Suraqah amblas | `camel-base` (animal), `saddled-horse-da86d3` (animal), `horse-base` (animal), `palm-tree-a307da` (prop) | Penunggang = siluet; debu partikel hanya aksen, bukan visual utama |
| c06 | Kaligrafi QS 9:40 di dinding gua | `cave-overhang-arch-b3ef4e` (prop) | Kaligrafi = tekstur/HUD 2D, label kitab |
| c07_payoff | Fatamorgana Harrah, Masjid Quba sederhana, kalender Hijriah | `civic-dome-pavilion-97ea07` (building), `palm-tree-a307da` (prop), `camel-base` (animal) | Masjid Quba awal = bangunan bata lumpur + pelepah kurma; dome hanya bila di-restyle |

Saran engine: 2D — kisah QISSAH tanpa wajah paling aman dan terbaca lewat siluet, peta rute, dan kaligrafi (ISLAMICDOCUMENTARY); katalog GLB tidak punya aset Hijaz/masjid awal yang cocok, jadi 3D hanya untuk hybrid adegan unta/gua bila dibutuhkan.
