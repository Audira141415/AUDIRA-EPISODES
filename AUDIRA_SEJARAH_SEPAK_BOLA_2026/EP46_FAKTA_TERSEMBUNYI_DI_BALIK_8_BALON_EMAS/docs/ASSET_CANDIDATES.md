# Kandidat Aset — Fakta Tersembunyi di Balik 8 Balon Emas Messi

Pencarian `audira_search_assets` (topic: sepak bola/stadion/trofi/anak) 2026-11-25 hanya mengembalikan aset tidak relevan (Bolas, tile pantai, tembok). Kebutuhan visual dicatat; pencarian lanjutan (stadium, trophy, soccer ball, character-anim) dilakukan di tahap 7.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Siluet anak kecil di samping bayangan teman lebih tinggi | character/AssetCharacter generik, belum dicari | Tanpa wajah nyata |
| c01_intro | Peta Argentina-Rosario, lapangan generik, bola | prop bola: belum dicari (`bolas-0c9b40` BUKAN bola sepak) | Tanpa logo Newell's |
| c02 | Infografis terapi umur 11-14; serbet kertas di meja kafe | prop meja/kertas: belum dicari | Tanpa logo Barcelona |
| c03 | Rak 8 trofi emas generik berjajar | prop trofi: belum dicari | Bukan replika desain resmi Ballon d'Or bila berlogo |
| c04 | Stadion malam, trofi Piala Dunia generik, adu penalti | building stadion: belum dicari | Tanpa logo FIFA |
| c05 | Panggung Paris, tiga bar poin 462/357/270 | HUD 2D | Tanpa wajah Haaland/Mbappé, name plate saja |
| c06 | Bar chart 8 vs 5 vs 3, tiga penanda klub generik | HUD 2D | Warna netral, tanpa logo klub |
| c07_payoff | Siluet anak berjalan ke rak trofi; kartu outro | `shared/assets/brand/audira-outro-card.svg` | |

Saran engine: hybrid — Remotion+R3F (rule 13) untuk adegan siluet/stadion/rak trofi, HUD 2D untuk angka dan bar chart; tanpa wajah pemain nyata, tanpa logo klub/federasi.
