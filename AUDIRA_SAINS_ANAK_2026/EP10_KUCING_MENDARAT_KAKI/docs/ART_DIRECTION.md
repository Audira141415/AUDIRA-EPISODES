# ART_DIRECTION — EP10 Kucing Mendarat

Style: ANATOMIX

- Palet: void `#03141A`, holo teal `#3FE0D0`, holoSoft `#9FF5EC`, HUD teks `#E6FBF8`; aksen putaran depan oranye `#FFB347`, putaran belakang biru `#3B7BFF`; ruang tamu malam hangat `#2A1E1A` dengan lampu kuning `#FFC98A` + rim teal.
- Kucing nyata: vertex color GLB + MeshPhysical sheen 1 (bulu), roughness 0.8, rim light teal dari belakang.
- Kucing hologram: MeshStandard teal transparan 0.28 + fresnel tepi (onBeforeCompile), depthWrite false; organ dalam (saluran vestibular, ruas tulang punggung) emissive di dalamnya, toneMapped false.
- Finish: lab = CYBER_NEON_VOID exposure 1 env 0.55 ao off; ruang tamu = profil hangat (cek still).
- Tipografi: kartu HUD gelap `rgba(3,20,26,0.8)` + garis tepi teal, ukuran ≥ 44 px, angka 100–120 px.
- Safe zone: atas 236 px bersih, subtitle karaoke y 1300, bawah 380 px bersih.
- Label: "ilustrasi model edukasi" kecil di adegan hologram.
