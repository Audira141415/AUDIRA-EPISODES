# Asset Candidates — Tarif Ojek Online Naik Saat Hujan — Begini Rumusnya

> Dicari via `audira_search_assets` (2026-11-26). Rule 15: tanpa logo/nama aplikator, UI aplikasi fiktif, pengemudi siluet tanpa wajah.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Jalan kota basah malam, ponsel dengan ongkos naik | `smartphone-5f05e5` / ultra, `two-storey-shophouse-183790` / building, `corner-shophouse-ad15c2` / building | Hujan + genangan dibuat shader/partikel sekunder (bukan visual utama); UI ponsel 2D fiktif |
| c01_intro | Pagar batas bawah/atas di atas peta Indonesia 3 zona | — | Peta zona lebih jelas 2D (SVG provinsi generik); belum ada GLB peta |
| c02 | Kartu data 3 zona tarif | — | Murni HUD 2D: kartu angka + footnote "per KP 667/2022, berlaku per 26 Nov 2026" |
| c03 | Motor exploded view jadi komponen biaya | `scooter-b4b718` / ultra, `smartphone-5f05e5` / ultra, `scooter-kid-28cff9` / character (siluet, clip Idle) | Bensin, ban, kunci servis, jas hujan, koin dibuat ikon lucide/2D; skuter generik tanpa merek |
| c04 | Halte penuh pemesan berpayung vs motor menepi, jalan tergenang | `bus-shelter-f786b4` / prop, `standing-worker-on-a-8a0f9a` / character (clip Idle, menelepon), `scooter-b4b718` / ultra, `convenience-store-c30e1d` / building | Payung tidak ada di katalog (pencarian "umbrella" tidak relevan); karakter low-poly tanpa wajah detail |
| c05 | Timbangan pemesan vs pengemudi, jarum harga naik | `gold-balance-scale-66497b` / prop | Ikon pemesan/motor di piringan 2D; bisa juga timbangan 2D penuh |
| c06 | Grafik harga di dalam koridor batas, kotak hitam "?" | — | Grafik garis 2D; tanpa logo aplikator |
| c07_payoff | Hujan reda, motor melaju ke cahaya kota, outro | `scooter-b4b718` / ultra, `three-storey-shophouse-2f6378` / building, `wide-shophouse-089f20` / building | Outro card `audira-outro-card.svg` |

Saran engine: 2D — inti video adalah angka zona, rumus komponen, timbangan permintaan-pasokan, dan grafik koridor harga yang paling tajam sebagai infografis (DATAPHYSICAL/CIRCUITFORGE); GLB kota dan skuter tersedia tetapi gaya "japanese suburban" kurang mirip jalan Indonesia, jadi 3D (URBANFORGE) hanya layak bila diorama jalan diganti agar terasa lokal.
