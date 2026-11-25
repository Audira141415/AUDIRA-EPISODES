# Style Decision — EP07 Ibnu Battuta: 29 Tahun di Jalan

- **Style terpilih:** PAPERWORLD (diorama kertas berlapis, Remotion + React Three Fiber, kit `src/kits/paperworld/`)
- **Channel:** AUDIRA QISSAH
- **approved (style):** yes. Pengguna memilih opsi utama untuk batch 2 (EP06–EP10) dari `_review/STYLE_OPTIONS_B2.jpg` ("Ya, semua utama"; dicatat di STATUS.json 2026-11-12).
- **approved (cover topik):** yes — cover approved by user 2026-11-12 ("Ya, buat suara"; brief Stage B menulis 2026-11-11).
- **Catatan Stage B:** atas permintaan lead, jung diperbaiki (buritan bertingkat + kemudi + kabin beratap, figur pengelana kerucut yang lebih besar), lalu `cover-topic.png` dirender ulang dari frame film 0,3 dtk (`--force`) agar frame pembuka tetap sama dengan cover. Versi yang disetujui sebelumnya: `cover-topic.v1-approved.png`.

## Kenapa PAPERWORLD
Kisah ini adalah perjalanan: satu orang, satu rute panjang, banyak kota. Diorama kertas membuat rute itu terasa seperti peta buatan tangan yang bisa dilipat dan dibuka: benang merah rute di atas laut kertas, kota pop-up yang berdiri satu per satu, dan kota kayu Sumutra yang bisa dibangun persis seperti deskripsi Rihla (pagar dan menara kayu). Figur kertas tanpa wajah juga cocok dengan aturan adab: tidak ada potret Ibnu Battuta maupun sultan, jadi tokoh cukup berupa potongan kertas dari belakang.

## Alternatif yang ditampilkan (tidak dipilih)
1. **SATELLITEBRIEFING** — citra satelit dan zoom orbital. Bagus untuk lokasi Samudera Pasai, tapi dinginnya gaya intel/OSINT tidak cocok dengan nada kisah perjalanan dan adab istana abad ke-14, dan sulit menampilkan suasana kota kayu.
2. **INKSTORY** — tinta sumi-e Shan Shui. Indah untuk lanskap, tapi identitasnya Asia Timur (kaligrafi Tiongkok/Jepang) bisa mengaburkan latar Maroko dan Sumatra.

## Cover
- `cover-reference.jpg`: quality bar PAPERWORLD (`F:\AUDIRA-SKILL-MOTION\references\quality-bar\paperworld.jpg`).
- `cover-topic.png`: komposisi `BattutaCover` frame 0.3 s (1080×1920), juga frame pembuka film. Jung kertas dengan pengelana tanpa wajah di haluan mengikuti benang rute merah menuju gerbang kota kayu "SUMUTRA" di pantai Sumatra; judul "ASAL NAMA SUMATRA", kicker "SEJARAH ISLAM · EP07", sub-line "Ibnu Battuta singgah di Samudera, ± 1345".
- Framing hook: `COVER_SHOT` di `project/src/scenes/battuta/world.tsx` (pos [3.2, 12.5, 34], target [-0.2, 5.9, -12], fov 37).
- Skor cover (self): 4/4/4/4/4 (lighting, material, depth, composition, readability), LOLOS; ceiling audit semua 5.

Tanggal: 2026-11-12
