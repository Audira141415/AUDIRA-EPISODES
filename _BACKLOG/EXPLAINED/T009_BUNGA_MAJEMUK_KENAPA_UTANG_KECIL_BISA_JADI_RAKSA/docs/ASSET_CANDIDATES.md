# Asset Candidates — Bunga Majemuk: Kenapa Utang Kecil Bisa Jadi Raksasa

> Dicari 2026-11-26 lewat `audira_search_assets`. Rule 15: tanpa logo OJK/bank/aplikasi, tanpa wajah orang nyata, uang generik (bukan replika rupiah).

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Tumpukan uang membengkak, counter hari 1→365 | `gold-coin-stack-a9ef52` / prop, `coin-hoard-heap-07b6e4` / prop | Koin bergaya fantasi: retexture netral; uang kertas generik dibuat 2D |
| c01_intro | Dua jalur balok: sederhana vs majemuk | `silver-coin-64ab27` / prop, `copper-coin-b4ebbb` / prop | Balok/batang lebih jelas sebagai diagram 2D; koin opsional sebagai unit |
| c02 | Tangga batang 10 tahun dengan counter | `gold-coin-stack-a9ef52` / prop | Tinggi tumpukan = nilai (11 → 12,1 → 25,9 jt); bisa sepenuhnya 2D |
| c03 | Kalender harian + dua grafik (garis vs kurva) | `wall-clock-05f8ff` / prop, `wall-clock-0c555c` / prop | Kalender sobek dan grafik dibuat 2D (tidak ada GLB kalender) |
| c04 | Kalkulator "72 ÷ 0,3", tumpukan membelah dua | `spilled-coin-pile-caccf6` / prop, `gold-coin-stack-a9ef52` / prop | Kartu kalkulator 2D kinetik |
| c05 | Kurva menabrak palang "BATAS 100%", ikon app generik "ILEGAL" | `checkpoint-barrier-pole-59c197` / prop, `access-control-speedgate-19705e` / prop | Name plate teks "OJK · SEOJK 19/2025", tanpa logo |
| c06 | Rumus M = M₀ × (1 + p)ⁿ + kurva eksponensial | — | Tipografi kinetik + grafik 2D, tidak butuh GLB |
| c07_payoff | Kurva dibalik jadi tabungan tumbuh, siluet tangan, outro AUDIRA | `treasure-chest-58da92` / ultra, `coin-pouch-be4dd8` / ultra | Celengan tidak ada di katalog; peti/kantong koin sebagai pengganti, atau ikon 2D |

Saran engine: 2D — inti topik adalah rumus, grafik garis vs kurva, dan callout angka (DATAPHYSICAL/CHAINREACTION 2D paling tajam); katalog GLB hanya punya koin bergaya fantasi dan palang, jadi 3D cukup opsional untuk tumpukan koin di c00/c05.
