# STYLE_DECISION — EP31_CARA_KERJA_INTERNET

Topik: Cara kerja internet: dari klik hingga data sampai
Tanggal: 2026-11-19

- **Engine:** Remotion (3D)
- **Style terpilih:** CIRCUITFORGE
- **Alasan:** PCB dan sirkuit elektronik sebagai metafora visual infrastruktur internet. Jejak tembaga = kabel jaringan, komponen = router/server, sinyal mengalir = paket data.
- **Alternatif ditolak:** GLITCHFORGE — terlalu dramatis untuk explainer mekanisme; NANOFORGE — kurang langsung menggambarkan infrastruktur jaringan makroskopis
- **Cover referensi:** `cover-reference.png`
- **Cover topik:** `cover-topic.png` (pending)
- **approved:** yes

## Parameter dari motion memory (CIRCUITFORGE)
- Wajib diterapkan: RoomEnvironment lewat PMREMGenerator (envIntensity ~0.6) untuk logam; kamera act 2–3 dilebarkan untuk 9:16; Finish profile CINEMA_TEAL_ORANGE, exposure 1, envIntensity 0.55
- Parameter terbaik: finishProfile CINEMA_TEAL_ORANGE, exposure 1, envIntensity 0.55, ao true, hdri studio
- Hindari: logam tanpa environment map (tampil hitam); frame hampir hitam
