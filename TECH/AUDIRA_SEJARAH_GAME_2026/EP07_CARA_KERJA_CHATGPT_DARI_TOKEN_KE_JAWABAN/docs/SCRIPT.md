# Naskah — Cara Kerja ChatGPT: Dari Token ke Jawaban

> DRAF pra-produksi (backlog, 2026-11-25). Difinalkan di tahap 4 setelah style dipilih.
> Short: 190–210 kata @135–150 WPM.

## c00_hook — Hook

- Kata: **13** · estimasi **5 dtk**
- Visual: Layar gelap, kalimat ketikan 'halo, apa kabar' muncul di kotak chat; tiap huruf berubah jadi deretan angka yang jatuh ke bawah. Callout HUD: kata 'angka'.

> Kamu ngetik satu kalimat, tapi ChatGPT tidak membaca hurufnya. Ia cuma melihat angka.

## c01_intro — Intro

- Kata: **16** · estimasi **7 dtk**
- Visual: Jalur horizontal bergaya papan sirkuit: ketikan, token, model, jawaban, menyala berurutan. Teks AUDIRA tertulis di papan sirkuit.

> Di AUDIRA kita bedah jalurnya, dari ketikanmu sampai jawaban muncul. Langkah pertama: teks dipotong jadi token.

## c02 — Token: Teks Jadi Angka

- Kata: **45** · estimasi **19 dtk**
- Visual: Kalimat dipotong pisau cahaya jadi kepingan warna (kata utuh, setengah kata, tanda baca), tiap kepingan diberi nomor. HUD: '1 token ≈ 4 huruf', '2015'.

> Token itu potongan teks, bisa satu kata, setengah kata, atau tanda baca. Kira-kira satu token sama dengan empat huruf Inggris. Kata langka dipecah jadi potongan subkata, teknik yang diusulkan untuk penerjemahan mesin sejak 2015. Tiap potongan dapat nomor, dan nomor itulah yang masuk ke model.

## c03 — Transformer

- Kata: **28** · estimasi **12 dtk**
- Visual: Diagram blok Transformer bergaya blueprint dengan garis perhatian antar kata; delapan chip GPU menyala. HUD: '2017', '41,8 BLEU', '3,5 hari', '8 GPU'.

> Isi modelnya arsitektur Transformer, dari makalah delapan peneliti tahun 2017: Attention Is All You Need. Hasilnya skor terjemahan 41,8 BLEU, dilatih cuma tiga setengah hari di delapan GPU.

## c04 — Menebak Token Berikutnya

- Kata: **20** · estimasi **8 dtk**
- Visual: Rak server dan kata demi kata muncul berantai di layar, setiap kata baru lahir dari tebakan. HUD: '175 miliar parameter' (GPT-3).

> Tugasnya sederhana: menebak token berikutnya. Diulang satu token demi satu token sampai jadi jawaban. GPT-3 melakukannya dengan 175 miliar parameter.

## c05 — Dilatih Penilaian Manusia

- Kata: **28** · estimasi **12 dtk**
- Visual: Robot layanan membaca dua jawaban dan menunjuk yang lebih baik; timbangan menampilkan model kecil menang atas model besar. HUD: '1,3 miliar vs 175 miliar', '2022', '100x'.

> Model mentah belum tentu nurut. Jadi tahun 2022 OpenAI melatihnya dengan penilaian manusia. Hasilnya aneh: model 1,3 miliar parameter lebih disukai daripada GPT-3 yang seratus kali lebih besar.

## c06 — Penjelasan: Kenapa Bisa Salah

- Kata: **23** · estimasi **10 dtk**
- Visual: Kalender menyorot 30 November 2022; kotak chat menampilkan jawaban rapi bertanda tanya merah. HUD: '30 Nov 2022', 'pratinjau riset'.

> ChatGPT meluncur 30 November 2022 sebagai pratinjau riset. OpenAI sendiri mengakui, kadang jawabannya terdengar meyakinkan padahal salah. Saat pelatihan, tidak ada sumber kebenaran.

## c07_payoff — Payoff + outro

- Kata: **24** · estimasi **10 dtk**
- Visual: Rangkaian ringkas: ketik, angka, tebak, rangkai, dalam empat ikon; berakhir ke kartu outro AUDIRA.

> Jadi jawaban itu tidak dicari, tapi dirangkai token demi token. Ketik, jadi angka, ditebak, dirangkai. Itu seluruh triknya. Ikuti AUDIRA untuk bedah teknologi lainnya.

## Opsi hook lain

1. Kata yang kamu ketik ke ChatGPT dipotong-potong dulu sebelum dibaca. Ini caranya.
2. ChatGPT tidak mencari jawaban. Ia menebak, satu potongan kata sekali jalan.

## Total

- **197 kata** ≈ **79–88 dtk**
