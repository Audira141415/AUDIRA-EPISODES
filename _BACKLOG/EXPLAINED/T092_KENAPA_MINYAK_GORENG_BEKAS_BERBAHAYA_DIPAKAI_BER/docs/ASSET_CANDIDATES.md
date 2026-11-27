# Asset Candidates — Kenapa Minyak Goreng Bekas Berbahaya Dipakai Berulang

> Dicari via `audira_search_assets` (2026-11-27). Katalog tidak punya wajan, minyak goreng, atau makanan gorengan; visual utama perlu dibuat 2D (ilustrasi vektor/foto cutout).

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Wajan berisi minyak goreng bergelembung, termometer | — | Tidak ada GLB wajan/minyak; ilustrasi 2D |
| c01_intro | Molekul asam lemak, rantai karbon pecah, partikel aldehida | — | Diagram kinetik 2D; tidak butuh GLB |
| c02 | Gliserol pecah → akrolein (asap); termometer 230°C turun | `sample-container-c5dc43` / ultra, `alchemy-flask-b1b4fb` / prop | Flask sebagai representasi reaksi kimia; termometer 2D |
| c03 | Gelas ukur berisi minyak, peta dunia, grafik TPC naik | `reagent-bottle-shelf-8fd723` / prop, `sample-tube-rack-3a32bd` / prop | Rak reagen sebagai penanda lab/pengukuran; peta dan grafik 2D |
| c04 | Angka "3–4×" besar, tanda tanya, faktor-faktor berputar | `hazard-sign-plate-d54657` / prop | Tanda peringatan; sisanya tipografi kinetik 2D |
| c05 | Empat panel perbandingan minyak baru vs bekas | `bottle-ca0f79` / ultra, `wine-bottle-75a822` / prop | Botol sebagai wadah minyak; perbandingan 4 panel 2D |
| c06_payoff | Minyak jernih dituang, minyak hitam dibuang, outro AUDIRA | `bottle-ca0f79` / ultra | Botol; outro card AUDIRA |

Saran engine: **2D** — topik kimia/mekanisme, visual utama (wajan, minyak, molekul, grafik TPC, termometer) tidak ada di katalog GLB dan lebih efektif sebagai ilustrasi 2D berlayer (BG/MG/FG). Style kandidat: BONGKAR (2D, bongkar mekanisme), CHAINREACTION (2D, reaksi berantai), NANOFORGE (3D, skala mikro — opsional untuk close-up molekul c01–c02 saja).
