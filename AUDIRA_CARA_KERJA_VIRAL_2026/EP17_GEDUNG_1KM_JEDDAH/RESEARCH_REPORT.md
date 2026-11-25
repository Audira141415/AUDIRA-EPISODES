# EP 17: Satu Kilometer ke Atas: Cara Membangun Jeddah Tower

AUDIRA, seri CARA KERJA VIRAL. Created by Agus Dwi R. Status: final dengan voice-over, 9 November 2026.

Riset dari sumber yang dibaca langsung 9 November 2026. Setiap fakta berlabel HIGH, MED, atau LOW; naskah hanya memakai HIGH dan MED.

# EP17 — How do you build a 1-kilometre tower? Jeddah Tower: research notes

Research date: 2026-11-09. This file holds research only, not a script.
Method: Google News RSS (English and Indonesian) links were decoded to real URLs through Google's batchexecute endpoint (rate-limited with HTTP 429 part of the time), and article HTML was read with Python urllib. Arabian Business, MEP Middle East, Time Out Dubai/Jeddah, ENR and Thornton Tomasetti returned **HTTP 403** to scripts and to WebFetch, so their articles are known by headline only. The smithgill.com project page redirects to a 404. DuckDuckGo and Bing returned no results to scripts. Engineering detail therefore comes mainly from Newsweek interviews (Oct–Nov 2026), New Civil Engineer (2016), KONE's own releases and Wikipedia (tertiary, MED).

---

## 1. Viral hook: is it recent?

| Headline | Outlet | Published | URL |
|---|---|---|---|
| "Jeddah Tower Kejar Rekor Gedung Tertinggi Dunia pada 2028" | bsinews.id (cites detikcom, Arabian Business) | **8 Nov 2026** (meta 2026-11-08T02:18Z) | https://bsinews.id/pembangunan-jeddah-tower-rekor-dunia |
| "Gelar Gedung Tertinggi Dunia Burj Khalifa Berakhir 2 Tahun Lagi" | detikProperti (cites Time Out Dubai, Arabian Business) | 8 Nov 2026 | https://www.detik.com/properti/berita/d-8743359/gelar-gedung-tertinggi-dunia-burj-khalifa-berakhir-2-tahun-lagi |
| "Future World's Tallest Tower Faces El Niño Challenge Before Major Milestone" | Newsweek | 7 Nov 2026 | https://www.newsweek.com/when-jeddah-tower-overtake-burj-khalifa-worlds-tallest-building-el-nino-challenge-12675550 |
| "Jeddah Tower targets 2028 completion as $1.9bn construction work advances on 1km skyscraper" | Arabian Business | 6 Nov 2026 | https://www.arabianbusiness.com/real-estate/jeddah-tower-completion-date-2028 (403, headline only) |
| "Jeddah Tower reaches 120 floors as Saudi city emerges as global engineering showcase" | Zawya (press release, London Construction Magazine) | 5 Nov 2026 | https://www.zawya.com/en/press-release/research-studies/jeddah-tower-reaches-120-floors-as-saudi-city-emerges-as-global-engineering-showcase-1993219 |
| "Future World's Tallest Building About to Hit Major Construction Milestone" | Newsweek | 30 Oct 2026 | https://www.newsweek.com/future-worlds-tallest-building-hit-major-construction-milestone-jeddah-tower-12643303 |
| "Jeddah Tower Reaches 486M As Construction Progresses To 121st Floor" | MEP Middle East | 29 Oct 2026 | https://www.mepmiddleeast.com/news/jeddah-tower-reaches-121st-floor-486-m (403, headline only) |
| "How Jeddah Tower tackled the unusual problem of shrinking concrete after its construction delay" | Arabian Business | 8 Nov 2026 | https://www.arabianbusiness.com/abnews/how-jeddah-tower-tackled-the-challenge-of-shrinking-concrete-after-its-five-year-construction-delay (403, headline only) |

**Verdict:** **Recent and live.** The 8 Nov Indonesian wave (bsinews, detik, Demokratis, cwibc) rewrites two fresh items: the Jeddah Economic Company CEO's "late 2028" statement at Saudi Mega Projects 2026 (via Time Out Dubai) and Kingdom Holding's **2 Nov 2026** progress update (120 floors, ~482 m). Newsweek's interviews from the Vertical Urbanism Summit in London (late Oct 2026) are also new. The story is an ongoing construction race, not a single discovery, so "pekan ini menara itu tembus lantai 120" is safe. Avoid "sudah selesai" or "sudah lebih tinggi dari Burj Khalifa": it is still under 500 m.

---

## 2. Verified facts

### A. Status (late 2026)

1. **120 floors, about 482 m, as of 2 Nov 2026.** Kingdom Holding report: more than **322,000 m³** of concrete poured, over **3,900 façade panels** installed, MEP work advancing.
   - Source: Zawya press release (above); bsinews/detik citing Arabian Business. Confidence: **HIGH** (consistent across three outlets, one origin).
2. **Contractor figures differ slightly.** SBG's Ian Norman Miller told Newsweek (published 30 Oct) "We've reached 484 meters", at the 121st floor; MEP Middle East headline says 486 m. The halfway mark (500 m, **floor 125**) was expected "around Thanksgiving" (late Nov 2026).
   - Source: Newsweek 30 Oct. Confidence: **HIGH** for the quotes. Use "sekitar 480-an meter".
3. **Pace.** Miller: "Lately we've been working at a rate of **four floors a month**." Indonesian outlets (via Time Out Dubai) say an average **five-day cycle per floor** and about **5,200 workers**.
   - Source: Newsweek 30 Oct (HIGH); detik 8 Nov (MED, secondary, Time Out 403).
4. **Target: 2028.** JEC CEO **Fabien Toscana** at Saudi Mega Projects 2026: complete by **late 2028** (detik via Time Out Dubai, MED). Miller: passing Burj Khalifa "sometime around the **third quarter of 2028**"; Peronto (Thornton Tomasetti): structural top-out "somewhere around that **Q4**" 2028. AS+GG's Ben Johnson: "Nominally, yes, it is still on track" for ~Aug 2028, noting "complete" has "a wide window".
   - Source: Newsweek 30 Oct and 7 Nov. Confidence: **HIGH** (quotes).
5. **Weather risk.** Miller: another year of "the Super El Niño wind to deal with" could force a "pause for a week or two"; summer 2026 winds slowed work until mid-August.
   - Source: Newsweek 7 Nov. Confidence: **HIGH**.
6. **History.** Construction started **1 April 2013**; piling done Dec 2013; structural concrete halted **Jan 2018** at roughly a third (around floor 63, ~252 m); re-tender 2023; restart **January 2025**; 80th floor by Jan 2026; **100th floor 14 April 2026**.
   - Source: Wikipedia "Jeddah Tower"; Dezeen/Newsweek headlines (Apr 2026). Confidence: **MED** (tertiary; dates consistent with news headlines).
7. **Contract.** Kingdom Holding announced a **SAR 7.2 billion** agreement for remaining works in **October 2024** (≈ US$1.9 bn, matching Arabian Business headline).
   - Source: Zawya. Confidence: **HIGH**.
8. **Team.** Developer Jeddah Economic Company; main contractor **Saudi Binladin Group**; architect **Adrian Smith + Gordon Gill**; structural engineer **Thornton Tomasetti**; engineering support Dar Al-Handasah; project management Turner. Adrian Smith designed Burj Khalifa while at SOM.
   - Source: Zawya; KONE/Cision release Oct 2025; Newsweek. Confidence: **HIGH**.
9. **Height.** Publicly "more than 1,000 m"; exact final height kept private. Wikipedia: "at least 1,008.2 m". Total floors widely reported as **157+** (bsinews, El Cronista).
   - Confidence: **HIGH** for ">1 km"; **MED** for 1,008.2 m and 157.
10. **Burj Khalifa** for comparison: **828 m**, 163 floors, concrete pumped to a record **606 m**, foundation of **192 piles** (1.5 m × 43 m).
   - Source: Wikipedia "Burj Khalifa". Confidence: **MED** (tertiary, widely known).

### B. Structure and wind

11. **Three-legged "buttressed core".** A triangular central core with three wings joined by continuous shear walls; **no columns**, **no transfer structures**. Walls **1.2 m** thick at the base to **600 mm** at the top. Same family as Burj Khalifa and the CN Tower.
   - Source: New Civil Engineer, 13 Sep 2016 (Bob Sinn, Thornton Tomasetti), https://www.newcivilengineer.com/archive/super-tall-super-smart-jeddah-tower-13-09-2016/. Confidence: **HIGH** (design-stage source).
12. **Why three.** Peronto: "the minimum number of legs…for stability is three." The base **flares out** to spread gravity loads without very thick walls; "What really drives these structures…is…enormous gravity loads."
   - Source: Newsweek 24 Jun 2026, https://www.newsweek.com/engineer-worlds-tallest-skyscraper-reveals-hidden-detail-jeddah-tower-12114384. Confidence: **HIGH** (quotes).
13. **Tapering confuses the wind.** Burj Khalifa's 27 spiral setbacks reduce "vibration wind loading from eddy currents and vortices" (Wikipedia). Jeddah's wings taper with inclined walls that "contribute to aerodynamic stability" (Wikipedia). Physics: vortex shedding makes alternating low-pressure vortices behind a bluff body; if their frequency matches the structure's, it resonates (Wikipedia "Vortex shedding").
   - Confidence: **MED** (tertiary). Use as a general explanation, not a quoted claim.
14. **Three wind-tunnel test types with RWDI.** High-frequency force balance at **1:800** (~1.25 m model), pressure-integration model at **1:600** (~1.7 m) plus a **1:400** top model, then an **aeroelastic** model that actually moves. A companion model was tested in a second tunnel. Sinn: "the building is very well behaved."
   - Source: NCE 2016. Confidence: **HIGH**.
15. **Spire dampers.** Two tuned mass dampers, about **870 t** and **260 t**, at levels 206 (826 m) and 218 (874 m), only for the unoccupied spire; ~30% motion reduction. Occupied tower predicted comfortable without dampers.
   - Source: Wikipedia. Confidence: **MED** (single tertiary; NCE 2016 confirms dampers ~750 m up the spire, lifted in 6–8 t pieces).
16. **Structural switch near 700 m.** Weismantle (AS+GG): at the "sky raft" the structure changes "from a core with sheer walls" to "the silo—a structural tube", which changes the contractor's methodology. Sky terrace at about **630 m** (Newsweek 2026; NCE 2016 said 638 m, planned strand-jack lift of a **750 t** steel structure taking 90–100 hours).
   - Source: Newsweek 7 Nov 2026; NCE 2016. Confidence: **HIGH** for quotes; strand-jack plan is 2016 and may have changed (**MED**).
17. **Atmospheric boundary layer claim.** Peronto: "about a third of it is above the atmospheric boundary layer", where peak storm loads are lower.
   - Source: Newsweek 24 Jun 2026. Confidence: **MED** (engineer's quote; Newsweek itself describes the layer as typically 1–3 km thick, which sits awkwardly with the claim. Quote, do not restate as fact).

### C. Foundation and concrete

18. **Piled raft.** **270 bored piles**, 1.5–1.8 m diameter, **45–105 m** long (deepest under the core), raft **4.5–5 m** thick (~18,000 m³). Ground is reef limestone with cavities; cavities filled with sand-cement; **cathodic protection** against salty groundwater corrosion.
   - Source: Wikipedia (MED); NCE 2016 confirms "5 m thick, 18,000 m³ concrete raft" (HIGH for raft).
19. **Pumping above the record.** Savoy (Mace, 2016): concrete continues to 40–50 m from the top; "There's no pump that will get the concrete to the top." Plan: **two-stage pumping**, first to about **500 m**, then a second pump. Mix must satisfy strength, modulus of elasticity and pumpability; **21 mixes** trialled, **6** passed; 500 m horizontal pumping trials before vertical.
   - Source: NCE 2016. Confidence: **HIGH** for the 2016 plan; whether the 2025 restart kept it is **not verified**.
20. **Shrinkage.** Sinn: all walls are connected, so there are no isolated columns to shorten on their own; "differential shortening" not a major problem. Arabian Business (8 Nov 2026) separately reports a concrete-shrinkage challenge after the five-year pause (headline only).
   - Confidence: **HIGH** (Sinn quote), **LOW** for the 2026 details (not read).
21. **Cranes jump with the building.** Cranes on the core and each wing climb hydraulically; as wings taper, only the core crane remains. Savoy: "The cranes are the life blood of the structure."
   - Source: NCE 2016. Confidence: **HIGH**.

### D. Elevators

22. **Current KONE order (Oct 2025).** 67 units total: **29 MiniSpace elevators up to 10 m/s**, **7 MiniSpace DoubleDeck**, **2 JumpLift** construction elevators, 21 MonoSpace, 8 escalators, destination control. **Four** elevators use **KONE UltraRope** (carbon-fibre core) for the **over 630 m** ride to the world's highest observation deck, cutting energy "by up to 15%".
   - Source: KONE/Cision, https://news.cision.com/kone-oyj/r/kone-to-equip-jeddah-tower--the-world-s-tallest-building-to-be-in-saudi-arabia-with-people-flow--sol,c4246903. Confidence: **HIGH**.
23. **Why steel ropes fail.** Steel rope self-weight limits a single run to about 500 m (Burj Khalifa's longest run is 504 m); UltraRope designed for runs up to 1 km.
   - Source: Wikipedia; KONE. Confidence: **MED** for the 500 m figure.
24. **Worker travel time.** 2016 estimate: up to **13 minutes** to reach a work area; ~10% of a worker's production time; up to 14 permanent lifts to be finished early for construction use.
   - Source: NCE 2016. Confidence: **HIGH** (2016 estimate).

---

## 3. Mechanism in 7 animation steps (Bahasa Indonesia)

1. **Pondasi menancap ke karang.** 270 tiang bor sampai ~105 m ke tanah karang berongga, diikat pelat beton setebal 5 m. Pelat "mengapung" di atas tiang supaya turun merata.
2. **Denah huruf Y / tiga kaki.** Inti segitiga di tengah, tiga sayap menopang seperti tripod. Tiga adalah jumlah kaki minimum agar stabil.
3. **Dinding, bukan kolom.** Semua beban ditahan dinding beton yang saling menyambung (1,2 m di bawah, 60 cm di atas).
4. **Makin tinggi makin ramping.** Sayap menyempit, bentuk tiap ketinggian berbeda, jadi pusaran angin di belakang gedung tidak sempat "berbaris" dan mengayun gedung.
5. **Diuji di terowongan angin.** Model 1:800, 1:600, lalu model aeroelastik yang ikut bergoyang.
6. **Beton dipompa estafet.** Pompa pertama sampai ~500 m, pompa kedua meneruskan; derek memanjat bersama gedung.
7. **Lift tali karbon.** Tali baja terlalu berat untuk lintasan >500 m; UltraRope berinti serat karbon membawa pengunjung lebih dari 630 m sekali jalan. Di puncak, peredam massa ratusan ton menenangkan menara.

---

## 4. Myths, traps and caveats

- **"Sudah jadi / sudah salip Burj Khalifa."** Wrong. ~482 m in Nov 2026; passing 828 m expected around Q3 2028.
- **"Tingginya pasti 1.000 m."** Final height not disclosed; say "lebih dari 1 kilometer".
- **"Lantai 120 = 482 m vs 486 m."** Numbers differ by source and date; round to "sekitar 480 meter".
- **KONE "2026" pages are old.** Google News shows the KONE press release "World's fastest doubledeck elevators..." dated 4 Nov 2026, but the page says **published 05/10/2015** and promises completion "in 2018". The KONE story "Vertical limit" (indexed 26 Oct 2026) is also 2016-era text. Use the **Oct 2025 order** only.
- **Elevator numbers vary** (54, 57, 67 units; 630/634/640/660 m) by year. Use KONE 2025: 67 units, ride "lebih dari 630 m".
- **"Lift 10 m/s tercepat di dunia"** should not be said. KONE's 2015 "world's fastest" claim was for **double-deck** elevators only; single-deck lifts in other towers (e.g. Shanghai Tower) are generally reported faster, but no source for those speeds was read in this pass. Safe claim: "perjalanan lift terpanjang/tertinggi".
- **Mile-high (1.6 km) design** was an earlier concept AS+GG denies; not this tower.
- **Concrete pumping record.** Wikipedia says Burj's 606 m; Savoy in 2016 said "about 624 m". Do not give a specific record figure without a source; say "melampaui rekor pompa beton".
- **Boundary-layer quote** is an engineer's view, not settled science; frame as "kata insinyurnya".
- **Fire refuges:** Burj Khalifa has pressurised refuge floors every 13 floors (Wikipedia). **No source found** for Jeddah's refuge plan. Do not claim a number.
- **SBG ownership trivia** (bin Laden family): avoid; irrelevant and sensitive.

---

## 5. Hook and curiosity angles (90-second Indonesian video)

1. **"Satu kilometer. Ke atas."** Lay the tower on its side over a familiar road (e.g. 1 km of jalan tol) then stand it up. Strongest.
2. **"Kenapa gedung tertinggi dunia berkaki tiga?"** Tripod logic: three legs is the minimum for stability (Peronto).
3. **"Angin adalah musuh terbesar, bukan gravitasi... atau malah gravitasi?"** Peronto says gravity drives the design; wind shapes it.
4. **"Tidak ada pompa yang bisa mendorong beton sampai puncak."** The two-stage relay.
5. **"Tali lift dari baja akan putus oleh beratnya sendiri."** Carbon-fibre UltraRope.
6. **"Empat lantai sebulan, dan El Niño bisa menghentikannya."** Live construction race to 2028.
7. **"Mangkrak 7 tahun, sekarang ngebut."** 2018 halt at ~250 m to 480 m in under two years.

---

## 6. Visual / 3D beat ideas

- **Scale opener:** Monas, Burj Khalifa (828 m) and Jeddah Tower silhouettes side by side; a height ruler ticks past 828 m to "1.000+ m".
- **X-ray foundation:** camera dives below ground: piles as glowing rods into porous coral rock, raft slab locks them.
- **Y-plan extrusion:** top-down triangle core + three wings, extruded upward; wings slide inward as it rises (tapering).
- **Vortex demo:** wind-tunnel smoke flowing past a straight box (alternating vortices, box shakes) vs the tapered tower (vortices broken up, calm). Label "simulasi ilustratif".
- **Concrete relay:** cutaway slickline, pump 1 to ~500 m, pump 2 onward; jump-crane climbs.
- **Elevator race:** steel rope sagging with its own weight vs thin carbon UltraRope; car rises >630 m to the sky terrace disc.
- **Spire dampers:** huge pendulum blocks swaying opposite to the spire.
- **Progress bar:** live counter "Lantai 120 / 157+ · 482 m" with a 2028 calendar. Good spot for an AUDIRA HUD label.

---

## 7. Open questions / unverified

- Arabian Business articles (concrete shrinkage after the delay; "architects reveal how they plan to build"; $1.9 bn piece) and MEP Middle East: **403**, not read.
- Whether the 2016 two-stage pumping plan, strand-jacked sky terrace and concrete strengths still apply after the 2025 restart.
- Exact concrete compressive strength (MPa) used: no source read.
- Fire/evacuation refuge floors and evacuation-lift strategy for Jeddah: not found.
- Worker heat/pressure measures at height: not found. Do not claim.
- CTBUH (now the **Council on Vertical Urbanism**) Skyscraper Center page loaded without data; official CTBUH figures not read.
- Total floor count (157 vs other numbers) and final height: not officially confirmed.
- Time Out Dubai/Jeddah originals (5-day cycle, 5,200 workers, CEO quote): 403, known only via detik/bsinews.
