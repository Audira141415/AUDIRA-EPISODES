# Research Report — Cara Kerja ChatGPT: Dari Token ke Jawaban

Dibaca 2026-11-25. Rujukan nomor = kolom # di `SOURCE_REGISTER.md`.

## Sumber utama
- Makalah Transformer (arXiv 1706.03762), InstructGPT (2203.02155), GPT-3 (2005.14165), BPE subword (1508.07909).
- Halaman peluncuran ChatGPT OpenAI (30 Nov 2022) dan Help Center OpenAI tentang token.

## Fakta terverifikasi
1. Transformer (2017) hanya memakai mekanisme attention, tanpa recurrence dan konvolusi; 28,4 BLEU EN-DE dan 41,8 BLEU EN-FR setelah 3,5 hari di 8 GPU; 8 penulis. [1]
2. Kata langka dapat dikodekan sebagai urutan subword units (byte pair encoding) untuk penerjemahan mesin; diusulkan 2015, terbit ACL 2016. [2]
3. GPT-3 adalah model bahasa autoregresif 175 miliar parameter, diuji few-shot. [3]
4. InstructGPT memakai RLHF; keluaran model 1,3 miliar parameter lebih disukai daripada GPT-3 175 miliar. [4]
5. ChatGPT diumumkan 30 Nov 2022 sebagai research preview gratis, dilatih dengan RLHF seperti InstructGPT; OpenAI menyebut keterbatasan jawaban masuk akal tapi salah. [5]
6. Rule of thumb OpenAI: 1 token ≈ 4 karakter ≈ 0,75 kata (Inggris). [6]

## Perselisihan / Kontroversi
- Hook TOPIC.md ("Setiap kata diubah jadi angka") kurang akurat: yang jadi angka adalah token (potongan kata, kadang setengah kata atau tanda baca), bukan kata utuh. Koreksi dipakai di naskah.
- Sumber yang dibaca tidak merinci tokenizer ChatGPT yang dipakai, jadi naskah tidak menyebut BPE sebagai tokenizer ChatGPT, hanya sebagai teknik subkata dari penelitian 2015.
- Ukuran, data, dan biaya pelatihan ChatGPT tidak diumumkan di sumber yang dibaca: tidak dinarasikan.
- Narasi "dilatih manusia" disederhanakan: RLHF juga memakai model reward dan reinforcement learning, bukan hanya penilaian manusia langsung.

## Angka kunci untuk HUD
| Angka/tahun/nama | Konteks | # |
|---|---|---|
| 1 token ≈ 4 huruf | Perkiraan Inggris, per 2026-11-25 | 6 |
| 2015 | BPE subword diusulkan untuk NMT | 2 |
| 2017 | Makalah Transformer, 8 penulis | 1 |
| 41,8 BLEU | EN-FR, 3,5 hari, 8 GPU | 1 |
| 175 miliar | Parameter GPT-3 | 3 |
| 1,3 miliar vs 175 miliar | InstructGPT vs GPT-3, 100x lebih kecil | 4 |
| 30 Nov 2022 | Peluncuran ChatGPT, research preview | 5 |

## Poin kunci
- Alur: teks, token, nomor, Transformer, tebak token berikutnya, diulang.
- RLHF membuat model menurut instruksi; ukuran bukan segalanya.
- ChatGPT bisa salah dengan meyakinkan; OpenAI mengakuinya.
- Topik bertahan lama (arsitektur), kecuali nama model dan rekor.
