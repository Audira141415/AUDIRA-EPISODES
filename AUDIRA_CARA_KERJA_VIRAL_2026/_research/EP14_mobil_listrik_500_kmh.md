# EP14 — Electric car past 500 km/h: research notes

Research date: 2026-11-08. This file holds research only, not a script.
Method: Google News RSS (en-US and id-ID) links were decoded to real URLs and the article HTML was read with curl and Python. The FIA news page was read directly. Wikipedia pages were read through the MediaWiki API (BYD Yangwang U9, SSC Tuatara, Bugatti Chiron, Rimac Nevera). The physics numbers in section 3 are AUDIRA's own calculations from stated assumptions, not from a source.

---

## 1. Viral hook: is it recent?

| Headline | Outlet | Published | URL |
|---|---|---|---|
| "BYD Yangwang U9 Xtreme Jadi Mobil Listrik Pertama di Dunia yang Tembus Batas 500 Km/Jam!" | Mobilinanews (writer "bagas") | **Sat 7 Nov 2026, 08:41 WIB** | https://www.mobilinanews.com/artikel/41077/BYD-Yangwang-U9-Xtreme-Jadi-Mobil-Listrik-Pertama-di-Dunia-yang-Tembus-Batas-500-Km-Jam/ |
| "YANGWANG U9 Xtreme surpasses 500 km/h with speed achievement recognised by the FIA" | FIA (official) | **6 Nov 2026** | https://www.fia.com/news/yangwang-u9-xtreme-surpasses-500-kmh-speed-achievement-recognised-fia |
| "Hold onto your hats: the 2,978bhp Yangwang U9 Xtreme just hit 312.65mph*" | Top Gear | 6 Nov 2026 | https://www.topgear.com/car-news/supercars/hold-your-hats-2978bhp-yangwang-u9-xtreme-just-hit-31265mph |
| "BYD's electric hypercar hits 312 mph, first production car over 500 km/h" | Electrek | 6 Nov 2026 | https://electrek.co/2026/11/06/byd-yangwang-u9-xtreme-first-production-car-500-km-h/ |
| "Yangwang's U9X breaks the 500km/h barrier, but SSC's record still stands" | evo | 6 Nov 2026 | https://www.evo.co.uk/news/209252/yangwangs-u9x-breaks-the-500kmh-barrier-but-sscs-record-still-stands |
| "BYD's 3,000-hp EV crashes at about 280 mph" (the crash before the record) | Electrek | 3 Nov 2026 | https://electrek.co/2026/11/03/byds-ev-crashes-at-280-mph-watch-driver-escape-unharmed/ |

**Record facts.** FIA, Top Gear, Electrek and evo agree on all of these:
- **Speed:** **503.17 km/h** (312.65–312.66 mph).
- **Date:** **1 November 2026**, on the second of two runs that day.
- **Place:** **Sheikh Khalifa Bin Zayed International Road (E11)**, Al Dhafra Region, Abu Dhabi, UAE. This is a public highway, not a test track. A **10 km section was closed**, with a **7 km straight** for the runs.
- **Driver:** **Marc Basseng**, a German endurance racer. He also drove the 496.22 km/h run in 2025.
- **Day 1 (31 Oct):** two runs, best **490 km/h**. Overnight the engineers changed the aerodynamics, suspension settings and tyre pressures.
- **Who confirmed it:** the speed was **recognised by the FIA**. BYD and the FIA also cite **Guinness World Records** titles.

**Verdict:** **Truly recent, not recycled.** The run was on 1 Nov 2026 and coverage ran from 6 to 8 Nov 2026. The older numbers are earlier steps on the same path, not this event:
- 472.41 km/h in Aug 2025.
- 496.22 km/h in Sep 2025.

**Correction to the Mobilinanews headline.** "Mobil listrik pertama" undersells it. The U9 Xtreme is the **first production car of any kind** to pass 500 km/h, petrol cars included. The record is **one-way only** (see section 4).

---

## 2. Verified facts

### A. The record and its history

1. **503.17 km/h on 1 Nov 2026, E11 Abu Dhabi, driver Marc Basseng, FIA-recognised.** It beat the car's own 496.22 km/h by 6.95 km/h.
   - Source: https://www.fia.com/news/yangwang-u9-xtreme-surpasses-500-kmh-speed-achievement-recognised-fia
   - Confidence: **HIGH**.
2. **The U9's speed steps,** per the FIA:
   - 309 km/h in testing in China, Jan 2024.
   - 391.94 km/h at ATP Papenburg, Oct 2024.
   - U9 Xtreme 472.41 km/h, Aug 2025.
   - 496.22 km/h, Sep 2025.
   - Wikipedia calls the Aug 2025 car an "engineering test sample of U9 Track Edition".
   - Source: FIA (above); https://en.wikipedia.org/wiki/BYD_Yangwang_U9
   - Confidence: **HIGH**.
3. **Guinness titles: two or four?** FIA and Top Gear name two: highest speed by a production car in a single-direction run, and by an electric production car in a single-direction run. evo says four, adding fastest EV tyre and fastest road-car tyre for the Giti tyres.
   - Sources: FIA, Top Gear, evo (above).
   - Confidence: **HIGH** for the two; **MED** for four (evo only).
4. **Crash before the record.** BYD released footage on 2 Nov 2026. A U9 Xtreme hit a guardrail during a high-speed test on a closed track in China and lost its rear axle. The driver got out unhurt. The next run reached **457.89 km/h**.
   - Electrek gives the runs as more than 350 km/h, then more than 420 km/h, then a crash while aiming for more than 450 km/h ("about 280 mph"). HotCars says "a reported 224 mph".
   - Sources: https://electrek.co/2026/11/03/byds-ev-crashes-at-280-mph-watch-driver-escape-unharmed/ ; https://carnewschina.com/2026/11/02/byds-3-million-usd-supercar-yanwang-u9-xtreme-crashed-in-china/ ; https://www.hotcars.com/yangwang-u9-top-speed-record/
   - Confidence: **HIGH** that the crash happened; **LOW** on the crash speed.
5. **Throttle on the run.** The onboard video shows Basseng at about **50–60% throttle until 236 mph (~380 km/h)**, and only then flat out.
   - Source: HotCars (above).
   - Confidence: **MED** (one outlet's reading of the video).
6. **Venue prep.** Crews removed stray wire fragments from the road that could have cut the tyres. The overnight work covered battery and motor temperatures, rear-wing angle, rebound damping and tyre pressures.
   - Source: HotCars; Electrek mentions "rear wing, damping, and tire pressures".
   - Confidence: **MED**.

### B. The car

7. **Powertrain.** Four motors (MIIT type **TZ240XYA**), **555 kW each**, **2,220 kW total** (2,977 hp / 3,018 PS). Motors rated to **30,000 rpm**. BYD calls the 30,000 rpm quad-motor setup a world first.
   - Sources: Wikipedia (MIIT data); Electrek; FIA ("more than 3,000 PS").
   - Confidence: **HIGH**.
8. **How the motors reach 30,000 rpm:** **0.1 mm "super-silicon" steel** in the stator, high-strength silicon steel in the rotor, and higher-grade aluminium housings.
   - Source: evo (above).
   - Confidence: **MED**.
9. **1,200-volt architecture** with silicon-carbide electronics. BYD calls it the "world's first mass-produced 1,200V" platform.
   - The battery is a track-grade **Blade Battery, LFP chemistry**, the same chemistry as BYD's cheap city cars.
   - Sources: FIA; Electrek; CarNewsChina (silicon carbide).
   - Confidence: **HIGH**.
10. **Battery: 80 kWh with "30C" discharge.** 80 × 30 = 2,400 kW, which fits the 2,220 kW peak. Power is not constant: evo says output drops to about **2,400 bhp at 20% charge**.
    - Sources: CarNewsChina (2 Nov 2026); evo.
    - Confidence: **MED** for each.
11. **Power-to-weight.** 895 kW (1,200 hp) per tonne, which implies a mass of about **2.48 t** (AUDIRA's calculation: 2,220 ÷ 0.895).
    - Source: CarNewsChina; Top Gear ("1,200bhp-per-tonne").
    - Confidence: **MED** (the mass is derived).
12. **Tyres.** 20-inch wheels with **GitiSport e·GTR2 Pro semi-slicks**, made with Giti Tire. Front width went up from 275 mm to **325 mm**, matching the rear.
    - Wikipedia: the tyres were upgraded in Nov 2026 to Giti tyres rated for **530 km/h**.
    - HotCars: prototypes reached 311 mph in indoor testing by June 2025; the tyres use **aramid-fibre reinforcement**, plus knurling at the rim to stop the tyre slipping on the wheel.
    - Sources: CarNewsChina; Wikipedia; HotCars; FIA ("specialised high-performance tyres developed in collaboration with Giti Tire").
    - Confidence: **HIGH** for Giti semi-slicks; **MED** for the 530 km/h rating and the construction details.
13. **Body control.** DiSus-X active suspension delivers up to **50 kN in 120 ms**, so the car needs no anti-roll bars (and it can jump). Torque vectoring across the four motors.
    - Source: evo; FIA (active suspension, torque vectoring).
    - Confidence: **MED** for the figures.
14. **Production and price.** **30 units** worldwide. A Beijing Auto Show 2026 sale was over **20 million yuan (~Rp48 miliar)**, BYD's most expensive car ever sold.
    - It is unclear whether customer cars get the record tyres.
    - Sources: https://www.cnnindonesia.com/otomotif/20260504202612-603-1355048/yangwang-u9-xtreme-terjual-rp48-m-jadi-mobil-listrik-termahal-byd ; evo; Electrek.
    - Confidence: **HIGH**.
15. **Nürburgring.** **6:59.157**, the production-EV lap record.
    - Source: FIA.
    - Confidence: **HIGH**.

### C. Comparison records

16. **Bugatti Chiron Super Sport 300+:** **490.484 km/h** on 2 Aug 2019 at Ehra-Lessien, driven by Andy Wallace. The car was a *pre-production* prototype, the run was one-way, and TÜV verified it. Bugatti itself said it was not an official record.
    - Sources: https://en.wikipedia.org/wiki/Bugatti_Chiron ; Electrek.
    - Confidence: **HIGH**.
17. **SSC Tuatara.**
    - Oct 2020 claim: 532.93 km/h one-way and 508.73 km/h two-way average, driven by Oliver Webb. It was **disputed**, and SSC later said the run was ruined.
    - Recognised record, 17 Jan 2021: **455.3 km/h (282.9 mph) two-way average** at the Kennedy Space Center landing facility, with owner Larry Caplin driving.
    - Sources: https://en.wikipedia.org/wiki/SSC_Tuatara ; Top Gear; evo.
    - Confidence: **HIGH**.
18. **Koenigsegg Agera RS:** **447.19 km/h** two-way average in 2017.
    - Source: Electrek.
    - Confidence: **MED**.
19. **Rimac Nevera R:** top speed **431.45 km/h** (Wikipedia says 431.6 km/h). On 10 Jul 2025 at Papenburg it set 24 records, including 0–400–0 km/h in 25.79 s.
    - Sources: Electrek; https://en.wikipedia.org/wiki/Rimac_Nevera
    - Confidence: **HIGH**.
20. **The tyre problem.** In Nov 2024, Mate Rimac and Christian von Koenigsegg told Top Gear that 500 km/h was waiting on a tyre that could survive it. John Hennessey worried more about venues: runways are too short and highways are risky.
    - Source: HotCars (citing Top Gear).
    - Confidence: **MED**.

### D. Indonesia

21. **Yangwang is not sold in Indonesia.** On 5 Feb 2026, Luther Panjaitan of PT BYD Motor Indonesia said there were no plans to market the Yangwang brand ("Mungkin brand baru tidak ya").
    - The U8 was shown at GIIAS 2024 and the U9 at GIIAS 2025, only as displays.
    - Source: https://otomotif.kompas.com/read/2026/02/06/132100515/kata-byd-soal-peluang-yangwang-masuk-indonesia
    - Confidence: **HIGH**.
22. **But a Yangwang is listed in Permendagri 11/2026** (vehicle tax base), code **SGH-AWD-30**, NJKB Rp1.508 miliar. The model is not stated.
    - Source: https://oto.detik.com/mobil/d-8459277/mobil-super-mewah-byd-terdaftar-di-indonesia-segini-nilai-jualnya (24 Apr 2026)
    - Confidence: **HIGH** that it is listed. It does **not** mean the car is on sale.

---

## 3. Mechanism step by step (with worked numbers)

**Assumptions for the drag calculations:**
- Air density ρ = **1.2 kg/m³**. Hot desert air is thinner (about 1.15), which helps a little.
- CdA = **0.72 m²** (for example Cd 0.36 × frontal area 2.0 m²). Yangwang has **not** published Cd or frontal area for the record car, so this value is illustrative.

1. **Air is the wall.** Drag force F = ½·ρ·Cd·A·v², and drag power P = ½·ρ·Cd·A·v³.

   | Speed | v (m/s) | Drag force | Drag power |
   |---|---|---|---|
   | 100 km/h | 27.8 | 333 N | **9 kW** |
   | 250 km/h | 69.4 | 2,083 N | **145 kW** |
   | 380 km/h | 105.6 | 4,813 N | **508 kW** |
   | 490.48 km/h | 136.2 | 8,019 N | **1,093 kW** |
   | 503.17 km/h | 139.8 | 8,439 N (~860 kgf) | **1,180 kW** |

   - Doubling the speed from 250 to 503 km/h needs **8.2× the power** (2.013³).
   - The last 12.7 km/h, from Bugatti's 490 to 503, costs **about 8% more power**.
   - Rolling resistance adds roughly 50 kW at 503 km/h (assuming Crr 0.015 and 2.48 t), small next to drag.
   - Read the 2,220 kW peak against this: drivetrain losses, downforce drag and battery sag eat the margin. That is why every extra km/h is hard.
2. **Why 1,200 V.** Current I = P / V. For 2,220 kW: **1,850 A at 1,200 V** versus **5,550 A at 400 V**.
   - Cable and inverter heat goes with I²R, so a third of the current means **one ninth of the resistive heat** in the same conductor.
   - It also means thinner cables, lighter weight, and less cooling. Silicon-carbide switches handle the high voltage efficiently.
3. **Four motors, one per wheel.** Each motor delivers 555 kW to one wheel, so no single shaft or differential has to carry 2,220 kW.
   - The torque vectoring BYD describes adjusts each wheel in fractions of a second. Mobilinanews says "100 kali per detik", which is unverified.
4. **Motor rpm sets top speed.** With an assumed tyre of about **0.70 m diameter** (325/30 R20 type; exact size unverified), 503 km/h is about **3,800 wheel rpm**.
   - A 30,000 rpm motor therefore needs roughly **7.9:1** reduction (AUDIRA's estimate; BYD's ratio is not published).
   - EVs use a **single fixed gear**: no gearbox, no shifting. The car stops gaining speed when the motor runs out of rpm *or* power. That is why BYD had to engineer the motors to 30,000 rpm, using thin 0.1 mm stator laminations to cut eddy-current heat at high frequency.
5. **The battery must empty fast.** "30C" means the pack could in theory drain in 1/30 hour (2 minutes). 80 kWh at 2,220 kW is about **130 s** of full power.
   - The 7 km straight at 503 km/h takes only **~50 s**, so the run fits. But voltage sags as the pack empties and heats, which is why power falls at low charge.
   - This is why the team managed battery and motor temperatures overnight.
6. **Tyres are the real limit.** At 503 km/h the tyre surface moves at 140 m/s. At radius ~0.35 m, the tread feels about **55,600 m/s², roughly 5,700 g**: every gram of rubber pulls outward like 5.7 kg.
   - That pull grows the tyre and builds heat. Hence aramid reinforcement, 530 km/h-rated Giti semi-slicks, and knurled rims to stop slip.
   - Rimac and Koenigsegg said in 2024 that they were waiting on exactly this tyre.
7. **Downforce versus drag.** Downforce keeps the car planted, but wings add drag, and drag costs power by v³.
   - Record cars trim the wing for low drag. evo says the tall swan-neck wing from the earlier car was missing on this run.
   - Too little downforce makes the car unstable, as the 2 Nov crash showed. The overnight change of rear-wing angle on 31 Oct was this trade-off in action.
8. **Partial throttle first.** Below about 380 km/h the tyres cannot use all 3,000 PS without spinning or getting unsettled. Basseng ran 50–60% throttle, then went flat for the high-speed pull (HotCars, MED).
9. **Space.** At 140 m/s the car covers **~140 m every second**. You need a long, flat, clean road, which is why Abu Dhabi closed 10 km of highway and swept it for debris.

---

## 4. Myths and traps

- **"Mobil listrik pertama tembus 500" is true but too small.** It is the first *production car of any kind*.
- **"Rekor resmi dunia" needs a qualifier.** The record is **one-direction only**. The traditional production-car record is a two-way average within an hour, which cancels wind and gradient.
  - Yangwang declined a two-way average, so the **SSC Tuatara's 455.3 km/h two-way** record still stands.
  - Safe line: "mobil produksi pertama yang tembus 500 km/jam, diakui FIA (satu arah)".
- **The Bugatti comparison cuts both ways.** Bugatti's 490.48 was also one-way, on a pre-production car. Bugatti itself did not call it an official record.
- **The SSC 508/532 km/h figures were disputed and withdrawn in effect.** Never cite them as a record.
- **"3,000 hp all the time" is wrong.** Output falls to ~2,400 bhp at 20% charge (evo, MED).
- **The record car may differ from customer cars.** Tyres and aero settings were tuned on site, and it is unclear whether the 30 buyers get the same tyres.
- **Wing confusion.** Mobilinanews describes a tall swan-neck spoiler, but evo says that wing was *absent* on the record car. Do not show a huge swan-neck wing as the record configuration without checking the video.
- **Crash speed:** sources give ~360 km/h to ~450 km/h. Say "kecepatan sangat tinggi", or "saat mengejar 450+ km/jam" (Electrek).
- **Indonesia:** Yangwang is **not** on sale here (BYD Indonesia, Feb 2026). The Permendagri tax listing is not a launch.
- **The drag table uses assumed CdA.** Say "contoh hitungan", not "data BYD".

---

## 5. Hook and curiosity angles (90 s, Indonesian)

1. **"140 meter tiap detik."** At 503 km/h the car covers a football pitch and a bit more every second. "Kedip sekali, mobil ini sudah lewat satu lapangan bola."
2. **"Naik 2× kecepatan, butuh 8× tenaga."** The v³ law in one sentence, with a power bar that explodes as the speedometer doubles.
3. **"Ban yang ditarik 5.700 g."** Every gram of rubber pulls like 5.7 kg. "Yang ditunggu Rimac dan Koenigsegg bukan mesin, tapi ban."
4. **"Baterai yang sama dengan mobil murah."** LFP Blade chemistry, as in BYD's city cars, but at 1,200 V and 30C.
5. **"Sebelum rekor, satu unit hancur."** Mind the order:
   - The crash happened on a closed track in China, before the record. Its date is not confirmed.
   - BYD released the crash footage on 2 Nov, with the 500 km/h attempt still described as coming.
   - The record run itself was 1 Nov, but it was only announced on 6 Nov.
   - Safe line: "Sebelum rekor, satu U9 Xtreme menabrak pembatas saat uji kecepatan. Sopirnya selamat."
6. **"Rekor dengan tanda bintang."** Top Gear put an asterisk on it: one direction only. Who really holds the crown?
7. **"Jalan tol yang ditutup 10 km."** A public highway in the desert, swept for wire fragments.

---

## 6. Visual and 3D beat ideas

- **Hook:** a speedometer flicking 490 → 503 while the car shoots across frame. A "140 m" ruler appears on the road behind it after one second.
- **v³ beat:** a speed slider with drag power as a growing 3D column (9 kW → 145 kW → 1,180 kW), plus airflow streamlines thickening around the body.
- **1,200 V beat:** two cables side by side. A 400 V cable glowing red-hot with 5,550 A, next to a slimmer 1,200 V cable at 1,850 A. Heat ×9 label.
- **Four motors:** an exploded chassis with a motor at each wheel, rotor spinning, and a counter reaching 30,000 rpm. Thin laminations stack up (0.1 mm).
- **Single gear:** one fixed gear pair (motor 30,000 → wheel ~3,800 rpm), with the gearbox shown as "tidak ada".
- **Battery:** a Blade cell pack draining in a ring timer (~130 s full power), with the 7 km straight shown as a 50 s bar inside it.
- **Tyre:** a cross-section with aramid layers. Rubber particles straining outward as arrows labelled "5.700 g". A heat map.
- **Aero trade-off:** a wing angle dial. Downforce arrows down, drag arrows back, and the top-speed readout reacting.
- **Records board:** a leaderboard with one-way and two-way columns: U9X 503.17 (one-way), Bugatti 490.48 (one-way), SSC 455.3 (two-way), Koenigsegg 447.19 (two-way), Rimac 431.45.
- **Brand in scene:** "AUDIRA" on a timing gantry over the E11.

---

## 7. Open questions and unverified items

- Cd, frontal area, and downforce figures for the record car: not published. The drag numbers are assumptions.
- Exact tyre size and gear ratio: unverified (the ratio is AUDIRA's estimate).
- Whether there are two or four Guinness titles (evo says four), and whether GWR has published its own page. Not read.
- BYD/Yangwang's own press release: not read. The FIA page was used as the official source.
- Crash date and speed: the footage was released 2 Nov 2026; the speed is inconsistent across sources.
- "30C" and "80 kWh": CarNewsChina only.
- The "236 mph flat-out point" comes from HotCars' reading of the onboard video.
- Whether customer cars get the 530 km/h Giti tyres: unknown.
- Mobilinanews claims ("torsi 100 kali per detik", swan-neck wing on the record car): single-source and partly contradicted.
- Blocked or unreadable: the CarNewsChina 6 Nov article body (JS-rendered), the Motor1 pages (empty HTML) and Car and Driver (not fetched). WebSearch was not used.
