# Research Report — Kenapa Indonesia Butuh Data Center Sendiri

## Sumber utama
- Teks resmi PP 71/2019 dan UU 27/2022 (PDP) dari JDIH BPK RI (#1–#5).
- ANTARA: kronologi serangan PDNS 2 dan kapasitas PDNS (#6, #7).
- Kompas.com: kritik ketiadaan backup (#8).
- Wikipedia ID "Pusat Data Nasional" untuk angka instansi terdampak dan rencana 4 PDN (#9, MEDIUM).
- Dokumentasi AWS Regions untuk region Jakarta (#10).

## Fakta terverifikasi
1. PP 71/2019 berlaku 10 Oktober 2019 dan mencabut PP 82/2012 (#1).
2. Sistem elektronik lingkup publik (instansi pemerintah) wajib mengelola dan menyimpan data di wilayah Indonesia, kecuali teknologinya tidak tersedia di dalam negeri (#2).
3. Lingkup privat (aplikasi swasta) boleh menyimpan data di dalam dan/atau luar negeri, asal pengawasan dan penegakan hukum tetap efektif (#3).
4. UU PDP berlaku 17 Oktober 2022 (#4); transfer data pribadi ke luar negeri boleh bila negara penerima setara atau lebih tinggi pelindungannya; denda administratif maks 2% pendapatan tahunan; masa penyesuaian 2 tahun (#5).
5. Per Februari 2024, PDNS menampung data sekitar 400 institusi pemerintah, dioperasikan bersama Telkom dan Lintasarta (#7).
6. Juni 2024, ransomware Brain Cipher menyerang PDNS 2 Surabaya; tebusan diminta 8 juta dolar AS (#6).
7. Serangan mengganggu 239 instansi (#9, MEDIUM).
8. DPR mengkritik tidak adanya kewajiban backup (#8, MEDIUM, berupa pernyataan politisi).
9. AWS punya region Jakarta (ap-southeast-3) (#10).

## Perselisihan / Kontroversi
- **Koreksi hook TOPIC.md:** "Semua data kamu tersimpan di luar negeri" TIDAK akurat. Data layanan pemerintah wajib di dalam negeri (#2), dan sebagian penyedia cloud global sudah punya region di Jakarta (#10). Yang benar: data dari aplikasi swasta *boleh* disimpan di luar negeri secara legal (#3, #5). Hook diganti: "Data kamu bisa saja tidak tinggal di Indonesia. Dan itu legal."
- **Koreksi framing judul:** kasus PDNS 2024 menunjukkan pusat data di dalam negeri tidak otomatis aman. Naskah membingkai "butuh data center sendiri" sebagai soal kendali hukum, bukan jaminan keamanan; backup dan keamanan berlapis tetap wajib.
- Angka instansi terdampak berbeda antar sumber (239 instansi di Wikipedia; laporan lain menyebut lebih dari 200). Naskah memakai "ratusan instansi", bukan angka pasti.
- Status operasional PDN Cikarang (target diresmikan 2024) tidak terverifikasi per 2026-11-25; tidak dinarasikan.
- Topik ini ada di folder seri `AUDIRA_SEJARAH_GAME_2026`, padahal temanya kebijakan data. Perlu dipindah ke seri TECH yang sesuai saat produksi.

## Angka kunci untuk HUD
| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| PP 71/2019 · 10 Okt 2019 | Aturan lokasi data publik vs privat | #1, #2, #3 |
| Pasal 20 vs Pasal 21 | Publik wajib di RI, privat boleh luar negeri | #2, #3 |
| UU 27/2022 | UU Pelindungan Data Pribadi | #4 |
| 2% | Denda maks dari pendapatan tahunan | #5 |
| ±400 institusi | Data di PDNS per Feb 2024 | #7 |
| Juni 2024 · PDNS 2 Surabaya | Serangan ransomware Brain Cipher | #6 |
| US$8 juta (±Rp131 M) | Tebusan yang diminta | #6 |
| 239 instansi | Terganggu serangan (MEDIUM) | #9 |
| ap-southeast-3 Jakarta | Region cloud global di RI | #10 |

## Poin kunci
- Indonesia punya dua rezim: data publik wajib di dalam negeri, data swasta boleh keluar dengan syarat.
- Data center domestik memberi kendali hukum dan pengawasan, bukan keamanan otomatis.
- PDNS 2024: satu titik sentral tanpa backup memperbesar dampak serangan.
- Pesan akhir: butuh pusat data sendiri plus cadangan dan keamanan berlapis.
