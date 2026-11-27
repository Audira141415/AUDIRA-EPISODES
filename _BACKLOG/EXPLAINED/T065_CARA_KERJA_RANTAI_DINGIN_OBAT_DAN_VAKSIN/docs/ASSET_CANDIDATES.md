# Asset Candidates — Cara Kerja Rantai Dingin Obat dan Vaksin

> Dicari via `audira_search_assets` (2026-11-27). Katalog punya truk, gudang, gedung klinik, dan karakter perawat/dokter ber-rig. Tidak ada kulkas/freezer, cold box, vaccine carrier, vial, atau jarum suntik: semua itu dibuat 2D/procedural.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Vial vaksin generik, termometer merah/biru, kristal es | — | Tidak ada GLB vial; ilustrasi 2D atau procedural (silinder kaca). Tanpa merek |
| c01_intro | Termometer besar, pita 2–8 °C, deretan vial | — | 2D HUD; callout "2–8 °C" |
| c02 | Rute pabrik → gudang provinsi → kab/kota → puskesmas → pos pelayanan; truk, cold box | `delivery-truck-a9537e` / vehicle, `brick-depot-warehouse-3dd642` / building, `dock-warehouse-bf0967` / building, `clinic-annexe-0f56d1` / building, `cardboard-delivery-box-59cc68` / prop | Cold box/vaccine carrier tidak ada (pakai 2D); tanpa logo lembaga |
| c03 | Makro partikel aluminium menggumpal, potongan cold box | — | Animasi 2D/shader; cool pack tidak menempel vial |
| c04 | Label VVM: kotak dalam lingkaran, 4 tahap warna | — | 2D murni, paling jelas sebagai diagram |
| c05 | Dua vial dikocok, endapan turun, timer 10–15 dtk | `ward-nurse-84b61d` / character (clip Idle/Point), `hospital-nurse-base` / character | Fokus tangan bersarung, wajah tidak tampil; split-screen 2D untuk endapan |
| c06 | Freezer ultra-dingin, grafik data logger, alarm gudang | `brick-depot-warehouse-3dd642` / building, `medical-gas-cylinder-a2d6a7` / prop | Freezer ultra-dingin tidak ada; panel 2D. Tanpa merek vaksin |
| c07_payoff | Rute menyala dari pabrik ke pos pelayanan, outro AUDIRA | `delivery-truck-a9537e` / vehicle, `clinic-annexe-0f56d1` / building | Outro card `audira-outro-card.svg` |

Saran engine: 2D — objek inti (vial, VVM, cold box, partikel beku, termometer) tidak ada sebagai GLB dan paling terbaca sebagai diagram; CHAINREACTION (2D) cocok untuk rute rantai, diorama 3D hanya bila ingin rute truk/gudang sebagai selingan (hybrid).
