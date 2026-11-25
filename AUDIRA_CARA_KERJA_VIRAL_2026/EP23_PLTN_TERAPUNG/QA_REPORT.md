# EP 23: PLTN Terapung untuk Halmahera: Cara Kerja Pembangkit Nuklir di Atas Kapal

AUDIRA, seri CARA KERJA VIRAL. Created by Agus Dwi R. Status: final dengan voice-over, 9 November 2026.

| Pemeriksaan | Hasil | Bukti |
| --- | --- | --- |
| Akurasi fakta | Lulus | Semua angka dari RESEARCH_REPORT.md berlabel HIGH/MED; jebakan di RISET_LANJUTAN_EP21-25.md dihindari |
| Voice-over | Lulus | Cartesia sonic-3 voice 04b567df, -16.4 LUFS, 139 WPM |
| Loudness | Lulus | -14.0 LUFS terintegrasi, true peak -1.8 dBTP, musik/SFX -27.7 LUFS |
| Sinkron subtitle | Lulus | 100.0% kata bersuara saat aktif, selisih onset maks 0.069 s, 58 cue SRT |
| Safe zone | Lulus | Panel mulai 262 px, subtitle di atas 380 px bawah, kanan 110 px kosong |
| File | Lulus | 1080x1920, 60/1 fps, 82.0 s, h264, 0 galat dekode, 0 freeze > 2,5 s, 0 segmen hitam |
| Visual | Lulus | Lembar frame dari MP4 final ditinjau (PROJECT/qc/sheet.jpg) |
| Brand | Lulus | Outro Monolit AUDIRA, tanda tangan bergerak, AUDIRA di dunia 3D, VO menyebut Audira, metadata kepemilikan (ffprobe) |

Voice dibuat lewat `scripts/tts-cartesia.mjs` (dipanggil `_tools/vo.py`), bukan MCP `audira_generate_voiceover`, karena tool MCP itu mengembalikan 401 akibat key lama di environment.
