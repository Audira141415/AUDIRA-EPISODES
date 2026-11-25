# SCRIPT — Cara Kerja QRIS (EP01)

Style: BONGKAR

Format: Short 9:16, BONGKAR 2D SVG studio abu (Remotion, tanpa R3F). Narator: Cartesia (`04b567df`), `lang: id`.
Channel: AUDIRA Explained (@AudiraExplained). VO menyebut "Audira" di outro (ditulis "Audira" agar Cartesia tidak mengeja huruf).

**Estimasi durasi:** 194 kata ≈ 78–86 dtk @135–150 WPM. **VO aktual (jeda > 0,6 dtk dipangkas ke 0,45 dtk):** 77,63 dtk → film 82,0 dtk (offset VO 0,3 dtk + outro 3,8 dtk).

## c00_hook — Hook (film 0:00–0:10.9)
- Kata: 26 · Visual: HP pembeli scan stand QRIS di warung, HP pedagang menyala "BERHASIL", tanda tanya rute.
> Kamu scan, ketik nominal, tekan bayar. Beberapa detik kemudian, HP pedagang berbunyi: pembayaran berhasil. Tapi, uangmu sebenarnya lewat mana?

## c01_context — Context (0:10.9–0:25.6)
- Kata: 34 · Visual: stand QRIS besar + kartu tanggal 17·08·2019 (BI + ASPI); flashback: dinding warung penuh QR berbeda, lalu menyatu jadi satu QRIS.
> Ini QRIS, standar QR nasional dari Bank Indonesia dan ASPI, diluncurkan tujuh belas Agustus dua ribu sembilan belas. Sebelumnya, tiap aplikasi punya QR sendiri, jadi warung harus memajang banyak kode berbeda.

## c02_main — Main development (0:25.6–0:34.6)
- Kata: 23 · Visual: pelat QR dibedah berlapis, tag EMVCo, baris data pedagang, tag NMID.
> Kotak hitam putih itu sebenarnya teks berformat EMVCo. Isinya identitas pedagang, termasuk NMID, nomor merchant nasional yang sama di semua aplikasi.

## c03_explanation — Explanation (0:34.6–0:57.6)
- Kata: 67 · Visual: paket data jalan dari HP → gedung ISSUER → hub GPN dengan 4 menara (Artajasa, Rintis, Jalin, Alto) → gedung ACQUIRER → stempel RC 00 → notifikasi HP pedagang.
> Saat kamu menekan bayar, aplikasimu mengirim perintah ke bank atau dompet digitalmu, yang disebut issuer. Issuer meneruskan perintah itu ke jalur Gerbang Pembayaran Nasional, lewat salah satu dari empat perusahaan switching: Artajasa, Rintis, Jalin, atau Alto. Switching mengantarnya ke acquirer, yaitu bank milik pedagang. Acquirer membalas kode nol nol, artinya berhasil, lalu mengirim notifikasi ke pedagang.

## c04_payoff — Visual payoff (0:57.6–1:11.7)
- Kata: 47 · Visual: lingkar rute berbendera merah-putih "DI DALAM NEGERI"; Isotype orang → 71,91 JT; ikon toko → 51,31 JT; label harga MDR 0%.
> Semua itu terjadi dalam hitungan detik, dan tetap di dalam negeri. Per Oktober dua ribu dua puluh enam, QRIS dipakai hampir tujuh puluh dua juta orang, di lebih dari lima puluh satu juta merchant. Dan sejak Oktober, transaksi usaha mikro sampai lima ratus ribu rupiah bebas biaya MDR.

## c05_outro — Outro (1:11.7–1:22.0)
- Kata: 17 · Visual: warung lagi, tiga busur pihak menyala, papan "AUDIRA EXPLAINED", lalu outro card AUDIRA (78,2–82,0).
> Jadi, setiap bunyi berhasil itu adalah kerja tiga pihak sekaligus. Ikuti Audira Explained untuk cara kerja benda sehari-hari lainnya.

Fakta: semua dari `research/SOURCE_REGISTER.md` (#1, #3, #5–#8, #10). Angka "2 detik" tidak dipakai.
