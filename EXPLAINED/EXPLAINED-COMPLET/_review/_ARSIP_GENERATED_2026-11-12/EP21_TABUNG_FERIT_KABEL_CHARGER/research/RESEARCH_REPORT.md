# RESEARCH REPORT — EP21: Tabung Ferit di Kabel Charger (Ferrite Bead)

## 1. Fakta Kunci & Fisika Elektromagnetik
- **Miskonsepsi Umum:** Tonjolan tabung silinder hitam di dekat ujung kabel charger laptop atau kabel monitor HDMI/USB sering dikira sekadar pemberat kabel atau pelindung agar kabel tidak patah tertekuk.
- **Komponen Sebenarnya (Ferrite Bead / Ferrite Core):**
  - Di dalam selubung plastik tersebut terdapat silinder keramik ferit berongga padat.
  - Bahan ferit adalah senyawa keramik feromagnetik non-konduktif yang terdiri dari campuran **Besi Oksida (Fe2O3)** dipadukan dengan nikel, seng, atau mangan.
  - Kabel tembaga di dalamnya hanya lewat menembus lubang tengah silinder tanpa sambungan solderan fisik sama sekali.
- **Prinsip Kerja Filter Lolos Rendah (Low-Pass Filter):**
  - Kabel tembaga panjang bertindak layaknya antena radio liar. Sinyal digital frekuensi tinggi dari chip motherboard laptop dapat memancar keluar menjadi **Interferensi Elektromagnetik (EMI / RFI)** yang mengganggu perangkat radio lain di sekitarnya.
  - Sebaliknya, kabel juga bisa menangkap gelombang liar dari luar dan memasukkannya ke dalam sirkuit laptop.
  - Pada frekuensi listrik DC normal (0 Hz), inti ferit tidak memberikan hambatan sama sekali.
  - Namun ketika gelombang interferensi frekuensi tinggi (> 1 MHz hingga 1 GHz) mencoba lewat, permeabilitas magnetik inti ferit menghasilkan impedansi resistif tinggi, menyerap energi gelombang parasit tersebut dan mengubahnya menjadi panas mikro (*dissipative loss*) yang sangat kecil dan aman.

## 2. Rencana Visual 3D (COMICFORGE / INNERWORKS)
- **Beat 1 (0–3 dtk):** Kabel charger laptop hitam dipotong melintang (cutaway), cincin silinder keramik hitam ferit berkilau magnetik: "BUKAN PEMBERAT KABEL".
- **Beat 2 (4–17 dtk):** Kabel tembaga memancarkan gelombang liar merah frekuensi radio (EMI) yang mengganggu layar monitor di sebelahnya hingga bergaris-garis.
- **Beat 3 (18–40 dtk):** Kamera zoom makro ke dalam silinder ferit; kabel tembaga meluncur di tengah rongga cincin feromagnetik Besi Oksida.
- **Beat 4 (41–64 dtk):** Gelombang parasit frekuensi tinggi terperangkap medan magnet cincin ferit, diredam dan diubah menjadi partikel panas mikro tak terasa.
- **Beat 5 (65–81 dtk):** Arus listrik DC murni mengalir stabil ke baterai laptop; sinyal monitor kembali jernih sempurna tanpa distorsi.
- **Beat 6 (82–91 dtk):** Outro khas AUDIRA dengan transisi ke bola penanda kabel tegangan tinggi SUTET.