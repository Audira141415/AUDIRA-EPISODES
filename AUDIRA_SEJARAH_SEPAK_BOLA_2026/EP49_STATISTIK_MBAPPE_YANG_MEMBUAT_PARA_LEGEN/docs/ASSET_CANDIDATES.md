# Kandidat Aset — Statistik Mbappe yang Membuat Para Legenda Terdiam

Pencarian katalog GLB 2026-11-25 (`audira_search_assets`, hasil dicek dari draf sebelumnya): aset sepak bola nyaris tidak ada ("soccer" = 0); hanya `bolas-0c9b40` (prop) yang mungkin bola. Selebihnya "belum dicari" ulang di tahap 7. Tanpa wajah atlet, tanpa logo (rule 13).

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Angka 22 besar, papan gol, siluet striker | `<AssetCharacter>` clip Run (id dicari tahap 7) | siluet, tanpa wajah |
| c01_intro | Siluet nomor 10 di lapangan, callout usia 27 | `<AssetCharacter>` Idle + lapangan prosedural | HUD "per Nov 2026" |
| c02 | Lorong stadion bergaya poster, remaja menendang bola | `bolas-0c9b40` (prop) | warna generik, tanpa logo klub |
| c03 | Gawang, trofi generik, HUD 4 gol final dan Sepatu Emas x2 | `bolas-0c9b40`; trofi/gawang belum dicari | bukan replika trofi FIFA persis |
| c04 | Grafik batang: Mbappé melewati Messi, kartu 67 gol | batang prosedural + HUD | teks nama, bukan wajah |
| c05 | Stadion putih dari udara, kartu 100 gol/116 laga, 59 gol | stadion belum ada; prosedural | tanpa logo Real Madrid |
| c06 | Peta Eropa garis, tiga pin klub, 71 dan 256 gol | peta vektor prosedural | pin label teks |
| c07_payoff | Kartu angka mengelilingi siluet, outro | `shared/assets/brand/audira-outro-card.svg` | rule 13 |

Saran engine: hybrid — Remotion+R3F (rule 13) untuk adegan lari dan stadion; mayoritas visual infografis data (gaya DATAPHYSICAL), karena aset GLB sepak bola minim.
