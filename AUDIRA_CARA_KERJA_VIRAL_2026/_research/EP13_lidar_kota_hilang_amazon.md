# EP13 — LiDAR "sees through" the Amazon: research notes

Research date: 2026-11-08. This file holds research only, not a script.
Method: Google News RSS (English and Indonesian) links were decoded to real URLs through Google's batchexecute endpoint, and article HTML was read with Python. The Nature paper's metadata and abstract came from the Crossref API. The full text was read from PubMed Central (PMC13558069), because nature.com redirects scripts and Europe PMC's full-text endpoint returned HTTP 500. Precedent papers were checked through Crossref abstracts, Wikipedia, BBC and Eos.

---

## 1. Viral hook: is it recent?

| Headline | Outlet | Published | URL |
|---|---|---|---|
| "Sains: Teknologi laser mengungkap ratusan struktur kuno buatan peradaban yang telah lama hilang di hutan Amazon" (on-page lead: "Jutaan orang pernah hidup dalam sebuah peradaban di hutan Amazon ribuan tahun silam") | BBC News Indonesia | **6 Nov 2026** (meta `article:published_time` 2026-11-06T03:34Z) | https://www.bbc.com/indonesia/articles/c9zrd01lrvnro |
| "Over 20,000 precolonial earthworks in the Southwest Amazonia" (the paper) | *Nature* 657 (8131): 420–425 | **29 Jul 2026** online | https://www.nature.com/articles/s41586-026-10835-7 (DOI 10.1038/s41586-026-10835-7) |
| "Hundreds of never-before-seen ancient 'earthworks' discovered in the Amazon" | Scientific American | 29 Jul 2026 | https://www.scientificamerican.com/article/hundreds-of-ancient-never-before-seen-earthworks-discovered-in-the-amazon/ |
| "Lasers reveal hundreds of geoglyphs made by a mysterious civilization in the Amazon rainforest..." | Live Science | 29 Jul 2026 | https://www.livescience.com/archaeology/americas/lasers-reveal-hundreds-of-geoglyphs-made-by-a-mysterious-civilization-in-the-amazon-rainforest-thousands-of-years-ago |
| "Studi Baru: 20.000 Bangunan Kuno Terkubur di Hutan Amazon" | Kompas.com | 30 Jul 2026 | https://www.kompas.com/sains/read/2026/07/30/095539323/studi-baru-20000-bangunan-kuno-terkubur-di-hutan-amazon (headline only, not read) |
| "Laser scanning reveals thousands of ancient structures hidden in the Amazon" | GIM International | 13 Aug 2026 | https://www.gim-international.com/news/laser-scanning-reveals-thousands-of-ancient-structures-hidden-in-the-amazon |

**Study facts (from the paper unless noted):**
- **Authors:** Martti Pärssinen (lead, Instituto Iberoamericano de Finlandia, Madrid, and University of Helsinki), Risto Kalliola, Alceu Ranzi, Eetu Puttonen, Rhuan Carlos Lopes, Pirjo Kristiina Virtanen, Francisco Apurinã, Kalle Ruokolainen, Juha Hyyppä, Antero Kukko, Mariana Campos, Fabio de Novaes, Markku Oinonen, Antonia D. Barbosa, Sanna Saunaluoma, Evandro Ferreira. 16 authors, Finnish and Brazilian institutions.
- **Received** 4 Apr 2025, **accepted** 22 Jun 2026, open access (CC BY 4.0).
- **Where:** Brazilian states of **Acre and Amazonas** (south-western Amazon, near the Bolivia/Peru borders).
- **When flown:** **6 June – 1 July 2024**.
- **Sensor:** **aircraft**, a **Seneca V** carrying a **RIEGL LMS-Q780 II full-waveform laser scanner** and an **Applanix POS AV 610 IMU**. Two **drones** (DJI Zenmuse L2 and AlphaAir 10, both LiDAR + RGB) were added in June 2024 at a few easy-to-reach sites only.
- **Survey size:** **4,430 km of flight lines**, 1 km wide strips, covering **4,497 km²**, in 10 lines.
- **Found:** **432 earthworks**, of which **only 36 were previously known** (so 396 new, the figure Scientific American uses).
- **Culture:** the "**Aquiry**" civilization, a name Pärssinen introduced in 2021. Geoglyphs (geometric ditched enclosures) were built **600 BC – AD 850** (Bayesian modelling of radiocarbon dates; 162 dates presented).
- **Headline numbers:** an estimated **24,000–30,000 earthworks** in the whole area (title rounds to "over 20,000"); Aquiry territory about **183,000 km²** (tripled from an earlier 60,000 km²); population **1.25–3 million people in AD 100–300**.
- **Funding:** a grant from E. Jhong (USA); open-access fee paid by University of Helsinki Library.

**Verdict:** **The BBC Indonesia piece is recent (6 Nov 2026), but the science is not new.** The paper came out on **29 July 2026**, more than three months earlier, and English and Indonesian media covered it then. BBC Indonesia is a late feature, probably translated from BBC Mundo/Brasil (not confirmed). Safe framing: "studi di jurnal Nature (Juli 2026), diangkat BBC pekan ini". Do not say "baru saja ditemukan minggu ini".

---

## 2. Verified facts

### A. The Aquiry study

1. **The sensor settings.** Flight altitude about **1,125 m above ground** (1,090–1,250 m), speed **130 knots**, laser pulse frequency **1,600 kHz**, average point density **31.2 points/m²** (min 15, max 60).
   - Source: Nature paper, Methods, via https://pmc.ncbi.nlm.nih.gov/articles/PMC13558069/
   - Confidence: **HIGH** (paper). Note: 1,600 kHz = 1.6 million pulses per second. This is the paper's stated figure; it may be an effective rate using multiple-time-around processing. Say "lebih dari sejuta pulsa per detik" only if quoting the paper; "ratusan ribu pulsa per detik" is the safe general line.
2. **Why this scanner.** The paper says the LMS-Q780 II supports full-waveform analysis and multiple-time-around processing, which are "advantageous for aerial surveys in complex canopied environments". It says these features **increase the number of ground returns** and improve the terrain models.
   - Source: paper, Methods. Confidence: **HIGH**.
3. **Processing chain.** GNSS–IMU data were merged to georeference the point cloud. Points were **classified into ground and non-ground** (TerraScan). Digital terrain models were made with LAStools at **50 cm resolution**, which "proved sufficient for geoglyph detection", then turned into **hillshaded** GeoTIFFs and inspected in QGIS and Global Mapper.
   - Source: paper, Methods. Confidence: **HIGH**.
4. **Systematic block.** Six parallel lines, each about **445 km long, 1 km wide, 10 km apart** (2,380 km²), held **347 earthworks**; 334 were used for extrapolation. 92% of them lay within 210 km of the Rio Branco start points.
   - Source: paper. Confidence: **HIGH**.
5. **The canopy still hides some.** Even with LiDAR, the authors estimate **26.7%** (block 1, range 11.5–41.9%) and **36.2%** (block 8, range 17.8–54.5%) of earthworks may remain **undetected** under forest.
   - Source: paper. Confidence: **HIGH**.
6. **What satellites missed.** LiDAR showed that **embanked enclosures without ditches** are far more common than thought, because they are hard to detect in satellite imagery. Earlier work using satellite images and aerial photos found nearly **1,300 earthworks over about 134,000 km²**, almost all in deforested land.
   - Source: paper (abstract and results). Confidence: **HIGH**.
7. **Geoglyph size.** Usually **0.35–14 ha**, the largest nearly **50 ha**. Ditches **9–13 m wide**, up to **5 m deep**. (BBC quotes Ranzi as "up to 15 m wide".)
   - Source: paper; BBC Indonesia. Confidence: **HIGH** for the paper figures.
8. **Population vs today.** Modern Acre: 164,000 km², about 830,000 people (≈5.1/km²). Aquiry estimate: 7.1–16.5/km², up to 32.6/km² in an 85,000 km² core.
   - Source: GIM International summary of the paper; Acre figures are also in the paper. Confidence: **MED** (densities read only in GIM).
9. **Roads.** Ranzi: "Kami memetakan 350 kilometer jalan" connecting geoglyphs, widening near the structures.
   - Source: BBC Indonesia. Confidence: **MED** (quote only; the 350 km figure was not found in the paper text read).
10. **Indigenous data protection.** "Earthworks discovered in Indigenous territories are not marked on our maps or database." Indigenous scholar **Francisco Apurinã** (University of Helsinki, Indigenous Studies) is a co-author.
    - Source: paper. Confidence: **HIGH**.
11. **Function.** Now thought ceremonial/political gathering places rather than forts or permanent homes (Pärssinen, Ranzi). Pärssinen to Live Science: native oral traditions say the centres were built to foster relations between communities.
    - Source: BBC Indonesia; Live Science. Confidence: **MED** (interpretation, debated).
12. **Abandonment.** Building seems to stop around **AD 850**. Pärssinen to Live Science: abandoned "between A.D. 850 and 950", cause unknown; he compares it to the Classic Maya, Tiwanaku and Wari.
    - Source: Live Science; BBC. Confidence: **MED**.
13. **Independent critique.** Heiko Prümers (German Archaeological Institute, not involved) called it "really fascinating" but asked whether nearby structures were counted separately or together, and said many sites could reflect **frequent relocations** rather than high population.
    - Source: Scientific American. Confidence: **HIGH** that he said it.

### B. How LiDAR works (general)

14. **Time of flight.** A pulsed laser fires at the ground; the sensor times the two-way travel and converts it to distance, then elevation. A **GPS/GNSS receiver** gives X,Y,Z of the aircraft; an **IMU** gives roll, pitch and yaw.
    - Source: NEON, https://www.neonscience.org/resources/learning-hub/tutorials/lidar-basics ; NOAA, https://oceanservice.noaa.gov/facts/lidar.html ("a laser, a scanner, and a specialized GPS receiver"). Confidence: **HIGH**.
15. **Multiple returns.** Some light reflects off branches, and some passes through gaps and continues to the ground, so **one pulse can record several returns**. Discrete-return systems may record **1–11+ returns** per pulse; full-waveform systems record the whole returned energy curve.
    - Source: NEON. Confidence: **HIGH**.
16. **Gaps between leaves.** Eos (on the 2018 Maya survey): pulses "penetrate through tiny gaps between leaves" and reflect back.
    - Source: https://eos.org/articles/lidar-uncovers-thousands-of-new-maya-structures. Confidence: **HIGH**.
17. **Classification.** Points are labelled "ground" or "vegetation"/non-ground; deleting non-ground points leaves the bare earth.
    - Source: NEON; Aquiry Methods. Confidence: **HIGH**.

### C. Precedents

18. **Upano Valley, Ecuador.** Rostain et al., "Two thousand years of garden urbanism in the Upper Amazon", *Science*, **12 Jan 2024** (DOI 10.1126/science.adi6317). Platforms, plazas, streets, drainage and long straight roads; occupation about **500 BCE to 300–600 CE**. Wikipedia: LiDAR survey funded by Ecuador's government in **2015**, sites over **300 km²**, about **6,000 platforms**.
    - Confidence: **HIGH** (abstract); **MED** for Wikipedia numbers.
19. **Maya, PACUNAM (northern Guatemala).** Canuto et al., *Science*, **28 Sep 2018** (DOI 10.1126/science.aau0137). More than **61,000 structures** over more than **2,100 km²** (Eos); "largest single lidar survey of Mesoamerican archaeology"; features as small as about 1 m.
    - Confidence: **HIGH** (abstract + Eos).
20. **Valeriana, Campeche, Mexico.** Auld-Thomas et al., *Antiquity*, Oct 2024 (DOI 10.15184/aqy.2024.148). Found in an **environmental LiDAR dataset** made by a Mexican agency for non-archaeological purposes. City about **16.6 km²**, maybe 30,000–50,000 people around AD 750–850; **6,764 buildings** across three surveyed areas (BBC).
    - Source: Crossref abstract; https://www.bbc.com/news/articles/crmznzkly3go. Confidence: **MED** for numbers (BBC only).
21. **Llanos de Mojos, Bolivia.** Prümers et al., *Nature*, **25 May 2022** (DOI 10.1038/s41586-022-04780-4). Casarabe culture (about **AD 500–1400**); two large sites of **147 ha and 315 ha**; conical pyramids **up to 22 m**; raised causeways several km long; canals and reservoirs; "low-density urbanism".
    - Confidence: **HIGH** (abstract).
22. **Angkor, Cambodia.** Evans et al., *PNAS*, 2013 (DOI 10.1073/pnas.1306539110). LiDAR digital elevation models under forest revealed a previously undocumented, formally planned urban landscape around temples such as Angkor Wat.
    - Confidence: **HIGH** (abstract).

---

## 3. Mechanism in 7 animation steps (Bahasa Indonesia)

1. **Pesawat kecil terbang lurus bolak-balik.** Ketinggian sekitar 1,1 km, membawa pemindai laser di perutnya. Di Acre, jalurnya total 4.430 km, tiap jalur selebar 1 km.
2. **Laser menembak terus-menerus.** Ratusan ribu sampai lebih dari sejuta pulsa per detik (studi Aquiry: 1.600 kHz) disapu kiri-kanan.
3. **Hitung waktu pantul.** Cahaya pergi lalu kembali; dari waktunya, jarak dihitung. GNSS memberi posisi pesawat, IMU memberi kemiringannya, jadi tiap pantulan dapat koordinat 3D.
4. **Satu pulsa, banyak pantulan.** Sebagian cahaya memantul dari puncak daun, sebagian dari ranting, dan sebagian kecil lolos lewat celah daun sampai tanah. Pemindai full-waveform merekam seluruh "gema" ini.
5. **Awan titik.** Hasilnya miliaran titik; di Acre rata-rata 31 titik per meter persegi.
6. **Hapus hutannya.** Software mengelompokkan titik: "tanah" atau "bukan tanah". Titik pohon dibuang, sisanya model permukaan tanah telanjang (resolusi 50 cm).
7. **Beri bayangan buatan.** Hillshade, yaitu cahaya matahari virtual dari samping, membuat parit sedalam beberapa meter tampak jelas: lingkaran, persegi, jalan lurus. Lalu arkeolog mengecek di lapangan.

---

## 4. Myths, traps and caveats

- **"Laser menembus daun."** Not quite. It does not pass *through* leaves; a fraction of pulses slip **through gaps**. Say "menyelinap lewat celah daun".
- **"Ditemukan minggu ini."** Wrong. The paper is from **29 Jul 2026**; fieldwork flights were June–July 2024.
- **"20.000 bangunan ditemukan."** Wrong. **432** were documented in the LiDAR data; **24,000–30,000** is an **extrapolation** for the whole region. The Kompas headline invites this mistake.
- **"Kota" / "lost city".** The structures are mostly **geoglyphs and earthworks** (ditched enclosures, embankments, roads, later mound villages), not stone cities. Call them "struktur tanah raksasa", not "kota batu". Paper and authors themselves frame them as ceremonial centres.
- **Population of 3 million.** An **estimate** (1.25–3 million) that depends on assumptions (e.g., 300 people per earthwork). Prümers questions it. Say "diperkirakan hingga 3 juta".
- **"Survei 4.400 km²" vs "4.430 km".** Both exist: 4,430 km of flight lines and 4,497 km² of coverage. BBC Indonesia's "4.400 km persegi" is a rounding.
- **"Satelit tidak bisa."** Satellite optical images see only the canopy top; most earlier finds were in **deforested** land. Satellites still found about 1,300 earthworks there. Say "foto satelit hanya melihat atap hutan".
- **LiDAR is not proof alone.** The authors stress the numbers are estimates and need **fieldwork / ground-truthing**. Even LiDAR may miss 27–36% under canopy.
- **"Hilang" framing.** The civilization was not "lost" to its descendants: the paper cites native oral traditions, includes an Indigenous co-author, and withholds locations in Indigenous territories. Scholars (Pärssinen, Lopes, Prümers) frame the result as overturning the "untouched wilderness" myth. A respectful line: "tersembunyi dari peta ilmuwan, bukan dari sejarah masyarakat adat".
- **Valeriana building count.** BBC says 6,764; some coverage may differ. Use "ribuan bangunan" if unsure.

---

## 5. Hook and curiosity angles (90-second Indonesian video)

1. **"Foto satelit: hijau semua. Laser: ratusan lingkaran raksasa."** Before/after reveal as the 0–3 s hook. Strongest.
2. **"Gimana caranya cahaya 'menembus' hutan terlebat di dunia?"** Answer: it doesn't; it sneaks through gaps, a million times a second.
3. **"Dulu di sini mungkin lebih ramai daripada sekarang."** Aquiry estimate up to 16.5/km² vs Acre today 5.1/km².
4. **"Dibangun saat Pythagoras hidup di Yunani."** Ranzi's comparison (BBC). Use as context, labelled as his quote.
5. **"Mereka membangun 432 struktur raksasa tanpa batu."** No stone in the region; earth moved with wooden tools and baskets (Ranzi, a likelihood, not proven).
6. **"Satu sapuan laser = pekerjaan arkeolog seabad."** Canuto (BBC 2024): a decade of LiDAR mapped about 10 times the area of a century of fieldwork in Mesoamerica.
7. **"Hutan Amazon bukan hutan perawan."** Lopes: "a giant historical garden shaped by humans" (BBC Indonesia paraphrase).

---

## 6. Visual / 3D beat ideas

- **Opening:** top-down satellite-like green canopy; a laser sweep line passes and the canopy turns to a point cloud, then dissolves, revealing a square-and-circle geoglyph.
- **Pulse cross-section:** side-view slice of a tree; one beam splits into returns at crown, branch, understory, ground; a waveform graph pulses beside it with peaks labelled.
- **Aircraft rig:** Seneca-style plane (generic, not branded) with scanner, GNSS antenna and IMU box lit up as HUD labels; zig-zag scan pattern on the ground; a "1 km" strip ruler.
- **Point cloud classification:** points recolour green (vegetation) and brown (ground); green points rain upward and vanish; bare earth remains.
- **Hillshade reveal:** a virtual sun rotates around the terrain; shadows make ditches pop. Good spot for the AUDIRA brand label on a HUD.
- **Scale payoff:** zoom out from one geoglyph to a map with 432 dots, then a faint overlay of 24,000–30,000 estimated dots labelled "perkiraan".
- **Precedent montage:** quick map pins for Upano (Ecuador), Casarabe (Bolivia), Valeriana (Mexico), Tikal region (Guatemala), Angkor (Cambodia).
- **Respectful close:** dawn over the canopy, small longhouse silhouettes and maize/manioc fields (Pärssinen's description of the landscape around AD 200), not "ruins of a lost empire".

---

## 7. Open questions / unverified

- Whether BBC Indonesia translated from BBC Mundo or BBC Brasil (not checked).
- The **350 km of roads** figure: only in Ranzi's BBC quote; not found in the paper text read.
- The exact meaning of **1,600 kHz** (raw vs effective pulse rate with multiple-time-around); RIEGL spec sheet not read.
- **Cost** of airborne LiDAR surveys: no source read. Do not state a price.
- The fraction of pulses that reach the ground under rainforest canopy: no specific source read for this survey. Say "hanya sebagian kecil".
- Kompas, detik and Bacaini Indonesian articles: headlines only, not read.
- Science (science.org) news story: HTTP 403, not read. nature.com: redirect to scripts; full text read via PMC instead.
- Supplementary Notes 1e–f (sensitivity analysis details): not read.
