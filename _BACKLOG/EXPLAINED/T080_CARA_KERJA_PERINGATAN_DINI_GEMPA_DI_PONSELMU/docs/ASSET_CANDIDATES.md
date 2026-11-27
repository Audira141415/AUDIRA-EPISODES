# Asset Candidates — Cara Kerja Peringatan Dini Gempa di Ponselmu

> Dicari via `audira_search_assets` (2026-11-27). Katalog punya gedung kota, karakter, smartphone, antenna, tapi tidak punya seismometer, sensor gempa, atau globe bumi. Banyak elemen kunci (gelombang seismik, cutaway bumi, ponsel layar peringatan, peta blind zone) lebih terbaca di 2D.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Ponsel bergetar, layar peringatan gempa merah, peta gelombang | `smartphone-5f05e5` / ultra | Layar peringatan = overlay 2D di atas model ponsel. Peta gelombang = 2D |
| c01_intro | Cutaway bumi, titik patahan, dua gelombang P dan S menyebar | — | Tidak ada GLB bumi/patahan; cutaway 2D/prosedural lebih jelas |
| c02 | Sensor seismometer di permukaan, sinyal ke pusat data, komputer menghitung | `comms-dish-7b129a` / prop (simbolis sensor), `antenna-mast-0954b0` / prop | Seismometer tidak ada di katalog; ikon 2D lebih akurat. Comms dish bisa jadi prop latar |
| c03 | Dua jalur peringatan: sensor tanah → server → ponsel; ponsel → server → ponsel | `smartphone-5f05e5` / ultra, `rooftop-antenna-mast-6e4944` / prop | Diagram jalur = 2D. Ponsel dan antenna sebagai prop pendukung |
| c04 | Peta episenter, ring blind zone (0/5/15/30+ dtk), siluet orang | `commuter-381e7f` / character (clip Idle) | Ring blind zone = 2D. Siluet dari karakter tanpa wajah (rule 15) |
| c05 | Dua panel InaTEWS vs InaEEWS, peta 4 wilayah pilot, gedung kota | `brick-tenement-7d2014` / building, `art-deco-setback-tower-b3a788` / building, `sensor-dish-6b1108` / prop | Panel perbandingan = 2D. Gedung kota untuk latar wilayah pilot |
| c06 | Ponsel settings, tiga ikon keselamatan, countdown | `smartphone-5f05e5` / ultra | Ikon keselamatan = lucide-react (ShieldAlert, ArrowDownToLine) |
| c07_payoff | Gelombang P vs S berbalapan, globe dengan sensor, outro AUDIRA | `globe-lamp-346cb6` / prop (simbolis saja) | Globe bumi tidak ada; `globe-lamp` terlalu kecil/tidak tepat; globe = 2D/prosedural. Outro card `audira-outro-card.svg` |

Saran engine: **2D** — topik ini sangat diagram/infografis-heavy (gelombang seismik, cutaway bumi, peta blind zone, jalur sinyal). Hampir semua elemen kunci tidak ada di katalog GLB dan lebih terbaca di 2D (CHAINREACTION atau SATELLITEBRIEFING). 3D hanya menambah latar gedung kota tanpa keuntungan naratif.
