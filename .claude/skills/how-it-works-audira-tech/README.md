# HOW IT WORKS — AUDIRA TECH (Pro Motion Engine v2.0)

Mesin produksi video dokumenter edukasi teknik dan sains populer untuk **AUDIRA TECH**, dirancang khusus untuk membedah cara kerja mesin, semikonduktor, otomotif, elektronika, dan infrastruktur secara sinematik dengan visual 3D fotorealistik (*Exploded Views, Cutaway, X-Ray*) dan grafis overlay keteknikan (*Engineering HUD Overlays*).

---

## ⚡ Fitur Utama v2.0-audira-pro

1. **Dual Aspect Ratio Support:**
   - **Vertical 9:16 (`1080x1920`):** Dioptimalkan untuk Reels, YouTube Shorts, dan TikTok dengan aturan ketat *Safe-Zone* (menghindari blind zone UI mobile apps).
   - **Horizontal 16:9 (`1920x1080` / `3840x2160`):** Format dokumenter sinematik untuk YouTube Longform & presentasi teknik.
2. **Multi-Model AI Video Prompts:**
   - Sintaks otomatis untuk **Kling 1.5/2.0**, **Runway Gen-3/Gen-4**, **Luma Ray 2**, dan **Wan 2.1**.
   - Dilengkapi *negative prompt ledger* untuk mencegah artefak deformasi logam, teks mengambang yang rusak, dan tampilan CGI kartun.
3. **Camera Motion Doctrine (Vector Ledger):**
   - Menjamin kontinuitas momentum kamera antar shot sehingga pergantian klip tidak memicu pusing atau disorientasi spasial (*spatial whiplash*).
4. **Engineering HUD & Blueprint Overlays:**
   - Desain terpisah antara layer video 3D dan layer telemetry/HUD (garis penunjuk *leader lines*, caliper CAD, grafik RPM/Voltase, partikel arus).
5. **Toolkit Otomasi Python Lengkap (`scripts/`):**
   - `orchestrate_episode.py`: Master pipeline runner (audit naskah, generate prompt multi-engine, align subtitle, scaffold HyperFrames, dan ekspor timeline NLE). Jangan dipakai untuk episode AUDIRA (melewati layout dan gerbang).
   - `generate_prompts.py`: Format otomatis prompt video per adegan sesuai target engine (Kling, Runway, Luma, Wan 2.1).
   - `align_captions.py`: Pembuat subtitle kata-demi-kata (SRT, WebVTT, Kinetic JSON) dengan batasan safe-zone.
   - `scaffold_hyperframes.py`: Scaffold proyek HyperFrames dalam satu perintah. Bukan langkah standar: episode AUDIRA di-scaffold lewat `audira_project_layout`.
   - `export_timeline.py`: Ekspor timeline multi-format (DaVinci Resolve EDL, Final Cut Pro FCPXML, JSON).
   - `verify_episode.py`: Pengecekan otomatis kecepatan narasi (WPM) dan penyaringan frasa klise AI (*Anti-Slop*).
6. **Integrasi Tool MCP AUDIRA:**
   - Langsung terhubung dengan `audira_generate_voiceover` (Cartesia TTS) dan CLI `hyperframes`.

---

## 📂 Struktur Berkas

```
how-it-works-audira-tech/
├── SKILL.md                          # Master Instruction 12 Fase Produksi End-to-End
├── README.md                         # Dokumentasi & panduan teknis
├── references/
│   ├── visual-modes.md               # 9 mode visual teknis & arsitektur pencahayaan
│   ├── ai-video-engines.md           # Kamus sintaks prompt Kling, Runway, Luma, Wan 2.1
│   ├── camera-motion-doctrine.md     # Hukum kekekalan momentum kamera & vector ledger
│   ├── hud-technical-overlays.md     # Spesifikasi HUD, blueprint, caliper, dan safe-zones
│   ├── technical-lexicon-id.md       # Glosarium terminologi teknik otomotif & semikonduktor
│   ├── sound-design-palette.md       # Desain audio foley, sub-bass drop, dan sidechain ducking
│   └── research-checklist.md         # Hirarki sumber primer & claim ledger
├── templates/
│   ├── production-output-template.md # Template output master 14 bagian
│   ├── hyperframes-scene-template.ts # Komponen TSX/HTML modular untuk HyperFrames
│   ├── svg-hud-library.html          # Galeri 8 komponen HUD SVG & CSS interaktif
│   └── fcpxml-template.xml           # Template XML Final Cut Pro & DaVinci Resolve
├── scripts/
│   ├── orchestrate_episode.py        # Master pipeline runner (audit -> prompt -> subtitle -> NLE)
│   ├── generate_prompts.py           # CLI generator prompt AI multi-model
│   ├── align_captions.py             # Generator subtitle kata-demi-kata (SRT/VTT/JSON)
│   ├── scaffold_hyperframes.py       # Scaffolder proyek HyperFrames
│   ├── export_timeline.py            # Konverter storyboard ke DaVinci EDL & FCPXML
│   └── verify_episode.py             # Quality gate auditor (WPM pacing & Anti-Slop)
└── examples/
    └── lidar-autonomous-car/         # Paket produksi standar emas episode LiDAR Mobil Otonom
        ├── script.txt                # Naskah terverifikasi 75s (~130 WPM)
        ├── scenes.json               # Definisi 6 adegan & parameter vektor
        └── production_package/       # Output hasil orchestrate_episode.py siap pakai
```

---

## 🚀 Cara Penggunaan

### 1. Eksekusi Otomasi Penuh (1 Langkah)
```bash
python scripts/orchestrate_episode.py \
  --dir ./episodes/lidar-test \
  --script examples/lidar-autonomous-car/script.txt \
  --scenes examples/lidar-autonomous-car/scenes.json \
  --duration 75 \
  --ar 9:16
```

### 2. Penggunaan Skrip Individual

#### A. Generate Prompt Multi-Engine:
```bash
python scripts/generate_prompts.py --input scenes.json --engine all --ar 9:16
```

#### B. Generate Subtitle Sinkron Kata:
```bash
python scripts/align_captions.py --script script.txt --duration 75 --output captions
```

#### C. Scaffold Proyek HyperFrames (opsional, bukan untuk episode AUDIRA; pakai `audira_project_layout`):
```bash
python scripts/scaffold_hyperframes.py --output ./episodes/camera-ois --title "Camera OIS" --ar 9:16
```

#### D. Audit Naskah & Anti-Slop:
```bash
python scripts/verify_episode.py --script script.txt --duration 75
```

#### E. Ekspor Timeline NLE (EDL / FCPXML / JSON):
```bash
python scripts/export_timeline.py --input scenes.json --output timeline --format all --fps 60
```

---

## 🛡️ Anti-Slop Standards

Skill ini mematuhi standar **Anti-Slop AUDIRA**:
- ❌ **Dilarang keras:** Menggunakan pengantar basa-basi generik (*"Pernahkah Anda bertanya-tanya"*, *"Di era modern ini"*).
- ❌ **Dilarang keras:** Mengarang diagram sirkuit, komponen fiktif, atau klaim sains tanpa sumber resmi.
- ✅ **Wajib:** Mengawali video langsung dari teka-teki mekanis, parameter fisik nyata, dan aksi konkret.
