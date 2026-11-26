# Asset Candidates — Cara Kerja Barcode di Kemasan Belanja

> Dicari via `audira_search_assets` (2026-11-26). Katalog tidak punya pemindai barcode kasir, mesin kasir, rak supermarket, troli belanja, atau kemasan produk. Yang ada: meja konter, kardus, monitor, laptop, rak server. Inti cerita (barcode, digit, modul, berkas laser, hitungan) memang grafis datar, jadi 2D.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Kemasan polos, barcode fiktif membesar jadi 13 angka, label harga dicoret | `cardboard-delivery-box-59cc68` / prop | Kemasan dan barcode 2D; tanpa merek nyata |
| c01_intro | Lembar paten cetak biru (garis + bull's-eye), Morse jadi garis, HUD 1952/1974 | — | Ilustrasi 2D; jangan pakai foto/wajah penemu (rule 15) |
| c02 | 13 digit terbelah 3 blok, ikon bola dunia GS1 | — | Infografis 2D; tanpa logo GS1 |
| c03 | Prefiks 899 menyala, peta dunia generik, pabrik siluet kirim kotak "899" | `cardboard-delivery-box-59cc68` / prop | Peta 2D generik; callout "Prefiks ≠ negara asal" |
| c04 | Digit jadi 7 modul; cutaway pemindai laser vs kamera; grafik pantulan | `survey-scanner-e63ec7` / ultra (simbolis saja) | Pemindai kasir tidak ada di katalog; gambar 2D lebih jelas |
| c05 | Angka lewat kabel ke komputer kasir, tabel database "nama · harga" | `desk-monitor-32cfce` / prop, `laptop-e775ba` / prop, `small-server-rack-8ae0a4` / prop, `service-counter-module-3072ff` / prop | Tabel database 2D; tanpa nama toko |
| c06 | Papan hitung "CONTOH FIKTIF" ×1 ×3, jumlah 97, digit cek 3, lampu merah salah baca | — | Tipografi kinetik 2D; nomor 2001234567893 (prefiks 200 sirkulasi terbatas) |
| c07_payoff | Meja kasir generik, bip, centang hijau, ikon rangkuman, outro AUDIRA | `service-counter-module-3072ff` / prop, `desk-monitor-32cfce` / prop | Outro card `audira-outro-card.svg` |

Saran engine: 2D — barcode, modul, berkas cahaya, database, dan hitungan digit cek adalah grafis datar yang paling terbaca di 2D (BONGKAR/PRECISION), dan katalog GLB tidak punya pemindai kasir, kemasan, atau rak belanja.
