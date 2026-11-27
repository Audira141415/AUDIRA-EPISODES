# Naskah — Cara Kerja Indeks Kualitas Udara

> DRAF pra-produksi (backlog, 2026-11-27). Difinalkan di tahap 4 setelah style dipilih.
> Short: 190–210 kata @135–150 WPM.

## c00_hook — Hook

- Kata: **13** · estimasi **6 dtk**
- Visual: Layar ponsel generik menampilkan angka "154" berwarna merah menyala, lalu berubah ke "43" hijau. Kamera zoom out, ponsel mengecil, kota dengan kabut tipis di latar. Teks besar frame 0: "Angka ini artinya apa?"

> Angka berwarna di aplikasi cuaca itu bukan tebakan. Satu angka, merangkum enam pencemar udara sekaligus.

## c01_intro — Jawaban pertama: cara kerja

- Kata: **24** · estimasi **10 dtk**
- Visual: Infografis stasiun pemantau udara generik (kotak sensor di atas tiang, tanpa logo). Enam jalur keluar dari stasiun berlabel ikon: PM2.5, PM10, O₃, CO, SO₂, NO₂ (#1, #9). HUD: "6 pencemar → 1 angka."

> Stasiun pemantau mengukur enam zat sekaligus: partikel halus, ozon, karbon monoksida, sulfur dioksida, dan nitrogen dioksida. Masing-masing punya konsentrasi berbeda, tapi yang muncul di layar cuma satu angka.

## c02 — Dari konsentrasi ke angka

- Kata: **28** · estimasi **12 dtk**
- Visual: Tabel breakpoint sederhana (2–3 baris) muncul; satu angka konsentrasi PM2.5 menyala, garis penghubung ke dua batas terdekat. Animasi interpolasi linier: titik bergerak di garis antara dua breakpoint, angka indeks naik. HUD: rumus singkat "Ip = interpolasi" (#4).

> Konsentrasi tiap pencemar dicocokkan ke tabel batas, lalu dihitung pakai rumus interpolasi, menentukan posisi di antara dua titik. Hasilnya: satu angka per pencemar. Yang paling tinggi jadi angka hari itu.

## c03 — ISPU Indonesia

- Kata: **29** · estimasi **12 dtk**
- Visual: Lima kartu warna ISPU muncul berurutan: hijau "Baik 0–50", kuning "Sedang 51–100", oranye "Tidak Sehat 101–199", merah "Sangat Tidak Sehat 200–299", maroon "Berbahaya 300–500" (#1). Label: "ISPU — 5 kategori." Bendera Indonesia kecil di sudut.

> Di Indonesia, sistemnya disebut ISPU, Indeks Standar Pencemar Udara. Lima kategori: Baik, Sedang, Tidak Sehat, Sangat Tidak Sehat, dan Berbahaya. Dasar hukumnya PP dua puluh dua tahun 2021.

## c04 — Bedanya dengan AQI AS

- Kata: **26** · estimasi **11 dtk**
- Visual: Di sisi kiri 5 kartu ISPU, di sisi kanan 6 kartu AQI AS (tambahan: oranye "USG" di tengah + ungu "Very Unhealthy") (#3). Panah menunjukkan perbedaan jumlah. HUD: "ISPU ≠ AQI." Di bawah: label "breakpoint beda → angka 100 artinya beda."

> Amerika pakai AQI dengan enam kategori dan breakpoint berbeda. Angka seratus di ISPU dan seratus di AQI artinya tidak sama. Platform swasta seperti IQAir biasanya pakai skala AQI AS, bukan ISPU.

## c05 — Kenapa penting

- Kata: **24** · estimasi **10 dtk**
- Visual: Siluet paru-paru generik, partikel kecil melayang masuk. HUD counter: "4,2 juta kematian dini / tahun" (#5). Potong ke standar WHO: "PM2.5 ≤ 5 µg/m³" (#6). Callout: "30× lebih kecil dari rambut."

> PM dua koma lima, partikel tiga puluh kali lebih kecil dari rambut, bisa masuk sampai paru-paru. WHO mencatat empat koma dua juta kematian dini per tahun akibat polusi udara.

## c06 — Apa yang bisa kamu lakukan

- Kata: **21** · estimasi **9 dtk**
- Visual: Ponsel generik menampilkan angka ISPU. Tiga ikon muncul: masker, jendela tertutup, tanaman indoor. Angka berubah dari merah ke kuning, lalu ke hijau seiring waktu.

> Cek ISPU sebelum aktivitas luar. Kalau di atas seratus, kurangi kegiatan berat di luar. Dan pastikan data yang kamu baca pakai skala ISPU, bukan AQI.

## c07_payoff — Payoff + outro

- Kata: **19** · estimasi **8 dtk**
- Visual: Kembali ke layar ponsel dari hook: angka "154" merah kini punya label "Tidak Sehat — ISPU." Zoom out ke langit bersih. Outro card AUDIRA.

> Jadi satu angka berwarna itu bukan sekadar hiasan. Itu ringkasan udara yang kamu hirup hari ini. Ini Audira.

## Opsi hook lain

1. Merah, kuning, hijau — angka kualitas udara itu dihitung dari enam zat yang kamu hirup tanpa sadar.
2. Satu angka. Enam pencemar. Begini cara kerjanya.

## Total

- **204 kata** ≈ **85 dtk** (@144 WPM; 82–91 dtk di 135–150 WPM)
