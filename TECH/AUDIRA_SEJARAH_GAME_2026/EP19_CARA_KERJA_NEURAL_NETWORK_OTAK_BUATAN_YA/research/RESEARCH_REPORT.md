# Research Report — Cara Kerja Neural Network: Otak Buatan yang Menggerakkan AI

Tanggal riset: 2026-11-25. Pengecekan lewat Crossref dan arXiv API (WebSearch tidak dipakai).

## Sumber utama
Lihat SOURCE_REGISTER.md (#1-#7): 6 HIGH (makalah primer), 1 MEDIUM (studi jurnal Wiley, MEDIUM karena hasil berupa estimasi rata-rata).

## Fakta terverifikasi
1. McCulloch dan Pitts (1943) menerbitkan model logis neuron sederhana, dasar neuron buatan. [#1]
2. Rosenblatt (1958) mengusulkan perceptron, jaringan yang menyesuaikan diri dari contoh. [#2]
3. Rumelhart, Hinton, Williams (Nature, 1986) memaparkan backpropagation: bobot disesuaikan berulang untuk memperkecil selisih keluaran dengan target. [#3]
4. AlexNet: 60 juta parameter, 650.000 neuron, mengklasifikasi 1,2 juta gambar ke 1000 kelas; error top-5 17,0% pada data uji ImageNet LSVRC-2010. [#4]
5. GPT-3 punya 175 miliar parameter. [#5]
6. Transformer (2017) hanya memakai mekanisme attention, tanpa rekurensi dan konvolusi. [#6]
7. Otak manusia dewasa pria rata-rata 86,1 miliar neuron (bukan 100 miliar). [#7]

## Perselisihan / Kontroversi
- Hook TOPIC.md "miliaran parameter yang belajar sendiri" kurang tepat: parameter tidak "belajar sendiri", melainkan disetel lewat pelatihan dengan data dan fungsi error buatan manusia. Naskah memakai "disetel lewat contoh".
- Analogi "otak buatan" menyesatkan: neuron buatan hanyalah rumus penjumlahan bertimbang, jauh lebih sederhana dari neuron biologis. Perbandingan parameter vs neuron otak (175 miliar vs 86 miliar) bukan setara; parameter lebih mirip sinapsis. Naskah tidak menyatakan keduanya setara.
- Jumlah parameter model terbaru tidak dipublikasikan; naskah hanya memakai GPT-3 (2020).

## Angka kunci untuk HUD
| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| 1943 | Neuron buatan pertama | 1 |
| 1958 | Perceptron | 2 |
| 1986 | Backpropagation | 3 |
| 60 juta parameter / 650.000 neuron | AlexNet | 4 |
| 1,2 juta gambar | Data latih AlexNet | 4 |
| 2017 | Transformer | 6 |
| 175 miliar parameter | GPT-3 (2020) | 5 |
| 86,1 miliar neuron | Otak manusia (rata-rata) | 7 |

## Poin kunci
- Neuron buatan = kalikan input dengan bobot, jumlahkan, lewat fungsi aktivasi.
- Belajar = tebak, ukur error, geser bobot sedikit (backpropagation), ulangi jutaan kali.
- Skala 60 juta ke 175 miliar parameter dalam 8 tahun.
- Angka dan nama model: tulis "per 2026-11-25" bila menyangkut model terbaru.
