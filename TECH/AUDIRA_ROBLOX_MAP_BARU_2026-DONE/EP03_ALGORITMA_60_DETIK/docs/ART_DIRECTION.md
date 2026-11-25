# Art Direction — EP03 (ISOCRAFT)

- **Konsep:** mesin isometrik tembus pandang bergaya komik dengan garis tinta, yang "menilai" map baru dalam 60 detik. Alurnya: konveyor memasukkan pemain → ruang kaca berisi peta mini → zona SERU dengan chute ke REKOMENDASI. Pemain yang keluar cepat jatuh lewat pintu jebakan.
- **Palet (kit ISOCRAFT):** paperWarm #F5F2EB (latar), inkBlack #1C1E21 (garis), shadowBlue #7A9BB8, bodyCoral #E06D53, bodyMint #5FA084, metalSteel #D1D8E0, accentYellow #F4C430. Merah sinyal #D8432E.
- **Garis tinta:** inverted hull (shader yang mendorong verteks sepanjang normal), 0.065 unit pada mesin dan 0.05/scale pada avatar.
- **Material:** POLISH.toyPlastic + RoundedBoxGeo dengan grain seeded, kaca transparan dengan clearcoat, inti chute emissive.
- **Cahaya:** ambient hangat + hemisphere + key directional berbayang (PCF 2048) + rim biru. Finish APPLE_STUDIO_CLEAN, exposure 0.9, envIntensity 0.25, ao=false.
- **Kedalaman:**
  - BG: kertas halftone + pelat bayangan iso.
  - MG: mesin.
  - FG: kelompok peti, blok rumput, dan lampu stud (muncul setelah hook), plus batang 28 hari.
  - HUD: papan komik 3D bergaris tinta.
  - Caption di lapisan paling atas.
- **Karakter:** BlockAvatar R6 klasik (kuning/biru/hijau). Skala 0.5 di hook (sama dengan cover), membesar halus ke 0.6 di beat dekat. Setiap bagian memakai pose aktif: lari, tunjuk, sorak, lompat, lambai.
- **Tipografi:** Bangers untuk judul cover dan caption; Arial Black italic dengan stroke tinta untuk papan di dunia 3D.
