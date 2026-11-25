---
name: audira-video-processing
description: >-
  Use this skill when modifying, debugging, or executing FFmpeg video transcoding, audio extraction (AAC/m4a),
  smart 9:16 vertical reframing, gaming single-pass layouts, animated ASS karaoke subtitles burn-in, or tuning CPU thread limits.
---

# Audira Video Processing & FFmpeg Engine Runbook

Panduan operasional dan standar eksekusi untuk pemrosesan video berkecepatan tinggi menggunakan FFmpeg di AUDIRA CLIP AI.

---

## 1. Directives & Critical Rules

1. **AAC Codec Wajib**: Ekstraksi audio speech-to-text **wajib** menggunakan `-acodec aac` ke format `.m4a`. Jangan pernah gunakan `libmp3lame`.
2. **CPU Thread Restraint**: Selalu sematkan `-threads 4` (atau dari `process.env.FFMPEG_THREADS`) agar CPU workstation tidak membeku.
3. **Escaping Path Windows**: Berkas subtitle `.ass` pada Windows wajib di-escape jika berisi karakter drive letter (`C:\` -> `C\:/`).
4. **Font Anti-Tofu Box Windows**: Gunakan font bawaan Windows resmi (`Segoe UI`, `Nirmala UI`, `Microsoft YaHei`, `Yu Gothic UI`) untuk teks subtitle non-latin agar FFmpeg tidak merender kotak tahu hitam/kosong.
5. **Hard Cut Transition**: Pada pemindahan fokus pembicara (podcast/multicam), gunakan `--speaker_transition cut` bukan lerp pan lambat untuk menghasilkan potongan multicam televisi yang tajam tanpa getaran kamera.

---

## 2. Advanced High-Speed Techniques (Clips Kitty Adoption)

### A. Fast Raw Video Gray Decode (20x Faster than OpenCV)
Alih-alih mendekode frame satu per satu dengan `cv2.VideoCapture`, jalankan FFmpeg langsung ke buffer memori NumPy:
```bash
ffmpeg -i input.mp4 -vf "fps=2,scale=160:90" -f rawvideo -pix_fmt gray -
```
Pemindaian visual pergerakan dan pemotongan scene selesai dalam 1-2 detik untuk video berdurasi puluhan menit.

### B. Single-Pass Gaming Filtergraphs (Zero Intermediate Frames)
- **Circular Cam PiP**:
  `[cam]crop=size:size:cx:cy,format=yuva420p,geq=r='r(X,Y)':a='if(lte(hypot(X-r,Y-r),r),255,0)',scale=440:440[circlecam];[game][circlecam]overlay=x=60:y=280`
- **Streamer Split**:
  Streamer row atas (1080x720) + Gameplay row bawah (1080x1200) menggunakan `vstack`.
- **Cinematic Blurred Background**:
  Gameplay 16:9 pas di tengah dengan latar belakang 1080x1920 yang di-blur halus (`boxblur=25:5`).

---

## 3. Standard Command Templates

### A. Ekstraksi Audio untuk Speech-to-Text
```bash
ffmpeg -y -i input.mp4 -vn -acodec aac -b:a 128k -ar 16000 output.m4a
```

### B. Pemotongan Klip Presisi & Smart Crop 9:16
```bash
ffmpeg -y -ss 00:01:15 -to 00:01:45 -i input.mp4 -vf "crop=ih*9/16:ih:x_offset:0,scale=1080:1920" -c:v libx264 -preset fast -crf 22 -c:a aac -threads 4 output_916.mp4
```

### C. Burn Subtitle ASS Karaoke ke Video Final
```bash
ffmpeg -y -i clip_916.mp4 -vf "ass='path/to/subs.ass'" -c:v libx264 -preset fast -crf 22 -c:a copy -threads 4 final_clip.mp4
```
