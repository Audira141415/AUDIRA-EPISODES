# Research brief: Sejarah Islam (5 shorts)

Series root: `F:\AUDIRA-VIDEO-MOTION\AUDIRA_SEJARAH_ISLAM_2026` (bash: `/f/AUDIRA-VIDEO-MOTION/AUDIRA_SEJARAH_ISLAM_2026`).

Each episode becomes ONE 9:16 short, about 75-90 s (200-225 spoken words at 135-150 WPM), Indonesian voice-over. The user asked for shorts only. The audience is Indonesian. The angle is "sejarah peradaban Islam yang menarik dan jarang diketahui": one surprising, verified story per episode, told with a strong 0-3 s hook.

Topics (your task names one):
- EP01_UNIVERSITAS_TERTUA_FATIMAH: Fatimah al-Fihri and Al-Qarawiyyin, Fez (859 M), called the oldest continuously operating degree-granting university (Guinness/UNESCO wording; check exact wording and the debate about "university" vs madrasa).
- EP02_ALGORITMA_AL_KHAWARIZMI: Al-Khawarizmi, Baitul Hikmah Baghdad, the words "algoritma" (from the Latin form of his name) and "aljabar" (from his book title), Hindu-Arabic numerals reaching Europe.
- EP03_IBNU_HAITHAM_KAMAR_GELAP: Ibnu al-Haytham (Alhazen), Kitab al-Manazir, camera obscura, light entering the eye, experimental method; the story of feigned madness under al-Hakim in Cairo (mark how well sourced it is).
- EP04_MANSA_MUSA_EMAS_KAIRO: Mansa Musa of Mali, hajj 1324, gold spent in Cairo that lowered its value for years (Al-Umari's account), Timbuktu, Catalan Atlas 1375. Be careful with the modern "richest man ever" claims: record them as estimates.
- EP05_KAPAL_LEWAT_DARATAN_1453: Conquest of Constantinople 1453, the chain across the Golden Horn, Ottoman ships hauled overland past Galata into the Golden Horn (route, numbers of ships, date), the hadith often cited about Constantinople (check grade and wording; mark disputed grading).


Batch 2 topics (2026-11-12):
- EP06_JAM_GAJAH_AL_JAZARI: Al-Jazari's Book of Knowledge of Ingenious Mechanical Devices (1206), the Elephant Clock (water clock with figures, multicultural design), crankshaft/camshaft claims (check), automata; Artuqid court at Diyarbakır.
- EP07_IBNU_BATTUTA_29_TAHUN: Ibnu Battuta left Tangier 1325 aged 21, traveled ~29 years, distance estimates (~117,000 km; mark as estimate), Rihla dictated to Ibn Juzayy; his visit to Samudera Pasai (Sumatra) is the Indonesian hook — verify what he wrote about Sultan al-Malik al-Zahir.
- EP08_PISAU_BEDAH_AL_ZAHRAWI: Abu al-Qasim al-Zahrawi (Abulcasis), Córdoba, Kitab al-Tasrif (c. 1000), 200+ illustrated surgical instruments, catgut sutures (check the claim's sourcing), use in Europe for centuries.
- EP09_KOPI_PARA_SUFI_YAMAN: earliest reliable evidence of coffee drinking among Sufis in Yemen (15th c.), qahwa used to stay awake for night dhikr, spread to Makkah/Cairo/Istanbul, the 1511 Makkah coffee ban (Khair Beg), Mocha port; mark the Kaldi goat legend as legend.
- EP10_RUMAH_SAKIT_GRATIS_KAIRO: Bimaristan al-Mansuri, Cairo (Sultan Qalawun, 1284/1285): free care regardless of status, wards, staff, waqf funding, music/storytelling for patients (check sources), money given on discharge (check).

Fetch note (from batch 1): Wikimedia returns an error page without a User-Agent; use a descriptive one, e.g. `-A "ResearchNotesBot/1.0 (personal research; curl)"`. Do not fake a browser UA. Britannica/UNESCO sit behind Cloudflare: use the browser pane (own tab) or cite via Wikipedia and mark it.

## Deliverables (in your episode folder, `research/`)

1. `RESEARCH_REPORT.md` (Indonesian):
   - **Angle:** 2-3 sentences, plus 3 candidate hook lines (0-3 s).
   - **Story beats for a 90 s short:** Hook, Context, Main Development, Explanation, Visual Payoff, Outro. For each: 2-5 key facts and the visual idea.
   - **The one "tidak banyak orang tahu" surprise.**
   - **Disputes and uncertainty:** numbers, dates or legends where sources disagree, and how the script should phrase them ("menurut catatan ...", "sekitar", "konon").
2. `SOURCE_REGISTER.md`: table columns: claim | source (title, author or publisher, year) | URL | date read | level. Levels: PRIMARY (Quran, sahih hadith, primary historical text, UNESCO/official body, peer-reviewed paper), CLASSIC (classical historians e.g. Al-Umari, Ibn Khaldun, Kritovoulos, Tursun Beg), SECONDARY (encyclopedias such as Britannica, reputable media, books). Every number, date and name that might appear on screen needs a row.
3. Raw source text under `research/raw/` (e.g. `wiki_Al-Qarawiyyin.txt`).

## How to fetch (tested on this PC)
- Wikipedia raw: `curl -s "https://en.wikipedia.org/w/index.php?title=<Title>&action=raw" -o research/raw/wiki_<Title>.txt` (also id. and ar.wikipedia.org). Follow Wikipedia's references to primary/official pages where you can (Britannica, UNESCO, Guinness, university or museum pages).
- Quran (Kemenag): `curl -s "https://api.quran.com/api/v4/verses/by_key/<s>:<v>?translations=33"`. Hadith: `curl -s "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-<book>/<n>.json"` (books: bukhari, muslim, abudawud, tirmidhi, nasai, ibnmajah; Musnad Ahmad is not there, so cite a secondary source for its grading). sunnah.com blocks bots.
- Other pages: curl with a browser User-Agent. WebSearch/WebFetch are broken; DuckDuckGo shows a captcha (never try to bypass it). For search use the built-in browser pane (mcp__Claude_Browser__* tools) with Google or Bing, in your OWN new tab (tabs_create, then navigate in that tab; other agents use the pane at the same time). Close your tab when done.
- Python with `PYTHONIOENCODING=utf-8`. Keep temp files on F: inside your episode folder (C: is nearly full).

## Rules
- Never invent numbers, quotes or dates. If sources disagree, record both.
- Religious sensitivity: never describe the Prophet Muhammad; prophets, angels and Allah are never depicted. Historical people (Fatimah al-Fihri, Al-Khawarizmi, Ibnu al-Haytham, Mansa Musa, Sultan Mehmed II) appear in visuals only as faceless figures, silhouettes from behind, or through objects, so suggest visuals through places, objects, instruments, maps and light. No portrait descriptions as fact (there are no authentic portraits of most of them; say so).
- Conquest topic: neutral and non-graphic, no glorifying violence.
- Do not write the script. Research only. Do not touch other episode folders.
- Report back briefly (English is fine): the hook candidates, the 3 most surprising verified facts, and anything unverified.
