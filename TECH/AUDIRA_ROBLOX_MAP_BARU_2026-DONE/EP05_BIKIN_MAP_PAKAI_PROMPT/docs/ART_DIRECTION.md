# Art Direction: EP05 Bikin Map Pakai Prompt (DEVFORGE)

- **Dunia:** IDE spasial 3D yang melayang di ruang gelap (#080B11) dengan dinding grid biru di belakang. Prompt di panel berubah jadi peta side-scroller dari blok 1 stud. Kode jadi game, game jadi pelajaran.
- **Palet:** token kit DEVFORGE: editor #0D1117 / #161B22, neon cyan #00F0FF (aksi dan prompt), hijau #25F482 (berhasil), ungu #D2A8FF (Studio), emas #FFB703 (Robux dan koin), merah #FF4D4F (bahaya: NPC, jebakan, asal-asalan). Rumput blok #35C46A, badan platform slate #26324A dengan grid blok.
- **Karakter:** `_shared/BlockAvatar` (klasik kuning/biru/hijau) aktif di setiap bagian: lompat, terguling, menunjuk, mengetik, berpikir, lari, bersorak, memegang blok, melambai. NPC = avatar abu-abu dengan torso merah emisif. Kaki lurus diberi garis gelap tipis (`LegSeam`) supaya terbaca sebagai dua kaki.
- **Lighting:** key hangat (#FFF2DE, kanan atas, bayangan PCF 2048), rim cyan dari kiri, fill hijau dari bawah, point cyan di depan panel. Rig cahaya dan dinding grid ikut berpindah bersama kamera.
- **Finish:** `<Finish>` CINEMA_TEAL_ORANGE, exposure 1, envIntensity 0,55, AO aktif (parameter terbaik DEVFORGE). Bloom hanya pada neon (emissive > 2,2, toneMapped off).
- **Material:** sasis IDE clearcoat, blok `POLISH.brickABS` + studs, avatar `POLISH.toyPlastic/toySkin`, koin dan gembok logam emas, kertas sketsa `POLISH.paper`, grain seeded (`useSurfaceGrain`).
- **Tipografi:** headline Anton (lokal), tag mono JetBrains Mono, label 3D Arial Black / Consolas (font sistem, ukuran otomatis menyesuaikan kartu), caption karaoke Anton 70 px di pelat gelap.
- **Kedalaman:** BG grid + halo, MG panel dan kartu di z berbeda, FG avatar, platform dan kubus melayang, kabut 62–110.
- **Brand:** tab `AUDIRA_Map.prompt` di S0, S3 dan layar tengah S5; tanda tangan bergerak `@AudiraTECH`; outro card.
