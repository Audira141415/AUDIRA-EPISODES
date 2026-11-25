# Asset Candidates — Negara yang Wilayahnya Lebih Kecil dari Kebun Binatang

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Gerbang + pagar Ragunan top-down, tapak Vatikan jatuh di dalam | `elephant-base` / animal, `giraffe-base` / animal | Pagar/gerbang kebun binatang tidak ada di katalog: bangun prosedural (pagar + plakat teks). Tapak negara = shape extrude dari GeoJSON |
| c01_intro | Diorama Vatikan: kubah basilika, kolonade, tembok | `domed-church-dcbe85` / building, `civic-dome-pavilion-97ea07` / building | Tidak ada model St. Peter; pakai kubah generik + kolonade prosedural. Hindari lambang resmi |
| c02 | Peta Italia arsip, panah 1870, dokumen perjanjian 1929 | belum dicari (peta 2D) | Lebih cocok layer 2D gaya HISTORYMAP; tanpa wajah Paus/Mussolini |
| c03 | Lapangan golf 18 lubang dari atas, bendera lubang | `survey-flag-fa500f` / prop, `corner-flag-0b43b0` / prop | Tidak ada aset golf khusus; green + bunker prosedural, bendera pakai flag prop |
| c04 | Pesisir Monaco, pelabuhan, kapal, daratan reklamasi naik | `sailboat-3ee283` / ultra, `boathouse-cf20e6` / building | Gedung rapat dari kit mediterranean-island-village; Le Portier = blok terrain extrude |
| c05 | Bronx Zoo lalu Safari Park, sabana jerapah + gajah | `giraffe-base` / animal, `elephant-base` / animal, `lion-base` / animal | Tapak Monaco overlay di atas sabana |
| c06 | Dua kota mini, ikon orang bertambah | belum dicari | Penghitung + ikon orang 2D/instanced lebih murah dari karakter rigged |
| c07_payoff | Ragunan golden hour, tiga tapak Vatikan berjajar, outro card | `elephant-base` / animal, `giraffe-base` / animal | Outro AUDIRA dari `shared/assets/brand/audira-outro-card.svg` |

Saran engine: hybrid — inti cerita perbandingan skala tapak di atas peta (diorama 3D SCALEFORGE dengan tapak extrude), c02 sejarah lebih kuat sebagai peta 2D gaya HISTORYMAP.
