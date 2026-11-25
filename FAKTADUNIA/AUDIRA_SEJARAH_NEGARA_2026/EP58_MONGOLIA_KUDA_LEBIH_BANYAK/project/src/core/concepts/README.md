# core/concepts — pustaka prop konsep per tema

Konsep abstrak di naskah (molekul, gelombang, stomata, pelari 1904, mobil Fangio) **wajib** dirender lewat komponen di sini atau GLB nyata dari katalog, bukan primitif polos (bola, silinder, zigzag) atau `ToyPerson` yang sama untuk semua cabang. Ini alat untuk lolos guard **G22** (`draft/THEME_CHECK.md`: subjek di layar = kata VO).

Latar belakang (analisis 2026-11-22): di sains-anak EP01 molekul Rayleigh berupa bola abu-abu dan gelombang berupa zigzag datar. Di FAKTA_OLAHRAGA EP02–EP05 ada 0 GLB dan 19–44 primitif per episode. Pemain tenis, kru pit, dan pelari 1904 memakai manekin yang sama. Juri menulis "tanpa subjek jelas".

![contact sheet](demo-sheet.jpg)

## Cek demo

```bash
node scripts/stills.mjs out/concepts 0.5s,1.5s,2.5s,3.5s,4.5s,5.5s,6.5s,7.5s,8.5s,9.5s,10.5s,11.5s,12.5s,13.5s,14.5s,15.5s ConceptsDemoPreview
```

`ConceptsDemoPreview` (540×960, 16 dtk, satu kartu 1 dtk per konsep, tanpa teks): `src/scenes/concepts/ConceptsDemo.tsx`. Bila sebuah kartu hanya bisa ditebak dari subtitle, konsepnya belum siap dipakai.

## Netral style

Setiap komponen menerima props yang sama (`palette.ts`):

| Prop | Isi |
|---|---|
| `f` | jam film 60 fps, `f = frame / fps * 60` (sama dengan `ToyPerson`) |
| `palette` | `{ primary, secondary, accent, glow, ink }`, warna dari kit (sebagian boleh) |
| `material` | nama resep `POLISH` (`toyPlastic`, `clay`, `fabric`, `paper`, …) |
| `position`, `rotation`, `scale` | penempatan |

Kit menentukan warna dan material, sedangkan komponen menentukan bentuk dan gerak. Contoh FELTCRAFT: `<AirMolecule gas="O2" material="fabric" palette={{ primary: KIT.wool.red }} />`.

## Komponen

### Sains (`science.tsx`)

| Komponen | Terbaca sebagai | Props penting |
|---|---|---|
| `SunDisc` | matahari dengan mahkota sinar berputar | `rays` |
| `LightBeam` | berkas cahaya: inti putih, halo, panah foton mengalir | `from`, `to`, `width`, `source` (matahari di pangkal) |
| `WaveRibbon` | tabung gelombang 3D berkepala panah dengan penggaris satu λ | `wavelength` `"short"`/`"long"`/angka, `ruler`, `length` |
| `AirMolecule` | molekul berwajah dengan warna unsur CPK (N biru, O merah, C hitam, H putih) | `gas` `N2`/`O2`/`CO2`/`H2O`, `face`, `mood` |
| `ScatterBurst` | hamburan Rayleigh: berkas putih menabrak N₂, biru terpental ke segala arah, merah tembus | `gas`, `directions` |
| `WaterDrop` | tetes air bening berbias dengan kilau | `face` |
| `GasBubble` | gelembung sabun berpelangi berisi molekul gas | `gas`, `rise` |
| `Leaf` | helai daun cekung dengan tulang daun, urat menyirip, tangkai | `stomata` (jumlah stoma kecil), `sway` |
| `Stoma` | dua sel penjaga "kacang" mengapit celah, kloroplas di dalam | `open` 0..1, `gasFlow` (CO₂ masuk, O₂ keluar) |
| `Chloroplast` | kloroplas dibelah dengan tumpukan grana + lamela | `glow` (denyut grana) |

### Olahraga (`sports.tsx`)

`SportsPerson sport=…` memakai `ToyPerson` sebagai dasar. Tiap cabang dibedakan lewat kostum, alat, penutup kepala, pose, dan proporsi. `palette.primary` = baju, `secondary` = celana, `accent` = aksen.

| `sport` | Penanda visual | Pose default |
|---|---|---|
| `tennis` | kaus dan celana putih, bando, raket tenis, bola | servis (`serve`, u 0,32) |
| `badminton` | kaus tim, bando, raket bulu tangkis, kok | smash |
| `f1crew` | coverall satu warna, helm penuh visor gelap, sabuk dada, wheel gun | jongkok |
| `marathon1904` | singlet krem, celana selutut, kaus kaki panjang gelap, sepatu bot kulit, topi pet, kumis, nomor dada kertas | lari |
| `boxing` | telanjang dada, celana satin + sabuk, sarung tinju besar | kuda-kuda tinju |

Ganti pose lewat `action` dan `u` (`core/sport/poses.ts`). Bagian yang bisa dipakai terpisah: `Headband`, `FullHelmet`, `FlatCapMoustache`, `BoxingGlove`, `WheelGun` (dipasang di slot `headwear`/`torso`/`rightHand`/`leftHand` milik `ToyPerson`).

Kendaraan:

- `RaceCar era="modern"`: hidung panjang, sayap depan dan belakang, sidepod, halo, ban slick bergaris warna, nomor di hidung.
- `RaceCar era="1950s"`: bodi cerutu, gril oval krom, roda jari-jari kawat, kaca angin kecil, pembalap bertopi kulit dan berkacamata, knalpot krom, roundel nomor.
- `speed` memutar roda.
- Ukuran dalam meter × `M` (0,6 unit/m), moncong ke +z.
- `Tyre kind="slick"|"wire"`: roda lepas untuk adegan pit stop.

Katalog GLB belum punya mobil formula (open-wheel), jadi `RaceCar` mengisi celah itu. Mobil jalan raya per era memakai GLB (`ERA_VEHICLES`).

## Registri (`registry.ts`)

`CONCEPTS` memetakan kata kunci naskah/VO (Indonesia + Inggris) ke komponen + props atau ID GLB, plus kolom `reads`: kalimat yang menjelaskan apa yang harus terlihat di layar.

```ts
import { findConcepts } from "./src/core/concepts/registry.ts";
findConcepts("Molekul nitrogen menghamburkan cahaya biru").map((c) => c.id);
// → ["scatter", "wave-short", "molecule-n2", "light-beam"]
findConcepts("Fangio menang tahun 1957 dengan mobil balap").map((c) => c.id);
// → ["f1-1950s"]   (overrides menyingkirkan f1-modern)
```

- Pencocokan memakai kata utuh, dan frasa terpanjang menang.
- `overrides` membuat konsep spesifik (era, gas tertentu, panjang gelombang) menyingkirkan konsep umum.
- File ini tanpa React, jadi bisa diimpor dari skrip Node (`node --experimental-strip-types`).

Pemakaian di pipeline:

- **Tahap 4 (storyboard):** jalankan `findConcepts` untuk tiap kalimat naskah, lalu isi kolom subjek scene dengan `component`/`glb`.
- **Tahap 7:** pakai komponen tersebut. Kata yang tidak cocok dengan konsep apa pun → cari GLB dengan `audira_search_assets`. Bila tidak ada, tambah konsep baru di sini, jangan menambal dengan primitif.
- **G22 (THEME_CHECK):** isi kolom subjek dengan `reads`, lalu bandingkan dengan frame di contact sheet.

## Menambah konsep

1. Buat komponen di `science.tsx`/`sports.tsx` (atau file tema baru) dengan props `ConceptProps`. Bentuknya harus terbaca tanpa teks: siluet khas, detail penanda (urat, roda jari-jari, wajah), dan gerak kecil.
2. Daftarkan di `index.ts` dan `CONCEPTS` (kata kunci id + en, `reads`, `overrides` bila spesifik).
3. Tambah satu kartu di `ConceptsDemo.tsx`, render contact sheet, lalu cek terbaca tanpa subtitle.
4. Primitif (`sphere`, `cylinder`, `box`) boleh dipakai sebagai **bagian** bentuk yang lebih besar, tapi tidak boleh berdiri sendiri sebagai subjek.
