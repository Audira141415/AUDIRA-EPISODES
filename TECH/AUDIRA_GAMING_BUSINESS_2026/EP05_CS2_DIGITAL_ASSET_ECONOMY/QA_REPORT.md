# CS2: SKIN SENJATA GAME BISA JADI ASET DIGITAL BERNILAI TINGGI!

Seri AUDIRA GAMING BUSINESS, DARI GAMER MENJADI PENGHASIL UANG, episode 05. Created by Agus Dwi R.

| Pemeriksaan | Hasil | Bukti |
| --- | --- | --- |
| Akurasi riset | Lulus | Semua angka dipetakan ke SOURCE_REGISTER.md dengan tanggal |
| Validasi sumber | Lulus dengan catatan | Potongan 15% tidak terbaca dari halaman resmi Steam dan bersumber dari satu media. Grafik batang di layar ilustratif kecuali dua titik bersumber. Video ini bukan saran investasi. Senjata adalah properti generik tanpa aset game, tanpa instruksi apa pun. |
| Kualitas naratif | Lulus | Hook frame 0, 213 kata terucap, tutup dengan pertanyaan |
| Kualitas voice-over | Sebagian | Voice -16.2 LUFS, tidak ada kata tereja salah menurut durasi kata. Telinga manusia belum meninjau pelafalan fonetik |
| Sinkron audio | Lulus | Adegan dikunci ke timestamp Cartesia, 149 WPM |
| Loudness | Lulus | -14.0 LUFS, true peak -1.7 dBTP, musik -31.4 LUFS |
| Sinkron takarir | Lulus | 99.4% kata bersuara saat aktif, selisih onset maks 0.072 detik, 57 cue SRT |
| Kualitas gerak | Lulus | Lembar frame ditinjau dari MP4 final. Satu hold di atas 2,5 detik yaitu kartu penutup. Segmen hitam: 0 |
| Safe zone mobile | Lulus | Panel mulai 190 px, takarir berakhir 1540 px |
| Branding dan outro | Lulus dengan catatan | Monolit + Created by Agus Dwi R., 3.2 detik. `audira-outro-card.svg` bersama masih memakai logo lama, jadi kartu dibangun dari kit logo resmi |
| Resolusi | Lulus | 1080x1920 |
| Frame rate | Lulus | 30/1, 2676 frame |
| Tes putar MP4 | Lulus | Dekode penuh, 0 galat, durasi 89.20 detik, h264/aac |
| Fotorealisme | Tidak terpenuhi | Brief meminta photorealistic. Image generation tidak tersedia (9Router: Missing API key), jadi visual adalah 3D prosedural |

Voice dihasilkan lewat `scripts/tts-cartesia.mjs` karena MCP `audira_generate_voiceover` mengembalikan HTTP 401.
