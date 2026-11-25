# ART DIRECTION — EP16 Tristan da Cunha

Style: HISTORYMAP (Remotion 2D, SVG/DOM)

## Look
- Meja peta navigasi malam: laut navy tinta (#141B28 → #1E2A3C), garis lintang/bujur emas pudar (#C9A45C, opacity .18), label laut huruf kapital renggang, mawar kompas di pojok.
- Daratan: perkamen hangat (#D9C49A → #BFA46E) dengan tepi garis pantai emas tua (#8A6A33); pulau Tristan = kerucut gunung api hijau-zaitun (#6F7B4A) dengan kawah.
- Rute: panah merah (#E0393E) putus-putus yang menggambar diri, titik kota = lingkaran emas berdenyut.
- Kartu data: plat gelap rgba(14,18,26,.88), border-left merah 10 px, teks krem #F4E9D0, angka Anton 96–140 px. Satu kartu per momen, x 60–1020, tidak di 180 px atas / 380 px bawah.
- Kolam cahaya hangat (radial soft-light) di bawah peta setelah hook; vignette; grain seeded (feTurbulence statis, tanpa Math.random).
- Adegan ilustratif (gunung api, desa, kapal, letusan, pelabuhan) = ilustrasi vektor berlapis BG/MG/FG dengan palet sama.

## Gerak
- Kamera = transform dunia (pan/zoom kontinu ease-out expo), tidak pernah diam > 1,5 dtk (drift lambat).
- Callout pop-in spring (damping 13, stiffness 190); rute digambar 0,8–1,4 dtk; angka count-up.
- Transisi antar adegan: crossfade 0,35 dtk + zoom lanjutan.

## Teks
- Caption karaoke lebar penuh y ±1428–1540, Manrope 800 60 px, gap 0,4em, kata aktif emas, bounce ≤ 1,04, kata mendatang opacity 1.
