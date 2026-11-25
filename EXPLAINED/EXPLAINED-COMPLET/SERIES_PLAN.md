# CARA KERJA BENDA — Rencana Seri Panjang

> Akun: AUDIRA Explained (@AudiraExplained) · Format: short 9:16 1080×1920 @ 60 · ±90 dtk · VO Cartesia `id`
> Dibuat 2026-11-11, dirapikan 2026-11-13. File ini adalah **sumber urutan tunggal** seri. Baca dulu sebelum membuat episode baru.

---

## 1. Aturan urutan (wajib)

1. **Nomor EP = urutan produksi = urutan upload.** Episode berikutnya selalu baris pertama di roadmap yang statusnya belum `FINAL`.
2. **Satu batch = 5 episode berurutan.** Batch baru dimulai setelah batch sebelumnya `FINAL`.
3. **Folder episode baru hanya lewat** `audira_project_layout` `add_episode` (`seriesDir: EXPLAINED_CARA_KERJA_BENDA_2026`). Nama folder tanpa akhiran status (jangan `_[PENDING]`); status dicatat di tabel ini dan `STATUS.json`.
4. **Setelah tiap gerbang**, perbarui kolom Status dan Gaya di sini, juga `STATUS.json` lewat `audira_episode_status`, lalu `MASTER_INDEX.md`.
5. **Riset per episode** di `EP<NN>/research/`, naskah di `EP<NN>/docs/SCRIPT.md`. Tidak ada file lepas di root episode selain final, caption, catatan, dan `STATUS.json`.

Status: `RENCANA` → `RISET` → `STYLE` → `NASKAH` → `VO` → `DRAF` → `FINAL` → `TAYANG`.

---

## 2. Identitas seri

| Elemen | Ketentuan |
|---|---|
| Outro | `<AudiraOutro />` 2–3 dtk terakhir + `<AudiraSignature seed="carakerja-EPNN" />` |
| Hashtag seri | `#CaraKerjaBenda` `#AUDIRA` + 2–3 niche per episode |
| Playlist | "Cara Kerja Benda — AUDIRA Explained" |
| Gaya | Zero Visual Template: tidak boleh sama dengan 3 episode terakhir (`audira_recommend_style` dengan `seriesDir`) |

**Catatan EP06+:** riset dan naskah ditulis ulang 2026-11-13 dari sumber asli (file lama hasil skrip luar diarsip di `_review/_ARSIP_GENERATED_2026-11-12/`). Gaya dipilih per episode di gerbang style, tidak boleh sama dengan 3 episode terakhir. Brief riset: `_research/BRIEF_RISET_NASKAH.md`.

---

## 3. Roadmap episode

### Batch 1 — Peralatan Rumah (EP01–05)

| EP | Judul | Folder | Gaya | Status |
|---|---|---|---|---|
| 01 | Microwave Tidak Memanaskan Piring | EP01_MICROWAVE | ISOCRAFT | FINAL |
| 02 | Kulkas Tidak Membuat Dingin | EP02_KULKAS | THERMALFORGE | FINAL |
| 03 | Rahasia Gerigi Kunci Rumahmu | EP03_KUNCI_GEMBOK | INNERWORKS | FINAL |
| 04 | Kenapa Lift Tidak Jatuh | EP04_LIFT_TIDAK_JATUH | URBANFORGE | FINAL |
| 05 | Cara Rice Cooker Tahu Nasi Matang | EP05_RICE_COOKER | FOODFORGE | FINAL |

### Batch 2–4 — Benda Sehari-hari (EP06–20)

| EP | Judul | Folder | Gaya draf | Status |
|---|---|---|---|---|
| 06 | AC Pertama Dibuat untuk Kertas | EP06_AIR_CONDITIONER_AC | PAPERWORLD | SIAP RENDER (2026-11-14, draf acc) |
| 07 | Batu Api Korekmu Bukan Batu | EP07_KOREK_API_GAS | COMICFORGE | FINAL |
| 08 | Airbag Tidak Diisi Udara | EP08_AIRBAG_MOBIL | PRECISION | FINAL |
| 09 | Kloset yang Menyedot, Bukan Mendorong | EP09_KLOSET_DUDUK_TOILET | belum dipilih | NASKAH (acc 2026-11-13) → menuju SIAP RENDER |
| 10 | Rem ABS Justru Melepas Remmu | EP10_REM_ABS_KENDARAAN | belum dipilih | NASKAH (acc 2026-11-13) → menuju SIAP RENDER |
| 11 | Termos Pertama Dibuat untuk Benda Sedingin Minus 196 Derajat | EP11_TERMOS_AIR_PANAS | belum dipilih | NASKAH (acc 2026-11-13) → menuju SIAP RENDER |
| 12 | Gigi Ritsleting Itu Kembar, Lalu Siapa yang Menguncinya? | EP12_RITSLETING_ZIPPER | belum dipilih | NASKAH (acc 2026-11-13) → menuju SIAP RENDER |
| 13 | Ujung Pulpenmu Adalah Bola yang Menggelinding | EP13_PULPEN_BOLPOIN | belum dipilih | NASKAH (acc 2026-11-13) → menuju SIAP RENDER |
| 14 | Anak Tangga Eskalator Tidak Pernah Masuk ke Lantai | EP14_ESKALATOR_TANGGA_BERJALAN | belum dipilih | NASKAH (acc 2026-11-13) → menuju SIAP RENDER |
| 15 | Kompor Induksi Tidak Panas, Pancimu yang Memanaskan Diri | EP15_KOMPOR_INDUKSI_LISTRIK | belum dipilih | NASKAH (acc 2026-11-13) → menuju SIAP RENDER |
| 16 | Layar HP-mu Tidak Merasakan Tekanan Jari | EP16_LAYAR_SENTUH_HP | belum dipilih | NASKAH (acc 2026-11-13) → menuju SIAP RENDER |
| 17 | Kaca Kecil di Plafon yang Menahan Banjir | EP17_SPRINKLER_PEMADAM_GEDUNG | belum dipilih | NASKAH (acc 2026-11-13) → menuju SIAP RENDER |
| 18 | Penjelasan Sayap Pesawat di Buku Sekolah Itu Keliru | EP18_SAYAP_PESAWAT_TERBANG | belum dipilih | NASKAH (acc 2026-11-13) → menuju SIAP RENDER |
| 19 | Galon di Bawah, Air Keluar di Atas: Siapa yang Mengangkat? | EP19_DISPENSER_GALON_BAWAH | belum dipilih | NASKAH (acc 2026-11-13) → menuju SIAP RENDER |
| 20 | Lampu LED Putihmu Sebenarnya Biru | EP20_LAMPU_LED_MODERN | belum dipilih | NASKAH (acc 2026-11-13) → menuju SIAP RENDER |

### Batch 5–9 — Detail Tersembunyi (EP21–44)

| EP | Judul | Folder | Gaya draf | Status |
|---|---|---|---|---|
| 21 | Tabung Misterius di Ujung Kabel Charger | EP21_TABUNG_FERIT_KABEL_CHARGER | belum dipilih | NASKAH (acc 2026-11-13) → menuju SIAP RENDER |
| 22 | Bola Oranye di Kabel SUTET Itu untuk Siapa? | EP22_BOLA_PENANDA_KABEL_SUTET | belum dipilih | NASKAH (acc 2026-11-13) → menuju SIAP RENDER |
| 23 | Jendela Pesawat Sengaja Dilubangi | EP23_LUBANG_KECIL_JENDELA_PESAWAT | belum dipilih | NASKAH (acc 2026-11-13) → menuju SIAP RENDER |
| 24 | Garis di Kaca Belakang Mobil Itu Pemanas | EP24_GARIS_DEFOGGER_KACA_MOBIL | belum dipilih | NASKAH (acc 2026-11-13) → menuju SIAP RENDER |
| 25 | Bintik Hitam di Tepi Kaca Mobilmu Punya Tugas | EP25_BINTIK_HITAM_FRIT_KACA_MOBIL | belum dipilih | NASKAH (acc 2026-11-13) → menuju SIAP RENDER |
| 26 | Tabung Kecil yang Memberi Tahu Pilot Seberapa Cepat | EP26_TABUNG_PITOT_HIDUNG_PESAWAT | belum dipilih | NASKAH (acc 2026-11-13) → menuju SIAP RENDER |
| 27 | Kapal Ini Sengaja Membuat Ombak Supaya Hemat | EP27_HIDUNG_BULAT_KAPAL_BULBOUS_BOW | belum dipilih | NASKAH (acc 2026-11-13) → menuju SIAP RENDER |
| 28 | Sebutir Silika Gel Lebih Luas dari Lapangan Basket | EP28_BUTIRAN_PENYERAP_SILIKA_GEL | belum dipilih | NASKAH (acc 2026-11-13) → menuju SIAP RENDER |
| 29 | Bola Pemadam Api, dan Batas yang Jarang Diceritakan | EP29_BOLA_PEMADAM_API_OTOMATIS | belum dipilih | NASKAH (acc 2026-11-13) → menuju SIAP RENDER |
| 30 | Bola Baja 660 Ton yang Menahan Goyangan Gedung | EP30_BANDUL_PEREDAM_GEMPA_GEDUNG | belum dipilih | NASKAH (acc 2026-11-13) → menuju SIAP RENDER |
| 31 | Lampu yang Tak Pernah Dinyalakan di Tengah Jalan | EP31_MATA_KUCING_REFLEKTOR_JALAN | belum dipilih | NASKAH (acc 2026-11-13) → menuju SIAP RENDER |
| 32 | Dentuman Misterius di Pipa Rumahmu | EP32_WATER_HAMMER_ARRESTOR_PIPA | belum dipilih | NASKAH (acc 2026-11-13) → menuju SIAP RENDER |
| 33 | Jalan Buntu yang Sengaja Dibuat untuk Truk | EP33_JALUR_PENYELAMAT_REM_BLONG | belum dipilih | NASKAH (acc 2026-11-13) → menuju SIAP RENDER |
| 34 | Sirip Kecil yang Sengaja Mengacak Angin di Sayap | EP34_VORTEX_GENERATOR_SAYAP_JET | belum dipilih | NASKAH (acc 2026-11-13) → menuju SIAP RENDER |
| 35 | Tombol Kecil yang Membuang Lima Liter Gas dari Kemasan Kopi | EP35_KATUP_DEGASSING_KEMASAN_KOPI | belum dipilih | NASKAH (acc 2026-11-13) → menuju SIAP RENDER |
| 36 | Logam yang Sengaja Dibiarkan Habis di Lambung Kapal | EP36_ANODA_KORBAN_LAMBUNG_KAPAL | belum dipilih | NASKAH (acc 2026-11-13) → menuju SIAP RENDER |
| 37 | Kenapa Rel Kereta Ditaburi Batu Tajam? | EP37_BATU_BALAST_REL_KERETA_API | belum dipilih | NASKAH (acc 2026-11-13) → menuju SIAP RENDER |
| 38 | Beton Berkaki Empat yang Menjebak Ombak | EP38_TETRAPOD_BETON_PEMECAH_OMBAK | belum dipilih | NASKAH (acc 2026-11-13) → menuju SIAP RENDER |
| 39 | Air Kecil yang Menahan Bau Got di Bawah Wastafel | EP39_LEHER_ANGSA_P_TRAP_WASTAFEL | belum dipilih | NASKAH (acc 2026-11-13) → menuju SIAP RENDER |
| 40 | Kenapa Jembatan Punya Gigi Baja di Sambungannya? | EP40_EXPANSION_JOINT_GIGI_JEMBATAN | belum dipilih | NASKAH (acc 2026-11-13) → menuju SIAP RENDER |
| 42 | Detektor Asap Ini Tidak Mencium Asap | EP42_DETEKTOR_ASAP_IONISASI_AMERISIUM | belum dipilih | NASKAH (acc 2026-11-13) → menuju SIAP RENDER |
| 43 | Internetmu Tidak Lewat Satelit, Tapi Dasar Laut | EP43_KABEL_INTERNET_BAWAH_LAUT_SUBSEA | belum dipilih | NASKAH (acc 2026-11-13) → menuju SIAP RENDER |
| 44 | Mercusuar Tidak Berkedip, Kacanya yang Berputar | EP44_RUMAH_LAMPU_MERCUSUAR_LENSA_FRESNEL | belum dipilih | NASKAH (acc 2026-11-13) → menuju SIAP RENDER |

---

## 4. Log perubahan

- 2026-11-13: folder EP06–EP44 dirapikan (akhiran `_[PENDING]` dibuang, salinan `RESEARCH_REPORT.md`/`SCRIPT.md` di root episode dihapus karena identik dengan `research/` dan `docs/`), `SERIES.json` dilengkapi EP06–44, file ini dibuat.
- 2026-11-13: riset bersumber + naskah EP06–EP44 selesai (39 episode, 192–221 kata, 5–13 sumber per episode) dan di-acc pengguna. EP30: naskah meluruskan bahwa bandul Taipei 101 terutama meredam goyangan angin; nama folder tetap.
- 2026-11-14: aturan baru SIAP RENDER (`F:/AUDIRA-ALL-SKILL/.agents/rules/10_ready_to_render.md`). Tiap episode belum final punya `docs/READY_TO_RENDER.md`. EP06 SIAP RENDER (anchor mix diperbaiki); EP09–EP44 menunggu gaya, VO, dan kode adegan. Nol render di fase ini.
