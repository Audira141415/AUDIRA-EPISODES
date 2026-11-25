# Asset Candidates — Kisah Hidup Pelari Maraton yang Lari 42 Km Meski Kakinya Patah

> Dicari via `audira_search_assets` (2026-11-25). Katalog tidak punya karakter "runner/athlete"; pakai karakter ber-rig dengan klip Run/Walk + material kostum lari. Tokoh nyata ditampilkan siluet/stilisasi, bukan wajah realistis.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Lutut berbalut, kaki terpincang di aspal malam | `commuter-381e7f` (character, klip Walk) | Close-up kaki; perban = mesh/tekstur tambahan; HUD "LUTUT DISLOKASI" |
| c01_intro | Peta Meksiko + kontur ketinggian | — (2D peta/diagram) | Peta 2D lebih terbaca daripada terrain; HUD "20 OKT 1968", "2.240 M" |
| c02 | Barisan start, pelari Tanzania | `commuter-381e7f`, `construction-worker-c1ad8c` (character, klip Run) sebagai kerumunan pelari; `art-deco-setback-tower-b3a788`, `classical-bank-04954e` (building) jalan kota | Ganti material ke singlet + nomor dada; name plate teks |
| c03 | Pelari berdesakan, satu jatuh | karakter di atas (klip Run) + `curb-strip-28e992` (prop) | Animasi jatuh tidak ada di klip; pakai cut + slow-mo + diagram sendi 2D |
| c04 | Pertolongan pertama, bangkit, jalan sepi | `sideline-medical-tent-ce1649` (prop), `paramedic-b0f358` / `field-medic-fd8919` (character) | Counter HUD "18 MUNDUR" |
| c05 | Stadion senja, juara, podium | `grandstand-seating-run-fc9023`, `stand-roof-run-cfd457`, `stand-gable-end-53847a` (building), `floodlight-mast-4482be`, `a-running-track-tile-daf991` (prop) | Podium medali tidak ada di katalog (hasil cari "podium" tidak cocok); buat sederhana atau 2D |
| c06 | Masuk stadion malam, tribun setengah kosong bersorak | aset stadion c05 + karakter klip Cheer (`commuter-381e7f`) | Lampu sorot menyala; HUD "+1 JAM", "#57 · TERAKHIR" |
| c07_payoff | Garis finis, langit malam, kutipan kinetik, outro | `a-running-track-tile-daf991` (prop), `floodlight-mast-4482be` (prop) | Tipografi kinetik "5.000 MIL"; kartu "1983"; outro card AUDIRA |

Saran engine: hybrid — kisah karakter emosional paling kuat lewat 2D sinematik (CINESTORY/CHARACTERFLOW, siluet tanpa wajah), dengan latar stadion/jalan 3D dari kit stadium + city; katalog tidak punya model pelari khusus atau animasi jatuh.
