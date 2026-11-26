# Kandidat Aset — Cara Debug Memory Leak di Node.js Aplikasi

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Server/rak yang kewalahan, grafik memori menanjak | small-server-rack-8ae0a4 / prop | Grafik 2D HUD dibuat kode |
| c01_intro | Tempat sampah GC, objek tertahan tali | metal-trash-can-f57043 / prop; wire-trash-basket-269c1c / prop | Objek "cache" bisa kotak biasa sebagai props kecil, bukan visual utama |
| c02 | Log trace-gc, young ke old space | belum ada GLB; terminal/HUD kode | Callout 102 MB → 117 MB |
| c03 | Tiga meteran memori | belum ada GLB; HUD | |
| c04 | Kamera memotret memori, jam, peringatan | computer-bench-run-lit-87d9cf / prop | Ikon sinyal SIGUSR2 via HUD |
| c05 | Dua snapshot berdampingan, rantai retainers | belum ada GLB; diagram node-link 2D | |
| c06 | Server dekat batas heap, WeakMap | small-server-rack-8ae0a4 / prop | |
| c07_payoff | Grafik gigi gergaji stabil, outro AUDIRA | small-server-rack-8ae0a4 / prop | Outro card shared/assets/brand |

Saran engine: 2D — topik abstrak (log, grafik, snapshot, graf referensi); aset GLB 3D hanya pelengkap, jadi DEVFORGE/VISUALINVESTIGATION lebih cocok.
