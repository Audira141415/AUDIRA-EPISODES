# ART_DIRECTION — EP72 Gempa Lisbon 1755

Style: MOSAICFORGE · Remotion + R3F (3D) · 1080×1920 · 60 fps final

## Konsep

"Kota yang tercatat di ubinnya." Lisbon digambarkan sebagai dunia diorama yang lantai, dinding, dan langitnya berupa azulejo 3D. Tiap bencana mengubah ubin: gempa membuat ubin terangkat dan retak, laut menyapu dengan ubin biru yang bergulung, api menghitamkan glasir dan memunculkan ubin oker-merah. Payoff: ubin jatuh dan tersusun kembali (grammar drop kit, `tileDelay`) di atas rangka kayu gaiola jadi Baixa baru.

## Palet

- Kobalt azulejo: #13306F (kartu teks), #1A2F78 / #2747A3 / #4E73C7 (ubin biru)
- Glasir putih/krem: #F7F1E3 / #EFE3C8
- Oker/emas: #D69A3A / #E6B54A / #F2D27A (lilin, cahaya pagi, aksen HUD)
- Terakota: #B4532A / #7E3519 (atap, api redup)
- Api: oranye #E8742E dan merah bata #A63A1E (bukan neon)
- Nat #8F806B, room/fog #2A1D14
- Kayu gaiola: kayu ek #8A5A32 dengan serat

## Cahaya

- Pagi hari raya (S1–S3): key hangat rendah dari kiri (#FFD9A0, 2,1), cahaya lilin titik-titik di gereja.
- Laut (S4–S5): key dingin abu kebiruan, langit mendung, fog lebih rapat; kontras turun tapi tidak gelap total.
- Api (S6–S7): key oranye dari bawah, asap/haze di belakang subjek, bloom hanya pada nyala api (threshold 0,95); kartu teks tidak emisif.
- Bangkit (S8–S11): golden hour, key hangat tinggi, bayangan panjang di jalan lurus Baixa.

## Material

- Ubin: `makeCeramicMaterial()` (clearcoat 0,7, roughness 0,42), grid per ubin tilt ±0,045 rad, tone ±9% seeded (mulberry32, bukan Math.random).
- GLB katalog dipakai sebagai subjek nyata: gereja bata, rumah dua lantai, tenement, kapal sekoci + jangkar, lentera lilin, sumur, lumbung kayu (referensi gaiola). Semua dilapis tint hangat agar menyatu dengan ubin.
- Rangka gaiola: balok `RoundedBoxGeo` kayu dengan `useSurfaceGrain` (bukan kubus polos), bersilang diagonal (cruz de Santo André) di dalam dinding batu terbuka.
- Tokoh: `<ToyPerson>` kain, kepala berkain bulat, tanpa wajah.

## Kamera

Tidak pernah parkir. Tiap adegan beda jenis shot (shotlist-lint): S1 macro → S2 low interior → S3 aerial peta → S4 side harbor → S5 low POV gelombang → S6 top-down kota → S7 wide pull-back → S8 high three-quarter → S9 macro orbit rangka → S10 tracking surat → S11 crane naik ke wide. Transisi: ubin flip/wipe (ubin berbalik memperlihatkan adegan baru), ≤ 0,5 dtk.

## Teks & HUD

- Callout data: kartu solid kobalt #13306F 88%, teks putih/oker, Anton ≥ 64 px untuk angka, Manrope ≥ 34 px untuk label, zona y 280–520.
- Karaoke caption Manrope di y 1300, lantai caption lebih gelap, jarak kata ≥ 0,4em, bounce ≤ 1,04.
- Top 236 px bersih, bottom 380 px bersih.

## Sensitivitas

Tanpa tubuh, darah, orang tenggelam/terbakar. Korban = angka tenang di atas barisan ubin gelap + lilin kecil. Pombal = figur tanpa wajah + name card "MARQUIS DE POMBAL (KELAK)". Tanpa simbol keagamaan yang dibesarkan; gereja hanya bentuk arsitektur.

## Brand di adegan

- Ubin bertuliskan "AUDIRA" pada panel azulejo dinding (S1) dan plakat ubin di fasad Baixa baru (S11), kartu solid, tidak emisif.
- `<AudiraSignature seed="gempa-lisbon-ep72" handle="@AudiraFaktaDunia" />` lapisan terakhir; outro card 2–3 dtk terakhir.
