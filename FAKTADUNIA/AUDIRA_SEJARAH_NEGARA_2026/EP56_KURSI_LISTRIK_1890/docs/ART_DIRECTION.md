# ART DIRECTION — EP56 Kursi Listrik 1890

Style: VINTAGEFORGE
Engine: Remotion + R3F (full3d + overlay kartu serif)
Format: 9:16 1080×1920 @60, 94 dtk (VO 90.96 dtk, outro card 91.0–94.0)

## Mood
Museum sejarah teknik tahun 1880-an. Kayu ek gelap, kuningan berkilau, kabel tembaga, kertas parchment. Ruangan jatuh ke bayangan hangat; subjek selalu kena spot lampu lilin/kuningan. Tegang tapi tidak sadis: alat dan dokumen yang bercerita, bukan tubuh.

## Palet (VINTAGE_PALETTE)
- Latar: parchmentSepia #F3EAD6 (kabut), lantai/ruang engravingBrown #3B2818
- Tinta & teks: ironGallInk #1E1B18
- Logam: agedGold #C5A059 (kuningan), tembaga #B87333
- Aksen bahaya/arus: terracottaWash #B85A3F (busur listrik hangat), verdigrisGreen #52796F (kuningan tua, DC)

## Cahaya
KeyLight hangat kanan atas + spotLight "pool" di subjek tiap adegan + rim light dingin tipis dari belakang (pisahkan siluet) + fog sepia untuk depth. Profil COLOR_PROFILES.VINTAGE_SEPIA_FILM, hdri warmStudio.

## Material
Kuningan: MeshPhysicalMaterial metalness 1, roughness 0.34, clearcoat 0.3, envMapIntensity ~3. Kayu: physical roughness 0.6 + surface grain. Tembaga kabel: metalness 1 roughness 0.3. Kulit tali: roughness 0.8 coklat tua.

## Kamera
Satu rig kontinu (shotPlan). Tiap sub-adegan punya framing eksplisit; perpindahan antar-anchor 0.6–1 dtk C1. Kabel tembaga sebagai carrier kiri→kanan.

## Tipografi & overlay
Kartu serif (Instrument Serif) plate parchment + bingkai kuningan, ≥1.3× ukuran default, maks 1 kartu per shot, di area atas y 236–700. Name card orang nyata: plate kecil italic. Karaoke subtitle y≈1300, krem ≥70% opacity, aktif agedGold.

## Brand
- In-scene: stempel "AUDIRA ARCHIVE" pada dokumen UU, label kuningan "AUDIRA" pada panel kontrol.
- VO: "Ini kisahnya, di Audira" (hook) + "Ikuti Audira" (outro).
- AudiraSignature seed `ep56_kursi_listrik_1890`; AudiraOutro 3 dtk.

## Sensitif
Tanpa tubuh, figur, luka, asap. Kursi selalu kosong. Orang nyata = name card teks. Tanpa hewan (demo Brown).
