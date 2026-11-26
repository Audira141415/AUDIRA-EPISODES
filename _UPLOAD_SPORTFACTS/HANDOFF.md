# HANDOFF — Upload @AudiraSportFacts (2026-11-26, sesi 1)

## Status
- Jadwal + dasar riset: `UPLOAD_PLAN.md` (slot WIB: Sen–Jum 12.00 & 19.00, Sab–Min 09.00 & 19.00; data dari Studio Analytics heatmap).
- Metadata 15 video: `meta.json` / `meta.js` (key = nomor 1–15; judul, deskripsi, tags). #1 judul sudah ditambah ` #shorts`.
- Draf di Studio (channel UCoDcAA8vcRgpSax9Mjyrllg, tab Content > Shorts): hanya 01–10 yang masuk sebagai draf. **11–15 belum ada di Studio** (cek ulang; bila tetap tidak ada, minta pengguna upload `11_…mp4`–`15_…mp4` dari folder ini).
- SELESAI terjadwal: #1 AC Milan (27 Nov 12:00), #2 Susi Susanti (27 Nov 19:00).
- SISA: #3–#10 (draf), #11–#15 (belum terupload). Jadwal tiap nomor ada di tabel UPLOAD_PLAN.md.

## Resep per draf (Claude in Chrome, tab YouTube Studio)
1. Daftar Shorts: klik "Edit draft" pada baris berjudul `NN …` (judul awal = nama file).
2. Judul + deskripsi via JS (berhasil): ambil `#textbox` dengan aria-label diawali `Add a title` / `Tell viewers`, `focus()`, `document.execCommand('selectAll')`, `execCommand('insertText', false, teks)`.
3. `find` "Show advanced settings" → klik ref. Lalu `find` radio "Yes, AI was used" → klik; textbox "Tags" → klik, `computer type` tags + koma di akhir (JS insertText ke input tag TIDAK jalan).
4. Klik stepper Visibility (koordinat 1118,153 di frame 1568×716). `find` tombol Schedule "Click to expand" → klik.
5. Jam via JS: klik `ytcp-datetime-picker input` (jam), lalu klik `[role=option]`/`tp-yt-paper-item` dengan teks `HH:MM`. Tanggal default = besok (27 Nov); untuk tanggal lain klik tombol tanggal (`#datepicker-trigger`) dan ketik tanggal di input dialog-nya (belum diuji).
6. Verifikasi teks picker, lalu `D.querySelector('#done-button').click()` → dialog "Video scheduled … at HH:MM" → klik Close.
- "Not made for kids" sudah default channel. Zona waktu default GMT+0700.

## Setelah semua terjadwal
- Verifikasi daftar Shorts: 15 baris "Scheduled" dengan tanggal/jam sesuai tabel.
- Hapus hardlink di folder ini hanya bila pengguna setuju (file asli tetap aman, hardlink).

## Update sesi 2 (2026-11-26)
- #3–#10 SELESAI terjadwal sesuai tabel (dialog "Video scheduled" terkonfirmasi tiap nomor).
- Tanggal: klik `ytcp-datetime-picker #datepicker-trigger`, lalu triple-click input tanggal di popup (≈270,130 di frame 1214×723), ketik `28 Nov 2026` / `1 Dec 2026`, Enter. TERUJI.
- Tombol advanced bernama "Show more" (bukan "Show advanced settings").
- Tab Studio harus di-inject `window.__open/__adv/__vis/__fin` ulang setelah reload (TrustedTypes melarang <script>, jadi meta ditempel langsung di argumen).
- #11–#15 tetap belum ada di Studio (Shorts maupun Videos). Menunggu pengguna upload manual.
- Verifikasi akhir sesi 2: 10 baris Scheduled (#1–#10) di Content > Shorts, tanggal sesuai tabel.
- #11–#15 DITUNDA: batas upload harian YouTube tercapai (kata pengguna). Upload ulang file 11–15 setelah limit reset, lalu jadwalkan sesuai tabel (2–4 Des) atau geser bila tanggal sudah lewat.
- SELESAI (sesi 2, lanjutan): #11–#15 diupload pengguna lalu dijadwalkan 2–4 Des sesuai tabel. Verifikasi: 15 baris Scheduled, 0 draf. Tugas tuntas.
- Catatan: koordinat input tanggal bergantung ukuran jendela (1214×723 → 270,130; 1568×662 → 480,116). Screenshot dulu setelah __vis.

## Sesi 2 — tahap #16–#21 (2026-11-26)
- 6 video Sport Facts tambahan (AUDIRA_SHORT_BARU EP09, EP10, EP27–EP30) belum pernah diupload; Studio berisi 25 Shorts (10 Public SB EP01–10, 15 Scheduled #1–#15).
- Hardlink `16_…`–`21_…` + `meta2.json` (key = nomor; title, desc, tags) sudah dibuat. Jadwal di UPLOAD_PLAN.md bagian "Tambahan".
- NEXT: pengguna upload file 16–21 (Create > Upload videos, tutup dialog = draf). Lalu per draf: resep `__open/__adv/__vis/__fin` (lihat atas), ketik tags + koma via `computer type`, tanggal via triple-click input popup (screenshot dulu untuk koordinat), `__fin('<d> Dec 2026','HH:MM')`.
- Verifikasi akhir: 21 Scheduled + 10 Public = 31 baris (baca SEMUA baris, bukan 8 teratas).
- SELESAI #16–#21 (2026-11-26): terjadwal 4–7 Des sesuai tabel. Studio: 31 Shorts = 21 Scheduled + 10 Public (halaman 1 tampil 30, satu Public di halaman 2). Semua video final @AudiraSportFacts sudah ada di Studio.
- Catatan: #21 sempat ditahan dialog "We are still checking your content" (klik Got it lalu Schedule lagi); posisi input tanggal bisa bergeser bila ada banner cek (screenshot dulu).
