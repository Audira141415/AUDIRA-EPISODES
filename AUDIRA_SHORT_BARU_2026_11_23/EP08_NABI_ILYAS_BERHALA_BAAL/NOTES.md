
## Juri draf MANUSCRIPT (2026-11-23, sesi ke-6)
- Putaran 1: 3.33 · Putaran 2: 3.17 (readability 2: S7 hanya stempel teks, chip adab y≈176 < safe top 180, "MENCIPTA" terpotong kanan S5c, S8 subjek kurang jelas).
- Diterima 3.33 setelah 2 putaran (di bawah 3.5) — atas keputusan pengguna 2026-11-23 "jgn ganti style langsung render": TIDAK ganti style, langsung render final MANUSCRIPT (override G16). Lesson failed dicatat di motion memory.

## Final (2026-11-23, sesi ke-7)
- Style: MANUSCRIPT (Remotion 2D). Diterima 3.33 setelah 2 putaran juri, di bawah 3.5, atas keputusan pengguna 2026-11-23 "jgn ganti style langsung render" (`--skip-memory-gate`). record_score final 3.33 (motion 5).
- G13 kamera: dolly per adegan dinaikkan `dz = 1 + 0.02*lt`, drift `sin(lt*0.6+i)*40` (sebelumnya 0.013 / 26 / 0.45). Klip 47–65 dtk: median 0.049, dead 0 %, longest hold 0 dtk, jerk 0.
- `FINAL_VIDEO.mp4`: 1080×1920 @ 60, 5250 frame, 87,5 dtk, render 354 dtk (jobs 4, nvenc). Audio −13,6 LUFS, true peak −1,7 dBFS, LRA 3,0. Metadata kepemilikan OK (ffprobe). Signature Ed25519 VALID (key 498c3302271aadce), sidecar `FINAL_VIDEO.mp4.sig.json`. `audira_qa_video` hardOnly PASS. Audit visual final: tidak ada aspek di bawah 4 (`FINAL_VIDEO.look.json`).
- `--skip-channel`: handle "@audira" yang salah hanya ada di file starter tak terpakai `src/scenes/news/PenggantiGibranWapres.tsx`; Ilyas.tsx memakai handle channel @AUDIRAQISSAH.
- Masalah kit: `fs.renameSync` EPERM di F: (pakai `mv -f`), `sign-video.mjs` tanpa `await` (tag signature kosong `e30`, verify mencetak "undefined"). Ditandatangani ulang dengan script ber-`await`. Dicatat sebagai lesson GLOBAL.
- Review pasca-tayang (scheduled task): `review-ep08-nabi-ilyas-24h` (28 Nov 19.30 WIB), `review-ep08-nabi-ilyas-72h` (30 Nov 19.30), `review-ep08-nabi-ilyas-7d` (4 Des 19.30). Hanya jalan saat aplikasi Claude terbuka.
