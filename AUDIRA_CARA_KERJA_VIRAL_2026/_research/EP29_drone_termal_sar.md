# EP29 — How a thermal drone searches for missing people: the Semeru search (Nov 2026) — research notes

Research date: 2026-11-10. This file holds research only, not a script.
Method: Google News RSS (hl=id, `when:14d`, `when:3d`, `when:1d`; queries "pendaki Semeru hilang", "drone thermal Semeru", "pendaki ilegal Semeru", "pencarian pendaki Semeru", "Basarnas drone thermal") with links decoded to real URLs through Google's batchexecute endpoint, plus Bing News RSS as a fallback (Google returned HTTP 429 after ~15 decodes). Article HTML was read with Python urllib (browser User-Agent, normal TLS, no bypass) and tags were stripped. Primary or near-primary sources read: statements by **Kantor SAR Banyuwangi** (Basarnas) head I Made Oka Astawa and by **Balai Besar TNBTS** (head Rudijanta Tjahja Nugraha; Kabag TU Bambang Suryono/Suriyono), as quoted by Kompas.id, Kompas.com, Antara Jatim, RRI, JPNN, Bintang Tenggara. Technical sources: **DJI Enterprise Matrice 4 specs page** (enterprise.dji.com), **Edmund Optics** application note on IR materials, Wikipedia (Microbolometer, Emissivity, Thermal imaging camera, Germanium). Teledyne FLIR (flir.com) returned **HTTP 403** on every page tried. basarnas.go.id answered 200 but its news page held no Semeru item in the HTML.

Confidence tags: **HIGH** = primary source or 3+ independent outlets agree; **MED** = one good secondary source, or textbook physics not read from a primary page this session; **LOW** = single weak source or my own inference/calculation.

Sensitivity note: this is an **active search for two missing 19-year-olds**. As of the last check (10 Nov), they had **not been found** and there is no official statement about their condition. Every line in a script about them must stay at the level of what Basarnas and BB TNBTS have said.

---

## 1. Viral hook: is it recent?

| Headline | Outlet | Published | URL |
|---|---|---|---|
| "Pencarian Dua Pendaki Ilegal Semeru Gunakan Drone Thermal" (the hook article; photo credit Kantor SAR Banyuwangi) | Kompas.id (Defri Werdiono) | 9 Nov 2026, 18:28 WIB | https://www.kompas.id/artikel/pencarian-dua-pendaki-ilegal-semeru-gunakan-drone-thermal |
| "Thermal Drones Used to Search for Two Illegal Semeru Climbers" (English edition, title only) | Kompas.id | 9 Nov 2026 | via Google News |
| "Dua Pendaki Hilang di Gunung Semeru, Tim SAR Terkendala Erupsi" | Kompas.id (Ambrosius Harto) | 8 Nov 2026 | https://www.kompas.id/artikel/dua-pendaki-hilang-di-tengah-erupsi-gunung-semeru |
| "Cari 2 Pendaki Ilegal Hilang di Semeru, Tim SAR Gunakan Drone Thermal" | Kompas.com Surabaya | 9 Nov 2026 | https://surabaya.kompas.com/read/2026/11/09/070000878/cari-2-pendaki-ilegal-hilang-di-semeru-tim-sar-gunakan-drone-thermal |
| "Pencarian 2 Pendaki Hilang di Gunung Semeru Diperluas ke Kalimati dan Ayek-ayek" | Kompas.com Surabaya | 9 Nov 2026 | https://surabaya.kompas.com/read/2026/11/09/134553878/pencarian-2-pendaki-hilang-di-gunung-semeru-diperluas-ke-kalimati-dan-ayek |
| "Cari 2 Pendaki Hilang di Semeru, Tim SAR Malah Temukan 2 Pendaki Ilegal Lainnya" | Kompas.com Surabaya | 9 Nov 2026 | https://surabaya.kompas.com/read/2026/11/09/204703178/cari-2-pendaki-hilang-di-semeru-tim-sar-malah-temukan-2-pendaki-ilegal |
| "TNBTS ungkap kronologi aktivitas pendakian ilegal di Gunung Semeru" (TNBTS official statement) | Antara Jatim | 9 Nov 2026 | https://jatim.antaranews.com/berita/1117147/tnbts-ungkap-kronologi-aktivitas-pendakian-ilegal-di-gunung-semeru |
| "Tim SAR Gabungan Memperluas Area Pencarian Dua Pendaki Hilang" | RRI Jember | 9 Nov 2026 | https://rri.co.id/jember/regional/2882145/tim-sar-gabungan-memperluas-area-pencarian-dua-pendaki-hilang |
| "Masuk Hari Ketiga, Tim SAR Perluas Pencarian Dua Pendaki Semeru dengan Drone Thermal" | JPNN Jatim | 9 Nov 2026 | https://jatim.jpnn.com/jatim-terkini/50094/masuk-hari-ketiga-tim-sar-perluas-pencarian-dua-pendaki-semeru-dengan-drone-thermal |
| "2 Pendaki Ilegal Hilang di Semeru, Mereka Dicari Pakai Drone Thermal" | detikTravel | 9 Nov 2026 | https://travel.detik.com/travel-news/d-8744867/2-pendaki-ilegal-hilang-di-semeru-mereka-dicari-pakai-drone-thermal |
| "Pencarian Dua Pendaki Hilang di Gunung Semeru Dihentikan Sementara, Operasi Dilanjutkan Senin Pagi" | Bintang Tenggara | 8 Nov 2026 | https://www.bintangtenggara.net/lumajang/3923192184/pencarian-dua-pendaki-hilang-di-gunung-semeru-dihentikan-sementara-operasi-dilanjutkan-senin-pagi |
| "TNBTS Blacklist Dua Pendaki Ilegal yang Hilang di Gunung Semeru" | Suara Surabaya (via Antara) | 9 Nov 2026 | https://www.suarasurabaya.net/kelanakota/2026/tnbts-blacklist-dua-pendaki-ilegal-yang-hilang-di-gunung-semeru/ |
| "Dua Pendaki Muda Hilang di Gunung Semeru, Tim SAR Kerahkan Drone Thermal" (title only) | iNews.ID | 7 Nov 2026 | via Google News |

**Verdict:** The hook is **fresh (8–9 Nov 2026) and accurate in its core**. A joint SAR team led by **Kantor SAR Banyuwangi** (Basarnas) with **BB TNBTS** is using a thermal drone to search for two 19-year-old climbers who went up Semeru by an unofficial route while the summit was closed. Two caveats: (a) the brief said "Basarnas Surabaya". The sources name **Kantor SAR Banyuwangi** and **Pos SAR Jember** ("Basarnas Jember" in TNBTS wording). Surabaya appears only as BPBD Kota Surabaya and Polrestabes Surabaya. (b) **No outlet names the drone model.** Newest item found in RSS was dated 9 Nov ~16:30 WIB. No 10 Nov update was found at the time of writing.

---

## 2. Verified facts

### A. The missing climbers (handle with care)

1. **Who:** two men, both **19**. Kompas.id spells them Beryliyant Kusuma Wiraditama (Sedati, Sidoarjo) and Mochamad Wahyu Febriansyah (Rungkut, Surabaya). Antara/TNBTS spell them Berylyant Kusuma Wiraditama and Mochammad Wahyu Febriansyah. Spellings vary between outlets. HIGH (identity), names spelling MED. **Recommendation: do not name them in the video.** Say "dua pendaki muda berusia 19 tahun".
2. **Hometowns corrected:** early reports said both were from Sidoarjo. BB TNBTS corrected this to one from Sidoarjo and one from Surabaya (Antara Jatim). HIGH.
3. **One is a student:** Kompas.id says Universitas Hayam Wuruk Perbanas posted a missing-person notice for Febriansyah, a management student, class of 2025. MED. Not needed in the video.
4. **Last contact:** **Monday 2 Nov 2026**, afternoon/evening, with a friend (TNBTS via Antara and Kompas.id). Kompas.id 8 Nov says "Senin (2/11) malam". HIGH.
5. **What they said:** they rented a motorbike in Lumajang and told the friend/renter they were going to **Ranu Regulo** (a lake beside Ranu Pani). TNBTS via Antara and Kompas.id. HIGH.
6. **Motorbike:** found on **3 Nov** by a Ranu Pani resident at a hut in a farm field **towards the Ayek-ayek route**. The farm owner shared it in a villagers' WhatsApp group, but it was **not passed to park officers**. On **6 Nov, 09:45 WIB**, the renter reported the unreturned bike to the head of RPTN Ranupani. The bike was then matched to the one found on 3 Nov (TNBTS via Kompas.id and Antara). HIGH.
7. **Route:** **Ayek-ayek (Ayak-ayak)** from Ranu Pani. TNBTS says it "is not a public or official climbing route". HIGH. The word "diduga" (suspected) is used by officials, so keep it.
8. **Report to Basarnas:** Saturday **7 Nov, evening**, made by RPTN Ranu Pani (Oka Astawa, Kompas.id 8 Nov). HIGH.

### B. The search

9. **Who searches:** **Kantor SAR Banyuwangi** (head I Made Oka Astawa), **Pos SAR Jember**, **BB TNBTS**, TNI, Polri (incl. Polrestabes Surabaya), BPBD Lumajang, BPBD Kota Surabaya, PPGST (registered Semeru climbing guides), Saver Ranu Pani volunteers, nature-lover groups, OPA Gimbal Alas, Klinik Gunung, and villagers. TNBTS says the operation runs "under the control of BB TNBTS and Basarnas Jember". On Scene Coordinator: **S. Jefriyanzah (Jefriansyah) Putra Pratama**. HIGH.
10. **Timeline:**
    - 7 Nov: TNBTS sends one team of 4 PPGST guides. SAR post opens at the Ranupani resort office. HIGH.
    - 8 Nov (day 2): two SRUs. SRU I covers Ranu Pani gate to Ranu Kumbolo (~7.7 km). SRU II covers Ranu Kumbolo to Kalimati (~5.3 km). The search paused at **17:45 WIB** with no result, and the team camped at Ranu Kumbolo, where a field post was set up (Bintang Tenggara; TNBTS). HIGH.
    - 9 Nov (day 3): **106 personnel in six SRUs**. SRU 1–3 ran an **"ESAR Type I Hasty Search" over 0.84 km²**. SRU 4–5 covered another 0.84 km² sector. **SRU 6 flew the thermal drone in a "parallel search" pattern** over assigned sectors (RRI, JPNN, detikTravel, Kompas.com, Kompas.id). Focus: the **Kalimati block and Ayek-ayek**, especially "cerukan" (hollows/gullies) (Kompas.com). HIGH.
11. **Planned duration:** **7 days, 7–13 Nov 2026** (TNBTS via Antara). That matches Basarnas's standard 7-day operation, which can be extended. HIGH for the plan. The "standard" part is MED (not re-read this session).
12. **Drone:** described as "drone thermal" by Kantor SAR Banyuwangi. Its equipment list also includes mountaineering, jungle rescue, medical and evacuation gear (Kompas.com). **Model not named anywhere.** HIGH that a thermal drone is used; model UNKNOWN.
13. **Outcome as of 10 Nov:** **not found.** Day-3 statements: "belum membuahkan hasil" (TNBTS) and "hingga hari ketiga ... keberadaan korban belum diketahui" (Kompas.id). No 10 Nov report was found in Google/Bing News RSS at the time of writing. **Re-check before voicing.** HIGH (as of 9 Nov evening).
14. **Side event, day 3:** searchers met **two other illegal climbers** (first names given by Kompas.com) coming down near **Arcopodo**. They had reportedly reached the summit with a local guide from Ranupani. They were handed to BB TNBTS and questioned at Polsek Senduro along with the villager who guided them (Kompas.com 9 Nov, quoting OSC Jefri). MED. **Not recommended for the video.** It shifts focus to blame.

### C. Semeru context

15. **Summit closed:** BB TNBTS closed climbing to the summit on **26 Aug 2026** because of forest/land fires and increased volcanic activity (Kompas.id 8 Nov). Kompas.id 9 Nov adds that climbing is allowed **only up to Ranu Kumbolo, with a permit**. MED-HIGH (two Kompas.id pieces; some outlets say "ditutup total", which refers to the summit route).
16. **Volcano status:** Semeru is at **Level III (Siaga)**. Eruptions on 8 Nov at 04:46, 05:04, 05:22 and 08:40 WIB, with ash columns 300–500 m above the summit (MAGMA ESDM via Kompas.id). Exclusion: 5 km radius from the crater, 13 km in the south-east sector along Besuk Kobokan. HIGH. Kompas.id: "Operasi SAR sulit dilakukan secara maksimal karena Gunung Semeru masih erupsi."
17. **Weather:** lahar flood on 2 Nov after heavy rain on the summit from the night of 1 Nov (Kompas.com). MED.
18. **Sanction:** BB TNBTS says both will be **blacklisted** from conservation areas (Bambang Suryono, via Antara/Suara Surabaya). Earlier 2026 illegal climbers got a **5-year** blacklist (Kompas.id). HIGH. **Do not lead with this in the video.**
19. **Semeru height:** 3,676 m asl, the highest peak on Java (Kompas.id, Antara). HIGH.

### D. Thermal drones in other Indonesian SAR cases

20. **Gunung Jantan, Karimun (Riau Islands), 10 Jul 2026:** two lost climbers were **found alive** at about 00:40 WIB, around 50 m from the first post. The SAR team used a thermal drone "to detect human body temperature in the dark" (Kompas.com, 10 Jul 2026). MED-HIGH. **Best positive example.**
21. **Rinjani, June 2025 (Brazilian climber):** Basarnas used a thermal drone. Basarnas spokesman Hendra Sudirman said "Drone thermal kami di Sabtu sore sudah tidak menangkap panas tubuh korban saat searching di kedalaman" (detik, 27 Jun 2025). The climber did not survive. HIGH. **Sensitive: use only as a technical caveat, never as a hook, and do not name the person.**
22. **Rinjani, Oct 2024:** a climber from Jakarta was found dead, "terdeteksi drone thermal" (Kompas.tv headline only). LOW-MED.
23. **Selat Sunda, Sept 2026:** SAR Banten prepared **two thermal drones** to search for journalists and crew missing near Anak Krakatau (Antara, detik, Jawa Pos headlines). MED.
24. Other 2025–2026 headlines show Basarnas thermal drones in sea, river and house-explosion searches (Bulungan, Batam, Gianyar, Medan). Thermal drones are now routine SAR kit in Indonesia. MED.
25. **TN Gunung Rinjani** has a DJI **Matrice 4** modified to carry up to 5 kg of supplies, with a loudspeaker audible ~1 km (Kompas Travel, 28 Feb 2026). MED. It does not say whether it is the thermal "T" variant.

### E. Reference thermal camera numbers (DJI Matrice 4T, a common SAR drone; NOT confirmed as the Semeru drone)

From enterprise.dji.com/matrice-4-series/specs (HIGH):
- Sensor: **uncooled vanadium oxide (VOx) microbolometer**
- Resolution **640 × 512**, pixel pitch **12 µm**, **30 Hz**
- Band **8–14 µm**
- Sensitivity (NETD) **≤50 mK @ f/1.0**, which means it can separate ~0.05 °C differences under lab conditions
- Lens DFOV **45°**, equivalent focal length 53 mm, f/1.0, focus 5 m to infinity
- Temperature measurement: spot meter and area measurement (= **radiometric**). Accuracy **±2 °C or ±2%** (high gain, −20 to 150 °C)
- Palettes: White Hot, Black Hot, Iron, etc. "Super Resolution" outputs 1280 × 1024
- DJI warning: **do not point the IR camera at the sun, lava or a laser beam**, or the sensor may burn. That is relevant on an erupting volcano.

---

## 3. Mechanism in 7 animation steps (Bahasa Indonesia)

1. **Semua benda "bersinar", tapi tak terlihat mata.** Apa pun yang suhunya di atas nol mutlak (−273 °C) memancarkan radiasi inframerah. Makin hangat, makin kuat pancarannya. Kulit manusia sekitar 33–34 °C memancar paling kuat di panjang gelombang **±9,5 mikrometer** (hukum Wien: 2.898 ÷ 306 K). Itu jauh di luar cahaya tampak (0,4–0,7 µm), di pita **inframerah gelombang panjang, 8–14 µm**.
2. **Lensa dari germanium, bukan kaca.** Kaca biasa justru menghalangi (menyerap) inframerah 8–14 µm. Bagi kamera termal, kaca jendela tampak seperti cermin buram. Karena itu lensanya dibuat dari **germanium**, logam abu-abu mengilap yang tembus inframerah tapi tidak tembus cahaya biasa.
3. **Sensor: ratusan ribu termometer mini.** Di balik lensa ada **mikrobolometer**: grid 640 × 512 = 327.680 piksel, masing-masing selebar 12 µm (lebih tipis dari rambut). Tiap piksel adalah jembatan tipis dari vanadium oksida yang melayang di atas chip. Saat inframerah mengenainya, piksel menghangat sedikit sekali dan **hambatan listriknya berubah**. Chip membaca perubahan itu 30 kali per detik. Tidak perlu pendingin khusus ("uncooled").
4. **Angka jadi warna.** Tiap piksel diberi warna sesuai suhunya. Palet "white hot" menampilkan yang hangat putih dan yang dingin hitam. Kamera bisa membedakan selisih sekitar 0,05 °C. Versi **radiometrik** bahkan bisa menunjukkan angka suhu di titik mana pun.
5. **Kontras adalah segalanya.** Kamera termal tidak "melihat manusia". Ia melihat **beda suhu**. Tubuh 34 °C di atas tanah 5 °C pada dini hari di Kalimati menyala terang. Siang hari, saat batu dan pasir vulkanik terpanggang matahari mendekati suhu tubuh, sosok manusia bisa "melebur". Pada pagi dan senja ada momen **thermal crossover**, saat suhu benda-benda saling menyamai dan kontras hilang. Karena itu pencarian termal paling efektif malam hari dan dini hari.
6. **Terbang berpola seperti memotong rumput.** Drone tidak terbang acak. Ia menyapu sektor dalam jalur-jalur sejajar (**parallel search**, pola yang disebut Basarnas di Semeru). Makin tinggi terbang, makin luas sapuan, tapi makin kecil sosok manusia di layar. Contoh perkiraan untuk kamera 640 × 512 berlensa 45°: dari ketinggian 100 m, satu piksel ≈ 10 cm dan lebar sapuan ≈ 65 m, sehingga bahu manusia hanya ±5 piksel. Dari 300 m tinggal ±1–2 piksel. Operator memilih kompromi: luas atau jelas.
7. **Titik panas, lalu manusia memastikan.** Operator (kini sering dibantu software pendeteksi otomatis) menandai "titik panas" yang bentuk dan ukurannya cocok, mengunci koordinat GPS-nya, lalu mengirim tim darat untuk memastikan. Drone mempercepat dan memperluas mata, tapi tim di darat yang menemukan dan menolong. Itu sebabnya di Semeru, drone hanya satu dari enam regu.

---

## 4. Myths, traps and caveats

- **"Basarnas Surabaya yang mencari."** The sources name **Kantor SAR Banyuwangi** + **Pos SAR Jember** with **BB TNBTS**. Say "tim SAR gabungan Basarnas dan Balai Besar TNBTS".
- **"Hilang sejak 7 November."** (Kompas.com wording "dilaporkan hilang ... sejak Sabtu (7/11)".) 7 Nov is when the **search began / report was made**. **Last contact was 2 Nov.** Say "tak ada kabar sejak 2 November".
- **"Drone thermal bisa menembus lebatnya hutan."** (Kompas.com paraphrase.) **False as physics.** LWIR does not pass through leaves, rock, glass or water. Under a dense canopy the camera sees the **warm or cold leaves**, not the person. It can only see **through gaps** in the canopy, or through smoke and darkness. Use this as a myth-buster beat, but do not mock the outlet.
- **"Bisa melihat orang di balik batu / di dalam gua / di bawah pasir."** No. It only sees surface temperature on a line of sight. That is why ground teams search "cerukan" (hollows) at Kalimati.
- **"Panas tubuh = pasti terdeteksi."** Wet clothes, a sleeping bag, a jacket, ash cover or hypothermia lower the **surface** temperature the camera sees. Sun-baked rocks, fumaroles, hot volcanic deposits, campfire remains and animals give **false positives**. On Semeru, real volcanic heat makes this worse. DJI warns that lava can **burn the sensor**.
- **Sensitive caveat:** a thermal drone detects heat. A person who has lost body heat becomes hard to detect. Basarnas said this openly in the 2025 Rinjani case. **Never imply or speculate about the condition of the Semeru climbers.** If the caveat is used, phrase it generally ("kamera termal butuh beda suhu") with no reference to them.
- **"Drone menemukan korban."** Even in success stories, the drone **spots a candidate hotspot** and people confirm and rescue. Avoid "drone menyelamatkan".
- **"Kamera termal = night vision."** No. Night vision amplifies faint visible/near-IR light (0.7–1 µm). Thermal reads emitted heat at 8–14 µm and works in total darkness.
- **"Kamera termal melihat suhu udara/hawa panas."** Air is nearly transparent at 8–14 µm. The camera sees surfaces.
- **"Resolusi 640 × 512 itu rendah, kameranya jelek."** That is a high-end resolution for uncooled thermal sensors. The physics (long wavelength, costly germanium optics) limits pixel count. Phones have more pixels because visible light is ~20× shorter in wavelength.
- **Drone model:** do not show or name a specific model as "the Semeru drone". Use a generic quadcopter with a dual camera.
- **Blame:** officials call them "pendaki ilegal" and announce a blacklist. Report that neutrally and once at most. Do not add moral commentary. Keep the safety message general ("patuhi penutupan jalur") and put it at the end, not the hook.
- **Names and photos:** do not show their names, social-media photos or family details. Some outlets have published Instagram "profiles". Do not reuse them.
- **Date discrepancies:** Kompas.com says the bike was rented **Wednesday 4 Nov**. TNBTS (Antara, Kompas.id) says **2 Nov**. Kompas.id 8 Nov (RPTN) says they arrived in Lumajang **31 Oct**. Suara Merdeka says the bike was found **6 Nov 13:00** (when the owner and RPTN located it, after the resident's 3 Nov find). Use TNBTS's official chronology: last contact 2 Nov, bike found 3 Nov, reported 6 Nov, search from 7 Nov.
- **Personnel numbers grew:** 9 (early Kompas.com), ~50 (Suara Merdeka), **106** on day 3. Quote 106 with the date "hari ketiga, 9 November".

---

## 5. Hook angles (90-second Indonesian video)

1. **(Recommended)** "Di lereng Semeru yang sedang erupsi, ada satu anggota tim SAR yang tidak melihat cahaya. Ia melihat panas." Then: two young climbers have had no news since 2 Nov, 106 searchers, and one regu is a drone. How does it see body heat in the dark?
2. "Tubuhmu sekarang sedang bersinar. Kamu cuma tidak bisa melihatnya." Physics-first, then cut to Semeru and the search.
3. "Kenapa lensa kamera ini tidak boleh dari kaca?" Curiosity hook on germanium, then the search context.
4. "Drone ini bisa lihat orang di kegelapan total, tapi tidak bisa menembus daun." Myth-buster angle that reframes the "menembus hutan" claim.
5. Positive close or alternate hook: Gunung Jantan, July 2026. Two lost climbers were found alive at 00:40 with the help of a thermal drone, ~50 m from the path.

Tone: calm and respectful. End with a hopeful line plus a general safety note: "Semoga keduanya segera ditemukan. Dan ingat, jalur ditutup demi keselamatanmu." Re-check the status on the day of voicing. If the outcome changes (found alive / found deceased / search closed), rewrite the hook and closing.

---

## 6. Visual / 3D beat ideas

- **Split-screen reveal:** a night mountainside in visible light (pitch black), then a wipe to a thermal "white hot" view where a warm human-shaped glow appears among cold rocks. Use a generic figure only. Never depict the real climbers.
- **Spectrum ruler:** a horizontal wavelength bar with a tiny visible rainbow at 0.4–0.7 µm and a camera "window" at 8–14 µm. A body-heat curve peaks at 9.5 µm.
- **Lens test:** a glass lens turns opaque or black in the thermal view. A grey metallic germanium lens lets the glow through.
- **Microbolometer macro:** zoom into the chip to see a grid of tiny suspended bridges. One pixel turns warm orange, a resistance needle twitches, and the value becomes a pixel color. "327.680 termometer mini, 30 kali per detik."
- **Contrast slider:** a day/night timeline. Rocks heat up under the sun until the human glow fades into the background. At dawn and dusk the thermal crossover makes everything grey. At 03:00 the person pops out.
- **Parallel-search map:** a 3D diorama of Ranu Kumbolo, Kalimati and Ayek-ayek (stylized, not exact terrain). The drone traces back-and-forth lanes while ground SRUs walk sectors. A label shows "0,84 km²" per sector. Put the AUDIRA HUD label on the drone's ground-station screen.
- **Altitude vs pixels:** the drone rises from 100 m to 300 m and a human silhouette shrinks from a 5-pixel blob to a 1–2 pixel dot on a pixel grid.
- **Myth beat:** the drone over a dense canopy. The thermal view shows only leaf temperatures, with an "X" on "menembus hutan". Then a gap in the canopy where heat shows through.
- **False positives:** hot rocks, a steaming fumarole and a small animal all glow. The operator marks candidates and a ground team walks to check.
- **Volcano warning:** Semeru's distant ash column with a "Level III Siaga" HUD tag. Note: the DJI manual warns against pointing the sensor at lava.
- Suggested styles: **THERMALFORGE** (primary, a natural fit: FLIR ironbow/white-hot spectrum, hotspots), **WORLDFORGE** (cinematic mountain night) or **SATELLITEBRIEFING/LIDARFORGE** (search-grid mapping).

---

## 7. Open questions / unverified

- **Status on 10 Nov and later:** no 10 Nov report was found. Check Kantor SAR Banyuwangi / Basarnas social accounts and Kompas, Antara or detik before voicing.
- **Drone model and operator:** not named (Kantor SAR Banyuwangi? BPBD? volunteers?). Unknown.
- **Whether the drone flies at night** in this operation: not stated. Reports mention operations from 06:30 to 17:45. Do not claim night flights at Semeru.
- **Exact closure scope:** "summit closed since 26 Aug, open only to Ranu Kumbolo with a permit" comes from Kompas.id. The BB TNBTS official announcement was not read directly (not found via RSS).
- **Skin emissivity ~0.98** and the **thermal crossover** concept are standard thermography knowledge, but no primary page was read this session (FLIR 403). MED.
- **Pixel-size and swath numbers** (≈10 cm/pixel and ≈65 m swath at 100 m) are **my calculation** from the DJI M4T specs (640 × 512, DFOV 45°). LOW-MED. Label them "kira-kira" in the script.
- **AI auto-detection** of people in thermal drone software: widely marketed, but not verified for Basarnas use. LOW. Phrase as "kini sering dibantu software".
- **Basarnas's "7-day standard" operation length:** not re-read from regulation this session. MED.
- **"Tito"** appears in Tribun headlines as the nickname of one climber. Not cross-checked. Do not use.

### Failed / limited sources
- flir.com (Teledyne FLIR technical notes): HTTP 403 on 6 URLs.
- mdpi.com (thermal-drone SAR study, Drones 3(4):78): HTTP 403.
- Google News decode: HTTP 429 after ~15 requests. Switched to Bing News RSS.
- DuckDuckGo HTML and Bing web search returned no usable results (homepage or spam).
- basarnas.go.id: reachable, but no Semeru item found in the news page HTML.
- Antara pages carry a notice forbidding automated crawling/indexing for AI. One Antara Jatim page was read for the TNBTS statement. Cite it as a source and do not reproduce its text.

## Re-check before VO (2026-11-10, ~13:00 WIB)

Google News RSS (`pendaki Semeru when:2d`) showed items up to 10 Nov 2026 ~13:47 WIB. Headlines include "Pencarian 2 Pendaki Ilegal di Semeru Minim Petunjuk" (MetroTVNews), "Pencarian 2 Pendaki Ilegal Semeru Difokuskan di Kalimati dan Ayek-ayek" (detikcom) and "Dua Pendaki Diduga Masuk Semeru lewat Jalur Ilegal, Pencarian Diperluas" (RRI). The search is still running and no outcome is reported. The script states no outcome, so it stays valid. Re-check once more before the final render and before upload.

## Re-check before final render (2026-11-10, ~18:00 WIB)

Newest items (10 Nov, up to ~17:58 WIB): "Hari Keempat, Tim SAR Gabungan Lanjutkan Pencarian Dua Pendaki Hilang di Semeru" (RRI), "Pencarian Dua Pendaki di Semeru Dihadapkan Cuaca Ekstrem" (Liputan6), "Dua Pendaki Hilang di Gunung Semeru Masih dalam Pencarian" (JPNN). Still no outcome reported. Script stays valid. Re-check again before upload.
