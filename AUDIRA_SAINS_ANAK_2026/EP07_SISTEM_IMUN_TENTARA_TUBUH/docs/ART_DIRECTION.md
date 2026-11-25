# Art Direction — Sistem Imun: Tentara Tubuh (`NANOFORGE`)

Style: NANOFORGE

## Idea
Satu perjalanan menyelam dari tubuh anak ke dunia mikro, mengikuti satu "tentara" demi satu: patroli → luka → jenderal → serangan → barak memori → kembali ke anak yang tidur. Sel adalah karakter dengan siluet berbeda sehingga terbaca tanpa suara.

## Look
- Latar gradasi teal-ungu gelap (bukan hitam; exposure dijaga agar qa-video tidak BLACK), partikel bokeh seeded, kabut untuk kedalaman.
- Lighting: key hangat emas dari atas-kiri, rim cyan + magenta mengikuti kamera. `<Finish profile={COLOR_PROFILES.CINEMA_TEAL_ORANGE} exposure={1} envIntensity={0.55} ao />`.
- Per babak: hook senja hangat; patroli merah-teal; luka merah muda; jenderal ungu; serangan merah gelap; memori biru-emas; outro biru malam.

## Characters (siluet unik)
| Sel | Bentuk | Warna | Material |
|---|---|---|---|
| Neutrofil | bola berbintil + inti 3 lobus samar | putih susu | physical, transmission 0.3, displacement noise |
| Sel darah merah | cakram cekung | merah | clearcoat |
| Bakteri | kapsul batang + flagela | hijau limau | bintik, sheen |
| Makrofag | gumpalan besar dengan 5–7 pseudopod | ungu | transmission, bintil |
| Sel T pembantu | bola bermikrovili + lencana bintang emas | biru | glossy |
| Sel T pembunuh | bola bermikrovili | merah-oranye | glossy |
| Sel B | bola halus | kuning | glossy |
| Antibodi | huruf Y | emas | metalik halus |
| Sel memori | bola dengan halo | biru-emas | emissive lembut |

## Palette
primary #2FE6D0 (teal) · secondary #FF4FA3 (magenta) · accent #FFC247 (emas) · bg #0B1022 · ink #F4F6FB

## Typography
Kartu angka SafeLabel ≥ 36 px, angka 96–120 px; caption karaoke y=1300, 52 px, kata aktif teal, bounce ≤ 1.04.

## Depiction rules
Tidak menyeramkan (tanpa darah berlebih); luka hanya goresan. Tidak menyebut vaksin. Skala tidak sebanding → kartu kecil "ilustrasi, ukuran tidak sebanding" di S2.
