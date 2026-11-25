# RESEARCH REPORT — EP16: Cara Kerja Layar Sentuh HP (Capacitive)

## 1. Fakta Kunci & Fisika Kapasitansi Proyeksi
- **Resistive vs Capacitive Touchscreen:**
  - Layar resistif lama (seperti PDA/ATM lawas) memerlukan dua lapisan plastik fleksibel yang ditekan fisik hingga saling menyentuh.
  - Layar sentuh kapasitif proyektif (*Projected Capacitive / PCAP*) modern bekerja murni membaca medan listrik tanpa ada bagian fisik yang melengkung atau ditekan keras.
- **Lapisan ITO (Indium Tin Oxide):**
  - Merupakan oksida logam langka yang memiliki sifat unik: **transparan secara optik (tembus pandang 90%+) namun merupakan konduktor listrik yang sangat baik**.
  - Dicetak di bawah kaca pelindung Gorilla Glass dalam bentuk kisi-kisi elektroda baris (Drive lines) dan kolom (Sense lines) berbentuk pola berlian mikroskopis.
- **Tubuh Manusia Sebagai Konduktor:**
  - Jaringan sel manusia mengandung air dan elektrolit garam, membuat jari kita memiliki sifat konduktif dan kapasitas listrik alami (*electrical capacitance*).
  - Ketika jari mendekati atau menyentuh kaca, jari mendistorsi medan elektrostatik lokal di antara elektroda baris dan kolom. Sebagian muatan listrik AC mikro terserap ke dalam tubuh.
  - Chip pengontrol layar (*Touch Controller IC*) memindai kisi-kisi elektroda ratusan kali per detik (120 Hz hingga 240 Hz touch sampling rate), menghitung titik silang koordinat X dan Y dengan presisi fraksi milimeter, bahkan mendukung multi-touch 10 jari sekaligus.

## 2. Rencana Visual 3D (COMICFORGE / INNERWORKS)
- **Beat 1 (0–3 dtk):** Ujung jari menyentuh kaca ponsel hitam, gelombang riak cahaya biru menyebar dari titik sentuhan: "MEMBACA LISTRIK JARI".
- **Beat 2 (4–17 dtk):** Kaca Gorilla Glass dibedah lapis demi lapis menampakkan kisi-kisi transparan elektroda Indium Tin Oxide.
- **Beat 3 (18–40 dtk):** Pulsa listrik mikro mengalir di sepanjang garis grid baris dan kolom membentuk medan kapasitansi seimbang.
- **Beat 4 (41–64 dtk):** Kulit jari manusia menyentuh kaca; elektron mikro melompat menyerap muatan, mengubah nilai medan listrik di perpotongan titik kisi X dan Y.
- **Beat 5 (65–81 dtk):** Chip kontroler menerjemahkan perubahan kapasitansi menjadi ketukan huruf virtual instan tanpa jeda keterlambatan.
- **Beat 6 (82–91 dtk):** Outro khas AUDIRA dengan transisi ke ampul kaca merah sprinkler pemadam gedung.