# Asset Candidates — Kenapa Pemadaman Listrik Bisa Merambat ke Satu Pulau

> Dicari via `audira_search_assets` (2026-11-27). Katalog tidak punya menara SUTET, pembangkit, turbin, atau gardu induk. Yang ada: tiang telegraf, lemari gardu kecil, lampu lalu lintas, pohon, jalan. Peta, meter frekuensi, dan diagram jaringan dibuat 2D.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Peta Jawa malam, lampu kota padam bergelombang barat | — | Peta 2D generik; counter "21,9 juta pelanggan" |
| c01_intro | Kereta berhenti, lampu lalu lintas mati, kota gelap | `traffic-light-b217a2` / prop, `traffic-signal-2a517e` / prop, `street-tile-c7e3cf` / prop | Kereta tanpa logo operator; wilayah gelap vs terang di peta 2D |
| c02 | Menara SUTET, dua sirkuit, pohon di bawah kabel, kilatan | `lineside-tree-97e02a` / prop, `street-tree-0d33f3` / prop, `telegraph-pole-line-95e382` / prop (simbolis) | Tidak ada GLB menara 500 kV; ilustrasi 2D lebih akurat. HUD "500 kV", "11.45" |
| c03 | Peta skematik jaringan timur → barat, jalur putus, peta terbelah | — | Diagram 2D; panah daya, warna merah/hijau |
| c04 | Meter frekuensi 50 Hz, timbangan pasokan vs beban, blok kota padam bertahap | `utility-substation-cabinet-1c903b` / prop | Meter & timbangan 2D; HUD "50 Hz", "49,5 Hz", "≥30%" |
| c05 | Pembangkit berjajar seperti domino, lepas satu per satu | — | Ikon pembangkit 2D generik; HUD "±3 menit (hitungan sendiri)" |
| c06 | Globe → Amerika Utara → Iberia, wilayah gelap | — | Peta 2D tanpa bendera/logo; HUD "2003 · ±50 juta orang", "28 April 2025" |
| c07_payoff | Jawa menyala kembali gardu demi gardu, outro | `utility-substation-cabinet-1c903b` / prop | Outro card `audira-outro-card.svg` |

Saran engine: 2D — topiknya peta, diagram aliran daya, dan meter frekuensi; katalog GLB tidak punya menara SUTET atau pembangkit, sehingga 2D (CHAINREACTION/DATAPHYSICAL) lebih akurat dan terbaca.
