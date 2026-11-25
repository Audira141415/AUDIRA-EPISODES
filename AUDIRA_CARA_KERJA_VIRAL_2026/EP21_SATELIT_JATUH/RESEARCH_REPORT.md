# EP 21: Teleskop NASA Terbakar di Langit Sumatera: Cara Satelit Jatuh ke Bumi

AUDIRA, seri CARA KERJA VIRAL. Created by Agus Dwi R. Status: final dengan voice-over, 9 November 2026.

Riset dari sumber yang dibaca langsung 9 November 2026. Setiap fakta berlabel HIGH, MED, atau LOW; naskah hanya memakai HIGH dan MED.

# EP21 — How a satellite falls back to Earth (re-entry): NASA Swift over North Sumatra — research notes

Research date: 2026-11-09. This file holds research only, not a script.
Method: Google News RSS (Indonesian and English), with links decoded to real URLs through Google's batchexecute endpoint, plus Bing News RSS as a fallback. Article HTML was read with Python urllib (browser User-Agent, normal TLS) and tags were stripped. Primary sources read directly: the **NASA Swift blog** (science.nasa.gov, posts of 23 Oct and 2/4 Nov 2026), the **ESA Space Debris Office** page "Reentry and collision avoidance" (esa.int), **NOAA Ocean Service** (Point Nemo) and **NASA's ISS transition FAQ**. Space-Track TIP data was read second-hand through **KeepTrack** (radar analyst T. Kruczek), which quotes the TIP messages. BRIN statements come from **Kompas.id** interviews with Prof. Thomas Djamaluddin. The Aerospace Corporation (aerospace.org, CORDS) returned HTTP 403 on every page, so its numbers come via Kompas.id, Leonard David and KCRA/CNN. Reuters returned 401.

Confidence tags: **HIGH** = primary source or 3+ independent outlets agree; **MED** = one good secondary source; **LOW** = single weak source or my inference.

---

## 1. Viral hook: is it recent?

| Headline | Outlet | Published | URL |
|---|---|---|---|
| "NASA's Swift Observatory Re-Entered Atmosphere" (primary; first posted 2 Nov, updated 4 Nov) | NASA Science blog | 2 Nov 2026, updated **4 Nov** | https://science.nasa.gov/blogs/swift/2026/11/02/nasas-swift-observatory-to-re-enter-atmosphere/ |
| "NASA's Swift Mission Ends Ahead of Re-Entry" (primary) | NASA Science blog | 23 Oct 2026 | https://science.nasa.gov/blogs/swift/2026/10/23/nasas-swift-mission-ends-ahead-of-re-entry/ |
| "Satelit NASA Seberat 1,4 Ton Jatuh di Sumatera, Apa Penyebabnya?" | DW Indonesia | 5 Nov 2026 | https://www.dw.com/id/satelit-nasa-jatuh-di-sumatera-utara-ini-penjelasannya/a-79862219 |
| "Satelit NASA Jatuh di Atas Sumatra Utara, Terbakar Usai 20 Tahun Mengorbit" | Kompas.com (body is the DW text) | 6 Nov 2026 | https://www.kompas.com/global/read/2026/11/06/174935870/satelit-nasa-jatuh-di-atas-sumatra-utara-terbakar-usai-20-tahun-mengorbit?page=all |
| "Teleskop NASA Hari Ini Bisa Jatuh di Wilayah RI, Begini Cara Pantau" | CNBC Indonesia | 4 Nov 2026 | https://www.cnbcindonesia.com/tech/20261104120705-37-782205/teleskop-nasa-hari-ini-bisa-jatuh-di-wilayah-ri-begini-cara-pantau |
| "Satelit NASA Jatuh di Langit Sumatra Utara" | CNBC Indonesia | 6 Nov 2026 | https://www.cnbcindonesia.com/tech/20261106093149-37-782870/satelit-nasa-jatuh-di-langit-sumatra-utara |
| "Teleskop Swift Jatuh di Atas Sumatera Utara, Pecahannya di Selat Karimata hingga Kalimantan Selatan" (BRIN interview) | Kompas.id | 5 Nov 2026 | https://www.kompas.id/artikel/teleskop-swift-jatuh-di-atas-sumatera-utara-pecahannya-di-selat-karimata-hingga-kalimantan-selatan |
| "Yang Hancur dan yang Bertahan di Kejatuhan Teleskop Luar Angkasa Swift" (forecasts) | Kompas.id | 4 Nov 2026 | https://www.kompas.id/artikel/yang-hancur-dan-yang-bertahan-di-kejatuhan-teleskop-luar-angkasa-swift |
| "NASA's Neil Gehrels Swift Observatory reenters over Western Indonesia" | Spaceflight Now | 4 Nov 2026 | https://spaceflightnow.com/2026/11/04/nasas-neil-gehrels-swift-observatory-reenters-over-western-indonesia/ |
| "SWIFT Reentry Window Narrows to 1 Hour as Latest TIP Places It Near Sumatra" | KeepTrack | 5 Nov 2026 | https://keeptrack.space/reentry-watch/reentry-28485 |
| "Fall is in the Air: Swift's Uncontrolled Reentry Underscores Issues" | Inside Outer Space (Leonard David) | 6 Nov 2026 | https://www.leonarddavid.com/fall-is-in-the-air-swifts-uncontrolled-reentry-underscores-issues/ |
| "NASA's Swift Space Telescope Re-Enters Atmosphere With Five Times More Risk Of Casualties Than Anticipated" | Jalopnik | 4 Nov 2026 | https://www.jalopnik.com/2307383/nasa-swift-space-telescope-re-enters-atmosphere-five-times-more-risk/ |
| "An aging NASA space telescope is plunging back to Earth..." (AP text) | CBS News | 2 Nov 2026 | https://www.cbsnews.com/news/nasa-telescope-swift-observatory-plunging-back-to-earth/ |
| "NASA's Swift space telescope is about to crash to Earth. Where will it fall?" | Space.com (Leonard David) | 1 Nov 2026 | https://www.space.com/space-exploration/missions/nasas-swift-space-telescope-is-about-to-crash-to-earth-where-will-it-fall |
| "A 3,200-pound NASA observatory plunged back to Earth today" (CNN text) | KCRA | 4 Nov 2026 | https://www.kcra.com/article/nasa-swift-observatory-earth-reentry-debris-risk/74333058 |

**Which spacecraft:** the **Neil Gehrels Swift Observatory** (NASA, NORAD 28485, COSPAR 2004-047A). It was a gamma-ray-burst space telescope, so "satelit" and "teleskop" both fit. It is **not** Hubble. Hubble also has a re-entry story, projected around 2033–2034 (Kompas.id), which may confuse readers.

**Verdict:** The story is **fresh and accurate in its core**. Re-entry was **Wednesday 4 Nov 2026, 12:39 UTC = 19:39 WIB**, over North Sumatra. Two headline details are loose. "20 tahun" (Kompas.com) is really **almost 22 years** (launched 20 Nov 2004). "Jatuh di Sumatera" means **entered the atmosphere above** Sumatra. Any surviving fragments kept flying along the track (see 2C).

---

## 2. Verified facts

### A. The spacecraft

1. **Name and job:** Neil Gehrels Swift Observatory. Three telescopes: BAT (Burst Alert Telescope), XRT (X-ray) and UVOT (ultraviolet/optical). It hunted gamma-ray bursts, "the most powerful explosions in the cosmos" (NASA). HIGH.
2. **Launch:** 20 Nov 2004 on a Delta II from Cape Canaveral (Spaceflight Now; KeepTrack: Delta 7320-10C, SLC-17A). Designed for a **2-year** prime mission (NASA). HIGH.
3. **Original orbit:** about **585 × 604 km**, inclination **20.6°** (Wikipedia infobox; Kompas.id "600 km"; inclination 20.6° in NASA's assessment via TOI and Kompas.id. KeepTrack lists 20.5°). HIGH.
4. **Mass:** NASA says **"roughly 3,200-pound"** ≈ **1,450 kg** (NASA statement quoted by CBS/AP; DW gives 1,452 kg; Live Science 1,450 kg). Catalogue launch mass is **1,470 kg** (KeepTrack, Wikipedia). Space.com rounded to "3,300 lb (1,500 kg)". The "1,4 ton" (DW) and "1½-ton" (AP) labels are both roundings of this. HIGH.
5. **No propulsion:** "Swift had no engine" (Spaceflight Now). Swift could never raise its own orbit. HIGH.
6. **Science legacy:** more than 2,000 gamma-ray bursts, more than 1,400 supernovae, and about 7,000 papers (Spaceflight Now, citing NASA). HIGH. Cost: "500 juta dolar AS" (DW/Kompas.com). MED (one syndicated text).
7. **Named after** Neil Gehrels, the principal investigator, who died in 2017. The mission was renamed in 2018 (Kompas.id; SpaceNews via Wikipedia). HIGH.

### B. Why it fell: the decay timeline

| Date | Event | Source |
|---|---|---|
| 2024 | Sun at the peak of its 11-year cycle. Flares and CMEs expanded the upper atmosphere and raised drag | KCRA/CNN, MED-HIGH |
| Sep 2025 | NASA says Swift needs a boost. It was projected to drop below 300 km by Oct 2026 without one. **$30 million** contract to Katalyst Space (Arizona) | Wikipedia, Spaceflight Now, TOI. HIGH |
| 3 Jul 2026 | Katalyst's robotic tug **LINK** launches on a Pegasus XL from Kwajalein, Marshall Islands | Spaceflight Now, NASA blog title via Wikipedia. HIGH |
| Jul–Aug 2026 | LINK has attitude-control problems and starts spinning. It gets no closer than **7–9 miles (11–14 km)** from Swift | AP via CBS/LA Times. HIGH |
| 19 Aug 2026 | NASA and Katalyst call off the capture | Spaceflight Now. HIGH |
| 23 Aug 2026 | Last "stable" mean altitude **349.5 km** | KeepTrack (from 117 element sets). MED |
| Sep 2026 | LINK itself re-enters | AP/CBS, TOI. HIGH |
| after Aug | Swift restarts science. Pointing manoeuvres raise drag again, and it "began to sink rapidly" | NASA blog 23 Oct. HIGH |
| **20 Oct 2026** | Swift at **275 km (171 mi)**. It can no longer compensate for drag, enters safe mode, and Penn State sends the command that ends operations | NASA blog 23 Oct. HIGH |
| 3 Nov, 21:22 UTC | Last orbit: mean **190 km** (179.5 × 200.9 km), period **≈88.2 min** | KeepTrack. MED |
| final days | Decay rate **8.6 km/day** (7-day average) → **17.5 km/day** (last 2 days) | KeepTrack. MED |
| **4 Nov 2026, 12:39 UTC (19:39 WIB)** | Re-entry, **3.4° N, 98.6° E**, North Sumatra | NASA blog, citing US Space Force. HIGH |

NASA's own words on the cause: "All satellites in low Earth orbit experience atmospheric drag. Recent solar activity increased this effect on Swift" (23 Oct blog).

### C. The re-entry itself

- **Time and place:** US Space Force confirmed **7:39 a.m. EST (12:39 UTC)**, about 3.4° N, 98.6° E, "over the North Sumatra region of Indonesia" (NASA). BRIN independently gave **19.39 WIB ±1 minute**, based on radar data (Thomas Djamaluddin, Kompas.id). HIGH.
- **Where that point is:** Kompas.id says "di atas wilayah udara di selatan Medan". By my calculation, 3.4° N 98.6° E is roughly **20–25 km south of central Medan** (LOW, my arithmetic). But a ±1 min uncertainty at about 7.8 km/s is **±470 km along the track**. Do **not** say it fell "on Medan".
- **Definition of "jatuh":** BRIN counts re-entry when an object drops to **120 km**. Below that it heats the air in front of it, glows and breaks up (Kompas.id). ESA uses the same 110–120 km scale. HIGH.
- **Where fragments went:** BRIN says the pieces kept following the orbital track **south-east**, past the southern tip of the Malay Peninsula toward Borneo. "Pecahan Swift ini kemungkinan besar jatuh di sekitar Selat Karimata sampai Kalimantan Selatan" (Djamaluddin, Kompas.id). That is a **prediction, not a recovery**. HIGH that BRIN said it; the outcome is unknown.
- **Eyewitnesses:** People in North Sumatra and in Pahang and Johor (Malaysia) posted fast streaks of light moving south-east (Kompas.id). Videos came from an International Astronomical Center member in Brunei (Leonard David). MED.
- **Did debris reach the ground?** **Unknown.** NASA: "most of the spacecraft" expected to burn up, "but some components may have survived re-entry". As of 9 Nov, I found **no confirmed debris recovery** in Indonesian or English news. "No damage or injuries have been reported" (Live Science). Leonard David (6 Nov): "not immediately clear" whether anything fell on land. HIGH for "no confirmed find yet".
- **Speed:** "about 22 times the speed of sound" (AP text via DW/Kompas.com, attributed to NASA, but not in NASA's blog). MED. ESA: objects at about 120 km typically move at **≈28,000 km/h (≈7.8 km/s)**. HIGH.

### D. Forecast history (why the window was so wide)

| When issued | Who | Predicted re-entry | Window |
|---|---|---|---|
| Mon 2 Nov | US Space Force (quoted by NASA) | 4 Nov **03:30 EST** (15:30 WIB) | **±11 hours** |
| Early 4 Nov | Aerospace Corp (CORDS), via Kompas.id | 4 Nov **10:19 UTC** (17:19 WIB) | ±~2 h |
| 4 Nov, 04:22 WIB data (Swift at 178.6 km) | BRIN (PRA) | 4 Nov **12:42 UT** (19:42 WIB), "near the northern tip of Sumatra" | ±~2 h |
| Morning 4 Nov EST | US Space Force | **11:42–13:42 UTC** | ±1 h |
| 4 Nov, 17:35 UTC (after the event) | Space-Track TIP | **12:39 UTC**, 3.4° N 98.6° E | 1 h (window cut "from 120 hours to 1 hour", KeepTrack) |
| **Actual** | Space Force / NASA / BRIN | **12:39 UTC** | — |

Sources: CBS/AP (NASA quote), Kompas.id ×2, Spaceflight Now, KeepTrack. HIGH. Note: BRIN's last forecast was within **3 minutes** of the real time. That gives a strong local-pride angle.

**Why so uncertain:** one orbit takes about 88 min and covers roughly 40,000 km of ground. An error of ±1 hour therefore covers about two-thirds of an orbit (KeepTrack), and ±11 hours covers every longitude in the 20.6° N–20.6° S band. Drag depends on air density at 150–200 km. That density swings with solar EUV and geomagnetic storms, and it changes with the tumbling satellite's attitude, which alters its effective cross-section. (The mechanism is HIGH, consistent with NASA's "increased drag" wording. The standard rule of thumb that forecasts are good to about ±10–20% of the remaining lifetime comes from Aerospace Corp's FAQ, which was blocked. MED.)

### E. Casualty risk: the 1-in-2,100 story

- **NASA's figure:** "risk of harm coming to anyone on Earth is unlikely, approximately **1 in 2,100**" (NASA statement on 2 Nov, quoted by CBS/AP and KCRA; Spaceflight Now; Aviation Week). HIGH.
- **The standard:** US Government Orbital Debris Mitigation Standard Practices (2019 update): uncontrolled re-entries must have an expected casualty risk **below 1 in 10,000**. "Casualty" means serious injury or death (Aerospace Corp spokesperson Parker Wishik, via KCRA/CNN). NASA's own requirement reads "shall be less than 0.0001 (1:10,000)" (quoted by Jalopnik). ESA: 1 in 10,000 "is commonly accepted by space agencies and nation states. It is mandatory for ESA missions" (ESA page). HIGH.
- **So Swift's risk was about 4.8× the threshold.** Jalopnik rounds this to "five times". NASA's explanation (spokesperson Alise Fisher to Jalopnik): "In the leadup to Swift's Nov. 20, 2004, launch, NASA determined the risk was consistent with mission requirements as allowed by agency policy." NASA published no full risk assessment (Jalopnik; Sladen via Space.com). HIGH that the figures are as stated. Why the number grew is unexplained (see §7).
- **Context:** ESA says no known injuries from re-entering debris to date, and being struck by lightning is "60,000 times more likely" for any individual. HIGH. "Nearly 70 years of spaceflight, nobody has died from falling satellite debris" (Sladen, via DW). MED, but consistent with ESA.
- **Ground band:** surviving debris could only land between **20.6° N and 20.6° S**: parts of Africa, Australia, India, South-East Asia, and Central and South America (NASA via AP/TOI). All of Indonesia sits inside it (CNBC Indonesia; AFU.id headline). HIGH.

### F. What burns and what survives

- **NASA (chief scientist Brad Cenko, via AP):** most of the 1½-ton telescope burns up, but "a handful of pieces made of **denser-than-lead tungsten** and some **mirror parts** could survive". HIGH.
- **Sladen (Accu Components, an engineer at a UK supplier, so not an official source; via Space.com and Leonard David):** the body is aluminium, wiring and electronics, which melt early. Likely survivors are the **six heavy reaction wheels** and the lenses and mirrors. The BAT's coded mask of **about 52,000 lead tiles** "will almost certainly melt". The breakup sequence: below about 120 km "the end usually comes within a few minutes"; solar panels and antennas tear off first; **around 78 km** "the main body breaks apart". MED.
- **No titanium propellant tanks on Swift**, because it had no propulsion system. The textbook "titanium tank survives" example therefore **does not apply to Swift**. HIGH that Swift had no engine; LOW-MED that it carried no pressurised tanks at all.
- **ESA general rule:** at about 110 km, in roughly the last 10 minutes, heating and deceleration destroy most objects. Large, dense spacecraft, "especially when a large amount of high-melting-point material such as stainless steel or titanium is involved", can drop fragments. For large-mass uncontrolled re-entries, "20–40% of the spacecraft mass may survive" (ESA). KeepTrack quotes a 10–40% rule of thumb (ESA/Aerospace), which would be about 147–588 kg for Swift. It says this is a category estimate, not a prediction. HIGH for the ESA rule; LOW for applying it to Swift.

### G. Re-entry background numbers (ESA, HIGH)

- About **75%** of all larger objects ever launched have already re-entered.
- Objects of **1 m or above re-enter about once a week**. On average **two small tracked debris objects re-enter per day**. Only "a few very large objects" re-enter per year.
- About 75% of Earth's surface is water.
- Historic large uncontrolled re-entries: **Skylab** (74 t in ESA's figure, 77.1 t in Wikipedia's; July 1979, debris across the Australian outback) and **Salyut-7/Kosmos-1686** (40 t, Feb 1991). Both came down early partly because of **high solar activity** (Wikipedia, MED), the same story as Swift.

### H. Controlled re-entry and Point Nemo

- **Controlled re-entry:** while a spacecraft still has propellant, a final burn aims its footprint at empty ocean. ESA's five ATV cargo ships all did this into the uninhabited **South Pacific** (ESA). HIGH.
- **Point Nemo:** 48°52.6′ S, 123°23.6′ W, **2,688 km** from the nearest land (Ducie Island, Motu Nui, Maher Island) (NOAA). The wider area is known as the "spacecraft cemetery": hundreds of spacecraft were sent down there (Wikipedia, MED). HIGH for the coordinates and distance.
- **ISS:** NASA chose **SpaceX to build the US Deorbit Vehicle**. NASA says existing Progress propulsion "does not provide sufficient margin to lower the public risk to an acceptable level" (NASA FAQ). Target: around 2030–2031 (Wikipedia says 2031; NASA says end of station operations). HIGH for the USDV; MED for the year.
- **Swift could not do this.** It had no engine and the rescue tug failed. That is why it was "uncontrolled".

### I. Indonesia's previous falling-debris cases (context for the hook)

- **26 Sep 2016, Sumenep (Madura):** pieces of a Falcon 9 stage (and a Delta 2 PAM-D fragment) fell, one hitting a cow shed. LAPAN: no injuries; don't touch, could carry fuel residue (CNN Indonesia, Thomas Djamaluddin as LAPAN head). HIGH.
- **4 Jan 2021, south coast of Central Kalimantan:** a Long March/CZ-8 payload fairing that floated ashore (Limapagi, quoting Djamaluddin). MED-HIGH.
- **31 Jul 2022, Sanggau (West Kalimantan):** Long March 5B core-stage debris, confirmed by BRIN (CNN Indonesia). HIGH.
- **April 2026 (Banten and Lampung)** and **18 Oct 2026 (Kotawaringin Timur, Central Kalimantan, ZhuQue-2E rocket debris in an oil-palm estate)** (Limapagi, citing detik and BRIN). MED.
- These are **rocket stages**, not satellites. Swift is the satellite case, and two weeks earlier a Chinese rocket piece actually landed in Kalimantan.

---

## 3. Mechanism in 7 animation steps (Bahasa Indonesia)

1. **Orbit = jatuh terus tapi selalu meleset.** Swift melesat sekitar 7,6 km per detik di ketinggian ±600 km. Ia terus "jatuh" ke Bumi, tapi karena sangat cepat, permukaan Bumi melengkung menjauh. Hasilnya: mengitari Bumi tiap ±96 menit.
2. **Udara tipis tetap menggesek.** Di 600 km pun masih ada sisa atmosfer. Tiap putaran, molekul udara menabrak panel dan badan satelit, mencuri sedikit kecepatan. Kehilangan kecepatan = orbit turun sedikit.
3. **Matahari "mengembangkan" atmosfer.** Saat Matahari aktif (puncak siklus 2024), sinar UV ekstrem dan badai magnet memanaskan atmosfer atas sehingga mengembang. Udara yang lebih padat naik ke ketinggian satelit, gesekannya naik, dan Swift turun jauh lebih cepat dari rencana.
4. **Spiral maut yang makin cepat.** Makin rendah, udara makin padat, makin cepat turun. Swift turun 8,6 km/hari, lalu 17,5 km/hari di dua hari terakhir. 349 km (Agustus) → 275 km (20 Oktober, misi diakhiri) → 190 km (3 November). Penyelamatan robot LINK gagal, dan Swift tidak punya mesin.
5. **Batas 120 km: masuk atmosfer.** 4 November, 19.39 WIB, di atas Sumatera Utara. Kecepatan ±28.000 km/jam. Udara di depan satelit tidak sempat menyingkir, sehingga **termampatkan** dan menyala jadi plasma ribuan derajat. Ini bukan sekadar "gesekan".
6. **Pecah berlapis.** Panel surya dan antena copot duluan. Di sekitar 78 km badan utama terbelah. Aluminium, kabel dan elektronik meleleh lalu menguap. Yang tahan: bagian padat bertitik leleh tinggi seperti tungsten, cermin teleskop, dan roda reaksi.
7. **Serpihan tetap melaju ke tenggara.** Pecahan tidak jatuh tegak. Mereka terus mengikuti lintasan orbit, melambat, lalu jatuh bebas. BRIN memperkirakan jatuhnya di sekitar Selat Karimata–Kalimantan Selatan. Sebagian besar Bumi adalah laut, jadi kemungkinan besar tercebur. Bandingkan dengan wahana yang masih punya bahan bakar: dorongan terakhir diarahkan ke Point Nemo, 2.688 km dari daratan terdekat.

---

## 4. Myths, traps and caveats

- **"Jatuh di Sumatera / jatuh di Medan."** It **entered the atmosphere** (120 km) above North Sumatra. Surviving pieces, if any, flew on south-east (BRIN: Karimata Strait to South Kalimantan). Say "terbakar di langit Sumatera Utara".
- **"Puingnya ditemukan."** No confirmed recovery as of 9 Nov. Say "belum ada laporan puing ditemukan".
- **"NASA memastikan tidak ada korban."** (DW/Kompas.com/Batak Pos.) NASA's blog says no such thing. Say "tidak ada laporan korban atau kerusakan".
- **"Risiko 1:2.100 dari US Space Force."** (DW/Kompas.com.) The figure is **NASA's**. Space Force supplied the tracking.
- **"1:2.100 = peluang puing jatuh di daerah berpenduduk."** (Live Science wording.) Wrong. It is the chance that **anyone on Earth is hurt**, in total, summed over everyone.
- **"Aman karena di bawah standar."** The opposite: 1:2,100 is about **4.8× riskier** than the 1:10,000 limit. NASA says it was acceptable under its policy at the 2004 launch. Do not say NASA broke the law; there is no binding law (Jalopnik). Say "melampaui ambang 1:10.000 yang dipakai NASA dan ESA".
- **"Satelit kehabisan bahan bakar."** (Jalopnik.) Swift **never had an engine**. It could not be boosted or steered down.
- **"Tangki titanium-nya bertahan."** Generic re-entry fact, but Swift had **no propulsion tanks**. Use NASA's list: tungsten parts and mirror parts.
- **"Terbakar karena gesekan."** (DW/Kompas.com.) Most of the heating comes from **compressing the air** in front of the object (shock layer), not rubbing. Say "udara di depannya termampatkan sampai berpijar".
- **"20 tahun mengorbit."** (Kompas.com headline.) It was almost **22 years**: 20 Nov 2004 to 4 Nov 2026.
- **Mass confusion:** 1,4 ton (DW), 1,450 kg, 1,452 kg, 1,470 kg (launch, catalogue), 1,500 kg (Space.com). Say "sekitar 1,45 ton" or "hampir 1,5 ton". Do not say 1.4 and 1.5 in the same video.
- **"322 km di utara khatulistiwa."** (AP via DW/CNBC.) 3.4° N is about **378 km** north. Avoid quoting 322 km, or say "sekitar 3,4 derajat lintang utara".
- **"Teleskop Hubble jatuh."** Different telescope. Hubble's decay is projected around 2033–2034, and NASA is exploring commercial servicing.
- **"Prediksi NASA meleset 9 jam."** Unfair. The 2 Nov forecast was 03:30 EST **±11 h**, and the actual time fell inside it. Uncertainty is the physics, not a mistake.
- **"Pertama kali sampah antariksa ke Indonesia."** No: Sumenep 2016, Kalteng 2021, Sanggau 2022, Kotim Oct 2026. Those were **rocket parts**, though. Swift is a satellite or telescope.
- **Speed figures:** "22 kali kecepatan suara" is an AP line. Prefer ESA's "±28.000 km/jam (7,8 km/detik)".
- **Sladen quotes** (six reaction wheels, 52,000 lead tiles, 78 km breakup) come from a component-supplier engineer, not NASA. Attribute as "insinyur antariksa" or avoid exact counts.
- **"Bintang jatuh"** sightings in Sumut and Malaysia: plausible but unverified individual videos. Do not show unverified footage as Swift.

---

## 5. Hook angles (90-second Indonesian video)

1. **"Rabu malam, 19.39 WIB, satelit NASA seberat hampir 1,5 ton terbakar di langit Sumatera Utara. Kenapa jatuhnya di sini?"** Strongest: local, dated, concrete.
2. **"Risiko satelit ini melukai orang: 1 banding 2.100. Batas amannya 1 banding 10.000."** Tension: the risk was about 5× over the line, it still fell, and luck held.
3. **"Yang menjatuhkan satelit ini... adalah Matahari."** Solar maximum puffed up the atmosphere. A counter-intuitive cause.
4. **"NASA bayar 30 juta dolar untuk menyelamatkannya. Robot penyelamatnya malah berputar tak terkendali."** Failed rescue drama.
5. **"Hitungan BRIN cuma meleset 3 menit."** BRIN forecast 19.42 WIB; the actual time was 19.39 WIB. Local science pride.
6. **"Kenapa NASA tak bisa bilang jatuhnya di mana, sampai satu jam sebelumnya?"** ±11 h → ±1 h. One orbit covers 40,000 km in 88 minutes.
7. **"Dua minggu sebelumnya, potongan roket China benar-benar mendarat di kebun sawit Kalimantan."** A contrast hook: 18 Oct ZhuQue-2E debris in Kotawaringin Timur.
8. **"Kuburan wahana antariksa ada di tengah Pasifik, 2.688 km dari daratan. Swift tidak bisa ke sana."** Point Nemo payoff.

---

## 6. Visual / 3D beat ideas

- **Open (hook):** a night sky over a Sumatran town silhouette (Lake Toba ridge or Medan skyline as generic shapes). A fast orange streak splits into several sparks heading south-east. HUD: "04.11.2026 · 19:39 WIB · 3,4°LU 98,6°BT".
- **Satellite hero:** a generic cylindrical observatory (2.4 m × 1.7 m body, two solar wings with a 5.5 m span, per KeepTrack). Three telescope apertures labelled BAT/XRT/UVOT. Keep it unbranded or a stylised look-alike, not the NASA logo.
- **Decay spiral:** an orbit ring around a 3D Earth that shrinks over time, with an altitude counter: 600 → 349 → 275 → 190 → 120 km. The ring gets visibly faster and tighter at the end (8.6 → 17.5 km/day).
- **Solar puff:** the Sun flares and Earth's thermosphere shell (a translucent blue layer) swells outward until it touches the satellite ring. Air-particle sprites hit the panels. One visual explains "Matahari menjatuhkan satelit".
- **Rescue fail beat:** a small tug with three arms approaches, starts tumbling, and drifts away. Text: "11–14 km, tak pernah sampai".
- **Forecast funnel:** a world map band 20.6° N–20.6° S lit red (±11 h). The window shrinks to ±2 h, then to a single ground-track arc over Sumatra. Clock tickers for Space Force / Aerospace / BRIN, landing on the actual 19:39. Good place for the AUDIRA brand on a HUD panel ("AUDIRA REENTRY DESK").
- **Plasma beat:** a close-up of the satellite nose with a glowing shock cap pushed ahead of it (bow shock, a gap between the glow and the body, to show "compression, not friction"). Panels rip off, then the body splits at the "78 km" tag.
- **Survivor sort:** an exploded view. Aluminium parts dissolve into sparks; tungsten blocks, a mirror shell and reaction wheels glow cherry-red and keep falling. Label: "yang bertahan".
- **Footprint ribbon:** fragments continue SE over the Malacca Strait and Karimata Strait toward Kalimantan as a dotted ellipse. Label "perkiraan BRIN", not "lokasi jatuh".
- **Risk dial:** a gauge with the 1:10,000 line in green and the needle at 1:2,100 in amber. Then a lightning-bolt comparison card (ESA: lightning risk is 60,000× higher).
- **Payoff:** a split screen. Left: Swift tumbling uncontrolled. Right: a spacecraft firing a final burn and diving to Point Nemo (2,688 km from land) in a dark South Pacific "graveyard" with faint silhouettes of old stations. End: "Hubble menyusul ±2033?" with a question mark.
- **Safety coda (one line):** "Temukan benda aneh dari langit? Jangan sentuh, foto, laporkan" (Sladen; LAPAN 2016).

---

## 7. Open questions / unverified

- **Debris recovery:** no confirmed fragment found as of 9 Nov 2026. Check BRIN, BMKG or Malaysian reports before the script locks.
- **Ground-track direction conflict:** KeepTrack describes the TIP nominal point as an **ascending (northbound)** pass, while BRIN says fragments moved **south-east**, which matches Malaysian sightings in Pahang and Johor. Treat BRIN's statement as authoritative and avoid drawing a precise direction arrow beyond "ke tenggara menurut BRIN".
- **Why 1:2,100 exceeds 1:10,000:** NASA only said the risk was acceptable under policy before the 2004 launch. There is no published DAS/ORSAT assessment. It is unclear whether the 2004 figure was already above 1:10,000 under a waiver or grew later.
- **Reaction-wheel count (six) and the 52,000-tile BAT mask:** single non-NASA source (Sladen). Not checked against NASA's Swift technical pages.
- **Whether Swift carried any pressurised tanks** (for example for instrument gas or cryogenics): not checked.
- **Thermosphere density increase at solar max:** described only qualitatively here. No NOAA SWPC number was read.
- **Aerospace Corp CORDS final prediction (10:19 UTC ±2 h):** known only via Kompas.id, because aerospace.org was 403.
- **ISS deorbit year:** NASA FAQ gives no exact year; Wikipedia says 2031. Say "sekitar 2030-an awal".
- **April 2026 Banten/Lampung and 18 Oct 2026 ZhuQue-2E Kalteng debris:** one aggregator (Limapagi via detik). Confirm with detik or BRIN before using.
- **Skylab/Salyut-7 masses:** ESA (74 t) vs Wikipedia (77.1 t). Use "puluhan ton".

### Sources that failed

- aerospace.org: every page (CORDS article, /reentries, reentry FAQ) returned **HTTP 403**.
- Reuters ("NASA's 22-year-old Swift satellite telescope falls from orbit in fiery finale"): **HTTP 401**.
- Aviation Week: paywall, only the first paragraph visible (3:30 a.m. EST forecast, 3,200 lb, 1 in 2,100).
- ESA reentry predictions portal (reentry.esoc.esa.int): JavaScript app, no content in HTML.
- New York Times, Wired, Scientific American: not attempted, as they are paywalled or duplicate AP.
- detik, CNN Indonesia and kumparan Swift articles: not read in full, because they duplicate DW/AP and Kompas.id.
