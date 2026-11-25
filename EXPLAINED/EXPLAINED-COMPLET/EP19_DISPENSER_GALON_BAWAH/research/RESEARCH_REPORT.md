# Research Report — EP19 Dispenser Galon Bawah

Riset 2026-11-13. Nomor `#n` merujuk ke tabel fakta di `SOURCE_REGISTER.md`.

## Ringkasan inti

Dispenser biasa memasang galon terbalik di atas, sehingga air turun karena gravitasi (#2). Dispenser galon bawah (bottom-load) menaruh galon di lemari bawah agar tidak perlu diangkat (#1). Galon standar berisi 19 liter, jadi airnya saja sekitar 19 kg (#10, #11). Karena galon ada di bawah keran, air harus dipompa naik ke tangki untuk dipanaskan atau didinginkan (#3).

Tangki penampung atas dilengkapi pelampung yang mencegah meluap (#4). Prinsip float switch: permukaan naik mematikan pompa, permukaan turun menyalakannya lagi (#5). Hasilnya, pada desain bertangki, menekan keran hanya membuka tangki atas; pompa bekerja sendiri saat isi tangki berkurang (#12, MED karena bisa berbeda per model).

Dari tangki, air dibagi ke jalur dingin dan panas. Pendinginan memakai kompresi uap (prinsip kulkas, EP02) atau modul termoelektrik Peltier yang memindahkan panas dari satu sisi ke sisi lain (#6, #7). Air panas dipanaskan elemen pemanas resistif di tangki panas (#8, #16). Keran panas biasanya punya katup pengaman yang harus ditekan dulu (#9).

## Cara kerja langkah demi langkah

| Tahap | Mekanisme | Fakta |
|---|---|---|
| 1 | Galon 19 L didorong masuk lemari bawah, pipa penyedot dicelupkan | #1, #10 |
| 2 | Pompa listrik menyedot air dan mendorongnya ke tangki atas | #3 |
| 3 | Pelampung naik → pompa mati; air diambil → pelampung turun → pompa menyala | #4, #5, #12 |
| 4 | Jalur dingin: kompresor atau Peltier | #6, #7 |
| 5 | Jalur panas: elemen pemanas + tangki panas | #8 |
| 6 | Keran panas berpengaman | #9 |

## Sejarah singkat

Luther Haws disebut menemukan dispenser air pada 1906 (#17, MED). Galon AQUA pertama berukuran 20 liter dan terbuat dari kaca (#13, MED). Tidak dipakai di naskah.

## Miskonsepsi yang dibantah

- "Air dispenser naik karena tekanan galon." Galon di bawah keran tidak bisa mengalir naik sendiri; perlu pompa (#3).
- "Menekan keran menyalakan pompa." Pada desain bertangki, keran membuka tangki atas; pompa dikendalikan ketinggian air (#4, #5, #12).

## Angka untuk visual payoff

- **19 liter ≈ 19 kg air** (#10, #11): galon melayang di udara setinggi dada lalu "jatuh" kembali ke lemari bawah, diganti panah pompa.

## Catatan naskah

- Jangan menjelaskan ulang siklus kulkas (EP02). Kompresor hanya disebut "seperti kulkas mini".
- Berisiko/belum terverifikasi: jenis pompa (membran?) (#20), sensor galon kosong, suhu tangki panas/dingin, daya watt. Sumber pabrikan tidak bisa diakses.
- Ejaan fonetik: Peltier → "Pel-ti-ye"; LED (teaser) → "el-e-de".
- Ide visual 3D kasar: dispenser dibelah samping; galon biru di lemari bawah dengan pipa penyedot; pompa kecil berdenyut; air naik lewat selang ke tangki atas; pelampung naik-turun seperti sakelar; percabangan ke tangki dingin (kumparan biru/modul Peltier dengan sisi panas-dingin) dan tangki panas (elemen merah); tombol pengaman keran panas ditekan jari.
