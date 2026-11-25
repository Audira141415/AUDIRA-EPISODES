# Storyboard — SEJARAH MAKKAH · EP01 · Ka'bah Dibangun Ulang (TIMEFORGE)

Clock: `audio/vo.wav` (locked). VO ends 11:15.4, film 11:35.4 (20 s end screen). Every camera key and event is anchored to a word time in `audio/timeline.json` through `W(chapter, word)`. Code: `project/src/scenes/kabah/` (`ch00.ts` … `ch10.tsx`, `Film.tsx`).

**World layout:**
- **Main stage at the origin:** today's Ka'bah on the white mataf, with the tawaf crowd as points, and the era ring with six miniatures carried over from the cover.
- **Eight era stations** sit on a circle of radius 36 around it: Ibrahim 200°, Quraisy 244°, Zubair 288°, Hajjaj 332°, Kufah 16°, Rebuild 64°, Ghost 110°, Lineup 155°.
- **Between stations:** the camera flies on a continuous monotone-cubic path, over brass "time roads" on the floor.
- **Station visibility:** a station is only present around its own chapters.

**Planes in every shot:**
- **BG:** fogged floor and backdrop.
- **MG:** the 3D set piece.
- **FG:** crowd points, rulers and glows.
- **HUD:**
  - chapter card, top-left, about 3.6 s;
  - callout, top-right;
  - year pills pinned to 3D points.
- **Subtitles:** a bottom-centre band above 120 px, with the active word in gold.

| # | Time | Set | What the camera and the set do (mute-readable) | Audio |
|---|---|---|---|---|
| c00 Hook | 0:01.0–0:24.6 | Main stage | Opens on the approved cover frame with the title. Glides to the Ibrahim miniature ("tanpa atap"), over the ring to the two-door miniature ("rata dengan tanah"), then down to the Hajar Aswad corner ("Hajar Aswad"). Pulls back to the cover framing on "seribu enam ratus tiga puluh satu", with a "± 1631 M" callout. | Impact at 0:00.9, light daf pulse, D drone |
| c01 Intro | 0:25.8–0:39.2 | Main stage | Circles the Ka'bah, then rises to a plan view where eight chapter markers light up one by one ("delapan babak"). Descends to the brass museum plaque "AUDIRA · SEJARAH MAKKAH · EP01" on the ring ("Di Audira"), the one AUDIRA in the 3D world. | Drone, ring glow |
| c02 Bab 1 | 0:40.4–1:39.9 | Ibrahim valley | Dry valley with low hills. The glowing foundation line appears on "fondasi", the "camel hump" stones rise, and stones lift by themselves from a pile and settle in courses ("mengangkut batu"). The walls reach ±9 hasta with no roof and a ground-level door. Low close-up of the hump stones on "punuk unta". Walls are laid down to the base on "dibongkar". | Ney phrase, plucked arpeggio, whoosh in |
| c03 Bab 2 | 1:41.2–3:11.6 | Red Sea shore | **The old building:** the low building darkens with soot ("kebakaran"), shows a water stain ("banjir"), and is taken down course by course into stones laid out on plan. **The night:** night falls and lamps light ("menunggu semalaman"), then dawn. **The new building:** three chests appear on "harta halal". The camera moves to the wreck ("kapal dagang Romawi"); its planks fly to the site; the walls rise to 18 hasta and get a roof. **The Black Stone:** it lies on a cloth whose four corner cords lead to four tribal banners. The cloth rises ("mengangkatnya bersama") and the stone flies to the corner ("dipasang"). No figure and no hands. | Sea ambience 2:23–2:37, chime on card |
| c04 Bab 3 | 3:12.9–4:18.1 | Main stage | **Plan view:** Ibrahim's foundation line over today's Ka'bah. The Hijr area glows on "Hijr Ismail", with a ±6 hasta ruler. **Low side shot:** a ±1.3 m ruler on the marble wall. **Front shot:** a ruler from the ground to the raised door ("pintunya tinggi"). **Three-quarter shot:** ghost outlines of the two ground doors, east and then west ("timur … barat"). | Sparkle on the Hijr glow |
| c05 Bab 4 | 4:19.3–5:26.8 | Zubair station | **Siege and fire:** amber haze ("dikepung"), soot on the stones ("terbakar"). **Behind the curtain:** a curtain rises on four poles while the walls go down behind it. Looking over the curtain on "fondasi Ibrahim terlihat", the foundation line and hump stones show. **The new building:** the longer building rises and is raised by ±10 hasta. The curtain drops; two ground doors glow; the camera orbits from the east door to the west door ("masuk … keluar"). **The stone:** close-up of a silver ring forming around the stone ("diikat dengan perak"). | Chime, sparkle |
| c06 Bab 5 | 5:28.0–6:43.0 | Hajjaj study, then Zubair station, then study | **Map table:** a siege pin on Makkah ("73 H"); a sealed letter travels from Damaskus to Makkah ("mengirim perintah"). **On the Zubair model:** the Hijr part shortens ("Hijr dibongkar"), the west door is bricked up ("ditembok"), the east door rises, and the Hijr wall returns outside. **Back in the study:** a lamp and an open book on a rihal with the quote card "Andai aku mendengarnya…". Marble plan tablets alternate between the Zubair and Quraisy forms; "permainan para raja" quote; "Ibnu Hajar" callout. | Ney, drone |
| c07 Bab 6 | 6:44.2–8:03.4 | Main stage, then Kufah, then main | **The raid:** "317 H · Hari Tarwiyah" callout. The crowd of points dims (non-graphic). The corner becomes an empty dark niche in its silver frame ("dicungkil"), and the "Dibawa ke timur" callout appears. The dots keep circling ("tetap tawaf … sudut itu kosong"). **Kufah station:** coins stack up for "50.000 dinar" and are refused. The map draws Ahsa → Kufah ("muncul lagi"), a sack hangs on the seventh column with a letter ("tiang ketujuh Masjid Kufah"), and the route runs Kufah → Makkah. **Back at the corner:** eight fragments gather into the silver frame ("disatukan dalam bingkai perak"). | Sparkle on "perak" |
| c08 Bab 7 | 8:04.7–9:26.6 | Rebuild flood tank, then main | **Crack and belts:** a stone study model shows hairline cracks, and two brass belts bind it ("sabuk kuningan"). **The flood:** rain starts; brown water rises to half the wall height and leaves a cyan flood line ("setengah tinggi dinding"); lamps and books drift. **The walls come down:** the north (Syami) wall goes down as stones laid out on plan, then the rest ("merobohkan sisa dindingnya"). **The rebuilding:** scaffold rises, granite courses build the 1631 building, and the black kiswah drops over it ("tidak pernah dibangun ulang lagi"). **Back at the main stage:** close-up of the door ("pintu tertua"). | Rain and water 8:30–8:44, drone darkens |
| c09 Bab 8 | 9:27.8–10:19.9 | Glass study model, then main | **The glass model:** the 1996 scaffold, the roof and pillars glow ("kayu atap dan tiang"), the ten marble inscriptions glow, and size lines appear ("± 12 × 10 m, ± 14–15 m"). The three pillars, then the double roof opening its gap, the Bab At-Taubah stair room ("sudut utara"), and the door threshold ruler. **Today's gold door:** close-up with the "Raja Khalid · 1979 · ± 280 kg" callout, then a pull-back for "dimandikan". | Chime |
| c10 Penutup | 10:21.1–11:15.4 | Lineup, then main top view | **The lineup:** a dolly past five versions on one plinth, with year pills highlighted on each name (Ibrahim, Quraisy, Ibnu Zubair, Al-Hajjaj, Murad IV). **"Arahnya tidak pernah berubah":** the camera rises above the mataf while gold lines from every direction converge on the Ka'bah. The Hijr glows ("lebih luas dari yang terlihat"). **CTA:** callouts for the comment question and subscribe (EP02). | Daf pulse, ney, riser |
| End screen | 11:15.4–11:32.4 | Main stage | Quiet cover framing with a slow drift. Two empty dashed frames, left and right (about 30% width each), for YouTube's end-screen elements. Captions off. | Ney line, drone |
| Outro | 11:32.4–11:35.4 | — | `brand/stacked-reversed.svg` on #0B3D2E with "Created by Agus Dwi R.". The signature hides. | Soft impact |

## Shorts (9:16, re-rendered from the same world)

| Short | Length | Hook frame (0–3 s) | Body (reused span of vo.wav) | Ending |
|---|---|---|---|---|
| short01 "Ka'bah Seharusnya Lebih Besar" | 80.8 s (77.8 s narration + 3 s outro) | Plan view of the glowing Hijr with the ±6 hasta ruler. Title "KA'BAH SEHARUSNYA LEBIH BESAR". | c04 from "Dana" (196.08 s) to the end (258.41 s) | End card "Tonton video panjangnya di YouTube Audira" over the two-door model, then the outro |
| short02 "22 Tahun Tanpa Hajar Aswad" | 87.8 s (84.8 s narration + 3 s outro) | The circling crowd and the empty corner ("tetap tawaf"). Title "22 TAHUN TANPA HAJAR ASWAD". | c07 from "Tahun" (409.85 s) to the end (483.80 s) | End card over the payoff lineup, then the outro |

Short timing data: `project/src/scenes/kabah/short01.json` and `short02.json` (segments, source times, words re-timed to the short clock).
