# Source Register — Cara Kerja Teknologi Under-Display Camera: Kamera Tersembunyi di Layar

> Standar EP01 Makkah: minimum 5 sumber, ≥ 3 HIGH. Pipeline guard blokir jika < 5 sumber.

| # | Fakta | Sumber (judul, penulis, tahun) | URL | Tanggal baca | Level |
|---|---|---|---|---|---|
| 1 | T-OLED: area terbuka ~21%, transmisi cahaya ~20%; P-OLED (Pentile): area terbuka 23% tapi transmisi hanya 2,9%; degradasi: blur, noise, low-light, color shift; UDC = masalah restorasi gambar | Image Restoration for Under-Display Camera, Zhou, Ren, Emerton, Lim, Large (CVPR 2021; arXiv 2020) | https://arxiv.org/abs/2003.04857 | 2026-11-25 | HIGH |
| 2 | Mikrostruktur pixel OLED semi-transparan melemahkan dan mendifraksikan cahaya: noise, flare, haze, blur; PSF diukur pada ponsel UDC produksi awal; panel punya densitas pixel dikurangi di atas kamera | Removing Diffraction Image Artifacts in Under-Display Camera via Dynamic Skip Connection Network, Feng, Li, Chen dkk., 2021 | https://arxiv.org/abs/2104.09556 | 2026-11-25 | HIGH |
| 3 | Tantangan UDC 2020 (ECCV RLQ workshop): ~150 tim mendaftar; dua jenis layar (4K T-OLED, P-OLED) | UDC 2020 Challenge on Image Restoration of Under-Display Camera, Zhou, Kwan, Tolentino dkk., 2020 | https://arxiv.org/abs/2008.07742 | 2026-11-25 | HIGH |
| 4 | MIPI 2022 track UDC: 167 peserta terdaftar, 19 tim mengirim hasil akhir | MIPI 2022 Challenge on Under-Display Camera Image Restoration: Methods and Results, Feng, Li, Zhou dkk., 2022 | https://arxiv.org/abs/2209.07052 | 2026-11-25 | HIGH |
| 5 | Pola pixel periodik menyebabkan difraksi; metasurface inverse-designed menekan mode difraksi orde tinggi dan memulihkan wavefront tanpa post-processing software (riset, preprint) | Inverse-Designed Metasurfaces for Wavefront Restoration in Under-Display Camera Systems, Jo, Lee, Lee dkk., 2025 | https://arxiv.org/abs/2504.17368 | 2026-11-25 | MEDIUM |
| 6 | Riset UDC berlanjut: restorasi dengan efek hamburan (ICCV 2023) | Under-Display Camera Image Restoration with Scattering Effect, ICCV 2023 (DOI via Crossref) | https://doi.org/10.1109/iccv51070.2023.01156 | 2026-11-25 | MEDIUM |
| 7 | Riset arsitektur ringan untuk restorasi UDC (2025) | MUNet: A lightweight Mamba-based Under-Display Camera restoration network, Image and Vision Computing, 2025 | https://doi.org/10.1016/j.imavis.2025.105486 | 2026-11-25 | MEDIUM |
