# Asset Candidates — Cara Kerja DNS: Dari Domain ke IP dalam 60 Detik

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Laptop/monitor, tombol Enter, bilah alamat | computer-bench-run-lit-87d9cf / prop | Bilah alamat dan tanda tanya DNS dibuat sebagai HUD 2D |
| c01_intro | Buku telepon raksasa, domain → angka IP | lefthand-item-30f012 / ultra (Hardback Book), bookshelf-5e881a / ultra | Teks domain dan IP kinetik 2D |
| c02 | Ponsel pengirim, laci cache, gedung resolver | smartphone-5f05e5 / ultra, small-server-rack-8ae0a4 / prop | Gedung resolver tanpa logo ISP (rule 15) |
| c03 | Peta dunia, 13 pilar A–M, titik anycast | globe-lamp-346cb6 / prop (opsional) | Peta dan titik anycast lebih baik 2D/data viz; jangan pakai logo operator root |
| c04 | Tiga pintu .id/.com/.org, dinding label TLD | small-server-rack-8ae0a4 / prop | Label TLD = teks HUD; angka 1.435 sebagai callout |
| c05 | Rak server otoritatif, kartu IP meluncur balik | small-server-rack-8ae0a4 / prop | Jalur paket = garis animasi bermakna (bukan partikel acak) |
| c06 | Laci cache, jam pasir TTL, stopwatch 14 ms | belum dicari (hourglass/stopwatch) | Bisa prosedural 2D |
| c07_payoff | Gulungan HOSTS.TXT, bola dunia menyala, name plate Mockapetris, outro AUDIRA | globe-lamp-346cb6 / prop | Name plate teks saja, tanpa wajah (rule 15) |

Saran engine: hybrid — alur paket dan peta anycast paling jelas sebagai diagram 2D (CIRCUITFORGE/DATAPHYSICAL), dengan rak server, ponsel, dan laptop GLB sebagai jangkar fisik 3D di c00, c02, c05.
