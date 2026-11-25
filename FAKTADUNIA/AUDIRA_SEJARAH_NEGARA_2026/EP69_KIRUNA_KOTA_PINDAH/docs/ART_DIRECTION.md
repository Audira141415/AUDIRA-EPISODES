# ART_DIRECTION — EP69 Kiruna, Kota yang Dipindah karena Tambang

Style: HD2D · Remotion + R3F · 1080×1920 · 60 fps final

## Konsep
Kiruna sebagai **diorama kota kayu Arktik** di atas meja tilt-shift: rumah kayu, jalan aspal, bukit tambang besi di belakang. Warga = sprite pixel art 2D (billboard, 8 fps langkah) dengan bayangan kontak 3D nyata. Gereja kayu merah = satu hero GLB yang sama di semua adegan (G17), sehingga "gereja yang berjalan" terbaca sebagai benda yang sama.

## Palet
- Merah Falu gereja: #8E2B22 (dinding), #5A1A15 (bayangan), atap kayu gelap #3A2A22.
- Bijih besi / bukit tambang: #3B3F46, urat karat #8A4B2A.
- Tundra Agustus: hijau lumut #6F7F4A, birch kuning #C9B458, aspal #4A4D55.
- Salju & langit Arktik (S2–S4): #DCE6EE, biru senja #2B3550 / #253049.
- Cahaya hangat lentera / matahari rendah: 2400K #FFB46A. Aksen HUD emas #F2B75B, merah peringatan #E2574C.

## Cahaya (dual-temperature HD2D)
- Adegan pergerakan gereja (S1, S6–S8) = **Agustus, matahari Arktik rendah** sore: key hangat dari kiri-belakang, bayangan panjang, ambient biru dingin. Bukan malam, bukan salju (fakta: Agustus).
- Adegan konteks (S2–S4) boleh senja biru dingin bersalju untuk "Arktik", dengan lampu jendela hangat.
- **Perbaikan memori HD2D wajib**: apron/lantai depan lebih terang (#34405A di senja, aspal terang di siang), lampu praktis hangat kecil di prop FG (lampu jalan, lentera pekerja) agar muncul bokeh tilt-shift, cool moon/sky point light, scrim radial + gradien atas/bawah di overlay (vignette tidak menutup band bawah).
- `<Finish profile="DOCUMENTARY_WARM" exposure={1} envIntensity={0.55} ao />`.

## Material
- Kayu & batu: canvas map + bump (plank, shingle, cobble), bumpScale 0.5 (POLISH.stone / bevel). Hindari plastik polos.
- Tilt-shift: aperture **0.006**, maxBlur 0.03 (0.0014 tidak terlihat).
- Rim light / backer pucat di belakang gereja agar hero terpisah dari latar.

## Kamera
- Elevated 3/4 macro glide kontinu, tidak pernah parkir; tiap adegan punya gerak termotivasi (dolly mengikuti trailer, crane turun ke penampang tambang, orbit 180° di adegan putar gereja).
- Pergantian adegan: whip/crossfade 0,4 dtk mengikuti arah gerak (vector law).

## Teks & HUD
- Callout kinetik (kartu pixel-frame JRPG, font pixel / Anton) di zona aman atas y 260–520 untuk setiap angka: 672 TON, 500 M/JAM, 145 KM, 2004, 1.365 M, 2014 → 2100, ±3 KM KE TIMUR, >10 MILIAR KRONOR, 1912, 24 M, 19 AGU 2025, 30 M, 5 KM, 180°, 1.000 PIPA.
- Karaoke per kata di y 1300 (jarak kata ≥ 0,4em, bounce ≤ 1,04). Top 236 px dan bottom 380 px bersih.
- Kotak dialog HD2D gaya JRPG boleh dipakai untuk kalimat kunci ("KOTANYA YANG PINDAH").

## Sensitif & etika
- Tidak menampilkan jumlah warga/rumah yang pindah (tidak terverifikasi).
- Tanpa wajah orang nyata; warga = sprite pixel generik. Tanpa logo LKAB/Mammoet/SVT asli: name plate teks "LKAB", ikon TV generik "LIVE".

## Brand
- Papan kayu "AUDIRA" di pagar trotoar S1 + plakat di lokasi baru S8 (brand di dalam adegan).
- VO menyebut "Audira" di hook dan outro. `AudiraSignature seed="kiruna-ep69"`, outro card 2–3 dtk terakhir.
