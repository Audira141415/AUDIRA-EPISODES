# Asset Candidates — Negara yang Wilayahnya Ada di Dalam Negara Lain

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Globe/peta dunia, tiga titik terkurung | — | Peta vektor (Natural Earth) atau globe prosedural; GLB globe belum dicari |
| c01_intro | Diagram enklave: blok kecil di dalam blok besar | — | Diagram 2D atau extrude batas negara dari GeoJSON |
| c02 | Kompleks berkubah di tengah kota | `domed-church-dcbe85` / building | Gaya Mediterania, bukan replika Basilika Santo Petrus; perlu tuning material |
| c02 | Garis batas / tembok | `plain-wall-segment-143b6d` / building | Tembok batas yang menyala |
| c03 | Timeline + meja dokumen perjanjian | belum dicari | Cari "desk", "document", "scroll" di tahap 5 |
| c04 | Bukit batu bermenara (Monte Titano) | `bare-mountain-rowan-10e72e` / prop (vegetasi) | GLB menara benteng yang cocok tidak ditemukan ("castle tower"); cari lagi "fortress", "battlement" atau bangun dari terrain |
| c05 | Peta Afrika bagian selatan, Lesotho menyala | — | Extrude GeoJSON Afrika Selatan + Lesotho |
| c06 | Penampang medan pegunungan + penggaris ketinggian | `mountain-refuge-hut-32ab1e` / building | Pondok sebagai skala; medan dari heightmap |
| c06 | Pendaki di puncak | `mountaineer-13df29` / character (Idle/Walk/Run/Wave/Point/Cheer) | Tokoh generik, tanpa wajah orang nyata |
| c07_payoff | Tiga diorama berjajar + outro | `domed-church-dcbe85`, `mountain-refuge-hut-32ab1e` | Outro card AUDIRA dari kit brand |

Saran engine: hybrid — inti cerita adalah peta dan garis batas (paling tajam di 2D/peta extrude), sedangkan c04 dan c06 butuh kedalaman medan 3D; HISTORYMAP dengan sisipan medan R3F, atau NEGERI dengan peta extrude.
