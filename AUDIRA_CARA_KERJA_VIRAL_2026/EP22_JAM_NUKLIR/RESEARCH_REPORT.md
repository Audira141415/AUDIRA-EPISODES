# EP 22: Jam Nuklir Tanpa Reaktor: Cara Inti Atom Thorium Menghitung Waktu

AUDIRA, seri CARA KERJA VIRAL. Created by Agus Dwi R. Status: final dengan voice-over, 9 November 2026.

Riset dari sumber yang dibaca langsung 9 November 2026. Setiap fakta berlabel HIGH, MED, atau LOW; naskah hanya memakai HIGH dan MED.

# EP22 — How a nuclear clock works (thorium-229): research notes

Research date: 2026-11-09. This file holds research only, not a script.
Method: Google News RSS (Indonesian and English) to find coverage, then Bing News RSS to get real article URLs. Article HTML was read with Python urllib (browser User-Agent, TLS verification on) and tags were stripped. Primary sources: the PTB/TU Wien press release as posted on **EurekAlert!** (news release 1146229), the TU Wien release as republished by **ScienceDaily**, and the paper metadata and abstracts from the **Crossref API** for the three 2026 Nature papers, the January 2026 JILA Nature paper and the two 2024 milestone papers. nature.com itself served only a JavaScript challenge page, so abstracts come from Crossref, not from Nature's site. Secondary sources read in full: RRI, Scientific American (reprint of Nature news, 23 Jun 2026) and Popular Science. Background facts on cesium and optical clocks are standard metrology knowledge and are marked where they were not re-checked online today.

---

## 1. Viral hook: is it recent?

| Headline | Outlet | Published | URL |
|---|---|---|---|
| "Jam Nuklir Pertama Dunia Beroperasi Mandiri 24 Jam di Wina" | RRI.co.id (Samarinda) | **4 Nov 2026**, 10:14 WIB | https://rri.co.id/samarinda/internasional/2869517/jam-nuklir-pertama-dunia-beroperasi-mandiri-24-jam-di-wina |
| "Jam Nuklir Pertama Dunia Beroperasi, Apa Keunggulannya?" | TIMES Indonesia | 8 Oct 2026 | (Google News only, not read) |
| "The nuclear clock has begun ticking" (primary, PTB release) | EurekAlert! / PTB | 6 Oct 2026 | https://www.eurekalert.org/news-releases/1146229 |
| "A thorium-229 optical nuclear clock with feedback loop" (primary paper, Vienna) | Nature | **7 Oct 2026** | https://doi.org/10.1038/s41586-026-11084-4 |
| "A nuclear clock synchronized to 229Th" (primary paper, Beijing) | Nature | **7 Oct 2026** | https://doi.org/10.1038/s41586-026-11122-1 |
| "Scientists build a nuclear clock that could make atomic clocks obsolete" (TU Wien release) | ScienceDaily | 10 Oct 2026 | https://www.sciencedaily.com/releases/2026/10/261008102701.htm |
| "The world's first nuclear clocks start ticking" | Popular Science | 7 Oct 2026 | https://www.popsci.com/technology/first-nuclear-clocks/ |
| "The first ticking 'nuclear clocks' are here" (preprint stage) | Scientific American / Nature news | 23 Jun 2026 | https://www.scientificamerican.com/article/the-first-ticking-nuclear-clocks-are-here/ |
| "Nuclear clocks are finally ticking" | C&EN | 13 Oct 2026 | (Google News only, not read) |
| "TU Wien and Tsinghua University Launch Ultra-Precise Thorium Nuclear Clock" | DongA Science | 12 Oct 2026 | https://www.dongascience.com/en/news/80217 (not read) |

**Verdict:** The RRI piece is **about four weeks late**, not breaking news. The results first appeared as arXiv preprints on **3 and 7 June 2026** (Europe and China), and the peer-reviewed Nature papers came out on **7 October 2026**. RRI says "Nature, 8 Oktober 2026"; Crossref and EurekAlert both give **7 Oct 2026** (8 Oct is the WIB date of the online release, so this is a minor slip). The story is still fresh enough for a "cara kerja" explainer, because the peer-reviewed papers are only a month old.

**What "beroperasi mandiri 24 jam" means precisely:** the Vienna clock **locked its own laser to the thorium nuclear resonance and kept that lock for more than 24 hours without anyone touching it**. "Mandiri" (self-stabilising) means the **nucleus itself is the reference** that corrects the laser. Earlier thorium work only *measured* the nuclear frequency against a separate atomic clock. The clock was still *compared* with an optical atomic clock during the run (a Yb+ single-ion clock, per the abstract; the PTB release says an optical clock at the Austrian metrology institute BEV-PTP in Vienna), but only to **grade** it, not to keep it running. It does **not** mean a portable box running alone in a room.

---

## 2. Verified facts

### A. The October 2026 result (Vienna)

1. **Paper:** L. Toscani De Col, ... M. V. Okhapkin, E. Peik, T. Schumm (28 authors), "A thorium-229 optical nuclear clock with feedback loop", *Nature*, published 7 Oct 2026, DOI 10.1038/s41586-026-11084-4. (Crossref, high confidence.)
2. **Who:** **TU Wien** (Prof. **Thorsten Schumm**, Institute of Atomic and Subatomic Physics) with **PTB Braunschweig** (Prof. **Ekkehard Peik**, head of PTB Dept. 4.4 Time and Frequency). The laser came from PTB with the **Max Born Institute, Berlin**. **Not JILA/Jun Ye** for this result. (EurekAlert, ScienceDaily, high.)
3. **What they did (abstract):** stabilised a **continuous-wave laser** to the **148-nm** nuclear transition using fast feedback from **absorption** spectroscopy. The thorium-229 nuclei sit in a **millimetre-sized calcium fluoride (CaF2) crystal at room temperature**. A subharmonic of the 148-nm light was continuously compared with a **Yb+ single-ion clock**. (Crossref abstract, high.)
4. **Numbers:** shot-noise-limited fractional frequency instability **3×10⁻¹² /√(τ/s)**, "approaching **10⁻¹⁵** instabilities over 1 day of operation". The press releases translate 10⁻¹⁵ as "about **one second in 30 million years**". The arithmetic checks out: 1/10⁻¹⁵ s ≈ 31.7 million years. Authors project **several orders of magnitude** improvement in future devices. (High.)
5. **"Over 24 hours without user intervention"** is the PTB release's own phrase. (High.)
6. **Key enabler:** a compact **continuous-wave solid-state VUV laser** from PTB and Max Born Institute, presented **December 2025**. Earlier work used a pulsed laser that filled "several square metres" of optical tables. The pulsed method irradiated for 2 min, blocked the beam, and counted fluorescence with a **~10-minute time constant**, which was too slow to steer a clock. The new method reads **how much laser light the nuclei absorb**, with no delay. (EurekAlert, high.)
7. **Companion paper:** I. Morawetz et al., "Continuous-wave laser absorption spectroscopy of the thorium-229 nucleus", *Nature* 657, 626–631, published 16 Sep 2026, DOI 10.1038/s41586-026-11011-7. It excited the nucleus with a CW laser at **sub-nanowatt** power and found **two different thorium sites** in CaF2. One site has a very small electric field gradient (**<0.1 V/Å²** vs ~100 V/Å² before), which promises a line almost independent of lattice spacing. (Crossref abstract, high.)
8. **Dark matter test already done:** the clock was used to search for periodic or slow drifts in the nuclear transition energy, on timescales from **20 s to 1 day**. The constraints "compete with the best atomic clocks" for dark-matter coupling to photons and "go beyond previous measurements" for coupling to the **strong force**. This is a limit (nothing found), **not a discovery**. (Abstract, high.)
9. **Not a record:** Schumm says it is "not yet at the level of the world's best optical atomic clocks, but for a first prototype it is a fantastic result". Peik says it "does not yet set any world records". (High.)
10. **Firsts claimed by PTB:** the first clock based on a **nuclear** resonance, and the first optical clock whose timekeeping element is a **solid** (crystal), not atoms or ions trapped in vacuum. (High.)

### B. The Beijing clock (same week)

11. **Paper:** Huang, Yan, Xiao, Bu, Zhao, ... Liangbi Su, **Shiqian Ding** (39 authors), "A nuclear clock synchronized to 229Th", *Nature*, 7 Oct 2026, DOI 10.1038/s41586-026-11122-1. Led by **Tsinghua University** (Ding), as part of a collaboration of Chinese institutes. (Crossref, SciAm, high.)
12. **Method:** a CW, narrow-linewidth **148.4 nm VUV** laser at **10 µW**, made by **four-wave mixing in cadmium vapour**, with phototube frequency-modulation absorption readout, in **229Th:CaF2** crystals. Instability **5×10⁻¹³ /√(τ/s)**, about **6× better** than Vienna's 3×10⁻¹². Two independently made crystals agreed **at the 10⁻¹³ level**. (Abstract, high.)
13. SciAm: China used a much stronger laser but a crystal with less thorium-229, so the signals were comparable. (Medium-high.)
14. **Who was "first"?** Vienna's preprint was posted on 3 June and Beijing's on 7 June 2026. Both Nature papers came out the same day. PopSci calls Vienna "the first nuclear clock that stabilizes itself", and PTB says Vienna's results came first, by weeks. A fair line: **"two teams, Vienna and Beijing, within days of each other"**. Schumm calls it "fierce but friendly global competition". (High.)

### C. History (milestones)

15. **2003:** Ekkehard Peik (PTB) proposes a thorium nuclear clock (with Christian Tamm; Tamm not re-checked today). (EurekAlert, high for Peik + 2003.)
16. **April 2024:** Tiedau, Okhapkin, Zhang ... Peik, Schumm et al., "Laser Excitation of the Th-229 Nucleus", *Phys. Rev. Lett.* 132, 182501 (29 Apr 2024). First laser excitation of an atomic nucleus. **Wavelength 148.3821(5) nm, frequency 2020.409(7) THz, isomer energy ~8.4 eV.** Fluorescence lifetime in the crystal **630 s**, which means an isomer half-life of **1740 s** for a bare nucleus. They used a control crystal with **Th-232, where no signal appeared**. (Crossref abstract, high.) Peik: the laser had to hit the energy "to within one millionth of an electron volt".
17. **4 Sep 2024:** Zhang, Ooi, Higgins ... **Jun Ye (JILA, NIST/CU Boulder)** with TU Wien, "Frequency ratio of the 229mTh nuclear isomeric transition and the 87Sr atomic clock", *Nature*, DOI 10.1038/s41586-024-07839-6. Using a **VUV frequency comb**, they measured the nuclear line directly against JILA's **strontium optical clock**. The frequency was about **2,020,407,384,335 kHz** (my memory, not re-checked; medium-high). This was the "frequency comb link to the Sr clock" step. It was not yet a clock that runs itself, because the comb/Sr clock was the reference. (Title, date, authors via Crossref, high. Number from memory.)
18. **Jan 2026:** Ooi, Doyle, Zhang, Higgins, **Ye** ... Beeks, Sikorsky, Schumm, "Frequency reproducibility of solid-state thorium-229 nuclear clocks", *Nature*, 28 Jan 2026, DOI 10.1038/s41586-025-09999-5. (Title, date, authors via Crossref, high; abstract not available.)
19. **Dec 2025:** compact CW VUV laser from PTB + Max Born Institute (see fact 6).
20. **Jun 2026:** preprints from Vienna and Beijing. **Oct 2026:** both Nature papers.

### D. Clock basics (background, standard knowledge, not re-fetched today)

21. Every clock = **oscillator** (something that swings at a steady rate) + **counter** (counts swings) + **reference** that keeps the swing honest. Pendulum ~1 Hz, quartz watch **32,768 Hz** (2¹⁵).
22. **SI second** = **9,192,631,770** oscillations of the radiation from the cesium-133 ground-state hyperfine transition (microwave). It has been fixed since 1967. Best cesium fountains reach ~10⁻¹⁶. (High.)
23. **Optical clocks** (Sr, Yb, Al+ and others) use visible/UV electron transitions at ~10¹⁵ Hz, which is ~100,000× more ticks per second than cesium. The best reach ~10⁻¹⁸. SciAm quotes "a second every **40 billion years**". A redefinition of the second around optical clocks is being discussed (the target date of about 2030 was not re-checked today). (Medium-high.)
24. A **frequency comb** (Nobel 2005, Hall & Hänsch) works like a ruler of evenly spaced laser lines. It converts optical frequencies (~10¹⁵ Hz) into countable radio frequencies, so an optical clock can be read out.
25. **Why thorium-229 is special:** nuclear excited states are normally **keV to MeV** (gamma rays), far beyond any laser. Th-229 has an isomer only **~8.4 eV** up, which is in the vacuum ultraviolet (148 nm). It is the only known nucleus with a laser-reachable transition. Th-229 is radioactive (alpha decay, half-life ~7,900 years; from memory, medium).
26. **Why a crystal:** CaF2 is transparent at 148 nm and can hold huge numbers of thorium ions (SciAm: "trillions") in one millimetre-sized piece. All of them are probed at once, so the signal is strong. No laser cooling or ion trap is needed.
27. **Why the nucleus is less disturbed:** the nucleus is **>10,000× smaller** than the atom (TU Wien) and is shielded by its electron cloud. Stray electric/magnetic fields and neighbouring atoms affect it far less than they affect outer electrons. But it is **not perfectly immune**: in a crystal the line still shifts with temperature and with the electric field gradient. That is why the "high-symmetry site" (fact 7) and "weakly temperature-sensitive" transition (Beijing abstract) matter.
28. **Why it is sensitive to new physics:** the 8.4 eV is a tiny difference between two huge nuclear energies (MeV scale) from the strong and electromagnetic forces. A tiny change in a fundamental constant (fine-structure constant, quark masses) would cause a **large relative change** in the transition. Estimates commonly quoted are ~10³–10⁴× enhancement vs atomic clocks (order of magnitude from literature, medium; exact figure varies by model).

---

## 3. Mechanism in 7 animation steps (Bahasa Indonesia)

1. **Semua jam itu sama: ayunan + penghitung.** Bandul berayun sekitar 1 kali per detik, kristal kuarsa di jam tangan bergetar 32.768 kali per detik. Jam cuma menghitung ayunan itu. Makin cepat dan makin stabil ayunannya, makin presisi jamnya.
2. **Jam atom: "detik" resmi dunia.** Sejak 1967, satu detik = 9.192.631.770 getaran gelombang mikro yang pas membuat elektron atom cesium berpindah tingkat energi. Jam atom optik (strontium, iterbium) memakai cahaya laser yang bergetar ~100 ribu kali lebih cepat, jadi bisa membagi waktu jauh lebih halus.
3. **Masalahnya: elektron itu "kulit luar" yang gampang terganggu.** Elektron mengitari atom di bagian paling luar. Medan listrik, magnet, dan atom tetangga bisa sedikit menggeser frekuensinya. Karena itu jam atom terbaik harus memerangkap atom di ruang hampa dan mendinginkannya mendekati nol mutlak.
4. **Masuk ke inti: 10.000 kali lebih kecil, terlindung.** Inti atom bersembunyi di tengah dan terbungkus awan elektron, jadi jauh lebih tenang. Tapi biasanya mengubah tingkat energi inti butuh energi raksasa (sinar gamma). Ada satu pengecualian: **thorium-229**. Tingkat energi keduanya sangat berdekatan, hanya ~8,4 elektronvolt, sehingga cukup dicapai dengan laser ultraviolet 148 nanometer.
5. **Triliunan inti dalam sebutir kristal.** Atom thorium-229 disisipkan ke kristal kalsium fluorida seukuran milimeter, pada suhu ruang. Laser 148 nm (ultraviolet vakum, jadi harus di ruang hampa) menembus kristal itu.
6. **Kunci umpan balik = "jam yang mengoreksi dirinya sendiri".** Inti thorium hanya menyerap cahaya bila frekuensi laser pas. Kalau laser melenceng sedikit, cahaya yang terserap berkurang, sensor membaca perubahan itu, dan laser otomatis didorong kembali ke titik pas. Inilah yang di Wina berjalan lebih dari 24 jam tanpa disentuh manusia. Getaran laser yang sudah "dikunci" itu adalah detak jamnya.
7. **Menghitung detaknya + hasilnya.** Sisir frekuensi (frequency comb) berperan sebagai penggaris cahaya. Alat ini mengubah getaran ~2.020 triliun kali per detik menjadi angka yang bisa dihitung elektronik. Hasil prototipe: sekitar 10⁻¹⁵, kira-kira meleset 1 detik dalam 30 juta tahun. Ini belum mengalahkan jam atom optik terbaik, tapi pintunya kini terbuka: jam kompak tanpa ruang hampa raksasa, navigasi tanpa GPS, dan detektor materi gelap.

---

## 4. Myths, traps and caveats

1. **"Jam nuklir = pakai tenaga nuklir / reaktor / berbahaya."** Wrong. "Nuklir" means it reads the **atomic nucleus**. No fission, no power plant. The thorium is a tiny dopant in a crystal. It is radioactive (alpha), but it is not an energy source here. Say this in the first 15 s, or viewers will mix it up with the PLTN/Iran news in the same feed.
2. **"Lebih akurat dari jam atom."** Not yet. The October 2026 prototypes are **worse** than the best optical atomic clocks (~10⁻¹⁵ vs ~10⁻¹⁸) and are roughly on par with or below cesium fountains. Use the word **"berpotensi"**. ScienceDaily's headline "could make atomic clocks obsolete" is hype.
3. **"1 detik dalam 30 juta tahun" was not measured over 30 million years.** It is a translation of the ~10⁻¹⁵ figure reached after one day of averaging. It is also **instability (stability)**, not **accuracy**. RRI calls it "ketelitian", which is loose. **SciAm/Nature news said "one second in three million years"**, which conflicts by 10×. The 30-million figure matches 10⁻¹⁵ arithmetically and comes from the TU Wien/PTB releases, so use 30 million and note that it is a daily-average figure.
4. **"Nuclear clocks are a nuclear version of atomic clocks, so 'atomic clock' is now wrong."** Both are atomic clocks in the broad sense. Better: "jam atom biasa membaca elektron; jam nuklir membaca inti".
5. **"Jun Ye/JILA built the Vienna clock."** No. Vienna = **TU Wien (Schumm) + PTB (Peik)**. JILA did the 2024 frequency-comb link to Sr, with TU Wien crystals, and the Jan 2026 reproducibility study. Beijing = **Tsinghua (Shiqian Ding)**.
6. **"Pertama di dunia" (Vienna only).** Two clocks appeared within days (preprints 3 and 7 June 2026, same Nature issue date). The Beijing clock is **~6× more stable** in short-term instability. Vienna's distinctive claim is "first to self-stabilise for >24 h", reported by PTB. Do not say Vienna is the only one.
7. **"Totally immune to environment."** Less sensitive, not immune. In a crystal the line still depends on temperature and on the local crystal field. That is why the September 2026 paper hunted for a high-symmetry site.
8. **Date slip:** RRI says Nature 8 Oct 2026. The official date is **7 Oct 2026** (online, CET). RRI's "reproduksibilitas 5×10⁻¹³" could **not be matched** to any abstract I read. The Beijing abstract gives 5×10⁻¹³ as *instability* coefficient and crystal agreement at 10⁻¹³. Do not use the RRI reproducibility number.
9. **PopSci line "about 10× worse than cesium clocks"**: plausible order of magnitude (cesium fountains ~10⁻¹⁶), but this is PopSci's own comparison. Avoid exact multiples.
10. **148 nm is not visible light**, so do not show a visible purple laser as "the real colour". It is vacuum UV, which air absorbs, so the beam must travel in vacuum or purged gas. Visualise it as invisible with a stylised glow plus an on-screen label.
11. **"GPS will use it soon."** These are lab prototypes, and lasers are still the bottleneck. Uses in navigation and geodesy are **future possibilities**. Note: SciAm quotes Schumm saying crystal nuclear clocks are "already being developed commercially" (no company named).

---

## 5. Hook angles (90-second Indonesian video)

1. **(Best) Myth-buster plus curiosity:** "Jam ini 'nuklir', tapi tidak ada reaktor di dalamnya. Yang berdetak justru inti atom thorium, dan tiap detik ia bergetar 2 ribu triliun kali." The hook kills the obvious misreading and gives a huge number.
2. **Number shock:** "Meleset satu detik dalam 30 juta tahun, dan ini baru prototipe pertama." Follow with the honest twist: jam atom terbaik masih lebih hebat, jadi kenapa ilmuwan heboh?
3. **Self-correcting clock:** "Untuk pertama kalinya, sebuah jam dikoreksi oleh inti atom, bukan manusia, selama 24 jam penuh di Wina."
4. **Race angle:** "Wina vs Beijing: dua jam nuklir pertama dunia lahir hanya selisih 4 hari."
5. **Hunt for the invisible:** "Jam ini dipakai untuk memburu materi gelap, sesuatu yang belum pernah dilihat siapa pun."

---

## 6. Visual / 3D beat ideas

- **Zoom-down ladder (hook to step 4):** pendulum, then quartz tuning fork, then cesium atom with orbiting electron, then a dive through the electron cloud into the nucleus. A scale HUD ticks "1 Hz, 32.768 Hz, 9.192.631.770 Hz, ~2.020.000.000.000.000 Hz". This gives one continuous camera move, so it avoids a PPT look.
- **Electron vs nucleus "weather test":** split screen. The electron orbit wobbles while stray field lines and neighbouring atoms jostle it. The nucleus sits calm inside its electron "armour". Label "10.000× lebih kecil".
- **Energy-ladder gag:** typical nuclear rungs drawn kilometres apart (keV–MeV, a gamma bolt), versus thorium-229 with two rungs almost touching (8,4 eV), which a laser can bridge. Strong visual payoff for "why thorium".
- **Crystal hero shot:** a millimetre CaF2 crystal (glassy cube, PRECISION or INNERWORKS style) glowing inside a vacuum chamber. Inside the lattice, thorium ions glow as golden points in "trillions".
- **Feedback loop as a dial:** an absorption dip curve. A laser-frequency needle drifts right, the detected light rises, an arrow pushes the needle back, and the loop repeats. A 24-hour time-lapse counter runs in the corner: "0 intervensi manusia".
- **Frequency comb ruler:** comb teeth sweep over the laser line, and the digits fall into a counter, which becomes the clock face.
- **Map duel:** Vienna (TU Wien + PTB Braunschweig) and Beijing (Tsinghua) pins, with "3 Juni / 7 Juni 2026 preprint" and "Nature, 7 Okt 2026".
- **Uses montage (payoff):** navigation without GPS satellites (submarine, tunnel), geodesy (clocks tick slower lower in gravity, so a clock can sense height), and a faint dark-matter wave washing over the crystal while the frequency stays flat ("belum ditemukan, tapi batasnya makin sempit").
- **Brand-in-scene:** "AUDIRA" etched on the vacuum-chamber nameplate or the HUD frequency readout.
- Style candidates: **INNERWORKS** (cutaway chamber + nucleus), **PRECISION** (premium crystal + laser hero), **NANOFORGE** (subatomic dive), **CYBERFORGE** (HUD frequency readouts).

---

## 7. Open questions / unverified

- The exact wording of the **TU Wien** press release (tuwien.at): not read directly. The content comes from the ScienceDaily repost (source "Vienna University of Technology") and the PTB release on EurekAlert.
- **Which reference clock** graded the Vienna run: the abstract says a "Yb+ single-ion clock", and PTB says "an optical atomic clock at BEV-PTP Vienna". These are probably the same device (a Yb+ clock at BEV), but this was not confirmed.
- RRI's "reproduksibilitas ~5×10⁻¹³": source not found. Treat it as unverified.
- The 30-million-year vs 3-million-year conflict between the TU Wien release and SciAm/Nature news. The arithmetic favours 30 million for 10⁻¹⁵; SciAm's figure may refer to the June preprint numbers.
- The JILA 2024 absolute frequency (2,020,407,384,335 kHz) and the Th-229 half-life (~7,900 yr) are from memory and were not re-fetched today.
- Size of the "sensitivity enhancement" to changes in fundamental constants: model dependent, quoted in literature as roughly 10³–10⁴×. No single primary figure was checked.
- The **lutetium-176** clock ("Best clock ever", Nature news 23 Sep 2026) is context only; it was not read.
- The Beijing collaboration's full institute list beyond Tsinghua was not checked.

### Failed / unread sources
- nature.com article pages: JavaScript "Client Challenge" page, no content (Crossref used instead).
- arXiv API: returned an empty response (0 bytes) for two queries.
- tuwien.at news page: no match found through scraping or Bing web RSS.
- Bing web search RSS for site:tuwien.at: returned irrelevant results.
- Not read: TIMES Indonesia, C&EN, DongA Science, MSN syndications, Quantum Zeitgeist, The Debrief, SciTechDaily.
- ScienceDaily: read up to about the 7,000-character mark. The tail (next steps) failed on a console encoding error and was not re-read.
