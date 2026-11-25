# Brief riset + naskah — Cara Kerja Benda EP06–EP44

Seri: **Cara Kerja Benda**, channel AUDIRA Explained (@AudiraExplained). Short 9:16, ±75–92 dtk, VO Cartesia bahasa Indonesia.
Root seri: `F:\AUDIRA-VIDEO-MOTION\EXPLAINED_CARA_KERJA_BENDA_2026` (bash: `/f/AUDIRA-VIDEO-MOTION/EXPLAINED_CARA_KERJA_BENDA_2026`).
Tahap ini hanya **riset + naskah draf**. Belum ada style, storyboard, VO, atau render. Naskah menunggu acc pengguna.

## Contoh mutu (baca dulu, hanya baca)
- Riset: `F:\AUDIRA-VIDEO-MOTION\AUDIRA_SEJARAH_SEPAK_BOLA_2026\EP06_LAHIRNYA_SEPAK_BOLA_1863\research\SOURCE_REGISTER.md` dan `RESEARCH_REPORT.md` (sumber asli ber-URL, tabel fakta bernomor, keyakinan HIGH/MED, selisih antarsumber dicatat).
- Naskah seri ini (format yang dipakai): `EP03_KUNCI_GEMBOK\docs\SCRIPT.md` dan `EP03_KUNCI_GEMBOK\project\script-lines.json`, juga EP01, EP04, EP05.
- Riset EP01–05: `_research\RESEARCH_REPORT.md`.

## Yang ditulis per episode (`<EP>/`)
1. `research/SOURCE_REGISTER.md`
   - Header: tanggal akses (2026-11-13); definisi keyakinan: **HIGH** = ≥2 sumber independen cocok (atau dokumen primer/standar + 1 sumber), **MED** = 1 sumber atau ada selisih.
   - Tabel sumber `| Kode | Sumber | URL |`: minimal 4 sumber nyata yang benar-benar kamu buka (Wikipedia EN/ID, situs pabrikan, lembaga resmi, paten, jurnal, buku teks, media sains). Jangan menulis sumber yang tidak dibuka.
   - Tabel fakta `| # | Fakta | Angka | Sumber | Akses | Keyakinan |`: 12–25 fakta. Selisih angka antarsumber: tulis keduanya dan beri tanda "jangan disebut pasti".
2. `research/RESEARCH_REPORT.md`
   - `## Ringkasan inti` (2–4 paragraf, rujuk `#n`), `## Cara kerja langkah demi langkah` (tabel tahap mekanisme → fakta), `## Sejarah singkat` (bila relevan), `## Miskonsepsi yang dibantah` (sumber hook), `## Angka untuk visual payoff`, `## Catatan naskah` (fakta yang dilarang/berisiko, istilah yang perlu ejaan fonetik, ide visual 3D kasar untuk gerbang style nanti).
3. `docs/SCRIPT.md` — format persis seperti EP01–05:
   ```
   # SCRIPT

   ## <FOLDER>: <Judul tontonan yang memancing rasa ingin tahu>

   Status: **DRAF, menunggu acc pengguna** (gaya belum dipilih). <N> kata terucap, estimasi <a>–<b> dtk pada 135–150 WPM.

   - **s1 · Hook** (0–4 dtk): ...
   - **s2 · Konteks** (...): ...
   - **s3 · Konteks** / **s4 · Pengembangan** / **s5 · Pengembangan** / **s6 · Penjelasan** / **s7 · Payoff** / **s8 · Outro**

   Fakta: `../research/SOURCE_REGISTER.md` (#n yang dipakai: ...). Timecode perkiraan; diganti waktu VO.
   ```
   - 190–225 kata terucap (angka dan tahun dihitung sebagai kata yang dibaca). Hitung dengan teliti.
   - Struktur 6 tahap: Hook 0–3 dtk (satu kalimat tajam: bantah miskonsepsi, kejutan, atau pertanyaan konkret; jangan "Pernahkah kamu bertanya-tanya") → Konteks → Pengembangan (mekanisme) → Penjelasan → Visual Payoff (satu angka/momen yang bisa jadi visual puncak) → Outro.
   - s8 Outro wajib diakhiri: `Ini AUDIRA, Cara Kerja Benda. Episode berikutnya: <judul singkat EP berikutnya>.` (EP44: `Ikuti AUDIRA untuk cara kerja benda berikutnya.`). Boleh 1 kalimat penutup sebelum itu.
   - Hanya fakta HIGH yang disebut sebagai fakta pasti. MED boleh dengan "sekitar"/"menurut ..." atau tidak dipakai.
   - Bahasa lisan Indonesia yang wajar, kalimat pendek, sapa penonton "kamu". Angka ditulis dengan kata seperti EP01 ("dua koma empat lima gigahertz"), tahun "seribu sembilan ratus ...".
   - Anti-slop: tanpa "mari kita", "tahukah kamu", "di era modern ini", "revolusioner", "luar biasa", "sangat penting", tanpa tanda pisah panjang (—) di teks terucap, tanpa daftar tiga kata sifat. Satu ide per kalimat.
   - Jangan mengulang penjelasan episode lain di seri (lihat daftar judul di bawah). Contoh: EP06 AC jangan menjelaskan ulang siklus kulkas EP02 secara utuh; fokus pada yang khas AC (split indoor/outdoor, kelembapan, inverter, PK/BTU).
   - Keamanan: topik berbahaya (korek gas, airbag, detektor asap amerisium, rem blong) dijelaskan sebagai cara kerja dan keselamatan, tanpa instruksi membongkar/memodifikasi.
4. `docs/script-lines.json` — array `[{ "id": "s1", "text": "..." }, ... "s8"]`, teks sama persis dengan SCRIPT.md. Kata asing/singkatan/angka yang rawan dibaca salah ditulis `{tampilan|ucapan}`, mis. `{Yale|Yel}`, `{AC|a-se}`, `{LED|el-e-de}`, `{AUDIRA|au-di-ra}` tidak perlu (sudah benar). Angka sudah berupa kata di naskah.
5. `NOTES.md` — pendek: tanggal, status (riset + naskah draf), jumlah kata, fakta yang sengaja tidak dipakai beserta alasannya, risiko/pertanyaan untuk pengguna.

## Aturan kerja
- Riset sungguhan dengan WebSearch/WebFetch. Bila WebSearch gagal, WebFetch langsung ke Wikipedia (`https://en.wikipedia.org/wiki/<Judul>`) dan situs resmi. Simpan kutipan pendek bila perlu, tanpa menyalin artikel.
- Jangan menyentuh folder lain selain episode yang ditugaskan. Jangan mengubah `STATUS.json`, `_tools/`, `SERIES.json`, `MASTER_INDEX.md`.
- Tanpa render, tanpa VO, tanpa style.

## Daftar judul seri (untuk teaser "Episode berikutnya" dan menghindari tumpang tindih)
01 Microwave · 02 Kulkas · 03 Kunci gembok · 04 Lift tidak jatuh · 05 Rice cooker · 06 AC · 07 Korek api gas · 08 Airbag mobil · 09 Kloset duduk · 10 Rem ABS · 11 Termos air panas · 12 Ritsleting · 13 Pulpen · 14 Eskalator · 15 Kompor induksi · 16 Layar sentuh HP · 17 Sprinkler pemadam gedung · 18 Sayap pesawat · 19 Dispenser galon bawah · 20 Lampu LED · 21 Tabung ferit kabel charger · 22 Bola penanda kabel SUTET · 23 Lubang kecil jendela pesawat · 24 Garis defogger kaca mobil · 25 Bintik hitam frit kaca mobil · 26 Tabung pitot hidung pesawat · 27 Hidung bulat kapal (bulbous bow) · 28 Silika gel · 29 Bola pemadam api otomatis · 30 Bandul peredam gempa gedung · 31 Mata kucing reflektor jalan · 32 Water hammer arrestor pipa · 33 Jalur penyelamat rem blong · 34 Vortex generator sayap jet · 35 Katup degassing kemasan kopi · 36 Anoda korban lambung kapal · 37 Batu balas rel kereta · 38 Tetrapod pemecah ombak · 39 Leher angsa (P-trap) wastafel · 40 Expansion joint jembatan · 41 Kotak hitam pesawat · 42 Detektor asap ionisasi · 43 Kabel internet bawah laut · 44 Lensa Fresnel mercusuar
