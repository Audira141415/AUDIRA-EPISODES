# STORYBOARD — Owi/Butet, Kado Emas 17 Agustus 2016 (`EP08`)

Style: HD2D

Waktu = detik film = detik VO (Audio Master Clock, `studio/src/scenes/ep08/timeline.json`, total 81,6 dtk termasuk kartu outro 3,8 dtk). Potongan = kata pertama beat berikutnya (`CUT` di `studio/src/scenes/ep08/timing.ts`): B 11,05 · C 23,51 · C2 33,69 · D 37,73 · E1 50,86 · E2 58,05 · OUT 66,98. Kode adegan + kamera: `studio/src/scenes/ep08hd/sets.tsx`.

**World layout:**
- **Main stage:** arena final Rio malam (diorama A, dipakai ulang dengan sudut lain di D dan E1).
- **Chapter stations:** delapan diorama 3D terpisah; hanya diorama aktif yang dirender (`sceneAt(t)`).
- **Between stations:** wipe piksel; di dalam diorama kamera bergerak kontinu (`path` + drift).

**Planes in every shot:**
- **BG:** tribun / dinding kamar / gedung / langit Jakarta (fog + DOF).
- **MG:** sprite slab pemain, lemari trofi, tiang bendera, podium, panggung.
- **FG:** tiang net, kepala penonton, barisan orang berdoa, tiang lampu.
- **HUD:** jam, papan waktu, kartu nama, papan skor, stempel, plakat (≥ 40 px, y 236–700).
- **Subtitles:** karaoke per kata di y ≈ 1300.

| Scene | Waktu | BG/MG/FG/HUD | Kamera | Audio |
|---|---|---|---|---|
| A Hook | 0,00–11,05 | BG tribun malam + papan AUDIRA; MG Owi dari belakang jump smash, Butet di net, 2 lawan Malaysia; FG tiang net; HUD jam `23:57 WIB`, `EMAS OLIMPIADE · RIO 2016` | high angle dari belakang Owi, dolly-in pelan, kilat saat smash (9,62) | whoosh pembuka, tik jam (2,6), pop chip (5,2), impact smash (9,6) |
| B Konteks | 11,05–23,51 | BG dinding kamar + jendela malam + poster AUDIRA; MG lemari trofi, 5 medali masuk satu per satu, slot 2012 berkedip merah, lalu Butet duduk di ranjang + Owi di jendela; FG ranjang/lampu meja; HUD papan waktu 1992–2012, `LONDON 2012`, kartu `OWI & BUTET` | truck dari lemari (kiri) ke pemain (kanan) | whoosh, ding tiap medali, buzz slot kosong (17,2), pop chip |
| C Pengembangan | 23,51–33,69 | BG tribun sisi + papan `17·08·2016`; MG reli 2v2 Owi/Butet vs China merah; FG tiang net; HUD `RIO 2016 · 0 GIM HILANG`, kartu `ZHANG NAN / ZHAO YUNLEI`, `SEMIFINAL 2–0` | dolly samping kiri → kanan | whoosh, pukulan kok, pop, stamp (31,9) |
| C2 Upacara | 33,69–37,73 | BG gedung Kemenpora pagi + palem; MG tiang, Merah Putih naik; FG barisan 3×7 orang menunduk berdoa; HUD `PAGI · 17 AGUSTUS 2016`, `UPACARA DI KEMENPORA · DOA UNTUK OWI / BUTET` | crane naik mengikuti bendera | whoosh (atas), pop chip |
| D Penjelasan | 37,73–50,86 | BG tribun gelap; MG Butet di net + Owi belakang vs Malaysia; FG pita net; HUD kartu `CHAN PENG SOON / GOH LIU YING`, `H2H 7–1`, `BUTET · DEPAN NET`, `OWI · SERANG BELAKANG`, skor gim 1 → 21–14, gim 2 12–10 | high angle atas net, pan net → belakang, naik saat skor | whoosh, pop kartu, tik skor, riser kecil (12–10) |
| E1 Payoff | 50,86–58,05 | BG arena sudut depan-kiri; MG Owi jump smash match point lalu Owi + Butet angkat tangan, confetti; HUD `MATCH POINT`, `INA 21–12 MAS`, `45:00`, stempel `45 = 1945` | dolly pelan (jeda) lalu push-in, kilat 53,3 | riser (51,5) + impact payoff (53,3), pop, stamp |
| E2 Podium | 58,05–66,98 | BG aula gelap + sorot; MG podium 2-1-3, Owi/Butet di tengah, tiga bendera naik (Merah Putih tertinggi); FG kilat fotografer; HUD `EMAS GANDA CAMPURAN PERTAMA`, `SATU-SATUNYA EMAS INDONESIA DI RIO`, 7 ikon medali, kutipan `"HADIAH HARI KEMERDEKAAN"` | crane naik ke bendera | whoosh (atas), ding medali, kilat kamera |
| OUT Outro | 66,98–81,60 | BG langit malam + kembang api + gedung + billboard AUDIRA; MG panggung merah-putih depan Monas: Susy (1992, obor) + Butet (2016, angkat tangan); FG tiang lampu kuningan; HUD `PEREMPUAN KE-2 PERAIH EMAS OLIMPIADE`, plakat `1992 SUSY SUSANTI` · `2016 LILIYANA NATSIR`, teaser EP09; kartu outro AUDIRA 77,8–81,6 | push-in pelan, lalu tilt naik ke Monas | whoosh (bawah), pop kembang api, pop plakat, whoosh outro |
