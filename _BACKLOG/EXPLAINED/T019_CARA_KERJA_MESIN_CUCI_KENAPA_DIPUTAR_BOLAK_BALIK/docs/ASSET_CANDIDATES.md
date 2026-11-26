# Asset Candidates — Cara Kerja Mesin Cuci: Kenapa Diputar Bolak-balik

> Dicari via `audira_search_assets` (2026-11-26) dengan kata kunci "washing machine", "washer laundromat dryer", "laundry basket clothes shirt towel", "electric motor gear pulley". Katalog TIDAK punya GLB mesin cuci, tabung bersirip, pakaian lepas, atau motor listrik. Yang ada hanya properti rumah pendukung. Subjek utama (penampang tabung, lintasan baju, lilitan) harus dibuat 2D/procedural.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Jendela mesin cuci generik, tabung berputar kanan-kiri, panah arah membalik | — | Tidak ada GLB mesin cuci; ilustrasi 2D tanpa merek/logo (rule 15) |
| c01_intro | 4 ikon faktor cuci, makro noda lepas dari serat | — | Ikon lucide (Thermometer, Droplet, Clock, Hand) preset `ICON_HUD`; HUD "4 faktor" |
| c02 | Penampang tabung bukaan depan: sirip, kaus terangkat lalu jatuh, lintasan putus-putus | — | Cutaway 2D paling jelas; HUD "40–50 rpm" |
| c03 | Tabung ngebut, kaus menempel di dinding; gauge rpm dengan garis merah | — | Gauge 2D, HUD "±60 rpm" |
| c04 | Cucian menggumpal melilit (kemeja + celana) | `laundry-basket-16ed8e` / prop (opsional, pembuka adegan) | Gumpalan kain digambar 2D; GLB keranjang hanya pemanis |
| c05 | Timeline maju 5 dtk / jeda / mundur 5 dtk, gumpalan terurai, buih merata | — | Timeline kinetik HUD; animasi kain 2D |
| c06 | Penampang mesin bukaan atas: pengaduk di dasar, pusaran air vs arus bergolak | — | Diagram aliran 2D (panah arus berbentuk donat) |
| c07_payoff | Split melilit vs terurai, tabung peras ngebut, air terlempar lewat lubang, outro | `clothes-line-ee47e4` / prop, `washing-line-06b44e` / prop | Jemuran sebagai penutup cucian bersih; HUD "1.000+ rpm"; outro card `audira-outro-card.svg` |

Saran engine: 2D — katalog tidak punya GLB mesin cuci atau tabung bersirip, sedangkan inti cerita (penampang tabung, lintasan baju jatuh, lilitan terurai, arus air) paling terbaca sebagai cutaway/diagram 2D; BONGKAR (2D) paling cocok, INNERWORKS/FLUIDFORGE 3D hanya bila mesin cuci dimodelkan sendiri.
