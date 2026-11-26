# Research Report — Cara Kerja Meteran Listrik Token

> Riset backlog 2026-11-26. Channel @AudiraExplained (rule 15: netral, tanpa wajah orang nyata dan tanpa logo PLN/merek meteran; meteran generik).

## Sumber utama

- **STS Association** (pemegang standar, Registration Authority IEC 62055-41/-51/-52): penjelasan STS dan keamanannya (#1), struktur token 66 bit dan TID (#2), decoder key (#3), nomor meter (#4), jenis token (#5), jangkauan global (#6), migrasi base date 1993 (#8), daftar anggota (#9).
- **IEC Webstore**: ruang lingkup IEC 62055-41:2018 (#7).
- **Kementerian ESDM**: siaran pers tarif triwulan III 2026 (#10).
- Pendukung MEDIUM: ANTARA (tarif per kWh #11, cara isi token #12, token gagal #13), Wikipedia (#14, #15), artikel teknis Medium (#16).

## Fakta terverifikasi

1. Token 20 digit adalah pesan, bukan kunci: isinya 66 bit data (jenis token, angka acak, cap waktu TID, jumlah kredit, kode cek CRC) yang dienkripsi lalu ditulis sebagai 20 angka (#2, #16, #14, #12).
2. Enkripsi memakai decoder key yang unik per meteran, diturunkan dari nomor meter (DRN) dan kunci rahasia penyedia (vending key) serta parameter lain (#3, #4). Meteran menyimpan kunci itu dan mendekripsi sendiri, tanpa koneksi balik ke penjual: sistemnya satu arah (#7, #3).
3. Token kredit hanya berlaku di meteran tujuan dan hanya sekali (#1). Pemakaian ulang dicegah dengan mencatat TID token yang sudah masuk (#16; #1 menyatakan prinsipnya).
4. Satuan kredit listrik di token STS = 0,1 kWh (#5).
5. TID = jumlah menit sejak base date, field 24 bit, kembali ke nol tiap ≈31 tahun (#2).
6. STS diprakarsai di Afrika Selatan tahun 1993, asosiasinya berdiri 1997, jadi standar IEC terbuka sejak 2007; dipakai lebih dari 75 juta meter di 100 negara (#1, #6).
7. Di Indonesia, token = 20 digit; meteran menjawab "Benar/Accept" atau "Salah/Reject" (#12, #15, #14). Prabayar diperkenalkan PLN tahun 2010 (#15).
8. Uang pembelian token tidak seluruhnya jadi kWh: nilai token terdiri dari kWh, PPJ, dan meterai (#15). Tarif rumah tangga 1.300 VA = Rp1.444,70/kWh per triwulan III 2026 (#11), tarif triwulan III 2026 ditetapkan tidak naik (#10).

## Perselisihan / Kontroversi

- **Koreksi hook TOPIC.md**: "angka 20 digit … ternyata *kunci* terenkripsi" kurang tepat. Kuncinya (decoder key) tersimpan di dalam meteran dan tidak pernah diketik. Yang diketik adalah *pesan terenkripsi* (isi saldo + cap waktu + kode cek) yang hanya bisa dibuka kunci meteranmu. Hook naskah: "pesan rahasia, hanya meteranmu yang bisa membacanya".
- **"Hanya cocok untuk meteranmu"** benar untuk token kredit (#1), tetapi tidak berlaku untuk token manajemen class 1 (mis. token tes) yang tidak dienkripsi dan berlaku di semua meteran STS (#5). VO hanya membahas token isi ulang.
- **Apakah meteran prabayar PLN memakai STS?** Belum ada sumber resmi PLN/SPLN yang berhasil dibuka (situs PLN timeout, pencarian web error/CAPTCHA). Bukti tidak langsung: Wikipedia menyebut Indonesia memakai token 20 digit terenkode (#14), dan lebih dari 20 perusahaan Indonesia anggota STS Association (#9). Naskah menyebut STS sebagai standar internasional sistem token 20 digit, tanpa mengklaim spesifikasi meteran PLN. **Cek SPLN/dokumen PLN sebelum produksi.**
- **Pencegahan pemakaian ulang**: mekanisme "TID disimpan" bersumber MEDIUM (#16); prinsip "hanya sekali" HIGH (#1). VO memakai bahasa umum ("meteran mencatat cap waktu token yang sudah masuk").
- **Batas keamanan konten**: naskah sengaja tidak menyebut nama algoritma, tabel enkripsi, susunan bit lengkap, atau cara membuat token. STS Association menyatakan algoritmanya belum pernah dibobol menurut pengetahuan mereka (klaim pihak sendiri, tidak dipakai di VO).
- **Tarif cepat basi**: angka tarif triwulan IV 2026 tidak ditemukan (arsip ESDM Okt–Nov 2026 tidak memuat siaran tarif; situs PLN timeout). VO memakai "per triwulan ketiga 2026". Perbarui saat produksi.
- **Isu waktu (opsional, tidak di VO)**: meteran base date 1993 harus dimigrasi sebelum 31 Januari 2027 (#8). Tidak ada sumber bahwa ini berdampak ke pelanggan Indonesia; jangan dinarasikan.

## Angka kunci untuk HUD

| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| 20 digit | Panjang token yang diketik | 12, 14, 15 |
| 66 bit | Isi data token sebelum jadi 20 angka | 2, 16 |
| 0,1 kWh | Satuan kredit listrik di token | 5 |
| Rp1.444,70/kWh | Tarif rumah tangga 1.300 VA, per triwulan III 2026 | 11 |
| 1993 | STS diprakarsai di Afrika Selatan | 1 |
| 75 juta meter · 100 negara | Jangkauan STS | 6 |
| IEC 62055-41 | Nama standar internasional | 1, 7 |

## Poin kunci

- Inti cerita: uang → kWh → dikemas 66 bit → dikunci dengan kunci unik meteran → jadi 20 angka → meteran membuka sendiri tanpa internet → saldo bertambah.
- Payoff: token = "surat tersegel" untuk satu meteran; di meteran tetangga ditolak, diketik dua kali juga ditolak.
- Visual wajib generik: meteran tanpa logo PLN/merek, struk tanpa logo, tangan tanpa wajah.
- Jelaskan enkripsi secara umum (gembok/amplop bersegel), tanpa detail teknis yang memudahkan pembobolan.
- Tarif per kWh selalu ditulis "per triwulan III 2026" dan diperbarui sebelum produksi.
