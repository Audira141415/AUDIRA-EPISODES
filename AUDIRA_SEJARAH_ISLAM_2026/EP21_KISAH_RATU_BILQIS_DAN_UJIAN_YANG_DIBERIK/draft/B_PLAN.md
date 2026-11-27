# EP21 Sesi B — rencana kode adegan (ditulis s3, 2026-11-27)

Status: tahap 5 (scaffold) dan 6 (VO) SELESAI. Tahap 7 belum mulai menulis kode.

## Sudah ada
- `project/` = salinan EP20 (robocopy tanpa node_modules/out/audio); `node_modules` = junction ke `F:/AUDIRA-EPISODES/AUDIRA_FAKTA_OLAHRAGA_2026/studio/node_modules`.
- `src/scenes/yusuf` sudah di-rename `src/scenes/bilqis`; `YusufFilm.tsx` -> `BilqisFilm.tsx` (ISI MASIH KODE YUSUF). `Root.tsx` masih import `./scenes/yusuf/YusufFilm.tsx` (baris 7, 89–91) → ganti ke Bilqis (`BilqisCover`, `BilqisPreview`, `BilqisFinal`).
- `audio/vo.wav` (88.19 dtk, Cartesia speed 1.1), `audio/vo-words.json`, `audio/vo-lines.txt` (8 paragraf), `public/audio/vo.wav`, `public/audio/vo.timing.json`.
- `src/scenes/bilqis/timeline.json` sudah dibangun (`node src/scenes/bilqis/build-timeline.mjs`): voEnd 88.158, total 91.808, 30 baris l01–l30, parts hook/intro/hudhud/musyawarah/singgasana/samar/kaca/payoff.

## Pola kode EP20 yang dipakai ulang (jangan tulis ulang)
- `time.ts` (W/WE/WL/LS/LE/ramp/win) — pakai apa adanya.
- `pixel.tsx` (PixelSprite voxel), `world.tsx` (Sky, Ground, Scatter, Fire, OilLamp, Moon, textTexture, Walker, Backer, Spot) — pakai apa adanya.
- `camera.ts`: ganti SetId, CUTS, SETS, COVER, SEGMENTS (pola H/M pose, kamera selalu di sisi +z).
- `SetsHall.tsx`/`SetsOut.tsx`: helper `ashlarTex`, `Column`, `Wall`, `Brazier`, `Block`, `House`, `Palm`, `SunDisc` dipakai ulang; set Yusuf diganti set Bilqis.
- `Overlay.tsx`: Pins/Hud/Captions/CoverTitle diganti teks EP21; CoverTitle "SEJARAH ISLAM · EP21", judul "RATU BILQIS / KOLAM?".
- `BilqisFilm.tsx`: LIGHT per set, SET_COMPONENT, signature `seed="ratu-bilqis-ujian" handle="@AUDIRAQISSAH"`, `<AudiraOutro code="QISSAH" />`, font delayRender label "Bilqis fonts".

## Potongan set (CUTS = gap antar baris VO)
| Seg | SetId | Baris VO | Potong di |
|---|---|---|---|
| 0 | glassHook | l01–l02 (0–7.03) | gap(l02,l03) ≈ 7.47 |
| 1 | saba | l03–l07 | gap(l07,l08) ≈ 21.77 |
| 2 | camp | l08 | gap(l08,l09) ≈ 25.5 |
| 3 | temple | l09 | gap(l09,l10) ≈ 31.84 |
| 4 | majelis | l10–l14 | gap(l14,l15) ≈ 43.35 |
| 5 | desert | l15–l17 | gap(l17,l18) ≈ 53.22 |
| 6 | hall | l18–l22 (tiba + disamarkan, 2 pose kamera) | gap(l22,l23) ≈ 66.86 |
| 7 | glassWide | l23–l25 | gap(l25,l26) ≈ 75.55 |
| 8 | hill | l26–l30 + outro | — |

## Isi set
- **glassHook**: kolam air (plane, normal map canvas seeded yang offset-nya bergulir per f) di y −0.15, ikan sprite piksel berenang; di atasnya slab kaca `meshPhysicalMaterial` transmission 0.9, roughness 0.04, ior 1.5, thickness 0.05, clearcoat 1, sambungan emas tipis; tiang pualam; lampu gantung emas (OilLamp/practical hangat). Bilqis sprite BELAKANG, map `BILQIS_LIFT` (hem naik 1 baris → sepatu terlihat, TIDAK betis) mulai di kata "menyingkap". Kamera low dolly di permukaan kaca menuju ujung jubah. Teks "KOLAM?" lalu "SALAH ARAH" (impact di "salah"). Cover = frame t 0.02.
- **saba**: kota bata lumpur (House), kuil matahari pilar persegi, bendungan Marib (dinding panjang + air di belakang), papan gerbang "AUDIRA" (textTexture), Bilqis di balkon dari belakang. Siang terik. HUD: "BILQIS · NAMA DARI RIWAYAT ULAMA", "QS AN-NAML 27:20–44", "PEREMPUAN YANG MEMERINTAH MEREKA (27:23)", kartu "KISAH DI AUDIRA".
- **camp**: barisan burung sprite profil, satu celah kosong ditandai cincin; Sulaiman sangat kecil dari belakang di ujung barisan (jauh). Hud-hud (jambul oranye) muncul di l09 awal? (tidak: Hud-hud tiba di ujung seg 2 dari kejauhan). Kartu "HUD-HUD TIDAK ADA".
- **temple**: kuil Saba senja, disk matahari besar (SunDisc), sprite kecil dari belakang. Kartu "QS 27:22–24", "MENYEMBAH MATAHARI".
- **majelis**: obor (Brazier GLB), meja + gulungan surat bersegel lilin merah (tanpa lafaz), pembesar hood-front dua sisi, kursi ratu dengan berkas cahaya, Bilqis hood-front tanpa wajah. HUD dua pilihan "PERANG" dicoret vs "HADIAH" menyala di "hadiah"; "QS 27:29–35"; "BERMUSYAWARAH".
- **desert**: kafilah unta + peti GLB `chest-dais-d2bc39` (cap AUDIRA) + `coin-hoard-heap-07b6e4` berjalan BALIK arah setelah "menolak"; istana jauh di cakrawala; di "berkedip" kilatan cahaya + singgasana GLB `looted-gilded-throne-008fc3` melesat. Kartu "HADIAH DITOLAK", teks kinetik "SEBELUM MATAMU BERKEDIP" + "QS 27:40".
- **hall**: aula pualam, singgasana mendarat dengan flash di "tiba" (hold 0.5 dtk), lalu `cut-ruby-3ded3a`/`cut-emerald-74d180` terlepas melayang mulai "dicopot", kain berganti warna di "disamarkan"; Bilqis masuk dari tirai, kamera orbit 40° berhenti di belakang bahu. Kutipan "SEAKAN-AKAN ITULAH DIA" (27:42), kartu "IBNU ABBAS · IBNU KATSIR", "CERDAS".
- **glassWide**: lorong kaca panjang di atas air, refleksi tiang, Bilqis melangkah; sambungan emas menyala satu per satu; "BUKAN AIR · KACA" + "QS 27:44" di "kaca".
- **hill**: fajar biru→emas, Bilqis dari belakang mengangkat tangan (map DUA), panorama istana + lembah, kutipan "AKU BERSERAH DIRI · KEPADA ALLAH, TUHAN SELURUH ALAM" (27:44), label "AYAT TIDAK MENYEBUT SUJUD", kartu akhir "KISAH LAIN DI AUDIRA".

## Sprite baru (sprites.ts)
- Bilqis: jubah merah-anggur (#7A1E34 / #561428), kerudung krem + mahkota emas piksel; maps BACK, WALK_A/B, LIFT (tangan memegang hem di sisi, hem naik 1 baris), DUA (dua tangan terangkat), HOOD_FRONT duduk (majelis).
- Sulaiman: hanya BACK kecil (camp, px 0.026), jubah hijau tua.
- Burung profil (merpati abu, gagak hitam, elang cokelat) + Hud-hud (jambul #FF8A2A, sayap belang).
- Ikan kecil profil (oranye/perak). Pembesar: pakai BRO_FRONT palet bangsawan Saba.

## Adab (wajib)
Sulaiman hanya jauh/belakang; ujung jubah Bilqis sebatas mata kaki; tidak ada lafaz Allah di objek dunia (segel surat polos); jin tidak digambar; tidak ada wajah.

## Sisa langkah sesudah kode
`npm run typecheck` → stills per beat → cover-topic.png (`npm run cover` / stills BilqisCover → `style/cover-topic.png`) → `docs/SHOTLIST.md` + `npm run sfx` dengan `TARGET_LUFS = -28` di `sfx/cues/auto.py` → `node scripts/channel.mjs --check` → contact sheet draf 8 frame + `npm run audit:visual` (crush ≤2%, clipHi 0, diversity ≥30) → `npm run audit:rig` per segmen → `draft/rig-audit.json` → `draft/THEME_CHECK.md` → skor self + juri buta (`qa/jury.md`) `record_score stage draft`.

## Progres s4 (2026-11-27)
- SELESAI: `sprites.ts` (BILQIS_BACK/WALK_A/B/LIFT/DUA/SEAT, SULAIMAN_BACK, NOBLE_FRONT, SABA_BACK, PIGEON/CROW/HAWK, HUDHUD/HUDHUD_FLY, FISH_ORANGE/SILVER, CAMEL_GIFT), `camera.ts` (SetId 9 set, CUTS, COVER, SEGMENTS pose per kata). GLB chest/coin/ruby/emerald disalin ke `public/models/polyfork/`.
- BELUM: SetsHall.tsx (glassHook, majelis, hall, glassWide + komponen GlassFloor/Water: water opaque y −0.1 normal map tileable bergulir, ikan sprite rebah di atas air, slab kaca transmission y 0, sambungan emas), SetsOut.tsx (saba, camp, temple, desert, hill), Overlay.tsx, BilqisFilm.tsx, Root.tsx.
- Tata letak yang dipakai camera.ts: hook Bilqis [0,0,−0.3]; saba balkon Block [0,0,0.7] tinggi 0.6, Bilqis [0,0.6,0.62], gerbang AUDIRA x 0.7–1.7 z −1.6 papan y 1.15, kuil kiri [−1.3,0,−3], bendungan z −5; camp tenggeran sepanjang x −1.6..1.2 z −0.5 y 0.18, celah x 0.42, Sulaiman kecil [−1.5,0,−1.4] px 0.028; temple SunDisc [0,1,−14], Bilqis [0,0,−1.6], hud-hud terbang ke [0.5,0.32,−0.2]; majelis meja [0,0,0.3] tinggi 0.4, singgasana GLB + Bilqis SEAT di z −1.5, bangsawan x ±0.65..0.95; desert kafilah kiri→kanan lalu balik di "menolak", singgasana melesat di "berkedip"; hall singgasana [0,0.14,−1.0], Bilqis jalan dari [−1.2,0,0.4] ke [−0.25,0,0.15]; glassWide koridor z 1.5..−10, Bilqis z 0.5→−0.5; hill Bilqis BACK→DUA di "berserah".

## Progres s5 (2026-11-27)
- SELESAI (belum typecheck): `SetsOut.tsx` ditulis ulang — `SabaSet` (balkon, kota rumah-menara, SunTemple kiri, gerbang AUDIRA x 1.2 z −1.6, bendungan Marib z −5 + waduk), `CampSet` (tenggeran x −1.65..1.2, 12 burung, cincin emas di celah x 0.42 mulai "tidak", tenda GLB canvas-ridge-tent, tripod, Sulaiman kecil belakang, hud-hud terbang dari jauh `hudhudCamp`), `TempleSet` (senja, SunTemple, kerumunan SABA_BACK, Bilqis [0,0,−1.6], hud-hud mendarat di batu [0.5,0.32,−0.2] `hudhudTemple`), `DesertSet` (`caravanAt` maju lalu balik di "menolak", sled peti GLB + cap AUDIRA + koin, `Palace` di cakrawala z −8, `throneStreak` singgasana melesat di "berkedip"), `HillSet` (matahari naik, Palace di lembah, Bilqis BACK→DUA `raised` di "berserah", Sulaiman kecil [0.95,0,−1]). Ekspor untuk Overlay: `SABA`, `CAMP`, `TEMPLE`, `DESERT`, `HILL`, `caravanAt`, `throneStreak`, `hudhudCamp`, `hudhudTemple`, `raised`. `Walker` di-import tapi tak terpakai (hapus bila typecheck mengeluh).
- BELUM: Overlay.tsx (masih Yusuf: ganti import ke `BILQIS_HOOK, COUNCIL, THRONE_HALL, hallState, corridorState` dari SetsHall + ekspor SetsOut di atas; PINS/HUD per B_PLAN; CoverTitle "SEJARAH ISLAM · EP21" / "RATU BILQIS" / "KOLAM?"; daftar set siang untuk vignette 0.5 = saba, camp, desert, hill; matte lift = majelis, glassHook, glassWide), BilqisFilm.tsx (LIGHT 9 SetId baru, SET_COMPONENT semua `React.FC<{t,f}>` tanpa c0/c1), Root.tsx.

## Progres s6 (2026-11-27)
- SELESAI: `Overlay.tsx` ditulis ulang untuk EP21 (PINS 16 label per set, HUD per baris VO: KOLAM?/SALAH ARAH, NAMA DARI RIWAYAT ULAMA, QS 27:23, QS 27:20–44, KISAH DI AUDIRA, TIDAK ADA, KABAR DARI SABA, MENYEMBAH MATAHARI, SURAT SULAIMAN 27:30, BERMUSYAWARAH, PERANG dicoret vs HADIAH 27:32–35, HADIAH DITOLAK, 27:38, 27:40 SEBELUM MATAMU BERKEDIP, TIBA, DISAMARKAN, IBNU ABBAS, 27:42 x2, IBNU KATSIR CERDAS, KOLAM, BUKAN AIR · KACA 27:44, 27:44 x2, AYAT TIDAK MENYEBUT SUJUD, KEPADA ALLAH, MENUNGGU DI AUDIRA). CoverTitle EP21. Vignette 0.5 saba/camp/desert/hill; matte lift majelis/glassHook/glassWide.
- `Walker` dihapus dari import SetsOut. `npm run typecheck`: 0 error di scenes/bilqis dan Root (sisa error hanya starter: lucide-react, scene-qa, kits film16/inflatable — bawaan, abaikan).
- Stills 17 frame BilqisPreview: `draft/beats/` (`_sheet.jpg`, `look.json`). Ceiling: lighting 5, material 5, depth 5, composition 3, readability 4, diversity 42.9.
- Temuan yang WAJIB diperbaiki (s7):
  1. composition cap 3: frame 1578 (desert 52.6 dtk) "SEBELUM" menimpa "MATAMU" 21% → di Overlay `giant()` lineHeight 1.0 terlalu rapat untuk 3 baris 150 px; beri `lineHeight: 1.12` atau ukuran 130.
  2. readability cap 4: signature `@AUDIRAQISSAH` 34 px < 36 (bawaan AudiraSignature; cek prop size di BilqisFilm).
  3. Hook glassHook (3.0 & 6.6 dtk) dan glassWide kolam2 (71.5): kamera terlalu dekat, sprite Bilqis BACK memenuhi frame jadi blok piksel raksasa; lantai kaca/air TIDAK terbaca (G22 gagal). Mundurkan kamera (jarak ≥1.6, rendah di permukaan kaca, target di ujung jubah), tampilkan kaca+ikan di bawah, Bilqis ≤ 1/3 tinggi frame.
  4. Saba 9.0 dtk: Bilqis sprite juga terlalu dekat/terpotong; 16.0 dtk tanpa subjek jelas (pin bilqis hilang). Mundurkan.
  5. Majelis 39/42.9: singgasana+Bilqis SEAT terlalu besar di tengah, pembesar tak terlihat; tarik kamera agar meja surat + pembesar dua sisi masuk.
  6. Hall 54.3 "TIBA": flash terlalu putih (hampir clip) — turunkan flash pointLight/overlay veil di detik itu.
  7. Temple 30.0: bagus tapi sprite kecil; hill 80.5/86 ok; camp ok (cincin celah terbaca).
- Belum: cover-topic.png, SHOTLIST + sfx + channel check, contact sheet draf 8 frame + audit:visual + audit:rig, THEME_CHECK, skor self + juri.
