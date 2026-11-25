# NOTES — EP01 PENGGANTI GIBRAN WAPRES
**Style:** BROADCASTFORGE | **Engine:** Remotion 2D | **Final:** 2026-11-21

---

## Pelajaran Produksi

### Yang Berhasil (worked)
- **CSS gradient grid** (`repeating-linear-gradient` rgba 0.28) — survives JPEG downscale untuk contact sheet. SVG data URL dengan stroke tipis tidak bertahan. Gunakan CSS gradient di semua episode 2D ke depan.
- **3-part outro** (header text / brand card / CTA) — mengisi frame 9:16 secara merata. Jangan pakai SVG `objectFit: contain` sendirian tanpa surrounding content.
- **Render dari `Final` composition (1080×1920)**, bukan Preview — panel S5 dan S6 tidak terpotong. Selalu render stills contact sheet dari Final comp.

### Yang Gagal (failed)
- **SVG data URL grid** di CSS background-image — hilang di JPEG downscale. Jangan ulangi.
- **3D BROADCASTFORGE** (R1-R5) — 1 objek studio sepanjang film, motion score selalu 2. Untuk BROADCASTFORGE gunakan 2D multi-scene dengan komponen HTML/CSS terpisah per babak.
- **Render stills dari Preview composition** — kliping bottom elements (y > 960px). Fatal untuk komponen S5+.

### Offset VO
- Cartesia TTS voice ID `04b567df-2923-4b0c-896b-4b7df0a07e1a`
- Speech duration: 75.70s actual, padded to 90s
- VO offset: 0s (render-final.mjs default)

---

## ScheduledTask IDs (review pasca-tayang)
- `review-berita-viral-10-nov-ep01-24h` — 2026-11-22 19:00 WIB
- `review-berita-viral-10-nov-ep01-72h` — 2026-11-24 19:00 WIB
- `review-berita-viral-10-nov-ep01-7d` — 2026-11-28 19:00 WIB

Task berjalan saat Claude Code app terbuka. Jika tertutup saat jadwal tiba, task jalan saat app dibuka lagi.

---

## Upload Aktual
Upload dilakukan: 2026-11-21 (slot malam WIB).
Perbarui dengan jam aktif follower dari analytics setelah 2–4 minggu.
