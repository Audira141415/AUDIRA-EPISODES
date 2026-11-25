# RAHASIA BIKIN MAP ROBLOX: Riset 5 Topik

Riset 8 November 2026 oleh AUDIRA (Created by Agus Dwi R.). Belum ada naskah atau video. Semua angka diambil dari Roblox Creator Documentation, versi yang diperbarui 6 November 2026, kecuali yang ditandai "hitungan AUDIRA".

Topik ini sengaja dibedakan dari video Roblox sebelumnya:
- streaming, LOD SLIM, dan grafik otomatis sudah dibahas di `roblox-hp-kentang-2026`;
- lag dan prediksi gerak di `roblox-lag-2026`;
- membuat map dengan AI di `roblox-ep1-map-pertama`.

Sumber lengkap ada di [SOURCE_REGISTER.md](SOURCE_REGISTER.md). Salinan dokumen ada di `_research/doc_*.md`.

## 1. Map profesional dimulai dari kotak abu-abu (greybox)

**Hook:** Map Roblox yang keren tidak langsung dibuat cantik. Langkah pertamanya justru kotak-kotak abu-abu polos.

**Fakta terverifikasi (tutorial resmi *Greybox your environment*):**
- **Greyboxing**, disebut juga *massing out* atau *blocking*, berarti menyusun bentuk sederhana di ruang 3D. Tujuannya mencari tahu bagaimana pemain akan merasakan gameplay sebelum waktu dihabiskan untuk memoles aset.
- Tahap ini dipakai untuk menemukan masalah seperti area yang sulit dilalui, titik pandang yang memberi keuntungan tidak adil, dan aset yang ukurannya tidak sebanding dengan karakter.
- Contoh resminya adalah map laser tag dengan **tata letak tiga jalur**:
  - zona spawn tiap tim di sisi berlawanan;
  - tiga **jalur utama**: interior, tengah, eksterior;
  - **jalur silang** yang memotong ketiganya.
- Persimpangan jalur tengah dan jalur silang disebut **combat pocket**, tempat pertempuran paling sering terjadi.
- Ukuran di file contoh:
  - Setiap pintu dan lorong lebarnya **minimal 10 stud**, supaya dua pemain bisa lewat bersamaan.
  - Setiap dinding tingginya **minimal 10 stud**, supaya tidak bisa dilompati dan kamera tidak tersangkut.

**Sudut viral:** "Kenapa map shooter selalu terasa seru di bagian tengah? Karena memang dirancang begitu."

**Catatan:** Tutorial ini menyebut tinggi lompat bawaan 5 stud, sedangkan dokumentasi Humanoid menyebut JumpHeight bawaan 7,2 stud. Jangan sebut angka lompatan di naskah; cukup "dinding 10 stud supaya tidak bisa dilompati".

## 2. Terrain Roblox tersusun dari kubus 4 stud, dan bisa dibuat dari foto hitam-putih

**Hook:** Gunung dan danau di Roblox sebenarnya kotak-kotak kecil. Dan seluruh pulau bisa dibuat dari satu gambar hitam-putih.

**Fakta terverifikasi (*Environmental terrain*):**
- Terrain tersusun dari grid **voxel**, masing-masing wilayah **4×4×4 stud** dengan satu material.
- Ada **22 material bawaan**, ditambah Air: Asphalt, Basalt, Brick, Cobblestone, Concrete, Cracked Lava, Glacier, Grass, Ground, Ice, Leafy Grass, Limestone, Mud, Pavement, Rock, Salt, Sand, Sandstone, Slate, Snow, Water, Wood Planks.
- **Heightmap** adalah gambar 2D dari atas: area **terang jadi tinggi** (gunung), area **gelap jadi rendah** (lembah). Warna permukaan bisa diatur dengan **colormap**.
- **1 piksel heightmap = 4 stud.** Studio menerima heightmap sampai **4096×4096 piksel**, format .jpg atau .png.
- Terrain juga bisa dibuat lewat script untuk hasil prosedural.

**Hitungan AUDIRA:** 4096 piksel × 4 stud = **16.384 stud** per sisi. Dengan 1 stud = 28 cm, itu sekitar **4,6 km** per sisi dari satu gambar.

**Sudut viral:** "Satu foto hitam-putih bisa jadi pulau 4,6 kilometer."

## 3. Batas tersembunyi model 3D di Roblox

**Hook:** Model 3D sebagus apa pun ditolak Roblox kalau segitiganya lebih dari 20 ribu.

**Fakta terverifikasi (*General specifications*, *Texture specifications*, *Meshes*):**
- Satu mesh **tidak boleh melebihi 20.000 segitiga**.
- Resolusi tekstur maksimal **4096×4096** (4K). Engine memuat versi kualitas rendah dulu, lalu naik sesuai kemampuan perangkat.
- Saran resmi ukuran tekstur:
  - objek 5×5 stud: 256×256;
  - objek 10×10 stud: 512×512;
  - objek 20×20 stud: 1024×1024.
- Material bawaan Part memakai tekstur **1024×1024 per 8×8 stud**. Material Terrain memakai **512×512 per 8×8 stud**.
- Detail mesh otomatis turun sesuai jarak dari kamera: **di bawah 250 stud tertinggi**, **250–500 stud sedang**, **500 stud ke atas terendah**.
- Bentuk tabrakan bisa dipilih: **Box, Hull, Default, PreciseConvexDecomposition**, atau **Tunable** dengan slider. Bentuk tabrakan paling presisi pun tidak 1:1 dengan tampilan, dan paling berat dihitung.

**Sudut viral:** "Kenapa kadang karakter nabrak udara di dekat pohon? Karena bentuk tabrakannya beda dengan bentuk yang kamu lihat."

**Catatan:** Klaim "nabrak udara" harus disajikan sebagai penjelasan konsep collision fidelity, bukan kasus game tertentu.

## 4. Cahaya dan bayangan di Roblox juga dihitung pakai kotak 4 stud

**Hook:** Benda kecil di Roblox bisa kehilangan bayangannya, karena bayangan dihitung pakai kotak 4 stud.

**Fakta terverifikasi (*Global lighting*, kelas `Lighting`, enum `Technology`):**
- Pada sistem bayangan **voxel**, tiap voxel cahaya berukuran **4×4×4 stud**. Objek harus lebih besar dari itu untuk menampilkan bayangan yang realistis. Bayangan dihitung ulang saat part bergerak.
- Sistem lama punya mode **Voxel**, **ShadowMap** (bayangan tajam dari matahari) dan **Future** (cahaya paling canggih).
- Properti `Technology` kini **deprecated** dan diganti dua pengaturan:
  - **LightingStyle**: **Soft** (gaya stilistik) atau **Realistic** (naturalistik);
  - **PrioritizeLightingQuality**: memilih kualitas bayangan di dekat kamera atau jarak pandang, mana yang diturunkan dulu di perangkat lemah.
- Properti **GeographicLatitude** mengatur lintang geografis map, yang menggeser posisi matahari di setiap jam. Artinya map bisa diatur supaya jalur matahari mirip lokasi nyata.
- Kategori pengaturan cahaya: Color, Intensity, Shadows, Appearance, Environment.

**Sudut viral:** "Map Roblox bisa diatur supaya mataharinya seperti di Indonesia."

**Catatan:** Nilai default GeographicLatitude tidak tercantum di bagian yang dibaca. Jangan sebut angka default. Penyebutan lintang Indonesia (sekitar 6° LS untuk Jakarta) adalah contoh pemakaian, bukan klaim dokumentasi.

## 5. Free model di Toolbox bisa membawa "virus"

**Hook:** Model gratis di Toolbox bisa terlihat berguna, padahal diam-diam memuat aset lain saat game berjalan.

**Fakta terverifikasi (*Toolbox*, *Creator Store*):**
- Creator Store berisi **jutaan aset** dari Roblox dan kreator independen: model, material, plugin, audio, dan lainnya.
- Dokumentasi resmi memperingatkan bahwa aset yang **"terlihat berguna" bisa memuat aset "virus" lain saat runtime**.
- Karena itu Creator Store **melarang**:
  - menyembunyikan fitur engine lewat LuaVM, `getfenv()` dan `setfenv()`;
  - memuat aset dari jauh lewat `require(assetId)`, `loadstring()`, `InsertService:LoadAsset()`, `AssetService:LoadAssetAsync()` dan `ModuleScript.LinkedSource`;
  - **kode yang diobfuscate**, karena kreator tidak bisa memastikan script hanya melakukan yang seharusnya;
  - script yang besar tanpa alasan.
- Halaman aset menampilkan **jumlah segitiga, vertex, dan script**.
- Tips resmi: klik kanan objek di Explorer, lalu pilih **Disable Scripts** untuk memakai aset tanpa menjalankan script-nya. Toolbox juga bisa difilter ke **kreator terverifikasi**.
- Batas distribusi per 30 hari: akun terverifikasi boleh 200 model, akun belum terverifikasi hanya 10. Untuk membagikan aset, akun wajib terverifikasi lewat cek usia atau ID pemerintah.

**Sudut viral:** "Sebelum ambil free model, cek dulu script-nya. Roblox sendiri menyebut ada yang bisa memuat 'virus'."

**Catatan:** Tidak menyebut kasus atau game tertentu. Ini edukasi keamanan berdasarkan aturan resmi.

## Rekomendasi urutan

1. **Free model bisa membawa "virus"** (pembuka paling memancing klik, sekaligus edukasi)
2. **Greybox** (rahasia proses kerja developer)
3. **Terrain dari heightmap** (visual paling memukau: foto jadi pulau)
4. **Batas model 3D** (teknis, menjawab "kenapa nabrak udara")
5. **Cahaya dan lintang matahari** (penutup yang indah secara visual)
