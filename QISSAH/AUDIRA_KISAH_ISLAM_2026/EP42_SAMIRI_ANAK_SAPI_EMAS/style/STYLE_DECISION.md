# STYLE_DECISION — Samiri dan Anak Sapi Emas (`EP42`)

- **Tanggal:** `2026-11-24`
- **engine:** `remotion` (Remotion + R3F 3D, kit CHRONICLE dengan proyek sendiri di `project/`)
- **Style terpilih:** `CHRONICLE`
- **Alasan (awam, terkait topik):** dokumenter 3D dengan tokoh siluet hitam berkontur warna dan cahaya hangat di belakang. Nabi Musa dan Nabi Harun tampil sebagai siluet atau dari belakang tanpa wajah (adab), sementara patung anak sapi emas menjadi satu-satunya benda yang berkilau di dunia yang gelap. Style unggulan, rata-rata juri final 3,87, punya 2 episode gold, dan pelajaran "siluet tanpa wajah + kode warna kontur" sudah terbukti (juri 4/4/4/4/4).
- **Skor rekomendasi vs keputusan (G3):** ABYSSFORGE 69 (kata "laut" saja, kisah ini bukan laut dalam), FELTCRAFT 57.7 (nada dongeng anak, terlalu ringan untuk kisah penyembahan berhala), BRONZEFORGE 57 (cocok untuk pengecoran emas, tetapi belum ada skor juri, ceiling lighting 3.6, dan tidak punya sistem tokoh tanpa wajah). CHRONICLE (unggulan) dipilih karena bahasa visualnya paling cocok untuk kisah bertokoh dengan adab tanpa wajah.
- **Alternatif ditolak:** `BRONZEFORGE`: material emas cair cocok, tetapi tanpa sistem siluet tokoh dan lighting lemah. `CINESTORY`: juri 3,5, lighting rata dan figur terlihat seperti mainan.
- **Cover referensi:** `cover-reference.png` (gold CHRONICLE fakta-olahraga-EP05)
- **Cover topik:** `cover-topic.png`, dibuat di sesi B dari frame hook film (patung emas di altar, kerumunan siluet sujud, malam gurun).
- **approved:** `yes` (dipilih AI dan dilaporkan, tanpa acc, keputusan pengguna 2026-11-23)

## Parameter dari motion memory (`audira_style_memory get CHRONICLE`)
- Wajib diterapkan: captionY 1300, kaki subjek di y ≤ 1290; faceShot dist 7 fov 42 targetY 0.89; outlineGain 2.2, halo 0.45, fog 0.016; label minimal 40 px (HUD ≥ 36 px); pill karaoke putus bila > 24 karakter; kutipan HUD di panel gelap rgba(11,12,16,.74) + border kiri warna tokoh.
- Kode warna kontur: Musa = emas, Harun = cyan, Samiri = merah, kaum = siluet polos (figuran).
- Variasi set per babak (juri menurunkan komposisi bila satu set dipakai berulang); rim/halo dinaikkan di set gelap; pilih detik contact sheet setelah angka/label terkunci.
- Hindari: lampu ambient rata tanpa key keras; latar gradasi + siluet glow saja; figur di zona subtitle; tabrakan headline vs subjek.
