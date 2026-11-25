# STYLE_DECISION — EP03 Ibnu al-Haitsam & Kamar Gelap

- **Style terpilih:** FILMNOIR (engine: Remotion + React Three Fiber, kit `src/kits/filmnoir`)
- **Tanggal:** 2026-11-11
- **approved (style):** yes — pengguna memilih opsi utama untuk semua episode pada 2026-11-11 ("Ya, semua utama").
- **Cover topik:** cover approved by user 2026-11-11 ("Ya, buat suara"), approved: yes. File: `style/cover-topic.png`, framing di `style/cover.json`.

## Alasan
Ceritanya terjadi di sebuah kamar gelap: satu lubang kecil, berkas cahaya lilin, dan bayangan terbalik di dinding. Film noir memang bahasa visual cahaya dan bayangan (chiaroscuro), jadi eksperimen kamera obscura tampil apa adanya: hitam pekat, satu sumber hangat, berkas cahaya berdebu. Kisah "konon pura-pura gila lalu dikurung" juga cocok dengan suasana misteri noir (jendela berpalang, kisi bayangan) tanpa perlu menampilkan wajah: tokoh cukup siluet dari belakang.

## Alternatif yang ditampilkan (`_review/STYLE_OPTIONS.jpg`)
1. **FILMNOIR (utama)** — dipilih.
2. **STAINEDGLASS** — tidak dipilih: kaca patri lebih ke cahaya berwarna dan jendela; kesannya gereja/katedral, kurang pas untuk Kairo abad ke-11 dan kurang tepat untuk "kamar gelap".
3. **VINTAGEFORGE** — tidak dipilih: manuskrip ala Da Vinci terang dan krem; kuat untuk diagram, tetapi kehilangan kegelapan ruang yang menjadi inti cerita.

## Penerapan memori style (FILMNOIR)
- Finish: profil APPLE_STUDIO_CLEAN (vignette/grain dinaikkan sedikit untuk rasa film 1940-an), exposure 0.72, envIntensity 0.1.
- Lantai meshLambertMaterial (hindari pita emas dari environment).
- Key hangat diarahkan ke subjek utama (bidang proyeksi di dinding), rim fresnel dingin pada siluet.
- Efek aditif (berkas cahaya, debu, gambar lilin) di FX layer (`layers-mask`), layer diaktifkan di kamera.
- Satu warna aksen (amber tungsten) di atas monokrom.
