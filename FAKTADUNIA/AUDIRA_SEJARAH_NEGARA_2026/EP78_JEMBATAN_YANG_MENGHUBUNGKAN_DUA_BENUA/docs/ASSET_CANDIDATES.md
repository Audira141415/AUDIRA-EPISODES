# Asset Candidates — Jembatan yang Menghubungkan Dua Benua

Dicari dengan `audira_search_assets` (2026-11-25). Katalog tidak punya jembatan gantung modern: jembatan Bosphorus (menara, kabel utama, hanger, lantai) perlu dibangun prosedural dari silinder/tube + material baja `POLISH.*`, bukan kotak polos.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00 Hook | Menara jembatan gantung, label Eropa/Asia | — (prosedural) · `boxy-sedan-70s-7d55f7` / vehicle untuk lalu lintas di lantai | Bangun rig jembatan sekali, dipakai ulang c03–c07 |
| c01 Intro | Peta selat 3D, garis ukur 31 km / 700 m | — | Terrain heightmap/peta stylized + HUD penggaris |
| c02 Darius | Kapal kayu berjajar, prajurit bertombak | `ship-s-longboat-f159fd` / vehicle · `sailboat-3ee283` / ultra · `spear-soldier-base` / character (clip Walk) · `spear-e9824e` / prop | Instancing longboat sebagai ponton; prajurit dari jauh, tanpa close-up wajah |
| c03 Konstruksi 1973 | Menara naik, kabel ditarik, fondasi | — (prosedural) · `steel-girder-bridge-d80bb4` / prop (referensi segmen lantai) | Time-lapse build-up, HUD kalender |
| c04 Angka | Blueprint samping + kapal kargo lewat | `ship-anchor-c2b4f1` / prop (detail) | Kapal kargo belum ada di katalog: cari "cargo"/"tanker" lagi atau buat siluet sederhana |
| c05 Tiga penyeberangan | Jembatan ke-2, kereta di terowongan, jembatan ke-3 | `train-engine-180979` / ultra · `tunnel-portal-4ac9f3` / prop | Jembatan ke-2/ke-3 = variasi rig prosedural (tinggi menara beda) |
| c06 Jalur kapal | Peta Laut Hitam–Marmara, tanker di bawah jembatan | `sailboat-3ee283` / ultra | Panah rute di HUD peta |
| c07 Payoff | Hero shot 3 jembatan + kapal Darius transparan | `ship-s-longboat-f159fd` / vehicle (material ghost) · `blue-domed-chapel-297391` / building (siluet kubah kota, opsional) | Golden hour, outro card AUDIRA |

Saran engine: 3D — subjek adalah struktur fisik berskala besar (bentang, tinggi menara, kapal di bawahnya) yang paling terbaca dengan kedalaman dan kamera terbang; rig jembatan prosedural + GLB kapal/kereta/prajurit cukup.
