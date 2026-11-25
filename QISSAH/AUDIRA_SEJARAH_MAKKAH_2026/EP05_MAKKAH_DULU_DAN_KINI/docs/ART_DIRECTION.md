# Art Direction — EP05 MAKKAH DULU DAN KINI (VINTAGEFORGE)

## Gagasan
Makkah sebagai **satu pelat ukir tembaga yang hidup**. Kota berubah di atas pelat yang sama: rumah batu, lalu riwaq Utsmani dan Benteng Ajyad, lalu kota menara. Semua digambar dengan teknik gravir yang sama, sehingga "dulu" dan "kini" terasa satu dunia, bukan dua dunia terpisah.

## Palet (kit VINTAGEFORGE)
| Token | Hex | Pakai |
|---|---|---|
| parchment | `#efe2c4` | kertas, latar, kabut |
| paperDeep | `#e2cfa6` | tanah, batu |
| sepia ink | `#3b2818` | garis ukir sisi "dulu", tepi, teks |
| copper ink | `#5a2f17` | garis ukir sisi "kini" (cover) |
| iron gall | `#1e1b18` | judul, Ka'bah |
| aged gold | `#c5a059` | kiswah, mahkota menara, tali ukur, rute |
| verdigris | `#52796f` / air `#6f8f84` | air banjir, saluran |
| terracotta | `#b85a3f` | aksen kecil (bendera kapal, batang 2020) |
| outro | `#0B3D2E` | kartu outro AUDIRA |

## Material dan cahaya
- **Shader gravir:**
  - Material: `engraving.ts`, yaitu MeshStandardMaterial dengan arsiran tonal di ruang dunia (diagonal → silang → lapis ketiga di bayangan terdalam), garis kontur untuk medan, dan tepi bertinta (EdgesGeometry).
  - Frekuensi arsiran naik per oktaf mengikuti jarak kamera dengan blending halus, sehingga jarak garis tetap stabil di layar saat kamera mendekat (tidak berubah jadi pita besar).
- **Air:** semi-transparan verdigris dengan garis riak gravir yang bergerak. Saat 1969 airnya keruh cokelat.
- **Finish:**
  - Profil VINTAGE_SEPIA_FILM, exposure 0.82, envIntensity 0.25 (memori style), dengan HDRI warmStudio untuk emas.
  - Chromatic aberration diturunkan ke 0.0008 agar garis ukir halus tidak berpinggiran merah/biru.
  - AO aktif.
- **Cahaya:** kunci rendah dari kiri (raking) agar lereng terbaca lewat arsiran, ditambah fill hangat dari kanan depan. Bab 7 dan end screen bergeser ke senja (kunci lebih jingga dan lebih redup, kertas sedikit menggelap).
- **Kedalaman:** kabut kertas (16–52 unit di lembah, 30–110 di set jauh), langit gravir dengan matahari rendah, dan barisan gunung berkontur.

## Penggambaran (aturan keras)
- Tidak ada nabi, malaikat, atau figur suci dalam bentuk apa pun.
- **Ka'bah** selalu utuh: kubus hitam, pita kiswah emas, pintu di sisi timur laut, sudut Hajar Aswad di timur, dan Hijr Ismail di barat laut. Tidak pernah rusak di layar; 1630 hanya tampil sebagai kartu dan garis banjir pada papan.
- **Orang:** perenang tawaf 1941 hanya berupa riak cahaya, dan jemaah modern hanya berupa titik yang mengalir. Tidak ada wajah dan tidak ada sosok komik.
- **Ahmad Khatib** dihadirkan lewat mimbar dan kitab saja. Foto arsip tidak dipakai (lisensinya belum dicek).
- **Kontroversi Ajyad** dibuat netral: kartu Turki dan Saudi sejajar dengan bobot sama, begitu pula kartu pemerhati warisan dan pemerintah. Pembongkaran tampil abstrak sebagai batu yang tersusun di denah dan bukit yang merendah.
- **Brand dalam dunia:** plakat kuningan "AUDIRA · Maket Lembah Makkah · Pelat V" di plaza utara. Tidak pernah ditaruh di Ka'bah atau di teks Al-Qur'an.

## Tipografi
- Georgia Bold untuk judul dan kartu, Georgia Italic untuk keterangan, dan kicker huruf kapital berspasi lebar berwarna emas tua.
- Caption 16:9: Georgia 40 px (layout 1920), terang di atas pita gelap, kata aktif berwarna emas.
- Caption short: Georgia Bold 64 px, karaoke per kata, bounce ≤ 1,04, jarak 0,4 em, di atas 380 px terbawah.

## Kamera
- Satu spline Catmull-Rom melalui semua kunci (easing ringan per segmen) ditambah drift genggam 2,5 cm, sehingga kamera tidak pernah benar-benar berhenti.
- Kunci ditulis untuk 9:16. `FormatFov` di `<Finish>` mengonversinya ke 16:9.
