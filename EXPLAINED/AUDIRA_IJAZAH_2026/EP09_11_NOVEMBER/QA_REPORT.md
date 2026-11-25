# QA Report: EP09_11_NOVEMBER

Dicek 6 November 2026 malam. Semua angka dari `PROJECT/qc/metrics.json` (qc.py) dan contact sheet `PROJECT/qc/sheet-FINAL.jpg`.

| Cek | Hasil | Lulus |
|---|---|---|
| Resolusi | 1080x1920, 30/1 fps, yuv420p | ya |
| Durasi | 94.3 s (ucapan 91.3 s, 142 kata/menit) | ya |
| Decode error / freeze > 2,5 s / layar hitam | 0 / 0 / 0 | ya |
| Loudness | -14.0 LUFS, true peak -1.8 dBTP, LRA 2.7 | ya |
| Suara vs musik | VO -16.3 LUFS, musik -31.3 LUFS (~15 dB di bawah) | ya |
| Sinkron caption | 100.0% kata bersuara, selisih onset maks 0.068 s | ya |
| SRT | 68 cue, terakhir 00:01:31,659 | ya |
| Mute test | Tiap kutipan punya nama pembicara di kartu, label SKETSA ILUSTRASI selalu tampil, kartu akhir "Belum ada putusan" | ya |
| Safe zone | Kartu mulai y 236, caption y 1290-1540 (bawah aman 380 px) | ya |
| Outro | Logo AUDIRA + Created by Agus Dwi R., 3 detik terakhir | ya |
| Caption sosial | `audira_validate_social_captions` ok: true | ya |

Catatan: pelafalan dicek dari panjang kata di metadata Cartesia, belum didengar manusia. EP08 s4 ("juga" 1,7 s) disuarakan ulang. Beberapa transisi kamera sesaat memotong tepi properti; tidak ada teks fakta yang terpotong saat dibaca.
