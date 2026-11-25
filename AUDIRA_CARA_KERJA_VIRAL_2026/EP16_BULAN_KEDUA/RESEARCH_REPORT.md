# EP 16: Bumi Punya Bulan Kedua: Cara Batu 2 Meter Tertangkap Gravitasi

AUDIRA, seri CARA KERJA VIRAL. Created by Agus Dwi R. Status: final dengan voice-over, 9 November 2026.

Riset dari sumber yang dibaca langsung 9 November 2026. Setiap fakta berlabel HIGH, MED, atau LOW; naskah hanya memakai HIGH dan MED.

# EP16 — Earth's "second moon" (mini-moon 2026 QQ8): research notes

Research date: 2026-11-09. This file holds research only, not a script.
Method: Google News RSS (Indonesian and English), with links decoded to real URLs through Google's batchexecute endpoint, and article HTML read with Python urllib. The primary source is the Minor Planet Center circular **MPEC 2026-U95**, read directly from minorplanetcenter.net. Orbit and close-approach data came from the **NASA/JPL Small-Body Database API** (`ssd-api.jpl.nasa.gov/sbdb.api?sstr=2026 QQ8`). Paper metadata came from Crossref, and abstracts from the arXiv API. IOPscience (the RNAAS papers) served one page and then blocked scripted requests, so only titles, dates and the opening lines of the RNAAS notes were read. Gizmodo and phys.org returned HTTP 403. The Space.com article body did not render in plain HTML.

---

## 1. Viral hook: is it recent?

| Headline | Outlet | Published | URL |
|---|---|---|---|
| "Bumi Punya Bulan Kedua, Benda Langit Misterius Ini Segera Pergi" | detikInet | **8 Nov 2026**, 17:37 WIB | https://inet.detik.com/science/d-8743897/bumi-punya-bulan-kedua-benda-langit-misterius-ini-segera-pergi |
| "MPEC 2026-U95: 2026 QQ8: Temporarily Captured Object" (primary) | IAU Minor Planet Center | **29 Oct 2026**, 16:50 UT | https://minorplanetcenter.net/mpec/K26/K26U95.html |
| "A new mini-moon for Earth! Meet 2026 QQ8" | EarthSky | 4 Nov 2026 | https://earthsky.org/space/mini-moon-for-earth-2026-qq8/ |
| "Earth has captured a new mini moon — but it won't stick around for long" | Space.com | 5 Nov 2026 | https://www.space.com/astronomy/earth/earth-has-captured-a-new-mini-moon-but-it-wont-stick-around-for-long (body not read) |
| "'No Link to a Known Artificial Object Has Been Found': Astronomers Confirm Earth Has Captured a Tiny New Moon" | The Debrief | 6 Nov 2026 | https://thedebrief.org/no-link-to-a-known-artificial-object-has-been-found-astronomers-confirm-earth-has-captured-a-tiny-new-moon/ |
| "Earth has new mini-moon – but it won't be around for long" | BBC Sky at Night Magazine | 7 Nov 2026 | https://www.skyatnightmagazine.com/news/2026-qq8 |
| "Earth's new temporary moon didn't get noticed instantly" | Universe Magazine | 6 Nov 2026 | https://universemagazine.com/en/earths-new-moon-spotted-later-than-expected/ |
| "Asteroid 2026 QQ8 ... Is Ruled a Natural Object" | XenoSpectrum | 7 Nov 2026 | https://xenospectrum.com/en/qq8-natural-origin-follow-up/ |

**Which object:** **2026 QQ8**, a temporarily captured **mini-moon**. It is not 2025 PN7, 2024 PT5 or Kamo'oalewa. detik credits The Daily Galaxy as its source.

**Verdict:** The story is **fresh**. The MPC announced the object on 29 Oct 2026, English outlets covered it on 4–7 Nov, and detik followed on 8 Nov. The headline is **partly accurate**. "Bulan kedua" is a loose but defensible label, because 2026 QQ8 really is gravitationally bound to Earth for now, unlike a quasi-moon. Two parts are hype. First, it is a **1–2 m rock**, not a moon in any everyday sense. Second, "misterius" mostly refers to the debate over whether it was natural or space junk, which the MPC settled in favour of natural. The detik body text is careful: it correctly separates mini-moon from quasi-moon and puts 2026 QQ8 in the mini-moon class. Note that **Earth has had several quasi-moons for years**. The "second moon" framing ignores them and also ignores earlier mini-moons.

---

## 2. Verified facts

### A. 2026 QQ8

1. **Official status.** The MPEC title is "Temporarily Captured Object". It says: "Orbit integrations indicate that this object is temporarily bound to the Earth", and "No link to a known artificial object has been found. Further observations and dynamical studies are strongly encouraged."
   - Source: https://minorplanetcenter.net/mpec/K26/K26U95.html. Confidence: **HIGH**.
2. **Discovery.** The first astrometry is dated **2026 Aug 19.92 UT** (evening of 19 Aug, UT), from station **K88, GINOP-KHK Piszkéstető (Hungary), observer K. Sárneczky, 0.60-m Schmidt + CCD**. Outlets say "20 August" or "night of 19–20 August"; both fit. Follow-up came from Višnjan (Croatia), Schiaparelli (Italy), Hakos (Namibia), Tenerife (Spain), the Wide-field Mufara Telescope (Italy), the **Lowell Discovery Telescope 4.3 m** (Arizona) and the **University of Hawaii 2.24 m** on Maunakea (D. J. Tholen, last observation **9 Oct 2026**).
   - Source: MPEC observer list. Confidence: **HIGH**.
3. **Natural, not junk: radiation pressure.** The orbit fit includes solar radiation pressure. The effective area-to-mass ratio is **(7.94 ± 3.41) × 10⁻⁴ m²/kg** (1σ). Universe Magazine compares this with roughly 60–70 cm²/kg for the rocket stage 2020 SO, about ten times higher, because a hollow stage catches more sunlight per kilogram.
   - Source: MPEC (HIGH); 2020 SO comparison from Universe Magazine (**MED**).
4. **Designation held back.** Observers tracked it as **"Sar2901"**. In its 3 Sep newsletter the MPC withheld a provisional designation until the natural-vs-artificial question was settled.
   - Source: XenoSpectrum; Space.com 26 Oct also mentions "Sar2901" as a possibly artificial candidate mini-moon. Confidence: **MED** (MPC newsletter not read directly).
5. **Size.** Absolute magnitude **H = 31.34** (MPEC) / 31.37 (JPL). Outlets estimate **about 1 m** (EarthSky, detik) or **1–2 m** (Sky at Night, Universe Magazine). Size depends on assumed albedo.
   - Source: MPEC, JPL SBDB, outlets. Confidence: **HIGH** for H; **MED** for size (estimate). Say "sekitar 1–2 meter".
6. **Solar orbit almost a copy of Earth's.** a = **0.989 AU**, e = **0.026**, i = **0.53°**, period **359 days**, orbit class **Aten**, Earth MOID **0.0038 AU**.
   - Source: MPEC; JPL SBDB. Confidence: **HIGH**.
7. **Timeline.** It became bound around **late April 2026** (EarthSky, Sky at Night, detik). JPL lists a close approach on **1 May 2026** at 0.0077 AU with v_inf = 0.00 km/s, the signature of a bound state. The closest approach was **18 Aug 2026 at 0.00359 AU ≈ 537,000 km** (about 1.4× the Moon's distance), one day before discovery. The next listed approach is **13 Dec 2026**, at 0.0090 AU with v_inf = 0.21 km/s, meaning no longer bound.
   - Source: JPL SBDB close-approach table. Confidence: **HIGH** for the numbers; **MED** for "captured late April" (outlet interpretation, consistent with JPL).
8. **When it leaves.** Estimates are **mid-December 2026** (The Debrief), **December** (EarthSky, detik), **December or possibly January** (Sky at Night), and **around January 2027** (Universe Magazine, based on average capture length). The MPEC itself gives no end date.
   - Confidence: **MED**. Say "sekitar Desember 2026, paling lambat awal 2027".
9. **Current distance and brightness.** The MPEC ephemeris for 29 Oct gives Δ = **0.0128 AU ≈ 1.9 million km** and **V ≈ 25.3**. That is far too faint for amateurs; Sky at Night confirms it is not visible in amateur telescopes.
   - Source: MPEC ephemeris. Confidence: **HIGH**.
10. **Roughly decadal visits.** EarthSky says it comes near Earth about every 10 years. JPL lists 1965-Apr-16 (0.0122 AU) and 2058-Dec-19 (0.0128 AU) as the nearest other encounters. Neither led to capture, according to EarthSky and Sky at Night.
    - Confidence: **HIGH** for the JPL dates; **MED** for "no capture" (outlets).
11. **No hazard.** At 1–2 m it would burn up as a fireball if it ever entered the atmosphere.
    - Source: EarthSky, Sky at Night, detik. Confidence: **HIGH** (consistent with physics; multiple outlets).
12. **Non-gravitational term in JPL fit.** JPL's solution includes a radial non-grav acceleration parameter A1 = 1.17 × 10⁻¹⁰ AU/d², i.e. radiation pressure is modelled.
    - Source: JPL SBDB. Confidence: **HIGH**.

### B. Mini-moons vs quasi-moons (mechanics)

13. **Mini-moon definition.** A mini-moon event is an episode where an object's **geocentric orbital energy becomes negative** (bound to Earth) **while inside about three Hill radii**. Granvik et al. (Icarus 2012, "The population of natural Earth satellites", DOI 10.1016/j.icarus.2011.12.003) set up the "temporarily captured orbiter" framework. de la Fuente Marcos et al. use the "<3 Hill radii, negative geocentric energy" criterion and call short episodes "quasi-mini-moon" or "temporarily captured flyby" events.
    - Source: arXiv 2411.08834 abstract (2024 PT5, GTC paper); RNAAS 8:224 opening line. Confidence: **HIGH**.
14. **Hill sphere.** Earth's Hill radius is r_H ≈ a·(m_E / 3M_☉)^(1/3) ≈ 1 AU × 0.01 ≈ **1.5 million km**. Inside it, Earth's pull dominates over the Sun's tide. EarthSky and Sky at Night describe 2026 QQ8 crossing the Hill sphere in April. Note: on 29 Oct it was about 1.9 million km away, outside 1 r_H but inside 3 r_H, which is consistent with the bound definition above.
    - Confidence: **HIGH** (standard formula); the interpretation of its current position is **MED** (my computation).
15. **Typical mini-moon.** Grigori Fedorets (University of Helsinki), at EPSC 2026: a typical mini-moon stays **about nine months** and circles Earth **roughly three times**. The largest mini-moon present at any moment is typically **about 75 cm**. A **3 m** object should be captured every **10–20 years**. Only **2006 RH120** and **2020 CD3** are confirmed full mini-moons, both found by the Catalina Sky Survey. **2022 NX1** and **2024 PT5** were captured briefly **without completing a full orbit**.
    - Source: Space.com, 26 Oct 2026, https://www.space.com/space-exploration/rubin-telescope-should-find-more-of-earths-mysterious-mini-moons-including-some-we-can-study-up-close (excerpt read). Confidence: **MED** (single report of a talk).
16. **2020 CD3.** Diameter **1.2 (+0.4/−0.2) m**. It was captured for **at least 2.7 years**, and an artificial origin was ruled out by its area-to-mass ratio and colours. A precovery paper confirmed the capture time.
    - Source: arXiv 2011.10380 abstract; Naidu et al., ApJL 2021, DOI 10.3847/2041-8213/abf836. Confidence: **HIGH**.
17. **2024 PT5.** RNAAS title: "A Two-month Mini-moon: 2024 PT5 Captured by Earth from September to November" (de la Fuente Marcos & de la Fuente Marcos, RNAAS 8:224, Sep 2024). ATLAS (South Africa unit) found it on 7 Aug 2024, about 10 m across (Atlas Obscura). A Lowell/IRTF spectrum matched lunar samples, and the authors proposed lunar ejecta (arXiv 2412.10264).
    - Confidence: **HIGH** for the paper titles and claims; **MED** for size and discovery details (Atlas Obscura).
18. **Quasi-moon.** A quasi-moon orbits **the Sun**, not Earth, with a period of about one year. In a frame rotating with Earth it appears to loop around Earth, sometimes ahead and sometimes behind. Astronomy.com counts **Kamo'oalewa as one of only seven known quasi-moons** and "by far the most stable".
    - Source: EarthSky (PN7 article); Astronomy.com, 15 Jul 2026. Confidence: **HIGH** for the concept; **MED** for the count of seven.
19. **2025 PN7.** RNAAS 9:235 (Sep 2025), "Meet Arjuna 2025 PN7, the Newest Quasi-satellite of Earth". Found by **Pan-STARRS (Haleakala)**. EarthSky says it is about **19 m** across, around magnitude 26, and in a quasi-satellite state from the **1960s to the 2080s**, switching between horseshoe and quasi-satellite phases. A VLT spectrum (arXiv 2610.17981, Oct 2026) shows it is **B-type, asteroid-belt-like, not lunar**.
    - Confidence: **HIGH** for the paper metadata and VLT abstract; **MED** for size and dates (EarthSky).
20. **Horseshoe orbit.** In the rotating frame the object approaches Earth from behind, slows, reverses, then approaches again from the front, tracing a horseshoe. Co-orbitals can switch between horseshoe and quasi-satellite states.
    - Source: EarthSky; RNAAS 8:224 opening ("NEOs that follow horseshoe paths ... may undergo mini-moon events"). Confidence: **HIGH**.
21. **Arjuna belt.** The Arjunas are small bodies on Earth-like orbits. The first was 1991 VG (Spacewatch, Dec 1991). Today **more than 100** are known, forming "the Arjuna secondary asteroid belt, the closest to Earth".
    - Source: RNAAS 9:235 opening paragraph. Confidence: **HIGH**. 2026 QQ8 (a = 0.989 AU, e = 0.026, i = 0.5°) fits this group by its orbit; I found no source that explicitly labels it an Arjuna, so treat that label as **MED**.

### C. Kamo'oalewa and Tianwen-2

22. **Lunar-origin claim (2021–2024).** Sharkey et al. 2021 (Commun. Earth Environ., DOI 10.1038/s43247-021-00303-7) reported a "lunar-like silicate" spectrum. Castro-Cisneros et al. 2023 (DOI 10.1038/s43247-023-01031-w) found lunar ejecta compatible with rare orbital pathways. Jiao et al. 2024 (Nature Astronomy, DOI 10.1038/s41550-024-02258-z) linked it to the Giordano Bruno crater.
    - Confidence: **HIGH** (Crossref metadata).
23. **Challenged in 2026.** JWST NIRSpec (Feb 2026) found a spectrum **"notably less red"** than the ground data, more like typical silicate asteroids. New LBT colours (Apr 2026) agree (arXiv 2606.24017). A Chinese team argues for LL-chondrite material that is heavily space-weathered (Nature Communications, May 2026; arXiv 2603.28102). The PN7 VLT paper says the red Kamo'oalewa spectrum "was recently found to be flawed".
    - Confidence: **HIGH** that the claim is now contested.
24. **Tianwen-2.** Launched **29 May 2025** from Xichang. The CNSA announced arrival within **20 km** of Kamo'oalewa on **6 Jul 2026**. The sample capsule is due back in **late 2027**, after which the spacecraft continues to comet **311P/PanSTARRS**. Kamo'oalewa is "a few dozen metres" across and was found from Hawaii in 2016 (2016 HO3).
    - Source: Astronomy.com 15 Jul 2026; DW 6 Jul 2026; SpaceNews 6 Jul 2026 (lead only). Confidence: **HIGH**.

### D. Detection

25. **Survey telescopes.** Mini-moons and co-orbitals are found by asteroid surveys: Catalina (2006 RH120, 2020 CD3), ATLAS (2024 PT5), Pan-STARRS (2025 PN7, Kamo'oalewa), and individual hunters such as Sárneczky (2026 QQ8). Rubin's LSST should raise discovery rates. A 2025 study predicts about 6 lunar-origin asteroids larger than 5 m per year (arXiv 2510.23155). Sky at Night says Earth may host up to about half a dozen temporary moons at once.
    - Confidence: **HIGH** for the discoverer attributions; **MED** for predictions.
26. **Known fake mini-moons.** **J002E3** (2002) turned out to be an Apollo Saturn V third stage (Atlas Obscura). **2020 SO** was the Centaur stage of Surveyor 2 (1966), betrayed by its spectrum and radiation pressure (Universe Magazine).
    - Confidence: **HIGH** (widely documented; read in two outlets).

---

## 3. Mechanism in 7 animation steps (Bahasa Indonesia)

1. **Dua pelari di lintasan yang sama.** Bumi dan batu kecil sama-sama mengelilingi Matahari. Orbit 2026 QQ8 hampir kembar dengan Bumi: 359 hari, miring cuma setengah derajat.
2. **Kecepatan relatif nyaris nol.** Karena jalurnya mirip, batu itu mendekat pelan-pelan, bukan menyambar.
3. **Masuk "wilayah gravitasi" Bumi.** Bola Hill, radius sekitar 1,5 juta km. Di dalamnya tarikan Bumi menang atas Matahari. Akhir April 2026, energinya relatif terhadap Bumi jadi negatif: terikat.
4. **Orbit berantakan.** Bukan lingkaran rapi seperti Bulan, tapi lingkaran-lingkaran kusut, kadang sampai 1,9 juta km jauhnya.
5. **Ketahuan belakangan.** 19–20 Agustus, sehari setelah titik terdekat (sekitar 537 ribu km), teleskop 60 cm di Hungaria menangkap titik redup.
6. **Batu atau sampah roket?** Cahaya Matahari mendorong benda ringan-berongga lebih kuat. Dorongannya kecil, jadi ini batu padat. MPC, 29 Oktober: alami, terikat sementara.
7. **Matahari menarik kembali.** Tarikan Matahari terus mengganggu, dan sekitar Desember 2026 batu itu lepas dan kembali mengelilingi Matahari sendirian. Ia akan lewat dekat lagi tahun 2058, tapi tidak tertangkap.

Quasi-moon contrast (one beat): Kamo'oalewa and 2025 PN7 never leave the Sun's grip. They only *look* like they circle Earth because they run in step with us.

---

## 4. Myths, traps and caveats

- **"Bumi punya bulan kedua seperti Bulan."** No. It is 1–2 m (detik: about 1 m), against the Moon's 3,474 km. Say "bulan mini sebesar manusia/mesin cuci".
- **"Pertama kali Bumi punya bulan kedua."** Wrong. 2006 RH120 and 2020 CD3 were full mini-moons, and 2022 NX1 and 2024 PT5 were brief captures. Several quasi-moons exist now, including Kamo'oalewa and 2025 PN7.
- **Mixing mini-moon and quasi-moon.** 2026 QQ8 = truly bound (mini-moon). 2025 PN7 and Kamo'oalewa = orbit the Sun (quasi-moon). Never call 2026 QQ8 a quasi-moon.
- **"Jarak terdekat 570.000 km."** detik and EarthSky turned the **MOID of 0.0038 AU** (minimum orbit distance) into a closest approach. JPL's actual closest approach is **0.00359 AU ≈ 537,000 km on 18 Aug**. Say "sekitar 540 ribu km, 1,4 kali jarak Bulan".
- **"Ditemukan 29 Oktober."** That is the announcement. It was **discovered 19–20 Aug** and captured around **late April**.
- **Exact exit date.** There is no official date. Say "sekitar Desember 2026, mungkin awal 2027".
- **"Bisa dilihat dengan teleskop."** No. V ≈ 25, out of amateur reach.
- **"Berbahaya."** No. A 1–2 m rock burns up.
- **"Kamo'oalewa pasti pecahan Bulan."** It is contested as of 2026 (JWST, LBT, LL-chondrite papers). Say "dulu diduga pecahan Bulan, data terbaru meragukannya; Tianwen-2 akan menjawab".
- **"Asal 2026 QQ8 dari Bulan."** There is no spectrum and no source for this. Do not claim it.
- **"Mengorbit Bumi berkali-kali."** Unknown whether 2026 QQ8 completes a full revolution. Say "berputar-putar di sekitar Bumi".
- **detik 21 Jul 2026 "bulan mini dipotret pertama kali" (2024 PT5, MUSE/VLT, via NY Post).** Unverified, and the stated size is off. Do not use.
- **"Sar2901 = 2026 QQ8."** Per XenoSpectrum only (MED).

---

## 5. Hook angles (90-second Indonesian video)

1. **"Sejak April, Bumi punya bulan kedua. Dan tidak ada yang tahu sampai Agustus."** Strongest: a mystery plus a deadline.
2. **"Bulan kedua Bumi ukurannya... sebesar kamu."** Scale shock (1–2 m vs 3,474 km).
3. **"Bulan Desember nanti, Bumi akan kehilangan satu bulan."** Countdown framing.
4. **"Astronom sempat mengira ini sampah roket."** The radiation-pressure detective story (J002E3 and 2020 SO precedents).
5. **"Bulan kedua vs bulan palsu."** Mini-moon (truly captured) vs quasi-moon (only looks like it), with Kamo'oalewa and China's Tianwen-2 sitting next to one right now.
6. **"Orbitnya 359 hari, hampir kembar Bumi."** That is why Earth can "catch" it at all.
7. **"Kembali tahun 2058, tapi tak akan tertangkap lagi."**

---

## 6. Visual / 3D beat ideas

- **Open:** night sky with the real Moon. A tiny second dot appears, with a HUD tag "2026 QQ8 · ±1–2 m". Hard zoom to a human silhouette for scale.
- **Two-frame trick:** split view. Left is a Sun-centred frame: Earth and the rock on nearly identical circles. Right is the Earth-centred rotating frame: the rock traces tangled loops around Earth. This single visual explains capture.
- **Hill sphere bubble:** a translucent sphere (1.5 million km) around Earth, with a 3 r_H faint outer shell. The rock drifts in during April and a "geocentric energy" gauge flips from + to −.
- **Discovery beat:** a Schmidt telescope dome in Hungary, CCD frames blinking, a streak among stars, a date stamp of 19 Aug 2026.
- **Junk-or-rock test:** sunlight arrows push a hollow rocket stage (big drift) and a rock (small drift). The MPEC number 7.94 × 10⁻⁴ m²/kg appears on a HUD panel. Good spot for the AUDIRA brand label.
- **Exit:** a December calendar flips over and the loops unwind into a solar orbit. Text: "kembali 2058, tak tertangkap".
- **Quasi-moon coda:** Kamo'oalewa with a Tianwen-2-style probe (generic, unbranded) hovering 20 km away, and a "?" between the Moon and the asteroid belt.

---

## 7. Open questions / unverified

- Exact escape date and whether 2026 QQ8 completes a full geocentric revolution: no dynamical paper found yet (no RNAAS on QQ8 located as of 9 Nov).
- MPC's 30 Oct explanatory note and 3 Sep newsletter ("Sar2901"): not read directly.
- Size depends on albedo; there is no spectrum or colour data, so composition and origin are unknown.
- Space.com (5 Nov) and Gizmodo bodies: not read (render issue / 403). The Daily Galaxy (detik's source): not read.
- RNAAS 9:235 and 8:224 full text: blocked after the first fetch; PN7 and PT5 dates and sizes rest on EarthSky and Atlas Obscura.
- Fedorets' EPSC 2026 statistics: one Space.com report only.
- Whether 2026 QQ8 is formally classed as an Arjuna: inferred from its orbit, not stated by a source.
