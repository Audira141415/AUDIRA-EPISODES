# STYLE_DECISION — Musa dan Api di Bukit Thur (`EP45`)

Style: PAPERWORLD

- **Tanggal:** `2026-11-24`
- **Engine:** Remotion + R3F (3D), kit `paperworld` (Stage, Cut, ShearPop, PaperTree, PaperHill) + GLB nyata untuk ternak/api/semak
- **Style terpilih:** `PAPERWORLD`
- **Alasan (awam, terkait topik):** Kisah ini terjadi pada satu malam gelap di gurun dan gunung. Diorama kertas berlapis yang diterangi satu sumber api memberi cahaya hangat menembus lapisan kertas, bayangan panjang, dan siluet tokoh tanpa wajah. Adab (Musa tanpa wajah, panggilan Allah hanya berupa cahaya) mudah dijaga karena tokoh kertas dibuat siluet dari belakang.
- **Alternatif ditolak:**
  - `CHRONICLE` (2D siluet, juri 3,87): kuat untuk siluet tanpa wajah, tetapi memori mencatat material 2D datar (material 3) dan cahaya berarah sulit di 2D. Kisah ini butuh cahaya api sebagai subjek utama.
  - `HD2D` (juri 3,83): diorama tilt-shift cocok, tetapi bukan style unggulan dan belum punya kit episode Islam; cahaya pixel kurang cocok untuk nuansa sakral.
  - `ISLAMICDOCUMENTARY`: juri 3,67 dua episode terakhir (komposisi 3), lemah untuk beat abstrak tanpa figur.
- **Cover referensi:** `cover-reference.jpg` (quality-bar PAPERWORLD)
- **Cover topik:** `cover-topic.png`, dirender di Sesi B tepat setelah scaffold (frame hook: api di lereng, keluarga kecil di kaki bukit)
- **approved:** `no` (gerbang satu-satunya = render final, tahap 9)

## Parameter dari motion memory (`audira_style_memory get PAPERWORLD`)
- **Wajib diterapkan:**
  - Finish/Stage grade `DOCUMENTARY_WARM`. Latar malam gelap: exposure mulai 0,9–1,0 (bukan 0,82 latar terang), envIntensity 0,25, AO on.
  - Bayangan jatuh panjang searah dari api (key light bermotivasi), rim highlight, pool cahaya per adegan (juri Sentinel: lighting 3 tanpa ini).
  - FG DOF plane (semak/kartu blur) di sudut bawah tiap adegan; satu pita haze hanya antara BG dan MG, tidak di tanah dekat.
  - Tiap figur kertas: lipatan, tepi potong pucat, serat (bukan kerucut halus = clay/plastik, EP07 Battuta).
  - Variasi skala shot per beat (wide, close-up tangan/terompah, low-angle), bukan template kartu atas + diorama tengah + caption bawah (EP60 komposisi 3).
  - Glyph/simbol besar sebagai path, bukan `<text>` bertumpuk. Label ≥ 40 px, di dalam x 60–1020, tidak di atas plate caption.
  - Tiap adegan set berbeda (G22: subjek di layar = kata VO), 6–7 adegan.
- **Parameter terbaik:** finishProfile DOCUMENTARY_WARM, envIntensity 0.25, ao true, dofBlur ≈ 9 px, sceneCount 7, gold `kits/paperworld/gold/short-baru-11-23-EP18` (juri final 4,17).
- **Hindari:** palet teal/hijau gelap keruh (EP06), bagian mesin/objek halus terbaca plastik, plakat kosong saat VO sebut surah, hard cut antar diorama terpisah tanpa objek pembawa (motion 3). Self-score PAPERWORLD cenderung +0,5 di atas juri.
