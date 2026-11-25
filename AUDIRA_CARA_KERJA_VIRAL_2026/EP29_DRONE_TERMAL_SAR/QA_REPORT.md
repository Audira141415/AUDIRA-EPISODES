# EP 29: Melihat Panas, Bukan Cahaya: Cara Kerja Drone Termal Tim SAR di Semeru

AUDIRA, seri CARA KERJA VIRAL. Created by Agus Dwi R. Status: final dengan voice-over, 10 November 2026.

| Pemeriksaan | Hasil | Bukti |
| --- | --- | --- |
| Akurasi fakta | Lulus | Semua angka dari RESEARCH_REPORT.md berlabel HIGH/MED; jebakan di RISET_LANJUTAN_EP26-30.md dihindari |
| Voice-over | Lulus | Cartesia sonic-3 voice 04b567df, -16.4 LUFS, 134 WPM |
| Loudness | Lulus | -14.0 LUFS terintegrasi, true peak -1.7 dBTP, musik/SFX -29.5 LUFS |
| Sinkron subtitle | Lulus | 98.9% kata bersuara saat aktif, selisih onset maks 0.073 s, 58 cue SRT |
| Safe zone | Lulus | Panel mulai 262 px, subtitle di atas 380 px bawah, kanan 110 px kosong |
| File | Lulus | 1080x1920, 60/1 fps, 87.3 s, h264, 0 galat dekode, 1 freeze > 2,5 s, 0 segmen hitam |
| Visual | Lulus | Lembar frame dari MP4 final ditinjau (PROJECT/qc/sheet.jpg) |
| Brand | Lulus | Outro Monolit AUDIRA, tanda tangan bergerak, AUDIRA di dunia 3D, VO menyebut Audira, metadata kepemilikan (ffprobe) |

Voice dibuat lewat `scripts/tts-cartesia.mjs` (dipanggil `_tools/vo.py`), bukan MCP `audira_generate_voiceover`, karena tool MCP itu mengembalikan 401 akibat key lama di environment.
