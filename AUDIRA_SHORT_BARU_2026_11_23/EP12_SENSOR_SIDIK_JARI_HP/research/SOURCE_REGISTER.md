# SOURCE_REGISTER — EP12 Cara Kerja Sensor Sidik Jari di HP

Diriset 2026-11-23 (subagent, halaman diambil via curl/Wayback). Hanya fakta berlabel **OK** yang boleh masuk naskah.

| No | Fakta | Status | Sumber | URL |
|---|---|---|---|---|
| 1 | Sidik jari = pola punggung (ridge) dan lembah (valley); semua sensor mengukur beda fisik ridge vs valley | OK | Wikipedia: Fingerprint | https://en.wikipedia.org/wiki/Fingerprint |
| 2 | Minutiae = titik khas ridge; paling dipakai sistem otomatis: ujung ridge (ridge ending) dan percabangan (bifurcation) | OK | Wikipedia: Fingerprint | https://en.wikipedia.org/wiki/Fingerprint |
| 3 | Tiga pola dasar: busur (arch), sosok (loop), pusaran (whorl) | OK | Apple: About Touch ID | https://support.apple.com/en-us/105095 |
| 4 | Sensor kapasitif = deretan kapasitor kecil; muatan berubah saat ridge menempel, valley ada celah udara → gambar ridge/valley dari sinyal listrik | OK | Android Authority | https://www.androidauthority.com/how-fingerprint-scanners-work-670934/ |
| 5 | Touch ID pertama di iPhone 5s, diumumkan 10 Sep 2013, sensor kapasitif di tombol Home | OK | Apple Newsroom 2013 | https://www.apple.com/newsroom/2013/09/10Apple-Announces-iPhone-5s-The-Most-Forward-Thinking-Smartphone-in-the-World/ |
| 6 | Touch ID: cincin baja mendeteksi jari lalu memicu pemindaian; baca 360° | OK | Apple: About Touch ID | https://support.apple.com/en-us/105095 |
| 7 | Touch ID 500 ppi, tebal 170 µm | LEMAH — tidak dipakai | Wikipedia: Touch ID | https://en.wikipedia.org/wiki/Touch_ID |
| 9 | Sensor optik bawah layar: layar menyinari jari, sensor memotret gambar 2D; terang/gelap = ridge/valley | OK | Android Authority | https://www.androidauthority.com/how-fingerprint-scanners-work-670934/ |
| 10 | Kelemahan optik: gambar 2D, relatif lebih mudah dikelabui | OK | Android Authority | https://www.androidauthority.com/how-fingerprint-scanners-work-670934/ |
| 11 | Ultrasonik memancarkan pulsa ultrasonik; pantulan beda untuk ridge, valley, pori → rekonstruksi 3D | OK | Qualcomm 3D Sonic (arsip) | http://web.archive.org/web/2021/https://www.qualcomm.com/products/3d-sonic |
| 12 | 3D Sonic Max: area 600 mm², bisa 2 jari sekaligus (20×30 mm hanya di judul) | OK (600 mm², 2 jari) | Qualcomm (arsip) | http://web.archive.org/web/2021/https://www.qualcomm.com/products/3d-sonic-max |
| 14 | 3D Sonic tetap bekerja saat jari basah/kotor; anti-spoofing | OK | Qualcomm 3D Sonic (arsip) | http://web.archive.org/web/2021/https://www.qualcomm.com/products/3d-sonic |
| 15 | Galaxy S10 (20 Feb 2019) = Galaxy S pertama dengan sensor sidik jari di layar, ultrasonik | OK | Wikipedia: Galaxy S10 | https://en.wikipedia.org/wiki/Samsung_Galaxy_S10 |
| 16 | Apple: gambar sidik jari hanya sementara di memori terenkripsi Secure Enclave lalu dibuang; disimpan peta matematis terenkripsi yang tak bisa disusun ulang jadi sidik jari; tidak dikirim ke Apple, tidak ikut backup | OK | Apple Platform Security | https://support.apple.com/guide/security/touch-id-and-face-id-security-sec067eb0c9e/web |
| 17 | Android: pendaftaran + pencocokan wajib di TEE; gambar mentah & template tak bisa diakses dari luar TEE; disimpan terenkripsi | OK | AOSP Fingerprint HAL | https://source.android.com/docs/security/features/authentication/fingerprint-hal |
| 18 | Jumlah minutiae per jari (40–100) | TIDAK TERVERIFIKASI — tidak dipakai | — | — |
| 19 | Touch ID: peluang orang lain membuka < 1 banding 50.000 (1 jari); 5 jari terdaftar → sampai 1 banding 10.000; Face ID < 1 banding 1.000.000 | OK | Apple Platform Security | https://support.apple.com/guide/security/optic-id-face-id-touch-id-passcodes-sec9479035f1/web |
| 20 | Android: semua kelas biometrik wajib FAR 1/50.000; Class 3 juga Spoof Accept Rate 0–7% | OK | AOSP: Measuring biometric security | https://source.android.com/docs/security/features/biometric/measure |
| 21 | Apple minta passcode setelah 5 kali gagal, setelah restart, atau > 48 jam tak dibuka | OK | Apple: About Touch ID | https://support.apple.com/en-us/105095 |
| 22 | Ridge terbentuk ±minggu ke-15 masa janin | LEMAH — tidak dipakai | Wikipedia | https://en.wikipedia.org/wiki/Fingerprint |
| 23 | Kembar identik pun sidik jarinya tidak identik | OK | Wikipedia: Fingerprint | https://en.wikipedia.org/wiki/Fingerprint |

Catatan: kalimat aman = "HP menyimpan peta matematis", bukan "gambar". Makin banyak jari terdaftar → peluang salah cocok makin besar.
Musik: tidak ada musik pihak ketiga; SFX prosedural (`npm run sfx`).
