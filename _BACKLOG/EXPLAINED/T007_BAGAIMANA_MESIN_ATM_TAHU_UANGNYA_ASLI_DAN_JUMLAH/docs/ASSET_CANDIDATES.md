# Asset Candidates — Bagaimana Mesin ATM Tahu Uangnya Asli dan Jumlahnya Pas

> Dicari via `audira_search_assets` (2026-11-26). Katalog tidak punya ATM, kaset uang, atau mesin sortir industri; ATM dan mekanisme dalamnya perlu dibangun (cutaway 2D atau model rakitan). Uang kertas harus generik, bukan replika rupiah (rule 15), tanpa logo bank/BI.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | ATM generik, lembar uang keluar slot | `banded-cash-bundle-7da278` / prop | Tidak ada GLB ATM; badan ATM dibuat 2D/rakitan tanpa logo |
| c01_intro | Layar ATM + tumpukan uang, split dua tahap | `banded-cash-bundle-7da278` / prop | Split-screen lebih mudah di 2D |
| c02 | Ruang hitung, mesin sortir/hitung uang | `cash-counting-machine-1f6eca` / prop, `classical-bank-04954e` / building | Mesin hitung meja (kit kasino) sebagai stand-in; ganti tekstur netral, tanpa dekor kasino |
| c03 | Lembar uang melewati sensor UV, kamera, magnet | — | Diagram sensor lebih jelas di 2D (cahaya ungu, grid pindai, gelombang sinyal) |
| c04 | Cutaway ATM: kaset, brankas, roda karet, sensor tebal, kotak tolak | `iron-vault-safe-8b8f29` / prop | Brankas sebagai shell; mekanisme roda + sensor digambar 2D/diagram |
| c05 | Slot setor tunai, tangan tanpa wajah | — | 2D; tanpa logo bank |
| c06 | Kartu teks "Penentu keaslian: Bank Indonesia", peta dunia | — | Teks saja, tanpa logo BI; peta 2D |
| c07_payoff | Lembar uang bersinar + ikon 3D (dilihat/diraba/diterawang), outro AUDIRA | `banded-cash-bundle-7da278` / prop | Ikon dari `core/icons` |

Saran engine: 2D — inti topik adalah mekanisme sensor dan diagram aliran lembar (UV, pola, ketebalan, kotak tolak) yang paling terbaca sebagai cutaway/diagram 2D (BONGKAR/PRECISION); katalog GLB tidak punya ATM, kaset, atau mesin sortir, jadi 3D (INNERWORKS) butuh model rakitan dan berisiko terlihat kosong.
