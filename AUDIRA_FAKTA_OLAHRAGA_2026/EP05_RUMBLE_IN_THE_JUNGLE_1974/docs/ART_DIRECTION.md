# Art Direction — EP05 Rumble in the Jungle 1974 (CHRONICLE)

## Gagasan visual
Laga tinju paling terkenal abad ke-20 diceritakan seperti diorama dokumenter sejarah: Ali dan Foreman tampil sebagai siluet tinta hitam dengan kontur warna (Ali amber `#ffb547`, Foreman crimson `#d8432f`). Film dibuka tepat di frame cover yang disetujui (KO ronde 8), lalu mundur ke awal cerita: perjalanan ke Kinshasa, kamp latihan, stadion menjelang subuh, jebakan di tali ring, KO, dan badai hujan saat fajar. Engine Remotion + R3F, kit `studio/src/scenes/ep05/chronicle/` (Stage, ShotCanvas, Figure, outline pass, overlay).

## Look (terkunci dari cover topik yang disetujui 2026-11-22)
- Look pembuka = `PREDAWN` (`RingSet.tsx`): langit biru tua kehijauan, lampu stadion putih hangat dari atas, kanvas ring krem, apron dengan spanduk AUDIRA.
- Satu look per set, berpindah halus lewat `mixLook`: `MAPROOM` (peta), `DUSK`/`ROOM_NIGHT` (kamp latihan malam), `PREDAWN` (stadion & ring), `NIGHT` gelap untuk rope-a-dope, `MORNING` + hujan untuk fajar.
- Siluet: material `INK` hitam + outline pass (`SilTag`) per tokoh. Ali selalu amber, Foreman selalu crimson, penonton dan wasit tanpa kontur atau kontur ivory tipis.
- Kedalaman 3 lapis per set: BG (tribun, menara lampu, palem, langit), MG (subjek), FG (tali ring, kepala penonton, tetes hujan) dengan DOF ringan.
- Satu subjek utama per beat. Di ring, dua petinju boleh tampil bersama tanpa saling menutupi; kamera memilih satu sebagai fokus.
- Tipografi kit: stamp Anton, label Barlow Condensed, caption Plus Jakarta Sans, kutipan Instrument Serif. Label ≥ 34 px @1080.

## Pelajaran juri seri yang wajib diterapkan
- Stamp/caption/kartu tidak menutupi subjek. Taruh di atas subjek atau di sisi kosong.
- Label ≥ 34 px. Stamp lebar ≤ 860 px, tanpa rotasi di adegan aksi.
- Satu subjek utama per frame.
- Set yang sama maksimal 2 frame di contact sheet (ring muncul di beberapa beat, jadi variasikan sudut/look: wide stadion, close tali ring, low-angle KO, hujan fajar).
- Tokoh nyata = siluet stilasi tanpa wajah, tanpa logo asli.

## Aturan konten
- Muhammad Ali, George Foreman, wasit Zack Clayton = siluet tanpa wajah + `NameTag`. Tidak ada foto, wajah, logo WBA/WBC, logo sponsor, poster asli, atau logo film "When We Were Kings".
- Angka di layar hanya dari `research/SOURCE_REGISTER.md`: 40–0 · 37 KO (f2), 25 vs 32 tahun (f3), 4 : 1 dengan kutipan "NYT, 30 Okt 1974" (f4), ±60.000 penonton (f5), ±04.00 (f6), ronde 8 · 2:58 (f7), 30 OKT 1974 · KINSHASA, ZAIRE (f1), ditunda > 1 bulan (f11), 7 tahun (f12).
- Dilarang di layar: "1 miliar penonton", jumlah KO Ali, jam persis selain "±04.00", "6 minggu".
- Bendera tidak ditampilkan (cukup peta + pin nama tempat).
- Pita karaoke y 1290–1540 bebas chip/angka. Safe zone atas 236 px, bawah 380 px bersih.
- Brand: AUDIRA di spanduk apron ring (cover, ring wide, KO), di papan tribun stadion, dan di header kartu skor akhir; VO menyebut "Audira" di hook dan outro; `AudiraSignature seed="olahraga-EP05"` lewat `signed("Ep05", ...)`; kartu outro AUDIRA 2–3 dtk terakhir.

## Gerak
- Kamera `camAt` + `handheld` kontinu, tidak diam > 1,5 dtk; `hits` handheld pada tiap pukulan keras.
- Carrier: tali ring. Dari cover KO, kamera menembus tali ke peta (dissolve tinta); di akhir peta, garis rute berubah menjadi tali ring kamp latihan; seterusnya transisi searah gerak pukulan.
- Pose petinju dari `POSES` + `idle`/`gait`; tumbang Foreman memakai `topple` di `Boxer`.
- Jeda kamera pelan 0,8 dtk sebelum KO, lalu impact + flash lampu stadion.

## Multi-scene (6 set)
A Ring KO menjelang subuh (= cover `Ep05CoverA`) → B Peta Atlantik–Afrika, pesawat menuju Kinshasa + papan tanggal → C Kamp latihan malam, sparing Foreman, mata robek, kalender mundur → D Stadion 20 Mei wide, ±60.000 penonton, menara lampu, satelit "TAYANG KE AS" → E Close tali ring gelap: rope-a-dope, Ali bersandar, Foreman memukul, bar stamina Foreman turun → F Ronde 8 KO low-angle (kembali ke ring, sudut berbeda dari A) → G Fajar + badai hujan di stadion kosong-basah, Ali diangkat kerumunan → OUT kartu skor AUDIRA + teaser episode berikutnya + kartu outro.
