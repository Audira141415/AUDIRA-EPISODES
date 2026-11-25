# EP 04: Batas 20.000 segitiga dan collision fidelity

Seri AUDIRA, RAHASIA BIKIN MAP ROBLOX. Created by Agus Dwi R. Riset 8 November 2026. Style: DRAFTFORGE.

Suara: Cartesia sonic-3, voice `04b567df-2923-4b0c-896b-4b7df0a07e1a`, bahasa id. 215 kata terucap, ujaran 86.265 dtk, film 89.27 dtk.

**[0:00-0:04]** Model 3D sebagus apa pun ditolak Roblox kalau segitiganya lebih dari dua puluh ribu.

**[0:04-0:13]** Setiap model 3D tersusun dari segitiga-segitiga kecil. Makin halus bentuknya, makin banyak segitiganya. Roblox membatasi satu mesh maksimal dua puluh ribu segitiga.

**[0:13-0:29]** Teksturnya juga ada batas. Resolusi maksimalnya empat ribu sembilan puluh enam kali empat ribu sembilan puluh enam piksel. Tapi ukurannya disarankan menyesuaikan objek: objek lima stud cukup dua ratus lima puluh enam piksel, objek dua puluh stud seribu dua puluh empat piksel.

**[0:29-0:40]** Detail model juga turun otomatis sesuai jarak. Di bawah dua ratus lima puluh stud dari kamera, detailnya tertinggi. Dua ratus lima puluh sampai lima ratus stud, sedang. Lebih dari lima ratus stud, terendah.

**[0:41-0:50]** Lalu ada yang jarang disadari: bentuk tabrakan. Bentuk yang kamu lihat belum tentu sama dengan bentuk yang dihitung mesin fisika. Pengaturan ini disebut collision fidelity.

**[0:50-1:06]** Pilihannya: Box, kotak pembungkus. Hull, bungkus cembung. Default, bentuk perkiraan yang bisa cekung. Lalu PreciseConvexDecomposition, yang paling presisi tapi paling berat. Ada juga Tunable, dengan slider.

**[1:06-1:17]** Bahkan pilihan paling presisi pun, menurut dokumentasi Roblox, tidak sama persis dengan tampilannya. Makanya karakter kadang terasa menabrak udara di dekat pohon atau batu.

**[1:17-1:26]** Jadi model yang bagus di game bukan yang paling detail, tapi yang paling pas. Kamu pernah menabrak udara di Roblox? Ikuti AUDIRA untuk rahasia bikin map berikutnya.

Ejaan fonetik untuk Cartesia ada di `script-lines.json`.
