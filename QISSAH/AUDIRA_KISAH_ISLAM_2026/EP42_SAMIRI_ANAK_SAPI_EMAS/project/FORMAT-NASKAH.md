# Format naskah — CHRONICLE (style #14, nama kerja)

Dokumenter sejarah 3D: lokasi 3D hangat, tokoh siluet hitam (beberapa ber-outline warna), peta relief 3D dengan
rute/cincin, tanggal besar, angka bergulir, kutipan sumber, caption per kata. Kirim naskah dengan format di bawah
(+ VO .mp3 kalau sudah ada). Semua tag **opsional**: naskah polos juga jalan, visualnya aku tentukan sendiri.

## Cara pakai (sutradara otomatis)
1. Buat folder `stories/<nama>/`, isi `naskah.txt` (format di bawah). Opsional: `vo.mp3` (VO asli dari ElevenLabs dll).
2. `node scripts/make.mjs <nama> --plan` → cek rencana adegan (set, mood, tokoh, peta, teks) + peringatan.
3. `node scripts/make.mjs <nama> --preview` → video 540×960. Tanpa VO, tambah `--tts` untuk narasi sementara.
4. `node scripts/make.mjs <nama> --final` → 1080×1920 60 fps. Ada `vo.mp3` → caption & potongan adegan ikut VO per kata (whisper).

Yang ditentukan otomatis dari naskah: lokasi (10 set), waktu & cahaya, kostum dari peran (serdadu/perwira ikut zaman
dari tahun di naskah), pose dari kata kerja, posisi tokoh, kamera per kalimat (wide → medium → close → low), peta
(titik, rute, cincin, letusan), semua teks layar, kartu penutup + daftar sumber.

## Aturan dasar
1. **Satu baris = satu kalimat VO.** Itu yang dibaca narator dan jadi caption.
2. **`*kata*` = kata kunci** → tebal & terang di caption. 1–2 per kalimat.
3. **Baris `[TAG …]` = arahan visual**, tidak dibaca narator. Berlaku untuk kalimat-kalimat di bawahnya sampai tag berikutnya.
4. **Fakta wajib bersumber.** Tulis `[SUMBER …]` di adegannya; semua sumber dikumpulkan jadi kartu penutup.
5. Durasi ideal 45–150 detik. Patokan: ±2,5 kata per detik VO.

## Tag yang tersedia
| Tag | Isi | Contoh |
|---|---|---|
| `[PETA]` | wilayah, titik, gerakan | `[PETA] Sumbawa → Batavia, cincin suara dari Tambora` |
| `[RUTE]` | perjalanan di peta (urut) | `[RUTE] Makassar → Banten → Jawa Timur, kapal` |
| `[TEMPAT]` | lokasi + waktu + suasana | `[TEMPAT] benteng pelabuhan Batavia, senja` |
| `TOKOH:` (di baris TEMPAT) | siapa, berapa, pakaian, aksi, warna | `TOKOH: 4 serdadu (shako, senapan), 1 perwira teropong = netral` |
| `[TANGGAL]` | stempel tanggal besar | `[TANGGAL] SUMBAWA / APRIL 1815` |
| `[NAMA]` | nama + peran (tokoh, kerajaan, tempat) | `[NAMA] Kerajaan Tambora — Sumbawa, 10 April 1815` |
| `[ANGKA]` | angka bergulir + satuan + label | `[ANGKA] 4.300 → 2.850 m, Tinggi Tambora` |
| `[SUMBER]` | kutipan/parafrase di atas layar | `[SUMBER] Dentuman dikira tembakan meriam — Memoir Raffles, 1830` |
| `[PENUTUP]` | judul lanjutan, seri, kredit | `[PENUTUP] Bersambung: Tahun Tanpa Musim Panas` |

## Warna outline tokoh (konsisten satu film)
- **emas** = tokoh utama · **cyan** = sekutu · **merah** = musuh/bahaya · **ungu** = korban/duka · **gading** = netral
- Tanpa warna = figuran (siluet hitam polos).

## Kostum siluet yang sudah ada
Tutup kepala: peci, destar (ikat kepala lancip), caping, shako (serdadu Eropa), bicorne (perwira), sorban, sanggul, rambut panjang.
Pakaian: sarung, kain panjang, jubah, jas serdadu, celana. Barang: senapan, tombak, keris, obor, teropong, bendera, dayung,
buntelan di punggung/kepala. Pose: berdiri, tolak pinggang, siaga senjata, menunjuk, meneropong, mengepal, jongkok/sujud,
jalan, lari, menjunjung beban. Anak-anak = tokoh skala kecil.

## Kata kunci lokasi → set
makam/kuburan/nisan → **makam** · pendopo/istana/keraton/balairung/karesidenan → **balai** (interior, pintu terang) ·
kamar/ruang/penjara/pengasingan → **kamar** (meja + lilin) · geladak/di atas kapal → **dek** · pelabuhan/dermaga → **pelabuhan** ·
benteng → **benteng** (tembok + gerbang + bendera) · hutan/bukit/gua/sungai → **hutan** · desa/kampung/rumah → **desa** ·
pantai/pesisir → **pantai** · medan/perang/kemah/lapangan/alun-alun → **medan**.
Waktu: pagi (berkabut), siang, senja/sore, malam (bulan), terbakar/api, gunung meletus. Efek: kabut, lilin, terbakar.

## Kata kerja tokoh → pose
lari/kabur/mengungsi, jalan/datang, berdiri, tolak pinggang, menunjuk, meneropong, berdoa, sujud/menyembah, berlutut,
duduk/bersila, menulis, berjaga, berbaris, mengangkat senjata/menyerang, berunding/berbicara, menatap, menjunjung beban.

## Lokasi yang sudah ada (selain itu dibangun per film)
Peta relief Nusantara (garis pantai asli Natural Earth, gunung api), benteng/pelabuhan + kapal layar, desa rumah panggung +
kelapa, gunung meletus (abu, lava, petir), laut senja.

## Contoh (demo "Dentuman dari Timur")
```
JUDUL: Dentuman dari Timur
SUARA: pria, berat, tenang

[PETA] dekat Tambora lalu mundur sampai Batavia terlihat, cincin suara dari Tambora
[TANGGAL] SUMBAWA / APRIL 1815
April 1815, *Tambora* meledak.
Dentumannya terdengar sampai *Batavia*.

[TEMPAT] benteng pelabuhan Batavia, senja, kapal berlabuh. TOKOH: 4 serdadu (shako, senapan), 1 perwira teropong = gading
[SUMBER] Dentuman itu dikira tembakan meriam; pasukan sempat disiagakan — Memoir Sir T. S. Raffles, 1830
Orang di sana mengira itu *tembakan meriam*.
Pasukan pun disiagakan mencari *musuh*.

[TEMPAT] desa rumah panggung, malam, gunung meletus di belakang. TOKOH: warga lari membawa buntelan (3 = ungu)
[NAMA] Kerajaan Tambora — Sumbawa, malam 10 April 1815
Padahal di Sumbawa, *Kerajaan Tambora*
lenyap ditelan *abu dan api*.

[PETA] dekat Tambora, puncak runtuh jadi kaldera
[ANGKA] 4.300 → 2.850 m, Tinggi Tambora
Gunungnya kehilangan lebih dari *1.400 meter*.
Dan dunia baru mulai *merasakannya*.
```
