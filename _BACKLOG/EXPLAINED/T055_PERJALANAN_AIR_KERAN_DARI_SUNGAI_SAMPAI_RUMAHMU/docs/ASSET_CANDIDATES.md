# Asset Candidates — Perjalanan Air Keran dari Sungai sampai Rumahmu

> Dicari via `audira_search_assets` (2026-11-27). Katalog punya menara/tangki air, potongan pipa, pompa tangan, wastafel, batu dan alang-alang sungai. Tidak ada GLB instalasi pengolahan air (bak koagulasi, bak pengendap, saringan pasir), intake sungai, atau keran close-up: itu dibuat 2D/procedural (cutaway).

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Gelas air keruh vs jernih, keran dapur meneteskan air | `kitchen-sink-7ea438` / prop | Gelas + tetes air procedural/2D; keran generik tanpa merek |
| c01_intro | Sungai berkelok, sumur air tanah (potongan tanah), intake berjeruji, pompa, pipa besar | `river-stone-cluster-0b55bc` / prop, `river-reed-cluster-cba87e` / prop, `hand-water-pump-448037` / prop (simbol air tanah), `pipe-run-280a0d` / prop | Permukaan sungai shader; intake dan kompleks pengolahan tanpa papan nama/logo PDAM |
| c02 | Bak pengaduk cepat + tawas, bak pengaduk pelan, flok membesar | `glass-sump-tank-ebccc0` / prop (bak transparan, simbolis), `sump-return-pump-a5bf42` / prop | Partikel/flok sebagai ilustrasi beranotasi (bukan visual utama abstrak); cutaway 2D lebih jelas |
| c03 | Bak pengendap panjang (cutaway), saringan pasir berlapis | `rimless-display-tank-cec438` / prop (simbolis) | Lapisan pasir/kerikil diagram 2D berlabel; HUD "Tahap 3–4" |
| c04 | Dosis klor, ikon kuman, lab uji air, kartu baku mutu | `pipette-stand-with-four-a6856c` / prop, `sink-unit-with-drying-c5d11a` / prop, `horizontal-tank-6e9b8b` / prop (tangki klor generik) | Kartu HUD besar 0,2–0,5 mg/L · E. coli 0 · < 3 NTU; tanpa logo Kemenkes |
| c05 | Reservoir di bukit, potongan jalan dengan pipa di bawah aspal, deretan rumah | `water-tower-dd6200` / building, `water-tower-7eb7ec` / building, `pipe-junction-5b146a` / prop, `concrete-full-pipe-section-00e1b6` / prop, `surface-pipe-run-62c4b3` / prop | Panah tekanan + titik klor hijau mengalir |
| c06 | Pipa bocor, meteran air generik, diagram donat 33%, manometer jatuh, rembesan tanah | `pipe-run-280a0d` / prop, `pipe-junction-5b146a` / prop | Meteran & manometer 2D; donat "±33% (2022)" |
| c07_payoff | Rute menyala rewind, toren atap rumah dikuras, peta Indonesia 1 dari 5 rumah menyala, outro | `rooftop-water-tower-b38362` / prop (toren atap), `water-tower-on-a-dbc730` / prop | Peta generik tanpa logo; outro card `audira-outro-card.svg` |

Saran engine: 2D — inti cerita adalah cutaway proses (bak koagulasi, flok, pengendap, saringan pasir, rembesan pipa) yang tidak ada sebagai GLB dan paling terbaca sebagai diagram alir berlapis (CHAINREACTION); 3D hanya layak bila hybrid untuk reservoir/menara air dan potongan jalan berpipa (c05), dengan risiko bak-bak pengolahan jadi kotak polos.
