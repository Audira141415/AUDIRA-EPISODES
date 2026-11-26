# Asset Candidates — Cara Kerja Gerbang Tol Tanpa Henti

> Dicari via `audira_search_assets` (2026-11-26). Katalog punya mobil low-poly (gaya retro), tile jalan raya, palang (barrier arm), gantri lampu lalu lintas, satelit, kamera dome, dan smartphone. Tidak ada gardu tol, gantri tol, unit kaca depan (IU/OBU), atau kartu: dibuat 2D/procedural.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Mobil melaju menembus gantri tanpa palang | `hatchback-80s-e95554` / vehicle, `highway-tile-3a705e` / prop, `traffic-signal-gantry-e02176` / prop, `lane-marking-decal-d1a212` / prop | Mobil gaya retro; cari sedan modern bila ada di kit lain. Gantri dimodifikasi jadi gantri tol polos |
| c01_intro | Antrean di gerbang berpalang, tangan menempel kartu | `lifting-barrier-arm-64a343` / prop, `checkpoint-barrier-pole-59c197` / prop, `boxy-sedan-70s-7d55f7` / vehicle, `pickup-truck-70s-8c0080` / vehicle | Gardu tol tidak ada: rakit dari `passport-control-booth-7724c6` / prop atau 2D. Kartu generik 2D tanpa merek. HUD "31 Okt 2017" |
| c02 | Gantri + antena, alat di kaca depan, gelombang radio | `traffic-signal-gantry-e02176` / prop, `antenna-mast-0954b0` / prop, `road-tile-286319` / prop | Unit kaca depan + kartu dibuat 2D/procedural; gelombang radio sebagai cincin shader. Peta Singapura generik 2D |
| c03 | Kamera pelat, OCR, amplop tagihan | `eye-in-the-sky-23fe89` / prop, `conference-camera-bar-419e10` / prop | Pelat fiktif; OCR box + amplop 2D |
| c04 | Satelit, jejak rute, ponsel di dasbor | `comm-satellite-fdc2cd` / prop, `smartphone-5f05e5` / ultra, `highway-tile-3a705e` / prop | UI ponsel fiktif tanpa nama aplikasi. HUD "GNSS · tarif = jarak" |
| c05 | Dokumen regulasi, peta Bali, pin uji coba | — | 2D: dokumen teks "Permen PUPR 18/2020" tanpa logo; peta pulau generik |
| c06 | Timeline status, kartu tantangan | — | 2D infografis + ikon lucide (Database, Scale, Calendar). Tulis "per 27 Sep 2026" |
| c07_payoff | Tiga teknologi menyatu, mobil di gantri saat golden hour, outro | `comm-satellite-fdc2cd` / prop, `eye-in-the-sky-23fe89` / prop, `hatchback-80s-e95554` / vehicle, `traffic-signal-gantry-e02176` / prop | Outro card `audira-outro-card.svg` |

Saran engine: hybrid — jalan tol, mobil, gantri, satelit cocok 3D (URBANFORGE), tetapi kartu, unit kaca depan, OCR pelat, regulasi, dan timeline status lebih jelas di 2D; bila satu engine, 2D (DATAPHYSICAL/CIRCUITFORGE) lebih aman karena gardu dan gantri tol tidak ada sebagai GLB.
