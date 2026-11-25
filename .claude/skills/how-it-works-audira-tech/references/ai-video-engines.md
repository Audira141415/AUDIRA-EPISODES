# AI Video Engine Prompting Reference — AUDIRA TECH

Panduan sintaks dan parameter prompt untuk model AI Video generasi terbaru. Setiap generator memiliki cara pemahaman teks dan kontrol kamera yang berbeda.

---

## 🚀 1. Kling (v1.5 / v2.0)

Kling sangat kuat dalam akurasi mekanis, tekstur logam fotorealistik, dan kepatuhan terhadap kontrol kamera eksplisit.

### Formula Prompt:
```
[Shot Type & Camera Movement], [Subject Definition & Specific Mechanical Components], [Mechanical Action & Causal Motion], [Internal Visibility: Cutaway/Exploded/X-Ray], [Lighting & Atmosphere], 3D photorealistic scientific documentary, 8k resolution, highly detailed engineering model, physically based rendering --neg [Negative Prompts]
```

### Keyword Kamera Efektif:
- `Slow orbital camera rotation around the subject, 360-degree continuous movement`
- `Macro probe lens moving forward into the housing`
- `Smooth crane down, maintaining center focus on the spinning shaft`
- `Dolly zoom effect expanding internal components`

### Parameter Teknis:
- **Aspect Ratio:** `--ar 9:16` (untuk Shorts/Reels) atau `--ar 16:9` (untuk YouTube/Landscape).
- **Camera Movement:** Pilih preset *Horizontal Orbit*, *Zoom In*, atau *Vertical Pan* via slider Kling bila menggunakan Web GUI.
- **Negative Prompt Wajib:**
  `blurry, distorted geometry, cartoon, CGI plastic look, melted metal, extra unconnected gears, random glitching, watermark, low resolution, unreadable floating text.`

---

## 🎬 2. Runway (Gen-3 Alpha / Gen-4)

Runway merespons deskripsi kinematik dengan struktur berurutan: **[Camera] + [Subject] + [Motion] + [Lighting]**.

### Formula Prompt:
```
Camera: Macro probe tracking shot moving smoothly forward into the mechanism.
Subject: Cross-section cutaway view of an automotive dual-clutch transmission.
Motion: Interlocking titanium gears smoothly rotating in opposite directions, hydraulic fluid visibly flowing through precision channels with realistic viscosity.
Lighting & Style: Clean studio commercial lighting, deep dark slate gray background with subtle cyan rim lighting, photorealistic industrial design, 8k octane render look.
```

### Camera Motion Directives:
- `Camera zooms steadily forward past the outer casing into the interior core.`
- `Slow pan from left to right following the motion of the piston stroke.`
- `Static orthographic camera, zero shake, technical precision.`

---

## ⚡ 3. Luma Dream Machine / Ray 2

Luma Ray 2 unggul dalam simulasi pencahayaan fisik dinamis (*ray-traced global illumination*), pantulan kaca optik, dan partikel fluida mikro.

### Formula Prompt:
```
Cinematic documentary close-up of a smartphone optical image stabilization module. Four miniature electromagnetic coils micro-vibrating with extreme precision, suspending the central camera sensor in real-time. Lens assembly suspended on micro ball-bearings. Studio studio rim-lit environment, brushed magnesium alloy surfaces, chromatic reflections on glass elements. Smooth gliding camera movement, photorealistic 3D visualization.
```

### Keunggulan & Tips Luma:
- Luma memahami kata-kata pencahayaan dengan sangat baik: `subsurface scattering`, `volumetric light rays`, `specular highlights on chrome`.
- Hindari gerakan kamera yang terlalu cepat dalam prompt teks; gunakan kata `slow, deliberate, stabilized floating motion`.

---

## 🌐 4. Wan 2.1 (Open Video Model)

Model open-source mutakhir dari Wan AI yang sangat patuh terhadap prompt teks teknis dan deskripsi urutan fisika.

### Formula Prompt:
```
A technical exploded-view animation of a lithium-ion battery cell. The cylindrical aluminum casing splits open outward in slow motion. Inside, the tightly wound spiral layers of cathode, separator membrane, and anode unroll in suspended animation. Microscopic lithium ions depicted as glowing blue energy spheres migrating through the porous separator. Dark industrial background, sharp directional key light, engineering documentary style, high definition.
```

---

## 🖼️ 5. Midjourney v6/v7 → Image-to-Video (I2V) Pipeline

Untuk kontinuitas terbaik, alur kerja **Image-to-Video (I2V)** adalah standar industri tertinggi:
1. **Langkah 1 (Keyframe Generation):** Generate gambar diam berkualitas master di Midjourney dengan komposisi eksplisit:
   ```
   A photorealistic 3D engineering exploded view of [Machine/Object], isolated components suspended in air with assembly order, brushed metal and clear glass materials, studio lighting on deep navy background, technical documentary render, 8k, Octane Render --ar 9:16 --v 6.1 --style raw
   ```
2. **Langkah 2 (Video Generation via I2V):** Masukkan gambar hasil render Midjourney ke Kling / Runway / Luma / Wan 2.1 sebagai *First Frame* (Start Image).
3. **Langkah 3 (Motion Prompt):** Berikan prompt gerakan murni:
   ```
   The suspended components slowly move inward, smoothly interlocking and assembling into the finished device. Internal gears begin rotating. Smooth camera orbit 45 degrees.
   ```

---

## 🚫 6. Universal Negative Constraint Ledger

Setiap prompt yang di-generate wajib menyertakan atau mempertimbangkan *negative constraints* berikut:

```
text, typography, watermark, logo, subtitles, blurry, deformed components, non-functional fantasy machinery, magic aura, anime, cartoon, oversaturated colors, shaking camera, jerky motion, flickering artifacts, low poly, deformed hands, people walking in background.
```
*(Catatan: Semua teks HUD, dimensi milimeter, dan nama komponen dibuat di layer terpisah pada tahap editing HyperFrames/After Effects, bukan di dalam render AI).*

