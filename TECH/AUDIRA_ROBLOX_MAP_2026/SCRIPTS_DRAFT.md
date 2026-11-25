### EP01_FREE_MODEL_VIRUS
Model gratis di Toolbox Roblox bisa terlihat berguna. Tapi menurut dokumentasi resmi Roblox, ada yang diam-diam memuat virus saat game berjalan.

Toolbox dan Creator Store berisi jutaan aset: model, material, plugin, sampai audio. Tinggal klik, langsung masuk ke map kamu. Praktis, dan sering gratis. Banyak developer pemula membangun map pertamanya dari sini.

Masalahnya, model bisa membawa script. Ada script yang wajar, misalnya membuat benda bergerak atau memutar suara. Tapi ada juga yang menunggu game berjalan, lalu memanggil aset lain dari luar.

Karena itu Creator Store punya larangan khusus. Aset tidak boleh memuat aset lain dari jauh, misalnya lewat require dengan nomor aset, atau loadstring. Kode yang sengaja diacak supaya tidak terbaca juga dilarang.

Alasannya sederhana. Kalau kodenya tidak bisa dibaca, kreator tidak bisa memastikan script itu hanya melakukan tugasnya. Kode yang rapi dan terbuka jauh lebih mudah dipercaya.

Jadi sebelum memakai free model, buka halaman asetnya. Di sana tertulis jumlah segitiga, vertex, dan jumlah script. Kalau model pohon membawa banyak script, patut dicurigai.

Roblox juga memberi jalan aman. Klik kanan modelnya di Explorer, lalu pilih Disable Scripts. Modelnya tetap bisa dipakai, tapi script-nya tidak jalan. Kamu juga bisa menyaring Toolbox hanya untuk kreator terverifikasi.

Jadi free model boleh dipakai, asal dicek dulu. Kamu pernah menemukan script aneh di model gratis? Ikuti AUDIRA untuk rahasia bikin map berikutnya.

### EP02_GREYBOX
Map Roblox yang keren tidak langsung dibuat cantik. Langkah pertamanya justru kotak-kotak abu-abu.

Namanya greyboxing, atau blocking. Developer menyusun bentuk sederhana dulu untuk mencoba rasanya bermain di map itu, sebelum menghabiskan waktu memoles aset.

Dari kotak-kotak ini, masalah cepat ketahuan. Area yang susah dilewati, titik yang memberi keuntungan tidak adil, atau benda yang ukurannya tidak sebanding dengan karakter. Memperbaikinya di tahap ini jauh lebih mudah daripada setelah map dihias.

Di tutorial resmi Roblox, contohnya map laser tag dengan tata letak tiga jalur. Zona spawn, tempat pemain muncul, ada di sisi berlawanan untuk tiap tim. Lalu ada tiga jalur utama: interior, tengah, dan eksterior.

Jalur silang memotong ketiganya. Persimpangan jalur tengah dan jalur silang disebut combat pocket, tempat pertempuran paling sering terjadi. Jadi keramaian di tengah map itu memang dirancang.

Ukurannya juga dihitung. Di file contoh, setiap pintu dan lorong lebarnya minimal sepuluh stud, supaya dua pemain bisa lewat bersamaan. Setiap dinding tingginya minimal sepuluh stud, supaya tidak bisa dilompati, dan kamera tidak tersangkut.

Setelah semuanya terasa pas saat dimainkan, barulah kotak abu-abu diganti aset yang sudah dipoles: tembok, jendela, lampu, dan dekorasi.

Jadi map yang seru lahir dari kotak polos. Kamu biasanya langsung menghias, atau greybox dulu? Ikuti AUDIRA untuk rahasia bikin map berikutnya.

### EP03_HEIGHTMAP
Satu gambar hitam-putih bisa berubah jadi pulau selebar sekitar empat koma enam kilometer di Roblox.

Gunung, lembah, dan danau di Roblox dibuat dengan terrain. Terrain tersusun dari kotak-kotak kecil bernama voxel. Setiap voxel berukuran empat kali empat kali empat stud, dengan satu material.

Materialnya ada dua puluh dua, di luar udara. Dari rumput, pasir, salju, es, batu, lumpur, sampai lava retak dan air. Setiap voxel bisa dicat dengan material yang berbeda.

Terrain bisa dipahat manual. Tapi ada cara yang lebih cepat: heightmap. Heightmap adalah gambar yang dilihat dari atas. Area terang jadi tinggi, seperti gunung. Area gelap jadi rendah, seperti lembah.

Warna permukaannya bisa diatur dengan gambar kedua, bernama colormap. Jadi satu gambar menentukan bentuk, satu lagi menentukan material.

Menurut dokumentasi Roblox, satu piksel heightmap sama dengan empat stud. Ukuran maksimalnya empat ribu sembilan puluh enam kali empat ribu sembilan puluh enam piksel.

Hitungan kami, empat ribu sembilan puluh enam piksel dikali empat stud, sama dengan enam belas ribu tiga ratus delapan puluh empat stud per sisi. Dengan satu stud dua puluh delapan sentimeter, itu sekitar empat koma enam kilometer.

Jadi sebelum memahat satu per satu, coba gambar dulu petanya. Kamu mau bikin pulau seperti apa? Ikuti AUDIRA untuk rahasia bikin map berikutnya.

### EP04_BATAS_MESH
Model 3D sebagus apa pun ditolak Roblox kalau segitiganya lebih dari dua puluh ribu.

Setiap model 3D tersusun dari segitiga-segitiga kecil. Makin halus bentuknya, makin banyak segitiganya. Roblox membatasi satu mesh maksimal dua puluh ribu segitiga.

Teksturnya juga ada batas. Resolusi maksimalnya empat ribu sembilan puluh enam kali empat ribu sembilan puluh enam piksel. Tapi ukurannya disarankan menyesuaikan objek: objek lima stud cukup dua ratus lima puluh enam piksel, objek dua puluh stud seribu dua puluh empat piksel.

Detail model juga turun otomatis sesuai jarak. Di bawah dua ratus lima puluh stud dari kamera, detailnya tertinggi. Dua ratus lima puluh sampai lima ratus stud, sedang. Lebih dari lima ratus stud, terendah.

Lalu ada yang jarang disadari: bentuk tabrakan. Bentuk yang kamu lihat belum tentu sama dengan bentuk yang dihitung mesin fisika. Pengaturan ini disebut collision fidelity.

Pilihannya: Box, kotak pembungkus. Hull, bungkus cembung. Default, bentuk perkiraan yang bisa cekung. Lalu PreciseConvexDecomposition, yang paling presisi tapi paling berat. Ada juga Tunable, dengan slider.

Bahkan pilihan paling presisi pun, menurut dokumentasi Roblox, tidak sama persis dengan tampilannya. Makanya karakter kadang terasa menabrak udara di dekat pohon atau batu.

Jadi model yang bagus di game bukan yang paling detail, tapi yang paling pas. Kamu pernah menabrak udara di Roblox? Ikuti AUDIRA untuk rahasia bikin map berikutnya.

### EP05_CAHAYA_LINTANG
Benda kecil di Roblox bisa kehilangan bayangannya. Penyebabnya, bayangan juga dihitung pakai kotak.

Di sistem cahaya voxel, setiap kotak cahaya berukuran empat kali empat kali empat stud. Objek harus lebih besar dari itu untuk menampilkan bayangan yang realistis. Saat benda bergerak, bayangannya dihitung ulang. Semua pengaturan ini ada di layanan bernama Lighting.

Dulu developer memilih sistem cahaya lewat pengaturan Technology. Ada Voxel, ada ShadowMap dengan bayangan tajam dari matahari, dan Future, sistem cahaya paling canggih.

Sekarang pengaturan itu sudah usang. Penggantinya LightingStyle: Soft untuk tampilan bergaya, atau Realistic untuk tampilan alami. Soft cocok untuk map kartun, Realistic untuk map yang ingin terlihat nyata.

Lalu ada PrioritizeLightingQuality. Di perangkat yang lemah, kamu memilih mana yang diturunkan duluan: kualitas bayangan di dekat kamera, atau jarak pandang.

Ada satu pengaturan yang jarang dipakai: GeographicLatitude, lintang geografis map. Mengubahnya akan menggeser posisi matahari di setiap jam. Jamnya sendiri diatur lewat ClockTime.

Artinya, jalur matahari di map bisa dibuat mirip lokasi nyata. Misalnya Jakarta, sekitar enam derajat di selatan khatulistiwa. Ditambah pengaturan jam, suasana pagi atau senja di map bisa terasa seperti dunia nyata.

Jadi cahaya bukan cuma soal terang dan gelap, tapi soal suasana. Kamu suka map yang realistis, atau yang bergaya? Ikuti AUDIRA untuk rahasia bikin map berikutnya.

