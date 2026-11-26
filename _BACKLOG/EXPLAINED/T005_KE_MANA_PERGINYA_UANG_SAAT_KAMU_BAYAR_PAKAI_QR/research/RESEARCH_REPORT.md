# Research Report — Ke Mana Perginya Uang Saat Kamu Bayar Pakai QR

> Riset pra-produksi (backlog, 2026-11-26). Nomor dalam kurung merujuk # di `SOURCE_REGISTER.md`.

## Sumber utama

- Bank Indonesia, halaman resmi QRIS (para pihak, MDR, batas transaksi, ketentuan) [1][2].
- ANTARA, laporan konferensi pers RDG BI Oktober 2024 (pembagian MDR ke lima pihak industri) [3] dan kebijakan MDR terbaru per 1 Oktober 2026 [4].
- ANTARA English, data pengguna/merchant per Juni 2026 [5].
- ASPI, halaman standar QRIS [6]; EMVCo, spesifikasi QR internasional [8].

## Fakta terverifikasi

1. QRIS adalah standar QR pembayaran nasional yang dikembangkan Bank Indonesia dan ASPI [1][6].
2. QRIS diluncurkan 17 Agustus 2019, dasar hukumnya PADG No. 21/18/PADG/2019, diubah terakhir dengan PADG No. 24/1/PADG/2022 [2].
3. Sebelum QRIS, aplikasi pembayaran hanya bisa membayar ke merchant yang memakai PJP yang sama [2].
4. Pihak pemrosesan transaksi QRIS: PJP penerbit (issuer) dan acquirer, lembaga switching, lembaga standar, serta pengelola National Merchant Repository. PJP dan switching wajib disetujui BI [1].
5. MDR dibayar merchant dan tidak boleh dibebankan ke konsumen. BI tidak mengambil bagian dari MDR. MDR dibagi ke issuer, acquirer, lembaga switching, ASPI, dan PTEN (Penyelesaian Transaksi Elektronik Nasional) [3].
6. Per 1 Oktober 2026: usaha mikro 0% untuk transaksi ≤ Rp500 ribu dan 0,3% di atasnya; usaha kecil, menengah, besar 0% ≤ Rp100 ribu dan 0,7% di atasnya [4].
7. Batas QRIS Rp10 juta per transaksi; penerbit boleh menetapkan batas harian/bulanan [1].
8. Per Juni 2026: 65,77 juta pengguna, 44,86 juta merchant, 96,68% merchant UMKM [5].
9. Pembanding pertumbuhan: Q2 2024 ada 50,50 juta pengguna dan 32,71 juta merchant [7].
10. Format QRIS mengikuti spesifikasi EMV QR Code (Merchant-Presented dan Consumer-Presented Mode) [1][8].

## Perselisihan / Kontroversi

- **Koreksi hook "saldo pindah dalam dua detik"**: tidak ada sumber resmi untuk angka "dua detik". BI hanya menyebut QRIS Tap (NFC) 0,3 detik [9]; Wikipedia menyebut QR biasa sekitar 5 detik tanpa rujukan resmi [10]. Naskah memakai "hitungan detik", bukan angka.
- **"Lima pihak"**: bisa dipertanggungjawabkan memakai daftar penerima MDR versi BI/ANTARA 2024: issuer, acquirer, switching, ASPI, PTEN [3]. Halaman BI mengelompokkan empat jenis pihak (PJP, switching, lembaga standar, pengelola NMR) [1]. Narasi menyebut kelima pihak satu per satu supaya angka "lima" jelas asalnya.
- **Tanggal wajib**: FAQ BI menyebut wajib "mulai 31 Desember 2019" [2], Wikipedia "1 Januari 2020" [10]. Tanggal wajib tidak dipakai di VO.
- **Settlement ke rekening pedagang**: jadwal pencairan (misalnya H+1 atau beberapa kali sehari) berbeda per penyedia dan tidak ditemukan sumber resmi BI yang bisa dikutip. Jangan sebut jadwal settlement di VO.
- **MDR berubah-ubah**: tarif berubah Desember 2024 dan Oktober 2026 [3][4]. Wajib ditulis "per 1 Oktober 2026" di layar; cek ulang sebelum produksi. Angka pengguna/merchant ditulis "per Juni 2026" [5].
- **Netral politik**: QRIS pernah disorot dalam negosiasi tarif AS 2025 (Wikipedia [10]). Tidak dimasukkan ke naskah (rule 15, netral).
- **Rule 15**: jangan tampilkan merek aplikasi dompet digital, nama bank, atau logo organisasi. Pakai label generik "aplikasi dompet digital", "bank pedagang", "lembaga switching", "lembaga penyelesaian".

## Angka kunci untuk HUD

| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| 17 Agustus 2019 | QRIS diluncurkan BI & ASPI | 2 |
| 5 pihak | issuer, switching, acquirer, ASPI, lembaga penyelesaian (PTEN) | 3 |
| 0% s.d. Rp500 ribu | MDR usaha mikro, per 1 Oktober 2026 | 4 |
| 0,3% | MDR usaha mikro di atas Rp500 ribu, per 1 Oktober 2026 | 4 |
| 65,77 juta | pengguna QRIS, per Juni 2026 | 5 |
| 44,86 juta | merchant QRIS, per Juni 2026 | 5 |
| Rp10 juta | batas per transaksi (opsional, tidak di VO) | 1 |

## Poin kunci

- Satu scan memicu rantai: penerbit memotong saldo, switching meneruskan pesan, acquirer mengonfirmasi ke pedagang.
- Dua pihak tak terlihat: lembaga standar (ASPI) dan lembaga penyelesaian.
- Konsumen tidak membayar biaya; pedagang menanggung MDR, dan transaksi kecil di usaha mikro kini gratis.
- Skala: puluhan juta pengguna dan pedagang dalam satu standar.
