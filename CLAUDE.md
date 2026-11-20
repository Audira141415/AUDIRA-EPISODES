# AUDIRA Episodes Workspace (CLAUDE.md)

Master directive resmi di: [`F:\AUDIRA-ALL-SKILL\.agents\rules\00_audira_master_directive.md`](file:///f:/AUDIRA-ALL-SKILL/.agents/rules/00_audira_master_directive.md).

## Aturan Utama Produksi Video di Folder Ini:

1. **Dual Engine (2D / 3D) — Bebas & Fleksibel**:
   - **2D Motion Graphic (Remotion 2D / HyperFrames)**: Sangat direkomendasikan untuk explainer, berita, infografis data, kutipan, dan edukasi konsep. Visual konkret (ilustrasi bertingkat BG/MG/FG, foto cutout, teks kinetik per kata, diagram, peta). Dilarang visual kosong atau statis.
   - **3D Motion (Remotion + R3F)**: Objek utama **WAJIB model fisik nyata (.glb)** yang di-load dari katalog lokal `E:/ASET/ASSET-AUDIRA/downloads/glb/` (tersedia 3.288+ aset GLB siap pakai: building, vehicle, animal, character, terrain, props) via `<useGLTF />` atau `<AssetModel />`. **DILARANG KERAS** membuat partikel matematika titik (`Points`), garis acak (`LineSegments`), atau kubus melayang polos (`<boxGeometry>`) sebagai visual utama adegan!

2. **Hukum Keselarasan Visual-Narasi & Multi-Scene (Wajib Mutlak)**:
   - **DILARANG SCENE MONOLITIK**: Dilarang membiarkan 1 objek yang sama berada di layar sepanjang seluruh durasi video (statis) sementara narasi berganti topik, meskipun kamera berputar!
   - **MINIMAL 4–6 ADEGAN BERBEDA**: Setiap video 60–90 detik WAJIB terdiri dari minimal 4 hingga 6 adegan visual yang berbeda (Multi-Scene) yang berganti setiap 10–20 detik mengikuti alur naskah. Objek visual utama di layar WAJIB BERGANTI ATAU BERTRANSFORMASI TOTAL mencerminkan apa yang sedang diucapkan narator (misal: struktur batu ➔ teras arca ➔ letusan gunung/abu ➔ penemuan/restorasi puzzle ➔ golden sunrise).
   - **KINETIC HUD CALLOUT**: Layar TIDAK BOLEH hanya menampilkan teks subtitle putih berjalan di bawah. Setiap kali narator menyebutkan angka metrik, tahun, atau fakta kunci, WAJIB muncul Card Grafis / Callout Kinetik / Infografis Data di area tengah/atas layar.
   - **KIT STYLE BUKAN JEBAKAN LINGKUNGAN**: Style kit adalah resep shader dan pencahayaan, bukan memenjarakan video ke background statis default kit (contoh: dilarang memaksakan pantai berombak untuk candi pegunungan).

3. **Pipeline Produksi 11 Tahap**:
   - Selalu ikuti 11 tahap di `00_audira_master_directive.md`.
   - Catat progres di `STATUS.json` per episode via MCP `audira_episode_status`.
   - Naskah 195–210 kata (80–92 detik, master clock Cartesia VO).
   - Format: Vertikal 9:16 (1080×1920), 60 FPS render final.
   - Safe zone: Top 236px bersih, subtitle karaoke di $y=1300$, bottom 380px bersih untuk UI media sosial.
