# EP06 — SpaceX Starship: research notes

Research date: 2026-11-06. This file holds research only, not a script.
Method: SpaceX mission pages read through the SpaceX content API (`content.spacex.com/api/spacex-website/missions/<id>`), because spacex.com pages render with JavaScript. Wikipedia was read as raw wikitext. Headlines came from Google News RSS.

---

## 1. Viral hook: is it recent?

| Headline | Outlet | Date (GMT) | URL |
|---|---|---|---|
| "See SpaceX Starship Flight 13 Launch in Stunning 4K Slow Motion" | Yahoo | 4 Nov 2026 | Google News RSS item (not decoded) |
| "SpaceX's next Starship flight set to make history on Friday the 13th" | Teslarati | 6 Nov 2026 | Google News RSS item |
| "SpaceX targets Nov 13 for Starship Flight 15 and first Ship catch" | Drive Tesla Canada | 6 Nov 2026 | Google News RSS item |
| "Starship Flight 15 Targets Nov. 13 Ship Catch" | KeepTrack | 6 Nov 2026 | Google News RSS item |
| "SpaceX will attempt 1st-ever double Starship rocket catch on next test launch, Elon Musk says" | Space.com | 20 Oct 2026 | Google News RSS item |
| "Flight 13 Starship 40 returns home to Starbase, Texas, after months at sea" | Tesla Oracle | 9 Oct 2026 | Google News RSS item |

**Verdict:** The "13th flight test" headline is not the newest event.
- Flight 13 launched on **24 July 2026**. The 4 Nov item is a slow-motion video of that launch.
- The most recent flight is **Flight 14 on 28 September 2026**. It was the first orbital flight.
- The next flight is **Flight 15**, targeted for **13 November 2026** (news reports). It plans the first catch of both stages.
- The best hook is to frame the video as "before Flight 15". Do not present Flight 13 as the latest flight.

---

## 2. Verified facts

### A. Recent flights

1. **Flight 13: 24 July 2026, 5:51 p.m. CT, from Starbase, Texas.** It was the second flight of V3 hardware. Booster 20 flew with Ship 40.
   - The booster's high-thrust boostback ran on all 33 engines, a first for a V3 booster.
   - Only "a subset" of engines relit for the landing burn, so the booster made a **hard splashdown** in the Gulf.
   - The ship deployed **20 Starlink V3 satellites** and relit one Raptor in space.
   - The ship made a soft splashdown in the Indian Ocean and stayed intact.
   - Source: https://content.spacex.com/api/spacex-website/missions/starship-flight-13 (SpaceX text). Booster and ship numbers: https://en.wikipedia.org/wiki/SpaceX_Starship
   - Confidence: **HIGH**.
2. **Flight 13 ship recovery.** Wikipedia says only 5 of the 13 planned landing-burn engines appeared to ignite.
   - Ship 40 was the first Starship to stay intact after tipping over following splashdown. SpaceX recovered it and brought it back to Starbase. News reports dated 9–11 Oct 2026 describe its return.
   - Source: https://en.wikipedia.org/wiki/SpaceX_Starship
   - Confidence: **MED**. The "5 of 13" figure is from Wikipedia only. SpaceX says "a subset".
3. **Flight 14: 28 September 2026, 7:48 a.m. CT.** This was the **first orbital flight** and the first real payload: **26 Starlink V3 satellites**.
   - Booster: one Raptor shut down during the climb. It relit **31 of the planned 33** engines for boostback and **11 of 13** for the landing burn. It then stepped down to 5 engines, then 3, and splashed down in the Gulf.
   - **No tower catch was attempted.** The booster's flight termination system was triggered as a test.
   - Ship: one Raptor Vacuum engine shut down early. One sea-level Raptor then performed the orbit-insertion burn. The ship made its first deorbit burn, then landed with a flip and landing burn on target in the **North Pacific**.
   - Source: https://content.spacex.com/api/spacex-website/missions/starship-flight-14
   - Confidence: **HIGH**.
4. **Flight 14 ending.** Wikipedia says the flight was cut short from a planned 6-orbit, nearly 10-hour mission.
   - Splashdown came about **3 h 8 min** after liftoff. The ship then "tipped over and exploded".
   - Source: https://en.wikipedia.org/wiki/SpaceX_Starship
   - Confidence: **MED**. SpaceX's own text does not mention the explosion.
5. **Flight 12: 22 May 2026, 5:30 p.m. CT.** This was the first flight of V3 / Block 3 hardware and of Raptor 3 engines. It was also the first launch from Pad 2.
   - Booster: partial boostback, then a hard splashdown.
   - Ship: deployed 20 Starlink simulators and 2 modified Starlink satellites that photographed the ship.
   - Source: https://content.spacex.com/api/spacex-website/missions/starship-flight-12
   - Confidence: **HIGH**.
6. **Flight 15 plan.** No earlier than (NET) November 2026, with Booster 22 and Ship 42. SpaceX plans to catch both the booster and, for the first time, the ship, using two launch towers. News on 5–6 Nov 2026 gives a target date of 13 Nov 2026.
   - Sources: https://en.wikipedia.org/wiki/SpaceX_Starship and Google News headlines (Teslarati, KeepTrack, Drive Tesla Canada, 6 Nov 2026).
   - Confidence: **MED**. This is a plan and the date can slip. One outlet (shattered.io, 4 Nov) gave 8 Nov.
7. **First booster catch: 13 October 2024 (Flight 5).** Booster 12 was caught by the "chopstick arms" of the launch tower on the first attempt.
   - The ship splashed down in the Indian Ocean **1 h 5 min 40 s** after launch.
   - Source: https://content.spacex.com/api/spacex-website/missions/starship-flight-5
   - Confidence: **HIGH**.
8. **Later catches.** Wikipedia says catches were done "twice more with Boosters 14 and 15". Flight 7 caught B14. B13 aborted its catch on Flight 6.
   - Source: https://en.wikipedia.org/wiki/SpaceX_Super_Heavy
   - Confidence: **MED**.

### B. Vehicle numbers (marked by version)

9. **Total height**, from the Wikipedia versions table: Block 1 = **121.3 m**, Block 2 = **123.3 m**, Block 3 (V3) = **124.4 m**, Block 4 (planned) = **142 m**.
   - The Wikipedia infobox gives Block 2 = 123.1 m, which conflicts with the table's 123.3 m. Use "about 124 m" for V3.
   - Source: https://en.wikipedia.org/wiki/SpaceX_Starship
   - Confidence: **MED**. This is a tertiary source and has the internal conflict above.
10. **Booster height:** 71 m (Block 1 and 2), **72.3 m (Block 3)**. **Ship height:** 50.3 m (Block 1), 52.1 m (Block 2 and 3), 61 m (Block 4 planned).
    - **Diameter:** **9 m** for both stages.
    - Source: Wikipedia versions table and the Super Heavy article.
    - Confidence: **MED**.
11. **Material:** both stages are **stainless steel**. They are built from stacked, welded steel rings **3.97 mm** thick. The design changed from carbon composite to steel in **December 2018**.
    - Source: https://en.wikipedia.org/wiki/SpaceX_Starship
    - Confidence: **MED**. The steel grade is not given in the sources read here.
12. **Mass:** about **5,300 t** fully fuelled. This comes from summing Wikipedia figures: booster dry 200 t + ship dry 100 t + booster propellant 3,400 t + ship propellant 1,500 t.
    - Confidence: **MED**.
13. **Engine count:** **33 Raptors** on the Super Heavy booster. **6 on the ship**: 3 sea-level Raptors and 3 Raptor Vacuum.
    - Source: SpaceX Flight 12, 13 and 14 texts ("all 33 Raptor 3 engines", "six Raptor engines"; Flight 14 mentions three sea-level Raptors).
    - Confidence: **HIGH**.
14. **Raptor fuel and cycle:** liquid methane plus liquid oxygen, in a **full-flow staged combustion** cycle.
    - Source: https://en.wikipedia.org/wiki/SpaceX_Starship and https://en.wikipedia.org/wiki/SpaceX_Raptor
    - Confidence: **HIGH**. This is widely documented.
15. **Thrust per engine:**
    - Raptor 2 (V2 / Block 2): **230 tf** sea-level, 258 tf vacuum.
    - Raptor 3 (V3 / Block 3): **250 tf** sea-level, **275 tf** vacuum. This is from SpaceX's May 2026 V3 update, which also gives a sea-level engine mass of 1,525 kg (down from 1,630 kg).
    - The long-term Raptor 3 target was 280–300 tf.
    - Source: https://en.wikipedia.org/wiki/SpaceX_Raptor, citing https://www.spacex.com/updates#starship-v3 (the SpaceX page itself was not read; it renders with JavaScript).
    - Confidence: **MED**.
16. **Total booster liftoff thrust:** Block 1 and 2 = **7,500 tf**, Block 3 = **8,240 tf**, Block 4 = 10,000 tf (planned). The infobox gives 80.8 MN.
    - Source: Wikipedia versions table.
    - Confidence: **MED**.

### C. Mechanism

17. **Hot staging, from the planned profile in Wikipedia.**
    - At about **141 s** and roughly **64 km** altitude, the booster shuts down **28 of its 33** engines and keeps **5** running at low throttle.
    - Starship lights its engines while still attached and separates.
    - The V3 booster has a vented interstage built into the forward dome.
    - Source: https://en.wikipedia.org/wiki/SpaceX_Starship and https://en.wikipedia.org/wiki/SpaceX_Super_Heavy
    - Confidence: **MED**. SpaceX texts confirm "hot-staging maneuver" with the ship lighting six engines.
18. **Boostback and return, from the planned profile.**
    - The booster flips so its engines point backward ("directional flip" in SpaceX texts).
    - It relights engines for a **boostback burn** that cancels its forward speed: up to 33 engines on V3 per the Flight 13 text, then 13, then 3 for fine aiming.
    - It steers back with its **grid fins**.
    - About **6 minutes** after launch it lights the inner **13** engines, then drops to **5** for the landing burn, and is caught by the tower arms.
    - Source: Wikipedia, plus the SpaceX Flight 14 text ("11 of the planned 13 engines ... down-selecting to five ... then down to three").
    - Confidence: **MED** for the profile, **HIGH** for the Flight 14 counts.
19. **How the "chopsticks" catch works.**
    - The tower has two mechanical arms on a **carriage**. A cable, pulley and **winch** move the carriage up and down.
    - A **linear hydraulic actuator** swings the arms in and out.
    - Tracks on top of the arms position the vehicle.
    - Landing legs are not needed, which saves mass. The booster lands straight back on the pad.
    - Source: https://en.wikipedia.org/wiki/SpaceX_Starship (launch tower section)
    - Confidence: **MED**.
20. **Booster catch points.**
    - Block 1 and 2: of the booster's grid fins, two carry **hardpoints**. These are used to lift the booster onto the launch mount and to catch it.
    - V3 / Block 3: **3 grid fins instead of 4**, and **the grid fins themselves are the catch points**, so there is no separate catch structure.
    - Source: https://en.wikipedia.org/wiki/SpaceX_Super_Heavy and https://en.wikipedia.org/wiki/SpaceX_Starship (Block 3 section)
    - Confidence: **MED**.
    - The word "pins" does not appear in the sources read here. Use "titik tangkap/hardpoint" instead.
21. **Ship heat shield.**
    - The windward side is covered by **about 18,000 black hexagonal tiles**, rated to **1,400 °C**. The tiles are held on by tile pins welded to the ring stacks.
    - Silica for the tiles is purified at a facility in Cocoa, Florida.
    - Source: https://en.wikipedia.org/wiki/SpaceX_Starship_(spacecraft) and https://en.wikipedia.org/wiki/SpaceX_Starship
    - Confidence: **MED**. The tile count is an older figure and may differ on V3.
22. **Belly-flop.**
    - The ship enters the atmosphere belly-first, falling at about **60°** to the ground.
    - Four flaps (2 forward, 2 aft) steer the fall.
    - Near the end it relights its engines, flips upright and does a landing burn. SpaceX's Flight 13 and 14 texts say "landing flip, landing burn".
    - Source: Wikipedia (spacecraft article) and SpaceX texts.
    - Confidence: **MED** for the 60° figure, **HIGH** for the flip and burn sequence.

---

## 3. Mechanism in 8 animation steps (Bahasa Indonesia)

1. **Dua tingkat, satu menara.** Booster Super Heavy (72 m) di bawah dan kapal Starship di atas. Totalnya sekitar 124 m dari baja tahan karat, diameter 9 m.
2. **Nyala 33 mesin.** Mesin Raptor membakar metana cair dan oksigen cair. Di V3, tiap mesin mendorong sekitar 250 ton-gaya.
3. **Hot staging.** Sekitar menit ke-2,5 di ketinggian kira-kira 64 km, booster mematikan sebagian besar mesinnya. Kapal menyalakan 6 mesinnya *sebelum* lepas, lalu mendorong dirinya menjauh.
4. **Booster putar balik.** Booster berbalik arah, lalu boostback burn menghapus laju majunya dan mengarahkannya pulang ke Starbase.
5. **Sirip kisi mengemudi.** Grid fins mengarahkan booster saat jatuh. Menjelang darat, 13 mesin menyala, lalu tinggal 5 untuk mengerem.
6. **Ditangkap "sumpit".** Dua lengan menara bergerak naik-turun lewat kerekan dan menjepit lewat aktuator hidrolik. Lengan menahan booster di titik tangkapnya (di V3 titik tangkapnya ada di sirip kisi). Tanpa kaki pendarat.
7. **Kapal ke orbit lalu pulang.** Kapal melepas satelit Starlink, lalu masuk atmosfer dengan perut menghadap bawah. Sekitar 18.000 ubin heksagonal hitam menahan panas sampai sekitar 1.400 °C, dan empat sirip mengatur jatuhnya.
8. **Flip dan rem.** Di detik-detik akhir kapal berputar tegak, menyalakan mesin, dan mendarat. Target Flight 15: kapal juga ditangkap menara.

---

## 4. Caveats and disputed points

- **"Flight 13 is the latest" is wrong as of 6 Nov 2026.** Flight 14 (28 Sep) is the latest flight, and Flight 15 is planned for about 13 Nov.
  - If the video goes out after Flight 15, recheck its outcome first: https://content.spacex.com/api/spacex-website/missions/starship-flight-15 returned empty on 6 Nov.
- **No booster catch since the V3 debut.** Flights 12, 13 and 14 all ended in the Gulf: hard, hard, and soft splashdowns. Do not imply that recent boosters were caught.
- **Height numbers differ by source** (123.1 vs 123.3 m for Block 2). Prefer "sekitar 124 m (V3)".
- The 141 s / 64 km / 28-of-33 staging figures describe the *planned profile*. They are not measured on a specific flight. Wikipedia's Super Heavy article gives an older profile: about 159 s, with 3 engines left running. Keep figures generic, for example "sekitar 2,5 menit".
- The ~18,000 tile count and 1,400 °C are older (Block 1 era) figures sourced through Wikipedia.
- Raptor 3 thrust of 250 tf is SpaceX's May 2026 "flight engine" figure. The 280–300 tf figures are targets, not achieved values.
- Flight 14 ship explosion after tip-over: Wikipedia only. SpaceX's page is silent on it.
- All Wikipedia content here reflects edits up to about Oct 2026. Treat it as tertiary.

## 5. Blocked or unread sources

- WebFetch tool: broken (model error). Everything was read with curl and Python instead.
- spacex.com pages render with JavaScript and returned empty HTML. The content API worked.
- `https://www.spacex.com/updates#starship-v3`: not read directly (JavaScript). Cited through Wikipedia.
- FAA pages: not consulted in this pass.
- The Flight 15 mission API entry was empty on 6 Nov 2026.
- `en.wikipedia.org/wiki/List_of_Starship_launches`: not read. The main article covered flights 9–15.
