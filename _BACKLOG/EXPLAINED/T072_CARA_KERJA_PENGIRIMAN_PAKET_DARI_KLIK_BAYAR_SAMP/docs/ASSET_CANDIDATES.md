# Asset Candidates — Cara Kerja Pengiriman Paket: Dari Klik Bayar sampai Depan Pintu

> Dicari via `audira_search_assets` (2026-11-27). Katalog punya kardus, truk/van, moped pengantar, gudang, smartphone, pintu, dan karakter ber-rig. Tidak ada mesin sortir sabuk silang, label resi, atau layar pelacakan: itu dibuat 2D/procedural. Semua tanpa logo kurir/marketplace (rule 15).

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Ponsel dengan tombol "Bayar" fiktif, kardus berlabel, rute ke gudang | `smartphone-5f05e5` / ultra, `cardboard-delivery-box-59cc68` / prop | UI ponsel 2D generik; chip "Ilustrasi alur umum" |
| c01_intro | Label resi close-up (QR, barcode, nomor fiktif 13 karakter), daftar status pelacakan | `cardboard-delivery-box-59cc68` / prop | Label dan layar status dibuat 2D; data fiktif, bukan resi asli |
| c02 | Penjual serahkan paket, kurir bermotor, timbangan, gudang kecil | `delivery-moped-1aa2ce` / vehicle, `boxy-delivery-van-a3ceae` / vehicle, `brick-depot-warehouse-3dd642` / building | Kurir dan penjual tanpa wajah (helm tertutup/siluet) |
| c03 | Mesin sortir sabuk silang: nampan, gerbang pemindai, lubang tujuan, karung | `cardboard-delivery-box-59cc68` / prop | Mesin sortir tidak ada di katalog: rakit procedural (konveyor loop + nampan) atau cutaway 2D |
| c04 | Truk antarkota, peta rute generik, ikon kapal/pesawat, inset jalur pintas | `delivery-truck-a9537e` / vehicle, `hauler-cargo-trailer-3a0262` / vehicle, `dock-cargo-barge-69dc4b` / vehicle | Peta 2D tanpa batas politis sensitif; kapal/pesawat = ilustrasi |
| c05 | Gudang akhir, rak per rute, kurir memindai, kartu kalender 3 / 7 hari | `brick-depot-warehouse-3dd642` / building, `delivery-moped-1aa2ce` / vehicle | HUD "maks 3 hari" / "maks 7 hari" (Permenkomdigi 8/2025) |
| c06 | Koin ongkir pecah jadi ikon, kalender 3 hari, kardus penyok + "10×" | `cardboard-delivery-box-59cc68` / prop | Ikon lucide (users, truck, cpu, calendar, package-x); grafis 2D |
| c07_payoff | Pintu rumah, kardus di depan pintu, peta jaringan titik paket, outro | `door-set-single-04e5f0` / building, `cardboard-delivery-box-59cc68` / prop | Counter "hingga 7 juta paket/hari (klaim Wamenkomdigi, Feb 2026)"; outro `audira-outro-card.svg` |

Saran engine: 2D — inti cerita (label resi, status pelacakan, mesin sortir, peta jaringan, kalender batas waktu) lebih terbaca sebagai diagram 2D (CHAINREACTION/SATELLITEBRIEFING); 3D URBANFORGE layak sebagai hybrid untuk adegan truk/gudang/pintu, tetapi mesin sortir harus dirakit procedural karena tidak ada GLB-nya.
