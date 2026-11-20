# ART DIRECTION — EP67 Borobudur (PASIRFORGE)

## Konsep Spasial

Sebuah pahatan pasir berbentuk candi bertingkat-tingkat — evokasi Borobudur — berdiri di pantai saat golden hour. Struktur naik dari tumpukan pasir (pembangunan), utuh dengan ukiran relief di setiap sisi (puncak kejayaan), lalu terkikis dan tertimbun (dilupakan), lalu tersingkap kembali oleh ombak terakhir (penemuan Raffles). Satu objek, satu perjalanan waktu, satu pantai.

## Struktur Pahatan (PARTS adaptasi)

```
PARTS = [
  // Alas/plinth — nama AUDIRA terukir di depan
  plinth: box 3.0×0.4×3.0 y=0

  // 6 teras persegi (Kamadhatu & Rupadhatu) — mengecil ke atas
  tier1: box 2.8×0.45×2.8  y=0.4
  tier2: box 2.4×0.45×2.4  y=0.85
  tier3: box 2.0×0.45×2.0  y=1.3
  tier4: box 1.6×0.40×1.6  y=1.75
  tier5: box 1.2×0.35×1.2  y=2.15
  tier6: box 0.9×0.30×0.9  y=2.5

  // 3 teras bundar (Arupadhatu) — ellipsoid gepeng
  round1: ellipsoid r=0.7×0.18×0.7  y=2.8
  round2: ellipsoid r=0.5×0.16×0.5  y=2.98
  round3: ellipsoid r=0.35×0.14×0.35 y=3.14

  // Stupa induk di puncak
  stupa_main: ellipsoid r=0.22×0.42×0.22  y=3.28

  // Stupa kecil di teras bundar (8+16+24 total = 48, disederhanakan jadi 6 visible)
  stupa_ring: 6× ellipsoid r=0.08×0.14×0.08  y=2.82, orbiting r=0.55
]
```

## Palet

| Elemen | Warna | Keterangan |
|--------|-------|------------|
| Pasir kering pahatan | `#E6C690` / `#F3DDB0` | Batu andesit coklat-emas |
| Mineral gelap | `#5B4636` | Urat batu, noda usia |
| Pasir basah/alas | `#9F7C51` | Dasar lembab |
| Langit senja | `#47679A` → `#FFC48A` | Golden hour Jawa |
| Laut | `#24485C` / `#3D7480` | Teluk Jawa |
| HUD chip | `rgba(58,36,20,0.66)` teks `#FFF4E2` | Label stage |
| Aksen gauge | `#FFB86E` (terbentuk) / `#F07B4A` (terkikis) | Progress candi |

## Kamera — Shot Arc

| Beat | Framing | Gerakan |
|------|---------|---------|
| Hook (0-3s) | Close-up heap, f/0.9, az 42, el 20 | Static hold |
| Context (4-15s) | Plinth naik, dist 2.5 | Slow pull back |
| Main (16-45s) | Full structure, dist 8.2, az 24 | Orbit kiri 25° |
| Detail (31-45s) | Close relief tier3, dist 2.0 | Push in + tilt down |
| Erosion (46-60s) | Full eroding, dist 7.0 | Orbit kanan 20° |
| Buried (61-70s) | Low angle pantai, dist 10, el 5 | Crane up slow |
| Payoff (71-85s) | Wide golden hour, dist 11.6, az 20, el 9 | Pull back + settle |
| Outro (86-90s) | Stupa induk CU, dist 2.4 | Static |

## Overlay HUD

- Stage 1: `CANDI BOROBUDUR · TERBENTUK 0%`
- Stage 2: `CANDI BOROBUDUR · TERBENTUK 100%` → gauge penuh emas
- Stage 3: `DILUPAKAN · ABAD KE-10 M` → gauge berubah oranye-erosi
- Stage 4: `TERKIKIS 100% · TERSEMBUNYI`
- Stage 5: `1814 · RAFFLES MENEMUKAN` → gauge kembali emas
- Clock: format `WIB` (waktu produksi, dekoratif)

## Lighting

- Sun key kiri-rendah: azimuth -76°, elevation 19° → 10° (sinken selama film)
- Raking light menggarisi ukiran relief teras — ini yang membuat depth batu terbaca
- Finish: `PASIR_GRADE` ("Golden Hour Beach"), hdri="sky", envIntensity=0.4, ao=true
- Fog `#FFC48A` 40–260 (memperhalus horison pantai Jawa)

## Safe Zone (9:16 1080×1920)

- Top safe: 180px — HUD chip di y=262
- Subtitle karaoke: y=1300
- Bottom safe: 380px — tidak ada objek penting
- Semua SafeLabel dengan plate gelap (latar terang pantai)
