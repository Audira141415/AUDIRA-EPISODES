# Style Decision: EP01 Universitas Tertua, Fatimah al-Fihri & Al-Qarawiyyin

- **Style terpilih:** MOSAICFORGE (style #60, Remotion + React Three Fiber, kit `kits/mosaicforge/`)
- **Tanggal:** 2026-11-11
- **approved (style):** yes. Pengguna memilih opsi utama untuk semua episode pada 2026-11-11 ("Ya, semua utama").
- **approved (cover topik):** yes. Cover approved by user 2026-11-11 ("Ya, buat suara").

## Alasan

Kisah Al-Qarawiyyin adalah kisah ribuan bagian kecil yang menjadi satu: sebuah masjid kecil dari harta warisan yang tumbuh selama berabad-abad lewat ribuan guru dan murid. Mosaik keping keramik, terakota, dan emas adalah bahasa visual asli arsitektur Maroko (zellige), jadi gayanya terasa hangat, bermartabat, dan cocok untuk tempat ibadah serta naskah tanpa menampilkan wajah siapa pun. Pintu besi empat kunci (The Guardian, 2016) menjadi gambar pembuka: panel mosaik lengkung tapal kuda, pintu besi, empat pelat kunci kuningan, dan empat kunci tempa yang melayang di atasnya.

## Alternatif yang ditunjukkan (`_review/STYLE_OPTIONS.jpg`)

1. **MOSAICFORGE** (utama): dipilih.
2. **ISLAMICDOCUMENTARY**: tidak dipilih. Flat 2D arabesk dan siluet kubah; aman, tetapi lebih generik dan tidak memberi kedalaman 3D serta materi keramik/emas yang membuat kisah "dari keping kecil menjadi pusat ilmu" terasa.

## Cover

- `cover-reference.png`: quality bar kit MOSAICFORGE (`F:\AUDIRA-SKILL-MOTION\references\quality-bar\mosaicforge.png`).
- `cover-topic.png`: frame 0,3 dtk komposisi `QarawiyyinCover` (1080x1920), framing di `cover.json` (`src/scenes/qarawiyyin/camera.ts:COVER`), juga frame pembuka film.
- Finish: DOCUMENTARY_WARM, exposure 0.84, environmentIntensity 0.4, AO, HDRI studio, DOF fokus 12.2 (parameter terbaik style memory). Teks di atas pola ubin memakai kartu kobalt #13306F (wajib dari style memory).
- Skor cover (self): rata-rata 4,0, LOLOS; ceiling audit visual 5/5/5/5 (lighting/material/depth/composition).

## Pembaruan Stage B (2026-11-11)

- Cover approved by user 2026-11-11. Catatan Stage A ditangani di film: angka "859" kini dirasterisasi dari huruf tebal (Arial Black) dan disusun dari keping emas di atas lapis, jadi "8" tidak lagi terbaca "B"; kunci kini besi tempa gelap (tidak lagi tampak kuningan panas), sorot lampu diturunkan 760 -> 600.
- Karena frame pembuka film harus sama dengan cover, `cover-topic.png` dirender ulang dari film (framing sama, `src/scenes/qarawiyyin/coverPose.ts:COVER`). Versi yang disetujui sebelumnya disimpan sebagai `cover-topic.v1-approved.png` / `cover.v1-approved.json`. Perubahan hanya dua catatan di atas; perlu konfirmasi singkat pengguna.
