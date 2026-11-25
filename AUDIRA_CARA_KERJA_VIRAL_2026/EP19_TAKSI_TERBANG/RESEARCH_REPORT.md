# EP 19: Lima Pesawat Tanpa Pilot: Cara Kerja Taksi Terbang eVTOL

AUDIRA, seri CARA KERJA VIRAL. Created by Agus Dwi R. Status: final dengan voice-over, 9 November 2026.

Riset dari sumber yang dibaca langsung 9 November 2026. Setiap fakta berlabel HIGH, MED, atau LOW; naskah hanya memakai HIGH dan MED.

# EP19 — eVTOL "taksi terbang" and the five-aircraft formation: research notes

Research date: 2026-11-09. This file holds research only, not a script.
Method: Google News RSS (English and Indonesian) links decoded to real URLs through Google's batchexecute endpoint (several decodes hit HTTP 429 and were retried slowly), article HTML read with Python urllib. Sources read: AutoFlight press release (PR Newswire), ANTARA Indonesian and English releases, Xinhua, AeroTime, Interesting Engineering, MiGFlug, Dronelife, sUAS News, China Daily, AIN (paywalled after two paragraphs), EHang newsroom and GlobeNewswire release (via Nasdaq), Avi-Go, Wikipedia (eVTOL, EHang, Joby, Archer, Electric aircraft). No Wikipedia article exists for AutoFlight. Global Times page returned only sidebar text. DuckDuckGo HTML returned a block page.

---

## 1. Viral hook: is it recent?

| Headline | Outlet | Published | URL |
|---|---|---|---|
| "AutoFlight Sukses Gelar Penerbangan Formasi Lima Pesawat eVTOL Pertama di Dunia" | ANTARA (PR Wire / PRNewswire release) | **6 Nov 2026**, 19:51 WIB | https://www.antaranews.com/berita/5837159/autoflight-sukses-gelar-penerbangan-formasi-lima-pesawat-evtol-pertama-di-dunia |
| "AutoFlight Completes World's First 5-eVTOL Formation Flight" | PR Newswire (company release, Suzhou) | 5 Nov 2026 | https://www.prnewswire.com/apac/news-releases/autoflight-completes-worlds-first-5-evtol-formation-flight-302930392.html |
| "China's AutoFlight achieves five-aircraft formation flight in E China" | Xinhua (video) | 4 Nov 2026 | https://english.news.cn/20261104/55d444c23e9647c8a996e0dc270e9629/c.html |
| "AutoFlight stages world's first formation flight with 5 unmanned eVTOLs: video" | AeroTime | 5 Nov 2026 | https://www.aerotime.aero/articles/autoflight-worlds-first-formation-flight-five-unmanned-evtols-video |
| "World's first 5-eVTOL autonomous formation covers 83 miles in 47 minutes in China" | Interesting Engineering | 6 Nov 2026 | https://interestingengineering.com/transportation/autonomous-fleets-five-aircraft-flight |
| "AutoFlight Formation Flight: Five Unmanned eVTOLs Fly Together" | MiGFlug | 6 Nov 2026 | https://migflug.com/afterburner/autoflight-formation-flight-five-evtols-v5000-2026/ |

**Verdict: recent and real.** Flights were on **31 Oct and 1 Nov 2026**, Xinhua reported on 4 Nov, the company release came on 5 Nov, and ANTARA ran the Indonesian release on 6 Nov. Note that the ANTARA item is a **paid press release** (byline "PR Wire"), not ANTARA's own reporting. The "world first" label is **AutoFlight's own claim**; no independent body verified it, and MiGFlug notes no independent observer data was published. It must be narrowed (see Traps): EHang flew **16 EH216-S** in a circular formation in Feb 2026.

---

## 2. Verified facts

### A. The formation flight

1. **When and where.** 31 Oct and 1 Nov 2026, AutoFlight's **Bailian Lake Flight Test Base, Kunshan** (Jiangsu, near Suzhou/Shanghai). Guests: Stanford Executive Program alumni, industry people, customers; they watched from the lakeside and visited "Sunship", AutoFlight's water-based vertiport on Dianshan Lake.
   - Source: PR Newswire; ANTARA. Confidence: **HIGH** (company release, repeated by Xinhua for place).
2. **Which aircraft.** One **5-ton V5000 Matrix** (lead) + four **2-ton** aircraft: **V2000CG CarryAll** (cargo) and **V2000CGF CarryAll** (firefighting). Three models, two weight classes. The exact split of the four (how many CG vs CGF) is not stated.
   - Source: PR Newswire; AeroTime; Interesting Engineering. Confidence: **HIGH**.
3. **Numbers.** Coordinated flight **47 minutes**; lead V5000 covered **more than 133 km**; "conducted autonomously, with no manual intervention". AeroTime wrote "just over 45 minutes".
   - Source: PR Newswire; Xinhua ("fully automatic flight lasted for 47 minutes ... over 133 km"). Confidence: **HIGH**.
4. **Crewed or not.** Uncrewed. The release says "autonomously"; AeroTime and MiGFlug say "unmanned"/"nobody aboard". The CarryAll is an unmanned cargo type; the V5000 is a prototype.
   - Confidence: **HIGH** for "autonomous"; **MED** that no person was on the V5000 (stated by press, not by the release text).
5. **Wind.** On 1 Nov, despite strong winds, the formation kept "stable flight and safe horizontal and vertical separation".
   - Source: PR Newswire. Confidence: **MED** (company only; no wind speed given).
6. **Earlier steps.** **May 2026**: three-aircraft formation (one V5000 + two V2000-series), testing communication links, route planning and coordination between weight classes. **July 2023**: three Prosperity I prototypes flew together (Electrek called it a world first then).
   - Source: PR Newswire; Interesting Engineering; MiGFlug. Confidence: **HIGH** (May 2026); **MED** (2023, MiGFlug only).
7. **Company quote.** "Coordinating aircraft of different sizes and mission profiles requires precise route planning, flight control, communication, and safety management."
   - Source: PR Newswire. Confidence: **HIGH**.

### B. The aircraft and certification

8. **V2000CG CarryAll certificates (CAAC).** Type Certificate **March 2024**; Production Certificate granted **24 Dec 2024** (announced Jan 2025); Airworthiness Certificate reported **22 Jul 2025**. First ton-class eVTOL with all three.
   - Source: Dronelife 31 Jan 2025 https://dronelife.com/2025/01/31/autoflight-receives-caac-production-certificate-for-carryall-evtol-cargo-aircraft/ ; AeroTime 23 Jul 2025 https://www.aerotime.aero/articles/autoflights-unmanned-evtol-first-to-get-airworthiness-certification-in-china ; sUAS News. Confidence: **HIGH**.
9. **CarryAll specs.** MTOW **2,000 kg**; max payload **400 kg**; range **up to 200 km**; cruise **~180 km/h** (Apr 2026 release) or **200 km/h** (Jun 2026 release). Fully electric, autonomous, lift-and-cruise.
   - Source: ANTARA EN 20 Apr 2026 https://en.antaranews.com/news/412996/autoflight-completes-first-2-ton-class-evtol-tea-delivery-in-china ; sUAS News. Confidence: **HIGH** (manufacturer), but speed differs between releases: say "sekitar 180–200 km/jam".
10. **Real mission example.** Apr 2026: CarryAll flew fresh tea **~120 km between Anshun and Guiyang (Guizhou)** over mountains in **37 minutes**.
    - Source: ANTARA EN release. Confidence: **MED** (company).
11. **V5000 Matrix.** Unveiled Feb 2026 as "world's first 5-ton class eVTOL"; MTOW **5,700 kg**, wingspan **20 m**, length 17.1 m; 10 business seats or 6 VIP; cargo version hybrid, 1,500 kg payload. Pure-electric range **max 250 km**, hybrid **1,500 km**. "Compound wing Lift and Cruise configuration with a distinctive triplane layout and six-arm structure". Not certified.
    - Source: ANTARA EN 24 Feb 2026 https://en.antaranews.com/news/405666/autoflight-unveils-worlds-first-5-ton-class-evtol-aircraft . Confidence: **MED** (manufacturer claims).
12. **Passenger model.** V2000EM **Prosperity** is in CAAC certification, "Phase IV compliance verification" as of Apr 2026; Aviation Week (Dec 2025 headline) said AutoFlight targets 2026 for passenger certification. AeroTime (2025) described it as four passengers plus a pilot; the 2026 release calls it 6-seat.
    - Confidence: **MED**. Not certified as of this research.
13. **CAAC compliant-manufacturer list.** In July 2026 CAAC released its first list of airworthiness-compliant eVTOL manufacturers: ARIDGE (XPeng), EHang, VOLANT, AutoFlight. China's revised Civil Aviation Law (Dec 2025) codified eVTOL type, production and operation approvals.
    - Source: Wikipedia "eVTOL" (tertiary). Confidence: **MED**.

### C. Indonesia angle (verified)

14. **Indonesia validated the CarryAll.** Indonesia's **DGCA (Ditjen Perhubungan Udara)** issued a **Validated Type Certificate on 3 June 2026** for the V2000CG, after an application in July 2025, document review, technical consultations and on-site inspections in China. AutoFlight claims it is the first eVTOL with an overseas type validation. It clears the aircraft for commercial operations in Indonesia; the release pitches inter-island cargo (fresh produce, medicine, emergency supplies) for "more than 17,000 islands".
    - Source: sUAS News https://www.suasnews.com/2026/06/autoflight-v2000cg-granted-worlds-first-evtol-overseas-type-certificate-validation-in-indonesia/ ; China Daily https://www.chinadaily.com.cn/a/202606/11/WS6a2a9ea3a310d6866eb4dc7c.html ; AIN https://www.ainonline.com/aviation-news/futureflight/2026-06-12/indonesia-approves-autoflights-autonomous-evtol-aircraft . Confidence: **HIGH** that it was issued; "first" is the company's claim (MED).
15. **EHang flew passengers in Indonesia.** June 2025: EH216-S made its first pilotless human-carrying flights in Indonesia, under DGCA flight permission for client **Prestige Aviation**; passengers included Rudy Salim and **Raffi Ahmad** (Presidential Special Envoy); Bambang Soesatyo spoke.
    - Source: EHang https://www.ehang.com/news/1241.html . Confidence: **HIGH** (event happened; exact location not read).

### D. Other players

16. **EHang EH216-S** (multicopter, pilotless, 2 seats): CAAC type certificate **Oct 2023**; EHang says it also holds the PC and standard AC; first **Air Operator Certificates** granted to two operators (Guangzhou, Hefei) on **30 Mar 2025**, allowing ticketed sightseeing flights.
    - Source: Wikipedia "eVTOL"/"EHang"; EHang https://www.ehang.com/news/1196.html . Confidence: **HIGH**.
17. **EHang 16-aircraft formation.** At the CMG Spring Festival Gala (Hefei, Feb 2026), **16 EH216-S took off simultaneously and formed a circular formation**, billed as "the largest simultaneous public flight of pilotless human-carrying eVTOL aircraft to date".
    - Source: GlobeNewswire via https://www.nasdaq.com/press-release/ehang-lights-chinas-spring-festival-gala-16-eh216-s-and-22580-gd40-drones-aerial-tech . Confidence: **HIGH**. This is why AutoFlight's "first" must be narrowed.
18. **Joby** (tilt-rotor, six propellers, 1 pilot + 4 passengers, ~320 km/h top speed, up to ~160 km range, 45 dBA cruise at ~500 m claimed). Dubai service now targeted **late 2026**, could slip to early 2027; **no paying passenger yet**; DXB vertiport certified by GCAA July 2026.
    - Source: Avi-Go 6 Nov 2026 https://avi-go.com/news/articles/6c2e195b1c45757547ad48cd7401047b . Confidence: **MED**.
19. **Archer Midnight** (tilt/hybrid, piloted, 4 passengers; claimed up to 160 km, 240 km/h). Abu Dhabi programme on a separate track; Wikipedia says it had not yet flown humans in eVTOL mode as of late 2026.
    - Source: Wikipedia "Archer Aviation"; Avi-Go. Confidence: **MED**.

### E. General technology

20. **Configurations.** Multicopter (radial arms, no wing: Volocopter, EHang); convertiplane (tilt-rotor: Joby, Archer; tilt-wing: Dufour); **lift + cruise** (separate motors for vertical and forward flight: Beta Alia, Eve, AutoFlight).
    - Source: Wikipedia "eVTOL", Flight mechanisms. Confidence: **HIGH** (tertiary, uncontroversial).
21. **AutoFlight's lift + cruise in plain words.** Dedicated lift rotors take off vertically like a helicopter; rear (pusher) propellers push it forward; the fixed wing takes over and the lift rotors can stop.
    - Source: AeroTime. Confidence: **HIGH**.
22. **Distributed electric propulsion (DEP)** traces to NASA's 2009–2010 Puffin concept.
    - Source: Wikipedia "eVTOL". Confidence: **MED**.
23. **Battery vs fuel.** 2018 estimate: packaged Li-ion ~160 Wh/kg vs aviation fuel ~12,500 Wh/kg; 2019 best cells 250–300 Wh/kg. Batteries "suffer from low specific energy", which limits range.
    - Source: Wikipedia "Electric aircraft" and "eVTOL". Confidence: **MED** (tertiary). Safe line: "per kilo, bahan bakar jet menyimpan puluhan kali lebih banyak energi".

---

## 3. Mechanism in 8 animation steps (Bahasa Indonesia)

1. **Banyak baling-baling, bukan satu.** CarryAll punya deretan rotor angkat di lengan-lengan; V5000 punya enam lengan. Tiap rotor diputar motor listrik sendiri (distributed electric propulsion).
2. **Kenapa banyak?** Satu motor mati, yang lain menambah dorongan; komputer menyeimbangkan. Helikopter bergantung pada satu rotor utama. (Konsep umum DEP; angka toleransi gagal tidak dipublikasikan untuk CarryAll.)
3. **Naik tegak.** Rotor angkat mendorong udara ke bawah; pesawat naik seperti helikopter, tanpa landasan.
4. **Transisi.** Baling-baling pendorong di belakang mulai bekerja; pesawat melaju; udara mengalir di atas sayap dan sayap mulai menghasilkan gaya angkat.
5. **Terbang seperti pesawat.** Setelah cukup cepat, rotor angkat berhenti; hanya pendorong yang bekerja. Ini hemat energi karena sayap "gratis" mengangkat.
6. **Otak: fly-by-wire.** Tidak ada tuas yang menarik kabel; komputer kendali penerbangan mengatur kecepatan tiap motor ratusan kali per detik (frekuensi spesifik tidak dipublikasikan, jangan sebut angka).
7. **Formasi.** Tiap pesawat tahu posisinya dari satelit navigasi dan berbagi data dengan yang lain lewat tautan komunikasi, mengikuti rute yang direncanakan, dan menjaga jarak horizontal dan vertikal. AutoFlight hanya menyebut "route planning, flight control, communication, safety management"; GNSS/RTK adalah inferensi umum, bukan pernyataan perusahaan.
8. **Mendarat tegak.** Kebalikannya: melambat, rotor angkat menyala lagi, turun di vertiport (bahkan vertiport terapung "Sunship").

---

## 4. Myths, traps and caveats

- **"Formasi eVTOL pertama di dunia."** Too broad. EHang flew **16 EH216-S** in formation in Feb 2026, and AutoFlight itself flew three Prosperity prototypes in 2023. Safe: "formasi lima eVTOL dari dua kelas bobot berbeda, terbang 47 menit sejauh 133 km, yang disebut AutoFlight sebagai yang pertama".
- **"Diverifikasi lembaga dunia."** No. The claim is the company's; flights were at its own test base, not shared airspace.
- **"Taksi terbang"** framing: the formation aircraft are **cargo and firefighting** types plus a prototype. No passengers. Say "pesawat listrik vertikal" and explain taxi use as the future goal.
- **ANTARA as source.** It is a PR Wire release on ANTARA, not independent journalism.
- **Certification mix-up.** MiGFlug wrote the V2000CG got type certification in July 2025; correct: **TC Mar 2024, PC Dec 2024, AC Jul 2025**. The **V5000 Matrix is not certified**.
- **Speed numbers.** CarryAll 180 vs 200 km/h across releases; use a range.
- **Range claims.** 200 km (CarryAll) and 250 km (V5000 electric) are manufacturer maximums, not tested commercial figures. The 1,500 km is the **hybrid** cargo variant, not battery-only.
- **"Tanpa suara."** Electric is quieter than a helicopter, but not silent. No measured AutoFlight noise figure was found; only Joby publishes 45 dBA at ~500 m.
- **"Sudah beroperasi di Indonesia."** Not verified. The June 2026 VTC **allows** commercial operations; no source read shows actual commercial CarryAll flights in Indonesia yet.
- **Joby/Archer "already flying passengers."** Not as paid service as of 6 Nov 2026.

---

## 5. Hook angles (90-second Indonesian video)

1. **"Lima pesawat terbang barengan 133 km... dan tidak ada satu pilot pun."** Strongest; the video exists (YouTube EYNWS1N2Mk0) as reference for staging.
2. **"Pesawat ini sudah lolos izin Indonesia, Juni lalu."** The DGCA validation: local relevance, verified.
3. **"Ia lepas landas seperti helikopter, lalu mematikan baling-balingnya di udara."** The lift-to-cruise transition paradox.
4. **"Kenapa taksi terbang punya belasan baling-baling?"** Redundancy explainer.
5. **"Kenapa belum bisa terbang Jakarta–Surabaya?"** Battery vs jet fuel energy-per-kilo gap.
6. **"Pesawat 5 ton memimpin empat pesawat 2 ton; yang berat dan yang ringan harus 'menari' seirama."** Formation physics.

---

## 6. Visual / 3D beat ideas

- **Hook:** low lakeside camera, five silhouettes rise vertically with coloured smoke (MiGFlug describes smoke), then pull into a V/line formation; HUD shows "47 MIN / 133 KM / 0 PILOT".
- **Exploded lift+cruise:** generic aircraft (not a branded replica), wing glows when it carries load, lift rotors spin down as pusher spools up; airflow lines switch from downward to over-wing.
- **Redundancy:** one rotor turns red and stops; neighbours brighten; the airframe stays level.
- **Fly-by-wire brain:** a chip in the nose sends pulses to each motor; small RPM bars dance.
- **Formation:** top-down map, satellite icons beam position dots; dashed links between aircraft; separation bubbles (horizontal ring + vertical slab); a wind arrow pushes and bubbles hold. Good spot for an AUDIRA HUD label.
- **Energy bar:** two bars "1 kg baterai" vs "1 kg bahan bakar jet", fuel bar far taller (about 40–75x by the Wikipedia figures; show qualitative).
- **Indonesia payoff:** archipelago map, a CarryAll hops between islands with a medicine crate; label "Izin DGCA, 3 Juni 2026".
- **Vertiport:** floating "Sunship" platform on a lake.

---

## 7. Open questions / unverified

- Exact formation geometry, spacing, altitude, speed of each aircraft: not published.
- Whether navigation used **RTK GNSS**, which datalink, and whether the formation was leader-follower or centrally planned: not stated; treat as general explanation only.
- Number of lift rotors on CarryAll and V5000: not confirmed in sources read (the "six-arm" V5000 structure is stated).
- Battery capacity, charging time, noise in dB for AutoFlight aircraft: not found.
- Wind speed on 1 Nov: not given.
- Whether any person was aboard the V5000: press says unmanned; release says only "autonomously".
- Commercial CarryAll flights in Indonesia after the VTC, operator name, routes: not found.
- EH216-S PC/AC dates and rotor count: not read in a primary source this session.
- Global Times and Caixin pages on the Indonesia VTC: not read (sidebar only / not fetched). AIN full text paywalled.
