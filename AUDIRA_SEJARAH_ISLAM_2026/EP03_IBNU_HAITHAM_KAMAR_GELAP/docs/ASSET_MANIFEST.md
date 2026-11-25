# Asset Manifest — EP03

Semua visual dibuat prosedural (Three.js / React Three Fiber di Remotion); tidak ada gambar AI atau foto pihak ketiga.

| Aset | Sumber | Catatan |
|---|---|---|
| Kamar, jendela berlubang, berkas cahaya, debu, siluet ilmuwan | `project/src/scenes/haytham/DarkRoom.tsx` | geometri prosedural, material fresnel + Polish |
| Meja model, peta, model mata, model jeram Nil, rak 7 jilid, pintu/jendela, lilin luar + tangan, kotak luar + plakat AUDIRA, ponsel | `project/src/scenes/haytham/Props.tsx` | prosedural |
| Tekstur nyala terbalik, peta noir, halaman diagram, gobo kisi, punggung buku | `project/src/scenes/haytham/textures.ts` | canvas, deterministik (seed); garis pantai skematik digambar tangan, bukan data peta pihak ketiga |
| Tag bukti, cap KONON, caption, kartu outro | `project/src/scenes/haytham/ui.tsx` | |
| Font | `project/public/fonts` (Instrument Serif, Manrope; SceneText serif untuk plakat) | OFL, lisensi di `public/fonts/licenses` |
| Logo outro | `project/public/brand/audira-outro-card.svg` | aset brand AUDIRA |
| Tanda tangan bergerak | `project/src/brand/AudiraSignature.tsx` | seed `sejarah-islam-ep03` |
| SFX | `F:/AUDIRA-VIDEO-MOTION/shared/assets/sfx` (catalog.json) | pustaka internal AUDIRA |
| Musik + ambience | `project/src/scenes/haytham/mix.py` | sintesis numpy, orisinal |
| Suara | `audio/vo.wav` | Cartesia sonic-3, voice Galang (AI) |
