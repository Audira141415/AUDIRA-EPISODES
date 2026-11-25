# NOTES — Pemilik Dua Kebun, QS Al-Kahfi 32–45 (`EP43`)

> Tahap 10–11. Pelajaran agar episode berikut mulai dari kualitas lebih tinggi. Simpan juga ke motion memory (`append_lesson` worked/failed/fix, `set_best`).

## Yang berhasil (worked)
- PAPERWORLD 2D SVG (pola gold EP18/EP60): kebun kertas berlapis, kartu ayat ornamen, karaoke terbaca; G18c VO 14.3 LU di atas SFX.

## Yang gagal (failed) + perbaikan (fix)
- Juri draf 3.67 dua putaran (material 3, composition 3): kertas terlalu datar, tokoh kecil di bawah frame. Diterima aturan >=3.5.
- G13 gagal di gerbang final (S7 kartu ayat hampir diam, deadPct 6, median 0.021). Fix: track ±110 px + orb f1.6 k0.03 + drift kartu → parked 0%, median 0.041.
- G14 render_batch menolak 2D SVG (tidak ada rig-audit.json; CAMERA_2D_KITS hanya PIXELSTORY). Pengguna memilih render langsung. Lain kali: export rigPose (camera2d.ts) supaya antrean GPU tetap dipakai.
- Render langsung bertabrakan dengan render episode lain: NVENC penuh → part gagal "write EOF"; lanjut x264 --jobs=3 berhasil. Rename tagged.tmp sempat EPERM, mv manual.

## Teknis
- Offset VO: 0 (VO 83.5 dtk, film 86.6 dtk termasuk outro 3 dtk).
- Parameter render: render-final.mjs --encoder=x264 --jobs=3 --concurrency=2 --gl=vulkan, --vo + --sfx (G18), override --skip-rig-gate / --skip-memory-gate / --skip-channel (alasan tercatat di log).
- Final: FINAL_EP43_PEMILIK_DUA_KEBUN.mp4, 1080×1920@60, -13.7 LUFS, TP -1.8 dBFS, metadata AUDIRA ok. Skor final self 3.67.
- Scheduled review: review-pemilik-dua-kebun-24h / -72h / -7d (upload default Kamis 26 Nov 2026 19.00 WIB).

## Pasca-tayang (24j / 72j / 7h)
| Waktu | Views | Avg durasi/retensi | Hook bertahan? | Komentar |
|-------|-------|--------------------|----------------|----------|
| 24j | | | | |
| 72j | | | | |
| 7h | | | | |

## Tahap 8 — Draf (2026-11-24, Sesi B s4)
- `project/scripts/draft.mjs` disalin dari starter (versi proyek: `await` di fungsi non-async).
- Outro: `Ep43Stage` di-unmount setelah outro card opak (t > 84.1) — audit:layout membaca teks S11 di bawah outro (readability cap 2). Handle outro 34→36 px.
- Ceilings draf: semua 5, audit:camera 5/5. G22 THEME_CHECK 8/8 ya.
- Self 4.17. Juri r1 3.67 (material 3, composition 3). Poles r2: kartu ayat S2/S7/S9 ke sepertiga atas + diperkecil, tokoh diperbesar, f3 dapat tokoh pemilik di kebun, serat kertas di Layered, grapes depth 0.5. Juri r2 3.67 (material 3, composition 3).
- **Diterima 3.67 setelah 2 putaran** (aturan ≥3.5). Lesson failed dicatat di motion memory PAPERWORLD.
