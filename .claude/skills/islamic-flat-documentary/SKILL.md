---
name: islamic-flat-documentary
description: "Animasi dokumenter flat 2D/2.5D sinematik bertema sejarah peradaban Islam, kisah nabi, sains era keemasan Islam, narasi kebudayaan Islam. Arabesque Girih, siluet kubah & menara, palet gurun emas & lapis lazuli, adab visual tanpa wajah. Engine Remotion: R3F default (rule 14), Remotion 2D flat bila AI memilih 2D. By AUDIRA (Agus Dwi R)."
license: Proprietary Commercial (AUDIRA)
metadata:
  author: AUDIRA (Agus Dwi R)
  version: "1.0.0"
  updated: "2026-11-06"
---

# Islamic Flat Documentary — Folk Islam & Islamic Golden Age Motion Director

Author & Architect: **AUDIRA (Agus Dwi R)**  
Version: `1.0.0 Commercial Release`  
Target Frameworks: Remotion + React Three Fiber (default, rule 14) atau Remotion 2D + SVG; gerak dari `useCurrentFrame`, bukan GSAP / CSS Keyframes (keduanya hanya di HyperFrames)  
Format: 1080×1920 (9:16) @ 60 fps, safe zone atas 180 px dan bawah 380 px

---

## 1. Ikhtisar & Filosofi Visual

Skill ini dirancang secara khusus untuk menghasilkan video dokumenter animasi berkelas internasional yang mengangkat sejarah peradaban Islam, perkembangan sains Abbasiyah/Andalusia, hikmah dakwah para rasul dan sahabat, serta sejarah Islam Nusantara.

Gaya visual ini memadukan **desain flat vector modern non-slop** (seperti standar Vox / Kurzgesagt) dengan **keagungan seni geometris Islam (Arabesque / Girih tiles)** yang kaya makna estetika dan spiritual.

### Karakteristik Visual Utama:
1. **Sacred Geometric Arabesque (Pola Girih):** Pola bintang 8, 12, atau 16 bersegi simetris yang berputar anggun sebagai transisi babak dan bingkai ornamen.
2. **Archival Architectural Silhouettes:** Siluet bersih kubah muqarnas, menara masjid bertingkat, gapura lengkung tapal kuda (*horseshoe arch*), lentera tembaga minyak, dan hamparan gurun pasir bergelombang.
3. **Strict Adab & Honorific Visuals:** Mematuhi etika visual Islam yang luhur (sama sekali tidak menggambar fisik wajah Nabi dan Sahabat utama). Tokoh suci digambarkan secara simbolis dengan pendaran cahaya (*nur* keemasan), bayangan siluet jubah agung dari belakang, atau pena bulu kaligrafi yang menulis di atas gulungan naskah.
4. **Rich Historical Palette:** Warna Lapis Lazuli Biru Lautan Dalam (`#1A365D`), Hijau Zamrud Khalifah (`#0F4C3A`), Pasir Gurun Hangat (`#E6D5AC`), Emas Kerajaan Murni (`#D4AF37`), dan Merah Bata Cinnabar (`#9B2C2C`).
5. **Calligraphic & Serif Titles:** Tipografi Arab aksen berwibawa (gaya Kufi / Thuluth) dipadukan dengan tipografi Latin editorial berjarak tegas (*clean serif headings*).

---

## 2. Struktur Modul & Referensi

| Modul | File Referensi | Deskripsi |
| :--- | :--- | :--- |
| **Arabesque Geometry** | [`references/arabesque-geometry.md`](references/arabesque-geometry.md) | Rumus matematis pembuatan pola bintang 8 & mozaik girih prosedural. |
| **Historical Adab Visuals**| [`references/historical-adab-visuals.md`](references/historical-adab-visuals.md) | Pedoman etika visual penggambaran tokoh sejarah Islam dan metafora terhormat. |
| **Palette & Materials** | [`references/palette-and-materials.md`](references/palette-and-materials.md) | Token warna peradaban Islam, tekstur kertas papirus tua, dan tinta emas. |
| **Audio & Atmosphere** | [`references/audio-atmosphere.md`](references/audio-atmosphere.md) | Panduan musik instrumen oud, rebana, deru angin padang pasir, dan vokal nasyid tenang. |

---

## 3. Alur Kerja Produksi Video (Workflow)

1. **Riset Naskah & Verifikasi Sumber Sejarah:**
   - Pastikan teks narasi merujuk pada fakta sejarah Islam yang shahih/terpercaya (nama tokoh, tahun Hijriyah / Masehi, kitab rujukan).
2. **Penentuan Adegan & Storyboard Simbolis:**
   - *Scene 1 (Pembuka):* Pola Arabesque emas berputar di tengah latar belakang biru lapis lazuli; judul naskah muncul dengan tinta emas.
   - *Scene 2 (Latar Tempat):* Panorama gurun pasir saat senja dengan siluet unta kafilah dagang atau perpustakaan Baitul Hikmah.
   - *Scene 3 (Puncak Peristiwa/Hikmah):* Gulungan perkamen terbuka, tinta menetes membentuk tulisan, atau pendaran cahaya suci menerangi kegelapan.
   - *Scene 4 (Penutup):* Kutipan pesan moral/firman/hadits dengan frame ornamen tapal kuda dan jam pasir waktu.
3. **Pengaturan Desain Suara (Audio Ambience):**
   - Petikan senar oud akustik tunggal yang hening dan syahdu.
   - Denting lonceng karavan kafilah di kejauhan.
   - Suara goresan pena bulu di atas kertas perkamen.
   - Pematuhan standar siaran **EBU R128 (-14 LUFS)**.

---

## 4. Panduan Anti-Slop (Strict Rules)

- ❌ **Dilarang Keras:** Menampilkan gambar wajah karikatur Nabi atau Sahabat utama Rasulullah.
- ❌ **Dilarang:** Memakai musik disko / beat elektronik keras yang merusak kekhusyukan dan kemuliaan narasi sejarah.
- ❌ **Dilarang:** Menggunakan ilustrasi klise murahan (clipart masjid kartun generik tanpa cita rasa seni tinggi).
- ✅ **Wajib:** Mengutamakan keindahan tipografi naskah, estetika geometri simetris, dan atmosfer sinematik yang menggetarkan hati.
- ✅ **Wajib Lolos The Mute Test:** Setiap dalil, nama peristiwa, tahun, dan kutipan teks harus tersaji dengan keterbacaan 100% tanpa memerlukan suara.

