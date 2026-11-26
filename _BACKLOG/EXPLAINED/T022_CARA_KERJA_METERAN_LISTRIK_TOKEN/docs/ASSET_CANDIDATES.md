# Asset Candidates — Cara Kerja Meteran Listrik Token

> Dicari via `audira_search_assets` (2026-11-26). Katalog TIDAK punya meteran listrik prabayar dengan keypad, struk, chip/PCB, atau uang kertas. Yang ada: `meter-box-1e6e42` (kotak meter dinding, bisa jadi housing generik), smartphone, server rack, minimarket, rumah, globe, gembok. Meteran keypad + LCD paling aman dibuat 2D/procedural (generik, tanpa logo).

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Keypad meteran prabayar, LCD 20 angka, amplop bersegel | `meter-box-1e6e42` / prop | Keypad + LCD dibuat 2D/procedural; tanpa logo PLN/merek; tangan tanpa wajah |
| c01_intro | Kasir minimarket, uang → blok kWh | `convenience-store-c30e1d` / building, `service-counter-module-3072ff` / prop | Papan nama toko generik; HUD "Rp1.444,70/kWh · per triwulan III 2026" |
| c02 | Ruang server, batang data 66 bit, gembok | `small-server-rack-8ae0a4` / prop, `chest-padlock-7dc32e` / prop | Batang bit dan "kunci dari nomor meter" lebih jelas sebagai diagram 2D; nomor meter disamarkan |
| c03 | Struk dengan 20 angka, HP menerima pesan | `smartphone-5f05e5` / ultra | Struk 2D; notifikasi tanpa logo bank/aplikasi |
| c04 | Cutaway meteran: keypad, chip, memori kunci, LCD saldo | `meter-box-1e6e42` / prop | Chip/PCB tidak ada di katalog; cutaway 2D (CIRCUITFORGE) |
| c05 | Dua rumah bersebelahan, LCD REJECT | `townhouse-row-unit-b9544b` / building, `meter-box-1e6e42` / prop | Split-screen; teks "REJECT"/"sudah dipakai" di LCD generik |
| c06 | Peta Afrika 1993, globe 100 negara | `classroom-globe-16a96e` / prop | Globe titik-titik lebih bersih di 2D; tanpa logo STS Association |
| c07_payoff | Amplop masuk meteran, rumah menyala, outro | `townhouse-row-unit-b9544b` / building, `meter-box-1e6e42` / prop | Outro card `audira-outro-card.svg` |

Saran engine: 2D — inti cerita adalah alur data (uang → kWh → 66 bit → gembok → 20 angka → dekripsi) yang paling terbaca sebagai diagram dan cutaway 2D (CIRCUITFORGE/BONGKAR); katalog GLB tidak punya meteran keypad, chip, atau struk, sehingga 3D (INNERWORKS) butuh banyak model buatan sendiri.
