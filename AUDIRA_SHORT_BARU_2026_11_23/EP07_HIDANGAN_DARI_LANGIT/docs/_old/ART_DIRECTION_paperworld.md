# ART_DIRECTION — EP07 Hidangan dari Langit
Style: PAPERWORLD
Engine: Remotion 2D (SVG + CSS), 1080×1920 @ 60. Kode: `engines/remotion-starter/src/episodes/hidangan07/` (parts.tsx = kit kertas).

- Material: kertas potong berlapis. Tiap layer punya tepi potong gelap, rim krem di sisi kiri-atas, dan tekstur serat (`public/hidangan07/paper.png` + feTurbulence).
- Cahaya: key light kiri-atas di semua adegan. Tiap layer menjatuhkan bayangan panjang searah ke kanan-bawah (filter #pl/#pm/#ps, offset 30–40 px untuk layer besar). Pool cahaya hangat per adegan di subjek utama. Vignette lembut.
- Palet: kertas hangat pastel (krem #F4E9D4, peach, mint, teal, coral, langit biru muda), aksen per adegan: emas lentera (hook/doa), merah badai (peringatan), mint/teal (kitab, ulama).
- Lapisan: BG langit/dinding kertas → MG bukit, kota, rak, lengkung → FG siluet kartu, meja, lentera → HUD kartu kertas kinetik → caption karaoke.
- Figur: siluet kartu berlapis dengan lipatan dan tepi potong, tanpa wajah. Tidak ada bentuk kerucut mulus.
- Tipografi: Fredoka (judul/kartu), Nunito (teks + caption), Playfair (kutipan ayat).
- Adab: Nabi Isa AS hanya diwakili lentera matahari kertas (cahaya). Hawariyyun = siluet kartu tanpa wajah. Tidak ada kaligrafi Arab buatan.
- Brand di dunia: papan kertas AUDIRA QISSAH di bukit (hook) dan papan gantung (penutup).
- Kamera: drift kontinu (scale 1.00→1.08 + pan), cross-dissolve 0.5 dtk antar babak.
- Safe zone: teks di y 180–1540, x 60–1020; label tidak tepat di atas caption (y 1400).
