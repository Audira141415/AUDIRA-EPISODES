# Research Report — Kenapa Grafik di Berita Bisa Menyesatkan

> Riset backlog 2026-11-27. Channel @AudiraExplained (rule 15: netral, tanpa wajah/logo nyata).

## Sumber utama

- **Wikipedia "Misleading graph"** (2026-11-27): katalog lengkap teknik distorsi grafik, rumus Lie Factor (Tufte), Graph Discrepancy Index (Steinbart 1998), dan catatan bahwa studi empiris membuktikan truncated axis tetap menyesatkan walau diberi label (#1, #5, #7, #8).
- **Huff, "How to Lie with Statistics"** (1954): buku pelopor literasi statistik populer; >1,5 juta kopi terjual; membahas truncated axis, pictogram tidak proporsional, korelasi vs kausalitas (#2).
- **Cairo, "How Charts Lie"** (2019, W. W. Norton, 256 hlm): buku modern yang membedakan desain buruk vs kebohongan sengaja; membedakan kapan truncation tepat (line chart keuangan) vs menyesatkan (bar chart) (#3, #7).
- **Pandey et al. 2015 (CHI)**: studi empiris 5 teknik distorsi; truncated axis = teknik paling efektif mengubah persepsi; 199 sitasi (#4).
- **Tufte, "The Visual Display of Quantitative Information"** (1983/2001): memperkenalkan Lie Factor, data-ink ratio, chartjunk (#6).

## Fakta terverifikasi

1. Grafik menyesatkan (misleading graph) = grafik yang salah merepresentasikan data sehingga pembaca menarik kesimpulan keliru (#1).
2. Teknik utama: (a) sumbu terpotong, (b) skala tanpa nol, (c) rasio dimensi dimanipulasi, (d) pictogram tidak proporsional, (e) pie chart 3D, (f) cherry-picking rentang waktu, (g) label bias, (h) data dihilangkan (#1).
3. Huff (1954) = salah satu penulis pertama tentang grafik menyesatkan; buku menjadi standar universitas AS sejak 1960-an (#2).
4. Pandey et al. (2015) menemukan: truncated axis = teknik distorsi paling efektif mengubah persepsi pembaca. Bahkan ketika subjek diberitahu bahwa sumbu terpotong, mereka tetap melebih-lebihkan perbedaan (#4, #1).
5. Lie Factor (Tufte 1983): rasio efek visual terhadap efek data sebenarnya. Lie Factor = 1 → akurat; > 1 → melebih-lebihkan; < 1 → menyembunyikan (#5, #6).
6. Truncated axis tidak selalu salah: pada line chart data keuangan (harga saham, suku bunga), variasi kecil bermakna besar, dan memulai dari nol justru menyembunyikan informasi. Yang selalu harus dimulai dari nol: bar chart, karena panjang batang adalah encoding utama (#7, #3).
7. Grafik distorsif lazim ditemukan di laporan tahunan perusahaan sebagai bentuk impression management; GDI (Steinbart 1998) mengukur distorsi ini (#8).
8. Data journalist John Burn-Murdoch: orang lebih mudah skeptis terhadap teks daripada grafik; literasi visual jauh lebih jarang diajarkan daripada literasi teks (#1).

## Perselisihan / Kontroversi

- **Koreksi hook TOPIC.md**: Hook "Sumbu yang dipotong bisa membuat kenaikan 2% terlihat seperti lonjakan besar" secara faktual benar dan contohnya bagus. Namun hook ini memberi kesan truncation selalu menyesatkan. Perlu nuansa: pada bar chart, truncation hampir selalu menyesatkan; pada line chart keuangan, truncation kadang tepat dan diperlukan (Cairo 2019). Naskah sudah menyertakan nuansa ini di bab c04 (fakta #6). Hook sendiri tidak perlu diubah karena contoh "2%" memang akurat untuk bar chart.
- **Netralitas**: Brief menekankan "alat literasi data, bukan serangan ke media tertentu." Naskah tidak menyebutkan media, partai, atau organisasi Indonesia tertentu. Contoh menggunakan angka ilustrasi berlabel "ILUSTRASI".
- **Angka "2%" di hook**: Ini angka ilustrasi, bukan data nyata. Sudah ditandai dengan label "ILUSTRASI" di naskah. Ini sesuai dengan instruksi SUSPECTS.
- **Pandey et al. 2015**: Abstrak tidak berhasil diakses langsung (halaman ACM memerlukan akses), tetapi judul, penulis, tahun, venue, DOI, dan jumlah sitasi (199) terverifikasi via CrossRef dan Semantic Scholar. Temuan utama (truncated axis = most effective deception technique) dikonfirmasi oleh Wikipedia yang mengutip studi serupa (#1 ref [19]).

## Angka kunci untuk HUD

| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| 2% (ILUSTRASI) | Contoh kenaikan kecil yang terlihat besar dengan truncated axis | ilustrasi |
| 1954 | Tahun terbit "How to Lie with Statistics" (Huff) | 2 |
| >1,5 juta kopi | Penjualan buku Huff edisi Inggris | 2 |
| Lie Factor = 1 | Grafik akurat menurut Tufte (1983) | 5, 6 |
| 5 teknik distorsi | Yang diuji Pandey et al. 2015 (CHI) | 4 |
| 2019 | Tahun terbit "How Charts Lie" (Cairo) | 3 |

## Poin kunci

- Cerita = orang mudah tertipu grafik karena literasi visual jarang diajarkan → 5 teknik distorsi umum → cara mengenali (checklist sederhana).
- Payoff: viewer bisa langsung cek grafik berikutnya yang mereka lihat dengan 3 pertanyaan (mulai dari mana sumbu-nya? berapa rentang waktunya? apa yang dihilangkan?).
- Topik awet (evergreen): teknik distorsi grafik tidak berubah. Tidak ada angka yang cepat basi.
- Netral: ini alat literasi data, bukan serangan ke media/pihak mana pun. Semua contoh pakai angka ilustrasi.
- Nuansa penting: truncated axis pada line chart keuangan kadang tepat — VO wajib menyebut ini agar tidak oversimplifikasi.
