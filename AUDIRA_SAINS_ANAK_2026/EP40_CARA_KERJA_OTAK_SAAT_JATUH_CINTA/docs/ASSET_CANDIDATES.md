# Asset Candidates — Cara Kerja Otak Saat Jatuh Cinta

Dicari via `audira_search_assets` (2026-11-25). Katalog tidak punya model otak/jantung anatomis: query "brain" hanya memberi karang otak, "heart" tidak relevan. Organ perlu dibuat prosedural (mesh anatomi stilisasi ANATOMIX) atau GLB eksternal berlisensi.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Otak transparan + jantung berdenyut, titik VTA menyala | — | Belum ada di katalog; buat mesh otak stilisasi + emissive |
| c01_intro | Ruang lab, scanner berputar, layar foto siluet | `ct-scanner-gantry-2032b8` (prop), `research-microscope-77ce04` (prop) | CT gantry dipakai sebagai stand-in scanner fMRI; foto tanpa wajah nyata |
| c02 | Interior otak, VTA + kaudatus menyala, partikel dopamin; inset koin/makanan | — | Molekul dopamin = mesh bola-tongkat sederhana (bukan Points abstrak) |
| c03 | Peta Italia (Pisa), sinaps, grafik batang 3 kolom | — | Peta 2D/extruded + chart HUD |
| c04 | Smartphone pesan putus, retak; otak berubah warna | `smartphone-5f05e5` (ultra) | Teks pesan di layar ponsel |
| c05 | Amigdala meredup, ikon alarm | — | Bagian dari mesh otak c00 |
| c06 | Diorama padang rumput, dua vole; teras dua kursi tua | — | Tidak ada model tikus/vole (query "mouse rodent" hanya desk mouse); karakter manusia via `<AssetCharacter>` dari katalog character-anim |
| c07_payoff | Area otak menyatu jadi jantung cahaya, outro AUDIRA | — | Pakai mesh otak + outro card |

Saran engine: 3D — subjek utama organ dan sinaps butuh kedalaman (ANATOMIX), tetapi otak/vole harus dibuat sendiri karena katalog GLB tidak menyediakannya; alternatif CERDIK 2D bila waktu produksi terbatas.
