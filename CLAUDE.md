# AUDIRA-VIDEO-MOTION — workspace

Aturan produksi (pipeline 11 tahap, gerbang style, branding, VO, QA, caption 6 platform, hemat token) ada di directive global yang sudah termuat di setiap sesi (`~/.claude/CLAUDE.md` → `F:/AUDIRA-ALL-SKILL/.agents/rules/00_audira_master_directive.md`), rule 07 (motion), rule 08 (folder), dan rule 09 (video panjang). File ini hanya berisi hal khusus workspace ini; jangan menyalin isi directive ke sini. Versi panjang lama: `shared/archive/CLAUDE_2026-11-12_before-trim.md`.

**Satu sesi = satu episode** (atau batch kecil ±3 episode). Mulai sesi baru setelah setiap gerbang ✅; lanjutkan dengan `audira_episode_status get` → `audira_render_batch status` → `audira_project_layout check`.

## Aset bersama (`shared/`)
- HyperFrames / motion graphic 2D (hanya bila pengguna memaksa 2D; default = world3d 3D): `shared/styles/studio-motion.css` (9:16, safe zone atas 236 px (panel y 236), bawah 380 px) dan `shared/scripts/studio-motion-kit.js` (`StudioMotion.cameraDrift`, `cameraShake`, `cardEnter`, `popIn`).
- Host manusia: `shared/assets/characters/agus-avatar-sketch.jpg` (sketsa pensil grafit + cat air), panduan tokoh lain di `shared/assets/characters/CHARACTER_GUIDE.md`. Hindari karakter CGI plastik generik.
- SFX: `shared/assets/sfx/` sesuai `catalog.json` (`impact-bass-1`, `whoosh-cinematic`, `pop`, `click`, `glitch`, `riser`).
- Skrip workspace: `scripts/tts-cartesia.mjs` (cadangan bila tool `audira_generate_voiceover` tidak bisa dipakai), `scripts/build-karaoke-captions.mjs` (subtitle karaoke per kata dari timestamp Cartesia).
- Peta workspace: `README.md`.

## Channel (5 channel YouTube)
Sumber data satu-satunya: `CHANNEL_BRAND/<KODE>/ACCOUNT.json`; ringkasan di `CHANNEL_BRAND/CHANNELS.md`. Kode: `EXPLAINED`, `FAKTADUNIA`, `QISSAH`, `SPORTFACTS`, `TECH`.

1. **Seri baru:** `node scripts/channel-of.mjs --guess "<judul/topik>"`. Exit 0 = pakai channel itu dan sebutkan di gerbang style; `RAGU` (exit 3) = tanyakan pengguna sebelum membuat folder.
2. **Folder:** seri baru memakai kode channel sebagai `<AKUN>` (`QISSAH_KISAH_NABI_2026`); `init_series` dengan `account` = `{ code, name, handle }` dari ACCOUNT.json. Seri lama tetap `AUDIRA_…` (rule 08 melarang ganti nama).
3. **Daftarkan:** tambahkan folder seri ke `series` di ACCOUNT.json, lalu `node scripts/build-channel-index.mjs`.
4. **Tanda tangan dan outro:** `<AudiraSignature seed="…" />` dan `<AudiraOutro />` tanpa `handle`/`channel`; keduanya diambil otomatis dari channel seri (`npm run channel`, juga di `check-env` dan `render:final`). Film untuk channel lain dalam satu proyek: `code="<KODE>"`. Jangan pernah menulis `@audira` generik.
5. **Caption sosial** memakai nama dan handle channel yang sama.
6. **Folder channel di root** (`EXPLAINED/` … `TECH/`) hanya berisi seri yang **semua** episodenya final. Setelah episode terakhir lolos QA: `node scripts/move-finished-series.mjs` (dry run) → `--apply` → `node scripts/build-channel-index.mjs` dan `node scripts/build-group-index.mjs`. Jangan memindah dengan tangan.
7. **Path di skrip:** cari root workspace ke atas (folder yang punya `shared/` dan `CHANNEL_BRAND/`), karena seri bisa di `<WS>/<SERI>` atau `<WS>/<KODE>/<SERI>`.
8. Seri yang terpecah digabung lewat `GROUP.json` + `node scripts/build-group-index.mjs`; nama folder episode tidak diganti.
