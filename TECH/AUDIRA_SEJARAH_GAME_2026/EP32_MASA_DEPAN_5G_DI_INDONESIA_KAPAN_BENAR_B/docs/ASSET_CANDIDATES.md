# Asset Candidates — Masa Depan 5G di Indonesia: Kapan Benar-Benar Merata?

> DRAF pra-produksi (backlog, 2026-11-25). Dicari lewat `audira_search_assets`. Operator tanpa logo, nama sebagai teks polos.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | HP close-up, ikon 5G di status bar, video loading | `smartphone-5f05e5` / ultra | Layar HP = plane tekstur UI 2D di atas model |
| c01_intro | Kalender 27 Mei 2021, peta Indonesia + 9 titik kota | — (peta 2D/SVG) | Peta vektor Indonesia; aset GLB tidak perlu |
| c02 | Jalan tol data sempit, mobil-paket macet | `highway-tile-3a705e` / prop, `road-tile-286319` / prop, `traffic-cone-c421e4` / prop, `traffic-light-5e5ae6` / prop | Label "20 MHz · 2,3 GHz" sebagai HUD di aspal |
| c03 | Menara BTS tumbuh di peta, counter 2.200 | `rooftop-antenna-mast-6e4944` / prop, `antenna-mast-0954b0` / prop | Tidak ada BTS seluler realistis di katalog; pakai antenna mast atau ikon menara 2D |
| c04 | Speedometer 88 Mbps, HP keluar lingkaran sinyal 5G ke 4G | `smartphone-5f05e5` / ultra | Speedometer dan cincin sinyal dibuat 2D/HUD |
| c05 | Palu lelang, dua balok spektrum 700 MHz vs 2,6 GHz | `hammer-fa3e51` / ultra | Belum ada gavel; hammer biasa atau ikon palu 2D. Gelombang = shader/garis 2D |
| c06 | Dokumen komitmen, progress bar 51%, jam pasir, ikon 538 desa | `two-story-house-40f6dc` / building, `cube-house-module-a9b8e8` / building | Desa sebagai ikon kecil; progress bar dan jam pasir 2D |
| c07_payoff | Timeline 2021→2026→±2031, peta menyala separuh, outro AUDIRA | `three-storey-shophouse-2f6378` / building, `corner-shophouse-ad15c2` / building | Kota mini opsional untuk hero shot; outro card `audira-outro-card.svg` |

Saran engine: 2D — topik data/infrastruktur (peta, spektrum, speedometer, timeline) lebih terbaca sebagai infografis; katalog GLB tidak punya menara BTS atau gavel yang pas, cocok dengan kandidat DATAPHYSICAL/BROADCASTFORGE (2D).
