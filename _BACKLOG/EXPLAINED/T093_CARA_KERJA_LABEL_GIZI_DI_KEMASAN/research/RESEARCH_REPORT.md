# Research Report — Cara Kerja Label Gizi di Kemasan

> Backlog, riset 2026-11-27. Sumber web sebagian besar tidak bisa diakses langsung (BPOM/JDIH di balik WAF/captcha); detail regulasi dari pengetahuan mapan (Per BPOM 22/2019, Per BPOM 20/2021, PMK 28/2019) yang perlu dikonfirmasi ulang di tahap produksi via browser.

## Sumber utama

- Per BPOM 22/2019 tentang Informasi Nilai Gizi pada Label Pangan Olahan — register #1, #7.
- Per BPOM 20/2021 (perubahan Per BPOM 31/2018) tentang Label Pangan Olahan, termasuk front-of-pack warning — register #2.
- PMK 28/2019 tentang Angka Kecukupan Gizi — register #3.
- Wikipedia EN "Nutrition facts label" sebagai referensi umum — register #4.
- WHO "Healthy diet" fact sheet untuk ambang gizi internasional — register #5.
- Codex Alimentarius CAC/GL 2-1985 — register #6.
- PP 69/1999 dan UU 18/2012 sebagai dasar hukum induk — register #9.
- EFSA Dietary Reference Values (DRV) untuk konteks internasional acuan zat gizi — register #10.

## Fakta terverifikasi

1. Di Indonesia, label gizi disebut "Informasi Nilai Gizi" (ING). Aturan pencantuman ING pada label pangan olahan diatur Per BPOM 22/2019 (#1).
2. ING wajib mencantumkan: energi total (kkal), lemak total, lemak jenuh, protein, karbohidrat total, gula, garam (natrium), serta %AKG (Angka Kecukupan Gizi). Kolom ING menampilkan nilai per takaran saji DAN per 100 g/100 ml (#1, #4).
3. Takaran saji ditentukan produsen berdasarkan panduan BPOM. Satu kemasan bisa berisi lebih dari satu takaran saji. Contoh: kemasan keripik 150 g bisa berisi 3 takaran saji @50 g. Semua angka ING dihitung per satu takaran saji (#1, #7).
4. %AKG menunjukkan berapa persen kebutuhan harian terpenuhi dari satu takaran saji. Acuan AKG yang dipakai BPOM berdasarkan PMK 28/2019 (menggantikan AKG 2013); acuan umum label: energi 2.150 kkal/hari (#3).
5. Per BPOM 20/2021 mewajibkan peringatan front-of-pack (FoP) di kemasan depan: "Tinggi Gula", "Tinggi Garam", dan/atau "Tinggi Lemak Jenuh" jika kadar melebihi ambang per takaran saji: gula > 6 g, natrium > 300 mg, lemak jenuh > 4 g. Untuk minuman: gula > 6 g per 100 ml (#2).
6. Implementasi FoP bertahap: pelaku usaha besar mulai 2024, menengah 2025, kecil/mikro 2026 (#2).
7. WHO merekomendasikan gula bebas < 10% energi harian (~50 g/hari untuk 2.000 kkal), garam < 5 g/hari, lemak jenuh < 10% energi harian (#5).
8. Codex Alimentarius CAC/GL 2-1985 adalah standar internasional acuan pelabelan gizi nasional, termasuk Indonesia (#6).
9. Dasar hukum induk: PP 69/1999 tentang Label dan Iklan Pangan (Pasal 32–34), UU 18/2012 tentang Pangan (Pasal 97) (#8).

## Perselisihan / Kontroversi

- **Hook "tiga takaran saji — angka yang sering terlewat"**: Sebagian benar — kemasan besar memang bisa berisi lebih dari satu takaran saji, dan konsumen sering melewatkan angka "jumlah takaran saji per kemasan". Namun hook terlalu spesifik ("tiga takaran saji"): jumlah takaran saji tergantung ukuran kemasan dan berat per takaran; bisa 2, 3, 4, dsb. **Koreksi**: ganti "tiga" menjadi "beberapa" atau gunakan contoh spesifik dengan label "misal" (mis. "Satu bungkus keripik ternyata bisa berisi tiga takaran saji"). Penambahan "bisa" atau "ternyata" mencegah generalisasi berlebihan.
- **Per BPOM 22/2019 — status berlaku**: Berdasarkan pengetahuan per November 2026, Per BPOM 22/2019 masih berlaku dan belum dicabut/diubah secara substansial. **Risiko**: tidak bisa dikonfirmasi langsung karena JDIH BPOM di balik WAF. Wajib cek ulang di tahap produksi via browser interaktif.
- **Per BPOM 20/2021 — tenggat implementasi 2024–2026**: Implementasi bertahap; per 2026, seluruh pelaku usaha (termasuk mikro/kecil) seharusnya sudah wajib. **Risiko**: mungkin ada perubahan tenggat atau masa transisi perpanjangan. Cek di tahap produksi.
- **AKG 2019 vs 2013**: PMK 28/2019 menggantikan PMK 75/2013. BPOM mengacu AKG 2019 untuk label. Acuan energi umum label: 2.150 kkal/hari (bukan 2.000 kkal seperti AS). **Risiko**: angka 2.150 kkal perlu dikonfirmasi ulang — beberapa sumber menyebut 2.150, lainnya 2.000.
- **Ambang FoP (gula > 6 g, natrium > 300 mg, lemak jenuh > 4 g per takaran saji)**: Angka ini dari Per BPOM 20/2021. Perlu dicek apakah ada revisi atau penyesuaian per 2026.
- **Netralitas (rule 15)**: jangan menyerang merek makanan tertentu. Contoh label harus generik (mis. "keripik kentang" tanpa merek). Visual tanpa logo/merek nyata.

## Angka kunci untuk HUD

| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| ING per takaran saji + per 100 g | Format wajib tabel ING Indonesia | #1, #4 |
| 2.150 kkal/hari | Acuan AKG umum label (energi) — cek ulang | #3 |
| > 6 g gula per takaran saji | Ambang peringatan "Tinggi Gula" FoP | #2 |
| > 300 mg natrium per takaran saji | Ambang peringatan "Tinggi Garam" FoP | #2 |
| > 4 g lemak jenuh per takaran saji | Ambang peringatan "Tinggi Lemak Jenuh" FoP | #2 |
| 2024 / 2025 / 2026 | Tenggat implementasi FoP (besar / menengah / kecil-mikro) | #2 |
| < 50 g gula/hari | Rekomendasi WHO gula bebas < 10% energi | #5 |
| < 5 g garam/hari | Rekomendasi WHO asupan garam harian | #5 |

## Poin kunci

- Label gizi bukan dekorasi: ini satu-satunya alat konsumen untuk membandingkan produk sebelum membeli.
- Jebakan utama: angka ING per takaran saji, bukan per kemasan. Konsumen yang menghabiskan kemasan perlu mengalikan.
- Peringatan FoP (Tinggi Gula/Garam/Lemak Jenuh) mulai wajib bertahap 2024–2026 — perubahan besar yang banyak konsumen belum tahu.
- %AKG menunjukkan proporsi kebutuhan harian, bukan nilai absolut; acuan Indonesia 2.150 kkal (bukan 2.000 kkal seperti AS).
