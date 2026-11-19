# NOTES — Cara Kerja Internet (EP31)

> Tahap 10–11. Pelajaran agar episode berikut mulai dari kualitas lebih tinggi.

## Yang berhasil (worked)

- **FogExp2 untuk depth separation**: `FogExp2("#040e08", 0.018)` via `useThree` hook memberi depth falloff yang natural. Linear fog terlalu agresif (membunuh frame jauh ke lum 18).
- **Emissive traces + dust particles**: 12 partikel emissive kecil (opacity 0.45) di foreground + emissive pada copper traces memberikan kesan hidup tanpa menambah beban render.
- **Camera pull-back di hook**: dist 8, el 38 menampilkan lebih banyak dark PCB substrate, mengurangi overexposure dari phone zone.
- **Subtitle plate solid**: `plate="rgba(0,0,0,0.94)"` dengan baseColor 0.78 opacity memberikan kontras tinggi tanpa menutupi visual.
- **NVENC + Vulkan parallel render**: 6 jobs × 2 concurrency, ~50fps throughput pada RTX 3060.

## Yang gagal (failed)

- **GLB models 404**: smartphone-5f05e5.glb dan small-server-rack-8ae0a4.glb tidak ada di local asset store. Fallback ke geometri sederhana (PhoneChipFallback, ServerChipFallback) — material skor turun ke 3.
- **Linear fog terlalu kuat**: `<fog attach="fog" args={['#040e08', 12, 45]}/>` membunuh f2460 ke lum 18/range 82. Harus pakai exponential.
- **`<fog>` di dalam `<group>` tidak bekerja di R3F**: `attach="fog"` pada group sets `group.fog` yang tidak ada. Harus pakai `useThree` untuk set `scene.fog` langsung.
- **Footer + subtitle tumpang tindih**: Footer text dan subtitle sama-sama dekat y=1500. Solusi: hapus footer, sisakan hanya conditional RTT.

## Perbaikan (fix)

- **Hook brightness**: 3 iterasi poles. lum 185→163→147 melalui: wider camera (dist 8, el 38), hapus screen glow terang, kurangi reflektifitas phone chip (roughness 0.15→0.4, metalness 0.9→0.7), kurangi intensitas cyan accent light.
- **Overlay safe zone**: Header di y=36 (dalam top 180px safe). Fix: padding top 196px, semua font 38px+.
- **Submarine badge positioning**: Ketika RTT tidak tampil, flex space-between mendorong badge ke bawah. Fix: absolute positioning at top:420.

## Parameter terbaik

- FogExp2 density: 0.018
- KeyLight: keyIntensity 3.5, fill 0.68, rimIntensity 0.45
- Ambient: 0.28
- Subtitle: size 52, plate "rgba(0,0,0,0.94)", position 1180, maxWords 6
- HUD font minimum: 38px
- Camera hook: dist 8, el 38 (wider to show dark substrate)

## Data teknis

- **Durasi VO**: 81.04 dtk (206 kata)
- **Durasi final**: 85 dtk (5100 frame @60fps)
- **File size**: 141 MB (NVENC H.264)
- **LUFS**: -13.88 (target -14)
- **True peak**: -0.71 dBTP (sedikit di atas -1.0 target, acceptable untuk social)
- **Resolusi**: 1080×1920 @60fps
- **Encoder**: NVENC (h264_nvenc, yuv420p)

## Scheduled review tasks

- [ ] `review-cara-kerja-internet-24h` — 2026-11-20 19:00 WIB (+24 jam)
- [ ] `review-cara-kerja-internet-72h` — 2026-11-22 19:00 WIB (+72 jam)
- [ ] `review-cara-kerja-internet-7d` — 2026-11-26 19:00 WIB (+7 hari)

Task hanya berjalan saat aplikasi Claude terbuka. Bila tertutup, jalan saat dibuka lagi.
