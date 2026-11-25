# BAGAIMANA PETIR TERBENTUK? MENGAPA LANGIT BISA MENGELUARKAN LISTRIK DAHSYAT?

AUDIRA HOW IT WORKS, seri HOW THE WORLD WORKS, episode 01. Created by Agus Dwi R.

| Pemeriksaan | Hasil | Bukti |
| --- | --- | --- |
| Akurasi ilmiah | Lulus dengan catatan | Semua angka dipetakan ke SOURCE_REGISTER.md. Inisiasi leader belum sepenuhnya dipahami menurut literatur. Video menyederhanakan proses dan diberi label simulasi diperlambat, karena leader nyata terjadi dalam milidetik. Bentuk awan, jarak, dan warna muatan adalah visualisasi. |
| Akurasi mekanisme | Lulus | Urutan visual mengikuti temuan di RESEARCH_REPORT.md, bagian tidak berskala diberi label |
| Validasi sumber | Lulus dengan catatan | Lihat status tiap sumber. Tidak ada tinjauan ahli manusia |
| Kualitas narasi | Lulus | Hook frame 0, 179 kata terucap |
| Sinkron audio | Lulus | Adegan dikunci ke timestamp Cartesia, 148 WPM |
| Pelafalan | Belum diverifikasi | Tidak ada kata tereja salah menurut durasi kata. Belum ditinjau telinga manusia |
| Loudness | Lulus | -14.0 LUFS, true peak -1.4 dBTP, voice -16.2 LUFS, musik -27.9 LUFS |
| Sinkron subtitle | Lulus | 100.0% kata bersuara saat aktif, selisih onset maks 0.057 detik, 55 cue SRT |
| Realisme visual | Sebagian | Brief meminta photorealistic. Visual 3D prosedural real-time, tanpa plate foto atau render path tracing, karena image generation tidak tersedia (9Router: Missing API key) |
| Kontinuitas gerak | Lulus | Lembar frame dari MP4 final ditinjau. Segmen hitam: 0. Freeze di atas 2,5 detik: 1 (kartu penutup bila ada) |
| Safe zone mobile | Lulus | Panel mulai 190 px, subtitle berakhir 1540 px |
| Outro AUDIRA | Lulus dengan catatan | Monolit dan Created by Agus Dwi R., 2.8 detik. `shared/assets/brand/audira-outro-card.svg` masih memakai logo lama, jadi kartu dibangun dari kit logo resmi |
| Resolusi | Lulus | 1080x1920 |
| Frame rate | Lulus | 30/1, 2270 frame |
| Tes putar MP4 | Lulus | Dekode penuh, 0 galat, 75.67 detik, h264/aac. Bukan tes di perangkat ponsel |

Voice dihasilkan lewat `scripts/tts-cartesia.mjs` karena MCP `audira_generate_voiceover` mengembalikan HTTP 401.
