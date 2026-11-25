# EP10 — Combine harvester: research notes

Research date: 2026-11-06. This file holds research only, not a script.
Method: Google News RSS links were decoded to real URLs. Manufacturer pages (Kubota Myanmar, Kubota Malaysia, Siam Kubota, Case IH US) were read with Python. Bing was searched through the browser pane.

---

## 1. Viral hook: is it recent?

All hook articles are from **Realitas Online** (realitasonline.id, Otomotif section, editor Miftahul Zannah).

| Headline | Published | URL |
|---|---|---|
| "Dua Mesin Raksasa Kubota DC105X dan DC108X Turun ke Sawah, Aksi Panen Padi Kali Ini Bikin Takjub!" | **Fri 30 Oct 2026, 20:08 WIB** | https://www.realitasonline.id/otomotif/102417835752/dua-mesin-raksasa-kubota-dc105x-dan-dc108x-turun-ke-sawah-aksi-panen-padi-kali-ini-bikin-takjub |
| "Case IH 8260 Beraksi di Ladang Jagung, Sekali Melaju Ribuan Tanaman Langsung Tumbang dan Hasil Panen Mengalir Tanpa Henti" | **Fri 30 Oct 2026, 19:35 WIB** | https://www.realitasonline.id/otomotif/102417835723/case-ih-8260-beraksi-di-ladang-jagung-sekali-melaju-ribuan-tanaman-langsung-tumbang-dan-hasil-panen-mengalir-tanpa-henti |
| "KUBOTA DC105X Beraksi di Sawah, Kerja Sama Mesin Pemanen dan Truk Pengangkut Ini Bikin Proses Panen Padi Makin Cepat dan Aman" | **Thu 5 Nov 2026, 19:05 WIB** | https://www.realitasonline.id/otomotif/102417862635/kubota-dc105x-beraksi-di-sawah-kerja-sama-mesin-pemanen-dan-truk-pengangkut-ini-bikin-proses-panen-padi-makin-cepat-dan-aman |
| Other DC105X/DC108X pieces (headlines only) | 8, 13, 15, 20 and 29 Oct and 4–5 Nov 2026 | Google News RSS |

**Verdict:** The articles are **recent** (30 Oct – 5 Nov 2026), and the outlet publishes them as a **series** of near-daily items.
- They are **not news events**. Each one is written from a **YouTube screenshot**: "Machine 11 TV", "Machine TV Cambodia", and "bigtractorpower" for the Case IH piece. One headline says the footage is from **Cambodia**.
- They contain **no specs or numbers**.
- The hook works as "video viral mesin panen". Do not claim it is an Indonesian news event.
- The Case IH 8260 piece is about a **corn** field. It is not rice.

---

## 2. Verified facts

### A. Kubota DC-105X (rice, track-type, Asia)

Source for every item in this section: Kubota Myanmar official page, https://www.kubota.com.mm/en/products/harvester/dc105x/index.html. Confidence **HIGH** (manufacturer), except where noted.

1. **Engine:** V3800DI, 4-cylinder turbo diesel, **3,769 cc**. Output **77.2 kW (105 HP) at 2,600 rpm**. Fuel tank **105 L**.
2. **Size:** **5,640 × 3,045 × 2,800 mm** (L × W × H). Weight **4,630 kg**.
3. **Tracks:** each crawler is **575 × 1,900 mm** (width × ground contact length). Average ground pressure **20.7 kPa**. Ground clearance **325–425 mm**.
4. **Speed:** travel speed up to **1.90 m/s**. Harvesting speed **1.90 m/s**. Hydrostatic (HST) transmission, controlled by a single lever.
5. **Cutting:** pickup reel **900 × 2,590 mm**. Gathering width **2,760 mm**. **Cutter bar 2,667 mm**.
6. **Threshing:** **axial flow**. Threshing cylinder **620 × 2,210 mm** at **550 rpm**. Concave area **1.6 m²**. Sieve case **1,375 × 840 mm**.
7. **Cleaning:** oscillating sieve plus a "3-way air stream".
8. **Grain tank:** **2,350 L**. Unloading auger **3.875 m** long, swings **235°**. Discharge height **1.93–4.81 m**. A full tank empties in **about 90 seconds**.
9. **Harvest capacity:** **5.75–10 acres per day**. Kubota says this was "measured in controlled field trials for Indica rice".
   - That is about **2.3–4.0 ha**. This conversion is our own arithmetic.
   - Confidence: **HIGH** that Kubota claims it, but it is a trial figure.

### B. Kubota DC-108X

10. **Siam Kubota (Thailand) DC-108X.**
    - **108 HP** engine with turbo.
    - **2.76 m header** and a **69 cm** wide conveyor (feeder).
    - Grain tank **1,460 kg** ("1.46 ton").
    - Fuel tank **140 L**.
    - **8-blade fan** that blows air in three directions.
    - Two-layer separation screens.
    - Automatic leveling system.
    - Starting price **1,630,000 Baht**.
    - Source: https://www.siamkubota.co.th/en/combine_harvester/dc108x/
    - Confidence: **HIGH**.
11. **Kubota Malaysia DC-108X CABIN.**
    - Engine V3800DI-TIE2-CT2, **81 kW (108.6 PS) at 2,600 rpm**.
    - Weight **5,040 kg**. Size **5,771 × 3,038 × 2,865 mm**.
    - Crawler **600 × 1,873 mm**. Ground pressure **22 kPa**.
    - Cutter bar **2,667 mm**. Gathering width **2,760 mm**.
    - Threshing cylinder **620 × 2,210 mm** at **550 rpm**. Concave area **1.8 m²**.
    - Grain tank listed as "**1460 [2440]**". This is probably kg [L]; the units are not labelled.
    - Unloader turns **235°** and is driven by an electric motor.
    - The cabin has a **20,000 BTU** air conditioner.
    - Source: https://www.kubotamalaysia.com/products/harvester/dc-108x-cabin/
    - Confidence: **HIGH** for the numbers. The tank units are ambiguous.

### C. Case IH Axial-Flow 8260 (large grain/corn combine, US)

12. **Case IH Axial-Flow 8260.**
    - It is a **Class 8** combine.
    - Engine **480 HP** rated at **2,100 rpm**, **max output 555 HP**.
    - **Feeder width 54 in** (about 1.37 m).
    - **Grain tank 410 bushels** (about 14.4 m³; our own conversion).
    - **Unloading rate 4.5 bushels per second**.
    - Source: https://www.caseih.com/en-us/unitedstates/products/harvesting/axial-flow-260-series/axial-flow-8260
    - Confidence: **HIGH**.
13. **Axial-Flow 260 series.**
    - The series covers **402–550 HP** and Class 7, 8 and 9.
    - It uses a **single rotor** design. Case IH says it pioneered single-rotor combines in the **1960s**; the current rotor is the "AFX rotor".
    - "Harvest Command" automation uses sensors to adjust settings automatically.
    - The header speed automatically matches ground speed.
    - A rotor discharge deflector sends straw to the chopper.
    - Source: https://www.caseih.com/en-us/unitedstates/products/harvesting/axial-flow-260-series
    - Confidence: **HIGH**.
14. **Header width for the 8260:** **not given** on the Case IH page. It depends on the header fitted.
    - A product-bank.com listing in Bing results claims 571 HP and a 14,400 L tank. This is a third-party source, unverified, and it conflicts with Case IH's 555 HP. **Do not use it.**

### D. General mechanism and history

15. **Combine parts,** from the Wikipedia diagram labels, in order of crop flow: reel, cutter bar, header auger, grain conveyor (feeder), stone trap, threshing drum, concave, straw walker, grain pan, fan, top (adjustable) sieve, bottom sieve, tailings conveyor and re-threshing, grain auger, grain tank, straw chopper, unloading auger.
    - Source: https://en.wikipedia.org/wiki/Combine_harvester
    - Confidence: **MED**.
16. **Rotary design.** In a rotary combine, a **helical rotor** strips the grain, instead of rasp bars on a cylinder working against a concave. Rotary combines were introduced by **Sperry-New Holland in 1975**.
    - Source: Wikipedia, same page.
    - Confidence: **MED**.
    - Note: Case IH claims single-rotor development from the 1960s (item 13). The two claims are about different milestones.
17. **History.** Hiram Moore patented the first combine in the US in **1835**. The unloading auger was invented by **Lyle Yost in 1947**.
    - Source: Wikipedia, same page.
    - Confidence: **MED**.

### E. Indonesia context

18. **Kementan "Combine Harvester Besar" handover in Pinrang.**
    - On **29 July 2026**, the Kementerian Pertanian handed **5 units** of Combine Harvester Besar (CHB) to 5 *Brigade Pangan* groups in Pinrang, Sulawesi Selatan.
    - This was part of the **Program Bantuan Alsintan TA 2026**. The stated goals are to speed up harvest, cut harvest losses, lower costs, and support *swasembada pangan*.
    - Source: Terkini.id Makassar, 30 Jul 2026, https://makassar.terkini.id/kementerian-pertanian-salurkan-lima-unit-combine-harvester-besar-perkuat-brigade-pangan-di-pinrang/
    - Confidence: **MED** (single regional outlet, Polbangtan release).
19. **Other 2026 Kementan combine aid headlines** (Google News RSS, not opened):
    - Siak, Riau (ANTARA Riau, 9 Apr 2026: "Dua unit mesin panen padi modern dari Kementan RI tiba di Siak")
    - Aceh Tengah (4 Jun 2026)
    - Gresik (detik, 25 Jun 2026)
    - Luwu (14 Sep 2026)
    - Confidence: **MED** (headlines only).
    - No national total number of units was found.

---

## 3. Mechanism in 8 animation steps (Bahasa Indonesia)

1. **Kincir menunduk.** Reel (kincir) berputar dan merebahkan batang padi ke arah pisau. Di DC-105X lebarnya 2,59 m.
2. **Pisau gunting.** Cutter bar (2,667 mm) bergerak bolak-balik seperti gunting rambut, memotong batang di dekat pangkal.
3. **Ulir dan ban berjalan.** Ulir header menggiring potongan ke tengah. Feeder house (69 cm di DC-108X, 54 inci di Case IH 8260) mengangkatnya ke "perut" mesin.
4. **Rontok.** Silinder perontok (620 mm × 2,21 m, 550 rpm di Kubota) atau rotor tunggal (Case IH) memutar jerami di atas concave (saringan lengkung). Gabah terlepas dari malainya.
5. **Pisah.** Gabah jatuh menembus lubang concave. Jerami panjang terus berjalan ke belakang.
6. **Ayak dan tiup.** Ayakan bergoyang sementara kipas (8 bilah di DC-108X) meniupkan angin. Kotoran ringan terbang keluar dan gabah yang berat turun. Bulir yang belum lepas dikirim balik untuk dirontok ulang.
7. **Tangki gabah.** Ulir mengangkat gabah bersih ke tangki: 2.350 L di DC-105X, 410 bushel di Case IH 8260.
8. **Bongkar dan buang jerami.** Pipa pembongkar berayun (235° di Kubota) menuang gabah ke truk; DC-105X mengosongkan tangki penuh sekitar 90 detik dan Case IH 4,5 bushel per detik. Di belakang, jerami dicacah atau dihamparkan kembali ke sawah.

---

## 4. Caveats and disputed points

- **The Realitas Online hooks are YouTube-sourced filler.** They name no place, date or farmer, and at least one shows footage from Cambodia. Present them as "video viral", not as news.
- **The Case IH 8260 article is about corn.** Its threshing setup (rotor + concave for corn) differs in settings from rice. Keep the visual focus clear: Kubota for padi, Case IH for scale contrast.
- **Kubota specs vary by market.** The Myanmar DC-105X tank is 2,350 L; the Thai DC-108X is 1,460 kg; the Malaysia DC-108X is "1460 [2440]" with unclear units. State which market a number comes from, or round it (for example "tangki sekitar 2.000-an liter").
- **The "5.75–10 acre/day" figure** is a Kubota controlled-trial claim for Indica rice. It is not a field guarantee.
- **The Case IH header width is not specified.** Do not state one.
- **The third-party "571 HP / 14,400 L" figure contradicts Case IH (555 HP max).** Rejected.
- **The Kubota threshing system is officially "axial flow"** on both DC-105X and DC-108X. It is a cylinder with teeth, so it is axial-flow but not the same machine as Case IH's big rotor.
- **No verified data was found** on national combine-harvester counts in Indonesia or on loss-reduction percentages. Do not cite numbers there.

## 5. Blocked or unread sources

- WebFetch: broken (model error). curl and Python were used instead. DuckDuckGo HTML returned a blank page; Bing through curl was blocked; Bing in the browser pane worked.
- riau.antaranews.com: SSL certificate verification failed. Not bypassed. Unread.
- Kubota Malaysia DC70G/DC105X brochure PDF: downloaded to the scratchpad but not parsed (it is image-based). The web spec pages were used instead.
- siamkubota.co.th spec table section: only the features text was extracted. The full spec table was not parsed.
- Kubota Indonesia (kubota.co.id): connection failed (HTTP 000).
