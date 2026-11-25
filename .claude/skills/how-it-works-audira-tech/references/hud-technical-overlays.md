# Technical HUD & Engineering Overlays — AUDIRA TECH

Video dokumenter teknik AUDIRA TECH menggunakan layer grafis keteknikan (Engineering HUD Overlay) di atas footage video 3D fotorealistik. Layer ini memberikan nuansa analisis sains tingkat lanjut dan memudahkan penonton memahami ukuran, material, dan fungsi bagian mesin.

---

## 📐 1. Komponen Standar Engineering HUD

Setiap episode dapat mengombinasikan elemen-elemen berikut:

### A. Leader Lines & Callout Badges
- **Struktur:** Titik pin di komponen mesin (`Pin Node`) → Garis miring 45° (`Angled Stems`) → Garis horizontal penopang teks (`Base Bracket`) → Label teks teknis.
- **Warna Standar:**
  - *Primary Blueprint:* Electric Cyan (`#00F2FE` / `rgba(0, 242, 254, 0.85)`)
  - *Accent Warning / Heat:* Radiant Amber (`#FFAA00` / `rgba(255, 170, 0, 0.9)`)
  - *Neutral Wireframe:* Ghost Slate (`#8892B0` / `rgba(136, 146, 176, 0.4)`)
- **Tipografi:** Monospace teknis (`JetBrains Mono`, `Barlow Semi Condensed`, atau `Share Tech Mono`), huruf kapital terukur, tracking lebar (`letter-spacing: 0.08em`).

### B. Caliper & Dimension Gauges (Pengukur Dimensi)
- Menampilkan ukuran fisik riil komponen (contoh: `Ø 24.5 mm`, `TOLERANCE ±0.02 µm`, `GAP 0.15 mm`).
- Animasi penunjuk caliper yang mengukur ketebalan dinding atau celah gerigi saat kamera melakukan macro close-up.

### C. Live Telemetry Readouts
- Indikator metrik fisik dinamis yang berubah sesuai simulasi:
  - Putaran mesin: `3,200 RPM`
  - Suhu termal: `+142.8 °C`
  - Tekanan fluida: `45.2 PSI` / `3.1 BAR`
  - Frekuensi gelombang: `2.4 GHz / 5.8 GHz`
- Selalu gunakan `font-variant-numeric: tabular-nums` agar angka tidak bergetar horizontal saat nilainya berubah.

### D. Flow Direction Arrows (Panah Aliran)
- Garis panah berpendar yang menunjukkan aliran:
  - Aliran arus listrik (arah elektron vs konvensional).
  - Aliran refrigeran / fluida pendingin (fase cair vs fase gas).
  - Aliran udara aerodinamis (streamlines laminar vs turbulen).

---

## 🛡️ 2. Aturan Safe Zone (Format 9:16 Vertikal)

Ketika mendesain posisi teks HUD untuk mobile short-form (Reels/Shorts/TikTok):

```
┌─────────────────────────────────┐ 0% Top
│       TOP BLIND ZONE (15%)      │ Status bar HP, Header akun, Back button
├─────────────────────────────────┤ 15% Top Safe Line
│                                 │
│                                 │
│        SAFE CONTENT AREA        │ Letakkan seluruh label teks, leader
│         (Dimensi & Teks)        │ lines, dan caliper di dalam area ini!
│                                 │
│                                 │
├─────────────────────────────────┤ 80% Bottom Safe Line
│     BOTTOM BLIND ZONE (20%)     │ Caption video, deskripsi suara, tombol Like/Share
└─────────────────────────────────┘ 100% Bottom
```

- **PENTING:** Jangan pernah menempatkan teks penting atau penunjuk dimensi di bawah `Y = 80%` atau di atas `Y = 15%`.

---

## 💻 3. Sintaks SVG / CSS Reusable untuk HyperFrames

Snippet implementasi garis penunjuk (*leader line*) dengan animasi CSS stroke-dashoffset:

```html
<svg class="hud-leader-line" viewBox="0 0 400 150" width="400" height="150">
  <defs>
    <filter id="cyan-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="#00F2FE" flood-opacity="0.8"/>
    </filter>
  </defs>
  <!-- Titik jangkar pada komponen -->
  <circle cx="20" cy="120" r="4" fill="#00F2FE" filter="url(#cyan-glow)" />
  <circle cx="20" cy="120" r="8" fill="none" stroke="#00F2FE" stroke-width="1" opacity="0.6" />
  
  <!-- Garis siku penunjuk -->
  <polyline points="20,120 100,40 320,40" 
            fill="none" 
            stroke="#00F2FE" 
            stroke-width="2" 
            filter="url(#cyan-glow)"
            stroke-dasharray="400"
            stroke-dashoffset="0" />
            
  <!-- Label Teks -->
  <text x="110" y="32" fill="#FFFFFF" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="700" letter-spacing="1">
    STATOR COIL (COPPER WIRE)
  </text>
  <text x="110" y="55" fill="#00F2FE" font-family="'JetBrains Mono', monospace" font-size="11" opacity="0.8">
    0.35 mm ENAMEL COATING
  </text>
</svg>
```

