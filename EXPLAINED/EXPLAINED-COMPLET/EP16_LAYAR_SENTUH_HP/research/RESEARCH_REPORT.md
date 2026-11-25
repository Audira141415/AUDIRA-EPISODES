# Research Report — EP16 Layar Sentuh HP

Riset 2026-11-13. Nomor `#n` merujuk ke tabel fakta di `SOURCE_REGISTER.md`.

## Ringkasan inti

Layar HP modern adalah layar sentuh **kapasitif proyeksi** (projected capacitive). Kacanya adalah isolator yang dilapisi konduktor bening, biasanya indium tin oxide (ITO). Tubuh manusia menghantarkan listrik, jadi jari yang mendekat mengganggu medan listrik di bawah kaca. Gangguan itu terukur sebagai perubahan kapasitansi (#1, #3). Ini berbeda dari layar resistif lama, yang bekerja dengan tekanan: dua lapisan ditekan sampai bersentuhan (#2).

Lapisan ITO diukir menjadi grid baris dan kolom (#6). Pada skema **mutual capacitance**, setiap persilangan baris dan kolom adalah satu kapasitor kecil (#7). Chip pengendali mengirim denyut tegangan ke satu baris bergantian dan membaca sinyal di semua kolom (#8). Jari "mencuri" sebagian medan, sehingga kapasitansi di persilangan itu **turun** (#9). Karena setiap persilangan diukur, banyak jari bisa dilacak sekaligus (#10). Skema self capacitance sinyalnya lebih kuat tetapi sulit membedakan dua jari, jadi banyak HP memakai keduanya (#11).

Akibat praktis: sarung tangan tebal gagal karena bahannya isolator, sedangkan sarung tangan medis tipis masih bisa (#12). Sedikit air dapat mengacaukan deteksi (#13, MED). Sejarahnya: Eric Johnson di Malvern menulis tentang layar sentuh kapasitif pada 1965 (#18, MED). Bent Stumpe dan Frank Beck di CERN mengembangkannya untuk ruang kendali akselerator SPS pada 1972–1976 (#15). Multi-touch kapasitif masuk arus utama lewat iPhone 2007 (#20).

## Cara kerja langkah demi langkah

| Tahap | Mekanisme | Fakta |
|---|---|---|
| 1 | Kaca pelindung (isolator) di atas lapisan ITO bening | #1, #3, #21 |
| 2 | ITO diukir jadi grid baris (pemancar) dan kolom (penerima) | #6, #8 |
| 3 | Tiap persilangan = kapasitor kecil | #7, #14 |
| 4 | Chip mengirim denyut ke baris satu per satu, membaca semua kolom | #8, #23 |
| 5 | Jari mendekat → sebagian medan tertarik ke tubuh → kapasitansi persilangan turun | #9 |
| 6 | Chip memetakan persilangan yang berubah → koordinat sentuhan, bisa banyak titik | #10 |
| 7 | Isolator tebal (sarung tangan) memutus efek; air bisa menipu sensor | #12, #13 |

## Sejarah singkat

| Tahun | Peristiwa | Ref |
|---|---|---|
| 1965 / 1967 | E. A. Johnson, Royal Radar Establishment, artikel layar sentuh kapasitif | #18 |
| 11 Mar 1972 | Catatan tangan Bent Stumpe di CERN | #15 |
| 1973 | Kapasitor uji pertama; laporan Beck & Stumpe | #15 |
| 1976 | Ruang kendali SPS penuh layar sentuh (S4) | #15, #17 |
| 1977/1978 | Layar X-Y CERN (S1: 1977; S4: setelah 1978) | #17 |
| 1982 | Layar resistif Elographics di World's Fair Knoxville | #19 |
| 2007 | iPhone; multi-touch kapasitif arus utama | #20 |

## Miskonsepsi yang dibantah

- "Layar HP mendeteksi tekanan." Salah untuk layar kapasitif: yang diukur perubahan medan listrik, bukan gaya tekan (#1, #9). Tekanan hanya relevan di layar resistif (#2). Catatan: beberapa HP pernah punya sensor gaya terpisah; jangan bilang "tidak ada HP yang bisa merasakan tekanan".
- "Layar sentuh menemukan jari karena panas tubuh." Tidak ada sumber yang menyebut panas; mekanismenya kapasitansi (#1).
- "Sentuhan menambah listrik ke layar." Pada mutual capacitance kapasitansi justru turun (#9).

## Angka untuk visual payoff

- Grid 12 × 16 = **192** titik ukur (#14). Visual: garis baris dan kolom menyala, 192 titik bersinar, satu titik meredup di bawah jari.
- Tombol CERN 200 pF naik ±10% (#16, MED; tidak dipakai di naskah).

## Catatan naskah

- Dilarang/berisiko: tahun pasti kapan CERN "pertama memakai" (#17 bertentangan), klaim LG Prada "ponsel kapasitif pertama" (#20 MED), angka transparansi 90% (#5 MED), komposisi ITO (#4 MED). Jangan bilang Apple "menemukan" multi-touch (#20, S7).
- Ejaan fonetik: indium tin oxide → "indium tin oksaid"; CERN → "sern"; HP → "ha-pe".
- Ide visual 3D kasar: HP transparan dibelah berlapis (kaca, grid ITO tembus pandang, panel tampilan); denyut cahaya berjalan di baris seperti radar; garis medan melengkung dari baris ke kolom dan "dicuri" jari; sarung tangan wol sebagai perisai yang memutus garis medan; inset sejarah ruang kendali CERN tahun 1970-an dengan monitor CRT.
