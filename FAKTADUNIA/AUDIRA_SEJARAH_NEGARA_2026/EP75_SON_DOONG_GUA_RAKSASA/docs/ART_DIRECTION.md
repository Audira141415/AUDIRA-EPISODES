# ART_DIRECTION — EP75 Son Doong (WORLDFORGE 3D)

Style: WORLDFORGE · Remotion + R3F · 1080×1920 @ 60 · finish DOCUMENTARY_WARM

## Mood
Dokumenter ekspedisi: gelap gua yang dalam, dipotong berkas cahaya matahari hangat dan lampu kepala penjelajah. Rasa skala lewat figur kecil (manusia, tenda) di samping objek raksasa (dinding 200 m, pesawat 747, gedung).

## Palet
- Batu kapur basah #6F6A5E → #A39B86, celah gelap #2B2822; flowstone kalsit krem #D9C9A3.
- Hutan: zamrud #2F6B3A, pakis #4F8A3C, lumut #6E8F3A.
- Cahaya: berkas matahari #FFD9A0, kabut doline #CFE3E0, lampu kepala #FFF1C9 (emisif).
- Sungai bawah tanah #1F4E5A dengan pantulan.
- HUD: kartu gelap rgba(14,18,16,0.84) + garis zamrud #3FAF6A, teks putih / oker #E8B860, Anton / Space Grotesk, label ≥ 36 px di lebar 1080.

## Cahaya
- Luar: matahari rendah (elevasi 25–35°) samping-belakang, bayangan panjang di karst.
- Dalam gua: hemi 0.12, key = berkas doline (spotLight sempit + kerucut volumetrik additive), fill = lampu kepala.
- Kabut berlapis: fog eksponensial + 3 lapis sprite (FG/MG/BG) bergerak pelan.

## Material
- Batu kapur: geometri displacement noise seeded (bukan bola/kotak polos), bump berlapis, roughness 0.85; lantai dekat sungai roughness 0.4.
- Stalagmit: kerucut displacement bertumpuk, kalsit krem.
- Pohon/pakis/bambu: GLB katalog, diwarnai ulang ke palet, disebar seeded.
- Figur: ToyPerson + helm kuning + lampu kepala emisif + tas, bukan manekin polos.

## Kamera (9:16)
- Lebar frame = 0,56 × tinggi; hero ≥ 50% lebar.
- Gerak kontinu tiap adegan; jenis shot berbeda antar beat bersebelahan.
- Tidak menembus geometri; jarak ≥ 1.5 unit dari dinding.

## Safe zone
Atas 236 px bersih, subtitle karaoke y=1300, bawah 380 px bersih. HUD callout di y 300–900.

## Brand
`<AudiraSignature seed="ep75-son-doong" handle="@AudiraFaktaDunia" />` lapisan terakhir; outro card `audira-outro-card.svg` 2,5–3 dtk; brand di adegan: label HUD kartu peta S2 + stensil "AUDIRA EXPEDITION" di peti ekspedisi S4.
