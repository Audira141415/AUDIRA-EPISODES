# RESEARCH REPORT: EP43_KABEL_INTERNET_BAWAH_LAUT_SUBSEA

Riset 13 November 2026. Fakta bernomor merujuk `SOURCE_REGISTER.md`.

## Ringkasan inti

Lalu lintas internet antarbenua hampir seluruhnya lewat kabel serat optik di dasar laut, bukan satelit; data FCC yang dikutip TeleGeography menunjukkan satelit hanya 0,37% kapasitas internasional AS (#1). TeleGeography mencatat lebih dari 600 kabel aktif dan terencana dengan total lebih dari 1,5 juta km (#2, #3).

Di laut dalam kabel kira-kira sebesar selang taman (±25 mm) dan diletakkan langsung di dasar; dekat pantai diberi armor tambahan dan dikubur (#4, #5). Data dibawa sebagai cahaya laser di serat kaca setipis rambut (#6, #7). Cahaya melemah, jadi repeater berkala menguatkannya dengan serat terdoping erbium yang dipompa laser (#9, #10). Repeater mendapat listrik arus searah dari stasiun darat lewat konduktor di dalam kabel (#11).

Gangguan sekitar 200 kali setahun, dua pertiganya akibat kapal ikan dan jangkar; hiu nyaris tidak berperan (#14–#16).

## Cara kerja langkah demi langkah

| Tahap | Mekanisme | Fakta |
|---|---|---|
| 1. Stasiun darat | Data diubah jadi pulsa cahaya laser; pencatu daya mengirim arus DC ke kabel | #7, #11 |
| 2. Pantai | Kabel berarmor dikubur di bawah dasar laut | #5 |
| 3. Laut dalam | Kabel seukuran selang berbaring di dasar laut, hingga ribuan meter | #4, #12 |
| 4. Serat | Cahaya melesat di serat kaca setipis rambut, melemah seiring jarak | #6, #8 |
| 5. Repeater | EDFA: laser pompa + serat erbium menguatkan cahaya tiap ruas | #9, #10 |
| 6. Tujuan | Stasiun darat di benua lain mengubah cahaya kembali menjadi data | #7 |

## Sejarah singkat

Kabel telegraf transatlantik pertama beroperasi 16 Agustus 1858 tetapi rusak setelah sekitar tiga minggu; sambungan permanen sejak 1866 lewat kapal Great Eastern (#17, #19). Kabel serat optik transatlantik pertama TAT-8 tahun 1988 (#20). Detail durasi pesan Ratu Victoria bertentangan di sumber (#18).

## Miskonsepsi yang dibantah

- "Internet antarnegara lewat satelit": hampir seluruhnya lewat kabel (#1). **Hook.**
- "Hiu sering memutus kabel internet": nol gangguan dari gigitan ikan 2007–2014; penyebab utama kapal ikan dan jangkar (#15, #16). **Payoff.**
- "Kabel bawah laut itu raksasa": di laut dalam hanya sebesar selang (#4).

## Angka untuk visual payoff

- ±200 gangguan/tahun, 2/3 karena kapal ikan dan jangkar (#14, #15): jangkar terseret menyangkut kabel, siluet hiu berenang lewat tanpa menyentuh.
- >1,5 juta km (#3): turunan hitungan ≈ 37 kali keliling Bumi (1,5 juta ÷ 40.075 km), bila dipakai tulis "sekitar" dan beri atribusi.
- Selang taman ±25 mm vs serat setipis rambut (#4, #6).

## Catatan naskah

- Angka TeleGeography (600 kabel, 1,5 juta km) dan ICPC (200/tahun, 2/3) disebut dengan atribusi, karena satu sumber.
- Jangan pakai klaim populer "99% lalu lintas internet lewat kabel" (tidak ditemukan di sumber yang dibuka).
- Jangan sebut jarak repeater pasti (#9) dan detail pesan Ratu Victoria (#18).
- Wikipedia "Submarine communications cable" bertag AI-generated; fakta yang hanya bersumber darinya diberi MED.
- Ejaan fonetik: TeleGeography → "Teli-Geografi", repeater → "ripiter", Fresnel → "Frenel".
- Ide visual 3D: penampang kabel berlapis (serat, tabung, baja, polietilena) zoom dari selang ke rambut; pulsa cahaya melesat lalu meredup, repeater menyala hijau dan cahaya kembali terang; peta bola dunia dengan jaring garis kabel; jangkar menyeret dasar laut; hiu lewat tanpa menggigit.
