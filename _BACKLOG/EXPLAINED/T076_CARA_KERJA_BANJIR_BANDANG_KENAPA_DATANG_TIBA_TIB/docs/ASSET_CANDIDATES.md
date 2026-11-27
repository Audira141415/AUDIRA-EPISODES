# Asset Candidates — Cara Kerja Banjir Bandang: Kenapa Datang Tiba-tiba

> Dicari via `audira_search_assets` (2026-11-27). Katalog punya pohon, tunggul, pohon mati, batu, jembatan kayu, rumah, dan blob air/tanah. Tidak ada GLB arus banjir, awan hujan, atau gelondongan kayu hanyut yang realistis: arus dan hujan dibuat shader/procedural (FLUIDFORGE/DISASTERSIM).

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Desa tepi sungai langit cerah vs puncak hulu badai | `two-story-house-40f6dc` / building, `wooden-bridge-9d2308` / prop, `tall-pine-tree-ab4108` / prop | Awan dan hujan procedural; HUD "< 6 jam", "hitungan menit" |
| c01_intro | Penampang lereng curam, hujan, limpasan ke anak sungai | `grass-terrain-blob-389daa` / prop, `dirt-terrain-blob-7227e6` / prop, `water-blob-f266b8` / prop | Penampang tanah 2.5D lebih jelas; bar "serapan tanah" |
| c02 | Hidrograf melonjak, arus cokelat bawa batu dan kayu | `small-rock-db33a7` / prop, `fern-covered-boulder-2e0375` / prop, `bracket-fungus-log-2deef4` / prop | Grafik 2D; air cokelat shader |
| c03 | Longsor menyumbat sungai, danau kecil di belakangnya | `driftwood-wrack-pile-a505a5` / prop, `dead-tree-6795fa` / prop, `log-stump-1d65a5` / prop, `landscape-boulder-526f7f` / prop | Inti visual "bendungan alami"; bar tekanan HUD |
| c04 | Sumbatan jebol, dinding air + bongkah batu | `landscape-boulder-526f7f` / prop, `small-rock-d43710` / prop | Callout "Solok · 21 Sep 2026", "bongkah 2–3 m"; peta generik tanpa logo |
| c05 | Peta Sumatra generik + counter korban; penampang hutan menyerap hujan | `tall-pine-tree-ab4108` / prop, `maple-tree-65fa12` / prop, `tree-stump-ec3f48` / prop | Counter "1.204 · per 2 Feb 2026 (BNPB)"; tanpa logo/wajah; jangan tampilkan perusahaan/konsesi |
| c06 | Tepi sungai: langit hulu gelap, air berubah keruh, kaki siluet di arus | `round-path-stone-4130f3` / prop, `water-blob-e2cdf2` / prop | Siluet tanpa wajah; callout "15 cm"; ikon peringatan lucide |
| c07_payoff | Kamera naik dari desa ke hulu, rute air menyala, outro | `two-story-house-40f6dc` / building, `tall-pine-tree-ab4108` / prop, `wooden-bridge-9d2308` / prop | Outro card `audira-outro-card.svg` |

Saran engine: 3D — mekanisme lereng, sumbatan, dan jebolnya bendungan alami butuh kedalaman ruang dan simulasi air (FLUIDFORGE/DISASTERSIM); grafik hidrograf dan peta tetap HUD 2D.
