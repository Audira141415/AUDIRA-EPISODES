# Asset Candidates — Cara Kerja Pengujian Obat Sebelum Dijual

> Topik ini berbasis pipeline/infografis: visual utama adalah diagram tahapan, grafik bar, counter animasi, dan ikon. Aset 3D dari katalog hanya cocok sebagai latar opsional (lab, pil). Belum dicari via `audira_search_assets` (tool tidak dimuat di sesi backlog).

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Pil obat, jalur berliku lab→apotek, HUD ">10 TAHUN" | belum dicari | Pil bisa GLB (pill/capsule), jalur = 2D infografis |
| c01_intro | Pipeline 5 kotak, HUD "<10% LOLOS" | — | Murni 2D infografis |
| c02 | Tabung reaksi, cawan petri, silhouette hewan lab, timeline bar | belum dicari | Tabung reaksi/flask bisa GLB; inti visual = 2D diagram |
| c03 | Tiga panel Fase I–III: ikon orang, counter, peta dunia | — | 2D infografis / teks kinetik |
| c04 | Dua bar chart biaya ($2,6M vs $985jt), label sumber | — | 2D diagram perbandingan |
| c05 | Ikon virus COVID, badge EUA → persetujuan penuh | belum dicari | Virus bisa GLB; badge = 2D overlay |
| c06_payoff | Pipeline utuh dari atas, ikon mata (Fase IV), outro | — | 2D animasi; outro card `audira-outro-card.svg` |

Saran engine: **2D** — topik ini pipeline/infografis-driven. Semua visual utama adalah diagram tahapan, counter, grafik bar, dan HUD callout yang jauh lebih tajam dan informatif di 2D. Aset GLB (pil, tabung reaksi, virus) hanya pelengkap opsional. Kandidat style: CHAINREACTION (2D — visual rantai tahapan cocok), DATAPHYSICAL (2D — infografis data kuat), INNERWORKS (2D/3D — potongan mekanisme).
