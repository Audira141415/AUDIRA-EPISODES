# EP 28: Motor yang Bisa Melihat ke Belakang: Cara Kerja Radar Motor Honda SENSING RIDE

AUDIRA, seri CARA KERJA VIRAL. Created by Agus Dwi R. Status: final dengan voice-over, 10 November 2026.

Riset dari sumber yang dibaca langsung 10 November 2026. Setiap fakta berlabel HIGH, MED, atau LOW; naskah hanya memakai HIGH dan MED.

# EP28 — How a motorcycle "sees" with radar: Honda SENSING RIDE on the 2027 Africa Twin — research notes

Research date: 2026-11-10. This file holds research only, not a script.
Method: Google News RSS (Indonesian, English and Japanese, `when:30d` and open-date queries), Bing News RSS for real article URLs, and article HTML read with Python urllib (browser User-Agent, normal TLS, tags stripped). Primary sources read directly: the two **Honda Global news releases of 3 Nov 2026** (English, plus the Japanese version's opening), and the **Bosch Mobility** pages "Advanced rider assistance systems for two-wheeler" and "Motorcycle stability control". Ducati's 2020 radar press release was read as quoted in full by Motorcycle.com. Secondary sources: CNN Indonesia, kumparan, detikOto, Kompas.com, MONOist (via Yahoo! Japan), motorcycles.news, Paul Tan, Bennetts BikeSocial, Ultimate Motorcycling, Cycle News, Wikipedia (raw wikitext of "Ducati Multistrada", "Adaptive cruise control", "Continuous-wave radar").

Confidence tags: **HIGH** = primary source or 3+ independent outlets agree; **MED** = one good secondary source; **LOW** = single weak source or my inference.

---

## 1. Viral hook: is it recent?

| Headline | Outlet | Published | URL |
|---|---|---|---|
| "Honda Introduces 'Honda SENSING RIDE' Advanced Safety and Rider-Assistive System for Motorcycles" (primary) | Honda Global | 3 Nov 2026 (Milan) | https://global.honda/en/newsroom/news/2026/2261103beng.html |
| "Honda Presents World Premiere of CRF1150L Africa Twin Adventure Bike Series Models at EICMA 2026" (primary) | Honda Global | 3 Nov 2026 | https://global.honda/en/newsroom/news/2026/2261103ceng.html |
| 二輪車用の先進安全運転支援システム「Honda SENSING RIDE」を発表 (primary, Japanese) | Honda Global JP | 3 Nov 2026 | https://global.honda/jp/news/2026/2261103b.html |
| "Africa Twin Jadi Motor Pertama di Dunia Pakai Honda Sensing Ride" (the news hook; report from Milan) | CNN Indonesia | Thu 5 Nov 2026, 07:30 WIB (URL slug dated 4 Nov) | https://www.cnnindonesia.com/otomotif/20261104115630-595-1423132/africa-twin-jadi-motor-pertama-di-dunia-pakai-honda-sensing-ride |
| "Deretan Motor Baru Honda di EICMA 2026, dari Africa Twin sampai ADV125" | CNN Indonesia | 4 Nov 2026 | https://www.cnnindonesia.com/otomotif/20261104113734-595-1423121/deretan-motor-baru-honda-di-eicma-2026-dari-africa-twin-sampai-adv125 |
| "Spesifikasi Lengkap Honda Africa Twin Terbaru, Cocok Masuk Indonesia?" | kumparan | ~4–5 Nov 2026 | https://kumparan.com/kumparanoto/spesifikasi-lengkap-honda-africa-twin-terbaru-cocok-masuk-indonesia-28VeTyyGuZH |
| "Debut Honda CRF1150L Africa Twin, Tawarkan 3 Karakter Berbeda" | Kompas.com | 4 Nov 2026 | https://otomotif.kompas.com/read/2026/11/04/183100315/debut-honda-crf1150l-africa-twin-tawarkan-3-karakter-berbeda |
| ホンダが二輪車向けADASを開発、千鳥走行など二輪車特有のグループ走行も支援 | MONOist (Yahoo! Japan) | 4 Nov 2026 | https://news.yahoo.co.jp/articles/9b2e87543273dad91dd833942711fc99f17c5a89 |
| "Africa Twin Adventure Sports: Honda's First Motorcycle with Radar, Plus 17 hp More" | motorcycles.news | 2 Nov 2026 | https://www.motorcycles.news/en/honda-africa-twin-adventure-sports-2027-sensing-ride/ |
| "Honda Sensing Ride debuts on 2027 CRF1100L [sic] Africa Twin, brings radar-based rider assistance" | Paul Tan | 6 Nov 2026 | https://paultan.org/2026/11/06/honda-sensing-ride-debuts-on-2027-crf1100l-africa-twin-brings-radar-based-rider-assistance/ |
| Other coverage seen in RSS only (not read): Webike Japan, Top Speed, RideApart, Visordown, MCN, Autoblog, Car Watch, Young Machine, ADVrider ("Keeps You Safe-Ish"), OtoRider, TMCBlog, Uzone, VIVA | various | 2–9 Nov 2026 | — |

**Verdict:** The news is **fresh** (EICMA 2026 press days 3–4 Nov) and the core is **accurate**. The CNN Indonesia headline "motor pertama di dunia pakai Honda Sensing Ride" is **literally true but easy to misread**. The Africa Twin is the first motorcycle with *Honda's* system, because the system did not exist before. It is **not** the world's first motorcycle with radar, ACC, blind-spot warning or even radar Stop & Go (see 2D). Honda's own release never says "world first" for SENSING RIDE. Its only "world's first" is the DCT gearbox on motorcycles (2010).

---

## 2. Verified facts

### A. What Honda SENSING RIDE is (Honda primary, HIGH)

1. **Name and type:** "Honda SENSING RIDE", Honda's "advanced safety and rider-assistive system for motorcycles", unveiled at EICMA 2026, Milan, 3 Nov 2026. HIGH.
2. **Origin:** developed "based on the technologies and knowledge amassed through the development of Honda SENSING for its automobiles", plus "motorcycle-specific functions". HIGH.
3. **Sensors:** "a millimeter-wave radar unit mounted at each end of the motorcycle", meaning **one front radar and one rear radar**. MONOist (Japanese) says the same: 前部と後部に1基ずつ. **No camera is mentioned** anywhere in Honda's text. HIGH (that Honda names only radar); the absence of a camera is MED (not stated explicitly as "no camera").
4. **Brain:** the system decides "based on its comprehensive assessment of the status of the rider and the motorcycle", then gives notifications, warnings and operational assistance. HIGH (wording); what sensors that "status" uses is not stated (see 2C).
5. **The 10 functions (Honda's list, HIGH):**
   1. **Adaptive Cruise Control (ACC):** keeps a set speed and a following distance to vehicles ahead.
   2. **ACC with Stop & Go:** extension of ACC for congestion; reduces the rider's accelerate/decelerate inputs.
   3. **Group Ride Assist:** keeps suitable gaps in a group ride, "including in the staggered formation" (zig-zag left/right; 千鳥走行).
   4. **Distance Assist:** adjusts following distance when the rider is on the throttle and closes on the vehicle ahead.
   5. **Emergency Brake Assist:** "applies braking assistance **under the rider's braking input**" when a collision ahead is likely. It boosts the rider's braking; it does not brake on its own.
   6. **Forward Collision Warning:** alert on the meter (TFT dash).
   7. **Brake Pulse:** works with FCW "to provide additional rider awareness". Honda does not describe it further (see section 7).
   8. **Blind Spot Information:** lights or flashes an indicator **on the mirror** when a vehicle is in the blind spot diagonally behind.
   9. **Rear Collision Warning:** flashes the indicators to warn **following traffic** (MONOist: rapid blinking of the turn signals).
   10. **Rear Distance Information:** meter display when a vehicle approaches from behind.
6. **Disclaimer (Honda footnote):** there is "a limit to the capabilities (e.g. recognition capability and control capability)"; riders must not overestimate it, and it "may not operate" depending on road, weather and vehicle conditions. HIGH. Use this in the video.
7. **Why DCT matters:** Stop & Go uses Honda's **Dual-Clutch Transmission** so the bike can stop and pull away with no clutch lever. Honda: DCT was the "world's first application to motorcycles in 2010" (Honda internal research). HIGH.
8. **Stop & Go detail:** the bike can brake to a **standstill**, but the **rider must give an input to move off again** (motorcycles.news; Paul Tan). MED-HIGH (two secondaries, not in Honda's text).
9. **Honda's safety goal:** halve traffic-collision fatalities involving Honda motorcycles and cars per 10,000 units sold by 2030 vs 2020, then zero by 2050 ("Safety for Everyone"). HIGH.
10. **Roll-out:** "Honda will increase the number of models equipped with Honda SENSING RIDE". No other model named. HIGH.

### B. Which bike, which year, which market

1. **Model:** **27YM (2027 model year) Honda CRF1150L Africa Twin Adventure Sports**, and SENSING RIDE is **an option only on the DCT version** of the Adventure Sports. HIGH (Honda primary, CNN Indonesia).
2. **Africa Twin family 2027:** Africa Twin (standard), Africa Twin Adventure Sports, and new **Africa Twin Enduro Sports**. Only the Adventure Sports DCT offers SENSING RIDE. HIGH.
3. **Engine:** liquid-cooled **1,131 cc** parallel twin, **87.5 kW @ 7,500 rpm, 119 Nm @ 5,700 rpm** (Honda). Up from 1,084 cc / 75 kW / 112 Nm on the CRF1100L. HIGH. 87.5 kW ≈ 117 hp ≈ 119 PS (unit trap, see section 4).
4. **Weight with radar:** Adventure Sports DCT 255 kg, SENSING RIDE version 256 kg (fully fuelled); tank 24.2 L (Honda says "24-liter"). MED (motorcycles.news).
5. **Other tech on the bike:** Showa EERA semi-active suspension with Honda Skyhook, **six-axis IMU**, six riding modes, E-Combined ABS, Smart Key, electric screen. Skyhook recalculates "every millisecond" using the ECU, IMU and a fork stroke sensor. MED (motorcycles.news; IMU also implied by Honda's "status of the motorcycle").
6. **Markets/price/date:** Honda's releases give **no price, no on-sale date and no market list**. The launch was at a European show; motorcycles.news frames it for Europe. kumparan: "pabrikan belum mengungkapkan harga resmi". HIGH (that nothing is announced).

### C. Who makes the radar? (unconfirmed)

- Honda does **not** name a radar supplier. No outlet read says Bosch. LOW.
- **Strong circumstantial match:** Bosch's published "second-generation" motorcycle ARAS menu is almost identical to Honda's list: ACC Stop & Go, Group Ride Assist (staggered formation), Riding Distance Assist, Emergency Brake Assist, Forward Collision Warning, Blind Spot Detection, Rear Distance Warning, Rear Collision Warning (hazard lights). Source: Bosch Mobility page (primary). This is **my inference only**. Do not say "radar Bosch" in the video. LOW.

### D. "Pertama di dunia"? The real timeline

| Year | Bike | What it had | Confidence |
|---|---|---|---|
| 2018 | Ducati, KTM | Announced radar work with Bosch (Ducati research with a university since 2016; patent June 2017) | MED (Motorcycle.com, Cycle News, Ultimate Motorcycling) |
| Oct 2020 (MY2021) | **Ducati Multistrada V4 (S)** | Ducati: "the world's first motorcycle equipped with front and rear radar". Bosch radar units. **ACC** with front radar between **30 and 160 km/h**; rear radar **Blind Spot Detection** + warning of fast-approaching vehicles, LED in mirror. Units 70 × 60 × 28 mm, ~190 g | HIGH (Ducati release quoted by Motorcycle.com; Cycle News; Ultimate Motorcycling; Wikipedia) |
| 2020 | Bosch | "Bosch launched adaptive cruise control back in 2020" (motorcycles) | HIGH (Bosch primary) |
| Jan 2021 (MY2021) | KTM 1290 Super Adventure S | Radar ACC (front) | MED (several RSS headlines: Cycle World, New Atlas, RideApart; not read in body) |
| Nov 2021 (MY2022) | **Kawasaki Ninja H2 SX SE** | Front and rear Bosch radar (ACC, FCW, BSD). **First Japanese brand with radar** | MED (headlines from Cycle World, Bennetts, MCN, webBikeWorld; bodies not read) |
| 2024–2025 | BMW R 1300 GS / GS Adventure / RT | "Riding Assistant": active cruise control with braking, front collision warning, lane change warning | MED (Paul Tan) |
| Oct 2024 (MY2025) | **KTM 1390 Super Adventure S Evo** | **ACC Stop & Go** with KTM's AMT (no clutch lever). Brakes gently to a halt; if traffic moves within **3 s** it resumes automatically; longer stops need rider input. Bosch 2nd-gen ARAS incl. Group Ride Assist | HIGH-MED (Bennetts review; Kompas.com/MCN Sep 2024 on Bosch+KTM) |
| 2026 | Ducati Multistrada V4 Rally (2026) | Adds front collision warning to existing ACC + BSD | MED (New Atlas) |
| **Nov 2026 (MY2027)** | **Honda Africa Twin Adventure Sports SENSING RIDE** | 10 functions, front + rear radar, Stop & Go with DCT | HIGH |

**So what is actually first?**
- **First Honda motorcycle** with radar ADAS (Honda's own claim: "the first Honda motorcycle equipped with Honda SENSING RIDE"). HIGH.
- **First radar Stop & Go paired with a dual-clutch gearbox** (DCT is Honda-only). True by construction, but KTM did Stop & Go with an automated manual one year earlier. MED.
- Possibly among the **widest function sets** at launch (10 named functions). Ducati, BMW and KTM lists differ in naming, so "most features" is not proven. LOW.
- Honda itself had flirted with radar before: a Jan 2021 Motorcycle.com headline reads "The Honda Gold Wing Didn't Get Radar-Based Adaptive Cruise… Yet". MED (headline only).

### E. Why radar on a motorcycle at all

1. **Bosch accident research (2022 estimate):** radar-based rider assistance "could prevent **one in six** motorcycle accidents". HIGH (Bosch primary; it is Bosch's own estimate, a supplier with an interest).
2. **System parts (Bosch):** radar sensor + brake system + engine management + HMI (dashboard, mirror lights). HIGH.
3. **IMU (Bosch MSC page):** the inertial measurement unit measures acceleration and angular rate **100 times per second**; brake control "depends on the vehicle's lean and pitch angles". HIGH (Bosch primary). This is the bike's "inner ear".
4. **Gentle by design (Ducati 2020 release):** ACC deceleration and acceleration are **limited** so the rider keeps control. HIGH.
5. **Group ride problem (Bosch):** normal ACC "expects the motorcycles riding in front to be in the middle of the lane". In a staggered group the bike ahead is offset, so an algorithm detects the staggered pattern and keeps the gap. HIGH (Bosch primary).

### F. How radar measures (physics, general knowledge + my calculations)

1. Automotive radar works at **24 GHz or 77 GHz** (Wikipedia ACC article). The 77 GHz band (76–81 GHz) is the modern standard. Honda says only "millimeter-wave"; **frequency not disclosed**. MED (general), LOW for Honda's exact band.
2. At 77 GHz the wavelength is about **3.9 mm**, hence "millimetre-wave". Calculation, HIGH.
3. **Distance:** radio waves travel at light speed. For a car **50 m** ahead the echo returns after about **0.33 microseconds** (2 × 50 m / 300,000 km/s). Calculation, HIGH.
4. **FMCW (how cheap radars time such a short echo):** the radar sends a "chirp" whose frequency rises steadily. The echo comes back a little late, so at any instant it has a slightly lower frequency than what is being sent. The **difference ("beat") frequency is proportional to distance**. MED (standard radar principle; Wikipedia "Continuous-wave radar" confirms modulated CW ranging; I did not read an FMCW-specific primary).
5. **Speed (Doppler):** a target closing on you compresses the wave and raises the echo frequency. Doppler shift = 2 × v / wavelength. At 77 GHz a closing speed of **10 km/h** gives about **1.4 kHz**; 36 km/h gives about **5.1 kHz**. Calculation from Wikipedia's formula, HIGH.
6. **Angle:** several receive antennas compare the echo arrival phase to find left/right direction (general radar practice). MED. Not stated by Honda.

### G. Indonesia relevance

1. **Africa Twin is sold in Indonesia** by **PT Astra Honda Motor (AHM)** through Honda **Big Wing** dealers. Current model: **CRF1100L Africa Twin (2026 colours)**, 1,084 cc, 75 kW, 112 Nm, **Rp 665.000.000 OTR DKI Jakarta**, colours Honda Tricolor, Matt Ballistic Black Metallic, Grand Prix Red (detikOto, 1 Oct 2026; AHM statement by Marketing Director Octavianus Dwi). HIGH-MED (one outlet, AHM-sourced; detik headline mistakenly says "CRF1000L").
2. Earlier Indonesian prices seen in headlines: Rp 633 juta, Rp 647,5 juta, Rp 659 juta (2022–2025 versions). MED (headlines only).
3. **CRF1150L / SENSING RIDE in Indonesia: not announced.** No AHM statement found. kumparan asks "cocok masuk Indonesia?" without an answer. HIGH (absence).
4. Indonesian journalists reported live from Milan (CNN Indonesia, kumparan, OtoRider), so the topic reached local feeds. HIGH.

---

## 3. Mechanism in 7 animation steps (Bahasa Indonesia)

1. **Dua "mata" tak terlihat.** Africa Twin Adventure Sports punya dua kotak radar kecil: satu di depan, satu di belakang. Bukan kamera, tapi gelombang radio milimeter yang tidak terganggu gelap.
2. **Kirim gelombang, tunggu pantulan.** Radar depan menembakkan gelombang radio ke depan. Gelombang memantul dari mobil di depan dan kembali dalam sepertiga sepersejuta detik untuk jarak 50 meter.
3. **Nada naik untuk mengukur jarak (FMCW).** Gelombang yang dikirim "bernada naik" terus-menerus. Pantulan datang terlambat, jadi nadanya sedikit lebih rendah. Selisih nada itu = jarak.
4. **Efek Doppler untuk kecepatan.** Kalau mobil di depan mendekat, gelombang pantulnya "terjepit" dan frekuensinya naik. Dari selisih itu motor tahu seberapa cepat jarak menyusut.
5. **Otak memadukan radar + IMU.** Komputer menggabungkan data radar dengan sensor IMU (kemiringan, pengereman, akselerasi) dan kondisi pengendara. Motor bisa miring di tikungan, jadi sistem harus tahu "ini tikungan, bukan bahaya".
6. **ACC Stop & Go: menahan jarak dengan halus.** Kalau jarak menyempit, sistem menutup gas, lalu mengerem pelan. Di kemacetan motor bisa berhenti total; transmisi DCT melepas kopling sendiri. Untuk jalan lagi, pengendara memberi perintah.
7. **Mata belakang dan alarm.** Radar belakang memantau titik buta: lampu di spion menyala. Kalau mobil dari belakang terlalu kencang, lampu sein berkedip cepat untuk memperingatkan pengemudi di belakang. Bahaya dari depan muncul di layar TFT, ditambah "brake pulse". Tetap: tangan dan mata pengendara yang memutuskan.

---

## 4. Myths, traps and caveats

1. **"Motor pertama di dunia pakai radar" — salah.** Ducati Multistrada V4 (diumumkan Okt 2020, MY2021) adalah motor produksi pertama dengan radar depan + belakang (Bosch). KTM 1290 Super Adventure S (2021) dan Kawasaki H2 SX SE (2022) menyusul. Kalimat aman: "motor Honda pertama yang punya Honda SENSING RIDE".
2. **"Pertama yang bisa berhenti sendiri di macet" — salah.** KTM 1390 Super Adventure S Evo (MY2025) sudah punya ACC Stop & Go dengan transmisi AMT.
3. **"Motor bisa ngerem darurat sendiri" — hati-hati.** Emergency Brake Assist Honda bekerja "under the rider's braking input": menambah tenaga rem saat pengendara sudah mengerem. Yang mengerem sendiri adalah ACC, dan itu pun pelan/terbatas. Bukan AEB ala mobil.
4. **"Pakai kamera seperti Honda Sensing mobil" — tidak disebut.** Honda Sensing mobil umumnya kamera + radar. Versi motor yang diumumkan hanya menyebut radar gelombang milimeter.
5. **Semua varian Africa Twin punya radar — salah.** Hanya opsi di **Adventure Sports DCT**. kumparan sempat menulis seolah Enduro Sports yang mendapat fitur ini dan radar hanya di buritan; keduanya bertentangan dengan rilis Honda. Jangan kutip kumparan untuk bagian ini.
6. **Nama model:** CRF**1150**L (2027), bukan CRF1100L (Paul Tan headline salah) dan bukan CRF1000L (judul detik salah). CRF1100L adalah model lama yang dijual AHM sekarang.
7. **Tenaga:** 87,5 kW = ±117 hp = ±119 PS. CNN Indonesia: 117 hp; motorcycles.news: "119 hp" (sebenarnya PS). kumparan menulis torsi di 7.500 rpm; Honda: 119 Nm @ **5.700** rpm (motorcycles.news: 5.750). Pakai angka Honda.
8. **Tanggal:** rilis Honda 3 Nov 2026 waktu Milan; Google News menampilkan 2 Nov karena zona waktu. Artikel CNN Indonesia tayang 5 Nov 07:30 WIB.
9. **Belum ada harga dan belum pasti masuk Indonesia.** Jangan sebut harga CRF1150L. Harga yang terverifikasi hanya CRF1100L: Rp 665 juta OTR Jakarta.
10. **Radar Bosch?** Tidak dikonfirmasi. Fiturnya mirip daftar Bosch generasi 2, tapi itu dugaan.
11. **77 GHz?** Honda tidak menyebut frekuensi. Boleh bilang "gelombang milimeter, sekelas radar mobil (umumnya 77 GHz)".
12. **"1 dari 6 kecelakaan bisa dicegah"** adalah estimasi riset Bosch (pemasok sistem). Sebut sumbernya.
13. **Bukan motor otonom.** Pengendara tetap menyetir, menyeimbangkan, dan memulai jalan lagi. Honda sendiri menulis disclaimer batas kemampuan.

---

## 5. Hook angles (90-second Indonesian video)

1. **"Motor ini punya mata di belakang kepala."** Visual: radar belakang menyala, spion berkedip saat mobil masuk titik buta. Lalu: cara radar "melihat" tanpa cahaya.
2. **"Motor yang bisa ngerem sendiri saat macet... tapi bukan yang pertama."** Membuka dengan judul viral, lalu twist: Ducati 2020, KTM 2024. Kenapa Honda tetap penting: raksasa motor terbesar di dunia akhirnya masuk.
3. **"Kenapa butuh 6 tahun lebih lama dari mobil?"** Masalah unik motor: miring di tikungan, keseimbangan, tidak boleh ngerem mendadak. (Pakai angka aman: ACC mobil sudah lama ada; motor baru 2020.)
4. **"Bunyi yang tidak bisa kamu dengar."** Analogi sirene ambulans (Doppler) untuk menjelaskan bagaimana radar tahu mobil di depan melambat.
5. **"Motor Rp 600 juta-an di Indonesia, dan versi radarnya belum datang."** Untuk penonton lokal: Africa Twin dijual AHM, versi SENSING RIDE belum diumumkan.

Recommended: **#1 + #2 combined.** Hook 0–3 s: "Motor ini bisa lihat mobil di belakangmu, dan ngerem sendiri saat macet." Twist at ~15 s: "Tapi ini bukan motor radar pertama di dunia." Brand line: "AUDIRA jelasin cara kerjanya."

---

## 6. Visual / 3D beat ideas

1. **Hook:** low-angle shot of an adventure bike (generic, not a Honda-logo replica) in jammed traffic; two translucent radar cones fan out front and rear.
2. **Wave pulse:** concentric millimetre-wave arcs leave the front radar, hit a car's bumper, and bounce back; a tiny timer reads "0,00000033 s".
3. **FMCW chirp:** a rising-pitch sweep line (sawtooth) with its delayed echo copy; the gap between the two lines labelled "selisih = jarak".
4. **Doppler:** the echo wave squeezes (shorter wavelength, bluer) as the car ahead brakes; HUD shows closing speed.
5. **Lean problem:** the bike leans 40° in a curve; the radar cone tilts and sweeps a guardrail. An IMU gyroscope icon in the tank "corrects" the cone. Caption: "Tikungan, bukan bahaya."
6. **Group ride:** top-down staggered formation of 4 bikes; dashed gap lines lock in place (Group Ride Assist).
7. **Stop & Go:** dashboard TFT counts down speed to 0; DCT clutch plates separate in a cutaway; rider's thumb presses resume.
8. **Rear guard:** mirror LED glows amber for blind spot; a fast car approaches; rear indicators flash rapidly (Rear Collision Warning).
9. **Timeline payoff:** 2020 Ducati to 2021 KTM to 2022 Kawasaki to 2025 KTM Stop & Go to 2027 Honda, as a road with milestone signs. AUDIRA name on a road sign or HUD label.
10. **Outro:** disclaimer text "alat bantu, bukan autopilot", then the AUDIRA outro card.

Style candidates for the style gate: INNERWORKS (cutaway radar + DCT), CYBERFORGE (HUD radar cones), PRECISION (product-CGI bike).

---

## 7. Open questions / unverified

- **Radar supplier** (Bosch or Honda/Astemo in-house?): not stated by Honda.
- **Radar frequency, range, field of view, speed range of ACC:** not disclosed by Honda. Ducati/Bosch gen-1 ACC worked 30–160 km/h; do not transfer that to Honda.
- **What "Brake Pulse" physically is** (a short brake-pressure jolt the rider feels, like car systems?): Honda gives only "additional rider awareness". Not confirmed.
- **Does Honda's ACC resume automatically after a short stop** (as KTM does within 3 s)? Two secondaries say the rider must give an input; Honda's text does not say.
- **How the system handles lean angle:** no Honda statement. The IMU role is from Bosch's general MSC page and the bike's spec (six-axis IMU), not from a SENSING RIDE document.
- **Price, EU on-sale date, other markets, Indonesia launch:** none announced.
- **KTM 1290 SAS 2021, Kawasaki H2 SX SE 2022, BMW R 1250 RT ACC dates:** from RSS headlines, bodies not read. BMW R 1250 RT (2021) ACC is my memory only (LOW); Paul Tan confirms BMW Riding Assistant on R 1300 GS/RT.
- **Group Ride Assist "first":** Bosch offered GRA with KTM in 2024 (Kompas.com/MCN), so Honda's version is not first either; whether KTM shipped GRA on the 1390 Evo was not checked.
- **Africa Twin sales numbers** (120,000+ since 2016; 68% of European Adventure Sports buyers chose DCT in 2025): motorcycles.news only. MED.

### Sources that failed

- Rider Magazine (Ducati radar 2020): **HTTP 403**.
- Bosch Mobility guessed URLs (`adaptive-cruise-control-for-motorcycles`, `advanced-rider-assistance-systems`): **HTTP 404**; the correct page was found via the solutions index.
- MSN mirrors (Top Speed "ace up its sleeve", HT Auto, kumparan-style reposts): MSN pages return no article text.
- KTM official 1390 Super Adventure S Evo page: no matching text in HTML (JavaScript-rendered).
- Bing web search (`/search?format=rss`): returned irrelevant results; only Bing News RSS was useful.
- Not attempted: Webike Japan, Car Watch, Young Machine, ADVrider, MCN Honda article (coverage duplicates Honda's release).
