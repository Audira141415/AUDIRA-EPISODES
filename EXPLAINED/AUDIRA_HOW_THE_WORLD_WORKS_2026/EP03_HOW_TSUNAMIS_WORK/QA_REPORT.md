# BAGAIMANA TSUNAMI BISA MENGHASILKAN GELOMBANG RAKSASA YANG MENERJANG DARATAN?

AUDIRA HOW IT WORKS, seri HOW THE WORLD WORKS, episode 03. Created by Agus Dwi R.

| Pemeriksaan | Hasil | Bukti |
| --- | --- | --- |
| Akurasi ilmiah | Lulus dengan catatan | Semua angka dipetakan ke SOURCE_REGISTER.md. Tinggi gelombang di penampang diperbesar dan dikompresi agar 1 m dan 50 m muat dalam satu frame; ini diberi label. Penampang dekat pantai tidak berskala. Pelajaran lari saat gempa kuat dan laut surut mengikuti panduan peringatan alami tsunami.gov; halaman BMKG yang dicoba 404, jadi perlu ditambah sebagai rujukan lokal. |
| Akurasi mekanisme | Lulus | Urutan visual mengikuti temuan di RESEARCH_REPORT.md, bagian tidak berskala diberi label |
| Validasi sumber | Lulus dengan catatan | Lihat status tiap sumber. Tidak ada tinjauan ahli manusia |
| Kualitas narasi | Lulus | Hook frame 0, 194 kata terucap |
| Sinkron audio | Lulus | Adegan dikunci ke timestamp Cartesia, 151 WPM |
| Pelafalan | Belum diverifikasi | Tidak ada kata tereja salah menurut durasi kata. Belum ditinjau telinga manusia |
| Loudness | Lulus | -14.0 LUFS, true peak -1.7 dBTP, voice -16.3 LUFS, musik -31.0 LUFS |
| Sinkron subtitle | Lulus | 100.0% kata bersuara saat aktif, selisih onset maks 0.074 detik, 57 cue SRT |
| Realisme visual | Sebagian | Brief meminta photorealistic. Visual 3D prosedural real-time, tanpa plate foto atau render path tracing, karena image generation tidak tersedia (9Router: Missing API key) |
| Kontinuitas gerak | Lulus | Lembar frame dari MP4 final ditinjau. Segmen hitam: 0. Freeze di atas 2,5 detik: 0 (kartu penutup bila ada) |
| Safe zone mobile | Lulus | Panel mulai 190 px, subtitle berakhir 1540 px |
| Outro AUDIRA | Lulus dengan catatan | Monolit dan Created by Agus Dwi R., 2.7 detik. `shared/assets/brand/audira-outro-card.svg` masih memakai logo lama, jadi kartu dibangun dari kit logo resmi |
| Resolusi | Lulus | 1080x1920 |
| Frame rate | Lulus | 30/1, 2406 frame |
| Tes putar MP4 | Lulus | Dekode penuh, 0 galat, 80.20 detik, h264/aac. Bukan tes di perangkat ponsel |

Voice dihasilkan lewat `scripts/tts-cartesia.mjs` karena MCP `audira_generate_voiceover` mengembalikan HTTP 401.
