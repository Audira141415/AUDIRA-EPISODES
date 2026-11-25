# Asset Candidates — Gurun yang Banjir Setahun Sekali dan Mekar Bunga

> Dicari via `audira_search_assets` (katalog Polyfork lokal `E:/ASET/ASSET-AUDIRA/downloads/glb/`), 2026-11-25. Katalog tidak punya model gurun/terrain Atacama, peta, atau bunga spesifik Chile: terrain, peta, dan bunga hero perlu dibuat prosedural/shader style atau ilustrasi 2D.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Gurun cokelat retak berubah jadi karpet bunga | `field-rock-5e37c6`/prop, `small-rock-db33a7`/prop, `wildflower-68d3a1`/prop (instanced) | Terrain dune/bukit belum ada di katalog: buat heightfield + material pasir retak. Bunga di-instance ribuan, tint merah muda |
| c01_intro | Peta Chile utara + pin Atacama; split dengan permukaan Mars | belum ada (peta) | Peta dari GeoJSON/SVG (style HISTORYMAP/CHRONICLE). Permukaan Mars = terrain yang sama dengan grade merah |
| c02 | Stasiun cuaca, penakar hujan, satu tetes air | belum ada stasiun cuaca; `obsidian-fang-rock-67e326`/prop untuk lanskap | Stasiun cuaca sederhana dari tiang + boks dengan material POLISH (bukan box polos); callout "2,3 mm" |
| c03 | Cutaway tanah, biji dan umbi tertidur | `sunflower-seed-b4fbbd`/prop | Umbi bisa dimodelkan prosedural; lapisan tanah = potongan terrain |
| c04 | Pasifik menghangat (El Niño), awan, hujan, banjir lumpur | `towering-cloud-2e00f1`/prop | Laut dengan shader gradien suhu; aliran lumpur = shader/partikel pendukung (bukan visual utama); tanpa visual korban |
| c05 | Timelapse bunga mekar, pata de guanaco menutup bukit | `wildflower-plant-cf4279`/prop, `pastel-flowering-plant-d16a03`/prop, `wildflower-68d3a1`/prop | Ganti warna ke merah muda/magenta (Cistanthe) dan kuning/merah (añañuca); animasi scale-in bertahap |
| c06 | Satelit orbit + timeline 13 titik + peta hijau 2011 | `comm-satellite-fdc2cd`/prop | Timeline dan counter = HUD 2D; peta area hijau dari layer peta c01 |
| c07_payoff | Hero shot lautan bunga golden hour, papan taman nasional bertulisan AUDIRA, kaktus | `saguaro-cactus-6b27eb`/prop (hati-hati: saguaro bukan spesies Chile, pakai sebagai siluet jauh saja atau ganti kaktus kolumnar prosedural), `wildflower-68d3a1`/prop | Papan kayu = tempat brand AUDIRA di dunia 3D. Outro card AUDIRA |

Saran engine: hybrid — dunia 3D R3F untuk gurun-berubah-taman (kontras transformasi = payoff utama, WORLDFORGE), dengan peta, timeline satelit, dan callout angka sebagai lapisan 2D HUD; terrain dan bunga hero perlu prosedural karena katalog GLB tidak punya aset gurun Chile.
