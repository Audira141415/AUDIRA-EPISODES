# Research Report — Cara Kerja Rantai Dingin Obat dan Vaksin

> Riset backlog 2026-11-27. Channel @AudiraExplained (rule 15: netral, tanpa wajah/logo/merek nyata).

## Sumber utama

- **WHO Immunization in Practice, Module 2 (2015)**: suhu simpan, daftar vaksin sensitif beku, cara baca VVM, uji kocok, cold box dan vaccine carrier (#1–#4).
- **WHO Temperature sensitivity of vaccines (2006)**: mekanisme kerusakan beku pada vaksin beradjuvan aluminium (#5).
- **WHO Monitoring vaccine wastage at country level (2005)**: asal angka "lebih dari 50% vaksin terbuang" (#6).
- **WHO operational guidance ultra-cold chain (Feb 2022)**: rentang −90 s.d. −60 °C untuk satu vaksin mRNA COVID-19 (#7).
- **Regulasi Indonesia (dibaca langsung dari JDIH BPK)**: Per BPOM 20/2025 Standar CDOB (#8, #9), Permenkes 12/2017 Lampiran (#10), Permenkes 3/2026 (#11).
- Pendukung: halaman WHO supply chain (#12); Wikipedia VVM dan vaksin mRNA (#13, #14, MEDIUM).

## Fakta terverifikasi

1. Kebanyakan vaksin disimpan di +2 s.d. +8 °C; potensi yang hilang karena suhu salah tidak bisa kembali (#1).
2. Sebagian vaksin sensitif panas, sebagian sensitif beku (mis. hepatitis B, tetanus/Td, pentavalen, IPV, HPV, influenza, pneumokokus, rotavirus) (#1).
3. Vaksin beradjuvan aluminium yang membeku rusak permanen; partikel menggumpal dan mengendap lebih cepat (#5).
4. VVM mencatat paparan panas kumulatif. Kotak lebih terang dari lingkaran = pakai; sama atau lebih gelap = buang. Tipe VVM2/7/14/30 = hari sampai titik buang di 37 °C. VVM tidak mendeteksi beku (#2). Permenkes 12/2017 memakai skala A–D (#10).
5. Uji kocok membandingkan vial curiga dengan vial pembanding yang sengaja dibekukan; dikocok 10–15 detik; endapan sama cepat atau lebih cepat = rusak (#3). Disajikan sebagai prosedur petugas, bukan instruksi untuk penonton.
6. Cold box: cold life 2–7 hari pada +43 °C; vaccine carrier: 18–50 jam (#4).
7. Pola rantai vaksin program: pusat/pabrik → provinsi → kabupaten/kota → puskesmas → tempat/pos pelayanan; polio tetes −15 s.d. −25 °C di provinsi dan kab/kota, vaksin lain 2–8 °C (#10). Pos pelayanan imunisasi termasuk posyandu (#11).
8. CDOB 2025: suhu produk rantai dingin dipantau terus-menerus dengan data logger, cold room wajib alarm dan generator, cool-pack tidak boleh bersentuhan langsung dengan produk, VVM dicek saat penerimaan (#8).
9. Per Feb 2022, satu vaksin mRNA COVID-19 wajib disimpan dan diangkut di −90 s.d. −60 °C (#7).

## Perselisihan / Kontroversi

- **Koreksi hook TOPIC.md**: "Obat tertentu harus tetap dingin sejak dari pabrik sampai disuntikkan" kurang tepat. Yang benar: vaksin harus berada di **rentang suhu yang tepat** (umumnya 2–8 °C). Banyak vaksin justru **rusak bila membeku** (#1, #5), jadi "semakin dingin semakin aman" itu keliru. Hook dikoreksi: "Vaksin bisa rusak kalau kepanasan, juga kalau membeku." Judul aman dipertahankan; usulan judul lebih presisi: "Cara Kerja Rantai Dingin Vaksin: Tidak Boleh Panas, Tidak Boleh Beku".
- **"Obat"**: CDOB menyebut rantai dingin untuk obat termolabil dan produk biologi seperti vaksin (#8). Naskah fokus ke vaksin karena semua sumber detail (VVM, uji kocok, rantai program) khusus vaksin. Contoh obat lain (mis. insulin) belum dicari sumbernya, jadi tidak disebut.
- **Angka "hingga 50% vaksin terbuang" (WHO)**: sumber aslinya dokumen WHO 2005 (versi 2003, WHO/V&B/03.18 Rev.1), satu kalimat pembuka tanpa rincian data (#6). Pemborosan itu mencakup sisa dosis vial multi-dosis yang sudah dibuka, bukan hanya kegagalan rantai dingin. Versi populer "50% terbuang karena masalah suhu dan logistik" adalah penyederhanaan. Angka **tidak dipakai di VO**. Bila dipakai, tulis "dokumen WHO 2005: pemborosan vaksin global dilaporkan >50%, berbagai sebab".
- **Ultra-cold**: rentang resmi WHO −90 s.d. −60 °C (bukan −60 s.d. −90 sebagai suhu "harus" semua mRNA). Hanya berlaku untuk satu produk per 2022; merek tidak disebut. VO memakai "dulu" dan "sebagian" (#7). Wikipedia menyebut −80 s.d. −60 °C untuk wadah distribusi (#14), sehingga register memakai angka WHO.
- **Status regulasi**:
  - Pedoman Teknis CDOB Per BPOM 9/2019 (diubah 6/2020) **sudah dicabut** oleh Per BPOM 20/2025 Standar CDOB (berlaku 3 Juli 2025) (#9).
  - Per BPOM 16/2026 (berlaku 29 September 2026) mencabut Per BPOM 20/2025 **hanya sepanjang sertifikasi CDOB** (#9). Ketentuan rantai dingin Bab 11 tampaknya tetap berlaku, tetapi teks Per BPOM 16/2026 belum dibaca. Cek ulang sebelum produksi.
  - Permenkes 12/2017 Penyelenggaraan Imunisasi: **Pasal 11 ayat (4), Pasal 36, dan Lampiran dicabut** oleh Permenkes 3/2026 (#11). Lampiran itulah yang memuat rincian rantai vaksin (#10). Pengganti teknisnya (pedoman/Kepmenkes baru) belum ditemukan. VO hanya memakai urutan rantai umum, bukan angka atau prosedur dari lampiran tersebut. Cek pedoman pengelolaan vaksin Kemenkes terbaru sebelum produksi.
- **Netralitas**: kebijakan BPOM/Kemenkes disajikan sebagai aturan faktual, tanpa logo lembaga.

## Angka kunci untuk HUD

| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| 2–8 °C | Rentang simpan umum vaksin | 1, 10 |
| −15 s.d. −25 °C | Polio tetes di gudang provinsi & kab/kota (lampiran 2017, sudah dicabut) | 10 |
| −90 s.d. −60 °C | Satu vaksin mRNA COVID-19 (per Feb 2022) | 7 |
| 37 °C · VVM2/7/14/30 | Dasar uji tipe VVM | 2 |
| 10–15 dtk | Lama kocok pada uji kocok | 3 |
| 2–7 hari | Cold life cold box pada +43 °C | 4 |
| 18–50 jam | Cold life vaccine carrier pada +43 °C | 4 |
| 5 simpul | Pabrik → provinsi → kab/kota → puskesmas → pos pelayanan | 10, 11 |
| Data logger | Pemantauan suhu terus-menerus (CDOB 2025) | 8 |
| >6,6 miliar | VVM terpakai sampai 2017 (MEDIUM) | 13 |

## Poin kunci

- Cerita = dua musuh: panas dan beku. Tiap alat (cold box, VVM, uji kocok, data logger) menjawab satu musuh.
- Payoff visual: rute menyala biru dari pabrik sampai pos pelayanan, pita hijau 2–8 °C mengikuti.
- Rule 15: vial dan freezer generik, tanpa merek vaksin, tanpa logo BPOM/Kemenkes/WHO, petugas tanpa wajah.
- Keselamatan: uji kocok ditampilkan sebagai prosedur tenaga kesehatan; tidak ada ajakan penonton menguji vaksin sendiri.
