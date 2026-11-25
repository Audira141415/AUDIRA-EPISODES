# NOTES — EP19_DISPENSER_GALON_BAWAH

- Tanggal: 2026-11-13.
- Status: riset + naskah draf, menunggu acc pengguna. Gaya, VO, dan render belum dibuat.
- Naskah: 203 kata terucap, estimasi 81–90 dtk pada 135–150 WPM.
- Fakta yang sengaja tidak dipakai:
  - Jenis pompa (membran) (#20): tidak ada sumber yang mengaitkannya dengan dispenser.
  - Luther Haws 1906 (#17), galon kaca 20 L (#13), kerak tangki panas (#18): satu sumber, di luar fokus.
- Risiko utama: **sumber pabrikan tidak bisa dibuka** (Brio/Cosmos membalas HTTP 429, Sharp/Panasonic 403, Miyako/Modena memuat produk lewat JavaScript). Mekanisme inti bersandar pada Wikipedia Water cooler + Float switch + fisika dasar. Sebelum VO, sebaiknya pengguna mencocokkan dengan buku manual dispenser galon bawah merek lokal, terutama:
  - apakah semua model memakai pelampung, atau sebagian memakai sensor elektronik (naskah memakai "biasanya");
  - apakah keran pernah langsung menyalakan pompa pada model tanpa tangki (naskah s7 mengasumsikan desain bertangki).
- Pengunci keran panas (#9) satu sumber; naskah memakai "biasanya".
- Teaser outro: "lampu LED" (EP20).
- WebSearch/WebFetch tidak berfungsi di sesi ini (error model); sumber dibuka langsung dengan HTTP biasa.
