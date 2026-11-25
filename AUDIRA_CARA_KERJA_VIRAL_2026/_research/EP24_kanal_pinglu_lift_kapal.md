# EP24 — How a ship lock lifts a 5,000-ton ship up a "water staircase" (hook: China's Pinglu Canal, Madao hub): research notes

Research date: 2026-11-09. This file holds research only, not a script.
Method: Google News RSS (English, Indonesian and Chinese editions), with links decoded to real URLs through Google's batchexecute endpoint, and article HTML read with Python urllib (browser User-Agent, tags stripped, normal TLS verification). Primary sources are Chinese state media (Xinhua Chinese, CGTN English, CCTV, People's Daily, Guangming Daily, Beijing Daily) and the trade/industry press (Hubei Daily, Chutian Metropolis Daily, Sina Finance), so every "world record" below is a **claim by the builder or state media**, attributed as such. Lock mechanics come from the Panama Canal Authority (pancanal.com) and Wikipedia plaintext extracts (MediaWiki API) used only as cross-checks. Independent analysis came from ThinkChina (Singapore) and the Global Times / ANTARA / Jakarta Globe Indonesia pieces. The CGTN Indonesian hook article itself is a video page: only its title and image could be read.

---

## 1. Viral hook: is it recent?

| Headline | Outlet | Published | URL |
|---|---|---|---|
| "Simpul Madao Terusan Pinglu: Berbagai Rekor Dunia Menjadi Penopang Kokoh 'Jalur Emas'" (the hook; video page, body not readable) | CGTN / CRI Bahasa Indonesia | **7 Nov 2026** (URL dated 8 Nov) | https://indonesian.cri.cn/2026/11/08/ARTI1794126867600114 |
| "Jalur Lintasan Ikan Hub Qingnian Terusan Pinglu Membuka 'Jalan Buntu' Ekologi Sungai Qinjiang" (follow-up in the same series) | CGTN / CRI Bahasa Indonesia | 8 Nov 2026 | https://indonesian.cri.cn/2026/11/09/ARTI1794198496254911 |
| "First ships sail from Madao hub as Pinglu Canal opens to navigation" | CGTN | **16 Sep 2026** | https://news.cgtn.com/news/2026-09-16/First-ships-sail-from-Madao-hub-as-Pinglu-Canal-opens-to-navigation-1QtT62v0cO4/p.html |
| "Pinglu Canal showcases smart technologies in landmark waterway project" | CGTN | 14 Sep 2026 | https://news.cgtn.com/news/2026-09-14/Pinglu-Canal-showcases-smart-technologies-in-landmark-waterway-project-1QqFOaThEnC/p.html |
| "China's Pinglu Canal achieves full water filling, Madao hub sets two world records" | CGTN | 3 Jun 2026 | https://news.cgtn.com/news/2026-06-03/China-s-Pinglu-Canal-achieves-full-water-filling-Madao-hub-sets-two-world-records-1NFQTf4T8Pu/index.html |
| "这座船闸何以揽下三项'世界之最'？" (Madao hub, three "world bests") | Xinhua (Chinese) | 7 Jun 2026 | https://www.news.cn/politics/20260607/b4ba6afc80594eeca01368474fd6525f/c.html |
| "新华视点丨世纪工程平陆运河六大看点" (six highlights) | Xinhua (Chinese) | 15 Sep 2026 | https://www.news.cn/politics/20260915/b50347222dcf4185a2b2212103b15216/c.html |
| "开'新'平陆运河丨超级船闸，超级担当！" (the three hubs decoded) | The Cover (封面新闻) | 16 Sep 2026 | https://www.thecover.cn/news/E3GRUDC9WFyH90qSdq8Jkw== |
| "让巨轮坐上'省水电梯'，解码平陆运河三大枢纽节能智慧" | Beijing Daily (京报网) | 8 May 2026 | https://xinwen.bjd.com.cn/content/s69fd6e50e4b0687a28953450.html |
| "完成通航前最后'大考'，平陆运河马道枢纽实船试验完成" | Chutian Metropolis Daily (极目新闻) | 13 Aug 2026 | https://www.ctdsb.net/c1740_202608/2829698.html |
| "China's Pinglu Canal opens: How do cargo ships 'go downstairs'?" | Our China Story (HK) | 23 Sep 2026 | https://www.ourchinastory.com/en/17396/China's-Pinglu-Canal-opens:-How-do-cargo-ships- |
| "Global experts hail China's Pinglu Canal..." (World Canals Conference, Guilin) | Global Times | 13 Oct 2026 | https://www.globaltimes.cn/page/202610/1372208.shtml |
| "China's Pinglu Canal cargo throughput hits 1m tons since mid-Sep opening" | Global Times (citing Xinhua) | 19 Oct 2026 | https://www.globaltimes.cn/page/202610/1372581.shtml |
| "Encouraging start as Pinglu Canal moves 1 million tonnes of cargo in first month" (not read, title only) | SCMP | 30 Oct 2026 | https://www.scmp.com/economy/china-economy/article/3372581/pinglu-canal-encouraging-start-chinas-push-boost-trade-southeast-asia |
| "Pinglu Canal is an alternative, not a game changer for Southeast Asia" | ThinkChina (Jianbo Wu) | 28 Oct 2026 | https://www.thinkchina.sg/economy/pinglu-canal-alternative-not-game-changer-southeast-asia |
| "If a ton of cargo travels hundreds of kilometers less, what does it mean for China-Indonesia trade?" | Global Times (also run by Jakarta Globe 21 Oct as opinion) | 28 Oct 2026 | https://www.globaltimes.cn/page/202610/1373162.shtml |
| "Indonesia's opportunity as Pinglu Canal reshapes supply chains" | ANTARA English | 25 Sep 2026 | https://en.antaranews.com/news/432743/indonesias-opportunity-as-pinglu-canal-reshapes-supply-chains |
| Indonesian coverage at opening: CNN Indonesia, Kompas, Kompas.id, ANTARA, IDN Times, kumparan, SINDOnews | various | 16–23 Sep 2026 | (titles only via RSS) |

**Verdict:** The hook is **fresh but second-wave**. The canal **opened to commercial navigation on 16 Sep 2026**; the 7 Nov CGTN Indonesian piece is a feature/series item (Madao records on 7 Nov, Qingnian fish pass on 8 Nov), not breaking news. The "world records" in the headline are **builder/state-media claims** first made in June 2026 (Xinhua: "three world bests" at Madao) and expanded to "four world records" at opening (CCTV via Global Times). Nothing independent contradicts them, but nobody independent has verified them either.

---

## 2. Verified facts

### A. Status and timeline

1. **Open and operating.** Officially opened to navigation **Wednesday 16 Sep 2026**; 30 cargo ships used it on day one; new routes Nanning–Can Tho (Vietnam) and Nanning–Yangpu (Hainan) started.
   - Source: CGTN 16 Sep; Xinhua 15 Sep; Wikipedia cross-check. Confidence: **HIGH**.
2. **Run-up milestones.** Construction began **August 2022** (Wikipedia). Full-channel water filling and start of testing announced **3 Jun 2026** (CGTN). Wet joint commissioning of locks around **25 Jun 2026** (People's Daily Guangxi). **Live-ship trials**: Madao hub completed ~12–13 Aug (four test ships: 5,000 t loaded and empty, 3,000 t, 1,000 t); Qishi hub 13 Aug; Qishi→Qingnian trial ~22 Aug. Navigation safety rules effective 15 Sep.
   - Source: CGTN 3 Jun; gx.people.com.cn 25 Jun; ctdsb.net 13 Aug; gmw.cn 18 Aug; RSS titles (China Daily 9 Sep, CNR 22 Aug). Confidence: **HIGH**.
3. **First traffic.** Cargo through the canal passed **1 million tonnes** at about 9 am on Saturday 17 Oct 2026, when the *Guigang Haitong 6688* left the Madao lock upstream (Xinhua via Global Times, citing Beibu Gulf Port Group). Forecast: ~5 million t in 2026, 40 million t in 2027 (Pinglu Canal Group official He Junhui); ~95.5 million t/yr by 2035 (The Cover).
   - Confidence: **HIGH** for the 1 Mt milestone (official, consistent across outlets); forecasts are **projections**.
4. **Lock tolls waived** from opening until 31 Dec 2026 for vessels using the Madao, Qishi and Qingnian locks (Pinglu Canal Group deputy GM Li Hengchang, The Cover). Confidence: **MED** (single source).

### B. The canal

5. **Length 134.2 km**, from the Pingtang River mouth on the Xijin reservoir (Hengzhou, Nanning) via Luwu town (Lingshan county, Qinzhou) down the Qin River to the **Beibu Gulf** (Gulf of Tonkin) at Qinzhou. Links the Xijiang river system to the sea.
   - Source: CGTN, Xinhua, Our China Story, Hubei Daily, Wikipedia. Confidence: **HIGH**.
6. **Design ship: 5,000-tonne class.** Inland Class I waterway. Wikipedia gives the design ship as ~90 m long, 15.8 m beam, 5.0 m draft. Ships of 1,000, 3,000 and 5,000 t use it; ~570 registered river-sea vessels can sail straight on into Qinzhou Bay without transshipping (Nanning MSA via Global Times).
   - Confidence: **HIGH** for 5,000 t; **MED** for the ship dimensions (Wikipedia only).
7. **Shortcut.** Inland route to the sea shortened by **more than 560 km** versus the detour via Guangzhou / Pearl River Delta. Logistics cost projected to fall **18–30%**, saving **>5 billion yuan/yr** (5.2 billion in Global Times). Baise bulk cargo: 12–15 days old route vs 5–7 days new (Xinhua quoting Baise Xijiang Investment).
   - Confidence: **HIGH** that these are the official figures; savings are **projections**.
8. **Cost ~72.7 billion yuan** (≈ US$10.2 billion; SCMP headline said US$10.8b). Xinhua: "总投资约727亿元". Confidence: **HIGH**.
9. **Earthworks ~315 million m³** (CGTN, Our China Story; "nearly three times the Three Gorges project" per CGTN). Wikipedia cites an older plan figure of 339 million m³. >98% reused on site; ~927 ha of farmland created; clay used for Qinzhou Nixing pottery (Our China Story). Confidence: **HIGH** for 315 Mm³ as the official final figure.

### C. The 65 m drop and the three hubs (core of the video)

10. **Total fall ≈ 65 m** ("相当于20多层楼", "20-storey building") from the summit/upstream reach to the sea, handled by **three cascade hubs**, top to bottom: **Madao (马道) → Qishi (企石) → Qingnian (青年)**.
    - Source: Xinhua 15 Sep; The Cover; Our China Story; Hubei Daily. Confidence: **HIGH**.
11. **Max head per hub** (maximum water-level difference each lock handles):
    - **Madao: 29.6 m** ("近乎十层楼", "about a 10-storey building").
    - **Qishi: 27 m**.
    - **Qingnian: 10.32 m** (tidal, sits next to the gulf; also handles anti-silting and anti-saltwater duty).
    - Source: Beijing Daily 8 May; The Cover 16 Sep; Xinhua 7 Jun; CGTN 14 Sep. Confidence: **HIGH**.
    - Note: 29.6 + 27 + 10.32 = 66.9 m, more than 65 m, because each figure is a **maximum** head under the worst combination of upstream/downstream levels (tide, floods); they do not all occur at once. Beijing Daily phrases the total as "60多米".
12. **Each hub is a twin (two-lane) lock.** Madao lock effective size **300 m × 34 m × 8 m** (length × width × sill depth). One chamber ≈ 1.5 football pitches. The two lanes together pass **12 ships of 5,000 t at once** (Xinhua 7 Jun; The Cover). Wikipedia says all three hubs have two 300 × 34 m locks.
    - Confidence: **HIGH** for Madao; **MED** for Qishi/Qingnian dimensions (Wikipedia only).
13. **Each lock is a single step, not a flight.** Xinhua/The Cover/Our China Story all describe one lock per hub; the ship goes "down one level" at each hub, three times in total. **Madao is not a two-step staircase and does not lift 65 m by itself.**
    - Confidence: **HIGH**.
14. **Gates: miter gates (人字门).** The three hubs have **24 miter gate leaves** in total (Beijing Daily); each lock has one double-leaf miter gate at the upper head and one at the lower head. Largest single leaf ≈ **1,108 t, 39.08 m tall** (Sina Finance 8 Dec 2025, at installation). Qingnian's miter gate and culvert-valve hydraulic hoists were made by CSSC Zhongnan Equipment, the same firm that built hoists for the Three Gorges permanent locks (Hubei Daily).
    - Confidence: **HIGH** for "miter gates"; **MED** for 1,108 t / 39.08 m (single source, plausible for a ~30 m head plus freeboard).
15. **Filling culverts and valves.** Water enters/leaves through **conveyance culverts (输水廊道)** inside the lock walls and floor, controlled by **~70-t working valves** (The Cover). Valve opening speed: **8 m/min open, 16 m/min close**, versus a typical ~4 m/min (Madao designer Yuan Heping, Xinhua 7 Jun); popular framing: "**open in 1 minute, close in 30 seconds**", 2–4× faster than normal (Xinhua 15 Sep, The Cover, Guangming). Culvert walls are finished to **8 mm** flatness (industry norm 10 mm) to resist high-velocity scour (Xinhua 7 Jun).
    - Confidence: **HIGH** (official engineers quoted by name).
16. **Fill time.** One chamber needs about **300,000 m³** of water and fills in **~15–16 minutes** (Yuan Heping, Xinhua: "约15分钟"; engineer Zhong Linbin, Beijing Daily: "约16分钟"). Cross-check: 300 × 34 × 29.6 m = 301,920 m³. Consistent.
    - Confidence: **HIGH**.
17. **Water-saving basins (省水池).**
    - **Madao and Qishi**: three-level **"stacked/overlapping" (叠合式) basins** — high, middle, low — beside the chamber. Going down, chamber water is drained in turn into the high, middle and low basins; going up, the stored water flows back in reverse order. Stacking the high and low basins on top of each other saves excavation and land. Claimed **water saving ≥60%** ("60%以上"; Wikipedia says 63% for Madao). Claimed "world first" (世界首创) for the stacked three-level layout.
    - **Qingnian**: no separate basins; the two parallel locks **act as each other's saving basin** through a cross-culvert (互灌互泄), saving **~50%**.
    - All three hubs together are claimed to save **>1 billion m³/yr**, "about 70 West Lakes" (Xinhua, Beijing Daily).
    - Source: Beijing Daily (engineer Zhong Linbin), The Cover, ctdsb.net, Xinhua. Confidence: **HIGH** for the design; the 1 billion m³ figure is an **official estimate**.
18. **Water supply.** Upper Jiuzhou River runoff plus the "Yu-to-Qin" diversion (引郁入钦) from the Yu River (a Xijiang tributary). Initial filling of the Madao and Qishi reaches alone: ~8 million m³ (Our China Story). Confidence: **MED-HIGH**.
19. **Why three steps, not one or ten.** Designers compared options: more steps = longer transit and higher operating cost; fewer steps = bigger head per lock and harder engineering. Three hubs were the compromise (The Cover). Confidence: **HIGH** (official rationale).
20. **Other Madao numbers.** 3.36 million m³ of concrete; 188 m high cut slopes; 60+ m deep foundation pit; a claimed single-day record pour of 16,409 m³ of pre-cooled concrete on 30 Nov 2024 (Xinhua 7 Jun). Confidence: **MED** (state media only).
21. **Fish passage at Qingnian.** ~480 m dual-channel fishway (vertical-slot + eel pass), 120 pools and 4 resting pools (The Cover; CGTN Indonesian 8 Nov title). Confidence: **MED-HIGH**.

### D. The "world records" — who claims what

22. **June 2026, Xinhua (Madao only, "three world bests")**: world's **largest inland water-saving ship lock**; **highest head** among inland water-saving locks (29.6 m); **fastest valve opening/closing** among inland water-saving locks.
23. **June 2026, CGTN English ("two world records")**: largest inland water-saving lock by both lift and overall scale; plus a "world-first" three-tier overlapping basin system.
24. **September/October 2026, CCTV via Global Times ("four world records among comparable canals")**: (1) highest navigation capacity, (2) fastest ship-lock transit speed, (3) highest-lift water-saving ship lock, (4) largest inland water-saving lock. Xinhua 15 Sep counts "1 world first, 4 world bests, 21 major innovations, 220+ invention patents".
    - **How to say it**: always "menurut media pemerintah Tiongkok / pengelola kanal". Records are **narrow categories** ("among water-saving locks", "among inland locks", "among canals of the same type"). The Chutian (13 Aug) wording "世界在建水位落差最大的省水船闸" even restricts it to locks **under construction**.
    - **Plausibility check (my reasoning, MED)**: 29.6 m is well above famous water-saving locks such as Panama's Neopanamax steps (~9 m each) and German Elbe-Seitenkanal-class locks (around 20–25 m). It is **not** the highest lock of any type: single-step locks of ~40 m exist (e.g., Ust-Kamenogorsk, Kazakhstan, often cited ~42 m; not verified in this session), and the Three Gorges ship lift raises boats 113 m. Keep the qualifier "kunci kapal hemat air".
25. **Green Design International Award** from the World Green Design Organization (Oct 2026, stdaily via Global Times). Confidence: **MED**.

### E. Comparisons

26. **Panama Canal (original locks, 1914).** Locks lift ships ~**26 m** to Gatun Lake. Original chambers 33.53 m × 304.8 m. Water comes from Gatun Lake **by gravity**, through a main culvert system running under the chambers from the side and centre walls (pancanal.com). Original locks use **miter gates** (Wikipedia).
27. **Panama Neopanamax locks (Agua Clara and Cocolí, opened 26 Jun 2016).** Chambers **427 m × 55 m × 18.3 m**; three chambers per lock (three steps); **three lateral water-saving basins per chamber** (9 per lock, 18 total); reuse **up to 60%** of the water per lockage (pancanal.com, Spanish FAQ). Filled and emptied **by gravity, no pumps**; use **rolling (sliding) gates** instead of miter gates (Wikipedia). With three basins, the water lost per cycle is **2/5 of the chamber's "moving" volume** (Wikipedia).
    - Confidence: **HIGH**.
28. **Three Gorges (Yangtze).** Two parallel **five-step staircase locks**, chambers ~280 × 35 × 5 m, transit ~4 hours; ships up to ~10,000 t. Separate **ship lift** (in service 2016): lifts ships up to **3,000 t** a vertical **113 m** in a 120 × 18 × 3.5 m tank in 30–40 minutes, driven by a rack-and-pinion gear system (Wikipedia). The staircase uses hinged (miter) gates shared between chambers.
    - Confidence: **HIGH** (Wikipedia; widely published figures).
29. **Ancient precedent: Lingqu canal (Guangxi, 214 BC).** Xinhua 7 Jun mentions its 36 "陡门" (flash-lock gates) that stepped water over hills. Good one-line callback; same province. Confidence: **MED** (Xinhua aside; "36" is the traditional count).

### F. Indonesia / ASEAN angle

30. **Indonesian trade already flows through Qinzhou.** In 2025, Indonesian bulk commodities entering China through Qinzhou reached **11.521 million t, worth 8.26 billion yuan (≈ Rp21.9 trillion)**: coal, bauxite (aluminium ore), rubber, palm oil (ANTARA, 25 Sep). Confidence: **MED-HIGH** (ANTARA, citing Chinese customs-type data).
31. **Indonesian voices.** Global Times/Jakarta Globe quote UI scholar **Humprey Arnaldo Russel** (ASEAN-China Research Cluster, Universitas Indonesia) and a student, Alvin Candra Andrianto, at the 23rd China-ASEAN Expo. Note: this is a **Global Times opinion piece republished** by Jakarta Globe, not independent Indonesian reporting.
32. **Reality check (ThinkChina, Singapore).** 5,000 t river-sea ships are "far below the scale of deep-sea mainline shipping"; benefit depends on whether such ships fit existing ports and supply chains. Opening-day international service went to **Can Tho (Mekong Delta), not Hai Phong**; Nanning–Can Tho runs twice a month with ~4,900 DWT, up to 500 TEU ships. Confidence: **HIGH** that this is the independent view.
    - Practical takeaway for Indonesia: Indonesian cargo still crosses the sea on ocean ships to Qinzhou/Beibu Gulf ports; the canal mainly shortens the **inland leg** inside China. "Kapal dari Indonesia berlayar langsung ke pedalaman China" is **not** the normal case.

---

## 3. Mechanism in 7 animation steps (Bahasa Indonesia)

1. **Tangga air.** Kapal tidak bisa mendaki bukit. Jadi airnya yang dibuat bertingkat: sungai dipotong jadi beberapa "anak tangga" datar, dan di tiap sambungan ada kolam beton raksasa bernama kunci kapal (ship lock). Pinglu punya tiga anak tangga untuk turun sekitar 65 meter, setinggi gedung 20 lantai.
2. **Masuk kotak.** Kapal 5.000 ton masuk ke kamar sepanjang 300 meter dan selebar 34 meter. Pintu di belakangnya menutup. Pintunya dua daun besar yang bertemu membentuk huruf V menghadap arus (pintu "miter"); tekanan air justru menekan keduanya makin rapat. Satu daun pintunya bisa setinggi 39 meter.
3. **Air masuk lewat lantai, bukan lewat pintu.** Pintu tidak pernah dibuka saat air masih beda tinggi. Air mengalir lewat terowongan di dalam dinding dan lantai, keluar dari banyak lubang di dasar kamar, supaya airnya naik rata dan kapal tidak terombang-ambing. Di Madao, katupnya bisa terbuka dalam sekitar 1 menit.
4. **Tanpa pompa, cuma gravitasi.** Untuk naik, air dialirkan dari kolam atas ke kamar. Untuk turun, air dibuang ke hilir. Air selalu mengalir dari tempat tinggi ke rendah dengan sendirinya. Mengisi satu kamar di Madao (sekitar 300 ribu meter kubik, kira-kira 120 kolam renang Olimpiade) butuh kira-kira 15 menit.
5. **Pintu depan terbuka.** Begitu air di kamar sama tinggi dengan sisi depan, tekanan di kedua sisi pintu seimbang, pintu terbuka dengan mudah, dan kapal melaju keluar. Di Madao, satu langkah ini memindahkan kapal sampai 29,6 meter, hampir 10 lantai.
6. **Kolam tabungan air.** Saat kapal turun, air kamar tidak langsung dibuang. Air dialirkan dulu ke tiga kolam di samping, atas, tengah, lalu bawah, yang bertingkat seperti rak. Saat kapal naik, air itu dikembalikan dari kolam atas lebih dulu. Hasilnya, lebih dari 60% air dipakai ulang. Panama memakai trik yang sama sejak 2016.
7. **Kenapa tiga tangga, bukan satu?** Satu langkah 65 meter berarti pintu, dinding, dan arus air yang jauh lebih ekstrem. Sepuluh langkah berarti kapal antre lebih lama. Tiga hub (29,6 + 27 + 10,3 meter maksimum) adalah kompromi. Bandingkan dengan Tiongkok sendiri: di Bendungan Tiga Ngarai, kapal kecil malah naik "lift" setinggi 113 meter dalam 30–40 menit.

---

## 4. Myths, traps and caveats

- **"Madao mengangkat kapal 65 meter."** Wrong. 65 m is the **whole canal** over three hubs. Madao handles max **29.6 m** in **one step**. Not a two-step cascade.
- **"Kanal ini masih uji coba."** Out of date. Trials ran Jun–Aug 2026; **commercial navigation since 16 Sep 2026**.
- **"Lift kapal" vs "kunci kapal".** Pinglu uses **locks** (water staircase), not a mechanical **ship lift** like Three Gorges (113 m) or Germany's Niederfinow. "Lift kapal" in the title is OK as a metaphor ("lift air"), but do not show a mechanical elevator at Pinglu.
- **"Rekor dunia" without qualifiers.** Every record is in a narrow class (water-saving locks, inland locks, "canals of the same type") and **claimed by state media/builder**. Do not say "kunci kapal tertinggi di dunia". Three Gorges' locks/lift and some ~40 m single-step locks beat 29.6 m in raw height.
- **"Tiga rekor" vs "dua" vs "empat".** Count differs by source and date (Xinhua Jun: 3 at Madao; CGTN Jun: 2; CCTV/Global Times Sep–Oct: 4 for the whole canal). Pick one and attribute it.
- **"Buka 1 menit, tutup 30 detik" is the valve, not the giant gate.** It refers to the ~70-t culvert **working valves**, not the 1,100-t miter gates.
- **"Hemat air 60%" vs "63%" vs "50%".** 60%+ is Madao/Qishi (official); 63% is Wikipedia for Madao; Qingnian is ~50% (twin locks swap water). Panama Neopanamax: "up to 60%".
- **"Air dipompa naik."** No. Both Pinglu and Panama fill by **gravity**; the basins only recycle water. The water supply comes from the upper river and a diversion from the Yu River.
- **"Terusan Suez baru / jalur sutra baru" (CNBC Indonesia, CNN Indonesia headlines).** Hype. It is a 5,000 t inland waterway, tiny next to Suez or Panama (Neopanamax ships carry ~14,000+ TEU). ThinkChina: "an alternative, not a game changer".
- **Money in rupiah.** Kompas "pangkas biaya Rp13 triliun" is a conversion of the "5 billion yuan/yr" projection; exchange-rate dependent and a forecast, not a measured saving.
- **"Kanal pertama sejak 1949".** Precise wording: first **river-to-sea** canal planned at **national level** since 1949. China has built other canals since.
- **"Qingnianjiang hub".** Official name is **Qingnian hub (青年枢纽)**, on the Qin River (钦江). Avoid "Qingnianjiang".
- **Earthworks.** 315 million m³ (final official) vs 339 million m³ (Wikipedia, older plan). Use 315.
- **Cost in USD.** 72.7 billion yuan; USD figure varies (10.2 vs 10.8 billion) with exchange rate. Use yuan or "sekitar Rp160-an triliun" only with an explicit rate.

---

## 5. Hook angles (90-second Indonesian video)

1. **"Kapal 5.000 ton ini baru saja 'turun' setinggi gedung 10 lantai... tanpa pompa satu pun."** Strongest: concrete numbers plus a counterintuitive "no pumps".
2. **"China membangun tangga air untuk kapal: tiga anak tangga, total 65 meter."** Clean visual metaphor, sets up the mechanism.
3. **"Setiap kali kapal lewat, 300 ribu meter kubik air bergerak. Pinglu menabung 60%-nya."** Water-saving basin as the twist.
4. **"Pintu setinggi 39 meter, berat 1.100 ton, tapi justru air yang membuatnya tertutup rapat."** Miter-gate physics hook.
5. **"Kanal baru China ini memotong 560 km jalur ke laut, dan Indonesia ada di ujung rutenya."** Indonesia angle (coal, bauxite, sawit via Qinzhou).
6. **"Panama butuh 3 langkah untuk 26 meter. Madao melakukannya 29,6 meter dalam satu langkah."** Comparison hook; careful, Panama's chambers are far bigger. Use as scale contrast, not as "lebih hebat".

---

## 6. Visual / 3D beat ideas

- **Opening shot:** drone-style descent onto the Madao twin locks between 188 m cut slopes; HUD label "MADAO · 29,6 m". AUDIRA brand on a lock-wall marker or the control-room screen.
- **Water staircase cross-section:** the full 134.2 km canal as a side profile: summit reach → Madao step (29.6) → Qishi step (27) → Qingnian step (10.32) → sea with tide. Scale bar "≈ gedung 20 lantai".
- **Cutaway chamber:** transparent concrete walls showing culverts in the walls and floor ports; blue particle water rising evenly under a 90 m ship; water-level gauge ticking 0 → 29.6 m in "15 min" (time-lapse counter).
- **Miter gate close-up:** two leaves meeting in a V pointing upstream; pressure arrows pushing them shut; a 39 m human-scale silhouette for comparison.
- **Water-saving basins:** three stacked basins (high/mid/low) beside the chamber; ship going down, water cascading into basins in order; then reverse for a ship going up. Counter "air hemat 60%".
- **Qingnian twin-lock swap:** two parallel chambers exchanging water through a cross-culvert like communicating vessels.
- **Comparison card (3D, not slide):** Panama Neopanamax (427 × 55 m, 3 steps, rolling gate sliding sideways) vs Madao (300 × 34 m, 1 step, miter gate) vs Three Gorges ship lift (113 m tank elevator).
- **Map payoff:** Southwest China → Pinglu → Qinzhou → South China Sea → Indonesia, with the old 560 km detour via Guangzhou fading out. Commodity icons from Indonesia: coal, bauxite, rubber, palm oil.
- **History callback (1 s):** Lingqu canal's ancient stepped gates, same province, 2,200 years earlier.
- Style candidates: INNERWORKS (cutaway lock mechanism), DRAFTFORGE (blueprint cross-section), WORLDFORGE (landscape cascade). Final choice at the style gate.

---

## 7. Open questions / unverified

- **Body of the CGTN Indonesian 7 Nov article**: video page; the exact records it lists could not be read. The records list here comes from Xinhua/CGTN/CCTV-via-Global Times.
- **Qishi and Qingnian chamber dimensions**: only Wikipedia says all three are 300 × 34 m. Not confirmed in a Chinese primary source this session.
- **Gate leaf 1,108 t / 39.08 m**: single source (Sina Finance, Dec 2025, installation story). Which hub's gate is this? Probably Madao (largest head), but not stated in the excerpt.
- **Exact floor-port layout of Madao culverts** (bottom longitudinal culverts vs side-wall ports): Xinhua describes "分级消能、分层输水" (graded energy dissipation, layered conveyance) but not the geometry. Animate a generic floor-port system and keep it generic.
- **Record verification**: no independent (e.g., PIANC) confirmation of "highest-head water-saving lock". The comparison with Ust-Kamenogorsk (~42 m) and German locks was not fetched this session.
- **Transit time through each lock** (end to end) not found; only the 15–16 min fill time.
- **Indonesian navigation locks**: no source found on an operating ship lock in Indonesia. Indonesia has many "pintu air"/bendung for irrigation and flood control (e.g., Manggarai, Jakarta), but these are not navigation locks. Do not claim one without a source.
- **SCMP 30 Oct article** body not read (paywall); its first-month figures are taken from Xinhua/Global Times instead.

### Failed / limited sources

- indonesian.cri.cn (CGTN Bahasa Indonesia) 7 Nov and 8 Nov pages: video pages, no article text in HTML.
- english.cctv.com 16 Sep: video page, only a 3-line summary.
- pancanal.com `/en/water-saving-basins/` and `/en/the-panama-canal-expansion/`: HTTP 404 (guessed URLs). The "discover-the-expanded-canal" and "history" pages worked.
- yidaiyilu.gov.cn: connection reset.
- difang.gmw.cn 17 Sep (Qingnian hub): HTTP 404. jfdaily.com 17 Sep: empty body.
- gx.cnr.cn 22 Aug (Qishi→Qingnian trial): empty body after filtering.
- Wikipedia HTML pages rendered as broken template markup; the MediaWiki API plaintext extract was used instead.
- SCMP: not fetched (paywall).
