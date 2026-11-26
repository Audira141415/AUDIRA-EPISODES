# HANDOFF — Upload @AudiraSains (2026-11-26, sesi 1)

## Status
- Channel AUDIRA Sains, Studio `UC0Wn15Pp3YYLM90e534Gsxg`, UI bahasa Indonesia. Jadwal + riset jam: `UPLOAD_PLAN.md` (disetujui pengguna). Metadata: `meta.json` / `M.js` (key 1–10: t, d, g, dt, tm).
- Audience: bukan untuk anak. Label AI: Ya.
- SELESAI terjadwal (dialog konfirmasi "akan ditetapkan menjadi publik"): #1 (27 Nov 13.00), #2 (27 Nov 19.00), #3 (28 Nov 10.00, cek di tabel), #4 (28 Nov 19.00), #5 (29 Nov 10.00), #6 (29 Nov 19.00). Upload file masih berjalan di tab Studio; jangan tutup tab.
- SISA: #7 (30 Nov 13.00), #8 (30 Nov 19.00), #9 (1 Des 13.00), #10 (1 Des 19.00). Tag tiap nomor ada di meta.json key g.

## Cara
- Server file: `python -I F:/AUDIRA-EPISODES/_UPLOAD_SAINS/serve.py` (port **8767**).
- Inject `helpers.js` + isi `M.js` ke tab Studio (hilang bila reload).

## Helper di tab (UI bahasa Indonesia; definisikan ulang bila tab reload)
- `window.M` = fetch `http://127.0.0.1:8767/meta.json` (eval diblok CSP).
- `__new(n)`: tutup dialog, Buat > Upload video, `__send([M[n].file])`, `__s1b(n)` (judul+desk lewat aria-label "Tambahkan judul"/"Beri tahu penonton", radio VIDEO_MADE_FOR_KIDS_NOT_MFK, "Tampilkan lebih banyak", VIDEO_HAS_ALTERED_CONTENT_YES, fokus Tag).
- Lalu `computer type` tags + koma akhir, lalu `__done(n)`: `__s2` (step-badge-3, expand #second-container-expand-button, tanggal "1 Des 2026", jam "13.00", zona = GMT+0700 lokal) + `__fin` (#done-button "Jadwalkan") + `__ok` (klik "Oke" pada "Kami masih memeriksa konten Anda").
- Bungkus output dengan `__clean()` (filter blokir teks berisi ? = &).

## Selesai bila
Studio Shorts AUDIRA Sains: 10 baris Terjadwal sesuai tabel UPLOAD_PLAN.md, 0 draf.

## SELESAI (2026-11-26, sesi 1)
- #1–#10 semua sudah diisi metadata + dijadwalkan (dialog konfirmasi tiap nomor: tanggal/jam sesuai UPLOAD_PLAN.md).
- Tabel Shorts: #1–#5 "Dijadwalkan". #6–#10 masih mengupload file saat dicatat; jadwal ikut tersimpan dan berlaku setelah upload+proses selesai. Tab Studio harus tetap terbuka sampai semua upload 100%.
- Server 8767 boleh dimatikan setelah semua upload selesai (file sudah ada di memori tab).
- Upload berikutnya: lanjut dari Rab 2 Des 2026 13.00 (slot Sen–Jum 13.00 & 19.00, Sab–Min 10.00 & 19.00).
