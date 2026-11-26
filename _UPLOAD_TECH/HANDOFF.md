# HANDOFF — Upload @AudiraTECH (2026-11-26, sesi 1)

## Status
- Channel AUDIRA TECH, Studio `UClXIf0aQOGdoQkL-H4-5onw`, Content > Shorts. Jadwal + riset jam: `UPLOAD_PLAN.md`. Metadata: `meta.json` (key 0–6: t, d, g, dt, tm).
- Semua 63 final di `TECH/` sudah di Studio. Sisa = draf Doom (#0) + 6 file SHORT_BARU (#1–#6, hardlink `01_…`–`06_…`).
- SELESAI terjadwal: #0 Doom (7 Des 12:00), #1 PlayStation (7 Des 17:00), #2 Easter Egg (8 Des 12:00, dialog "Video uploading … set to public once uploading").
- Sedang: file 01–03 sudah dikirim ke Studio dalam satu dialog upload. #3 Flappy Bird sedang/menunggu upload, belum diisi metadata.
- SISA: #3 (8 Des 17:00), lalu upload `04_…`–`06_…` dan jadwalkan #4 (9 Des 12:00), #5 (9 Des 17:00), #6 (10 Des 12:00).

## Cara (Claude in Chrome, tab Studio)
- Server file: `python -I F:/AUDIRA-EPISODES/_UPLOAD_TECH/serve.py` (port **8766**; port 8765 dipakai server FAKTADUNIA milik sesi lain, jangan dimatikan).
- Inject `helpers.js` (port 8766) + isi `M.js` ke tab Studio (hilang bila reload).
- Upload: klik Create → Upload videos (find ref), lalu `await __send(['04_….mp4', …])`.
- Edit draf yang masih upload: klik pensil "Edit video NN_…" di panel progres (baris tabel belum muncul sebelum refresh). Lalu `__s1b(n)` (isi judul+desk, Show more, AI=Yes, fokus Tags) → `computer type` tags + koma akhir → `__s2(n)` → `__finx()` (klik Got it otomatis bila "still checking").
- Untuk draf di tabel: `__s1(n, 'NN SB')`.

## SELESAI (2026-11-26, sesi 1)
- #0–#6 semua terjadwal (dialog konfirmasi tiap nomor). Studio Shorts: 90 baris, 0 draf. #6 Tamagotchi sempat "Pending" (masih diproses), jadwal 10 Des 12:00 sudah tersimpan.
- Server 8766 sudah dimatikan. Hardlink di folder ini boleh dihapus bila pengguna setuju (file asli aman).
- Semua video final @AudiraTECH sudah ada di Studio. Upload berikutnya: lanjut dari 10 Des 17:00 (slot Sen–Jum 12:00 & 17:00, Sab–Min 11:00 & 17:00).

## Selesai bila
Studio Shorts: 0 draf; #0–#6 Scheduled sesuai tabel UPLOAD_PLAN.md (total 91 baris).

## Cek ulang seluruh workspace (2026-11-26)
- 494 folder berisi FINAL*.mp4 disapu, lalu dipetakan ke channel lewat `scripts/channel-of.mjs` dan tanda tangan `@Audira…`.
- Hanya 6 episode di luar `TECH/` yang milik @AudiraTECH: SHORT_BARU EP05, 06, 19, 20, 21, 22. Semuanya sudah terjadwal.
- `AUDIRA_SEJARAH_ISLAM_2026` EP06–10 sempat terdeteksi `@AudiraTECH`, ternyata hanya daftar handle di dokumen. Seri itu milik QISSAH.
