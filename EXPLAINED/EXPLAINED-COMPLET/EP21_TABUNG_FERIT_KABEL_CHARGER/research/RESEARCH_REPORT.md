# Research Report — EP21 Tabung Ferit di Kabel Charger

Riset 2026-11-13. Nomor `#n` merujuk ke tabel fakta di `SOURCE_REGISTER.md`.

## Ringkasan inti

Tabung atau benjolan di dekat ujung kabel charger laptop, monitor, atau kabel data adalah **ferrite bead / ferrite choke** (#1). Isinya bukan rangkaian, hanya cincin keramik ferit: oksida besi yang dicampur nikel, seng, atau mangan (#3–4). Tebakan populer seperti "baterai kecil", "penunda data", atau "sekring" sudah dibantah (#2).

Masalah yang diatasi: kabel panjang adalah antena tak sengaja. Ia bisa memancarkan derau dari perangkat, atau menangkap derau dari alat lain (#5). Charger modern adalah catu daya switching yang menyala-mati pada ratusan kHz sampai MHz, sehingga menghasilkan energi frekuensi tinggi yang harus ditahan (#16). Regulasi seperti aturan FCC 1979 membatasi emisi ini (#15), dan ferit adalah salah satu cara termurah untuk lolos (#17–18).

Kuncinya **common-mode**. Arus pengisian mengalir pergi dan pulang di dua kawat dengan arah berlawanan, sehingga fluks magnetnya saling meniadakan dan ferit hampir tidak menghambat (#9). Derau yang memakai kabel sebagai antena mengalir searah di kedua kawat; fluksnya menumpuk di ferit dan menimbulkan impedansi tinggi. Karena ferit "lossy" pada frekuensi tinggi, energi itu berubah jadi panas yang sangat kecil (#6–7, #9).

## Cara kerja langkah demi langkah

| Tahap | Mekanisme | Fakta |
|---|---|---|
| 1 | Charger switching menghasilkan derau frekuensi tinggi | #16 |
| 2 | Derau merambat di kabel; kabel bertindak sebagai antena | #5 |
| 3 | Arus kerja (diferensial) lewat ferit: fluks saling meniadakan, impedansi kecil | #9 |
| 4 | Derau common-mode (searah): fluks menumpuk di inti ferit | #9 |
| 5 | Ferit lossy pada frekuensi tinggi: energi derau jadi panas kecil | #6–8 |
| 6 | Kabel tidak lagi memancarkan/menangkap derau secara berarti | #5, #17 |

## Sejarah singkat

- 1930: Yogoro Kato dan Takeshi Takei (Tokyo Institute of Technology) mensintesis ferit pertama (#12).
- 7 Des 1935: TDK didirikan untuk memproduksi ferit (#13); sampai 1945 membuat ±5 juta inti untuk radio (#14, MED).
- 1979: FCC mewajibkan batas emisi untuk perangkat digital (#15, MED).

## Miskonsepsi yang dibantah

- "Itu baterai/akumulator kecil": salah (#2).
- "Itu menunda sebagian data supaya bisa dicek": salah (#2).
- "Itu sekring pelindung lonjakan listrik": salah (#2).
- "Ada chip atau rangkaian di dalamnya": tidak, hanya keramik ferit (#1, #3).

## Angka untuk visual payoff

- 1930 → 1935: penemuan ferit lalu berdirinya TDK (#12–13), HIGH.
- "Ratusan ribu kali per detik": frekuensi pensaklaran charger (#16), MED, dipakai dengan kata "bisa".
- Dua arus berlawanan saling meniadakan vs derau searah yang menumpuk (#9): momen visual terkuat.

## Catatan naskah

- Jangan sebut jumlah lilitan pasti (#10 selisih 2–3 vs 5–7).
- 10–100 MHz, 10 dB, dan 5 juta inti hanya satu sumber; tidak dipakai.
- Jangan klaim panasnya terasa; panasnya sangat kecil (#7).
- Ejaan fonetik: TDK = "te-de-ka", SUTET = "su-tet".
- Ide visual 3D: kabel charger transparan dengan dua aliran partikel berlawanan (pergi dan pulang) yang lingkaran medan magnetnya saling hapus; derau berupa riak searah yang tertahan di cincin ferit lalu memudar menjadi pendar panas. Cangkang plastik clamp-on terbuka seperti kerang menampakkan cincin abu-abu gelap.
