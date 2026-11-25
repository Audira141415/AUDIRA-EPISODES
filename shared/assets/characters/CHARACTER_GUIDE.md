# AUDIRA CHARACTER & HUMAN AVATAR SPECIFICATION

Dokumen ini mendefinisikan standar visual karakter manusia, persona host/narator, dan style guide artistik untuk seluruh produksi video motion **AUDIRA**.

---

## 1. OFFICIAL AUDIRA EDITORIAL PERSONA & HOST
* **Asset Path:** `shared/assets/characters/agus-avatar-sketch.jpg`
* **Default Credit:** `Created by AUDIRA` (Dilarang menampilkan nama personal; selalu gunakan identitas brand AUDIRA).
* **Peran Naratif:**
  1. **The Host / Anchor:** Pemandu cerita, representasi suara redaksi AUDIRA, atau analis di intro/outro.
  2. **Editorial Thought-Leader:** Muncul di samping kartu argumen, kutipan penting, atau data riset.
  3. **Human Relatability:** Memberikan sentuhan humanis, intelek, dan personal agar video tidak terasa dingin/kaku seperti robot AI belaka.

---

## 2. AESTHETIC DNA & ART DIRECTION (SKETCH & WATERCOLOR)
Gaya artistik karakter ini memadukan **fine-art sketch** dengan **watercolor wash** editorial berkelas tinggi:
- **Medium:** Arsir pensil grafit halus (*cross-hatching line-art*) dipadu sapuan cat air (*watercolor wash*) bertekstur kertas cold-press.
- **Color Palette:** Warm sepia (`#8B5E3C`), charcoal graphite (`#2B2B2B`), earthy ochre (`#D4A373`), dan muted parchment cream (`#F4EEDD`).
- **Pencahayaan:** Soft directional rim lighting, kontras garis tajam pada fitur wajah dan kacamata, tepi sketsa yang meluruh secara artistik (*feathered watercolor edges*).
- **Karakteristik Subjek:** Pria Asia intelek berkacamata bulat hitam, kumis dan janggut tipis rapi, rambut disisir ke belakang, kemeja berkerah, ekspresi bijaksana dan fokus.

---

## 3. MASTER PROMPT FORMULA (UNTUK GENERATE KARAKTER SERUPA)
Jika Claude atau sistem memproduksi karakter manusia tambahan (ahli, ilmuwan, engineer, atau pose baru host), gunakan formula prompt wajib berikut untuk menjaga konsistensi gaya:

```text
Editorial fine-art portrait illustration, intricate graphite pencil sketch with layered watercolor wash, detailed cross-hatching, textured cold-press art paper background, muted sepia, raw umber, and charcoal palette with warm skin highlights, expressive linework, vintage academic and architectural drawing aesthetic, classic Wall Street Journal hedcut meets New Yorker editorial illustration, sharp focus, 8k resolution, authentic handcrafted traditional media feel, zero 3D plastic render, anti-slop.
```

---

## 4. TATA CARA PENEMPATAN VISUAL DI FORMAT 9:16

### A. Host Narator Bubble (Kamera Melingkar)
- Ditempatkan di sudut atas (`top: 200px; right: 64px`) atau sudut bawah di atas safe-zone.
- Menggunakan class CSS: `.host-bubble` (border tipis bercahaya, circular clip).

### B. Editorial Split Card (Pembahasan Topik Utama)
- Format kartu perbandingan: Sisi kiri/atas foto sketsa karakter, sisi kanan/bawah kutipan atau statistik.
- Menggunakan class CSS: `.host-editorial-card`.

### C. Hero Full-Screen Thought (Hook / Outro)
- Gambar karakter tampil dominan dengan efek *Ken Burns slow-zoom* (menggunakan `StudioMotion.cameraDrift()`), didampingi kinetic text yang muncul bertahap (*staggerUp*).

