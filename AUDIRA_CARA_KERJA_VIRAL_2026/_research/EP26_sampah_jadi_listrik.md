# EP26 — How waste becomes electricity (PLTSa/PSEL): Palembang's 1,100-ton-a-day plant — research notes

Research date: 2026-11-10. This file holds research only, not a script.
Method: Bing News RSS (Indonesian and English queries) with the real article URL taken from Bing's `url=` parameter, plus Google News RSS for headlines. Google's link decoder (batchexecute) returned HTTP 429, so Google-only items could not be opened. Article HTML was read with Python urllib (browser User-Agent, normal TLS) and tags were stripped. The **palembang.go.id** hook article was read from the city site's own JSON (Next.js `__NEXT_DATA__` on the home page), because the article pages render in JavaScript. Other primary or near-primary sources read directly: **Pemkot Palembang statements** relayed by Sriwijaya Post/Tribun (technology and emission chain), **Kemenko Pangan** press text via detik/CNBC (tipping fee, Perpres transition), **PLN** statements via Antara (Perpres 109/2025 tariff, 30-year PPA; Benowo output), **KSP** via Antara (Perpres 109 summary), **Menteri LH** via Antara (incineration priority) and Kompas (Putri Cempo audit), and **EU Directive 2010/75/EU (IED)** on EUR-Lex for the 850 °C / 2 s rule and the dioxin limit. IEA (case study "Palembang waste-to-energy plant"), Tempo and Nasdaq returned HTTP 403.

Confidence tags: **HIGH** = primary source or 3+ independent outlets agree; **MED** = one good secondary source, or standard engineering reference not re-read this session; **LOW** = single weak source or my own arithmetic/inference.

Naming: the project is officially **PSEL** (Pengolahan Sampah menjadi Energi Listrik), older name **PLTSa Keramasan**. Same plant.

---

## 1. Viral hook: is it recent?

Yes. The hook headline is the city government's own post about a ministerial visit on **Wed 4 Nov 2026**.

| Headline | Outlet | Published | URL |
|---|---|---|---|
| "Sampah Jadi Listrik, Warga Palembang Bakal Nikmati Listrik dari 1.100 Ton Sampah Sehari" (primary; hook) | Pemkot Palembang (palembang.go.id) | dated 4 Nov 2026, posted 5 Nov 01:49 UTC | https://palembang.go.id/berita/berita-758 |
| "Ubah 1.100 Ton Sampah Jadi Listrik, PSEL Palembang Ditargetkan Beroperasi Desember" | Kompas.com | 4 Nov 2026 | https://regional.kompas.com/read/2026/11/04/201207378/ubah-1100-ton-sampah-jadi-listrik-psel-palembang-ditargetkan-beroperasi |
| "Produksi Listrik PSEL Keramasan Palembang Lampaui Target, Presiden Dijadwalkan Resmikan 8 Desember" | Tribun Sumsel | 4 Nov 2026 | https://sumsel.tribunnews.com/palembang/1034506/produksi-listrik-psel-keramasan-palembang-lampaui-target-presiden-dijadwalkan-resmikan-8-desember |
| "Palembang waste to energy project enters commissioning phase" | Antara English | 4 Nov 2026 | https://en.antaranews.com/news/440239/palembang-waste-to-energy-project-enters-commissioning-phase |
| "Progres Capai 96%, PSEL Palembang Siap Sulap 1.000 Ton Sampah Jadi Listrik" (Kemenko Pangan release: tipping fee, Perpres transition) | detikFinance | 5 Nov 2026 | https://finance.detik.com/berita-ekonomi-bisnis/d-8739622/progres-capai-96-psel-palembang-siap-sulap-1-000-ton-sampah-jadi-listrik |
| "Sah! Warga Palembang Dapat Suplai Listrik dari Sampah Hingga 20 MW" | CNBC Indonesia | 6 Nov 2026 | https://www.cnbcindonesia.com/news/20261106101546-4-782882/sah-warga-palembang-dapat-suplai-listrik-dari-sampah-hingga-20-mw |
| "Sulap 1.100 Ton Sampah Jadi Listrik 20 MW, Proyek PSEL Palembang Siap Diresmikan Presiden" | Tribun Palembang | 6 Nov 2026 | https://palembang.tribunnews.com/palembang-berdaya-sejahtera/1334214/sulap-1100-ton-sampah-jadi-listrik-20-mw-proyek-psel-palembang-siap-diresmikan-presiden |
| "Ubah Sampah Jadi Listrik, PSEL Palembang Masuki Tahap Uji Coba" | RRI Palembang | 6 Nov 2026 | https://rri.co.id/palembang/regional/2874474/ubah-sampah-jadi-listrik-psel-palembang-masuki-tahap-uji-coba |
| "Ketika Sampah Palembang Mulai Disulap Menjadi Listrik, PSEL Keramasan Uji Pembakaran Perdana" (technology + emission chain, Pemkot statement) | Sriwijaya Post / Tribun Palembang | 25 Sep 2026 | https://palembang.tribunnews.com/metro/1329807/ketika-sampah-palembang-mulai-disulap-menjadi-listrik-psel-keramasan-uji-pembakaran-perdana |
| "Fasilitas PSEL Palembang mulai beroperasi, olah 960 ton sampah/hari" (first waste delivery; 5–7 day bunker fermentation) | Antara | 1 Sep 2026 | https://www.antaranews.com/berita/5720476/fasilitas-psel-palembang-mulai-beroperasi-olah-960-ton-sampah-hari |
| "Progres PLTSa Keramasan Palembang Capai 89,16 Persen, Puluhan Tenaga Kerja Lokal Dilatih di China" | Sriwijaya Post / Tribun | 2 Jul 2026 | https://palembang.tribunnews.com/metro/1321836/progres-pltsa-keramasan-palembang-capai-8916-persen-puluhan-tenaga-kerja-lokal-dilatih-di-china |
| "PLTSa Keramasan Jadi Solusi Sampah Palembang, Siap Olah 1.000 Ton Sampah per Hari" (PT Indo Green Power, AI combustion control) | Sriwijaya Post / Tribun | 20 Apr 2026 | https://palembang.tribunnews.com/metro/1315785/pltsa-keramasan-jadi-solusi-sampah-palembang-siap-olah-1000-ton-sampah-per-hari |

The city site's post is a re-write of the same ministerial visit that Kompas, Tribun and Antara covered. The story is fresh (6 days old) and has a fixed next date: **inauguration by the President planned for 8 Dec 2026**.

---

## 2. Verified facts

### A. The Palembang plant

1. **Name and site:** PSEL Palembang, also "PLTSa Keramasan", in **Keramasan, Kecamatan Kertapati**, Palembang (Kompas, Tribun, detik, Merdeka). Land area **8 ha** (detik/CNBC, Kemenko Pangan text). HIGH.
2. **Developer/operator:** **PT Indo Green Power**, in cooperation with Pemkot Palembang (Antara 2023; Merdeka Nov 2025; Sripoku Apr 2026). HIGH.
   - Chinese parent: a Petromindo headline (26 Mar 2025, not opened) reads "Zheneng Jinjiang's Palembang WTE plant set to begin ops in 2026", and the IEA lists a case study called "Palembang waste-to-energy plant" in its China overseas-investment report (HTTP 403). 64 local staff trained "3 batch ke China" (DLH head, Sripoku Jul 2026). So: **Chinese-backed (likely Zheneng Jinjiang Environment), MED**. Do not name the parent on screen without a second source.
3. **Scheme:** **Build-Own-Operate (BOO)** (detik/CNBC, Kemenko Pangan). HIGH. Listed as a **Proyek Strategis Nasional** (Antara 1 Sep 2026). HIGH.
4. **Investment:** "hampir **Rp3 triliun**", "sekitar **US$160 juta**" (Kemenko Pangan via detik/CNBC; Kompas; palembang.go.id). HIGH.
5. **Technology:** **"stoker moving grate"** incineration, waste from a **bunker**; emission control = **semi-dry deacidification, activated-carbon injection, bag filter and CEMS** (continuous emission monitoring) (Pemkot statement via Sriwijaya Post, 25 Sep 2026). HIGH for the city's claim, single outlet. **SNCR (NOx control) and a wet scrubber are not mentioned** in any Palembang source I found.
   - Operator says "AI" assists incinerator combustion control to "reduce human error" (PT Indo Green Power staff, Sripoku Apr 2026). MED.
   - Waste is **"difermentasi selama sekitar lima hingga tujuh hari"** before burning (Mayor Ratu Dewa, Antara 1 Sep 2026). HIGH that he said it. This matches standard bunker practice in hot, wet-waste countries: leachate drains, waste gets drier and more uniform (MED, general practice).
   - It is **not** RDF and **not** gasification. Do not mix with Benowo or Putri Cempo.
6. **Capacity (waste):** design **1,000 t/day** (detik, CNBC, Merdeka, Sripoku). The hook's **"1.100 ton"** is the amount the city **collects and hauls per day** (Mayor, palembang.go.id). First day of delivery, 1 Sep 2026: **960 t** (Antara). HIGH.
7. **City waste generation:** "sekitar **1.260,956 ton per hari**" (Kemenko Pangan via detik/CNBC). Other figures in circulation: 1,200–1,300 (Sripoku Apr 2026), 1,500 (Mayor, Merdeka Nov 2025). The plant therefore handles roughly **80 %** of what the city generates (CNBC). HIGH for 1,000 vs ~1,260.
8. **Capacity (power):** **20 MW** installed; **17.7 MW** sold to PLN (DLH head: "Dari total kapasitas, sebesar 17,7 MW akan dijual ke PLN", Sripoku Jul 2026). During commissioning: **18.6 MW** to the PLN grid, "up to 20 MW at peak" (Zulkifli Hasan, 4 Nov). HIGH. (2023 plan: 20 MW installed, 16 MW sold, rest internal use; Antara 2023.)
9. **Households served:** "14.000–15.000 rumah tangga" (Pemkot, Kompas, Antara) vs "12.000–14.000" (Kemenko Pangan release via detik/CNBC). 2023 plan: 16,000. HIGH that both ranges were said. See trap in section 4.
10. **Jobs:** "500–1.000" (Pemkot) vs "600–1.000 including upstream" (Kemenko Pangan). Plant staff when running: **100**, of whom 65 from South Sumatra (DLH, Sripoku). HIGH.
11. **Grid link:** a **SUTT (high-voltage line) "special facilities"** from the plant to PLN was energised by PLN UIP Sumbagsel in Oct 2026 (KoranSN headline, 15 Oct 2026; Merdeka Nov 2025 calls SUTT land acquisition "vital"). MED (headline + background).

### B. Timeline

| Date | Event | Source |
|---|---|---|
| 2018 | Palembang is one of the 12 cities in **Perpres 35/2018** (PLTSa acceleration) | general, MED (Perpres 109 "previously only 12 cities": KSP via Antara) |
| Jun 2023 | DLHK: PPA talks with PLN, AMDAL being finalised; target COD Dec 2024 (slipped) | Antara 19 Jun 2023, HIGH |
| 21 Nov 2025 | Construction 66.6 % | Merdeka/Antara, HIGH |
| Mar 2026 | 81.94 % | Merdeka 21 Apr 2026, HIGH |
| 20–21 Apr 2026 | Danantara team inspects site; target COD Oct 2026 ("paling lambat 18 Oktober 2026" per PPA) | Merdeka; Sripoku, HIGH |
| 30 Jun 2026 | 89.16 % | DLH via Sripoku, HIGH |
| 16 Jul 2026 | VP Gibran visits | Tribun, Antara, HIGH |
| **1 Sep 2026** | First waste trucks diverted from **TPA Sukawinatan** to the plant (960 t/day) | Antara; Sripoku, HIGH |
| **23 Sep 2026, 23:00 WIB** | **First fire-up** (commissioning) | Sriwijaya Post, HIGH |
| Oct 2026 | 96 % (Kemenko Pangan) | detik/CNBC, HIGH |
| **4 Nov 2026** | Menko Pangan Zulkifli Hasan + Gov. Herman Deru + Mayor Ratu Dewa visit; 18.6 MW on PLN grid; 98.5 % (Mayor) | all outlets, HIGH |
| **8 Dec 2026** | Planned COD + inauguration by President Prabowo | Mayor; Kemenko Pangan, HIGH that it is planned |

### C. Money and law

- **Tipping fee (BLPS): Rp400.000 per ton** needed. For 2027 the city budgeted **Rp90 miliar**, described as a regional contribution of **Rp90.000/ton**; the remaining **Rp310.000/ton** is hoped to come from central government BLPS via **DAK Non-Fisik** (Kemenko Pangan release via detik and CNBC, 5–6 Nov 2026). HIGH that this was stated. Note the arithmetic problem in section 4.
- **Legal basis:** Palembang was contracted under **Perpres 35/2018** and is in **transition to Perpres 109/2025**. The switch happens "secara paralel setelah COD", because share transfer is not allowed before operation; a **Bridging Agreement**, a **Danantara due-diligence**, land-title and transfer of grid assets to PLN are still being prepared (Kemenko Pangan via detik/CNBC). HIGH.
- **Perpres 109/2025** ("Penanganan Sampah Perkotaan melalui Pengolahan Sampah Menjadi Energi Terbarukan Berbasis Teknologi Ramah Lingkungan"), issued **10 Oct 2025** (JawaPos). Key points (detik citing articles 5 and 19; KSP and PLN via Antara): HIGH.
  - PLN must buy all PSEL power; price **US$0.20/kWh** (~Rp3,600) for all capacities, **no negotiation, no escalation**, PPA **30 years** from COD.
  - Developers (BUPP PSEL) are chosen by **BPI Danantara**. Regional governments supply the waste and the **land free of charge**.
  - Environmental permit cut from 12–24 months to **2 months**; eligibility widened from 12 cities to any area generating **> 1,000 t/day**; target **30 locations / 61 regencies-cities, ~33,000 t/day** (KSP, Apr 2026). KLH later cites **31 agglomerations, 86 regencies-cities, ~40,000 t/day** (Antara 21 Apr 2026). Numbers differ by source and date.
  - Output may also be biogas or **RDF**, not only electricity.
- **Danantara programme:** first batch under construction in **Denpasar Raya (groundbreaking 8 Jul 2026), Kota Bekasi, Bogor Raya 1 (17 Sep 2026; 1,500 t/day; Rp2.8 T; COD target mid/late 2027–2028)**; Bogor operator Zhejiang Weiming, **grate-fired** (Global Times, Antara EN, detik). Minister Rosan: groundbreakings in 12 more cities by end-2026; "European emission standards" (Antara EN, 6 Oct 2026). HIGH. Palembang is **not** a Danantara-built project; it predates Perpres 109 and is being folded in.
- KLH policy: incineration is the **priority technology** for big cities; Minister Hanif says modern incineration emissions control now beats gasification, "contohnya di Surabaya" (Antara 21 Apr 2026). HIGH.

### D. Other Indonesian plants (context)

| Plant | Status | Key numbers | Source / confidence |
|---|---|---|---|
| **PLTSa Benowo, Surabaya** | Operating. Landfill-gas units since **30 Nov 2015** (1.65 MW); thermal unit since **10 Mar 2021**, **9 MW**, ~**1,000 t/day**. PLN calls the thermal unit "gasification"; Surabaya calls it "pembakaran terkendali bersuhu tinggi" | PLN: thermal unit supplies **~30 GWh/yr**; Benowo total 166.1 GWh in 9 years. Surabaya generates ~1,800 t/day and plans a second 1,000 t/day, 20 MW PSEL | PLN via Antara Apr 2025 (HIGH); Surya Feb 2026 (HIGH) |
| **PSEL/PLTSa Putri Cempo, Solo** | Built by **PT Solo Citra Metro Plasma Power**; got SLO in 2023; **gasification** with gas engines ("20 mesin", "8 MW") | Under **KLH financial audit since 28 Mar 2026** because it "masih menimbulkan banyak problem"; feeds < 1,000 t/day; worker killed in sorting machine (Mar 2026); landfill fire Sep 2026 | Antara 2023; Kompas Mar 2026; Beritasatu (HIGH) |
| **ITF Sunter, Jakarta** | **Not built.** Stalled since 2023; Governor Pramono re-offered it to investors on 28 Aug 2026 | 2,200 t/day, up to **35 MW**, **Rp5.3 T**; Jakarta target zero dumping 2028 | Kompas Aug 2026 (HIGH) |

Palembang is therefore the **first large moving-grate PSEL to reach the grid** in Indonesia (my synthesis, MED). Benowo is the only other big thermal plant actually running.

### E. Mechanism numbers (general engineering)

- **850 °C for at least 2 s:** EU IED Art. 50(2): flue gas must be raised "to a temperature of at least 850 °C for at least two seconds" after the last combustion-air injection; **1,100 °C** if hazardous waste has > 1 % halogenated organics (chlorine). Read on EUR-Lex. HIGH.
- **Dioxin limit:** IED Annex VI: **0.1 ng TEQ/Nm³**; CO 50 mg/Nm³ daily average. HIGH. (Indonesia's own thermal-waste emission standard, Permen LHK P.70/2016, uses the same 0.1 ng TEQ/Nm³ for dioxins/furans: MED, not re-read.)
- **Bottom ash rule:** IED Art. 50(1): slag and bottom ash total organic carbon < 3 % or loss on ignition < 5 % (i.e., burned out). HIGH.
- **Grate temperatures:** typical furnace 850–1,100 °C (MED, standard reference). The grate moves waste down a sloped step-grate over roughly an hour: drying → burning → burnout (MED).
- **Energy per ton:** modern European plants on dry, high-LHV waste often export about **500–700 kWh per ton** (MED, general). Palembang design: 17.7 MW × 24 h = **~425 MWh/day for 1,000 t ≈ 425 kWh/t exported** (20 MW gross ≈ 480 kWh/t). LOW (my arithmetic on official figures). Benowo actual: 30 GWh/yr ÷ (1,000 t × 365) ≈ **82 kWh/t**, capacity factor ≈ 38 % of 9 MW. LOW (my arithmetic on PLN figures).
- **Why Indonesian waste is weak fuel:** **40.62 %** of 25.15 million t of national waste in 2025 was **food waste** (SIPSN via Antara Foto, Mar 2026). HIGH. Semarang: ~65 % organic "dengan kadar air yang tinggi" lowers calorific value (DPRD Semarang via Kompas). MED. World Bank's incineration guide (1999) recommends average lower heating value **≥ 7 MJ/kg and never < 6 MJ/kg** (MED, not re-read). Raw Indonesian mixed waste is often quoted around 4–7 MJ/kg (LOW, no primary source found this session). Hence the 5–7 day bunker drying.
- **Residues:** grate incineration typically leaves **bottom ash ≈ 20–25 % of input mass** and cuts volume by about **90 %**; **fly ash/APC residue ≈ 2–5 %**, treated as hazardous (MED, general). A thermal-technology column in detik (2023) gives "90 persen" destroyed, "residu 10 persen" (volume). MED.
- PLN wants waste as the **only** fuel: "tidak boleh disubstitusi dengan bahan bakar yang lain" (PLN director Suroso Isnandar, Antara Jul 2026). HIGH.

---

## 3. Mechanism in 7 animation steps (Bahasa Indonesia)

1. **Timbang dan tumpah.** Truk sampah dari seluruh Palembang naik ke **jembatan timbang**, lalu menumpahkan muatannya ke **bunker** raksasa, kolam beton tertutup. Udara di dalam bunker disedot terus supaya bau tidak keluar, dan udara itulah yang nanti dipakai untuk membakar.
2. **Diperam 5–7 hari.** Sampah Indonesia basah: hampir separuhnya sisa makanan. Di bunker, sampah "difermentasi" lima sampai tujuh hari. Air lindinya menetes keluar, sampah jadi lebih kering. Makin kering, makin banyak panas yang bisa diambil.
3. **Capit raksasa mengaduk.** Crane dengan capit (grab) mengangkat, membalik, dan mencampur sampah, seperti mengaduk adonan, supaya basah dan kering, plastik dan daun, tercampur rata. Bahan bakar yang rata = api yang stabil.
4. **Tangga api bergerak (moving grate).** Sampah dijatuhkan ke **hopper**, lalu meluncur di atas **jeruji miring yang terus bergeser** maju-mundur. Di bagian atas sampah dikeringkan, di tengah terbakar hebat, di ujung bawah tinggal abu. Udara ditiup dari bawah jeruji. Suhu ruang bakar sekitar 850–1.100 °C.
5. **Aturan 850 °C, 2 detik.** Gas panas yang naik wajib tetap di atas **850 °C selama minimal 2 detik**. Inilah kunci memecah senyawa beracun seperti dioksin sebelum sempat terbentuk. Sensor dan (menurut operator) AI mengatur udara dan laju jeruji agar suhu tidak turun.
6. **Panas jadi listrik.** Dinding tungku dan boiler penuh pipa air. Panas mengubah air jadi **uap bertekanan tinggi**, uap memutar **turbin**, turbin memutar **generator**. Di Palembang: hingga 20 MW, 17,7 MW dijual ke PLN lewat saluran tegangan tinggi. Uap bekas didinginkan, jadi air lagi, dan dipakai ulang.
7. **Asap dicuci, abu dipisah.** Sebelum keluar cerobong, gas dicuci berlapis: **penetral asam semi-kering** (kapur), **semprotan karbon aktif** untuk menjerat dioksin dan merkuri, lalu **bag filter** ribuan kantong kain yang menyaring debu halus. Sensor CEMS memantau emisi terus-menerus. Di bawah tungku tersisa **abu dasar** (bottom ash, sekitar seperlima berat awal); debu dari filter (**fly ash**) lebih berbahaya dan harus ditangani sebagai limbah B3. Volume sampah tinggal sekitar sepersepuluh.

---

## 4. Myths, traps and caveats

- **"1.100 ton sampah diolah jadi listrik."** The plant is **designed for 1,000 t/day**. 1,100 t is what the city **hauls** daily. Say "dirancang mengolah sekitar 1.000 ton per hari". If using 1,100, say "sampah yang diangkut tiap hari".
- **"Sudah beroperasi."** It is in **commissioning (uji coba)**; COD and inauguration are planned for **8 Dec 2026**. Antara's 1 Sep headline "mulai beroperasi" meant first waste delivery. Say "sudah menyetrum jaringan PLN dalam tahap uji coba".
- **"Pertama di Indonesia."** Wrong. **Benowo Surabaya** has fed PLN since 2015 (landfill gas) and 2021 (thermal, 9 MW). Putri Cempo Solo got SLO in 2023. Palembang is best described as the **first big moving-grate PSEL** to reach the grid (MED), or "salah satu kota pertama" (Pemkot's own phrasing).
- **"20 MW" vs "17,7 MW" vs "18,6 MW".** 20 MW = installed/peak; 17.7 MW = contracted sale to PLN; 18.6 MW = measured during commissioning. Pick one and label it.
- **"Untuk 15.000 rumah."** Two official ranges exist (14–15k Pemkot; 12–14k Kemenko). 18.6 MW for a full year ≈ 163 GWh, which divided by 15,000 homes is ~10,900 kWh per home per year, several times a normal Indonesian home. The household figure probably divides MW by a connection size (≈1,300 VA), not by annual use. LOW (my inference). Safer line: "setara kebutuhan belasan ribu rumah".
- **"Sampah dibakar = dioksin pasti."** Dioxins form mainly in poor, cool combustion and in the 200–400 °C zone as gas cools. Controls: 850 °C/2 s, fast cooling, activated carbon, bag filter. **Open burning and mini-incinerators** are the real dioxin problem (Menteri LH banned mini-incinerators; Pikiran Rakyat Jan 2026). But do not claim Palembang is "zero emission": no independent emission data is public yet.
- **"Sampah habis tanpa sisa."** About 20–25 % of the mass remains as ash; fly ash is hazardous. Landfill is still needed for residue.
- **"Tipping fee Rp90.000/ton = Rp90 miliar."** Doesn't add up: Rp90,000 × 1,000 t × 365 ≈ **Rp33 miliar**; Rp90 miliar ÷ 365,000 t ≈ Rp247,000/t. The release mixes two numbers. Full fee: Rp400,000 × 365,000 t ≈ **Rp146 miliar/year** (LOW, my arithmetic). Avoid quoting the split; say "biaya olah Rp400 ribu per ton masih dicari skema pembayarannya".
- **"Listrik dijual 20 sen dolar."** That is the **Perpres 109/2025** tariff. Palembang's existing PPA was signed under **Perpres 35/2018**, which had a lower capped tariff (about US$13.35 cents/kWh for ≤ 20 MW: MED, from memory, not re-read). Its move to the 109 scheme is still in progress after COD.
- **"Proyek Danantara."** Not built by Danantara. PT Indo Green Power built it under the old 2018 scheme; Danantara is doing **due diligence** for the transition. Bekasi, Denpasar and Bogor are the Danantara builds.
- **"PLTSa = gasifikasi."** Palembang = **moving-grate incineration**. Benowo (PLN's term) and Putri Cempo = gasification. KLH now prefers incineration.
- **"Sampah Indonesia bagus buat dibakar."** The opposite. ~41 % food waste and high moisture mean low calorific value. That is why the bunker drying step exists, and why sorting/composting organics would actually help the plant.
- **Benowo "11 MW".** PLN's figures: 9 MW thermal + 1.65 MW landfill gas ≈ 10.65 MW total. Its real export (~30 GWh/yr) is only ~38 % of nameplate for the thermal unit (LOW arithmetic). Do not imply nameplate = output.
- **Investor name.** "Zheneng Jinjiang" comes from a headline only. Say "investor/pengembang PT Indo Green Power, didukung perusahaan Tiongkok" at most.
- **"Fermentasi" = composting?** It is storage/drainage in the bunker, not making compost or biogas.
- **SNCR / scrubber.** Generic WtE diagrams show SNCR (urea/ammonia for NOx) and wet scrubbers. Palembang's stated chain is semi-dry deacidification + activated carbon + bag filter + CEMS. Do not draw SNCR or a wet scrubber as "Palembang" unless confirmed. A generic "how WtE works" diagram can show SNCR with a "umumnya" label.
- **"TPA Sukawinatan ditutup."** Not stated. Trucks were "bertahap" diverted from Sukawinatan. TPA Karya Jaya was not mentioned in any 2026 Palembang PSEL source I read.

---

## 5. Hook angles (90-second Indonesian video)

1. **Truk ke tungku (best):** "Tiap hari, 1.100 ton sampah Palembang diangkut truk. Mulai Desember, sebagian besar tidak lagi ditimbun, tapi dibakar di tungku 850 derajat… dan jadi listrik untuk belasan ribu rumah. Begini caranya." Fresh, local, concrete, and the 850 °C number is the mechanism payoff.
2. **Dua detik penentu:** "Ada satu aturan dua detik yang menentukan apakah membakar sampah itu aman atau beracun." Curiosity-gap; pays off in step 5.
3. **Sampah basah:** "Separuh sampah kita sisa makanan. Itu masalah besar kalau mau dijadikan listrik." Contrarian; explains the 5–7 day bunker.
4. **Satu truk = berapa listrik:** "Satu ton sampah Palembang bisa menyalakan sekitar 400 kWh, cukup untuk satu rumah sebulan lebih?" (Only with the LOW tag and careful wording; the household benchmark needs a source.)
5. **Sepuluh tahun mangkrak:** "Jakarta merancangnya sejak lama dan belum jadi. Palembang sudah menyetrum PLN." Comparison hook; risk of sounding political.

Brand line for VO: "Ini AUDIRA, dan ini cara sampah jadi listrik."

---

## 6. Visual / 3D beat ideas

- **Hook (0–3 s):** a 3D garbage truck tips a mountain of waste; the camera follows one plastic bottle falling into darkness, then cut to a glowing grate. HUD: "1.100 TON / HARI".
- **Map beat:** a stylised Palembang with the Musi river; trucks route-shift from "TPA Sukawinatan" to "PSEL Keramasan" (1 Sep 2026). Diorama sign with **AUDIRA** branding in-world.
- **Cutaway plant (INNERWORKS feel):** sliced building, left to right: weighbridge → bunker → crane grab → hopper → moving grate → boiler → turbine → flue-gas train → stack. The camera dollies along the flow.
- **Bunker time-lapse:** day counter 1→7, leachate dripping, the pile settling and colour drying.
- **Grate macro:** step-grate bars sliding in sequence; three colour zones (drying blue-grey, burning orange, burnout ash grey). Air arrows from below.
- **"2 detik" beat:** a gas parcel rises through the post-combustion chamber, with a ring timer 0.0 → 2.0 s and a thermometer locked above 850 °C; dioxin molecules (Cl-ring icons) break apart.
- **Steam loop:** water drop → boiler tubes glow → steam jet spins turbine blades → generator coil → spark travels a high-voltage line to a city skyline lighting up block by block (counter to "belasan ribu rumah").
- **Flue-gas cleaning:** lime spray mist, black carbon powder puff, then a wall of bag filters inflating; a CEMS screen with green readouts (labels only, no fake numbers).
- **Ash payoff:** a full truck of waste shrinks to a small ash pile (volume ≈ 1/10); a separate red-labelled "fly ash B3" drum.
- **Comparison card:** three plants side by side: Benowo (9 MW, 2021), Putri Cempo (gasification, audited), Palembang (moving grate, ~20 MW, Dec 2026); ITF Sunter as a ghost wireframe "belum dibangun".
- **Calendar outro:** "8 Desember 2026: target peresmian", then the AUDIRA outro card.

---

## 7. Open questions / unverified

- Exact parent company and equity split of PT Indo Green Power (Zheneng Jinjiang? IEA case blocked). Need Petromindo/IEA/SGX filing.
- Grate supplier, number of lines (1 × 1,000 t/d or 2 × 500?), steam conditions, turbine size.
- Whether SNCR (NOx) or a wet scrubber exists; stack height; any published emission test (dioxin) results.
- Actual design LHV of Palembang waste; actual export kWh/t once commercial.
- Ash disposal route (bottom ash reuse? fly ash to which licensed B3 facility?).
- Palembang's tariff in the existing PPA (Perpres 35/2018 cap or other) and the final tipping-fee arrangement after the Perpres 109 transition.
- Whether the 8 Dec 2026 inauguration actually happens (re-check before publishing).
- Correct household-equivalent method behind "14.000–15.000 rumah".
- Status of TPA Sukawinatan after diversion (closure, remaining load, fires) and any role for TPA Karya Jaya.
- Independent critiques specific to Palembang (Walhi Sumsel); only national/Jabar/Jatim Walhi critiques found (Tempo pages 403).

### Sources that failed

- palembang.go.id article pages (`/berita/berita-758`): JavaScript-rendered; content recovered from the home page JSON instead.
- iea.org case study "Palembang waste-to-energy plant": HTTP 403 (urllib and WebFetch).
- Tempo (tempo.co and en.tempo.co: Walhi critiques, UGM "sampah organik kendala terbesar PSEL", Danantara Chinese finalists): HTTP 403.
- Nasdaq "Zheneng Jinjiang's Subsidiary Secures Major Project Financing": 403 / timeout.
- Petromindo "Zheneng Jinjiang's Palembang WTE plant set to begin ops in 2026": seen only as a Google News headline; URL not decodable.
- Google News batchexecute link decoder: HTTP 429 (rate-limited).
- DuckDuckGo HTML: returned a blank/landing page. Bing web RSS: irrelevant results.
- WebSearch tool: model error. Kompas.id English "83 Percent" article and KoranSN SUTT article: headline only, not opened.
