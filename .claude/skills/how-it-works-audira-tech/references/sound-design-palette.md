# Palet Sound Design & Akustik Dokumenter Teknik — AUDIRA TECH

Desain suara (*sound design*) adalah 50% dari dampak emosional video dokumenter teknik. Tanpa frekuensi rendah (*sub-bass*) dan *foley* mekanis presisi, visual 3D yang megah akan terasa hampa seperti animasi kartun plastik.

---

## 🎧 1. Struktur 4 Lapisan Audio (Acoustic Stems)

```
┌─────────────────────────────────────────────────────────────┐
│ LAYER 1: Master Voice-Over (135–150 WPM, Low-Mid Clarity)   │ Peak: -2 dB
├─────────────────────────────────────────────────────────────┤
│ LAYER 2: Diegetic Foley & Mechanical Sounds (Klik, Servo)   │ Peak: -8 dB
├─────────────────────────────────────────────────────────────┤
│ LAYER 3: Synthetic UI & Telemetry Data (Pings, Laser Sweeps)│ Peak: -14 dB
├─────────────────────────────────────────────────────────────┤
│ LAYER 4: Background Music & Sub-Bass Drones (Industrial)    │ Ducked to -22 dB
└─────────────────────────────────────────────────────────────┘
```

---

## 🔊 2. Spektrum Frekuensi & Resep Foley

| Kategori Suara | Rentang Frekuensi (Hz) | Kapan Digunakan | Contoh Resep Audio |
|---|---|---|---|
| **Sub-Bass Impact / Drop** | 30 Hz – 80 Hz | Saat casing mesin terbelah (Cutaway) atau beralih ke exploded view | Sine-wave sub drop 45Hz dengan tail kompresi lembut. |
| **Servo Whine / Micro-motor** | 2.5 kHz – 6 kHz | Saat aktuator optik atau gear mikroskopis berputar | Desingan halus brushless motor berkecepatan tinggi. |
| **Pneumatic / Pressure Hiss** | 4 kHz – 12 kHz | Saat katup ekspansi terbuka atau cairan pendingin menyemprot | Desis udara bertekanan tinggi dengan transient cepat. |
| **Metallic Click / Lock** | 800 Hz – 3 kHz | Saat komponen terpasang ke dalam sasis (*interlocking parts*) | Suara presisi mekanisme penutup jam tangan mewah atau baut titanium. |
| **Data Stream Telemetry** | 1 kHz – 5 kHz | Saat garis leader lines HUD menyala atau nilai RPM melonjak | Rangkaian klik digital lembut (*soft sine blips*), bukan alarm keras. |

---

## 🎚️ 3. Aturan Audio Ducking Otomatis

Ketika narator mulai berbicara:
1. **BGM Ducking:** Turunkan volume musik latar sebesar `-8 dB hingga -12 dB` dalam kurun waktu `120 ms` sebelum kata pertama diucapkan.
2. **Sidechain Compression:** Pasang sidechain compressor pada BGM track yang dipicu oleh sinyal Voice-Over (Ratio: `3:1`, Attack: `20ms`, Release: `250ms`).
3. **Foley Space:** Jangan menumpuk efek suara ledakan/sub-drop bersamaan dengan pengucapan kata kunci teknis krusial narator. Letakkan drop suara di jeda antarkalimat (`pause beats` berdurasi 0.3–0.6 detik).

