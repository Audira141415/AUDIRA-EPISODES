# Asset Candidates — Kenapa Apple Tidak Bisa Mengalahkan Google di AI

> Dicari lewat `audira_search_assets` (2026-11-25). Semua aset generik, tanpa logo perusahaan. Merek cukup lewat warna dan teks HUD.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Ponsel generik menyala, chip "otak" | `smartphone-5f05e5` / ultra | Hanya 102 tri: perlu layar emissive + bevel (`<RoundedBoxGeo>`) agar terlihat premium. Chip "otak" dibuat sebagai kartu HUD, bukan mesh polos. |
| c01_intro | Dua menara kantor + jembatan data | `monolith-office-tower-422420` / building | Dua salinan, material beda warna (putih vs empat warna). Jembatan data = garis cahaya HUD sebagai pendukung, bukan visual utama. |
| c02 | Panggung presentasi kosong, kalender, uang | `hall-stage-deck-1f5a11` / building, `lecturer-s-podium-e77fe6` / prop, `gold-coin-stack-a9ef52` / prop | Tanpa tokoh nyata. Kalender robek + stempel "DITUNDA" = kartu 2D. |
| c03 | Makalah riset, rak server berisi chip | `lefthand-item-30f012` / ultra (buku), `small-server-rack-8ae0a4` / prop, `computer-bench-run-lit-87d9cf` / prop | Makalah melayang bisa plane bertekstur teks "TRANSFORMER · 2017". |
| c04 | Dua tumpukan modal: menjulang vs pendek | `small-server-rack-8ae0a4` / prop (ditumpuk/instanced), `gold-coin-stack-a9ef52` / prop | Skala harus jujur: ±205 vs ±9 (rasio ±22x). HUD angka wajib. |
| c05 | Bola dunia dengan titik pengguna, iPhone bergembok | `classroom-globe-16a96e` / prop, `chest-padlock-7dc32e` / prop, `smartphone-5f05e5` / ultra | Titik pengguna = callout HUD counter "1 MILIAR". |
| c06 | Diagram iPhone ↔ cloud | `smartphone-5f05e5` / ultra, `small-server-rack-8ae0a4` / prop | Awan = kartu HUD; panah data terenkripsi = motion graphic 2D. |
| c07_payoff | Dua kepingan puzzle menyatu jadi ponsel, outro | `smartphone-5f05e5` / ultra | Puzzle tidak ada di katalog: buat kartu 2D atau `<RoundedBoxGeo>` terpotong. Outro card AUDIRA. |

Saran engine: 2D — topik bisnis/strategi yang digerakkan angka, tanggal, dan perbandingan; katalog GLB lemah untuk ponsel premium dan chip AI, jadi 2D infografis (BROADCASTFORGE/CERDIK) lebih tajam dan bebas logo, dengan opsi hybrid bila ingin satu adegan 3D (tumpukan modal c04).
