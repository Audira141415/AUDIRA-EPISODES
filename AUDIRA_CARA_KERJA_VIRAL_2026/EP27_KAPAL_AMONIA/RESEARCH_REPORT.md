# EP 27: Bahan Bakar Kapal Tanpa Karbon: Cara Kerja Mesin Kapal Amonia

AUDIRA, seri CARA KERJA VIRAL. Created by Agus Dwi R. Status: final dengan voice-over, 10 November 2026.

Riset dari sumber yang dibaca langsung 10 November 2026. Setiap fakta berlabel HIGH, MED, atau LOW; naskah hanya memakai HIGH dan MED.

# EP27 — How an ammonia-fuelled ship works: Terra Clove, the first ammonia dual-fuel VLAC — research notes

Research date: 2026-11-10. This file holds research only, not a script.
Method: Google News RSS (English) and Bing News RSS (English and Indonesian). Bing RSS gives real article URLs, so no link decoding was needed. Article HTML was read with Python urllib (browser User-Agent, normal TLS) and tags were stripped. Primary or near-primary sources read directly: the **Envision press release** (PR Newswire text, via ANTARA and Cyprus Shipping News), the **EPS delivery/naming release** (via Marine Insight), the **Ulsan Port Authority (UPA) release** (via Cyprus Shipping News), the **Everllence FAT release** (via MarineLink), the **WinGD release** on EXMAR's Antwerpen (via Hellenic Shipping News), the **Fortescue release** on Port Hedland (fortescue.com), and the **CMB.TECH release** on Mineral Europa (GlobeNewswire via MENAFN). Ammonia property data came from Wikipedia (the Ammonia infobox and the "Energy density" table). IMO status came from gCaptain, JD Supra (law-firm note) and Argus. DuckDuckGo HTML and Bing web search returned nothing useful. The Wikipedia API returned HTTP 429, so HTML pages were read instead.

Confidence tags: **HIGH** = primary source or 3+ independent outlets agree; **MED** = one good secondary source; **LOW** = single weak source or my inference.

---

## 1. Viral hook: is it recent?

| Headline | Outlet | Published | URL |
|---|---|---|---|
| "Envision Green Ammonia Pasok Bahan Bakar VLAC Pertama di Dunia" (PR Newswire release, ANTARA "Rilis Pers" section) | ANTARA | **Thu 5 Nov 2026, 10:40 WIB** | https://www.antaranews.com/berita/5833143/envision-green-ammonia-pasok-bahan-bakar-vlac-pertama-di-dunia |
| "Envision Green Ammonia successfully fuels the World's First VLAC" (same release, English) | Cyprus Shipping News | 6 Nov 2026 | https://cyprusshippingnews.com/2026/11/06/envision-green-ammonia-successfully-fuels-the-worlds-first-vlac/ |
| "Envision Fuels World's First Ammonia-Fuelled VLAC with Green Ammonia" | Ship & Bunker | 3 Nov 2026 | https://shipandbunker.com/news/apac/514823-envision-fuels-worlds-first-ammonia-fuelled-vlac-with-green-ammonia |
| "Chinese green hydrogen megaproject supplies fuel to world's first ammonia-fuelled VLAC" (paywalled after the lead) | Hydrogen Insight | 3 Nov 2026 | https://www.hydrogeninsight.com/transport/chinese-green-hydrogen-megaproject-supplies-fuel-to-world-s-first-ammonia-fuelled-very-large-ammonia-carrier/2-1-2068097 |
| "Ulsan Port advances commercial green ammonia bunkering ... 800-tonne fuel supply to world's first ammonia dual-fuel VLAC" (UPA release) | Cyprus Shipping News / AJOT | 4–9 Nov 2026 | https://cyprusshippingnews.com/2026/11/09/ulsan-port-advances-commercial-green-ammonia-bunkering-capabilities-with-800-tonne-fuel-supply-to-worlds-first-ammonia-dual-fuel-vlac/ |
| "World's First Ammonia Dual-Fuel VLAC Fitted With Everllence Main Engine Delivered" (EPS release) | Marine Insight | 24 Oct 2026 | https://www.marineinsight.com/worlds-first-ammonia-dual-fuel-vlac-fitted-with-everllence-main-engine-delivered/ |
| "EPS takes delivery of first ammonia-fuelled ship fitted with Everllence main engine" | Lloyd's List (not read, title only) | 22 Oct 2026 | — |
| "VESSEL REVIEW: Terra Clove – Ammonia dual-fuel VLAC for Eastern Pacific Shipping" | Baird Maritime (not read, title only) | 5 Nov 2026 | — |

**Which ship:** **Terra Clove**, a **93,000 m³** Very Large Ammonia Carrier (VLAC). Owner: **Eastern Pacific Shipping (EPS)**, Singapore. Builder: **HD Hyundai Heavy Industries (HHI)**, Ulsan. Engine: **Everllence B&W 6G60ME-C10.5-LGIA**. Everllence is the new name of **MAN Energy Solutions**, so this is the "MAN B&W ME-LGIA" engine, **not WinGD X-DF-A**. HHI's Engine & Machinery unit built it under licence. Class: **ABS** (ABS took part in the partnership; MED that ABS is the class society). Flag: Singapore (MSN title "Singapore's registry lists first ammonia dual-fuelled newbuild", 22 Oct; MED, title only).

**Verdict:** The story is fresh and real, but the ANTARA headline is ambiguous and overclaims if read loosely.
- **What "pertama di dunia" means:** Terra Clove is the first **VLAC fitted with ammonia dual-fuel propulsion**. It is also the **first seagoing Everllence (MAN) two-stroke ammonia engine** (EPS CEO). It is **not** the first ammonia-fuelled ship. It is **not** the first green-ammonia bunkering, and **not** the first VLAC.
- **Where and when:** about **800 t** of green ammonia went aboard on **25–26 Oct 2026** at **Pier 2, Ulsan Main Port, South Korea**. The method was **pipe-to-ship** (shore pipeline straight to the ship). UPA is the source. HIGH.
- **Chifeng is the factory, not the port.** The ammonia was made at Envision's plant in **Chifeng, Inner Mongolia (China)**. **LOTTE Fine Chemical** supplied it from its Ulsan terminal. Envision announced it on 3 Nov; ANTARA ran the release on 5 Nov.

---

## 2. Verified facts

### A. Terra Clove and its engine

1. **Ship:** Terra Clove, VLAC, **93,000 m³**. Owner EPS (Singapore); builder HD Hyundai Heavy Industries. Named at HHI in Ulsan around **22 Oct 2026** (Marine Insight, Splash247, QCintel titles dated 22 Oct). HIGH.
2. **Engine:** **Everllence B&W 6G60ME-C10.5-LGIA**, an ammonia dual-fuel **two-stroke** engine. LGIA = **Liquid Gas Injection Ammonia**. Built under licence by HHI-EMD. EPS calls it "the first seagoing application of Everllence's two-stroke ammonia engine technology". HIGH.
3. **Engine milestones:** launched in Copenhagen on **13 Nov 2025**. More than **800 tests** and more than **150,000 engineering hours** since July 2023, including tests at Mitsui E&S in Japan. **Factory acceptance test (FAT) passed in April 2026** at HHI-EMD. It is fitted with **HPSCR (High-Pressure Selective Catalytic Reduction)** for NOx (Everllence via MarineLink, 20 Apr 2026). The first bore sizes offered are G50, S50, S60, G60, G70 and G80. HIGH.
4. **Operating principle:** "runs on ammonia using the **Diesel principle**", meaning compression ignition with a pilot fuel, based on the existing ME-LGIM (methanol) and ME-LGIP (LPG) platforms (Biofuels Digest; Everllence via Hellenic Shipping News). The ship "retains flexibility to use conventional marine fuel" (EPS, Envision). HIGH.
5. **Safety hardware on the engine** (Everllence via Hellenic Shipping News, Feb 2026): HIGH.
   - **double-walled piping** with continuous ventilation and monitored airflow sent to treatment;
   - an **ammonia release mitigation system** and an **ammonia catch system** (knockout drum plus water-column scrubbing);
   - a fuel valve train with **double block-and-bleed** isolation and **nitrogen purging**;
   - **vapour sensors** and digital remote monitoring.
6. **The bunkering was for trials.** EPS said it would bunker Envision's green ammonia "to support Terra Clove's **ammonia-burning trials**" (Marine Insight). So the milestone is fuel delivered for first operation, not a finished ocean voyage on ammonia. HIGH that EPS said this; whether it has since sailed loaded on ammonia is **unverified**.
7. **Partnership:** formed in Sept 2023 by EPS, HHI, Everllence (then MAN ES), the **Maritime and Port Authority of Singapore (MPA)** and **ABS**. At the naming, EPS signed a partnership with the Mærsk Mc-Kinney Møller Center for Zero Carbon Shipping. HIGH.

### B. The bunkering event

| Item | Fact | Source / confidence |
|---|---|---|
| Date | **25–26 Oct 2026** | UPA release. HIGH |
| Place | Pier 2, **Ulsan Main Port**, South Korea | UPA. HIGH |
| Quantity | about **800 tonnes** green ammonia | UPA. HIGH |
| Method | **Pipe-to-Ship (PTS)**, shore pipeline straight to the ship | UPA. HIGH |
| Supplier at the port | **LOTTE Fine Chemical** ("Asia's largest ammonia distributor", per EPS) | EPS, UPA, Ship & Bunker. HIGH |
| Producer | **Envision Energy**, Chifeng Green Hydrogen & Ammonia Industrial Park, Inner Mongolia | Envision. HIGH |
| Announcement | Envision, Tue **3 Nov 2026**; ANTARA ran it on 5 Nov | Ship & Bunker, ANTARA. HIGH |
| Earlier UPA job | **April 2026**: first green-ammonia bunkering at Ulsan, about **600 t** to a "45K-class gas tanker", also PTS | UPA. HIGH (that ship is not named; it may be EXMAR's Antwerpen, built at HHI. LOW, my inference) |

### C. Envision's Chifeng plant (the green-ammonia source)

- Current output **320,000 t/yr** green ammonia; planned total **1.52 million t/yr** (Envision). HIGH.
- Hydrogen Insight says the project is **500 MW** (MED, lead text only).
- Off-grid wind, solar and storage power the plant. Envision calls it "the world's largest" green hydrogen and ammonia plant (Envision PR, July 2025). Treat "largest" as the company's own claim. MED.
- Certified by **Bureau Veritas** (ISO). The product meets **RFNBO** (EU Renewable Fuel of Non-Biological Origin) and **ISCC** requirements (Envision). HIGH that Envision says so.
- **Feb 2026:** Envision's first commercial green-ammonia shipment, Chifeng to LOTTE Fine Chemical in Ulsan. Envision calls it "the world's first end-to-end commercial delivery" of green ammonia. That is the company's claim. HIGH that they said it.

### D. Earlier "firsts" that qualify the claim (chronological)

| Date | First | Ship / engine | Source / confidence |
|---|---|---|---|
| 2024 (certified) | First ammonia dual-fuel vessel (converted 75 m offshore vessel). Later the "first vessel to sail on ammonia in international waters" (2025 voyage: London, Rotterdam, Boston, New York, COP30 Belém) | **Fortescue Green Pioneer** | Maritime Executive, MarineLink. HIGH |
| 2024 | World-first ship-to-ship ammonia transfer, Port of Dampier, Australia | — | Fortescue release. HIGH |
| **23 Aug 2024** | First **commercial-use** ammonia-fuelled vessel. A 37 m, 272 t tug converted from LNG, with an IHI Power Systems engine. Tokyo Bay demo up to **≈95% GHG cut** (consistently above 90%) | **NYK Sakigake** | Maritime Executive, Mar 2025. HIGH |
| **Jul 2025** | Envision's "world's first green marine ammonia bunkering": a **5,500 HP ammonia-fuelled port vessel** at COSCO Shipping Heavy Industry, Dalian | — | Envision PR, 25 Jul 2025. HIGH that Envision claimed it |
| Late 2025 / early 2026 | First dual-fuel two-stroke ammonia engines delivered: WinGD and J-ENG in late 2025, Everllence in early 2026 | — | Everllence article (Hellenic Shipping News). MED |
| **Jun 2026** | "World's first **ocean-going** ammonia-fuelled vessel" delivered. A 46,000 m³ LPG/ammonia midsize gas carrier with a **WinGD X52DF-A** engine, built at HHI | **EXMAR Antwerpen** | WinGD release. HIGH |
| **27 Jun–14 Jul 2026** | First commercial voyage by an ocean-going ammonia-powered ship: Nanjing to Paradip (India), carrying more than 30,000 t ammonia cargo | Antwerpen | Biofuels Digest. HIGH |
| **9 Oct 2026** | "World's first ammonia-powered **dry bulk** vessel" starts its maiden voyage. 210,000 dwt Newcastlemax, CMB.TECH, built by CSSC Qingdao Beihai | **Mineral Europa** | CMB.TECH release. HIGH |
| **13 Oct 2026** | About 1,000 t green ammonia transferred ship-to-ship at a **Zhoushan** anchorage (China) to Mineral Europa. CEEC claims "first commercial STS green ammonia bunkering" | Mineral Europa / bunker ship *Shenghang Yongle* | Tech Times, citing CEEC. MED |
| **25–26 Oct 2026** | **Terra Clove**: first ammonia dual-fuel **VLAC** gets 800 t of green ammonia, Ulsan | Terra Clove / Everllence ME-LGIA | UPA, Envision. HIGH |
| **2 Nov 2026** | Australia's first green-ammonia bunkering, Port Hedland, about 2 h, STS to Mineral Europa | Mineral Europa | Fortescue, gCaptain. HIGH |

**So:** Terra Clove is the first VLAC with this capability and the first ship with an Everllence (MAN) ammonia two-stroke engine. It was **not** the first ocean-going ammonia ship (Antwerpen, June 2026). It was **not** the first green-ammonia bunkering, either in general (Envision's own Dalian job in July 2025) or for a large ocean-going ship (Mineral Europa at Zhoushan, 13 Oct 2026). Fleet size: an Everllence article (Feb 2026) counted **3 ammonia-capable ships in operation and 45 on order** (MED). CMB.TECH alone expects **21** ammonia ships by 2029 (HIGH).
**Viking Energy (Eidesvik, Wärtsilä):** a PSV conversion to ammonia was "set to begin" its execution phase in Feb 2026 (Maritime Executive, title only). I found no proof it is operating yet. LOW. Do not use it as a "first".

### E. Ammonia as a fuel: properties

| Property | Value | Source / confidence |
|---|---|---|
| Formula | NH₃, one nitrogen and three hydrogen, **no carbon** | HIGH |
| Boiling point (1 atm) | **−33.34 °C** | Wikipedia infobox. HIGH |
| Storage | Refrigerated at about −33 °C near atmospheric pressure (large carriers such as VLACs), **or** as a liquid under about 8–10 bar at room temperature (smaller tanks) | General engineering knowledge. MED (no pressure figure read from a primary source) |
| Energy per kg (LHV) | **18.6 MJ/kg**, vs diesel **45.6** | Wikipedia "Energy density" table. HIGH |
| Energy per litre | **11.5 MJ/L**, vs diesel **38.6 MJ/L** | Same table. Wikipedia: "about a third that of diesel". HIGH |
| Auto-ignition temperature | **651 °C** | Wikipedia infobox. HIGH |
| Flammable range in air | **15–33.6%** (narrow; hard to ignite) | Wikipedia infobox. HIGH |
| Toxicity | IDLH **300 ppm**; OSHA PEL 50 ppm; ACGIH TLV 25 ppm | Wikipedia infobox. HIGH |
| Combustion products | N₂ + H₂O ideally. Real engines also produce **NOx**, **N₂O** and **unburnt NH₃ ("ammonia slip")** | gCaptain names N₂O as the key caveat. HIGH qualitatively |
| N₂O warming | A strong greenhouse gas, about **273× CO₂** over 100 years (IPCC AR6) | MED (from memory, not re-read this session) |
| Ignition difficulty | Much higher minimum ignition energy and much slower laminar flame speed than diesel or methane. That is why the engine needs a **pilot fuel** | Textbook combustion data. MED (no specific mJ or cm/s figures were read from a source) |

**Energy-density takeaway:** per litre, ammonia holds about **30%** of diesel's energy (11.5 vs 38.6 MJ/L). Per kg it holds about **41%** (18.6 vs 45.6). For the same range, a ship needs roughly **3× the tank volume** before counting insulation. The brief's "about half by volume" is **wrong**; "about half per kg" is roughly right.

### F. How green ammonia is made (Haber-Bosch)

- Renewable electricity powers **electrolysis**: water splits into H₂ and O₂.
- **Air separation** pulls N₂ out of air.
- **Haber-Bosch synthesis:** N₂ + 3H₂ → 2NH₃ over an iron catalyst at high temperature and pressure (standard chemistry). HIGH.
- CMB.TECH's wording: green ammonia "combines renewable power, water and air". HIGH.
- **Grey ammonia** uses hydrogen from natural gas. Conventional ammonia production emits about **500 million t CO₂/yr**, and world output was **235 million t in 2021** (Wikipedia). MED.
- Pupuk Indonesia's ammonia is gas-based (see 2H), so it is grey, not green.

### G. Regulation: IMO status in Nov 2026

- The **IMO Net-Zero Framework (NZF)** was approved at **MEPC 83** (April 2025). It sets fuel GHG-intensity limits plus a price on emissions and rewards for zero/near-zero fuels. Its **adoption was due in Oct 2025**, but the extraordinary MEPC session was **adjourned for one year** after "an aggressive U.S. campaign" (gCaptain, Aug 2026). HIGH.
- **MEPC 84** (2026) left the NZF unchanged and set up intersessional talks. **MEPC 85 is scheduled for 30 Nov–3 Dec 2026**, and the **adjourned extraordinary session resumes 4 Dec 2026** (JD Supra). Intersessional meetings: 1–4 Sep and 23–27 Nov. MED-HIGH.
- On **16 Mar 2026** the US filed a submission asking the IMO to end the NZF entirely (JD Supra). Several competing proposals are on the table (Liberia, Brazil, Tuvalu, AU/CA/ZA/UK) (gCaptain). The IBIA president expects that the NZF "is unlikely to pass" without big compromises (Argus, 26 Oct 2026). HIGH.
- **Bottom line:** as of 10 Nov 2026, **no binding global IMO rule rewards ammonia yet**. The decision is weeks away. Fortescue CEO: "Industry has moved ahead of regulation" (gCaptain). HIGH.
- **Safety rules:** in **May 2026** the IMO approved ammonia-fuel safety guidelines for gas carriers, after a Belgian-led push (MarineLink and Biofuels Digest titles, 26 May 2026). MED, title-level only. EXMAR notes that ammonia carriers fall under the **IGC Code**, while other ships fall under the **IGF Code**.

### H. Indonesia angle

- **Pupuk Indonesia** (state-owned) produces about **7 million t/yr of ammonia**. Its group capacity is **7.1 million t/yr**, making it one of Southeast Asia's largest producers (Jakarta Globe, 2 Nov 2026; industry.co.id, 6 Nov 2026). HIGH.
- **2 Nov 2026:** Pupuk Indonesia is exploring an **"Ammonia Hub" in Batam** with BP Batam, including **ammonia bunkering for ships**. It wants to compete with Singapore, which is developing ammonia bunkering around Jurong Island. Figures reported:
  - about **US$500 million** for an initial plant (Jakarta Globe);
  - "Rp8 triliun" (Bisnis) and "Rp10 triliun" (Suara) in headlines.
  - Feedstock gas from **Natuna and Grissik**. CEO Rahmad Pribadi: "My dream is that one day Batam can become like Rotterdam and Antwerp."
  - HIGH that the plan was announced; the amounts differ between outlets.
- **Green ammonia projects:**
  - **2024:** PLN, Pupuk Indonesia and ACWA Power agreed to cooperate on green hydrogen and ammonia (Tempo, Merdeka, Sep 2024).
  - **Aug 2024:** Pupuk Indonesia with Japanese partners started FEED for "Project GAIA", which it called the "first hybrid green ammonia" plant in the world (Jawapos, detik). MED; the current status was not checked.
- **News coincidence:** the Batam hub (2 Nov), Terra Clove (ANTARA 5 Nov) and Port Hedland (2 Nov) all landed in the same week. That gives the video a strong "kenapa ini penting buat Indonesia" beat.

---

## 3. Mechanism in 7 animation steps (Bahasa Indonesia)

1. **Kenapa amonia?** Solar kapal = rantai karbon panjang. Dibakar → CO₂ keluar cerobong. Amonia (NH₃) cuma 1 nitrogen + 3 hidrogen, **tanpa atom karbon**. Dibakar sempurna → sisanya nitrogen (N₂) dan uap air. Tidak ada CO₂ dari cerobong.
2. **Membuat amonia hijau.** Listrik angin + surya di Chifeng, Mongolia Dalam → elektrolisis memecah air jadi hidrogen. Udara disaring → nitrogen. Keduanya dipertemukan di reaktor Haber-Bosch (panas, tekanan tinggi, katalis besi) → NH₃. Kapasitas pabrik Envision sekarang 320.000 ton/tahun.
3. **Menyimpan "bahan bakar dingin".** Amonia mendidih di −33 °C. Di kapal raksasa ia disimpan cair dan didinginkan di tangki berinsulasi. Tapi energinya per liter cuma sekitar sepertiga solar (11,5 vs 38,6 MJ/L), jadi tangkinya harus jauh lebih besar.
4. **Mengisi bahan bakar (bunkering).** 25–26 Oktober 2026, Pelabuhan Ulsan, Korea Selatan. Sekitar 800 ton amonia hijau mengalir lewat pipa langsung dari darat ke Terra Clove. Kapalnya kapal tanker amonia raksasa 93.000 m³, jadi ia juga mengangkut "bahan bakarnya" sendiri sebagai muatan.
5. **Masalahnya: amonia malas terbakar.** Suhu nyala sendirinya 651 °C, apinya lambat, dan rentang campuran yang bisa menyala sempit. Solusinya: mesin dual-fuel dua langkah Everllence (dulu MAN). Amonia cair disuntikkan bertekanan tinggi ke silinder, lalu sedikit **solar pilot** disuntikkan sebagai "korek api" yang memulai pembakaran.
6. **Racun dan pengaman.** Amonia beracun (berbahaya di atas 300 ppm). Maka pipanya berdinding ganda dengan ventilasi terus-menerus, ada sensor gas, pembersihan pipa dengan nitrogen, dan "penangkap amonia" berupa scrubber air. Kalau sensor mencium bocor, mesin otomatis pindah ke solar.
7. **Knalpot belum sepenuhnya bersih.** Pembakaran amonia bisa menghasilkan NOx, N₂O (gas rumah kaca ±273× CO₂) dan sisa amonia. Gas buang lewat katalis SCR bertekanan tinggi (HPSCR) yang mengubah NOx jadi nitrogen + air. Jadi "nol karbon" baru benar kalau amonianya hijau dan N₂O-nya ditekan.

---

## 4. Myths, traps and caveats

- **"Kapal berbahan bakar amonia pertama di dunia."** Wrong.
  - Sakigake (tug, Aug 2024) and Green Pioneer (2024) came earlier.
  - EXMAR **Antwerpen** was the first **ocean-going** ammonia ship (June 2026).
  - Mineral Europa (bulk carrier) sailed in Oct 2026.
  - Say "kapal tanker amonia raksasa (VLAC) **pertama** yang bisa berbahan bakar amonia".
- **"Bunkering amonia hijau pertama di dunia."** Wrong.
  - Envision itself claimed a world first at Dalian in July 2025.
  - Ulsan bunkered 600 t in April 2026.
  - Mineral Europa took 1,000 t STS at Zhoushan on **13 Oct 2026**, before Terra Clove.
- **"VLAC pertama di dunia"** (ANTARA headline). VLACs already exist. What is first is the **ammonia dual-fuel** VLAC.
- **"Diisi di Chifeng."** Chifeng is the inland **factory** in Inner Mongolia. The fuel was loaded in **Ulsan, South Korea**, via LOTTE Fine Chemical.
- **"Mesin WinGD X-DF-A."** That engine is on EXMAR's Antwerpen (X52DF-A). Terra Clove has an **Everllence (ex-MAN) B&W 6G60ME-C10.5-LGIA**.
- **"MAN Energy Solutions."** The company is now called **Everllence**. Say "Everllence (dulu MAN Energy Solutions)".
- **"Kapalnya sudah berlayar penuh pakai amonia."** The release says the fuel supports **ammonia-burning trials**. Say "siap uji coba pembakaran amonia".
- **"100% amonia, tanpa solar."** No. The engine needs **pilot fuel** and can switch to conventional fuel at any time. The pilot share for this engine was **not found** (§7).
- **"Nol emisi."** Wrong for two reasons.
  - There is no **CO₂ at the stack**, but **NOx, N₂O and ammonia slip** remain.
  - It is only "green" if production uses renewables. Grey ammonia from gas carries a big CO₂ footprint upstream.
  - Say "**nyaris tanpa CO₂ dari cerobong**" or "potensi pengurangan emisi besar sepanjang siklus hidup" (EPS's own wording: "significant lifecycle greenhouse gas emissions reductions").
- **"Energi amonia setengah dari solar."** By **volume** it is about **one-third** (11.5 vs 38.6 MJ/L). Per kg it is about 41%.
- **"Amonia meledak seperti bensin."** Its flammable range is narrow (15–33.6%) and it auto-ignites at 651 °C. The real danger is **toxicity**, not explosion.
- **"Sakigake mengurangi emisi 100%."** NYK says **up to ~95%** reduction, and consistently above 90%.
- **"IMO sudah mewajibkan."** The Net-Zero Framework is **not adopted**. Adoption was adjourned in Oct 2025, and the next decision comes at MEPC 85 / the resumed ES on 30 Nov–4 Dec 2026, with the US opposed.
- **"Envision perusahaan Korea/Singapura."** Envision is **Chinese** (Shanghai). EPS is Singaporean. HHI and LOTTE are Korean. Everllence is German-Danish (HQ Augsburg; two-stroke R&D in Copenhagen). The Everllence HQ is LOW confidence; not re-checked.
- **"Pupuk Indonesia bangun amonia hijau di Batam."** The Batam hub uses **natural gas** from Natuna and Grissik, so it would make **grey/blue** ammonia, not green. The investment figure varies by outlet ($500 million / Rp8 triliun / Rp10 triliun).
- **"Terbesar di dunia"** for the Chifeng plant is Envision's own claim. Attribute it ("klaim Envision").

---

## 5. Hook angles (90-second Indonesian video)

1. **"Kapal raksasa ini minum bahan bakar yang sama dengan pupuk di sawah kita: amonia."** Strongest. It links the ship to everyday Indonesia (urea and fertiliser, Pupuk Indonesia).
2. **"Bahan bakar kapal tanpa satu pun atom karbon. Tapi untuk menyalakannya, tetap butuh sedikit solar."** The paradox hook leads straight into the pilot-fuel mechanism.
3. **"800 ton bahan bakar dari angin dan matahari Mongolia, dialirkan ke kapal di Korea."** Supply-chain map hook.
4. **"Bahan bakar ini beracun. Kenapa kapal malah memilihnya?"** Toxicity tension, with the safety-system payoff.
5. **"Satu liter amonia cuma sepertiga energi solar. Jadi kenapa kapal pakai amonia?"** Counter-intuitive number.
6. **"Seminggu yang sama: Korea isi kapal amonia, Australia juga, dan Pupuk Indonesia mau saingi Singapura di Batam."** Indonesia-relevance hook.
7. **"Kapal yang mengangkut bahan bakarnya sendiri."** A VLAC carries ammonia as cargo and can burn ammonia, the EXMAR/LNG-carrier logic.

Best: **#1 or #2**. #2 sets up the mechanism best. #1 has the widest local appeal.

---

## 6. Visual / 3D beat ideas

- **Open:** a night harbour (generic Ulsan-like cranes). A huge gas carrier with **four domed/prismatic tanks** on deck and a glowing pipeline from shore. HUD: "25–26.10.2026 · ULSAN · 800 t NH₃". Put an AUDIRA tag on a HUD panel ("AUDIRA FUEL DESK") or stencil it on a shore-side tank.
- **Molecule morph:** a diesel hydrocarbon chain (many black C atoms) breaks apart. Each C pairs with O₂ to form CO₂ puffs out of the stack. Cut to NH₃ (blue N plus three white H): it burns to N₂ + H₂O and the stack stays clear.
- **Green chain map:** a wind/solar field in Inner Mongolia, then an electrolyser (water splits, H₂ bubbles), plus an air column (N₂). Both feed a Haber-Bosch reactor glowing orange, then a tanker crosses the Yellow Sea to Ulsan. Counter: 320,000 t/yr.
- **Tank-size comparison:** three diesel jerrycans' worth of energy equals about nine ammonia cans, or a tank cube vs a cube three times bigger. Label "11,5 vs 38,6 MJ/L".
- **Engine cutaway (hero):** a two-stroke crosshead engine cylinder in section. The piston rises; a big ammonia spray enters, then a tiny diesel pilot jet sparks a flame front that spreads slowly. Contrast it with a quick diesel flame. Label "solar pilot = korek api".
- **Safety X-ray:** double-walled pipe in cross-section (inner fuel, outer ventilated annulus with airflow arrows). Gas-sensor pings turn red, and an auto-switch lever flips "NH₃ → DIESEL". A water-column scrubber bubbles.
- **Exhaust after-treatment:** a gas stream with NOx (orange) and N₂O (purple) particles passing through an SCR honeycomb. Orange turns to N₂ + H₂O. Leave a few purple N₂O particles with the caption "N₂O: 273× CO₂, harus ditekan".
- **"Firsts" timeline ribbon:** 2024 Sakigake (tug) → 2024 Green Pioneer → Jul 2025 Dalian bunkering → Jun 2026 Antwerpen (first ocean-going) → Oct 2026 Mineral Europa → **Oct 2026 Terra Clove (first VLAC)**. It honestly frames what "pertama" means.
- **Indonesia map payoff:** zoom to the Strait of Singapore. The Jurong (Singapore) pin vs the Batam pin labelled "Ammonia Hub Pupuk Indonesia (rencana)", with 7 million t/yr capacity. Ends on a question: "Batam jadi pom bensin kapal masa depan?"
- **Regulation clock:** an IMO building with a countdown to "MEPC 85 · 30 Nov–4 Des 2026" and a scale that tips between "aturan global" and "belum disepakati".

---

## 7. Open questions / unverified

- **Pilot-fuel share of the ME-LGIA** (percent of energy from diesel at load): not found in any source read. Do not quote a number.
- **Exact N₂O / NOx / ammonia-slip figures for Terra Clove:** not published in what I read. The "≈95% GHG cut" figure is Sakigake's (a different engine), not Terra Clove's.
- **Has Terra Clove made a loaded ocean voyage on ammonia yet?** Unknown. The releases speak of trials.
- **Terra Clove's flag and class:** Singapore and ABS are likely (MPA and ABS are partners; MSN title). Not confirmed from a registry.
- **Mineral Europa's engine make** (WinGD X72DF-A?): not checked. LOW.
- **The "45K-class gas tanker" bunkered at Ulsan in April 2026:** unnamed; possibly Antwerpen. LOW.
- **Chifeng 500 MW:** from Hydrogen Insight's lead only (paywall).
- **Storage pressure for pressurised ammonia** (about 8–10 bar at ambient) and Terra Clove's fuel-tank type and size: not read from a source.
- **N₂O GWP 273:** from memory of IPCC AR6; re-check before on-screen use.
- **Pupuk Indonesia green-ammonia projects (GAIA, ACWA/PLN):** the 2024 announcements were seen as titles only. Current status is unknown.
- **Viking Energy (Eidesvik):** conversion status after Feb 2026 unknown.
- **IMO May 2026 ammonia guidelines:** title-level only; the exact instrument (MSC circular?) was not read.

### Sources that failed

- safety4sea.com: **HTTP 403**.
- Hydrogen Insight and QCintel: paywall after the lead.
- Lloyd's List, TradeWinds, Baird Maritime, Splash247: not read (paywall or titles only).
- Jakarta Globe: the article loaded, but the end was truncated by a login wall.
- Wikipedia API: **HTTP 429**. The HTML pages worked.
- DuckDuckGo HTML and Bing web-search RSS: empty or irrelevant results. Only Bing **News** RSS worked.
- MarineLink Green Pioneer article: timed out once, then loaded on the AMP URL.
