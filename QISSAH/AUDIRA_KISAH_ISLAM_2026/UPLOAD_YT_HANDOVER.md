# HANDOVER — Upload YouTube AUDIRA KISAH ISLAM 2026

Channel: **@AUDIRAQISSAH** (UCw-Ehx4ibG9O_G366TAnZJw). Via **Claude in Chrome**.
Jadwal lengkap: `UPLOAD_YT_SCHEDULE.json`. Hardlink file: `_UPLOAD_YT\EP10.mp4 … EP35.mp4`.

## Status (update 2026-11-13, sesi 2)
- **EP01–EP09**: sudah tayang sebelum (Public). Dilewati.
- **EP10–EP18**: SEMUA **Scheduled ✅** (14–18 Nov, 2/hari). Selesai.
  (EP10 14/19:00, EP11 14/20:30, EP12 15/19:00, EP13 15/20:30, EP14 16/19:00, EP15 16/20:30, EP16 17/19:00, EP17 17/20:30, EP18 18/19:00)
- **EP19**: TERNYATA tak ikut terupload di ronde 1 (hanya 9 file masuk, bukan 10). Masuk ronde 2.
- **EP19–EP35 (17 video)**: **belum diupload**. Ronde 2.

## Ronde 2 (langkah manual pengguna)
YouTube Studio → Create → Upload → pilih **EP19.mp4–EP35.mp4** dari `_UPLOAD_YT` (17 file; dialog batas ~10 file/sekali, jadi mungkin 2 putaran). Lalu isi tiap draf dengan cara di bawah. Jadwal tiap EP di `UPLOAD_YT_SCHEDULE.json` (EP19 18 Nov 20:30, EP20 19 Nov 19:00, dst, 2/hari sampai EP35 26 Nov 20:30).

## Trik penting (terbukti sesi 2)
- Jam: **jangan ketik** (ctrl+a bisa select seluruh halaman) — pakai `form_input` ref time-textbox value "HH:MM".
- Kalender: **sering meleset** ke Dec. Buka kalender → screenshot → kalau bukan NOV pakai panah prev (<) → klik tanggal → **verifikasi via find** ("17 Nov 2026") sebelum lanjut.
- Verifikasi hasil pakai `find` "Video scheduled ... at HH:MM" (screenshot sering freeze).

## Cara isi tiap draf (modal Edit draft, window 1568x698)
1. Content → Shorts → "Edit draft" di baris EP##.
2. Judul: klik field (~648,240), Ctrl+A, Delete, ketik judul (format `<Topik> | Kisah dalam Al-Quran #Shorts`).
3. Deskripsi: klik field (~648,395), ketik. **WAJIB verifikasi deskripsi masuk** (EP12 sempat kosong — kalau preview video ter-fullscreen, Escape menutup modal; deskripsi bisa hilang). Kalau kosong, buka `studio.youtube.com/video/<ID>/edit`, isi deskripsi, Save.
4. Scroll bawah → audience sudah "No, not Made for Kids" (default). Klik **Show more** (~472,518) → scroll → **AI use = Yes** (~439,463).
5. **Next** ×3 ke Visibility.
6. **Schedule**: klik panel (~650,510) → date dropdown (~515,405) → kalender, klik tanggal (verifikasi via find, klik kalender sering meleset).
7. Time: **jangan ketik** (ctrl+a bisa select seluruh halaman). Pakai `form_input` ref time field, value "HH:MM" — andal.
8. Timezone default = GMT+0700 Local (WIB), tak perlu diubah.
9. Klik **Schedule**. Verifikasi "Video scheduled ... at HH:MM" via find.

## Catatan
- Screenshot sering **freeze** (preview video berat). Pakai `find` / `read_page` untuk baca status; form_input untuk isi field.
- Deskripsi tiap EP = pola sama (topik + "Seri AUDIRA QISSAH..." + audira.my.id + 5 hashtag + ⚠️ label AI). Lihat contoh di draf EP10–14 yang sudah jadi.
- Semua judul/tanggal/jam final ada di `UPLOAD_YT_SCHEDULE.json` (sumber kebenaran).

## Lanjut di sesi baru
Buka sesi baru (model lebih murah boleh), baca file ini + `UPLOAD_YT_SCHEDULE.json`, cek Content→Shorts untuk status terkini, lanjut EP15.
