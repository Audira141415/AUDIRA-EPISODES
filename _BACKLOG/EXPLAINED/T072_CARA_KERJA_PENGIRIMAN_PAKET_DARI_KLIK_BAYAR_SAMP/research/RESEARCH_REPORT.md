# Research Report — Cara Kerja Pengiriman Paket: Dari Klik Bayar sampai Depan Pintu

> Riset backlog 2026-11-27. Channel @AudiraExplained (rule 15: netral, tanpa wajah orang nyata, tanpa logo/merek kurir atau marketplace).

## Sumber utama

- **Permenkomdigi No. 8 Tahun 2025 tentang Layanan Pos Komersial** (teks PDF dan status di JDIH BPK, dibaca langsung): sarana wajib (gudang/sortir, transportasi antarwilayah, pengantaran, pelacakan), waktu tempuh, kode QR resi, formula tarif, potongan harga, ganti rugi (#1–#6).
- **Status regulasi di JDIH BPK**: UU 38/2009 (diubah UU 6/2023), PP 46/2021, Permenkominfo 4/2021 dicabut sebagian (#7–#9).
- **Nature Communications 2026** (open access): cara kerja cross-belt sorter di pusat distribusi paket (#10).
- **Universal Postal Union**: standar S10 nomor kiriman 13 karakter dan kode event pelacakan (#11).
- Pendukung MEDIUM (ANTARA, fakta saja, tanpa salin teks): volume paket per hari menurut Wamenkomdigi (#12), alur FM Hub → Sorting Center → LM Hub dan uji coba jalur pintas (#13), penyebab keterlambatan (#14), klaim asosiasi soal gratis ongkir (#15).

## Fakta terverifikasi

1. Penyelenggara layanan paket wajib punya sarana pengumpulan/pengambilan, gudang atau tempat sortir, transportasi antarwilayah, transportasi pengantaran, timbangan SNI bertera, dan sistem pelacakan Kiriman (#2).
2. Resi wajib memakai kode QR berisi nama, alamat, kode pos, nomor telepon pengirim dan penerima, info Kiriman, dan tarif; dapat terhubung ke sistem pelacakan (#4). Standar internasional UPU S10 memakai nomor 13 karakter dengan check digit (#11).
3. Di pusat distribusi, cross-belt sorter memindahkan tiap paket di satu nampan, memindai barcode untuk mengambil tujuan, lalu menurunkannya ke grid/bin tujuan untuk truk keluar (#10).
4. Alur umum satu jasa kirim: First Mile Hub → Sorting Center → Last Mile Hub → kurir; untuk alamat dekat ada uji coba jalur pintas tanpa pusat sortir (#13). Jadi jumlah gudang yang dilewati bervariasi.
5. Batas waktu tempuh paket (Pasal 49): antarkota dalam pulau maks 3 hari, antarpulau maks 7 hari, hari berikutnya maks 24 jam, zona khusus maks 20 hari; dihitung sejak paket diterima penyelenggara (#3).
6. Tarif pos komersial berbasis biaya (tenaga kerja, transportasi, aplikasi, teknologi) + margin; potongan harga di bawah biaya pokok maks 3 hari per bulan (#5).
7. Ganti rugi kehilangan/kerusakan/keterlambatan maks 10× biaya pengiriman kecuali diasuransikan (#6).
8. Per 26 Februari 2026, Wamenkomdigi menyebut sektor transportasi dan pergudangan menangani hingga 7 juta paket per hari (#12, klaim pejabat via media).

## Perselisihan / Kontroversi

- **Koreksi hook TOPIC.md**: "Paketmu bisa melewati **lima gudang dan tiga kendaraan dalam dua hari**" tidak didukung sumber mana pun. Angka 5 gudang dan 3 kendaraan tidak ditemukan; alur bersumber (#13) menyebut tiga simpul (FM Hub → Sorting Center → LM Hub), dan bisa lebih pendek (jalur pintas) atau lebih panjang (antarpulau). "Dua hari" juga tidak umum berlaku: batas aturan antarkota dalam pulau 3 hari, antarpulau 7 hari (#3). Hook dikoreksi menjadi "dipindai berkali-kali dan singgah di **beberapa** gudang"; diagram alur diberi label "Ilustrasi alur umum".
- **Judul**: "Dari Klik Bayar sampai Depan Pintu" akurat, tidak perlu diubah.
- **Volume nasional**: tidak ditemukan tabel resmi BPS/Komdigi volume paket e-commerce per tahun yang bisa dibuka (situs Komdigi berbasis JS). Satu-satunya angka = "hingga 7 juta paket per hari" dari pidato Wamenkomdigi (Feb 2026), MEDIUM; di VO diatribusikan ke Wamenkomdigi. Cek ulang rilis resmi Komdigi sebelum produksi.
- **Kode QR vs barcode**: Permenkomdigi mewajibkan kode QR di resi (#4); mesin sortir di literatur membaca barcode (#10). VO memakai "kode" (umum) di bab resi dan "barcode" di bab mesin sortir; jangan menyatakan semua kurir memakai satu format.
- **Gratis ongkir**: Permenkomdigi 8/2025 tidak melarang promo gratis ongkir marketplace; yang diatur adalah potongan tarif oleh penyelenggara pos di bawah biaya pokok (maks 3 hari/bulan). Pernyataan bahwa gratis ongkir adalah promosi marketplace adalah klaim asosiasi (#15) dan tidak dipakai di VO. Netral: tidak menilai baik/buruk aturan diskon.
- **Moda antarpulau (kapal/pesawat)**: tidak ada sumber yang dibaca yang merinci moda; VO hanya menyebut "kendaraan antarkota". Ikon kapal/pesawat di visual bersifat ilustrasi.
- **Status regulasi**: Permenkomdigi 8/2025 berlaku; mencabut Permenkominfo 1/2012 (formula tarif) dan 7/2017, mencabut sebagian Permenkominfo 4/2021 (#1, #9). UU 38/2009 sudah diubah lewat UU Cipta Kerja (UU 6/2023) (#7). PP 46/2021 berlaku (#8). Pencarian JDIH BPK 2026 tidak menemukan perubahan baru; cek ulang menjelang produksi.
- **Merek**: sumber #13 dan #14 menyebut jasa kirim tertentu; di naskah ditulis generik ("ada jasa kirim"), tanpa nama dan logo.

## Angka kunci untuk HUD

| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| Permenkomdigi 8/2025 | Aturan layanan pos komersial, berlaku 14 Mei 2025 | 1 |
| Kode QR resi | Nama, alamat, kode pos, telepon, tarif | 4 |
| 13 karakter | Nomor kiriman standar UPU S10 (contoh fiktif di visual) | 11 |
| 1 nampan = 1 paket | Cross-belt sorter | 10 |
| maks 3 hari | Antarkota dalam satu pulau | 3 |
| maks 7 hari | Antarkota antarpulau | 3 |
| maks 3 hari/bulan | Diskon di bawah biaya pokok | 5 |
| maks 10× ongkir | Ganti rugi, kecuali diasuransikan | 6 |
| hingga 7 juta paket/hari | Klaim Wamenkomdigi, per Februari 2026 | 12 |

## Poin kunci

- Benang merah = label resi dan pemindaian: tiap "bip" = satu baris status pelacakan. Tiap simpul jadi satu adegan (ponsel → penjual/kurir → gudang → mesin sortir → truk → gudang akhir → pintu).
- Payoff visual: peta jaringan dengan ribuan titik paket, ditutup pemindaian terakhir "Diterima".
- Bab regulasi disajikan sebagai fakta aturan (batas waktu, diskon, ganti rugi), tanpa memuji/mengkritik pemerintah atau jasa kirim.
- Angka cepat basi: 7 juta paket/hari (klaim per Feb 2026) dan status regulasi; perbarui saat produksi.
