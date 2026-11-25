# ART DIRECTION — EP01 Kandidat Pengganti Wapres (DATAPHYSICAL, world3d)

## Gagasan
Satu galeri patung data: empat plinth walnut melengkung mengelilingi satu kursi wapres aluminium yang kosong di tengah. Tiap plinth = satu klaster survei, kolom aluminium = persentase kandidat. Kamera dolly melingkar dari kursi ke plinth ke plinth, lalu naik (crane) ke corong kuningan tempat 12 plakat nama menyempit jadi 2 slot "MPR".

## Palet
| Token | Hex | Kegunaan |
|---|---|---|
| studioGreige | #1C1D20 | latar, fog |
| galleryWall | #2B2A2E | dinding galeri melengkung (BG) |
| floorStone | #3A3836 | lantai reflektif |
| walnutBase | #2A1B14 | plinth |
| machinedAluminum | #C8CCD1 | kolom data, kursi wapres |
| brassGold | #D2B07A | tutup kolom, plakat nama, corong |
| acrylicTeal | #9FD3D6 | bidang ambang/klaster |
| focalOrange | #D4521C | satu kolom unggulan per frame |
| hudText | #ECEFF4 | teks panel |
| amberKicker | #FFBE55 | kicker panel |

## Material dan cahaya
- Aluminium: metalness 0.18 + emissive tipis pada kolom hero (pelajaran memori: lebih terbaca dari metalness 0.88 gelap); bevel lewat ExtrudeGeometry, bukan box polos.
- Kuningan: metalness 0.85, roughness 0.24; plakat nama = canvasTex teks ukir.
- Walnut: canvasTex serat kayu (seeded), roughness 0.55.
- Akrilik: transmisi palsu (opacity 0.45, roughness 0.12).
- Lantai: MeshStandard roughness 0.35 + bayangan kontak; shadowMap aktif (AO tidak ada di world3d).
- stage({exp: 1}), scene.environmentIntensity 0.55, envStrips studio hangat.
- Post: satu pass APPLE_STUDIO_CLEAN — kurva S 0.15, vignette 0.06, grain 0.004, tanpa aberasi; NaN guard sebelum UnrealBloom (bloom minimal).
- Fog tipis 0.012 untuk memisahkan baris kolom BG yang kabur.
- Lampu: key hangat 3400K + rim dingin + 2 spot per plinth aktif.

## Penggambaran
- Tokoh nyata hanya sebagai plakat nama + persentase. Tanpa wajah, foto, atau siluet mirip.
- Tanpa logo partai/lembaga. Chip pojok: "ILUSTRASI DATA, BUKAN CUPLIKAN ASLI".
- Angka hanya dari naskah (survei LRP 13-14 Nov 2026). Panel menyebut "Survei LRP" sebagai sumber.
- Kata AUDIRA terukir di plinth tengah (anti-reupload).

## Tipografi
- Judul panel: Archivo Black 96-140 px.
- Data/angka: JetBrains Mono 700, chip angka 128 px.
- Body panel: Inter 600 42 px. Caption karaoke: Inter 800 58 px, jarak kata ≥ 0.4em.
- Min 36 px untuk semua label di layar.

## Kamera
- track() spline di lib3d.js, fov 30, tinggi mata rendah (1.4-1.8) agar kolom terbaca tinggi.
- s1 push-in ke kursi kosong, s2 pull-back melihat 4 plinth, s3-s5 dolly melingkar plinth ke plinth (orbit ±20° tiap plinth), s6 crane naik, s7 turun ke corong, s8 mundur pelan ke galeri penuh.
- Drift kecil sin() selalu aktif; turntable plinth sin(0.35t)·0.2 rad.
