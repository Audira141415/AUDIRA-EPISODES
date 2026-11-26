# Asset Candidates — Cara Kerja KRL: Kereta yang Ditenagai Kabel di Atasnya

> Dicari via `audira_search_assets` (2026-11-26). Katalog punya rel, platform/stasiun, tiang utilitas, dan trem kota. Tidak ada KRL/EMU modern, pantograf, katenari, gardu traksi, transformator, atau layang-layang: itu dibuat procedural/2D. Kereta dibuat generik tanpa livery nyata (rule 15).

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Close-up pantograf menggesek kawat kontak, percikan | `city-tram-0d092d` / vehicle (referensi bentuk atap saja) | Pantograf lengan tunggal dibuat procedural (rounded box + engsel); HUD "1.500 V DC" |
| c01_intro | Rangkaian KRL melaju di bawah tiang & kabel, siluet kereta 1925 | `straight-track-d4cf38` / prop, `curved-track-819ec6` / prop, `railway-telegraph-pole-run-bb9354` / prop, `platform-run-3738d0` / prop | Badan KRL generik procedural (bukan `mainline-diesel-locomotive`); warna netral, tanpa logo |
| c02 | Gardu traksi: trafo, lemari penyearah, kabel masuk | `utility-pole-574130` / prop | Tidak ada GLB trafo/gardu; cutaway 2D/procedural; diagram sinus → garis lurus |
| c03 | Diagram katenari: kawat pemikul, penggantung, kawat kontak, tiang | `timber-utility-pole-a93693` / prop, `railway-telegraph-pole-run-bb9354` / prop | Kabel = tube/line procedural tebal (bukan LineSegments sebagai visual utama); label HUD |
| c04 | Pantograf tampak samping + pegas, kabel naik turun | — | Procedural; aset katalog tidak ada |
| c05 | X-ray kereta: konverter, motor traksi, bogie, roda, rel, arus pulang | `straight-track-d4cf38` / prop, `track-maintenance-trolley-50cb76` / vehicle (referensi roda/bogie) | Aliran arus sebagai tube menyala; HUD "DC → AC 3 fase", "Rel = jalur pulang" |
| c06 | Kartu larangan: atap kereta, kabel, layang-layang | `city-commuter-52a53f` / character (siluet, clip Idle), `commuter-381e7f` / character | Siluet tanpa wajah; layang-layang 2D; ikon lucide larangan |
| c07_payoff | Loop sirkuit menyala gardu → rel, outro AUDIRA | `straight-track-d4cf38` / prop, `utility-pole-574130` / prop, `platform-canopy-run-bc2275` / prop | Brand AUDIRA di papan stasiun generik; outro card `audira-outro-card.svg` |

Saran engine: 3D — topik mekanis-spasial (kabel di atas, pantograf di atap, arus lewat roda ke rel) paling jelas dengan cutaway 3D bergerak (INNERWORKS/URBANFORGE); rel, tiang, dan stasiun ada di katalog, tapi KRL, pantograf, katenari, dan gardu harus dibangun procedural, jadi cadangannya hybrid (diagram 2D untuk gardu dan sirkuit).
