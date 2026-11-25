# ART_DIRECTION — Tim Bobsled Jamaika, Calgary 1988 (`EP09`)

Style: CINESTORY (3D, Remotion + R3F). Engine: remotion.

- **Konsep:** kisah underdog nyata difilmkan seperti drama olahraga: malam berlampu sorot, lintasan es mengilap, salju dingin abu-biru, kereta hijau-kuning-hitam sebagai tokoh utama yang konsisten. Hangat di wajah tim, dingin di lingkungan.
- **Palet:** hijau Jamaika `#1f8f3a`, kuning `#f2c230`, hitam `#16181a`; es `#dcecf6`; salju `#c3cfdc` (tekstur `#dfe6ee`, alur angin biru); batu gunung `#4f5d70`/`#5d6b7e` + tudung salju `#d6dee8`; langit malam (S1/S4), biru siang Kingston, biru-ungu Lillehammer. Merah `#e2442f` hanya untuk chip "terguling / gagal / tidak finis".
- **Material (`cine/look.ts`):** cat fiberglass clearcoat (`CINE.paint`) untuk kereta dan helm; es clearcoat 0,03 (`CINE.ice`); salju kasar sheen rendah + tekstur prosedural `snowTex`; baja `CINE.steel`; papan cat gelap `CINE.signPaint`; pasir, air, aspal realistis di Kingston.
- **Figur:** `CinePerson` (rig karakter kit CINESTORY, skala 0,6) dengan wajah generik, seragam hijau-hitam + topi kuning; tanpa kemiripan atlet asli, nomor, sponsor, atau materi film.
- **Cahaya:** spot kunci atas-depan (bayangan 2048), rim oranye dari belakang, fill dingin malam di S1/S4/S6, `SubjectSpot` hangat intensitas 40 ke target kamera, floodlight GLB di S6. `<Finish>` profil `CINEMA_TEAL_ORANGE`, exposure 1, env 0,55, DOF tipis (aperture 0,0025) ke target.
- **Lingkungan per babak:** lintasan es malam + bank KREISEL → pantai Kingston → lembah salju Calgary → start + KREISEL dari crane → finis + tribun TV → Lillehammer + papan skor + floodlight → outro salju.
- **Kamera:** S1 head-on rendah lensa panjang (fov 26→34), S4 crane tinggi (3,9 m) agar dua crash tidak mirip; S5 dolly samping ikut rombongan berjalan; S6 push-in frontal fov 50 (papan skor + tim utuh); S7 dolly lalu crane naik.
- **FG:** `ForeDrift` gundukan salju kecil berbayang + tiang penanda, 3 m di depan lensa, blur DOF.
- **Tipografi:** Anton (angka/callout), Space Grotesk (chip, caption karaoke y=1260, kata aktif kuning, skala ≤ 1,04).
- **Safe zone:** atas 236 px bersih (chip mulai y=260); bawah 380 px tanpa teks; gradien atas + gradien bawah + vignette radial ringan.
