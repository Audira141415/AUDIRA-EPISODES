# Asset Candidates — Cara Kerja Timbangan Digital

> Dicari via `audira_search_assets` (2026-11-26). Katalog tidak punya timbangan dapur digital, load cell, strain gauge, chip, atau pegas spiral. Yang ada hanya timbangan platform antik, timbangan emas dua lengan, lapak pasar, dan perabot dapur. Komponen inti dibuat 2D/procedural.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Timbangan dapur digital exploded view, balok load cell melengkung | — | Tidak ada GLB timbangan digital/load cell; modelkan sendiri (balok berlubang "kacamata" sederhana) atau ilustrasi 2D. Tanpa merek |
| c01_intro | Timbangan badan jarum dengan pegas spiral vs timbangan digital | `platform-weighing-scale-f43019` / prop | Timbangan platform antik hanya pembanding mekanis; pegas spiral dan jarum lebih jelas sebagai ilustrasi 2D |
| c02 | Balok load cell melentur, kantong gula generik, penggaris mikro | — | Animasi lentur dengan label "skala dibesarkan"; HUD "< 0,5 mm" |
| c03 | Makro foil strain gauge zig-zag, warna tarik/tekan | — | 2D cutaway paling terbaca |
| c04 | Diagram jembatan Wheatstone, voltmeter | — | 2D diagram kinetik; HUD "±0,1%", "5–10 mV (hitungan)" |
| c05 | Chip generik, gelombang diperkuat, tangga digital, angka | — | Chip tanpa logo/nama; HUD "×128", "24-bit" |
| c06 | Layar timbangan + tombol tare, mangkuk, lapak pasar dengan timbangan dagang | `service-counter-module-3072ff` / prop, `market-stall-94937d` / building, `mercado-stall-6e6ba3` / prop, `apple-b15012` / ultra, `gold-balance-scale-66497b` / prop | Stiker tanda tera generik (bukan replika cap resmi); HUD "UU 2/1981", "Tera ulang 1 tahun" |
| c07_payoff | Kamera mundur dari foil ke timbangan utuh di dapur, outro | `kitchen-sink-7ea438` / prop, `service-counter-module-3072ff` / prop | Outro card `audira-outro-card.svg` |

Saran engine: 2D — inti cerita (foil, jembatan, sinyal, chip) adalah diagram dan cutaway yang tidak tersedia sebagai GLB, sehingga 2D (PRECISION/BONGKAR) lebih tajam dan cepat; 3D INNERWORKS hanya layak bila load cell dan timbangan dimodelkan sendiri.
