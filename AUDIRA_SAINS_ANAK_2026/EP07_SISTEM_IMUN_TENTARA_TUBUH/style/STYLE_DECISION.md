# STYLE_DECISION — Cara Kerja Sistem Imun: Tentara Dalam Tubuhmu (`EP07`)

Style: NANOFORGE

- **Tanggal:** `2026-11-25`
- **Engine:** `remotion` (Remotion 4 + React Three Fiber, 3D)
- **Style terpilih:** `NANOFORGE`
- **Alasan (awam, terkait topik):** Para "tentara" ini sel mikroskopis. NANOFORGE adalah dunia mikro bercahaya: sel glossy di ruang gelap dengan rim light cyan/magenta/emas, jadi neutrofil, makrofag, sel T, sel B, bakteri, dan antibodi bisa tampil sebagai karakter 3D yang terbaca jelas. Style ini juga sudah lolos juri untuk biologi mikro (EP33 vaksin, juri 4.0 draf).
- **Skor rekomendasi (G3):** ANATOMIX 72,3 (juri 3,11) · NANOFORGE 64,2 (juri 3,81 dari 5) · TERRARIUM 43,2.
- **Alternatif ditolak:** `ANATOMIX`: skor juri rendah (3,11) dan kelemahannya tercatat "objek GLB low-poly terbaca mainan plastik"; topik ini level sel, bukan organ. `INNERWORKS`: bahasa visualnya mesin/belahan objek, tidak cocok untuk sel hidup. `TERRARIUM`: ekosistem/tanaman, bukan tubuh.
- **Hukum Mutlak 5:** dari kit diambil material (membran glossy, rim light, partikel latar mikro), palet, dan grade CINEMA_TEAL_ORANGE. Lingkungan per adegan mengikuti naskah: tubuh anak → pembuluh darah → luka kulit → medan makrofag/sel T → kelenjar getah bening (barak sel memori) → kamar tidur malam.
- **GLB nyata (Hukum 1 rule 07):** subjek mikroskopis (sel, bakteri, antibodi) tidak ada di katalog Polyfork 3.288 aset (dicek `audira_search_assets` "sel darah putih bakteri virus" → tidak ada hasil relevan). Sel dibuat prosedural dengan membran bertekstur (displacement noise seeded, transmission, rim), bukan Points/LineSegments/box polos. Adegan makro (anak, kamar tidur) memakai ToyPerson + GLB kamar (ranjang, lampu) dari katalog.
- **Cover referensi:** `F:/AUDIRA-ALL-SKILL/assets/style-covers/nanoforge.jpg`
- **Cover topik:** `cover-topic.png` (dari komposisi film, frame hook) — dirender di sesi B setelah kode film ada (pola EP05).
- **approved:** `yes` (style dipilih AI dan dilaporkan, aturan 2026-11-23; acc pengguna hanya di gerbang render final; batch otonom 2026-11-25 pre-approved)

## Parameter dari motion memory (`audira_style_memory get NANOFORGE`)
- Wajib diterapkan: `<Finish profile={COLOR_PROFILES.CINEMA_TEAL_ORANGE} exposure={1} envIntensity={0.55} ao />`. Rim light cyan/magenta/emas mengikuti kamera. Satu subjek hero dipusatkan per beat, ≥ 60% lebar frame untuk objek makro. Count-up angka selesai ≥ 0,3 dtk sebelum kata angka di VO. Satu kartu HUD per beat; label 3D jangan menumpuk dengan kartu HUD. Konsep sosial pakai ToyPerson.
- Hindari: ruang kosong (1 objek kecil di frame besar), label HUD tertutup objek 3D, teks kecil di adegan kerumunan, adegan terlalu gelap (qa-video BLACK). Kulit/sel prosedural polos terbaca plastik: beri tekstur pori/bintil.
