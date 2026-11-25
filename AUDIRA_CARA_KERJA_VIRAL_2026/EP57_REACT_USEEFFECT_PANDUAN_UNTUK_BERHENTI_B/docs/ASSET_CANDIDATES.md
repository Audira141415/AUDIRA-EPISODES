# Asset Candidates — React useEffect: Panduan untuk Berhenti Bikin Memory Leak

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Layar/jendela browser generik, jam berdetak di belakang | `desk-monitor-32cfce` / prop; `wall-clock-05f8ff` / prop | Browser UI digambar 2D generik, tanpa logo browser/React resmi (rule 15) |
| c01_intro | Chip tahun + 4 ikon (jam, antena, telinga, panah jaringan) | `laptop-e775ba` / prop | Ikon dibuat vektor 2D; jangan pakai logo React asli, ganti glyph atom generik |
| c02 | Jam menumpuk, grafik memori naik | `wall-clock-0c555c` / prop (instanced, ditumpuk) | Counter HUD 1→4 |
| c03 | Blok kode dibelah, diagram siklus setup/cleanup | — | Tipografi kode kinetik 2D, belum butuh GLB |
| c04 | Papan pasangan colokan/stopkontak | — (belum ketemu GLB colokan) | Bisa ilustrasi 2D; kandidat metafora keran `boiling-water-tap-e594db` / prop untuk "tutup keran" |
| c05 | Konsol merah, warning dicoret, alarm palsu | `fire-alarm-call-box-56d332` / prop | Alarm dimatikan sebagai metafora false positive |
| c06 | Panel konsol dev, log 2× | `computer-bench-run-lit-87d9cf` / prop | Panel log 2D di atas monitor |
| c07_payoff | Jam berhenti, grafik turun, outro card AUDIRA | `wall-clock-05f8ff` / prop | Outro `audira-outro-card.svg` |

Saran engine: 2D — topik konsep kode (diagram siklus, potongan kode, log konsol) paling terbaca sebagai tipografi kinetik dan diagram; GLB hanya aksen metafora (jam, monitor, alarm), jadi hybrid ringan opsional.
