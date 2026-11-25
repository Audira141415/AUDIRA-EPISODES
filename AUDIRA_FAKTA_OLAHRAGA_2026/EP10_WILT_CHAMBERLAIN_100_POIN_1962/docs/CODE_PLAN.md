# EP10 code plan (s3 → s4 handover, 2026-11-24)

Sudah ditulis di `studio/src/scenes/ep10/` (belum di-typecheck, belum dirender):
- `timing.ts` — T (semua kata pemicu dari TIMING.md), IMPACT = T.poin100, CUT B1..OUT, sceneAt, CUTS.
- `sets.tsx` — looks (WILT_LOOK h 1.08, cream(i) Warriors, dark(i) Knicks, SUIT), poses (holdPose, shootPose(f,k), grabPose, stumblePose, sitHoldPose, writePose), Ball, HOOP_X 7.2 / RIM_Y 1.48 / rimAt(s) / FT_X, ArenaLights, Hoop (GLB backboard, `hide wall-frame`), Scoreboard(value, flip) di [0,2.75,-5.6], ArenaSet(t,cheer,score,flip,crowd), RadioTable(position), TownSet(t), LockerRoom, ArchiveSet, paintSheet100, MuseumSet (pedestal 83 / 100 / 81 + "MUSEUM AUDIRA").
- `hud.tsx` — HookTitle(o), Tally(t,a,b,y,made), GameClock(t,a,b,y,from,to). Card/NameCard/Stamp/Flash/DustWipe/Captions/Frame impor dari `../ep02/hud.tsx`.
- GLB sudah disalin ke `studio/public/glb/` (6 file).

Catatan GLB: backboard GLB punya node `wall-frame` melayang di y 2.55–3.58 dan board di y −0.84..0.35 (kaca menghadap +z, net di +z). Karena itu `hide={["wall-frame"]}`, height 1.0, rotasi y = −s·π/2, base y = RIM_Y − 0.3. Rim ring torus sendiri di rimAt(s). Periksa di still; geser bila net tidak sejajar ring.

Belum: `Film.tsx`, `Cover.tsx`, `index.ts`, baris Root.tsx, typecheck, still.

## Film.tsx (rencana kamera, pola `../ep02/Film.tsx`; salin PoolLight + Stage baris 34–75)
- A (0–5.72): ArenaSet score "100", crowd 0.3; Wilt holdPose di [0.3,0,0.6] + Ball; cam [1.6,0.9,3.6]→[0.9,1.0,2.6], target [0.2,1.3,−1], fov 40 (papan skor di atas kepala). HUD: HookTitle o = 1−seg(t,2.4,2.9); Stamp "0 REKAMAN VIDEO" T.rekaman→CUT.B1; Card "AUDIRA · FAKTA OLAHRAGA" kecil di T.audira.
- B1 KOTA: TownSet + SunLights (dari ep02) fog; cam [5,3.2,9]→[1.2,1.0,4] target [0,1.4,0]→[0.6,1.0,−3]. Card "2 MARET 1962" sub "HERSHEY, PENNSYLVANIA" T.tanggal→T.penonton; Card "±4.000 PENONTON" T.penonton→CUT.B2. DustHaze abu-abu di atas cerobong (asap).
- B2 ARENA: ArenaSet crowd 0.15; 5 cream + 5 dark runPose berputar; RadioTable [−1.2,0,4.6] rot π (menghadap lapangan) + announcer SUIT sit di belakangnya; cam [0,2.4,9] fov 42 → T.radio → [−0.6,0.95,6.0] target [−1.2,0.55,4.6] fov 36. Card "WARRIORS vs KNICKS" CUT.B2→T.tv; Stamp "TV: TIDAK ADA" T.tv→T.wartawan; Stamp "WARTAWAN NY: 0" T.wartawan→T.radio; Card "HANYA SIARAN RADIO" T.radio→CUT.C1.
- C1 PAPAN SKOR: Wilt holdPose di [0,0,0]; cam [0.9,1.0,2.4] target [0,0.9,−0.2] → T.kuarter tilt ke papan [0.4,1.4,1.8] target [0,2.6,−5.6] fov 34. score: "0"→"23"@T.q1, "41"@T.ht, "69"@T.q3, flip = seg sekitar tiap waktu (0→1 dalam 0.35 dtk, nilai ganti di tengah). NameCard "WILT CHAMBERLAIN" role "TINGGI 2,16 M" CUT.C1→T.kuarter; Card "KUARTER 1" sub "23 POIN"; "TURUN MINUM" sub "41 POIN"; "3 KUARTER" sub "69 POIN".
- C2 TRIBUN: ArenaSet cheer 1, crowd 40; cam rendah [−2,0.9,−2]→[1.5,0.9,−2] target [*,1.3,−5.5]. Stamp "GIVE IT TO WILT!" T.give→CUT.D1 (size ~80).
- D1 LEMPARAN BEBAS: Wilt di [FT_X,0,0] heading π/2, siklus 1.7 dtk shootPose, bola parabola tangan→rimAt(1) puncak y 2.1 lalu jatuh lewat ring; cam [3.0,1.0,1.6] target [6.0,1.2,0] fov 38 orbit pelan. Card "KARIER: 51%" sub "LEMPARAN BEBAS MASUK" T.persen→T.ft28; Card "MALAM ITU: 28 / 32" T.ft28→CUT.D2 di y 260 + Tally y 470 made = round(28·seg(t,T.ft28,T.ft32+0.8)).
- D2 SALING LANGGAR: kamera atas [0,6.5,4.5] target [0,0,0.2] fov 44 berputar pelan; pasangan dark grabPose ↔ cream stumblePose; Wilt terang dengan pool light; wasit SUIT. Card "KNICKS SENGAJA MELANGGAR" sub "PEMAIN LAIN, AGAR BOLA TAK KE WILT" T.sengaja→T.warriors; Card "WARRIORS MEMBALAS" sub "IKUT MELANGGAR, REBUT BOLA" T.warriors→CUT.E1. Flash kecil (peluit).
- E1 POIN KE-100: GameClock from 46 to 0? (pakai from 46 to 1, a=T.detik46, b=T.umpan); NameCard "JOE RUKLICK" role "UMPAN KE WILT" T.joe→T.wiltMasuk; umpan bola dari [3.6,0.6,1.2] ke Wilt [6.4,0,0.3]; Wilt shootPose naik dekat ring, bola jatuh lewat ring tepat IMPACT; cam [4.6,1.0,2.6] target [6.4,1.2,0] → push [5.8,0.85,1.6] target [6.9,1.45,0]; Flash + Card gold "100" size 150 IMPACT→CUT.E2. Jangan klaim jenis tembakan.
- E2 RUANG GANTI: LockerRoom + LampLights (ep02) lamp [0.8,1.6,0.2]; Wilt sitHoldPose di bangku [0,0.29,−0.45]; Sign paintSheet100 berputar masuk (pola PressScene ep02) dari T.angka ke tangan; humas SUIT writePose di kiri; cam [0.05,0.95,2.0] target [0,0.62,−0.4] fov 40. Card "HUMAS TIM MENULIS \"100\"" T.humas→CUT.E3; Flash fotografer di CUT.E3 − 0.25.
- E3 ARSIP: ArchiveSet + LampLights; cam dolly [−0.9,1.0,1.4]→[0.6,0.95,1.2] target [0,0.5,−0.1] fov 38. Card "DIABADIKAN PERPUSTAKAAN KONGRES AS" T.diabadikan→T.bukti (size 50); Card "BUKTI: FOTO · RADIO · BOX SCORE" T.bukti→CUT.OUT.
- OUT MUSEUM: MuseumSet, pool light di pedestal 100; cam [0,1.4,4.2]→[0.0,1.3,3.0] target [0,1.0,0] fov 40. Card "64 TAHUN BERLALU" CUT.OUT→T.rekor; Card "REKOR TERDEKAT: 83" sub "BAM ADEBAYO · 2026" T.r83→T.angka100; Card gold "100 · BELUM TERSENTUH" T.angka100→OUTRO_AT.
- Captions KEY regex: /^(wilt|100|audira|hershey|radio|23|41|69|51|28|32|46|83|knicks|warriors|ruklick)/i; end T.ikuti + 1.0. Audio `audio/ep10/vo.wav`.

## Root.tsx (Edit kecil saja, sesi lain juga mengedit)
`import * as EP10 from "./scenes/ep10/index.ts";`, SLUG `Ep10: "olahraga-EP10"`, `Ep10CoverA` (30 frame 30 fps 1080×1920), `Ep10Preview`, `Ep10Final` lewat `signed("Ep10", EP10.Film)`.
