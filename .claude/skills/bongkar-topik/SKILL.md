---
name: bongkar-topik
description: "Format video AUDIRA untuk membedah/membongkar topik sehari-hari — mengupas lapisan tersembunyi dari benda, tempat, atau fenomena yang sudah familiar. 'Kamu pikir X sederhana, padahal...'"
version: "1.0.0"
author: "AUDIRA (Agus Dwi R)"
website: "https://audira.my.id/"
license: "Proprietary Commercial"
category: "topic-dissection"
engine: "Remotion + R3F (default)"
trigger: "Gunakan skill ini saat pengguna minta 'bongkar topik', 'kupas', 'bedah', 'apa yang tersembunyi di balik X', atau 'fakta yang tidak kamu tahu tentang X'"
---

# BONGKAR TOPIK — Format Pembedahan Topik AUDIRA

Format short-form video yang mengambil objek/tempat/fenomena sehari-hari yang sudah familiar, lalu mengupas lapisan tersembunyinya secara visual dan naratif — dari permukaan yang terlihat sederhana hingga mekanisme tersembunyi yang mengejutkan.

## Filosofi Format

**"Familiar → Surprising → Revelation"**

Penonton tahu X. Mereka pikir mereka paham X. Tapi video ini membuktikan bahwa di balik X ada Y yang tidak pernah mereka sadari. Momen "ternyata..." adalah payoff utama.

## Struktur Naratif 5 Lapisan (Wajib)

```
Lapisan 0 — HOOK (0–3 dtk):
  Tampilkan X seperti biasa. Lalu satu gerakan mengejutkan membuka/merobek/membongkarnya.
  Template: "Di balik [objek familiar ini], ada [rahasia mengejutkan]."
  DILARANG: "Pernahkah kamu bertanya-tanya..." / "Di era modern ini..."

Lapisan 1 — SURFACE (3–12 dtk):
  Apa yang semua orang lihat. Visual: X dari luar, tampak normal.
  Fungsi: anchor penonton dengan familiar, lalu tancapkan pertanyaan.

Lapisan 2 — PEEL (12–30 dtk):
  Kupas lapisan pertama. Reveal mekanisme/komponen yang tidak terlihat.
  Visual: X-ray, cross-section, exploded view, layer terpisah.
  Narasi: Fakta pertama yang mengejutkan.

Lapisan 3 — MECHANISM (30–60 dtk):
  Cara kerja/komponen utama tersembunyi. 2–3 fakta dengan data konkret.
  Visual: Kinetic HUD callout untuk setiap angka/tahun/fakta kunci.
  WAJIB: Setiap angka (misal "20 km kabel", "1.200 kg beton") = Card Grafis muncul.

Lapisan 4 — CORE REVELATION (60–80 dtk):
  Fakta terdalam / paling mengejutkan. "Ternyata..." momen.
  Visual: Hero shot dengan semua lapisan terlihat sekaligus (exploded view).

Lapisan 5 — OUTRO AUDIRA (80–90 dtk):
  1 kalimat penutup tajam + audira-outro-card.svg.
  Hook untuk episode berikutnya.
```

## Topik Yang Cocok

Format ini bekerja untuk topik sehari-hari yang terlihat simpel tapi punya kompleksitas tersembunyi:
- **Objek fisik**: rumah, dinding, jembatan, ban, baterai HP, nasi, kunci
- **Tempat**: mal, bandara, dapur, kamar mandi, jalan raya
- **Proses**: tidur, minum air, naik lift, mandi
- **Sistem**: internet (EP31), listrik PLN, air PDAM

## Visual DNA — Bongkar Topik

### Hook Visual (0–3 dtk)
- Objek tampil normal 1–2 frame, lalu CRACK/SLICE/PEEL — terbelah, terkelupas, atau X-ray reveal.
- Efek favorit: flash cut ke cross-section, kamera zoom cepat menembus dinding, layer terpisah satu per satu.

### Layer Reveal System
Setiap "lapisan" yang dibongkar muncul secara sequential:
```tsx
// Contoh layer reveal timing
{t < 90 && <FullObjectView />}         // 0-3s: tampak normal
{t >= 90 && t < 180 && <XRayView />}   // 3-6s: X-ray mode aktif
{t >= 180 && <ExplodedView layer={1} />} // 6s+: lapisan terpisah
```

### Kinetic Data Callout (WAJIB untuk setiap angka)
```tsx
// Setiap kali VO menyebut angka → Card muncul
<DataCallout
  value="20 km"
  label="KABEL LISTRIK"
  sublabel="tersembunyi di dinding rumah biasa"
  style={{ position: 'absolute', top: 480, left: 60 }}
/>
```

### X-Ray / Cross-Section Material
- Dinding: gunakan material semi-transparan (opacity 0.3–0.5) untuk lapisan luar, solid untuk lapisan dalam
- Exploded view: `position.lerp()` per lapisan berdasarkan frame
- Warna lapisan: Setiap lapisan punya warna unik untuk identitas visual

## Checklist Naskah Bongkar Topik

- [ ] Hook 0–3 dtk: visual shock + 1 kalimat pemancing
- [ ] Minimal 3 fakta tersembunyi yang mengejutkan
- [ ] Minimal 3 angka konkret → wajib HUD callout
- [ ] 1 "momen ternyata" di lapisan 4
- [ ] Referensi sumber di SOURCE_REGISTER.md
- [ ] 195–210 kata, 135–150 WPM
- [ ] Multi-scene: minimal 4 adegan visual berbeda

## Anti-Slop Rules Khusus

- DILARANG: hook generik "pernahkah kamu bertanya-tanya"
- DILARANG: satu shot statis sepanjang video
- DILARANG: fakta tanpa angka konkret (bukan "banyak kabel" tapi "20 km kabel")
- WAJIB: setiap babak narasi → visual berganti total
- WAJIB: angka dan data = kinetic HUD callout, bukan teks subtitle saja
