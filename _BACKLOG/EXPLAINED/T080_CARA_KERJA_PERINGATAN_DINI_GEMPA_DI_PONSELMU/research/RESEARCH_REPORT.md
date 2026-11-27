# Research Report — Cara Kerja Peringatan Dini Gempa di Ponselmu

> Riset backlog 2026-11-27. Channel @AudiraExplained (rule 15: netral, tanpa wajah/logo nyata).

## Sumber utama

- **Wikipedia (en)**: artikel EEW, ShakeAlert, P wave, Cell Broadcast — kompilasi fakta dari sumber primer (USGS, JMA, Google) (#1, #2, #5, #7, #10).
- **BMKG resmi**: berita resmi tentang InaEEWS, kemajuan prototipe, 228 sensor, 88,8% keberhasilan (#3, #4, #9).
- **California EEW (earthquake.ca.gov)**: mekanisme kerja EEW dari sisi pemerintah negara bagian (#8).
- **Allen et al., Science 2025**: paper ilmiah Google tentang deteksi gempa global via ponsel Android (#6).
- **UU 31/2009**: dasar hukum mandat BMKG untuk peringatan dini (#11).

## Fakta terverifikasi

1. Gempa menghasilkan gelombang P (primer/tekanan, 5–8 km/s di kerak) yang tiba lebih dulu, lalu gelombang S (sekunder/geser, ±60% kecepatan P) yang merusak (#1, #8).
2. EEW mendeteksi gelombang P, menghitung lokasi dan magnitudo, lalu mengirim peringatan sebelum gelombang S tiba (#7, #8).
3. Waktu peringatan = selisih waktu tiba S dan P, bergantung jarak dari episenter. Jauh = puluhan detik, dekat = nol detik (blind zone) (#1, #2, #8).
4. Negara dengan EEW operasional nasional (per Jan 2026): Jepang, Tiongkok, Taiwan, Korea Selatan, Israel. AS dan Meksiko: regional. Indonesia: uji publik (#2).
5. InaTEWS (tsunami) ≠ InaEEWS (gempa). InaTEWS sudah operasional sejak 2008 untuk peringatan tsunami. InaEEWS masih prototipe/alfa (#3).
6. BMKG InaEEWS: ±228 sensor, bermitra ICL Tiongkok (2019), uji internal Cianjur 2022, pilot publik 2025 di Jakarta/Banten/Jabar/Lampung, hanya Android, belum peringatan massal (#3, #4, #9).
7. Tingkat keberhasilan InaEEWS (2022–2025): 88,8% dari 143 kejadian gempa di zona pilot (#9).
8. Android Earthquake Alerts (Google): akselerometer MEMS di ponsel → server Google → kalkulasi → peringatan. Dua level: "Be Aware" (notifikasi) dan "Take Action" (layar penuh, override silent). Tersedia di 98+ negara per 2025 (#5, #6).
9. Kelemahan Android EEW: gagal di gempa Turki 2023 (magnitude salah dideteksi 4,5–4,9 vs aktual 7,8) dan false alarm di Brasil (Feb 2025). Berhasil di Venezuela 2026 (11,4 juta alert) (#5, #6).
10. Cell Broadcast untuk gempa/tsunami di Indonesia: masih dalam tahap uji coba per 2025 (#10).
11. UU 31/2009 pasal 68–70 memberi mandat BMKG untuk peringatan dini bencana alam (#11).

## Perselisihan / Kontroversi

- **Koreksi hook TOPIC.md**: "Ponsel bisa berbunyi beberapa detik sebelum guncangan sampai ke tempatmu" — ini **hanya berlaku bila kamu cukup jauh dari episenter** (puluhan km). Dekat episenter (blind zone), gelombang P dan S tiba hampir bersamaan, waktu peringatan mendekati nol. Hook dikoreksi menjadi: "Ponselmu **bisa** memberi peringatan sebelum guncangan tiba — tapi ada syaratnya." Naskah menjelaskan bahwa waktu peringatan tergantung jarak dari episenter, dan dekat sumber gempa peringatan bisa terlambat.
- **InaTEWS vs InaEEWS**: InaTEWS (Indonesia Tsunami Early Warning System, operasional sejak 2008) khusus **tsunami**, bukan gempa. InaEEWS (Indonesia Earthquake Early Warning System) khusus **peringatan dini guncangan gempa**. Dua sistem berbeda yang sering dicampuradukkan. InaTEWS mengirim peringatan **setelah gempa** terjadi, menghitung potensi tsunami. InaEEWS mengirim peringatan **saat gempa sedang berlangsung** sebelum guncangan S tiba.
- **Android Earthquake Alerts di Indonesia**: Google menyebut 98+ negara, tapi tidak ada konfirmasi eksplisit bahwa Indonesia termasuk (atau tidak). Indonesia punya BMKG InaEEWS sendiri (pilot). Status Android EEW di Indonesia perlu dicek di Settings > Safety & emergency ponsel Android yang ada di Indonesia saat produksi.
- **Cell Broadcast gempa di Indonesia**: Wikipedia mencatat Indonesia "sedang diuji coba" CB tanpa referensi rinci. Belum jelas apakah ini untuk gempa, tsunami, atau bencana umum. Naskah cukup menyebut bahwa Indonesia sedang membangun sistem serupa.
- **Regulasi**: UU 31/2009 (Meteorologi, Klimatologi, dan Geofisika) adalah mandat BMKG. Tidak ditemukan Perka BMKG khusus tentang EEW (InaEEWS masih pilot/prototipe, belum ada regulasi teknis khusus yang bisa diverifikasi). Naskah cukup menyebut "BMKG diamanatkan undang-undang" tanpa menyebut nomor spesifik di VO.
- **"Ponsel berbunyi" — via apa?** Di Indonesia saat ini: hanya lewat **aplikasi InaEEWS** (alpha, Android saja, harus install dan mendaftar). Belum ada Cell Broadcast otomatis untuk gempa. Android EEW Google mungkin aktif tapi belum dikonfirmasi. Di Jepang/AS: lewat Cell Broadcast + app + sistem publik. Naskah menjelaskan perbedaan ini.

## Angka kunci untuk HUD

| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| 5–8 km/s | Kecepatan gelombang P di kerak bumi | 1 |
| ±3,5 km/s | Kecepatan gelombang S di kerak bumi (±60% P) | 1 |
| 228 sensor | Jumlah sensor InaEEWS (akselerometer + intensity meter) | 3, 9 |
| 88,8% | Tingkat keberhasilan InaEEWS (143 gempa, 2022–2025) | 9 |
| 4 wilayah pilot | Jakarta, Banten, Jawa Barat, Lampung | 3, 4 |
| 98+ negara | Jangkauan Android Earthquake Alerts per 2025 | 5 |
| 11,4 juta | Peringatan Android saat gempa Venezuela 2026 | 5 |
| 2008 | InaTEWS (tsunami) operasional | — (pengetahuan umum) |
| 2025 | InaEEWS (gempa) mulai uji publik | 3, 4 |

## Poin kunci

- Dua mekanisme utama: (1) jaringan seismometer (EEW klasik — BMKG, ShakeAlert, Jepang) dan (2) crowdsource akselerometer ponsel (Google Android EEW). Keduanya punya blind zone dekat episenter.
- Indonesia punya dua sistem berbeda: InaTEWS (tsunami, operasional) dan InaEEWS (gempa, pilot). Publik sering bingung keduanya.
- Peringatan dini gempa BUKAN prediksi gempa. Gempa sudah terjadi; yang diperingatkan adalah guncangan yang belum sampai ke tempatmu.
- Payoff visual: animasi gelombang P mendahului S, ponsel berbunyi sebelum S tiba; lalu blind zone dekat episenter.
- Indonesia belum punya Cell Broadcast otomatis untuk gempa (berbeda dari Jepang). Peringatan masih lewat app (InaEEWS alpha). Ini koreksi penting dari klaim "ponsel berbunyi".
