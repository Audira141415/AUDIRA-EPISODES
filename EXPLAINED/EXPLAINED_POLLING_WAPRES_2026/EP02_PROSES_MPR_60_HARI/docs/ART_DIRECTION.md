# ART DIRECTION — EP02 Proses MPR 60 Hari (DATAPHYSICAL, world3d)

## Gagasan
Satu penggaris kuningan 60 hari di atas meja panjang walnut. Penggaris berukir 60 marka membentang dari kiri ke kanan; di atasnya berdiri balok akrilik per tahap (12 NOV, 25 NOV, 9 DES). Di ujung kanan meja, sebuah maket ruang sidang setengah lingkaran dari kursi-kursi aluminium kecil. Kamera berjalan menyusuri penggaris seperti membaca garis waktu, lalu masuk ke maket sidang.

## Palet
| Token | Hex | Kegunaan |
|---|---|---|
| studioSlate | #181B21 | latar dingin (beda dari EP01 yang hangat) |
| deskEdge | #24272E | dinding belakang panel kayu gelap |
| walnutBase | #2A1B14 | meja panjang |
| brassGold | #D2B07A | penggaris, marka hari, plakat tanggal (dominan) |
| machinedAluminum | #C8CCD1 | kursi maket sidang, balok tahap |
| acrylicTeal | #9FD3D6 | balok akrilik tahap, gerbang jalur |
| focalOrange | #D4521C | tahap yang sedang dibahas, sisa masa jabatan |
| inkNavy | #1F3A5F | ukiran pasal di pelat |
| hudText | #ECEFF4 | teks panel |
| amberKicker | #FFBE55 | kicker |

## Material dan cahaya
- Kuningan penggaris: metalness 0.85, roughness 0.22, marka ukir lewat canvasTex + bump.
- Aluminium kursi: lathe + extrude (sandaran, dudukan, kaki), metalness 0.18 + emissive tipis.
- Walnut: canvasTex serat kayu seeded. Akrilik: opacity 0.45.
- Pelat pasal: kuningan dengan teks "PASAL 8 AYAT 2" terukir.
- stage({exp: 1}), environmentIntensity 0.55; key lebih netral 4200K + fill biru kuat (#90CAF9 1.0) untuk suasana ruang arsip dingin.
- Post: APPLE_STUDIO_CLEAN satu pass (kurva S 0.15, vignette 0.06, grain 0.004), NaN guard sebelum bloom.
- FG: tumpukan map arsip blur di tepi bawah meja; BG: rak arsip kabur + lampu meja kuningan.

## Penggambaran
- Tanpa tokoh/wajah. Presiden dan MPR hanya sebagai plakat nama lembaga.
- Tanpa lambang negara atau logo lembaga. Chip: "ILUSTRASI, BUKAN CUPLIKAN ASLI".
- Tanggal dan pasal persis dari naskah.
- Kata AUDIRA terukir di ujung penggaris.

## Tipografi
- Judul panel: Fraunces 700 (serif, nuansa dokumen konstitusi) 96-130 px.
- Angka/tanggal: JetBrains Mono 700, chip 128 px.
- Body: Inter 600 42 px; caption Inter 800 58 px.

## Kamera
- track() spline, fov 32. Gerak utama: dolly menyamping (truck) sepanjang penggaris, kiri ke kanan mengikuti waktu.
- s1 macro di marka "60", tarik mundur memperlihatkan seluruh penggaris; s3 truck ke marka 12 lalu 25; s4 crane masuk ke maket sidang; s5 naik tampak atas jalur 3 gerbang vs 1 jalur; s7 turun ke batang masa jabatan; s8 mundur lebar.
