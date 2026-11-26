# HANDOFF — Upload @AudiraFaktaDunia (2026-11-26, sesi 1)

## Status
- Channel: Audira Fakta Dunia, Studio channel `UCXSakSCAxvjKhIa0ang18Dg`, tab Content > Shorts.
- Studio berisi 24 Shorts Public (EP01–22, EP27, EP28). 0 draf, 0 scheduled.
- 51 file siap di folder ini (`01_…mp4`–`51_…mp4`, hardlink). Jadwal + dasar riset: `UPLOAD_PLAN.md`. Metadata: `meta.json` (key = nomor).
- File > 10 MB, jadi tool `file_upload` Claude in Chrome tidak bisa. Pengguna upload manual (Create > Upload videos, seret file, tutup dialog = draf).
- NEXT: pengguna upload gelombang 1 (`01`–`15`). Lalu jadwalkan tiap draf.

## Resep per draf (teruji di @AudiraSportFacts, lihat `_UPLOAD_SPORTFACTS/HANDOFF.md`)
1. Shorts list: "Edit draft" pada baris berjudul `NN_…` (judul awal = nama file).
2. Judul + deskripsi via JS: `#textbox` aria-label diawali `Add a title` / `Tell viewers`, `focus()`, `execCommand('selectAll')`, `execCommand('insertText', false, teks)`.
3. Tombol "Show more" → radio "Yes, AI was used" (altered/synthetic) → textbox Tags: klik, `computer type` tags + koma di akhir (JS insertText tidak jalan untuk tags).
4. Stepper Visibility → Schedule (expand). Tanggal: klik `#datepicker-trigger`, triple-click input tanggal di popup (screenshot dulu untuk koordinat), ketik `27 Nov 2026`, Enter. Jam: klik input jam di `ytcp-datetime-picker`, pilih option `HH:MM`.
5. Verifikasi picker → `#done-button` → dialog "Video scheduled" → Close. Bila "We are still checking your content": Got it, lalu Schedule lagi.

## Selesai bila
75 baris di Shorts = 24 Public + 51 Scheduled, tanggal/jam sesuai `UPLOAD_PLAN.md`.

## Update sesi 1 (2026-11-26, lanjutan)
- Pengguna upload 10 file (01–10), semua masuk sebagai draf (judul awal = nama file, mis. `01 SN EP23 …`).
- SELESAI terjadwal: #1 Tembok Berlin (27 Nov 12:00), dialog "Video scheduled" terkonfirmasi.
- SISA: #2–#10 (draf), lalu #11–#51 belum diupload (gelombang berikut: 11–25 setelah limit harian reset).
- Helper JS di tab Studio (hilang bila reload; inject ulang dengan meta dari `meta.json`): `window.M` (key nomor: t,d,g,dt,tm), `__s1(n)` (buka draf, isi judul+desk, Show more, AI=Yes, fokus Tags), lalu `computer type` tags + koma akhir, `__s2(n)` (Visibility, expand Schedule, tanggal+jam), `__fin()` (Schedule + baca dialog), `__close()`.
- Deskripsi SB (tanpa "Created by") ditambah: "Seri Fakta Dunia. Created by Agus Dwi R. AUDIRA. #FaktaDunia #FaktaUnik #Audira".
- SELESAI #1–#10 terjadwal 27 Nov–1 Des sesuai tabel (Studio: 10 Scheduled + 24 Public, 0 draf). Tanggal di `__s2` diisi via JS (insertText ke input popup + Enter), tanpa koordinat. TERUJI.
- NEXT: pengguna upload `11_…`–`25_…` (atau sebanyak limit harian), lalu jalankan `__s1(n)` → `computer type` tags → `__s2(n)` → `__fin()` per nomor; meta 11+ harus di-inject ke `window.M` dari `meta.json`.

## Sesi 1 akhir (2026-11-26 15:15): UPLOAD OTOMATIS LEWAT BROWSER TERUJI
- Pengguna minta Claude upload SEMUA sisa file sendiri (pengguna pulang kerja, tidak ada di depan PC).
- Cara: `python -I F:/AUDIRA-EPISODES/_UPLOAD_FAKTADUNIA/serve.py` (background; 127.0.0.1:8765, endpoint `/c/<i>/<file>` potongan 32 MB, CORS untuk studio.youtube.com). Di tab Studio: tempel `helpers.js`, klik Create → Upload videos, lalu `await __send(['NN_….mp4'])`. File 11 (354 MB) TERKIRIM, dialog upload terbuka (judul `11 SN EP32 KELINCI AUSTRALIA`).
- Jangan jalankan dua server sekaligus (Windows mengizinkan dua bind di port sama → 404 aneh). Cek `Get-CimInstance Win32_Process -Filter "Name like 'python%'"`.
- Tab Claude in Chrome: grup MCP, tab Studio channel UCXSakSCAxvjKhIa0ang18Dg (tabId lama 92552842, cek ulang dengan tabs_context_mcp).
- NEXT: tunggu #11 selesai proses → isi metadata + jadwal (#11 = 2 Des 12:00). Lalu upload #12 dst satu per satu (atau 2–3 per dialog), jadwalkan tiap draf sesuai `meta.json`. Bila muncul pesan batas upload harian ("daily upload limit"), berhenti dan catat nomor terakhir di sini; lanjut besok.
- Selesai bila: 75 Shorts = 24 Public + 51 Scheduled.
