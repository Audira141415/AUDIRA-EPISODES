# Asset Candidates — Cara Kerja Setrika Uap

> Dicari via `audira_search_assets` (2026-11-26), kata kunci "iron", "shirt clothes laundry", "ironing board table". Katalog tidak punya setrika, papan setrika, atau kemeja; hasil "iron" semuanya besi/logam (ingot, pagar). Yang relevan hanya props laundry pendukung.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Makro lipatan kemeja polos, rantai selulosa, setrika generik | — | Tidak ada GLB setrika/kemeja; ilustrasi 2D + diagram molekul |
| c01_intro | Setrika uap generik terurai (exploded view) | — | Buat 2D vektor (atau model procedural rounded bila 3D); tanpa logo merek |
| c02 | Diagram rantai selulosa + ikatan hidrogen, tangan siluet meremas kain | `laundry-basket-16ed8e` / prop | Keranjang hanya pembuka konteks; inti adegan diagram 2D. HUD "±30–40% amorf" |
| c03 | Cutaway elemen pemanas + pelat dasar, inset kertas paten | — | Ilustrasi 2D; HUD "1882"; tanpa wajah penemu |
| c04 | Tangki air, uap keluar lubang pelat, molekul air di serat | — | Partikel uap hanya efek pendukung, subjek utama tetap setrika + serat |
| c05 | Keping bimetal melengkung, kontak listrik, lampu indikator | — | Diagram mekanis 2D, loop panas-dingin 2× |
| c06 | Kenop suhu + simbol label 1/2/3 titik + tiga jenis kain | `clothes-line-ee47e4` / prop | Jemuran opsional sebagai latar panel kain; HUD 120/160/210 °C |
| c07_payoff | Tiga langkah buka-luruskan-kunci, kemeja licin, outro AUDIRA | `clothes-line-ee47e4` / prop | Outro card `audira-outro-card.svg` |

Saran engine: 2D — subjek inti (setrika, serat, molekul, bimetal, simbol label) tidak ada di katalog GLB dan paling jelas sebagai diagram cutaway/infografis; INNERWORKS 3D hanya layak bila model setrika dibuat sendiri, jadi BONGKAR atau PRECISION (2D) lebih aman.
