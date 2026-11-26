# Asset Candidates — Kenapa Rupiah Bisa Melemah Terhadap Dolar

> Dicari via `audira_search_assets` (2026-11-26). Rule 15: tanpa wajah orang nyata dan tanpa logo bank/lembaga nyata; gedung bank harus generik.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Papan/layar kurs besar dengan angka Rp18.390 | `flat-screen-television-97b1f3` / prop; `desk-monitor-32cfce` / prop | Angka dan chip HUD dibuat sebagai teks 2D di atas layar. Tangan tanpa wajah: ilustrasi 2D. |
| c01_intro | Kalender 1997, jarum kurs lepas dari rantai, lapak harga cabai | belum ada GLB yang cocok | Paling mudah sebagai ilustrasi 2D (kalender, rantai, papan harga). |
| c02 | Jaringan bank generik saling lempar koin, layar pusat JISDOR | `red-brick-bank-bb28b3` / prop; `gold-coin-29afc1` / prop; `silver-coin-64ab27` / prop; `gold-coin-stack-a9ef52` / prop | Ganti warna gedung agar tidak mirip bank nyata. Koin = simbol dolar/rupiah via decal teks. |
| c03 | Timbangan permintaan vs penawaran dolar, drum minyak, tumpukan utang, koper | `gold-balance-scale-66497b` / prop; `oil-drum-386c30` / prop; `coin-pouch-be4dd8` / ultra; `cargo-crate-9afc44` / prop | Timbangan adalah metafora inti; dipakai lagi di c07. |
| c04 | Bola dunia + panah aliran modal ke luar negeri, grafik imbal hasil | belum ada GLB bola dunia dicari | Peta/globe 2D vektor lebih bersih. Kapal kargo laut tidak tersedia (`cargo-freighter-d89fdc` adalah pesawat luar angkasa, jangan dipakai). |
| c05 | Grafik garis kurs 1997–2026 dengan dua lonjakan | — (chart 2D) | Data: ±Rp16.800 Juni 1998, Rp18.000 Juni 2026, Rp18.390 per 26 Nov 2026. |
| c06 | Ruang kendali/terminal dengan tiga tuas Spot/DNDF/NDF, chip BI-Rate 6,00% | `desk-monitor-32cfce` / prop; `office-desk-021eb3` / prop | Gaya terminal trading; tanpa logo BI, cukup teks "Bank Indonesia". |
| c07_payoff | Timbangan kembali seimbang, titik-titik transaksi membentuk angka, outro AUDIRA | `gold-balance-scale-66497b` / prop; `spilled-coin-pile-caccf6` / prop | Outro card `audira-outro-card.svg`. |

Saran engine: 2D — topik inti adalah grafik kurs, timbangan permintaan-penawaran, dan callout angka; style kandidat TRADINGTERMINAL/DATAPHYSICAL paling kuat sebagai 2D, dan katalog GLB tidak punya globe atau kapal kargo laut. Hybrid (timbangan + koin GLB di c03/c07) opsional.
