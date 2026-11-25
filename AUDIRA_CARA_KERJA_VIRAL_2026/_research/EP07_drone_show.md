# EP07 — Drone light show: research notes

Research date: 2026-11-06. This file holds research only, not a script.
Method: Google News RSS links were decoded to real URLs and the article HTML was read with Python. Guinness World Records (GWR), EHang, DAMODA and Wikipedia pages were read directly.

---

## 1. Viral hook: is it recent?

| Headline | Outlet | Published | URL |
|---|---|---|---|
| "300 Drone Sulap Langit Banyuwangi di Gandrung Sewu 2026" (on-page title: "300 Drone Meriahkan Gandrung Sewu 2026 Banyuwangi") | Medcom.id, writer A. Firdaus | **Sat 31 Oct 2026, 16:11 WIB** | https://www.medcom.id/gaya/wisata/zNPRpgEk-300-drone-meriahkan-gandrung-sewu-2026-banyuwangi |
| "Dari Langit Banyuwangi, Drone Show Indo Tunjukkan Potensi Teknologi dalam Industri Kreatif Nasional" | Kompas.com Travel (Frensca Renata Pattiselanno / Sri Noviyanti); based on a press release received Fri 30 Oct 2026 | **2 Nov 2026, 08:31 WIB** | https://travel.kompas.com/read/2026/11/02/083100927/dari-langit-banyuwangi-drone-show-indo-tunjukkan-potensi-teknologi-dalam |
| "Drone Fireworks, Salah Satu Kunci Gandrung Sewu 2026 Pukau Puluhan Ribu Penonton" | beritajatim.com | 27 Oct 2026 | Google News RSS item (not decoded) |
| "Drone Show Indo Tunjukkan Potensi Teknologi dalam Industri Kreatif Nasional" | Media Indonesia | 5 Nov 2026 | Google News RSS item (not decoded) |

**Event facts.** Medcom and Kompas agree on all of these:
- **Date:** Saturday **24 October 2026**, at night.
- **Place:** Pantai Boom Marina, Banyuwangi, Jawa Timur.
- **Drone operator:** **Drone Show Indo**. Its director is **Fadel Yasrawi**.
- **Scale:** **300 drones** plus **100 pyrotechnic effects**, in a show called the "Drone Pyro Show".
- **Length:** about **10 minutes**, with **11 formations**.
- **Formations named:** Gunung Ijen, De Djawatan, Kembang Dermo, a Gandrung dancer figure, and the words "Gandrung Sewu".
- **Formations with pyro:** Gunung Ijen, Kembang Dermo, and the "Gandrung Sewu" text.
- **Place in the program:** the drones opened the night, before the colossal dance by **1,300 Gandrung dancers** in glow-in-the-dark costumes.
- **Method:** Fadel says AI-based programming helps optimize formations and flight paths, and simulation is used to reduce safety risk.

**Organizer of Gandrung Sewu:** not stated in the two articles read. Headlines mention Pemkab Banyuwangi and InJourney, but this is not verified.

**Verdict:** **Truly recent.** The event was 13 days before 6 Nov, and coverage ran through 5 Nov 2026. Earlier headlines (14–25 Oct) note that 2026 was the first time Gandrung Sewu was held at night.

---

## 2. Verified facts

### A. Records

1. **Most drones flown at once (current, as found).** **33,615 drones**, flown on **20 May 2026** in Dujiangyan, Sichuan, China, by Yufengzhe Technology (MOVA ecosystem).
   - Reported titles: most drones flying simultaneously under group control; most drones forming an aerial pattern; largest LED mesh flying screen (**148,561 m²**).
   - Sources: VnExpress International, 26 May 2026, https://e.vnexpress.net/news/news/world-s-largest-drone-cluster-turns-sichuan-skies-into-living-digital-canvas-5078653.html; CGTN, 25 May 2026 (says it set GWR titles for "the largest simultaneous drone flight and the largest aerial pattern").
   - Confidence: **MED**. No GWR page for this record was found or read.
2. **EHang: 22,580 drones, 3 February 2026, in Hefei.** EHang GD4.0 drones; shown at the CMG Spring Festival Gala.
   - GWR title: "most multirotor/drones airborne simultaneously **from a single computer**". This is a different title wording from item 1.
   - Source: https://www.ehang.com/news/1346.html (EHang press release, 16 Feb 2026)
   - Confidence: **HIGH** for EHang's own claim.
3. **Most drones launched in a week: 71,207**, by Sky Elements with Damoda America, 27–30 Sep 2026, in Blue Ridge, Texas.
   - Each show used about 10,200 drones.
   - The same team set the record for the largest aerial display of a mythical creature: a dragon of **10,183** drones on 28 Sep 2026.
   - The previous week record was 55,939, by Aerial Illuminations and UVify.
   - Source: https://www.guinnessworldrecords.com/news/commercial/2026/10/texan-night-sky-lit-up-with-over-70000-drones-during-record-breaking-aerial-performance (GWR, 6 Oct 2026)
   - Confidence: **HIGH**.
4. **Earlier milestones,** from Wikipedia "Drone art": **1,218** drones at the 2018 Winter Olympics opening (a record at the time); a GWR record of **3,051** flown simultaneously; **10,197** from a single computer system.
   - Source: https://en.wikipedia.org/wiki/Drone_art
   - Confidence: **MED**.

### B. Hardware and positioning (manufacturer specs: DAMODA, which holds a 36.42% market share per its own site)

5. **DAMODA V4 show drone.**
   - Size **308 × 308 × 124 mm**, weight **565 g**.
   - **RGBW** lights, light power **24 W**.
   - Positioning by **RTK (GPS / GLONASS / BDS)**, accuracy **8 mm horizontal and 15 mm vertical** under normal RTK operation.
   - Wind limit **8 m/s**. Cruise speed during a show **10 m/s**.
   - **Suggested show time: within 15 min.**
   - Communication range **2 km**. Redundant links over **5G WiFi and 2.4G radio**.
   - **Auto parachute** that opens at **30–60 m**.
   - Ground space needed: **250 m² per 1,000 drones**.
   - Drones launch from and recharge in docking cases of **24** drones each, with **40–60 min** between reflights.
   - Source: https://www.damoda.com/products/v4.html
   - Confidence: **HIGH** for the manufacturer's spec.
6. **DAMODA L3 show drone.**
   - **Minimum flight spacing 1.4 m** (down to 1.2 m in extreme conditions).
   - Hover time **≤32 min**. **Maximum performance time 15 min** with no payload (22 min with the long-endurance battery). **8–12 min** suggested with an 80 g payload such as fireworks.
   - Radio controller range **1 km**, Wi-Fi range **500 m**.
   - **Built-in Remote ID.**
   - Source: https://www.damoda.com/products/l3.html
   - Confidence: **HIGH**.
7. **EHang GD4.0.** "Up to 45 minutes of flight time", "centimeter-level positioning accuracy", and box launching.
   - Source: https://www.ehang.com/news/1346.html
   - Confidence: **HIGH** (manufacturer claim).
8. **How RTK works.** A fixed **base station** on the ground measures the **phase of the satellite carrier wave**. It sends corrections, usually over a UHF radio modem, to the moving receivers ("rovers"), which reach **centimetre-level accuracy**.
   - For comparison, the GPS L1 carrier wavelength is about **19 cm**.
   - Source: https://en.wikipedia.org/wiki/Real-time_kinematic_positioning
   - Confidence: **MED** (Wikipedia, but standard textbook material).
9. **Communication network.** The 33,615-drone show used its own **local area network (LAN)** with **under 20 ms latency**, built to avoid interference between drones. It was rated for wind up to "Level 6".
   - Source: VnExpress (citing local media).
   - Confidence: **MED**.
10. **Safety incident.** In **December 2024**, at a 500-drone show in Orlando, Florida, missing flight-path information caused drones to collide and fall. One drone hit a 7-year-old boy, who needed open-heart surgery.
    - Source: https://en.wikipedia.org/wiki/Drone_art
    - Confidence: **MED**.
11. **Design workflow** (Drone Show Indo's own description): visual concept, then formation design, then motion sync with the pyro, then flight-safety planning. AI algorithms generate and optimize formations and plan flight paths automatically, and simulation tests the show before it flies.
    - Source: the Kompas.com and Medcom.id articles above.
    - Confidence: **HIGH** that this is the company's claim.

---

## 3. Mechanism in 7 animation steps (Bahasa Indonesia)

1. **Gambar dulu di komputer.** Desainer membuat animasi 3D: Gunung Ijen, bunga, penari. Tiap titik cahaya dalam animasi = satu drone.
2. **Software membagi tugas.** Algoritma memberi tiap drone jalur sendiri (koordinat + waktu + warna). Jalur dihitung supaya drone tidak bertabrakan dan tetap berjarak sekitar 1,4 m atau lebih.
3. **Drone kecil berlampu.** Tiap unit adalah quadcopter kira-kira setengah kilo dengan lampu LED RGBW sekitar 24 W. Drone ini tidak "melihat" gambar; ia hanya menjalankan naskah terbang.
4. **GPS saja tidak cukup.** Stasiun RTK di darat membandingkan fase gelombang satelit lalu mengirim koreksi lewat radio. Posisi drone jadi akurat sampai skala sentimeter, bahkan milimeter (DAMODA mengklaim 8 mm horizontal).
5. **Satu komando, ratusan pesawat.** Stasiun darat memberi aba-aba "terbang" serentak lewat jalur radio/Wi-Fi cadangan, lalu semua drone memakai jam yang sama. Itu sebabnya lampu berganti warna kompak.
6. **Pagar virtual dan rem darurat.** Kalau sinyal hilang atau baterai kritis, drone keluar formasi dan mendarat atau pulang. Beberapa model punya parasut otomatis.
7. **Baterai yang membatasi.** Satu pertunjukan biasanya maksimal sekitar 15 menit. Gandrung Sewu sekitar 10 menit untuk 11 formasi, lalu drone mendarat kembali ke kotaknya.

---

## 4. Caveats and disputed points

- **The record depends on the title.** 33,615 is "simultaneous under group control" (May 2026). 22,580 is "from a single computer" (Feb 2026). 71,207 is "launched in a week".
  - Safe line: "rekor dunia lebih dari 33 ribu drone sekaligus (Mei 2026, Tiongkok)". Flag it as MED, since no GWR page was read.
- **The Banyuwangi drone model is not disclosed.** Neither article names the drone hardware or confirms RTK.
  - DAMODA specs are a *typical example*, not the Banyuwangi fleet. Say "drone pertunjukan seperti ...", not "drone Banyuwangi memakai ...".
- **Battery time.** The brief assumed 15–20 min. Manufacturer data supports about **15 min max show time** (DAMODA V4/L3), with hover time up to 32–45 min. Keep the show-time figure at "sekitar 15 menit".
- **Spacing.** The brief assumed 1.5–3 m. The only verified figure is DAMODA L3's **1.4 m minimum** (1.2 m in extreme cases). No source for a 3 m spacing was read.
- **Geofence.** The specific term "geofence" was not in the pages read. Verified safety features are parachute, one-click termination, redundant links, and Remote ID. Say "batas terbang/fitur keselamatan", or treat geofence as general knowledge, unsourced.
- **Gandrung Sewu organizer.** Not verified in the articles read. Do not state it.
- **Crowd size.** The beritajatim headline says "puluhan ribu penonton". The article was not read and the figure is unverified.

## 5. Blocked or unread sources

- WebFetch: broken (model error). Pages were read with curl and Python.
- vergeaero.com: connection failed (HTTP 000).
- highgreat.com: SSL handshake failure.
- No GWR record page was found for the 33,615 record. Only news coverage (VnExpress, CGTN) was read.
- beritajatim, Media Indonesia, detik and TIMES Banyuwangi Gandrung Sewu articles were not opened. Only their headlines were seen.
