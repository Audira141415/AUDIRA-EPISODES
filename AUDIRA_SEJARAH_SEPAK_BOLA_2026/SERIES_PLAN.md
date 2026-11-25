# SEJARAH SEPAK BOLA — Rencana Seri Panjang

> Akun: AUDIRA (@AudiraSportFacts) · Format: short 9:16 1080×1920 @ 60 · ±90 dtk · VO Cartesia `id`
> Dibuat 2026-11-11. File ini adalah **sumber urutan tunggal** seri. Setiap kali membuat episode baru, baca file ini dulu.

---

## 1. Aturan urutan (wajib)

1. **Nomor EP = urutan produksi = urutan upload.** Jangan lompat nomor. Episode berikutnya selalu baris pertama di tabel roadmap yang statusnya belum `FINAL`.
2. **Satu batch = 5 episode berurutan** (EP01–05, EP06–10, dst.). Batch baru baru dimulai setelah batch sebelumnya `FINAL`.
3. **Buat folder episode hanya lewat** `audira_project_layout` `add_episode` (`seriesDir: AUDIRA_SEJARAH_SEPAK_BOLA_2026`, `title` sesuai kolom Folder). Jangan buat folder manual.
4. **Setelah tiap gerbang**, perbarui kolom Status dan Style di tabel ini, juga `STATUS.json` lewat `audira_episode_status`.
5. **Mengubah urutan** hanya bila pengguna minta, atau ada momen aktual (final turnamen, rekor baru). Catat alasannya di bagian 6 (Log perubahan).
6. **Riset tetap per episode** di `EP<NN>/research/`. Fakta yang dipakai ulang lintas episode (daftar juara, rekor) disalin ke `_research/FACT_BASE.md` beserta tanggal cek.

Status: `RENCANA` → `RISET` → `STYLE` → `NASKAH` → `VO` → `DRAF` → `FINAL` → `TAYANG`.

---

## 2. Identitas seri (sama di semua episode)

| Elemen | Ketentuan |
|---|---|
| Judul seri di layar | `SEJARAH SEPAK BOLA #NN` (kartu kecil di hook, 0–2 dtk, di dalam safe zone atas) |
| Penutup VO | "...Ini AUDIRA, Sejarah Sepak Bola. Episode berikutnya: <judul EP+1>." (teaser wajib, ambil judul dari tabel) |
| Outro | `audira-outro-card.svg` 2–3 dtk terakhir + `AudiraSignature seed="sepakbola-EPNN"` |
| Hashtag seri | `#SejarahSepakBola` `#AUDIRA` + 2–3 niche per episode |
| Playlist | "Sejarah Sepak Bola — AUDIRA" (semua platform yang punya playlist) |
| Komentar pin | Nomor episode + tautan episode sebelumnya + sumber utama |

**Visual:** Zero Visual Template. Style boleh beda tiap episode, tapi **tidak boleh sama dengan 3 episode terakhir** (dicek otomatis oleh `audira_recommend_style` dengan `seriesDir`). Benang merah visual seri: bola, trofi, atau lapangan selalu muncul sebagai objek 3D utama, dan aksen warna hijau lapangan di HUD.

**Fakta yang bisa berubah** (gol pemain aktif, jumlah gelar klub): tulis "per <bulan tahun>" di naskah dan layar, dan cek ulang saat riset.

**Tokoh nyata:** pemain ditampilkan sebagai figur stilasi (ToyPerson / siluet / sketsa) dengan nama dan nomor punggung, bukan wajah realistis. Tidak ada logo klub atau FIFA asli; pakai warna klub dan emblem generik.

---

## 3. Roadmap episode

### Musim 1 — Raja-Raja Sepak Bola (EP01–10)

| EP | Judul | Folder | Kategori | Style | Status |
|---|---|---|---|---|---|
| 01 | Semua Juara Piala Dunia | EP01_SEMUA_JUARA_PIALA_DUNIA | Turnamen | HISTORYMAP | FINAL |
| 02 | Brasil Lima Bintang | EP02_BRASIL_LIMA_BINTANG | Negara | TIMEFORGE | FINAL |
| 03 | Pemain Terbaik Sepanjang Masa | EP03_PEMAIN_TERBAIK_SEPANJANG_MASA | Pemain | DATAPHYSICAL | FINAL |
| 04 | Real Madrid Raja Eropa | EP04_REAL_MADRID_RAJA_EROPA | Klub | MARBLEMUSEUM | FINAL |
| 05 | Klub Raja Liga | EP05_KLUB_RAJA_LIGA | Klub/Rekor | TACTICBOARD | FINAL |
| 06 | Lahirnya Sepak Bola Modern 1863 | EP06_LAHIRNYA_SEPAK_BOLA_1863 | Asal-usul | VINTAGEFORGE | FILM (VO terkunci 12 Nov) |
| 07 | Piala Dunia Pertama Uruguay 1930 | EP07_PIALA_DUNIA_PERTAMA_1930 | Turnamen | PAPERWORLD | FILM (VO terkunci 12 Nov) |
| 08 | Maracanazo 1950 | EP08_MARACANAZO_1950 | Momen | FILMNOIR | FILM (VO terkunci 12 Nov) |
| 09 | Gol Tangan Tuhan 1986 | EP09_GOL_TANGAN_TUHAN_1986 | Momen | COMICFORGE | FILM (VO terkunci 12 Nov) |
| 10 | Jerman 7–1 Brasil 2014 | EP10_JERMAN_7_1_BRASIL | Momen | CHAINREACTION | FILM (VO terkunci 12 Nov) |

### Musim 2 — Klub Legendaris (EP11–20)

| EP | Judul | Folder | Status |
|---|---|---|---|
| 11 | Ac Milan Dinasti Merah Hitam | EP11_AC_MILAN_DINASTI_MERAH_HITAM | RENCANA (naskah draf skrip luar, belum dicek) |
| 12 | Barcelona Total Football Tiki Taka | EP12_BARCELONA_TOTAL_FOOTBALL_TIKI_TAKA | RENCANA (naskah draf skrip luar, belum dicek) |
| 13 | Manchester United Munich Ke Treble | EP13_MANCHESTER_UNITED_MUNICH_KE_TREBLE | RENCANA (naskah draf skrip luar, belum dicek) |
| 14 | Liverpool Boot Room Istanbul 2005 | EP14_LIVERPOOL_BOOT_ROOM_ISTANBUL_2005 | RENCANA (naskah draf skrip luar, belum dicek) |
| 15 | Juventus La Vecchia Signora | EP15_JUVENTUS_LA_VECCHIA_SIGNORA | RENCANA (naskah draf skrip luar, belum dicek) |
| 16 | Bayern Munich Hegemoni Bavaria | EP16_BAYERN_MUNICH_HEGEMONI_BAVARIA | RENCANA (naskah draf skrip luar, belum dicek) |
| 17 | Ajax Amsterdam Kiblat Total Football | EP17_AJAX_AMSTERDAM_KIBLAT_TOTAL_FOOTBALL | RENCANA (naskah draf skrip luar, belum dicek) |
| 18 | Boca Juniors La Bombonera Maradona | EP18_BOCA_JUNIORS_LA_BOMBONERA_MARADONA | RENCANA (naskah draf skrip luar, belum dicek) |
| 19 | Santos Fc Kerajaan Raja Pele | EP19_SANTOS_FC_KERAJAAN_RAJA_PELE | RENCANA (naskah draf skrip luar, belum dicek) |
| 20 | Celtic Lisbon Lions 1967 | EP20_CELTIC_LISBON_LIONS_1967 | RENCANA (naskah draf skrip luar, belum dicek) |

### Musim 3 — Momen & Kisah Ajaib (EP21–34)

| EP | Judul | Folder | Status |
|---|---|---|---|
| 21 | Keajaiban Bern 1954 | EP21_KEAJAIBAN_BERN_1954 | RENCANA (naskah draf skrip luar, belum dicek) |
| 22 | Dongeng Leicester City 2016 | EP22_DONGENG_LEICESTER_CITY_2016 | RENCANA (naskah draf skrip luar, belum dicek) |
| 23 | Invincibles Arsenal 2004 | EP23_INVINCIBLES_ARSENAL_2004 | RENCANA (naskah draf skrip luar, belum dicek) |
| 24 | Tragedi Heysel 1985 | EP24_TRAGEDI_HEYSEL_1985 | RENCANA (naskah draf skrip luar, belum dicek) |
| 25 | Perang Sepak Bola 1969 | EP25_PERANG_SEPAK_BOLA_1969 | RENCANA (naskah draf skrip luar, belum dicek) |
| 26 | Skandal Calciopoli 2006 | EP26_SKANDAL_CALCIOPOLI_2006 | RENCANA (naskah draf skrip luar, belum dicek) |
| 27 | Nottingham Forest Clough | EP27_NOTTINGHAM_FOREST_CLOUGH | RENCANA (naskah draf skrip luar, belum dicek) |
| 28 | La Remontada Barcelona 2017 | EP28_LA_REMONTADA_BARCELONA_2017 | RENCANA (naskah draf skrip luar, belum dicek) |
| 29 | Penalti Panenka 1976 | EP29_PENALTI_PANENKA_1976 | RENCANA (naskah draf skrip luar, belum dicek) |
| 30 | Tragedi Chapecoense 2016 | EP30_TRAGEDI_CHAPECOENSE_2016 | RENCANA (naskah draf skrip luar, belum dicek) |
| 31 | Total Football Belanda 1974 | EP31_TOTAL_FOOTBALL_BELANDA_1974 | RENCANA (naskah draf skrip luar, belum dicek) |
| 32 | Gol Hantu Wembley 1966 | EP32_GOL_HANTU_WEMBLEY_1966 | RENCANA (naskah draf skrip luar, belum dicek) |
| 33 | Mukjizat Deportivo Coruna 2004 | EP33_MUKJIZAT_DEPORTIVO_CORUNA_2004 | RENCANA (naskah draf skrip luar, belum dicek) |
| 34 | Drama Aguero 9320 Man City | EP34_DRAMA_AGUERO_9320_MAN_CITY | RENCANA (naskah draf skrip luar, belum dicek) |

### Musim 4 — Klub Ikonik Dunia (EP35–44)

| EP | Judul | Folder | Status |
|---|---|---|---|
| 35 | Inter Milan Grande Inter Treble 2010 | EP35_INTER_MILAN_GRANDE_INTER_TREBLE_2010 | RENCANA (naskah draf skrip luar, belum dicek) |
| 36 | Borussia Dortmund Tembok Kuning Gegenpressing | EP36_BORUSSIA_DORTMUND_TEMBOK_KUNING_GEGENPRESSING | RENCANA (naskah draf skrip luar, belum dicek) |
| 37 | Chelsea Revolusi Abramovich 2003 | EP37_CHELSEA_REVOLUSI_ABRAMOVICH_2003 | RENCANA (naskah draf skrip luar, belum dicek) |
| 38 | Napoli Penebusan Selatan Maradona | EP38_NAPOLI_PENEBUSAN_SELATAN_MARADONA | RENCANA (naskah draf skrip luar, belum dicek) |
| 39 | Benfica Eusebio Kutukan Bela Guttmann | EP39_BENFICA_EUSEBIO_KUTUKAN_BELA_GUTTMANN | RENCANA (naskah draf skrip luar, belum dicek) |
| 40 | River Plate La Maquina Millonarios | EP40_RIVER_PLATE_LA_MAQUINA_MILLONARIOS | RENCANA (naskah draf skrip luar, belum dicek) |
| 41 | Penarol Penguasa Montevideo Libertadores | EP41_PENAROL_PENGUASA_MONTEVIDEO_LIBERTADORES | RENCANA (naskah draf skrip luar, belum dicek) |
| 42 | Flamengo Era Magis Zico 1981 | EP42_FLAMENGO_ERA_MAGIS_ZICO_1981 | RENCANA (naskah draf skrip luar, belum dicek) |
| 43 | Athletic Bilbao Filosofi Murni Basque | EP43_ATHLETIC_BILBAO_FILOSOFI_MURNI_BASQUE | RENCANA (naskah draf skrip luar, belum dicek) |
| 44 | As Roma Ikon Kesetiaan Francesco Totti | EP44_AS_ROMA_IKON_KESETIAAN_FRANCESCO_TOTTI | RENCANA (naskah draf skrip luar, belum dicek) |

### Kandidat setelah EP44 (roadmap lama, belum bernomor)

- Sepak Bola Kuno: Cuju Tiongkok
- FIFA Lahir 1904
- Aturan Offside dari Masa ke Masa
- Lahirnya Kartu Kuning & Merah
- Adu Penalti Pertama
- Trofi Jules Rimet Dicuri Dua Kali
- Evolusi Bola Resmi Piala Dunia
- VAR dan Teknologi Garis Gawang
- Piala Dunia Wanita 1991
- Piala Eropa dan Copa América
- Pelé dan Seribu Gol
- Maradona Sang Dewa Napoli
- Cruyff dan Total Football
- Messi dan Piala Dunia 2022
- Cristiano Ronaldo Mesin Gol
- Zidane: Juara hingga Tandukan 2006
- Di Stéfano Lima Kali Beruntun
- Puskás dan Tim Emas Hungaria
- Lev Yashin Kiper Ballon d'Or
- Miroslav Klose Raja Gol Piala Dunia
- El Clásico
- Superclásico Boca vs River
- Old Firm Celtic vs Rangers
- Leicester Juara 5000 banding 1
- Arsenal The Invincibles
- Keajaiban Istanbul 2005
- Treble Manchester United 1999
- Leverkusen Tak Terkalahkan
- Ajax dan Akademi Pencetak Bintang
- Klub Tertua di Dunia
- Hindia Belanda di Piala Dunia 1938
- PSSI Lahir 1930
- Timnas vs Uni Soviet Olimpiade 1956
- Korea Selatan Semifinal 2002
- Jepang dan Mimpi Kapten Tsubasa
- Arab Saudi Kalahkan Argentina 2022
- Sejarah Liga Indonesia
- Persib vs Persija
- Perjalanan Timnas ke Kualifikasi 2026
- Piala AFF dan Rivalitas ASEAN
- Skor Terbesar 149–0
- Transfer Termahal Sepanjang Masa
- Gol Tercepat di Dunia
- Stadion Terbesar di Dunia
- Hattrick di Final Piala Dunia
- Kiper Pencetak 100 Gol
- Kartu Merah Tercepat
- Penonton Terbanyak Satu Laga
- Pemain Tertua & Termuda
- Gaji Pesepak Bola Termahal
- Sejarah Nomor Punggung 10 (dipindah dari SPORTFACTS_FAKTA_BOLA EP08, 2026-11-13)
- Kutukan Juara Piala Dunia (dipindah dari SPORTFACTS_FAKTA_BOLA EP09, 2026-11-13)

Setelah EP44: pilih dari kandidat di atas, tambah musim baru di sini.

---

## 4. Checklist produksi per episode (11 tahap)

1. Baca file ini, `NOTES.md` dan `style/STYLE_DECISION.md` dari 2–3 episode sebelumnya, `audira_motion_brain`, `audira_style_memory` GLOBAL + channel.
2. Riset → `research/SOURCE_REGISTER.md` + `RESEARCH_REPORT.md`; fakta lintas episode → `_research/FACT_BASE.md`.
3. ✅ Style: `audira_recommend_style` (`episodeDir`, `format: "short"`) → 1 utama + 1–2 alternatif + cover → pilihan pengguna → cover topik → acc.
4. ✅ Naskah 6 tahap 200–240 kata, estimasi durasi 135–150 WPM, hook 0–3 dtk, teaser EP berikutnya di outro → acc.
5. Setup proyek di `project/` (`check-env`, `smoke`).
6. VO Cartesia (ejaan fonetik untuk AUDIRA, nama asing, dan singkatan; lihat memori) → kunci timing.
7. Shotlist + animasi + still per beat.
8. ✅ Contact sheet draf → skor sendiri → juri buta → acc.
9. Final 1080×1920 @ 60 satu batch untuk 5 episode (`audira_render_batch`), −14 LUFS, signature + metadata + tanda tangan digital.
10. `SOCIAL_CAPTIONS.md` 6 platform + jadwal WIB + label AI → validasi → tampil di chat. `NOTES.md` + pelajaran memori.
11. Review 24 jam / 72 jam / 7 hari.

---

## 5. Jadwal upload

Satu episode per hari pada slot utama 19.00–22.00 WIB, urut nomor EP. Batch 5 episode = 5 hari berturut-turut. Ganti jam setelah ada data analytics (catat di `NOTES.md` dan `audira_style_memory` scope `channel`).

---

## 6. Log perubahan

| Tanggal | Perubahan | Alasan |
|---|---|---|
| 2026-11-11 | Seri dibuat, roadmap 60 EP, batch 1 (EP01–05) mulai riset | Permintaan pengguna: 5 short pertama, seri panjang berurutan |
| 2026-11-12 | EP01–05 FINAL 1080×1920@60, qa:gate GREEN, caption lolos validator; upload 13–17 Nov 19.00 WIB | Batch 1 selesai. EP03 dirender di bawah ambang juri (3,83) atas pilihan pengguna |
| 2026-11-12 | Roadmap EP11–44 diganti mengikuti folder yang sudah ada (klub legendaris, momen ajaib, klub ikonik). Roadmap lama EP11–60 jadi daftar kandidat setelah EP44. Nama folder dirapikan (tanpa `BOLA_` dan `_[PENDING]`) | Keputusan pengguna: folder EP11–44 adalah episode berikutnya |
| 2026-11-13 | Seri duplikat `SPORTFACTS_FAKTA_BOLA_2026` (10 ep, 0 final) dihapus; seri ini jadi satu-satunya seri sepak bola channel SPORTFACTS. 5 topik uniknya diserap: offside, transfer termahal, stadion terbesar sudah ada di kandidat; nomor punggung 10 + kutukan juara ditambahkan | Keputusan pengguna: hapus FAKTA_BOLA, pindahkan unik ke plan ini |
