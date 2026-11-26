# NOTES — Saat Umar bin Khattab Menangis di Depan Periuk Berisi Air (`EP17`)

Style HD2D · Remotion + R3F · VO 84.35 dtk · film 88 dtk · juri draf 4.33 LOLOS.

## Gerbang
- Acc render final dari pengguna: "Gas render" (tercatat di STATUS.json stage final, sesi s4).

## Yang berhasil (worked)
- Delapan set (peta, camp, Madinah, Harrah, gudang, Ramadah, kamar, masjid) berganti mengikuti babak VO; tak ada wajah tokoh (sprite piksel dari belakang/siluet), sesuai adab visual Islam.
- Vignette menaikkan separasi subjek. Jangan dilunakkan global untuk mengejar look.json.
- Set kamar (s5): cahaya bulan biru dari jendela (spotLight #7F9CFF + panel jendela) melawan lampu minyak hangat. Kontras hangat-dingin ini menaikkan keyframe diversity 29.3 → 30 tanpa mengubah frame kunci.

## Yang gagal (failed) + perbaikan (fix)
- Film ber-hard-cut perlu audit rig kamera per segmen (draft/rig-audit.json); audit satu rig untuk seluruh film tidak menangkap segmen yang parkir.
- Gerbang look.json (crush per frame ≤ 2%, clipHi 0, diversity ≥ 30) baru ketahuan di sesi C. Cek di sesi B, sebelum juri.
- Set malam camp/gudang/kamar terlalu mirip warna-value → diversity 29.3. Fix: bedakan suhu cahaya per set malam.
- G18c gagal saat render final pertama: VO hanya 11.3 LU di atas SFX (stem −26 LUFS). Fix: TARGET_LUFS −28 di sfx/cues/auto.py, npm run sfx ulang.
- Channel gate gagal: outro kustom (logo + "Created by") tanpa komponen `<AudiraOutro>`. Fix: AudiraOutro.tsx + channelOf.ts dari EP19, `<AudiraOutro seconds={TOTAL - OUTRO_AT} code="QISSAH" />`, kartu kustom di Overlay.tsx dihapus.
- Kandidat promosi dari motion memory: vignette (HD2D), TARGET_LUFS/jobs/concurrency (GLOBAL). Ditawarkan ke pengguna, belum dipromosikan.

## Teknis
- Offset VO: 0 dtk (timeline.json, voEnd 84.35).
- Parameter render: audira_render_batch, --jobs=7 --concurrency=2 --gl=vulkan --encoder=nvenc, --vo=public/audio/vo.wav --sfx=public/audio/sfx.wav (stem −28 LUFS, trim −4 dB).

## Pasca-tayang (24j / 72j / 7h)
Upload terjadwal Minggu 13 Des 2026 19.00 WIB (slot default; ganti bila jam upload sebenarnya beda). Scheduled task: `review-umar-periuk-24h` (14 Des 19.00), `review-umar-periuk-72h` (16 Des 19.00), `review-umar-periuk-7d` (20 Des 19.00). Task jalan hanya saat aplikasi Claude terbuka.

| Waktu | Views | Avg durasi/retensi | Hook bertahan? | Komentar |
|-------|-------|--------------------|----------------|----------|
| 24j | | | | |
| 72j | | | | |
| 7h | | | | |
