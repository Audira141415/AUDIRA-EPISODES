# STYLE_DECISION — Kenapa Kucing Selalu Mendarat dengan Kaki (`EP10`)

- **Tanggal:** `2026-11-25`
- **Engine:** `remotion` (Remotion 4 + React Three Fiber, 3D)
- **Style terpilih:** `ANATOMIX`
- **Alasan (awam, terkait topik):** Topiknya "apa yang terjadi di dalam tubuh kucing saat jatuh": telinga dalam, tulang punggung lentur, dan putaran badan. ANATOMIX bisa membuat kucing jadi hologram tembus pandang berwarna teal, sehingga telinga dalam (sistem vestibular) dan tulang punggungnya terlihat dan bisa diberi label, tanpa kesan sadis.
- **Hero model:** Polyfork `cat-base` (GLB rigged: Hips→Spine→Chest→Neck→Head, kaki depan/belakang, ekor; animasi Walk/Idle/Run). Tulang `Spine`/`Chest` diputar pada sumbu badan (z) untuk memperagakan putaran badan depan vs belakang; kaki depan/belakang dilipat/direntangkan.
- **Alternatif ditolak:** `CERDIK` (2D, unggulan) — tidak bisa memperlihatkan putaran 3D badan depan vs belakang dengan jelas; `PLUSHFORGE` (skor rekomendasi tertinggi 44) — kucing boneka lucu, tapi tidak punya bahasa visual "melihat ke dalam tubuh" untuk telinga dalam dan tulang punggung; `INNERWORKS` — untuk mesin/benda, bukan hewan.
- **Hukum Mutlak 5:** dari kit diambil palet teal hologram, material kaca/clearcoat, cincin hologram, HUD label dengan garis penunjuk, grade CYBER_NEON_VOID. Lingkungan mengikuti naskah: ruang tamu malam (hook & mendarat) → lab hologram (penjelasan) → ruang tamu lagi (payoff).
- **Cover referensi:** `cover-reference` = `F:/AUDIRA-ALL-SKILL/assets/style-covers/anatomix.*`
- **Cover topik:** `cover-topic.png` (dari komposisi film, frame hook) — dibuat di sesi B setelah film terpasang.
- **approved:** `yes` (style dipilih AI dan dilaporkan, aturan 2026-11-23; gerbang final pre-approved user 2026-11-25 batch 10 short otonom)

## Parameter dari motion memory (`audira_style_memory get ANATOMIX`)
- Wajib diterapkan: `<Finish profile={COLOR_PROFILES.CYBER_NEON_VOID} exposure={1} envIntensity={0.55} ao={false} background="#03141A" />` untuk adegan lab.
- Hindari (EP02 Jari Keriput, juri 3.0/3.17): GLB low-poly dengan tint flat terbaca plastik mainan. Untuk EP10: mode hologram = shader tepi bercahaya (fresnel via onBeforeCompile) + opacity ±0.3 + tulang punggung/telinga dalam bercahaya di dalamnya; mode "nyata" = vertex color asli + MeshPhysical sheen (kesan bulu) + rim light. Rigged GLB wajib `SkeletonUtils.clone`.
- Label HUD ≥ 36 px, satu kartu HUD per beat, subjek ≥ 30% lebar frame (9:16 lebar terlihat ≈ 0,28 × jarak kamera).
