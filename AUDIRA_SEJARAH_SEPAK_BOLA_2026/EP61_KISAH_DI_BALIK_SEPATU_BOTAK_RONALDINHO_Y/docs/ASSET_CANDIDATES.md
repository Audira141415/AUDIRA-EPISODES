# Asset Candidates — Kisah di Balik Sepatu Botak Ronaldinho yang Mengubah Sepak Bola

> Dicari lewat `audira_search_assets` (2026-11-25). Katalog tidak punya model sepatu bola; sepatu perlu dibuat (Blender/prosedural) atau ilustrasi 2D.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Mistar + bola memantul, sepatu putih-emas | `match-goal-a98b60` (prop), `training-goal-50f1ca` (prop), `match-ball-0e675d` (prop) | Sepatu: tidak ada di katalog (hasil "shoe" hanya `card-dealing-shoe`); buat custom tanpa logo Nike |
| c01_intro | TV/monitor 2000-an, peta Brasil + pin Porto Alegre | belum dicari (TV); peta = HUD 2D | Counter "1.000.000 VIEWS" sebagai HUD |
| c02 | Gang Vila Nova, rumah dua lantai berkolam | `pool-deck-paver-tile-074d8f` (prop), `floor-houseplant-8fad17` (prop) | Rumah & kolam lebih baik dirakit dari kit neighborhood; adegan musibah = kolam tenang, tanpa tubuh |
| c03 | Anak kecil + bola di halaman, siluet ayah | `teen-player-37865e` (character, clip Idle/Run), `match-ball-0e675d` (prop) | Wajah tidak ditampilkan jelas; tidak ada model anak khusus |
| c04 | Lapangan futsal sempit, pantai, papan skor 23-0 | `dry-soft-sand-tile-4a1df7` (prop), `beach-flag-pole-2bf334` (prop), `beach-hut-fc7649` (building), `outfield-player-2b742a` (character, Run) | Papan skor = HUD |
| c05 | Garis waktu Echigo → Rivelino → 1970, rekaman VHS | belum dicari (VHS/TV) | Kartu nama tanpa wajah orang nyata |
| c06 | Diagram elastico tampak atas, bek tertipu | `outfield-player-2b742a` (character, 2 instance: penyerang + bek), `match-ball-0e675d` (prop) | Panah gerak kaki = HUD/diagram 2D |
| c07_payoff | Stadion malam, tribun bertepuk tangan, trofi, outro | `grandstand-seating-run-fc9023` (building), `stand-roof-run-cfd457` (building), `floodlight-mast-4482be` (prop), `outfield-player-2b742a` (character, Cheer) | Tanpa logo klub Real Madrid/Barcelona/FIFA; label teks saja |

Saran engine: hybrid — rule 13 mewajibkan Remotion + R3F untuk sepak bola (stadion, gawang, pemain dari kit stadium tersedia), sementara peta, garis waktu, diagram elastico, dan counter paling jelas sebagai lapisan HUD 2D.
