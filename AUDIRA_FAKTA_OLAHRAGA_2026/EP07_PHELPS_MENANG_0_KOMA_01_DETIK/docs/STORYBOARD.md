# STORYBOARD — Phelps Menang 0,01 Detik (`EP07`)

Style: TOYDIORAMA

Waktu = detik film = detik VO (Audio Master Clock, `studio/src/scenes/ep07/timeline.json`, total 91,53 dtk termasuk outro card). Potongan = awal section VO − 0,3 dtk.

**World layout:**
- **Main stage:** kolam 8 lajur di panggung walnut, dinding finis di z = +4 (arah kamera), dinding putar di z = −4, tribun dan hoarding di belakang.
- **Chapter stations:** ruang medali (dinding gelembung + rak medali + lemari piala), touchpad makro, papan skor, meja penggaris. Tiap station punya panggung walnut sendiri.
- **Between stations:** potongan keras di batas section VO dengan kilat putih 0,12 dtk; di dalam set kamera bergerak kontinu (dolly, crane, tracking).
- **Station visibility:** hanya set aktif yang dirender (`sceneOf(t)` di `Film.tsx`).

| Scene | Waktu | BG/MG/FG/HUD | Kamera | Audio |
|---|---|---|---|---|
| S1 Hook | 0,0–9,5 | BG tribun + hoarding; MG kolam, 8 perenang, Phelps dan Čavić meluncur ke dinding; FG pelampung tali lintasan, touchpad menyala, riak; HUD cover 0,01 DETIK, lalu timer 0,01 "LEBIH SINGKAT DARI KEDIPAN" dan chip "PERBURUAN REKOR 36 TAHUN" | pose cover 3/4 tinggi, dolly turun ke dinding, lalu crane ke kiri | whoosh pembuka, impact saat sentuhan (2,9), pop timer (2,0), pop chip (6,2) |
| S2 Konteks | 9,5–27,5 | BG dinding gelembung Water Cube; MG rak medali (6 emas muncul, slot 7 berlabel SPITZ 1972), lemari piala GLB; FG Phelps berdiri, Čavić berjalan masuk; HUD chip tanggal, 6 EMAS, +1 = SAMAI SPITZ, ČAVIĆ TERCEPAT, kutipan | crane turun dari dinding gelembung ke rak, dolly kanan ke Čavić | whoosh potongan (9,5), pop tiap chip, ding medali |
| S3 Pengembangan | 27,5–44,4 | BG tribun; MG kolam penuh, 8 perenang kupu-kupu, putar di 50 m; FG riak/wake; HUD START, 50 M PHELPS URUTAN KE-7, SATU PER SATU TERLEWATI, TINGGAL ČAVIĆ, MELUNCUR vs +½ KAYUHAN | tracking atas mengikuti pemimpin; slow-mo close-up dari sisi tali di 39,0 | whoosh potongan, splash start (27,8), whoosh putar (29,8), riser menjelang dinding (36,4) |
| S4a Penjelasan · touchpad | 44,4–52,0 | BG dinding keramik; MG touchpad ×4; FG tangan menekan, ombak bergulung, gauge kg; HUD DINDING FINIS = TOUCHPAD, 1,5–2,5 KG, OMBAK ≠ SENTUHAN | push-in ke touchpad, lalu turun ke garis air | whoosh potongan, klik pad (47,2), air (50,4) |
| S4b Papan skor | 52,0–57,0 | BG panggung gelap; MG scoreboard GLB dengan 50,58 / 50,59 + banner AUDIRA; HUD baris 1 · PHELPS 50,58, 2 · ČAVIĆ 50,59 | dolly maju ke papan | whoosh potongan, pop baris skor ×2 |
| S4c Replay | 57,0–67,1 | BG tribun + papan AUDIRA SPORT FACTS; MG dinding finis, Phelps dan Čavić di touchpad; FG kamera overhead di tiang, troli TV, wasit, ofisial Serbia; HUD SERBIA PROTES, 1/10.000, filmstrip, SATU MENGAYUH SATU MELUNCUR, MENERIMA | dari samping-atas turun ke dinding, lalu keluar ke troli wasit | whoosh potongan, pop chip, tik filmstrip |
| S5 Payoff | 67,1–79,5 | BG dinding gelembung; MG rak medali menjadi 8 emas, label PECAH · 2008; FG Phelps di podium 1 bersorak; HUD HASIL RESMI, EMAS KE-8, 8 EMAS / 7 REKOR / 17 RENANG, 36 TAHUN | push-in ke podium, orbit kiri, crane mundur | whoosh potongan, ding medali 7 dan 8, riser (75,5) + impact payoff 36 TAHUN (78,3) |
| S6 Outro | 79,5–91,5 | BG panggung; MG penggaris + 2 touchpad menyala; FG dua ujung jari mendekat, berhenti ≈ 2 cm; HUD ≈ 2 CM (PERKIRAAN), ADIL? TULIS DI KOMENTAR; kartu outro AUDIRA 2–3 dtk terakhir | crane turun pelan ke penggaris | whoosh potongan, pop ≈ 2 CM, pop komentar, whoosh outro card |
