# Research Report — Bunga Majemuk: Kenapa Utang Kecil Bisa Jadi Raksasa

> Riset backlog 2026-11-26. Konten edukasi, bukan nasihat keuangan personal.

## Sumber utama

- **Regulator / pernyataan resmi OJK** (via media nasional): ANTARA 2023 (#4), detikFinance 2024–2026 (#5, #6, #7), Okezone 2026 (#8). Aturan yang berlaku sekarang: SEOJK Nomor 19/SEOJK.06/2025 tentang Penyelenggaraan LPBBTI.
- **Konsep matematika**: Investor.gov / SEC (#2), Wikipedia id Bunga majemuk (#1), Wikipedia en Rule of 72 (#3).
- **Konfirmasi status per November 2026**: demokratis.co.id (#9), Suara.com (#10).
- **Perhitungan sendiri** dengan rumus dan asumsi tertulis (#11).
- Catatan: halaman resmi ojk.go.id untuk SEOJK 19/2025 tidak berhasil dibuka (URL yang dicoba 404); naskah SEOJK asli perlu dibaca langsung sebelum produksi.

## Fakta terverifikasi

1. Bunga majemuk = bunga berbunga: bunga tiap periode ditambahkan ke pokok, periode berikutnya dihitung dari total baru (#1, #2).
2. Rumus: Mn = M0 × (1 + p)^n; pertumbuhannya eksponensial (#1).
3. Contoh Rp10 juta bunga 10%/tahun: Rp11 juta → Rp12,1 juta → Rp13,31 juta → ±Rp25,9 juta di tahun ke-10 (#1, #11).
4. Aturan 72: 72 ÷ persen bunga per periode ≈ jumlah periode sampai berlipat dua; hanya untuk bunga majemuk (#3).
5. SEOJK 19/2023 (10 Nov 2023) awalnya menjadwalkan batas konsumtif 0,3% (2024) → 0,2% (2025) → 0,1% (2026) per hari (#4).
6. Jadwal itu direvisi: sejak 1 Jan 2025 konsumtif tenor < 6 bulan 0,3%/hari, tenor > 6 bulan 0,2%/hari (#5, #6).
7. Aturan terkini SEOJK 19/SEOJK.06/2025; per 18 November 2026 OJK mempertahankan batas konsumtif 0,3% (#7, #9).
8. Total manfaat ekonomi + denda tidak boleh melebihi 100% nilai pendanaan (#8, #10).
9. Ilustrasi (#11): Rp1 juta, 0,3%/hari, 365 hari → sederhana ±Rp2,1 juta; majemuk harian ±Rp2,98 juta; dengan batas 100% OJK maksimal Rp2 juta. Aturan 72 → ±240 hari (pas ±231 hari).

## Perselisihan / Kontroversi

- **Koreksi hook TOPIC.md**: "Pinjaman Rp1 juta bisa berlipat jauh lebih besar" tidak akurat untuk pinjaman daring berizin. Batas OJK membuat total bunga + biaya + denda maksimal 100% pokok, jadi Rp1 juta paling banyak menjadi Rp2 juta (#8, #10). Selain itu, batas pindar dihitung per hari "dari nilai pendanaan" (pokok), bukan majemuk. Angka "hampir 3 juta" di hook naskah adalah ilustrasi matematika bunga majemuk tanpa batas (#11), dan naskah wajib menyebut rem OJK di c05. Hook yang dipakai: "Utang sejuta ... setahun kemudian bisa jadi hampir tiga juta" + pembingkaian "ini rumusnya".
- **Jadwal 0,1% untuk 2026 tidak terjadi**: banyak artikel lama (2023–2024) menyebut batas konsumtif turun ke 0,1%/hari pada 2026 (#4). Sumber 2025–2026 menunjukkan batas tetap 0,3%/0,2% (#6, #9). Jangan pakai angka 0,1%.
- **Batas 0,3% hanya untuk tenor ≤ 6 bulan**: ilustrasi 365 hari dengan 0,3% adalah hipotesis matematis, bukan produk nyata. Naskah menyebut "tenor pendek".
- **Isu kartel bunga**: KPPU sempat memutus dugaan kartel bunga oleh 97 pindar (Maret 2026), lalu putusan dibatalkan hakim (Oktober 2026), menurut judul berita Bing News yang tidak dibuka penuh. Tidak dinarasikan; hindari topik ini agar netral.
- **Pinjol ilegal**: tidak terikat aturan OJK. Naskah hanya menyebut "tidak terikat" tanpa angka bunga ilegal (tidak ada sumber kuat untuk angka spesifik).

## Angka kunci untuk HUD

| Angka / tahun / nama | Konteks | # sumber |
|---|---|---|
| Mn = M0 × (1 + p)^n | Rumus bunga majemuk | 1 |
| Rp10 jt → 11 → 12,1 → ±25,9 jt | Contoh 10%/tahun, 10 tahun | 1, 11 |
| 0,3% / hari | Batas manfaat ekonomi pindar konsumtif tenor ≤ 6 bln, per November 2026 | 5, 6, 9 |
| 0,2% / hari | Tenor > 6 bulan, per November 2026 | 5, 6 |
| ±Rp2,1 jt vs ±Rp2,98 jt | Rp1 jt, 365 hari: sederhana vs majemuk (ilustrasi) | 11 |
| 72 ÷ 0,3 ≈ 240 hari (pas ±231) | Aturan 72 | 3, 11 |
| 100% pokok | Batas total manfaat ekonomi + denda | 8, 10 |
| Rp1 jt → maks Rp2 jt | Akibat batas 100% | 8, 10, 11 |
| SEOJK 19/SEOJK.06/2025 | Dasar aturan terkini (name plate teks, tanpa logo OJK) | 7, 8, 9 |

## Poin kunci

- Inti cerita: bunga majemuk = pokok membesar, lalu bunga dihitung dari pokok yang sudah membesar → kurva eksponensial.
- Kontras sederhana vs majemuk pada angka yang sama (2,1 jt vs hampir 3 jt) adalah payoff visual terkuat.
- Aturan 72 memberi alat praktis yang mudah diingat penonton.
- Rem regulasi (0,3%/hari, total maks 100%) menjaga netralitas dan akurasi; tutup dengan sisi positif (tabungan) tanpa memberi saran produk.
- Rule 15: tanpa logo OJK/bank/aplikasi pinjol, tanpa wajah orang nyata; uang kertas generik (bukan replika rupiah asli).
