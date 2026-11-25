# QA Report: EP08_TIGA_PERKARA

Dicek 6 November 2026 malam. Semua angka dari `PROJECT/qc/metrics.json` (qc.py) dan contact sheet `PROJECT/qc/sheet-FINAL.jpg`.

| Cek | Hasil | Lulus |
|---|---|---|
| Resolusi | 1080x1920, 30/1 fps, yuv420p | ya |
| Durasi | 92.0 s (ucapan 89.0 s, 134 kata/menit) | ya |
| Decode error / freeze > 2,5 s / layar hitam | 0 / 0 / 0 | ya |
| Loudness | -14.0 LUFS, true peak -1.9 dBTP, LRA 2.8 | ya |
| Suara vs musik | VO -16.2 LUFS, musik -31.0 LUFS (~15 dB di bawah) | ya |
| Sinkron caption | 100.0% kata bersuara, selisih onset maks 0.048 s | ya |
| SRT | 59 cue, terakhir 00:01:29,336 | ya |
| Mute test | Tiap kutipan punya nama pembicara di kartu, label SKETSA ILUSTRASI selalu tampil, kartu akhir "Belum ada putusan" | ya |
| Safe zone | Kartu mulai y 236, caption y 1290-1540 (bawah aman 380 px) | ya |
| Outro | Logo AUDIRA + Created by Agus Dwi R., 3 detik terakhir | ya |
| Caption sosial | `audira_validate_social_captions` ok: true | ya |

Catatan: pelafalan dicek dari panjang kata di metadata Cartesia, belum didengar manusia. EP08 s4 ("juga" 1,7 s) disuarakan ulang. Beberapa transisi kamera sesaat memotong tepi properti; tidak ada teks fakta yang terpotong saat dibaca.
