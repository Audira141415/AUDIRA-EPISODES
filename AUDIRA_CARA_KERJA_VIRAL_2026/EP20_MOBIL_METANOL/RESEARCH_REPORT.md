# EP 20: Mobil Minum Alkohol: Cara Kerja Mesin Metanol

AUDIRA, seri CARA KERJA VIRAL. Created by Agus Dwi R. Status: final dengan voice-over, 9 November 2026.

Riset dari sumber yang dibaca langsung 9 November 2026. Setiap fakta berlabel HIGH, MED, atau LOW; naskah hanya memakai HIGH dan MED.

# EP20 — How a methanol car works (Geely Xingyao 6 EF): research notes

Research date: 2026-11-09. This file holds research only, not a script.
Method: Google News RSS (English and Indonesian). Links were decoded to real URLs through Google's batchexecute endpoint until Google returned HTTP 429. After that, Bing News RSS (`format=rss`) gave direct links. Article HTML was read with Python urllib. Fuel properties come from the open-access accepted manuscript of Verhelst et al. 2019 (Ghent University repository PDF, found via Unpaywall). Plant facts come from Carbon Recycling International (CRI) project pages. Wikipedia "Methanol fuel" was used as a tertiary source. The Wikipedia API later returned HTTP 429. DuckDuckGo HTML returned a bot page.

---

## 1. Viral hook: is it recent?

| Headline | Outlet | Published | URL |
|---|---|---|---|
| "Geely Resmi Luncurkan Xingyao 6 EF, Mobil Bertenaga Metanol Pertama di Dunia" | OWRITE | **5 Nov 2026** 13.42 WIB | https://www.owrite.id/otomotif/2026/11/05/geely-resmi-luncurkan-xingyao-6-ef-mobil-bertenaga-metanol-pertama-di-dunia/ |
| "Geely Launches Methanol Hybrid Technology and World's First Production Methanol Hybrid Sedan" (official press release, GlobeNewswire) | Business Insider Markets | **3 Nov 2026** | https://markets.businessinsider.com/news/stocks/geely-launches-methanol-hybrid-technology-and-world-s-first-production-methanol-hybrid-sedan-1036706781 |
| "Geely launches Xingyao 6 EF, calling it world's first production methanol hybrid sedan" | CnEVPost | 3 Nov 2026 | https://cnevpost.com/2026/11/03/geely-launches-xingyao-6-ef-methanol-hybrid-sedan/ |
| "Geely Emgrand L EM-i sedan got methanol version for 11,550 USD in China" | CarNewsChina | 3 Nov 2026 (updated 4 Nov) | https://carnewschina.com/2026/11/03/geely-emgrand-em-i-sedan-got-methanol-version-for-11550-usd/ |
| "Geely Xingyao 6 EF methanol hybrid hits market, starting at RMB 76,800" | Gasgoo | 4 Nov 2026 | https://autonews.gasgoo.com/articles/news/geely-xingyao-6-ef-methanol-hybrid-hits-market-starting-at-rmb-76800-2117805999020462081 |
| "Geely launches methanol plug-in hybrid sedan with 1880km range" | CarExpert (Australia) | 4 Nov 2026 | https://www.carexpert.com.au/car-news/geely-launches-methanol-plug-in-hybrid-sedan-with-1880km-range |
| "Geely Sheds the 'Fleet Vehicle' Label for Methanol Electric Hybrids?" (analysis) | Gasgoo | 6 Nov 2026 | https://autonews.gasgoo.com/articles/market-industry/geely-sheds-the-fleet-vehicle-label-for-methanol-electric-hybrids-2118707080193806336 |

**Verdict: the news is recent. The OWRITE headline is wrong.**
- The launch is real and fresh: Shenyang, Liaoning, **Tuesday 3 November 2026**.
- Geely's own claim is narrower: "world's first **production methanol hybrid** passenger vehicle / sedan". OWRITE's body text repeats that ("hybrid metanol produksi massal pertama"), but its headline drops "hybrid" and says "mobil bertenaga metanol pertama di dunia". That is false.
- Even Geely's narrow claim is disputed. CarExpert writes that it is "not the first methanol hybrid, nor even Geely's". Gasgoo reported on **30 Jun 2022** that Geely's 4th-generation Emgrand methanol hybrid went on sale and called it "the world's first methanol hybrid sedan". The defensible novelty is a mass-market **plug-in** hybrid that is **flex-fuel**: methanol and gasoline mix in any ratio in one tank, it charges from the grid, and it is sold to private buyers.
- Safe framing in Bahasa Indonesia: "Geely meluncurkan sedan hybrid plug-in metanol untuk keluarga, 3 November 2026. Mobil metanol sendiri sudah ada puluhan tahun."

---

## 2. Verified facts

### A. The Xingyao 6 EF

1. **What it is.** A plug-in hybrid sedan that runs on methanol, gasoline or electricity. Methanol and gasoline can be mixed in any ratio in the same tank. **EF = "E-Fuel"**. Other names: Galaxy Xingyao 6 EF / Galaxy Starshine 6 EF in China, and Emgrand L EM-i outside China (petrol PHEV version).
   - Sources: Geely press release; CnEVPost; CarNewsChina. Confidence: **HIGH**.
2. **Launch.** 3 Nov 2026, Shenyang. Three variants. Limited-time prices **76,800–96,800 yuan**; guide prices 86,800–106,800 yuan.
   - Sources: CnEVPost; Gasgoo; CarNewsChina. Confidence: **HIGH**.
3. **Engine.** Naturally aspirated **1.5 L four-cylinder** (code BHE15-BFDM per CarNewsChina), **93 kW / 170 Nm**. Front motor **140 kW / 240 Nm**, 1-speed DHT.
   - Sources: CarExpert; CarNewsChina. Confidence: **HIGH** (two outlets agree).
4. **Thermal efficiency 48.15%**, which Geely calls "the highest among mass-produced methanol engines globally".
   - Source: Geely press release. Confidence: **HIGH that Geely claims it**. It is not independently tested; present it as a claim ("diklaim").
5. **Cold-start technology.** **350-bar** high-pressure direct injection and a high-energy ignition system: cold starts "approaching minus 40 °C". Gasgoo: no gasoline warm-up needed. CarNewsChina: ignition energy 120 mJ.
   - Sources: press release; Gasgoo; CarNewsChina. Confidence: **HIGH** for the claim; **MED** for 120 mJ (one source).
6. **Fuel sensor.** A methanol concentration sensor reads the blend from "subtle electrical current changes" as fuel passes. The ECU then adjusts injection and ignition. Gasgoo analysis: it identifies the ratio within **20 ms**.
   - Sources: press release; Gasgoo 6 Nov. Confidence: **HIGH** (sensor); **MED** (20 ms).
7. **Batteries and range (CLTC).** LFP packs of **17 kWh** (130 km electric) or **28.3 kWh** (230 km). Combined range about **1,250 km** with a full methanol tank plus charged battery, or **1,880 km** with gasoline. CarNewsChina gives WLTP equivalents of about 107–189 km electric.
   - Sources: press release; CarExpert; CarNewsChina. Confidence: **HIGH**.
8. **Fuel use.** Methanol **6.7 L/100 km** in charge-depleted mode, about 20 yuan per 100 km (CarNewsChina uses methanol at 2.9 yuan/L). Gasoline "in the 3-litre-per-100-km range" (Gasgoo). Tank **70 L** (CarNewsChina). Refuelling about 3 minutes.
   - Sources: Gasgoo; CarNewsChina. Confidence: **MED** (Geely figures via media; 70 L in one source only).
9. **Body.** 4,806 × 1,886 × 1,490 mm, wheelbase 2,756 mm, 609 L trunk, GEA architecture.
   - Sources: CnEVPost; Gasgoo. Confidence: **HIGH**.
10. **Corrosion fix.** Geely names three barriers: cold weather, material corrosion, and missing standards. Its answer is methanol-resistant materials plus dedicated fuel additives and lubricants. Geely says it led or joined more than 20 national/industry methanol standards.
    - Source: Gasgoo 4 Nov. Confidence: **MED** (Geely statements).
11. **Fleet before retail.** Eric Li (Geely Holding chairman) said in October that more than **6,000** Xingyao 6 EF were already in ride-hailing, taxi and official fleets. Geely Holding's Victor Yang said China has more than **1,400 methanol refuelling stations** of various types.
    - Source: CnEVPost. Confidence: **MED** (company statements).
12. **Geely's methanol history.** R&D since **2005**; more than 10 billion yuan invested; more than 400 patents (Gasgoo). More than 20 models, more than 60,000 vehicles, more than 25 billion km driven (Gasgoo analysis). SC7 methanol taxis in Jinzhong, Shanxi under a government pilot in **2013** (CarExpert). Methanol Emgrand HEV 2022 (1.8 L, claimed 41.5% thermal efficiency; separate petrol tank for start-up) (CarExpert). Gasgoo 2022 lists methanol use of 9.2 L/100 km and a price of RMB 129,800.
    - Confidence: **MED** (company figures relayed by media; history points cross-checked between CarExpert and Gasgoo 2022).

### B. Methanol as a fuel (peer-reviewed review: Verhelst, Turner, Sileghem, Vancoillie, *Progress in Energy and Combustion Science* 70 (2019) 43–88, DOI 10.1016/j.pecs.2018.10.001; accepted manuscript https://biblio.ugent.be/publication/8589931/file/8609217.pdf)

13. **Octane.** RON **109**, MON **92**. High knock resistance allows a higher compression ratio or engine downsizing, so efficiency improves. Confidence: **HIGH**. Note: Wikipedia says "114". Use 109 (peer-reviewed).
14. **Energy per litre is about half.** Lower heating value **20.09 MJ/kg** vs gasoline 42.9; volumetric **15.9 MJ/L vs 31.7 MJ/L**. The paper says the volumetric energy content "is half that of gasoline", so injection must last about twice as long and the tank must be bigger for the same range. Confidence: **HIGH**. This matches the car's numbers: 1,250 km on methanol vs 1,880 km on gasoline.
15. **Air/fuel ratio.** Stoichiometric AFR **6.5:1** vs 14.7:1 for gasoline. Methanol is about **50% oxygen** by mass. Confidence: **HIGH**.
16. **Charge cooling.** Heat of vaporisation about **1,100 kJ/kg** vs about 180–350 for gasoline. With the low AFR, it takes "a sevenfold increase of the energy needed to evaporate the fuel" per mixture. This cools the charge and lowers flame temperature, which means less knock, lower wall heat loss and lower NOx. Confidence: **HIGH**.
17. **Why cold starts are hard.** More fuel mass must evaporate. Higher latent heat. A higher lower-flammability limit. A single boiling point, with no light fractions like gasoline. Conductive liquid fuel can short the spark plug. Fixes: heated injectors/fuel rail, higher injection pressure, valve timing, adding gasoline/butane, electric block heaters. Confidence: **HIGH**. Geely's 350-bar DI plus high-energy spark fits the "higher injection pressure / stronger ignition" route.
18. **Materials.** Methanol is the most aggressive common alcohol. It attacks **aluminium, magnesium and copper**; steel is only slightly affected. Water and chloride impurities make it worse. Elastomers can swell, shrink, harden or soften. Fixes: fluorocarbon or nitrile seals, stainless steel, zinc/nickel coatings, additives and suitable oils. Confidence: **HIGH**.
19. **Toxicity and fire.** Methanol is toxic, but the review says its toxicity is comparable to gasoline. In the California trial, toxicity "was not found to be an issue at all". Methanol flames are "practically invisible in sunlight"; adding about 15% gasoline helps. Wikipedia adds that a methanol fire releases heat at about 20% of the rate of a gasoline fire. Confidence: **HIGH** (review); **MED** (Wikipedia 20%).
20. **CO2 per MJ at the tailpipe is about 7% lower than gasoline** (higher H/C ratio), before any efficiency gain. Confidence: **HIGH**.

### C. "First" myth-busters

21. **California, 1980s–1990s:** about **15,000 M85 flex-fuel vehicles** (light-duty, buses, trucks) were sold and run. The review calls it technically "completely successful". Source: Verhelst et al. Confidence: **HIGH**.
22. **Racing:** methanol blends were used in 1930s European Grand Prix racing. Pure methanol was widespread in USAC Indy cars from **1965**. All Indianapolis 500 cars had to run on methanol until the end of the **2006** season. In 2006 the fuel was 90% methanol / 10% ethanol. Source: Wikipedia "Methanol fuel". Confidence: **MED** (tertiary; widely known).
23. **China's coal-methanol push.** Coal-mining permits pushed mega methanol plants. Coal-rich provinces promoted methanol fuel, standards followed, and M100 vehicles exist. China made about 60% of world methanol in 2014, mainly from coal (Wikipedia). Gasgoo 2026: China capacity above 100 million tonnes, over 60% of global output. Sources: Verhelst; Wikipedia; Gasgoo 6 Nov. Confidence: **HIGH / MED**.

### D. How methanol is made, and the CO2 caveat

24. **Grey methanol.** Most methanol is made from natural gas (steam reforming) or coal. Well-to-tank emissions for coal methanol are **124.7 g CO2-e/MJ vs 28.6 for natural-gas methanol**, over four times worse. Source: Verhelst et al. Confidence: **HIGH**.
25. **Green route.** CO2 + 3 H2 → CH3OH + H2O over a catalyst, with heat and pressure. "Green" only if the hydrogen comes from renewable electricity. Source: Wikipedia; Verhelst. Confidence: **HIGH**.
26. **Iceland: George Olah plant (CRI).** Built 2010–2012 at Svartsengi. It takes CO2 from a geothermal power plant's flue gas and uses hydrogen from water electrolysis. SGS audit (ISCC protocol): 80–90% CO2 reduction vs comparable fossil fuel. CRI calls it the world's first industrial-scale fuel-from-CO2 plant. Source: https://www.carbonrecycling.com/projects/george-olah. Confidence: **HIGH** (company page; the audit is cited by the company).
27. **China: Shunli plant, Anyang, Henan (CRI).** Commissioned **October 2022**. **110,000 t/yr** methanol from **160,000 t/yr CO2**. Investment USD 90 million. **Caveat:** CO2 and hydrogen come from **coke-oven gas** (a by-product of steelmaking coke), not from green electrolysis. CRI itself says "low-carbon intensity", not "green". Source: https://www.carbonrecycling.com/projects/shunli. Confidence: **HIGH**.
28. **Global scale.** IRENA/Methanol Institute (2021): methanol is "largely produced from fossil fuels"; renewable methanol costs are high and volumes low; chemicals and plastics use about two-thirds of all methanol. Source: https://www.irena.org/publications/2021/Jan/Innovation-Outlook-Renewable-Methanol. Confidence: **HIGH**.

### E. Indonesia angle (sourced)

29. **Biodiesel needs methanol.** Pupuk Indonesia CEO Rahmad Pribadi told DPR Komisi XI (Antara, 3 Apr 2026): national methanol demand about **1.8 million t (2025)**, domestic capacity about **400,000 t**, imports **1.4 million t**. B50 would raise demand to about **2.9 million t** and imports to about **2.5 million t** without new plants. Pupuk Indonesia and Danantara propose **two 1-million-t plants**. Media name Aceh (Lhokseumawe) and East Kalimantan as sites (RRI, 1 Nov 2026; CNN Indonesia/Tempo headlines, 7 Apr 2026, not read).
    - Source: https://www.antaranews.com/berita/5508969/pupuk-indonesia-dorong-pembangunan-pabrik-metanol-untuk-mandatori-b50. Confidence: **HIGH** for the quote; site names **MED** (headlines only).
    - Why it matters: methanol goes into biodiesel by transesterification. That is chemistry, not engine fuel, and the script must say so.

---

## 3. Mechanism in 8 animation steps (Bahasa Indonesia)

1. **Satu tangki, dua cairan.** Metanol (CH3OH) dan bensin dituang ke tangki 70 liter yang sama, campuran berapa pun.
2. **Sensor "mencicipi" bahan bakar.** Arus listrik kecil lewat bahan bakar. Metanol menghantar listrik, jadi ECU tahu kadar alkohol dalam hitungan milidetik.
3. **Injektor 350 bar.** Metanol butuh dua kali lebih banyak cairan untuk energi yang sama, jadi injeksi lebih lama dan lebih kuat, langsung ke ruang bakar.
4. **Menguap = mendinginkan.** Metanol menyerap panas sekitar 7 kali lebih banyak saat menguap. Udara di silinder jadi dingin dan padat.
5. **Oktan 109, kompresi tinggi.** Campuran tidak mudah "ngelitik", jadi piston bisa memampatkan lebih kuat. Efisiensinya diklaim 48,15%.
6. **Busi berenergi tinggi untuk pagi beku.** Sampai mendekati −40 °C tanpa pemanasan bensin dulu (klaim Geely).
7. **Baja tahan karat dan seal khusus.** Aluminium, tembaga, dan karet biasa diganti material tahan alkohol, plus aditif dan oli khusus.
8. **Listrik dulu, metanol kemudian.** Baterai LFP untuk 130–230 km harian. Mesin metanol menyala untuk perjalanan jauh. Total sekitar 1.250 km dengan metanol (CLTC).

---

## 4. Myths, traps and caveats

- **"Mobil metanol pertama di dunia."** False. California had 15,000 M85 cars, Indy 500 cars ran on methanol to 2006, and Geely itself had methanol taxis from 2013 and a methanol hybrid in 2022. Say "sedan hybrid plug-in metanol pertama untuk pasar keluarga, menurut Geely".
- **"Ramah lingkungan / nol emisi."** Only if the methanol is green. Most of China's methanol comes from coal, which is about 4x worse well-to-tank than gas-methanol. The Anyang plant is "low-carbon", not green (fossil coke-oven gas). Geely's "carbon net zero closed cycle" is marketing; no independent LCA was read.
- **48.15% efficiency** is Geely's own figure. It is not independently verified. Say "diklaim".
- **1,880 km** is with gasoline and CLTC, an optimistic cycle. With methanol it is about 1,250 km.
- **"Lebih irit."** Per litre, methanol gives about half the energy, so it uses more litres (6.7 L/100 km methanol vs about 3 L gasoline). It is cheaper per km only because methanol is cheap in China (CarNewsChina: 2.9 yuan/L). No Indonesian price, so do not convert to rupiah.
- **Octane 114 vs 109.** Use 109 (peer-reviewed RON).
- **Invisible flame.** True in daylight. Do not dramatise it as "more dangerous than gasoline"; heat release is lower. Present it with nuance.
- **Toxicity.** Do not show drinking or skin contact. Methanol is poisonous; the review rates it comparable to gasoline.
- **Indonesia.** Methanol in Indonesia goes into biodiesel production. No methanol cars are sold there; Geely has announced no global or Indonesian launch (OWRITE).
- **Name confusion.** Xingyao 6 = Starshine 6 = Emgrand L EM-i (export, petrol PHEV). The EF methanol version is China-only so far.

---

## 5. Hook angles (90-second Indonesian video)

1. **"Mobil ini bisa minum alkohol... dan bensin, di tangki yang sama."** Pour-two-liquids visual. Strongest.
2. **"Katanya mobil metanol pertama di dunia. Faktanya, mobil Indy 500 sudah minum metanol sejak 1965."** Myth-bust hook.
3. **"Energinya cuma setengah bensin, tapi mesinnya justru lebih efisien. Kok bisa?"** Paradox: octane plus charge cooling.
4. **"Mobil yang nyala di −40 °C, saat mobil listrik kehabisan napas."** Geely's own cold-climate pitch. Label it a claim.
5. **"Indonesia impor 1,4 juta ton metanol setahun, bukan buat mobil, tapi buat biodiesel."** Local relevance closer.
6. **"Bahan bakar dari asap pabrik?"** Anyang CO2-to-methanol plant, 160,000 t CO2/yr, with the honest "but the hydrogen is still fossil" twist.

---

## 6. Visual / 3D beat ideas

- **Opening:** two transparent jerrycans (blue-tinted "CH3OH", amber "bensin") pour into one cutaway tank; liquids swirl together; HUD shows "M0 → M100".
- **Molecule beat:** CH3OH ball-and-stick (1 C, 4 H, 1 O) next to a long octane chain; the O atom glows: "50% oksigen = energi setengah".
- **Energy bars:** two litre-cubes, gasoline 31.7 MJ vs methanol 15.9 MJ; the methanol cube doubles to match.
- **Sensor beat:** fuel flows through a ring sensor; tiny current arcs; gauge reads the % alcohol; "20 ms".
- **Cylinder cutaway:** 350-bar spray cone; frost/blue colour wave as droplets evaporate (cooling); piston compresses further; spark; brand label AUDIRA on the engine cover/HUD.
- **Cold start:** snowy Shenyang street at night; thermometer −40 °C; strong blue spark arc.
- **Materials beat:** aluminium part with corrosion pitting vs stainless/fluoro seal shining; "tahan alkohol".
- **Flame safety:** split screen, gasoline orange flame vs near-invisible methanol shimmer (heat haze only).
- **Production map:** coal mine (grey) → plant; natural gas (grey); Iceland geothermal + electrolyser (green); Anyang coke ovens (labelled "rendah karbon, bukan hijau").
- **Timeline payoff:** 1965 Indy → 1980s California M85 → 2013 Jinzhong taxi → 2022 Emgrand → 2026 Xingyao 6 EF; stamp "pertama?" with a question mark.
- **Indonesia close:** palm-oil drum + methanol tanker → biodiesel B40/B50; numbers 1.4 → 2.5 million t imports.

---

## 7. Open questions / unverified

- Geely's official Chinese-language spec sheet was not read; specs come via CnEVPost, CarNewsChina, Gasgoo and CarExpert.
- Compression ratio of the BHE15 methanol engine: not found. Do not state a number.
- Whether the 48.15% figure is brake thermal efficiency at peak or something else: not stated.
- Guiyang methanol taxis (Geely Emgrand, Jan 2024 per a Zigwheels headline) and the 2021 SCMP "Geely pushes on despite risks" piece: headlines only; Google returned 429 before decoding.
- Independent life-cycle CO2 of the Xingyao 6 EF on China's real methanol mix: no source.
- Methanol price in Indonesia, and whether Indonesia has any methanol-vehicle plan: not found.
- Indonesian plant locations (Aceh, East Kalimantan, Bojonegoro): one Antara regional page (dated 9 Nov 2026) mentions a USD 1.2 billion, 800,000 t Bojonegoro plant "to be built in 2025". It looks like a recycled older story, so it is excluded.
- The Methanol Institute site was not read; the IEA was not read (the IRENA/Methanol Institute joint report was used instead).
- Global methanol production tonnage: no current figure read. Do not state one.
