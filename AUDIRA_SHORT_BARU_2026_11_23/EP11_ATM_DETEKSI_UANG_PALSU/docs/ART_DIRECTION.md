# ART DIRECTION — EP11 ATM & Deteksi Uang Palsu
Style: INNERWORKS (2D cutaway studio terang) · Engine: Remotion 2D (SVG/DOM) · 1080×1920 @60

## Konsep spasial
Satu dunia: studio terang tempat **satu mesin setor tunai mint** berdiri di plinth putih. Film adalah perjalanan selembar uang di dalam mesin itu: casing dibelah (garis potong cyan + ghost outline), lalu kamera menyelam ke tiap stasiun sensor di sepanjang jalur rol, keluar lagi untuk vonis, lalu ke tangan penonton (cek 3D) dan hero shot mesin.

## Palet (kit INNERWORKS)
studioPaper #e8eeeb (BG) · floor #dfe7e3 · mintCasing #79dcb4 / back plate #cdeee0 · plinth #f4f6f5 · brass #d4a537 (rol, roda gigi) · steel #a7b3c2 · orange #ff7a3d (aksen, hub, bar brand; teks #c2410c) · xrayCyan #00b8d4 (garis potong, ghost; teks #06697a) · ink #1d2b33.
Aksen spektrum (hanya di dalam panel sensor): UV violet #6d4aff + glow biru #6fb6ff; IR merah tua #8a1c2b; magnet ungu-biru garis medan #3949ab; status OK #16a34a, TOLAK #dc2626.

## Material 2D
- Logam: gradien linear 3–5 stop (highlight tipis tajam + goresan arah repeating-linear-gradient opacity 0.06), chamfer terang 2 px di tepi atas.
- Casing mint: gradien halus + grain seeded statis (feTurbulence seed tetap), bayangan kontak lembut di plinth.
- Uang: kertas krem-pink generik "Rp100.000" (bukan replika desain BI: tanpa potret, hanya ornamen guilloche prosedural, peta siluet saat UV), uang palsu = kertas HVS putih kebiruan.
- Kedalaman: BG gradien + backdrop, MG mesin, FG rol/uang yang lewat dekat kamera dengan blur ringan, HUD chip.

## Kamera
Kamera 2D = transform scale/translate kontinu (pegas/ease expo), tidak pernah diam > 1.5 dtk (drift 1–2%). Jenis shot berganti tiap adegan: wide → push-in → macro → side → top-down → wide.

## Tipografi
Anton (judul/angka), Space Grotesk/Inter (label). Teks ≥ 36 px, chip plat gelap #1d2b33 untuk judul hook, chip terang rgba(244,247,246,0.93) untuk callout. Safe zone: atas 180 px, bawah 380 px; karaoke plate y ≈ 1300–1520.

## Brand
"AUDIRA EXPLAINED" tercetak di plinth depan dengan bar oranye (brand di dalam adegan), VO menyebut "Audira Explained" di outro, AudiraOutro 3 dtk + AudiraSignature lapisan terakhir.
