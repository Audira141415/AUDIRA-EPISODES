# Asset Candidates — Cara Kerja Ambulans: Ruang Gawat Darurat di Atas Roda

> Dicari via `audira_search_assets` (2026-11-27). Katalog punya hospital kit lengkap (ambulans van, tabung gas medis, monitor tanda vital, IGD, karakter paramedis ber-rig) dan jalan/lampu lalu lintas. Tidak ada AED, papan tulang belakang, atau ponsel generik: dibuat 2D/procedural. Wajib cek tekstur `ambulance-van-29919a`: hapus lambang palang merah/logo bila ada (rule 15 + Konvensi Jenewa).

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Dua ambulans berdampingan, pintu belakang terbuka; kabin kosong vs penuh alat | `ambulance-van-29919a` / vehicle, `casualty-stretcher-965771` / prop, `medical-gas-cylinder-a2d6a7` / prop | Instance van dua kali, interior beda; label HUD "TRANSPORTASI" vs "GAWAT DARURAT" |
| c01_intro | Cutaway ambulans 3 lapis: bodi, rak alat, kursi petugas | `ambulance-van-29919a` / vehicle, `supply-shelving-rack-ae446a` / prop, `vital-signs-monitor-632560` / prop | Checklist HUD 3 baris |
| c02 | Ponsel, ruang operator, peta kota dengan titik ambulans | `ambulance-van-29919a` / vehicle (ikon di peta) | Ponsel & ruang operator 2D generik tanpa merek; HUD "119" + "112" |
| c03 | Dua petugas berlutut, pasien siluet, A-B-C-D-E, tandu | `paramedic-b0f358` / character (Idle/Walk/Point), `field-medic-fd8919` / character, `casualty-stretcher-965771` / prop | Wajah tidak detail, sudut belakang/samping; pasien siluet tanpa wajah |
| c04 | Interior kabin: oksigen, AED, papan tulang belakang, panel BLS/ALS | `medical-gas-cylinder-a2d6a7` / prop, `vital-signs-monitor-632560` / prop, `casualty-stretcher-965771` / prop | AED & papan spinal 2D/procedural; tanpa merek alat |
| c05 | Ambulans melaju, lampu merah berkedip, sirene, podium urutan hak utama, lampu lalu lintas | `ambulance-van-29919a` / vehicle, `two-lane-street-tile-fe56b6` / prop, `traffic-light-5e5ae6` / prop, `boxy-sedan-70s-7d55f7` / vehicle | Podium "1-2-3" di HUD; tanpa logo polisi/damkar |
| c06 | Tulisan terbalik di kap, sudut spion, mobil menepi, motor membuntuti dicoret | `ambulance-van-29919a` / vehicle, `boxy-sedan-70s-7d55f7` / vehicle, `asphalt-road-tile-f6593c` / prop | Decal "AMBULANS" mirror dibuat sendiri; HUD denda Rp250.000 |
| c07_payoff | Ambulans tiba di IGD, rute emas di peta, kartu "golden hour" | `emergency-entrance-block-9e5caf` / building, `ambulance-bay-hatching-decal-106ff2` / prop, `ambulance-van-29919a` / vehicle | Tanpa logo RS; outro card `audira-outro-card.svg` |

Saran engine: 3D — hospital kit katalog (ambulans, IGD, paramedis ber-rig, tabung gas, monitor) cukup untuk diorama jalan dan cutaway kabin ala INNERWORKS/URBANFORGE; HUD angka, A-B-C-D-E, dan tulisan terbalik dibuat sebagai overlay 2D.
