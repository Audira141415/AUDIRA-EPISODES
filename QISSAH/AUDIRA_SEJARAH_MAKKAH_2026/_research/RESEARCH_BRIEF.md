# Research brief: Sejarah Makkah (5 episodes)

Series root: `F:\AUDIRA-VIDEO-MOTION\QISSAH\AUDIRA_SEJARAH_MAKKAH_2026` (bash: `/f/AUDIRA-VIDEO-MOTION/QISSAH/AUDIRA_SEJARAH_MAKKAH_2026`).

Every episode becomes:
- one 16:9 long-form video, 8-12 minutes, with 5-8 chapters (about 1,100-1,700 spoken words at 135-150 WPM);
- two 9:16 shorts cut from it (rule `F:/AUDIRA-ALL-SKILL/.agents/rules/09_long_form_video.md`).

The research has to be deep enough for that. The audience is Indonesian. The angle is "hal yang banyak orang tidak tahu" about Makkah: surprising, verified changes over time.

## Deliverables (in your episode folder, `research/`)

1. `RESEARCH_REPORT.md` (Indonesian):
   - **Angle:** 2-3 sentences.
   - **Chapter plan:** 5-8 chapters. Each has a title, 4-8 key facts, the one "tidak banyak orang tahu" surprise, and the visual idea it suggests.
   - **Two short candidates:** two segments of 45-90 s that each stand alone, each with a 0-3 s hook line.
   - **Disputes and uncertainty:** numbers or dates where sources disagree, and how the script should phrase them, e.g. "menurut catatan sejarawan Al-Azraqi", "sekitar".
2. `SOURCE_REGISTER.md`: a table with these columns: claim | source (title, author or publisher, year) | URL | date read | level.
   - Levels: PRIMARY (Quran, sahih hadith, official Saudi body such as GPH/gph.gov.sa, Saudi Geological Survey, the Kiswah complex, peer-reviewed paper), CLASSIC (Al-Azraqi, Ibn Ishaq, Ibn Kathir and other classical historians), SECONDARY (encyclopedias, reputable media, books).
   - Every number and date that might appear on screen must have a row.
3. Save raw source text you used under `research/raw/`, for example `wiki_Kaaba.txt` or `quran_2_127.txt`, so it can be re-checked.

## How to fetch (tested on this PC)

- **Wikipedia raw wikitext:** `curl -s "https://en.wikipedia.org/w/index.php?title=<Title>&action=raw" -o research/raw/wiki_<Title>.txt`. Use id.wikipedia.org and ar.wikipedia.org too. Then follow the references Wikipedia cites and fetch the primary or official pages where you can.
- **Quran (Kemenag translation):** `curl -s "https://api.quran.com/api/v4/verses/by_key/<s>:<v>?translations=33&fields=text_uthmani"`. Python urllib gets 403; use curl.
- **Ibn Kathir tafsir:** `curl -s "https://api.quran.com/api/v4/tafsirs/169/by_ayah/<s>:<v>"`.
- **Hadith:** `curl -s "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-bukhari/<n>.json"`. Also available: eng-muslim, ind-bukhari. sunnah.com blocks bots.
- **Other web pages:** curl with a normal browser User-Agent. The WebSearch tool may fail; if it does, use `curl -s "https://html.duckduckgo.com/html/?q=<query>"` and parse the result links.
- Write Python with `PYTHONIOENCODING=utf-8` (the Windows console is cp1252). Keep temp files on F:, because C: is nearly full.

## Rules

- Never invent numbers, quotes or dates. If two sources disagree, record both.
- Religious sensitivity:
  - The scripts never describe the Prophet Muhammad's appearance.
  - Prophets, angels and Allah are never depicted, so suggest visuals through places, objects, light and architecture.
  - Keep the tone neutral and respectful. For modern controversies (for example demolished Ottoman buildings), report facts from both sides without editorialising.
- Do not write the video script. Only research.
- Report back briefly (in English is fine): the chapter titles, the 3 most surprising verified facts, the two short candidates, and anything that stayed unverified.
