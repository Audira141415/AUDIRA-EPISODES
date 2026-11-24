# QA_REPORT — EP09 Laut Dalam (final)

File: `FINAL_EP09_LAUT_DALAM.mp4` · 1080×1920 @ 60 · 5196 frame · 86,61 dtk · h264 (nvenc)

| Cek | Hasil |
|---|---|
| Loudness | −13,8 LUFS (target −14 ±0,5), true peak −1,8 dBFS (< −1) |
| G18c | VO −17,2 LUFS vs SFX ter-duck −32,7 LUFS → gap 15,5 LU (min 12) |
| Metadata (ffprobe) | title, artist "AUDIRA (Agus Dwi R.)", copyright © 2026, comment `AUDIRA-laut-dalam-misterius-EP09 \| audira.my.id`, date |
| Tanda tangan | Ed25519 498c3302271aadce VALID + C2PA tertanam |
| Outro + signature | AudiraOutro 3,2 dtk, AudiraSignature seed `sains-EP09-laut-dalam`, channel @AudiraSains |
| qa_video hardOnly | LONCAT 12,27 dtk = kamera menembus permukaan laut (disengaja, `--allow`). BLACK 7,2–11,0 / 30,0–37,5 / 67,9–76,9 dtk = adegan angkasa, zona hadal/tekanan, dan ikan pemancing yang memang gelap (gaya ABYSSFORGE). Bukan frame hitam: YAVG 33,6 (9 dtk), 28,6 (34 dtk), 30,4 (72 dtk) vs hitam 16; strip `archive/qa_final/` menampilkan Bumi, dinding palung, kapal selam, ikan pemancing. Render kedua dengan cahaya dinaikkan memberi temuan yang sama → detektor ambang luma, diterima. |
| Juri draf | putaran 2: 4,0 LOLOS (lighting 4, material 4, depth 3, composition 4, motion 5, readability 4) |
