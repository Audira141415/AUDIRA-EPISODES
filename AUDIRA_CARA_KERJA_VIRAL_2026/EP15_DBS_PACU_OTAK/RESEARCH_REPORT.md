# EP 15: Saklar di Dada: Cara Kerja Deep Brain Stimulation untuk Parkinson

AUDIRA, seri CARA KERJA VIRAL. Created by Agus Dwi R. Status: final dengan voice-over, 8 November 2026.

Riset dari sumber yang dibaca langsung 8 November 2026. Setiap fakta berlabel HIGH, MED, atau LOW; naskah hanya memakai HIGH dan MED.

# EP15 — Deep Brain Stimulation ("alat pacu jantung untuk otak") + VNS: research notes

Research date: 2026-11-08. This file holds research only, not a script.
Method: Google News RSS links were decoded to real URLs (batchexecute decoder) and article HTML was read with Python. Scientific facts come from PubMed/Europe PMC abstracts, PMC full text via NCBI E-utilities, Wikipedia, AJMC and Medtronic newsroom pages. Mayo Clinic returned 403. The Medtronic Feb 2025 press-release URL returned 404, so the FDA approval is confirmed through AJMC (26 Feb 2025) and a 2026 peer-reviewed review instead. NINDS page loaded only navigation.

---

## 1. Viral hook: is it recent?

| Headline | Outlet | Published | URL |
|---|---|---|---|
| "Teknologi DBS dan VNS untuk Parkinson dan Epilepsi Kini Tersedia di Mitra Keluarga Kemayoran" | Olenka | **Tue 3 Nov 2026** | https://olenka.id/teknologi-dbs-dan-vns-untuk-parkinson-dan-epilepsi-kini-tersedia-di-mitra-keluarga-kemayoran/all |
| "Harapan Baru Pasien Parkinson dan Epilepsi Melalui Teknologi Neuromodulasi DBS dan VNS" | Media Indonesia | 3 Nov 2026 (22:00 GMT, i.e. 4 Nov WIB) | https://mediaindonesia.com/kesehatan/952029/harapan-baru-pasien-parkinson-dan-epilepsi-melalui-teknologi-neuromodulasi-dbs-dan-vns |
| "Teknologi Baru Bantu Kendalikan Parkinson dan Epilepsi" | Wartakotalive | 3 Nov 2026 | https://wartakota.tribunnews.com/bisnis/906405/teknologi-baru-bantu-kendalikan-parkinson-dan-epilepsi |
| "Teknologi Operasi Otak Modern untuk Parkinson dan Epilepsi Kebal Obat Kini Hadir di Indonesia" | CAKAPLAH.com | 3 Nov 2026 | https://www.cakaplah.com/artikel/kesehatan-dan-keluarga/21371/2026/11/03/teknologi-operasi-otak-modern-untuk-parkinson-dan-epilepsi-kebal-obat-kini-hadir-di-indonesia/ (not opened) |
| "Parkinson dan Epilepsi Kebal Obat Kini Punya Harapan Baru, Teknologi Operasi Otak Hadir di Indonesia" | Suara.com | 5 Nov 2026 | https://www.suara.com/health/2026/11/05/165631/parkinson-dan-epilepsi-kebal-obat-kini-punya-harapan-baru-teknologi-operasi-otak-hadir-di-indonesia (not opened) |
| "NeuroPrime Mitra Keluarga Kemayoran Punya Teknologi Operasi Otak Modern..." | Kabar DKI (Pikiran Rakyat) | 5 Nov 2026 | https://dki.pikiran-rakyat.com/lifestyle/pr-30910544224/neuroprime-mitra-keluarga-kemayoran-punya-teknologi-operasi-otak-modern-bagi-pasien-parkinson-dan-epilepsi |
| Same release also at Warta Ekonomi, RM.ID, AnalisaDaily, Riauin, Demokratis, ChatNews, Genz.id, Waspada Online, Jakarta Daily | various | 3–4 Nov 2026 | Google News RSS |

**News facts** (identical across Olenka, Media Indonesia, Wartakota, RM.ID, Kabar DKI; all are one press release, "dikutip dari keterangan resminya, Selasa (3/11/2026)"):
- **Hospital / unit:** NeuroPrime (Parkinson, Movement Disorder and Epilepsy Center), **RS Mitra Keluarga Kemayoran**, Jakarta.
- **Only doctor named:** **dr. Kevin Gunawan, Sp.BS, F.NF, F.BSA**, functional neurosurgeon.
- **Services listed:** DBS (Parkinson, essential tremor, dystonia), VNS (drug-resistant epilepsy), microvascular decompression (hemifacial spasm, trigeminal neuralgia). Support tech: MRI, PET scan, navigation, intraoperative nerve monitoring.
- **Stats quoted in release:** BMJ/GBD 2021 projects Indonesia's Parkinson cases +184% from 2021 to 2050; about 1 in 3 people with epilepsy keep having seizures despite optimal anti-seizure drugs.
- **No launch date, patient count, price, or device brand** is given. No "first in Indonesia" claim appears in the release text. Headlines say "kini hadir di Indonesia" / "Hadir di Indonesia", which readers may misread as "first".

**Is it "first in Indonesia"? No.** Evidence:
- **DBS in Indonesia since 2013–2014.** National Hospital Surabaya received MURI records in April 2015 as the first hospital in Indonesia to do Parkinson/tremor surgery and DBS. dr. Achmad Fahmi, Sp.BS, got a MURI record as "pionir implementasi DBS". He said ~100 movement-disorder operations had been done since 3 April 2013, about 90% lesioning (~Rp 90 juta) and 10% DBS (~Rp 300 juta). Source: detikNews, 11 Apr 2015, https://news.detik.com/berita-jawa-timur/d-2884494/surabaya-kota-pertama-di-indonesia-mampu-lakukan-operasi-parkinson. Confidence **HIGH**.
- **Siloam Hospital Kebon Jeruk** celebrated "10 years of DBS therapy in Indonesia" in 2024, >60 implants with Medtronic, and did **Indonesia's first Percept PC (BrainSense) implant on 26 June 2024**. Source: Kontan, 25 Aug 2024, https://kesehatan.kontan.co.id/news/peluncuran-percept-pc-dengan-teknologi-brainsense-di-siloam-hospital-kebon-jeruk. Confidence **HIGH** (hospital/Medtronic claim).
- **VNS in Indonesia since 5 Nov 2023:** National Hospital Surabaya, dr. Heri Subianto, SpBS(K), first VNS implant for epilepsy (PINS device). Source: duta.co, 9 Nov 2023, https://redaksi.duta.co/pertama-kali-di-indonesia-nh-lakukan-operasi-vagus-nerve-stimulation-untuk-epilepsi/. Confidence **MED** (single regional outlet, hospital claim).
- **About 21 movement-disorder service centres** exist in Indonesia (dr. Ahmad Fahmi at the Indonesia Parkinson Ecosystem Forum, 22 Sep 2026). He dated first lesioning to 2013 and first DBS to 2014. Source: Media Indonesia, https://mediaindonesia.com/kesehatan/936180/bpjs-kesehatan-pastikan-obat-parkinson-dijamin-jkn. Confidence **MED**.
- **RSU Royal Prima Medan** did the first stereotactic Parkinson surgery in North Sumatra (June 2024). The article does not say if it was DBS or lesioning. Source: https://www.waspada.id/artikel/operasi-parkinson-sudah-bisa-dilakukan-di-sumut. Confidence MED.
- RSCM and RS Pusat Otak Nasional: no evidence found in this session. Do not name them.

**Verdict:** **Recent (3–5 Nov 2026), but it is a hospital press release, not a first.** Safe framing: "Satu lagi rumah sakit di Jakarta kini menawarkan DBS dan VNS" or "teknologi ini sudah ada di Indonesia sejak 2013–2014". Never say "pertama di Indonesia".

---

## 2. Verified facts

### A. DBS hardware and surgery

1. **System = three parts:** pulse generator (titanium can + battery) under the skin below the collarbone, an extension wire running under the skin up the neck and behind the ear, and leads with **four platinum-iridium contacts** entering through a burr hole to deep brain nuclei. Burr hole about **14 mm**. Source: https://en.wikipedia.org/wiki/Deep_brain_stimulation. Confidence **MED** (Wikipedia, standard textbook).
2. **Targets:** subthalamic nucleus (STN), globus pallidus internus (GPi), or thalamic VIM (mainly tremor). The right brain is stimulated for left-body symptoms and vice versa. Source: Wikipedia DBS; JAMA 2009 trial used STN or GPi (PMID 19126811). Confidence **HIGH**.
3. **Targeting:** frame-based or frameless stereotaxy guided by MRI. Awake surgery lets the team test symptoms (wrist rigidity, tremor, speech) live. Microelectrode recording maps single neurons along the track, then a permanent lead replaces the microelectrode. Asleep variants use intraoperative MRI. Source: Wikipedia DBS. Confidence **MED**.
4. **Typical settings:** standard initial programming keeps **pulse width 60 µs and frequency 130 Hz** and raises amplitude stepwise (0.1–0.5 V or mA steps, up to about 5 V/mA) until tremor stops or side effects appear. Tremor "typically disappears almost instantly" with STN or VIM stimulation; axial symptoms take hours to days. Source: Koeglsperger et al., Front Neurol 2019, PMC6558426. Confidence **HIGH**.
   - Clinical frequency range for tremor: 80–180 Hz; above 100 Hz works best. Source: Wikipedia DBS. MED.
   - The brief's "1–4 V/mA" range was **not found as such**. One study cited in the review: mean 1.6 mA at 60 µs for rigidity control. Say "beberapa volt / miliampere saja".
5. **History:** Benabid and Pollak (Grenoble) began modern DBS in **1987**, discovering the tremor effect by chance while mapping a lesion target. FDA approved DBS for tremor in **1997** and for Parkinson's disease in **2002**. Source: Wikipedia DBS; Benabid & Pollak, Lancet 1991 (PMID 1671433). Confidence **HIGH**.
6. **Patients worldwide:** Wikipedia says **more than 244,000** implanted in three decades. Medtronic says it has "served more than 200,000 people with movement disorders and other conditions" (4 Nov 2026). The brief's "160,000" is outdated. Sources: Wikipedia DBS; https://news.medtronic.com/2026-11-04-Medtronic-and-Michael-J-Fox-Foundation-Partner-to-Help-More-People-with-Parkinsons-Understand-Deep-Brain-Stimulation. Confidence **MED**. Safe line: "lebih dari 200 ribu orang".

### B. Why it works

7. **Mechanism not fully understood.** Leading idea: DBS disrupts pathologically oversynchronized network activity, mimicking a lesion but reversibly (switch off = effect gone). Source: Wikipedia DBS. Confidence **HIGH** that it is unresolved.
8. **Beta oscillations.** Exaggerated synchrony in the **beta band (13–30 Hz)** is linked to slowness (bradykinesia). STN stimulation reduced local beta activity, and less beta correlated with better movement. Source: Kühn et al., J Neurosci 2008, PMID 18550758. Confidence **HIGH**.

### C. Adaptive DBS

9. **FDA approved Medtronic BrainSense Adaptive DBS** (plus electrode identifier) for Parkinson's, announced around **24–26 Feb 2025**. It runs on Percept neurostimulators and uses beta-band sensing. Evidence: ADAPT-PD randomized crossover trial. Electrode identifier cut initial programming time by 85% (company figure). Sources: AJMC, 26 Feb 2025, https://www.ajmc.com/view/adaptive-deep-brain-stimulation-technology-receives-fda-approval-for-parkinson-disease; J Clin Neurosci 2026 review "From beta thresholds to learned control" (PMID 42777426) confirms "February 2025 FDA approval". Confidence **HIGH**. Note: Wikipedia text still says "not FDA approved", which is outdated.
10. **Modes:** single-threshold adjusts fast to suppress beta bursts; dual-threshold adapts slowly to medication cycles. Source: AJMC. Confidence MED.
11. **Spread:** Medtronic launched aDBS in India on 23 Apr 2026. Source: https://news.medtronic.com/Medtronic-Launches-Adaptive-Deep-Brain-Stimulation-System-for-Parkinsons-Patients-in-India. HIGH. Indonesia: Percept PC (sensing) implanted since June 2024 (fact above). Whether aDBS mode is active in Indonesia: unverified.

### D. Outcomes and risks

12. **JAMA 2009 RCT (255 patients):** DBS gained a mean **4.6 hours/day** of "on" time without troubling dyskinesia vs **0 h/day** with best medical therapy at 6 months. Source: Weaver et al., PMID 19126811. Confidence **HIGH**.
13. **NEJM 2006 RCT (156 patients, under 75):** STN stimulation beat medication alone on quality of life (PDQ-39) and motor scores at 6 months. Source: Deuschl et al., PMID 16943402. Confidence **HIGH**.
14. **Limits:** DBS does not usually help posture, gait instability or falls, and can bring cognitive decline, depression, apathy. Not for people with dementia or severe depression. Source: Wikipedia DBS. MED.
15. **Risks (meta-analysis numbers):** intracranial haemorrhage ~1–2% symptomatic; infection ~5% (range 1–8% across studies); lead migration/fracture and pulse-generator malfunction ~1–2%. Source: Wikipedia DBS (citing Rasiah 2023, World Neurosurg). Confidence **MED**; numbers vary by study, quote only "risiko perdarahan sekitar 1–2%".
16. **Not a cure.** Medtronic: "there is currently no cure"; dr. Kevin: "DBS bukan mengganti fungsi otak maupun menyembuhkan penyakit Parkinson". HIGH.
17. **Cost/coverage in Indonesia:** DBS **not covered by JKN** as of 22 Sep 2026; possible after Health Technology Assessment. Source: Media Indonesia 22 Sep 2026 (BPJS representative). Confidence MED. 2015 price ~Rp 300 juta (detik). Current price unknown.

### E. VNS

18. **Device:** matchbox-size generator under the left collarbone, lead wrapped around the **left vagus nerve** in the neck (carotid sheath). Usually outpatient. FDA approved for epilepsy in **1997** (Cyberonics, now LivaNova). US label: adjunct for refractory focal seizures, age 4+. Source: https://en.wikipedia.org/wiki/Vagus_nerve_stimulation. Confidence **MED-HIGH**.
19. **Responder rates (registry of 5,554 patients):** 49% had ≥50% seizure reduction at 0–4 months (5.1% seizure-free); **63% at 24–48 months (8.2% seizure-free)**. Literature review: 40% → 60.1% responders, 8.0% seizure-free. Response grows over time. Source: Englot et al., Neurosurgery 2016, PMID 26645965. Confidence **HIGH**.
20. **Mechanism also unclear:** signals go via nucleus of the solitary tract to locus coeruleus (noradrenaline) and raphe (serotonin); responders show cortical desynchronization. Source: Wikipedia VNS. MED.
21. **Side effects:** hoarseness 28% and throat tingling 12% at 1 year, falling later. Source: Wikipedia VNS. MED.
22. **Duty cycle example:** LivaNova default for depression is 30 s on every 5 minutes, 20 Hz, 250 µs. Epilepsy settings not verified this session. Some newer devices add on-demand stimulation (duta.co says the PINS device fires on seizure signs; MED). Patients can also use a magnet: unverified here.

### F. Parkinson's burden

23. **BMJ 2025 (GBD 2021 modelling):** global cases projected **25.2 million in 2050**, +112% from 2021. **Indonesia newly enters the top-10 countries** and has the **largest increase among them: +184%**, driven mostly by ageing. Source: Su et al., BMJ 2025, PMID 40044233, PMC11881235. Confidence **HIGH**.
24. Medtronic/MJFF: about 6 million people live with PD today. MED.
25. Current Indonesian prevalence count: **no credible figure found**. Do not state one.

---

## 3. Mechanism in 7 animation steps (Bahasa Indonesia)

1. **Masalahnya: orkestra otak yang "kompak berlebihan".** Pada Parkinson, sel penghasil dopamin berkurang. Sirkuit gerak di inti dalam otak berdenyut serempak di gelombang beta (13–30 Hz), seperti dengung yang menahan gerakan.
2. **Peta 3D kepala.** MRI/CT plus bingkai stereotaktik memberi koordinat target sebesar biji kacang: nukleus subtalamikus (STN) atau GPi.
3. **Lubang kecil, kabel tipis.** Lubang sekitar 1,4 cm di tengkorak. Mikroelektroda masuk perlahan.
4. **"Mendengar" neuron.** Tim merekam aktivitas sel saraf di sepanjang jalur dan mendengarnya sebagai bunyi. Pasien sering terjaga untuk tes langsung: tangan digerakkan, tremor dicek.
5. **Kabel permanen + "baterai" di dada.** Elektroda empat kontak dipasang, kabel diteruskan di bawah kulit leher ke stimulator di bawah tulang selangka.
6. **Ketukan 130 kali per detik.** Pulsa sangat singkat (sekitar 60 mikrodetik) dengan beberapa volt saja. Ritme cepat ini mengacaukan dengung beta, dan tremor bisa berhenti dalam hitungan detik.
7. **Versi pintar (aDBS, FDA Feb 2025).** Elektroda yang sama ikut "mendengar" sinyal beta dan menaikkan atau menurunkan stimulasi otomatis.

VNS side beat: generator di dada → kabel melilit saraf vagus kiri di leher → sinyal naik ke batang otak → otak jadi kurang "sinkron" → kejang berkurang (rata-rata, tidak hilang total).

---

## 4. Myths, traps and medical-accuracy cautions

- **"Pertama di Indonesia": false.** DBS 2013–2014 (National Hospital Surabaya, Siloam Kebon Jeruk), VNS Nov 2023 (National Hospital). The release itself does not claim "first".
- **Not a cure.** Say "mengendalikan gejala". Parkinson keeps progressing; DBS does not stop neuron loss.
- **Not for everyone.** Candidates need good levodopa response, no dementia or severe depression. Avoid "solusi untuk semua penderita".
- **Not mind control.** The device does not read thoughts or "kendalikan pikiran". aDBS senses one signal band only.
- **"Pacemaker untuk otak"** is the industry's own analogy (Medtronic, AJMC). Fine as analogy, but the heart pacemaker restores a missing beat; DBS disrupts an abnormal rhythm.
- **Awake surgery:** say "sering" or "bisa", not "selalu". Asleep MRI-guided surgery exists. Pain: the brain itself has no pain receptors is common knowledge but was **not sourced** this session; avoid or phrase carefully ("kulit kepala dibius lokal").
- **On/off tremor demo:** the instant effect is real (PMC6558426: tremor disappears almost instantly). Do not reuse real patient footage; animate instead. Do not claim a specific viral video unless sourced.
- **VNS numbers:** "sekitar 6 dari 10 pasien kejangnya turun setengah atau lebih setelah 2–4 tahun; hanya sekitar 8% bebas kejang." Do not say VNS stops seizures.
- **Do not advise stopping medication.** Both DBS and VNS are add-ons. The release says VNS "tidak menggantikan kebutuhan obat anti bangkitan tanpa arahan dokter".
- **Patient count:** use ">200 ribu" (Medtronic) or ">244 ribu" (Wikipedia, MED). Not "160 ribu".
- **No hospital promotion.** The video should not read as an ad for Mitra Keluarga. Mention it as the news peg once, with the honest "sudah ada sejak 2013" context.
- Closing line suggestion: "Konsultasikan dengan dokter saraf" as disclaimer card.

---

## 5. Hook and curiosity angles (90 s Indonesian video)

1. **"Ada saklar di dada yang bisa menghentikan gemetar dalam hitungan detik."** Show the on/off contrast animated.
2. **"Operasi otak, tapi pasiennya diajak ngobrol."** Awake surgery and "listening to neurons".
3. **"Ketukan listrik 130 kali per detik."** Rhythm vs rhythm: fighting an abnormal brain beat with a faster one.
4. **"Dokter memakainya 30 tahun, tapi masih belum tahu persis kenapa berhasil."** Mystery angle.
5. **"Sekarang alatnya bisa 'mendengar' otak."** aDBS, FDA Feb 2025, beta waves as a signal.
6. **"Indonesia: kenaikan kasus Parkinson terbesar di 10 besar dunia, +184% menuju 2050."** Stakes angle (BMJ 2025).
7. **"Bukan baru, bukan pertama."** Myth-busting: the news says "kini hadir", but Surabaya started in 2013.
8. **VNS twist:** "Satu kabel di leher bisa mengurangi kejang, tanpa menyentuh otak."

---

## 6. Visual / 3D beat ideas (non-gory, respectful)

- **Glass/hologram head** (no blood, no open skull): translucent brain, STN glowing as a small amber almond. Fits INNERWORKS / NANOFORGE / GLASSCRAFT look.
- **Waveform duel:** a thick, chunky beta wave (13–30 Hz) rolling through a brain circuit; a crisp 130 Hz pulse train enters and breaks it into calm noise.
- **Stereotactic frame as a coordinate grid:** XYZ crosshairs converging on the target, CT/MRI slices stacking into a 3D volume.
- **"Listening" beat:** an audio waveform crackling as the microelectrode descends, with depth counter in mm. Use a stylised sound, not a real recording.
- **Wire route:** a soft glowing line from the head behind the ear down to a small titanium "coin" under the collarbone.
- **Hand tremor on/off:** stylised wooden/clay hand holding a cup; switch toggles, ripples in the cup stop. Avoid real patients.
- **aDBS loop:** a dial that turns itself as the beta meter rises and falls (thermostat metaphor).
- **VNS:** neck cross-section in clean diagram style, a coil around a nerve, signal travelling up as light to the brainstem.
- **Indonesia map:** dots for Surabaya 2013, Jakarta 2014/2024, Medan 2024, Jakarta 2026, with "±21 pusat layanan" caption.
- **AUDIRA brand in scene:** label on the stimulator "programmer tablet" UI or the MRI console.

---

## 7. Open questions / unverified

- Exact DBS start date: duta.co (2023) says National Hospital DBS in 2013; dr. Fahmi (Sep 2026) says lesioning 2013, DBS 2014. Use "sejak 2013–2014".
- Whether NeuroPrime has already implanted DBS/VNS patients, how many, device brand, cost: not stated.
- Whether RSCM or RS Pusat Otak Nasional do DBS: no evidence found this session.
- Typical amplitude range: "1–4 V/mA" not found in a source; only stepwise testing up to ~5 V/mA and a 1.6 mA example.
- VNS epilepsy default settings and magnet use: not verified.
- "Brain has no pain receptors" (for awake surgery): not sourced this session.
- Current Indonesian Parkinson prevalence number: no credible source found.
- Cakaplah and Suara.com articles: headlines only, not opened (same release per headlines).
- Medtronic Feb 2025 press release page itself: 404; FDA date confirmed via AJMC and PMID 42777426.
