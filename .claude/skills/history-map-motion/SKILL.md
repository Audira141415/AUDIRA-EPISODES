---
name: history-map-motion
description: "Membangun animasi video peta sejarah, geopolitik, ekspansi teritorial, rute perang, dan batas wilayah dinamis kelas dokumenter bioskop (ala Vox Borders, Johnny Harris, Warographics, RealLifeLore). Menghasilkan visualisasi wilayah meluas/menyusut lintas abad, panah manuver militer taktis berdenyut, titik kepungan perang pincer, dan pergerakan kamera kontinental 3D. By AUDIRA (Agus Dwi R)."
license: Proprietary Commercial (AUDIRA)
metadata:
  author: AUDIRA (Agus Dwi R)
  version: "1.0.0"
  updated: "2026-11-06"
---

# History Map Motion — Geopolitical & War History Documentary Map Director

Author & Architect: **AUDIRA (Agus Dwi R)**  
Version: `1.0.0 Commercial Release`  
Engine: **Remotion + R3F** (default sejak 2026-11-17; world3d hanya bila pengguna memaksa). Target Frameworks: Remotion, React Three Fiber (3D Globe & Topo Mesh), SVG Canvas, GSAP

> **Rule 14 (rekomendasi)**: topik peta sejarah/peradaban Islam, ekspansi kekhalifahan, rute dakwah — engine = Remotion + R3F; style utama HISTORYMAP / TIMEFORGE (lihat `.agents/brain/ENGINE_STYLE_SELECTION.md`). Skill ini berlaku untuk look & technique.

---

## 1. Ikhtisar & Filosofi Visual

Skill ini dibuat untuk memproduksi video dokumenter sejarah, peta geopolitik, konflik perbatasan, migrasi peradaban, dan strategi perang dunia yang memiliki wibawa visual setara tayangan dokumenter papan atas (*Vox Borders*, *Johnny Harris*, *Kings and Generals*).

### Karakteristik Visual Utama:
1. **Multi-Layered Cartography:** Lapisan dasar peta daratan desaturasi netral (`#2D3238` atau `#E6E2D8` kertas perkamen), garis pantai tegas, serta relief pegunungan dan selat sempit strategis.
2. **Dynamic Territorial Morphing:** Batas wilayah kekaisaran atau negara yang meluas (*annexation/conquest*) atau terpecah (*dissolution*) secara mulus mengikuti perputaran tahun linimasa (*Timeline Year Scrubber*).
3. **Tactical Military Arrows:** Panah manuver pasukan dengan lengkungan kurva Bezier, garis putus-putus logistik, ujung panah berdenyut, dan titik pertempuran api (*clash flashpoints*).
4. **Cinematic Continental Camera:** Gerakan kamera melayang dari ketinggian orbit bumi, menukik tajam (*tactical dive*) ke lembah pertempuran, dengan sedikit kemiringan perspektif 3D (*tilt-angle*) untuk memperlihatkan topografi.
5. **Authoritative Archival Typography:** Tipografi judul tahun menggunakan *Old-Style Serif* monumental (Playfair Display / Cinzel / Georgia) dan label kota dengan huruf kapital berjarak renggang (*spaced tracking*).

---

## 2. Struktur Modul & Referensi

| Modul | File Referensi | Deskripsi |
| :--- | :--- | :--- |
| **Territorial Morphing** | [`references/territorial-morphing.md`](references/territorial-morphing.md) | Animasi interpolasi poligon batas wilayah negara dan teknik shading warna faksi. |
| **Military Tactical Arrows** | [`references/military-arrows.md`](references/military-arrows.md) | Desain panah invasi kurva Bezier, capit kepungan (*pincer*), dan garis suplai. |
| **Camera & Geopolitics** | [`references/camera-geopolitics.md`](references/camera-geopolitics.md) | Koreografi kamera 3D lintas benua, sudut pandang chokepoint, dan tracking medan. |
| **Map Textures & Shading** | [`references/map-textures.md`](references/map-textures.md) | Tekstur peta perkamen abad ke-16 vs peta satelit taktis modern bergaris grid. |

---

## 3. Alur Kerja Produksi Video (Workflow)

1. **Penetapan Subjek & Rentang Waktu (Era Timeline):**
   - Tentukan topik sejarah (misal: *Ekspansi Kekaisaran Romawi 27 SM - 117 M*, *Perang Dunia II Front Timur 1941-1945*, *Perjalanan Ekspedisi Jalur Sutra*, atau *Konflik Perbatasan Selat Malaka*).
   - Tentukan titik awal tahun dan tahun akhir untuk dihubungkan ke counter durasi frame Remotion.
2. **Pemetaan Faksi & Palet Warna Historis:**
   - Faksi A (cth: Kekaisaran Romawi) -> *Imperial Crimson* (`#8B0000`).
   - Faksi B (cth: Bangsa Galia / Partia) -> *Forest Moss* (`#2E5D34`) atau *Royal Gold* (`#C5A059`).
   - Wilayah Netral / Tanpa Pemilik -> Abu-abu hangat desaturasi (`#3A3E47`).
3. **Penyusunan Animasi Peta:**
   - *Scene 1 (Overview):* Peta luas memperlihatkan situasi status quo awal.
   - *Scene 2 (The Tension):* Garis perbatasan mulai menebal dan berkedip; tanda panah logistik mulai bergerak menyeberangi sungai/pegunungan.
   - *Scene 3 (The Offensive):* Panah invasi menembus wilayah lawan, warna faksi penyerang membanjiri (*color flood*) wilayah yang direbut.
   - *Scene 4 (The Aftermath):* Garis batas baru terkunci dengan cap tahun di sudut layar.
4. **Desain Tata Suara (Audio Atmosphere):**
   - Gemuruh genderang perang orkestra lambat (*deep cinematic war drums*).
   - Suara kertas perkamen tua terbuka (*paper unfold sound*).
   - Denting lonceng jam sejarah berdetak di setiap pergantian tahun.

---

## 4. Panduan Anti-Slop Sejarah (Strict Rules)

- ❌ **Dilarang:** Menampilkan peta statis tanpa animasi pergerakan kamera atau garis batas.
- ❌ **Dilarang:** Menaruh anak panah lurus kaku seperti presentasi PowerPoint kantor; panah wajib memiliki kurva dinamis bergradasi dan bayangan jatuh.
- ❌ **Dilarang:** Mengabaikan rintangan geografis nyata (pasukan tidak boleh digambarkan menembus pegunungan curam tanpa jalur celah/pass).
- ✅ **Wajib:** Selalu sertakan penunjuk tahun/tanggal di pojok layar agar penonton memiliki jangkar konteks waktu yang presisi.
- ✅ **Wajib Lolos The Mute Test:** Siapa yang menyerang, wilayah mana yang berpindah tangan, dan tahun berapa peristiwa terjadi harus jelas 100% tanpa suara.

