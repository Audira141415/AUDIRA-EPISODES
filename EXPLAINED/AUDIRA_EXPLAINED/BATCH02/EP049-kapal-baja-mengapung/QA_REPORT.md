# QA REPORT — EP049-kapal-baja-mengapung

Tanggal: 2026-11-07. File: `FINAL_VIDEO.mp4`.

| Cek | Hasil | Status |
|---|---|---|
| ffprobe | stream|width=1080|height=1920|r_frame_rate=60/1| / stream|r_frame_rate=0/0 / format|duration=61.824000 | OK |
| Loudness | -13.7 LUFS (target −14 ±0,5) | OK |
| True peak | -1.8 dBTP (< −1) | OK |
| Caption sync (whisper vs timeline) | 96% kata ≤0,25 dtk | OK |
| Outro AUDIRA (Monolit + Created by Agus Dwi R.) | mulai 58.01 dtk | OK |
| Anti-reupload: AudiraSignature | lapisan terakhir via Root.tsx, seed per episode, hilang 4,2 dtk terakhir | OK |
| Anti-reupload: brand di adegan | plakat 'AUDIRA EXPLAINED' di meja + 'AUDIRA' di haluan kapal | OK |
| Anti-reupload: brand di suara | "Ini AUDIRA Explained." di akhir OUTRO | OK (whisper: dieja bervariasi, perlu cek telinga) |
| Metadata kepemilikan | AUDIRA (Agus Dwi R.) · Â© 2026 AUDIRA - Agus Dwi R. All rights reserved. · AUDIRA-kapal-baja-mengapung-AE-049 | audira.my.id | OK |
| Arsip master | `archive/2026-11-07/` (FINAL, vo.wav, mix.wav, project tar) | OK |
| Frame dari MP4 | `qa/final_frames.jpg` (2 / 20 / 38 / akhir−5,5 / akhir−1,5 dtk) | OK |
| SUBTITLES.srt | dari timeline, tanpa kata yatim | OK |
| Caption sosial | validator ok:true (6 platform + Jadwal WIB + Label AI) | OK |

Catatan: `npm run audit:visual` lulus tapi statis (tidak membaca video). Belum diverifikasi manusia: pengucapan "AUDIRA" & singkatan, kualitas musik prosedural.
