# Asset Manifest — EP02 Algoritma: Al-Khawarizmi

Semua visual dibuat prosedural di kode (React Three Fiber + tekstur kanvas); tidak ada gambar AI, foto, atau faksimile.

| Aset | Sumber / file | Catatan |
|---|---|---|
| Kodeks Latin, halaman incipit "Dixit algorizmi", halaman diagram | `project/src/scenes/khawarizmi/textures.ts` | Rekonstruksi; incipit dari SOURCE_REGISTER klaim 22–23; teks lain aksara semu |
| D emas timbul (alpha + normal map) | `textures.ts` `makeInitialD`, `makeInitialDNormal` | Normal map dari huruf yang diblur |
| Punggung buku AUDIRA | `textures.ts` `makeAudiraSpine` | Merek di dunia 3D (bukan di masjid/Al-Qur'an/aksara Arab) |
| Peta perkamen Khwarazm–Baghdad | `props.tsx` `makeMapTexture` | Garis pantai Kaspia/Aral/Teluk dan sungai disederhanakan dari koordinat |
| Kitab al-Jabr, kitab Arab asli yang hilang | `props.tsx` `ClosedBook` | Sampul bintang geometris, tanpa aksara |
| Papan tulis berengsel, kata persamaan, simbol modern, ubin x/+/= | `props.tsx` `EquationBoard`, `GlyphTile` | Kata = narasi; simbol dari naskah |
| Timbangan, astrolab, tinta & pena, lilin, lentera, rak | `KhawarizmiFilm.tsx` (dari cover Stage A) | Material kuningan/lilin kit MANUSCRIPT |
| Papan pasir (kanal, angka 1–9, stilus) | `KhawarizmiFilm.tsx` `SandBoard` | |
| Gulungan wasiat, koin dagang | `props.tsx` `Uses` | |
| Batu tulis kode, ponsel feed, benang emas | `props.tsx` `CodeSlate`, `Phone`, `ChainThread` | Kode generik, feed abstrak tanpa merek |
| Tag 3D bertali | `labels.tsx` `Tag3D` | Kata dari naskah/SOURCE_REGISTER |
| Caption karaoke | `Captions.tsx`, `chunks.ts` | Dari kata `timeline.json` |
| Kit MANUSCRIPT (palet, kayu, bulu, cahaya) | `project/src/kits/manuscript/` | AUDIRA-SKILL-MOTION |
| Font | `public/fonts/` Instrument Serif, Manrope (OFL) | Georgia sistem untuk tekstur kanvas |
| Logo outro | `public/brand/stacked-reversed.svg` (Monolit AMD, kit logo AUDIRA) | `audira-outro-card.svg` lama (neon, "CREATED BY AUDIRA") sengaja tidak dipakai |
| Tanda tangan bergerak | `src/brand/AudiraSignature.tsx` seed `sejarah-islam-ep02` | Lapisan terakhir |
| HDRI | `public/hdri/brown_photostudio_02_1k.hdr` (warmStudio) | Poly Haven CC0 |
| Suara | `audio/vo.wav` (Cartesia Galang) | Terkunci |
| Musik & foley | sintesis numpy di `mix.py` | Orisinal, tanpa lisensi pihak ketiga |
| SFX | `F:/AUDIRA-VIDEO-MOTION/shared/assets/sfx/` (catalog.json) | Pustaka studio AUDIRA |
