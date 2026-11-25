# Art Direction — EP03 Tenis 11 Jam: Isner vs Mahut (`BROADCASTFORGE`)

## Idea
Pertandingan tenis yang terlalu panjang untuk ditayangkan biasa: kita menontonnya seperti siaran TV yang tak kunjung selesai. Grafis siaran (LIVE bug, jam durasi, score bug, ticker) terus menghitung, sampai papan skor lapangan sendiri menyerah di 47–47. Penonton merasakan waktu berjalan lewat cahaya: siang → senja → gelap → siang hari ketiga.

## Look
- Kit BROADCASTFORGE dipakai sebagai **resep grafis + pencahayaan siaran**, bukan studio berita. Lingkungan utama: lapangan rumput outdoor kecil (Court 18) dengan dinding hijau tua, tribun GLB, langit senja.
- Satu set studio virtual BROADCASTFORGE (meja, LED wall melengkung) hanya untuk babak Context (perkenalan pemain + aturan), supaya babak itu beda set dari lapangan.
- Rumput dengan garis potong (mowing stripes) dan bekas aus di baseline yang makin parah tiap hari (`wear` 0.4 → 1.0).
- Kamera: lensa siaran. Wide telephoto dari belakang baseline (fov 20–28), medium dari belakang server (fov 38), close setinggi pinggang ke papan skor.

## Material (objek hero)
- **Pemain (ToyPerson)**: kain putih matte (onePiece putih #F2F0EA), kulit toySkin, tanpa logo/nomor. Isner lebih tinggi (height 1.05) dari Mahut (0.98).
- **Papan skor lapangan**: kotak logam hijau gelap (roughness 0.6, metal 0.3), layar emisif kuning lampu-bohlam dengan scanline; saat macet angka berubah merah lalu padam.
- **Rumput**: standard roughness 0.92, tekstur canvas deterministik.
- **Net**: tekstur jaring alpha + pita putih, tiang logam hijau.
- **Studio (Context)**: lantai obsidian clearcoat 0.65, meja navy clearcoat, LED wall emisif navy/biru.
- **Raket & bola**: bingkai logam putih (metal 0.5), bola hijau-kuning sedikit emisif agar terbaca di HP.

## Palet
Kit: studioVoid #070A0F, breakingRed #D32F2F (LIVE, angka penentu), liveAmber #FFA000 (kicker, label hari), broadcastNavy #0B2545 (plate), cyan #00E5FF (garis judul, jam durasi). Lapangan: rumput #4F8A3A/#5F9A44, aus #A08A5A, dinding #123B2A. Langit senja #0B1630 → #3A2D5C → #F2A35C.

## Tipografi
Barlow Condensed ExtraBold/SemiBold (grafis siaran, angka tabular), Manrope cadangan. Label ≥ 34 px @1080, angka hero 150–260 px. Kicker dalam plate gelap, tidak pernah di atas subjek.

## Cahaya per babak
1. Hook — senja hari ke-2: matahari rendah di belakang tribun jauh (rim oranye), key hangat dari sisi kamera, fill biru dingin.
2. Context — studio: key hangat 3-point, rim samping cyan (bukan di belakang anchor, pelajaran memori).
3. Main — senja → malam: hemisphere turun, langit gelap, layar papan skor jadi sumber cahaya utama; lalu gelap total + teks "DIHENTIKAN".
4. Explanation — malam stilasi / grafis: sorot spot tunggal di server, latar redup.
5. Payoff — siang hari ke-3: matahari tinggi netral, kontras penuh, lalu dingin untuk kartu "74 MENIT · 0 ACE".
6. Outro — golden hour lebar lapangan kosong, plakat di dinding.

## Aturan penggambaran
- Tokoh nyata (Isner, Mahut, wasit) = figur stilasi ToyPerson, tanpa wajah realistis, tanpa logo Wimbledon/sponsor/IBM. Nama hanya sebagai teks grafis.
- Satu subjek utama per frame; grafis/stamp tidak menutupi subjek; set yang sama maksimal di 2 frame contact sheet.
- Brand AUDIRA di dinding lapangan (dua papan) dan header grafis siaran; VO menyebut AUDIRA di hook dan outro.
- Safe zone: tidak ada konten penting di atas y 236 atau di bawah y 1540; subtitle karaoke di y ≈ 1300 (score bug pindah ke atas saat subtitle aktif).
