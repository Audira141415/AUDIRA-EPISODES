# Storyboard — Kapal Lewat Daratan 1453

Satu dunia 3D yang menerus: peta kertas Konstantinopel–Galata–Tanduk Emas–Bosporus di atas meja peta gelap (HISTORYMAP). Semua waktu diambil dari VO terkunci (`audio/timeline.json`); kunci kamera dan event di kode ditambatkan ke kata yang diucapkan (`project/src/scenes/galata/time.ts`, `camera.ts`), bukan ke detik absolut. Komposisi: `GalataPreview` (540×960@30), `GalataFinal` (1080×1920@60), `GalataCover`. Durasi 94,94 dtk.

Lapisan di setiap adegan: BG meja kayu gelap + tepi peta; MG peta relief, tembok, kota beratap, kapal; FG kapal/tag/kartu kertas dekat kamera; HUD chip tanggal dan penghitung kapal (atas, di bawah 180 px); caption karaoke (di atas 380 px bawah); tanda tangan AUDIRA bergerak sebagai lapisan terakhir.

| # | Waktu (dtk) | Kata jangkar | Visual (BG / MG / FG / HUD) | Kamera | Audio |
|---|---|---|---|---|---|
| 1 Hook | 0,0–4,3 | "Pelabuhan…bukit" | Frame cover: rute bercahaya di punggung Galata, 7 kapal di atas kereta kayu, rantai di mulut teluk, judul "KAPAL LEWAT BUKIT" (hilang 2,6–3,4) | Mulai dari pose cover, dorong pelan ke bukit | impact-bass di "Pelabuhan", drone D + qanun |
| 2 Context A | 4,3–10,7 | "Kota", "1204", "utaranya" | Kapal & rute hook menyusut (mundur ke awal cerita); overview kota; panah merah lewat teluk ke tembok; tag "1204 · LEWAT TELUK"; HUD "1204" | Sapuan ke selatan ke atas kota, lalu ke tembok Tanduk Emas | whoosh, pop di "1204", ney |
| 3 Context B | 10,7–17,3 | "April 1453", "Mehmed", "mengepungnya" | Tenda dan panji polos Utsmaniyah tumbuh di luar tembok darat; tag "MEHMED II · 21 TAHUN"; HUD "APRIL 1453" | Geser ke barat ke tembok darat | pop di "Mehmed" |
| 4 Context C | 17,7–22,0 | "Hadis" | Kartu kertas 3D "HADIS · diriwayatkan Imam Ahmad · DERAJATNYA DIPERSELISIHKAN" (tanpa teks hadis) | Naik ke overview teluk | whoosh-short |
| 5 Main | 22,6–29,1 | "ditutup", "Galata" | Close-up rantai besi + pelampung balok; garis rantai menyala dari menara kota ke Galata; tag "RANTAI BESI · MENGUNCI TELUK", "GALATA" | Dari sisi Tanduk Emas, truck sepanjang rantai | whoosh, impact di "rantai", daf masuk |
| 6 Main | 29,5–34,4 | "pembela", "tertahan" | Kapal pembela di FG, armada Utsmaniyah di Bosporus BG, gembok emas muncul di mulut teluk | Mundur, lalu menoleh ke armada di luar | click + bass di "tertahan" |
| 7 Explanation | 35,0–43,0 | "memutarinya", "Galata" | Gembok tenggelam; rute bercahaya + bantalan balok kayu tergambar dari Bosporus ke Tanduk Emas | Naik ke overview rute | whoosh-short |
| 8 Explanation | 44,0–48,5 | "setinggi", "dilumasi" | Tag "BUKIT GALATA · ± 60 M"; kilau pelumas berjalan di jalur; tag "DILUMASI · LEMAK ATAU MINYAK" | Sudut rendah ke punggung bukit, lalu mendekat ke jalur | pop, sparkle |
| 9 Explanation | 48,8–55,6 | "dinaikkan", "kerekan", "sapi" | Kapal naik dari Bosporus ke kereta kayu + rol; tim penarik: sapi dan siluet manusia kecil tanpa wajah, tali; kerekan di sisi jalur | Mengikuti kapal terdepan | derit kayu, daf |
| 10 Explanation | 55,9–63,3 | "layarnya", "seolah" | Layar terkembang, dayung terangkat dan mengayuh di udara di atas bukit | Mengikuti, sudut rendah | whoosh, riser |
| 11 Payoff | 63,9–70,4 | "Pagi", "tujuh", "meluncur", "belakang" | ±70 kapal mengalir turun ke Tanduk Emas seperti semut, berkumpul di teluk; HUD "22 APRIL 1453" + "± 70 KAPAL" dengan 70 titik terisi saat kapal tiba; rantai kini di belakang armada | Crane ke hampir top-down, lalu sapuan ke rantai | impact di "meluncur", whoosh |
| 12 Payoff | 70,8–77,1 | "menjaga", "kota" | Tembok teluk menyala, tag "TEMBOK TELUK · DIJAGA"; HUD "± 5 minggu kemudian, kota jatuh" | Ke tembok teluk, lalu mundur ke seluruh kota | daf memuncak lalu reda |
| 13 Payoff | 77,5–84,8 | "Tahun", "Venesia", "skalanya" | Kartu inset kertas "VENESIA 1439": Sungai Adige → Danau Garda, rute darat putus-putus | Mundur pelan untuk skala armada | whoosh-short, ney |
| 14 Outro | 85,4–91,5 | "Menurutmu", "Audira" | Kamera naik ke seluruh meja; plakat kuningan "AUDIRA · PETA TANDUK EMAS · 1453" di peta utara | Rise | ney + qanun |
| 15 Kartu outro | 91,5–94,9 | voEnd + 0,6 | `audira-outro-card.svg` di #0B3D2E + "Created by Agus Dwi R." | — | chime |

Catatan aturan penggambaran: tidak ada wajah, tidak ada pertempuran, tidak ada api. Figur penarik hanya siluet kerucut berkain dengan kepala tertutup, kecil, tanpa fitur wajah.
