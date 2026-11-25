# Art Direction — EP04 Mansa Musa: Emas di Kairo (HD2D)

**Rasa:** petualangan RPG yang tenang dan hormat. Diorama miniatur tilt-shift, sprite pixel 2D yang menerima cahaya 3D asli, senja hangat.

**Palet (`MM` di `CairoMarket.tsx`):** langit #0B1230 → #2B2752 → cakrawala #D9774A; pasir #5E4630, batu #866849, kayu #4A2E1A; lentera #FFA347 / #FFD08A (2400K); emas #F0B93E; perak hangat #ECE6DC (diperbaiki dari abu-biru di Stage A); merah #9C2F2A, krem #E9DCC0, indigo #2E4C7A. Peta: laut #2A5A7E, gurun #D7AE72, Sahel #B99B55, sabana #5F8A3F, Eropa #6F8B4C; vellum #E9D4A4 dengan garis rhumb merah/hijau.

**Cahaya:** satu matahari senja (#FFC98A, frustum bayangan mengikuti subjek), fill biru dari belakang (#8FA6FF), rim spot biru di timbangan, lampu titik lentera, api unggun, lampu minyak, spot hangat di atas meja peta. Finish: `DOCUMENTARY_WARM`, exposure 1, envIntensity 0,55, HDRI `warmStudio`, AO aktif, DOF tilt-shift (aperture 0,011, naik sampai 0,023 di bidikan dekat).

**Material:** `POLISH.stone` + grain bump untuk batu/kayu, `POLISH.fabric` untuk tenda/awning/bantal, `POLISH.paper` untuk buku dan surat utang, logam emas (`GOLD_MAT`, clearcoat) dan perak (clearcoat, emissive hangat kecil) untuk koin, kuningan untuk timbangan.

**Tokoh dan adab visual:** semua orang = sprite pixel kecil tanpa wajah (dari belakang, kepala berbalut). Tidak ada nabi, malaikat, atau sosok Mansa Musa. Atlas Katalan ditampilkan hanya lewat benda: singgasana kosong, mahkota, bongkah emas, tongkat. Kubah dan menara hanya sebagai siluet kota yang terhormat; tidak ada teks Arab atau ayat (goresan tinta di buku abstrak). Nama AUDIRA hanya pada peti kayu di meja pemberi pinjaman.

**Tipografi:** Anton (judul, angka HUD), Silkscreen Bold (label pixel, chip 40 px), Space Grotesk 700 (karaoke 58 px). Chip berlatar #0E0A18 dengan bingkai berwarna dan bayangan pixel.

**Komposisi 9:16:** subjek di tengah, teks penting di antara 180 px atas dan 380 px bawah; kartu HUD hanya di kiri atas, pin di zona 540–1220 px dan hanya bila titiknya terlihat, karaoke di atas 1540 px. Transisi antar set = tirai senja singkat di tengah penerbangan (gaya pindah zona game HD-2D).
