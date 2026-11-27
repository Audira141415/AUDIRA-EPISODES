# Research Report — Cara Kerja Pengujian Obat Sebelum Dijual

> Riset backlog 2026-11-27. Channel @AudiraExplained (rule 15: netral, tanpa wajah/logo nyata).

## Sumber utama

- **Wikipedia "Phases of clinical research"** (2026-11-27): detail setiap fase uji klinis dari Praklinik hingga Fase IV, termasuk jumlah partisipan dan tingkat keberhasilan per fase dari BIO 2021 (#1).
- **Wikipedia "Drug development"** (2026-11-27): proses keseluruhan dari penemuan hingga persetujuan, tingkat kegagalan keseluruhan (<10% dari Fase I sampai persetujuan), timeline >1 dekade (#2).
- **Wikipedia "Cost of drug development"** (2026-11-27): membandingkan estimasi biaya dari Tufts/DiMasi ($2,6B) vs Wouters/JAMA ($985M median), termasuk kritik terhadap angka Tufts (#3).
- **DiMasi et al. 2016** (Journal of Health Economics): studi Tufts Center, $2,6–2,87 miliar terkapitalisasi. HIGH karena jurnal peer-reviewed (#4).
- **Wouters et al. 2020** (JAMA): studi independen, median $985 juta. PMC 7054832. HIGH karena jurnal tier-1 dan open access (#5).
- **FDA "The Drug Development Process"** (2018): sumber resmi pemerintah AS, 5 langkah pengembangan obat (#8).
- **BIO/Informa/QLS 2021**: success rate per fase klinis (#9).
- **Wikipedia "Emergency use authorization"**: EUA sebagai pengecualian darurat, bukan norma baru (#6).

## Fakta terverifikasi

1. Pengujian obat baru terdiri dari **5 tahap utama**: (a) Penemuan & pengembangan awal, (b) Uji praklinik (in vitro & hewan), (c) Uji klinis Fase I–III, (d) Review regulator, (e) Fase IV/post-market surveillance (#1, #2, #8).
2. **Fase I**: 20–100 sukarelawan sehat, menguji keamanan & dosis. Keberhasilan ≈52% (#1, #9).
3. **Fase II**: 100–300 pasien, menguji efikasi awal. Keberhasilan ≈28,9% — titik kegagalan terbesar (#1, #9).
4. **Fase III**: 300–3.000 pasien, menguji efikasi & keamanan skala besar. Keberhasilan ≈57,8% (#1, #9).
5. **Fase IV**: surveillance pasca-pemasaran, memantau efek jangka panjang di populasi umum (#1, #8).
6. Dari Fase I hingga persetujuan, tingkat keberhasilan keseluruhan **di bawah 10%** (data 2006–2015). Artinya >90% kandidat obat gagal (#2).
7. Proses keseluruhan dari konsep hingga persetujuan biasanya **lebih dari satu dekade** (#2, #8).
8. **Biaya (kontroversial)**: DiMasi/Tufts (2016) menghitung $2,6 miliar terkapitalisasi (termasuk opportunity cost modal); Wouters/JAMA (2020) menghitung median $985 juta. Perbedaan besar karena metodologi: Tufts menggunakan data rahasia industri, Wouters menggunakan SEC filings publik (#3, #4, #5).
9. **EUA (Emergency Use Authorization)**: standar lebih rendah ("may be effective" vs "effectiveness"), berlaku hanya selama darurat kesehatan masyarakat, berakhir saat darurat dicabut. Bukan persetujuan penuh. Vaksin COVID-19 kemudian tetap melewati proses persetujuan penuh (BLA) (#6).
10. Di Indonesia, BPOM mengawasi aspek regulatori uji klinik; Komisi Etik Penelitian Kesehatan menilai aspek etik (perlindungan subjek penelitian). Keduanya harus memberikan persetujuan sebelum uji klinik dimulai — fungsinya berbeda dan saling melengkapi (#7).

## Perselisihan / Kontroversi

- **Koreksi hook TOPIC.md**: Hook awal "Satu obat baru melewati **beberapa** fase uji bertahun-tahun" terlalu samar. Sebenarnya ada **4 fase uji klinis** (I–III sebelum persetujuan + IV pasca-pasar), ditambah **tahap praklinik** sebelumnya. Total 5 tahap utama. Kata "beberapa" harus diganti dengan angka spesifik di naskah. Hook diperbaiki di SCRIPT.md.
- **Angka "$1–2 miliar"**: Angka ini sering dikutip dari studi PhRMA/Tufts Center. Studi DiMasi 2016 (Tufts) menghitung $2,6 miliar terkapitalisasi, tetapi angka ini **dikritik** oleh MSF (data R&D industri tidak dipublikasikan) dan Aaron Carroll/NYT (asumsi menguntungkan industri: termasuk opportunity cost modal, bukan biaya tunai). Studi independen Wouters et al. 2020 (JAMA) menghitung median $985 juta — jauh lebih rendah. **Naskah wajib menyebut kedua estimasi dan label "studi berbeda, angka berbeda".**
- **Durasi "10–15 tahun"**: Wikipedia dan FDA menyebut "lebih dari satu dekade." Angka 15 tahun ada di beberapa sumber industri tetapi bukan konsensus. Naskah menggunakan "lebih dari 10 tahun" sebagai pernyataan yang lebih aman.
- **Regulasi Indonesia — Per BPOM 25/2015**: Status regulasi ini **belum dapat diverifikasi** secara daring (JDIH BPOM tidak dapat diakses via pencarian otomatis per 2026-11-27). Ada kemungkinan regulasi ini telah diperbarui/dicabut dan diganti regulasi baru. **Wajib dicek manual sebelum produksi.**
- **Peran BPOM vs Komisi Etik**: BPOM menilai aspek regulatori (keamanan obat, desain studi, data praklinik); Komisi Etik menilai aspek etik (informed consent, perlindungan subjek, rasio risiko/manfaat bagi peserta). Keduanya wajib memberi persetujuan sebelum uji klinik dimulai. Naskah membedakan keduanya.
- **COVID-19 EUA**: EUA adalah pengecualian darurat, bukan norma baru. Standar lebih rendah ("may be effective"). Vaksin COVID-19 kemudian tetap mendapat persetujuan penuh melalui jalur normal. Naskah menyebutkan ini sebagai fakta historis tanpa menyiratkan bahwa proses uji obat kini lebih cepat secara umum.

## Angka kunci untuk HUD

| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| >10 tahun | Durasi keseluruhan pengembangan obat baru | 2, 8 |
| <10% | Tingkat keberhasilan dari Fase I hingga persetujuan (2006–2015) | 2 |
| 52% / 28,9% / 57,8% | Success rate Fase I / II / III | 1, 9 |
| $2,6 miliar | Estimasi biaya terkapitalisasi (Tufts/DiMasi 2016; dikritik) | 3, 4 |
| $985 juta | Estimasi median biaya (Wouters/JAMA 2020; independen) | 3, 5 |
| 20–100 / 100–300 / 300–3.000 | Jumlah partisipan Fase I / II / III | 1 |
| 5 tahap | Penemuan, praklinik, klinis I–III, review, Fase IV | 1, 8 |

## Poin kunci

- Cerita = sebelum obat sampai di apotek, ia melewati 5 tahap dan >10 tahun pengembangan, dengan >90% kandidat gagal di perjalanan. Tahap paling mematikan: Fase II (hanya 28,9% lolos).
- Payoff: viewer memahami mengapa obat baru mahal dan lama tersedia, plus fakta bahwa EUA (seperti vaksin COVID) adalah pengecualian, bukan norma.
- Topik cukup awet (evergreen): proses uji klinis tidak berubah secara fundamental. Angka biaya bisa berubah seiring studi baru.
- Netral: tidak menyebutkan nama perusahaan farmasi, obat, atau regulator Indonesia tertentu selain BPOM (lembaga resmi).
- Nuansa penting: angka biaya "$2,6 miliar" dari Tufts Center sering dikutip tetapi dikritik — naskah wajib menyebut estimasi alternatif.
