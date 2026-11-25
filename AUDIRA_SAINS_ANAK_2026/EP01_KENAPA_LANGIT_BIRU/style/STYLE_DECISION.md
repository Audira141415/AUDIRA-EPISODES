# STYLE_DECISION — Kenapa Langit Biru (`EP01`)

Style: WORLDFORGE

- **Tanggal:** `2026-11-23`
- **Engine:** Remotion + R3F (3D, tier full3d), proyek di `project/` (starter, kit `src/kits/worldforge` sudah ada di starter)
- **Style terpilih:** `WORLDFORGE` (style unggulan paket resmi)
- **Alasan (awam, terkait topik):** Subjek video adalah langit itu sendiri. WORLDFORGE membangun dunia luar ruang 3D dengan kubah langit, matahari, dan medan, dan kit-nya punya referensi build Mars. Senja Bumi, senja biru Mars, dan lintasan sinar di atmosfer bisa tampil sebagai tempat nyata. Adegan skala molekul memakai komponen `core/concepts` (`SunDisc`, `LightBeam`, `WaveRibbon`, `AirMolecule`, `ScatterBurst`) dengan cahaya dan grade WORLDFORGE.
- **Alternatif ditolak:**
  - `GLASSCRAFT`: cocok untuk prisma, tapi latarnya void hitam (berlawanan dengan langit biru terang) dan skor juri terakhir 3.33.
  - `NANOFORGE`: cocok untuk skala molekul, tapi latar gelap dan tidak bisa menampilkan langit dan senja.
- **Cover referensi:** `F:/AUDIRA-ALL-SKILL/assets/style-covers/` (worldforge)
- **Cover topik:** `cover-topic.png` (belum dibuat; dari komposisi film, frame hook)
- **approved:** `no` (gerbang acc hanya sebelum render final, keputusan pengguna 2026-11-23)

## Parameter dari motion memory (`audira_style_memory get WORLDFORGE`)
- Parameter terbaik: Finish `DOCUMENTARY_WARM`, exposure 1, envIntensity 0.55, ao, `hdri="sky"`.
- Wajib: lanskap 9:16 kamera 3/4 elevasi ±29°, horizon y≈630, subjek FG mengisi lebar; langit gelap/badai pakai env dari shader langit via PMREM.
- Hindari (EP47): teks di langit terang tanpa panel gelap (pakai kartu `rgba(20,14,12,0.82)`), label MONO < 34 px, subjek kecil di kamera lebar, ToyPerson + rumput datar terbaca plastik.
