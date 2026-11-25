# Art Direction — EP10 Wilt Chamberlain 100 Poin, 2 Maret 1962 (VINTAGEFORGE)

Style: VINTAGEFORGE

## Gagasan visual
Laga 100 poin Wilt Chamberlain tidak punya satu detik pun rekaman video. Film ini "merekonstruksi" malam itu sebagai diorama museum sepia era 1960-an: arena tua Hershey, papan skor manual kayu, meja siaran radio, ruang ganti dengan selembar kertas "100", rak arsip, dan vitrin "MUSEUM AUDIRA". Tokoh adalah figur mainan kayu bergaya (`ToyPerson`), tanpa wajah fotorealistik dan tanpa logo tim. Engine Remotion + R3F, kode `studio/src/scenes/ep10/` (impor ulang pola `ep02`).

## Look
- Palet sepia hangat: kayu cokelat, krem, emas tua, merah bata pudar; bg `#2a1d12`; tone mapping lembut + grain/vignette dari `Frame`.
- `PoolLight` spotlight hangat di subjek tiap shot; rim light + fog dekat untuk kedalaman.
- Wilt = figur tinggi jersey krem polos tanpa nomor/logo; Warriors krem, Knicks cokelat tua (warna saja, tanpa logo).
- Kedalaman 3 lapis: BG (dinding arena, tribun, rak arsip), MG (subjek), FG terang (parket, meja radio, bangku, alas vitrin).
- Kartu serif krem/tinta/emas (`Card`, `NameCard`, `Stamp`) ≥ 42 px; caption karaoke kata non-aktif ≥ 70% krem.

## Pelajaran memori VINTAGEFORGE yang diterapkan
- Cam lift ±0.09; label 3D ≤ 1 per shot bila kartu sudah membawa angka.
- Sepertiga bawah diisi prop FG terang dan fokus, bukan scrim gelap.
- Figur non-subjek keluar frame di close-up.

## Aturan konten
- Angka di layar hanya dari `research/SOURCE_REGISTER.md`: 100 poin, 2 Maret 1962, Hershey, ±4.000 penonton, 2,16 m, 23 / 41 / 69, 51% karier, 28 / 32, 0:46, 64 tahun, 83 (Adebayo 2026), 81 (Kobe 2006).
- Dilarang: jenis tembakan ke-100, skor 169–150, "laga dihentikan", 2,18 m, nama fotografer, jumlah pendengar radio, logo Warriors/Knicks/NBA, wajah nyata.
- Safe zone atas 236 px, bawah 380 px bersih; caption karaoke di y ±1300.
- Brand: papan "MUSEUM AUDIRA" (in-scene), VO "Audira" di hook dan outro, `AudiraSignature` lewat `signed("Ep10", ...)`, kartu outro AUDIRA 2–3 dtk terakhir.

## Gerak
- Kamera `camAt` kontinu dengan drift; tidak diam > 1,5 dtk; push/crane pada setiap potongan; jeda singkat sebelum poin ke-100 lalu IMPACT + flash.
