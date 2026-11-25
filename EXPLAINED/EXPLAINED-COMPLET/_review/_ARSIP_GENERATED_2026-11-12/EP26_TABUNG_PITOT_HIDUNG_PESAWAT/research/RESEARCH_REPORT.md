# RESEARCH REPORT — EP26: Tabung Pitot Hidung Pesawat (Pitot Tube)

## 1. Fakta Kunci & Avionik Dinamika Fluida
- **Identitas Tabung Pitot:**
  - Pipa logam berbentuk L berbahan paduan nikel/baja tahan karat yang menonjol di bagian hidung pesawat dan menghadap lurus ke arah datangnya aliran udara (*relative wind*).
  - Ditemukan oleh fisikawan Prancis Henri Pitot pada tahun 1732, disempurnakan oleh Henry Darcy (1858).
- **Pita Merah "REMOVE BEFORE FLIGHT":**
  - Saat pesawat diparkir di darat, tabung pitot wajib ditutup selubung kain merah mencolok bertuliskan *Remove Before Flight* untuk mencegah lubang kemasukan debu, serangga penyengat (seperti tawon lumpur *sceliphron*), atau air hujan.
  - Sarung dilepas oleh teknisi darat tepat sebelum pesawat lepas landas (*pushback*).
- **Prinsip Fisika Pengukuran Kecepatan Udara (Airspeed):**
  - Mobil mengukur kecepatan darat (*Groundspeed*) dari putaran roda, namun pesawat bergerak di dalam massa udara yang bergerak.
  - *Tekanan Total (Stagnation Pressure $P_t$):* Udara yang menabrak lubang depan tabung pitot dipaksa berhenti bergerak, menghasilkan tekanan total di ujung tabung.
  - *Tekanan Statis ($P_s$):* Lubang terpisah di dinding samping bodi pesawat (*static port*) mengukur tekanan udara diam di sekitar pesawat.
  - *Persamaan Bernoulli:*
    $$P_t = P_s + rac{1}{2}ho v^2 implies v = sqrt{rac{2(P_t - P_s)}{ho}}$$
  - Selisih antara tekanan total dan tekanan statis menghasilkan **Tekanan Dinamis ($q$)**, yang dikonversi oleh komputer *Air Data Computer (ADC)* menjadi angka kecepatan udara (*Indicated Airspeed / IAS*) di layar kokpit pilot.
- **Pemanas Listrik Anti-Es (Pitot Heat):** Tabung pitot dilengkapi kawat pemanas listrik internal berdaya tinggi untuk mencegah lubang tertutup bunga es saat melintasi awan superdingin. Jika lubang tersumbat es (seperti pada insiden fatal Air France 447), komputer avionik menerima data kecepatan palsu hingga autopilot terputus.

## 2. Rencana Visual 3D (COMICFORGE / INNERWORKS)
- **Beat 1 (0–3 dtk):** Pita kain merah bertuliskan REMOVE BEFORE FLIGHT berkibar ditiup angin di moncong jet supersonik, ditarik lepas oleh teknisi: "MATA KECEPATAN PESAWAT".
- **Beat 2 (4–17 dtk):** Pesawat jet membelah awan pekat pada kecepatan 900 km/jam, partikel udara melesat menabrak hidung logam pesawat.
- **Beat 3 (18–40 dtk):** Cutaway tabung pitot logam berbentuk L; udara masuk dan terhenti di ruang kompresi menghasilkan tekanan total stagnasi.
- **Beat 4 (41–64 dtk):** Sensor piezo-resistif mengukur selisih tekanan total pitot vs tekanan statis luar, menghitung kecepatan udara akurat per milidetik.
- **Beat 5 (65–81 dtk):** Elemen kawat pemanas di dalam dinding tabung pitot memancarkan panas merah membara, mencairkan kristal es yang mencoba membekukan sensor.
- **Beat 6 (82–91 dtk):** Outro khas AUDIRA dengan transisi ke moncong bawah air kapal kargo Bulbous Bow.