# Naskah — Cara Kerja Radar Cuaca dan Kenapa Prediksi Masih Sering Meleset

> DRAF pra-produksi (backlog, 2026-11-25). Difinalkan di tahap 4 setelah style dipilih.
> Short: 190–210 kata @135–150 WPM.

## c00_hook — Hook

- Kata: **18** · estimasi **8 dtk**
- Visual: piringan radar raksasa berputar di tengah badai petir, gelombang mikro terpancar ke awan gelap

> Radar cuaca bisa melihat hujan dari ratusan kilometer. Tapi kenapa prakiraan besok masih sering salah? AUDIRA jelaskan.

## c01_intro — Intro

- Kata: **17** · estimasi **8 dtk**
- Visual: gelombang radio merambat dari antena parabola, memantul dari tetesan hujan, kembali ke penerima — diagram animasi sederhana

> Prinsipnya sederhana. Antena memancarkan pulsa gelombang radio, lalu menunggu pantulannya dari tetesan air di awan.

## c02 — Efek Doppler

- Kata: **28** · estimasi **12 dtk**
- Visual: ambulans mendekat lalu menjauh (sirene berubah pitch), lalu transisi ke gelombang radar mengenai hujan yang bergerak — pergeseran frekuensi divisualisasi sebagai warna

> Seperti sirene ambulans yang berubah nada saat mendekat dan menjauh, radar mengukur pergeseran frekuensi pantulan. Dari situ, ia tahu arah dan kecepatan gerakan hujan. Namanya efek Doppler.

## c03 — Peta Cuaca Real-Time

- Kata: **21** · estimasi **9 dtk**
- Visual: peta radar warna-warni (hijau-kuning-merah) berputar menunjukkan sebaran hujan; callout HUD "{158|seratus lima puluh delapan} unit radar" di AS

> Pantulan diolah jadi peta warna di aplikasi cuaca. Hijau gerimis, merah badai. Jaringan {NEXRAD|Neksrad} di Amerika punya {158|seratus lima puluh delapan} unit radar yang saling tumpang tindih.

## c04 — Dari Radar ke Prediksi

- Kata: **24** · estimasi **11 dtk**
- Visual: data radar mengalir ke superkomputer, persamaan matematika muncul berlapis-lapis di layar, globe atmosfer disimulasikan

> Tapi radar cuma melihat cuaca sekarang. Untuk memprediksi besok, data radar dimasukkan ke model matematika raksasa yang dijalankan superkomputer. Namanya prediksi cuaca numerik.

## c05 — Teori Chaos dan Efek Kupu-Kupu

- Kata: **33** · estimasi **15 dtk**
- Visual: kupu-kupu mengepak, lalu efek ripple membesar jadi badai — potret Lorenz muncul sebagai siluet, callout HUD "1963" dan "error ×2 tiap 5 hari"

> Tahun {1963|sembilan belas enam puluh tiga}, matematikawan Edward Lorenz menemukan sesuatu mengejutkan. Kesalahan sekecil apa pun di data awal akan berlipat ganda setiap lima hari. Seekor kupu-kupu mengepak di Brasil, secara teori, bisa mengubah cuaca di Texas. Ini disebut teori chaos.

## c06 — Batas Fundamental

- Kata: **28** · estimasi **12 dtk**
- Visual: grafik akurasi prediksi menurun tajam dari hari ke-1 sampai hari ke-14, garis putus-putus di "batas chaos" — callout HUD "maks ~14 hari"

> Artinya, prediksi akurat lebih dari dua minggu itu mustahil secara matematika — bukan karena teknologinya kurang canggih. Prakiraan satu sampai tiga hari memang cukup andal. Tapi makin jauh ke depan, makin besar ketidakpastiannya.

## c07_payoff — Payoff dan Penutup

- Kata: **24** · estimasi **10 dtk**
- Visual: radar berputar di satu sisi, kupu-kupu di sisi lain — keduanya menyatu jadi globe bumi, lalu transisi ke outro card AUDIRA

> Jadi radar itu mata cuaca: melihat sekarang. Model numerik itu otaknya: menebak besok. Dan chaos adalah alasan otak itu punya batas. Alam semesta memang tidak suka ditebak.

## Opsi hook lain

1. "Tahun 1963, seorang matematikawan membuktikan bahwa cuaca tidak bisa diprediksi lebih dari dua minggu. Alasannya? Seekor kupu-kupu."
2. "Radar cuaca bisa mendeteksi hujan 200 kilometer jauhnya. Tapi menebak hujan besok di kotamu? Itu masalah yang jauh lebih sulit."

## Total

- **210 kata** ≈ **84–93 dtk** @135–150 WPM
- 8 blok: hook, intro, 5 chapter, payoff + outro.
- End screen 20 dtk terakhir menimpa CTA + outro card AUDIRA.
