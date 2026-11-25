# HANDOFF — EP56 Kursi Listrik 1890 (sesi s1 → s2)

Episode: `F:/AUDIRA-EPISODES/FAKTADUNIA/AUDIRA_SEJARAH_NEGARA_2026/EP56_KURSI_LISTRIK_1890`
Brief batch: `../_research/BRIEF_COMMON_B12.md` (jangan edit `_research/*` atau folder episode lain; sesi paralel EP57–EP60).
Sensitif: tanpa tubuh/luka/asap dari tubuh/wajah nyata. Orang nyata = name card + figur generik.

## Selesai (s1)
- Tahap 0 preflight OK. Tahap 1–2: memori GLOBAL/channel/VINTAGEFORGE dibaca; `research/SOURCE_REGISTER.md` disalin.
- Tahap 3 style: **VINTAGEFORGE, 3D Remotion+R3F** (lihat `style/STYLE_DECISION.md`). Cover topik BELUM dirender.
- Tahap 4: `docs/SCRIPT.md` (206 kata incl. header; 191 kata diucapkan). ART_DIRECTION / STORYBOARD / ASSET_MANIFEST / SHOTLIST BELUM ditulis.
- Tahap 5 setup: starter disalin ke `project/` (robocopy tanpa node_modules). `project/node_modules` = junction ke `F:/AUDIRA-SKILL-MOTION/starter/node_modules`; `EP56.../node_modules` = junction ke `F:/AUDIRA-SKILL-MOTION/node_modules` (hoisted three/fiber/drei). Preflight: No blockers. GLB polyfork junction di `project/public/models/polyfork/`. File scaffold lama: `project/src/scenes/Scene*.tsx`, `project/src/EpisodeComposition.tsx` (boleh dihapus; pakai FilmFromConfig). STATUS scaffold lama dipindah ke `docs/STATUS.scaffold.json`.
- Tahap 6 VO **DIKUNCI**: `project/public/audio/vo.wav` 90.96 dtk (Cartesia, speed 1.05, pause dirapatkan ke 0.55 dtk, lead 0.4 dtk sudah di dalam wav → film clock = VO clock, offset 0). Kata: `project/public/audio/vo-words.json` (191 kata, start/end detik film). Timing: `project/public/audio/vo.timing.json`. Mentah: `audio/vo_raw.wav`.

## Anchor kalimat (detik film)
0.45 Kursi listrik dijual… manusiawi | 3.55 Idenya… dokter gigi… gagal total | 8.04 Ini kisahnya, di Audira
10.17 Buffalo… 1881 | 13.96 pekerja dermaga… dinamo… tewas | 19.33 Alfred Southwick, dokter gigi | 23.42 listrik… tiang gantungan | 25.89 Rancangan awalnya? | 27.21 Kursi dokter gigi
28.79 komisi tiga orang… 1888 UU disahkan | 36.25 Lalu bisnis ikut bermain | 38.51 Edison… DC | 40.84 Westinghouse… AC
44.67 AC arus maut | 47.62 Harold Brown… lab Edison | 52.14 Generator… Westinghouse… diam-diam | 57.03 banding… Mahkamah Agung menolak
61.86 6 Agustus 1890, Penjara Auburn | 65.47 William Kemmler… 17 orang | 70.61 seribu volt 17 detik… tidak cukup | 75.12 dua ribu volt | 77.52 sekitar delapan menit | 79.94 "lebih baik pakai kapak"
82.80 Ironisnya AC… menang… stopkontak | 89.11 Ikuti Audira | VO selesai 90.96 → outro card 91.0–94.0 (film 94 dtk = 5640 frame @60)

## Rencana adegan (beats FilmFromConfig; sub-adegan berganti per anchor)
- hook 0–10.17: kursi kayu kosong + tali kulit, spot tunggal, voltmeter kuningan jarum bergetar; kartu "KURSI LISTRIK · 1890" + "\"PALING MANUSIAWI\"?". Frame ±0.3 dtk = cover topik.
- context 10.17–28.79: (a) 10.17 dermaga malam Buffalo, dinamo kuningan + tiang lampu busur, percikan; kartu "BUFFALO · 7 AGUSTUS 1881" (tanpa figur). (b) 19.33 kursi dokter gigi antik di meja parchment, name card "ALFRED P. SOUTHWICK · DOKTER GIGI"; 25.89 elektroda/kabel tembaga muncul di kursi → kartu "KURSI DOKTER GIGI → KURSI LISTRIK".
- main 28.79–44.67: (a) meja komisi, 3 kursi kosong + 3 papan nama (Gerry, Hale, Southwick), dokumen berstempel "UU · 4 JUNI 1888 · berlaku 1 JAN 1889". (b) 36.25 dua generator berhadapan: kiri DC Edison (garis lurus), kanan AC Westinghouse (gelombang sinus); name card masing-masing.
- explanation 44.67–61.86: (a) generator AC dengan busur listrik, poster "ARUS MAUT?" + name card "HAROLD P. BROWN" (tanpa hewan). (b) 52.14 peti kayu stensil "WESTINGHOUSE AC" di gerobak menuju tembok penjara, label "DIPEROLEH DIAM-DIAM". (c) 57.03 palu hakim + dokumen "BANDING DITOLAK · 9 OKT 1889".
- payoff 61.86–82.80: (a) tembok Penjara Auburn → ruang eksekusi, kursi kosong, bangku saksi kosong, kartu "6 AGUSTUS 1890 · AUBURN", "17 SAKSI", name card "WILLIAM KEMMLER · TERPIDANA". (b) 70.61 panel kontrol: voltmeter → 1.000 V, stopwatch hitung 17 dtk, stempel "TIDAK CUKUP"; 75.12 jarum → 2.000 V. (c) 77.52 jam dinding "±8 MENIT"; 79.94 kartu kutipan "Lebih baik pakai kapak." — G. Westinghouse.
- outro 82.80–94: stopkontak modern menyala, kabel tembaga ke lampu kota, kartu "AC MENANG · STANDAR DUNIA"; 91.0 AudiraOutro + AudiraSignature seed "ep56_kursi_listrik_1890".
- GLB: `prison`/`generator` antik tidak ada di katalog (generator yang ada modern). Kursi: `porch-rocking-chair`/`dining-chair` tidak cocok — bangun kursi eksekusi & generator dinamo dari RoundedBoxGeo/silinder material POLISH kuningan/kayu (prop, bukan kubus melayang polos). Cari lagi: clock, crate, gavel, lamp post, desk, bench, socket.

## Next
1. Tulis ART_DIRECTION, STORYBOARD (≥6 baris + kolom Audio), ASSET_MANIFEST, SHOTLIST (untuk `npm run sfx`).
2. Bangun `project/src/episodes/ep56/Film.tsx` dengan FilmFromConfig (lihat `src/templates/example-usage.tsx`, kit `src/kits/vintageforge/`), daftarkan Preview/Final di `src/Root.tsx`, overlay kartu serif SafeLabel + karaoke caption y≈1300.
3. `npm run cover -- <Comp>` → `style/cover-topic.png`; `npm run sfx`; `npm run draft -- <Preview>`; THEME_CHECK; juri buta; gerbang acc render final.

## s2 → s3 (2026-11-23) — riset kode selesai, belum ada file baru ditulis
s2 habis konteks saat membaca API. Tidak ada docs/kode yang ditulis di s2. Temuan agar s3 tidak membaca ulang:
- Template: `project/src/templates/` (`FilmFromConfig`, `quickBeats`, `framingFrom`, moves `hold/pushIn/orbit/crane/truck/reveal/pullOut/settle`). `FilmConfig` = { beats{hook,context,main,explanation,payoff,outro}:{start,end}, startFraming, shots?, scenes (BeatContent menerima {progress,elapsed,duration,t,frame,fps}), background, hdri, exposure, envIntensity, profile, ao, overlay(scale,beat,props), fade, alive, lens }. Pakai beat timing dari anchor di atas (bukan quickBeats): hook 0–10.17, context 10.17–28.79, main 28.79–44.67, explanation 44.67–61.86, payoff 61.86–82.80, outro 82.80–94.
- Kit VINTAGEFORGE: `src/kits/vintageforge/` — palette `VINTAGE_PALETTE` (parchmentSepia #F3EAD6, engravingBrown #3B2818, ironGallInk #1E1B18, agedGold #C5A059, terracottaWash #B85A3F, verdigrisGreen #52796F); `camera/Overlay.tsx` contoh plate serif (DISPLAY.serif dari `core/type/displayFonts.ts`, `useFormat()` dari `core/film/format.ts`); `example/VintageforgeExample.tsx` = setelan lampu (KeyLight `core/scene/KeyLight.tsx` + spotLight hangat + pointLight), `profile=COLOR_PROFILES.VINTAGE_SEPIA_FILM` (`core/render/FinishingPresets.ts`), hdri "warmStudio"; `world/ObjectStage.tsx` contoh brass `MeshPhysicalMaterial metalness 1 roughness .34 clearcoat .3`, `useSurfaceGrain`, `RoundedBoxGeo`, `POLISH.*` (`core/polish/Polish.tsx`).
- HUD: `core/hud/Subtitle.tsx` props {words, frame, fps, offset, maxWords, size, activeColor, baseColor (≥70% opacity krem!), plate, position (px, ±1300)}. `brand/AudiraOutro` {seconds}, `brand/AudiraSignature` {seed, outroSeconds}. Words: `import WORDS from "../../../public/audio/vo-words.json"`.
- Root.tsx: daftarkan `KursiListrikPreview` (PRESETS.preview) + `KursiListrikFinal` (PRESETS.final), 94 dtk.
- AssetModel `<AssetModel id=... assetType=... size ground polish position rotation />` membaca `public/models/polyfork/<type>/<id>.glb` (junction ke E:/ASET). Pilihan GLB (ada lokal): dermaga `pier-deck-section-7047d7`(building), `mooring-bollard-2d4bc9`, `dock-lantern-post-5e58a4`, `dock-warehouse-bf0967`(building, BG), `station-lamp-post-7d14dd`(lampu busur), `wooden-crate-e46521`(peti WESTINGHOUSE), `brass-luggage-cart-e9f20a`(gerobak), `wall-clock-0c555c`(±8 menit), `wooden-bench-661da4`(bangku saksi), `teacher-s-desk-381eeb`(meja komisi), `armchair-980c7c`, `station-clock-post-eaaf63`, `telegraph-pole-line-95e382` + `two-story-house-40f6dc`(outro kota), `pocket-watch-mount-f8ec49`(attachment; stopwatch), `table-candle-lantern-a7b5af`, `battery-wall-section-51b723` / `climbable-stone-wall-0052e0`(tembok Auburn). Kursi eksekusi, kursi dokter gigi, dinamo, voltmeter, panel saklar = bangun dari RoundedBoxGeo/silinder kayu+kuningan.
- SHOTLIST format (sfx/lint): header `Style:`, `Hook:`, `Offset: 0`, tabel `| # | Waktu | Objek | Aksi | Kamera | Teks layar | Beat |`, waktu "a–b" detik film; wajib baris outro "kartu outro AUDIRA" 91.0–94.0 dan AUDIRA muncul di adegan (mis. papan nama/stempel "AUDIRA ARCHIVE").
- Memori VINTAGEFORGE (mustApply): spot/PoolLight hangat di subjek; isi sepertiga bawah dengan prop FG terang yang fokus; jangan overlay 2D gelap; kartu serif ≥1.3×, maks 1 kartu per shot; kuningan envMapIntensity ~3; tidak ada figur terpotong; kabel tembaga carrier L→R. Depth sering mentok 3: rim light + haze + DOF/prop FG tiap adegan.
- Perintah: `npm run cover -- KursiListrikFinal --episode=..` ; `npm run sfx` (baca ../docs/SHOTLIST.md) ; `npm run draft -- KursiListrikPreview` → draft/DRAFT_SHEET.jpg ; juri buta (qa/jury.md) → `audira_style_memory record_score judge jury` ; `draft/THEME_CHECK.md` (G22).

## s3 → s4 (2026-11-23)
Selesai di s3:
- Docs ditulis: `docs/ART_DIRECTION.md`, `docs/STORYBOARD.md` (12 baris + Audio), `docs/ASSET_MANIFEST.md`, `docs/SHOTLIST.md` (18 shot; `shotlist-lint` = 0 red, 6 yellow).
- Kode: `project/src/episodes/ep56/Props.tsx` (prop prosedural kayu/kuningan: ExecChair, Voltmeter, Dynamo, DentistChair, Gavel, Stopwatch, WallClock, Socket, Label canvas-texture, Cable, Arc, Sparks, Floor, BackWall) + `project/src/episodes/ep56/Film.tsx` (FilmFromConfig, beat anchor HANDOFF, sub-adegan per anchor, kamera KEYS absolut via `frame()`, 18 kartu serif maks 1/shot, Subtitle y=1300, AudiraSignature seed `ep56_kursi_listrik_1890`, AudiraOutro 3 dtk). GLB lewat AssetModel (assetType prop/building).
- Root.tsx: `KursiListrikPreview` + `KursiListrikFinal` (94 dtk). `npx tsc --noEmit` tanpa error di ep56.
- BELUM dirender sama sekali: posisi/skala GLB (ukuran `size` ditebak) dan framing kamera belum dicek visual.

Next s4:
1. Cek visual cepat: `npx remotion still src/index.ts KursiListrikPreview --frame=<f>` untuk 6–8 frame (30 fps preview: 0.3s=9, 12s=360, 22s=660, 32s=960, 38s=1140, 47s=1410, 54s=1620, 59s=1770, 63s=1890, 68s=2040, 73s=2190, 79s=2370, 86s=2580) ATAU langsung `npm run draft -- KursiListrikPreview`; perbaiki GLB melayang/terpotong, framing, cahaya.
2. `npm run cover -- KursiListrikFinal --episode=..` → `style/cover-topic.png`; `npm run sfx` (baca ../docs/SHOTLIST.md).
3. `npm run draft -- KursiListrikPreview`, tulis `draft/THEME_CHECK.md` (G22), juri buta subagent (qa/jury.md) → `audira_style_memory record_score` judge jury.
4. Gerbang acc render final (tahap 9): tampilkan contact sheet, skor, durasi 94 dtk, G18c; SendMessage ringkasan ke sesi induk `local_c491555b-6c29-4434-aa53-ad8e1869414e`.
5. Setelah acc: render final + QA + delivery (caption 6 platform, NOTES.md, memory, 3 scheduled review).
