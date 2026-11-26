# Research Report — Cara Kerja Sinyal Kereta Api: Kenapa Kereta Tidak Bertabrakan

> Riset backlog 2026-11-27. Channel @AudiraExplained (rule 15: netral, tanpa wajah/logo nyata, tanpa sensasi kecelakaan).

## Sumber utama

- **PM Perhubungan No. 44 Tahun 2018** (JDIH BPK, PDF lampiran dibuka langsung): definisi petak blok fixed block, peralatan blok, interlocking, aspek sinyal hijau/kuning/merah, pendeteksi sarana (track circuit, axle counter), dan moving block (#1–#6).
- **ERA (Uni Eropa)**: ERTMS/ETCS sebagai sistem persinyalan dan proteksi kereta (#7).
- **49 CFR § 236.1005 (eCFR/FRA)**: PTC wajib mencegah tabrakan antarkereta (#8).
- Pendukung MEDIUM: Wikipedia en (railway signalling, track circuit, axle counter, interlocking, CBTC/moving block) (#9–#13), Wikipedia id (LRT Jabodebek, persinyalan Indonesia) (#14, #15).

## Fakta terverifikasi

1. Di Indonesia, persyaratan teknis peralatan persinyalan diatur PM 44/2018 (berlaku 17 Mei 2018, mencabut PM 10/2011) (#1).
2. Petak blok (fixed block) = bagian petak jalan yang dibatasi dua sinyal berurutan berikut overlap (#2). Prinsip umumnya: dalam kondisi normal hanya satu kereta per blok (#9).
3. Peralatan blok wajib mendeteksi keberadaan kereta di petak blok dan mengunci rute berlawanan dari stasiun sebelah (#2).
4. Pendeteksi sarana di PM 44/2018: track circuit dan axle counter (#5). Track circuit: gandar kereta menghubung-pendekkan rel sehingga relai melepas; desain gagal-aman membaca kegagalan sebagai "ada kereta" (#10). Axle counter: jumlah gandar masuk = keluar berarti kosong (#11).
5. Aspek sinyal elektrik di Indonesia: hijau = berjalan, kuning = berjalan hati-hati, merah = berhenti (#4); makna ini dipakai sejak Peraturan Dinas 3 (2010), sebelumnya putih = aman (#15).
6. Interlocking membentuk, mengunci, dan mengontrol rute sehingga sinyal "berjalan" tidak bisa tampil sebelum rute aman dan rute bertentangan tidak bisa dibuka bersamaan (#3, #12).
7. Moving block: zona aman dihitung real-time dari posisi dan kecepatan kereta lewat komunikasi radio; PM 44/2018 mengakuinya (#6, #13). LRT Jabodebek memakai CBTC GoA 3 (#14).
8. Jarak pengereman kereta bisa beberapa kilometer, sehingga sinyal ditempatkan berdasarkan jarak pengereman kereta terburuk (#9).
9. Sistem proteksi otomatis (ETCS di Eropa, PTC di AS) ditambahkan di atas sinyal untuk mencegah tabrakan bila masinis salah (#7, #8).

## Perselisihan / Kontroversi

- **Koreksi hook TOPIC.md**: "hanya satu kereta boleh ada di tiap blok" benar untuk **fixed block dalam kondisi normal**, tapi tidak mutlak: (a) ada operasi khusus/darurat dengan izin tertulis (semboyan/surat perintah, sinyal darurat di PM 44/2018) dan (b) sistem **moving block/CBTC** (mis. LRT Jabodebek) tidak memakai blok tetap. Hook dikoreksi menjadi "**Dalam kondisi normal**, satu blok cuma boleh diisi satu kereta", dan c06 menjelaskan moving block.
- **Judul "Kenapa Kereta Tidak Bertabrakan" berlebihan**: tabrakan kereta tetap terjadi (kesalahan manusia, gangguan sinyal, operasi darurat). Naskah tidak menjanjikan "tidak pernah tabrakan"; payoff memakai "tidak mengandalkan keberuntungan". Saran judul final: "Cara Sinyal Mencegah Kereta Bertabrakan". Kecelakaan tertentu (mis. tabrakan Bekasi Timur 2026 yang tercatat di Wikipedia) **tidak diangkat**; bila produksi ingin menyebutnya, pakai hanya laporan resmi KNKT.
- **Gagal-aman**: sumber prinsip gagal-aman track circuit adalah Wikipedia (#10); PM 44/2018 hanya menyebut "fail safe relay" untuk track relay. Narasi "kabel putus → sistem menganggap ada kereta" adalah prinsip desain umum, bukan jaminan setiap instalasi.
- **"Beberapa kilometer"** jarak pengereman berasal dari Wikipedia (MEDIUM) dan berlaku untuk kereta berat/cepat; samakan dengan riset T041 sebelum produksi.
- **LRT Jabodebek CBTC GoA 3** hanya dari Wikipedia; cari konfirmasi resmi (Kemenhub/DJKA/operator) sebelum produksi.
- Netralitas: tidak menyalahkan operator, tidak menampilkan logo KAI/LRT/Kemenhub.

## Angka kunci untuk HUD

| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| 1 blok = 1 kereta | Prinsip fixed block, kondisi normal | 2, 9 |
| PM 44/2018 | Persyaratan teknis peralatan persinyalan | 1 |
| beberapa km | Jarak pengereman kereta berat | 9 |
| Hijau · Kuning · Merah | Berjalan · hati-hati · berhenti | 4 |
| track circuit / axle counter | Dua jenis pendeteksi sarana | 5 |
| CBTC · GoA 3 | LRT Jabodebek, moving block | 13, 14 |

## Poin kunci

- Struktur visual: petak blok → jarak pengereman → batas sinyal → deteksi (listrik di rel, hitung gandar) → warna sinyal → interlocking/gagal-aman → moving block → jaringan utuh.
- Payoff: lapisan pengaman yang saling mengunci, bukan klaim "mustahil tabrakan".
- Fakta awet (prinsip teknik dan regulasi); yang bisa berubah hanya status PM dan contoh CBTC.
