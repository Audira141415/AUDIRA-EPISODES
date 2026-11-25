# ART_DIRECTION — EP71 Baarle, Pintu Depan Menentukan Negaramu

Style: SATELLITEBRIEFING
Engine: Remotion + R3F, 1080×1920 @ 60 (draf 540×960 @ 30)

## Ide visual

Satu briefing analis satelit atas kota Baarle. Film bergerak dari orbit ke skala rumah: peta tambal-sulam → asal-usul 1198 → satu pintu di Jalan Loveren → meja kafe → toko yang terbelah → kembali ke orbit. Setiap kepingan Belgia diberi kotak target amber; kepingan Belanda di dalamnya diberi kotak biru. Pintu depan adalah "target" utama film.

## Palet (kit + episode)

| Peran | Hex | Catatan |
|---|---|---|
| Void / latar | `#070B0E` | background + fog 9…30 |
| Panel emisif latar | `#1976D2` | emissiveIntensity ~2.2, z ≈ -4.5 (resep memori) |
| Tanah analis | `#6E7A80` / `#5E696F` | relief bertekstur `useSurfaceGrain`, atas terang, sisi gelap |
| Belgia (kepingan) | amber `#FFBE55` | reticle + cap emisif + label "B" |
| Belanda (kepingan) | `claimBlue #2E70CE` | reticle + cap emisif + label "NL" |
| Garis batas | `vectorWhite #F2F5F6` putus-putus | anotasi analis, bukan klaim marka jalan |
| Atap bata | `#8A4B3A` desaturasi 40% | hanya skala rumah (S4–S5), agar tetap terbaca "kota Flandria" |
| Tutup / ditolak | `#E5533D` | hatch merah separuh toko yang ditutup (S5) |
| Teks HUD | `#ECEFF4` | di plat gelap |

## Lapisan (wajib tiap adegan)

- **BG**: panel layar emisif biru + grid emisif (~3) + kabut horizon biru.
- **MG**: terrain relief Baarle (blok kota bertekstur, jalan, padang rumput) + aset GLB skala adegan.
- **FG**: siluet gelap `#0F1418` di z ≈ 3.5 berkap amber (atap/menara antena/tiang) yang lewat pelan, parallax.
- **HUD**: header card y 180–420 (kicker `● AUDIRA // BRIEFING BAARLE`), callout data kinetik di sepertiga atas–tengah, chip status, skala bar. Tidak ada elemen di 380 px bawah. Subtitle karaoke y 1300.

## Kamera

- Descent logaritmik di awal S1 dan S6 (orbit ↔ kota), near-nadir (pitch ≥ 55°).
- Antar kepingan: `truck` di atas grid. Saat target disebut: `pushIn` pendek ke reticle.
- S4–S5 (skala rumah/kafe): oblique 40–50° boleh, tetap "drone analis", tidak sejajar tanah.
- Sway lateral ≤ 1,2 (yaw pelan), `alive deg 0.6`. Tidak ada potong tanpa motivasi: tiap perpindahan adegan = whip/descent/zoom-through reticle.

## Cahaya & Finish

- `<Finish>` profile `CYBER_NEON_VOID`, exposure 1.35, envIntensity 0.7, hdri studio, AO aktif sesuai FilmScene.
- KeyLight rendah [4.5, 7.5, 5] `#FFF8E7` 1.9, rim `#90CAF9` 0.75 dari utara.
- Scan line amber (emissive ~4) menyapu horizontal tiap babak, satu kali per adegan.

## Brand di dalam adegan

- Label HUD `AUDIRA // BRIEFING BAARLE` di header card + papan nama kecil "AUDIRA" pada tiang antena FG di S1 dan S6.
- `<AudiraSignature seed="sejarah-negara-ep71" handle="@AudiraFaktaDunia" />` lapisan terakhir. Outro card AUDIRA 2–3 dtk terakhir.

## Larangan episode

- Tidak ada RoundedBox abu-abu polos sebagai tanah; tidak ada `Points`/`LineSegments` sebagai visual utama.
- Tidak menampilkan wajah orang nyata, logo merek toko (toko = "toko pakaian" generik), bendera tidak dipakai sebagai satu-satunya pembeda (selalu ada label B / NL).
- Tidak ada marka salib putih di aspal (tidak bersumber).
