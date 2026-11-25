# EP 18: Kereta Cepat 300 km/jam: Bagaimana Keselamatannya Dijaga?

AUDIRA, seri CARA KERJA VIRAL. Created by Agus Dwi R. Status: final dengan voice-over, 9 November 2026.

Riset dari sumber yang dibaca langsung 9 November 2026. Setiap fakta berlabel HIGH, MED, atau LOW; naskah hanya memakai HIGH dan MED.

# EP18 — How a 300 km/h train is kept safe: research notes

Research date: 2026-11-09. This file holds research only, not a script.
Method: Google News RSS (English, Spanish, Indonesian). Links were decoded to real URLs through Google's batchexecute endpoint, and article HTML was read with Python urllib. Wikipedia text came from the MediaWiki API. AP News and Europa Press returned HTTP 403, so they were not read. No official AITAT PDF was read directly. AITAT report content below comes from elDiario.es and RTVE, which quote it.

---

## 1. Viral hook: is it recent?

| Headline | Outlet | Published | URL |
|---|---|---|---|
| "Tanggung jawab dan harga diri, menteri di Spanyol mundur usai ada kecelakaan kereta" | ANTARA News Bali | 4 Nov 2026 (Google News date) | https://bali.antaranews.com/berita/417875/tanggung-jawab-dan-harga-diri-menteri-di-spanyol-mundur-usai-ada-kecelakaan-kereta |
| "Spanyol Minta Bantuan Uni Eropa Selidiki Tabrakan Kereta Cepat yang Tewaskan 69 Orang" (via Xinhua) | NTVNews.id | 5 Nov 2026 | https://www.ntvnews.id/news/01124717/spanyol-minta-bantuan-uni-eropa-selidiki-tabrakan-kereta-cepat-yang-tewaskan-69-orang |
| "Spanish transport minister resigns days after deadly train crash" | BBC | 3 Nov 2026 | https://www.bbc.com/news/articles/c6wydqd4yxdyo |
| "What caused the deadly train crash in Spain? What we know so far" | CNN | 28 Oct 2026 (updated 30 Oct) | https://www.cnn.com/2026/10/28/europe/spain-train-crash-cause-what-we-know-intl |
| "¿Qué falló en Urda para que un AVE embistiera a otro tren que había avisado de que estaba parado?" | RTVE | 29 Oct 2026 | https://www.rtve.es/noticias/20261029/fallo-urda-ave-embistiera-otro-tren-avisado-parado/17288771.shtml |
| "Qué dice el segundo informe sobre el accidente ferroviario de Urda" | elDiario.es | 1 Nov 2026 | https://www.eldiario.es/castilla-la-mancha/provincias/toledo/dice-segundo-informe-accidente-ferroviario-urda_1_13630575.html |
| "EU prosecutor office investigates fatal train crash in Spain" | Al Jazeera | 7 Nov 2026 | https://www.aljazeera.com/news/2026/11/7/eu-prosecutor-office-investigates-fatal-train-crash-in-spain |

**Verdict: the hook is fresh.** The crash happened on **28 Oct 2026**, 12 days before this research. The minister resigned on 3 Nov, the ERA was asked for help on 4 Nov, and the EU fraud probe started on 6 Nov. Coverage was still running on 8 Nov (hospital updates). **The cause is not officially determined.** The technical investigation (AITAT) keeps "all hypotheses open". The judicial investigation is sealed.

**Naming trap: the investigator is no longer "CIAF".** Spain's rail investigator is now the **AITAT** (Autoridad Administrativa Independiente para la Investigación Técnica de Accidentes e Incidentes Ferroviarios, Marítimos y de Aviación Civil), set up by **Ley 2/2024 of 1 August**. Its rail branch is the "Dirección de Investigación Técnica de Accidentes e Incidentes Ferroviarios". Do not say CIAF on screen. elDiario writes both "AIAT" and "AITAT"; CNN writes "AITAT".

---

## 2. Verified facts

### A. The Urda collision (28 Oct 2026)

1. **What, where, when.** On Wednesday **28 Oct 2026**, a Renfe AVE ran into the rear of a stationary Iryo train on **track 2 of the Madrid–Seville high-speed line**, at **kilometre point 118**, at the entry to Urda station (Toledo province). AITAT puts the impact at **08:53**. Wikipedia says 08:54 and puts the site in the municipality of **Los Yébenes**, near the Urda PAET (passing loop). Iryo sources told RTVE the impact was at 08:48.
   - Source: elDiario.es (quoting the AITAT report); RTVE; Wikipedia "2026 Urda train collision". Confidence: **HIGH** for date, line and place. Exact minute **MED** (sources disagree).
2. **Trains.**
   - **Iryo 6076**, a Hitachi **ETR 1000** (Frecciarossa 1000), unit 109.015, 8 cars, **147 passengers + 5 crew**. It was stopped at entry signal **E242**.
   - **Renfe AVE 2080**, a **Siemens Velaro (series 103)**, unit 103.006, 8 cars, 7 crew.
   - Both left Madrid Atocha for Seville Santa Justa: the Iryo at 07:54, the AVE at 08:00.
   - Source: elDiario.es (AITAT); ABC; RTVE. Confidence: **HIGH**.
   - **Trap:** the AVE passenger count is **397** (BBC, ABC, Wikipedia) or **379** (elDiario's reading of the report). Say "hampir 400 penumpang".
3. **Death toll: 69.** One update raised it to 74; AITAT then corrected it back to 69 (La Voz del Tajo, 29 Oct). All 69 are identified. The victims are 40 men and 29 women, all adults. The nationality split varies by source: 54 Spanish and 15 foreign (RTVE, 3 Nov) or 51 and 18 (Wikipedia). Injured: "more than 200" (AITAT via elDiario; ANTARA "sekitar 200").
   - Source: RTVE; elDiario; BBC; NTVNews. Confidence: **HIGH** for 69.
4. **Collision speed: 160–200 km/h**, an AITAT estimate. It is still to be confirmed from the on-board event recorders, which the Guardia Civil holds under the Orgaz court.
   - Source: elDiario (AITAT); CNN. Confidence: **HIGH** that this is the estimate. It is not a final figure.
5. **Sequence (preliminary, per minister and AITAT).**
   - **08:30–08:31:** the **LZB** automatic train protection system failed after a computer or communications fault. It went down over about **63 km**; Wikipedia says 64 km.
   - The trains stopped **automatically**, about six of them. The AVE and the Iryo were about **25 km apart**.
   - Traffic moved to degraded mode under **BSL** (Bloqueo de Señalización Lateral, the lineside-signal block), with orders given by recorded phone message (*telefonema*).
   - **08:36:** the Atocha control centre told the AVE driver to reset the LZB and resume "**marcha normal**". The driver asked "At normal speed?" and was told "Yes".
   - The Iryo driver reported that she could not restart the system and was still stopped in front of the entry signal.
   - Source: BBC (leaked audio); RTVE; CNN; Quo/elDiario. Confidence: **HIGH** that the audio exists and says this. Who knew what and when is **under investigation**.
6. **The rule that should have applied.** With a stopped train ahead or a red signal, the procedure is **"marcha a la vista" (on-sight running) at a maximum of 40 km/h**, so the driver can stop short of any obstacle.
   - Source: The Conversation; RTVE; Quo/elDiario; Diario AS. Confidence: **HIGH** (consistent across sources).
7. **Minister's words.** Óscar Puente called the decision to let the AVE proceed at normal speed "inexplicable". CNN reports that he blamed both a computer system failure and apparent human error.
   - Source: CNN; Guardian; BBC. Confidence: **HIGH** that he said it. It is **not** an official finding.
8. **AITAT preliminary line.** In the report's words, "the chain of failures, instructions and actions would have caused a collision, and the necessary mitigation measures would not have worked". AITAT says the full investigation must still analyse causes, LZB malfunctions, and environmental, organisational and procedural factors.
   - Source: elDiario.es; RTVE. Confidence: **HIGH**.
9. **The AVE driver died.** Renfe driver **Antonio Acedo** was killed. Spanish media report he tried to brake; Wikipedia says he applied the emergency brake on seeing the Iryo. Two Iryo crew members also died (Wikipedia only).
   - Source: Heraldo, La Vanguardia, El Periódico headlines (29 Oct); Wikipedia. Confidence: **HIGH** for the death, **MED** for the braking detail. Do not name him in the video.
10. **Resignations and EU involvement.**
    - Puente resigned on **3 Nov**, citing "political dignity" after two accidents in under a year.
    - Adif president Luis Pedro Marco de la Peña quit the next day.
    - Carlos Cuerpo became acting minister.
    - On **4 Nov**, AITAT asked the **European Union Agency for Railways (ERA)** for technical support. Commissioner Tzitzikostas said the investigation "remains completely under the authority and direction of the Spanish investigators" and that it is "too early to draw conclusions".
    - Source: BBC; Al Jazeera; ElConstitucional; NTVNews. Confidence: **HIGH**.
11. **Separate fraud probe.** On 6 Nov the EPPO (European Public Prosecutor's Office) searched Adif, the safety agency AESF and the Court of Auditors. The probe concerns possible fraud in EU funds for upgrading **signalling and communications** on Madrid–Seville. This is **not** a finding about the crash cause.
    - Source: Al Jazeera; BBC; Euronews. Confidence: **HIGH**.
12. **New measures (3 Nov).** In degraded mode (no LZB/ERTMS), a **second controller must validate** every order. Other measures: fewer trains on the line, finishing **ERTMS Level 2** on Madrid–Seville, and new control software. Renfe had already capped speed at 40 km/h after any LZB failure.
    - Source: RTVE. Confidence: **HIGH**.
13. **Context: the third deadly crash this year.** Adamuz (Córdoba), **18 Jan 2026**, killed **46**. That crash also involved an Iryo ETR 1000 and a Renfe train on the same corridor; a preliminary report points to track or weld defects. A crash near Barcelona (Gelida) killed a driver.
    - Source: Guardian; CNN; NTVNews; ABC. Confidence: **HIGH**.

### B. Mechanism (signalling and protection)

14. **Why lineside signals fail at speed.**
    - German distant signals sat **1,000 m** before main signals, enough to stop from about 160 km/h.
    - At **200 km/h** a train needs about **1,543 m** (Wikipedia) or "more than 1,500 m" (Quo).
    - The driver also has too little time to read a signal in rain or fog.
    - The fix was to bring the signal **into the cab**.
    - Source: Wikipedia "Linienzugbeeinflussung"; https://quo.eldiario.es/tecnologia/q2610574406/asi-funciona-el-lzb-el-sistema-que-se-cayo-minutos-antes-del-choque-de-urda. Confidence: **HIGH**.
15. **Braking from 300 km/h takes about 5 km and 100 seconds** (a Renfe social-media video, cited by AS and 20minutos). The same sources give about 1 km from 100 km/h for a conventional train. The State Railway Safety Agency (AESF) publishes the calculation method, which depends on speed, mass, brakes, gradient and adhesion. Physics check: stopping from 83.3 m/s in 100 s at constant deceleration covers about 4.2 km, so "4–5 km" is consistent.
    - Source: https://as.com/actualidad/sociedad/cuantos-kilometros-necesita-un-tren-para-poder-frenar-asi-aumenta-la-distancia-de-frenado-en-la-red-ferroviaria-f202610-n/ ; https://www.20minutos.es/nacional/cuantos-metros-necesita-tren-alta-velocidad-para-frenar_7054917_0.html. Confidence: **MED** (one Renfe source relayed by two outlets; the figure is described as approximate).
16. **How LZB works.**
    - Two cables run between the rails and cross every **100 m**. The train detects each phase flip and uses it as a position marker.
    - Control centres each cover **30–40 km**. They send "telegrams" **1–5 times per second**.
    - The cab shows actual speed, permitted speed, and a target speed and distance that can look **several km** ahead. Wikipedia says up to **13 km**.
    - An occupied block ahead equals target speed zero.
    - About **+5 km/h** over the limit sounds a warning; just under **+9 km/h** triggers the **emergency brake automatically**.
    - Three computers cross-check each other.
    - LZB runs on Madrid–Seville since **1992**.
    - Source: Quo/elDiario; Wikipedia. Confidence: **HIGH** for the architecture, **MED** for the km/h thresholds (Quo only).
17. **Fail-safe, then degraded mode.** When LZB telegrams stop, trains get "meta cero" (target speed zero) and stop. Puente said this first barrier worked on 28 Oct. After that, safety depends on lineside signals, track circuits, the older **ASFA** spot system and **human orders**.
    - Source: Quo/elDiario; Wikipedia. Confidence: **HIGH**.
18. **Block sections.** Signalling systems divide track into **blocks, each allowed only one train at a time**. If LZB fails, two trains in different LZB blocks can end up in the **same, longer BSL block**. Procedures exist for exactly that case: target speed 000 or 040 shown on board, and permission "only on sight".
    - Source: The Conversation; Wikipedia (Urda article, background). Confidence: **HIGH** for the block principle, **MED** for the 000/040 detail.
19. **Europe's patchwork.** The EU has **more than 25 non-interoperable national signalling systems** (LZB, Crocodile, BACC, ASFA, and others). **ERTMS/ETCS** is meant to replace them **by 2050**. In Spain, Madrid–Barcelona and Madrid–Levante already run ERTMS; Madrid–Andalusia is the only line still on LZB.
    - Source: The Conversation, 29 Oct 2026. Confidence: **HIGH**.
20. **ETCS levels.**
    - **Level 1:** **Eurobalises**, transponders fixed between the rails, pass the signal aspect at fixed points. The on-board computer computes a **braking curve** and supervises speed.
    - **Level 2:** movement authority comes **continuously by radio (GSM-R)** from a **Radio Block Centre (RBC)**. Balises become "electronic milestones" for position, and lineside signals can be dropped.
    - **Level 3:** moving block, now merged into Level 2 as an option (Regulation 2023/1695).
    - Source: Wikipedia "European Train Control System". Confidence: **HIGH** (well established; ERA site not read).
21. **Whoosh uses CTCS-3.**
    - CRSC's Liu Jieping said Jakarta–Bandung is the first line outside China to use **CTCS level 3**.
    - KCIC lists **CTCS-3/GSM-R**, CTC, TDMS, SCADA and interlocking.
    - CTCS-3 uses balises, track circuits as backup, GSM-R and an RBC that issues movement authority. It is described as equivalent to ETCS Level 2, with CTCS-2 as fallback.
    - Source: https://kalteng.antaranews.com/berita/657867/kereta-cepat-jakarta-bandung-kali-pertama-gunakan-ctcs-3-di-luar-china (29 Sep 2023); Satumedia (KCIC, 4 Mar 2026); Wikipedia "Chinese Train Control System". Confidence: **HIGH** for CTCS-3 on Whoosh, **MED** for the internal details.
22. **Whoosh speed and train.** Maximum **operating speed 350 km/h**; KCIC400AF (a CR400AF derivative) design speed 420 km/h; line about 142–143 km; test top speed **385 km/h** on 22 Jun 2023.
    - Source: Wikipedia "High-speed rail in Indonesia"; ANTARA (142.3 km). Confidence: **HIGH** for 350, **MED** for 385.
23. **Whoosh hazard sensors (KCIC, March 2026).**
    - **17 wind-speed sensors, 8 rainfall sensors, 6 foreign-object detectors, 7 EEWMS earthquake early-warning units**, and **1,846 CCTV cameras**.
    - The RDMS system automatically imposes speed limits or stops trains when thresholds are exceeded.
    - EEWMS triggers **emergency braking and red signals** on detecting an earthquake.
    - A comprehensive inspection train runs before daily service.
    - Source: https://www.satumedia.id/news/23390/angkutan-lebaran-operasional-whoosh-dipantau-1-846-cctv-dan-sensor-gempa/ ; KabarSDGs. Confidence: **MED-HIGH** (KCIC press statement relayed by two outlets).

### C. Historical background (optional)

24. **Angrois / Santiago de Compostela, 24 Jul 2013.** An Alvia entered an 80 km/h curve at about 179–195 km/h; **79 died** (once reported as 80). The high-speed section had ERTMS, but the curve sat on a stretch protected only by the older **ASFA**. Afterwards Adif added ASFA balises enforcing 160/60/30 km/h. In July 2024 the driver and Adif's safety director were convicted.
    - Source: Wikipedia "Santiago de Compostela derailment"; Al Jazeera (79). Confidence: **MED**.

---

## 3. Mechanism, step by step (for the script)

1. **Physics problem.** At 300 km/h a train needs about 4–5 km and about 100 s to stop. The driver cannot see that far.
2. **Blocks.** The line is cut into blocks. One train per block, and an occupied block means stop.
3. **Signal in the cab.** Instead of reading poles, the train receives a "movement authority": how far it may go and how fast. LZB uses cables in the track; ETCS L1 uses balises; ETCS L2 and CTCS-3 use balises plus GSM-R radio from an RBC.
4. **Braking curve.** The on-board computer draws a curve from current speed down to the end of the authority. If the driver goes above the curve, the system warns and then **brakes by itself** (LZB: warning at about +5 km/h, emergency brake under +9 km/h).
5. **Fail-safe.** If data stops arriving, trains are given target speed zero and stop. This worked at Urda.
6. **Degraded mode is the weak point.** Without automatic protection, the system falls back to lineside signals, phone orders and the 40 km/h on-sight rule. Here humans are the last barrier. Spain's new two-controller rule targets exactly this.
7. **Nature sensors** (Whoosh example): wind, rain, objects on the line and earthquakes feed into automatic speed limits or emergency braking.
8. **Payoff:** "Kereta cepat aman bukan karena masinisnya super, tapi karena ada sistem yang tidak membiarkan masinis salah, dan aturan ketat saat sistem itu mati."

---

## 4. Myths and traps (the script must NOT claim)

- **Do not state a cause as fact.** The cause is undetermined, AITAT keeps all hypotheses open, and the judicial case is sealed. Say "investigasi awal menyebut rantai kegagalan sistem dan instruksi; penyebab resmi belum ditetapkan".
- **Do not blame a named person.** Do not blame the controller, a driver or the "operator Adif". Unions demanded presumption of innocence, and the controller has not been charged in any source read.
- **Do not say "the train's automatic brakes failed".** LZB did its fail-safe job and stopped trains. The danger came after, in degraded mode.
- **Do not say "ERTMS would have prevented it".** That is expert opinion (The Conversation headline: "may have caused"), not a finding.
- **Do not link the EU fraud probe to the cause.** It concerns funding.
- **Do not say "CIAF".** The investigator is AITAT.
- **Do not give 74 deaths** (corrected to 69). The AVE passenger count is 397 vs 379, so round it.
- **Do not say the trains crashed at 300 km/h.** The estimate is 160–200 km/h, and the line limit there was cited as up to 200 km/h by RTVE.
- **Do not say "Whoosh uses ETCS"** or claim a Whoosh braking distance. No source gives one; use the generic "kira-kira 5 km dari 300 km/jam (Renfe)".
- **Do not imply Whoosh is unsafe or "safer than Spain".** No comparison data.
- **No gore, no victim names, no crash footage.** The judge banned taking or sharing images of the site.

---

## 5. Hook angles (90 s, Indonesian, respectful)

1. "Di 300 km/jam, kereta butuh sekitar 5 kilometer untuk berhenti. Lalu bagaimana masinis tahu ada kereta lain di depan yang belum kelihatan?"
2. "Dua minggu lalu, 69 orang meninggal di Spanyol saat sistem pengaman otomatis kereta cepat mati. Begini cara sistem itu seharusnya menjaga kita." (State the cause carefully.)
3. "Masinis kereta cepat hampir tidak melihat lampu sinyal. Sinyalnya ada di dalam kabin. Ini alasannya."
4. "Rel kereta cepat dipotong jadi 'kotak-kotak' tak terlihat, dan satu kotak hanya boleh diisi satu kereta."
5. "Whoosh punya 7 detektor gempa dan 17 sensor angin yang bisa menghentikan kereta tanpa menunggu manusia."
6. "Saat komputer pengaman mati, aturannya cuma satu: maksimal 40 km/jam dan siap berhenti kapan saja."

Best: **#1 opening, then #2 as context** (fact-first, news second, mourning tone).

---

## 6. Visual / 3D beat ideas (generic trains, no crash imagery)

- A stylised white bullet train (no Renfe, Iryo or KCIC liveries) on an endless track. The camera rises to show a **5 km braking ribbon** painted ahead.
- Track sliced into glowing **block segments**: a red block ahead of a parked train, green behind.
- **Cab DMI close-up:** actual speed vs permitted speed vs target distance. The braking curve draws itself, the speed needle crosses it, and the auto-brake icon flashes.
- **Balise pulses** on the sleepers as the train passes; **radio waves** to an RBC tower (ETCS L2 / CTCS-3).
- **Fail-safe beat:** data lines go dark, every train's target drops to "0", trains glide to a stop. Then the "40" on-sight sign appears and two controller silhouettes both press "validate" (Spain's new rule).
- **Hazard sensors along a viaduct** (wind sock, rain gauge, seismograph trace, object sensor) that turn a signal red.
- Memorial beat: a quiet map pin at Toledo province with "28.10.2026 · 69", soft light, no wreckage.
- Style ideas: DRAFTFORGE (blueprint curves), CYBERFORGE (DMI HUD), DATAPHYSICAL (braking-distance bars).

---

## 7. Open questions / unverified

- The exact impact time (08:48 / 08:53 / 08:54) and whether the Iryo was ever authorised to move. Iryo sources say not.
- Why the controller was not told, or did not act, during the 7–12 or 17 minutes after the Iryo reported it was stopped.
- What caused the LZB failure over 63 km, and why the Iryo could not reset.
- Recorder data (true impact speed, braking point): pending.
- Whether ETCS L2 on this line would have changed the outcome: opinion only.
- Angrois details (ERTMS/ASFA boundary): Wikipedia only.
- An official ERA page on ETCS levels and an official KCIC page on CTCS-3: not read directly.
- The KCIC sensor counts date from March 2026 and may have changed.
