---
name: berita-explained-standard
description: "⛔ RULE 15 (aturan mati): konten berita/explained/politik/hukum/bencana atau channel EXPLAINED — standar visual berita wajib. DILARANG tampilkan wajah orang nyata dan logo organisasi nyata. Gunakan name plate dan teks saja. Style default DATAPHYSICAL. Angka on-screen wajib cocok source register. Netralitas visual wajib. HUD chip ≥ 128px."
---

# Berita & Explained Visual Standard — Rule 15

> **ATURAN MATI** — ditetapkan oleh Agus Dwi R.

## Kapan berlaku

- Channel `EXPLAINED` (`@AudiraExplained`)
- Topik berita, politik, hukum, bencana, krisis
- Episode yang membahas orang nyata, organisasi nyata, atau peristiwa aktual

## Larangan visual (harga mati)

1. **DILARANG menampilkan wajah orang nyata** — gunakan name plate (papan nama) dengan teks nama + jabatan
2. **DILARANG menampilkan logo organisasi nyata** — gunakan teks nama organisasi saja
3. **Netralitas visual wajib** — tidak ada framing yang menghakimi, tidak ada warna emosional (merah = marah, dll.) pada subjek

## Standar teknis

| Aspek | Ketentuan |
|---|---|
| Style default | DATAPHYSICAL |
| Angka on-screen | Wajib cocok `research/SOURCE_REGISTER.md` |
| HUD chip | ≥ 128px tinggi |
| Tipografi | Jelas, kontras tinggi, sans-serif |
| Sumber | Setiap angka/fakta harus ada di source register (HIGH/MED) |

## Representasi orang

- **Name plate**: kotak gelap/terang dengan nama + jabatan, tanpa foto
- **Siluet generik**: bila perlu menunjukkan orang, gunakan siluet tanpa fitur wajah
- **Figur 3D generik**: kepala bulat tanpa detail wajah, label nama di papan

## Representasi organisasi

- **Teks saja**: "Kementerian Kesehatan" bukan logo Kemenkes
- **Bangunan generik**: gedung tanpa detail arsitektur spesifik
- **Ikon generik**: ikon kategori (pengadilan, rumah sakit, dll.), bukan logo

## Engine

Mengikuti default: world3d (kecuali rule 13/14 berlaku untuk topik spesifik).

## Hubungan dengan skill lain

- `audira-motion`: berlaku penuh
- `cinematic-fact-shorts`: kompatibel, tambahkan constraint rule 15
- `history-map-motion`: kompatibel untuk peta berita
- Style DATAPHYSICAL dari `kits/DATAPHYSICAL/KIT.md` adalah default
