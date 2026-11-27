# Asset Candidates — Cara Kerja Tanah Longsor: Tanda-tanda Sebelum Lereng Runtuh

> Dicari via `audira_search_assets` (2026-11-27). Pencarian topik "tanah longsor lereng bukit hujan rumah desa" = 0 hasil; pencarian kata kunci Inggris menemukan tiang listrik, pohon, pagar, batu, blob terrain, dan pintu. Tidak ada GLB lereng/tebing utuh, rumah desa Indonesia, atau aliran lumpur: lereng dan cutaway tanah dibuat prosedural/2D.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Tanah lereng, retakan merambat, rembesan air | `dirt-terrain-blob-94e829` / prop, `grass-terrain-blob-c4f709` / prop | Retakan + rembesan = shader/decal prosedural; HUD "retakan baru + mata air baru" |
| c01_intro | Cutaway lereng, butir tanah, panah gaya, papan diorama "AUDIRA" | `dirt-terrain-blob-7227e6` / prop, `small-rock-db33a7` / prop | Butir tanah = instanced sphere bertekstur (bukan visual utama abstrak; tetap dalam penampang lereng) |
| c02 | Hujan meresap, pori terisi air, pengukur tekanan | — | Lebih jelas sebagai diagram 2D penampang; ikon lucide gauge/droplets |
| c03 | Lapisan kedap, bidang gelincir menyala, blok tanah bergeser | `field-rock-5e37c6` / prop | Penampang 2D/2.5D; garis bidang gelincir merah |
| c04 | Desa di lereng: retakan, rembesan, tiang & pohon miring, pintu macet | `timber-utility-pole-a93693` / prop, `utility-pole-574130` / prop, `street-tree-0d33f3` / prop, `pine-tree-3ea075` / ultra, `wooden-fence-section-d72055` / prop, `stone-fence-panel-56d138` / prop, `door-set-single-swing-d50024` / prop | Rumah generik (hindari kit Jepang yang terlalu khas); tangan tanpa wajah; kartu tanda 1–4 |
| c05 | Grafik intensitas–durasi, counter 2.626, kartu 100 mm/hari | — | 2D infografis; label "ilustrasi" dan "salah satu kriteria, pedoman 2007" |
| c06 | Aliran lumpur cepat di lembah; siluet warga melapor; alur 5 langkah peringatan dini | `small-rock-457be8` / prop, `grass-terrain-blob-389daa` / prop | Aliran lumpur prosedural tanpa orang; ikon kantor generik tanpa logo BNPB/BPBD |
| c07_payoff | Lereng utuh setelah hujan, retakan menyala, outro AUDIRA | `grass-terrain-blob-cb42d6` / prop, `pine-tree-3ea075` / ultra, `timber-utility-pole-a93693` / prop | Outro card `audira-outro-card.svg` |

Saran engine: hybrid — penampang tanah (pori, tekanan air, bidang gelincir) dan grafik ambang hujan jauh lebih terbaca di 2D, sedangkan diorama desa dengan tiang/pohon miring cocok 3D; bila harus satu engine, 2D (CHAINREACTION) lebih aman karena katalog tidak punya GLB lereng, rumah desa, atau aliran lumpur.
