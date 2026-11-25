# Art Direction — Cara Kerja Petir: Awan ke Tanah dalam 1/100 Detik (`DISASTERSIM`)

Style: DISASTERSIM

## Idea
Satu desa kecil di malam badai, dilihat seperti "lab simulasi cuaca": kamera bergerak dari desa ke menara awan kumulonimbus, masuk ke penampang awan, turun bersama pemimpin bertingkat, naik bersama arus balik, lalu kembali ke jendela rumah anak untuk menghitung jarak guntur.

## Look
- **Stage:** langit badai malam `#0B141C` → `#16212B`, kabut tipis biru-abu, tanah rumput gelap `#2F4A33`, desa (rumah dua lantai, pohon, antena, gedung tinggi di kejauhan).
- **Floors and stations:** S1/S4/S5/S8 = desa; S2 = menara awan raksasa (awan GLB berlapis + bola awan prosedural); S3 = penampang awan (lab cutaway, partikel es); S6 = jalur kilat close-up + cincin gelombang `#9FE3FF`; S7 = jendela rumah anak.
- **Lighting:** key bulan dingin `#9FB8D9`, rim cyan `#6FD8FF` dari belakang tiap adegan, kilat = pointLight putih-biru `#DDEBFF` intensitas tinggi saat kedip; Finish DOCUMENTARY_WARM, exposure ±1.05, envIntensity 0.45, AO.
- **Light by chapter:** S1 gelap + flash putih; S2 ungu-biru dengan kilat di dalam awan; S3 lab dingin cutaway; S4 gelap tegang, leader ungu terang; S5 flash putih berkedip 4×; S6 jingga panas `#FFB547` di jalur; S7 hangat di jendela vs biru di luar; S8 hangat + ramp peringatan.

## Material
- **Kilat:** tabung tipis emissive putih `#F4F8FF` + halo biru `#8FB8FF` (additive, toneMapped false), cabang zig-zag seeded.
- **Awan:** GLB `towering-cloud-2e00f1` tint abu-biru, roughness 1, ditambah bola awan prosedural.
- **Muatan:** bola kecil emissive: positif merah `#E5533D`, negatif biru `#4FC3D9`, tanda +/− di sprite.
- **Desa:** GLB rumah, pohon, antena, gedung, anak — material asli, basah (roughness 0.6).
- **Cincin guntur:** torus tipis `#9FE3FF`, transparan memudar.

## Palet
void `#0B141C`, plinth `#16212B`, ring `#9FE3FF`, panas `#FFB547`, positif `#E5533D`, negatif `#4FC3D9`, aman `#3DDC97`, HUD `#EAF4F8`.

## Tipografi
FONT kit (sans 800). Kartu big 72–110 px mulai top 262, small 40–46 px di 400–520. Karaoke y 1300, 50 px.

## Aturan penggambaran
- Tidak ada wajah orang nyata; anak = karakter GLB low-poly.
- Kilat tidak menyambar anak/rumah berpenghuni; sambaran ke pohon tinggi/antena (edukatif, tanpa sensasi).
- Label "ilustrasi, tidak berskala" di penampang awan dan leader.
- AUDIRA di dunia: papan "AUDIRA · STASIUN CUACA" di menara antena.
