# Technical Visual Modes Reference — HOW IT WORKS

Panduan komprehensif pemilihan mode visual untuk membedah sistem keteknikan dan mekanika mesin secara sinematik dan akurat.

---

## 🔬 1. Matriks 9 Mode Visual

| Mode | Kapan Digunakan | Framing & Kamera Khas | Rekomendasi HUD Overlay | Peringatan Akurasi & Anti-Slop |
|---|---|---|---|---|
| **01. Real-World Operation** | Menampilkan konteks operasional di dunia nyata | Medium / wide cinematic shot, dynamic tracking | Konteks lokasi, indikator status operasional | Jangan menampilkan skenario penggunaan yang tidak realistis atau di luar spesifikasi alat. |
| **02. Exploded View** | Menunjukkan perakitan, sub-komponen, dan hubungan antar bagian | 3/4 isometric orbit, komponen mekar terpisah di udara secara sinkron | Label penunjuk komponen, garis sumbu perakitan (CAD leader lines) | Jangan mengarang urutan perakitan atau orientasi baut/pin yang berlawanan dengan manual pabrik. |
| **03. Cutaway (Bidikan Terbelah)** | Menampilkan isi dalam tanpa menghilangkan siluet luar | 3/4 profile shot, bidang luar bergeser atau menjadi kaca tembus pandang | Arsiran bidang potong (cross-hatch), indikator ketebalan dinding | Dinding casing dan ruang kosong harus memiliki rasio dimensi yang presisi sesuai teardown asli. |
| **04. Cross-Section (Penampang Melintang)** | Menampilkan saluran fluida, lapisan sirkuit, atau piston | Orthographic 2D/3D cut plane, gerakan kamera sliding horizontal | Indikator dimensi, skala milimeter/mikron, arah aliran fluida (vektor panah) | Jaga bidang potong tetap datar; jangan biarkan komponen bergeser dari sumbu aslinya. |
| **05. Macro Mechanism** | Menyorot gerigi, katup, kristal kuarsa, atau aktuator kecil | Extreme close-up (macro lens), shallow depth of field, slow-motion tracking | Indikator RPM, suhu gesekan, garis kontak antar-gigi | Gerakan mekanis harus mematuhi rasio putaran roda gigi (*gear ratio*) dan arah putaran yang benar. |
| **06. Microscopic / Electron Scale** | Menjelaskan gerak foton, elektron gerbang semikonduktor, atau kisi kristal | Transisi plunge dari makro ke mikroskopis, partikel berenergi | Skala nanometer/pikometer, label elektron/foton, kisi atomik | Berikan label eksplisit bahwa ini adalah representasi visual skematis, bukan penampakan optik nyata. |
| **07. Scientific Simulation** | Menampilkan panas (termal), gelombang suara, medan elektromagnetik, stres material | False-color heatmap gradient, vector field lines yang bergerak dinamis | Skala suhu (°C), grafik gelombang frekuensi (Hz), stres bar (MPa) | Skala warna termal harus konsisten (biru = dingin, merah/putih = panas ekstrem). |
| **08. System & Environmental Network** | Menjelaskan keterikatan alat dengan jaringan listrik, satelit, atau cloud | Wide satellite bird's eye view, garis data bercahaya menghubungkan node | Node ID, latensi (ms), diagram topologi jaringan | Jangan menggambarkan transmisi data nirkabel sebagai sinar laser fisik yang membakar. |
| **09. Schematic / Blueprint Diagram** | Menyederhanakan alur logika sirkuit, pipa hidrolik, atau algoritma kontrol | Flat orthographic blueprint grid (Cyan/Dark Blue), garis vektor bersih | Simbol standar IEEE/ISO sirkuit, diagram alir blok | Simbol logika dan arah dioda/katup harus mematuhi standar internasional. |

---

## 🧭 2. Checklist Kontinuitas Visual

Sebelum melangkah ke pembuatan prompt video AI, pastikan seluruh adegan memenuhi aturan kontinuitas:

- [ ] **Identitas Subjek Konsisten:** Warna cat, finishing material (anodized aluminum, matte polycarbonate, polished steel), dan proporsi tetap identik antar shot.
- [ ] **Sumbu Putaran Konsisten:** Jika kipas turbin berputar searah jarum jam pada Scene 02, arah tersebut tidak boleh terbalik pada Scene 03.
- [ ] **Jangkar Spasial (Spatial Anchoring):** Komponen inti yang sedang dibedah tetap berada dalam sepertiga tengah frame (*center focal point*).
- [ ] **Transisi Skala Bertahap:** Jangan melompat langsung dari pandangan satelit ke elektron silikon dalam 1 cut tanpa bidikan transisi perantara (World → Device → Microchip → Silicon Lattice).

---

## 🎨 3. Palet Material & Pencahayaan Standar AUDIRA TECH

- **Lighting Direction:** Studio Three-Point Lighting dengan aksen **Electric Blue Rim Light** (`#00F2FE`) dan **Cyan Fill** (`#4FACFE`) pada latar belakang gelap netral (`#0A0D14`).
- **Surface Shaders:**
  - *Industrial Metal:* PBR Brushed titanium atau anodized aluminum dengan micro-scratches halus.
  - *Internal Optics:* Glass transparan dengan dispersion kromatik halus dan anti-reflective coating tipis berwarna ungu kehijauan.
  - *Fluids & Energy:* Partikel self-illuminated dengan falloff halus (bukan over-exposed bloom).

