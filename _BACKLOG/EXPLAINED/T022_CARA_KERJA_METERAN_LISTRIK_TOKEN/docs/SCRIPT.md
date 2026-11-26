# Naskah — Cara Kerja Meteran Listrik Token

> DRAF pra-produksi (backlog, 2026-11-26). Difinalkan di tahap 4 setelah style dipilih.
> Short: 190–210 kata @135–150 WPM.

## c00_hook — Hook

- Kata: **18** · estimasi **8 dtk**
- Visual: Close-up keypad meteran prabayar generik (tanpa logo), jari mengetik; 20 angka menyala satu per satu di LCD lalu berubah jadi amplop bersegel. HUD chip: "20 digit" (#12).

> Dua puluh angka yang kamu ketik di meteran listrik itu ternyata pesan rahasia. Hanya meteranmu yang bisa membacanya.

## c01_intro — Intro

- Kata: **31** · estimasi **13 dtk**
- Visual: Uang kertas generik masuk kasir minimarket generik, berubah jadi tumpukan blok energi "kWh"; potongan kecil terpisah berlabel "pajak & meterai". HUD callout: "Rp1.444,70 / kWh · 1.300 VA · per triwulan III 2026" (#11, #15).

> Saat kamu beli token, uangmu diubah dulu jadi kilowatt jam. Per triwulan ketiga 2026, rumah seribu tiga ratus VA bayar sekitar seribu empat ratus empat puluh lima rupiah per kilowatt jam.

## c02 — Dikemas dan dikunci

- Kata: **36** · estimasi **15 dtk**
- Visual: Ruang server generik; blok-blok data dirakit jadi satu batang: "jumlah kWh", "cap waktu", "kode cek". HUD: "66 bit" (#2). Batang masuk gembok; kunci gembok dibentuk dari nomor meter (angka disamarkan) + kunci rahasia (ikon kunci tanpa logo) (#3, #4).

> Di sistem penjualan, jumlah kilowatt jam itu dikemas bersama cap waktu dan kode pemeriksa jadi enam puluh enam bit data. Lalu semuanya dienkripsi pakai kunci khusus, yang diracik dari nomor meteranmu dan kunci rahasia penyedia listrik.

## c03 — Jadi 20 angka

- Kata: **21** · estimasi **9 dtk**
- Visual: Batang bit terkunci "dicetak" jadi 20 angka acak di struk kertas generik, lalu terbang ke layar HP (notifikasi tanpa logo). HUD: "66 bit → 20 digit" (#2, #16).

> Hasil enkripsinya diubah jadi dua puluh angka, supaya gampang dicetak di struk atau dikirim lewat pesan. Kelihatannya acak, padahal isinya rapi.

## c04 — Di dalam meteran

- Kata: **24** · estimasi **10 dtk**
- Visual: Cutaway meteran generik: keypad, chip, memori berisi ikon kunci. Ikon "tanpa sinyal" (tidak ada koneksi). Amplop dibuka di chip, kode cek centang hijau, angka saldo kWh di LCD naik. HUD: "+0,1 kWh per langkah" (#5, #3, #7).

> Meteranmu menyimpan kunci yang sama di dalamnya. Tanpa internet, ia membuka pesan itu sendiri, mengecek kodenya, lalu menambah saldo, hitungannya per sepersepuluh kilowatt jam.

## c05 — Kenapa tak bisa dipakai orang lain

- Kata: **27** · estimasi **11 dtk**
- Visual: Split-screen dua rumah generik bersebelahan. Token yang sama diketik di meteran tetangga: amplop gagal terbuka, LCD "REJECT" (#1, #12). Kembali ke meteran sendiri, token diketik ulang: stempel "sudah dipakai" pada cap waktu (#1, #16).

> Kalau token itu diketik di meteran tetangga, kuncinya beda, hasilnya berantakan, langsung ditolak. Dipakai dua kali juga gagal, karena meteran mencatat cap waktu token yang sudah masuk.

## c06 — Standar dunia

- Kata: **25** · estimasi **11 dtk**
- Visual: Timeline 1993 (peta Afrika generik menyala), lalu globe berputar dengan titik-titik menyala; counter "75 juta meter" dan "100 negara"; chip teks "IEC 62055-41" (#1, #6, #7). Tanpa logo organisasi.

> Aturan mainnya dibuat di Afrika Selatan tahun 1993, sekarang jadi standar internasional bernama STS. Lebih dari tujuh puluh lima juta meter di seratus negara memakainya.

## c07_payoff — Payoff + outro

- Kata: **22** · estimasi **9 dtk**
- Visual: Struk dilipat jadi amplop bersegel, melayang masuk ke meteran milik satu rumah; lampu rumah menyala hangat. Outro card AUDIRA.

> Jadi, dua puluh angka di struk itu sebenarnya surat tersegel untuk satu meteran saja. Ikuti Audira untuk cara kerja benda sehari-hari lainnya.

## Opsi hook lain

1. Token listrik yang kamu beli tidak bisa dipakai tetangga, walau angkanya kamu kasih langsung. Kenapa?
2. Meteran token di rumahmu tidak tersambung internet, tapi tahu persis token mana yang asli.

## Total

- **204 kata** ≈ **86 dtk** (@142 WPM; 82–91 dtk di 135–150 WPM)
