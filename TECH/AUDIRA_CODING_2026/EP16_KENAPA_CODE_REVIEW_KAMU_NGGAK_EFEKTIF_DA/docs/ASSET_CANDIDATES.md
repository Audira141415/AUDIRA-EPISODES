# Asset Candidates — Kenapa Code Review Kamu Nggak Efektif (dan Cara Memperbaikinya)

> Dicari via `audira_search_assets` (2026-11-25). Tanpa wajah orang nyata dan tanpa logo organisasi nyata (rule 15).

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Monitor berisi diff kode, kaca pembesar, ikon bug | `desk-monitor-32cfce` / prop | Diff kode + kaca pembesar + ikon bug dibuat 2D/SVG di layar monitor |
| c01_intro | Meja riset, tumpukan kartu komentar, counter 570 | `office-desk-021eb3` / prop, `paper-stack-713359` / prop | Name plate teks "Microsoft", tanpa logo |
| c02 | Kartu tersortir ke wadah berlabel, callout 14% | `wastepaper-bin-8f76b5` / prop (wadah) | Wadah bisa diganti kotak label 2D; HUD 14% |
| c03 | Diagram donat 15% vs ≥50% | — (2D chart) | Infografis, tidak butuh GLB |
| c04 | Tumpukan file diff meninggi, meter turun, jam | `paper-stack-713359` / prop, `wall-clock-0c555c` / prop | HUD 200–400 baris, 60 menit |
| c05 | Reviewer tanpa wajah, peta kode berkabut | `seated-office-worker-854671` / character (anim), `computer-bench-run-lit-87d9cf` / prop | Karakter low-poly stylized, bukan orang nyata; bar 33%→67% |
| c06 | Conveyor balok perubahan kecil, stopwatch | `bench-desk-module-23c16f` / prop | Conveyor + balok dibuat 2D/primitif berlabel; name plate teks "Google", tanpa logo |
| c07_payoff | Checklist 3 langkah, outro card | `standing-worker-on-a-8a0f9a` / character (clip Cheer) | Outro `audira-outro-card.svg` |

Saran engine: 2D — isi didominasi data (persen, ukuran baris, waktu) dan UI kode; diagram/HUD 2D lebih terbaca dan cepat dirender, GLB kantor opsional bila dipilih hybrid.
