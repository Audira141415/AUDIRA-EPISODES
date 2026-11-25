# EP 25: 15 Ton Air dari Langit: Cara Kerja Pesawat Bom Air di Karhutla Samarinda

AUDIRA, seri CARA KERJA VIRAL. Created by Agus Dwi R. Status: final dengan voice-over, 9 November 2026.

Riset dari sumber yang dibaca langsung 9 November 2026. Setiap fakta berlabel HIGH, MED, atau LOW; naskah hanya memakai HIGH dan MED.

# EP25 — How water-bombing aircraft work (Australian C-130 over Samarinda): research notes

Research date: 2026-11-09. This file holds research only, not a script.
Method: Google News RSS (Indonesian and English) with links decoded to real URLs through Google's batchexecute endpoint; Bing News RSS as fallback after Google started returning HTTP 429. Article HTML read with Python urllib (browser User-Agent), tags stripped. The primary source for the hook is the **BNPB press release of 6 Nov 2026**, read directly from bnpb.go.id. Deployment details were cross-checked against ANTARA (ID and EN), RRI English and MiGFlug Afterburner (which quotes the Australian Embassy release and BNPB photos). Hotspot context came from Kemenhut SiPongi (via CNBC Indonesia) and BMKG Kaltim (via Tribun Kaltim). Mechanism numbers came from Wikipedia pages (CL-415/DHC-515, Aerial firefighting, Coulson Aviation, MAFFS, Erickson S-64, Helicopter bucket, Phos-Chek) and SEI Industries (Bambi Bucket). Manufacturer and agency pages (De Havilland, Coulson, CAL FIRE, USFS, NWCG, NSW RFS, ATSB, Australian Embassy) returned 403/404/timeouts, so some mechanism numbers rest on secondary sources and are marked.

---

## 1. Viral hook: is it recent?

| Headline | Outlet | Published | URL |
|---|---|---|---|
| "Tiga Kali Water Bombing, Pesawat Australia Mulai Padamkan Karhutla di Samarinda" (primary) | BNPB | **6 Nov 2026**, 17:25 WIB | https://bnpb.go.id/berita/tiga-kali-water-bombing-pesawat-australia-mulai-padamkan-karhutla-di-samarinda |
| "Pesawat pengebom air Australia gempur karhutla di Kaltim" | ANTARA | 7 Nov 2026 | https://www.antaranews.com/berita/5838111/pesawat-pengebom-air-australia-gempur-karhutla-di-kaltim |
| "BNPB and Australian Team Respond to East Kalimantan Fires" | RRI (EN) | 6 Nov 2026 | https://rri.co.id/en/national/2876156/bnpb-and-australian-team-respond-to-east-kalimantan-fires |
| "Australia Sends NSW RFS C-130 Air Tanker to Fight Borneo Fires" | MiGFlug Afterburner | 6 Nov 2026 | https://migflug.com/afterburner/australia-nsw-rfs-c-130-air-tanker-indonesia-kalimantan-fires-2026/ |
| "Australian aircraft begins firefighting operation in Samarinda: BNPB" | ANTARA (EN) | 6 Nov 2026 | https://en.antaranews.com/amp/news/440891/australian-aircraft-begins-firefighting-operation-in-samarinda-bnpb (body did not render) |
| "Pesawat Hercules Australia 3 Kali Lakukan Water Bombing di Kaltim" | Kompas.com | 7 Nov 2026 | Google News only (decode hit 429) |
| "Perkuat Penanganan Karhutla di Kaltim, Pesawat Water Bombing Australia Tiba di Base Ops Lanud Dhomber" | TNI AU | 5 Nov 2026 | Google News only (429) |
| "Bantuan Pesawat Australia Lakukan Water Bombing Karhutla di Kutai Timur" | Koran Jakarta | 8 Nov 2026 | (read via Google News decode) |
| "Pesawat Australia Kembali Bantu Padamkan Karhutla di Kalimantan Timur" | Kompas TV | 9 Nov 2026 | Google News only |
| "Terjadi Lagi Heli Water Bombing Karhutla Jatuh di Kalimantan" | detikNews | 8–9 Nov 2026 | https://news.detik.com/berita/d-8744255/terjadi-lagi-heli-water-bombing-karhutla-jatuh-di-kalimantan |

**Verdict:** very recent (3 days old) and still running. The operation is scheduled for 6–12 Nov 2026, so it is live while the video is made. Dozens of national outlets carried it on 6–9 Nov.

---

## 2. Verified facts

### 2a. The Samarinda operation (high confidence unless marked)

- **Aircraft:** one **Lockheed C-130 Hercules converted as a Large Air Tanker (LAT)**, in **NSW Rural Fire Service** livery. BNPB, ANTARA and RRI all say "Hercules C-130 milik NSW RFS". MiGFlug says BNPB's own Halim photos show **Coulson Aviation and NSW RFS titles**, an Australian flag and the name **"Balder"** on the nose (medium confidence: one secondary source reading photos). It is **not** an RAAF/TNI military transport. Neither government published the registration.
- **Operator:** NSW RFS team (20 people: pilots, flight crew, paramedics). Airframe operated/contracted from **Coulson Aviation** (Canadian air-tanker firm that flies C-130s on contract to NSW RFS each Australian season). Exact ownership/lease terms not published (medium confidence).
- **Second aircraft:** one **Cessna Citation lead plane** (pesawat pemandu). It carries no water. "Dua pesawat" in headlines = 1 tanker + 1 lead plane.
- **Tank:** **up to 15,000 L per sortie** (BNPB, Embassy via MiGFlug). Consistent with Coulson's **RADS** tank family, which holds up to 4,000 US gal ≈ 15,100 L (Wikipedia, Coulson Aviation page). 15,000 L of water ≈ **15 tonnes**.
- **Rate:** planned **up to 6 sorties/day**; target "up to 100,000 L per day" (BNPB head Kristomei via RRI; Embassy "just over 100,000 L/day").
- **Turnaround:** BNPB: about **20 minutes to refill water** after each sortie.
- **Base:** **Lanud Dhomber, Balikpapan** (Sultan Aji Muhammad Sulaiman Sepinggan airport area) as base ops (ANTARA, TNI AU headline). It is a land-based tanker: it fills at the airport, it does not scoop.
- **Timeline:** flag-off at **Halim Perdanakusuma, Jakarta, Thu 5 Nov 2026** by BNPB head **Letjen TNI Kristomei Sianturi** with Australian Ambassador **Roderick (Rod) Bruce Brazier**. First operation **Fri 6 Nov 2026**: morning briefing, then **3 drops by 15:00 WIB** on two fire spots near homes in **Makroman, Kecamatan Sambutan, Kota Samarinda**. Operation planned **6–12 Nov 2026** (7 days).
- **Targets:** four areas — Kota Samarinda, Kutai Kartanegara, Paser, Kutai Timur (ANTARA). Kutai Timur coordinates handed over by 8 Nov (Koran Jakarta).
- **Why Kaltim:** BNPB said Kaltim had the **second-highest hotspot count on 5 Nov, after Central Kalimantan**, and burned area being handled in Kaltim rose **53%** in the 4 Nov report.
- **Request chain:** Kaltim provincial government asked BNPB; BNPB asked Australia (Wagub Seno Aji, ANTARA). Framed as reciprocity for Indonesia's help in Australia's 2019–20 bushfires (Operation Bushfire Assist).
- Unverified claims in ANTARA: burned area being handled "40–50 ha" (Wagub) and the **Australian Prime Minister planning to visit Kaltim on 11 Nov** — single source, do not use.

### 2b. 2026 karhutla context

- Reuters (via MiGFlug): Indonesia's **most intense wildfires in 11 years**, mainly Sumatra, Borneo, Papua; >400,000 ARI cases in 7 provinces as of 2 Nov. AFP citing Nusantara Atlas: **>1.9 million ha burned in the first nine months** (estimate, not official). Medium confidence (second-hand).
- BMKG: **El Niño "sangat kuat"**, rain clouds scarce (CNBC Indonesia, 5 Nov; detikHealth 8 Nov).
- Kemenhut SiPongi, 4 Nov 21:00 WIB: **215 high-confidence hotspots nationally**, up 133 in a day; Kalteng 37 in the six priority provinces.
- BMKG Kaltim, 7 Nov (01:00–17:00 WITA): **325 hotspots in Kaltim** (Kutai Timur 136, Paser 68, Kutai Barat 64; Samarinda 2); only 14 high-confidence. 4 Nov: 484 hotspots. Hotspot ≠ confirmed fire.
- Japan sent ~350 SDF personnel and 3 helicopters (CH-47) to West Kalimantan in September (AFP via MiGFlug).
- **Helicopter accidents (sensitive):** 4 Nov 2026 — TNI AD Mi-17V5 crashed while taking sea water for water bombing near Tanjung Puting, 3 soldiers killed (Dispenad via detik). **7–8 Nov 2026** — BNPB-contracted **Super Puma H225 / EC225LP** crashed into the **Barito River** (Barito Kuala, Kalsel) while **taking water**; 2 Australian pilots survived, Indonesian crew member Yayan Supiansuri died; Kalsel paused helicopter water bombing (Kompas, detik). Not linked to the C-130 operation. Australian Ambassador visited Balikpapan on 9 Nov and referred to it (EksposKaltim headline only).

### 2c. Mechanism facts (sources marked)

- **Scooper amphibians — CL-415 "Superscooper" / DHC-515:** descends to 15 m, skims the water at **70 kt ≈ 130 km/h**, scoops **6,137 L in about 12 s** over a **410 m** run, needs ~**1,340 m** of flyable length, climbs back out; can take partial loads and turn while scooping; pilot selects drop patterns on a water panel; can mix foam (Wikipedia citing Viking/Bombardier specs; high confidence on figures). DHC-515: up to **7,000 L**, refill **14 s** (Wikipedia; medium). De Havilland started first DHC-515 assembly March 2026, first delivery 2028 (Wikipedia; medium). Indonesia's Ministry of Defence announced in **2019** a plan to buy six CL-515s — no evidence found that any were delivered; do not claim Indonesia has them.
- **Land-based tankers:** fill at an airbase. Single Engine Air Tankers ~800 US gal (3,000 L); C-130/737 with Coulson **RADS** up to 4,000 US gal (15,000 L), with a control system that **adjusts flow rate** for accurate drops (Wikipedia Coulson). Largest ever: Boeing 747 Supertanker 74,200 L; DC-10 45,400 L.
- **MAFFS (military C-130 alternative, contrast only):** pressurised pallet tanks, 10,000 L out in ~5 s through tubes out the rear ramp, line ~18 m wide × 400 m long, reload ~8 min (Wikipedia). The Samarinda tanker is **not** MAFFS: RADS is a gravity tank in the belly with computer-controlled doors.
- **Helicopters:** **Bambi Bucket** (SEI Industries, introduced **1982**); helibuckets range 273–9,842 L, valve at the bottom released by crew, can dip in water as shallow as ~30 cm (SEI; Wikipedia). **Erickson S-64 Air-Crane:** fixed tank up to **10,000 L**, refilled in **~45 s** through a 46 cm hose ("snorkel") while hovering; famous name "Elvis" in Australia (Wikipedia).
- **Retardant:** long-term retardant (e.g., Phos-Chek) = water + **ammonium polyphosphate / ammonium phosphates and sulfate** salts + clay/guar gum thickener + **red colourant so crews can see the line** (fades in sunlight; uncoloured/"fugitive" versions exist). The salts change how cellulose burns so it chars instead of flaming; works even after the water dries. Concerns: aquatic toxicity, algae blooms, a USC study found heavy metals in Phos-Chek (Wikipedia; high confidence as summary).
- **Lead plane role:** flies the drop run first, shows the line, checks hazards before the heavy aircraft commits at low level (MiGFlug; standard practice).
- **Peat limit:** water from above knocks down flames and slows spread but **cannot put out smouldering peat** underground (MiGFlug, consistent with the earlier AUDIRA karhutla gambut film).

### 2d. Physics (general, not from a single source; medium-high confidence)

- **"Lompatan" after release:** dropping ~15 t in a few seconds removes a large share of the aircraft's weight. Lift stays the same for a moment, so lift > weight and the nose/aircraft balloons upward; pilots expect it and correct with pitch and power. (C-130H max takeoff weight is roughly 70 t, so 15 t ≈ one-fifth; figure from general knowledge, check before quoting.)
- **Drop height:** large tankers typically drop around **45–60 m (150–200 ft) above the treetops**; scoopers often lower. Commonly cited, not verified from a primary source this session (USFS/NWCG blocked). Say "puluhan meter di atas pucuk pohon".
- **Coverage levels:** US practice grades drops by "coverage level" (gallons per 100 ft²; roughly level 1 light grass to level 6–8 heavy timber/brush). The tank door system opens a set amount for a set time to match the level and the line length. Medium confidence (NWCG PMS 437 blocked).
- **Water falls as rain, not a block:** the column breaks up in air; wind and speed smear it into an elongated footprint.

---

## 3. Mechanism in 7 animation steps (Bahasa Indonesia)

1. **Isi di bandara, bukan di sungai.** Hercules dari Australia ini tanker darat: di Lanud Dhomber Balikpapan, selang mengisi tangki di perut pesawat dengan 15.000 liter air, sekitar 15 ton. Isi ulang sekitar 20 menit.
2. **Sepupunya menyendok sambil terbang.** Pesawat amfibi seperti CL-415 turun ke danau, meluncur di permukaan sekitar 130 km/jam, dua corong kecil di perut terbuka, dan dalam 12 detik 6.000 liter masuk. Lalu naik lagi tanpa mendarat. Helikopter pakai ember gantung atau selang "snorkel".
3. **Pesawat pemandu jalan duluan.** Cessna Citation terbang lebih dulu di jalur jatuh, menandai sasaran dan mengecek kabel, bukit, dan asap.
4. **Turun rendah, lurus, pelan.** Tanker menyusul di ketinggian puluhan meter di atas pucuk pohon, kecepatan dijaga stabil, sayap datar.
5. **Pintu tangki dibuka terukur.** Komputer membuka pintu dengan lebar dan durasi tertentu: bisa sekaligus untuk api kecil yang pekat, atau bertahap untuk garis panjang. Air pecah jadi hujan lebat berbentuk lonjong di tanah.
6. **Pesawat terlonjak.** 15 ton hilang dalam beberapa detik, gaya angkat tiba-tiba lebih besar dari berat, pesawat melonjak naik. Pilot sudah siap menahannya.
7. **Bukan memadamkan, tapi memagari.** Jatuhan diarahkan ke sisi (flank) dan depan (kepala) api untuk memperlambat dan memberi waktu tim darat. Retardan merah (garam fosfat) membuat daun hangus tanpa menyala. Tapi di lahan gambut, bara di bawah tanah tetap harus dipadamkan tim darat.

---

## 4. Myths, traps and caveats

- **"Hercules TNI AU" / "pesawat militer Australia".** Wrong. It is a civilian-converted C-130 air tanker in NSW RFS livery, linked to Coulson Aviation. TNI AU only hosts it at Lanud Dhomber.
- **"Dua pesawat water bombing."** Only one drops water. The second is the Cessna Citation lead plane.
- **"Pesawat menyendok air dari Sungai Mahakam."** No. The C-130 fills at its base (20-min refill). Scooping is the CL-415/DHC-515 family, not this aircraft. Keep the two families clearly separate on screen.
- **"Langsung memadamkan kebakaran."** Air drops slow and cool the fire so ground crews can finish it. BNPB itself frames them as support to ground teams and weather modification.
- **Peat.** Water bombing cannot reach smouldering peat underground. Mention once and point to the earlier AUDIRA karhutla gambut film; do not re-explain.
- **"Air laut tak boleh."** Scoopers and helicopters do use sea water (the Mi-17 that crashed was taking sea water), but salt corrodes airframes and harms soil. Avoid absolute claims either way.
- **Red retardant was used in Samarinda.** No source says retardant was used; all sources say **water** ("15.000 liter air"). Show retardant only as a general-knowledge contrast, labelled.
- **Helicopter crash conflation.** The Barito Super Puma H225 (BNPB-contracted, Australian pilots) and the Mi-17 are separate from the Australian C-130 mission. If mentioned, be respectful, factual, no crash re-enactment.
- **Exact drop height and coverage levels.** Not verified from primary sources this session; use soft wording.
- **"Indonesia sudah punya CL-515."** Only a 2019 announcement; no delivery evidence. Do not claim.
- **"Balder" name and Coulson ownership.** One secondary source reading photos; fine as a visual detail, not as a narration fact.
- **Numbers to quote safely:** 15.000 liter, 6 sorti per hari, ±20 menit isi ulang, 3 kali jatuhan sampai 15.00 WIB 6 Nov, 20 personel, 6–12 Nov.

---

## 5. Hook angles (90-second Indonesian video)

1. **"15 ton air dijatuhkan dari langit, dan pesawatnya justru melompat ke atas."** Physics surprise + news. (Best.)
2. **"Pesawat Australia ini tidak menyendok air dari sungai. Lalu airnya dari mana?"** Myth-buster on the scooping misconception.
3. **"Ada pesawat yang mengisi 6.000 liter air dalam 12 detik, tanpa mendarat."** Scooper wow factor, then contrast with the C-130.
4. **"Kenapa water bombing tidak pernah langsung memadamkan api?"** Strategy angle (flank/head, buy time) + peat limit.
5. **"Tiga kali jatuhan air di Samarinda, 6 November. Begini cara kerjanya."** Straight news hook, AUDIRA cara-kerja tone.

---

## 6. Visual / 3D beat ideas

- **Cutaway C-130:** belly tank glass-walled, water level sloshing; hose filling at Lanud Dhomber; counter 0 → 15.000 L, "≈15 ton".
- **Scooper split-screen:** CL-415 skimming a lake, spray wake, probe close-up, timer 0–12 s, litre counter to 6.137.
- **Helicopter cameo:** Bambi Bucket dipping into a river, snorkel Air-Crane hovering. (No crash imagery.)
- **Lead plane line:** Citation draws a glowing dashed line over the fire; tanker follows on the same rail.
- **Drop moment:** tank doors open as a bar graph (flow rate), water ribbon breaks into droplets, elongated footprint on the ground; plane rises with a "lift > weight" arrow pair (orange up, grey down shrinking).
- **Fire map tactics:** top-down fire shape with head, flanks, heel labelled; drops land on flank and head; ground crew icons close the gap.
- **Retardant inset:** red line ahead of the fire, leaves char but no flame; label "contoh umum, bukan di Samarinda".
- **Peat beat:** cut below ground, embers glowing under wet surface; caption pointer "lihat episode karhutla gambut AUDIRA".
- **Map:** Halim → Balikpapan → Samarinda/Makroman, four target regencies, BMKG hotspot dots (Kutai Timur cluster).
- **Brand-in-scene:** "AUDIRA" stencil on a ground-crew water tank or the HUD drop counter.

---

## 7. Open questions / unverified

- Exact airframe registration and whether the C-130 is "Balder" (Coulson C-130H vs EC-130Q). Not published.
- Tank system variant (RADS-XXL vs other) and exact usable capacity; 15,000 L is the official figure.
- Total drops completed by 9 Nov and whether the operation is extended past 12 Nov.
- Whether any retardant or foam was used (all sources say water).
- Real drop height, speed and coverage level used over Samarinda.
- Australian PM visit to Kaltim on 11 Nov (single ANTARA line).
- "40–50 ha" burned area figure (Wagub, ANTARA) — scope unclear.
- Australian Embassy release text (not retrieved directly; quoted via MiGFlug).

### Failed sources
- bnpb.go.id: first request 404 via script decode, second read OK.
- korankaltim.com (2 articles): encoding error on first try, not re-read.
- en.tempo.co: HTTP 403.
- en.antaranews.com: body did not render.
- Google News decode: HTTP 429 after ~15 requests (TNI AU, Kompas, detik, CNN, Tirto, Gerbang Kaltim, pantau.com, EksposKaltim not read).
- dehavilland.com DHC-515 pages: 404.
- coulsonaviation.com (C-130H, RADS): connection closed.
- fire.ca.gov, fs.usda.gov, nwcg.gov (PMS 437/505), rfs.nsw.gov.au: HTTP 403.
- atsb.gov.au (AO-2020-007 C-130 tanker report): timed out.
- indonesia.embassy.gov.au media release: not found (404 on index; guessed page was unrelated).
