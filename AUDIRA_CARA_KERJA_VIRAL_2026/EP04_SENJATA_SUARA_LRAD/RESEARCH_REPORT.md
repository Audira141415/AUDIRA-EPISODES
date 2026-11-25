# EP 04: Senjata Suara 160 dB: Cara Kerja LRAD

AUDIRA, seri CARA KERJA VIRAL. Created by Agus Dwi R. Status: final dengan voice-over, 6 November 2026.

Riset dari sumber yang dibaca langsung 6 November 2026. Setiap angka memakai label HIGH (dua sumber atau sumber primer) atau MED (satu sumber atau sumber tersier).

# EP04 — Senjata Suara / LRAD (riset, 2026-11-06)

## 1. Viral hook

| Tanggal | Outlet | Judul | URL |
|---|---|---|---|
| 2026-11-02 09:55 WIB | Pontianak Post (Jawa Pos group), by Budi Miank | "Bukan Peluru, Senjata Ini Menyerang dengan Suara hingga 160 Desibel! Begini Cara Kerjanya" | https://pontianakpost.jawapos.com/tekno/2611020023/bukan-peluru-senjata-ini-menyerang-dengan-suara-hingga-160-desibel-begini-cara-kerjanya |
| 2026-11-01 | SlashGear (the Pontianak Post's source) | "Here's How The Military And Police Use Sound As A Weapon" | Google News only; URL not decoded (429) |

**Context:** the Pontianak Post article is a general explainer rewritten from SlashGear. It is **not tied to any one event or country**. It names the 2000 USS Cole attack as LRAD's origin, piezoelectric transducers, directional beams, a range of about 2,000 m (Genasys), and portable, vehicle, ship and helicopter units. The headline's "160 dB" matches the peak SPL of the LRAD 1950XL-RT (see fact 5).

LRAD news from the same period (headlines from Google News RSS; not read in full):
- 2026-10-19 Politiko.al: "It causes disorientation in the crowds, what is LRAD, the device that allegedly arrived from Israel in Rinas?" (Albania, Rinas airport, ahead of protests). 2026-10-20 Vox News Albania: "The debate about the sonic cannons in Rinas and what the case of Serbia shows". **Unverified, allegations only.**
- 2026-10-14 / 10-28 vreme.com (Serbia): "The confession of a member of SNS confirms the research of 'Vreme' about the use of 'sound cannon'" and "...Sound Cannon... are under investigation". Linked to the 15 March 2025 protest in Belgrade.
- 2026-10-20 Tech Times: "LRAD Sound Cannon Causes Permanent Hearing Loss at Protests…".
- 2026-10-08 KPLC 7 (Lake Charles, US): police seek a grant for an LRAD ("150-decibel output").
- 2026-09-15/17: Genasys announces a $1.3M LRAD order from the US National Guard (Defense Post, Yahoo Finance, genasys.com).

## 2. Verified facts

### Origin and maker
1. LRAD grew out of the **USS Cole attack of October 2000**, in which **17 sailors died and 37 were injured**. The US Navy then required an acoustic hailing device. Sources: Genasys "LRAD & Acoustics Overview 2026" PDF, https://cdn.prod.website-files.com/69f39e389b14675d13fd1ce8/6a67b9ff7be6c92aa2467b9b_LRAD-ACOUSTICS-Overview-2026.pdf, and Wikipedia https://en.wikipedia.org/wiki/Long-range_acoustic_device. HIGH.
2. The maker is **Genasys Inc.** It was called American Technology Corporation, renamed LRAD Corporation in 2010 and **Genasys in October 2019**. The LRAD product launched in **2003** (Wikipedia). MED/HIGH.
3. Genasys says LRAD is deployed in **more than 100 countries** and calls it "the de facto standard of Acoustic Hailing Devices" (Overview PDF). HIGH as a manufacturer claim.
4. Genasys says LRAD **focuses sound in a 30° beam**, with voice and tones reaching up to **5,000 m**. The technology is "Driver and Waveguide" (Overview PDF). HIGH.

### Specs from official datasheets (Genasys, 2026 revisions)
| Model | Max peak SPL @1 m (C-wt) | Max continuous @1 m (A-wt) | Beam (−3 dB @1 kHz) | Max range (ideal) | Operational range over 88 dB noise | Weight |
|---|---|---|---|---|---|---|
| 100X (handheld) | 140 dB | 137 dB | ±15° | 600 m | 250 m | 10 kg (incl. battery) |
| 450XL-RT | 150 dB | 145 dB | ±15° | 1,700 m | 500 m | 16.1 kg |
| 500X-RT-MMT (helicopter) | 154 dB | 149 dB | ±15° narrow / ±30° wide | 2,000 m (Overview) | >650 m | — |
| 950NXT | — | 151 dB | ±15° | 3,000 m | 1,250 m | 94.3 kg |
| 1000Xi-RT (US Navy) | 159 dB | 153 dB | ±15° | 3,000 m | 1,250 m | 41.7 kg |
| 1950XL-RT ("Loudest, Longest Range") | **160 dB** | 155 dB | ±15° | 5,000 m | 1,600 m | 43.1 kg (head) |

Datasheet URLs (all HIGH):
- 100X: https://cdn.prod.website-files.com/69f39e389b14675d13fd1ce8/6a79cff5a54030974ae5e960_LRAD-100X_BLK_MAG_DS_QR_D00160-Rev.-K-.pdf
- 450XL-RT: https://cdn.prod.website-files.com/69f39e389b14675d13fd1ce8/6a79cf3729bc8e8d3fb26cbe_LRAD-450XL-RT-DS-D00222-Rev.-E.pdf
- 500X-MMT: https://cdn.prod.website-files.com/69f39e389b14675d13fd1ce8/6a7902b0b2ad1918e654bc44_LRAD-500X_MMT_DS_D00104-Rev.-F.pdf
- 950NXT: https://cdn.prod.website-files.com/69f39e389b14675d13fd1ce8/6ae8b2ce295486f1e5b0b321_LRAD%20950NXT%20DS%20D00248%20Rev.%20D_11.2.26.pdf
- 1000Xi-RT: https://cdn.prod.website-files.com/69f39e389b14675d13fd1ce8/6ae8b224bfb7496e11b03709_LRAD%201000Xi-RT%20DS%20D00239%20Rev.%20D_11.2.26.pdf
- 1950XL-RT: https://cdn.prod.website-files.com/69f39e389b14675d13fd1ce8/6ae8b1c73a89fea950a75476_LRAD%201950XL-RT%20DS%20D00240%20Rev.%20D.pdf

5. The **"160 dB" in the headline is the peak (C-weighted) output of the 1950XL-RT, measured 1 m from the device.** Its continuous output is 155 dBA. The datasheet "ranges" are for **voice communication**, not for injury. HIGH.
6. Genasys says the 100X is "20–30 decibels louder" than a bullhorn or a vehicle PA (Overview PDF). HIGH as a claim.

### Physics of the directional beam
7. AHDs shape sound into a beam through **transducer design and reflective horns**. Directivity is measured at the frequency of peak directionality, **typically 1–2 kHz**. **Low (bass) frequencies are hard to direct**. Source: Wikipedia LRAD. MED.
8. **Directivity parameter ka** (wave number × speaker radius): for LRAD, **ka = 19 at 2.5 kHz**, which predicts a **total beam of about 30°**, as for an ordinary loudspeaker of that size. Wikipedia LRAD (marked *needs update*). MED.
   - Derived calculation (not from a source): at 2.5 kHz, λ = 343/2500 ≈ 0.137 m. ka = 19 gives a ≈ 0.41 m, so the emitter aperture is about 0.8 m across, about 6× the wavelength. A large aperture relative to the wavelength is what makes the beam narrow.
9. **Near field about 8 m.** Large arrays produce interference peaks up to +6 dB, and nulls, inside it. Beyond the near field, sound falls about **6 dB per doubling of distance** (inverse square law). Wikipedia LRAD. MED.
10. **Alert / siren mode** sits at about **2,000–4,000 Hz**, the range where human hearing is most sensitive, so it is the most uncomfortable. Wikipedia LRAD. MED.
11. **The decibel scale:** +10 dB = **10× the sound power/intensity**; +20 dB = 10× the amplitude (pressure). Source: https://en.wikipedia.org/wiki/Decibel. HIGH.
    - Derived calculation: 160 dB compared with 60 dB conversation is 100 dB more, which is 10¹⁰ times the intensity.

### Hearing, pain and health
12. **NIDCD (NIH):** sound at or below **70 dBA** is unlikely to damage hearing. Long or repeated exposure at or above **85 dBA** can. Loud bursts such as gunshots or explosions can rupture the eardrum and cause immediate, permanent loss. Conversation is 60–70 dBA; maximum headphone volume and concerts are 94–110 dBA. https://www.nidcd.nih.gov/health/noise-induced-hearing-loss. HIGH.
13. **NIOSH REL: 85 dBA over 8 hours, with a 3 dB exchange rate** (each +3 dB halves the safe time). **OSHA PEL: 90 dBA over 8 hours (5 dB exchange), action level 85 dBA.** Source: https://en.wikipedia.org/wiki/Permissible_exposure_limit. MED (the CDC/NIOSH page returned 403).
14. **Pain threshold:** Wikipedia LRAD says the ear "can typically stand 120 dB before feeling pain". The American Academy of Audiology (audiologist.org) says LRAD **can cause pain at 110–130 dB SPL at 65 feet (about 20 m)**. It also says the NIOSH/CDC dose range runs from "<2 minutes at 110 dB SPL" to "<1/100,000 s at 162 dB SPL", and that use at 150 dB SPL puts anyone within 100 ft at risk of immediate permanent trauma. Source: https://web.archive.org/web/20210913195305/https://www.audiologist.org/item/crowd-control-with-long-range-acoustic-devices-can-cause-permanent-hearing-loss. MED (advocacy position statement from a professional body).
15. Reported effects: **permanent hearing loss, tinnitus, ruptured eardrums, vestibular problems (dizziness), migraine, nausea**. Police models produce about **137–154 dB** (Wikipedia LRAD; Academy of Audiology). MED.

### Cases and legal status
16. **Pittsburgh G20, 24 September 2009:** this was the first use of LRAD against protesters in the US. **Karen Piper**, a bystander and visiting professor, suffered **permanent hearing loss**. In **November 2012** the city paid **$72,000** to settle her claim and agreed to write an LRAD use policy. Source: ACLU of Pennsylvania, 14 Nov 2012, https://www.aclupa.org/en/press-releases/city-pittsburgh-settles-g-20-lawsuits. HIGH.
17. **NYPD:** the device was used on **5 Dec 2014** (Eric Garner protest). Five protesters and photographers sued, reporting migraine, sinus pain, dizziness and ringing ears. The **2021 settlement** banned NYPD from using the **alert tone** and required LRAD rules. The city paid **$98,000** in damages and **$650,000** in legal fees. Source: Wikipedia LRAD, citing NYT 19 Apr 2021, https://www.nytimes.com/2021/04/19/nyregion/nypd-sound-cannon-protests.html. MED (NYT not read directly).
18. **Serbia, 15 March 2025:** the opposition and rights groups said a sonic weapon was used at an anti-corruption protest in Belgrade. Police, the defence ministry and President Vučić denied it. Source: Wikipedia LRAD and the 2025 Belgrade stampede article. MED (disputed).
19. **Other documented uses:** Australia (NSW Police used it for crowd control for the first time in June 2020), New Zealand (Parliament protest, 2 March 2022, confirmed by OIA), Greek police on the Evros border (2020), the Japanese whaling fleet against Sea Shepherd (2009–2010), Japan Coast Guard against a North Korean fishing fleet (2017), and Changi Airport (bird dispersal). Wikipedia LRAD. MED.
20. **Legal status:** LRAD is **not classed as a defence item and needs no export licence** (Wikipedia, citing earlier reporting). The **ACLU recommends suspending** acoustic weapons at protests (https://www.aclu.org/fact-sheet/acoustic-weapons-fact-sheet, which the script could not read). Genasys notes that FEMA bars grants for "long range acoustic devices with no commercial application", and says its LRADs are commercial products, so grants can be used (https://www.genasys.com/lrad-solutions). MED/HIGH.
21. **Manufacturer position:** Genasys and police say LRAD is a **communication device**. Critics call the alert function a "sound cannon"; the manufacturer rejects the term (Wikipedia LRAD). The Wikipedia article carries a **neutrality dispute** tag (Feb 2026). MED.

## 3. Step-by-step mechanism (for animation)
1. **Signal:** the operator speaks into the microphone or plays an alert tone. An amplifier boosts the electrical signal to hundreds of watts. The 950NXT, for example, draws 450 W in voice mode and 840 W at peak.
2. **Transducer:** a flat face of drivers (Genasys: proprietary "driver and waveguide"; Pontianak Post/SlashGear: piezoelectric) converts electricity into **vibration**, which pushes air into pressure waves.
3. **Large aperture, in phase:** many drivers across a large face (about 0.8 m by the ka calculation) send waves **in phase**. At the side the waves cancel, and straight ahead they reinforce.
4. **Beam:** because the aperture is many times wider than the wavelength (about 14 cm at 2.5 kHz), the sound forms a **beam of about 30° (±15°)**, like a flashlight rather than a lamp. Behind and beside the device it is much quieter.
5. **Near field to far field:** for the first ~8 m there are interference "hot spots" (+6 dB). After that the level falls about 6 dB per doubling of distance: 160 dB at 1 m, about 154 dB at 2 m, about 140 dB at 10 m (inverse-square calculation, ignoring air absorption).
6. **Voice mode:** voice frequencies are kept clear, so a warning can be understood up to 1,600–5,000 m away (datasheet, ideal conditions).
7. **Alert mode:** a 2–4 kHz tone hits the ear's most sensitive range. Up close (tens of metres) it reaches the pain threshold (~120 dB) and can damage the cochlear hair cells, causing permanent hearing loss and tinnitus.
8. **Defence:** turn your body or step out of the beam (it is directional), cover your ears with earplugs or earmuffs, or move away, since each doubling of distance cuts 6 dB.

## 4. Caveats and disputed points
- **"160 dB" is a peak (C-weighted) figure 1 m from the device**, not the level that reaches people. The level falls with distance. Do not say "attacks at 160 dB from 2 km away".
- **Piezoelectric:** Pontianak Post/SlashGear say piezoelectric transducers. Genasys says only "proprietary Driver and Waveguide technology". **Unconfirmed in a primary source.** Use "transducers/drivers" in the narration.
- Genasys calls the beam "30°". The datasheets give "±15° @1 kHz/−3 dB" (the same 30° total). Wikipedia says AHDs generally range from 5–60° and 30–60°. Use "about 30 degrees".
- The Pontianak Post's **"2,000 m"** matches the 500X class. The overview says up to 5,000 m (1950XL-RT). Both are **communication ranges in ideal conditions**.
- The **pain threshold** varies by person and frequency (Wikipedia Threshold of pain). Use "around 120 dB".
- **Albania (Rinas) / Serbia:** allegations only, disputed and officially denied. Do not state them as fact.
- The ka/wavelength numbers and the drop with distance are **derived calculations**, not quotes.
- The NYPD settlement figures come from Wikipedia citing the NYT; the NYT article was not read directly.

## 5. Blocked / not read
- CDC/NIOSH noise page (https://www.cdc.gov/niosh/noise/about/index.html): HTTP 403. The NIOSH REL was taken from Wikipedia.
- ACLU acoustic weapons fact sheet: no text extracted (JS/blocked).
- audiologist.org live page: 404. Read through the Wayback Machine.
- SlashGear (2026-11-01), Politiko.al, Vox News Albania, Vreme, Tech Times: Google News decode hit HTTP 429. Only headlines were seen.
- NYT 2009/2021: not attempted (paywall).
