# ART DIRECTION — SEJARAH MAKKAH · EP04 · Kiswah (SULAMFORGE)

## Konsep
"Kain yang menceritakan dirinya sendiri." Seluruh film adalah satu runner kain sutra hitam berjacquard (tekstur tone-on-tone, sambungan panel ±98 cm) tempat delapan diorama tekstil berdiri. Setiap era dibuat dari bahannya sendiri: felt pasir untuk Yaman, linen untuk masa jahiliah dan para khalifah, peta sulam untuk Mesir, kayu beech untuk 1927, sutra hitam untuk pabrik, marmer putih untuk ritual hari ini. Benang emas pembawa yang di-couching menghubungkan semua stasiun dan menjadi arus film.

## Palet (src/scenes/kiswah/kit.tsx `PAL`)
- Latar `#0A0708`, sutra hitam `#0E0C0E` dengan sheen ungu keabu `#5A4E5C`.
- Emas (perak bersepuh) `#E3A93E`, metal 1, roughness 0.17–0.2; cord `#B98A33`.
- Isian katun `#E2D29A` matte (roughness 0.95). Aturan: emas selalu gelap-mengkilap, katun selalu pucat-matte, agar keduanya tidak tertukar.
- Warna kiswah historis: putih `#EEE6D6`, merah `#A8242E`, hijau `#2E6E47`, hitam `#151314`.
- Felt pasir `#C79A62`, Nil `#2F6FA8`, beech `#C9A274`, kuningan `#C9A04A`, krem teks `#F6EAD6`.

## Cahaya & finishing
- Key hangat rendah `#FFD7A0` dari kiri-depan yang mengikuti target kamera (bayangan 4096, batas menyesuaikan jarak), rim dingin `#B8C2FF` dari belakang, point hangat di area kerja, hemisphere 0.38.
- `Finish`: DOCUMENTARY_WARM, exposure 0.92, `hdri="studio"`, `envIntensity 1.05` (perlu agar emas memantul; pelajaran r186), AO radius 0.08, DOF ringan fokus ke jarak kamera.
- Kabut gelap yang mengikuti jarak kamera, sehingga stasiun tetangga memudar dan tepi set tidak terlihat.

## Kamera
Orbit per kunci (D, elevasi, azimut) berpatok kata; smootherstep antar kunci; drift lambat terus-menerus; perpindahan stasiun dengan busur naik. 16:9 lewat `FormatFov` (Finish). Short memakai jalur yang sama dengan jarak ×1,3 (exposure 1,0, aperture 0,0011).

## Tipografi
- Tag di dunia 3D: tambalan linen dengan tepi jelujur putus-putus, Georgia bold (teks hanya dari naskah/SOURCE_REGISTER). Varian aksen: kain hitam, teks emas.
- Kartu bab: Courier New untuk label "BAB n", Georgia untuk judul. Caption 16:9 Georgia 40 px; short Georgia bold 62 px karaoke.

## Aturan penggambaran (dipatuhi)
- Tidak ada nabi, sahabat, malaikat dalam bentuk apa pun; Fathu Makkah hanya cahaya hangat di atas kain.
- Ka'bah hanya sebagai maket kubus bermartabat (batu polos, selubung kain, pintu emas, tanda sudut Hajar Aswad); tidak pernah rusak. Tumpukan berat era Al-Mahdi ditunjukkan dengan jarum alat ukur, bukan bangunan retak.
- Tidak ada huruf Arab, tidak ada kaligrafi tiruan: semua ornamen sabuk, sudut (Al-Ikhlas) dan jacquard digambarkan geometris abstrak.
- Tidak ada manusia; kafilah hanya unta felt tanpa penunggang, mahmal sebagai objek. Insiden 1926 dan 1962 hanya tanggal, benang terputus, dan paket yang kembali.
- Nama AUDIRA di dunia 3D tepat sekali: tag "ARSIP AUDIRA" pada kotak kaca potongan kiswah (stasiun 7), bukan pada Ka'bah atau teks ayat.
