# QA REPORT: Api Bawah Tanah

| Pemeriksaan | Hasil | Bukti |
| --- | --- | --- |
| Resolusi dan frame rate | Lulus | 1080x1920, 30/1, 2912 frame |
| Durasi | Lulus dengan catatan | 97.1 detik, sekitar 7 detik di atas target 90 detik. Naskah 238 kata terucap, tidak dipercepat lagi agar tetap dekat 150 WPM |
| Dekode file | Lulus | 0 galat, h264 |
| Loudness | Lulus | -14.0 LUFS, true peak -1.7 dBTP |
| Keseimbangan suara | Lulus | Voice -16.5 LUFS, musik -31.3 LUFS, SFX -29,7 LUFS |
| Tempo narasi | Lulus dengan catatan | 152 WPM terucap, sedikit di atas rentang 135-150 |
| Sinkron subtitle | Lulus | 99.5% kata bersuara saat aktif, selisih onset maks 0.051 detik, 70 cue SRT |
| Hitam atau beku | Lulus | 0 segmen hitam, 0 beku di atas 2,5 detik |
| Lembar frame | Lulus | 32 frame dari MP4 final ditinjau. Layar warna penuh di transisi s2-s3 dan s4-s5 memang disengaja |
| Safe zone | Lulus | Panel mulai 190 px, subtitle berakhir 1540 px |
| Sumber | Lulus dengan catatan | Semua angka ada di SOURCE_REGISTER.md. Laporan asli CREA dan CELIOS belum dibaca, hanya lewat media |
| Pelafalan | Belum diverifikasi | Tidak ada kata di atas 0,95 detik saat TTS. Belum didengar telinga manusia; perhatikan BNPB, WWF, CREA, El Nino |
| Realisme | Sebagian | 3D prosedural real-time tanpa foto. Figur relawan, drone, dan api masih bergaya |
| Tinjauan ahli | Belum | Tidak ada pakar gambut yang meninjau |
| Social captions | Lulus | `audira_validate_social_captions` ok: true |
| Tes di ponsel | Belum | Hanya diuji dekode di PC |

Voice dibuat dengan `scripts/tts-cartesia.mjs`, bukan MCP `audira_generate_voiceover`, karena tool itu tercatat mengembalikan 401 dan menuntut baris bertimecode. Tool MCP tidak dicoba ulang pada proyek ini.
