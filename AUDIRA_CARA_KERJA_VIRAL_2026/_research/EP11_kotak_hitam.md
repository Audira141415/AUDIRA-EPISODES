# EP11 — Kotak hitam (flight recorder: FDR + CVR): research notes

Research date: 2026-11-08. This file holds research only, not a script.
Method: Google News RSS (hl=id and hl=en-US) and Bing News RSS. Google News links were decoded to real URLs with a batchexecute script, then article HTML was read with Python urllib. Primary pages were read directly: NTSB "Cockpit Voice Recorders and Flight Data Recorders", eCFR 14 CFR 91.609, and the Federal Register API (FAA 25-hour CVR rule). Background came from Wikipedia "Flight recorder" and "Underwater locator beacon" (EN), "Flugschreiber" (DE) and "Enregistreur de vol" (FR).

---

## 1. Viral hook: is it recent?

| Headline | Outlet | Published | URL |
|---|---|---|---|
| "TNI AL temukan kotak hitam heli Mi-17V5 yang jatuh di Seruyan" (original ANTARA title: "TNI AL temukan kotak hitam helikopter Mi-17V5 Puspenerbad"), writer Walda Marison | ANTARA News Kalsel | **Sat 7 Nov 2026, 16:04 WIB** | https://kalsel.antaranews.com/amp/berita/543531/tni-al-temukan-kotak-hitam-heli-mi-17v5-yang-jatuh-di-seruyan |
| "Kotak Hitam Helikopter Mi-17V5 yang Jatuh di Seruyan Ditemukan" | Kompas.tv | Sat 7 Nov 2026 | https://www.kompas.tv/nasional/700248/kotak-hitam-helikopter-mi-17v5-yang-jatuh-di-seruyan-ditemukan?page=all |
| "Kotak Hitam Helikopter Karhutla Mi-17V5 yang Jatuh di Kalteng Ditemukan" | Media Indonesia (Ant/E-3) | Sat 7 Nov 2026 | https://mediaindonesia.com/humaniora/953512/kotak-hitam-helikopter-karhutla-mi-17v5-yang-jatuh-di-kalteng-ditemukan |
| "KSAD Tunggu Kotak Hitam Soal Penyebab Pasti Jatuhnya Heli Mi-17 di Kalteng" | detikcom | 5 Nov 2026 | Google News RSS item (not opened) |
| "Misteri Keberadaan Black Box Pesawat Learjet yang Jatuh dan Meledak" | CNN Indonesia | **Tue 3 Nov 2026, 11:15 WIB** | https://www.cnnindonesia.com/internasional/20261103105132-134-1422665/misteri-keberadaan-black-box-pesawat-learjet-yang-jatuh-dan-meledak |
| "Learjet 60 crash: Was a black box on board, and could it survive the impact?" (Joanna Bailey) | Aerospace Global News | 2 Nov 2026 | https://aerospaceglobalnews.com/news/florida-learjet-60-crash-black-box-recovery/ |
| "Learjet 60 crashes near West Palm Beach, Florida" (updated through 3 Nov) | Flightradar24 blog | 1 Nov 2026 | https://www.flightradar24.com/blog/flight-tracking-news/major-incident/learjet-60-crashes-near-west-palm-beach-florida/ |
| "Learjet may have been breaking up before it crashed in Florida, NTSB says" (ABC News syndication) | KVIA | 2 Nov 2026 | https://kvia.com/news/2026/11/02/learjet-may-have-been-breaking-up-before-it-crashed-in-florida-ntsb-says/ |

**Mi-17V5 facts.** ANTARA, Kompas.tv and Media Indonesia agree on all of these, from an official Penerangan Koarmada I press release:
- **What was found:** the **Flight Data Recorder (FDR)** and the **tail section**. The finders were divers of **Satkoppeba Koarmada I** (TNI AL).
- **Where:** the waters of Desa Sungai Perlu, Kuala Pembuang, Kabupaten Seruyan, Kalimantan Tengah. Kompas.tv adds Kecamatan Danau Sembuluh.
- **Aircraft:** a Mi-17V5 of **Puspenerbad** (TNI AD).
- **Crash:** Wednesday **4 Nov 2026**, after take-off from Kuala Pembuang at about **09.55 WIB**. The helicopter was on a karhutla (forest and land fire) mission in Taman Nasional Tanjung Puting. It went down in the water **while picking up water for water bombing** ("mengalami kendala terbang").
- **Casualties:** **3 soldiers died** (Letkol Cpn (Anumerta) Dudi Firmansyah, Kapten Cpn (Anumerta) Nurhafiz Akbar, Sertu (Anumerta) Heri Prasetyo). **5 crew survived.**
- **Next step:** the FDR was handed to the **Tim Investigasi Puspenerbad**, not to KNKT. Kadispenad Brigjen Donny Pramono said the cause cannot yet be concluded (Kompas.tv).
- **Not mentioned:** no article names a CVR. Only the FDR is mentioned.

**Learjet facts.**
- **Crash:** **Sunday 1 Nov 2026**, about 12:49 local time (17:49 UTC), in Greenacres, Palm Beach County, Florida.
- **Aircraft and flight:** Learjet 60 **N722BD**, built 2004. Austin to North Eleuthera (Bahamas).
- **People:** **9 killed** (2 crew, 7 passengers).
- **Last moments:** at 35,000 ft the crew reported icing, moderate turbulence and an outside air temperature of −47 °C. They asked to climb to 37,000 ft. Less than 30 seconds later they called "overspeed condition, descending" and Mayday. FR24 recorded a descent rate above 32,000 ft/min. NTSB says the jet was breaking up before impact.
- **Recorder status:** NTSB member Tom Chapman said maintenance records show a **CVR was installed**, but "what we don't know is whether that recorder was still on board". AGN says a sales listing shows a Universal CVR-30. With 8 passenger seats, the aircraft was **below the 10-seat FDR threshold**.
- **Wreckage:** much of it is in a water-filled crater. FR24 says that on 3 Nov the NTSB was still working to get access to the crater.

**Verdict:** **Both stories are truly recent** (1–7 Nov 2026). The Mi-17 "found" story is the fresher hook (7 Nov). The Learjet gives the opposite angle: the box may not exist or may not be found. **As of 8 Nov, no article read reports that the Learjet CVR was recovered.** Treat it as still missing or unknown.

---

## 2. Verified facts

### A. What it is and what it records

1. **There are two recorders, not one.** The FDR records flight parameters, and the CVR records cockpit sound and radio. They may be combined into one unit (a CVDR).
   - Sources: https://www.ntsb.gov/news/Pages/cvr_fdr.aspx and https://en.wikipedia.org/wiki/Flight_recorder
   - Confidence: **HIGH**.
2. **88 parameters minimum.** NTSB says newly manufactured aircraft must record **at least 88 parameters**, such as time, altitude, airspeed, heading and attitude. Some FDRs record more than **1,000**. NTSB's own spec table gives "18 – 1000+".
   - Wikipedia adds that only 29 parameters were required until 2002.
   - Source: NTSB page above.
   - Confidence: **HIGH** (the 29 figure is MED).
3. **FDR records 25 hours on a loop.** The NTSB spec table says "25 hour continuous". Wikipedia says most FDRs record about 17–25 hours in a continuous loop and that the oldest data is overwritten. Parameters are sampled "a few times per second".
   - Confidence: **HIGH**.
4. **The CVR has 4 audio channels:** the pilot headsets plus a **cockpit area microphone** on the overhead panel. From engine noise, warnings, clicks and gear sounds, investigators can work out RPM, failures and event timing.
   - Source: NTSB page.
   - Confidence: **HIGH**.
5. **CVR length: 30 min, then 2 h, now 25 h.**
   - The US requirement has been **2 hours** since 2008. **EASA raised it to 25 hours in 2021** (Wikipedia).
   - The **FAA final rule "25-Hour CVR Requirement, New Aircraft Production"** was published **2 Feb 2026**, with a correction on 8 May 2026. It raises CVR time from 2 h to **25 h for future-manufactured aircraft** only. Existing fleets are not covered.
   - Source: https://www.federalregister.gov/documents/2026/02/02/2026-02110/25-hour-cockpit-voice-recorder-cvr-requirement-new-aircraft-production
   - Confidence: **HIGH**. The exact compliance date was not read.
6. **Why 25 h matters: the overwrite problem.** On Alaska Airlines 1282 (Jan 2024) the CVR stayed powered and recorded over the event audio.
   - In **July 2026** the FAA issued a SAFO telling crews to cut CVR power after a reportable event.
   - Sources: Wikipedia; Flying Magazine, https://www.flyingmag.com/faa-issues-new-guidance-to-prevent-cvr-data-loss/ (paywalled after the intro).
   - Confidence: **MED**.

### B. Why it survives

7. **NTSB spec table** (applies to both FDR and CVR):
   - Impact **3,400 g for 6.5 ms**.
   - Fire **1,100 °C for 30 min**.
   - Water pressure: **submerged at 20,000 ft** (about 6,000 m).
   - Source: NTSB page.
   - Confidence: **HIGH** that NTSB states this.
8. **The current standard is EUROCAE ED-112** (March 2003), which replaced ED-55 and ED-56A. It sets 3,400 g for 6.5 ms, which is roughly a **270 kt (about 500 km/h) impact stopped within 45 cm**. It also covers penetration, static crush, high- and low-temperature fire, deep-sea pressure, seawater immersion and fluid immersion.
   - Source: Wikipedia EN.
   - Confidence: **MED** (Wikipedia; the ED-112 document itself is paywalled and was not read).
9. **Fire duration is 60 min under the current standard.** DE and FR Wikipedia both give **1,100 °C for 60 minutes** and **260 °C for 10 hours**. NTSB's table still says 30 min, probably from the older standard.
   - Sources: https://de.wikipedia.org/wiki/Flugschreiber and https://fr.wikipedia.org/wiki/Enregistreur_de_vol
   - Confidence: **MED**.
   - Script line: "1.100 derajat selama satu jam". Do not quote 30 min and 60 min together.
10. **Construction: a box inside a box.** The memory chips (the **crash-survivable memory unit, CSMU**) sit inside a thermal block, inside an insulation layer, inside a **titanium or steel** shell. Wikipedia EN says "double wrapped in strong corrosion-resistant stainless steel or titanium, with high-temperature insulation".
    - Older units used magnetic tape. Modern ones use **solid-state flash memory**.
    - Sources: FR Wikipedia; EN Wikipedia; NTSB (tape versus memory chips).
    - Confidence: **MED**.
11. **Mounted in the tail.** NTSB says both recorders sit in "the most crash survivable part of the aircraft, usually the tail section".
    - Confidence: **HIGH**.
    - The Mi-17 FDR was found together with the tail section, which ties in neatly.

### C. Color, label, locator

12. **It is orange, not black.** Recorders must be **bright orange or yellow with reflective surfaces** so they stand out in wreckage.
    - The name "black box" comes from WWII British slang for secret electronics in black housings. Wikipedia cites a 1967 line: "so-called 'black boxes' are, in fact, of fluorescent flame-orange".
    - Source: Wikipedia EN.
    - Confidence: **HIGH** for the color rule, **MED** for the etymology.
13. **The label reads "FLIGHT RECORDER DO NOT OPEN"** in English on one side and "ENREGISTREUR DE VOL NE PAS OUVRIR" in French on the other.
    - Source: Wikipedia EN.
    - Confidence: **MED**.
14. **The underwater "pinger" (ULB).**
    - It switches on when it touches water and transmits at **37.5 kHz**, a 10 ms pulse once per second. NTSB says it can transmit from **14,000 ft** deep.
    - The battery has a shelf life of **6+ years** and runs **30 days** once activated.
    - Sources: NTSB page; https://en.wikipedia.org/wiki/Underwater_locator_beacon
    - Confidence: **HIGH**.
15. **Pinger life went from 30 to 90 days.** After Air France 447 (2009), whose recorders took about 2 years to find, the BEA recommended 90 days. **EASA has required 90 days since 1 Jan 2020.** For long over-water routes it has also required an extra **8.8 kHz** low-frequency ULB since 1 Jan 2019, detectable at 13–22 km versus 1–2 km (ideal conditions 4–5 km) for 37.5 kHz.
    - Source: Wikipedia ULB page.
    - Confidence: **MED**.

### D. Who must carry one, and reading it

16. **US Part 91 carriage rules** (14 CFR 91.609):
    - **FDR:** required for multiengine turbine aircraft with **10+ passenger seats** (made after 11 Oct 1991).
    - **CVR:** required for multiengine turbine aircraft with **6+ passenger seats that need two pilots**.
    - This is why the 8-seat Learjet likely had a CVR but no mandatory FDR.
    - Source: eCFR 91.609, read from the eCFR versioner API.
    - Confidence: **HIGH**.
17. **How investigators read it.**
    - The recorders go to the lab (for the US, NTSB HQ in Washington).
    - Data is extracted with special equipment. FDR data can drive a **computer-animated reconstruction** of the flight.
    - A **CVR group** writes a transcript. This group includes NTSB, FAA, the operator, the airframe and engine makers, and the pilots' union.
    - US law **forbids releasing the CVR audio**. Only the transcript is released.
    - Source: NTSB page.
    - Confidence: **HIGH**.
18. **The inventor was David Warren (Australia, ARL).** He wrote a 1954 report, built the ARL Flight Memory Unit in 1956, and built a combined FDR/CVR prototype in 1958. The British production version was nicknamed the **"Red Egg"** for its shape and red color. Australia was the first country to make cockpit voice recording compulsory.
    - Source: Wikipedia EN.
    - Confidence: **MED**.
19. **Deployable recorders.**
    - In 1999 the NTSB recommended a second recorder that **ejects before impact**, floats, and carries an ELT.
    - The **US Navy has used deployable CVDRs since 1993**.
    - The debate was renewed after MH370, along with calls for **live data streaming**.
    - Source: Wikipedia EN.
    - Confidence: **MED**.
20. **When the box is missing, investigators still have other tools.** In the Learjet case, Chapman said they can use wreckage, flight data such as ADS-B, ATC audio and weather reconstruction.
    - Source: CNN Indonesia, 3 Nov 2026.
    - Confidence: **HIGH**.

---

## 3. Mechanism in 7 animation steps (Bahasa Indonesia)

1. **Sensor di seluruh pesawat.** Ketinggian, kecepatan, arah, posisi kemudi, mesin: semua dikirim ke unit pengumpul data (FDAU), lalu ke FDR. Minimal 88 parameter, beberapa kali per detik.
2. **Mikrofon di kokpit.** CVR merekam 4 kanal: headset pilot dan mikrofon area di plafon kokpit. Bunyi klik, alarm, dan dengung mesin juga ikut jadi data.
3. **Rekaman berputar (loop).** Data lama ditimpa data baru. FDR menyimpan sekitar 25 jam terakhir, CVR 2 jam (pesawat baru 25 jam).
4. **Brankas di ekor.** Chip memori dibungkus berlapis: blok termal, insulasi, lalu cangkang titanium atau baja, dan dipasang di bagian ekor.
5. **Uji siksa.** Benturan 3.400 g, api 1.100 °C selama satu jam, tekanan laut sekitar 6.000 m.
6. **Oranye dan "berbunyi".** Warna oranye terang memudahkan pencarian di puing. Jika jatuh ke air, pinger aktif dan memancarkan 37,5 kHz sekali per detik. Manusia tidak bisa mendengarnya, tetapi hidrofon tim SAR bisa.
7. **Dibaca di laboratorium.** Chip dikeluarkan, datanya diunduh, lalu dibuat animasi ulang penerbangan dan transkrip suara. Rekaman suara aslinya tidak dirilis ke publik (aturan AS).

---

## 4. Myths and traps to avoid

- **"Kotak hitam itu hitam."** It is orange. This is the payoff, but say "wajib oranye/kuning terang" (the rule allows either).
- **"Kotak hitam merekam seluruh penerbangan sejak pesawat dibuat."** False. It is a loop: 25 h for the FDR, often only 2 h for the CVR.
- **"Kotak hitam tidak bisa hancur."** False. Wikipedia notes that recorders can be crushed into unreadable pieces, and the Learjet case shows a box may never be found. Say "dirancang untuk bertahan", not "tidak bisa hancur".
- **"Kotak hitam = satu alat."** It is two (FDR and CVR), sometimes combined in one unit. **The Mi-17 reports mention only the FDR.** Do not say the Mi-17 voice recording was found.
- **Fire duration conflict.** NTSB says 30 min and ED-112 (via DE/FR wiki) says 60 min. Pick 60 min and present it as the current standard, or say "sampai 1.100 °C" with no duration.
- **Pinger range and battery.** 30 days is the classic figure and 90 days is the EASA rule since 2020. Do not claim every aircraft has 90 days.
- **"Jet pribadi tidak wajib kotak hitam."** The Sun (UK) says small private jets are not legally mandated. AGN and eCFR show the Learjet's class **did require a CVR** (6+ seats, two pilots) but **not an FDR** (under 10 seats). Use the precise version.
- **Military helicopters.** No source read states the TNI's recorder rules. **Do not claim military aircraft are exempt.** The point is only that this Mi-17 investigation is run by Puspenerbad, not KNKT (verified).
- **Learjet "meledak di udara".** NTSB says it was "breaking up before impact" and then hit the ground. Do not say it exploded mid-air.
- **Do not attach victims' names** to visuals of crash sites. Keep it respectful: 3 soldiers died in a firefighting mission.

---

## 5. Hook and curiosity angles (90-second Indonesian video)

1. **"Namanya kotak hitam... tapi warnanya oranye."** A visual reveal of the color. Strongest and evergreen.
2. **"Dua kecelakaan, satu minggu, dua nasib kotak hitam."** The Mi-17 FDR was found by navy divers in Seruyan (7 Nov). The Learjet in Florida: nobody even knows if its recorder was still on board.
3. **"Benda ini harus selamat dari benturan 3.400 kali gravitasi."** Then show the stress-test sequence (impact, fire, deep sea).
4. **"Di dasar laut, kotak ini 'berteriak' 37.500 kali per detik... tapi telinga kita tidak bisa mendengarnya."** Careful: 37.5 kHz is the frequency (cycles per second), not pings per second. The pulse rate is 1 per second. Safer line: "berbunyi sekali tiap detik, di nada yang terlalu tinggi untuk telinga manusia."
5. **"Kenapa tidak dikirim langsung lewat internet saja?"** The streaming and deployable-recorder debate since MH370.
6. **"Pilot cuma punya 2 jam 'memori'."** The CVR loop, the Alaska 1282 overwrite, and the new 25-hour rule (FAA, Feb 2026).
7. **"Kenapa dipasang di ekor?"** The tail is the most survivable part. Tie it to the Mi-17 FDR found with the tail.

---

## 6. Visual and 3D beat ideas

- **Hook:** a black box silhouette that turns bright orange, with reflective stripes catching light. "FLIGHT RECORDER DO NOT OPEN" lettering, plus an AUDIRA lab tag on the side to put the brand inside the scene.
- **X-ray zoom into the tail:** a cutaway of the aircraft, the camera dolly to the tail, the recorder lights up. A sensor data river flows from wings, engines and cockpit into the box (88+ glowing lines).
- **Exploded view of the CSMU:** the shell (titanium) lifts off, then insulation, then a thermal block, then a tiny memory board. Good for INNERWORKS style.
- **Torture-test triptych:** (a) a crash sled with "3.400 g" and a 6.5 ms timer; (b) a furnace at 1,100 °C with a 60-min clock; (c) a pressure chamber with a "≈6.000 m" depth gauge.
- **Loop tape metaphor:** a ring buffer that spins, with old data dissolving at one end. A "2 JAM" ring next to a "25 JAM" ring.
- **Underwater beat:** the box sinks, the pinger activates, sonar rings (1 per second), and a navy diver's hand-held hydrophone (abstract, no real people).
- **Lab beat:** the memory board in a reader, a wireframe aircraft replaying the flight path, and a transcript scroll (generic text only, no real CVR quotes).
- **Outro question:** a deployable recorder ejecting and floating with a satellite beacon. "Masa depan: kotak yang bisa kabur sendiri."

---

## 7. Open questions and unverified items

- **Did the Mi-17V5 carry a CVR?** Only the FDR is reported. Whether its FDR is a CVDR combo is unknown.
- **Mi-17 FDR readout location** (Puspenerbad, the manufacturer, or KNKT help) is not reported.
- **Learjet CVR recovered?** Not found in any article read as of 8 Nov. CNN (5 Nov), PBS (4 Nov) and Fox (6 Nov) items were seen only as headlines (Google News 429 and AP 403 blocked reading).
- **ED-112 test figures** (60 min fire, 260 °C for 10 h, penetration and crush numbers) come only from DE/FR Wikipedia. The EUROCAE document and manufacturer datasheets (L3Harris 404, Honeywell 404, Curtiss-Wright 403, HowStuffWorks 202 challenge, SKYbrary JS challenge) were not read.
- **ICAO Annex 6 text** (the global 90-day ULB rule, the 25 h CVR SARP) was not read directly. Only the EASA rules were seen, via Wikipedia.
- **The FAA 25 h rule compliance date** was not read (the full-text HTML returned empty).
- **Military exemption from ICAO rules** (state aircraft) is general knowledge and was not sourced in this session.
- **Commercial deployable recorders on current airliners** (for example newer Airbus types) are not verified.
- **Baramati (India) Learjet CVR story** (WION) has an unclear date. Not used.
- **Blocked tools:** WebFetch (model error), DuckDuckGo HTML (202 challenge), Google News decode rate-limited (429) after about 12 calls.
