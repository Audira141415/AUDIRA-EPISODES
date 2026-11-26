# Research Report — Cara Kerja Setrika Uap

> Riset backlog 2026-11-26. Channel @AudiraExplained (rule 15: setrika dan pakaian generik, tanpa merek/logo, tanpa wajah orang nyata).

## Sumber utama

- **#1 Polymers (Basel) 2026, review anti-wrinkle** (HIGH): mekanisme kerut katun lewat ikatan hidrogen selulosa dan peran air.
- **#2 Key Engineering Materials 2015, mekanisme setrika uap kain katun** (HIGH): efek suhu terhadap pemulihan kerut.
- **#3 GINETEX, simbol perawatan ISO 3758** (HIGH): suhu maksimum pelat dasar per jumlah titik.
- **#4 Paten AS 259,054 (Seely, 1882)** (HIGH): setrika listrik pertama yang dipatenkan.
- **#5 HyperPhysics, Georgia State University** (HIGH): prinsip keping bimetal.
- **#6–#9 Wikipedia (en/id)** (MEDIUM): anatomi setrika, termostat bimetal pada setrika, fitur uap, kimia menyetrika.

## Fakta terverifikasi

1. Serat katun = rantai selulosa yang saling terhubung ikatan hidrogen; daerah amorf ±30–40% (#1).
2. Kerutan terbentuk saat gaya luar memutus ikatan hidrogen, rantai bergeser, dan ikatan terbentuk ulang di posisi baru sehingga bentuk tidak pulih sendiri (#1).
3. Air membuat daerah amorf katun mengembang dan melemahkan ikatan hidrogen (#1); katun butuh air untuk melonggarkan ikatan antarmolekul saat disetrika (#8).
4. Menyetrika: panas melonggarkan ikatan antar rantai polimer, beban setrika meluruskan serat, dan serat menahan bentuk baru setelah dingin; pada katun gugus hidroksil terbentuk ulang dan "terkunci" saat mendingin (#8).
5. Suhu saat penyetrikaan menaikkan laju pemulihan kerut kain katun sekitar 6–21% (#2).
6. Setrika listrik: elemen pemanas resistif memanaskan pelat dasar aluminium atau baja tahan karat; termostat menyalakan-mematikan arus untuk menjaga suhu (#7, #9).
7. Setrika uap punya tangki air untuk membangkitkan uap yang disemburkan lewat bagian panas setrika ke kain (#7, #9).
8. Keping bimetal melengkung saat panas dan melengkung berlawanan saat dingin karena dua logamnya memuai berbeda (#5); di termostat, ujung bergerak membawa kontak listrik yang langsung mengendalikan daya pada setrika rumah tangga (#6).
9. Ada juga thermofuse sebagai pengaman cadangan yang putus bila suhu melewati batas (#9).
10. Simbol label setrika: 1 titik maks 120 °C (sintetis seperti akrilik, nilon, asetat), 2 titik maks 160 °C (wol, sutra, poliester, viskosa), 3 titik maks 210 °C (katun, linen) (#3).
11. Paten setrika listrik AS 259,054 oleh Henry W. Seely terbit 6 Juni 1882 (#4).

## Perselisihan / Kontroversi

- **Koreksi hook TOPIC.md.** Hook asli "Uap panas melemaskan serat kain sampai kerutannya hilang dalam satu sapuan" kurang tepat di dua titik:
  1. Yang dilonggarkan bukan "serat lemas", melainkan ikatan hidrogen antar rantai selulosa (#1, #8). Uap saja tidak cukup: bentuk lurus baru "terkunci" ketika kain mendingin dan mengering di bawah tekanan setrika (#8).
  2. "Satu sapuan" tidak didukung sumber. Studi #2 menunjukkan suhu hanya menaikkan pemulihan kerut ±6–21%, jadi kerut berat tetap butuh beberapa sapuan. Hook baru: "Kerutan di bajumu itu sebenarnya ikatan kimia yang terkunci di posisi salah. Setrika uap membukanya, lalu menguncinya lagi dalam keadaan lurus."
- **Suhu per titik berbeda antar sumber.** GINETEX/ISO 3758 (#3): 120/160/210 °C (suhu maksimum pelat dasar). Wikipedia "Laundry symbol" menulis 110/150/200 °C (nilai lama/standar lain, tidak dipakai). Naskah memakai angka GINETEX dan menyebutnya "maksimal".
- **Rentang suhu kerja setrika tidak konsisten di Wikipedia**: "Clothes iron" 121–182 °C, "Ironing" 180–220 °C. Tidak dipakai di naskah.
- **Uap pada kain sintetis**: GINETEX menyebut uap bisa merusak permanen pada setelan 1 titik (#3). Naskah tidak menyarankan uap untuk semua kain.
- **Penemu setrika listrik**: paten 1882 atas nama Henry W. Seely (#4); klaim setrika busur karbon di Prancis 1880 diragukan (#7). Naskah hanya menyebut tahun paten, tanpa nama atau wajah.
- **Mekanisme pembentukan uap di dalam setrika** (air dialirkan ke ruang panas di atas pelat) hanya didukung sumber MEDIUM (#7, #9) dan detailnya beda per desain. Naskah memakai kalimat umum.
- **SNI/IEC belum terverifikasi**: halaman IEC 60311 dan ISO tidak bisa dibaca isinya (render JS / 403), dan mesin pencari tidak bisa dipakai saat riset. Bila ingin menyebut standar keselamatan (SNI IEC 60335-2-3), cek dulu di BSN sebelum produksi.

## Angka kunci untuk HUD

| Angka / tahun / nama | Konteks | # sumber |
|---|---|---|
| ±30–40% | porsi daerah amorf serat katun, tempat ikatan hidrogen mudah putus | #1 |
| 1882 | paten setrika listrik (AS 259,054) | #4 |
| 1 titik · maks 120 °C | kain sintetis (akrilik, nilon, asetat), tanpa uap | #3 |
| 2 titik · maks 160 °C | wol, sutra, poliester, viskosa | #3 |
| 3 titik · maks 210 °C | katun, linen; setrika selagi lembap | #3 |
| 6–21% | kenaikan pemulihan kerut katun karena suhu (cadangan, belum di VO) | #2 |

## Poin kunci

- Kerutan = ikatan hidrogen selulosa yang terbentuk ulang di posisi salah, bukan serat "rusak".
- Setrika uap bekerja tiga langkah: panas + uap membuka ikatan, beban meluruskan, pendinginan/pengeringan mengunci bentuk.
- Termostat bimetal menjaga suhu dengan memutus-sambung arus; kenop memindahkan titik setelnya.
- Suhu maksimum mengikuti label (1/2/3 titik), bukan tebakan dari jenis serat.
- Visual wajib generik: setrika tanpa merek, kemeja polos, tangan siluet.
