# ART_DIRECTION — Cara Kerja Vaksin (EP33)

Style: NANOFORGE

- **Engine:** Remotion + React Three Fiber, `project/src/scenes/vaksin/Vaksin3D.tsx` (komposisi `VaksinPreview` 540×960@30, `VaksinFinal` 1080×1920@60). Render silent; VO + SFX di-mix dengan ffmpeg.
- **Dunia:** skala mikroskopis basah di dalam tubuh. Latar `microscopyVoid` (hitam kebiruan) dengan kabut, partikel solut Brownian, dan vesikel jauh semi-transparan sebagai BG/MG.
- **Subjek per babak:** vial + suntikan (hook) → virus ruby berduri, ujung spike = antigen emas menyala → virus membelah, sel tubuh sakit → vial terbuka, 3 isi vaksin (virus dilemahkan, potongan antigen, pita mRNA) → sel B transparan dengan inti ungu melepas antibodi Y emas, sel memori bercincin emas → sel memori menembak sinar pengenal + kawanan antibodi mengunci virus → grid sel tubuh berperisai cyan (kekebalan kelompok) → kartu 154 JUTA.
- **Material:** glossy clearcoat (virus, antibodi), transmisi kaca/membran (sel, vial, suntikan), emissive untuk ujung pengikat (cyan) dan antigen (emas).
- **Cahaya:** ambient `fluidAmbient`, key putih kebiruan, rim cyan kiri + ruby kanan + emas belakang; alarm merah saat infeksi (S3). Finish: HDRI studio env 0.55, AO, profil `CINEMA_TEAL_ORANGE`.
- **Palet:** guanineRuby (musuh), adenineGold (antigen/antibodi/sorotan), thymineCyan (vaksin/perlindungan), cytosineViolet (inti sel B, dosis), membraneGlow (mRNA).
- **Kamera:** `shotPlan` per adegan, 4–7 framing per adegan + orbit akhir, `alive` 3°/0.03 supaya tidak pernah diam (pelajaran TUBUH: median speed ≥ 0.04).
- **HUD:** tag miring dan kartu data di y=230 (di bawah safe top 180), bar LAMBAT/CEPAT, kartu angka 154 JUTA (WHO · The Lancet 2024). Subtitle karaoke 4 kata, 60 px, plate gelap di y=1290 (di atas safe bawah 380), jarak kata 0.4em.
- **Brand:** label vial "AUDIRA · VAKSIN" (di dalam adegan), tag "AUDIRA EXPLAINED", VO menyebut AUDIRA di hook dan outro, `AudiraSignature` seed `cara-kerja-vaksin-ep33`, kartu outro AUDIRA 84.5–87.5 dtk.
