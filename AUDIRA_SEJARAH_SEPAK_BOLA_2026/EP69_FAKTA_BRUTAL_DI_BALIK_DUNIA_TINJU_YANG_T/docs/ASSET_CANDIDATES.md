# Asset Candidates — Fakta Brutal di Balik Dunia Tinju yang Tidak Ditampilkan TV

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Angka "500+" besar, siluet petinju jatuh | Tipografi kinetik, siluet vektor | 2D motion graphic |
| c01_intro | Ring tinju tampak atas, dua siluet bertarung | Ring vektor, siluet petinju berlayer | BG/MG/FG berlapis |
| c02 | Timeline 1884–sekarang, callout "13/tahun", diagram otak | Infografis timeline, ikon tengkorak, diagram otak sederhana | HUD data callout wajib |
| c03 | Papan skor "Ronde 14", siluet kolaps, peta Korea Selatan | Papan skor animasi, peta vektor, callout "15→12" | Momen dramatis, transisi merah |
| c04 | Scan otak berputar, bar chart 17%→50%, teks "CTE" | Brain scan ilustrasi, bar chart animasi, teks kinetik | Data-heavy, cocok DATAPHYSICAL |
| c05 | Siluet Ali ikonik, transisi ke gemetar/kursi roda | Siluet karakter (pose tinju → duduk), callout "42 tahun" | Tanpa wajah nyata (rule 15 spirit) |
| c06 | Halaman jurnal JAMA, teks nama asosiasi medis, grafik batang | Mockup jurnal, teks nama (bukan logo), bar chart "miliaran $" | Tanpa logo organisasi nyata |
| c07_payoff | Ring kosong, sarung tinju tergeletak, fade ke outro | Ring redup, sarung tinju vektor, outro card AUDIRA | Mood somber, fade-out |

## Catatan

- Semua aset 2D (ilustrasi vektor, infografis, tipografi kinetik). Tidak ada kebutuhan model 3D GLB.
- Tool `audira_search_assets` tidak dijalankan — topik ini paling cocok 2D dan tidak membutuhkan model fisik.
- Siluet dipakai untuk semua figur manusia (tidak ada wajah nyata).

Saran engine: **2D** — topik data-heavy (angka kematian, persentase CTE, timeline) paling cocok divisualkan dengan infografis berlapis, callout HUD, dan tipografi kinetik. 3D tidak menambah nilai karena tidak ada objek fisik yang perlu kedalaman spasial.
