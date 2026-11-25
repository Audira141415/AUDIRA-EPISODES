# EP 05: Bayangan voxel 4 stud dan lintang matahari

Seri AUDIRA, RAHASIA BIKIN MAP ROBLOX. Created by Agus Dwi R. Riset 8 November 2026. Style: HD2D.

## Riset

### 4. Cahaya dan bayangan di Roblox juga dihitung pakai kotak 4 stud

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
