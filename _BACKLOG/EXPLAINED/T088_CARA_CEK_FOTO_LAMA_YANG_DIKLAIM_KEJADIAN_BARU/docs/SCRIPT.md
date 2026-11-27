# Naskah — Cara Cek Foto Lama yang Diklaim Kejadian Baru

> DRAF pra-produksi (backlog, 2026-11-27). Difinalkan di tahap 4 setelah style dipilih.
> Short: 190–210 kata @135–150 WPM.

## c00_hook — Hook

- Kata: **16** · estimasi **7 dtk**
- Visual: Layar HP menampilkan foto banjir generik yang di-forward di grup chat. Stempel merah "2024" berubah jadi "2021" saat kamera zoom in. HUD chip: "foto lama = berita baru?"

> Foto banjir ini viral hari ini di grupmu. Padahal, foto itu sudah tiga tahun. Ini Audira.

## c01_intro — Jawaban Pertama

- Kata: **22** · estimasi **10 dtk**
- Visual: Browser terbuka, gambar diseret ke kolom pencarian Google. Hasil muncul: foto yang sama dari artikel berita bertanggal lama. HUD callout: "reverse image search" dengan ikon kaca pembesar. (#1, #8)

> Cara paling cepat: seret foto itu ke Google Lens. Dalam detik, kamu bisa lihat kapan dan di mana foto itu pernah muncul.

## c02 — TinEye: Lacak Asal-Usul

- Kata: **30** · estimasi **13 dtk**
- Visual: Halaman TinEye, gambar diunggah, hasil muncul diurutkan "oldest first". Timeline bar menunjukkan kemunculan paling awal. HUD callout besar: "77,6 miliar gambar terindeks" (#2).

> Alat kedua: TinEye. Mesin ini mengindeks lebih dari tujuh puluh tujuh miliar gambar. Unggah foto, urutkan dari yang paling lama. Kalau foto itu muncul di berita tahun lalu, klaimnya gugur.

## c03 — Cek Metadata Exif

- Kata: **40** · estimasi **17 dtk**
- Visual: Foto diperbesar, panel Exif terbuka di samping: tanggal, model kamera, koordinat GPS muncul satu per satu. Lalu stempel "EXIF DIHAPUS" menutup panel saat ikon WhatsApp/medsos muncul. (#3, #10)

> Langkah ketiga: cek metadata Exif. Setiap foto dari kamera menyimpan tanggal, model kamera, bahkan koordinat GPS. Tapi WhatsApp, Instagram, dan hampir semua platform menghapus data ini saat gambar dikirim. Jadi Exif hanya berguna kalau kamu punya file asli dari kamera.

## c04 — Deteksi Editan

- Kata: **33** · estimasi **14 dtk**
- Visual: Foto diproses ELA, area yang diedit menyala terang berbeda dari area asli. Layar split: foto asli vs hasil ELA. Label "FotoForensics.com". (#5)

> Curiga fotonya diedit? Teknik Error Level Analysis bisa memperlihatkan bagian gambar yang ditempel atau diubah. Alat seperti FotoForensics menyorot area mencurigakan. Tapi ini bukan bukti pasti: foto yang disimpan ulang berkali-kali mengaburkan hasilnya.

## c05 — Batasan: Foto AI

- Kata: **34** · estimasi **15 dtk**
- Visual: Foto realistis buatan AI muncul di layar. Semua alat sebelumnya "gagal" (ikon silang). Lalu muncul logo C2PA / Content Credentials. HUD: "batas teknik: foto AI" (#6).

> Satu batasan. Semua teknik tadi untuk foto asli yang diklaim ulang. Kalau gambar sepenuhnya dibuat AI, reverse image search tidak menemukan sumbernya. Standar baru Content Credentials sedang dikembangkan: jejak digital tertanam sejak gambar dibuat.

## c06_payoff — Payoff + Outro

- Kata: **34** · estimasi **15 dtk**
- Visual: Checklist animasi: (1) reverse image search, (2) sort oldest, (3) cek Exif, (4) ELA. Checklist berubah jadi tameng digital. Zoom out ke layar HP awal — foto banjir sekarang bertanda "TERVERIFIKASI: 2021". Outro card AUDIRA.

> Sebelum teruskan foto viral: seret ke Google, cek di TinEye, periksa Exif kalau file aslinya ada. Tiga langkah yang bisa menghentikan satu hoaks menyebar lebih jauh. Foto itu mungkin nyata, tapi ceritanya belum tentu.

## Opsi hook lain

1. "Tujuh puluh tujuh miliar gambar sudah diindeks TinEye. Kalau foto viral itu memang baru, seharusnya tidak muncul di sana."
2. "Grup WhatsApp-mu penuh foto yang diklaim baru. Tiga langkah ini bisa membuktikan yang mana bohong."
3. "Misinformasi visual adalah risiko global nomor satu menurut World Economic Forum. Tapi kamu bisa melawannya dari HP."

## Total

- **209 kata** ≈ **91 dtk**
