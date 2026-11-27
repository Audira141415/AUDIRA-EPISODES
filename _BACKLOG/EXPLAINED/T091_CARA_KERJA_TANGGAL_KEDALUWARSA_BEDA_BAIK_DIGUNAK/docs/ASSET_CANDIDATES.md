# Asset Candidates — Cara Kerja Tanggal Kedaluwarsa: Beda "Baik Digunakan" dan "Kedaluwarsa"

> Dicari via `audira_search_assets` (2026-11-27). Katalog GLB tidak punya kemasan makanan, strip obat, label tanggal, karton susu, atau mi instan. Aset pendukung (botol, rak, tong sampah) tersedia tapi bukan visual utama. Topik ini jauh lebih cocok 2D.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Dua kemasan berdampingan: kotak susu + strip obat, label tanggal sorot | — | Tidak ada GLB kemasan makanan/obat; ilustrasi 2D. Teks "KUALITAS?" vs "KEAMANAN?" animasi tipografi |
| c01_intro | Kemasan mi instan generik, strip obat, centang/silang animasi | — | Tidak ada GLB mi instan atau strip obat; 2D flat illustration + ikon centang/silang |
| c02 | Peta dunia, ikon "BEST BEFORE" dan "USE BY", referensi Codex | — | Peta 2D + tipografi kinetik; ikon jam pasir + perisai. Tanpa logo resmi FAO/WHO (rule 15) |
| c03 | Kemasan pangan generik close-up, label "Baik digunakan sebelum", flip kaleng | `bottle-ca0f79` / ultra (simbolis), `cardboard-delivery-box-59cc68` / prop | Kemasan detail lebih terbaca di 2D; GLB hanya pendukung jika pakai hybrid |
| c04 | Split screen mi instan vs susu segar, jam berputar | `milk-steaming-pitcher-4757b5` / prop, `glass-door-drinks-fridge-21f077` / prop | Mi instan tidak ada di katalog; split screen 2D lebih jelas |
| c05 | Keranjang belanja, makanan masuk tong sampah, counter "20%" | `metal-trash-can-f57043` / prop, `wastepaper-bin-8f76b5` / prop | Keranjang belanja dan ilustrasi orang bingung (tanpa wajah) = 2D |
| c06 + outro | Checklist animasi, meja makan, kemasan bersinar, outro AUDIRA | — | Checklist dan tipografi kinetik murni 2D; outro card `audira-outro-card.svg` |

Saran engine: **2D** — BONGKAR (2D) atau CERDIK (2D). Topik ini tentang label dan teks pada kemasan; visual utama = tipografi, diagram perbandingan, ilustrasi kemasan close-up. Tidak ada kedalaman spasial yang membutuhkan 3D. Katalog GLB tidak punya aset kemasan makanan/obat yang relevan. 2D memberi kontrol penuh atas detail label dan teks kinetik.
