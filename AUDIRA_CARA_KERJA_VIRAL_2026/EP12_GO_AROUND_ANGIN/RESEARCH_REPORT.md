# EP 12: Batal Mendarat Saat Angin Kencang: Cara Kerja Go-Around

AUDIRA, seri CARA KERJA VIRAL. Created by Agus Dwi R. Status: final dengan voice-over, 8 November 2026.

Riset dari sumber yang dibaca langsung 8 November 2026. Setiap fakta berlabel HIGH, MED, atau LOW; naskah hanya memakai HIGH dan MED.

# EP12 — Go-around in a crosswind (SQ213, Perth): research notes

Research date: 2026-11-08. This file holds research only, not a script.
Method: Google News RSS (English and Indonesian) was searched for the incident. Links were decoded to real URLs and the article HTML was read with Python. Background sources were PDFs read with pdftotext: the FAA Airplane Flying Handbook, the FSF ALAR briefing notes, the FSF go-around report and a NASA paper. Perth weather came from the archived METARs in the Iowa Environmental Mesonet (IEM) and from BOM daily observations. WebSearch and WebFetch were broken (model error), and the SKYbrary article pages are behind a JS bot check that was not bypassed. Background searches used DuckDuckGo HTML.

---

## 1. Viral hook: is it recent?

| Headline | Outlet | Published | URL |
|---|---|---|---|
| "Dramatic footage shows Singapore Airlines passenger plane abandoning Perth Airport landing in scary near-miss" (Taylor Renouf) | The West Australian | **Sat 31 Oct 2026, 8:35 PM AWST** (first report) | https://thewest.com.au/news/aviation/dramatic-footage-shows-singapore-airlines-passenger-plane-abandoning-perth-airport-landing-in-scary-near-miss-c-23098523 |
| "SIA plane tilts during Perth landing attempt amid strong winds, pilots perform go-around" | CNA | 1 Nov 2026, 23:16 SGT | https://www.channelnewsasia.com/singapore/sia-plane-perth-abandon-landing-go-around-6511026 (body did not parse; the headline is from RSS) |
| "SIA pilots win praise online for safe landing in Perth amid strong winds" (Daniel Lai; source: The Straits Times) | Yahoo News SG / Straits Times | 1 Nov 2026 | https://sg.news.yahoo.com/sia-pilots-win-praise-online-161500487.html |
| "Singapore Airlines Pilots' Dramatic Perth Landing Goes Viral After Go-Around in Strong Winds" | Aviation A2Z | 2 Nov 2026 | https://aviationa2z.com/index.php/2026/11/02/singapore-airlines-pilots-dramatic-perth-landing-goes-viral-after-go-around-in-strong-winds/ |
| "Tuai Pujian, Viral Aksi Heroik Pilot SQ Hadapi Angin Kencang Bandara Perth" (Muhammad Lugas Pribady) | detikTravel | **Mon 2 Nov 2026, 22:12 WIB** | https://travel.detik.com/travel-news/d-8735416/tuai-pujian-viral-aksi-heroik-pilot-sq-hadapi-angin-kencang-bandara-perth |
| "SIA Plane's Dramatic Perth Landing Sparks Praise And Debate" | planb.sg | 3 Nov 2026 | https://www.planb.sg/post/sia-plane-s-dramatic-perth-landing-sparks-praise-and-debate |
| Also seen in RSS only, not opened: NY Post, 7NEWS, News24, Malay Mail, NST, VnExpress, The Online Citizen, SuaraGarut ("Pilot Singapore Airlines Batalkan Pendaratan di Bandara Perth"), Lensa Hukum ("Pilot SIA Batalkan Pendaratan Saat Angin Kencang di Perth") | various | 1–2 Nov 2026 | Google News RSS |

**Incident facts** (agreed by The West, Straits Times/Yahoo, Aviation A2Z and detik):
- **Date:** Saturday **31 October 2026**, around midday Perth time.
- **Flight:** **SQ213**, Singapore to Perth.
- **Aircraft:** **Airbus A350-900**, confirmed by the SIA spokesperson.
- **What happened:** On the first approach the jet rolled noticeably **to its right**, and the right wing came close to the ground. The pilots then **discontinued the landing and climbed away. It was a go-around, not a touchdown-and-bounce.** On the second approach they landed normally.
- **Landed:** "safely at 1230hrs (local time) and taxied to the gate" (SIA spokesperson).
- **SIA statement (1 Nov):** the flight "experienced strong winds on approach into Perth International Airport. As a result, the pilots decided to conduct a go-around." The pilots were not named.
- **Wind per media (BOM website):** **32 km/h, gusting 43 km/h at 12:30 pm** (about 17 kt gusting 23 kt). The West gives only the 32 km/h figure.
- **Video source:** Facebook user **Chris Perry**, who said his sister was on board. He posted a second video of the successful landing. As of 11 pm on 1 Nov the first video had more than 7,200 likes and over 1,800 comments (Straits Times).
- **Injuries / passenger count:** not known (The West).

**Verdict: genuinely recent, not a recycled clip.** The video was posted the same day, and SIA confirmed the date, flight and aircraft. The archived METARs (fact 2) show strong westerly wind at Perth at that exact time. planb.sg adds that in **January 2026** another SIA aircraft discontinued a landing at Changi in windy conditions. That claim is single-source and not verified; it is useful only as a "this happens often" line.

---

## 2. Verified facts

### A. The SQ213 event

1. **SQ213 A350-900, go-around then a safe landing at 12:30 local on 31 Oct 2026.**
   - Sources: The West Australian, Yahoo/Straits Times, Aviation A2Z and detik (URLs above).
   - Confidence: **HIGH**.
2. **Perth Airport METARs, 31 Oct 2026 (UTC; Perth is UTC+8 with no DST).**
   - `0330Z 31012G22KT` (11:30 local): 310° at 12 kt, gusts 22 kt
   - `0400Z 27021KT` (12:00 local): 270° at 21 kt
   - `0430Z 29017KT` (12:30 local): 290° at 17 kt
   - `0500Z 28019KT`
   - Visibility 10 km or more, broken cloud at 3,500–3,900 ft. A light rain shower (`-SHRA`) was reported at 0200Z.
   - The wind was a strong, steady **west to west-north-westerly**, 17–21 kt with gusts.
   - Source: https://mesonet.agron.iastate.edu/cgi-bin/request/asos.py?station=YPPH&data=metar&year1=2026&month1=10&day1=31&hour1=1&year2=2026&month2=10&day2=31&hour2=7&tz=Etc/UTC&format=onlycomma
   - Confidence: **HIGH** (raw METAR archive).
3. **BOM daily observations, Perth Airport (station 009021), 31 Oct 2026.**
   - Rain 4.8 mm. Temperature min 15.4 °C, max 23.3 °C. 3 pm cloud 7 oktas, humidity 81%.
   - The gust columns are empty for this month.
   - Source: https://www.bom.gov.au/climate/dwo/202610/text/IDCJDW6110.202610.csv
   - Confidence: **HIGH**.
4. **Perth runways:** **03/21, 3,444 × 45 m** (the main runway) and **06/24, 2,163 × 45 m**.
   - Source: https://en.wikipedia.org/wiki/Perth_Airport
   - Confidence: **MED**.
   - **Which runway SQ213 used is NOT known.** A WNW wind of 270–310° crosses runway 03/21 at roughly 70–90°, which makes it close to a pure crosswind of about 16–21 kt. A right-wing-low roll fits a wind from the right on runway 21 or 24. This is an inference only: **LOW**.

### B. Crosswind technique

5. **Two basic methods: crab and wing-low (sideslip).**
   - In the **crab**, the nose points into the wind so the track follows the centreline. The crab is removed with rudder just before touchdown ("a change in alignment made too early or too late results in a side load").
   - In the **wing-low** method, rudder aligns the nose with the runway and the upwind wing is lowered. The aircraft touches down first on the **upwind main wheel**.
   - Pilots often combine the two: crab on long final, then transition to wing-low before the flare.
   - Source: FAA Airplane Flying Handbook FAA-H-8083-3C, ch. 9, https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/airplane_handbook/10_afh_ch9.pdf
   - Confidence: **HIGH**.
6. **Airliner numbers (FSF ALAR Briefing Note 8.7, Crosswind Landing; generic transport jet charts).**
   - **10 kt crosswind:** a sideslip landing needs about **3° of bank**, or a wings-level landing needs about **4–5° of crab**.
   - **30 kt crosswind:** a pure sideslip needs nearly **9° of bank**, close to the limits for engine-pod or wingtip contact. Wings-level would mean about **13° of crab**, which risks landing-gear damage. The fix is a mix of about **5° bank and 5° crab**.
   - **Rule of thumb:** up to a 15–20 kt crosswind, either technique works. Above that, fly a crabbed approach with a **partial de-crab** before touchdown.
   - Overbanking risks a **tail strike, engine-pod contact, or flap/wingtip contact**.
   - Source: https://flightsafety.org/wp-content/uploads/2016/09/alar_bn8-7-crosswind.pdf
   - Confidence: **HIGH**.
7. **"Maximum demonstrated crosswind" is not always a hard limit.** It applies on dry, damp or wet runways. On contaminated runways the recommended maximums drop with braking action, for example **35 kt for "good"** down to **5 kt for "unreliable"**. It is reduced further with one engine or one reverser inoperative, and the aircraft manual sets a separate maximum crosswind for **autoland**.
   - Source: FSF ALAR BN 8.7.
   - Confidence: **HIGH**.
8. **Adverse wind matters statistically.** Strong crosswinds, tailwinds or wind shear were involved in **about 33% of 76 approach-and-landing accidents and serious incidents** worldwide, 1984–1997.
   - Source: FSF ALAR BN 8.7 and BN 5.4.
   - Confidence: **HIGH** (old dataset; say "studi FSF").
9. **Wind shear** is a sudden change in wind speed or direction. It is linked to fronts, convective clouds and microbursts. A microburst downdraft can reach **40 kt vertical**, and its outburst winds can reach **100 kt horizontal**. Pilot reports of airspeed swings over **20 kt** or vertical-speed changes over **500 fpm below 1,000 ft** are a cause for caution.
   - Source: https://flightsafety.org/wp-content/uploads/2016/09/alar_bn5-4-windshear.pdf
   - Confidence: **HIGH**.
   - There is **no evidence** that SQ213 met wind shear. Media and SIA say only "strong winds".
10. **Gust handling.** The FAA guidance is approach speed **plus half the gust factor**. Its example: 70 kt normal, 15 kt gusts, so fly about 77 kt.
    - Source: FAA AFH ch. 9 (light-aircraft context; airliner manuals use their own wind corrections).
    - Confidence: **HIGH** for the FAA text.

### C. Stabilised approach and the go-around

11. **Stabilisation gates.** The approach must be stabilised by **1,000 ft above airport elevation in IMC** and by **500 ft in VMC**. All of these must hold:
    - on the correct flight path, with only small heading and pitch changes
    - speed between **VREF and VREF + 20 kt**
    - landing configuration set
    - sink rate **no greater than 1,000 fpm**
    - power appropriate, not below the approach minimum
    - briefings and checklists done
    - an ILS flown within **one dot**
    An approach that is not stabilised by the gate, or that becomes unstabilised below it, requires an immediate go-around.
    - Source: FSF ALAR BN 7.1, https://flightsafety.org/wp-content/uploads/2016/09/alar_bn7-1stablizedappr.pdf
    - Confidence: **HIGH**.
    - planb.sg says CAAS (Singapore's regulator) gives the same 1,000/500 ft guidance (**MED**).
12. **Unstabilised approaches were a causal factor in 66% of 76 approach-and-landing accidents and serious incidents** (1984–1997).
    - Source: FSF BN 7.1.
    - Confidence: **HIGH**.
13. **How a go-around is flown: Power, Attitude, Configuration.**
    - **Power:** apply full or maximum allowed power immediately.
    - **Attitude:** set a safe climb attitude. Do not pitch up before there is enough speed.
    - **Configuration:** retract the flaps in stages first, then raise the gear **after a positive rate of climb**.
    - Ground effect gives "borrowed" performance near the runway.
    - Source: FAA AFH ch. 9.
    - Confidence: **HIGH**.
    - On airliners, pilots select **TOGA (Take-Off/Go-Around) thrust**, either with a switch or by moving the thrust levers to the TO/GA position. Autothrust then sets go-around thrust.
    - Sources: NASA paper (fact 15); https://en.wikipedia.org/wiki/Go-around
    - Confidence: **HIGH / MED**.
14. **A go-around is a normal manoeuvre, not a failure.**
    - The FAA says "the assumption that an aborted landing is invariably the consequence of a poor approach … is a fallacy."
    - It lists two causes of a delayed go-around: landing expectancy, and **pride**, "the mistaken belief that the act of going around is an admission of failure."
    - The FAA also says a go-around "is not inherently dangerous in itself"; it becomes dangerous only when delayed or flown badly.
    - Wind shear, wake turbulence and an unstable approach are all listed as reasons to go around.
    - Source: FAA AFH ch. 9.
    - Confidence: **HIGH**.
15. **How often go-arounds happen.**
    - **One to three per 1,000 approaches** on average (citing FSF 2017).
    - At the US core-30 airports: **3.9 per 1,000 arrivals** in FY2023, about **23,000 go-arounds**, ranging from **2 to 8 per 1,000** by airport.
    - Initiation height in the airline data set: **19% between 0 and 200 ft AGL**, 33% at or below 400 ft, 60% at or below 1,000 ft.
    - Source: Lombaerts, Mumaw, Zaal (NASA Ames), "Statistical Analysis of Recent Go Around Flight Data", https://ntrs.nasa.gov/api/citations/20240008006/downloads/Statistical_Analysis_Go_Around_Data.pdf
    - Confidence: **HIGH**.
16. **The real danger is NOT going around.**
    - Unstable approaches happen on **3.5–4% of all approaches**, but only about **3%** of them end in a go-around; **95–97%** continue to land.
    - **83%** of runway excursions over 16 years could have been avoided by a go-around, which is **54% of all accidents**. The FSF calls failure to go around the number-one risk factor in approach and landing accidents.
    - Source: FSF Go-Around Decision-Making and Execution Project final report (2017), https://flightsafety.org/wp-content/uploads/2017/03/Go-around-study_final.pdf and https://flightsafety.org/toolkits-resources/go-around-project-final-report/
    - Confidence: **HIGH**.
    - Wikipedia adds that **1 in 10 go-around reports** records a potentially hazardous outcome (**MED**). This is a useful nuance: a go-around is safe but not trivial, so it is trained.

### D. Crosswind limits by aircraft type (weak area)

17. **Airbus A320:** the direct-crosswind limit is "33 knots, gusting 38" (WIRED, 2010).
    - Source: https://www.wired.com/2010/09/video-boeing-787-crosswind-landing-testing-in-iceland/
    - Confidence: **MED** (journalist figure, not an Airbus document).
18. **Boeing 787 crosswind tests**, Keflavik, Iceland, September 2010: runway 02, wind from 120° at **30 kt gusting 39** ("nearly perpendicular").
    - Source: WIRED (above).
    - Confidence: **MED**.
    - The **A350-900** did crosswind trials at Keflavik in **July 2014** (https://www.flightglobal.com/airframers/2014/07/picture-a350-performs-crosswind-tests-in-iceland/; **HIGH** that they took place, no wind values given).
19. **Timely tie-in:** the **Boeing 777-9** prototype N779XW finished crosswind trials at Keflavik and returned to Seattle on **4 Nov 2026**. The test fleet has over 5,100 hours, and first delivery is planned for 2027.
    - Source: https://www.aviacionline.com/english/manufacturers-mro/boeing-wraps-up-777x-crosswind-testing-in-iceland-under-the-northern-lights_a6aee46744622b038fcfc2d2b (6 Nov 2026)
    - Confidence: **MED** (single outlet).
20. **NOT verified:** a maximum demonstrated crosswind figure for the A350, 787 or 777, and any autoland crosswind limit. No manufacturer or airline document was found or read. **Do not say a number such as "A350 tahan 40 knot" in the VO.**

### E. Perth wind context

21. **The Fremantle Doctor** is Perth's afternoon **summer sea breeze** from the WSW to SW. It typically starts between 10 am and 3 pm and blows 28–37 km/h near the coast. It is strongest in December–January but also occurs in October–November.
    - Sources: https://media.bom.gov.au/social/blog/2132/meet-the-locals-when-the-weather-gives-the-place-character/ (BOM: "in almost all instances it arrives from a southwesterly direction during the late afternoon"); https://en.wikipedia.org/wiki/Fremantle_Doctor
    - Confidence: **HIGH** for the definition.
    - **Was the SQ213 wind the Fremantle Doctor? Unverified, and probably not a clean case.** That day had rain, 7 oktas of cloud, a cool 23 °C maximum, and a swing of the wind from north (01008KT) to WNW around 0230Z with a shower. That looks more like a frontal or trough change than a hot-day sea breeze. The BOM blog notes that the day or two after the west-coast trough passes "can often see very strong sea breezes". Safe line: "angin barat kencang khas pesisir Perth". Do not claim it was the Fremantle Doctor.

---

## 3. Mechanism in 7 animation steps (Bahasa Indonesia)

1. **Angin dari samping.** Pesawat harus mendarat lurus di garis tengah, tetapi angin bertiup menyilang 17–21 knot. Kalau dibiarkan, pesawat hanyut ke samping.
2. **Teknik "crab" (kepiting).** Moncong diarahkan sedikit ke arah angin, jadi pesawat terlihat terbang miring, tapi jalurnya tetap lurus ke landasan.
3. **Detik terakhir: luruskan.** Sesaat sebelum roda menyentuh, pilot menginjak rudder supaya badan pesawat sejajar landasan. Telat atau kecepatan sedikit saja, roda kena beban menyamping.
4. **Sayap turun ke arah angin (sideslip).** Sayap di sisi angin diturunkan beberapa derajat. Pada angin 30 knot, kalau hanya pakai cara ini, kemiringan hampir 9°, dan mesin atau ujung sayap makin dekat ke tanah. Itu sebabnya pilot memadukan crab dan sideslip.
5. **Gerbang 1.000/500 kaki.** Pada ketinggian ini semuanya harus "stabil": jalur, kecepatan, laju turun, dan konfigurasi. Satu saja keluar batas, aturannya jelas: batalkan.
6. **Go-around: Power, Attitude, Configuration.** Tuas thrust didorong ke TOGA, hidung diangkat ke sikap menanjak, flap dikurangi bertahap, lalu roda naik setelah pesawat pasti menanjak.
7. **Putar dan coba lagi.** Pesawat naik ke ketinggian aman, berputar, lalu mendekat lagi. SQ213 mendarat mulus pada pukul 12.30 waktu Perth.

---

## 4. Myths and traps

- **"Hampir jatuh / near-miss."** The videographer and some headlines use this framing, and planb.sg notes commenters disputed it. The FAA and FSF frame a go-around as normal and safe. Show the drama, then flip it: "yang dramatis justru keputusan yang benar."
- **"Pilot heroik menyelamatkan dari maut."** The praise is real but subjective. The verifiable fact is that the crew followed a standard procedure. Do not invent a near-crash, and do not give a wingtip-to-ground distance (unknown).
- **Wind values.** Use "32 km/jam, hembusan 43 km/jam" (BOM via Straits Times/detik), or the METAR's "sekitar 21 knot" at 12:00. Do not inflate to "badai".
- **Crosswind component.** Unknown, because the runway in use is unknown. Say "angin menyilang landasan", not "angin samping 25 knot".
- **A350 limits.** Not verified (fact 20). Avoid naming any number for the A350, 787 or 777.
- **The wing went right, so the wind came from the right?** This is plausible but unproven. A gust can roll a jet either way. Do not state it.
- **"Go-around itu langka."** It happens 1–3 times per 1,000 approaches, so a frequent flyer will see several in a lifetime.
- **"Go-around = pilot gagal."** The FAA calls this belief "pride" and a fallacy (fact 14).
- **Fremantle Doctor.** It is attractive trivia but unconfirmed for this day (fact 21).
- **Wind shear.** It was not reported for this event. Use it only as a general explainer.
- **Do not identify the pilots or the passenger.** SIA did not name the crew.

---

## 5. Hook and curiosity angles (90-second Indonesian video)

1. **"Sayap hampir mencium aspal… lalu pilot memilih kabur ke langit."** Open on the tilt, freeze the frame, and ask: gagal atau jenius?
2. **"97% pilot tetap mendarat padahal seharusnya batal."** FSF: only about 3% of unstable approaches end in a go-around. The SQ213 crew were in the 3%.
3. **"Kenapa pesawat ini terbang miring seperti kepiting?"** Explain the crab and the de-crab with one 3D jet.
4. **"Ada aturan 1.000 kaki."** The invisible gate in the sky: if anything is off by then, the landing is cancelled.
5. **"Go-around terjadi 1–3 kali tiap 1.000 pendaratan, dan di bandara besar AS sekitar 23 ribu kali setahun."** Normal, not scary.
6. **"Tombol bernama TOGA."** One button: full thrust, climb, try again.
7. **Timely tie-in:** "Minggu ini Boeing sengaja menerbangkan 777X ke Islandia untuk mencari angin samping paling ganas" (fact 19, MED).

**Strongest hook:** #1 combined with #2. Use the viral tilt, then the twist that most crashes come from pilots who do *not* go around.

---

## 6. Visual and 3D beat ideas

- **Hook:** a low side camera at runway level. A stylised A350 silhouette (generic twin widebody; no SIA livery or logo, to avoid trademark issues) rolls right, the wingtip drops toward the runway edge lights, and the frame freezes on a red "?".
- **Wind field:** animated streamlines crossing a top-down runway labelled 03/21. The METAR string `27021KT` types out as a HUD element and is translated to "21 knot dari barat".
- **Crab vs sideslip split-screen:** the left jet flies crabbed with the nose angled. The right jet flies wing-low, with protractor overlays showing 3°/5°/9°/13° from FSF BN 8.7.
- **Danger envelope:** a ghost cone under the wing and engine pod showing how close geometry limits get at 30 kt.
- **Altitude gate:** translucent rings in the sky at 1,000 ft and 500 ft. A checklist HUD (path, speed, sink rate, config) ticks green, then one item flips red and a "GO AROUND" callout fires.
- **TOGA beat:** close-up of the thrust levers pushed forward, an engine glow ramp, the pitch line rising, the flap segments retracting one step, the gear folding up after a "positive rate" tick.
- **Stats payoff:** 1,000 small landing icons, of which only 1–3 glow and loop around. Then an "unstable approaches" bar where 97% continue (red) and 3% go around (green).
- **Resolution:** a second approach, a smooth touchdown, and a clock showing **12:30**.
- **Brand in the world:** "AUDIRA" on the airport HUD or tower label.

---

## 7. Open questions / unverified

- The runway used by SQ213, the exact crosswind component, and the go-around height and time. No ATC audio, ADS-B track or Aviation Herald report was read.
- The actual wingtip clearance, and whether any aircraft limit (bank angle) was exceeded. Unknown, with no regulator statement. No ATSB investigation was found.
- The maximum demonstrated crosswind for the A350-900, and its autoland crosswind limit. No Airbus or SIA document was found.
- Whether the wind was the Fremantle Doctor or a frontal or trough change.
- planb.sg's January 2026 Changi go-around claim is single-source.
- The CNA article body did not parse (heavy navigation markup), and the NY Post, 7NEWS and other RSS items were not opened.
- SKYbrary article pages (crosswind landings, go-around) are blocked by a JS challenge. ATSB-hosted PDFs timed out.
