# Batch 12 handoff (EP56–EP60), orkestrator

Diperbarui: 2026-11-23. Sesi orkestrator: "buatakn 5 riset untuk FAKTADUNIA dan buatakn 5 video shortnya" (F:\AUDIRA-EPISODES).

## Permintaan pengguna
5 riset + 5 video short untuk FAKTADUNIA. Riset selesai: `_research/FACTS_B12.md`, register per episode di `_research/b12/`, brief bersama di `_research/BRIEF_COMMON_B12.md`.

## Status per episode
- EP56 Kursi Listrik: SELESAI 2026-11-24 (s5 local_9cfcc4ff-94bb-4065-9d5f-2173659518ad). `FINAL_EP56_KURSI_LISTRIK_1890.mp4`, 94,01 dtk, −13,7 LUFS, TP −1,8; deliver GREEN; juri final 3.50; captions lolos; review terjadwal 24h/72h/7d. Jadwal upload tercatat Sabtu 2 Jan 2027 19.00 WIB (cek dengan pengguna). s1–s4 sudah diarsipkan.
- Semua episode: file scaffold `src/scenes/news/PenggantiGibranWapres.tsx` (handle "@audira") bikin deliver RED; perbaiki di folder episode sebelum render final.
- EP57 Paraguay: draf putaran 2 dirender, juri belum keluar (s3 local_016f2d06-13de-4b37-9400-9fe0888461b1).
- EP58 Mongolia: s2 kehabisan konteks di tahap 7; kartu s3 di sesi s2 (local_48af864a-4653-49b7-b3b1-69c4a39f6969) menunggu diklik pengguna.
- EP59 Finlandia: dikerjakan s2 (local_cc6e7625-cdd8-4f04-977e-98432bda0f12), style FELTCRAFT 3D.
- EP60 Panama: sesi s1 diarsipkan pengguna sebelum selesai. Belum ada folder episode. Mulai lagi hanya bila pengguna minta.

## Catatan teknis dari EP56 (sudah diteruskan ke EP57 s3 dan EP59 s2; belum ke EP58)
- `project/src/brand/channel.json` starter masih @AudiraExplained → jalankan `npm run channel` supaya outro/signature @AudiraFaktaDunia.
- Overlay FilmFromConfig sudah di-scale → Subtitle/Signature/Outro perlu wrapper scale(1/scale).

## Next
- Teruskan acc pengguna per episode ke sesi yang sedang di gerbang.
- Sampaikan catatan teknis di atas ke sesi EP58 berikutnya.
- Batas 5 sesi paralel aplikasi bisa menahan pergantian sesi.
