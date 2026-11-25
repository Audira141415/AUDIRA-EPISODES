# EP 23: PLTN Terapung untuk Halmahera: Cara Kerja Pembangkit Nuklir di Atas Kapal

AUDIRA, seri CARA KERJA VIRAL. Created by Agus Dwi R. Status: final dengan voice-over, 9 November 2026.

Riset dari sumber yang dibaca langsung 9 November 2026. Setiap fakta berlabel HIGH, MED, atau LOW; naskah hanya memakai HIGH dan MED.

# EP23 — How a floating nuclear power plant works (PLTN terapung): research notes

Research date: 2026-11-09. This file holds research only, not a script.
Method: Google News RSS (Indonesian and English), with links decoded to real URLs through Google's batchexecute endpoint until Google returned HTTP 429. Bing News RSS was the fallback for English links. Article HTML was read with Python urllib (browser User-Agent, normal TLS verification) and tags were stripped. Primary or near-primary sources read directly: **World Nuclear Association** (Indonesia country profile; Nuclear-Powered Ships page, which holds the floating-plant section), **World Nuclear News** (19 Oct 2026 Indonesia deal; 30 Oct 2026 Akademik Lomonosov environment report; Dec 2019 grid connection), and the **ThorCon / Fleet Nuclear** websites. BAPETEN's own website returned HTTP 403, so BAPETEN statements come from verbatim quotes in Dunia Energi and Kompas.id. **Kompas.id is paywalled**: the first ~12 paragraphs of the 4 Nov article rendered and were read; the rest was not. Bisnis.com returned 403. IAEA PRIS returned no readable reactor page.

---

## 1. Viral hook: is it recent?

| Headline | Outlet | Published | URL |
|---|---|---|---|
| "Pembangkit Listrik Tenaga Nuklir Terapung Siap Dikembangkan, Aturan Pengawasan Dimatangkan" (the brief's hook; paywalled, first part read) | Kompas.id | **4 Nov 2026**, 18:34 WIB | https://www.kompas.id/artikel/pembangkit-listrik-tenaga-nuklir-terapung-siap-dikembangkan-aturan-pengawasan-dimatangkan |
| "Rosatom signs floating nuclear power deal for Indonesia" | World Nuclear News | 19 Oct 2026 | https://www.world-nuclear-news.org/articles/rosatom-signs-floating-nuclear-power-deal-for-indonesia |
| "RI, Rosatom sepakati proyek ekspor pasokan listrik dari PLTN terapung" | ANTARA | 17 Oct 2026 | https://m.antaranews.com/berita/5793405/ri-rosatom-sepakati-proyek-ekspor-pasokan-listrik-dari-pltn-terapung |
| "Rosatom dan RI Sepakati Pasokan Listrik dari PLTN Terapung 200 MW di Malut" | detikFinance | 19 Oct 2026 | https://finance.detik.com/energi/d-8714004/rosatom-dan-ri-sepakati-pasokan-listrik-dari-pltn-terapung-200-mw-di-malut |
| "Rosatom Signs Deal for 200 MW Floating Nuclear Power Project in Indonesia" | Jakarta Globe | 16 Oct 2026 | https://jakartaglobe.id/business/rosatom-signs-deal-for-200-mw-floating-nuclear-power-project-in-indonesia |
| "Indonesia dan Rosatom Sepakat Bangun PLTN Terapung 200 MW di Halmahera" | Fortune Indonesia | 19 Oct 2026 | https://www.fortuneidn.com/news/indonesia-dan-rosatom-sepakat-bangun-pltn-terapung-200-mw-di-halmahera-00-my5jv-zsgb98 |
| "BAPETEN Buka Suara Soal Rencana PLTN Terapung di Maluku Utara: Belum Ada Izin Masuk" | Dunia Energi | 31 Oct 2026 | https://www.dunia-energi.com/bapeten-buka-suara-soal-rencana-pltn-terapung-di-maluku-utara-belum-ada-izin-masuk/ |
| "BAPETEN: Rosatom Baru Konsultasi 3S, Izin Operasi PLTN Terapung di Malut Belum Diajukan" | Dunia Energi | 3 Nov 2026 | https://www.dunia-energi.com/bapeten-rosatom-baru-konsultasi-3s-izin-operasi-pltn-terapung-di-malut-belum-diajukan/ |
| "Update Rencana BUMN Nuklir Rusia Bangun PLTN Terapung di RI" (Wamen ESDM, 28 sites) | Bloomberg Technoz | 23 Oct 2026 | https://www.bloombergtechnoz.com/detail-news/125505/update-rencana-bumn-nuklir-rusia-bangun-pltn-terapung-di-ri |
| "Rosatom Mau Bangun PLTN di Halmahera, Sulit Gantikan PLTU Smelter" | Bloomberg Technoz | 30 Oct 2026 | https://www.bloombergtechnoz.com/detail-news/126288/rosatom-mau-bangun-pltn-di-halmahera-sulit-gantikan-pltu-smelter |
| "PT Thorcon Power Indonesia Resmi Dibubarkan..." | Dunia Energi | 26 Oct 2026 | https://www.dunia-energi.com/pt-thorcon-power-indonesia-resmi-dibubarkan-mantan-direksi-tak-pengaruhi-peta-jalan-nuklir-ri/ |
| "Rekam Jejak Thorcon di RI: Ambisi PLTN Terapung hingga Dibubarkan" | Bloomberg Technoz | 26 Oct 2026 | https://www.bloombergtechnoz.com/detail-news/125794/rekam-jejak-thorcon-di-ri-ambisi-pltn-terapung-hingga-dibubarkan |
| "Nasib PLTN Pertama RI: Target 2032 Diragukan Usai ThorCon Bubar" | Bloomberg Technoz | 27 Oct 2026 | https://www.bloombergtechnoz.com/detail-news/125837/nasib-pltn-pertama-ri-target-2032-diragukan-usai-thorcon-bubar |
| "JATAM Malut Ungkap Risiko PLTN Terapung..." | halmaheranesia.com | 22 Oct 2026 | https://halmaheranesia.com/2026/10/22/jatam-malut-ungkap-risiko-pltn-terapung-yang-bakal-beroperasi-di-halmahera/ |
| "PLTN Terapung 200 MW Buatan Indonesia-Rosatom Curi Perhatian Dunia di WETEX Dubai" | Dunia Energi | 4 Nov 2026 | https://www.dunia-energi.com/pltn-terapung-200-mw-buatan-indonesia-rosatom-curi-perhatian-dunia-di-wetex-dubai/ |
| "Floating nuclear power plant 'has boosted air quality'" (Akademik Lomonosov) | World Nuclear News | 30 Oct 2026 | https://www.world-nuclear-news.org/articles/floating-nuclear-power-plant-has-boosted-air-quality |

**Verdict:** The story is **fresh and live**, but the brief's guess about the project is out of date. The Indonesian floating-plant story of autumn 2026 is **Rosatom's 200 MW FPU-100 deal for North Halmahera, North Maluku** (signed 16 Oct 2026 in Moscow), **not ThorCon**. ThorCon's Indonesian company was **dissolved by its shareholders on 20 Oct 2026**, four days later. The Kompas 4 Nov piece reports a BAPETEN director at a "PLTN 2032" seminar. It says rules for floating plants are **still being drafted**. "Siap dikembangkan" in the headline means the option is on the table, not that anything is approved or being built.

---

## 2. Verified facts

### A. The Rosatom–Halmahera deal (Oct 2026)

- **What was signed:** an electricity-supply agreement between **Rosatom** and **PT Pembangkit Listrik Nuklir**, an Indonesian **private** company. It is not a government-to-government treaty and not PLN. Signed **16 Oct 2026** at Russian Energy Week, Moscow. (WNN, ANTARA, Jakarta Globe; HIGH.) The director calls it a PPA (Perjanjian Jual Beli Listrik) at WETEX (Dunia Energi, 4 Nov; MED, company's own wording).
- **Hardware:** **two FPU-100 floating power units**, **200 MW combined** (100 MW each), with **RITM-series** reactors (RITM-200M per Fortune and Dunia Energi), derived from Russia's newest nuclear icebreakers. (HIGH.)
- **Where:** to supply the **northern part of Halmahera Island, North Maluku** (Halmahera Utara regency). There is no named mooring site, coordinates or tapak yet. (HIGH that no site is public.)
- **When:** "first electricity **no earlier than five years after the key terms of the power supply contract take effect**" (ANTARA wording: "paling cepat lima tahun"). So the earliest is roughly 2031, and only if the contract terms take effect now. (HIGH.)
- **Money and ownership:** business-to-business, private investment, **no APBN** (state budget) money. Under Rosatom's model the units **stay Rosatom-owned and Rosatom-operated**, and the customer pays for the electricity (WNN; HIGH). JATAM cites a purchase over the facility's life of "up to 60 years" (MED). WNN gives the export FPU's assigned service life as up to 60 years.
- **People:** director **Prof. Yudi Utomo Imardjoko** (nuclear scientist, UGM background; MED on affiliation). The investor is **Romo Nitiyudo Wachjo** ("Haji Robert"). Local outlets (Zona Malut) and a former ThorCon director link him to a mining business in North Halmahera (MED). Rosatom DG **Alexey Likhachev** calls it "the world's first-ever export agreement for electricity supply from a floating power unit".
- **Backstory:** Prabowo met Putin in Moscow on 31 Jul 2024, when he was defence minister and president-elect. Likhachev met Prabowo in May 2026 (Fortune; MED). Rosatom proposes **two phases**: small floating units first, then large land-based plants (WNN; HIGH). In **April 2025** Rosatom proposed a 2 × 55 MWe RITM-200M floating plant for **West Kalimantan** for 2030–31, plus 3 × 110 MWe land SMRs (WNA; HIGH). Rosatom and BATAN signed a floating-plant cooperation agreement in **August 2015** (WNA).

### B. Regulation and status as of Nov 2026 (the Kompas hook)

- **BAPETEN, 31 Oct 2026** (press statement, Kepala Biro Hukum Ishak): **no consultation and no formal licence application** had been received specifically for the North Maluku plan. "Konsultasi awal bukanlah persetujuan maupun jaminan penerbitan izin." Land and floating plants will be treated the same. (HIGH.)
- **BAPETEN, 3 Nov 2026** (Plh. Kepala Biro, Abdul Qohar Teguh Eko Prasetyo): Rosatom **has now filed a 3S pre-licensing consultation request** (Safety, Security, Safeguards) and BAPETEN is reviewing the documents. Russia's regulator **Rostechnadzor visited BAPETEN**. The **operating licence has not been applied for**. (HIGH. Dunia Energi prints "(3/10/2026)", an obvious typo for 3 Nov.) The two statements conflict on whether a consultation exists. Read them as: none on 31 Oct, a 3S consultation request acknowledged by 3 Nov.
- **Kompas, 4 Nov 2026** (Nur Syamsi, Direktur Pengaturan Pengawasan Instalasi dan Bahan Nuklir, BAPETEN, at the "PLTN 2032" seminar):
  - Existing rules mostly cover **water-cooled reactors**. They did not consider modularity or siting **in water**.
  - Under the **Peraturan Pemerintah**, "tapak" (site) currently means a **land location only**. This is being revised to include **perairan** (waters).
  - The design rules are being revised to add provisions for **SMRs, floating plants and micro-reactors**. The licensing workflow for floating plants is **still being prepared**.
  - **Licensing split (mapped):** the **vendor country** handles design, construction, commissioning and transport licences, **including ship classification**. The **host country** (Indonesia) handles the **site licence, operating licence, and approval to use a foreign vessel**.
- **ESDM:** Deputy Minister **Yuliot Tanjung** (22 Oct 2026) said about **28 potential sites** exist, more are being added "because there was also the floating plan", each needs site evaluation, and PLN would then tender (Bloomberg Technoz; HIGH). The **NEPIO** (Badan Pelaksana Program Energi Nuklir) Perpres was drafted and was "on the President's desk" per DG EBTKE Eniya Listiyani Dewi (7 Jan 2026). A former ThorCon director said on 26 Oct 2026 that Rosatom signed "without waiting for the NEPIO Perpres". So, as of Nov 2026, NEPIO is apparently **not yet formed** (MED).
- **National targets** (WNA; HIGH): RUPTL 2025–2034 (May 2025) is the first to include nuclear: **250 MWe in Sumatra–Bangka by 2032** and **250 MWe in Kalimantan by 2033** (accelerated scenario). Its studies name **28 potential sites**, up to 70 GWe. **PP 40/2025** (Sept 2025, new national energy policy) sets nuclear at **0.4% of the energy mix by 2032** and **12.1% by 2060**. In Dec 2022 the target year for a first plant was 2039, which Prabowo's administration pulled forward to 2032–2034.
- **Expert skepticism:** Unpad's Yayan Satyakti puts 2 × 100 MW at a 90% load factor at ≈ **1.59 TWh/yr**. That is about **5%** of the 31.8 TWh from the 4.5 GW captive coal plants at the IWIP nickel park, so it is "not a smelter solution" (Bloomberg Technoz, 30 Oct; HIGH as a quote, and the arithmetic checks: 200 MW × 8,760 h × 0.9 = 1.58 TWh). ITPLN's Agus Puji Prasetyono doubts the 2032 target because "no SMR in the world is proven yet" (27 Oct). That claim needs nuance: Akademik Lomonosov is a working small reactor plant. See §4.
- **Opposition:** **JATAM Malut** (Julfikar Sangaji, 21 Oct) raises seismic and tsunami risk, thermal discharge, fisheries, spent fuel, and Fukushima, Chernobyl and TMI as cautions. JATAM itself says these cannot be used to conclude the same would happen in Halmahera. WALHI Malut also raised concerns (headline only).

### C. ThorCon (the earlier Indonesian floating project), now dissolved

- **Design:** **thorium molten-salt reactor**, branded TMSR500 / "PLTT", **500 MWe**, shipyard-built hull towed to site and **ballasted down onto the seabed** (a "ThorConIsle") at **Pulau Gelasa / Kelasa, Bangka Tengah, Bangka Belitung**. The investment was cited at ≈ **US$1.2 billion (~Rp17 trillion)**. The original COD target was about 2030. (WNA, Dunia Energi, Bloomberg Technoz; HIGH.)
- **Timeline** (WNA; HIGH): MoU Oct 2015 (Martingale with INUKI, PLN and Pertamina). PT PAL agreement Jul 2019. 3S consultation agreement with BAPETEN Apr 2023. Licensing documents filed Mar 2025. **BAPETEN approved the site-evaluation plan in Aug 2025**, which is **not a site licence**. The company spoke of construction in 2027 and full power in 2031, subject to licences. The Bangka Belitung DPRD asked ThorCon to **halt field activity** in mid-November 2025 (Bloomberg Technoz). WALHI protested in Sept 2026.
- **Dissolution:** PT Thorcon Power Indonesia was dissolved by **shareholders' circular resolution No. 004/TPI.RUPS.LB/X/2026 dated 20 Oct 2026**, under Akta No. 06 of 22 Oct 2026, and is in liquidation (Dunia Energi, Bloomberg Technoz, kontan liquidation notice; HIGH).
- The **thorconpower.com** homepage now redirects visitors to **Fleet Nuclear** (fleetnuclear.com). Fleet describes an **"F500" 500 MWe molten-salt plant** built in shipyards and is "pursuing US DOE authorization… then Part 53 licensing with the US NRC" (read 9 Nov 2026). The rebrand and pivot to the US are inferred from the site redirect (MED).

### D. Akademik Lomonosov (the only operating floating nuclear plant)

- **Location:** Pevek, Chukotka, Russian Arctic (town population ~5,000), moored with coastal infrastructure. It supplies **heat and power**, and power for the Baimskaya ore zone. (WNN; HIGH.)
- **Reactors:** **two KLT-40S**, **35 MWe each** (70 MWe total), derived from icebreaker reactors, with low-enriched uranium (<20% U-235). (WNN, WNA; HIGH.)
- **Hull:** a non-self-propelled barge, **144 m × 30 m, ~21,000–21,500 t** displacement. (WNN, WNA; HIGH.) It has no engine and was **towed** to Pevek in 2019, a voyage of roughly 5,000 km from Murmansk in Aug–Sep 2019 (MED: dates and distance from memory, not re-read this session).
- **Milestones:** grid connection **Dec 2019**; **commercial operation May 2020** (WNN; HIGH). WNN calls it the first power plant based on small modular reactor technology to generate electricity.
- **Refuelling model** (WNA; HIGH): refuelling **on site every 3–4 years**. After a **12-year operating cycle** the whole plant is **towed back to a shipyard** for a two-year overhaul and storage of used fuel, then returns to service. The first refuelling was reportedly completed around late 2024 or early 2025 (AS.com, Jan 2025; LOW–MED, and that article has errors elsewhere).
- **Environment** (operator report, WNN 30 Oct 2026): after heating load moved to the plant, Pevek's gross air pollutant emissions fell from **11.64 to 2.281 tonnes**. There are 11 automatic radiation-monitoring stations plus 4 in town, and readings are below 10% of permissible limits. This is **the operator's own claim** (MED).
- **Peer review:** a WANO-type peer review in Jul 2026 ranked it "on par with Russia's top units" (WNN headline only, not read; LOW–MED).

### E. Next-generation Rosatom units (what Halmahera would get)

- **RITM-200** (WNA): an **integral PWR** (steam generators inside the reactor vessel), **175 MWt / ~53 MWe**, fuel enriched to **almost 20%** U-235, refuelling every 6–7 years in icebreaker use. **RITM-200M** is the barge version.
- **OFPU / FPU (2nd gen)** (WNA): **two RITM-200M** units at 175 MWt and ~50–55 MWe each on a **~12,000 t** barge, about half the Lomonosov hull. Reactor mass is 2,600 t for both. **Refuelling every 12 years over a 60-year service life.** **Four** are being built for the **Baimskaya copper project** (330 MWe, from 2028); the hulls were built in **Chinese shipyards** after 2022 (Eurasia Review / WNN; HIGH).
- **Inference (MED):** if FPU-100 follows the OFPU layout (two RITM-200M ≈ 100–110 MWe per barge), then the Halmahera deal means **two barges with about four reactors in total**. Suara.com's "dua reaktor" is likely wrong. No source this session states the reactor count for FPU-100 explicitly.
- Rosatom is pitching FPUs to **African coastal states** (Reuters via MSN, 28 Oct 2026). It is studying a **Murmansk finishing yard** because "there will be dozens of floating power units" (Likhachev, Sep 2026).

### F. China and others

- **China has no operating floating nuclear plant** as of Nov 2026 (HIGH by absence; WNA lists only plans). CNNC's **ACP100S** (310 MWt, ~100 MWe, marine version of ACP100) was planned for 2019 operation and **delayed**. CGN's **ACPR50S** (200 MWt, 60 MWe) started a demonstration in Nov 2016 for "2020 power", but **it has not materialised** (WNA). The land-based **Linglong One (ACP100)** began hot testing in Oct 2026 (NucNet headline; MED).
- Other precedent: the **US MH-1A "Sturgis"** was a floating plant on Gatun Lake, Panama Canal Zone, 1967–1976, at **10 MWe net** (WNA; HIGH). So Lomonosov is **not the first floating nuclear plant ever**. It is the only one operating now.
- Concepts: South Korea's BANDI-60S (KEPCO E&C), Samsung plus a US firm (2026), US Long Beach discussion (LA Times, Aug 2026), and Denmark's Seaborg molten-salt "Power Barge" (MoU with Pertamina NRE, Sep 2023, per WNA).

### G. Indonesia's nuclear history (no power reactor yet)

- **Indonesia has no operating nuclear power plant.** It has three research reactors (WNA; HIGH):
  - **RSG-GAS "G.A. Siwabessy"**, Serpong (Banten, PUSPIPTEK), **30 MWt** (normally run at 15 MW), German-built, started **1987**.
  - **TRIGA 2000**, **Bandung**, the first research reactor, started **1964** as a TRIGA Mark II and upgraded to **2 MWt** in 2000. Licence renewal is planned for 2027.
  - **Kartini**, **Yogyakarta**, **100 kWt** TRIGA, started **1979**, used for training (STTN).
- BATAN merged into **BRIN** (2021). **BAPETEN** is the separate regulator. Earlier plans include Muria/Jepara (1990s–2000s), Bangka-Belitung feasibility studies (2015), and the 10 MWt pebble-bed HTR "RDE" at Serpong (2015 onward, not built). Law: **UU 10/1997 on Ketenaganukliran**.

---

## 3. Mechanism in 7 animation steps (Bahasa Indonesia)

1. **Satu atom pecah, panasnya luar biasa.** Neutron menabrak inti uranium-235, inti terbelah dua, melepas panas dan 2–3 neutron baru. Satu gram uranium yang terbelah setara panas dari berton-ton batu bara. *(Analogi: domino yang tiap kepingnya menjatuhkan dua sampai tiga keping lain.)*
2. **Batang kendali = rem.** Agar reaksi tidak liar, batang penyerap neutron (boron/hafnium) dimasukkan atau ditarik. Tujuannya pas satu neutron per pembelahan yang melanjutkan reaksi, jadi reaksi stabil, bukan bom. Saat darurat, batang jatuh masuk dan reaksi berhenti dalam detik.
3. **Air bertekanan membawa panas keluar.** Di reaktor RITM/KLT (jenis PWR), air dipompa melewati bahan bakar pada tekanan tinggi sehingga tidak mendidih walau suhunya ratusan derajat. Air ini juga memperlambat neutron.
4. **Dua sirkuit terpisah.** Air panas dari reaktor memanaskan pipa di pembangkit uap. Air di sirkuit kedua (yang tidak radioaktif) berubah jadi uap. Pada RITM-200, pembangkit uapnya ada di dalam bejana reaktor (desain "integral").
5. **Uap memutar turbin, turbin memutar generator.** Bagian ini sama persis dengan PLTU batu bara. Bedanya hanya sumber panasnya. Listrik keluar lewat kabel ke daratan.
6. **Laut sebagai radiator raksasa.** Uap bekas didinginkan di kondensor oleh air laut, lalu kembali jadi air dan dipompa ulang. Air laut tidak menyentuh air reaktor. Ia hanya pulang sedikit lebih hangat, dan efek panas inilah yang dipersoalkan nelayan dan JATAM.
7. **Pembangkit di atas tongkang, bukan di tanah.** Semua ini dibangun di galangan kapal, lalu ditarik kapal tunda ke lokasi, ditambat di dermaga terlindung atau di balik pemecah gelombang, dan disambung kabel ke darat. Untuk Lomonosov, bahan bakar diganti di tempat tiap 3–4 tahun. Setelah 12 tahun, seluruh pembangkit ditarik pulang ke galangan untuk perombakan. Unit generasi baru dirancang 12 tahun sekali isi ulang. Pada model Rosatom, pembangkitnya tetap milik Rusia, dan Indonesia membeli listriknya.

Molten-salt contrast beat (ThorCon/Fleet, one beat): **bahan bakarnya cair, bukan batang padat.** Uranium dan thorium dilarutkan di garam cair yang panas tapi bertekanan hampir sama dengan udara luar. Kalau listrik padam, sumbat beku meleleh dan garam jatuh ke tangki bawah karena gravitasi, lalu dingin sendiri. Bandingkan PWR yang perlu menahan air bertekanan sekitar 150 kali tekanan udara. (Fleet website for drain-on-power-loss and near-atmospheric pressure. The "freeze plug" detail is a generic MSR feature, MED for ThorCon specifically. "~150×" is the typical large-PWR figure; RITM-class pressure was not verified.)

---

## 4. Myths, traps and caveats

- **"Indonesia akan punya PLTN terapung pakai ThorCon di Bangka."** Outdated. PT Thorcon Power Indonesia was **dissolved on 20 Oct 2026**. The live project is **Rosatom FPU-100 for North Halmahera**.
- **"PLTN terapung sudah disetujui / segera dibangun."** No. As of 3–4 Nov 2026 there is only a **3S pre-licensing consultation**. **No site licence and no operating licence application** exist, and the regulations are still being rewritten because the PP defines a site as land only. BAPETEN: a consultation "bukan persetujuan".
- **"PT Pembangkit Listrik Nuklir = PLN / BUMN."** Wrong. It is a **private company** (B2B, no APBN). Fortune abbreviated it "(PLN)" and Suara (citing The Star) called it state-owned. Both are misleading. Never write "PLN" for it.
- **"Kesepakatan Indonesia–Rusia / dua presiden."** The signatories are Rosatom (a Russian state corporation) and a private Indonesian firm. Political backing was mentioned, but it is not a G2G treaty.
- **"Dua reaktor."** It is two **floating units**, very likely with **two reactors each** (see §2E; MED). Say "dua kapal pembangkit".
- **"Listrik mengalir 2031."** Rosatom's wording is "no earlier than five years after the key contract terms take effect". The start of that clock is unknown. Say "paling cepat sekitar lima tahun lagi".
- **"Pertama di dunia."** Only the **export** electricity-supply deal is a first. Floating nuclear plants exist: Lomonosov since 2020, and MH-1A Sturgis 1967–76.
- **"SMR belum ada yang terbukti."** Too strong. Lomonosov (2 × 35 MWe) has run commercially since 2020, and icebreaker reactors have decades of service. What is unproven is the **RITM-200M floating version in tropical seas** and the **export/ownership model**.
- **"Seperti Chernobyl/Fukushima."** Different reactor types and settings. Chernobyl was an RBMK, graphite-moderated, with no containment. Fukushima was large land BWRs that lost cooling power after a tsunami. Do not imply equal risk, and do not wave risk away either. Halmahera sits in an active seismic and tsunami zone (Molucca Sea plate collision). A floating hull rises with long-period tsunami waves in deep water, but **near shore and at the mooring** a tsunami brings strong currents and debris. Mooring and breakwater design and the shore connection are the real questions. **No Rosatom tsunami-design spec was found this session.**
- **"Laut jadi radioaktif."** In normal operation, seawater only cools the condenser in a separate loop. The real normal-operation impact is **warm water discharge**. Accident and spent-fuel scenarios are legitimate questions, but they are not routine.
- **"Limbah nuklir ditinggal di Indonesia."** Under the Lomonosov model, used fuel goes back with the barge to the shipyard. That it will **leave Indonesia** is a likely Rosatom selling point but was **not confirmed** in sources read this session. Say "skema Rosatom: unit kembali ke galangan di Rusia" only with a hedge.
- **"PLTN ini untuk smelter nikel."** Not stated. The supply area is "northern Halmahera". Experts note 200 MW is ~5% of IWIP's captive coal output.
- **Lomonosov numbers:** 70 MWe total, not 70 MW per reactor. "Powers a city of 100,000" is **capacity**; Pevek has about 5,000 people. AS.com claims desalination of 240,000 m³/day. The 240,000 figure is WNA's *claimed design capacity range* for the FPU concept, not a measured Pevek output. Do not use it.
- **ThorCon licensing:** BAPETEN approved a **site evaluation plan** (Aug 2025), not a site licence.
- **Promotion trap:** "bersih, murah, tanpa APBN" are company claims. The cost of electricity, the tariff and the PPA price have **not been published**.

---

## 5. Hook angles (90-second Indonesian video)

1. **"Indonesia mau beli listrik dari kapal nuklir Rusia. Tapi kapalnya... belum boleh berlabuh."** Strongest: a deal plus a regulatory cliffhanger (the PP defines a site as land only).
2. **"PLTN pertama Indonesia mungkin bukan di darat, tapi mengapung di laut Halmahera."**
3. **"Di Kutub Utara, sebuah kapal tanpa mesin sudah 6 tahun menerangi satu kota."** Akademik Lomonosov cold open, then cut to tropical Halmahera.
4. **"Satu tongkang, dua reaktor kapal pemecah es, 100 megawatt."** Hardware-reveal hook.
5. **"Dua minggu, dua kabar: proyek nuklir apung Rusia diteken, proyek thorium apung Amerika bubar."** Contrast hook, good for retention.
6. **"Apa yang terjadi pada PLTN terapung saat tsunami?"** Fear-question hook. Answer with nuance; do not use it as clickbait without a payoff.

---

## 6. Visual / 3D beat ideas

- **Cold open:** a dark Arctic bay, a long white barge with red trim lit up, steam, a town's lights blinking on. HUD: "Pevek · 2 × 35 MWe · sejak Mei 2020". The camera pulls up and the map spins south to the equator and Halmahera.
- **Cutaway barge (main hero):** INNERWORKS-style section of the hull. Reactor compartment in the centre (glowing core, rods sliding), steam generator, turbine hall, generator, switchyard, cable to shore, seawater intake and outfall arrows (blue in, slightly orange out). The AUDIRA brand can sit on the hull plate or a turbine nameplate.
- **Fission domino:** neutron balls splitting atoms into 2–3 new balls. Control rods drop in and the chain thins out. A "1 neutron per fission" counter holds steady at 1.00.
- **Two loops:** red primary loop (sealed) and blue secondary loop, with a translucent wall labelled "air laut tidak pernah menyentuh air reaktor".
- **Tow sequence:** a shipyard crane, tugboats pulling the barge across a globe arc, mooring lines and a breakwater forming around it.
- **Lifecycle loop:** a calendar ticks "3–4 thn: isi ulang" (Lomonosov) and "12 thn: pulang ke galangan". The barge sails off and comes back.
- **Regulation beat:** a 3D legal document with the word "tapak = daratan" stamped, crossed out and rewritten "+ perairan". A licence tree splits into a vendor-country side (desain, konstruksi, kelas kapal) and an Indonesia side (tapak, operasi, izin kapal asing). Status lights: "3S konsultasi: ✓ ditinjau · izin operasi: belum diajukan".
- **Molten-salt contrast:** a vat of glowing liquid salt. A plug melts and the salt drains by gravity into wide tanks that cool passively. A side-by-side pressure gauge reads PWR (high) vs MSR (~1 atm).
- **Scale beat:** a bar comparing 1.59 TWh/yr from the FPUs with 31.8 TWh from IWIP coal. Honest context, no sensationalism.
- **Research reactor nod:** three small glowing pools on a map of Java (Serpong 30 MW, Bandung 2 MW, Yogyakarta 0.1 MW). "Indonesia sudah 60 tahun punya reaktor, tapi belum satu pun untuk listrik."

---

## 7. Open questions / unverified

- The exact mooring site in North Halmahera, and whether a breakwater or a dedicated harbour is planned. Not public.
- The number of reactors per FPU-100 (likely 2 × RITM-200M), the exact MWe per reactor, and the refuelling interval for the export FPU (WNA OFPU says 12 years).
- Whether spent fuel and the units return to Russia, and who pays decommissioning. Not stated in the sources read.
- The tariff, the PPA price, the offtaker (PLN? a private grid? mines?) and the date the "key terms" take effect.
- Rosatom's tsunami, earthquake and typhoon design basis for equatorial FPUs. Fortune says FPU-100 is "designed for equatorial climate zones" (MED), with no detail.
- Kompas.id 4 Nov: the paragraphs after the paywall cut were not read.
- The NEPIO Perpres signing status as of Nov 2026.
- The Lomonosov tow route and dates (2019), and the first refuelling date. From memory or weak sources; re-check against Rosatom or WNN before stating exact dates.
- Lomonosov cumulative output: Fortune says 1.4 billion kWh, while Jan 2025 reports said 1 billion kWh. Plausible as cumulative growth, but unverified.
- ThorCon to Fleet Nuclear: whether the Indonesian ambition is fully abandoned or only the local entity. Fleet's site mentions only US licensing.
- ThorCon-specific MSR specs (temperature, salt chemistry, "can" replacement interval). Not re-read this session.

### Failed or partial sources

- **Kompas.id**: paywalled, first ~12 paragraphs only.
- **Bisnis.com** (hijau.bisnis.com, 3 Nov BAPETEN story): HTTP 403.
- **bapeten.go.id**: HTTP 403, so the BAPETEN press releases were not read at source.
- **Google News batchexecute decoder**: HTTP 429 after ~20 decodes; switched to Bing News RSS.
- **IAEA PRIS** (Akademik Lomonosov reactor page): returned no readable content.
- **thorconpower.com /design, /technology**: 404. The site now points to fleetnuclear.com.
- **WNN "Russian floating plant arrives at Pevek"** (guessed URL): 404.
- **Jakarta Globe**: login wall text, but the article body rendered.
- **AS.com** (Lomonosov 1 billion kWh): read, but contains factual errors. Used only as a weak pointer for the first refuelling.
