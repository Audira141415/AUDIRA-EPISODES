# Research Report — Cara Kerja Radar Cuaca dan Kenapa Prediksi Masih Sering Meleset

## Sumber utama

- **Lorenz 1963** (#6): paper "Deterministic Nonperiodic Flow" di Journal of the Atmospheric Sciences — dasar teori chaos dan batas prediksi cuaca.
- **Wikipedia: Weather radar** (#1, #8): prinsip pulse-Doppler, sejarah dari PD II, panjang gelombang S-band/C-band.
- **Wikipedia: Numerical weather prediction** (#4, #9): NWP sejak 1950 (ENIAC), forecast skill ~6 hari, batas teoritis ~14 hari, error doubling time ~5 hari.
- **Wikipedia: NEXRAD** (#3): jaringan 158 unit radar WSR-88D di AS.
- **Wikipedia: Edward Lorenz** (#5): biografi, penemuan chaos, efek kupu-kupu.

## Fakta terverifikasi

1. Radar cuaca memancarkan pulsa gelombang mikro yang memantul dari tetesan air/es di atmosfer, lalu mengukur waktu pantulan dan pergeseran frekuensi Doppler (#1, #2).
2. Panjang gelombang radar cuaca: S-band 10 cm (jarak jauh, mahal), C-band 5 cm (lebih murah, atenuasi lebih cepat), X-band 3 cm (jarak pendek saja) (#1).
3. Pergeseran Doppler pada radar cuaca sangat kecil (~0,1 ppm pada λ = 10 cm), dideteksi lewat perbedaan fase antar-pulsa, bukan perubahan frekuensi langsung (#1, #2).
4. Radar cuaca ditemukan secara tidak sengaja selama PD II: operator radar militer melihat gema cuaca yang menutupi target musuh (#8).
5. Jaringan NEXRAD (WSR-88D) AS: 158 unit radar, instalasi pertama operasional 12 Juni 1992 di Sterling, Virginia (#3).
6. Prediksi cuaca numerik pertama kali berhasil 1950 (ENIAC), operasional pertama 1954 (Rossby, SMHI Swedia) (#9).
7. Lorenz menerbitkan "Deterministic Nonperiodic Flow" (1963): membuktikan bahwa sistem atmosfer sangat sensitif terhadap kondisi awal (#5, #6).
8. Kesalahan kecil dalam kondisi awal berlipat ganda setiap ~5 hari; batas akurasi teoritis ~14 hari bahkan dengan model sempurna dan data sempurna (#4).
9. Forecast skill model NWP operasional saat ini: sekitar 6 hari (#9).
10. Efek kupu-kupu (Lorenz, 1972): "kupu-kupu mengepak di Brasil bisa memicu tornado di Texas" — metafora sensitivitas kondisi awal (#7).

## Perselisihan / Kontroversi

- **Judul/hook**: "Kenapa Prediksi Masih Sering Meleset" — prakiraan jangka pendek (1–3 hari) sebenarnya cukup akurat. Yang sulit adalah jangka menengah-panjang (>5 hari). Judul tetap valid karena membahas keterbatasan fundamental, bukan menyatakan bahwa semua prakiraan salah. **Koreksi**: naskah harus menekankan bahwa prakiraan jangka pendek andal, dan "meleset" terjadi makin sering seiring bertambahnya horizon waktu.

## Angka kunci untuk HUD

| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| 10 cm (S-band) | panjang gelombang radar cuaca utama | #1 |
| 158 unit | jumlah radar NEXRAD di AS | #3 |
| 1963 | tahun paper Lorenz "Deterministic Nonperiodic Flow" | #5, #6 |
| ~5 hari | waktu error berlipat ganda | #4 |
| ~14 hari | batas teoritis akurasi prediksi | #4 |
| ~6 hari | forecast skill operasional NWP saat ini | #9 |
| 0,1 ppm | pergeseran Doppler pada λ = 10 cm | #1 |

## Poin kunci

1. Radar cuaca bekerja dengan prinsip sederhana: pancarkan gelombang mikro, tunggu pantulan, ukur jarak dan kecepatan hujan lewat efek Doppler.
2. Meski radar makin canggih (dual-polarization, phased array), ia hanya mengukur apa yang terjadi SEKARANG — tidak memprediksi masa depan.
3. Prediksi cuaca bergantung pada model numerik (NWP) yang memecahkan persamaan diferensial atmosfer di superkomputer.
4. Teori chaos Lorenz (1963) menunjukkan batas fundamental: kesalahan kecil tumbuh eksponensial, membuat prediksi akurat >2 minggu mustahil secara prinsip.
5. Ini bukan soal teknologi yang kurang maju — ini batas matematika alam semesta. Bahkan dengan sensor sempurna dan komputer tak terbatas, atmosfer tetap chaotic.
6. Sudut naskah yang kuat: radar = mata cuaca (melihat sekarang), model NWP = otak cuaca (menebak besok), chaos = alasan otak itu punya batas ingatan.
