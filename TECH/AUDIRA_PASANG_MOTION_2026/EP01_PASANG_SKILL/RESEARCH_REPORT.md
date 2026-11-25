# EP 01: Pasang Skill audira-motion ke Claude

Seri AUDIRA, PASANG AUDIRA. Created by Agus Dwi R. Riset 5 November 2026. Alat: Claude Code, audira-motion, Node.js, ffmpeg.

Judul di brief: Instalasi skill audira-motion ke Claude

## Temuan terverifikasi

1. Claude Code wajib, karena chat browser tidak punya akses untuk merender.
2. Node.js minimal 22.13 dan ffmpeg dicek oleh `npm run check-env`.
3. Lokasi Windows: `C:\Users\<nama>\.claude\skills\audira-motion\`, macOS: `~/.claude/skills/audira-motion/`.
4. SKILL.md harus langsung berada di folder itu.
5. Unduhan pertama sekitar 370 MB paket dan 170 MB browser, 1,2 GB per proyek di disk, 2 sampai 10 menit menurut panduan.
6. Uji bersih: `npm ci`, `check-env`, `npm run smoke` semua lulus.

## Batasan dan keputusan editorial

Sumber paket ZIP disebut umum sebagai paket skill, karena skill ini berlisensi komersial. Cara upload lewat Customize tidak diuji, jadi tidak dibahas.
