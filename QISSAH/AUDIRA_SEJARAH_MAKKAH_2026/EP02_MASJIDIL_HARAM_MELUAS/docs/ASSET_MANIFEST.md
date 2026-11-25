# Asset Manifest — EP02 MASJIDIL HARAM MELUAS

Semua visual 3D dibuat prosedural di kode (tanpa model unduhan, tanpa gambar AI, tanpa foto pihak ketiga).

| Aset | Lokasi | Sumber / lisensi |
|---|---|---|
| Dunia maket (Ka'bah, serambi, era Saudi, kota, bukit, jemaah titik) | `project/src/scenes/haram/*.tsx` | Dibuat untuk episode ini (AUDIRA) |
| Timeline kata VO | `project/src/scenes/haram/timeline.json` (salinan `audio/timeline.json`) | Cartesia word timestamps |
| VO long-form | `audio/vo.wav` → `project/public/audio/vo.wav` | Cartesia TTS, voice Galang `04b567df-2923-4b0c-896b-4b7df0a07e1a` |
| VO short + klip hook/outro | `audio/clips/s0N_*.wav` → `project/public/audio/short0N_vo.wav` | Cartesia TTS |
| Bed musik/ambience | `project/public/audio/bed.wav`, `short0N_bed.wav` | Sintesis numpy (`mix.py`), milik AUDIRA |
| Mix | `project/public/audio/full.wav`, `short0N_full.wav` | Turunan dari baris di atas |
| SFX | `shared/assets/sfx/{whoosh-cinematic,impact-bass-1,chime,riser}.mp3` | Pustaka SFX AUDIRA (`catalog.json`) |
| Font Anton, Space Grotesk | `project/public/fonts/` (+ `licenses/OFL-*.txt`) | SIL Open Font License |
| Font Manrope | `project/public/fonts/` | SIL OFL (starter) |
| Logo outro | `project/public/brand/stacked-reversed.svg` | Brand kit AUDIRA |
| Tanda tangan bergerak | `project/src/brand/AudiraSignature.tsx` (`seed="sejarah-makkah-ep02"`, `@audira`) | AUDIRA |
| HDRI | tidak dipakai (RoomEnvironment, envIntensity 0,3) | — |
| Cover topik | `style/cover-topic-16x9.png`, `style/cover-topic-9x16.png` | Render komposisi `HaramCoverWide` / `HaramCover` |
| Teks ayat | QS Al-Baqarah 2:158 (terjemahan Kemenag via api.quran.com) hanya diucapkan di outro short 02, tidak ditampilkan | `research/raw/quran_2_158.json` |
| Brand di dunia 3D | plakat museum "MAKET AUDIRA · MASJIDIL HARAM · SKALA ±1:4.300" di plaza selatan | AUDIRA |
