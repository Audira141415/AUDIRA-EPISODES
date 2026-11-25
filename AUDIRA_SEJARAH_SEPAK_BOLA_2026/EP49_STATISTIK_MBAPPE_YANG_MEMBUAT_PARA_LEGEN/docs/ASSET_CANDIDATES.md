# Kandidat Aset — Statistik Mbappe yang Membuat Para Legenda Terdiam

Dicari 2026-11-25 lewat `audira_search_assets`: katalog nyaris tanpa aset sepak bola ("soccer" = 0 hasil; topik stadion/gawang/trofi hanya `bolas-0c9b40`).

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Angka 22 + siluet pemain berlari | `<AssetCharacter>` clip Run (id character dicari di tahap 7) | tanpa wajah nyata |
| c01_intro | Papan peringkat balok 3D | balok prosedural + HUD | angka 16/21/22 |
| c02 | Stadion, gawang, trofi generik | belum ada stadion; `bolas-0c9b40` (prop) | cek apakah bola sepak; tanpa logo |
| c03 | Gawang, bola menembus jaring | `bolas-0c9b40` (prop) | tanpa logo FIFA/klub |
| c04 | Sepatu emas di podium | belum dicari | bentuk generik |
| c05 | Tiga jalur lari paralel | `<AssetCharacter>` Run | panjang jalur = jumlah laga |
| c06 | Empat tumpukan bola | `bolas-0c9b40` | label teks, bukan logo klub |
| c07_payoff | Siluet di puncak bar, outro | `shared/assets/brand/audira-outro-card.svg` | rule 13 + 15 |

Saran engine: hybrid — Remotion+R3F (rule 13) untuk adegan lari dan stadion; mayoritas visual infografis data (gaya DATAPHYSICAL), karena aset GLB sepak bola minim.
