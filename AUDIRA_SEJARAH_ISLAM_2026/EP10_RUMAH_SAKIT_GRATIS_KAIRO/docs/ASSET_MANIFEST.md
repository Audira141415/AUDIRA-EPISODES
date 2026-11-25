# Asset Manifest — EP10 Rumah Sakit Gratis Kairo

Semua visual dibuat prosedural di Remotion + React Three Fiber (tanpa gambar AI, tanpa foto, tanpa model 3D unduhan).

| Aset | Sumber | Catatan |
|---|---|---|
| Gerbang Bimaristan, kubah, menara, sayap ablaq | `project/src/scenes/mansuri/Hospital.tsx` | Lengkung runcing, voussoir ablaq, pita kaligrafi abstrak (bukan teks nyata) |
| Ruang sakit Damaskus, denah halaman + 4 bangsal, kota wakaf + gulungan akta, rak kebutuhan, properti payoff (koin, oud, lentera, papan 1915), papan AUDIRA | `Zones.tsx` | Muncul per kata (`beats.ts`) |
| Figur flanel tanpa wajah, lantai kain perca, jalan berjahit, kolam, latar langit/awan/matahari/siluet Kairo, notions latar depan | `Props.tsx` | Figur: kepala polos tanpa fitur |
| Label flanel bercetak | `labels.tsx` | Canvas texture, tidak emisif |
| Material flanel, fuzz shell, motion on twos | kit `src/kits/feltcraft/` (AUDIRA-SKILL-MOTION) | |
| Finishing | `src/core/render/Finish.tsx` (DOCUMENTARY_WARM, 0,82, 0,25) | |
| Caption karaoke | `Captions.tsx`, `chunks.ts` (diadaptasi dari EP02) | |
| Outro & tanda tangan | `src/brand/AudiraOutro.tsx`, `src/brand/AudiraSignature.tsx`, `public/brand/stacked-reversed.svg` | Handle dari `src/brand/channel.json` (@AUDIRAQISSAH) |
| VO | `audio/vo.wav` (Cartesia, Galang) | Terkunci |
| Musik & ambience | `mix.py` (sintesis numpy) | Orisinal, tanpa lisensi pihak ketiga |
| SFX | `F:\AUDIRA-VIDEO-MOTION\shared\assets\sfx\` | Pustaka bersama AUDIRA |
| Font | Georgia / Courier New (overlay), Manrope (caption, `core/type/fonts.ts`) | |
