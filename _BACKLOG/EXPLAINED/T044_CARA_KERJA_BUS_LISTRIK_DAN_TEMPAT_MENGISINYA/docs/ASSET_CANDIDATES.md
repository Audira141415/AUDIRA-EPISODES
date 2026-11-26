# Asset Candidates — Cara Kerja Bus Listrik dan Tempat Mengisinya

> Dicari via `audira_search_assets` (2026-11-27). Katalog punya bus kota, bus gandeng, halte, tiang charger kendaraan, kabinet gardu, hangar depo, dan karakter komuter ber-rig. Tidak ada modul baterai bus, inverter, motor listrik, atau pantograf bus: dibuat procedural/2D (cutaway, diagram aliran energi).

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Bus kota 12 m di jalan kota, bodi jadi tembus pandang, baterai menyala | `city-bus-49fd97` / vehicle, `curb-strip-28e992` / prop, `bus-shelter-f786b4` / prop | Livery polos tanpa logo (rule 15); efek x-ray lewat material transparan |
| c01_intro | Bus di timbangan, penumpang masuk, penggaris 12 m | `city-bus-49fd97` / vehicle, `commuter-381e7f` / character (clip Walk) | Karakter tanpa detail wajah; HUD "±13 t" → "18 t" |
| c02 | Exploded view modul baterai di atap | `battery-bank-b4d362` / prop (pengganti modul), `city-bus-49fd97` / vehicle | Modul bisa procedural (RoundedBox + POLISH), tanpa merek sel; HUD "300–350 kWh" |
| c03 | Aliran energi baterai → inverter → motor belakang → roda; rem regeneratif | `utility-substation-cabinet-1c903b` / prop (pengganti kotak inverter) | Diagram garis cahaya 2D/HUD lebih jelas; label "DC → AC" |
| c04 | Peta kota generik, rute bolak-balik, bar baterai turun | — | Peta 2D generik (bukan peta nyata); HUD "±1,3 kWh/km", "±250 km" |
| c05 | Depo malam, deretan bus, kabel ke tiang charger | `vehicle-depot-hangar-6adb80` / building, `vehicle-charging-post-45cbb8` / prop, `utility-substation-cabinet-1c903b` / prop, `city-bus-49fd97` / vehicle | Instancing beberapa bus; HUD "120 kW per pengisi" |
| c06 | Terminal, pantograf turun ke atap bus | `transit-station-module-ffb6c1` / building, `articulated-transit-bus-6be725` / vehicle, `city-bus-49fd97` / vehicle | Pantograf tidak ada di katalog: rakit procedural (lengan + rel atap); timer "15 menit", bar 20→80% |
| c07_payoff | Bus keluar depo ke kota pagi, counter 500, outro | `city-bus-49fd97` / vehicle, `vehicle-depot-hangar-6adb80` / building, `parking-garage-6e4f2c` / building, `corner-tenement-92fb62` / building | Teks "Transjakarta" tanpa logo/livery; outro card `audira-outro-card.svg` |

Saran engine: 3D — bus, depo, tiang charger, dan terminal tersedia sebagai GLB, dan topik "cara kerja" cocok dengan cutaway 3D (INNERWORKS/URBANFORGE); bagian dalam (baterai, inverter, pantograf) dirakit procedural plus HUD 2D untuk diagram energi dan peta rute.
