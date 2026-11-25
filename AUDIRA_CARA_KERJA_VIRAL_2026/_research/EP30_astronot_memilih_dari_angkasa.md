# EP30 — How astronauts vote from space (US midterms, 3 Nov 2026) — research notes

Research date: 2026-11-10. This file holds research only, not a script.
Method: Google News RSS (hl=en-US and hl=id, `when:14d`), Bing News RSS for direct article URLs. Article HTML read with Python urllib (browser User-Agent, normal TLS, no bypass), tags stripped. Primary sources read directly: **NASA explainer "How NASA Astronauts Vote from Space Aboard International Space Station"** (nasa.gov, published 3 Oct 2024, updated 3 Feb 2025), **NASA "How NASA Transmits Votes From the Space Station"** (2 Nov 2020), **NASA image article on Kate Rubins voting** (27 Oct 2020), **NASA TDRS transition posts** (16 Oct 2024; 17 Dec 2025), **Texas Election Code §106.001 and §106.002** (text via FindLaw, "current as of 1 Jan 2026"; the official statutes.capitol.texas.gov did not answer), **National Air and Space Museum** story "How Do Astronauts Vote From Space?". 2026 crew facts come from **Space.com** (quotes Menon's X post of 3 Nov 2026), **TIME**, **Liputan6**, **Kompas.com**, **OneIndia**, **Hoodline**. Indonesian overseas-voting fact from **Kompas.com** (15 Jun 2026, KPU chair at DPR Komisi II).

Confidence tags: **HIGH** = primary source or 3+ independent outlets agree; **MED** = one good secondary source; **LOW** = single weak source or my inference.

Politics: neutral. This episode explains the process only. No candidates, parties or results.

---

## 1. Viral hook: is it recent?

| Headline | Outlet | Published | URL |
|---|---|---|---|
| "Video: Astronaut AS Ikut Pemilu dari Luar Angkasa, Bagaimana Caranya?" (the brief's hook) | 20detik | 4 Nov 2026 | Google News item only; direct URL not decoded |
| "Voting in space: NASA astronauts cast ballots from International Space Station" | Space.com | 3 Nov 2026 | https://www.space.com/space-exploration/international-space-station/voting-in-space-nasa-astronauts-cast-ballots-from-international-space-station |
| "How Astronauts Are Casting Their Midterm Votes From Space" | TIME | 3 Nov 2026 | https://time.com/article/2026/11/03/how-astronauts-are-casting-their-midterm-votes-from-space/ |
| "Who Are The Three NASA Astronauts Who Voted From 400 Km Above Earth..." | OneIndia | 4 Nov 2026 | https://www.oneindia.com/international/who-are-the-three-nasa-astronauts-who-voted-from-400-km-above-earth-during-us-midterm-elections-2026-8250979.html |
| "Colorado Astronaut Jessica Watkins Casts Midterm Ballot From Space Station" | Hoodline | 5 Nov 2026 | https://hoodline.com/2026/11/colorado-astronaut-jessica-watkins-casts-midterm-ballot-from-space-station/ |
| "Astronaut AS Ikut 'Nyoblos' Pemilu dari Luar Angkasa, Begini Caranya" | Kompas.com | 5 Nov 2026 | https://www.kompas.com/global/read/2026/11/05/110950570/astronaut-as-ikut-nyoblos-pemilu-dari-luar-angkasa-begini-caranya |
| "Nyoblos dari Luar Angkasa, Intip Cara Astronaut AS Kirim Surat Suara ke Bumi" | Liputan6 | 6 Nov 2026 | https://www.liputan6.com/global/read/8329365/nyoblos-dari-luar-angkasa-intip-cara-astronaut-as-kirim-surat-suara-ke-bumi |
| Also listed (titles only, not read): NYT 4 Nov, CNN 4 Nov, Al Jazeera 3 Nov, NBC News 3 Nov ("NASA's Anil Menon explains..."), CBS 4 Nov, Euronews 5 Nov, Guardian video 4 Nov, AP video 3 Nov, Mashable 9 Nov, KXAN 8 Nov ("How NASA astronaut Jessica Watkins voted...") | various | 3–9 Nov 2026 | Google/Bing News RSS |

Verdict: **very fresh** (election day 3 Nov 2026, coverage 3–9 Nov). Widely covered in Indonesian media (20detik, Kompas, Liputan6). The mechanism is evergreen, so the video stays valid after the news cycle.

---

## 2. Verified facts

### 2a. Who voted in Nov 2026
- **Three US astronauts on the ISS voted: Anil Menon, Jessica Watkins, Luke Delaney.** Menon on X, 3 Nov 2026: all three US crew members voted, "We filled out an electronic ballot and sent it securely to the election officials." **HIGH** (Space.com quotes post; TIME, Liputan6, Kompas, OneIndia agree.)
- Menon showed a ~29-second video. His crew quarters "doubles as a voting booth"; inside is his computer where he filled out "an electronic form" and sent it "to Harris County". He wore an "I voted" sticker. **HIGH** (Space.com, TIME, Liputan6.)
- Menon launched in **July 2026 on Soyuz MS-29** (Roscosmos). Watkins and Delaney launched **1 Oct 2026 on SpaceX Crew-13**. **HIGH** (Space.com, TIME, Kompas, OneIndia.)
- Other people on board (non-US, did not vote in US election): CSA astronaut Joshua Kutryk; cosmonauts Anna Kikina, Pyotr Dubrov, Sergey Teteryatnikov. Seven people total. **MED-HIGH** (Space.com, Liputan6.)
- Watkins posted an "I Voted" sticker photo. **MED** (Hoodline only.)
- **No new 2026 NASA press release was found.** NASA WP API search returned only the 2020 and 2024 explainers. The 2026 "statement" is Menon's own X post. Outlets quote NASA's 2024 explainer for the mechanism. **HIGH** (absence checked on nasa.gov search + posts API.)

### 2b. Legal basis
- **Texas Legislature passed the law in 1997.** NASA (2020, 2024 pages). **HIGH**
- Current statute: **Texas Election Code Chapter 106**. §106.001: applies to a person eligible to vote in Texas who cannot vote because they are "on a space flight, as defined by the secretary of state, on election day and during the early voting period". **HIGH** (statute text via FindLaw; Hoodline summarises same.)
- §106.002: the Secretary of State prescribes procedures "for voting from space on election day by secure electronic means"; may set an application deadline and may use "the National Aeronautics and Space Administration's electronic transmission program to send ballots to persons on a space flight". **HIGH** (statute text.)
- Why Texas/Harris County: Johnson Space Center is in Houston (Harris County); most astronauts live there and register there. **HIGH** (NASA 2024, Space.com, TIME.)

### 2c. Mechanism (NASA's own description)
- Step 1: like any American away from home, the astronaut fills out a **Federal Post Card Application (FPCA)** to request an absentee ballot. **HIGH** (NASA 2024.)
- Step 2 (pre-flight planning): astronaut identifies which elections fall during the mission. **MED** (NASM.)
- Step 3: before Election Day, Mission Control at JSC **uplinks an encrypted electronic ballot**; astronauts use **unique credentials sent by e-mail** to open it. **MED** (NASM; repeated by Hoodline citing NASM.)
- Step 4: astronaut fills ballot on station laptop, sends it down. Path: **ISS → Tracking and Data Relay Satellite (TDRS) → ground antenna at White Sands, Las Cruces, New Mexico → Mission Control Center, JSC Houston → county clerk.** **HIGH** (NASA 2020 + 2024.)
- **Ballot is encrypted, accessible only by the astronaut and the clerk.** **HIGH** (NASA 2020 + 2024.)
- Network name: **Near Space Network**, managed by **Goddard Space Flight Center**, Greenbelt, Maryland, under NASA's SCaN program. It serves missions within 1.2 million miles (~1.9 million km) of Earth. **HIGH** (NASA 2024.)
- Ballot rides the same channel as "most data transmitted between the space station and mission control". **HIGH** (NASA 2020.)

### 2d. History
- **David Wolf, 1997, aboard Mir** = first American to vote from space. **HIGH** (NASA, NASM, TIME, Space.com.) Wolf to The Atlantic (2016): he voted alone as the only English speaker and felt "closer to the Earth". **MED** (via TIME.)
- ISS got its first resident crew in **November 2000**, so Wolf's vote predates ISS. **HIGH** (Space.com, Liputan6.)
- **Kate Rubins voted from ISS in 2016 (Expedition 48/49) and again in Oct/Nov 2020.** **HIGH** (NASA image article 2020, NASA 2020 post, NASM.)
- **Loral O'Hara and Jasmin Moghbeli voted in March 2024** (Texas primary) and downlinked ballots to JSC. **HIGH** (NASA 2024 caption.)

### 2e. The relay system in 2026
- TDRS is NASA's legacy relay fleet. Since **8 Nov 2024 TDRS supports only existing missions**; new missions go to commercial relay services. NASA: TDRS "will continue to provide critical support for at least the next decade". **HIGH** (NASA 16 Oct 2024.)
- Dec 2025: commercial partners demonstrating relay; NASA strategy "to retire the TDRS constellation". **HIGH** (NASA 17 Dec 2025.) Nov 2026 headlines: Viasat and Astranis picked for NASA "NEXUS" Ka-band relay (titles only, not read). **LOW-MED**
- ISS is an existing mission, so the 2026 ballots very probably still went via TDRS. **No 2026 source states the 2026 path explicitly.** All 2026 articles reuse the 2024 NASA text. Say "jalur yang dijelaskan NASA" — not "NASA confirmed the 2026 ballots went via TDRS". **LOW-MED (inference)**

### 2f. Distances / physics (for the animation)
- ISS altitude: NASA writes "250 miles above Earth's surface" (~400 km). **HIGH**
- TDRS = geostationary relay satellites, ~35,786 km above the equator (standard GEO altitude). **HIGH** (textbook; NASA TDRS page exists, not re-read here.)
- Radio light-time for ISS → TDRS → ground: roughly 36,000 km + 36,000 km ≈ 72,000 km ≈ **0.24 s** one way. **LOW-MED** (my calculation; actual slant ranges vary, plus network/processing delays.)
- ISS speed: ~17,500 mph (~28,000 km/h). **HIGH** (NASM.)
- Why relay satellites: ISS sees a given ground station only a few minutes per pass; GEO relays see the ISS most of each orbit, giving near-continuous link. **MED** (general TDRS rationale; not quoted from a page read today.)

### 2g. Indonesia
- **No legal path exists for Indonesians to vote from space.** No Indonesian is in orbit; no rule found. Do not claim one. **(Inference — do not state as law.)**
- Overseas WNI do vote through overseas committees (PPLN). Methods differ by location; a DPR Komisi II chair said overseas voting "not on the same day" as domestic and "methods differ". **HIGH** (Kompas.com 15 Jun 2026.)
- **KPU floated e-voting for overseas voters at Pemilu 2029** (KPU chair Mochamad Afifuddin, DPR Komisi II, 15 Jun 2026). Depends on a change to the Election Law; budget does not yet include an e-voting app. Trigger: re-vote (PSU) in Kuala Lumpur in Pemilu 2024. **HIGH** (Kompas.com, direct quotes.)
- The three overseas methods (TPSLN, Kotak Suara Keliling, Pos) are widely reported (detik headline "3 metode", 4 Jan 2024) but **article not read today**. **MED** — check before using.

---

## 3. Mechanism in 7 animation steps (Bahasa Indonesia)

1. **Minta surat suara dulu.** Sebelum terbang, astronaut mengisi formulir FPCA, formulir yang sama dengan warga AS di luar negeri atau tentara yang bertugas jauh. Alamat pemilihnya: Harris County, Texas, tempat Johnson Space Center.
2. **Surat suara naik ke orbit.** Menjelang hari pemilu, Mission Control di Houston mengirim surat suara elektronik terenkripsi ke stasiun. Kunci aksesnya dikirim lewat e-mail khusus untuk tiap astronaut.
3. **Bilik suara = kabin tidur.** Astronaut membuka surat suara di laptop di kabin pribadinya, ruang seukuran bilik telepon, lalu memilih sendirian.
4. **Lompat ke satelit relay.** Data yang sudah dienkripsi dipancarkan dari ISS (±400 km) ke satelit TDRS di orbit geostasioner, ±35.786 km di atas khatulistiwa. Satelit ini jauh lebih tinggi dari ISS, jadi hampir selalu "melihat" ISS.
5. **Turun ke gurun New Mexico.** TDRS memantulkan sinyal ke antena besar NASA di White Sands, Las Cruces, New Mexico. Total jarak tempuh sekitar 72.000 km, kurang dari seperempat detik dengan kecepatan cahaya.
6. **Lewat Houston.** Dari New Mexico, data masuk jaringan darat NASA ke Mission Control di Johnson Space Center, Houston.
7. **Sampai di meja petugas pemilu.** Houston meneruskan ke petugas pemilu county (county clerk). Hanya astronaut dan petugas itu yang bisa membuka isinya. Suara dihitung bersama surat suara warga lainnya.

---

## 4. Myths, traps and caveats

- **"White Sands Test Facility" vs "White Sands Complex".** NASA's own pages disagree: the 2020 post says "White Sands Complex", the 2024 post says "White Sands Test Facility". Safe wording: "antena NASA di White Sands, New Mexico".
- **Do not say "NASA confirmed via TDRS in 2026".** No 2026 NASA release was found. All 2026 outlets reuse the 2024 explainer. TIME labels it "a NASA description shared in 2024".
- **Liputan6 date error:** it says Crew-13 launched "1 Oktober tahun lalu". Correct: 1 Oct **2026** (same year).
- **NASM's "Rule 81.35"** wording is old. The current statute is **Texas Election Code Chapter 106** (§106.001–106.002). Do not show "Rule 81.35" on screen.
- **Not a "vote by e-mail".** The ballot rides NASA's own encrypted relay network. E-mail only carries the access credentials (per NASM).
- **Not all astronauts necessarily vote in Texas.** Hoodline calls Watkins a "Colorado astronaut". Menon himself said Harris County. For Watkins and Delaney, their county is **unverified**. Safe line: "kebanyakan astronaut terdaftar di Harris County, Texas".
- **Menon was born in Minneapolis** (OneIndia). Indian outlets call him "Indian-origin". Avoid nationality framing.
- **"400 km"** is approximate. NASA says 250 miles. ISS altitude drifts (~400–420 km).
- **TDRS is being retired**, but not yet. NASA says it supports existing missions (ISS) for at least another decade from 2024. Do not say "TDRS sudah pensiun".
- **Wolf 1997** was not a presidential election (Nov 1997 was an off-year/local ballot). Do not say "pemilu presiden 1997". **LOW** — exact race not checked; just say "pemilu 1997".
- **Rubins**: two space votes (2016, 2020). Both were presidential years. **HIGH**.
- **Indonesia**: no space-voting rule; overseas e-voting is only an **idea** for 2029 that needs a law change. Do not imply it exists.
- **Politics**: do not name candidates, parties, or the midterm outcome. TIME's line about the "Trump presidency" is context, not needed.

---

## 5. Hook angles (90-second Indonesian video)

1. **"Bilik suara paling jauh di dunia: 400 kilometer di atas kepala kita."** Cold open on Menon's tiny cabin; "I voted" sticker floating. (Best.)
2. **"Surat suaranya menempuh 72.000 km dalam seperempat detik."** Data-path race; counter climbs.
3. **"Di Indonesia, kita ke TPS. Astronaut ini ke… kabin tidur."** Contrast angle, ties to "nyoblos" vocabulary.
4. **"Ada undang-undang khusus untuk memilih dari luar angkasa. Sejak 1997."** History hook with Wolf on Mir.
5. **"Gimana caranya surat suara turun dari orbit tanpa bisa diintip siapa pun?"** Encryption/secrecy angle.

Recommended: #1 for the first 3 s, then #2 as the mid-video payoff.

---

## 6. Visual / 3D beat ideas

- **Hook:** macro shot into the ISS crew cabin (sleeping bag, laptop, floating "I voted" sticker), pull back through the hatch to the full ISS over Earth at night.
- **Form beat:** a paper FPCA form morphs into a glowing encrypted envelope with a lock icon.
- **Uplink:** beam from Houston up to the ISS; ballot envelope "docks" into the laptop.
- **Scale beat (payoff):** camera rides the data packet from ISS (400 km) up to a TDRS satellite at 35,786 km. Earth shrinks; altitude counter; then dives down to the New Mexico desert dish. Scale bar compares ISS altitude vs GEO (~90×).
- **Ground chain:** packet runs along a fibre line White Sands → Houston Mission Control (console wall) → county clerk office, then drops into a ballot box with others.
- **Lock beat:** only two keys open the envelope: astronaut's and clerk's.
- **History strip:** 1997 Mir (Wolf) → 2016/2020 ISS (Rubins) → 2024 (O'Hara, Moghbeli) → 2026 (Menon, Watkins, Delaney). Show silhouettes or name cards, not faces in 3D.
- **Indonesia beat:** TPS ballot box on Earth vs orbit; caption "Pemilu luar negeri RI: e-voting baru wacana untuk 2029 (KPU)".
- **In-world brand:** AUDIRA label on the mission-control console or on the encrypted envelope.
- Style candidates: SATELLITEBRIEFING (orbital zoom + relay path), CYBERFORGE (encrypted data HUD), PAPERWORLD (ballot paper to data). Decide at style gate.

---

## 7. Open questions / unverified

- Does any 2026 NASA source confirm the 2026 ballots used TDRS (vs a commercial relay)? Not found.
- Which counties did Watkins and Delaney vote in (Texas vs Colorado/Florida)? Not verified.
- Is the e-mailed credential process still current (NASM text dates from 2018/2020)?
- Exact 1997 bill number and the race Wolf voted in. Not checked.
- Read detik (4 Jan 2024) or KPU page for the 3 overseas methods before putting them on screen.
- 20detik video content (the brief's hook) not watched; its direct URL was not decoded.
- Ground terminals besides White Sands (e.g. Guam) exist for TDRS but NASA's voting pages only name White Sands. Do not add Guam.

### Failed sources
- statutes.capitol.texas.gov (EL.106): no response (curl code 000). Used FindLaw copy instead.
- law.justia.com: Cloudflare 403 challenge.
- texas.public.law: page body not served (ads/landing only).
- FindLaw §106.003/§106.004: 404 (may not exist).
- Mashable (guessed URL): 404. MSN copy: no text extracted.
- nasa.gov HTML pages: menu noise only; content read via the WordPress REST API instead.
- Bing web RSS for KPU methods: irrelevant results.
